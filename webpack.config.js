const Path = require("path");

const NodeExternals = require("webpack-node-externals");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  target: "node",
  entry: {
    'Web': Path.resolve(__dirname, "src/back/web/Main.ts"),
    'Index': Path.resolve(__dirname, "dist/views/Index.scss")
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
      },
      {
        test: /\.scss$/,
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: "css-loader"
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCSSExtractPlugin({
      filename: "scripts/[name].css"
    })
  ],
  resolve: {
    extensions: [ ".ts", ".js" ],
    alias: {
      'back': Path.resolve(__dirname, "src/back"),
      'front': Path.resolve(__dirname, "src/front")
    }
  },
  node: {
    __dirname: false
  },
  externals: [
    NodeExternals()
  ]
};
