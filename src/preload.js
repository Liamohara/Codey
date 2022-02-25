// The preload.js file is loaded before main.js.
// It defines the API to communicate between the main process and the renderer processes.
// It also allows the renderer process access to modules not available locally.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  title: {
    update: (func) => {
      ipcRenderer.on("updateTitle", func);
    },
  },

  file: {
    open: (isEdited) => {
      ipcRenderer.invoke("getFile", isEdited);
    },
    recieve: (func) => {
      ipcRenderer.on("sendFile", func);
    },
    run: {
      get: (func) => {
        ipcRenderer.on("runFile", func);
      },
      send: (filePath, content) => {
        ipcRenderer.invoke("runFile", filePath, content);
      },
    },

    save: {
      get: (func) => {
        ipcRenderer.on("saveFile", func);
      },
      send: (file, content) => {
        ipcRenderer.invoke("saveFile", file, content);
      },
    },

    show: {
      get: (func) => {
        ipcRenderer.on("showFile", func);
      },
      send: (filePath) => {
        ipcRenderer.invoke("showFile", filePath);
      },
    },

    isEdited: {
      get: (func) => {
        ipcRenderer.on("isEdited", func);
      },
      send: (isEdited) => {
        ipcRenderer.invoke("isEdited", isEdited);
      },
    },

    isOpen: {
      get: (func) => {
        ipcRenderer.on("isFileOpen", func);
      },
      send: (isFileOpen) => {
        ipcRenderer.invoke("isFileOpen", isFileOpen);
      },
    },
  },

  shell: {
    send: (data) => {
      ipcRenderer.invoke("stdin", data);
    },
    recieve: (func) => {
      ipcRenderer.on("stdout", func);
    },
    clear: (func) => {
      ipcRenderer.on("clearShell", func);
    },
  },

  docs: {
    open: (section) => {
      ipcRenderer.invoke("openDocs", section);
    },
  },

  jump: (func) => {
    ipcRenderer.on("jumpToSection", func);
  },

  toggleDarkMode: {
    recieve: (func) => {
      ipcRenderer.on("toggleDarkMode", func);
    },
    send: () => {
      ipcRenderer.invoke("toggleDarkMode");
    },
  },
});
