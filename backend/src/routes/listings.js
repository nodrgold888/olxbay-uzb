const express = require('express');
const multer = require('multer');
const path = require('path');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

router.get('/', async (req, res) => {
  const { q, categoryId, city, minPrice, maxPrice, page = 1, pageSize = 20 } = req.query;

  const where = { status: 'active' };
  if (q) {
    where.OR = [
      { title: { contains: String(q) } },
      { description: { contains: String(q) } },
    ];
  }
  if (categoryId) {
    // Selecting a top-level category should also match listings tagged to
    // one of its subcategories; selecting a subcategory matches only that.
    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
      include: { children: true },
    });
    if (category && category.children.length > 0) {
      where.categoryId = { in: [category.id, ...category.children.map((c) => c.id)] };
    } else {
      where.categoryId = Number(categoryId);
    }
  }
  if (city) where.city = String(city);
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        category: { include: { parent: true } },
        seller: { select: { id: true, name: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({ listings, total, page: Number(page), pageSize: take });
});

router.get('/mine', auth, async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.userId },
    include: { category: { include: { parent: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(listings);
});

// Seller phone is intentionally NOT exposed here: contact details are only
// shared with a buyer once payment is secured in escrow (see /api/orders),
// so a buyer can't be steered into paying the seller directly off-platform.
router.get('/:id', async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      category: { include: { parent: true } },
      seller: { select: { id: true, name: true, city: true } },
    },
  });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  const { title, description, price, currency, city, categoryId } = req.body;
  if (!title || !description || !price || !city || !categoryId) {
    return res.status(400).json({ error: 'title, description, price, city and categoryId are required' });
  }
  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price: Number(price),
      currency: currency || 'UZS',
      city,
      categoryId: Number(categoryId),
      sellerId: req.userId,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    },
  });
  res.status(201).json(listing);
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Listing not found' });
  if (existing.sellerId !== req.userId) return res.status(403).json({ error: 'Not your listing' });

  const { title, description, price, currency, city, categoryId, status } = req.body;
  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(currency !== undefined && { currency }),
      ...(city !== undefined && { city }),
      ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
      ...(status !== undefined && { status }),
      ...(req.file && { imageUrl: `/uploads/${req.file.filename}` }),
    },
  });
  res.json(listing);
});

router.delete('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Listing not found' });
  if (existing.sellerId !== req.userId) return res.status(403).json({ error: 'Not your listing' });
  if (existing.status !== 'active') {
    return res.status(400).json({ error: 'A reserved or sold listing cannot be deleted' });
  }
  // Orders are intentionally protected by the status check above (a listing
  // with any order is never 'active'), but a listing can still have chat
  // threads (messaging happens before any purchase) — those don't need to
  // outlive the listing, so clear them out in the same transaction.
  const conversations = await prisma.conversation.findMany({ where: { listingId: id }, select: { id: true } });
  const conversationIds = conversations.map((c) => c.id);
  await prisma.$transaction([
    prisma.message.deleteMany({ where: { conversationId: { in: conversationIds } } }),
    prisma.conversation.deleteMany({ where: { listingId: id } }),
    prisma.listing.delete({ where: { id } }),
  ]);
  res.status(204).send();
});

module.exports = router;
