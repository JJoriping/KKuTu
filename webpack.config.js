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
