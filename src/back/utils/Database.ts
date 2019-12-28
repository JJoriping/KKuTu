/*!
 * Rule the words! KKuTu Online
 * Copyright (C) 2020  JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
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
export function connectDatabase():Promise<void>{
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
        Logger.error("DB").put(err.stack).out();
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
/**
 * 데이터베이스에 SQL 질의를 하고 그 결과를 반환한다.
 *
 * 주어진 구문의 `:key` 꼴은 추가 정보 객체의 `key`에 대응하는 값으로 대체된다.
 *
 * @param sql SQL 구문.
 * @param parameters 추가 정보 객체.
 */
export function query(sql:string, parameters?:Table<unknown>):Promise<unknown>{
  return new Promise((res, rej) => {
    db.query(sql, parameters, (err, data) => {
      if(err){
        Logger.error("Query").next("SQL").put(sql).next("Error").put(err.stack).out();
        rej(err);

        return;
      }
      res(data);
    });
  });
}
