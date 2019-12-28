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

import HTTPS = require("https");
import WS = require("ws");

import { connectDatabase } from "back/utils/Database";
import { Logger } from "back/utils/Logger";
import { SSL_OPTIONS } from "back/utils/SSL";
import { SETTINGS } from "back/utils/System";

const PORT = Number(process.env['KKUTU_PORT']);
const CHANNEL = Number(process.env['KKUTU_CHANNEL']);

let server:WS.Server;

/**
 * 게임 방 서버로서 작동하기 시작한다.
 *
 * @param cluster 이 슬레이브를 거느리는 로비 프로세스의 순번.
 */
export async function main(cluster:number):Promise<void>{
  Logger.info(`Room #${cluster}-${CHANNEL}`).out();
  await connectDatabase();

  if(SETTINGS.https){
    server = new WS.Server({
      server: HTTPS.createServer(SSL_OPTIONS).listen(PORT)
    });
  }else{
    server = new WS.Server({
      port: PORT,
      perMessageDeflate: false
    });
  }
  server.on('error', err => {
    Logger.error("Server").next("Error").put(err.stack).out();
  });
}
process.on('uncaughtException', err => {
  Logger.error("Room").put("Uncaught exception").next("Error").put(err.stack).out();
});
