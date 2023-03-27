const File = require("fs");
const { resolve } = require("path");
const { BannerPlugin } = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');

const LICENSE = [
	"Rule the words! KKuTu Online",
	"Copyright (C) 2017 JJoriping(op@jjo.kr)",
	"",
	"This program is free software: you can redistribute it and/or modify",
	"it under the terms of the GNU General Public License as published by",
	"the Free Software Foundation, either version 3 of the License, or",
	"(at your option) any later version.",
	"",
	"This program is distributed in the hope that it will be useful,",
	"but WITHOUT ANY WARRANTY; without even the implied warranty of",
	"MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the",
	"GNU General Public License for more details.",
	"",
	"You should have received a copy of the GNU General Public License",
	"along with this program. If not, see <http://www.gnu.org/licenses/>."
].join('\n');

class ConcatPlugin{
	constructor({ files, destination }){
		this.files = files;
		this.destination = destination;
	}
	apply(compiler){
		const result = ["/**", LICENSE, "*/", "(function(){"];
		
		compiler.hooks.beforeCompile.tap("ConcatPlugin", () => {
			this.files
				.filter(file => File.existsSync(file))
				.forEach(file => result.push(File.readFileSync(file, "utf8")));
			result.push("})();");
			File.writeFileSync(this.destination, result.join("\n"), { encoding: "UTF-8" });
		});
	}
}

const sourcePath = resolve(__dirname, "Web/lib");
const gameSourcePath = resolve(sourcePath, "kkutu");
const distributionPath = resolve(__dirname, "Web/public/js");
const files = File.readdirSync(sourcePath, { withFileTypes: true })
	.filter(u => u.isFile())
	.map(u => u.name);

module.exports = {
	mode: "production",
	target: "web",
	/*
		inline-source-map은 개발 시 개발자 도구 이용을 쉽게 해 줍니다.
		production mode에서는 주석 처리하는 것을 권장합니다. (파일 용량이 커짐)
	*/
	// devtool: "inline-source-map",
	entry: files.reduce((etr, file) => {
		etr[file.substring(0, file.length - 3)] = resolve(sourcePath, file);
		return etr;
	}, {}),
	output: {
		path: distributionPath,
		filename: "[name].min.js"
	},
	plugins: [
		new ConcatPlugin({
			files: [
				resolve(gameSourcePath, "head.js"),
				resolve(gameSourcePath, "ready.js"),
				resolve(gameSourcePath, "rule_classic.js"),
				resolve(gameSourcePath, "rule_jaqwi.js"),
				resolve(gameSourcePath, "rule_crossword.js"),
				resolve(gameSourcePath, "rule_typing.js"),
				resolve(gameSourcePath, "rule_hunmin.js"),
				resolve(gameSourcePath, "rule_daneo.js"),
				resolve(gameSourcePath, "rule_sock.js"),
				resolve(gameSourcePath, "body.js"),
				resolve(gameSourcePath, "tail.js"),
			],
			destination: resolve(sourcePath, "in_game_kkutu.js")
		}),
		new BannerPlugin(LICENSE),
	],
	optimization: {
		minimizer: [new TerserPlugin({
			extractComments: false,
		})],
	},
};