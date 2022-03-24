import { BrowserWindow } from "electron";
import EventEmitter from "events";

const platform = process.platform;
const isDarwin = platform === "darwin";

abstract class Window {
  protected window: BrowserWindow;

  protected eventEmitter = new EventEmitter();

  constructor(renderer: string, preload: string, darkMode: boolean) {
    const [x, y] = this.getNewWindowPosition();

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
    this.window.webContents.once("did-finish-load", () => {
      if (darkMode) {
        this.send("dark-mode:toggle");
      }

      if (!isDarwin) {
        this.send("platform:not-darwin");
      }

      this.window.show();
    });

    this.window.on("focus", () => this.eventEmitter.emit("new-focus"));
    this.window.on("closed", () => this.eventEmitter.emit("new-focus"));
  }

  private getNewWindowPosition() {
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

  get event() {
    return this.eventEmitter;
  }

  protected send(channel: string, ...args: unknown[]) {
    return this.window.webContents.send(channel, ...args);
  }
}

export default Window;
