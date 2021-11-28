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

const { Not, Like, Raw } = require("typeorm");
var File	 = require("fs");
var MainDB	 = require("../db/agent");
var GLOBAL	 = require("../../sub/global.json");
var JLog	 = require("../../sub/jjlog");

exports.run = function(Server, page){

Server.get("/gwalli", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	req.session.admin = true;
	page(req, res, "gwalli");
});
Server.get("/gwalli/injeong", async function(req, res){
	if(!checkAdmin(req, res)) return;
	
	res.send({ list: await MainDB.kkutu_injeong.find({ where: { theme: Not("~") }, take: 100 }) });
});
Server.get("/gwalli/gamsi", async function(req, res){
	if(!checkAdmin(req, res)) return;
	
	const $u = await MainDB.users.findOne({ select: [ "_id", "server" ], where: { _id: req.query.id } });
	if(!$u) return res.sendStatus(404);
	var data = { _id: $u._id, server: $u.server };
	
	const $s = await MainDB.session.findOne({ where: { profile: Raw((profile) => `${profile} ->> 'id' = '${$u._id}'`) } });
	if($s) data.title = $s.profile.title || $s.profile.name;
	res.send(data);
});
Server.get("/gwalli/users", async function(req, res){
	if(!checkAdmin(req, res)) return;
	
	if(req.query.name){
		const $ut = await MainDB.session.find({ where: { profile: { title: req.query.name } } });
		if($ut) await onSession($ut);
		
		const $un = await MainDB.session.find({ where: { profile: { name: req.query.name } } });
		if($un) await onSession($un);
		res.sendStatus(404);
	}else{
		const $u = await MainDB.users.findOne({ where: { _id: req.query.id } });
		if($u) return res.send({ list: [ $u ] });
		res.sendStatus(404);
	}
	function onSession(list){
		var board = {};
		
		Promise.all(list.map(async function(v){
			if(board[v.profile.id]) return null;
			else{
				board[v.profile.id] = true;
				return await getProfile(v.profile.id);
			}
		})).then(function(data){
			res.send({ list: data });
		});
	}
	function getProfile(id){
		return new Promise(async (resolve) => {
			if(id){
				const $u = await MainDB.users.findOne({ where: { _id: id } });
				resolve($u);
			}else resolve(null);
		});
	}
});
Server.get("/gwalli/kkutudb/:word", async function(req, res){
	if(!checkAdmin(req, res)) return;
	
	var TABLE = MainDB.kkutu[req.query.lang];
	
	if(!TABLE) return res.sendStatus(400);
	if(!TABLE.findOne) return res.sendStatus(400);
	res.send(await TABLE.findOne({ where: { _id: req.params.word } }));
});
Server.get("/gwalli/kkututheme", async function(req, res){
	if(!checkAdmin(req, res)) return;
	
	var TABLE = MainDB.kkutu[req.query.lang];
	
	if(!TABLE) return res.sendStatus(400);
	if(!TABLE.find) return res.sendStatus(400);
	res.send({ list: (
		await TABLE.find({ select: [ "_id", "theme" ], where: { theme: Like(`%${req.query.theme}%`) } })
	).map(v => v._id) });
});
Server.get("/gwalli/kkutuhot", function(req, res){
	if(!checkAdmin(req, res)) return;
	
	File.readFile(GLOBAL.KKUTUHOT_PATH, function(err, file){
		var data = JSON.parse(file.toString());
		
		parseKKuTuHot().then(function($kh){
			res.send({ prev: data, data: $kh });
		});
	});
});
Server.get("/gwalli/shop/:key", async function(req, res){
	if(!checkAdmin(req, res)) return;
	
	const goods = await MainDB.kkutu_shop.find(req.params.key == "~ALL" ? undefined : { where: { _id: req.params.key } });
	const desc = await MainDB.kkutu_shop_desc.find(req.params.key == "~ALL" ? undefined : { where: { _id: req.params.key } });
	
	res.send({ goods, desc });
});
Server.post("/gwalli/injeong", function(req, res){
	if(!checkAdmin(req, res)) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = JSON.parse(req.body.list).list;
	var themes;
	
	list.forEach(async function(v){
		if(v.ok){
			req.body.nof = true;
			req.body.lang = "ko";
			v.theme.split(',').forEach(function(w, i){
				setTimeout(async function(lid, x){
					req.body.list = lid;
					req.body.theme = x;
					onKKuTuDB(req, res);
				}, i * 1000, v._id.replace(/[^가-힣0-9]/g, ""), w);
			});
		}else{
			const word = await MainDB.kkutu_injeong.findOne({ where: { _id: v._origin } });
			word.theme = "~";
			await MainDB.kkutu_injeong.save(word);
		}
		// MainDB.kkutu_injeong.remove([ '_id', v._origin ]).on();
	});
	res.sendStatus(200);
});
Server.post("/gwalli/kkutudb", onKKuTuDB);
function onKKuTuDB(req, res){
	if(!checkAdmin(req, res)) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var theme = req.body.theme;
	var list = req.body.list;
	var TABLE = MainDB.kkutu[req.body.lang];
	
	if(list) list = list.split(/[,\r\n]+/);
	else return res.sendStatus(400);
	if(!TABLE) return res.sendStatus(400);
	if(!TABLE.findOne) return res.sendStatus(400);
	
	noticeAdmin(req, theme, list.length);
	list.forEach(async function(item){
		if(!item) return;
		item = item.trim();
		if(!item.length) return;
		const $doc = await TABLE.findOne({ where: { _id: item } });
		if(!$doc) return await TABLE.save(new MainDB.Word(req.body.lang, item, "INJEONG", theme, "＂1＂", 2));
		
		var means = $doc.mean.split(/＂[0-9]+＂/g).slice(1);
		var len = means.length;
		
		if($doc.theme.indexOf(theme) == -1){
			$doc.type += ",INJEONG";
			$doc.theme += "," + theme;
			$doc.mean += `＂${len+1}＂`;
			await TABLE.save($doc);
		}else{
			JLog.warn(`Word '${item}' already has the theme '${theme}'!`);
		}
	});
	if(!req.body.nof) res.sendStatus(200);
}
Server.post("/gwalli/kkutudb/:word", async function(req, res){
	if(!checkAdmin(req, res)) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	var TABLE = MainDB.kkutu[req.body.lang];
	var data = JSON.parse(req.body.data);
	
	if(!TABLE) return res.sendStatus(400);
	if(!TABLE.remove) return res.sendStatus(400);
	
	noticeAdmin(req, data._id);
	if(data.mean == ""){
		TABLE.remove(await TABLE.findOne({ where: { _id: data._id } })).then(($res) => {
			res.send($res.toString());
		});
	}else{
		const word = (await TABLE.findOne({ where: { _id: data._id } })) || new MainDB.Word(req.body.lang);
		Object.assign(word, data);
		TABLE.save(word).then(($res) => {
			res.send($res.toString());
		});
	}
});
Server.post("/gwalli/kkutuhot", function(req, res){
	if(!checkAdmin(req, res)) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	noticeAdmin(req);
	parseKKuTuHot().then(function($kh){
		var i, j, obj = {};
		
		for(i in $kh){
			for(j in $kh[i]){
				obj[$kh[i][j]._id] = $kh[i][j].hit;
			}
		}
		File.writeFile(GLOBAL.KKUTUHOT_PATH, JSON.stringify(obj), function(err){
			res.send(err);
		});
	});
});
Server.post("/gwalli/users", function(req, res){
	if(!checkAdmin(req, res)) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = JSON.parse(req.body.list).list;
	
	list.forEach(async function(item){
		const user = (await MainDB.users.findOne({ where: { _id: item._id } })) || new MainDB.User();
		item.kkutu = JSON.parse(item.kkutu);
		item.box = JSON.parse(item.box);
		item.equip = JSON.parse(item.equip);
		item.friends = JSON.parse(item.friends);
		Object.assign(user, item);
		await MainDB.users.save(user);
	});
	res.sendStatus(200);
});
Server.post("/gwalli/shop", function(req, res){
	if(!checkAdmin(req, res)) return;
	if(req.body.pw != GLOBAL.PASS) return res.sendStatus(400);
	
	var list = JSON.parse(req.body.list).list;
	
	list.forEach(async function(item){
		item.core.options = JSON.parse(item.core.options);
		const $item = (await MainDB.kkutu_shop.findOne({ where: { _id: item._id } })) || new MainDB.Item(item._id);
		const $desc = (await MainDB.kkutu_shop_desc.findOne({ where: { _id: item._id } })) || new MainDB.Description(item._id);
		Object.assign($item, item.core);
		Object.assign($desc, item.text);
		await MainDB.kkutu_shop.save($item);
		await MainDB.kkutu_shop_desc.save($desc);
	});
	res.sendStatus(200);
});

};
function noticeAdmin(req, ...args){
	JLog.info(`[ADMIN] ${req.originalUrl} ${req.ip} | ${args.join(' | ')}`);
}
function checkAdmin(req, res){
	if(global.isPublic){
		if(req.session.profile){
			if(GLOBAL.ADMIN.indexOf(req.session.profile.id) == -1){
				req.session.admin = false;
				return res.send({ error: 400 }), false;
			}
		}else{
			req.session.admin = false;
			return res.send({ error: 400 }), false;
		}
	}
	return true;
}
function parseKKuTuHot(){
	return new Promise((resolve) => {
		Promise.all([
			query(`SELECT * FROM kkutu_ko WHERE hit > 0 ORDER BY hit DESC LIMIT 50`),
			query(`SELECT * FROM kkutu_ko WHERE _id ~ '^...$' AND hit > 0 ORDER BY hit DESC LIMIT 50`),
			query(`SELECT * FROM kkutu_ko WHERE type = 'INJEONG' AND hit > 0 ORDER BY hit DESC LIMIT 50`),
			query(`SELECT * FROM kkutu_en WHERE hit > 0 ORDER BY hit DESC LIMIT 50`)
		]).then(function($docs){
			resolve($docs);
		});
		function query(q){
			return new Promise((resolve) => {
				MainDB.agent.manager.query(q).then((err, $docs) => {
					if(err) return JLog.error(err.toString());
					resolve($docs.rows);
				});
			});
		}
	});
}