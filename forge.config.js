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
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        bin: "Codey"
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        bin: "Codey"
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
              html: "./src/editor/index.html",
              js: "./src/editor/renderer.js",
              name: "editor_window",
            },
            {
              html: "./src/docs/index.html",
              js: "./src/docs/renderer.js",
              name: "docs_window",
            },
          ],
        },
      },
    ],
  ],
};
