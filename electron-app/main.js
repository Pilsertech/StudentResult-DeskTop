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
            backgroundThrottling: false, // <-- This is crucial for particles.js to always animate!
            webSecurity: true, // Keep security enabled
            allowRunningInsecureContent: false // Keep secure
        }
    });
    loginWindow.loadFile('renderer/pages/login/index.html');
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
            backgroundThrottling: false, // <-- For consistency if you use canvas animations
            webSecurity: true, // Keep security enabled
            allowRunningInsecureContent: false // Keep secure
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
    // --- ENHANCED CONTENT SECURITY POLICY (CSP) FOR ELECTRON WITH FILE LOADING ---
    // This CSP is specifically designed for Electron apps that need to:
    // - Load local files (includes folder) ✅
    // - Use jQuery and legacy JavaScript ✅  
    // - Connect to local server ✅
    // - Load Google Fonts ✅
    // - Support Bootstrap and Font Awesome ✅
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    // Default source: allow self and file protocol for local includes
                    "default-src 'self' file: data: blob:",
                    
                    // Scripts: Allow self, inline scripts (for jQuery/Bootstrap), eval (for some legacy libs), and file protocol
                    // NOTE: 'unsafe-inline' and 'unsafe-eval' are needed for jQuery, Bootstrap, and legacy code
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' file: data: blob:",
                    
                    // Styles: Allow self, inline styles, file protocol, and Google Fonts
                    "style-src 'self' 'unsafe-inline' file: data: blob: https://fonts.googleapis.com",
                    
                    // Fonts: Allow self, data URIs, file protocol, and Google Fonts
                    "font-src 'self' data: file: blob: https://fonts.gstatic.com",
                    
                    // Images: Allow self, data URIs, file protocol, and blob
                    "img-src 'self' data: file: blob:",
                    
                    // Network connections: Allow local server and DevTools
                    "connect-src 'self' http://localhost:9000 ws://localhost:9000 file: data: devtools://*",
                    
                    // Media: Allow self and file protocol
                    "media-src 'self' file: data: blob:",
                    
                    // Object/Embed: Restrict for security
                    "object-src 'none'",
                    
                    // Base URI: Only self
                    "base-uri 'self'",
                    
                    // Form actions: Only self and local server
                    "form-action 'self' http://localhost:9000"
                ].join('; ')
            }
        });
    });
    
    console.log('🔒 Enhanced CSP configured for Electron file loading');
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