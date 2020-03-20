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

import { Client } from "./clients/Client";
import { RULE_TABLE, Rule } from "back/utils/Rule";
import { rooms } from "./LobbyServer";
import { Channel } from "./clients/Channel";
import { reduceToTable } from "back/utils/Utility";
import { clients } from "./RoomServer";

/**
 * 게임 방 클래스.
 */
export class Room{
  private static readonly MIN_ID_SEQUENCE = 100;
  private static readonly MAX_ID_SEQUENCE = 999;
  private static idSequence = Room.MIN_ID_SEQUENCE;

  /**
   * 새로 설정 가능한 방 번호를 생성해 반환한다.
   */
  public static generateId():number{
    const R = Room.idSequence;

    do{
      if(++Room.idSequence > Room.MAX_ID_SEQUENCE){
        Room.idSequence = Room.MIN_ID_SEQUENCE;
      }
    }while(rooms[Room.idSequence]);

    return R;
  }

  public readonly id:number;
  public readonly channel:number;

  public forPractice:boolean;
  public master:string;
  public title:string;
  public rule:Rule;
  public options:KKuTu.Game.RoomOptions;
  public round:number;
  public time:number;
  public gaming:boolean;
  public password:string;
  public limit:number;

  public players:string[];
  public kickVote:KKuTu.Game.KickVote;
  public game:KKuTu.Game.Play;

  constructor(id:number, channel:number, data?:KKuTu.Packet.RequestData<'room-new'>){
    this.id = id;
    this.channel = channel;
    if(data){
      this.setData(data);
    }
  }

  /**
   * 주어진 사용자 객체를 이 방에 입장시킨다.
   *
   * @param client 사용자 객체.
   */
  public come(client:Client):void{
    if(!this.forPractice){
      client.place = this.id;
    }
    if(this.players.push(client.id) === 1){
      this.master = client.id;
    }
    if(Cluster.isWorker){
      client.status = {
        ready         : false,
        team          : 0,
        cameWhenGaming: false,
        form          : "J",
        score         : 0
      };
      if(!this.forPractice){
        Channel.responseToMaster('room-come', {
          target: client.id,
          id    : this.id
        });
      }
      this.export(client.id);
    }
  }
  /**
   * 방 정보를 로비 서버로 공유한다.
   *
   * @param target 공유 주체.
   * @param kickVote 강퇴 투표 객체.
   * @param forSpectate 관전 사용자 대상 공유 여부.
   */
  public export(target?:string, kickVote?:KKuTu.Game.KickVote, forSpectate?:boolean):void{
    const data:KKuTu.Packet.ResponseData<'room'> = {
      room: this.sessionize()
    };

    if(!this.rule){
      return;
    }
    if(target){
      data.target = target;
    }
    if(kickVote){
      data['kick-vote'] = kickVote;
    }
    if(forSpectate && this.gaming){
      switch(RULE_TABLE[this.rule].name){
        case"Classic":
          if(this.game.chain){
            data.chain = this.game.chain.length;
          }
          break;
        case"Jaqwi":
          data.theme = this.game.theme;
          data.consonants = this.game.consonants;
          break;
        case"Crossword":
          data.prisoners = this.game.prisoners;
          data.boards = this.game.boards;
          data.means = this.game.means;
          break;
        default:
      }
      data.scores = reduceToTable(this.game.seq, v => clients[v]?.status.score);
    }
    if(this.forPractice){
      clients[this.master].response('room');
    }else{
      data.password = this.password;
      Client.publish('room', data);
    }
  }
  /**
   * 주어진 방 정보에 맞게 방을 수정한다.
   *
   * @param data 방 정보 객체.
   */
  public setData(data:KKuTu.Packet.RequestData<'room-new'>):void{
    this.title = data.title;
    this.password = data.password;
    this.limit = data.limit;
    this.rule = data.rule as Rule;
    this.round = data.round;
    this.time = data.time;
    this.options = data.options;
  }
  /**
   * 이 클라이언트의 통신용 객체를 만들어 반환한다.
   */
  public sessionize():KKuTu.Game.Room{
    return {
      id      : this.id,
      channel : this.channel,
      master  : this.master,
      title   : this.title,
      rule    : this.rule,
      options : this.options,
      round   : this.round,
      time    : this.time,
      gaming  : this.gaming,
      password: Boolean(this.password),
      players : this.players.map(v => clients[v].sessionize()),
      limit   : this.limit
    };
  }
}
