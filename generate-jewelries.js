const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'public', 'data', 'products.json');
const imagesDir = path.join(__dirname, 'public', 'data', 'images');

let products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Find existing max id
const maxId = Math.max(...products.map(p => parseInt(p.id)));

// Get J files
const jFiles = fs.readdirSync(imagesDir).filter(f => f.startsWith('J') && f.endsWith('.jpg'));

// Group by product number
const productGroups = {};
jFiles.forEach(file => {
  const match = file.match(/^J(\d+)_(\d+)\.jpg$/);
  if (match) {
    const num = match[1];
    if (!productGroups[num]) productGroups[num] = [];
    productGroups[num].push(file);
  }
});

// Template from first product, modify for jewelries
const template = { ...products[0] };
template.category = 'jewelries';
template.price = 15000; // Different price
template.currency = 'NGN';
template.name = 'Jewelry Item #';
template.slug = 'jewelry-';
template.description = 'Elegant jewelry collection item. Beautiful and timeless pieces for special occasions.';

let id = maxId + 1;
for (const num in productGroups) {
  const images = productGroups[num].sort();
  const product = { ...template };
  product.id = String(id++);
  product.name = `${template.name}${num}`;
  product.slug = `${template.slug}${num}`;
  product.image = `/data/images/${images[0]}`;
  product.images = images.map(img => `/data/images/${img}`);
  products.push(product);
}

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`Added ${Object.keys(productGroups).length} jewelry products.`);