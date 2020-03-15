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

import { clients } from "../Lobby";
import { Logger } from "back/utils/Logger";
import { SETTINGS } from "back/utils/System";
import { WSClient } from "back/utils/WSClient";
import { WebSocketCloseCode } from "back/utils/enums/StatusCode";

const MAX_MESSAGE_LENGTH = 200;

/**
 * 일반 사용자의 클라이언트 클래스.
 */
export class Client extends WSClient{
  private static readonly GUEST_ID_RANGE = 10000;

  /**
   * 같은 곳에 접속한 다른 사용자들에게 메시지를 보낸다.
   *
   * @param type 응답 유형.
   * @param data 추가 정보 객체.
   */
  public static publish<T extends KKuTu.Packet.ResponseType>(type:T, data?:KKuTu.Packet.ResponseData<T>):void{
    for(const v of Object.values(clients)){
      v.response(type, data);
    }
  }

  private static generateProfile(id:string):KKuTu.Game.Profile{
    const number = String(Math.floor(Math.random() * Client.GUEST_ID_RANGE))
      .padStart(String(Client.GUEST_ID_RANGE).length - 1, "0")
    ;

    return {
      id,
      name : null,
      title: `GUEST-${number}`
    };
  }

  protected requestHandlerTable:KKuTu.Packet.RequestHandlerTable = {
    talk: data => {
      if(!data.value?.slice) return;

      data.value = data.value.slice(0, MAX_MESSAGE_LENGTH);
      this.chat(data.value);
    }
  };
  protected responseHandlerTable:KKuTu.Packet.ResponseHandlerTable = null;

  private profile:KKuTu.Game.Profile;
  private lastChatAt = Date.now();
  private spamScore = 0;
  private blocked = false;

  constructor(id:string, socket:WS, profile:KKuTu.Game.Profile = Client.generateProfile(id)){
    super(id, socket);
    this.profile = profile;
    Logger.info("Opened").put("Client")
      .next("ID").put(id)
      .next("Profile").put(this.profile.title || this.profile.name)
      .out()
    ;
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
    const now = Date.now();
    const gap = now - this.lastChatAt;
    let enabled = false;

    if(this.blocked){
      if(gap >= SETTINGS.application.spam['block-interval']){
        this.blocked = false;
        this.spamScore = 0;
        enabled = true;
      }else{
        this.spamScore++;
        if(this.spamScore >= SETTINGS.application.spam['close-threshold']){
          this.close(WebSocketCloseCode.SPAM);

          return;
        }
      }
    }else if(gap < SETTINGS.application.spam['add-interval']){
      this.spamScore++;
      if(this.spamScore >= SETTINGS.application.spam['threshold']){
        this.blocked = true;
      }else{
        enabled = true;
      }
    }else if(gap >= SETTINGS.application.spam['clear-interval']){
      this.spamScore = 0;
      enabled = true;
    }else{
      enabled = true;
    }
    if(enabled){
      Client.publish('talk', {
        profile: this.profile,
        value
      });
    }else{
      this.response('blocked');
    }
    this.lastChatAt = now;
  }
}
