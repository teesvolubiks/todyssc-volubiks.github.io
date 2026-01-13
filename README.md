```markdown
# Volubiks Jewelry — Landing (initial commit)

This commit contains the client-side landing page for "Royal Volubiks Jewelries".

How to run locally (frontend only)
1. cd client
2. npm install
3. npm run dev
4. Open http://localhost:5173

What I'll add next (after you confirm push)
- Full Shop and Product pages
- Server (Express) with SQLite for products & orders
- Paystack and Moniepoint integration (server endpoints and webhook)
- devcontainer and Codespace-ready configuration
- Instructions for adding Paystack & Moniepoint keys (env)


## Importing products from a spreadsheet

You can manage product data using a CSV or Excel spreadsheet and import it into `public/data/products.json`.

### Excel/CSV Column Structure

Your spreadsheet must have these exact column headers (case-sensitive):

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `id` | Yes | Number/Text | Unique product identifier | `1`, `PROD-001` |
| `name` | Yes | Text | Product display name | `Royal Volubiks Diamond Pendant` |
| `slug` | No | Text | URL-friendly identifier (auto-generated if empty) | `royal-diamond-pendant` |
| `price` | Yes | Number | Product price in cents/units | `24899` (for ₦24,899) |
| `currency` | No | Text | Currency code (defaults to NGN) | `NGN`, `USD`, `EUR` |
| `image` | No | Text | Primary image path or URL | `/images/pendant.jpg` or `https://example.com/image.jpg` |
| `description` | No | Text | Product description | `A brilliant diamond pendant with classic setting.` |
| `category` | No | Text | Product category | `necklace`, `rings`, `earrings`, `bracelets` |
| `featured` | No | Text | Show in featured section (`true`/`false`) | `true` |
| `inventory` | No | Number | Stock quantity (0 = out of stock) | `12` |
| `tags` | No | Text | Semicolon or comma-separated tags | `diamond;pendant;luxury` |

### Steps to Add Products Perfectly

1. **Prepare your Excel file** (`products.xlsx` in the root directory):
   - Use the exact column headers shown above
   - Fill in at least `id`, `name`, and `price` for each product
   - Use consistent formatting (e.g., all prices in the same currency unit)

2. **Add product images**:
   - Place images in the same directory as your Excel file, or in `public/images/`
   - Reference them in the `image` column as relative paths (e.g., `images/pendant.jpg`) or URLs
   - For multiple images, separate with semicolons: `images/pendant1.jpg;images/pendant2.jpg`

3. **Import the data**:
   ```bash
   # Basic import (data only)
   npm run import:products ../products.xlsx

   # Import with image copying
   npm run import:products ../products.xlsx -- --copy-images

   # Import and overwrite existing images
   npm run import:products ../products.xlsx -- --copy-images --overwrite-images
   ```

### Best Practices for Perfect Display

- **IDs**: Use sequential numbers or meaningful codes (e.g., `RVP-001` for Royal Volubiks Pendant)
- **Names**: Keep them descriptive but concise (under 60 characters)
- **Slugs**: Auto-generated from name if empty; ensure uniqueness
- **Prices**: Use whole numbers (no decimals); convert to cents if needed (e.g., ₦24,899 = 24899)
- **Images**: Use high-quality JPG/PNG files (under 2MB each); square aspect ratio works best
- **Descriptions**: Write compelling descriptions (100-300 characters) highlighting features and benefits
- **Categories**: Use consistent naming (necklace, rings, earrings, bracelets)
- **Featured**: Set to `true` for products you want in the random featured carousel
- **Inventory**: Set to 0 for out-of-stock items; they won't show "Add to Cart" button
- **Tags**: Use relevant keywords separated by semicolons for better searchability

### Image Handling

The import script automatically:
- Copies images to `public/images/` for web serving
- Creates backup copies in `data/imports/<timestamp>/images/`
- Updates image paths in the JSON to web-accessible URLs
- Handles multiple images per product
- Avoids overwriting existing files (adds suffixes like `image-1.jpg`)

### Troubleshooting

- **Missing columns**: The import will fail if required columns are missing
- **Invalid data types**: Numbers for price/inventory, boolean strings for featured
- **Image not found**: Check paths are correct and files exist
- **Display issues**: Clear browser cache after import, as JSON is cached for 10 seconds

### Example Excel Row

```
id: 1
name: Royal Volubiks Diamond Pendant
slug: royal-diamond-pendant
price: 24899
currency: NGN
image: /images/diamond-pendant.jpg
description: A brilliant diamond pendant with classic setting.
category: necklace
featured: true
inventory: 12
tags: diamond;pendant;luxury
```

## Seller Dashboard

The application includes a comprehensive seller dashboard for managing your business operations.

### Accessing the Dashboard

1. Navigate to `/dashboard` in your browser
2. Login with the admin password (default: `admin123`)
3. Access all seller management features

### Dashboard Features

#### Overview
- **Key Metrics**: Total products, orders, revenue, and low stock alerts
- **Recent Orders**: Latest customer purchases with quick access
- **Top Products**: Best-selling items and their performance

#### Inventory Management
- **Product Catalog**: View all products with stock levels
- **Stock Alerts**: Identify low stock items (≤5 units)
- **Product Editing**: Update prices, descriptions, categories, and inventory
- **Search & Filter**: Find products quickly by name, ID, or stock status

#### Order Management
- **Order Tracking**: View all customer orders with full details
- **Order Status**: Update order status (pending, processing, shipped, completed, cancelled)
- **Customer Information**: Access buyer details and shipping information
- **Payment Details**: Track payment methods and transaction IDs

#### Customer Management
- **Customer Database**: View all registered customers
- **Purchase History**: See complete order history for each customer
- **Customer Metrics**: Total spent, order count, and average order value
- **Contact Information**: Access customer details for support

#### Sales Analytics
- **Revenue Tracking**: Monthly revenue charts and trends
- **Sales Performance**: Compare current vs previous periods
- **Top Products**: Identify best-selling items
- **Category Breakdown**: Sales distribution by product category

### Security Features

- **Password Protection**: Secure admin access with configurable password
- **Session Management**: Automatic logout on browser close
- **Data Privacy**: Customer information securely stored locally

### Data Storage

Order and customer data is stored locally in the browser for demo purposes. In production:
- Implement server-side database storage
- Add user authentication and authorization
- Enable data export/import capabilities
- Set up automated backups

### Sample Data

To populate the dashboard with sample data for testing:

```javascript
// Run this in browser console or create a script
const sampleOrders = [/* sample data from scripts/sample-orders.json */];
localStorage.setItem('volubiks_orders', JSON.stringify(sampleOrders));
```

The dashboard provides complete visibility into your business operations, enabling you to track sales, manage inventory, and understand customer behavior effectively.

```

```
