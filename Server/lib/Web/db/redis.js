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

// Redis Agent (temporary, lagacy)

exports.Agent = function(type, origin){
	var my = this;
	
	this.RedisTable = function(key){
		var my = this;
		
		my.putGlobal = function(id, score){
			return new Promise((resolve) => {
				origin.zadd([ key, score, id ], function(err, res){
					resolve(id);
				});
			});
		};
		my.getGlobal = function(id){
			return new Promise((resolve) => {
				origin.zrevrank([ key, id ], function(err, res){
					resolve(res);
				});
			});
		};
		my.getPage = function(pg, lpp){
			return new Promise((resolve) => {
				origin.zrevrange([ key, pg * lpp, (pg + 1) * lpp - 1, "WITHSCORES" ], function(err, res){
					var A = [];
					var rank = pg * lpp;
					var i, len = res.length;
					
					for(i=0; i<len; i += 2){
						A.push({ id: res[i], rank: rank++, score: res[i+1] });
					}
					resolve({ page: pg, data: A });
				});
			});
		};
		my.getSurround = function(id, rv){
			return new Promise((resolve) => {
				var i;
				
				rv = rv || 8;
				origin.zrevrank([ key, id ], function(err, res){
					var range = [ Math.max(0, res - Math.round(rv / 2 + 1)), 0 ];
					
					range[1] = range[0] + rv - 1;
					origin.zrevrange([ key, range[0], range[1], "WITHSCORES" ], function(err, res){
						if(!res) return resolve({ target: id, data: [] });
						
						var A = [], len = res.length;
						
						for(i=0; i<len; i += 2){
							A.push({ id: res[i], rank: range[0]++, score: res[i+1] });
						}
						resolve({ target: id, data: A });
					});
				});
			});
		};
	};
	this.Table = this[`${type}Table`];
};