#!/usr/bin/env node
// Script to generate sitemap.xml from products.json
// Usage: node scripts/generate-sitemap.js

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const productsFile = path.join(root, 'public', 'data', 'products.json');
const sitemapFile = path.join(root, 'public', 'sitemap.xml');

function generateSitemap(products) {
  const baseUrl = 'https://yourdomain.com'; // Replace with your actual domain
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static pages
  const staticPages = [
    '/',
    '/shop',
    '/shop?category=jewelries',
    '/shop?category=clothings',
    '/shop?category=drinks',
    '/checkout',
    '/payment'
  ];

  staticPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${page}</loc>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';
  });

  // Product pages
  products.forEach(product => {
    const url = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${url}</loc>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    sitemap += '    <priority>0.6</priority>\n';
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>\n';
  return sitemap;
}

async function main() {
  try {
    const productsData = fs.readFileSync(productsFile, 'utf8');
    const products = JSON.parse(productsData);
    const sitemap = generateSitemap(products);
    fs.writeFileSync(sitemapFile, sitemap);
    console.log(`Sitemap generated with ${products.length} products at ${sitemapFile}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

main();