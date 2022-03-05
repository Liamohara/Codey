const rules = require("./webpack.rules");

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
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
