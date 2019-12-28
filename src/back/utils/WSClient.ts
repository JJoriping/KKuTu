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

import WS = require("ws");

import { Logger } from "./Logger";

/**
 * 웹소켓 클라이언트 추상 클래스.
 *
 * 끄투 내 모든 웹소켓 통신은 JSON을 주고받으며
 * 요청의 추가 정보에는 반드시 `type` 속성이 들어가야 한다.
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

      if(!handler){
        Logger.error("WSClient").put(`Unhandled type: ${type}`).out();

        return;
      }
      handler(data);
    });
    this.socket.on('close', code => {
      Logger.info("WSClient").put(id).next("Code").put(code).out();
      this.socket.removeAllListeners();
      this.socket = null;
    });
  }
  /**
   * 웹소켓 통신을 종료한다.
   */
  public close():void{
    this.socket.close();
  }
  /**
   * 게임 서버로 정보를 보낸다.
   *
   * @param type 요청 유형.
   * @param data 추가 정보 객체.
   */
  public request<T extends KKuTu.Packet.Type>(type:T, data?:KKuTu.Packet.RequestData<T>):void{
    if(!data){
      data = {} as any;
    }
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
  public response<T extends KKuTu.Packet.Type>(type:T, data?:KKuTu.Packet.ResponseData<T>):void{
    if(!data){
      data = {} as any;
    }
    data.type = type;
    if(this.socket.readyState === 1){
      this.socket.send(JSON.stringify(data));
    }
  }
}
