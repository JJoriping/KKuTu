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

import { Logger } from "back/utils/Logger";
import { schedule, SETTINGS } from "back/utils/System";
import { WSClient } from "back/utils/WSClient";

const INTERVAL_SEEK = 10000;

/**
 * 게임 로비 클라이언트 클래스.
 *
 * 웹 서버는 정적 메소드 `initialize()`를 통해 127.0.0.2로 게임 로비 서버에 접속하며,
 * 게임 로비 서버는 이 주소로 들어온 클라이언트를 웹 서버로 간주하고
 * 전용 명령(`seek` 등)을 제공한다.
 */
export class GameClient extends WSClient{
  /**
   * 생성한 클라이언트 객체 목록.
   */
  public static list:GameClient[] = [];

  /**
   * 웹 서버가 모든 게임 서버에 접속하게 하고 그 클라이언트 객체를 목록에 추가한다.
   */
  public static initialize():void{
    SETTINGS.ports.forEach((v, i) => {
      const protocol = SETTINGS.https ? "wss" : "ws";
      const key = `WEB-${process.pid}-${i}`;

      GameClient.list.push(new GameClient(
        key,
        `${protocol}://127.0.0.2:${v}/${key}`
      ));
    });
  }

  protected requestHandlerTable:KKuTu.Packet.RequestHandlerTable = null;
  protected responseHandlerTable:KKuTu.Packet.ResponseHandlerTable = {
    seek: ({ value }) => {
      this.seek = value;
      Logger.log("Seek").put(this.seek).out();
    }
  };
  public seek:number;

  constructor(id:string, url:string){
    super(id, new WS(url, {
      perMessageDeflate: false,
      rejectUnauthorized: false
    }));
    this.socket.on('open', () => {
      Logger.success("GameClient").put(this.id).out();
      schedule(this.onTick, INTERVAL_SEEK, {
        callAtStart: true,
        punctual: true
      });
    });
  }
  private onTick = () => {
    if(this.socket){
      this.request('seek');
    }else{
      this.seek = null;
    }
  }
}
