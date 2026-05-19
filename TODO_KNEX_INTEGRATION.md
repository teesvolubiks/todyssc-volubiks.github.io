# Knex Integration TODO Breakdown

## Approved Plan Steps (from TODO.md)
1. [x] Create TODO.md with approved plan breakdown → This file ✓
2. [x] Check/install dependencies (knex, mysql2 in server/) → Confirmed in server/package.json
3. [x] Refactor server/server-mysql.js to use Knex + knexfile.js
4. [ ] Update server/server.js to use Knex/MySQL setup  
5. [ ] Test server startup and /api/health
6. [ ] Add knex migrations for tables
7. [ ] Update TODO.md and attempt_completion

## Detailed Execution Steps
- **Step 3**: read_file server/server-mysql.js → edit_file to replace mysql2 with knex (import knex from 'knex', require('./knexfile'), knex(config)[env], convert all queries to knex methods: knex('table').select(), insert(), etc. Handle JSON fields properly. Update ensureTables to knex.schema.
- **Step 4**: read_file server/server.js → edit_file to import/use knex-mysql version (e.g., require('./server-mysql.js') or set DB_TYPE=mysql).
- **Step 5**: execute_command `cd server && npm start` → test curl localhost:3000/api/health, /api/products.
- **Step 6**: knex migrate:make init_tables → implement up/down migrations matching schema.
- **Step 7**: Update main TODO.md (mark complete), attempt_completion.

Progress will be updated here after each step.

