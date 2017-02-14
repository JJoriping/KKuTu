const PKG = require("./package.json");
const SETTINGS = require("../settings.json");
const {
	app: App,
	BrowserWindow,
	Menu
} = require('electron');
const Pug = require('electron-pug')({ pretty: true }, {
	version: PKG.version,
	serverName: SETTINGS['server-name']
});
const Runner = require("./runner.js");

let mainWindow;

App.on('ready', main);
App.on('window-all-closed', () => {
	if(process.platform != 'darwin'){
		App.quit();
	}
});
App.on('activate', () => {
	if(mainWindow === null){
		main();
	}
});
Runner.send = (...argv) => {
	mainWindow.webContents.send.apply(mainWindow.webContents, argv);
};

function main(){
	Menu.setApplicationMenu(Menu.buildFromTemplate(Runner.MAIN_MENU));

	mainWindow = new BrowserWindow({
		title: `${PKG['name']} ${PKG['version']} - Now loading`,
		width: 800,
		height: 600,
		icon: __dirname + "/../logo.ico"
	});
	mainWindow.loadURL(__dirname + "/views/index.pug");
}