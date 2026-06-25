const express = require('express');
const cors = require('cors');
const { initDB, pool } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

app.get('/api/stats', async (req, res) => {
  try {
    const [[{ products }]] = await pool.query('SELECT COUNT(*) as products FROM products');
    const [[{ orders }]] = await pool.query('SELECT COUNT(*) as orders FROM orders');
    const [[{ customers }]] = await pool.query('SELECT COUNT(*) as customers FROM users WHERE role = "customer"');
    const [[{ revenue }]] = await pool.query('SELECT COALESCE(SUM(total), 0) as revenue FROM orders');
    res.json({ products, orders, customers, revenue: parseFloat(revenue).toFixed(2) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/', (req, res) => res.json({ message: 'SmartCart Hub API running', version: '1.0.0' }));

initDB().then(() => {
  app.listen(PORT, () => console.log(`\n🛒 SmartCart Hub API → http://localhost:${PORT}\n`));
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
