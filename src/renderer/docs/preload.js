// The preload.js file is loaded before main.js.
// It defines the API to communicate between the main process and the renderer processes.
// It also allows the renderer process access to modules not available locally.

const { contextBridge, ipcRenderer } = require("electron");

const api = require("../preload");

contextBridge.exposeInMainWorld("api", {
  ...api,
  file: {
    isOpen: (func) => {
      ipcRenderer.on("file:is-open", func);
    },
  },
  docs: {
    jump: (func) => {
      ipcRenderer.on("docs:jump", func);
    },
  },
});
