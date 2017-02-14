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
	msg = msg.toString().replace(/(error)/gi, `<label class="lt-error">$1</label>`);

	$stage.log.append($(`<div class="log-item log-${level}">${msg}</div>`));
	$stage.log.scrollTop(99999999);
});