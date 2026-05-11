const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

const store = require('./data/store');
app.get('/api/stats', (req, res) => {
  res.json({
    products: store.products.length,
    orders: store.orders.length,
    customers: store.users.filter(u => u.role === 'customer').length,
    revenue: store.orders.reduce((s, o) => s + o.total, 0).toFixed(2),
  });
});

app.get('/', (req, res) => res.json({ message: 'SmartCart Hub API running', version: '1.0.0' }));

app.listen(PORT, () => console.log(`\n🛒 SmartCart Hub API → http://localhost:${PORT}\n`));
