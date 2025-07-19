const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'srms'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Successfully connected to the database as id ' + connection.threadId);
});

module.exports = connection;