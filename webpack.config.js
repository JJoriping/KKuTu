const Path = require("path");
const NodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node",
  entry: {
    'Game': Path.resolve(__dirname, "src/back/game/Main.ts"),
    'Web': Path.resolve(__dirname, "src/back/web/Main.ts")
  },
  output: {
    path: Path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        use: [
          {
            loader: "tslint-loader",
            options: {
              configFile: "tslint.json",
              emitErrors: true,
              fix: true
            }
          }
        ]
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [ ".ts" ],
    alias: {
      'back': Path.resolve(__dirname, "src/back")
    }
  },
  node: {
    __dirname: false
  },
  externals: [
    NodeExternals()
  ]
};
