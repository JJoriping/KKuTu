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

const {
	ipcRenderer, shell
} = require("electron");
const LANG = require("../../language.json");
let $stage;
let logs = 0;

$(() => {
	$stage = {
		title: $("#title"),
		log: $("#log-board")
	};
	$stage.log.html(LANG['welcome']);
});
ipcRenderer.on('server-status', (ev, code) => {
	$stage.title.removeClass("server-off server-warn server-on");
	switch(code){
		case 0: $stage.title.addClass("server-off"); break;
		case 1: $stage.title.addClass("server-warn"); break;
		case 2: $stage.title.addClass("server-on"); break;
	}
});
ipcRenderer.on('alert', (ev, msg) => {
	alert(msg);
});
ipcRenderer.on('external', (ev, href) => {
	shell.openExternal(href);
});
ipcRenderer.on('log', (ev, level, msg) => {
	if(++logs > 100){
		logs--;
		$(".log-item:first").remove();
	}
	msg = msg.toString()
		.replace(/</g, "&lt;")
		.replace(/&/g, "&amp;")
		.replace(/(error)/gi, `<label class="lt-error">$1</label>`)
	;
	$stage.log.append($(`<div class="log-item log-${level}">${msg}</div>`));
	$stage.log.scrollTop(99999999);
});