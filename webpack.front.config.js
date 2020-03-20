/*
 * Rule the words! KKuTu Online
 * Copyright (C) 2020  JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
            loader: "eslint-loader",
            options: {
              emitError: true,
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
