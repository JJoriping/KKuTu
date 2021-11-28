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
var MainDB	 = require("../db/agent");
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

Server.get("/box", async function(req, res){
	if(req.session.profile){
		/*if(Const.ADMIN.indexOf(req.session.profile.id) == -1){
			return res.send({ error: 555 });
		}*/
	}else{
		return res.send({ error: 400 });
	}
	const $body = await MainDB.users.findOne({ select: [ "_id", "box" ], where: { _id: req.session.profile.id } });
	if(!$body){
		res.send({ error: 400 });
	}else{
		res.send($body.box);
	}
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
Server.get("/injeong/:word", async function(req, res){
	if(!req.session.profile) return res.send({ error: 402 });
	var word = req.params.word;
	var theme = req.query.theme;
	var now = Date.now();
	
	if(now - req.session.injBefore < 2000) return res.send({ error: 429 });
	req.session.injBefore = now;
	
	const $word = await MainDB.kkutu['ko'].findOne({ where: { _id: word.replace(/[^가-힣0-9]/g, "") } });
	if($word) return res.send({ error: 409 });
	
	const $ij = await MainDB.kkutu_injeong.findOne({ where: { _id: word } });
	if($ij){
		if($ij.theme == '~') return res.send({ error: 406 });
		else return res.send({ error: 403 });
	}
	Web.get("https://namu.moe/w/" + encodeURI(word), function(err, _res){
		if(err) return res.send({ error: 400 });
		else if(_res.statusCode != 200) return res.send({ error: 405 });
		
		const requested = new MainDB.Injeong();
		requested._id = word;
		requested.theme = theme;
		requested.createdAt = now;
		requested.writer = req.session.profile.id;
		MainDB.kkutu_injeong.save(requested).then(() => {
			res.send({ message: "OK" });
		});
	});
});
Server.get("/cf/:word", function(req, res){
	res.send(getCFRewards(req.params.word, Number(req.query.l || 0), req.query.b == "1"));
});
Server.get("/shop", async function(req, res){
	const $goods = await MainDB.kkutu_shop.find({ select: [ "_id", "cost", "term", "group", "options", "updatedAt" ] });
	
	res.json({ goods: $goods });
	// res.json({ error: 555 });
});

// POST
Server.post("/exordial", async function(req, res){
	var text = req.body.data || "";
	
	if(req.session.profile){
		text = text.slice(0, 100);
		const user = await MainDB.users.findOne({ where: { _id: req.session.profile.id } });
		user.exordial = text;
		MainDB.users.save(user).then(() => {
			res.send({ text });
		});
	}else res.send({ error: 400 });
});
Server.post("/buy/:id", async function(req, res){
	if(req.session.profile){
		var uid = req.session.profile.id;
		var gid = req.params.id;
		
		const $item = await MainDB.kkutu_shop.findOne({ where: { _id: gid } });
		if(!$item) return res.json({ error: 400 });
		if($item.cost < 0) return res.json({ error: 400 });
		const $user = await MainDB.users.findOne({ /* select: [ "_id", "money", "box" ], */where: { _id: uid } });
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var postM = $user.money - $item.cost;
		
		if(postM < 0) return res.send({ result: 400 });
		
		obtain($user, gid, 1, $item.term);
		$user.money = postM;
		MainDB.users.save($user).then(() => {
			res.send({ result: 200, money: postM, box: $user.box });
			JLog.log("[PURCHASED] " + gid + " by " + uid);
		});
		// HIT를 올리는 데에 동시성 문제가 발생한다. 조심하자.
		$item.hit++;
		await MainDB.kkutu_shop.save($item);
	}else res.json({ error: 423 });
});
Server.post("/equip/:id", async function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isLeft = req.body.isLeft == "true";
	var now = Date.now() * 0.001;
	
	const $user = await MainDB.users.findOne({ where: { _id: uid } });
	if(!$user) return res.json({ error: 400 });
	if(!$user.box) $user.box = {};
	if(!$user.equip) $user.equip = {};
	var q = $user.box[gid], r;
	
	const $item = await MainDB.kkutu_shop.findOne({ select: [ "_id", "group" ], where: { _id: gid } });
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
	MainDB.users.save($user).then(() => {
		res.send({ result: 200, box: $user.box, equip: $user.equip });
	});
});
Server.post("/payback/:id", async function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	
	const $user = await MainDB.users.findOne({ where: { _id: uid } });
	if(!$user) return res.json({ error: 400 });
	if(!$user.box) $user.box = {};
	var q = $user.box[gid];
	
	if(!q) return res.json({ error: 430 });
	const $item = await MainDB.kkutu_shop.findOne({ select: [ "_id", "cost" ], where: { _id: isDyn ? gid.slice(0, 4) : gid } });
	if(!$item) return res.json({ error: 430 });
	
	consume($user, gid, 1, true);
	$user.money = Number($user.money) + Math.round(0.2 * Number($item.cost));
	MainDB.users.save($user).then(() => {
		res.send({ result: 200, box: $user.box, money: $user.money });
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
Server.post("/cf", async function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var tray = (req.body.tray || "").split('|');
	var i, o;
	
	if(tray.length < 1 || tray.length > 6) return res.json({ error: 400 });
	const $user = MainDB.users.findOne({ where: { _id: uid } });
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
	const $dic = await MainDB.kkutu[parseLanguage(word)].findOne({ where: { _id: word } });
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
	MainDB.users.save($user).then(() => {
		res.send({ result: 200, box: $user.box, money: $user.money, gain: gain });
	});
	// res.send(getCFRewards(req.params.word, Number(req.query.l || 0)));
});
Server.get("/dict/:word", async function(req, res){
    var word = req.params.word;
    var lang = req.query.lang;
    var DB = MainDB.kkutu[lang];
    
    if(!DB) return res.send({ error: 400 });
    if(!DB.findOne) return res.send({ error: 400 });
	const $word = await DB.findOne({ where: { _id: word } });
	if(!$word) return res.send({ error: 404 });
	res.send({
		word: $word._id,
		mean: $word.mean,
		theme: $word.theme,
		type: $word.type
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