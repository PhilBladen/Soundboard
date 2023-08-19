const { app, BrowserWindow } = require('electron')
const path = require('path')
try {
    require('electron-reloader')(module)
  } catch (_) {}

  const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    },
    icon: "./icon.png",
    })
  
    // win.setMenu(null)
    win.maximize();
    win.loadFile('index.html')
    // win.show()
  }
  
  app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })