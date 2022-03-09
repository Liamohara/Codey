const { app, BrowserWindow, Menu } = require("electron");
const mainProcess = require("./main");

async function createApplicationMenu() {
  const editorWindowInFocus = !!BrowserWindow.getFocusedWindow();
  const hasOneOrMoreWindows = !!BrowserWindow.getAllWindows().length; // "!!" Sets boolean value - not necessary but cleaner

  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New File",
          accelerator: "CmdOrCtrl+N",
          click() {
            mainProcess.createEditorWindow();
          },
        },
        {
          label: "Open File",
          accelerator: "CmdOrCtrl+O",
          async click(_item, targetWindow) {
            const isFileOpen = await mainProcess.isFileOpen(targetWindow);
            if (targetWindow && !isFileOpen) {
              const isEdited = await mainProcess.isEdited(targetWindow);
              mainProcess.getFile(targetWindow, isEdited);
            } else {
              const newWindow = mainProcess.createEditorWindow();

              newWindow.once("show", () => {
                mainProcess.getFile(targetWindow, false);
              });
            }
          },
        },
        {
          label: "Save File",
          accelerator: "CmdOrCtrl+S",
          enabled: editorWindowInFocus,
          click(_item, targetWindow) {
            targetWindow.webContents.send("file:save");
          },
        },
        {
          label: "Run File",
          accelerator: "CmdOrCtrl+R",
          enabled: editorWindowInFocus,
          async click(_item, targetWindow) {
            targetWindow.webContents.send("file:run");
          },
        },
        { type: "separator" },
        {
          label: "Show File",
          enabled: editorWindowInFocus,
          click(_item, targetWindow) {
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
          accelerator: "CmdOrCtrl+Alt+D",
          click() {
            mainProcess.openDocsWindow();
          },
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "CmdOrCtrl+Alt+I",
          enabled: hasOneOrMoreWindows,
          click(_item, targetWindow) {
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
          click() {
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

  return Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = createApplicationMenu;
