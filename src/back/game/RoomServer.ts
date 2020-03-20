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

import HTTPS = require("https");
import WS = require("ws");

import { connectDatabase, query } from "back/utils/Database";
import { Logger } from "back/utils/Logger";
import { SSL_OPTIONS } from "back/utils/SSL";
import { SETTINGS } from "back/utils/System";
import { Channel } from "./clients/Channel";
import { StatusCode, WebSocketCloseCode } from "back/utils/enums/StatusCode";
import { Client, RefreshResult } from "./clients/Client";

type Reservation = {
  'room':KKuTu.Packet.RequestData<'room-new'>;
  'timer':NodeJS.Timer;
};

/**
 * 현재 이 게임 방 서버에 접속 중인 일반 클라이언트를 (식별자, 웹소켓 인스턴스) 쌍으로 묶은 객체.
 */
export const clients:Table<Client> = {};
/**
 * 현재 이 게임 방 서버에 접속 중인 일반 클라이언트를 (이름에서 공백을 없앤 것, 식별자) 쌍으로 묶은 객체.
 */
export const clientNames:Table<string> = {};
/**
 * 방 예약 상태를 (세션 식별자, 예약) 쌍으로 묶은 객체.
 */
export const reservations:Table<Reservation> = {};
/**
 * 이 게임 방 서버의 채널 번호.
 */
export const CHANNEL = Number(process.env['KKUTU_CHANNEL']);

const PORT = Number(process.env['KKUTU_PORT']);

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
      port             : PORT,
      perMessageDeflate: false
    });
  }
  server.on('connection', async(socket, req) => {
    const [ key, channel ] = req.url.slice(1).split('&');
    const reservation = reservations[key];
    let session:any = null;
    let client:Client = null;
    let refreshResult:RefreshResult = null;

    socket.on('error', err => {
      Logger.warning("Client").put(key).next("Error").put(err.stack).out();
    });
    if(CHANNEL !== Number(channel)){
      Logger.warning("Client").put(key).next(`Wrong channel value ${channel} (expected ${CHANNEL})`).out();
      socket.close(WebSocketCloseCode.INVALID_CHANNEL);

      return;
    }
    if(!reservation){
      Logger.warning("Client").put(key).next(`Not reserved: ${key}`);
      socket.close(WebSocketCloseCode.NOT_RESERVED);
    }
    session = await query("SELECT profile FROM session WHERE _id = :key", { key });
    console.log(session);

    client = new Client(Client.generateId(key), socket);
    if(clients[client.id]){
      clients[client.id].close(WebSocketCloseCode.MULTI_CONNECTION);
    }
    if(SETTINGS.test && !SETTINGS.testers.includes(client.id)){
      client.close(WebSocketCloseCode.TEST);
    }

    refreshResult = await client.refresh();
    if(refreshResult.result !== StatusCode.OK){
      client.responseError(refreshResult.result, refreshResult.black);
      client.close(WebSocketCloseCode.REFRESH_FAILED);

      return;
    }
    clients[client.id] = client;
    clientNames[client.whisperName] = client.id;
  });
  server.on('error', err => {
    Logger.error("Server").next("Error").put(err.stack).out();
  });
}
process.on('message', data => {
  Channel.handleRequest(data);
});
process.on('uncaughtException', err => {
  Logger.error("Room").put("Uncaught exception").next("Error").put(err.stack).out();
});
