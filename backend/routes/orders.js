const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const store = require('../data/store');
const { requireAuth, requireAdmin } = require('../middleware/auth');

function chargeMomo(email, amount, phone, provider) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      currency: 'GHS',
      mobile_money: { phone, provider },
    });
    const options = {
      hostname: 'api.paystack.co',
      path: '/charge',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
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

function initializeCardPayment(email, amount, orderId, callbackUrl) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      currency: 'GHS',
      reference: orderId,
      callback_url: callbackUrl,
    });
    const options = {
      hostname: 'api.paystack.co',
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
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

router.post('/', requireAuth, async (req, res) => {
  const { items, shippingAddress, paymentMethod, momoPhone, momoProvider } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const product = store.products.find(p => p.id === item.productId);
    if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
    if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    total += product.price * item.quantity;
    orderItems.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity, image: product.image });
  }

  if (paymentMethod === 'mobile_money') {
    if (!momoPhone || !momoProvider) {
      return res.status(400).json({ message: 'Mobile Money phone and provider are required' });
    }
    try {
      const user = store.users.find(u => u.id === req.userId);
      const chargeRes = await chargeMomo(user.email, total, momoPhone, momoProvider);
      if (!chargeRes.status) {
        return res.status(400).json({ message: 'Payment initiation failed. Please try again.' });
      }
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
        paymentMethod: 'mobile_money',
        paystackReference: chargeRes.data?.reference,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.orders.push(order);
      return res.status(201).json({ ...order, paystackMessage: chargeRes.data?.display_text || 'Payment prompt sent to your phone. Please approve it.' });
    } catch (err) {
      return res.status(500).json({ message: 'Payment processing error', error: err.message });
    }
  }

  if (paymentMethod === 'card') {
    try {
      const user = store.users.find(u => u.id === req.userId);
      const orderId = uuidv4();
      const callbackUrl = `${process.env.FRONTEND_URL}/orders`;
      const initRes = await initializeCardPayment(user.email, total, orderId, callbackUrl);
      if (!initRes.status) return res.status(400).json({ message: 'Card payment initiation failed.' });
      for (const item of items) {
        const product = store.products.find(p => p.id === item.productId);
        product.stock -= item.quantity;
      }
      const order = {
        id: orderId,
        orderNumber: `SCH-${Date.now().toString().slice(-6)}`,
        userId: req.userId,
        items: orderItems,
        total: parseFloat(total.toFixed(2)),
        shippingAddress: shippingAddress || {},
        paymentMethod: 'card',
        paystackReference: orderId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.orders.push(order);
      return res.status(201).json({ ...order, paymentUrl: initRes.data.authorization_url });
    } catch (err) {
      return res.status(500).json({ message: 'Card payment error', error: err.message });
    }
  }

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
    paymentMethod: paymentMethod || 'cash',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.orders.push(order);
  res.status(201).json(order);
});

router.get('/mine', requireAuth, (req, res) => {
  const myOrders = store.orders.filter(o => o.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myOrders);
});

router.get('/', requireAdmin, (req, res) => {
  const sorted = [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sorted);
});

router.put('/:id/status', requireAdmin, (req, res) => {
  const order = store.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

router.get('/stats/summary', requireAdmin, (req, res) => {
  const totalRevenue = store.orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = store.orders.length;
  const totalCustomers = new Set(store.orders.map(o => o.userId)).size;
  const totalProducts = store.products.length;
  res.json({ totalRevenue: parseFloat(totalRevenue.toFixed(2)), totalOrders, totalCustomers, totalProducts });
});

module.exports = router;