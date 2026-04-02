# Deployment Guide for go54.com

## Prerequisites

Before deploying, you need:
1. A go54.com hosting account with PHP & MySQL support
2. Node.js installed on your local machine
3. Your MySQL database credentials from go54.com control panel

## Step 1: Get MySQL Credentials from go54.com

1. Log in to your go54.com cPanel
2. Look for "MySQL Databases" or "Databases" section
3. Create a new database (e.g., `volubiks`)
4. Create a new user with a strong password
5. Add the user to the database with all privileges
6. Note down these credentials:
   - Database name
   - Database username
   - Database password
   - Host (usually `localhost`)

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=volubiks
   PORT=3000
   ```

## Step 3: Build the Application

On your local machine, run:
```bash
npm install
npm run build
```

This creates a `dist` folder with optimized production files.

## Step 4: Set Up Database

Run the database setup script to create tables and import products:
```bash
node scripts/setup-database.js
```

## Step 5: Upload to go54.com

### Option A: Using File Manager (Easiest)

1. Log in to cPanel → File Manager
2. Navigate to the root folder for your domain (usually `public_html`)
3. Upload all contents from the `dist` folder
4. Upload these additional files:
   - `server.js`
   - `.env` (rename to `.env` if needed)
   - `package.json`
5. Create a folder named `data` in `public_html/data` and upload product images

### Option B: Using FTP/SFTP

1. Connect to your hosting using FTP client (FileZilla)
2. Upload all files from `dist` to `public_html`
3. Upload `server.js`, `.env`, and `package.json` to `public_html`
4. Create `public_html/data/images` folder and upload images

## Step 6: Install Node.js Dependencies on Server

In go54.com cPanel:

1. Go to "Setup Node.js App" or "Node.js Selector"
2. Create a new application:
   - Application Mode: Production
   - Application Root: / (or your domain folder)
   - Application URL: your domain
   - Application Start file: server.js
3. Click Create
4. After creation, click "Run NPM Install"

Or via Terminal (if available):
```bash
cd /path/to/your/domain
npm install
```

## Step 7: Start the Server

1. In cPanel Node.js app settings:
   - Make sure the app is started
   - Set environment variables in the UI

2. Your app should now be accessible at `https://yourdomain.com`

## Troubleshooting

### Port Issues
If port 3000 doesn't work, try port 8080 or the port specified in go54.com Node.js settings.

### Database Connection Error
- Double-check your `.env` credentials
- Make sure the database user has privileges
- Ensure database exists

### Static Files Not Loading
- Make sure all files from `dist` are uploaded
- Check that `data` folder with images exists in correct location

### Common Error Messages

1. **"Cannot find module 'mysql2'"**
   - Run `npm install` on the server

2. **"Access denied for user"**
   - Check DB_USER and DB_PASSWORD in .env

3. **"Unknown database"**
   - Create the database in cPanel first

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Setup database
node scripts/setup-database.js

# Start server
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

