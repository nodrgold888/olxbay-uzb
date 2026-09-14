const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.userId },
    include: {
      listing: {
        include: {
          category: { include: { parent: true } },
          seller: { select: { id: true, name: true, city: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(favorites.map((f) => f.listing));
});

// Returns just the listing ids the current user has favorited, so the
// frontend can mark hearts as filled across any grid without an extra
// round trip per card.
router.get('/ids', auth, async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.userId },
    select: { listingId: true },
  });
  res.json(favorites.map((f) => f.listingId));
});

router.post('/:listingId', auth, async (req, res) => {
  const listingId = Number(req.params.listingId);
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const favorite = await prisma.favorite.upsert({
    where: { userId_listingId: { userId: req.userId, listingId } },
    update: {},
    create: { userId: req.userId, listingId },
  });
  res.status(201).json(favorite);
});

router.delete('/:listingId', auth, async (req, res) => {
  const listingId = Number(req.params.listingId);
  await prisma.favorite.deleteMany({ where: { userId: req.userId, listingId } });
  res.status(204).send();
});

module.exports = router;
