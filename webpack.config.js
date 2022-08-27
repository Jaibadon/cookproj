const path = require('path');

module.exports = {
    experiments: {
        topLevelAwait: true
      },
    mode: "development",
    devtool: "eval-source-map",
    entry: ["./src/firebaseinit.js"],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'bundle.js'
    }
};