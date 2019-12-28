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

import Cluster = require("cluster");
import HTTPS = require("https");
import WS = require("ws");

import { connectDatabase } from "back/utils/Database";
import { Logger } from "back/utils/Logger";
import { SSL_OPTIONS } from "back/utils/SSL";
import { SETTINGS } from "back/utils/System";
import { WSClient } from "back/utils/WSClient";
import { Client } from "./clients/Client";
import { WebServer } from "./clients/WebServer";

const CAPACITY = SETTINGS.application['server-capacity'];

/**
 * 현재 접속 중인 일반 클라이언트를 (식별자, 웹소켓 인스턴스) 쌍으로 묶은 객체.
 */
export const clients:Table<WSClient> = {};
/**
 * 현재 접속 중인 웹 서버 클라이언트를 (식별자, 웹소켓 인스턴스) 쌍으로 묶은 객체.
 */
export const webServers:Table<WSClient> = {};

let server:WS.Server;

/**
 * 게임 로비 서버로서 작동하기 시작한다.
 *
 * @param cluster 이 프로세스의 순번.
 * @param channels 게임 방 서버 프로세스의 목록.
 */
export async function main(cluster:number, channels:Cluster.Worker[]):Promise<void>{
  Logger.info(`Lobby #${cluster}`).next("Channels").put(channels.length).out();
  await connectDatabase();

  if(SETTINGS.https){
    server = new WS.Server({
      server: HTTPS.createServer(SSL_OPTIONS).listen(SETTINGS.ports[cluster])
    });
  }else{
    server = new WS.Server({
      port: SETTINGS.ports[cluster],
      perMessageDeflate: false
    });
  }
  server.on('connection', (socket, req) => {
    const key = req.url.slice(1);
    let client:Client;

    socket.on('error', err => {
      Logger.warning("Client").put(key).next("Error").put(err.stack).out();
    });
    // 웹 서버
    if(req.headers.host.startsWith("127.0.0.2:")){
      if(webServers[key]) webServers[key].close();
      webServers[key] = new WebServer(key, socket);
      webServers[key].socket.on('close', () => {
        delete webServers[key];
      });
      Logger.info("New").put("Web server").next("Key").put(key).out();

      return;
    }
    // 정원 초과
    if(Object.keys(clients).length >= CAPACITY){
      socket.send('{ "type": "error", "code": "full" }');

      return;
    }
    client = new Client(`GUEST-${key}`, socket);
    clients[client.id] = client;
  });
  server.on('error', err => {
    Logger.error("Server").next("Error").put(err.stack).out();
  });
}
process.on('uncaughtException', err => {
  Logger.error("Lobby").put("Uncaught exception").next("Error").put(err.stack).out();
});
