const rules = require("./webpack.rules");

// rules.push({
//   test: /\.js$/,
//   include: path.resolve(__dirname, "src"),
//   loader: "babel-loader",
//   query: {
//     presets: ["env"],
//   },
// });

// rules.push({
//   test: /\.js$/,
//   include: /src/,
//   use: {
//     loader: "babel-loader",
//     options: {
//       presets: ["@babel/preset-env"],
//       plugins: ["@babel/plugin-transform-runtime"],
//       // plugins: [
//       //   "@babel/plugin-proposal-private-methods",
//       //   "@babel/plugin-proposal-class-properties",
//       //   "@babel/plugin-proposal-object-rest-spread",
//       // ],
//       sourceType: "unambiguous",
//     },
//   },
// });

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/main.js",
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
