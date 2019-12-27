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

import ALP = require("accept-language-parser");
import Express = require("express");

import { Logger } from "./Logger";
import { getProjectData, SETTINGS } from "./System";

const LANGUAGE_SUPPORT = Object.keys(SETTINGS.locales);
const LANGUAGE_TABLE:Table<Table<Table<string>>> = {};
const REGEXP_PASCAL_CASE = /^[A-Z]\w+$/;

/**
 * 언어 파일을 새로 불러와 메모리에 저장한다.
 *
 * 언어 파일은 `dist/data/lang` 디렉토리로부터 읽으며,
 * 설정 파일의 `locales` 값을 수정해 지원할 언어 목록을 바꿀 수 있다.
 */
export function loadLanguages():void{
  for(const k in SETTINGS.locales){
    const file = JSON.parse(getProjectData(`lang/${k}.json`).toString());

    LANGUAGE_TABLE[k] = Object.keys(file).filter(v => REGEXP_PASCAL_CASE.test(v)).reduce((pv, page) => {
      pv[page] = {
        ...file['$global'],
        ...file[page]
      };

      return pv;
    },                                                                                   {} as Table<Table<string>>);
  }
  Logger.success("Language").out();
}
/**
 * 주어진 페이지 이름과 언어에 해당하는 문자열표를 반환한다.
 *
 * @param locale ISO 639 식별자.
 * @param page 불러올 페이지 이름.
 */
export function getLanguageTable(locale:string, page:string):Table<string>{
  return LANGUAGE_TABLE[locale][page];
}
/**
 * 주어진 요청으로부터 사용 가능한 언어를 반환한다.
 *
 * @param req Express 요청 객체.
 */
export function getLocale(req:Express.Request):string{
  let locale:string = req.cookies['kkutu.locale'];

  if(!LANGUAGE_TABLE[locale]){
    locale = ALP.pick(LANGUAGE_SUPPORT, String(req.headers['accept-language'])) || LANGUAGE_SUPPORT[0];
  }

  return locale;
}
