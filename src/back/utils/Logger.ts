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
import { cut, isFront, TIMEZONE_OFFSET, toSignedString } from "./Utility";

let fs:typeof import("fs");
let system:typeof import("back/utils/System");

type CallerInfo = {
  'file':string,
  'line':number,
  'function':string
};
type LogFileInfo = {
  'stream':NodeJS.WritableStream,
  'path':string,
  'createdAt':number
};
/**
 * 로그의 색 열거형.
 *
 * ANSI 탈출 구문 `\x1b[?m`의 `?`에 들어갈 값과 같도록 설정되어 있다.
 */
export enum LogColor{
  NORMAL,
  BRIGHT,
  DIM,
  UNDERSCORE = 4,

  F_BLACK = 30,
  F_RED,
  F_GREEN,
  F_YELLOW,
  F_BLUE,
  F_MAGENTA,
  F_CYAN,
  F_WHITE,

  B_BLACK = 40,
  B_RED,
  B_GREEN,
  B_YELLOW,
  B_BLUE,
  B_MAGENTA,
  B_CYAN,
  B_WHITE
}
/**
 * 로그의 수준 열거형.
 *
 * 수준에 따라 표시되는 아이콘이 달라지며, `ERROR` 수준이라고 해도 출력 후 자동으로 종료되지 않는다.
 */
export enum LogLevel{
  NORMAL,
  INFO,
  SUCCESS,
  WARNING,
  ERROR
}
/**
 * 로그를 출력해 주는 유틸리티 클래스.
 *
 * 로그 수준에 따라 `Logger.log()`, `Logger.info()`, `Logger.success()`, `Logger.warning()`, `Logger.error()` 메소드를
 * 호출할 수 있으며, 그 반환값으로 `Logger` 인스턴스를 얻을 수 있다.
 * 인스턴스의 메소드를 이용해 로그 내용을 입력한 후 `out()` 메소드를 호출하는 것으로 최종적으로 출력이 된다.
 *
 * 클라이언트 측과 서버 측 모두 로그 출력에 쓸 수 있으며,
 * 서버가 로그를 출력하려는 경우 `Logger.initialize()` 메소드로 초기화함으로써
 * 로그 내용을 파일로 보관할 수 있다.
 */
