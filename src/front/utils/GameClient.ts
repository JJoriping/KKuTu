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

import { Logger } from "back/utils/Logger";
import { $stage, updateLoading, updateUI } from "front/Play";
import { playSound, Sound, stopAllSounds } from "./Audio";
import { L } from "./Global";

const SPAM_THRESHOLD = 10;
const SPAM_CLOSE_THRESHOLD = 3;

let lobbyClient:WebSocket;
let roomClient:WebSocket;
let spamCount = 0;
let spamWarning = 0;

const handlerTable:KKuTu.Packet.ResponseHandlerTable = {
  welcome: data => {
    const INTERVAL_INTRO_ANIMATION = 1000;

    playSound(Sound.BGM_LOBBY, true);
    $stage.intro
      .animate({ opacity: 1 }, INTERVAL_INTRO_ANIMATION)
      .animate({ opacity: 0 }, INTERVAL_INTRO_ANIMATION, () => {
        $stage.intro.hide();
      })
    ;
    $stage.introText.text(L('welcome'));
    Logger.success("Lobby").next("Administrator").put(data.administrator).out();
  }
};
/**
 * 로비 서버에 접속한다.
 *
 * @param url 게임 로비 서버 주소.
 */
export function connectLobby(url:string):Promise<void>{
  return new Promise((res, rej) => {
    lobbyClient = new WebSocket(url);
    lobbyClient.onopen = () => {
      updateLoading();
      updateUI();
      res();
    };
    lobbyClient.onmessage = e => {
      const { type, ...data } = JSON.parse(String(e.data));

      if(!handlerTable.hasOwnProperty(type)){
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
      Logger.warning("Closed").put(e.code).out();
    };
    lobbyClient.onerror = (e:ErrorEvent) => {
      Logger.error("Lobby").put(e.error).out();
    };
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
export function send<T extends KKuTu.Packet.Type>(type:T, data:KKuTu.Packet.RequestData<T>, toLobby?:boolean):void{
  const target = toLobby || !roomClient ? lobbyClient : roomClient;

  if(spamCount++ > SPAM_THRESHOLD){
    if(++spamWarning >= SPAM_CLOSE_THRESHOLD){
      target.close();

      return;
    }
    spamCount >>= 1;
  }
  target.send(JSON.stringify({
    type,
    ...data
  }));
}
