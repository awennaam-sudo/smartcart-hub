const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// POST /api/orders — place order
router.post('/', requireAuth, (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

  // Validate stock and calculate total
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const product = store.products.find(p => p.id === item.productId);
    if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
    if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    total += product.price * item.quantity;
    orderItems.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity, image: product.image });
  }

  // Deduct stock
  for (const item of items) {
    const product = store.products.find(p => p.id === item.productId);
    product.stock -= item.quantity;
  }

  const order = {
    id: uuidv4(),
    orderNumber: `SCH-${Date.now().toString().slice(-6)}`,
    userId: req.userId,
    items: orderItems,
    total: parseFloat(total.toFixed(2)),
    shippingAddress: shippingAddress || {},
    paymentMethod: paymentMethod || 'card',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.orders.push(order);
  res.status(201).json(order);
});

// GET /api/orders/mine
router.get('/mine', requireAuth, (req, res) => {
  const myOrders = store.orders.filter(o => o.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myOrders);
});

// GET /api/orders — admin: all orders
router.get('/', requireAdmin, (req, res) => {
  const sorted = [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

// PUT /api/orders/:id/status — admin update status
router.put('/:id/status', requireAdmin, (req, res) => {
  const order = store.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

// GET /api/orders/stats — admin dashboard stats
router.get('/stats/summary', requireAdmin, (req, res) => {
  const totalRevenue = store.orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = store.orders.length;
  const totalCustomers = new Set(store.orders.map(o => o.userId)).size;
  const totalProducts = store.products.length;
  res.json({ totalRevenue: parseFloat(totalRevenue.toFixed(2)), totalOrders, totalCustomers, totalProducts });
});

module.exports = router;
