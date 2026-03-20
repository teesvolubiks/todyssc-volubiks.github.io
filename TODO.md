# Shared Hosting Deployment TODO (www.royalvolubiks.com.ng)

## Current Progress
✅ Vite build configured, .cpanel.yml partial setup exists.

## Troubleshooting 500 Error
- cPanel Error Logs: cPanel > Metrics > Errors (check .htaccess, Node)
- Verify /dist exists after deploy
- Test: curl -I https://www.royalvolubiks.com.ng

## Steps
- [x] ... previous
- [ ] 4. git push, check cPanel deploy log
- [ ] 5. Restart Node app, Apache if available

- [ ] 5. cPanel Git Version Control: Clone to /home2/royalvol/public_html
- [ ] 6. cPanel Node.js: App root /public_html/server, startup server.js
- [ ] 7. phpLiteAdmin for server/data/volubiks.db
- [ ] 8. Test frontend www.royalvolubiks.com.ng, API /api/products

**Target**: Full app live at www.royalvolubiks.com.ng after deploy.