export class Logger{
  private static readonly REGEXP_ANSI_ESCAPE = /\x1b\[(\d+)m/g;
  // 캡처되는 그룹 { 함수명, 파일명, 줄 번호 }
  private static readonly REGEXP_CALLER = /^\s*at (.+) \(.+?([^\\/]+):(\d+):\d+\)$/;
  // 캡처되는 그룹 { 파일명, 줄 번호, 칸 번호 }
  private static readonly REGEXP_CALLER_ANONYMOUS = /^\s*at .+?([^\\/]+):(\d+):(\d+)$/;
  private static readonly CALLER_LENGTH = 20;
  private static readonly WEBKIT_STYLE_TABLE:{ [key in LogColor]: string } = {
    [LogColor.NORMAL]: "",
    [LogColor.BRIGHT]: "font-weight: bold",
    [LogColor.DIM]: "font-style: italic",
    [LogColor.UNDERSCORE]: "text-decoration: underline",

    [LogColor.F_BLACK]: "color: black",
    [LogColor.F_RED]: "color: red",
    [LogColor.F_GREEN]: "color: green",
    [LogColor.F_YELLOW]: "color: yellow",
    [LogColor.F_BLUE]: "color: blue",
    [LogColor.F_MAGENTA]: "color: magenta",
    [LogColor.F_CYAN]: "color: deepskyblue",
    [LogColor.F_WHITE]: "color: white",

    [LogColor.B_BLACK]: "background: black",
    [LogColor.B_RED]: "background: red",
    [LogColor.B_GREEN]: "background: green",
    [LogColor.B_YELLOW]: "background: yellow",
    [LogColor.B_BLUE]: "background: blue",
    [LogColor.B_MAGENTA]: "background: magenta",
    [LogColor.B_CYAN]: "background: cyan",
    [LogColor.B_WHITE]: "background: white"
  };
  private static recentFileInfo:LogFileInfo;
  private static subject:string;
  private static workerProcessId:number;

  /**
   * 로그 시스템을 초기화하고 파일에 쓸 준비를 한다.
   *
   * 설정 파일에서 정한 값에 따라 로그 파일 이름과 파일 교체 주기가 결정된다.
   * 설정 파일의 교체 주기가 0으로 설정된 경우 로그 파일을 생성하지 않는다.
   *
   * @param subject 주체의 식별자. 로그 디렉토리의 하위 디렉토리 이름으로 쓰인다.
   */
  public static async initialize(subject:string):Promise<void>{
    fs = await import("fs");
    system = await import("back/utils/System");
    if((await import("cluster")).isWorker){
      Logger.workerProcessId = (await import("process")).pid;
    }
    Logger.subject = subject;

    if(!fs.existsSync(Logger.getDirectoryPath())){
      fs.mkdirSync(Logger.getDirectoryPath(), { recursive: true });
    }
    if(system.SETTINGS.log.interval){
      system.schedule(Logger.shiftFile, system.SETTINGS.log.interval, {
        callAtStart: true,
        punctual: true
      });
    }
    else Logger.warning().put("Log files won't be generated.").out();
  }

  /**
   * 오류 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
   *
   * @param title 제목.
   */
  public static error(title?:string):Logger{
    return new Logger(LogLevel.ERROR, title);
  }
  /**
   * 안내 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
   *
   * @param title 제목.
   */
  public static info(title?:string):Logger{
    return new Logger(LogLevel.INFO, title);
  }
  /**
   * 일반 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
   *
   * @param title 제목.
   */
  public static log(title?:string):Logger{
    return new Logger(LogLevel.NORMAL, title);
  }
  /**
   * 성공 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
   *
   * @param title 제목.
   */
  public static success(title?:string):Logger{
    return new Logger(LogLevel.SUCCESS, title);
  }
  /**
   * 경고 로그를 출력할 수 있는 인스턴스를 만들어 반환한다.
   *
   * @param title 제목.
   */
  public static warning(title?:string):Logger{
    return new Logger(LogLevel.WARNING, title);
  }

  private static escape(style:LogColor[] = LogStyle.NORMAL):string{
    return style.reduce((pv, v) => `${pv}\x1b[${v}m`, "");
  }
  private static getCaller():CallerInfo{
    const error = new Error().stack.split('\n');

    for(let level = 4; level < error.length; level++){
      let chunk:RegExpMatchArray;

      if(chunk = error[level].match(Logger.REGEXP_CALLER)){
        return {
          file: chunk[2],
          line: Number(chunk[3]),
          function: chunk[1]
        };
      }else if(chunk = error[level].match(Logger.REGEXP_CALLER_ANONYMOUS)){
        return {
          file: chunk[1],
          line: Number(chunk[2]),
          function: `:${chunk[3]} (Unknown)`
        };
      }
    }

    return null;
  }
  private static getLocalFileNameDate():string{
    const now = new Date();

    return [
      String(now.getFullYear()).slice(2).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      "-",
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0")
    ].join('');
  }
  private static getLocalISODate():string{
    const now = new Date();
    const offset = -Math.round(TIMEZONE_OFFSET / DateUnit.HOUR) || "";

    return new Date(now.getTime() - TIMEZONE_OFFSET).toISOString() + (offset && toSignedString(offset));
  }
  private static shiftFile():void{
    const fileName = Logger.getLocalFileNameDate();
    const path = `${Logger.getDirectoryPath()}/${fileName}.log`;

    if(Logger.recentFileInfo){
      Logger.recentFileInfo.stream.end();
    }
    Logger.recentFileInfo = {
      stream: fs.createWriteStream(path),
      path,
      createdAt: Date.now()
    };
    Logger.success(Logger.subject).next("Path").put(fileName).out();
  }
  private static getDirectoryPath():string{
    return `${__dirname}/${system.SETTINGS.log.directory}/${Logger.subject}`;
  }

  private readonly type:LogLevel;
  private readonly list:Array<[string, string]>;
  private readonly timestamp:string;

  private head:string;
  private chunk:string[];

  constructor(type:LogLevel = LogLevel.NORMAL, title:string = ""){
    const caller = Logger.getCaller();
    let fileLimit = Logger.CALLER_LENGTH - String(caller.line).length;

    this.type = type;
    this.list = [];
    this.timestamp = `[${Logger.getLocalISODate()}]`;
    this.chunk = [];
    this.putS(LogStyle.TIMESTAMP, this.timestamp);
    if(Logger.workerProcessId){
      fileLimit -= String(Logger.workerProcessId).length + 1;
      this.putS(LogStyle.CALLER_PID, "#", Logger.workerProcessId);
    }
    this.putS(LogStyle.CALLER_FILE, " ", cut(caller.file, fileLimit).padStart(fileLimit, " "));
    this.putS(LogStyle.CALLER_LINE, ":", caller.line, " ");
    this.putS(LogStyle.CALLER, cut(caller.function, Logger.CALLER_LENGTH).padEnd(Logger.CALLER_LENGTH, " "), " ");
    switch(type){
      case LogLevel.NORMAL:
        this.putS(LogStyle.TYPE_NORMAL, "(:)");
        break;
      case LogLevel.INFO:
        this.putS(LogStyle.TYPE_INFO, "(i)");
        break;
      case LogLevel.SUCCESS:
        this.putS(LogStyle.TYPE_SUCCESS, "(✓)");
        break;
      case LogLevel.WARNING:
        this.putS(LogStyle.TYPE_WARNING, "(△)");
        break;
      case LogLevel.ERROR:
        this.putS(LogStyle.TYPE_ERROR, "(×)");
        break;
      default:
        throw Error(`Unhandled type: ${type}`);
    }
    if(title){
      this.putS(LogStyle.TITLE, " [", title, "]");
    }
    this.put(" ");
  }
  private getText():string{
    const PADDING = 5;
    const maxDigit = this.list.reduce((pv, v) => pv < v[0]?.length ? v[0].length : pv, 1);
    const prefix = " ".repeat(this.timestamp.length + Logger.CALLER_LENGTH * 2 + PADDING);
    const last = this.list.length - 2;

    return [
      this.list[0][1],
      ...this.list.slice(1).map(([ head, body ], i) => {
        return `${prefix}${Logger.escape(LogStyle.LINE)}${i === last ? "└" : "├"}─ ${(head ?? String(i)).padEnd(maxDigit, " ")}${Logger.escape()}: ${body}`;
      })
    ].join('\n');
  }

  /**
   * 이후 내용을 다음 줄에 기록하도록 하고 사슬 반환한다.
   *
   * @param head 다음 줄의 제목.
   */
  public next(head?:string):this{
    this.list.push([ this.head, this.chunk.join('') ]);
    this.head = head;
    this.chunk = [];

    return this;
  }
  /**
   * 기록된 내용을 출력한다.
   *
   * 클라이언트나 파일에 출력하는 경우 ANSI 탈출 구문을 지원하지 않으므로 내용을 일부 수정해 출력한다.
   */
  public out():void{
    if(this.chunk.length){
      this.next();
    }
    let text = this.getText();
    let args:string[] = [];

    if(isFront()){
      text = text.replace(Logger.REGEXP_ANSI_ESCAPE, (v, p1) => {
        args.push(Logger.WEBKIT_STYLE_TABLE[p1 as LogColor]);

        return "%c";
      });
    }else if(Logger.recentFileInfo){
      Logger.recentFileInfo.stream.write(`${text.replace(Logger.REGEXP_ANSI_ESCAPE, "")}\n`);
    }
    switch(this.type){
      case LogLevel.NORMAL:
        console.log(text, ...args);
        break;
      case LogLevel.INFO:
      case LogLevel.SUCCESS:
        console.info(text, ...args);
        break;
      case LogLevel.WARNING:
        console.warn(text, ...args);
        break;
      case LogLevel.ERROR:
        console.error(text, ...args);
        break;
      default:
        throw Error(`Unhandled type: ${this.type}`);
    }
  }
  /**
   * 현재 줄에 내용을 추가하고 사슬 반환한다.
   *
   * 여러 인자에 걸쳐 내용이 들어오는 경우 공백 없이 붙여서 출력된다.
   *
   * @param args 추가할 내용.
   */
  public put(...args:any[]):this{
    this.chunk.push(...args);

    return this;
  }
  /**
   * 현재 줄에 주어진 색 조합을 따르는 내용을 추가하고 사슬 반환한다.
   *
   * 여러 인자에 걸쳐 내용이 들어오는 경우 공백 없이 붙여서 출력된다.
   * ANSI 탈출 구문을 지원하지 않는 매체에 출력하는 경우 색 조합이 무시될 수 있다.
   *
   * @param value 색 조합.
   * @param args 추가할 내용.
   */
  public putS(value:LogColor[], ...args:any[]):this{
    this.chunk.push(Logger.escape(value), ...args, Logger.escape());

    return this;
  }
}
/**
 * 로그의 색 조합을 정의하는 유틸리티 클래스.
 */
export class LogStyle{
  public static readonly NORMAL = [ LogColor.NORMAL ];

  public static readonly CALLER = [ LogColor.F_CYAN ];
  public static readonly CALLER_PID = [ LogColor.F_MAGENTA ];
  public static readonly CALLER_FILE = [ LogColor.BRIGHT, LogColor.F_CYAN ];
  public static readonly CALLER_LINE = [ LogColor.NORMAL ];
  public static readonly LINE = [ LogColor.BRIGHT ];
  public static readonly METHOD = [ LogColor.F_YELLOW ];
  public static readonly TIMESTAMP = [ LogColor.F_BLUE ];
  public static readonly TARGET = [ LogColor.BRIGHT, LogColor.F_BLUE ];
  public static readonly TITLE = [ LogColor.BRIGHT ];
  public static readonly TYPE_ERROR = [ LogColor.BRIGHT, LogColor.B_RED ];
  public static readonly TYPE_INFO = [ LogColor.B_BLUE ];
  public static readonly TYPE_NORMAL = [ LogColor.BRIGHT ];
  public static readonly TYPE_SUCCESS = [ LogColor.F_BLACK, LogColor.B_GREEN ];
  public static readonly TYPE_WARNING = [ LogColor.F_BLACK, LogColor.B_YELLOW ];
  public static readonly XHR = [ LogColor.F_GREEN ];
}
