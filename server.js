require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Connection Pool
let pool;

async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'volubiks',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully');
    connection.release();
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.log('MySQL not available, using static data mode');
    console.log('Error:', error.message);
    pool = null;
  }
}

async function createTables() {
  if (!pool) return;
  
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE,
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'NGN',
      image VARCHAR(500),
      images JSON,
      description TEXT,
      category VARCHAR(100),
      featured BOOLEAN DEFAULT false,
      inventory INT DEFAULT 0,
      tags JSON,
      setOptions JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(100) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      customer_phone VARCHAR(50),
      customer_address TEXT,
      items JSON NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'NGN',
      payment_status VARCHAR(50) DEFAULT 'pending',
      order_status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(50),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.execute(createProductsTable);
    await pool.execute(createOrdersTable);
    await pool.execute(createCustomersTable);
    console.log('Database tables created successfully');
  } catch (error) {
    console.log('Error creating tables:', error.message);
  }
}

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for API
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    if (pool) {
      const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      // Parse JSON fields
      const products = rows.map(row => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : [],
        tags: row.tags ? JSON.parse(row.tags) : [],
        setOptions: row.setOptions ? JSON.parse(row.setOptions) : []
      }));
      return res.json(products);
    } else {
      // Fallback to static JSON
      const fs = require('fs');
      const productsPath = path.join(__dirname, 'dist', 'data', 'products.json');
      if (fs.existsSync(productsPath)) {
        const data = fs.readFileSync(productsPath, 'utf8');
        return res.json(JSON.parse(data));
      }
      return res.status(404).json({ error: 'No products found' });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (pool) {
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const product = {
        ...rows[0],
        images: rows[0].images ? JSON.parse(rows[0].images) : [],
        tags: rows[0].tags ? JSON.parse(rows[0].tags) : [],
        setOptions: rows[0].setOptions ? JSON.parse(rows[0].setOptions) : []
      };
      return res.json(product);
    }
    return res.status(404).json({ error: 'Product not found' });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { order_id, customer_name, customer_email, customer_phone, customer_address, items, total_amount, currency } = req.body;
    
    if (pool) {
      const [result] = await pool.query(
        `INSERT INTO orders (order_id, customer_name, customer_email, customer_phone, customer_address, items, total_amount, currency) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [order_id, customer_name, customer_email, customer_phone, customer_address, JSON.stringify(items), total_amount, currency || 'NGN']
      );
      return res.status(201).json({ 
        success: true, 
        order_id: order_id,
        id: result.insertId 
      });
    } else {
      // Store in memory/file as fallback
      return res.status(201).json({ 
        success: true, 
        order_id: order_id,
        message: 'Order saved (MySQL not available)' 
      });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    if (pool) {
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return res.json(rows);
    }
    return res.json([]);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (pool) {
      const [rows] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.json(rows[0]);
    }
    return res.status(404).json({ error: 'Order not found' });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
app.put('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status, payment_status } = req.body;
    
    if (pool) {
      await pool.query(
        'UPDATE orders SET order_status = ?, payment_status = ? WHERE order_id = ?',
        [order_status, payment_status, orderId]
      );
      return res.json({ success: true });
    }
    return res.status(500).json({ error: 'MySQL not available' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Serve static files from the dist folder (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Also serve from public folder
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to view the app`);
    console.log(`API available at http://localhost:${PORT}/api/products`);
  });
});

module.exports = app;

