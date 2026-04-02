# Deployment Completion Plan - Fix 500/502 Errors & Go Live

Status: Approved with 500/502 focus. DB: MySQL preferred (royalvol_tody). Tracked progress here.

## Logical Steps (Completed ✓ / Pending ☐)

### 1. Local Setup & Test ✅ (AI handles)
- [ ] Install server deps
- [ ] Migrate data to local SQLite
- [ ] Run full stack (npm start)
- [ ] Test APIs/dashboard locally

### 2. Code Updates for Production (AI handles)
- [ ] server/server.js: Integrate knex/MySQL for prod (env-based)
- [ ] .cpanel.yml: Ensure Node/build support
- [ ] public_html/.htaccess: Fix 500/502 (proxy Node, static assets)

### 3. Build & Git Deploy (AI + User)
- [ ] npm run build
- [ ] git add/commit/push (triggers cPanel Git if setup)

### 4. cPanel Hosting Setup (User actions, AI guides)
- [ ] Git Version Control: Clone repo to /home2/royalvol/public_html
- [ ] Node.js App: Root=/public_html/server, startup=server.js (npm i deps)
- [ ] phpMyAdmin: Create royalvol_tody DB/tables (run knex migrate), import products
- [ ] Build frontend in cPanel terminal: cd /home2/royalvol/public_html && npm i && npm run build
- [ ] Restart Node app & Apache

### 5. Fix 500/502 Errors
- [ ] Check cPanel Error Logs (Metrics > Errors)
- [ ] Common fixes: .htaccess (no conflicts), Node port (use process.env.PORT), DB creds, permissions 755/644
- [ ] Test /api/products, curl site

### 6. Verify Live
- [ ] www.royalvolubiks.com.ng loads
- [ ] Dashboard CRUD via APIs
- [ ] Mark all TODOs complete

**Next**: AI completes step 1-2. User: Confirm cPanel Git/Node setup status. Run `npm run start` locally to test.
