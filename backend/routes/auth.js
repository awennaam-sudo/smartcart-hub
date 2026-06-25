const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../data/db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (id, name, email, password, role, address) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, hashed, 'customer', JSON.stringify({})]
    );
    const token = jwt.sign({ id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email, role: 'customer', address: {} } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safe } = user;
    res.json({ token, user: { ...safe, address: JSON.parse(user.address || '{}') } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password: _, ...safe } = user;
    res.json({ ...safe, address: JSON.parse(user.address || '{}') });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/address
router.put('/address', requireAuth, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const address = { ...JSON.parse(user.address || '{}'), ...req.body };
    await pool.query('UPDATE users SET address = ? WHERE id = ?', [JSON.stringify(address), req.userId]);
    const { password: _, ...safe } = user;
    res.json({ ...safe, address });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;