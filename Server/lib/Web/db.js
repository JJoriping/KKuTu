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

const LANG = [ "ko", "en" ];

var PgPool	 = require("pg").Pool;
var GLOBAL	 = require("../sub/global.json");
var JLog	 = require("../sub/jjlog");
var Collection = require("../sub/collection");
var Pub = require("../sub/checkpub");
var Lizard = require("../sub/lizard");

const FAKE_REDIS_FUNC = () => {
	var R = new Lizard.Tail();

	R.go({});
	return R;
};
const FAKE_REDIS = {
	putGlobal: FAKE_REDIS_FUNC,
	getGlobal: FAKE_REDIS_FUNC,
	getPage: FAKE_REDIS_FUNC,
	getSurround: FAKE_REDIS_FUNC
};

Pub.ready = function(isPub){
	var Redis	 = require("redis").createClient();
    var Pg = new PgPool({
        user: GLOBAL.PG_USER,
        password: GLOBAL.PG_PASSWORD,
        port: GLOBAL.PG_PORT,
        database: GLOBAL.PG_DATABASE
    });
	Redis.on('connect', function(){
		connectPg();
	});
	Redis.on('error', function(err){
		JLog.error("Error from Redis: " + err);
		JLog.alert("Run with no-redis mode.");
		Redis.quit();
		connectPg(true);
	});
	function connectPg(noRedis){
		Pg.connect(function(err, pgMain){
			if(err){
				JLog.error("Error when connect to PostgreSQL server: " + err.toString());
				return;
			}
			var redisAgent = noRedis ? null : new Collection.Agent("Redis", Redis);
			var mainAgent = new Collection.Agent("Postgres", pgMain);
			
			var DB = exports;
			var i;
			
			DB.kkutu = {};
			DB.kkutu_cw = {};
			DB.kkutu_manner = {};
			
			DB.redis = noRedis ? FAKE_REDIS : new redisAgent.Table("KKuTu_Score");
			for(i in LANG){
				DB.kkutu[LANG[i]] = new mainAgent.Table("kkutu_"+LANG[i]);
				DB.kkutu_cw[LANG[i]] = new mainAgent.Table("kkutu_cw_"+LANG[i]);
				DB.kkutu_manner[LANG[i]] = new mainAgent.Table("kkutu_manner_"+LANG[i]);
			}
			DB.kkutu_injeong = new mainAgent.Table("kkutu_injeong");
			DB.kkutu_shop = new mainAgent.Table("kkutu_shop");
			DB.kkutu_shop_desc = new mainAgent.Table("kkutu_shop_desc");
			
			DB.session = new mainAgent.Table("session");
			DB.users = new mainAgent.Table("users");
			
			if(exports.ready) exports.ready(Redis, Pg);
			else JLog.warn("DB.onReady was not defined yet.");
		});
	}
};