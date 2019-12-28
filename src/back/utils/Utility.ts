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

import { DateUnit } from "./enums/DateUnit";

/**
 * 유효한 단일 샤프 인자의 집합.
 */
export const REGEXP_LANGUAGE_ARGS = /\{#(\d+?)\}/g;
/**
 * 시간대 오프셋 값(㎳).
 */
export const TIMEZONE_OFFSET = new Date().getTimezoneOffset() * DateUnit.MINUTE;
/**
 * 배열을 생성해 반환한다.
 *
 * @param length 배열의 길이.
 * @param fill 배열의 내용.
 */
export function Iterator<T = undefined>(length:number, fill?:T):T[]{
  return Array(length).fill(fill);
}
/**
 * 제한 길이를 초과하는 내용이 생략된 문자열을 반환한다.
 *
 * @param text 대상 문자열.
 * @param limit 제한 길이.
 */
export function cut(text:string, limit:number):string{
  return text.length > limit
    ? `${text.slice(0, limit - 1)}…`
    : text
  ;
}
/**
 * 프론트엔드 여부를 반환한다.
 */
export function isFront():boolean{
  try{
    return window.FRONT;
  }catch(e){}

  return false;
}
/**
 * 배열을 주어진 함수에 따라 딕셔너리로 바꾸어 반환한다.
 *
 * @param target 대상 배열.
 * @param placer 값을 반환하는 함수.
 * @param keyPlacer 키를 반환하는 함수.
 */
export function reduceToTable<T, U, V extends number|string>(
  target:T[],
  placer:(v:T, i:number, my:T[]) => U,
  keyPlacer?:(v:T, i:number, my:T[]) => V
):{ [key in V]: U }{
  return target.reduce(
    keyPlacer
      ? (pv, v, i, my) => {
        pv[keyPlacer(v, i, my)] = placer(v, i, my);

        return pv;
      }
      : (pv, v, i, my) => {
        pv[String(v) as V] = placer(v, i, my);

        return pv;
      }
    ,
    {} as { [key in V]: U }
  );
}
/**
 * 문자열 내 단일 샤프 인자들을 추가 정보로 대체시켜 반환한다.
 *
 * @param text 입력 문자열.
 * @param args 추가 정보.
 */
export function resolveLanguageArguments(text:string, ...args:any[]):string{
  return text.replace(REGEXP_LANGUAGE_ARGS, (_, v1) => args[v1]);
}
/**
 * 주어진 수가 0보다 크면 + 기호를 붙여 반환한다.
 *
 * @param value 대상.
 */
export function toSignedString(value:number):string{
  return (value > 0 ? "+" : "") + value;
}
