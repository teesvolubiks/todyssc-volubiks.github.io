# npm start Fix: Switch to SQLite Backend

Status: In progress

## Steps:
1. [x] Backup server/server.js → server-mysql.js 
2. [x] Replace server/server.js with server-sqlite.js content 
3. [ ] Run `cd server && npm install`
4. [ ] Test `cd server && npm start` 
5. [ ] Migrate data: `curl -X POST http://localhost:3000/api/migrate`
6. [ ] Update root scripts if needed
7. [ ] Frontend connects OK

## Why:
server.js used MySQL without deps/env. server-sqlite.js uses local SQLite (matches package.json deps).

Run commands in new terminal.
