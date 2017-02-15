/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const Spawn = require("child_process").spawn;
const FS = require("fs");

let step = [
	() => { console.log("Please wait... This may take several minutes."); doStep() },
	() => summon("npm install"),
	() => summon(`npm install ./lib --prefix "./lib"`),
	() => removeCmd("acorn"),
	() => removeCmd("cake"),
	() => removeCmd("coffee"),
	() => removeCmd("cleancss"),
	() => removeCmd("dateformat"),
	() => removeCmd("esparse"),
	() => removeCmd("esvalidate"),
	() => removeCmd("gzip-size"),
	() => removeCmd("js-yaml"),
	() => removeCmd("mime"),
	() => removeCmd("nopt"),
	() => removeCmd("pretty-bytes"),
	() => removeCmd("rimraf"),
	() => removeCmd("semver"),
	() => removeCmd("strip-indent"),
	() => removeCmd("uglifyjs"),
	() => removeCmd("which")
];

function summon(cmd){
	console.log(cmd);

	let args = cmd.split(' ');
	let proc = Spawn(args[0], args.slice(1), { shell: true });

	proc.stdout.on('data', msg => {
		console.log(msg.toString());
	});
	proc.on('close', doStep);
}
function removeCmd(cmd){
	let f1 = `./lib/${cmd}`, f2 = `./lib/${cmd}.cmd`;

	FS.unlink(f1, () => FS.unlink(f2, doStep));
}
function doStep(){
	let next = step.shift();

	if(next) next();
	else{
		console.log("Completed.");
		process.exit();
	}
}
doStep();