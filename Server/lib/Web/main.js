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
var http	 = require("http");
var Express	 = require("express");
var Exession = require("express-session");
var Parser	 = require("body-parser");
var Server	 = Express();
var DB		 = require("./db");
var JLog	 = require("../sub/jjlog");
var WebInit	 = require("../sub/webinit");
var GLOBAL	 = require("../sub/global");
var passport = require('passport');
var Const	 = require("../const");

// Unified mode: run the game server in-process rather than connecting to external ports
var UNIFIED_GAME = !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.UNIFIED_GAME);
var gameServer = UNIFIED_GAME ? require('../Game/game-server') : null;

var Language = {
	'ko_KR': require("./lang/ko_KR.json"),
	'en_US': require("./lang/en_US.json"),
	'ja_JP': require("./lang/ja_JP.json")
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
	secret: process.env.SESSION_SECRET || 'kkutu',
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
	// Vercel handles HTTPS termination; trust the x-forwarded-proto header
	if(Const.IS_SECURED) {
		var proto = req.headers['x-forwarded-proto'] || req.protocol;
		if(proto === 'http') {
			let url = 'https://'+req.get('host')+req.path;
			res.status(302).redirect(url);
			return;
		}
	}
	next();
});

WebInit.init(Server, true);
DB.ready = function(){
	setInterval(function(){
		var q = [ 'createdAt', { $lte: Date.now() - 3600000 * 24 * 30 } ];

		DB.session.remove(q).on();
	}, 600000);
	if(!UNIFIED_GAME) setInterval(function(){
		gameServers.forEach(function(v){
			if(v.socket && v.socket.readyState === WS.OPEN) v.socket.send(`{"type":"seek"}`);
			else v.seek = undefined;
		});
	}, 4000);
	// Render free tier: ping self every 14 min to prevent spin-down
	if(process.env.RENDER && process.env.RENDER_EXTERNAL_URL) {
		setInterval(function(){
			http.get(process.env.RENDER_EXTERNAL_URL + '/health', function(res){
				res.resume();
			}).on('error', function(){});
		}, 14 * 60 * 1000);
		JLog.info("Render keep-alive enabled.");
	}

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

	if(UNIFIED_GAME) {
		gameServer.init(DB);
	}

	// Only listen directly when not running under Vercel (local/Docker)
	if(!process.env.VERCEL && !process.env.VERCEL_ENV){
		var port = Number(process.env.PORT) || 80;
		var httpServer = http.createServer(Server);
		if(UNIFIED_GAME) {
			gameServer.attach(httpServer);
		}
		httpServer.listen(port, function(){
			JLog.success("Web server listening on port " + port);
		});
		if(Const.IS_SECURED && !UNIFIED_GAME){
			var Secure = require('../sub/secure');
			var https = require('https');
			var options = Secure();
			https.createServer(options, Server).listen(443);
		}
	} else if(UNIFIED_GAME) {
		// On Vercel: attach WebSocket upgrade handler
		// Note: Vercel Pro with maxDuration:800 is required for persistent WS connections
		var vercelHttpServer = http.createServer(Server);
		gameServer.attach(vercelHttpServer);
	}
};

if(UNIFIED_GAME) {
	// In unified mode, the game server runs in-process
	gameServers[0] = {
		id: "1",
		socket: null,
		get seek(){ return gameServer.getSeek ? gameServer.getSeek() : 0; },
		send: function(){}
	};
	JLog.info("Unified game server mode enabled.");
} else {
	Const.MAIN_PORTS.forEach(function(v, i){
		var KEY = process.env['WS_KEY'] || String(i + 1);
		var protocol = Const.IS_SECURED ? 'wss' : 'ws';
		var host = GLOBAL.GAME_SERVER_HOST;

		if(!host){
			gameServers[i] = { id: KEY, socket: null, seek: undefined, send: function(){} };
			JLog.warn(`Game server #${i} skipped (GAME_SERVER_HOST not configured)`);
			return;
		}
		gameServers[i] = new GameClient(KEY, `${protocol}://${host}:${v}/${KEY}`);
	});
}

function GameClient(id, url){
	var my = this;

	my.id = id;
	my.socket = new WS(url, { perMessageDeflate: false, rejectUnauthorized: false});

	my.send = function(type, data){
		if(!data) data = {};
		data.type = type;

		if(my.socket && my.socket.readyState === WS.OPEN) my.socket.send(JSON.stringify(data));
	};
	my.socket.on('open', function(){
		JLog.info(`Game server #${my.id} connected`);
	});
	my.socket.on('error', function(err){
		JLog.warn(`Game server #${my.id} has an error: ${err.toString()}`);
	});
	my.socket.on('close', function(code){
		JLog.error(`Game server #${my.id} closed: ${code}`);
		my.socket.removeAllListeners();
		delete my.socket;
	});
	my.socket.on('message', function(data){
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
	});
}

ROUTES.forEach(function(v){
	require(`./routes/${v}`).run(Server, WebInit.page);
});

Server.get("/", function(req, res){
	var server = req.query.server;

	DB.session.findOne([ '_id', req.session.id ]).on(function($ses){
		if(global.isPublic){
			onFinish($ses);
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
		var wsProto = Const.IS_SECURED ? 'wss' : 'ws';
		var wsUrl = UNIFIED_GAME
			? `${wsProto}://${req.hostname}/game/0/${id}`
			: `${wsProto}://${GLOBAL.GAME_SERVER_HOST || req.hostname}:${Const.MAIN_PORTS[server || 0]}/${id}`;
		page(req, res, (UNIFIED_GAME || Const.MAIN_PORTS[server]) ? "kkutu" : "portal", {
			'_page': "kkutu",
			'_id': id,
			'PORT': Const.MAIN_PORTS[server],
			'HOST': req.hostname,
			'PROTOCOL': wsProto,
			'WS_URL': wsUrl,
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

Server.get("/health", function(req, res){
	res.json({ status: "ok", uptime: process.uptime() });
});

Server.get("/legal/:page", function(req, res){
	page(req, res, "legal/"+req.params.page);
});

// Export the Express app for Vercel (serverless function)
module.exports = Server;
