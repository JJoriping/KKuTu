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

/**
 * 볕뉘 수정사항:
 * Login 을 Passport 로 수행하기 위한 수정
 */

var WS		 = require("ws");
var Express	 = require("express");
var Exession = require("express-session");
var Redission= require("connect-redis")(Exession);
var Redis	 = require("redis");
var Parser	 = require("body-parser");
var DDDoS	 = require("dddos");
var Server	 = Express();
var DB		 = require("./db");
var JLog	 = require("../sub/jjlog");
var WebInit	 = require("../sub/webinit");
var GLOBAL	 = require("../sub/global.json");
var Secure = require('../sub/secure');
var passport = require('passport');
var Const	 = require("../const");
var https	 = require('https');
var fs		 = require('fs');

var Language = {
	'ko_KR': require("./lang/ko_KR.json"),
	'en_US': require("./lang/en_US.json")
};
var ROUTES = [
	"major", "consume", "admin", "login"
];
var page = WebInit.page;
var gameServers = [];

WebInit.MOBILE_AVAILABLE = [
	"portal", "main", "kkutu"
];

require("../sub/checkpub");

JLog.info("<< KKuTu Web >>");
Server.set('views', __dirname + "/views");
Server.set('view engine', "pug");
Server.use(Express.static(__dirname + "/public"));
Server.use(Parser.urlencoded({ extended: true }));
Server.use(Exession({
	/* use only for redis-installed

	store: new Redission({
		client: Redis.createClient(),
		ttl: 3600 * 12
	}),*/
	secret: 'kkutu',
	resave: false,
	saveUninitialized: true
}));
Server.use(passport.initialize());
Server.use(passport.session());
Server.use((req, res, next) => {
	if(req.session.passport) {
		delete req.session.passport;
	}
	next();
});
Server.use((req, res, next) => {
	if(Const.REDIRECT_HTTPS) {
		if(req.protocol == 'http') {
			let url = 'https://'+req.get('host')+req.path;
			res.status(302).redirect(url);
		} else {
			next();
		}
	} else {
		next();
	}
});
if(GLOBAL.TRUST_PROXY) {
	Server.set('trust proxy', GLOBAL.TRUST_PROXY);
}
/* use this if you want

DDDoS = new DDDoS({
	maxWeight: 6,
	checkInterval: 10000,
	rules: [{
		regexp: "^/(cf|dict|gwalli)",
		maxWeight: 20,
		errorData: "429 Too Many Requests"
	}, {
		regexp: ".*",
		errorData: "429 Too Many Requests"
	}]
});
DDDoS.rules[0].logFunction = DDDoS.rules[1].logFunction = function(ip, path){
	JLog.warn(`DoS from IP ${ip} on ${path}`);
};
Server.use(DDDoS.express());*/

