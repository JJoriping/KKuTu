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

import { REGEXP_LANGUAGE_ARGS } from "back/utils/Utility";
import { testCookie } from "./Cookie";
import { overrideJQuery } from "./JQuery";

/**
 * 자주 쓰이는 값들을 모아 놓은 객체.
 */
export const G:{
  '$bottom'?:JQuery,
  '$middle'?:JQuery,
  '$notice'?:JQuery,
  '$noticeBody'?:JQuery,
  '$window'?:JQuery,
  'windowSize'?:[number, number],
  'tooltipSize'?:[number, number]
} = {};
/**
 * 페이지 작동에 필요한 기본적인 기능들을 준비한다.
 */
export function initialize():void{
  const MIN_HALF_SIZE = 500;
  const TOOLTIP_X_OFFSET = 5;
  const TOOLTIP_Y_OFFSET = 23;
  const TOOLTIP_COMMON_OFFSET = 12;

  // 초기화
  overrideJQuery();
  G.$bottom = $("#bottom");
  G.$middle = $("#middle");
  G.$notice = $("#global-notice").hide();
  G.$noticeBody = G.$notice.children(".body");
  G.$window = $(window);

  // 쿠키
  if(testCookie()){
    $.cookie('test', "");
  }else{
    G.$noticeBody.html(L('cookie-unavailable'));
  }

  // 공지
  if(G.$noticeBody.html().length > 1){
    G.$notice.show();
  }
  G.$notice.on('click', () => {
    G.$notice.hide();
  });

  // 창 크기
  G.$window.on('resize', () => {
    G.windowSize = [ G.$window.width(), G.$window.height() ];

    G.$middle.css('margin-left', Math.max(0, G.windowSize[0] / 2 - MIN_HALF_SIZE));
    G.$bottom.width(G.windowSize[0]);
  });

  // 툴팁
  G.$window.on('mousemove', e => {
    if(!G.tooltipSize){
      return;
    }
    $(".tooltip-active").css({
      left: Math.min(e.clientX + TOOLTIP_X_OFFSET, G.windowSize[0] - G.tooltipSize[0] - TOOLTIP_COMMON_OFFSET),
      top: Math.min(e.clientY + TOOLTIP_Y_OFFSET, G.windowSize[1] - G.tooltipSize[1] - TOOLTIP_COMMON_OFFSET)
    });
  }).trigger('resize');
  registerTooltip();
}
/**
 * 언어 문자열표로부터 주어진 식별자에 대응하는 값을 읽어 반환한다.
 *
 * 값의 `{#n}` 꼴 문자열은 추가 정보의 `n`번째 값으로 대체된다.
 *
 * @param key 식별자.
 * @param args 추가 정보.
 */
export function L(key:string, ...args:any[]):string{
  const R = window.L[key];

  return R
    ? R.replace(REGEXP_LANGUAGE_ARGS, (_, g1) => args[Number(g1)])
    : `(L#${key})`
  ;
}
/**
 * 주어진 탐색 위치에서 툴팁 객체가 동작하도록 설정한다.
 *
 * 이미 설정된 툴팁 객체가 중복되어 설정되지 않도록 해야 한다.
 *
 * @param $stage 탐색할 위치. 설정하지 않으면 전체를 탐색한다.
 */
export function registerTooltip($stage?:JQuery):void{
  const $tooltips = $stage ? $stage.find(".tooltip") : $(".tooltip");

  $tooltips.parent().addClass("tooltip-container").on('mouseenter', e => {
    const $target = $(e.currentTarget).children(".tooltip");

    G.tooltipSize = [ $target.width(), $target.height() ];
    $(".tooltip-active").removeClass("tooltip-active");
    $target.addClass("tooltip-active");
  }).on('mouseleave', e => {
    $(e.currentTarget).children(".tooltip").removeClass("tooltip-active");
  });
}
