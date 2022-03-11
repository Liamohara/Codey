module.exports = {
  packagerConfig: {
    executableName: "Codey",
    icon: "./assets/icon",
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "electron_forge_webpack_app",
        setupIcon: "./assets/icon.ico",
        iconUrl:
          "https://raw.githubusercontent.com/Liamohara/Codey/master/assets/icon.ico",
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        background: "./assets/dmg-background.png",
        format: "ULFO",
        icon: "./assets/icon.icns",
      },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        name: "Codey",
        bin: "Codey",
        icon: "./assets/icon.png",
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        name: "Codey",
        bin: "Codey",
        icon: "./assets/icon.png",
      },
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack_config/webpack.main.config.js",
        renderer: {
          config: "./webpack_config/webpack.renderer.config.js",
          entryPoints: [
            {
              name: "editor_window",
              html: "./src/renderer/editor/index.html",
              js: "./src/renderer/editor/renderer.js",
              preload: {
                js: "./src/renderer/editor/preload.js",
              },
            },
            {
              name: "docs_window",
              html: "./src/renderer/docs/index.html",
              js: "./src/renderer/docs/renderer.js",
              preload: {
                js: "./src/renderer/docs/preload.js",
              },
            },
          ],
        },
      },
    ],
  ],
};
