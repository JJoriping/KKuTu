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