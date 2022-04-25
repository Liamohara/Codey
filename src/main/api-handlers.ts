import { BrowserWindow, ipcMain, shell } from "electron";
import WindowManager from "./window-manager";
import EditorWindow from "./windows/editor-window";

const platform = process.platform;

function createHandlers(windowManager: WindowManager) {
  ipcMain.handle("file:fetch", (event, isEdited) => {
    const targetWindowId = BrowserWindow.fromWebContents(event.sender).id;
    const targetWindow = EditorWindow.fromID(targetWindowId);

    targetWindow.getFile(isEdited);
  });

  ipcMain.on("file:save", (event, filePath, content) => {
    const targetWindowId = BrowserWindow.fromWebContents(event.sender).id;
    const targetWindow = EditorWindow.fromID(targetWindowId);

    targetWindow.saveFile(filePath, content);
  });

  ipcMain.handle("file:run", (event, filePath, content) => {
    const targetWindowId = BrowserWindow.fromWebContents(event.sender).id;
    const targetWindow = EditorWindow.fromID(targetWindowId);

    targetWindow.runFile(filePath, content);
  });

  ipcMain.on("file:show", (_event, filePath) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle("shell:stdin", (event, data) => {
    const targetWindowId = BrowserWindow.fromWebContents(event.sender).id;
    const targetWindow = EditorWindow.fromID(targetWindowId);

    targetWindow.writeToPty(data);
  });

  ipcMain.handle("docs:open", (_event, section) =>
    windowManager.showDocsWindow(section)
  );

  ipcMain.handle("dark-mode:toggle", () => {
    windowManager.toggleDarkMode();
  });

  ipcMain.handle("platform", () => platform);
}

export default createHandlers;
