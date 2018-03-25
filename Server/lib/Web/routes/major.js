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

var Web		 = require("request");
var MainDB	 = require("../db");
var JLog	 = require("../../sub/jjlog");
var Const	 = require("../../const");

function obtain($user, key, value, term, addValue){
	var now = (new Date()).getTime();
	
	if(term){
		if($user.box[key]){
			if(addValue) $user.box[key].value += value;
			else $user.box[key].expire += term;
		}else $user.box[key] = { value: value, expire: Math.round(now * 0.001 + term) }
	}else{
		$user.box[key] = ($user.box[key] || 0) + value;
	}
}
function consume($user, key, value, force){
	var bd = $user.box[key];
	
	if(bd.value){
		// 기한이 끝날 때까지 box 자체에서 사라지지는 않는다. 기한 만료 여부 확인 시점: 1. 로그인 2. box 조회 3. 게임 결과 반영 직전 4. 해당 항목 사용 직전
		if((bd.value -= value) <= 0){
			if(force || !bd.expire) delete $user.box[key];
		}
	}else{
		if(($user.box[key] -= value) <= 0) delete $user.box[key];
	}
}

exports.run = function(Server, page){

Server.get("/box", function(req, res){
	if(req.session.profile){
		/*if(Const.ADMIN.indexOf(req.session.profile.id) == -1){
			return res.send({ error: 555 });
		}*/
	}else{
		return res.send({ error: 400 });
	}
	MainDB.users.findOne([ '_id', req.session.profile.id ]).limit([ 'box', true ]).on(function($body){
		if(!$body){
			res.send({ error: 400 });
		}else{
			res.send($body.box);
		}
	});
});
Server.get("/help", function(req, res){
	page(req, res, "help", {
		'KO_INJEONG': Const.KO_INJEONG
	});
});
Server.get("/ranking", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.redis.getSurround(id, 15).then(function($body){
			res.send($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.redis.getPage(pg, 15).then(function($body){
			res.send($body);
		});
	}
});
Server.get("/injeong/:word", function(req, res){
	if(!req.session.profile) return res.send({ error: 402 });
	var word = req.params.word;
	var theme = req.query.theme;
	var now = Date.now();
	
	if(now - req.session.injBefore < 2000) return res.send({ error: 429 });
	req.session.injBefore = now;
	
	MainDB.kkutu['ko'].findOne([ '_id', word.replace(/[^가-힣0-9]/g, "") ]).on(function($word){
		if($word) return res.send({ error: 409 });
		MainDB.kkutu_injeong.findOne([ '_id', word ]).on(function($ij){
			if($ij){
				if($ij.theme == '~') return res.send({ error: 406 });
				else return res.send({ error: 403 });
			}
			Web.get("https://namu.moe/w/" + encodeURI(word), function(err, _res){
				if(err) return res.send({ error: 400 });
				else if(_res.statusCode != 200) return res.send({ error: 405 });
				MainDB.kkutu_injeong.insert([ '_id', word ], [ 'theme', theme ], [ 'createdAt', now ], [ 'writer', req.session.profile.id ]).on(function($res){
					res.send({ message: "OK" });
				});
			});
		});
	});
});
Server.get("/cf/:word", function(req, res){
	res.send(getCFRewards(req.params.word, Number(req.query.l || 0), req.query.b == "1"));
});
Server.get("/shop", function(req, res){
	MainDB.kkutu_shop.find().limit([ 'cost', true ], [ 'term', true ], [ 'group', true ], [ 'options', true ], [ 'updatedAt', true ]).on(function($goods){
		res.json({ goods: $goods });
	});
	// res.json({ error: 555 });
});

// POST
Server.post("/exordial", function(req, res){
	var text = req.body.data || "";
	
	if(req.session.profile){
		text = text.slice(0, 100);
		MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'exordial', text ]).on(function($res){
			res.send({ text: text });
		});
	}else res.send({ error: 400 });
});
Server.post("/buy/:id", function(req, res){
	if(req.session.profile){
		var uid = req.session.profile.id;
		var gid = req.params.id;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).on(function($item){
			if(!$item) return res.json({ error: 400 });
			if($item.cost < 0) return res.json({ error: 400 });
			MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
				if(!$user) return res.json({ error: 400 });
				if(!$user.box) $user.box = {};
				var postM = $user.money - $item.cost;
				
				if(postM < 0) return res.send({ result: 400 });
				
				obtain($user, gid, 1, $item.term);
				MainDB.users.update([ '_id', uid ]).set(
					[ 'money', postM ],
					[ 'box', $user.box ]
				).on(function($fin){
					res.send({ result: 200, money: postM, box: $user.box });
					JLog.log("[PURCHASED] " + gid + " by " + uid);
				});
				// HIT를 올리는 데에 동시성 문제가 발생한다. 조심하자.
				MainDB.kkutu_shop.update([ '_id', gid ]).set([ 'hit', $item.hit + 1 ]).on();
			});
		});
	}else res.json({ error: 423 });
});
Server.post("/equip/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isLeft = req.body.isLeft == "true";
	var now = Date.now() * 0.001;
	
	MainDB.users.findOne([ '_id', uid ]).limit([ 'box', true ], [ 'equip', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		if(!$user.equip) $user.equip = {};
		var q = $user.box[gid], r;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).limit([ 'group', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			if(!Const.AVAIL_EQUIP.includes($item.group)) return res.json({ error: 400 });
			
			var part = $item.group;
			if(part.substr(0, 3) == "BDG") part = "BDG";
			if(part == "Mhand") part = isLeft ? "Mlhand" : "Mrhand";
			var qid = $user.equip[part];
			
			if(qid){
				r = $user.box[qid];
				if(r && r.expire){
					obtain($user, qid, 1, r.expire, true);
				}else{
					obtain($user, qid, 1, now + $item.term, true);
				}
			}
			if(qid == $item._id){
				delete $user.equip[part];
			}else{
				if(!q) return res.json({ error: 430 });
				consume($user, gid, 1);
				$user.equip[part] = $item._id;
			}
			MainDB.users.update([ '_id', uid ]).set([ 'box', $user.box ], [ 'equip', $user.equip ]).on(function($res){
				res.send({ result: 200, box: $user.box, equip: $user.equip });
			});
		});
	});
});
Server.post("/payback/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	
	MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var q = $user.box[gid];
		
		if(!q) return res.json({ error: 430 });
		MainDB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			
			consume($user, gid, 1, true);
			$user.money = Number($user.money) + Math.round(0.2 * Number($item.cost));
			MainDB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ]).on(function($res){
				res.send({ result: 200, box: $user.box, money: $user.money });
			});
		});
	});
});
function blendWord(word){
	var lang = parseLanguage(word);
	var i, kl = [];
	var kr = [];
	
	if(lang == "en") return String.fromCharCode(97 + Math.floor(Math.random() * 26));
	if(lang == "ko"){
		for(i=word.length-1; i>=0; i--){
			var k = word.charCodeAt(i) - 0xAC00;
			
			kl.push([ Math.floor(k/28/21), Math.floor(k/28)%21, k%28 ]);
		}
		[0,1,2].sort((a, b) => (Math.random() < 0.5)).forEach((v, i) => {
			kr.push(kl[v][i]);
		});
		return String.fromCharCode(((kr[0] * 21) + kr[1]) * 28 + kr[2] + 0xAC00);
	}
}
function parseLanguage(word){
	return word.match(/[a-zA-Z]/) ? "en" : "ko";
}
Server.post("/cf", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var tray = (req.body.tray || "").split('|');
	var i, o;
	
	if(tray.length < 1 || tray.length > 6) return res.json({ error: 400 });
	MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var req = {}, word = "", level = 0;
		var cfr, gain = [];
		var blend;
		
		for(i in tray){
			word += tray[i].slice(4);
			level += 68 - tray[i].charCodeAt(3);
			req[tray[i]] = (req[tray[i]] || 0) + 1;
			if(($user.box[tray[i]] || 0) < req[tray[i]]) return res.json({ error: 434 });
		}
		MainDB.kkutu[parseLanguage(word)].findOne([ '_id', word ]).on(function($dic){
			if(!$dic){
				if(word.length == 3){
					blend = true;
				}else return res.json({ error: 404 });
			}
			cfr = getCFRewards(word, level, blend);
			if($user.money < cfr.cost) return res.json({ error: 407 });
			for(i in req) consume($user, i, req[i]);
			for(i in cfr.data){
				o = cfr.data[i];
				
				if(Math.random() >= o.rate) continue;
				if(o.key.charAt(4) == "?"){
					o.key = o.key.slice(0, 4) + (blend ? blendWord(word) : word.charAt(Math.floor(Math.random() * word.length)));
				}
				obtain($user, o.key, o.value, o.term);
				gain.push(o);
			}
			$user.money -= cfr.cost;
			MainDB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ]).on(function($res){
				res.send({ result: 200, box: $user.box, money: $user.money, gain: gain });
			});
		});
	});
	// res.send(getCFRewards(req.params.word, Number(req.query.l || 0)));
});
Server.get("/dict/:word", function(req, res){
    var word = req.params.word;
    var lang = req.query.lang;
    var DB = MainDB.kkutu[lang];
    
    if(!DB) return res.send({ error: 400 });
    if(!DB.findOne) return res.send({ error: 400 });
    DB.findOne([ '_id', word ]).on(function($word){
        if(!$word) return res.send({ error: 404 });
        res.send({
            word: $word._id,
            mean: $word.mean,
            theme: $word.theme,
            type: $word.type
        });
    });
});

};
function getCFRewards(word, level, blend){
	var R = [];
	var f = {
		len: word.length, // 최대 6
		lev: level // 최대 18
	};
	var cost = 20 * f.lev;
	var wur = f.len / 36; // 최대 2.867
	
	if(blend){
		if(wur >= 0.5){
			R.push({ key: "$WPA?", value: 1, rate: 1 });
		}else if(wur >= 0.35){
			R.push({ key: "$WPB?", value: 1, rate: 1 });
		}else if(wur >= 0.05){
			R.push({ key: "$WPC?", value: 1, rate: 1 });
		}
		cost = Math.round(cost * 0.2);
	}else{
		R.push({ key: "dictPage", value: Math.round(f.len * 0.6), rate: 1 });
		R.push({ key: "boxB4", value: 1, rate: Math.min(1, f.lev / 7) });
		if(f.lev >= 5){
			R.push({ key: "boxB3", value: 1, rate: Math.min(1, f.lev / 15) });
			cost += 10 * f.lev;
			wur += f.lev / 20;
		}
		if(f.lev >= 10){
			R.push({ key: "boxB2", value: 1, rate: Math.min(1, f.lev / 30) });
			cost += 20 * f.lev;
			wur += f.lev / 10;
		}
		if(wur >= 0.05){
			if(wur > 1) R.push({ key: "$WPC?", value: Math.floor(wur), rate: 1 });
			R.push({ key: "$WPC?", value: 1, rate: wur % 1 });
		}
		if(wur >= 0.35){
			if(wur > 2) R.push({ key: "$WPB?", value: Math.floor(wur / 2), rate: 1 });
			R.push({ key: "$WPB?", value: 1, rate: (wur / 2) % 1 });
		}
		if(wur >= 0.5){
			R.push({ key: "$WPA?", value: 1, rate: wur / 3 });
		}
	}
	return { data: R, cost: cost };
}