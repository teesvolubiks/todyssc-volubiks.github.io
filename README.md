# Volubiks — E-commerce Frontend + Express API

This repository contains a React + Vite storefront and an Express backend that together form a lightweight e-commerce platform for Volubiks.

Key points
- Frontend: React (Vite) single-page app in the repository root
- Backend: `server.js` (Express) exposes a simple JSON API under `/api/*`
- Database: MongoDB (via `mongoose`) with automatic collection use; static JSON fallback when MongoDB is unavailable
- Hosting: Suitable to deploy on Render (instructions below)

Table of contents
- Features
- How it works (architecture)
- Local development
- Database handling
- Deployment to Render
- Useful scripts
- Troubleshooting

Features
- Product catalog API (`/api/products`, `/api/products/:id`)
- Orders API (`/api/orders`, `/api/orders/:orderId`), create/update orders
- Seller dashboard and management components included in `components/` and `components/dashboard/`
- Import scripts for spreadsheet-based product import and image handling (see `scripts/`)

How it works (architecture)
- Frontend: built with Vite and React. During production the frontend is built into `dist/` and served by the Express server.
- Backend: `server.js` is a small Express app that
  - connects to MongoDB using `mongoose` (reads connection info from environment variables),
  - uses `products`, `orders`, and `customers` collections,
  - exposes JSON API routes under `/api/*`, and
  - serves static frontend assets from `dist/`.
- Fallback behavior: if the MongoDB connection fails the server logs "MongoDB not available, using static data mode" and serves product data from `dist/data/products.json`. Order writes will still return success but are not persisted to MongoDB.

Local development
1. Copy environment template and set values:

   cp .env.example .env

   Required env vars (common):
   - `PORT` — optional (default 3000)
   - `MONGO_URI` — full MongoDB connection string for your cluster or Atlas database

2. Install dependencies:

   npm install

3a. Frontend-only development (fast iteration):

   npm run dev

   This starts Vite on its default port (usually 5173). Use the Vite dev server for hot-reload while building UI.

3b. Full-stack local (build frontend and start the server):

   npm run build
   npm start

   `npm start` runs `node server.js`, which will serve the built `dist/` files and the API.

Database handling
- The backend uses MongoDB via `mongoose`.
- Environment variables used by `server.js`:
  - `MONGO_URI` — full MongoDB connection string for your database or Atlas cluster
- On successful connection the server uses `products`, `orders`, and `customers` collections.
- There is also a convenience script referenced in `package.json`:

  npm run setup:db

  This script (`scripts/setup-database.js`) can import product data into MongoDB before first run.

- Fallback mode: if the server cannot reach MongoDB it will serve product data from `dist/data/products.json` (if present) and continue to respond to requests. This makes the app resilient for demo or static-hosted deployments.

Deployment to Render
1. Create a new Web Service in Render connected to this repository.
2. Set the build and start commands in Render:

   - Build command: `npm run build`
   - Start command: `npm start`

   Render will run the build command during deploy, producing the `dist/` folder, and then run `npm start` to launch `server.js`.

3. Configure environment variables in the Render dashboard (Environment > Environment Variables):
   - `MONGO_URI` — your MongoDB connection string
   - `PORT` (optional — Render sets a port automatically; the app honors `process.env.PORT`)

4. Create or provision a MongoDB database. Use Atlas, Render Marketplace, or any MongoDB provider and set `MONGO_URI` to the connection string.

5. Database initialization: because `server.js` connects automatically on startup, collections will be available when the app runs. You can also run `npm run setup:db` to import products from `public/data/products.json` before the first deploy.

Notes on Render specifics
- Ensure your service is allowed to reach the managed database (if using private networking, attach the DB to the service or use the provided connection string).
- Use Render's environment variable UI to keep credentials secret.
- If you want the frontend deployed as a static site separately, you can create two Render services: one static site for the built `dist/`, and one web service for the API. The monorepo is already configured to build and serve both from `server.js`.

Useful scripts (from `package.json`)
- `npm run dev` — start Vite for frontend dev
- `npm run build` — build the frontend into `dist/`
- `npm start` — run `node server.js` (starts Express API and serves `dist/`)
- `npm run setup:db` — helper to prepare the database
- `npm run import:products` — import products via scripts/import-products.js

Troubleshooting
- "MongoDB not available, using static data mode": MongoDB credentials are wrong or MongoDB is unreachable — verify `MONGO_URI` and network access. The app will still serve static products from `dist/data/products.json`.
- Cannot see updated products after import: ensure `public/data/products.json` or `dist/data/products.json` is updated and restart the server or rebuild the frontend.
- Production 500s on orders: check MongoDB connectivity and that `orders` collection can be written. The server logs will show errors.

Where to look in this repo
- Server: [server.js](server.js)
- Frontend source: root-level React files and `components/`
- Import and helper scripts: `scripts/` (e.g., `import-products.js`, `setup-database.js`)

Want me to also create a Render blueprint or a sample `render.yaml` for one-click deploy? Reply and I will add it.

---
Generated: improved README with DB and Render hosting guidance.
