require('dotenv').config({ path: '../server/.env' });
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

async function migrate() {
  let connection;
  try {
    console.log('🔄 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);

    // Migrate products
    console.log('📦 Migrating products...');
    const productsJson = await fs.readFile('../public/data/products.json', 'utf8');
    const products = JSON.parse(productsJson);
    
    for (const product of products) {
      // Skip if already exists
      const [existing] = await connection.execute('SELECT id FROM products WHERE id = ?', [product.id]);
      if (existing.length > 0) {
        console.log(`⏭️  Product ${product.id} already exists, skipping...`);
        continue;
      }

      await connection.execute(
        `INSERT INTO products (id, name, slug, price, currency, image, images, description, category, featured, inventory, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.name,
          product.slug || '',
          parseFloat(product.price),
          product.currency || 'NGN',
          product.image || '',
          JSON.stringify(product.images || []),
          product.description || '',
          product.category || '',
          product.featured === true || product.featured === 'true',
          parseInt(product.inventory) || 0,
          JSON.stringify(product.tags || [])
        ]
      );
      console.log(`✅ Added product: ${product.name}`);
    }

    // Sample orders
    console.log('📋 Adding sample orders...');
    const sampleOrders = [
      {
        id: 'ORD-1',
        customer_name: 'John Doe',
        email: 'john@example.com',
        phone: '+234123456789',
        address: '123 Lagos Street',
        city: 'Lagos',
        country: 'Nigeria',
        items: JSON.stringify([{ name: 'Clothing 1', price: 6500, quantity: 1 }]),
        subtotal: 6500,
        vat: 650,
        total: 7150,
        status: 'completed',
        payment_method: 'Opay',
        payment_status: 'paid'
      }
    ];

    for (const order of sampleOrders) {
      const [existing] = await connection.execute('SELECT id FROM orders WHERE id = ?', [order.id]);
      if (existing.length === 0) {
        await connection.execute(
          `INSERT INTO orders (id, customer_name, email, phone, address, city, country, items, subtotal, vat, total, status, payment_method, payment_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [order.id, order.customer_name, order.email, order.phone, order.address, order.city, order.country, order.items, order.subtotal, order.vat, order.total, order.status, order.payment_method, order.payment_status]
        );
        console.log(`✅ Added sample order: ${order.id}`);
      }
    }

    console.log('🎉 Migration complete! Data imported to DB.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    if (connection) connection.end();
  }
}

migrate();
