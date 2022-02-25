// * Imports *

const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} = require("electron");
const createApplicationMenu = require("./application-menu");
const fs = require("fs");
const path = require("path");
const pty = require("node-pty");

// * Variable assignment *

const editorWindows = new Map();
const interpreter = "python3";

let docsWindow = null;
let runFileName = null;
let runFileCmd = null;
let runFileBuffer = "";
let darkMode = nativeTheme.shouldUseDarkColors;

// Squirrel launches the app multiple times with special arguments.
// This quits those instances.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// * Functions *

function createEditorWindow() {
  const currentWindow = BrowserWindow.getFocusedWindow();

  // Calculate window start position
  let x, y;
  if (currentWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition();
    x = currentWindowX + 10;
    y = currentWindowY + 10;
  }

  // Create new window instance
  newWindow = new BrowserWindow({
    x,
    y,
    name: "Codey",
    width: 800,
    height: 600,
    minWidth: 405,
    minHeight: 405,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
    show: false,
  });

  // Load index.html to window
  newWindow.loadURL(EDITOR_WINDOW_WEBPACK_ENTRY);

  // Show window once it has finished initialising
  newWindow.once("ready-to-show", () => {
    createApplicationMenu();

    initShell(editorWindows, newWindow);

    newWindow.show();
  });

  newWindow.on("show", () => {
    if (darkMode) {
      newWindow.webContents.send("toggleDarkMode");
    }
  });

  // When a window is closed.
  // 1. Remove it from the window set.
  // 2. Reload Application Menu
  newWindow.on("closed", () => {
    editorWindows.delete(newWindow);
    newWindow = null;
    createApplicationMenu();
  });

  return newWindow;
}

function initShell(editorWindows, newWindow) {
  // Add window to windows set
  editorWindows.set(
    newWindow,
    // Initialise node-pty process
    pty.spawn(interpreter, [], { handleFlowControl: true })
  );

  editorWindows.get(newWindow).on("data", (data) => {
    if (runFileName) {
      runFileBuffer += data;
      if (runFileBuffer === runFileCmd + "\n") {
        newWindow.webContents.send("stdout", `% RUN ${runFileName} %\r\n`);
        runFileName = null;
        runFileBuffer = "";
      }
    } else {
      newWindow.webContents.send("stdout", data);
    }
  });

  editorWindows.get(newWindow).on("exit", () => {
    newWindow.webContents.send("clearShell");
    initShell(editorWindows, newWindow);
  });
}

function openDocsWindow(section) {
  if (!docsWindow) {
    createDocsWindow(section);
  } else {
    docsWindow.focus();
    docsWindow.webContents.send("jumpToSection", section);
  }
}

function createDocsWindow(section) {
  const currentWindow = BrowserWindow.getFocusedWindow();

  // Calculate window start position
  let x, y;
  if (currentWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition();
    x = currentWindowX + 10;
    y = currentWindowY + 10;
  }

  // Create new window instance
  docsWindow = new BrowserWindow({
    x,
    y,
    name: "Codey",
    width: 800,
    height: 600,
    minWidth: 405,
    minHeight: 405,
    titleBarStyle: "hidden",
    // icon: `${__dirname}/assets/icon.ico`,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
    show: false,
  });

  // Load index.html to window
  docsWindow.loadURL(DOCS_WINDOW_WEBPACK_ENTRY);

  // Show window once it has finished initialising
  docsWindow.once("ready-to-show", () => {
    createApplicationMenu();

    docsWindow.show();
  });

  docsWindow.once("show", () => {
    if (darkMode) {
      docsWindow.webContents.send("toggleDarkMode");
    }

    docsWindow.webContents.send("jumpToSection", section);
  });

  // When a window is closed.
  // 1. Remove it from the window set.
  // 2. Reload Application Menu
  docsWindow.on("closed", () => {
    docsWindow = null;
    createApplicationMenu();
  });
}

async function getFile(isEdited) {
  const targetWindow = BrowserWindow.getFocusedWindow();

  const fileSelection = await showFileDialog(targetWindow);

  if (!fileSelection.canceled) {
    let canceled = 0;
    if (isEdited) {
      canceled = (
        await showWarningDialog(
          targetWindow,
          "Overwrite Current Unsaved Changes?",
          "Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?"
        )
      ).response;
    }

    if (!canceled) {
      openFile(targetWindow, fileSelection.filePaths[0]);
    }
  }
}

