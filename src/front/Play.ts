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
import { G, initialize, L } from "./utils/Global";
import { checkCompatibility } from "./utils/Utility";

/**
 * 자주 쓰이는 JQuery 객체를 담은 객체.
 */
export const $stage:Partial<{
  'intro':JQuery,
  'introText':JQuery,
  'loading':JQuery,
  'dialog':{
    'help':JQuery
  },
  'menu':{
    'help':JQuery,
    'settings':JQuery,
    'community':JQuery,
    'spectate':JQuery,
    'room-set':JQuery,
    'room-new':JQuery,
    'room-quick':JQuery,
    'shop':JQuery,
    'dictionary':JQuery,
    'invite':JQuery,
    'practice':JQuery,
    'ready':JQuery,
    'start':JQuery,
    'exit':JQuery,
    'replay':JQuery,
    'leaderboard':JQuery
  }
}> = {};
/**
 * 자주 쓰이는 전역 정보를 담은 객체.
 */
export const $data:{
  'audioContext'?:AudioContext,
  'mutedBGM'?:boolean,
  'mutedSE'?:boolean,
  'url'?:string
} = {};

enum UIPhase{
  LOBBY = "lobby",
  MASTER = "master",
  NORMAL = "normal",
  GAMING = "gaming"
}

$(document).ready(async () => {
  initialize();
  if(!checkCompatibility()){
    updateLoading(L('compatibility-error'));

    return;
  }
  $stage.intro = $("#intro");
  $stage.introText = $("#intro-text");
  $stage.loading = $("#loading");
  $stage.dialog = {
    help: $("#dialog-help")
  };
  $stage.menu = {
    'help': $("#menu-help"),
    'settings': $("#menu-settings"),
    'community': $("#menu-community"),
    'spectate': $("#menu-spectate"),
    'room-set': $("#menu-room-set"),
    'room-new': $("#menu-room-new"),
    'room-quick': $("#menu-room-quick"),
    'shop': $("#menu-shop"),
    'dictionary': $("#menu-dictionary"),
    'invite': $("#menu-invite"),
    'practice': $("#menu-practice"),
    'ready': $("#menu-ready"),
    'start': $("#menu-start"),
    'exit': $("#menu-exit"),
    'replay': $("#menu-replay"),
    'leaderboard': $("#menu-leaderboard")
  };

  $data.url = $("#url").text();

  await loadSounds();
  await connectLobby($data.url);
  $stage.menu.help.on('click', () => {
    $("#help-board").attr('src', "/help");
    showDialog($stage.dialog.help);
  });
});
/**
 * 대화상자를 보인다.
 *
 * 이미 보이는 경우 `noToggle`이 `true`가 아닌 한 대화상자를 숨긴다.
 *
 * @param $target 보여줄 대화상자 객체.
 * @param noToggle 토글 비활성화 여부. `true`인 경우 이 함수 호출로는 대화상자가 숨겨지지 않는다.
 */
export function showDialog($target:JQuery, noToggle?:boolean):boolean{
  if(!noToggle && $target.is(':visible')){
    $target.hide();

    return false;
  }
  $(".dialog-front").removeClass("dialog-front");
  $target.show().addClass("dialog-front").css({
    left: (G.windowSize[0] - $target.width()) / 2,
    top: (G.windowSize[1] - $target.height()) / 2
  });

  return true;
}
/**
 * 로딩 화면에 내용을 표시한다.
 *
 * 인트로 화면이 나타나 있다면 로딩 화면 대신 인트로 화면에서 내용을 표시한다.
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
/**
 * UI를 갱신한다.
 *
 * UI는 `UIPhase`에 따라 달라진다.
 */
export function updateUI():void{
  const phase = UIPhase.LOBBY;

  $(".kkutu-menu>button").hide();
  $(`.kkutu-menu>.for-${phase}`).show();
}
