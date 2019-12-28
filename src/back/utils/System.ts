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

import FS = require("fs");
import Path = require("path");

import { Logger } from "./Logger";
import { TIMEZONE_OFFSET } from "./Utility";

/**
 * 개발 플래그 설정 여부.
 */
export const DEVELOPMENT = process.argv.includes("--dev");
/**
 * `data/settings.json` 파일 객체.
 */
export const SETTINGS:Schema.Settings = Object.assign(
  JSON.parse(getProjectData("settings.json").toString()),
  DEVELOPMENT ? JSON.parse(getProjectData("settings.dev.json").toString()) : {}
);
/**
 * `package.json` 파일 객체.
 */
export const PACKAGE:Schema.Package = JSON.parse(getProjectData("../package.json").toString());

/**
 * 프로젝트 데이터 폴더의 데이터를 동기식으로 읽어 그 내용을 반환한다.
 *
 * @param path 프로젝트 데이터 폴더에서의 하위 경로. 절대 경로인 경우 절대 경로를 따른다.
 */
export function getProjectData(path:string):Buffer{
  if(!Path.isAbsolute(path)){
    path = Path.resolve(__dirname, `../data/${path}`);
  }
  try{
    return FS.readFileSync(path);
  }catch(e){
    Logger.error().put(e).out();

    return null;
  }
}
/**
 * 프로젝트 데이터 폴더의 파일에 비동기식으로 내용을 쓴다.
 *
 * @param path 프로젝트 데이터 폴더에서의 하위 경로. 절대 경로인 경우 절대 경로를 따른다.
 * @param data 파일에 쓸 내용.
 */
export function setProjectData(path:string, data:string):Promise<void>{
  if(!Path.isAbsolute(path)){
    path = Path.resolve(__dirname, `../data/${path}`);
  }

  return new Promise((res, rej) => {
    FS.writeFile(path, data, err => {
      if(err){
        rej(err);

        return;
      }
      res();
    });
  });
}
/**
 * 주어진 함수가 주기적으로 호출되도록 한다.
 *
 * @param callback 매번 호출할 함수.
 * @param interval 호출 주기(㎳).
 * @param options 설정 객체.
 */
export function schedule(
  callback:(...args:any[]) => void,
  interval:number,
  options?:Partial<ScheduleOptions>
):void{
  if(options?.callAtStart){
    callback();
  }
  if(options?.punctual){
    const now = Date.now() + TIMEZONE_OFFSET;
    const gap = (Math.floor(now / interval) + 1) * interval - now;

    global.setTimeout(
      () => {
        callback();
        global.setInterval(callback, interval);
      },
      gap
    );
  }else{
    global.setInterval(callback, interval);
  }
}
