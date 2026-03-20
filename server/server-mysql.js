require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected:', process.env.DB_NAME);
    connection.release();
  } catch (err) {
    console.error('❌ DB Connection failed:', err.message);
    process.exit(1);
  }
}

// Middleware to ensure DB tables exist
async function ensureTables() {
  const createTables = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255),
      price DECIMAL(10,2),
      currency VARCHAR(10) DEFAULT 'NGN',
      image VARCHAR(500),
      images JSON,
      description TEXT,
      category VARCHAR(100),
      featured BOOLEAN DEFAULT FALSE,
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
      payment_status VARCHAR(50),
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
    console.log('✅ Tables ready');
    connection.release();
  } catch (err) {
    console.error('❌ Table creation failed:', err.message);
  }
}

// API Routes

// Products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
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
      [id, name, slug, price, currency, image, JSON.stringify(images), description, category, featured, inventory, JSON.stringify(tags)]
    );
    res.status(201).json({ message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(req.params.id);
    await pool.execute(`UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
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
      [id, order.customer_name, order.email, order.phone, order.address, order.city, order.country, JSON.stringify(order.items), order.subtotal, order.vat, order.total, order.status || 'pending', order.payment_method, order.payment_status || 'paid', order.transaction_id]
    );
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customers (basic)
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', db: process.env.DB_NAME }));

// Init on startup
async function init() {
  await testConnection();
  await ensureTables();
}

init();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`API endpoints: /api/products, /api/orders, /api/customers`);
});

module.exports = app;
