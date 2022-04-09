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
 
const Redis = require("redis");
const JLog = require("../../sub/jjlog");
const client = Redis.createClient({ name: "db" });

client.on('connect', () => {
	JLog.info("Redis is ready.");
});
client.on('error', (err) => {
	JLog.error("Error from Redis: " + err);
	JLog.alert("Run with no-redis mode.");
	client.quit();
});

exports.client = client;
exports.RedisTable = class RedisTable {
	constructor(client, key){
		this.client = client;
		this.key = key;
		
		this.client.zRevRange = (key, start, end) => this.client.sendCommand([ "ZREVRANGE", key, start, end, "WITHSCORES" ]);
	}
	async putGlobal(id, score){
		await this.client.zAdd(this.key, { score, value: id });
		return id;
	}
	async getGlobal(id){
		return await this.client.zRevRank(this.key, id);
	}
	async getPage(page, lpp){
		const res = await this.client.zRevRange(this.key, page * lpp, (page + 1) * lpp - 1);
		const data = [];
		let rank = page * lpp;
		
		for(let i = 0; i < res.length; i += 2)
			data.push({ id: res[i], rank: rank++, score: res[i + 1] });
					
		return { page, data };
	}
	async getSurround(id, rv = 8){
		const res = await this.client.zRevRank(this.key, id);
		let range = [ Math.max(0, res - Math.round(rv / 2 + 1)), 0 ];
		
		range[1] = range[0] + rv - 1;
		const _res = await this.client.zRevRange(this.key, range[0], range[1]);
		if(!_res) return { target: id, data: [] };
		
		const data = [];
		
		for(let i = 0; i < _res.length; i += 2)
			data.push({ id: _res[i], rank: range[0]++, score: _res[i + 1] });
		
		return { target: id, data };
	}
}
