const { app, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const pty = require("node-pty");

const Window = require("./window");

class EditorWindow extends Window {
  constructor(interpreter) {
    super(EDITOR_WINDOW_WEBPACK_ENTRY, EDITOR_WINDOW_PRELOAD_WEBPACK_ENTRY);

    this.ptyProcess = null;
    this.interpreter = interpreter;
    this.runFileName = null;
    this.runFileCmd = null;
    this.ptyBuffer = "";

    this.window.once("ready-to-show", () => this.initPty());

    this.window.on("close", async (event) => {
      event.preventDefault();

      let canceled = 0;

      if (await this.isEdited()) {
        canceled = (
          await this.showWarningDialog(
            "Quit with unsaved changes?",
            "Closing this window will lose all unsaved changes. Close anyways?"
          )
        ).response;
      }

      if (!canceled) {
        this.ptyProcess = null;
        this.window.destroy();
      }
    }); // TODO Window not closing properly on Cmd + Q
  }

  initPty() {
    // Initialise node-pty process
    this.ptyProcess = pty.spawn(this.interpreter, [], {
      handleFlowControl: true,
    });

    this.ptyProcess.onData((data) => {
      if (this.runFileName) {
        this.ptyBuffer += data;
        if (this.ptyBuffer === this.runFileCmd + "\n") {
          this.send("shell:stdout", `% RUN ${this.runFileName} %\r\n`);
          this.runFileName = null;
          this.ptyBuffer = "";
        }
      } else {
        this.send("shell:stdout", data);
      }
    });

    this.ptyProcess.onExit(() => {
      this.send("shell:clear");
      this.initPty();
    });
  }

  writeToPty(data) {
    this.ptyProcess.write(data);
  }

  async getFile(isEdited) {
    const fileSelection = await this.showFileDialog();

    if (!fileSelection.canceled) {
      let canceled = 0;
      if (isEdited) {
        canceled = (
          await this.showWarningDialog(
            "Overwrite Current Unsaved Changes?",
            "Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?"
          )
        ).response;
      }

      if (!canceled) {
        this.openFile(fileSelection.filePaths[0]);
      }
    }
  }

  showFileDialog() {
    return dialog.showOpenDialog(this.window, {
      defaultPath: app.getPath("documents"),
      properties: ["openFile"],
      filters: [
        { name: "Python Files", extensions: ["py", "pyw"] },
        { name: "Text Files", extensions: ["txt"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
  }

  showSaveDialog() {
    return dialog.showSaveDialog(this.window, {
      title: "Save File",
      defaultPath: app.getPath("documents"),
      filters: [
        { name: "Python Files", extensions: ["py", "pyw"] },
        { name: "Text Files", extensions: ["txt"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
  }

  showWarningDialog(title, message) {
    return dialog.showMessageBox(this.window, {
      type: "warning",
      title,
      message,
      buttons: ["Yes", "Cancel"],
      defaultId: 0,
      cancelId: 1,
    });
  }

  openFile(filePath) {
    const content = fs.readFileSync(filePath).toString();
    app.addRecentDocument(filePath);
    this.send(
      "file:open",
      path.basename(filePath),
      path.dirname(filePath),
      content
    );
  }

  async saveFile(filePath, content) {
    if (!filePath) {
      filePath = (await this.showSaveDialog()).filePath;

      if (!filePath) return;

      fs.writeFileSync(filePath, content);
      this.openFile(filePath);
    } else {
      fs.writeFileSync(filePath, content);
    }

    this.send("title:update");

    return filePath;
  }

  async runFile(filePath, content) {
    filePath = await this.saveFile(filePath, content);

    if (filePath) {
      this.runFileName = path.basename(filePath);
      this.runFileCmd = `exec(open("${filePath}").read())\r`;
      this.writeToPty(this.runFileCmd);
    }
  }

  isEdited() {
    return new Promise((resolve, _reject) => {
      this.send("file:is-edited");
      ipcMain.once("file:is-edited", (_event, isEdited) => {
        resolve(isEdited);
      });
    });
  }

  isFileOpen() {
    return new Promise((resolve, _reject) => {
      this.send("file:is-open");
      ipcMain.once("file:is-open", (_event, isFileOpen) => {
        resolve(isFileOpen);
      });
    });
  }
}

module.exports = EditorWindow;
