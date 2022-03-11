const { app, BrowserWindow, nativeTheme, Menu } = require("electron");

const EditorWindow = require("./editor-window");
const DocsWindow = require("./docs-window"); // TODO Verify where this should go

class WindowManager {
  constructor() {
    this.editorWindows = new Object();
    this.docsWindow = null;

    this.darkMode = nativeTheme.shouldUseDarkColors;

    const platform = process.platform;
    this.interpreter = platform === "windows" ? "python.exe" : "python3";
  }

  createEditorWindow() {
    const newWindow = new EditorWindow(this.interpreter);
    const id = newWindow.getId();

    const browserWindow = newWindow.getBrowserWindow();

    browserWindow.on("focus", () => this.createApplicationMenu());

    // When a window is closed.
    // 1. Wipe the BrowserWindow instance
    // 2. Reload Application Menu
    browserWindow.once("closed", () => {
      this.editorWindows[id] = null;

      this.createApplicationMenu();
    });

    this.editorWindows[id] = newWindow;
  }

  openDocsWindow(section) {
    if (!this.docsWindow) {
      this.docsWindow = this.createDocsWindow(section);
    } else {
      this.docsWindow.focus();
      this.docsWindow.send("docs:jump", section);
    }
  }

  createDocsWindow(section) {
    const docsWindow = new DocsWindow(section);
    const browserWindow = docsWindow.getBrowserWindow(); // TODO Change to calling "setListener" function?

    browserWindow.on("focus", () => this.createApplicationMenu());

    // When a window is closed.
    // 1. Wipe the BrowserWindow instance
    // 2. Reload Application Menu
    browserWindow.once("closed", () => {
      this.docsWindow = null;

      this.createApplicationMenu();
    });

    return docsWindow;
  }

  async createApplicationMenu() {
    const focussedWindow = BrowserWindow.getFocusedWindow();
    const isFocussedWindow = !!focussedWindow;
    const isEditorWindowInFocus = !!this.getWindowFromId(focussedWindow?.id);

    const template = [
      {
        label: "File",
        submenu: [
          {
            label: "New File",
            accelerator: "CmdOrCtrl+N",
            click: () => {
              this.createEditorWindow();
            },
          },
          {
            label: "Open File",
            accelerator: "CmdOrCtrl+O",
            click: async (_item, targetWindow) => {
              const window = this.getWindowFromId(targetWindow?.id);
              const isFileOpen = isEditorWindowInFocus
                ? await window?.isFileOpen()
                : true;

              if (!isFileOpen) {
                const isEdited = await window?.isEdited();
                window.getFile(isEdited);
              } else {
                const newWindow = this.createEditorWindow();
                const browserWindow = newWindow.getBrowserWindow();
                browserWindow.once("show", () => {
                  newWindow.getFile(false);
                });
              }
            },
          },
          {
            label: "Save File",
            accelerator: "CmdOrCtrl+S",
            enabled: isEditorWindowInFocus,
            click: (_item, targetWindow) => {
              targetWindow.webContents.send("file:save");
            },
          },
          {
            label: "Run File",
            accelerator: "CmdOrCtrl+R",
            enabled: isEditorWindowInFocus,
            click: async (_item, targetWindow) => {
              targetWindow.webContents.send("file:run");
            },
          },
          { type: "separator" },
          {
            label: "Show File",
            enabled: isEditorWindowInFocus,
            click: (_item, targetWindow) => {
              targetWindow.webContents.send("file:show");
            },
          },
        ],
      },
      {
        label: "Edit",
        submenu: [
          {
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            role: "undo",
          },
          {
            label: "Redo",
            accelerator: "Shift+CmdOrCtrl+Z",
            role: "redo",
          },
          { type: "separator" },
          {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            role: "cut",
          },
          {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            role: "copy",
          },
          {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            role: "paste",
          },
          {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            role: "selectall",
          },
        ],
      },
      {
        label: "Window",
        submenu: [
          {
            label: "Minimize",
            accelerator: "CmdOrCtrl+M",
            role: "minimize",
          },
          {
            label: "Close",
            accelerator: "CmdOrCtrl+W",
            role: "close",
          },
        ],
      },
      {
        label: "Help",
        role: "help",
        submenu: [
          {
            label: "Open Documentation",
            accelerator: "F12",
            click: () => {
              this.openDocsWindow();
            },
          },
          {
            label: "Toggle Developer Tools",
            accelerator: "CmdOrCtrl+Alt+I",
            enabled: isFocussedWindow,
            click: (_item, targetWindow) => {
              targetWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
    ];

    if (process.platform === "darwin") {
      const name = "Codey";
      template.unshift({
        label: name,
        submenu: [
          {
            label: `About ${name}`,
            role: "about",
          },
          { type: "separator" },
          {
            label: "Services",
            role: "services",
            submenu: [],
          },
          { type: "separator" },
          {
            label: `Hide ${name}`,
            accelerator: "Cmd+H",
            role: "hide",
          },
          {
            label: "Hide Others",
            accelerator: "Cmd+Alt+H",
            role: "hideothers",
          },
          {
            label: "Show All",
            role: "unhide",
          },
          { type: "separator" },
          {
            label: `Quit ${name}`,
            accelerator: "Cmd+Q",
            click: () => {
              app.quit();
            },
          },
        ],
      });

      const windowMenu = template.find((item) => item.label === "Window");
      windowMenu.role = "window";
      windowMenu.submenu.push(
        { type: "separator" },
        {
          label: "Bring All to Front",
          role: "front",
        }
      );
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  getWindowFromId(targetWindowId) {
    return this.editorWindows[targetWindowId];
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;

    if (this.darkMode) {
      nativeTheme.themeSource = "dark";
    } else {
      nativeTheme.themeSource = "light";
    }

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("dark-mode:toggle");
    });
  }
}

module.exports = WindowManager;
