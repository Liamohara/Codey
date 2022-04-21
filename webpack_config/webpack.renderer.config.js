const rules = require("./webpack.rules");
const extensions = require("./webpack.extensions");
const plugins = require("./webpack.renderer.plugins");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

rules.push({
  test: /\.s(a|c)ss$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    { loader: "sass-loader" },
  ],
});

module.exports = {
  resolve: {
    extensions,
  },
  module: {
    rules,
  },
  plugins,
};
