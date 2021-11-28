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

const TypeORM = require("typeorm");
const fs = require("fs");
const GLOBAL = require("../../sub/global.json");
const Pub = require("../../sub/checkpub");
const JLog = require("../../sub/jjlog");
const RedisCol = require("./redis").Agent;

const FAKE_REDIS_FUNC = () => {
	return new Promise((resolve) => {
		resolve({});
	});
};
const FAKE_REDIS = {
	putGlobal: FAKE_REDIS_FUNC,
	getGlobal: FAKE_REDIS_FUNC,
	getPage: FAKE_REDIS_FUNC,
	getSurround: FAKE_REDIS_FUNC
};

const { User } = require("./model/User");
const { Session } = require("./model/Session");
const { IpBlock } = require("./model/IpBlock");
const { CWKo } = require("./model/games/CWKo");
const { Word } = require("./model/games/Word");
const { En } = require("./model/games/En");
const { Ko } = require("./model/games/Ko");
const { Injeong } = require("./model/games/Injeong");
const { Manner } = require("./model/games/Manner");
const { MannerEn } = require("./model/games/MannerEn");
const { MannerKo } = require("./model/games/MannerKo");
const { Item } = require("./model/shop/Item");
const { Description } = require("./model/shop/Description");

Pub.ready = (isPub) => {
	const Redis = require("redis").createClient();
	Redis.on('connect', async () => {
		await connectPg();
	});
	Redis.on('error', async (err) => {
		JLog.error("Error from Redis: " + err);
		JLog.alert("Run with no-redis mode.");
		Redis.quit();
		await connectPg(true);
	});
	async function connectPg(noRedis){
		const mainAgent = await TypeORM.createConnection({
			type: "postgres",
			host: "localhost",
			port: GLOBAL.PG_PORT,
			username: GLOBAL.PG_USER,
			password: GLOBAL.PG_PASSWORD,
			database: GLOBAL.PG_DATABASE,
			synchronize: true,
			entities: [
				require("./entity/User"),
				require("./entity/Session"),
				require("./entity/IpBlock"),
				require("./entity/games/CWKo"),
				require("./entity/games/En"),
				require("./entity/games/Ko"),
				require("./entity/games/Injeong"),
				require("./entity/games/MannerEn"),
				require("./entity/games/MannerKo"),
				require("./entity/shop/Item"),
				require("./entity/shop/Description")
			]
		});
		const redisAgent = noRedis ? null : new RedisCol("Redis", Redis);
		
		let DB = exports;
		
		DB.agent = mainAgent;
		DB.kkutu = {
			ko: await mainAgent.getRepository(Ko),
			en: await mainAgent.getRepository(En)
		};
		DB.kkutu_cw = {
			ko: await mainAgent.getRepository(CWKo),
			en: {}
		};
		DB.kkutu_manner = {
			ko: await mainAgent.getRepository(MannerKo),
			en: await mainAgent.getRepository(MannerEn)
		};
		
		DB.redis = noRedis ? FAKE_REDIS : new redisAgent.Table("KKuTu_Score");
		DB.kkutu_injeong = await mainAgent.getRepository(Injeong);
		DB.kkutu_shop = await mainAgent.getRepository(Item);
		DB.kkutu_shop_desc = await mainAgent.getRepository(Description);
		
		DB.session = await mainAgent.getRepository(Session);
		DB.users = await mainAgent.getRepository(User);
		/* Enhanced User Block System [S] */
		DB.ip_block = await mainAgent.getRepository(IpBlock);
		/* Enhanced User Block System [E] */
		
		if(module.exports.ready) module.exports.ready(Redis, mainAgent);
		else JLog.warn("DB.onReady was not defined yet.");
	}
};

module.exports = Object.assign(module.exports, {
	User,
	Session,
	IpBlock,
	CWKo,
	Word,
	En,
	Ko,
	Injeong,
	Manner,
	MannerEn,
	MannerKo,
	Item,
	Description
});