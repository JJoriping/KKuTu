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

const LANG = [ "ko", "en", "ja" ];

var Path = require("path");
var Sqlite = require("sqlite3").verbose();
var GLOBAL	 = require("../sub/global.json");
var JLog	 = require("../sub/jjlog");
var Collection = require("../sub/collection");
var Pub = require("../sub/checkpub");
var Lizard = require("../sub/lizard");

const JSON_SCORE_SQL = "COALESCE(CAST(json_extract(kkutu, '$.score') AS INTEGER), 0)";
const RANKING_WHERE_SQL = "(kkutu IS NOT NULL)";
const buildRankCondition = function(score, id){
	return `(${JSON_SCORE_SQL} > ${Number(score) || 0} OR (${JSON_SCORE_SQL} = ${Number(score) || 0} AND _id < '${String(id).replace(/'/g, "''")}'))`;
};
const makeResult = function(rows){
	return { rows: rows || [] };
};
const createRankTable = function(sqlite){
	function query(sql, callback){
		sqlite.all(sql, function(err, rows){
			callback(err, rows || []);
		});
	}
	return {
		putGlobal: function(id){
			var R = new Lizard.Tail();
			
			R.go(id);
			return R;
		},
		getGlobal: function(id){
			var R = new Lizard.Tail();
			
			query(`SELECT ${JSON_SCORE_SQL} AS score FROM users WHERE _id='${String(id).replace(/'/g, "''")}' LIMIT 1`, function(err, rows){
				if(err || !rows.length) return R.go(null);
				query(`SELECT COUNT(*) AS rank FROM users WHERE ${RANKING_WHERE_SQL} AND ${buildRankCondition(rows[0].score, id)}`, function(err, rankRows){
					if(err || !rankRows.length) return R.go(null);
					R.go(Number(rankRows[0].rank) || 0);
				});
			});
			return R;
		},
		getPage: function(pg, lpp){
			var R = new Lizard.Tail();
			var page = Math.max(0, Number(pg) || 0);
			var limit = Math.max(1, Number(lpp) || 15);
			var offset = page * limit;
			
			query(`SELECT _id AS id, ${JSON_SCORE_SQL} AS score FROM users WHERE ${RANKING_WHERE_SQL} ORDER BY score DESC, _id ASC LIMIT ${limit} OFFSET ${offset}`, function(err, rows){
				var rank = offset;
				var data = [];
				var i;
				
				if(err || !rows) return R.go({ page: page, data: [] });
				for(i in rows){
					data.push({ id: rows[i].id, rank: rank++, score: rows[i].score });
				}
				R.go({ page: page, data: data });
			});
			return R;
		},
		getSurround: function(id, rv){
			var R = new Lizard.Tail();
			var rangeView = Math.max(1, Number(rv) || 8);
			var escapedId = String(id).replace(/'/g, "''");
			
			query(`SELECT ${JSON_SCORE_SQL} AS score FROM users WHERE _id='${escapedId}' LIMIT 1`, function(err, rows){
				if(err || !rows.length) return R.go({ target: id, data: [] });
				query(`SELECT COUNT(*) AS rank FROM users WHERE ${RANKING_WHERE_SQL} AND ${buildRankCondition(rows[0].score, id)}`, function(err, rankRows){
					var baseRank;
					var start;
					
					if(err || !rankRows.length) return R.go({ target: id, data: [] });
					baseRank = Number(rankRows[0].rank) || 0;
					start = Math.max(0, baseRank - Math.round(rangeView / 2 + 1));
					query(`SELECT _id AS id, ${JSON_SCORE_SQL} AS score FROM users WHERE ${RANKING_WHERE_SQL} ORDER BY score DESC, _id ASC LIMIT ${rangeView} OFFSET ${start}`, function(err, aroundRows){
						var data = [];
						var i;
						var rank = start;
						
						if(err || !aroundRows) return R.go({ target: id, data: [] });
						for(i in aroundRows){
							data.push({ id: aroundRows[i].id, rank: rank++, score: aroundRows[i].score });
						}
						R.go({ target: id, data: data });
					});
				});
			});
			return R;
		}
	};
};
const openSqlite = function(callback){
	var sqlitePath = GLOBAL.SQLITE_PATH || Path.resolve(process.cwd(), "kkutu.db");
	return new Sqlite.Database(sqlitePath, function(err){
		if(err) return callback(err);
		callback(null, this);
	});
};
const connectSqlite = function(done){
	openSqlite(function(err, sqlite){
		if(err) return done(err);
		done(null, {
			query: function(sql, callback){
				if(/^\s*select\b/i.test(sql)){
					sqlite.all(sql, function(err, rows){
						callback(err, makeResult(rows));
					});
				}else{
					sqlite.run(sql, function(err){
						callback(err, makeResult([]));
					});
				}
			}
		}, sqlite);
	});
};
Pub.ready = function(isPub){
	connectSqlite(function(err, main, sqlite){
		if(err){
			JLog.error("Error when connect to SQLite DB: " + err.toString());
			return;
		}
		var mainAgent = new Collection.Agent("Postgres", main);
		var rankingTable = createRankTable(sqlite);
		
		var DB = exports;
		var i;
		
		DB.kkutu = {};
		DB.kkutu_cw = {};
		DB.kkutu_manner = {};
		
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
		DB.redis = rankingTable;
		/* Enhanced User Block System [S] */
		DB.ip_block = new mainAgent.Table("ip_block");
		/* Enhanced User Block System [E] */
		
		if(exports.ready) exports.ready(null, sqlite);
		else JLog.warn("DB.onReady was not defined yet.");
	});
};
