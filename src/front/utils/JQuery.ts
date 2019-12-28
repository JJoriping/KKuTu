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

import { getCookie, setCookie } from "./Cookie";

/**
 * JQuery 모듈에 추가 기능을 넣는다.
 */
export function overrideJQuery():void{
  $.cookie = (key, value) => {
    if(value === undefined){
      return getCookie(key);
    }

    return setCookie(key, value);
  };
  $.prototype.bgColor = function(this:JQuery, code:string):JQuery{
    return this.css('background-color', code);
  };
  $.prototype.color = function(this:JQuery, code:string):JQuery{
    return this.css('color', code);
  };
  $.prototype.hotKey = function(this:JQuery, $target:JQuery, key:string):JQuery{
    ($target ?? $(window)).on('keydown', e => {
      if(!e.shiftKey && e.key === key){
        this.trigger('click');
        e.preventDefault();
      }
    });

    return this;
  };
}
