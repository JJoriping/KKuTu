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

import { Logger } from "back/utils/Logger";
import { Sound, playSound, stopAllSounds } from "./Audio";
import { chat, notice } from "./Chat";
import { L } from "./Global";
import { $data, $stage, updateLoading, updateUI } from "./PlayUtility";
import { reduceToTable } from "back/utils/Utility";
import { WebSocketCloseCode } from "back/utils/enums/StatusCode";

const INTERVAL_INTRO_ANIMATION = 1000;

let lobbyClient:WebSocket;
let roomClient:WebSocket;

const handlerTable:KKuTu.Packet.ResponseHandlerTable = {
  'welcome': data => {
    if($data.pendingRoom){
      send('room-new', $data.pendingRoom);
      delete $data.pendingRoom;
    }else{
      playSound(Sound.BGM_LOBBY, true);
      $stage.intro
        .animate({ opacity: 1 }, INTERVAL_INTRO_ANIMATION)
        .animate({ opacity: 0 }, INTERVAL_INTRO_ANIMATION, () => {
          $stage.intro.hide();
        })
      ;
      $stage.introText.text(L('welcome'));
      $data.server = data.server;
      $data.users = reduceToTable(data.users, v => v, v => v.id);
      updateUI();
      Logger.success("Lobby").next("Administrator").put(data.administrator).out();
    }
  },
  'blocked': () => {
    notice(L('blocked'));
  },
  'talk': data => {
    chat(data.profile, data.value);
  },
  'pre-room': ({ channel, id }) => {
    connectRoom(channel, id);
  }
};

/**
 * 로비 서버에 접속한다.
 *
 * @param url 게임 로비 서버 주소.
 */
export function connectLobby(url:string):Promise<void>{
  return new Promise(res => {
    lobbyClient = new WebSocket(url);
    lobbyClient.onopen = () => {
      updateLoading();
      res();
    };
    lobbyClient.onmessage = e => {
      const { type, ...data } = JSON.parse(String(e.data));

      if(!(type in handlerTable)){
        Logger.error("Message").put(`Unhandled type: ${type}`).out();

        return;
      }
      (handlerTable as any)[type](data);
    };
    lobbyClient.onclose = e => {
      if(roomClient){
        roomClient.close(e.code);
      }
      stopAllSounds();
      alert(L('closed', e.code));
      $.get("/media/closed-notice.html", html => {
        updateLoading(html);
      });
      inspectClose(e.code);
    };
    lobbyClient.onerror = () => {
      Logger.error("lobbyClient").out();
    };
  });
}
/**
 * 게임 방 서버에 접속한다.
 *
 * @param channel 게임 방 채널 번호.
 * @param roomId 방 번호.
 */
export function connectRoom(channel:number, roomId:number):Promise<void>{
  return new Promise(res => {
    const url = $data.url.replace(/:(\d+)/, (v, p1) => (
      `:${Number(p1) + window.CONSTANTS['room-port-offset']}`
    )) + `&${channel}&${roomId}`;

    if(roomClient){
      return;
    }
    roomClient = new WebSocket(url);

    updateLoading([
      L('loading-room'),
      `<center><button id="cancel-room-connection">${L('cancel-room-connection')}</button></center>`
    ].join('\n'));
    $("#cancel-room-connection").on('click', () => {
      updateLoading();
      if(roomClient){
        roomClient.close();
      }
    });
    roomClient.onopen = () => {
      Logger.success("roomClient").put(url).out();
      $data.pendingRoom.id = Number(roomId);
    };
    roomClient.onmessage = lobbyClient.onmessage;
    roomClient.onclose = e => {
      inspectClose(e.code);
      roomClient = null;
    };
    roomClient.onerror = () => {
      Logger.error("roomClient").out();
    };
    res();
  });
}
/**
 * 데이터베이스로부터 모든 상점 품목을 불러와 메모리에 저장한다.
 */
export function loadShop():Promise<void>{
  return new Promise(res => {
    $.get("/shop", (chunk:{ 'goods':KKuTu.Game.Item[] }) => {
      for(const v of chunk.goods){
        $data.shop[v._id] = v;
      }
      res();
    });
  });
}
/**
 * 게임 서버로 메시지를 보낸다.
 *
 * `toLobby`가 `true`인 경우나 게임 방 서버에 접속 중이 아닐 때
 * 게임 로비 서버로 메시지를 보내며,
 * 이외의 경우 게임 방 서버로 메시지를 보낸다.
 *
 * @param type 요청 유형.
 * @param data 추가 정보.
 * @param toLobby 로비 서버로 전송 여부.
 */
export function send<T extends KKuTu.Packet.RequestType>(
  type:T,
  data:KKuTu.Packet.RequestData<T>,
  toLobby?:boolean
):void{
  const target = toLobby || !roomClient ? lobbyClient : roomClient;

  target.send(JSON.stringify({
    type,
    ...data
  }));
}

function inspectClose(code:number):void{
  const logger = Logger.warning("Closed").put(code);

  if(code in WebSocketCloseCode){
    logger.next("Description").put(WebSocketCloseCode[code]);
  }
  logger.out();
}