function showFileDialog(targetWindow) {
  return dialog.showOpenDialog(targetWindow, {
    defaultPath: app.getPath("documents"),
    properties: ["openFile"],
    filters: [
      { name: "Python Files", extensions: ["py", "pyw"] },
      { name: "Text Files", extensions: ["txt"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
}

function showWarningDialog(targetWindow, title, message) {
  return dialog.showMessageBox(targetWindow, {
    type: "warning",
    title,
    message,
    buttons: ["Yes", "Cancel"],
    defaultId: 0,
    cancelId: 1,
  });
}

function openFile(targetWindow, filePath) {
  const content = fs.readFileSync(filePath).toString();
  app.addRecentDocument(filePath);
  targetWindow.webContents.send(
    "sendFile",
    path.basename(filePath),
    path.dirname(filePath),
    content
  );
  createApplicationMenu();
}

async function saveFile(filePath, content) {
  const targetWindow = BrowserWindow.getFocusedWindow();

  if (!filePath) {
    filePath = (await showSaveDialog(targetWindow)).filePath;

    if (!filePath) return;

    fs.writeFileSync(filePath, content);
    openFile(targetWindow, filePath);
  } else {
    fs.writeFileSync(filePath, content);
  }

  targetWindow.webContents.send("updateTitle");

  return filePath;
}

async function runFile(filePath, content) {
  const targetWindow = BrowserWindow.getFocusedWindow();
  const shell = editorWindows.get(targetWindow);

  filePath = await saveFile(filePath, content);

  if (filePath) {
    runFileName = path.basename(filePath);
    runFileCmd = `exec(open("${filePath}").read())\r`;
    shell.write(runFileCmd);
  }
}

function showSaveDialog(targetWindow) {
  return dialog.showSaveDialog(targetWindow, {
    title: "Save File",
    defaultPath: app.getPath("documents"),
    filters: [
      { name: "Python Files", extensions: ["py", "pyw"] },
      { name: "Text Files", extensions: ["txt"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
}

function isEdited(targetWindow) {
  return new Promise((resolve, reject) => {
    targetWindow.webContents.send("isEdited");
    ipcMain.handleOnce("isEdited", (event, isEdited) => {
      resolve(isEdited);
    });
  });
}

function isFileOpen(targetWindow) {
  return new Promise((resolve, reject) => {
    if (targetWindow) {
      targetWindow.webContents.send("isFileOpen");
      ipcMain.handleOnce("isFileOpen", (event, isFileOpen) => {
        resolve(isFileOpen);
      });
    } else {
      resolve(false);
    }
  });
}

function toggleDarkMode() {
  darkMode = !darkMode;

  if (darkMode) {
    nativeTheme.themeSource = "dark";
  } else {
    nativeTheme.themeSource = "light";
  }

  editorWindows.forEach((value, key) => {
    key.webContents.send("toggleDarkMode");
  });

  if (docsWindow) {
    docsWindow.webContents.send("toggleDarkMode");
  }
}

// * Export modules *

module.exports.createEditorWindow = createEditorWindow;
module.exports.openDocsWindow = openDocsWindow;
module.exports.getFile = getFile;
module.exports.isEdited = isEdited;
module.exports.isFileOpen = isFileOpen;
module.exports.saveFile = saveFile;
module.exports.runFile = runFile;

// * App API listeners *

// Create window and application menu onece electron has
// finished intialisation and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createEditorWindow();
  createApplicationMenu();
});

// Quit when all windows are closed, except on macOS.
// On MacOS, keep applications and menu bar active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // Re-create a window on OS X when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createEditorWindow();
  }
});

// * Window API listeners *

ipcMain.handle("getFile", (event, isEdited) => {
  getFile(isEdited);
});

ipcMain.handle("saveFile", (event, filePath, content) => {
  saveFile(filePath, content);
});

ipcMain.handle("runFile", (event, filePath, content) => {
  runFile(filePath, content);
});

ipcMain.handle("showFile", (event, filePath) => {
  shell.showItemInFolder(filePath);
});

ipcMain.handle("stdin", (event, data) => {
  const targetWindow = BrowserWindow.getFocusedWindow();
  editorWindows.get(targetWindow).write(data);
});

ipcMain.handle("openDocs", (event, section) => openDocsWindow(section));

ipcMain.handle("toggleDarkMode", () => {
  toggleDarkMode();
});
