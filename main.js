const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const distPath = path.join(__dirname, "dist", "index.html");
const hasDist = fs.existsSync(distPath);

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 680,
    backgroundColor: "#050816",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (hasDist) {
    // If dist folder exists, load from there (production build)
    win.loadFile(distPath);
  } else if (isDev) {
    // In development, try to load from Vite dev server
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
    
    // Show error if dev server isn't available
    win.webContents.on('did-fail-load', () => {
      win.webContents.executeJavaScript(`
        document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; font-family: system-ui; text-align: center; padding: 20px;">
          <div>
            <h2>Vite dev server not running</h2>
            <p>Please run: <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">npm run dev</code></p>
            <p>Or build the app first: <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">npm run build</code></p>
          </div>
        </div>'
      `);
    });
  } else {
    // Production but no dist folder
    win.loadFile(distPath).catch(() => {
      win.webContents.executeJavaScript(`
        document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: white; font-family: system-ui; text-align: center; padding: 20px;">
          <div>
            <h2>Build required</h2>
            <p>Please run: <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">npm run build</code></p>
          </div>
        </div>'
      `);
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

