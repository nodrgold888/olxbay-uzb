const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Public seller profile — only ever exposes non-sensitive fields (no email,
// no phone; phone is only ever shared via the escrow order flow once
// payment is placed, see listings.js/orders.js).
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, city: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const listings = await prisma.listing.findMany({
    where: { sellerId: id, status: 'active' },
    include: { category: { include: { parent: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const [activeCount, soldCount] = await Promise.all([
    prisma.listing.count({ where: { sellerId: id, status: 'active' } }),
    prisma.listing.count({ where: { sellerId: id, status: 'sold' } }),
  ]);

  res.json({ ...user, listings, activeCount, soldCount });
});

module.exports = router;
