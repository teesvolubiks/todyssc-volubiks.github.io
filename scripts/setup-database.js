require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // First connect without database to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  console.log('Connected to MySQL server');

  // Create database if not exists
  const dbName = process.env.DB_NAME || 'volubiks';
  await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  console.log(`Database '${dbName}' created or already exists`);

  // Use the database
  await connection.execute(`USE ${dbName}`);

  // Create products table
  await connection.execute(`
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
  `);
  console.log('Products table created');

  // Create orders table
  await connection.execute(`
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
  `);
  console.log('Orders table created');

  // Create customers table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(50),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Customers table created');

  // Import products from JSON file
  const productsPath = path.join(__dirname, '..', 'public', 'data', 'products.json');
  if (fs.existsSync(productsPath)) {
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    console.log(`Importing ${products.length} products...`);

    for (const product of products) {
      try {
        await connection.execute(
          `INSERT INTO products (id, name, slug, price, currency, image, images, description, category, featured, inventory, tags, setOptions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), inventory = VALUES(inventory)`,
          [
            product.id,
            product.name,
            product.slug,
            product.price,
            product.currency || 'NGN',
            product.image,
            JSON.stringify(product.images || []),
            product.description,
            product.category,
            product.featured || false,
            product.inventory || 0,
            JSON.stringify(product.tags || []),
            JSON.stringify(product.setOptions || [])
          ]
        );
      } catch (err) {
        console.error(`Error importing product ${product.id}:`, err.message);
      }
    }
    console.log('Products imported successfully');
  } else {
    console.log('products.json not found, skipping product import');
  }

  await connection.end();
  console.log('\n✅ Database setup complete!');
  console.log('\nTo run the server:');
  console.log('1. Copy .env.example to .env and update with your database credentials');
  console.log('2. Run: npm run build');
  console.log('3. Run: npm start');
}

setupDatabase().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});

