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
import WS = require("ws");

import { channels, clients, getAvailableChannel, rooms } from "../LobbyServer";
import { Logger } from "back/utils/Logger";
import { SETTINGS } from "back/utils/System";
import { WSClient } from "back/utils/WSClient";
import { ApplicationError, StatusCode, WebSocketCloseCode } from "back/utils/enums/StatusCode";
import { RULE_TABLE, Rule } from "back/utils/Rule";
import { reduceToTable } from "back/utils/Utility";
import { Room } from "../Room";
import { query } from "back/utils/Database";
import { Channel } from "./Channel";

const ROOM_CONSTRAINTS = SETTINGS.application['room-constraints'];

/**
 * 일반 사용자가 데이터베이스로부터 사용자 정보를 불러올 때, 그 결과를 담은 객체.
 */
export type RefreshResult = {
  /**
   * 결과 번호.
   */
  'result':number;
  /**
   * 차단 사유.
   */
  'black'?:string;
};

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
    if(Cluster.isMaster || type !== "room"){
      for(const v of Object.values(clients)){
        v.response(type, data);
      }
    }else{
      Channel.responseToMaster('room-publish', data as KKuTu.Packet.ResponseData<'room-publish'>);
    }
  }
  /**
   * 식별자를 생성해 반환한다.
   *
   * @param key 세션 식별자.
   */
  public static generateId(key:string):string{
    return `GUEST-${key}`;
  }

  private static generateData():KKuTu.Game.User['data']{
    return {
      score : 0,
      record: reduceToTable(
        Object.keys(RULE_TABLE),
        () => ({
          plays   : 0,
          wins    : 0,
          scores  : 0,
          playtime: 0
        })
      )
    };
  }
  private static generateProfile(id:string):KKuTu.Game.Profile{
    const number = String(Math.floor(Math.random() * Client.GUEST_ID_RANGE))
      .padStart(String(Client.GUEST_ID_RANGE).length - 1, "0")
    ;

    return {
      id,
      name : null,
      title: `GUEST-${number}`,
      image: "/media/images/guest.png"
    };
  }

  protected requestHandlerTable:KKuTu.Packet.RequestHandlerTable = {
    'talk': data => {
      if(!data.value?.slice) return;

      data.value = data.value.slice(0, SETTINGS.application['max-message-length']);
      this.chat(data.value);
    },
    'room-new': data => {
      if(this.place){
        this.response('room-stuck');
        Logger.warning("room-stuck").put(this.place).out();

        return;
      }
      if(this.guest && (
        !SETTINGS.application['guest-permission']['create'] || !SETTINGS.application['guest-permission']['enter']
      )){
        this.responseError(ApplicationError.GUEST_NOT_ALLOWED);

        return;
      }
      if(!data.title || data.title.length < 1 || data.title.length > ROOM_CONSTRAINTS['max-title-length']){
        this.responseError(ApplicationError.BAD_REQUEST);

        return;
      }
      if(data.password && data.password.length > ROOM_CONSTRAINTS['max-password-length']){
        this.responseError(ApplicationError.BAD_REQUEST);

        return;
      }
      if(data.limit < 2 || data.limit > ROOM_CONSTRAINTS['max-player-count']){
        this.responseError(ApplicationError.BAD_REQUEST);

        return;
      }
      if(!Object.values<string>(Rule).includes(data.rule)){
        this.responseError(ApplicationError.BAD_REQUEST);

        return;
      }
      if(data.round < 1 || data.round > ROOM_CONSTRAINTS['max-round-count']){
        this.responseError(ApplicationError.BAD_REQUEST);

        return;
      }
      if(!ROOM_CONSTRAINTS['available-round-times'].includes(data.time)){
        this.responseError(ApplicationError.BAD_REQUEST);

        return;
      }
      if(Cluster.isMaster){
        const availableChannel = getAvailableChannel();
        const room = new Room(Room.generateId(), availableChannel);

        room.setData(data);
        channels[room.channel].requestToWorker('room-reserve', {
          master: this.id,
          room  : data
        });
        this.response('pre-room', {
          id     : room.id,
          channel: room.channel
        });
      }else if(this.place){
        this.responseError(ApplicationError.NOT_LOBBY);
      }else{
        Channel.responseToMaster('room-reserve', {
          master: this.id,
          room  : data
        });
      }
    }
  };
  protected responseHandlerTable:KKuTu.Packet.ResponseHandlerTable = null;

  public guest:boolean;
  public profile:KKuTu.Game.Profile;
  public data:KKuTu.Game.User['data'];
  public equip:KKuTu.Game.User['equip'];
  public money:number;
  public friends:Table<string>;
  public place:number;
  public status:KKuTu.Game.Status;

  private lastChatAt = Date.now();
  private spamScore = 0;
  private blocked = false;

  constructor(id:string, socket:WS, profile:KKuTu.Game.Profile = null){
    super(id, socket);
    this.guest = !profile;
    this.profile = profile || Client.generateProfile(id);
    this.place = 0;
    Logger.info("Opened").put("Client")
      .next("ID").put(id)
      .next("Profile").put(this.profile.title || this.profile.name)
      .out()
    ;
  }

  /**
   * 이 클라이언트의 표시용 이름을 반환한다.
   */
  public get displayName():string{
    return this.profile.title || this.profile.name;
  }
  /**
   * 이 클라이언트의 귓속말용 이름을 반환한다.
   */
  public get whisperName():string{
    return this.displayName.replace(/\s/g, "");
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
  /**
   * 주어진 방으로 입장한다.
   *
   * @param room 입장할 방 객체.
   */
  public enter(room:KKuTu.Game.Room):void{
    if(room.id){
      // TODO 이미 있는 방에 들어가기
    }
    rooms[room.id].come(this);
  }
  /**
   * 데이터베이스로부터 사용자 정보를 불러오고 그 결과를 반환한다.
   */
  public refresh():Promise<RefreshResult>{
    return new Promise(res => {
      if(this.guest){
        this.equip = {};
        this.data = Client.generateData();
        this.money = 0;
        this.friends = {};
        res({ result: StatusCode.OK });

        return;
      }
      query("SELECT * FROM users WHERE _id = :id", { id: this.id }).then(user => {
        console.log(user);
      });
    });
  }
  /**
   * 이 클라이언트의 통신용 객체를 만들어 반환한다.
   */
  public sessionize():KKuTu.Game.User{
    return {
      id      : this.id,
      guest   : this.guest,
      robot   : false,
      exordial: "", // TODO
      profile : this.profile,
      place   : this.place,
      data    : this.data,
      equip   : {}
    };
  }
}
