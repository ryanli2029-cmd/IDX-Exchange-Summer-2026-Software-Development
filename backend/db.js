const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a reusable connection pool using our .env configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Max concurrent connections allowed
  queueLimit: 0
});

module.exports = pool;