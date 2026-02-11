// Preload script: exposes a minimal API for wake-word detection to the renderer.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  onWakeWord: (callback) => {
    if (typeof callback !== "function") return;
    const handler = () => callback();
    ipcRenderer.on("wake-word:detected", handler);
    return () => ipcRenderer.removeListener("wake-word:detected", handler);
  },
  setWakeWordEnabled: (enabled) => {
    ipcRenderer.send("wake-word:setEnabled", enabled);
  },
  getWakeWordState: () => ipcRenderer.invoke("wake-word:getState"),
});
