/*
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
import { Client, RefreshResult } from "./clients/Client";
import { WebServer } from "./clients/WebServer";
import { Room } from "./Room";
import { reduceToTable } from "back/utils/Utility";
import { Channel } from "./clients/Channel";
import { StatusCode, WebSocketCloseCode } from "back/utils/enums/StatusCode";

const CAPACITY = SETTINGS.application['server-capacity'];

/**
 * 현재 접속 중인 일반 클라이언트를 (식별자, 웹소켓 인스턴스) 쌍으로 묶은 객체.
 */
export const clients:Table<Client> = {};
/**
 * 현재 개설된 게임 방을 (식별자, 인스턴스) 쌍으로 묶은 객체.
 */
export const rooms:Table<Room> = {};
/**
 * 현재 접속 중인 웹 서버 클라이언트를 (식별자, 웹소켓 인스턴스) 쌍으로 묶은 객체.
 */
export const webServers:Table<WSClient> = {};
/**
 * 개설된 게임 방 서버 프로세스 객체.
 */
export const channels:Table<Channel> = {};

let server:WS.Server;

/**
 * 게임 로비 서버로서 작동하기 시작한다.
 *
 * @param cluster 이 프로세스의 순번.
 * @param channelList 게임 방 서버 프로세스의 목록.
 */
export async function main(cluster:number, channelList:Cluster.Worker[]):Promise<void>{
  Object.assign(channels, reduceToTable(channelList, v => new Channel(v), (_, i) => i));
  Logger.info(`Lobby #${cluster}`)
    .next("Port").put(SETTINGS.ports[cluster])
    .next("Channels").put(channels.length)
    .out()
  ;
  await connectDatabase();

  if(SETTINGS.https){
    server = new WS.Server({
      server: HTTPS.createServer(SSL_OPTIONS).listen(SETTINGS.ports[cluster])
    });
  }else{
    server = new WS.Server({
      port             : SETTINGS.ports[cluster],
      perMessageDeflate: false
    });
  }
  server.on('connection', async(socket, req) => {
    const key = req.url.slice(1);
    let client:Client = null;
    let refreshResult:RefreshResult = null;

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
    client = new Client(Client.generateId(key), socket, key);
    refreshResult = await client.refresh();
    if(refreshResult.result !== StatusCode.OK){
      client.responseError(refreshResult.result, refreshResult.black);
      client.close(WebSocketCloseCode.REFRESH_FAILED);

      return;
    }
    if(clients[client.id]){
      clients[client.id].close(WebSocketCloseCode.MULTI_CONNECTION);
    }
    client.socket.on('close', () => {
      delete clients[client.id];
      Client.publish('disconnected', { id: client.id });
    });
    clients[client.id] = client;
    client.response('welcome', {
      administrator: Boolean(SETTINGS.administrators.find(v => v.id === client.id)),
      id           : client.id,
      server       : cluster,
      users        : Object.values(clients).map(v => v.sessionize()),
      rooms        : Object.values(rooms).map(v => v.sessionize()),
      playTime     : 0 // TODO
    });
  });
  server.on('error', err => {
    Logger.error("Server").next("Error").put(err.stack).out();
  });
}
/**
 * 가장 한산한 채널을 골라 그 번호를 반환한다.
 */
export function getAvailableChannel():number{
  if(!Cluster.isMaster){
    return Number(process.env['KKUTU_CHANNEL']) || 0;
  }
  const table:Table<number> = {};

  for(const k in channels){
    if(channels[k].isDead()){
      continue;
    }
    table[k] = 0;
  }
  for(const v of Object.values(rooms)){
    if(v.channel in table){
      table[v.channel]++;
    }
  }

  return Number(Object.entries(table).sort((a, b) => a[1] - b[1])[0][0]);
}
process.on('uncaughtException', err => {
  Logger.error("Lobby").put("Uncaught exception").next("Error").put(err.stack).out();
});
