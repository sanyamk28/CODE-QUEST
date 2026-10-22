const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Code Quest',
    backgroundColor: '#070a13',
    icon: path.join(__dirname, '../frontend/public/icon-512.svg'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  const devUrl = 'http://localhost:5173';
  mainWindow.loadURL(devUrl).catch(() => {
    // If dev server not running, load built index.html
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  });

  // Guard navigation: prevent redirects to untrusted external sites within the electron frame
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.protocol !== 'file:') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } catch {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
