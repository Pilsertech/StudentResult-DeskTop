// --- DISABLE BACKGROUND THROTTLING (ensures canvas/particles always animate) ---
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// These MUST be before app.whenReady()
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

// --- GLOBAL VARIABLES ---
let serverProcess;
let loginWindow;
let dashboardWindow;

// --- SERVER MANAGEMENT ---
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
function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false // <-- This is crucial for particles.js to always animate!
        }
    });
    loginWindow.loadFile('renderer/pages/login/login.html');
    // Removed auto-open DevTools for better user experience
    loginWindow.on('closed', () => { loginWindow = null; });
}

function createDashboardWindow() {
    dashboardWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false // <-- For consistency if you use canvas animations
        },
    });
    dashboardWindow.loadFile('renderer/pages/dashboard/dashboard.html');
    // Removed auto-open DevTools for better user experience
    dashboardWindow.on('closed', () => { dashboardWindow = null; });
}

// --- IPC EVENT LISTENERS ---
ipcMain.on('login-successful', () => {
    console.log('IPC: Login successful! Switching to dashboard.');
    createDashboardWindow();
    if (loginWindow) {
        loginWindow.close();
    }
});

// --- APP LIFECYCLE EVENTS ---
app.whenReady().then(() => {
    // --- CONTENT SECURITY POLICY (CSP) ---
    // The CSP here is designed to:
    // - Allow Google Fonts (CSS + font files)
    // - Permit images from the app and data URIs (base64)
    // - Permit inline scripts/styles (for legacy JS like jQuery)
    // - Allow connections to the local server and devtools
    // WARNING: 'unsafe-eval' and 'unsafe-inline' are insecure and should be removed for production if possible.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'",
                    // WARNING: 'unsafe-eval' and 'unsafe-inline' are insecure. Remove if possible for production.
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' data: https://fonts.gstatic.com",
                    "img-src 'self' data:", // Allow images from app and base64/data URIs
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