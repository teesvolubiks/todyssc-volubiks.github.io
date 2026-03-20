# Backend Integration & Deployment Plan
Status: Approved. DB: `royalvol_tody`

## Steps (Completed ✓ / Pending ☐)

### 1. Create Backend Structure ✅
- [✅] `server/server.js` (Express + MySQL)
- [✅] `server/package.json` (deps)
- [✅] `server/.env` (creds)
- [✅] DB Schema (products, orders, customers)

### 2. Migrate Data ✅
- [✅] `scripts/migrate-data.js`
- [✅] Ready to run: `cd scripts && node migrate-data.js` (needs server deps installed)

### 3. Update Frontend ✅
 - [✅] InventoryManagement.jsx → /api/products
 - [✅] OrderManagement.jsx → /api/orders
 - [✅] CustomerManagement.jsx → /api/customers
 - [ ] vite.config.js (proxy)
- [✅] Overview/Analytics (updated)
 - [ ] vite.config.js (proxy) → production update later

### 4. Deploy ☐
- [ ] Build frontend
- [ ] Setup DB via phpMyAdmin
- [ ] Upload to hosting
- [ ] Test APIs

### 5. Verify ☐
- [ ] Frontend calls APIs
- [ ] Dashboard CRUD works
- [ ] Update DNS if needed

Progress tracked here. Next: Step 1.
