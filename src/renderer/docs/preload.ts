// The preload.js file is loaded before main.js.
// It defines the API to communicate between the main process and the renderer processes.
// It also allows the renderer process access to modules not available locally.

import { contextBridge, ipcRenderer } from "electron";

import api from "../preload";

contextBridge.exposeInMainWorld("api", {
  ...api,
  file: {
    isOpen: (func: (event: Electron.IpcRendererEvent) => void) => {
      ipcRenderer.on("file:is-open", func);
    },
  },
  docs: {
    jump: (
      func: (event: Electron.IpcRendererEvent, section: string) => void
    ) => {
      ipcRenderer.on("docs:jump", func);
    },
  },
});
