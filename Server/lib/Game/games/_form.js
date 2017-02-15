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

﻿var Const = require('../../const');
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