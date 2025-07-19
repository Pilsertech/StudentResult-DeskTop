// electron-app/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loginSuccessful: () => ipcRenderer.send('login-successful'),
  // NEW: Expose the stop-server function
  stopServer: () => ipcRenderer.send('stop-server')
});