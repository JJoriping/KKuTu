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

const fs = require('fs');
const Spawn = require("child_process").spawn;
const JLog = require("./lib/sub/jjlog");
const PKG = require("./package.json");
const LANG = require("../language.json");
const SETTINGS = require("../settings.json");
const SCRIPTS = {
	'server-on': startServer,
	'server-off': stopServer,
	'program-info': () => {
		exports.send('alert', [
			`=== ${PKG.name} ===`,
			`${PKG.description}`, "",
			`Version: ${PKG.version}`,
			`Author: ${PKG.author}`,
			`License: ${PKG.license}`,
			`Repository: ${PKG.repository}`
		].join('\n'));
	},
	'program-blog': () => exports.send('external', "http://blog.jjo.kr/"),
	'program-repo': () => exports.send('external', "https://github.com/JJoriping/KKuTu"),
	'exit': () => process.exit(0)
};
// 해티 수정 (42~97)
if (SETTINGS.log.enabled) {
	const winston = require('winston');
	const winstonDaily = require('winston-daily-rotate-file');
	const moment = require('moment');
	function timeStampFormat() {
		return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ');
	};
	
	var logger = winston.createLogger({
		transports: [
			new (winstonDaily)({
				name: 'info-file',
				filename: SETTINGS.log.infopath,
				datePattern: SETTINGS.log.datepattern,
				colorize: false,
				maxsize: SETTINGS.log.maxsize,
				maxFiles: SETTINGS.log.maxfile,
				level: 'info',
				showLevel: true,
				json: false,
				timestamp: timeStampFormat
			}),
			new (winston.transports.Console)({
				name: 'debug-console',
				colorize: true,
				level: 'debug',
				showLevel: true,
				json: false,
				timestamp: timeStampFormat
			})
		],
		exceptionHandlers: [
			new (winstonDaily)({
				name: 'exception-file',
				filename: SETTINGS.log.exceptionpath,
				datePattern: SETTINGS.log.datepattern,
				colorize: false,
				maxsize: SETTINGS.log.maxsize,
				maxFiles: SETTINGS.log.maxfile,
				level: 'error',
				showLevel: true,
				json: false,
				timestamp: timeStampFormat
			}),
			new (winston.transports.Console)({
				name: 'exception-console',
				colorize: true,
				level: 'debug',
				showLevel: true,
				json: false,
				timestamp: timeStampFormat
			})
		]
	})
};
// 해티 수정 끝

exports.MAIN_MENU = [
	{
		label: LANG['menu-server'],
		submenu: [
			{
				label: LANG['menu-server-on'],
				accelerator: "CmdOrCtrl+O",
				click: () => exports.run("server-on")
			},
			{
				label: LANG['menu-server-off'],
				accelerator: "CmdOrCtrl+P",
				click: () => exports.run("server-off")
			}
		]
	},
	{
		label: LANG['menu-program'],
		submenu: [
			{
				label: LANG['menu-program-info'],
				click: () => exports.run("program-info")
			},
			{
				label: LANG['menu-program-blog'],
				click: () => exports.run("program-blog")
			},
			{
				label: LANG['menu-program-repo'],
				click: () => exports.run("program-repo")
			},
			{
				label: LANG['menu-program-dev'],
				role: "toggledevtools"
			},
			{ type: "separator" },
			{
				label: LANG['menu-program-exit'],
				accelerator: "Alt+F4",
				click: () => exports.run("exit")
			}
		]
	}
];
exports.run = (cmd) => {
	SCRIPTS[cmd]();
};
exports.send = (...argv) => {
	// override this
};

class ChildProcess{
	constructor(id, cmd, ...argv){
		this.process = Spawn(cmd, argv);
		this.process.stdout.on('data', msg => {
			exports.send('log', 'n', msg);
			// 해티 수정
			if (SETTINGS.log.enabled) logger.info(msg);
		});
		this.process.stderr.on('data', msg => {
			console.error(`${id}: ${msg}`);
			exports.send('log', 'e', msg);
			// 해티 수정
			if (SETTINGS.log.enabled) logger.error("[ERROR]"+msg);
		});
		this.process.on('close', code => {
			let msg;

			this.process.removeAllListeners();
			JLog.error(msg = `${id}: CLOSED WITH CODE ${code}`);
			this.process = null;

			exports.send('log', 'e', msg);
			exports.send('server-status', getServerStatus());
			// 해티 수정
			if (SETTINGS.log.enabled) logger.error("[ERROR]"+msg);
		});
	}
	kill(sig){
		if(this.process) this.process.kill(sig || 'SIGINT');
	}
}
let webServer, gameServers;

function startServer(){
	stopServer();
	// 해티 수정(187~194)
	if(SETTINGS['server-name']) process.env['KKT_SV_NAME'] = SETTINGS['server-name'];
	if(SETTINGS.web.enabled) webServer = new ChildProcess('W', "node", `${__dirname}/lib/Web/cluster.js`, SETTINGS.web.cpu);
	if(SETTINGS.game.enabled) {
		gameServers = [];	
		for(let i=0; i<SETTINGS.game.inst; i++){
			gameServers.push(new ChildProcess('G', "node", `${__dirname}/lib/Game/cluster.js`, i, SETTINGS.game.cpu));
		}
	}
	exports.send('server-status', getServerStatus());
}
function stopServer(){
	if(webServer) webServer.kill();
	if(gameServers) gameServers.forEach(v => v.kill());
}
function getServerStatus(){
	// 해티 수정 (203~209)
	if(SETTINGS.web.enabled && SETTINGS.game.enabled) {
		if(!webServer || !gameServers) return 0;
		if(webServer.process && gameServers.every(v => v.process)) return 2;
	} else if(SETTINGS.web.enabled || SETTINGS.game.enabled) {
		if(!webServer && !gameServers) return 0;
		if(webServer.process || gameServers.every(v => v.process)) return 2;
	}
	return 1;
}
