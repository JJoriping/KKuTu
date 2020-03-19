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

import { $data } from "./PlayUtility";
import { ItemGroup } from "back/utils/enums/ItemGroup";

const DYNAMIC_IMAGE_KEY_LENGTH = 3;
const DYNAMIC_IMAGE_SIZE = 50;

/**
 * 모레미 치장 아이템의 URL을 반환한다.
 *
 * @param key 아이템 식별자.
 * @param group 아이템 착용 부위.
 */
export function moremiImage(key:string, group?:ItemGroup):string{
  const data:KKuTu.Game.Item = $data.shop[key] || {
    _id    : "def",
    group,
    options: {}
  };
  const extension = data.options.gif ? "gif" : "png";
  const isForMoremi = data.group[0].startsWith("M");

  if(key?.startsWith("$")){
    return moremiDynamicImage(
      key.slice(1, 1 + DYNAMIC_IMAGE_KEY_LENGTH) as ItemGroup,
      key.slice(1 + DYNAMIC_IMAGE_KEY_LENGTH)
    );
  }
  if(data.group.startsWith(ItemGroup.BADGE)){
    return `/media/images/badges/${key}.${extension}`;
  }

  return isForMoremi
    ? `/media/images/moremi/${data.group.slice(1)}/${data._id}.${extension}`
    : `/media/images/shop/${data._id}.${extension}`
  ;
}
/**
 * 동적으로 아이템 이미지를 만들고 그 URL을 반환한다.
 *
 * @param group 아이템 착용 부위.
 * @param data 추가 정보.
 */
export function moremiDynamicImage(group:ItemGroup, data:string):string{
  const $canvas = document.createElement("canvas");
  const context = $canvas.getContext('2d');

  $canvas.width = $canvas.height = DYNAMIC_IMAGE_SIZE;
  context.font = "24px NBGothic";
  context.textAlign = "center";
  context.textBaseline = "middle";
  switch(group){
    case ItemGroup.WORD_PIECE_A:
    case ItemGroup.WORD_PIECE_B:
    case ItemGroup.WORD_PIECE_C:
      {
        const index = [ ItemGroup.WORD_PIECE_A, ItemGroup.WORD_PIECE_B, ItemGroup.WORD_PIECE_C ].indexOf(group);
        const half = DYNAMIC_IMAGE_SIZE / 2;

        context.beginPath();
        context.arc(half, half, half, 0, 2 * Math.PI);
        context.fillStyle = [ "#DDDDDD", "#A6C5FF", "#FFEF31" ][index];
        context.fill();
        context.fillStyle = [ "#000000", "#4465C3", "#E69D12" ][index];
        context.fillText(data, half, half);
      }
      break;
    default:
  }

  return $canvas.toDataURL();
}
