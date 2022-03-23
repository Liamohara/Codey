import { ipcRenderer } from "electron";

const API = {
  darkMode: {
    toggle: {
      receive: (func: () => void) => {
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

export const api = API;
