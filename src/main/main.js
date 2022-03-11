// * Imports *

const { app, BrowserWindow, ipcMain, shell } = require("electron");

const WindowManager = require("./window-manager");

// * Variable assignment *

const platform = process.platform;
const isDarwin = platform === "darwin";

// Squirrel launches the app multiple times with special arguments.
// This quits those instances.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// * App API listeners *

// Create window and application menu onece electron has
// finished intialisation and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // * Window API listeners *

  ipcMain.handle("file:fetch", (event, isEdited) => {
    const targetWindowId = BrowserWindow.fromWebContents(event.sender).id;
    const targetWindow = windowManager.getWindowFromId(targetWindowId);

    targetWindow.getFile(isEdited);
  });

  ipcMain.on("file:save", (event, filePath, content) => {
    const targetWindowId = BrowserWindow.fromWebContents(event.sender).id;
    const targetWindow = windowManager.getWindowFromId(targetWindowId);

    targetWindow.saveFile(filePath, content);
  });

  ipcMain.handle("file:run", (event, filePath, content) => {
    const targetWindowId = BrowserWindow.fromWebContents(event.sender).id;
    const targetWindow = windowManager.getWindowFromId(targetWindowId);

    targetWindow.runFile(filePath, content);
  });

  ipcMain.on("file:show", (_event, filePath) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle("shell:stdin", (event, data) => {
    const targetWindowId = BrowserWindow.fromWebContents(event.sender).id;
    const targetWindow = windowManager.getWindowFromId(targetWindowId);

    targetWindow.writeToPty(data); //!
  });

  ipcMain.handle("docs:open", (_event, section) =>
    windowManager.openDocsWindow(section)
  );

  ipcMain.handle("dark-mode:toggle", () => {
    windowManager.toggleDarkMode();
  });

  ipcMain.handle("platform", () => platform);

  const windowManager = new WindowManager();
  windowManager.createEditorWindow();

  app.on("activate", () => {
    windowManager.createApplicationMenu();

    // Re-create a window on OS X when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createEditorWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
// On MacOS, keep applications and menu bar active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (!isDarwin) {
    app.quit();
  }
});

// TODO Separate Files
// TODO Write in TypeScript
// TODO Use Private, Proctected and Public variables
// TODO Separate Preload.js
