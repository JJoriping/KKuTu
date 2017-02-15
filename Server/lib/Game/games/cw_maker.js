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

﻿var Prompt = require('prompt');
var DB = require('../../Web/db');
var Const = require('../../const');
var Lizard = require('../../sub/lizard');
var LANG = 'ko';

Prompt.start();
DB.ready = function(){
	var i;
	
	for(i in MAPS){
		MC[MAPS[i].name] = 0;
		MAPS[i].queue = MAPS[i].queue.split(' ').map(function(item){ return item.split(''); });
	}
	DB.kkutu_cw[LANG].find().on(function($res){
		var j, lis, q;
		
		for(i in $res){
			MC[$res[i].map]++;
			lis = $res[i].data.split('|');
			for(j in lis){
				q = lis[j].slice(8);
				if(!words.includes(q)) words.push(q);
			}
		}
		doMining();
	});
	function doMining(){
		getBoard(LANG).then(function(data){
			var j, o, s, t;
			var res = [];
			
			console.log(data.map.name, "\n  0 1 2 3 4 5 6 7");
			for(i=0; i<8; i++){
				s = i + " ";
				for(j=0; j<8; j++){
					if(o = data.board[`${j},${i}`]){
						s += o.char;
					}else{
						s += "　";
					}
				}
				console.log(s);
			}
			console.log("\007");
			for(i in data.map.queue){
				s = data.map.queue[i];
				t = data.board[`${s[0]},${s[1]}`];
				for(j in t.chain){
					o = t.chain[j];
					if(o.pos[2] == s[2]) break;
				}
				res.push([ s[0], s[1], s[2], s[3], o.word ]);
			}
			console.log(res);
			Prompt.get([ 'flush' ], function(err, _res){
				if(_res.flush == "y"){
					MC[data.map.name]++;
					DB.kkutu_cw[LANG].insert([ 'map', data.map.name ], [ 'data', res.map(function(item){ return item.join(','); }).join('|') ]).on();
				}
				setTimeout(doMining, 500);
			});
		});
	}
};
var MC = {};
var MAPS = [
	{ name: "강아지",
		queue: "5003 1103 0202 6202 4303 0403 2502 3605 0213 1013 2412 3012 3512 4212 4612 6212 6612 7013 7413"
	},
	{ name: "거미줄",
		queue: "0002 4202 1302 5303 2404 0503 5502 2602 0513 1014 2314 3612 4013 5214 6513 7014"
	},
	{ name: "꼬마",
		queue: "0003 2103 0203 4304 1404 2602 6602 3704 0013 1213 2013 3414 4114 6212 6612 7314"
	},
	{ name: "나무",
		queue: "0003 5002 1202 4202 2303 6302 0402 5402 1505 0312 1013 1412 2212 3315 4212 5013 5413 6312 7113"
	},
	{ name: "달팽이",
		queue: "5002 1103 6102 0202 3202 2403 6402 0502 1602 5602 2704 0214 1112 1512 2612 3112 4213 5612 6012 6413 7114"
	},
	{ name: "닻",
		queue: "0003 5003 1203 6202 0302 5302 3403 0502 1602 4603 6702 1014 7013 3213 6212 0313 5312 4413 1512 6612"
	},
	{ name: "등불",
		queue: "0002 3004 0204 5203 4403 4603 0703 0013 1216 3013 4413 5213 6013 6413"
	},
	{ name: "로켓",
		queue: "5003 4102 3202 6202 2302 5302 0403 4402 3502 1603 3704 0114 1413 2312 3212 3513 4112 4412 5012 5312 6212 7013"
	},
	{ name: "미역",
		queue: "6002 0102 3102 1202 4204 2303 0403 4402 5503 4602 0012 1112 1413 2213 3012 4114 4612 5413 6013 7212"
	},
	{ name: "뱀",
		queue: "1003 5003 3102 4202 1303 5303 3402 0503 2603 0702 0513 1014 2512 3012 3312 4112 4413 5212 7014"
	},
	{ name: "버섯",
		queue: "1006 0102 6102 0403 5403 1602 5602 2704 0114 1012 1413 2312 2612 5312 5612 6012 6413 7114"
	},
	{ name: "버찌",
		queue: "5003 4102 1204 6302 1403 5402 0602 5602 1703 6702 0512 1612 2213 3414 4112 5012 5413 6312 6612 7014"
	},
	{ name: "번개",
		queue: "5003 4102 1204 0302 6302 3402 1503 6502 0602 5602 3703 0612 1212 1512 3214 4112 5012 5612 6314 7014"
	},
	{ name: "사슴",
		queue: "0003 5003 2102 0202 3203 2302 5302 6402 2604 5703 0013 2012 2314 3113 5014 5612 6312 7013"
	},
	{ name: "선인장",
		queue: "4002 2202 5303 0403 4503 0602 3602 6602 0213 2114 1414 4513 5014 6315 7113"
	},
	{ name: "성",
		queue: "2004 0203 5203 0402 6402 2604 0703 5703 0414 1213 2013 2612 5013 5612 6213 7414"
	},
	{ name: "소라",
		queue: "3003 5102 2202 1302 6302 0402 2503 6602 1702 4703 0413 1312 2212 2513 3013 3412 4513 5012 6113 6612 7314"
	},
	{ name: "악수",
		queue: "0102 3103 5203 1304 6402 0604 5603 3703 0012 4012 1113 3114 5112 7213 6413 0612 3612 5612"
	},
	{ name: "에스",
		queue: "2004 1102 5103 1304 4404 0603 5603 2704 0413 1113 2012 2612 4312 5012 5612 7112 7413"
	},
	{ name: "오징어",
		queue: "2004 1102 5102 1302 4303 1505 0602 2702 5703 0612 1113 1512 2012 2313 3513 4313 5012 5513 6113"
	},
	{ name: "요트",
		queue: "3003 5102 6202 2302 0403 5403 3502 0602 5602 1705 0413 1612 2312 3014 3513 5012 5612 6112 7214"
	},
	{ name: "우산",
		queue: "1005 0102 5102 6202 0304 3403 2502 5503 0703 0113 0513 1012 2513 3313 5012 5412 6112 7214"
	},
	{ name: "전화기",
		queue: "3004 1204 6302 2404 0503 5503 1702 6702 3013 6014 1113 4213 2412 5412 1513 7513"
	},
	{ name: "제기",
		queue: "0002 5103 0202 3203 1302 2403 1502 4502 0602 5603 0702 0013 0612 1212 1513 2313 3112 4214 5013 5512 7112 7512"
	},
	{ name: "쥐",
		queue: "0103 5103 2204 0302 6302 1402 5402 1602 5602 2704 0113 1012 1314 2112 2612 5112 5612 6012 6314 7113"
	},
	{ name: "집",
		queue: "2004 1102 5102 0202 6202 2404 0503 5503 1702 5702 0214 1112 2012 2414 5012 5414 6112 7214"
	},
	{ name: "채찍",
		queue: "3003 2102 4202 0303 6302 4403 0503 5602 0113 0512 1313 2113 2512 3012 4213 5013 5413 6312 6612 7113"
	},
	{ name: "클로버",
		queue: "1003 5002 0102 3102 6102 6302 0402 0602 3602 6602 1702 4703 0413 1015 1612 3012 4612 6012 6315 7113"
	},
	{ name: "토끼",
		queue: "1103 5102 3302 0403 5403 0603 5603 2704 0413 1114 2012 2612 3113 5012 5612 6114 7413"
	},
	{ name: "트럭",
		queue: "5003 3103 1203 0302 3302 6302 4403 6502 0605 0314 1212 1612 3113 3612 4314 5013 6313 7012"
	},
	{ name: "하트",
		queue: "0003 5003 2104 0402 6402 1502 5502 2604 1702 5702 0015 2012 5012 7015 1412 6412 2513 5513"
	},
	{ name: "해파리",
		queue: "3004 2102 6102 0203 1403 6402 0502 5502 2604 0212 0513 1412 2114 2612 3012 3413 5512 6012 6412 7114"
	},
	{ name: "회오리",
		queue: "1003 3102 6102 1304 6302 0402 3404 0602 3602 4703 0413 1012 1312 3012 3314 4114 4612 6312 6612 7113"
	}
];
var words = [ "성교", "음경", "지랄", "불알", "자위", "자지", "보지", "보장지", "개새끼", "성관계", "고자", "창녀" ];

