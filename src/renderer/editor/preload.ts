// The preload.js file is loaded before main.js.
// It defines the API to communicate between the main process and the renderer processes.
// It also allows the renderer process access to modules not available locally.

import { contextBridge, ipcRenderer } from "electron";

import api from "../preload"; // TODO FIXXXXX!!!!

contextBridge.exposeInMainWorld("api", {
  ...api,
  title: {
    update: (func: () => void) => {
      ipcRenderer.on("title:update", func);
    },
  },

  file: {
    fetch: (isEdited: boolean) => {
      ipcRenderer.invoke("file:fetch", isEdited);
    },

    open: (
      func: (
        event: Electron.IpcRendererEvent,
        file: string,
        fileDir: string,
        content: string
      ) => void
    ) => {
      ipcRenderer.on("file:open", func);
    },

    initRun: (func: () => void) => {
      ipcRenderer.on("file:run", func);
    },

    run: (filePath: string, contents: string) => {
      ipcRenderer.invoke("file:run", filePath, contents);
    },

    save: (func: (event: Electron.IpcRendererEvent) => void) => {
      ipcRenderer.on("file:save", func);
    },

    show: (func: (event: Electron.IpcRendererEvent) => void) => {
      ipcRenderer.on("file:show", func);
    },

    isEdited: (func: (event: Electron.IpcRendererEvent) => void) => {
      ipcRenderer.on("file:is-edited", func);
    },

    isOpen: (func: (event: Electron.IpcRendererEvent) => void) => {
      ipcRenderer.on("file:is-open", func);
    },
  },

  shell: {
    stdin: (data: string) => {
      ipcRenderer.invoke("shell:stdin", data);
    },
    stdout: (
      func: (event: Electron.IpcRendererEvent, data: string) => void
    ) => {
      ipcRenderer.on("shell:stdout", func);
    },
    clear: (func: () => void) => {
      ipcRenderer.on("shell:clear", func);
    },
  },

  docs: {
    open: (section: string) => {
      ipcRenderer.invoke("docs:open", section);
    },
  },
});
