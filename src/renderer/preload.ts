import { ipcRenderer } from "electron";

const api = {
  darkMode: {
    toggle: {
      receive: (func: (event: Electron.IpcRendererEvent) => void) => {
        ipcRenderer.on("dark-mode:toggle", func);
      },
      send: () => {
        ipcRenderer.invoke("dark-mode:toggle");
      },
    },
  },

  platform: {
    notDarwin: (func: () => void) =>
      ipcRenderer.on("platform:not-darwin", func),
  },
};

export default api;
