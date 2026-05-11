const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { requireAdmin } = require('../middleware/auth');

// GET /api/products
router.get('/', (req, res) => {
  let products = [...store.products];
  const { category, search, sort, featured } = req.query;
  if (category && category !== 'All') products = products.filter(p => p.category === category);
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
  if (featured === 'true') products = products.filter(p => p.featured);
  if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  else if (sort === 'newest') products.sort((a, b) => b.reviews - a.reviews);
  res.json(products);
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  const cats = ['All', ...new Set(store.products.map(p => p.category))];
  res.json(cats);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = store.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// POST /api/products — admin only
router.post('/', requireAdmin, (req, res) => {
  const { name, category, price, originalPrice, stock, description, image, tags } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'name and price required' });
  const product = {
    id: uuidv4(), name, category: category || 'Uncategorized',
    price: parseFloat(price), originalPrice: parseFloat(originalPrice || price),
    stock: parseInt(stock || 0), rating: 0, reviews: 0,
    description: description || '', image: image || '',
    tags: tags || [], featured: false,
  };
  store.products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id — admin only
router.put('/:id', requireAdmin, (req, res) => {
  const idx = store.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  store.products[idx] = { ...store.products[idx], ...req.body };
  res.json(store.products[idx]);
});

// DELETE /api/products/:id — admin only
router.delete('/:id', requireAdmin, (req, res) => {
  const idx = store.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  store.products.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

module.exports = router;
