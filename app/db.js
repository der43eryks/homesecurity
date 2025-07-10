const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  ssl: process.env.DB_SSL === 'true' // Optional: set DB_SSL=true if SSL is required
});

pool.on('connect', () => {
  console.log(`PostgreSQL connected successfully on ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client:', err);
  process.exit(-1);
});

//force a query for test on start up to check if the coection is successful 

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('PostgreSQL connection failed:', err);
  } else {
    console.log('PostgreSQL connected successfully:', res.rows[0]);
  }
});

module.exports = pool; 