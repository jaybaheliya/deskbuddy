const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("deskBuddy", {
  close: () => ipcRenderer.send("deskbuddy:close"),
  minimize: () => ipcRenderer.send("deskbuddy:minimize"),
  showPanel: () => ipcRenderer.send("deskbuddy:show-panel"),
  hidePanel: () => ipcRenderer.send("deskbuddy:hide-panel"),
  togglePanel: () => ipcRenderer.send("deskbuddy:toggle-panel"),
  toggleMascot: () => ipcRenderer.send("deskbuddy:toggle-mascot"),
  setWalking: (enabled) => ipcRenderer.send("deskbuddy:set-walking", enabled),
  setAlwaysOnTop: (alwaysOnTop) => ipcRenderer.send("deskbuddy:set-always-on-top", alwaysOnTop),
  startVisit: (options) => ipcRenderer.send("deskbuddy:start-visit", options),
  exitVisit: () => ipcRenderer.send("deskbuddy:exit-visit"),
  setRoute: (route) => ipcRenderer.send("deskbuddy:set-route", route),
  setStayDuration: (seconds) => ipcRenderer.send("deskbuddy:set-stay-duration", seconds),
  triggerNotification: (title, body) =>
    ipcRenderer.send("deskbuddy:notification", { title, body }),
  sendAction: (action) => ipcRenderer.send("deskbuddy:action", action),
  onAction: (callback) => {
    const subscription = (_event, action) => callback(action);
    ipcRenderer.on("deskbuddy:action", subscription);
    return () => ipcRenderer.removeListener("deskbuddy:action", subscription);
  },
  getScreenWorkArea: () => ipcRenderer.invoke("deskbuddy:get-work-area"),
  getWindowPosition: () => ipcRenderer.invoke("deskbuddy:get-position"),
  setWindowPosition: (x, y) => ipcRenderer.send("deskbuddy:set-position", { x, y })
});
