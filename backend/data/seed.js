require('dotenv').config();
const { pool } = require('./db');
const { v4: uuidv4 } = require('uuid');

const products = [
  { name: 'Premium Leather Tote Bag', category: 'Bags', price: 149.99, originalPrice: 199.99, stock: 24, rating: 4.8, reviews: 128, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', description: 'Handcrafted full-grain leather tote with gold-finish hardware.', tags: ['bestseller', 'new'], featured: true },
  { name: 'Classic Aviator Sunglasses', category: 'Accessories', price: 89.99, originalPrice: 120.00, stock: 50, rating: 4.6, reviews: 94, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80', description: 'Polarized UV400 lenses with a gold stainless steel frame.', tags: ['sale'], featured: true },
  { name: 'Silk Evening Dress', category: 'Clothing', price: 219.00, originalPrice: 219.00, stock: 12, rating: 4.9, reviews: 67, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', description: 'Luxurious 100% silk evening dress with elegant draping.', tags: ['new'], featured: true },
  { name: 'Gold Cuff Bracelet', category: 'Jewellery', price: 64.00, originalPrice: 80.00, stock: 35, rating: 4.7, reviews: 211, image: 'https://images.unsplash.com/photo-1573408301185-9519f94815b9?w=600&q=80', description: '18K gold-plated wide cuff bracelet with engraved floral pattern.', tags: ['bestseller', 'sale'], featured: false },
  { name: 'Cashmere Wool Scarf', category: 'Accessories', price: 95.00, originalPrice: 95.00, stock: 40, rating: 4.5, reviews: 55, image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80', description: 'Ultra-soft 100% cashmere scarf in a generous wrap size.', tags: ['new'], featured: false },
  { name: 'Suede Chelsea Boots', category: 'Footwear', price: 175.00, originalPrice: 220.00, stock: 18, rating: 4.8, reviews: 143, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', description: 'Premium suede Chelsea boots with elastic side panels.', tags: ['sale', 'bestseller'], featured: true },
  { name: 'Embroidered Kaftan', category: 'Clothing', price: 130.00, originalPrice: 130.00, stock: 20, rating: 4.7, reviews: 39, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', description: 'Flowing kaftan with intricate gold thread embroidery.', tags: ['new'], featured: false },
  { name: 'Structured Blazer', category: 'Clothing', price: 185.00, originalPrice: 240.00, stock: 22, rating: 4.6, reviews: 88, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', description: 'Tailored double-breasted blazer in premium wool blend.', tags: ['sale'], featured: false },
];

async function seed() {
  try {
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (existing[0].count > 0) {
      console.log('Products already exist, skipping seed.');
      process.exit(0);
    }
    for (const p of products) {
      await pool.query(
        'INSERT INTO products (id, name, category, price, originalPrice, stock, rating, reviews, image, description, tags, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), p.name, p.category, p.price, p.originalPrice, p.stock, p.rating, p.reviews, p.image, p.description, JSON.stringify(p.tags), p.featured]
      );
    }
    console.log('Seeded', products.length, 'products successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
