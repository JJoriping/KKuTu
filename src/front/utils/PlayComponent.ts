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

import { getLevel, requestInvite, requestProfile, requestRoomInfo, tryJoin } from "./PlayUtility";
import { RULE_TABLE, Rule } from "back/utils/Rule";
import { L } from "./Global";
import { replaceInsults } from "./Chat";

const ROOM_METADATA_WIDTH = 270;

/**
 * 주어진 특수 규칙들로부터 문자열 표현을 구해 반환한다.
 *
 * @param rule 게임 유형.
 * @param options 특수 규칙 객체.
 * @param includeExtensions 주제 포함 여부.
 */
export function getOptionText(rule:Rule, options:KKuTu.Game.RoomOptions, includeExtensions = false):string[]{
  const R = [
    L(`mode-${rule}`)
  ];

  for(const v of RULE_TABLE[rule].options){
    if(v in options){
      R.push(L(`option-${v}`));
    }
  }
  if(includeExtensions){
    R.push(options.extensions.join('|'));
  }

  return R;
}
/**
 * 방 목록의 개별 게임 방 JQuery 객체를 만들어 반환한다.
 *
 * @param room 방 객체.
 */
export function RoomListBar(room:KKuTu.Game.Room):JQuery{
  const options = getOptionText(room.rule as Rule, room.options);
  let $R:JQuery = null;
  let $channel:JQuery = null;

  $R = $("<div>").attr('id', `room-${room.id}`).data('id', room.id).addClass("rooms-item")
    .append($channel = $("<div>").addClass(`rooms-channel channel-${room.channel}`)
      .on('click', () => requestRoomInfo(room.id)))
    .append($("<div>").addClass("rooms-number").html(String(room.id)))
    .append($("<div>").addClass("rooms-title ellipse").text(replaceInsults(room.title)))
    .append($("<div>").addClass("rooms-limit").html(`${room.players.length} / ${room.limit}`))
    .append($("<div>").width(ROOM_METADATA_WIDTH)
      .append($("<div>").addClass("rooms-mode").html(options.join(' / ')))
      .append($("<div>").addClass("rooms-round").html(L('rounds', room.round)))
      .append($("<div>").addClass("rooms-time").html(room.time + L('SECOND'))))
    .append($("<div>").addClass("rooms-lock")
      .html(room.password ? "<i class='fa fa-lock'></i>" : "<i class='fa fa-unlock'></i>"))
    .on('click', e => {
      if(e.target === $channel.get(0)){
        return;
      }
      tryJoin($(e.currentTarget).data('id'));
    })
  ;
  if(room.gaming) $R.addClass("rooms-gaming");
  if(room.password) $R.addClass("rooms-locked");

  return $R;
}
/**
 * 접속자 목록 및 초대 가능 사용자 목록의 개별 사용자 JQuery 객체를 만들어 반환한다.
 *
 * @param user 사용자 객체.
 * @param forInvite 초대 용도의 컴포넌트 여부.
 */
export function UserListBar(user:KKuTu.Game.User, forInvite?:boolean):JQuery{
  let $R:JQuery;

  if(forInvite){
    $R = $("<div>").attr('id', `invite-item-${user.id}`).data('id', user.id).addClass("invite-item users-item")
      .append($("<div>").addClass("jt-image users-image").css('background-image', `url('${user.profile.image}')`))
      .append(LevelImage(user.data.score).addClass("users-level"))
      .append($("<div>").addClass("users-name").html(user.profile.title || user.profile.name))
      .on('click', function(e){
        requestInvite($(e.currentTarget).data('id'));
      })
    ;
  }else{
    $R = $("<div>").attr('id', `users-item-${user.id}`).data('id', user.id).addClass("users-item")
      .append($("<div>").addClass("jt-image users-image").css('background-image', `url('${user.profile.image}')`))
      .append(LevelImage(user.data.score).addClass("users-level"))
      .append($("<div>").addClass("users-name ellipse").html(user.profile.title || user.profile.name))
      .on('click', function(e){
        requestProfile($(e.currentTarget).data('id'));
      })
    ;
  }

  return $R;
}
/**
 * 주어진 경로의 이미지를 불러오는 JQuery 객체를 만들어 반환한다.
 *
 * @param path 이미지 파일 경로.
 */
export function JTImage(path:string):JQuery{
  return $("<div>").addClass("jt-image").css('background-image', `url('${path}')`);
}
/**
 * 주어진 경험치에 상응하는 레벨 JQuery 객체를 만들어 반환한다.
 *
 * @param score 경험치.
 */
export function LevelImage(score:number):JQuery{
  const level = getLevel(score) - 1;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const levelSpriteX = -100 * (level % 25);
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const levelSpriteY = -100 * Math.floor(level * 0.04);

  return $("<div>").css({
    'float'              : "left",
    'background-image'   : "url('/media/images/level-sprite.png')",
    'background-position': `${levelSpriteX}% ${levelSpriteY}%`,
    'background-size'    : "2560%"
  });
}