function random(a, b){
	// [a ~ b) 범위 정수
	return a + Math.floor(Math.random() * (b - a));
}
function getMap(){
	/* 희소 행렬 표기법
		[ x, y, 세로?, 길이 ]
	*/
	var i, li, lv = 99999999;
	
	for(i in MAPS){
		if(lv > MC[MAPS[i].name]){
			li = i;
			lv = MC[MAPS[i].name];
		}
	}
	return MAPS[li];
}
function getBoard(lang){
	var R = new Lizard.Tail();
	var MEAN = [ 'mean', new RegExp("^.{9}[^=→][^\.]{15}") ];
	var NO_BUL = new RegExp("^(500|210|120|10)$");
	var board = {};
	var proc = [];
	var map = getMap();
	var queue = map.queue.slice(0);
	var regCache = {};
	
	function process(){
		var i, m = queue.shift();
		var arg = [];
		var reg = "";
		var p, k;
		var mapLen = queue.length;
		
		console.log("[PROCESS] QUEUE: " + mapLen);
		if(!m){
			R.go({ map: map, board: board });
			return;
		}
		p = [ m[0], m[1] ];
		for(i=0; i<m[3]; i++){
			k = p.join(',');
			if(board[k]){
				arg.push(board[k].chain);
				reg += board[k].char;
			}
			else reg += ".";
			p[m[2]]++;
		}
		if(regCache[reg]){
			// if(Math.random() < 0.5 && regCache[reg].length >= 50) regCache[reg].shift();
			onDBFound(regCache[reg].shift());
		}else DB.kkutu[lang].find(
			[ '_id', new RegExp(`^${reg}$`) ],
			[ 'theme', { $not: NO_BUL } ],
			[ '_id', { $nin: words } ],
			[ 'type', Const.KOR_GROUP ],
			[ 'flag', { $lte: 7 } ],
			// (mapLen < 10) ? undefined : [ 'hit', { $gte: 2 } ],
			MEAN
		).limit(500).on(function($docs){
			// regCache[reg] = $docs;
			regCache[reg] = $docs.sort(function(a, b){ return b.hit - a.hit; });
			// if(Math.random() < 0.5 && regCache[reg].length >= 50) regCache[reg].shift();
			onDBFound(regCache[reg].shift());
		});
		function onDBFound($doc){
			var obj = {};
			var pick = $doc; // hit 순으로 하나씩 뽑자.
			var j, l, n;
			
			if(pick && !words.includes(pick._id)){
				obj.word = pick._id;
				obj.mean = pick.mean;
				obj.pos = m;
				p = [ m[0], m[1] ];
				for(j=0; j<m[3]; j++){
					k = p.join(',');
					if(!board[k]) board[k] = { chain: {}, char: obj.word.charAt(j) };
					board[k].chain[obj.word] = obj;
					p[m[2]]++;
				}
				words.push(obj.word);
			}else{
				queue.push(m);
				for(j in arg){
					for(n in arg[j]){
						// arg[j][k]를 지운다
						queue.push(m = arg[j][n].pos);
						p = [ m[0], m[1] ];
						for(l=0; l<m[3]; l++){
							k = p.join(',');
							delete board[k].chain[n];
							if(!Object.keys(board[k].chain).length) delete board[k];
							p[m[2]]++;
						}
						words.splice(words.indexOf(n), 1);
					}
				}
			}
			process();
		}
	}
	process();
	return R;
}