require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// DB Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Test connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ MySQL connected:', process.env.DB_NAME || 'local');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL Connection failed:', err.message);
    process.exit(1);
  }
}

// Ensure DB tables exist
async function ensureTables() {
  const createTables = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE,
      price DECIMAL(10,2),
      currency VARCHAR(10) DEFAULT 'NGN',
      image VARCHAR(500),
      images JSON,
      description TEXT,
      category VARCHAR(100),
      featured TINYINT(1) DEFAULT 0,
      inventory INT DEFAULT 0,
      tags JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      customer_name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(100),
      address TEXT,
      city VARCHAR(100),
      country VARCHAR(100),
      items JSON,
      subtotal DECIMAL(10,2),
      vat DECIMAL(10,2),
      total DECIMAL(10,2),
      status ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
      payment_method VARCHAR(100),
      payment_status VARCHAR(50) DEFAULT 'paid',
      transaction_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(100),
      total_spent DECIMAL(10,2) DEFAULT 0,
      order_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    const connection = await pool.getConnection();
    await connection.execute(createTables);
    console.log('✅ Tables created/verified');
    connection.release();
  } catch (err) {
    console.error('❌ Table creation failed:', err.message);
    throw err;
  }
}

// API Routes - Products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY featured DESC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { id, name, slug, price, currency = 'NGN', image, images = [], description, category, featured = false, inventory = 0, tags = [] } = req.body;
    await pool.execute(
      'INSERT INTO products (id, name, slug, price, currency, image, images, description, category, featured, inventory, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, slug, parseFloat(price), currency, image, JSON.stringify(images), description, category, featured ? 1 : 0, parseInt(inventory), JSON.stringify(tags)]
    );
    res.status(201).json({ message: 'Product created', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates).map(v => typeof v === 'number' ? parseFloat(v) : v);
    values.push(req.params.id);
    await pool.execute(`UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: `Deleted ${result.affectedRows} product(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    const id = `ORD-${Date.now()}`;
    await pool.execute(
      'INSERT INTO orders (id, customer_name, email, phone, address, city, country, items, subtotal, vat, total, status, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, order.customer_name, order.email, order.phone, order.address, order.city || '', order.country || 'NG', JSON.stringify(order.items || []), parseFloat(order.subtotal || 0), parseFloat(order.vat || 0), parseFloat(order.total || 0), order.status || 'pending', order.payment_method || 'card', order.payment_status || 'paid', order.transaction_id]
    );
    res.status(201).json({ id, message: 'Order created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const [result] = await pool.execute('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customers
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT DATABASE() as db, VERSION() as version');
    res.json({ status: 'OK', db: rows[0].db, mysql_version: rows[0].version });
  } catch (err) {
    res.status(500).json({ error: 'DB connection failed', details: err.message });
  }
});

// Migrate data from JSON (cPanel compatible)
app.post('/api/migrate', async (req, res) => {
  try {
    const productsPath = path.join(__dirname, '../../public/data/products.json');
    if (!fs.existsSync(productsPath)) {
      return res.status(404).json({ error: 'products.json not found at ' + productsPath });
    }
    const rawData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(rawData);
    
    let inserted = 0, skipped = 0;
    for (const p of products) {
      try {
        await pool.execute(
          `INSERT INTO products (id, name, slug, price, currency, image, images, description, category, featured, inventory, tags) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           name=VALUES(name), slug=VALUES(slug), price=VALUES(price), inventory=VALUES(inventory)`,
          [
            p.id || p._id,
            p.name,
            p.slug,
            parseFloat(p.price || 0),
            p.currency || 'NGN',
            p.image,
            JSON.stringify(p.images || []),
            p.description,
            p.category,
            p.featured ? 1 : 0,
            parseInt(p.inventory || 0),
            JSON.stringify(p.tags || [])
          ]
        );
        inserted++;
      } catch (err) {
        skipped++;
      }
    }
    res.json({ message: `Migrated ${inserted} products (${skipped} skipped/duplicates)` });
  } catch (err) {
    res.status(500).json({ error: 'Migration failed', details: err.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing DB pool');
  await pool.end();
  process.exit(0);
});

// Init
async function init() {
  console.log('🚀 Starting Volubiks MySQL Server (cPanel Ready)...');
  await testConnection();
  await ensureTables();
}

init().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server ready on http://0.0.0.0:${PORT}`);
    console.log('API: /api/products /api/orders /api/customers');
    console.log('Health: /api/health');
    console.log('Migrate: POST /api/migrate');
  });
}).catch(err => {
  console.error('Init failed:', err);
  process.exit(1);
});

module.exports = app;
