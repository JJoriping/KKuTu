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
import { clients as lobbyClients, rooms } from "./LobbyServer";
import { Channel } from "./clients/Channel";
import { reduceToTable } from "back/utils/Utility";
import { clients as roomClients } from "./RoomServer";
import { ApplicationError } from "back/utils/enums/StatusCode";

/**
 * 게임 방 클래스.
 */
export class Room{
  private static readonly MIN_ID_SEQUENCE = 100;
  private static readonly MAX_ID_SEQUENCE = 999;
  private static idSequence = Room.MIN_ID_SEQUENCE;

  private static get clients():Table<Client>{
    return Cluster.isMaster ? lobbyClients : roomClients;
  }
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

  public players:string[] = [];
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
   * 주어진 사용자를 이 방에 입장시킨다.
   *
   * @param client 사용자 인스턴스.
   */
  public come(client:Client):void{
    if(!this.forPractice){
      client.place = this.id;
    }
    if(this.players.push(client.id) === 1){
      this.master = client.id;
    }
    if(Cluster.isWorker){
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
        case "Classic":
          if(this.game.chain){
            data.chain = this.game.chain.length;
          }
          break;
        case "Jaqwi":
          data.theme = this.game.theme;
          data.consonants = this.game.consonants;
          break;
        case "Crossword":
          data.prisoners = this.game.prisoners;
          data.boards = this.game.boards;
          data.means = this.game.means;
          break;
        default:
      }
      data.scores = reduceToTable(this.game.seq, v => Room.clients[v]?.status.score);
    }
    if(this.forPractice){
      Room.clients[this.master].response('room');
    }else if(Cluster.isMaster){
      Client.publish('room', data);
    }else{
      Channel.responseToMaster('room-publish', {
        room: this
      });
    }
  }
  /**
   * 주어진 사용자를 이 방에서 퇴장시킨다.
   *
   * @param client 사용자 인스턴스.
   * @param kickVote 강퇴 투표 객체.
   */
  public go(client:Client, kickVote?:KKuTu.Game.KickVote):void{
    let index = this.players.indexOf(client.id);
    let isMyTurn:boolean;

    if(index === -1){
      client.place = 0;
      if(this.players.length < 1){
        delete rooms[this.id];
      }
      client.responseError(ApplicationError.NOT_LOBBY);

      return;
    }
    this.players.splice(index, 1);
    client.status = null;
    if(client.id === this.master){
      // TODO while(my.removeAI(false, true));
      this.master = this.players[0];
    }
    if(Room.clients[this.master]){
      Room.clients[this.master].status.ready = false;
      if(this.gaming){
        index = this.game.seq.indexOf(client.id);
        if(index !== -1){
          if(this.game.seq.length <= 2){
            this.game.seq.splice(index, 1);
            // TODO my.roundEnd();
          }else{
            isMyTurn = this.game.turn === index;
            if(isMyTurn && RULE_TABLE[this.rule].newRoundOnQuit){
              // TODO clearTimeout(...); ...
            }
            this.game.seq.splice(index, 1);
            if(this.game.turn > index){
              this.game.turn--;
              if(this.game.turn < 0){
                this.game.turn = this.game.seq.length - 1;
              }
            }
            if(this.game.turn >= this.game.seq.length){
              this.game.turn = 0;
            }
          }
        }
      }
    }else{
      // TODO if(my.gaming){ ... }
      delete rooms[this.id];
    }
    if(this.forPractice){
      global.clearTimeout(this.game.turnTimer);
      client.subplace = 0;
    }else{
      client.place = 0;
    }
    if(Cluster.isWorker){
      if(!this.forPractice){
        client.close();
        Channel.responseToMaster('room-go', {
          target : client.id,
          id     : this.id,
          removed: !rooms[this.id]
        });
      }
      this.export(client.id, kickVote);
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
      players : this.players.map(v => Room.clients[v]?.sessionize()),
      limit   : this.limit
    };
  }
}
