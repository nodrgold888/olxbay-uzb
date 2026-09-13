const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
});

module.exports = router;
