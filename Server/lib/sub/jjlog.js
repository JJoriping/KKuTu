// 모듈 호출

var colors = require('colors');

function callLog(text){
	var date = new Date();
	var o = {
		year: 1900 + date.getYear(),
		month: date.getMonth() + 1,
		date: date.getDate(),
		hour: date.getHours(),
		minute: date.getMinutes(),
		second: date.getSeconds()
	}, i;
	
	for(i in o){
		if(o[i] < 10) o[i] = "0"+o[i];
		else o[i] = o[i].toString();
	}
	console.log("["+o.year+"-"+o.month+"-"+o.date+" "+o.hour+":"+o.minute+":"+o.second+"] "+text);
}
exports.log = function(text){
	callLog(text);
};
exports.info = function(text){
	callLog(text.cyan);
};
exports.success = function(text){
	callLog(text.green);
};
exports.alert = function(text){
	callLog(text.yellow);
};
exports.warn = function(text){
	callLog(text.black.bgYellow);
};
exports.error = function(text){
	callLog(text.bgRed);
};