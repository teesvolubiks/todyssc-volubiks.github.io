// Knex.js configuration for MySQL (cPanel royalvol_tody)
// Update with actual .env vars if configured

require('dotenv').config();

module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'royalvol_tody_user', // Update from .env
      password: process.env.DB_PASSWORD || '', // Set in .env
      database: 'royalvol_tody'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    },
    pool: { 
      min: 0, 
      max: 10 
    }
  },

  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'royalvol_tody_user',
      password: process.env.DB_PASSWORD || '',
      database: 'royalvol_tody'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    },
    pool: { 
      min: 0, 
      max: 10 
    }
  }

};

