const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFile = path.join(__dirname, '../../products.xlsx');

function addProducts() {
  // Read the existing Excel file
  const wb = XLSX.readFile(excelFile);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

  console.log(`Current products: ${data.length}`);

  if (data.length === 0) {
    console.error('No existing products to base new ones on.');
    return;
  }

  // Get the last product to base new ones on
  const template = data[data.length - 1];
  const startId = parseInt(template.id) + 1;

  // Add 30 more products
  for (let i = 0; i < 30; i++) {
    const newProduct = { ...template };
    newProduct.id = startId + i;
    newProduct.name = `${template.name} ${startId + i}`;
    // Modify slug if exists
    if (newProduct.slug) {
      newProduct.slug = `${template.slug}-${startId + i}`;
    }
    data.push(newProduct);
  }

  // Convert back to sheet
  const newWs = XLSX.utils.json_to_sheet(data);

  // Update the workbook
  wb.Sheets[wb.SheetNames[0]] = newWs;

  // Write back to file
  XLSX.writeFile(wb, excelFile);

  console.log(`Added 30 more products. Total now: ${data.length}`);
}

addProducts();