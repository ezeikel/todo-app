const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // load webpack app during development
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:9000');
    // DEBUG
    // mainWindow.webContents.openDevTools();
  } else {
    // load the local HTML file in production
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
