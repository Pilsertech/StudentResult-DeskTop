const mysql = require('mysql2/promise');

// Database configuration for SRMS - FIXED
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'srms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // REMOVED invalid options that caused warnings
    multipleStatements: true,
    dateStrings: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Enhanced connection test
async function testConnection() {
    try {
        console.log('🔄 Testing database connection...');
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully (Thread ID: ' + connection.threadId + ')');
        
        // Test basic query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Database query test successful');
        
        // Test if required tables exist
        const tables = ['tblclasses', 'tblstudents', 'tblsubjects', 'tblsubjectcombination', 'tblresult'];
        for (const table of tables) {
            try {
                const [tableRows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`✅ Table "${table}" exists with ${tableRows[0].count} records`);
            } catch (tableError) {
                console.error(`❌ Table "${table}" not found:`, tableError.message);
            }
        }
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('📋 Please check:');
        console.error('   - MySQL server is running');
        console.error('   - Database "srms" exists');
        console.error('   - Username and password are correct');
        return false;
    }
}

// Auto-test connection on startup
testConnection();

// Wrapper function with better error handling
async function executeQuery(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return [results];
    } catch (error) {
        console.error('❌ SQL Query Error:', error.message);
        console.error('📋 SQL:', sql);
        console.error('📋 Params:', params);
        throw error;
    }
}

module.exports = {
    execute: executeQuery,
    getConnection: () => pool.getConnection(),
    testConnection,
    pool
};