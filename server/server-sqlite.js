require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './data/volubiks.db';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure data dir
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

// Test connection on startup
async function testConnection() {
  return new Promise((resolve, reject) => {
    db.get("SELECT 1", (err) => {
      if (err) {
        console.error('❌ DB Connection failed:', err.message);
        reject(err);
      } else {
        console.log('✅ SQLite connected:', DB_PATH);
        resolve();
      }
    });
  });
}

// Middleware to ensure DB tables exist
async function ensureTables() {
  const createTables = `
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT,
      price REAL,
      currency TEXT DEFAULT 'NGN',
      image TEXT,
      images TEXT,
      description TEXT,
      category TEXT,
      featured INTEGER DEFAULT 0,
      inventory INTEGER DEFAULT 0,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      items TEXT,
      subtotal REAL,
      vat REAL,
      total REAL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_status TEXT,
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      total_spent REAL DEFAULT 0,
      order_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  return new Promise((resolve, reject) => {
    db.exec(createTables, (err) => {
      if (err) {
        console.error('❌ Table creation failed:', err.message);
        reject(err);
      } else {
        console.log('✅ Tables ready');
        resolve();
      }
    });
  });
}

// API Routes - Products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

app.post('/api/products', (req, res) => {
  const { id, name, slug, price, currency = 'NGN', image, images = [], description, category, featured = false, inventory = 0, tags = [] } = req.body;
  db.run(
    'INSERT INTO products (id, name, slug, price, currency, image, images, description, category, featured, inventory, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, slug, price, currency, image, JSON.stringify(images), description, category, featured ? 1 : 0, inventory, JSON.stringify(tags)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Product created', id: this.lastID });
    }
  );
});

app.put('/api/products/:id', (req, res) => {
  const updates = req.body;
  let setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  let values = Object.values(updates);
  values.push(req.params.id);
  db.run(`UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product updated' });
  });
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Deleted ${this.changes} product(s)` });
  });
});

// Orders
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  const order = req.body;
  const id = `ORD-${Date.now()}`;
  db.run(
    'INSERT INTO orders (id, customer_name, email, phone, address, city, country, items, subtotal, vat, total, status, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, order.customer_name, order.email, order.phone, order.address, order.city, order.country, JSON.stringify(order.items), order.subtotal, order.vat, order.total, order.status || 'pending', order.payment_method, order.payment_status || 'paid', order.transaction_id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id });
    }
  );
});

app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order updated' });
  });
});

// Customers
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', db: DB_PATH }));

// Migrate data endpoint
app.post('/api/migrate', (req, res) => {
  const productsPath = path.join(__dirname, '../../public/data/products.json');
  if (!fs.existsSync(productsPath)) {
    return res.status(404).json({ error: 'products.json not found' });
  }
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  let inserted = 0;
  products.forEach(p => {
    db.run(
      'INSERT OR IGNORE INTO products (id, name, slug, price, currency, image, images, description, category, featured, inventory, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [p.id || p._id, p.name, p.slug, p.price, p.currency || 'NGN', p.image, JSON.stringify(p.images || []), p.description, p.category, p.featured ? 1 : 0, p.inventory || 0, JSON.stringify(p.tags || [])],
      err => { if (err) console.error('Migrate error:', err); }
    );
    inserted++;
  });
  res.json({ message: `Migrated ${inserted} products` });
});

// Init on startup
async function init() {
  try {
    await testConnection();
    await ensureTables();
  } catch (err) {
    process.exit(1);
  }
}

init();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`API endpoints: /api/products, /api/orders, /api/customers`);
  console.log(`DB: ${DB_PATH}`);
  console.log(`Migrate: POST /api/migrate`);
});

module.exports = app;

