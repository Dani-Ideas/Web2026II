const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'fleetops',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fleetops_db',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
