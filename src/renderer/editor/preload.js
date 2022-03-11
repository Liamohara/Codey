// The preload.js file is loaded before main.js.
// It defines the API to communicate between the main process and the renderer processes.
// It also allows the renderer process access to modules not available locally.

const { contextBridge, ipcRenderer } = require("electron");

const api = require("../preload");

contextBridge.exposeInMainWorld("api", {
  ...api,
  title: {
    update: (func) => {
      ipcRenderer.on("title:update", func);
    },
  },

  file: {
    fetch: (isEdited) => {
      ipcRenderer.invoke("file:fetch", isEdited);
    },

    open: (func) => {
      ipcRenderer.on("file:open", func);
    },

    initRun: (func) => {
      ipcRenderer.on("file:run", func);
    },

    run: (filePath, contents) => {
      ipcRenderer.invoke("file:run", filePath, contents);
    },

    save: (func) => {
      ipcRenderer.on("file:save", func);
    },

    show: (func) => {
      ipcRenderer.on("file:show", func);
    },

    isEdited: (func) => {
      ipcRenderer.on("file:is-edited", func);
    },

    isOpen: (func) => {
      ipcRenderer.on("file:is-open", func);
    },
  },

  shell: {
    stdin: (data) => {
      ipcRenderer.invoke("shell:stdin", data);
    },
    stdout: (func) => {
      ipcRenderer.on("shell:stdout", func);
    },
    clear: (func) => {
      ipcRenderer.on("shell:clear", func);
    },
  },

  docs: {
    open: (section) => {
      ipcRenderer.invoke("docs:open", section);
    },
  },
});
