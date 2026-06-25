const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../data/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, sort, featured, search } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (featured === 'true') {
      query += ' AND featured = true';
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (sort === 'price_asc') query += ' ORDER BY price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY price DESC';
    else if (sort === 'rating') query += ' ORDER BY rating DESC';
    else query += ' ORDER BY createdAt DESC';

    const [rows] = await pool.query(query, params);
    const products = rows.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products');
    const cats = ['All', ...rows.map(r => r.category)];
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...product, tags: JSON.parse(product.tags || '[]') });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products — admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, category, price, originalPrice, stock, description, image, tags, featured } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'name and price required' });
    const id = uuidv4();
    await pool.query(
      'INSERT INTO products (id, name, category, price, originalPrice, stock, description, image, tags, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, category || 'Uncategorized', parseFloat(price), parseFloat(originalPrice || price),
       parseInt(stock || 0), description || '', image || '', JSON.stringify(tags || []), featured || false]
    );
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json({ ...product, tags: JSON.parse(product.tags || '[]') });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id — admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, category, price, originalPrice, stock, description, image, tags, featured } = req.body;
    await pool.query(
      'UPDATE products SET name=?, category=?, price=?, originalPrice=?, stock=?, description=?, image=?, tags=?, featured=? WHERE id=?',
      [name, category, parseFloat(price), parseFloat(originalPrice || price),
       parseInt(stock || 0), description, image, JSON.stringify(tags || []), featured || false, req.params.id]
    );
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...product, tags: JSON.parse(product.tags || '[]') });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;