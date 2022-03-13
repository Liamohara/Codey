import { BrowserWindow, nativeTheme } from "electron";

const platform = process.platform;
const isDarwin = platform === "darwin";

class Window {
  window: Electron.CrossProcessExports.BrowserWindow;
  darkMode: boolean;

  constructor(renderer: string, preload: string) {
    const [x, y] = this.getNewWindowPosition();

    this.darkMode = nativeTheme.shouldUseDarkColors; // TODO Improve usage. Also fix error where native Theme changes whilst window open.

    this.window = new BrowserWindow({
      x,
      y,
      width: 800,
      height: 600,
      minWidth: 405,
      minHeight: 405,
      titleBarStyle: isDarwin ? "hidden" : "default",
      webPreferences: {
        preload,
      },
      show: false,
    });

    // Load index.html to window
    this.window.loadURL(renderer);

    // Show window once it has finished initialising
    this.window.once("ready-to-show", () => {
      if (this.darkMode) {
        this.send("dark-mode:toggle");
      }

      if (!isDarwin) {
        this.send("platform:not-darwin");
      }

      this.window.show();
    });
  }

  getNewWindowPosition() {
    const currentWindow = BrowserWindow.getFocusedWindow();

    // Calculate window start position
    let x, y;
    if (currentWindow) {
      const [currentWindowX, currentWindowY] = currentWindow.getPosition();
      x = currentWindowX + 10;
      y = currentWindowY + 10;
    }

    return [x, y];
  }

  getBrowserWindow() {
    return this.window;
  }

  getId() {
    return this.window.id;
  }

  send(channel: string, ...args: unknown[]) {
    // TODO Improve functionality. Should not have type "any" or be passed like this!
    return this.window.webContents.send(channel, ...args);
  }
}

export default Window;
