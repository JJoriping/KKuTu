/*!
 * Rule the words! KKuTu Online
 * Copyright (C) 2020  JJoriping(op@jjo.kr)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import MySQL = require("mysql");
import { createClient, RedisClient } from "redis";

import { Logger } from "./Logger";
import { SETTINGS } from "./System";

let db:MySQL.Connection;
let redis:RedisClient;

/**
 * 데이터베이스에 연결한다.
 *
 * MySQL과 Redis 서버에 연결을 시도한다.
 */
export function initialize():Promise<void>{
  return new Promise((res, rej) => {
    db = MySQL.createConnection({
      host: SETTINGS.database.host,
      port: SETTINGS.database.port,
      user: SETTINGS.database.user,
      password: SETTINGS.database.password,
      database: SETTINGS.database.name
    });
    db.connect(err => {
      if(err){
        Logger.error("DB").put(err).out();
        rej(err);

        return;
      }
      Logger.success("DB").out();

      redis = createClient();
      redis.on('connect', () => {
        Logger.success("Redis").out();
        res();
      });
      db.on('error', _err => {
        Logger.error("DB").put(_err).out();
      });
      redis.on('error', _err => {
        Logger.error("Redis").put(_err).out();
      });
    });
  });
}
