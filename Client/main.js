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