const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Escrow flow:
//   PENDING_PAYMENT --(pay)--> PAID_ESCROW --(ship)--> SHIPPED --(confirm)--> RELEASED
// A buyer can open a dispute from PAID_ESCROW or SHIPPED instead of confirming.
// Disputes and refunds are not auto-resolved here; a real deployment would
// route DISPUTED orders to a support/admin queue that can REFUND or RELEASE.
//
// A listing is marked "reserved" the instant an order is created (before
// payment), not just once paid. Without that, two buyers could both open a
// checkout for the same listing and both end up with a PENDING_PAYMENT order.
// If a buyer abandons checkout without paying or cancelling, the reservation
// auto-expires after RESERVATION_TIMEOUT_MS so the listing isn't stuck forever.
const RESERVATION_TIMEOUT_MS = 30 * 60 * 1000;

async function releaseExpiredReservation(listingId) {
  const stalePendingOrder = await prisma.order.findFirst({
    where: {
      listingId,
      status: 'PENDING_PAYMENT',
      createdAt: { lt: new Date(Date.now() - RESERVATION_TIMEOUT_MS) },
    },
  });
  if (!stalePendingOrder) return;
  await prisma.$transaction([
    prisma.order.update({ where: { id: stalePendingOrder.id }, data: { status: 'CANCELLED' } }),
    prisma.listing.updateMany({
      where: { id: listingId, status: 'reserved' },
      data: { status: 'active' },
    }),
  ]);
}

router.post('/', auth, async (req, res) => {
  const { listingId } = req.body;
  const listing = await prisma.listing.findUnique({ where: { id: Number(listingId) } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.sellerId === req.userId) {
    return res.status(400).json({ error: "You can't buy your own listing" });
  }

  if (listing.status === 'reserved') {
    await releaseExpiredReservation(listing.id);
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const reservation = await tx.listing.updateMany({
        where: { id: listing.id, status: 'active' },
        data: { status: 'reserved' },
      });
      if (reservation.count === 0) {
        throw new Error('LISTING_NOT_AVAILABLE');
      }
      return tx.order.create({
        data: {
          listingId: listing.id,
          buyerId: req.userId,
          sellerId: listing.sellerId,
          amount: listing.price,
          currency: listing.currency,
        },
      });
    });
    res.status(201).json(order);
  } catch (err) {
    if (err.message === 'LISTING_NOT_AVAILABLE') {
      return res.status(400).json({ error: 'This listing is no longer available' });
    }
    throw err;
  }
});

router.get('/mine', auth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.userId },
    include: { listing: true, seller: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

router.get('/selling', auth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { sellerId: req.userId },
    include: { listing: true, buyer: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

router.get('/:id', auth, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      listing: true,
      buyer: { select: { id: true, name: true, phone: true } },
      seller: { select: { id: true, name: true, phone: true } },
    },
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyerId !== req.userId && order.sellerId !== req.userId) {
    return res.status(403).json({ error: 'Not your order' });
  }
  res.json(order);
});

async function loadOrderForActor(req, res, allowedRole) {
  const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return null;
  }
  const isBuyer = order.buyerId === req.userId;
  const isSeller = order.sellerId === req.userId;
  if (allowedRole === 'buyer' && !isBuyer) {
    res.status(403).json({ error: 'Only the buyer can do this' });
    return null;
  }
  if (allowedRole === 'seller' && !isSeller) {
    res.status(403).json({ error: 'Only the seller can do this' });
    return null;
  }
  return order;
}

// Mock payment capture: in production this endpoint would be called after a
// real Payme/Click charge succeeds (e.g. from that gateway's webhook), never
// directly from the client. Money moves buyer -> platform here, not buyer -> seller.
router.post('/:id/pay', auth, async (req, res) => {
  const order = await loadOrderForActor(req, res, 'buyer');
  if (!order) return;
  if (order.status !== 'PENDING_PAYMENT') {
    return res.status(400).json({ error: `Cannot pay an order in status ${order.status}` });
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PAID_ESCROW', paidAt: new Date() },
  });
  await prisma.listing.update({ where: { id: order.listingId }, data: { status: 'sold' } });
  res.json(updated);
});

router.post('/:id/ship', auth, async (req, res) => {
  const order = await loadOrderForActor(req, res, 'seller');
  if (!order) return;
  if (order.status !== 'PAID_ESCROW') {
    return res.status(400).json({ error: `Cannot ship an order in status ${order.status}` });
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'SHIPPED', shippedAt: new Date() },
  });
  res.json(updated);
});

// Buyer confirms receipt -> escrow releases funds to the seller.
router.post('/:id/confirm', auth, async (req, res) => {
  const order = await loadOrderForActor(req, res, 'buyer');
  if (!order) return;
  if (order.status !== 'SHIPPED') {
    return res.status(400).json({ error: `Cannot confirm an order in status ${order.status}` });
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'RELEASED', releasedAt: new Date() },
  });
  res.json(updated);
});

// Buyer disputes instead of confirming (item never arrived, wrong item, etc.)
router.post('/:id/dispute', auth, async (req, res) => {
  const order = await loadOrderForActor(req, res, 'buyer');
  if (!order) return;
  if (!['PAID_ESCROW', 'SHIPPED'].includes(order.status)) {
    return res.status(400).json({ error: `Cannot dispute an order in status ${order.status}` });
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'DISPUTED' },
  });
  res.json(updated);
});

router.post('/:id/cancel', auth, async (req, res) => {
  const order = await loadOrderForActor(req, res, 'buyer');
  if (!order) return;
  if (order.status !== 'PENDING_PAYMENT') {
    return res.status(400).json({ error: `Cannot cancel an order in status ${order.status}` });
  }
  const [updated] = await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }),
    prisma.listing.updateMany({
      where: { id: order.listingId, status: 'reserved' },
      data: { status: 'active' },
    }),
  ]);
  res.json(updated);
});

module.exports = router;
