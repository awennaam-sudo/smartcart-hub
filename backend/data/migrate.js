const pool = require('./db');

async function migrate() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price DECIMAL(10,2),
        originalPrice DECIMAL(10,2),
        stock INT DEFAULT 0,
        rating DECIMAL(3,1) DEFAULT 0,
        reviews INT DEFAULT 0,
        image TEXT,
        description TEXT,
        tags JSON,
        featured BOOLEAN DEFAULT false,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'customer',
        address JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        orderNumber VARCHAR(50),
        userId VARCHAR(36),
        items JSON,
        total DECIMAL(10,2),
        shippingAddress JSON,
        paymentMethod VARCHAR(50),
        paystackReference VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully!');
  } finally {
    conn.release();
  }
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
