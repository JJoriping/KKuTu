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
import { $stage, updateLoading } from "front/Play";
import { playSound, Sound, stopAllSounds } from "./Audio";
import { L } from "./Global";

let lobbyClient:WebSocket;
let roomClient:WebSocket;

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
