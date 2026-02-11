require("dotenv").config();

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const distPath = path.join(__dirname, "dist", "index.html");
const hasDist = fs.existsSync(distPath);

/** @type {Electron.BrowserWindow | null} */
let mainWindow = null;

// Wake word: Porcupine + PvRecorder (runs in main process, sends IPC on detection)
const PICOVOICE_ACCESS_KEY = process.env.PICOVOICE_ACCESS_KEY || "";
let wakeWordEnabled = true;
let wakeWordLoopId = null;
let wakeWordPorcupine = null;
let wakeWordRecorder = null;

async function startWakeWordLoop() {
  if (!PICOVOICE_ACCESS_KEY || !mainWindow || wakeWordLoopId !== null) return;
  try {
    const { Porcupine, BuiltinKeyword, getBuiltinKeywordPath } = require("@picovoice/porcupine-node");
    const { PvRecorder } = require("@picovoice/pvrecorder-node");

    const keywordPath = getBuiltinKeywordPath(BuiltinKeyword.JARVIS);
    // Sensitivity 0–1: higher = more triggers, more false positives. 0.65 works well for "Jarvis"
    const sensitivity = 0.65;
    wakeWordPorcupine = new Porcupine(PICOVOICE_ACCESS_KEY, [keywordPath], [sensitivity]);
    const frameLength = wakeWordPorcupine.frameLength;
    wakeWordRecorder = new PvRecorder(frameLength, -1);
    wakeWordRecorder.start();

    const deviceName = wakeWordRecorder.getSelectedDevice();
    console.log("[Wake word] Listening for \"Jarvis\" on mic:", deviceName || "default");

    async function readAndProcess() {
      if (wakeWordLoopId === null) return;
      try {
        const pcm = await wakeWordRecorder.read();
        const index = wakeWordPorcupine.process(pcm);
        if (index !== -1 && mainWindow && !mainWindow.isDestroyed()) {
          console.log("[Wake word flow] 1. main: detected, notifying renderer");
          mainWindow.webContents.send("wake-word:detected");
          // Fallback: inject into renderer so we don't rely on IPC (IPC can fail to reach preload in some setups)
          mainWindow.webContents
            .executeJavaScript("window.dispatchEvent(new CustomEvent('wake-word-detected'))")
            .catch(() => {});
        }
      } catch (e) {
        if (wakeWordLoopId !== null) console.error("Wake word loop error:", e);
      }
      if (wakeWordLoopId !== null) {
        wakeWordLoopId = setTimeout(readAndProcess, 0);
      }
    }
    wakeWordLoopId = setTimeout(readAndProcess, 0);
  } catch (err) {
    console.error("Wake word init failed (missing PICOVOICE_ACCESS_KEY?):", err.message);
  }
}

function stopWakeWordLoop() {
  if (wakeWordLoopId !== null) {
    clearTimeout(wakeWordLoopId);
    wakeWordLoopId = null;
  }
  if (wakeWordRecorder) {
    try {
      wakeWordRecorder.release();
    } catch (e) {
      // ignore
    }
    wakeWordRecorder = null;
  }
  if (wakeWordPorcupine) {
    try {
      wakeWordPorcupine.release();
    } catch (e) {
      // ignore
    }
    wakeWordPorcupine = null;
  }
}

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

  mainWindow = win;

  win.on("closed", () => {
    stopWakeWordLoop();
    mainWindow = null;
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

ipcMain.handle("wake-word:getState", () => ({
  enabled: wakeWordEnabled,
  available: Boolean(PICOVOICE_ACCESS_KEY),
}));

ipcMain.on("wake-word:setEnabled", (_, enabled) => {
  wakeWordEnabled = Boolean(enabled);
  if (wakeWordEnabled && PICOVOICE_ACCESS_KEY) {
    startWakeWordLoop();
  } else {
    stopWakeWordLoop();
  }
});

app.whenReady().then(() => {
  createWindow();
  if (wakeWordEnabled && PICOVOICE_ACCESS_KEY) {
    startWakeWordLoop();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      if (wakeWordEnabled && PICOVOICE_ACCESS_KEY) {
        startWakeWordLoop();
      }
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

