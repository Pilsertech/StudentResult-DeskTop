const db = require('../config/database');
const md5 = require('md5');

exports.login = (req, res) => {
    // --- NEW: Log the incoming request ---
    console.log('Login attempt received.');
    console.log('Request body:', JSON.stringify(req.body));

    const { username, password } = req.body;

    if (!username || !password) {
        console.error('Login failed: Username or password not provided.');
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    const hashedPassword = md5(password);
    console.log(`Attempting to log in user: ${username} with hashed password.`);

    const query = "SELECT UserName, Password FROM admin WHERE UserName = ? AND Password = ?";

    // --- NEW: Log the query before executing ---
    console.log('Executing query:', query.replace('?', `'${username}'`).replace('?', `'${hashedPassword}'`));

    db.query(query, [username, hashedPassword], (err, results) => {
        if (err) {
            // --- NEW: Log the database error ---
            console.error("Database query error:", err.message);
            // This is the error the user is seeing.
            return res.status(500).json({ success: false, message: "An internal server error occurred." });
        }

        // --- NEW: Log the query result ---
        console.log(`Query finished. Number of results: ${results.length}`);

        if (results.length > 0) {
            console.log(`Login successful for user: ${username}`);
            res.json({ success: true, message: "Login successful" });
        } else {
            console.log(`Login failed for user: ${username}. Invalid credentials.`);
            res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    });
};