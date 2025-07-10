const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  ssl: {
    rejectUnauthorized: false // Required for Render or Railway
  }
});

// Optional: Connection status logs
pool.on('connect', () => {
  console.log(` PostgreSQL connected on ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`);
});

pool.on('error', (err) => {
  console.error(' Unexpected error on PostgreSQL client:', err);
  process.exit(-1);
});

module.exports = pool;
