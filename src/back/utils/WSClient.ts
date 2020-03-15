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

import WS = require("ws");

import { Logger } from "./Logger";
import { WebSocketCloseCode } from "./enums/StatusCode";

/**
 * 웹소켓 클라이언트 추상 클래스.
 *
 * 끄투 내 모든 웹소켓 통신은 JSON을 주고받으며
 * 요청의 추가 정보에는 반드시 `type` 속성이 들어가야 한다.
 *
 * 백엔드의 웹소켓 통신 구현은 이 클래스를 상속하는 것으로 이루어지며,
 * 끄투의 웹소켓 통신 구조와 담당 파일은 아래와 같다.
 *
 * ```plain
 *· ┌──────┐
 *· │클라이│
 *· │ 언트 │
 *· └─┬─(4)┘
 *·   │  │
 *· ┌(3)─┴─┐     ┌──────┐
 *· │ 게임(1)────┤  웹  │
 *· │ 서버 ├────(2)서버 │
 *· └──────┘     └──────┘
 * ```
 * `back/utils/WSClient` \
 * ├ (1) `back/game/clients/WebServer` \
 * ├ (2) `back/web/GameClient` \
 * └ (3) `back/game/clients/Client` \
 * (4) `front/utils/GameClient`
 */
export abstract class WSClient{
  protected abstract requestHandlerTable:KKuTu.Packet.RequestHandlerTable;
  protected abstract responseHandlerTable:KKuTu.Packet.ResponseHandlerTable;
  public id:string;
  public socket:WS;

  /**
   * 끄투의 통신 방식을 따르는 웹소켓 클라이언트를 초기화한다.
   *
   * @param id 이 클라이언트를 구분하기 위해 쓸 식별자.
   * @param socket 웹소켓 객체.
   */
  constructor(id:string, socket:WS){
    this.id = id;
    this.socket = socket;
    this.socket.on('error', err => {
      Logger.warning("WSClient").put(id).next("Error").put(err.stack).out();
    });
    this.socket.on('message', chunk => {
      const { type, ...data } = JSON.parse(chunk.toString());
      const handler = (this.requestHandlerTable as any)?.[type] || (this.responseHandlerTable as any)?.[type];
      const logger = Logger.log("WSClient").put(type);

      for(const k in data as Table<any>){
        logger.next(k);
        if(typeof data[k] === "object"){
          logger.put(JSON.stringify(data[k]));
        }else{
          logger.put(data[k]);
        }
      }
      logger.out();
      if(!handler){
        Logger.error("WSClient").put(`Unhandled type: ${type}`).out();

        return;
      }
      handler(data);
    });
    this.socket.on('close', code => {
      Logger.log("Closed").put(id).next("Code").put(code).out();
      this.socket.removeAllListeners();
      this.socket = null;
    });
  }
  /**
   * 웹소켓 통신을 종료한다.
   *
   * @param code 종료 코드.
   */
  public close(code?:WebSocketCloseCode):void{
    this.socket.close(code);
  }
  /**
   * 게임 서버로 정보를 보낸다.
   *
   * @param type 요청 유형.
   * @param data 추가 정보 객체.
   */
  public request<T extends KKuTu.Packet.RequestType>(type:T, data:KKuTu.Packet.RequestData<T> = {} as any):void{
    data.type = type;
    if(this.socket.readyState === 1){
      this.socket.send(JSON.stringify(data));
    }
  }
  /**
   * 클라이언트로 정보를 보낸다.
   *
   * @param type 응답 유형.
   * @param data 추가 정보 객체.
   */
  public response<T extends KKuTu.Packet.ResponseType>(type:T, data:KKuTu.Packet.ResponseData<T> = {} as any):void{
    data.type = type;
    if(this.socket.readyState === 1){
      this.socket.send(JSON.stringify(data));
    }
  }
}
