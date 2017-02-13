const PKG = require("./package.json");
const Electron = require('electron');
const BrowserWindow = Electron.BrowserWindow;
const Pug = require('electron-pug')({ pretty: true }, {
	title: "KKuTu Client v" + PKG.version
});

let main;

Electron.app.on('ready', onReady);
Electron.app.on('window-all-closed', () => {
	if(process.platform != 'darwin'){
		Electron.app.quit();
	}
});
Electron.app.on('activate', () => {
	if(main === null){
		onReady();
	}
});

function onReady(){
	main = new BrowserWindow({
		width: 800,
		height: 600
	});

	main.loadURL(__dirname + "/index.pug");
}