// --- DEPENDENCIES ---
// Import all necessary Node.js modules for the server.
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const classRoutes = require('./routes/classRoutes'); // <-- ADDED: Class CRUD routes
const subjectRoutes = require('./routes/subjectRoutes');
const studentRoutes = require('./routes/studentRoutes');
const resultRoutes = require('./routes/resultRoutes');

// --- INITIALIZATION ---
const app = express();
// This is the correct port for our application.
const PORT = 9000;

// --- LOGGING SETUP ---
// This section configures the server.log file for debugging.
const logFilePath = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

console.log = function(d) {
    const message = new Date().toISOString() + ' - ' + d + '\n';
    logStream.write(message);
    process.stdout.write(message);
};

console.error = function(d) {
    const message = new Date().toISOString() + ' - ERROR: ' + d + '\n';
    logStream.write(message);
    process.stderr.write(message);
};

// --- MIDDLEWARE ---
// Configures the Express server to handle requests.
app.use(cors()); // Allows communication from the Electron app.
app.use(express.json()); // Parses incoming JSON data.
app.use(express.urlencoded({ extended: true }));

// --- API ROUTES ---
// Registers the route files for different parts of the application.
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/classes', classRoutes); // <-- ADDED: Class CRUD endpoints
app.use('/subjects', subjectRoutes);
app.use('/students', studentRoutes);
app.use('/api/results', resultRoutes);


// Log all incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// --- SHUTDOWN ROUTE ---
// The special endpoint that Electron calls to safely stop the server.
app.post('/shutdown', (req, res) => {
    console.log('Shutdown signal received. Server is closing.');
    res.send('Server is shutting down.');
    process.exit(0);
});

// --- SERVER START ---
// Starts the server and listens for requests on our specified port.
const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
    // This message signals to Electron that it's safe to create the app window.
    console.log('SERVER_READY');
});

console.log(`Log file is active at: ${logFilePath}`);

// --- GRACEFUL SHUTDOWN ---
// Ensures the server closes cleanly if the process is terminated.
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});