const Window = require("./window");

class DocsWindow extends Window {
  constructor(section) {
    super(DOCS_WINDOW_WEBPACK_ENTRY, DOCS_WINDOW_PRELOAD_WEBPACK_ENTRY);

    this.window.once("show", () => this.send("docs:jump", section));
  }

  focus() {
    this.window.focus();
  }
}

module.exports = DocsWindow;
