const FS = require("fs");
const Path = require("path");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

const entry = FS.readdirSync(Path.resolve(__dirname, "src/front")).reduce((pv, v) => {
  if(FS.statSync(Path.resolve(__dirname, "src/front", v)).isDirectory()){
    return pv;
  }
  const name = v.slice(0, v.length - 3);

  pv[`scripts/${name}`] = [
    Path.resolve(__dirname, "src/front", `${name}.ts`),
    Path.resolve(__dirname, "dist/views", `${name}.scss`)
  ];
  return pv;
}, {});

module.exports = {
  entry,
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
  resolve: {
    extensions: [ ".ts" ],
    alias: {
      'back': Path.resolve(__dirname, "src/back"),
      'front': Path.resolve(__dirname, "src/front")
    }
  },
  plugins: [
    new MiniCSSExtractPlugin({
      filename: "[name].css"
    })
  ],
  externals: {
    'cluster': {},
    'fs': {},
    'jquery': "$"
  }
};
