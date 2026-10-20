const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  screen,
  powerMonitor,
  Notification
} = require("electron");
const path = require("node:path");

let panelWindow = null;
let mascotWindow = null;
let tray = null;

// Visit and Movement Engine State
let currentRoute = "bottom"; // 'bottom' | 'right' | 'left' | 'top'
let stayDurationSeconds = 20; // default 20s
let stayOnScreenAlways = false;
let isPaused = false;
let currentHabitState = "drinking";
let animTimer = null;
let stayTimer = null;
let isVisiting = false;

// 32x32 SVG Tray Icon
const TRAY_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0f172a"/>
  <circle cx="16" cy="16" r="11" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="11" cy="15" r="2.5" fill="#f8fafc"/>
  <circle cx="21" cy="15" r="3.5" fill="#00f2fe"/>
  <circle cx="21" cy="15" r="1.5" fill="#ffffff"/>
  <path d="M12 21 Q16 25 20 21" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>
`;

function getTrayImage() {
  try {
    const img = nativeImage.createFromBuffer(Buffer.from(TRAY_ICON_SVG));
    return img.resize({ width: 16, height: 16 });
  } catch {
    return nativeImage.createEmpty();
  }
}

function createPanelWindow() {
  if (panelWindow && !panelWindow.isDestroyed()) {
    panelWindow.show();
    panelWindow.focus();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  panelWindow = new BrowserWindow({
    width: 360,
    height: 570,
    minWidth: 320,
    minHeight: 460,
    x: Math.max(0, width - 400),
    y: Math.max(0, Math.floor((height - 590) / 2)),
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    autoHideMenuBar: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  panelWindow.setAlwaysOnTop(true, "floating");

  if (app.isPackaged) {
    panelWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
      hash: "panel"
    });
  } else {
    panelWindow.loadURL("http://127.0.0.1:5173/#panel");
  }

  panelWindow.on("closed", () => {
    panelWindow = null;
  });
}

function createMascotWindow() {
  if (mascotWindow && !mascotWindow.isDestroyed()) {
    mascotWindow.show();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  const winW = 280;
  const winH = 340;

  // Initial placement resting on the base of the bottom screen flush with taskbar
  const initX = Math.max(20, workArea.x + workArea.width - winW - 20);
  const initY = Math.max(20, workArea.y + workArea.height - winH);

  mascotWindow = new BrowserWindow({
    width: winW,
    height: winH,
    x: initX,
    y: initY,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mascotWindow.setAlwaysOnTop(true, "screen-saver");

  if (app.isPackaged) {
    mascotWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
      hash: "mascot"
    });
  } else {
    mascotWindow.loadURL("http://127.0.0.1:5173/#mascot");
  }

  mascotWindow.on("closed", () => {
    mascotWindow = null;
  });
}

function ensureMascotVisible() {
  if (!mascotWindow || mascotWindow.isDestroyed()) {
    createMascotWindow();
  } else if (!mascotWindow.isVisible()) {
    mascotWindow.show();
  }
}

/**
 * Broadcast an action across all windows EXCEPT the sender,
 * completely preventing recursive IPC infinite ping-pong loops!
 */
function broadcastAction(action, senderWebContents = null) {
  if (panelWindow && !panelWindow.isDestroyed()) {
    if (!senderWebContents || panelWindow.webContents !== senderWebContents) {
      panelWindow.webContents.send("deskbuddy:action", action);
    }
  }
  if (mascotWindow && !mascotWindow.isDestroyed()) {
    if (!senderWebContents || mascotWindow.webContents !== senderWebContents) {
      mascotWindow.webContents.send("deskbuddy:action", action);
    }
  }
}

// -------------------------------------------------------------
// Desktop Visit Route Engine (Enter, Stay 20s, Exit Along Same Route)
// -------------------------------------------------------------
function getRouteCoordinates(route = currentRoute) {
  const display = screen.getPrimaryDisplay();
  const { workArea } = display;
  const winW = 280;
  const winH = 340;

  // On-screen resting position flush on the base of the bottom screen
  const targetX = Math.max(20, workArea.x + workArea.width - winW - 20);
  const targetY = Math.max(20, workArea.y + workArea.height - winH);

  let offX = workArea.x + workArea.width + 30; // default right entrance
  let offY = targetY;
  let enterDir = "left";
  let exitDir = "right";

  if (route === "left") {
    offX = workArea.x - winW - 30;
    offY = targetY;
    enterDir = "right";
    exitDir = "left";
  } else if (route === "top") {
    offX = targetX;
    offY = workArea.y - winH - 30;
    enterDir = "right";
    exitDir = "right";
  } else if (route === "bottom") {
    offX = targetX;
    offY = workArea.y + workArea.height + 30;
    enterDir = "right";
    exitDir = "right";
  } else {
    // right
    offX = workArea.x + workArea.width + 30;
    offY = targetY;
    enterDir = "left";
    exitDir = "right";
  }

  return { targetX, targetY, offX, offY, enterDir, exitDir };
}

function clearAnimation() {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }
  if (stayTimer) {
    clearTimeout(stayTimer);
    stayTimer = null;
  }
}

/**
 * Smooth window glide at 30fps with cubic ease-out.
 * Zero CPU spikes, butter-smooth Windows DWM transitions.
 */
function animateWindowMove(fromX, fromY, toX, toY, durationMs, onComplete) {
  clearAnimation();
  if (!mascotWindow || mascotWindow.isDestroyed()) return;

  const startTime = Date.now();
  animTimer = setInterval(() => {
    if (!mascotWindow || mascotWindow.isDestroyed()) {
      clearAnimation();
      return;
    }

    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / durationMs);

    // Smooth cubic deceleration (ease-out)
    const ease = 1 - Math.pow(1 - progress, 3);
    const curX = fromX + (toX - fromX) * ease;
    const curY = fromY + (toY - fromY) * ease;

    try {
      mascotWindow.setPosition(Math.round(curX), Math.round(curY));
    } catch {
      // safe fallback if window is being dragged
    }

    if (progress >= 1) {
      clearAnimation();
      try {
        mascotWindow.setPosition(Math.round(toX), Math.round(toY));
      } catch {}
      if (onComplete) onComplete();
    }
  }, 33);
}

function startDeskBuddyVisit(options = {}) {
  if (isPaused) return;

  if (!mascotWindow || mascotWindow.isDestroyed()) {
    createMascotWindow();
  }

  const route = options.route || currentRoute;
  const staySec = options.staySeconds || stayDurationSeconds || 20;
  const habitState = options.habitState || currentHabitState;
  const coords = getRouteCoordinates(route);
  currentHabitState = habitState;

  // If mascot is ALREADY visible on desktop:
  // NEVER teleport or drop down offscreen! Stay firmly on base of screen!
  if (mascotWindow.isVisible()) {
    clearAnimation();
    mascotWindow.setPosition(coords.targetX, coords.targetY);

    broadcastAction({
      type: "reminder:trigger",
      payload: {
        mascotState: habitState,
        reminder: options.reminder,
        message: options.message,
        character: options.character,
        staySeconds: staySec
      }
    }, null);
    return;
  }

  // Window was closed/hidden: glide in from offscreen
  isVisiting = true;
  mascotWindow.setPosition(coords.offX, coords.offY);
  mascotWindow.show();

  broadcastAction({
    type: "reminder:trigger",
    payload: {
      mascotState: "walking",
      direction: coords.enterDir,
      character: options.character
    }
  }, null);

  // Glide onto desktop (1.1 seconds)
  animateWindowMove(coords.offX, coords.offY, coords.targetX, coords.targetY, 1100, () => {
    broadcastAction({
      type: "reminder:trigger",
      payload: {
        mascotState: habitState,
        reminder: options.reminder,
        message: options.message,
        character: options.character,
        staySeconds: staySec
      }
    }, null);
  });
}

function exitDeskBuddyVisit(route = currentRoute) {
  if (!mascotWindow || mascotWindow.isDestroyed()) return;
  clearAnimation();

  const coords = getRouteCoordinates(route);
  const [curX, curY] = mascotWindow.getPosition();

  // Natural exit: glide horizontally offscreen to the right, NEVER sinking through the floor!
  const display = screen.getPrimaryDisplay();
  const exitX = display.workArea.x + display.workArea.width + 30;
  const exitY = coords.targetY;

  broadcastAction({
    type: "reminder:trigger",
    payload: {
      mascotState: "walking",
      direction: "right"
    }
  }, null);

  animateWindowMove(curX, curY, exitX, exitY, 1100, () => {
    isVisiting = false;
    try {
      mascotWindow.hide();
    } catch {}
    broadcastAction({ type: "reminder:clear" }, null);
  });
}

function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "✦ DeskBuddy Health Companion",
      enabled: false
    },
    { type: "separator" },
    {
      label: "Open Control Panel",
      click: () => {
        if (!panelWindow) createPanelWindow();
        else {
          panelWindow.show();
          panelWindow.focus();
        }
      }
    },
    {
      label: "✦ Summon Mascot (Visit 20s)",
      click: () => {
        startDeskBuddyVisit({
          route: currentRoute,
          staySeconds: stayDurationSeconds,
          habitState: "drinking"
        });
      }
    },
    {
      label: mascotWindow && mascotWindow.isVisible() ? "Hide Mascot" : "Show Mascot",
      click: () => {
        if (!mascotWindow) {
          createMascotWindow();
        } else if (mascotWindow.isVisible()) {
          mascotWindow.hide();
        } else {
          mascotWindow.show();
        }
        updateTrayMenu();
      }
    },
    {
      label: isPaused ? "▶ Resume Reminders" : "⏸ Pause Reminders",
      click: () => {
        isPaused = !isPaused;
        broadcastAction({
          type: "settings:toggle-pause",
          payload: { paused: isPaused }
        });
        updateTrayMenu();
      }
    },
    { type: "separator" },
    {
      label: "Quit DeskBuddy",
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function createTray() {
  const icon = getTrayImage();
  tray = new Tray(icon);
  tray.setToolTip("DeskBuddy — Developer Wellness Companion");

  updateTrayMenu();

  tray.on("double-click", () => {
    if (!panelWindow) createPanelWindow();
    else {
      if (panelWindow.isVisible()) panelWindow.hide();
      else {
        panelWindow.show();
        panelWindow.focus();
      }
    }
  });
}

// -------------------------------------------------------------
// IPC Handlers
// -------------------------------------------------------------
ipcMain.on("deskbuddy:close", () => {
  if (panelWindow) panelWindow.hide();
});

ipcMain.on("deskbuddy:minimize", () => {
  if (panelWindow) panelWindow.minimize();
});

ipcMain.on("deskbuddy:show-panel", () => {
  if (!panelWindow) createPanelWindow();
  else {
    panelWindow.show();
    panelWindow.focus();
  }
});

ipcMain.on("deskbuddy:hide-panel", () => {
  if (panelWindow) panelWindow.hide();
});

ipcMain.on("deskbuddy:toggle-panel", () => {
  if (!panelWindow) createPanelWindow();
  else if (panelWindow.isVisible()) panelWindow.hide();
  else {
    panelWindow.show();
    panelWindow.focus();
  }
});

ipcMain.on("deskbuddy:toggle-mascot", () => {
  if (!mascotWindow) {
    createMascotWindow();
  } else if (mascotWindow.isVisible()) {
    mascotWindow.hide();
  } else {
    mascotWindow.show();
  }
  updateTrayMenu();
});

ipcMain.on("deskbuddy:start-visit", (_event, options) => {
  startDeskBuddyVisit(options);
});

ipcMain.on("deskbuddy:exit-visit", () => {
  exitDeskBuddyVisit(currentRoute);
});

ipcMain.on("deskbuddy:set-route", (_event, route) => {
  currentRoute = route || "bottom";
});

ipcMain.on("deskbuddy:set-stay-duration", (_event, seconds) => {
  stayDurationSeconds = Math.max(5, seconds || 20);
});

ipcMain.on("deskbuddy:set-walking", (_event, enabled) => {
  stayOnScreenAlways = !!enabled;
});

ipcMain.on("deskbuddy:set-always-on-top", (_event, alwaysOnTop) => {
  if (panelWindow) panelWindow.setAlwaysOnTop(!!alwaysOnTop, "floating");
  if (mascotWindow) mascotWindow.setAlwaysOnTop(!!alwaysOnTop, "screen-saver");
});

ipcMain.on("deskbuddy:notification", (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || "DeskBuddy Reminder",
      body: body || "Time for a healthy habit break!",
      silent: true
    }).show();
  }
});

ipcMain.on("deskbuddy:action", (event, action) => {
  if (action.type === "reminder:trigger") {
    // If mascot is hidden or offscreen, summon it
    ensureMascotVisible();
  }
  if (action.type === "reminder:clear" || action.type === "reminder:celebrate") {
    // Broadcast to ALL windows so both panel and mascot clear immediately!
    broadcastAction(action, null);
    return;
  }
  // Forward ONLY to other windows, never echoing back to the caller!
  broadcastAction(action, event.sender);
});

ipcMain.handle("deskbuddy:get-work-area", () => {
  const display = screen.getPrimaryDisplay();
  return display.workArea;
});

ipcMain.handle("deskbuddy:get-position", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { x: 0, y: 0 };
  const [x, y] = win.getPosition();
  return { x, y };
});

ipcMain.on("deskbuddy:set-position", (event, { x, y }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    win.setPosition(Math.round(x), Math.round(y));
  }
});

// Sleep & Resume handling
powerMonitor.on("suspend", () => {
  clearAnimation();
  broadcastAction({ type: "system:suspend" });
});

powerMonitor.on("resume", () => {
  broadcastAction({ type: "system:resume" });
  ensureMascotVisible();
});

// App Lifecycle
app.whenReady().then(() => {
  createPanelWindow();
  createMascotWindow();
  createTray();
});

app.on("window-all-closed", (event) => {
  event.preventDefault();
});

app.on("activate", () => {
  if (!panelWindow) createPanelWindow();
});
