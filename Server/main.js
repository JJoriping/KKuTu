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

const PKG = require("./package.json");
const SETTINGS = require("../settings.json");
const {
	app: App,
	BrowserWindow,
	Menu
} = require('electron');
// please set the environmental variable KKT_SV_NAME as the name of your server.
const Pug = require('electron-pug')({ pretty: true }, {
	version: PKG.version,
	serverName: SETTINGS['server-name'] || process.env['KKT_SV_NAME']
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