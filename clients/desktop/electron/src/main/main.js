const { app, BrowserWindow } = require("electron");
const path = require("path");
const { windowConfig } = require("../config/window");

function createWindow() {
  const win = new BrowserWindow(windowConfig);

  win.loadFile(path.join(__dirname, "../features/home/ui/home.html"));
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
