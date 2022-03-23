// * Imports *

import {
  app,
  BrowserWindow,
  nativeTheme,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
} from "electron";

import EditorWindow from "./windows/editor-window";
import DocsWindow from "./windows/docs-window";

// * Variable Assignment *

const platform: string = process.platform;
const isMac = platform === "darwin";
const interpreter = platform === "windows" ? "python.exe" : "python3";

let darkMode = nativeTheme.shouldUseDarkColors;

// * Class Definition *

class WindowManager {
  createEditorWindow() {
    const newWindow = new EditorWindow(darkMode, interpreter);

    newWindow.event.on("new-focus", () => this.createApplicationMenu());

    return newWindow;
  }

  showDocsWindow(section?: string) {
    DocsWindow.show(section);
  }

  async createApplicationMenu() {
    const focussedWindow = BrowserWindow.getFocusedWindow();
    const isFocussedWindow = !!focussedWindow; // "!!" Converts to boolean
    const isEditorWindowInFocus = !!EditorWindow.fromID(focussedWindow?.id);

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
              const window = EditorWindow.fromID(targetWindow?.id);
              const isFileOpen = isEditorWindowInFocus
                ? await window?.isFileOpen()
                : true;

              if (!isFileOpen) {
                const isEdited = await window.isEdited();
                window.getFile(isEdited);
              } else {
                const newWindow = this.createEditorWindow();
                const browserWindow = newWindow.BrowserWindow;
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
              this.showDocsWindow();
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

  toggleDarkMode() {
    darkMode = !darkMode;

    if (darkMode) {
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
