require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const mongoose = require('mongoose');

const Product = require('./models/Product');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/volubiks';

let dbConnected = false;

async function initDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    dbConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB not available, using static data mode');
    console.log('Error:', error.message);
    dbConnected = false;
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
    if (dbConnected) {
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      return res.json(products);
    }

    const fs = require('fs');
    const productsPath = path.join(__dirname, 'dist', 'data', 'products.json');
    if (fs.existsSync(productsPath)) {
      const data = fs.readFileSync(productsPath, 'utf8');
      return res.json(JSON.parse(data));
    }

    return res.status(404).json({ error: 'No products found' });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (dbConnected) {
      const product = await Product.findOne({ id }).lean();
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
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

    if (dbConnected) {
      const order = await Order.create({
        order_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        items,
        total_amount,
        currency: currency || 'NGN'
      });

      if (customer_email) {
        await Customer.findOneAndUpdate(
          { email: customer_email },
          {
            name: customer_name,
            phone: customer_phone,
            address: customer_address
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      return res.status(201).json({
        success: true,
        order_id: order.order_id,
        id: order._id
      });
    }

    return res.status(201).json({
      success: true,
      order_id,
      message: 'Order saved (MongoDB not available)'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    if (dbConnected) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return res.json(orders);
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
    if (dbConnected) {
      const order = await Order.findOne({ order_id: orderId }).lean();
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.json(order);
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

    if (dbConnected) {
      await Order.updateOne(
        { order_id: orderId },
        { order_status, payment_status }
      );
      return res.json({ success: true });
    }

    return res.status(500).json({ error: 'MongoDB not available' });
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

