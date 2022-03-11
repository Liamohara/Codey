const { ipcRenderer } = require("electron");

const api = {
  darkMode: {
    toggle: {
      recieve: (func) => {
        ipcRenderer.on("dark-mode:toggle", func);
      },
      send: () => {
        ipcRenderer.invoke("dark-mode:toggle");
      },
    },
  },

  platform: {
    notDarwin: (func) => ipcRenderer.on("platform:not-darwin", func), // TODO Improve naming
  },
};

module.exports = api;
