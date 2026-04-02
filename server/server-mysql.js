0require('dotenv').config();
const express = require('express');
const knex = require('knex');
const knexConfig = require('../knexfile.js');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// DB Knex instance
const db = knex(knexConfig.development);

// Test connection on startup
async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ MySQL/Knex connected: royalvol_tody');
  } catch (err) {
    console.error('❌ DB Connection failed:', err.message);
    process.exit(1);
  }
}

// Ensure DB tables exist (Knex schema)
async function ensureTables() {
  try {
    await db.schema.createTableIfNotExists('products', (table) => {
      table.string('id', 50).primary();
      table.string('name', 255).notNullable();
      table.string('slug', 255);
      table.decimal('price', 10, 2);
      table.string('currency', 10).defaultTo('NGN');
      table.string('image', 500);
      table.json('images');
      table.text('description');
      table.string('category', 100);
      table.boolean('featured').defaultTo(false);
      table.integer('inventory').defaultTo(0);
      table.json('tags');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now()).onUpdate(() => db.fn.now());
    });

    await db.schema.createTableIfNotExists('orders', (table) => {
      table.string('id', 50).primary();
      table.string('customer_name', 255);
      table.string('email', 255);
      table.string('phone', 100);
      table.text('address');
      table.string('city', 100);
      table.string('country', 100);
      table.json('items');
      table.decimal('subtotal', 10, 2);
      table.decimal('vat', 10, 2);
      table.decimal('total', 10, 2);
      table.enum('status', ['pending', 'processing', 'shipped', 'completed', 'cancelled']).defaultTo('pending');
      table.string('payment_method', 100);
      table.string('payment_status', 50);
      table.string('transaction_id', 255);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now()).onUpdate(() => db.fn.now());
    });

    await db.schema.createTableIfNotExists('customers', (table) => {
      table.string('id', 50).primary();
      table.string('name', 255);
      table.string('email', 255).unique();
      table.string('phone', 100);
      table.decimal('total_spent', 10, 2).defaultTo(0);
      table.integer('order_count').defaultTo(0);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('✅ Tables ready (Knex schema)');
  } catch (err) {
    console.error('❌ Table creation failed:', err.message);
  }
}

// API Routes

// Products
app.get('/api/products', async (req, res) => {
  try {
    const rows = await db('products').orderBy('created_at', 'desc');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const row = await db('products').where('id', req.params.id).first();
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { id, name, slug, price, currency = 'NGN', image, images = [], description, category, featured = false, inventory = 0, tags = [] } = req.body;
    await db('products').insert({
      id, name, slug, price, currency, image, images, description, category, featured, inventory, tags
    });
    res.status(201).json({ message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    await db('products').where('id', req.params.id).update({ ...req.body, updated_at: db.fn.now() });
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db('products').where('id', req.params.id).delete();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const rows = await db('orders').orderBy('created_at', 'desc');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    const id = `ORD-${Date.now()}`;
    await db('orders').insert({
      id,
      customer_name: order.customer_name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      country: order.country,
      items: order.items,
      subtotal: order.subtotal,
      vat: order.vat,
      total: order.total,
      status: order.status || 'pending',
      payment_method: order.payment_method,
      payment_status: order.payment_status || 'paid',
      transaction_id: order.transaction_id
    });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await db('orders').where('id', req.params.id).update({ status, updated_at: db.fn.now() });
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customers (basic)
app.get('/api/customers', async (req, res) => {
  try {
    const rows = await db('customers').orderBy('created_at', 'desc');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', db: 'royalvol_tody (Knex MySQL)' }));

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
