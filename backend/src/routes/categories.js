const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Returns top-level categories with their subcategories nested under
// `children`, ordered by name for a stable UI.
router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { name: 'asc' } } },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

module.exports = router;
