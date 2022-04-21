const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, "..", "src", "main", "client"),
        to: path.resolve(__dirname, "..", ".webpack", "main", "client"),
      },
    ],
  }),
];
