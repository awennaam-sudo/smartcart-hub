const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (store.users.find(u => u.email === email)) return res.status(409).json({ message: 'Email already registered' });
  const user = {
    id: uuidv4(), name, email,
    password: await bcrypt.hash(password, 10),
    role: 'customer', address: {},
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safe } = user;
  res.status(201).json({ token, user: safe });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = store.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safe } = user;
  res.json({ token, user: safe });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = store.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...safe } = user;
  res.json(safe);
});

// PUT /api/auth/address
router.put('/address', requireAuth, (req, res) => {
  const user = store.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.address = { ...user.address, ...req.body };
  const { password: _, ...safe } = user;
  res.json(safe);
});

module.exports = router;
