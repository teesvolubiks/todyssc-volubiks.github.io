# Deployment Guide for Render with MongoDB

## Prerequisites

Before deploying, you need:
1. A Render account
2. A MongoDB database URI (Atlas, Render Marketplace, or another MongoDB provider)
3. Node.js dependencies installed locally for build verification

## Step 1: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your MongoDB connection string:
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/volubiks?retryWrites=true&w=majority
   PORT=3000
   ```

## Step 2: Build the Application Locally

On your local machine, run:
```bash
npm install
npm run build
```

This creates a `dist` folder with optimized production files.

## Step 3: Run Database Setup (Optional)

If you want to import products into MongoDB from the local JSON dataset, run:
```bash
npm run setup:db
```

This connects to the MongoDB instance specified by `MONGO_URI` and upserts products from `public/data/products.json`.

## Step 4: Deploy to Render

1. Create a new Web Service in Render and connect it to this repository.
2. Set the build command:
   ```bash
   npm run build
   ```
3. Set the start command:
   ```bash
   npm start
   ```
4. Add environment variables in Render:
   - `MONGO_URI` — your MongoDB connection string
   - `PORT` — optional (Render provides one automatically)

## Step 5: Verify MongoDB Connection

Render will start the container and the app will try to connect to MongoDB on launch. If connection succeeds, the app can read/write:
- `products`
- `orders`
- `customers`

If the connection fails, the app still serves static products from `dist/data/products.json`.

## Troubleshooting

### MongoDB connection problems
- Confirm `MONGO_URI` is correct
- Verify your MongoDB provider allows connections from Render's IP range or uses an Atlas whitelist
- Ensure the database user has write permission for the target database

### Build or start failures
- Confirm `npm install` ran successfully in Render
- Check that `render.yaml` or service settings point to the correct `server.js` start file

### Static data fallback
If the server cannot connect to MongoDB, it will still run and serve static product data from `dist/data/products.json`, but order writes will not persist.

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Setup MongoDB products data
npm run setup:db

# Start server locally
npm start
```
npm start

# Or with custom port
PORT=3000 npm start
```

## For go54.com Specific Setup

Since go54.com may have specific requirements:

1. **Use the Node.js App feature in cPanel** - This is the recommended way
2. Set the application root to your domain's document root
3. Make sure to set all environment variables in the Node.js settings
4. The app will automatically use the correct port assigned by cPanel

## Important Notes

- The server.js includes fallback to static JSON if MySQL is not available
- All product images should be in `/data/images/` folder
- Make sure the `.env` file is not publicly accessible (should be outside public_html if possible)

