const { app, BrowserWindow } = require('electron')
try {
    require('electron-reloader')(module)
  } catch (_) {}

  const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      
    })
  
    // win.setMenu(null)
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