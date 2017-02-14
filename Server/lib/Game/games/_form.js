var Const = require('../../const');
var Lizard = require('../../sub/lizard');
var DB;
var DIC;
var ROOM;

exports.init = function(_DB, _DIC, _ROOM){
	DB = _DB;
	DIC = _DIC;
	ROOM = _ROOM;
};
exports.getTitle = function(){
	var R = new Lizard.Tail();
	var my = this;
	
	return R;
};
exports.roundReady = function(){
	var my = this;
	
};
exports.turnStart = function(){
	var my = this;
	
};
exports.turnEnd = function(){
	var my = this;
	
};
exports.submit = function(client, text, data){
	var my = this;
	
};
exports.getScore = function(text, delay){
	var my = this;
	
	

	return 0;
};