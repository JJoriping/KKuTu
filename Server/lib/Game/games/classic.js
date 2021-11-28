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

const { Raw, Not, MoreThan } = require("typeorm");
var Const = require('../../const');
var DB;
var DIC;

const ROBOT_START_DELAY = [ 1200, 800, 400, 200, 0 ];
const ROBOT_TYPE_COEF = [ 1250, 750, 500, 250, 0 ];
const ROBOT_THINK_COEF = [ 4, 2, 1, 0, 0 ];
const ROBOT_HIT_LIMIT = [ 8, 4, 2, 1, 0 ];
const ROBOT_LENGTH_LIMIT = [ 3, 4, 9, 99, 99 ];
const RIEUL_TO_NIEUN = [4449, 4450, 4457, 4460, 4462, 4467];
const RIEUL_TO_IEUNG = [4451, 4455, 4456, 4461, 4466, 4469];
const NIEUN_TO_IEUNG = [4455, 4461, 4466, 4469];

exports.init = function(_DB, _DIC){
	DB = _DB;
	DIC = _DIC;
};
exports.getTitle = function(){
	return new Promise(async (resolve) => {
		var my = this;
		var l = my.rule;
		var EXAMPLE;
		var eng, ja;
		
		if(!l) return resolve("undefinedd");
		if(!l.lang) return resolve("undefinedd");
		
		EXAMPLE = Const.EXAMPLE_TITLE[l.lang];
		my.game.dic = {};
		
		switch(Const.GAME_TYPE[my.mode]){
			case 'EKT':
			case 'ESH':
				eng = "^" + String.fromCharCode(97 + Math.floor(Math.random() * 26));
				break;
			case 'KKT':
				my.game.wordLength = 3;
			case 'KSH':
				ja = 44032 + 588 * Math.floor(Math.random() * 18);
				eng = "^[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]";
				break;
			case 'KAP':
				ja = 44032 + 588 * Math.floor(Math.random() * 18);
				eng = "[\\u" + ja.toString(16) + "-\\u" + (ja + 587).toString(16) + "]$";
				break;
		}
		async function tryTitle(h){
			if(h > 50) return resolve(EXAMPLE);
			
			const q = { where: { _id: Raw((_id) => `LENGTH(${_id}) = ${Math.max(1, my.round)} ${l.lang != "ko" ? "AND " + _id + " ~ '" + Const.ENG_ID + "'" : ""}`) }, take: 20 };
			if(l.lang == "ko") q.where.type = Raw((type) => `${type} ~ '${Const.KOR_GROUP}'`);
			const $md = await DB.kkutu[l.lang].find(q);
			
			if($md.length){
				list = shuffle($md);
				checkTitle(list.shift()._id).then(onChecked);
			
				function onChecked(v){
					if(v) resolve(v);
					else if(list.length) checkTitle(list.shift()._id).then(onChecked);
					else resolve(EXAMPLE);
				}
			}else{
				await tryTitle(h + 10);
			}
		}
		function checkTitle(title){
			return new Promise((resolve) => {
				var i, list = [];
				var len;
				
				/* 부하가 너무 걸린다면 주석을 풀자.
				resolve(true);
				*/
				
				if(title == null) resolve(EXAMPLE);
				else{
					len = title.length;
					for(i=0; i<len; i++) list.push(getAuto.call(my, title[i], getSubChar.call(my, title[i]), 1));
					
					Promise.all(list).then(function(res){
						for(i in res) if(!res[i]) resolve(EXAMPLE);
						
						return resolve(title);
					});
				}
			});
		}
		await tryTitle(10);
	});
};
exports.roundReady = function(){
	var my = this;
	if(!my.game.title) return;
	
	clearTimeout(my.game.turnTimer);
	my.game.round++;
	my.game.roundTime = my.time * 1000;
	if(my.game.round <= my.round){
		my.game.char = my.game.title[my.game.round - 1];
		my.game.subChar = getSubChar.call(my, my.game.char);
		my.game.chain = [];
		if(my.opts.mission) my.game.mission = getMission(my.rule.lang);
		if(my.opts.sami) my.game.wordLength = 2;
		
		my.byMaster('roundReady', {
			round: my.game.round,
			char: my.game.char,
			subChar: my.game.subChar,
			mission: my.game.mission
		}, true);
		my.game.turnTimer = setTimeout(my.turnStart, 2400);
	}else{
		my.roundEnd();
	}
};
exports.turnStart = function(force){
	var my = this;
	var speed;
	var si;
	
	if(!my.game.chain) return;
	my.game.roundTime = Math.min(my.game.roundTime, Math.max(10000, 150000 - my.game.chain.length * 1500));
	speed = my.getTurnSpeed(my.game.roundTime);
	clearTimeout(my.game.turnTimer);
	clearTimeout(my.game.robotTimer);
	my.game.late = false;
	my.game.turnTime = 15000 - 1400 * speed;
	my.game.turnAt = (new Date()).getTime();
	if(my.opts.sami) my.game.wordLength = (my.game.wordLength == 3) ? 2 : 3;
	
	my.byMaster('turnStart', {
		turn: my.game.turn,
		char: my.game.char,
		subChar: my.game.subChar,
		speed: speed,
		roundTime: my.game.roundTime,
		turnTime: my.game.turnTime,
		mission: my.game.mission,
		wordLength: my.game.wordLength,
		seq: force ? my.game.seq : undefined
	}, true);
	my.game.turnTimer = setTimeout(my.turnEnd, Math.min(my.game.roundTime, my.game.turnTime + 100));
	if(si = my.game.seq[my.game.turn]) if(si.robot){
		si._done = [];
		my.readyRobot(si);
	}
};
exports.turnEnd = function(){
	var my = this;
	var target;
	var score;
	
	if(!my.game.seq) return;
	target = DIC[my.game.seq[my.game.turn]] || my.game.seq[my.game.turn];
	
	if(my.game.loading){
		my.game.turnTimer = setTimeout(my.turnEnd, 100);
		return;
	}
	my.game.late = true;
	if(target) if(target.game){
		score = Const.getPenalty(my.game.chain, target.game.score);
		target.game.score += score;
	}
	getAuto.call(my, my.game.char, my.game.subChar, 0).then(function(w){
		my.byMaster('turnEnd', {
			ok: false,
			target: target ? target.id : null,
			score: score,
			hint: w
		}, true);
		my.game._rrt = setTimeout(my.roundReady, 3000);
	});
	clearTimeout(my.game.robotTimer);
};
exports.submit = async function(client, text){
	var score, l, t;
	var my = this;
	var tv = (new Date()).getTime();
	var mgt = my.game.seq[my.game.turn];
	
	if(!mgt) return;
	if(!mgt.robot) if(mgt != client.id) return;
	if(!my.game.char) return;
	
	if(!isChainable(text, my.mode, my.game.char, my.game.subChar)) return client.chat(text);
	if(my.game.chain.indexOf(text) != -1) return client.publish('turnError', { code: 409, value: text }, true);
	
	l = my.rule.lang;
	my.game.loading = true;
	function onDB($doc){
		if(!my.game.chain) return;
		var preChar = getChar.call(my, text);
		var preSubChar = getSubChar.call(my, preChar);
		var firstMove = my.game.chain.length < 1;
		
		function preApproved(){
			async function approved(){
				if(my.game.late) return;
				if(!my.game.chain) return;
				if(!my.game.dic) return;
				
				my.game.loading = false;
				my.game.late = true;
				clearTimeout(my.game.turnTimer);
				t = tv - my.game.turnAt;
				score = my.getScore(text, t);
				my.game.dic[text] = (my.game.dic[text] || 0) + 1;
				my.game.chain.push(text);
				my.game.roundTime -= t;
				my.game.char = preChar;
				my.game.subChar = preSubChar;
				client.game.score += score;
				client.publish('turnEnd', {
					ok: true,
					value: text,
					mean: $doc.mean,
					theme: $doc.theme,
					wc: $doc.type,
					score: score,
					bonus: (my.game.mission === true) ? score - my.getScore(text, t, true) : 0,
					baby: $doc.baby
				}, true);
				if(my.game.mission === true){
					my.game.mission = getMission(my.rule.lang);
				}
				setTimeout(my.turnNext, my.game.turnTime / 6);
				if(!client.robot){
					client.invokeWordPiece(text, 1);
					const word = await DB.kkutu[l].findOne({ where: { _id: text } });
					word.hit = $doc.hit + 1;
					await DB.kkutu[l].save(word);
				}
			}
			if(firstMove || my.opts.manner) getAuto.call(my, preChar, preSubChar, 1).then(function(w){
				if(w) approved();
				else{
					my.game.loading = false;
					client.publish('turnError', { code: firstMove ? 402 : 403, value: text }, true);
					if(client.robot){
						my.readyRobot(client);
					}
				}
			});
			else approved();
		}
		function denied(code){
			my.game.loading = false;
			client.publish('turnError', { code: code || 404, value: text }, true);
		}
		if($doc){
			if(!my.opts.injeong && ($doc.flag & Const.KOR_FLAG.INJEONG)) denied();
			else if(my.opts.strict && (!$doc.type.match(Const.KOR_STRICT) || $doc.flag >= 4)) denied(406);
			else if(my.opts.loanword && ($doc.flag & Const.KOR_FLAG.LOANWORD)) denied(405);
			else preApproved();
		}else{
			denied();
		}
	}
	function isChainable(){
		var type = Const.GAME_TYPE[my.mode];
		var char = my.game.char, subChar = my.game.subChar;
		var l = char.length;
		
		if(!text) return false;
		if(text.length <= l) return false;
		if(my.game.wordLength && text.length != my.game.wordLength) return false;
		if(type == "KAP") return (text.slice(-1) == char) || (text.slice(-1) == subChar);
		switch(l){
			case 1: return (text[0] == char) || (text[0] == subChar);
			case 2: return (text.substr(0, 2) == char);
			case 3: return (text.substr(0, 3) == char) || (text.substr(0, 2) == char.slice(1));
			default: return false;
		}
	}
	const q = { where: { _id: Raw((_id) => `${_id} = '${text}' ${l != "ko" ? "AND " + _id + " ~ '" + Const.ENG_ID + "'" : ""}`) } };
	if(l == "ko") q.where.type = Raw((type) => `${type} ~ '${Const.KOR_GROUP}'`);
	DB.kkutu[l].findOne(q).then(onDB);
};
exports.getScore = function(text, delay, ignoreMission){
	var my = this;
	var tr = 1 - delay / my.game.turnTime;
	var score, arr;
	
	if(!text || !my.game.chain || !my.game.dic) return 0;
	score = Const.getPreScore(text, my.game.chain, tr);
	
	if(my.game.dic[text]) score *= 15 / (my.game.dic[text] + 15);
	if(!ignoreMission) if(arr = text.match(new RegExp(my.game.mission, "g"))){
		score += score * 0.5 * arr.length;
		my.game.mission = true;
	}
	return Math.round(score);
};
exports.readyRobot = function(robot){
	var my = this;
	var level = robot.level;
	var delay = ROBOT_START_DELAY[level];
	var ended = {};
	var w, text, i;
	var lmax;
	var isRev = Const.GAME_TYPE[my.mode] == "KAP";
	
	getAuto.call(my, my.game.char, my.game.subChar, 2).then(function(list){
		if(list.length){
			list.sort(function(a, b){ return b.hit - a.hit; });
			if(ROBOT_HIT_LIMIT[level] > list[0].hit) denied();
			else{
				if(level >= 3 && !robot._done.length){
					if(Math.random() < 0.5) list.sort(function(a, b){ return b._id.length - a._id.length; });
					if(list[0]._id.length < 8 && my.game.turnTime >= 2300){
						for(i in list){
							w = list[i]._id.charAt(isRev ? 0 : (list[i]._id.length - 1));
							if(!ended.hasOwnProperty(w)) ended[w] = [];
							ended[w].push(list[i]);
						}
						getWishList(Object.keys(ended)).then(function(key){
							var v = ended[key];
							
							if(!v) denied();
							else pickList(v);
						});
					}else{
						pickList(list);
					}
				}else pickList(list);
			}
		}else denied();
	});
	function denied(){
		text = isRev ? `T.T ...${my.game.char}` : `${my.game.char}... T.T`;
		after();
	}
	function pickList(list){
		if(list) do{
			if(!(w = list.shift())) break;
		}while(w._id.length > ROBOT_LENGTH_LIMIT[level] || robot._done.includes(w._id));
		if(w){
			text = w._id;
			delay += 500 * ROBOT_THINK_COEF[level] * Math.random() / Math.log(1.1 + w.hit);
			after();
		}else denied();
	}
	function after(){
		delay += text.length * ROBOT_TYPE_COEF[level];
		robot._done.push(text);
		setTimeout(my.turnRobot, delay, robot, text);
	}
	function getWishList(list){
		return new Promise((resolve) => {
			var wz = [];
			var res;
			
			for(i in list) wz.push(getWish(list[i]));
			Promise.all(wz).then(function($res){
				if(!my.game.chain) return;
				$res.sort(function(a, b){ return a.length - b.length; });
				
				if(my.opts.manner || !my.game.chain.length){
					while(res = $res.shift()) if(res.length) break;
				}else res = $res.shift();
				resolve(res ? res.char : null);
			});
		});
	}
	function getWish(char){
		return new Promise(async (resolve) => {
			const $res = await DB.kkutu[my.rule.lang].find({ where: { _id: Raw((_id) => `${_id} ~ '${isRev ? "." + char + "$" : "^" + char + "."}'`) }, take: 10 });
			resolve({ char, length: $res.length });
		});
	}
};
function getMission(l){
	var arr = (l == "ko") ? Const.MISSION_ko : Const.MISSION_en;
	
	if(!arr) return "-";
	return arr[Math.floor(Math.random() * arr.length)];
}
function getAuto(char, subc, type){
	return new Promise(async (resolve) => {
		/* type
			0 무작위 단어 하나
			1 존재 여부
			2 단어 목록
		*/
		var my = this;
		var gameType = Const.GAME_TYPE[my.mode];
		var adv, adc;
		var key = gameType + "_" + keyByOptions(my.opts);
		var MAN = DB.kkutu_manner[my.rule.lang];
		var bool = type == 1;
		
		adc = char + (subc ? ("|"+subc) : "");
		switch(gameType){
			case 'EKT':
				adv = `^(${adc})..`;
				break;
			case 'KSH':
				adv = `^(${adc}).`;
				break;
			case 'ESH':
				adv = `^(${adc})...`;
				break;
			case 'KKT':
				adv = `^(${adc}).{${my.game.wordLength-1}}$`;
				break;
			case 'KAP':
				adv = `.(${adc})$`;
				break;
		}
		if(!char){
			console.log(`Undefined char detected! key=${key} type=${type} adc=${adc}`);
		}
		const $mn = await MAN.findOne({ _id: char || "★" });
		if($mn && bool){
			if(!$mn.data[key]) produce();
			else resolve($mn.data[key]);
		}else{
			await produce();
		}
		async function produce(){
			const aqs = { where: { _id: Raw((_id) => `${_id} ~ '${adv}'`) }, take: bool ? 1 : 123 };
			var aft;
			var lst;
			
			if(!my.opts.injeong) aqs.where.flag = Raw((flag) => `${flag} & ${Const.KOR_FLAG.INJEONG} = 0`);
			if(my.rule.lang == "ko"){
				if(my.opts.loanword) aqs.where.flag = Raw((flag) => `${flag} & ${Const.KOR_FLAG.LOANWORD} = 0`);
				if(my.opts.strict){
					aqs.where.type = Raw((type) => `${type} ~ '${Const.KOR_STRICT}'`);
					aqs.where.flag = Not(MoreThan(3));
				}
				else aqs.where.type = Raw((type) => `${type} ~ '${Const.KOR_GROUP}'`);
			}else{
				aqs.where._id = Raw((_id) => `${_id} ~ '${Const.ENG_ID}'`);
			}
			switch(type){
				case 0:
				default:
					aft = function($md){
						resolve($md[Math.floor(Math.random() * $md.length)]);
					};
					break;
				case 1:
					aft = function($md){
						resolve($md.length ? true : false);
					};
					break;
				case 2:
					aft = function($md){
						resolve($md);
					};
					break;
			}
			const $md = await DB.kkutu[my.rule.lang].find(aqs);
			await forManner($md);
			if(my.game.chain) aft($md.filter(function(item){ return !my.game.chain.includes(item); }));
			else aft($md);
			async function forManner(list){
				lst = list;
				const word = (await MAN.findOne({ where: { _id: char } })) || new DB.Manner(my.rule.lang, char);
				word.data[key] = !!lst.length;
				await MAN.save(word);
			}
		}
	});
}
function keyByOptions(opts){
	var arr = [];
	
	if(opts.injeong) arr.push('X');
	if(opts.loanword) arr.push('L');
	if(opts.strict) arr.push('S');
	return arr.join('');
}
function shuffle(arr){
	var i, r = [];
	
	for(i in arr) r.push(arr[i]);
	r.sort(function(a, b){ return Math.random() - 0.5; });
	
	return r;
}
function getChar(text){
	var my = this;
	
	switch(Const.GAME_TYPE[my.mode]){
		case 'EKT': return text.slice(text.length - 3);
		case 'ESH':
		case 'KKT':
		case 'KSH': return text.slice(-1);
		case 'KAP': return text.charAt(0);
	}
};
function getSubChar(char){
	var my = this;
	var r;
	var c = char.charCodeAt();
	var k;
	var ca, cb, cc;
	
	switch(Const.GAME_TYPE[my.mode]){
		case "EKT":
			if(char.length > 2) r = char.slice(1);
			break;
		case "KKT": case "KSH": case "KAP":
			k = c - 0xAC00;
			if(k < 0 || k > 11171) break;
			ca = [ Math.floor(k/28/21), Math.floor(k/28)%21, k%28 ];
			cb = [ ca[0] + 0x1100, ca[1] + 0x1161, ca[2] + 0x11A7 ];
			cc = false;
			if(cb[0] == 4357){ // ㄹ에서 ㄴ, ㅇ
				cc = true;
				if(RIEUL_TO_NIEUN.includes(cb[1])) cb[0] = 4354;
				else if(RIEUL_TO_IEUNG.includes(cb[1])) cb[0] = 4363;
				else cc = false;
			}else if(cb[0] == 4354){ // ㄴ에서 ㅇ
				if(NIEUN_TO_IEUNG.indexOf(cb[1]) != -1){
					cb[0] = 4363;
					cc = true;
				}
			}
			if(cc){
				cb[0] -= 0x1100; cb[1] -= 0x1161; cb[2] -= 0x11A7;
				r = String.fromCharCode(((cb[0] * 21) + cb[1]) * 28 + cb[2] + 0xAC00);
			}
			break;
		case "ESH": default:
			break;
	}
	return r;
}