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

import { RuleOption } from "back/utils/Rule";
import { sendWhisper } from "./Chat";
import { UIPhase } from "./enums/UIPhase";
import { G } from "./Global";

/**
 * 자주 쓰이는 JQuery 객체를 담은 객체.
 */
export const $stage:Partial<{
  'chat':JQuery,
  'chatLog':JQuery,
  'talk':JQuery,
  'intro':JQuery,
  'introText':JQuery,
  'loading':JQuery,
  'balloons':JQuery,
  'box':{
    'chat':JQuery
  },
  'dialog':{
    'chat-log':JQuery,
    'extended-theme':JQuery,
    'help':JQuery,
    'quick':JQuery,
    'room':JQuery,
    'settings':JQuery
  },
  'game':{
    'here':JQuery,
    'here-text':JQuery
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
export const $data:Partial<{
  /**
   * DOM API 없이 소리 처리를 하기 위한 오디오 콘텍스트.
   */
  'audioContext':AudioContext,
  /**
   * 현재 재생 중인 배경 음악의 오디오 버퍼.
   */
  'bgm':AudioBuffer,
  /**
   * 차단한 사용자 목록 객체.
   */
  'blacklist':Table<true>,
  /**
   * 최근 설정된 어인정 주제 목록.
   */
  'extensions':string[],
  /**
   * 어인정 주제 선택 중, 어떤 언어의 목록에서 골랐는지를 구분하기 위해 쓰는
   * CSS 선택자의 접두어.
   */
  'extensionPrefix':string,
  /**
   * 현재 접속한 계정의 식별자.
   */
  'id':string,
  /**
   * 최근 설정된 배경 음악 음소거 여부.
   */
  'mutedBGM':boolean,
  /**
   * 최근 설정된 효과음 음소거 여부.
   */
  'mutedSE':boolean,
  /**
   * 설정할 수 있는 특수 규칙 목록.
   */
  'options':RuleOption[],
  /**
   * 현재 UI에서 보여줘야 할 화면.
   */
  'phase':UIPhase,
  /**
   * 빠른 입장 처리를 위해 필요한 정보 객체.
   */
  'quick':{
    /**
     * 빠른 입장 경과 시간(㎳).
     */
    'tick':number,
    /**
     * 경과 시간을 계산하고 입장 시도를 하기 위해 사용하는
     * `setInterval()` 함수의 반환값.
     */
    'timer':number,
    /**
     * 입장할 수 있는 방이 나와 입장을 시도하는 중인지 여부.
     */
    'prepared':boolean
  },
  /**
   * 최근 이 클라이언트로 귓속말을 보낸 계정 식별자.
   */
  'recentFrom':string,
  /**
   * 이 클라이언트가 입장한 방 정보 객체.
   */
  'room':KKuTu.Game.Room,
  /**
   * 이 서버의 방 목록.
   */
  'rooms':KKuTu.Game.Room[],
  /**
   * 최근 연 방 설정 대화상자의 목적.
   *
   * 방을 만드려는 경우 `room-new`, 방장으로서 수정하려는 경우 `room-set`을 갖는다.
   */
  'roomAction':"room-new"|"room-set",
  /**
   * 최근 설정된 설정 객체.
   */
  'settings':KKuTu.ClientSettings,
  /**
   * 접속할 게임 로비 서버의 주소.
   */
  'url':string,
  /**
   * 현재 접속 중인 사용자 목록 객체.
   */
  'users':Table<KKuTu.Game.User>,
  /**
   * 귓속말 상대.
   */
  'whisper':string
}> = {};

const SIZE_CHAT_WIDTH = 790;
const SIZE_CHAT_HEIGHT = 190;
const SIZE_INNER_CHAT_HEIGHT = 120;
const COMMAND_TABLE:Table<(chunk:string[]) => void> = {
  ㄱ: () => {
    if(!$data.room){
      return;
    }
    if($data.room.master === $data.id){
      $stage.menu.start.trigger('click');
    }else{
      $stage.menu.ready.trigger('click');
    }
  },
  ㄹ: () => {
    showDialog($stage.dialog['chat-log']);
    $stage.chatLog.scrollTop(Number.MAX_SAFE_INTEGER);
  },
  귓: chunk => {
    sendWhisper(chunk[1], chunk.slice(2).join(' '));
  },
  청소: () => {
    $stage.chat.empty();
  }
};

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
 * 주어진 식별자로부터 특수 규칙 활성화 여부 표를 구해 반환한다.
 *
 * @param prefix 객체 식별자의 접두어.
 */
export function getGameOptions(prefix:string):{
  [key in RuleOption]?: true
}{
  const R:{
    [key in RuleOption]?: true
  } = {};

  for(const v of $data.options){
    if($(`#${prefix}-${v}`).is(':checked')){
      R[v] = true;
    }
  }

  return R;
}
/**
 * 채팅으로 입력한 명령어를 실행한다.
 *
 * @param chunk 명령 내용.
 */
export function runCommand(chunk:string[]):void{
  const runner = COMMAND_TABLE[chunk[0]];

  if(runner){
    runner(chunk);
  }else{

  }
}
/**
 * 주어진 특수 규칙 목록에 맞게 객체의 표시 여부를 전환한다.
 *
 * @param options 특수 규칙 목록.
 * @param prefix 표시 여부를 바꿀 객체 식별자의 접두어.
 */
export function updateGameOptions(options:string[], prefix:string):void{
  for(const v of $data.options){
    const $target = $(`#${prefix}-${v}-panel`);

    if(options.includes(v)) $target.show();
    else $target.hide();
  }
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
 * UI 페이즈를 갱신한다.
 *
 * UI 페이즈는 `UIPhase`의 한 값으로 결정된다.
 */
export function updatePhase():void{
  $data.phase = UIPhase.LOBBY;
}
/**
 * UI를 갱신한다.
 *
 * UI는 `UIPhase`에 따라 달라진다.
 */
export function updateUI():void{
  updatePhase();

  $(".kkutu-menu>button").hide();
  $(`.kkutu-menu>.for-${$data.phase}`).show();

  for(const $v of Object.values($stage.box)){
    $v.hide();
  }
  $stage.box.chat.show().width(SIZE_CHAT_WIDTH).height(SIZE_CHAT_HEIGHT);
  $stage.chat.height(SIZE_INNER_CHAT_HEIGHT);

  switch($data.phase){
    case UIPhase.LOBBY:
      break;
    default:
      break;
  }
}
