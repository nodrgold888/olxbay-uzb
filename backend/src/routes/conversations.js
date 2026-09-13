const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

const conversationListInclude = {
  listing: { select: { id: true, title: true, imageUrl: true, price: true, currency: true, status: true } },
  buyer: { select: { id: true, name: true } },
  seller: { select: { id: true, name: true } },
  messages: { orderBy: { createdAt: 'desc' }, take: 1 },
};

// Buyer starts (or reopens) a DM with a listing's seller. Find-or-create so
// repeated clicks on "Message seller" reuse the same thread.
router.post('/', auth, async (req, res) => {
  const { listingId } = req.body;
  const listing = await prisma.listing.findUnique({ where: { id: Number(listingId) } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.sellerId === req.userId) {
    return res.status(400).json({ error: "You can't message yourself about your own listing" });
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: {
        listingId: listing.id,
        buyerId: req.userId,
        sellerId: listing.sellerId,
      },
    },
    update: {},
    create: {
      listingId: listing.id,
      buyerId: req.userId,
      sellerId: listing.sellerId,
    },
  });
  res.status(201).json(conversation);
});

router.get('/', auth, async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: req.userId }, { sellerId: req.userId }] },
    include: conversationListInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json(conversations);
});

router.get('/:id', auth, async (req, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      listing: { select: { id: true, title: true, imageUrl: true, price: true, currency: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true } } } },
    },
  });
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  if (conversation.buyerId !== req.userId && conversation.sellerId !== req.userId) {
    return res.status(403).json({ error: 'Not your conversation' });
  }
  res.json(conversation);
});

router.post('/:id/messages', auth, async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Message body is required' });
  }
  const conversation = await prisma.conversation.findUnique({ where: { id: Number(req.params.id) } });
  if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
  if (conversation.buyerId !== req.userId && conversation.sellerId !== req.userId) {
    return res.status(403).json({ error: 'Not your conversation' });
  }
  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: req.userId, body: body.trim() },
    include: { sender: { select: { id: true, name: true } } },
  });
  res.status(201).json(message);
});

module.exports = router;