WebInit.init(Server, true);
DB.ready = function(){
	setInterval(function(){
		var q = [ 'createdAt', { $lte: Date.now() - 3600000 * 12 } ];

		DB.session.remove(q).on();
	}, 600000);
	setInterval(function(){
		gameServers.forEach(function(v){
			if(v.socket && v.connected) v.socket.send(`{"type":"seek"}`);
			else v.seek = undefined;
		});
	}, 4000);
	JLog.success("DB is ready.");

	DB.kkutu_shop_desc.find().on(function($docs){
		var i, j;

		for(i in Language) flush(i);
		function flush(lang){
			var db;

			Language[lang].SHOP = db = {};
			for(j in $docs){
				db[$docs[j]._id] = [ $docs[j][`name_${lang}`], $docs[j][`desc_${lang}`] ];
			}
		}
	});
	Server.listen(GLOBAL.WEB_PORT);
	if(Const.IS_SECURED) {
		const options = Secure();
		https.createServer(options, Server).listen(GLOBAL.SSL_PORT);
	}
};
Const.MAIN_PORTS.forEach(function(v, i){
	var KEY = process.env['WS_KEY'];
	var protocol = (Const.IS_SECURED ? 'wss' : 'ws');
	gameServers[i] = new GameClient(KEY, `${protocol}://127.0.0.2:${v}/${KEY}`);
});
function GameClient(id, url){
	var my = this;
	let override;

	my.id = id;
	my.tryConnect = 0;
	my.connected = false;
	
	override = url.match(/127\.0\.0\.\d{1,3}+/) ? true : false
	
	my.socket = new WS(url, {
		perMessageDeflate: false,
		rejectUnauthorized: !override
	});
	
	my.send = function(type, data){
		if(!data) data = {};
		data.type = type;

		my.socket.send(JSON.stringify(data));
	};
	function onGameOpen () {
		JLog.info(`Game server #${my.id} connected`);
		my.connected = true;
	}
	function onGameError (err) {
		my.connected = true;
		if (GLOBAL.GAME_SERVER_RETRY > 0 ) { 
			my.tryConnect++
		}

		JLog.warn(`Game server #${my.id} has an error: ${err.toString()}`);
	}
	function onGameClose (code) {
		my.connected = false;

		JLog.error(`Game server #${my.id} closed: ${code}`);
		my.socket.removeAllListeners();
		delete my.socket;

		if (my.tryConnect <= GLOBAL.GAME_SERVER_RETRY) {
			JLog.info(`Retry connect to 5 seconds` + (GLOBAL.GAME_SERVER_RETRY > 0 ? `, try: ${my.tryConnect}` : ''));
			setTimeout(() => {
				my.socket = new WS(url, {
					perMessageDeflate: false,
					rejectUnauthorized: override,
					handshakeTimeout: 2000
				});
				my.socket.on('open', onGameOpen);
				my.socket.on('error', onGameError);
				my.socket.on('close', onGameClose);
				my.socket.on('message', onGameMessage);
			}, 5000);
		} else {
			JLog.info('Connect fail.');
		}
	}
	function onGameMessage (data) {
		var _data = data;
		var i;

		data = JSON.parse(data);

		switch(data.type){
			case "seek":
				my.seek = data.value;
				break;
			case "narrate-friend":
				for(i in data.list){
					gameServers[i].send('narrate-friend', { id: data.id, s: data.s, stat: data.stat, list: data.list[i] });
				}
				break;
			default:
		}
	}
	my.socket.on('open', onGameOpen);
	my.socket.on('error', onGameError);
	my.socket.on('close', onGameClose);
	my.socket.on('message', onGameMessage);
}
ROUTES.forEach(function(v){
	require(`./routes/${v}`).run(Server, WebInit.page);
});
Server.get("/", function(req, res){
	var server = req.query.server;

	DB.session.findOne([ '_id', req.session.id ]).on(function($ses){
		// var sid = (($ses || {}).profile || {}).sid || "NULL";
		if(global.isPublic){
			onFinish($ses);
			// DB.jjo_session.findOne([ '_id', sid ]).limit([ 'profile', true ]).on(onFinish);
		}else{
			if($ses) $ses.profile.sid = $ses._id;
			onFinish($ses);
		}
	});
	function onFinish($doc){
		var id = req.session.id;

		if($doc){
			req.session.profile = $doc.profile;
			id = $doc.profile.sid;
		}else{
			delete req.session.profile;
		}
		page(req, res, Const.MAIN_PORTS[server] ? "kkutu" : "portal", {
			'_page': "kkutu",
			'_id': id,
			'PORT': Const.MAIN_PORTS[server],
			'HOST': req.hostname,
			'PROTOCOL': Const.IS_SECURED ? 'wss' : 'ws',
			'TEST': req.query.test,
			'MOREMI_PART': Const.MOREMI_PART,
			'AVAIL_EQUIP': Const.AVAIL_EQUIP,
			'CATEGORIES': Const.CATEGORIES,
			'GROUPS': Const.GROUPS,
			'MODE': Const.GAME_TYPE,
			'RULE': Const.RULE,
			'OPTIONS': Const.OPTIONS,
			'KO_INJEONG': Const.KO_INJEONG,
			'EN_INJEONG': Const.EN_INJEONG,
			'KO_THEME': Const.KO_THEME,
			'EN_THEME': Const.EN_THEME,
			'IJP_EXCEPT': Const.IJP_EXCEPT,
			'ogImage': "http://kkutu.kr/img/kkutu/logo.png",
			'ogURL': "http://kkutu.kr/",
			'ogTitle': "글자로 놀자! 끄투 온라인",
			'ogDescription': "끝말잇기가 이렇게 박진감 넘치는 게임이었다니!"
		});
	}
});

Server.get("/servers", function(req, res){
	var list = [];

	gameServers.forEach(function(v, i){
		list[i] = v.seek;
	});
	res.send({ list: list, max: Const.KKUTU_MAX });
});

Server.get("/legal/:page", function(req, res){
	page(req, res, "legal/"+req.params.page);
});