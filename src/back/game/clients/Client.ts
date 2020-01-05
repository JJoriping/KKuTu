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
import { SETTINGS } from "back/utils/System";
import { WSClient } from "back/utils/WSClient";
import { clients } from "../Lobby";

const MAX_MESSAGE_LENGTH = 200;

/**
 * 일반 사용자의 클라이언트 클래스.
 */
export class Client extends WSClient{
  protected requestHandlerTable:KKuTu.Packet.RequestHandlerTable = {
    talk: data => {
      if(!data.value?.slice) return;

      data.value = data.value.slice(0, MAX_MESSAGE_LENGTH);
      this.chat(data.value);
    }
  };
  protected responseHandlerTable:KKuTu.Packet.ResponseHandlerTable = null;

  constructor(id:string, socket:WS){
    super(id, socket);
    Logger.info("New").put("Client").next("ID").put(id).out();
    this.response('welcome', {
      administrator: Boolean(SETTINGS.administrators.find(v => v.id === id))
    });
  }
  /**
   * 같은 곳에 접속한 다른 사용자들에게 대화 메시지를 보낸다.
   *
   * @param value 대화 내용.
   */
  public chat(value:string):void{
    this.publish('talk', {
      profile: {
        id: this.id,
        title: null,
        // TODO 구현
        name: "test"
      },
      value
    });
  }
  /**
   * 같은 곳에 접속한 다른 사용자들에게 메시지를 보낸다.
   *
   * @param type 응답 유형.
   * @param data 추가 정보 객체.
   */
  public publish<T extends KKuTu.Packet.Type>(type:T, data?:KKuTu.Packet.ResponseData<T>):void{
    for(const v of Object.values(clients)){
      v.response(type, data);
    }
  }
}
