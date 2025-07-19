// --- ELECTRON MODULES ---
// Import all necessary modules from the Electron library.
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// --- GLOBAL VARIABLES ---
// These hold references to our server process and application windows.
let serverProcess;
let loginWindow;
let dashboardWindow;

// --- SERVER MANAGEMENT ---
// This function starts the Node.js server.
function startServer() {
    if (serverProcess) {
        console.log('Server process is already running.');
        return;
    }
    console.log('Spawning server process...');
    serverProcess = spawn('node', [path.join(__dirname, '..', 'server', 'app.js')]);

    serverProcess.stdout.on('data', (data) => {
        console.log(`Server stdout: ${data}`);
        if (data.toString().includes('SERVER_READY')) {
            if (!loginWindow || loginWindow.isDestroyed()) {
                createLoginWindow();
            }
        }
    });
    serverProcess.stderr.on('data', (data) => { console.error(`Server stderr: ${data}`); });
    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        serverProcess = null;
    });
}

// This function stops the server.
ipcMain.on('stop-server', async () => {
    console.log('IPC: Received stop-server signal.');
    if (!serverProcess) return;
    try {
        await fetch('http://localhost:9000/shutdown', { method: 'POST' });
    } catch (error) {
        if (serverProcess) serverProcess.kill('SIGKILL');
    }
});

// --- WINDOW MANAGEMENT ---
// This function creates the login window.
function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });
    loginWindow.loadFile('renderer/pages/login/login.html');
    loginWindow.webContents.openDevTools();
    loginWindow.on('closed', () => { loginWindow = null; });
}

// This function creates the dashboard window.
function createDashboardWindow() {
    dashboardWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    dashboardWindow.loadFile('renderer/pages/dashboard/dashboard.html');
    dashboardWindow.webContents.openDevTools();
    dashboardWindow.on('closed', () => { dashboardWindow = null; });
}

// --- IPC EVENT LISTENERS ---
// This handles the transition from login to dashboard.
ipcMain.on('login-successful', () => {
    console.log('IPC: Login successful! Switching to dashboard.');
    createDashboardWindow();
    if (loginWindow) {
        loginWindow.close();
    }
});

// --- APP LIFECYCLE EVENTS ---
// This runs when the app is ready.
app.whenReady().then(() => {
    // THIS IS THE CORRECTED CONTENT SECURITY POLICY FROM THE REPORT
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                    // FIX: Allows loading stylesheets from Google Fonts.
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    // FIX: Allows loading font files from Google's static hosting.
                    "font-src 'self' data: https://fonts.gstatic.com",
                    "connect-src http://localhost:9000 devtools://*"
                ].join('; ')
            }
        });
    });
    startServer();
});

// This handles quitting the app on Windows & Linux.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (serverProcess) {
            ipcMain.emit('stop-server');
        }
        app.quit();
    }
});

// This handles re-creating a window on macOS.
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        startServer();
    }
});
