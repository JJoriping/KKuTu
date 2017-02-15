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

var Const = require('../../const');
var Lizard = require('../../sub/lizard');
var DB;
var DIC;

var ROBOT_SEEK_DELAY = [ 5000, 3000, 1500, 700, 100 ];
var ROBOT_CATCH_RATE = [ 0.05, 0.2, 0.4, 0.6, 0.99 ];
var ROBOT_TYPE_COEF = [ 2000, 1200, 800, 300, 0 ];

exports.init = function(_DB, _DIC){
	DB = _DB;
	DIC = _DIC;
};
exports.getTitle = function(){
	var R = new Lizard.Tail();
	var my = this;
	var means = [];
	var mdb = [];
	
	my.game.started = false;
	DB.kkutu_cw[my.rule.lang].find().on(function($box){
		var answers = {};
		var boards = [];
		var maps = [];
		var left = my.round;
		var pick, pi, i, j;
		var mParser = [];
		
		while(left){
			pick = $box[pi = Math.floor(Math.random() * $box.length)];
			if(!pick) return;
			$box.splice(pi, 1);
			if(maps.includes(pick.map)) continue;
			means.push({});
			mdb.push({});
			maps.push(pick.map);
			boards.push(pick.data.split('|').map(function(item){ return item.split(','); }));
			left--;
		}
		for(i in boards){
			for(j in boards[i]){
				pi = boards[i][j];
				mParser.push(getMeaning(i, pi));
				answers[`${i},${pi[0]},${pi[1]},${pi[2]}`] = pi.pop();
			}
		}
		my.game.numQ = mParser.length;
		Lizard.all(mParser).then(function(){
			my.game.prisoners = {};
			my.game.answers = answers;
			my.game.boards = boards;
			my.game.means = means;
			my.game.mdb = mdb;
			R.go("①②③④⑤⑥⑦⑧⑨⑩");
		});
	});
	function getMeaning(round, bItem){
		var R = new Lizard.Tail();
		var word = bItem[4];
		var x = Number(bItem[0]), y = Number(bItem[1]);
		
		DB.kkutu[my.rule.lang].findOne([ '_id', word ]).on(function($doc){
			if(!$doc) return R.go(null);
			var rk = `${x},${y}`;
			var i, o;
			
			means[round][`${rk},${bItem[2]}`] = o = {
				count: 0,
				x: x, y: y,
				dir: Number(bItem[2]), len: Number(bItem[3]),
				type: $doc.type,
				theme: $doc.theme,
				mean: $doc.mean.replace(new RegExp(word.split('').map(function(w){ return w + "\\s?"; }).join(''), "g"), "★")
			};
			for(i=0; i<o.len; i++){
				rk = `${x},${y}`;
				if(!mdb[round][rk]) mdb[round][rk] = [];
				mdb[round][rk].push(o);
				if(o.dir) y++; else x++;
			}
			R.go(true);
		});
		return R;
	}
	return R;
};
exports.roundReady = function(){
	var my = this;
	
	if(!my.game.started){
		my.game.started = true;
		my.game.roundTime = my.time * 1000;
		my.byMaster('roundReady', {
			seq: my.game.seq
		}, true);
		setTimeout(my.turnStart, 2400);
	}else{
		my.roundEnd();
	}
};
exports.turnStart = function(){
	var my = this;
	
	my.game.late = false;
	my.game.roundAt = (new Date()).getTime();
	my.game.qTimer = setTimeout(my.turnEnd, my.game.roundTime);
	my.byMaster('turnStart', {
		boards: my.game.boards,
		means: my.game.means
	}, true);
	
	/*for(i in my.game.robots){
		my.readyRobot(my.game.robots[i]);
	}*/
};
function turnHint(){
	var my = this;
	
	my.byMaster('turnHint', {
		hint: my.game.hint[my.game.meaned++]
	}, true);
}
exports.turnEnd = function(){
	var my = this;
	var i;
	
	my.game.late = true;
	my.byMaster('turnEnd', {});
	my.game._rrt = setTimeout(my.roundReady, 2500);
};
exports.submit = function(client, text, data){
	var my = this;
	var obj, score, mbjs, mbj, jx, jy, v;
	var play = (my.game.seq ? my.game.seq.includes(client.id) : false) || client.robot;
	var i, j, key;
	
	if(!my.game.boards) return;
	if(!my.game.answers) return;
	if(!my.game.mdb) return;
	if(data && play){
		key = `${data[0]},${data[1]},${data[2]},${data[3]}`;
		obj = my.game.answers[key];
		mbjs = my.game.mdb[data[0]];
		if(!mbjs) return;
		if(obj && obj == text){
			score = text.length * 10;
			
			jx = Number(data[1]), jy = Number(data[2]);
			my.game.prisoners[key] = text;
			my.game.answers[key] = false;
			for(i=0; i<obj.length; i++){
				if(mbj = mbjs[`${jx},${jy}`]){
					for(j in mbj){
						key = [ data[0], mbj[j].x, mbj[j].y, mbj[j].dir ];
						if(++mbj[j].count == mbj[j].len){
							if(v = my.game.answers[key.join(',')]) setTimeout(my.submit, 1, client, v, key);
						}
					}
				}
				if(data[3] == "1") jy++; else jx++;
			}
			client.game.score += score;
			client.publish('turnEnd', {
				target: client.id,
				pos: data,
				value: text,
				score: score
			});
			client.invokeWordPiece(text, 1.2);
			if(--my.game.numQ < 1){
				clearTimeout(my.game.qTimer);
				my.turnEnd();
			}
		}else client.send('turnHint', { value: text });
	}else{
		client.chat(text);
	}
};
exports.getScore = function(text, delay){
	var my = this;
	var rank = my.game.hum - my.game.primary + 3;
	var tr = 1 - delay / my.game.roundTime;
	var score = (rank * rank * 3) * ( 0.5 + 0.5 * tr );

	return Math.round(score * my.game.themeBonus);
};
/*exports.readyRobot = function(robot){
	var my = this;
	var level = robot.level;
	var delay, text;
	var board, data, obj;
	var i;
	
	if(my.game.late) return;
	clearTimeout(robot._timerSeek);
	clearTimeout(robot._timerCatch);
	if(robot._board == undefined) changeBoard();
	delay = ROBOT_SEEK_DELAY[level];
	if(Math.random() < ROBOT_CATCH_RATE[level]){
		robot._timerCatch = false;
		board = my.game.boards[robot._board];
		for(i in board){
			data = board[i];
			key = `${robot._board},${data[0]},${data[1]},${data[2]}`;
			if(obj = my.game.answers[key]){
				delay += obj.length * ROBOT_TYPE_COEF[level];
				robot._timerCatch = setTimeout(my.turnRobot, delay, robot, obj, key.split(','));
				break;
			}
		}
		if(!robot._timerCatch) changeBoard();
	}else if(Math.random() < 0.05){
		changeBoard();
	}
	robot._timerSeek = setTimeout(my.readyRobot, delay, robot);
	function changeBoard(){
		robot._board = Math.floor(Math.random() * my.game.boards.length);
	}
};*/