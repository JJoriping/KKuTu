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

import $ = require("jquery");

import { loadSounds } from "./utils/Audio";
import { connectLobby } from "./utils/GameClient";
import { initialize, L } from "./utils/Global";
import { checkCompatibility } from "./utils/Utility";

/**
 * 자주 쓰이는 JQuery 객체를 담은 객체.
 */
export const $stage:{
  'intro'?:JQuery,
  'introText'?:JQuery,
  'loading'?:JQuery
} = {};
/**
 * 자주 쓰이는 전역 정보를 담은 객체.
 */
export const $data:{
  'audioContext'?:AudioContext,
  'mutedBGM'?:boolean,
  'mutedSE'?:boolean,
  'url'?:string
} = {};

$(document).ready(async () => {
  initialize();
  if(!checkCompatibility()){
    updateLoading(L('compatibility-error'));

    return;
  }
  $stage.intro = $("#intro");
  $stage.introText = $("#intro-text");
  $stage.loading = $("#loading");

  $data.url = $("#url").text();

  await loadSounds();
  await connectLobby($data.url);
});
/**
 * 로딩 화면에 내용을 표시한다.
 *
 * 로딩 화면은 다른 객체를 선택할 수 없게 만든다.
 *
 * @param html 표시할 내용. Falsy한 경우 로딩 화면을 숨긴다.
 */
export function updateLoading(html?:string):void{
  if(html){
    if($stage.intro.is(':visible')){
      $stage.loading.hide();
      $stage.introText.html(html);
    }else{
      $stage.loading.show().html(html);
    }
  }else{
    $stage.loading.hide();
  }
}
