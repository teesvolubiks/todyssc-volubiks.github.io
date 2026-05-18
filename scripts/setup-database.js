require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/volubiks';

async function setupDatabase() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('Connected to MongoDB');

  const productsPath = path.join(__dirname, '..', 'public', 'data', 'products.json');
  if (fs.existsSync(productsPath)) {
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    console.log(`Importing ${products.length} products...`);

    for (const product of products) {
      try {
        await Product.updateOne(
          { id: product.id },
          {
            $set: {
              name: product.name,
              slug: product.slug,
              price: product.price,
              currency: product.currency || 'NGN',
              image: product.image,
              images: product.images || [],
              description: product.description,
              category: product.category,
              featured: product.featured || false,
              inventory: product.inventory || 0,
              tags: product.tags || [],
              setOptions: product.setOptions || []
            }
          },
          { upsert: true }
        );
      } catch (err) {
        console.error(`Error importing product ${product.id}:`, err.message);
      }
    }
    console.log('Products imported successfully');
  } else {
    console.log('products.json not found, skipping product import');
  }

  await mongoose.disconnect();
  console.log('\n✅ MongoDB setup complete!');
  console.log('\nTo run the server:');
  console.log('1. Copy .env.example to .env and update with your MongoDB connection string');
  console.log('2. Run: npm run build');
  console.log('3. Run: npm start');
}

setupDatabase().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});

