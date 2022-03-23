import Window from "./window";

// This allows TypeScript to use the magic constant that's auto-generated by Electron Forge's Webpack plugin.
declare const DOCS_WINDOW_WEBPACK_ENTRY: string;
declare const DOCS_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Singleton class Docs Window Definition
class DocsWindow extends Window {
  private static instance: DocsWindow;

  private constructor(darkMode: boolean, section: string) {
    super(
      DOCS_WINDOW_WEBPACK_ENTRY,
      DOCS_WINDOW_PRELOAD_WEBPACK_ENTRY,
      darkMode
    ); // TODO use builder design pattern? OR Pass in settings object

    this.window.webContents.once("did-finish-load", () => {
      this.send("docs:jump", section);
    });

    this.window.once("closed", (): void => (DocsWindow.instance = null));
  }

  static show(section?: string) {
    if (this.instance) {
      if (section) this.jump(section);

      this.focus();
    } else {
      this.instance = new DocsWindow(false, section); // TODO Pass in darkMode
    }
  }

  private static jump(section: string) {
    this.instance.send("docs:jump", section);
  }

  private static focus() {
    this.instance.window.focus();
  }
}

export default DocsWindow;