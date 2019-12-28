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

/**
 * 주어진 식별자에 대응하는 값을 쿠키로부터 읽어 반환한다.
 *
 * @param key 식별자.
 */
export function getCookie(key:string):string{
  let chunk:string[] = [];

  for(const v of decodeURIComponent(document.cookie).split(';').map(w => w.trim())){
    if(v.indexOf(`${key}=`) === 0){
      chunk = v.split("=");
    }
  }

  return unescape(chunk.length ? chunk[1] : "");
}
/**
 * 주어진 (식별자, 값) 쌍을 쿠키에 기록한다.
 *
 * @param key 식별자.
 * @param value 기록할 값.
 * @param lifetime 수명(일).
 */
export function setCookie(key:string, value:string, lifetime?:number):void{
  const expire = new Date();
  let cookie = `${key}=${escape(value)}; path=/ `;

  expire.setDate(expire.getDate() + lifetime);
  if(lifetime){
    cookie += `;expires=${expire.toUTCString()};`;
  }
  document.cookie = cookie;
}
/**
 * 쿠키 기능 작동 여부를 확인해 반환한다.
 */
export function testCookie():boolean{
  $.cookie('test', "good");

  return $.cookie('test') === "good";
}
