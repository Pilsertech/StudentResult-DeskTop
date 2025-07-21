const db = require('../config/database');
const md5 = require('md5');

// Your existing login method (keeping it as is)
exports.login = async (req, res) => {
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

    try {
        const [results] = await db.execute(query, [username, hashedPassword]);
        // --- NEW: Log the query result ---
        console.log(`Query finished. Number of results: ${results.length}`);

        if (results.length > 0) {
            console.log(`Login successful for user: ${username}`);
            res.json({ success: true, message: "Login successful" });
        } else {
            console.log(`Login failed for user: ${username}. Invalid credentials.`);
            res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    } catch (err) {
        // --- NEW: Log the database error ---
        console.error("Database query error:", err.message);
        res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
};

// NEW: Change password method (matching your PHP exactly)
exports.changePassword = async (req, res) => {
    console.log('Change password attempt received.');
    console.log('Request body:', JSON.stringify(req.body));

    const { currentPassword, newPassword, username } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !username) {
        console.error('Change password failed: Missing required fields.');
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        // Hash current password using MD5 (matching PHP)
        const hashedCurrentPassword = md5(currentPassword);
        console.log(`Verifying current password for user: ${username}`);

        // Verify current password (exact same query as PHP)
        const checkQuery = 'SELECT Password FROM admin WHERE UserName = ? AND Password = ?';
        console.log('Executing verification query:', checkQuery.replace('?', `'${username}'`).replace('?', `'${hashedCurrentPassword}'`));
        
        const [results] = await db.execute(checkQuery, [username, hashedCurrentPassword]);
        console.log(`Verification query finished. Number of results: ${results.length}`);

        if (results.length === 0) {
            console.log(`Current password verification failed for user: ${username}`);
            return res.json({
                success: false,
                message: 'Your current password is wrong'
            });
        }

        // Hash new password using MD5 (matching PHP)
        const hashedNewPassword = md5(newPassword);
        console.log(`Updating password for user: ${username}`);

        // Update password (exact same query as PHP)
        const updateQuery = 'UPDATE admin SET Password = ? WHERE UserName = ?';
        console.log('Executing update query:', updateQuery.replace('?', `'${hashedNewPassword}'`).replace('?', `'${username}'`));
        
        const [updateResult] = await db.execute(updateQuery, [hashedNewPassword, username]);
        console.log(`Update query finished. Affected rows: ${updateResult.affectedRows}`);

        if (updateResult.affectedRows > 0) {
            console.log(`Password changed successfully for user: ${username}`);
            res.json({
                success: true,
                message: 'Your Password succesfully changed' // Exact same message as PHP (with typo)
            });
        } else {
            console.log(`Password update failed for user: ${username}`);
            res.json({
                success: false,
                message: 'Password update failed'
            });
        }
    } catch (error) {
        console.error('Database error during password change:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// NEW: Get admin profile (optional, for future use)
exports.getProfile = async (req, res) => {
    console.log('Get profile request received.');
    
    const { username } = req.query;
    
    if (!username) {
        return res.status(400).json({
            success: false,
            message: 'Username is required'
        });
    }

    try {
        const query = 'SELECT UserName, Email, updationDate FROM admin WHERE UserName = ?';
        console.log('Executing profile query:', query.replace('?', `'${username}'`));
        
        const [results] = await db.execute(query, [username]);
        console.log(`Profile query finished. Number of results: ${results.length}`);

        if (results.length > 0) {
            console.log(`Profile retrieved successfully for user: ${username}`);
            res.json({
                success: true,
                profile: results[0]
            });
        } else {
            console.log(`Profile not found for user: ${username}`);
            res.json({
                success: false,
                message: 'Admin not found'
            });
        }
    } catch (error) {
        console.error('Database error during profile fetch:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database error occurred'
        });
    }
};