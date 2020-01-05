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
import { playSound, Sound } from "./Audio";
import { G } from "./Global";
import { $data } from "./PlayUtility";

/**
 * 주어진 객체에 명시된 대로 설정을 적용한다.
 *
 * @param settings 설정 객체.
 */
export function applySettings(settings:KKuTu.ClientSettings):void{
  $data.settings = settings;
  $data.mutedBGM = $data.settings.mb;
  $data.mutedSE = $data.settings.me;

  $("#mute-bgm").attr('checked', $data.mutedBGM ? "checked" : null);
  $("#mute-effect").attr('checked', $data.mutedSE ? "checked" : null);
  $("#deny-invite").attr('checked', $data.settings.di ? "checked" : null);
  $("#deny-whister").attr('checked', $data.settings.dw ? "checked" : null);
  $("#deny-friend").attr('checked', $data.settings.df ? "checked" : null);
  $("#auto-ready").attr('checked', $data.settings.ar ? "checked" : null);
  $("#sort-user").attr('checked', $data.settings.su ? "checked" : null);
  $("#only-waiting").attr('checked', $data.settings.ow ? "checked" : null);
  $("#only-unlock").attr('checked', $data.settings.ou ? "checked" : null);

  if($data.bgm){
    const node = $data.audioContext.createGain();

    if($data.mutedBGM){
      node.gain.value = 0;
      $data.bgm.playingSource.stop();
    }else{
      node.gain.value = 1;
      playSound($data.bgm.playingSource.key as Sound, true);
    }
    node.connect($data.audioContext.destination);
  }
  {
    const log = Logger.info("Settings");

    for(const k in $data.settings){
      log.next(k).put(($data.settings as any)[k]);
    }
    log.out();
  }
}
/**
 * 끄투를 즐기기 위해 필요한 조건을 브라우저가 충족했는지 여부를 반환한다.
 */
export function checkCompatibility():boolean{
  if(!window.hasOwnProperty('WebSocket')){
    return false;
  }
  if(!window.hasOwnProperty('AudioContext')){
    return false;
  }

  return true;
}
/**
 * 대상 객체를 드래그하기 시작한다.
 *
 * 윈도우의 `mousemove` 이벤트 핸들러가 추가된다.
 *
 * @param $target 드래그 대상 객체.
 * @param x 시작 `pageX`.
 * @param y 시작 `pageY`.
 */
export function startDrag($target:JQuery, x:number, y:number):void{
  const position = $target.position();

  G.$window.on('mousemove', e => {
    const [ deltaX, deltaY ] = [ e.pageX - x, e.pageY - y ];

    $target.css({
      left: position.left + deltaX,
      top: position.top + deltaY
    });
  });
}
/**
 * 드래그를 끝낸다.
 *
 * 윈도우의 `mousemove` 이벤트 핸들러가 없어진다.
 */
export function stopDrag():void{
  G.$window.off('mousemove');
}
