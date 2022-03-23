const rules = require("./webpack.rules");
const extensions = require("./webpack.extensions");

module.exports = {
  entry: "./src/main/main.ts",
  resolve: {
    extensions,
  },
  module: {
    rules,
  },
};
