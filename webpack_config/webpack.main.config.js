const rules = require("./webpack.rules");
const extensions = require("./webpack.extensions");
const plugins = require("./webpack.main.plugins");

module.exports = {
  entry: "./src/main/main.ts",
  resolve: {
    extensions,
  },
  module: {
    rules,
  },
  plugins,
};
