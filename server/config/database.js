// server/config/database.js
// Universal MySQL connection pool for SRMS (used across all controllers/routes)

const mysql = require('mysql2/promise');

// Edit these credentials for your local MySQL setup!
const pool = mysql.createPool({
    host: 'localhost',     // Change if your DB is remote
    user: 'root',          // Your MySQL username
    password: '',          // Your MySQL password
    database: 'srms',      // Your DB name from srms.sql
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Optional: Test connection and log status when starting server
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to the database as id ' + connection.threadId);
        connection.release();
    } catch (err) {
        console.error('Error connecting to the database:', err.stack);
    }
})();

module.exports = pool;