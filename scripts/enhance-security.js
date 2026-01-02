#!/usr/bin/env node
// Script to enhance cyber security for the site
// - Generates secure hashed slugs for products to obfuscate URLs
// - Adds security headers configuration
// - Sanitizes product data
// Usage: node scripts/enhance-security.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const productsFile = path.join(root, 'public', 'data', 'products.json');

function generateSecureSlug(product) {
  // Create a hash based on id and name for uniqueness and security
  const hashInput = `${product.id}-${product.name}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
  // Take first 16 chars for a long but manageable slug
  return hash.substring(0, 16);
}

function sanitizeProduct(product) {
  // Sanitize description and name to prevent XSS
  const sanitize = (str) => str ? str.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/javascript:/gi, '') : '';
  return {
    ...product,
    name: sanitize(product.name),
    description: sanitize(product.description),
    slug: generateSecureSlug(product)
  };
}

async function enhanceSecurity() {
  try {
    const productsData = fs.readFileSync(productsFile, 'utf8');
    const products = JSON.parse(productsData);

    console.log(`Processing ${products.length} products for security enhancements...`);

    const securedProducts = products.map(sanitizeProduct);

    // Write back the secured products
    fs.writeFileSync(productsFile, JSON.stringify(securedProducts, null, 2));
    console.log(`Security enhancements applied. Products updated with secure slugs.`);

    // Generate security headers config for deployment
    const securityConfig = {
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.paystack.co https://api.paystack.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://ipapi.co https://api.exchangerate-api.com https://js.paystack.co https://api.paystack.co;",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      }
    };

    const configFile = path.join(root, 'security-config.json');
    fs.writeFileSync(configFile, JSON.stringify(securityConfig, null, 2));
    console.log(`Security headers config generated at ${configFile}`);

    console.log('Run `npm run generate:sitemap` to update sitemap with new slugs.');
  } catch (error) {
    console.error('Error enhancing security:', error);
  }
}

enhanceSecurity();