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

var ROBOT_CATCH_RATE = [ 0.1, 0.3, 0.5, 0.7, 0.99 ];
var ROBOT_TYPE_COEF = [ 2000, 1200, 800, 300, 0 ];
var robotTimers = {};

exports.init = function(_DB, _DIC){
	DB = _DB;
	DIC = _DIC;
};
exports.getTitle = function(){
	var R = new Lizard.Tail();
	var my = this;
	
	my.game.done = [];
	setTimeout(function(){
		R.go("①②③④⑤⑥⑦⑧⑨⑩");
	}, 500);
	return R;
};
exports.roundReady = function(){
	var my = this;
	var ijl = my.opts.injpick.length;
	
	clearTimeout(my.game.qTimer);
	clearTimeout(my.game.hintTimer);
	clearTimeout(my.game.hintTimer2);
	my.game.themeBonus = 0.3 * Math.log(0.6 * ijl + 1);
	my.game.winner = [];
	my.game.giveup = [];
	my.game.round++;
	my.game.roundTime = my.time * 1000;
	if(my.game.round <= my.round){
		my.game.theme = my.opts.injpick[Math.floor(Math.random() * ijl)];
		getAnswer.call(my, my.game.theme).then(function($ans){
			if(!my.game.done) return;
			
			// $ans가 null이면 골치아프다...
			my.game.late = false;
			my.game.answer = $ans || {};
			my.game.done.push($ans._id);
			$ans.mean = ($ans.mean.length > 20) ? $ans.mean : getConsonants($ans._id, Math.round($ans._id.length / 2));
			my.game.hint = getHint($ans);
			my.byMaster('roundReady', {
				round: my.game.round,
				theme: my.game.theme
			}, true);
			setTimeout(my.turnStart, 2400);
		});
	}else{
		my.roundEnd();
	}
};
exports.turnStart = function(){
	var my = this;
	var i;
	
	if(!my.game.answer) return;
	
	my.game.conso = getConsonants(my.game.answer._id, 1);
	my.game.roundAt = (new Date()).getTime();
	my.game.meaned = 0;
	my.game.primary = 0;
	my.game.qTimer = setTimeout(my.turnEnd, my.game.roundTime);
	my.game.hintTimer = setTimeout(function(){ turnHint.call(my); }, my.game.roundTime * 0.333);
	my.game.hintTimer2 = setTimeout(function(){ turnHint.call(my); }, my.game.roundTime * 0.667);
	my.byMaster('turnStart', {
		char: my.game.conso,
		roundTime: my.game.roundTime
	}, true);
	
	for(i in my.game.robots){
		my.readyRobot(my.game.robots[i]);
	}
};
function turnHint(){
	var my = this;
	
	my.byMaster('turnHint', {
		hint: my.game.hint[my.game.meaned++]
	}, true);
}
exports.turnEnd = function(){
	var my = this;

	if(my.game.answer){
		my.game.late = true;
		my.byMaster('turnEnd', {
			answer: my.game.answer ? my.game.answer._id : ""
		});
	}
	my.game._rrt = setTimeout(my.roundReady, 2500);
};
exports.submit = function(client, text){
	var my = this;
	var score, t, i;
	var $ans = my.game.answer;
	var now = (new Date()).getTime();
	var play = (my.game.seq ? my.game.seq.includes(client.id) : false) || client.robot;
	var gu = my.game.giveup ? my.game.giveup.includes(client.id) : true;
	
	if(!my.game.winner) return;
	if(my.game.winner.indexOf(client.id) == -1
		&& text == $ans._id
		&& play && !gu
	){
		t = now - my.game.roundAt;
		if(my.game.primary == 0) if(my.game.roundTime - t > 10000){ // 가장 먼저 맞힌 시점에서 10초 이내에 맞히면 점수 약간 획득
			clearTimeout(my.game.qTimer);
			my.game.qTimer = setTimeout(my.turnEnd, 10000);
			for(i in my.game.robots){
				if(my.game.roundTime > my.game.robots[i]._delay){
					clearTimeout(my.game.robots[i]._timer);
					if(client != my.game.robots[i]) if(Math.random() < ROBOT_CATCH_RATE[my.game.robots[i].level])
						my.game.robots[i]._timer = setTimeout(my.turnRobot, ROBOT_TYPE_COEF[my.game.robots[i].level], my.game.robots[i], text);
				}
			}
		}
		clearTimeout(my.game.hintTimer);
		score = my.getScore(text, t);
		my.game.primary++;
		my.game.winner.push(client.id);
		client.game.score += score;
		client.publish('turnEnd', {
			target: client.id,
			ok: true,
			value: text,
			score: score,
			bonus: 0
		}, true);
		client.invokeWordPiece(text, 0.9);
		while(my.game.meaned < my.game.hint.length){
			turnHint.call(my);
		}
	}else if(play && !gu && (text == "gg" || text == "ㅈㅈ")){
		my.game.giveup.push(client.id);
		client.publish('turnEnd', {
			target: client.id,
			giveup: true
		}, true);
	}else{
		client.chat(text);
	}
	if(play) if(my.game.primary + my.game.giveup.length >= my.game.seq.length){
		clearTimeout(my.game.hintTimer);
		clearTimeout(my.game.hintTimer2);
		clearTimeout(my.game.qTimer);
		my.turnEnd();
	}
};
exports.getScore = function(text, delay){
	var my = this;
	var rank = my.game.hum - my.game.primary + 3;
	var tr = 1 - delay / my.game.roundTime;
	var score = 6 * Math.pow(rank, 1.4) * ( 0.5 + 0.5 * tr );

	return Math.round(score * my.game.themeBonus);
};
exports.readyRobot = function(robot){
	var my = this;
	var level = robot.level;
	var delay, text;
	var i;
	
	if(!my.game.answer) return;
	clearTimeout(robot._timer);
	robot._delay = 99999999;
	for(i=0; i<2; i++){
		if(Math.random() < ROBOT_CATCH_RATE[level]){
			text = my.game.answer._id;
			delay = my.game.roundTime / 3 * i + text.length * ROBOT_TYPE_COEF[level];
			robot._timer = setTimeout(my.turnRobot, delay, robot, text);
			robot._delay = delay;
			break;
		}else continue;
	}
};
function getConsonants(word, lucky){
	var R = "";
	var i, len = word.length;
	var c;
	var rv = [];
	
	lucky = lucky || 0;
	while(lucky > 0){
		c = Math.floor(Math.random() * len);
		if(rv.includes(c)) continue;
		rv.push(c);
		lucky--;
	}
	for(i=0; i<len; i++){
		c = word.charCodeAt(i) - 44032;
		
		if(c < 0 || rv.includes(i)){
			R += word.charAt(i);
			continue;
		}else c = Math.floor(c / 588);
		R += Const.INIT_SOUNDS[c];
	}
	return R;
}
function getHint($ans){
	var R = [];
	var h1 = $ans.mean.replace(new RegExp($ans._id, "g"), "★");
	var h2;
	
	R.push(h1);
	do{
		h2 = getConsonants($ans._id, Math.ceil($ans._id.length / 2));
	}while(h1 == h2);
	R.push(h2);
	
	return R;
}
function getAnswer(theme, nomean){
	var my = this;
	var R = new Lizard.Tail();
	var args = [ [ '_id', { $nin: my.game.done } ] ];
	
	args.push([ 'theme', new RegExp("(,|^)(" + theme + ")(,|$)") ]);
	args.push([ 'type', Const.KOR_GROUP ]);
	args.push([ 'flag', { $lte: 7 } ]);
	DB.kkutu['ko'].find.apply(my, args).on(function($res){
		if(!$res) return R.go(null);
		var pick;
		var len = $res.length;
		
		if(!len) return R.go(null);
		do{
			pick = Math.floor(Math.random() * len);
			if($res[pick]._id.length >= 2) if($res[pick].type == "INJEONG" || $res[pick].mean.length >= 0){
				return R.go($res[pick]);
			}
			$res.splice(pick, 1);
			len--;
		}while(len > 0);
		R.go(null);
	});
	return R;
}