const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone, city } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone, city },
  });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, city: user.city },
  });
});

const GUEST_CITIES = ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan', 'Namangan', 'Fergana', 'Nukus'];

// Creates a fresh throwaway account so someone can try the app with one
// click instead of filling out the registration form. Each click gets its
// own account (not a shared login) so guests don't see each other's data.
router.post('/guest', async (req, res) => {
  const suffix = Math.random().toString(36).slice(2, 8);
  const password = await bcrypt.hash(Math.random().toString(36), 10);
  const city = GUEST_CITIES[Math.floor(Math.random() * GUEST_CITIES.length)];
  const user = await prisma.user.create({
    data: {
      name: `Mehmon-${suffix}`,
      email: `guest-${suffix}@olxbay.local`,
      password,
      city,
    },
  });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, city: user.city },
  });
});

// TEST MODE: password is not actually checked, and an unknown email is
// auto-registered on the spot — so any email + any password logs in. This
// is only for quick local/demo testing; delete this shortcut (restore the
// bcrypt.compare check below) before this app handles anything real.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hashed = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: { name: email.split('@')[0], email, password: hashed },
    });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, city: user.city },
  });
});

router.get('/me', auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, city: true, phone: true },
  });
  res.json(user);
});

module.exports = router;
