import {
  app,
  BrowserWindow,
  nativeTheme,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
} from "electron";

import EditorWindow from "./editor-window";
import DocsWindow from "./docs-window"; // TODO Verify where this should go

class WindowManager {
  editorWindows: Map<number, EditorWindow>; // TODO Find a way to use a set instead and not store ID
  docsWindow: DocsWindow;
  darkMode: boolean;
  interpreter: string;

  constructor() {
    this.editorWindows = new Map();
    this.docsWindow = null;

    this.darkMode = nativeTheme.shouldUseDarkColors;

    const platform: string = process.platform;
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
      this.editorWindows.delete(id);

      this.createApplicationMenu();
    });

    this.editorWindows.set(id, newWindow);

    return newWindow;
  }

  openDocsWindow(section?: string) {
    if (!this.docsWindow) {
      this.docsWindow = this.createDocsWindow(section);
    } else {
      this.docsWindow.focus();
      this.docsWindow.send("docs:jump", section);
    }
  }

  createDocsWindow(section: string) {
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

    const isMac = process.platform === "darwin";

    const template: Electron.MenuItemConstructorOptions[] = [
      // App Menu
      ...((isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "services" },
                { type: "separator" },
                { role: "hide" },
                { role: "hideOthers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" },
              ],
            },
          ]
        : []) as MenuItemConstructorOptions[]),
      // File Menu
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
            click: async (_item: MenuItem, targetWindow: BrowserWindow) => {
              const window = this.getWindowFromId(targetWindow?.id);
              const isFileOpen = isEditorWindowInFocus
                ? await window?.isFileOpen()
                : true;

              if (!isFileOpen) {
                const isEdited = await window.isEdited();
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
            click: (_item: MenuItem, targetWindow: BrowserWindow) => {
              targetWindow.webContents.send("file:save");
            },
          },
          {
            label: "Run File",
            accelerator: "CmdOrCtrl+R",
            enabled: isEditorWindowInFocus,
            click: async (_item: MenuItem, targetWindow: BrowserWindow) => {
              targetWindow.webContents.send("file:run");
            },
          },
          { type: "separator" },
          {
            label: "Show File",
            enabled: isEditorWindowInFocus,
            click: (_item: MenuItem, targetWindow: BrowserWindow) => {
              targetWindow.webContents.send("file:show");
            },
          },
        ],
      },
      // Edit Menu
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
        ],
      },
      // Window Menu
      {
        label: "Window",
        submenu: [{ role: "minimize" }, { role: "close" }],
      },
      // Help Menu
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
            click: (_item: MenuItem, targetWindow: BrowserWindow) => {
              targetWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  getWindowFromId(targetWindowId: number) {
    return this.editorWindows.get(targetWindowId);
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

export default WindowManager;
