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

import { Rule } from "back/utils/Rule";

/**
 * 주어진 방 객체가 원하는 유형과 규칙을 갖추었는지 여부를 반환한다.
 *
 * @param room 판단 대상 방 객체.
 * @param rule 원하는 게임 유형.
 * @param options 원하는 특수 규칙.
 * @param all 현재 입장할 수 없는 방도 탐색하는지 여부.
 */
export function isRoomMatched(
  room:KKuTu.Game.Room,
  rule:Rule,
  options:KKuTu.Game.RoomOptions,
  all?:boolean
):boolean{
  let k:keyof KKuTu.Game.RoomOptions;

  if(!all){
    if(room.gaming) return false;
    if(room.password) return false;
    if(room.players.length >= room.limit) return false;
  }
  if(room.rule !== rule) return false;
  for(k in options){
    if(!room.options[k]) return false;
  }

  return true;
}
