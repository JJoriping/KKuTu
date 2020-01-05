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

import { playSound, Sound } from "./Audio";
import { ChatBalloonFlag } from "./enums/ChatBallonFlag";
import { send } from "./GameClient";
import { G, L } from "./Global";
import { $data, $stage } from "./PlayUtility";

const REGEXP_LINK = /https?:\/\/[\w\.\?\/&#%=-_\+]+/g;
const REGEXP_INSULTS = new RegExp(
  [
    "느으*[^가-힣]*금마?",
    "니[^가-힣]*(엄|앰|엠)",
    "(ㅄ|ㅂㅅ|ㅅㅂ|ㅆㅂ|ㅆㅃ)",
    "미친(년|놈)?",
    "(병|븅|빙)[^가-힣]*신",
    "보[^가-힣]*지",
    "(새|섀|쌔|썌)[^가-힣]*(기|끼)",
    "(섹|쎾|쎅)[^가-힣]*스",
    "(시|씨|쉬|쒸)이*입?[^가-힣]*(발|빨|벌|뻘|팔|펄)",
    "십[^가-힣]*새",
    "씹",
    "(애|에)[^가-힣]*미",
    "자[^가-힣]*지",
    "존[^가-힣]*나",
    "좆|죶",
    "지랄",
    "창[^가-힣]*(녀|년|놈)",
    "fuck",
    "sex"
  ].join('|'),
  "gi"
);
const INSULT_REPLACEMENT = "♥";
const MAX_CHAT_LENGTH = 99;
const MAX_LOG_LENGTH = 199;

/**
 * 수신한 대화를 채팅으로 표시한다.
 *
 * @param profile 말한 계정의 정보 객체.
 * @param message 말 내용.
 * @param from 말한 계정의 식별자.
 * @param timestamp 말한 시각.
 */
export function chat(profile:KKuTu.Game.Profile, message:string, from?:string, timestamp?:number):void{
  const PROFILE_ID_LENGTH = 5;

  const date = timestamp ? new Date(timestamp) : new Date();
  const equip = $data.users[profile.id]?.equip || {};
  let $baby:JQuery;
  let $bar:JQuery;
  let $message:JQuery;
  let link:RegExpExecArray;

  if(from){
    if($data.settings.dw) return;
    if($data.blacklist[from]) return;
  }
  message = replaceInsults(message);
  playSound(Sound.CHAT);
  pruneChat();
  if(!G.mobile && $data.room){
    showChatBalloon(
      message,
      profile.id,
      ($data.room.gaming ? ChatBalloonFlag.GAMING : 0)
      | ($(".jjoriping").hasClass("big") ? ChatBalloonFlag.BIG : 0)
    );
  }
  $baby = $("<div>").addClass("chat-item")
    .append($bar = $("<div>").addClass("chat-head ellipse").text(profile.title || profile.name))
    .append($message = $("<div>").addClass("chat-body").text(message))
    .append($("<div>").addClass("chat-stamp").text(date.toLocaleTimeString()))
  ;
  if(timestamp){
    $bar.prepend($("<i>").addClass("fa fa-video-camera"));
  }
  $bar.on('click', () => {
    // requestProfile(profile.id);
  });
  $stage.chatLog.append($baby.clone()
    .append($("<div>").addClass("tooltip")
      .css('font-weight', "normal")
      .html(`#${(profile.id || "").slice(0, PROFILE_ID_LENGTH)}`)
    )
  );
  if(link = REGEXP_LINK.exec(message)){
    message = $message.html();
    link.forEach(v => {
      message = message.replace(v, `<a
        href="#"
        style="color: #2222FF;"
        onclick="if(confirm('${L('link-warning')}')) window.open('${v}');"
      >${v}</a>`);
    });
    $message.html(message);
  }
  if(from){
    if(from !== $data.id) $data.recentFrom = from;
    $message.html(`<label
      style="color: #7777FF; font-weight: bold;"
    >&lt;${L('whisper')}&gt;</label>${$message.html()}`);
  }
  addonNickname($bar, equip);
  $stage.chat.append($baby).scrollTop(Number.MAX_SAFE_INTEGER);
}
/**
 * 주어진 문자열에 포함된 나쁜 말을 대체 문구로 바꿔 반환한다.
 *
 * @param text 대상 문자열.
 */
export function replaceInsults(text:string):string{
  return text.replace(REGEXP_INSULTS, v => INSULT_REPLACEMENT.repeat(v.length));
}
/**
 * 대상 계정으로 귓속말을 보낸다.
 *
 * @param target 대상 계정 식별자.
 * @param message 보낼 메시지.
 */
export function sendWhisper(target:string, message:string):void{
  if(!message.length){
    return;
  }
  $data.whisper = target;
  send('talk', {
    whisper: target,
    value: message
  },   true);
  chat({ id: null, title: `→${target}`, name: null }, message, $data.id);
}
/**
 * 말풍선을 주어진 계정 위에 표시한다.
 *
 * @param text 표시할 문자열.
 * @param id 주체 계정 식별자.
 * @param flags 말풍선 유형.
 */
export function showChatBalloon(text:string, id:string, flags:number):void{
  $(`#balloon-${id}`).remove();

  const INTERVAL_DISAPPEAR = 500;
  const INTERVAL_LIFETIME = 2500;
  const OFFSET_BIG_LEFT = 200;
  const OFFSET_GAMING_TOP = 35;
  const OFFSET_GAMING_LEFT = -2;
  const OFFSET_BIG_GAMING_LEFT = 5;
  const OFFSET_BIG_GAMING_TOP = 210;
  const OFFSET_TOP = 40;
  const OFFSET_LEFT = 110;

  const offset = (flags & ChatBalloonFlag.GAMING ? $(`#game-user-${id}`) : $(`#room-user-${id}`)).offset();
  const image = flags & ChatBalloonFlag.GAMING ? "chat-balloon-bot" : "chat-balloon-tip";
  const $baby = $("<div>").addClass("chat-balloon").attr('id', `balloon-${id}`)
    .append($("<div>").addClass(`jt-image ${image}`))
  ;
  let offsetTop:number;
  let offsetLeft:number;

  if(flags & ChatBalloonFlag.GAMING){
    $baby.prepend($("<h4>").text(text));
  }else{
    $baby.append($("<h4>").text(text));
  }
  if(!offset){
    return;
  }
  $stage.balloons.append($baby);
  switch(flags){
    case ChatBalloonFlag.BIG:
      [ offsetTop, offsetLeft ] = [ 0, OFFSET_BIG_LEFT ];
      break;
    case ChatBalloonFlag.GAMING:
      [ offsetTop, offsetLeft ] = [ OFFSET_GAMING_TOP - $baby.height(), OFFSET_GAMING_LEFT ];
      break;
    case ChatBalloonFlag.BIG | ChatBalloonFlag.GAMING:
      [ offsetTop, offsetLeft ] = [ OFFSET_BIG_GAMING_LEFT, OFFSET_BIG_GAMING_TOP ];
      break;
    default:
      [ offsetTop, offsetLeft ] = [ OFFSET_TOP, OFFSET_LEFT ];
      break;
  }
  $baby.css({ top: offset.top + offsetTop, left: offset.left + offsetLeft });
  window.setTimeout(
    () => {
      $baby.animate({ opacity: 0 }, INTERVAL_DISAPPEAR, () => {
        $baby.remove();
      });
    },
    INTERVAL_LIFETIME
  );
}

function addonNickname($target:JQuery, equip:KKuTu.Game.User['equip']):void{
  if(equip['NIK']) $target.addClass(`x-${equip['NIK']}`);
  if(equip['BDG'] === "b1_gm") $target.addClass("x-gm");
}
function pruneChat():void{
  const $items = $("#chat .chat-item");
  const $logs = $("#chat-log-board .chat-item");

  while($items.length > MAX_CHAT_LENGTH){
    $items.first().remove();
  }
  while($logs.length > MAX_LOG_LENGTH){
    $logs.first().remove();
  }
}
