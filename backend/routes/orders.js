const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const { pool } = require('../data/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

function initializePayment(email, amount, orderId, callbackUrl) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      email, amount: Math.round(amount * 100), currency: 'GHS',
      reference: orderId, callback_url: callbackUrl,
    });
    const options = {
      hostname: 'api.paystack.co', path: '/transaction/initialize', method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// POST /api/orders
router.post('/', requireAuth, async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

  try {
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [item.productId]);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      total += product.price * item.quantity;
      orderItems.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity, image: product.image });
    }

    // Deduct stock
    for (const item of items) {
      await pool.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    const orderId = uuidv4();
    const orderNumber = `SCH-${Date.now().toString().slice(-6)}`;

    if (paymentMethod === 'card' || paymentMethod === 'mobile_money') {
      const callbackUrl = `${process.env.FRONTEND_URL}/orders`;
      const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId]);
      const initRes = await initializePayment(user.email, total, orderId, callbackUrl);
      console.log('Paystack response:', JSON.stringify(initRes));
      if (!initRes.status) return res.status(400).json({ message: 'Payment initiation failed.' });

      await pool.query(
        'INSERT INTO orders (id, orderNumber, userId, items, total, shippingAddress, paymentMethod, paystackReference, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, orderNumber, req.userId, JSON.stringify(orderItems), parseFloat(total.toFixed(2)),
         JSON.stringify(shippingAddress || {}), paymentMethod, orderId, 'pending']
      );
      return res.status(201).json({ id: orderId, orderNumber, paymentUrl: initRes.data.authorization_url });
    }

    // Cash on delivery
    await pool.query(
      'INSERT INTO orders (id, orderNumber, userId, items, total, shippingAddress, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderId, orderNumber, req.userId, JSON.stringify(orderItems), parseFloat(total.toFixed(2)),
       JSON.stringify(shippingAddress || {}), paymentMethod || 'cod', 'pending']
    );
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.status(201).json({ ...order, items: JSON.parse(order.items), shippingAddress: JSON.parse(order.shippingAddress) });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/mine
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [req.userId]);
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), shippingAddress: JSON.parse(o.shippingAddress) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — admin
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC');
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), shippingAddress: JSON.parse(o.shippingAddress) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — admin
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ ...order, items: JSON.parse(order.items), shippingAddress: JSON.parse(order.shippingAddress) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/stats/summary — admin
router.get('/stats/summary', requireAdmin, async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query('SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders');
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalCustomers }]] = await pool.query('SELECT COUNT(DISTINCT userId) as totalCustomers FROM orders');
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products');
    res.json({ totalRevenue: parseFloat(totalRevenue).toFixed(2), totalOrders, totalCustomers, totalProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;