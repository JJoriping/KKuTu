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

declare namespace KKuTu{
  /**
   * 사용자가 설정 대화상자에서 설정하는 정보 객체.
   */
  type ClientSettings = {
    /**
     * 배경 음악 음소거 여부.
     */
    'mb':boolean;
    /**
     * 효과음 음소거 여부.
     */
    'me':boolean;
    /**
     * 초대 거부 여부.
     */
    'di':boolean;
    /**
     * 귓속말 거부 여부.
     */
    'dw':boolean;
    /**
     * 친구 요청 거부 여부.
     */
    'df':boolean;
    /**
     * 자동 준비 여부.
     */
    'ar':boolean;
    /**
     * 접속자 목록 정렬 여부.
     */
    'su':boolean;
    /**
     * 대기 중인 방만 보기 여부.
     */
    'ow':boolean;
    /**
     * 열려 있는 방만 보기 여부.
     */
    'ou':boolean;
  };
  /**
   * 게임 유형의 특징을 설명하는 객체.
   */
  type RuleCharacteristics = {
    /**
     * 다루는 언어.
     */
    'locale':'ko'|'en';
    /**
     * 유형 식별자.
     */
    'name':string;
    /**
     * 지원하는 특수 규칙 목록.
     */
    'options':string[];
    /**
     * 시간 상수.
     *
     * 이 값이 1인 경우 사용자는 한 라운드의 총 시간을
     * 10초, 30초, 60초, 90초, 120초, 150초 중 하나로 설정할 수 있다.
     * 2인 경우 그 두 배의 목록 중 하나로 설정할 수 있다.
     */
    'time':number;
    /**
     * 끄투 봇 초대 가능 여부.
     */
    'ai':boolean;
    /**
     * 큰 화면 여부.
     *
     * 단어를 입력하는 형식이 아닌 경우에 사용할 수 있다.
     */
    'big':boolean;
    /**
     * 현재 턴 사용자 퇴장 시 라운드 종료 여부.
     */
    'newRoundOnQuit':boolean;
  };
  type ServerList = {
    'list':number[];
    'max':number;
  };
  namespace Game{
    /**
     * 사용자 프로필 객체.
     */
    type Profile = {
      /**
       * 계정 식별자.
       */
      'id':string;
      /**
       * 계정 별명.
       */
      'title':string;
      /**
       * 계정 이름.
       */
      'name':string;
      /**
       * 프로필 사진 주소.
       */
      'image':string;
    };
    /**
     * 상점 아이템 객체.
     */
    type Item = {
      /**
       * 식별자.
       */
      '_id':string;
      /**
       * 유형.
       */
      'group':string;
      /**
       * 아이템 착용 효과 객체.
       */
      'options':{
        /**
         * 경험치 획득량 증가(%).
         */
        'gEXP'?:number;
        /**
         * 핑 획득량 증가(%).
         */
        'gMNY'?:number;
        /**
         * 경험치 획득량 증가(+).
         */
        'hEXP'?:number;
        /**
         * 핑 획득량 증가(+).
         */
        'hMNY'?:number;
        /**
         * 이미지 파일의 GIF 여부.
         */
        'gif'?:boolean;
      };
    };
    /**
     * 강퇴 투표 객체.
     */
    type KickVote = {
      'Y':number;
      'N':number;
    };
    /**
     * 게임 방 객체.
     */
    type Room = {
      /**
       * 방 번호.
       */
      'id':number;
      /**
       * 채널 번호.
       */
      'channel':number;
      /**
       * 방장 계정 식별자.
       */
      'master':string;
      /**
       * 방 제목.
       */
      'title':string;
      /**
       * 게임 유형.
       */
      'rule':string;
      /**
       * 특수 규칙 객체.
       *
       * `extensions`를 제외한 키들은 열거형 `RuleOption`에서 받는다.
       */
      'options':RoomOptions;
      /**
       * 총 라운드 수.
       */
      'round':number;
      /**
       * 한 라운드당 시간(초).
       */
      'time':number;
      /**
       * 게임 진행 중 여부.
       */
      'gaming':boolean;
      /**
       * 비밀번호 설정 여부.
       */
      'password':boolean;
      /**
       * 참여자 목록.
       */
      'players':KKuTu.Game.User[];
      /**
       * 최대 인원.
       */
      'limit':number;
    };
    /**
     * 특수 규칙 객체.
     */
    type RoomOptions = {
      'man'?:boolean;
      'ext'?:boolean;
      'mis'?:boolean;
      'loa'?:boolean;
      'str'?:boolean;
      'k32'?:boolean;
      'ijp'?:boolean;
      'prv'?:boolean;
      'no2'?:boolean;
      /**
       * 어인정 주제 목록.
       */
      'extensions'?:string[];
    };
    /**
     * 한 방의 게임 상태 객체.
     */
    type Play = {
      /**
       * 현재 턴 인덱스.
       */
      'turn':number;
      /**
       * 턴 제한시간 타이머.
       */
      'turnTimer':NodeJS.Timer;
      /**
       * 릴레이 순서 배열.
       */
      'seq':string[];
      /**
       * 릴레이 상태.
       */
      'chain'?:string[];
      /**
       * 이번 라운드에 선택된 주제.
       */
      'theme'?:string;
      /**
       * 이번 라운드에 제시되는 초성.
       */
      'consonants'?:string;
      /**
       * 답이 공개된 단어들을 (좌표, 단어) 쌍으로 묶은 객체.
       */
      'prisoners'?:Table<string>;
      /**
       * 보드 목록.
       */
      'boards'?:[number, number, 0|1, number, string][][];
      /**
       * 개별 단어 정보 목록.
       */
      'means'?:Array<Table<{
        /**
         * 보드에서의 가로 위치.
         */
        'x':number;
        /**
         * 보드에서의 세로 위치.
         */
        'y':number;
        /**
         * 방향. 0은 가로, 1은 세로를 나타낸다.
         */
        'direction':0|1;
        /**
         * 단어 길이.
         */
        'length':number;
        /**
         * 단어의 품사 정보.
         */
        'type':string;
        /**
         * 단어의 주제 정보.
         */
        'theme':string;
        /**
         * 단어의 뜻 정보.
         */
        'meaning':string;
      }>>;
    };
    /**
     * 한 사용자의 게임 상태 객체.
     */
    type Status = {
      /**
       * 준비 여부.
       */
      'ready':boolean;
      /**
       * 팀 번호.
       *
       * 0은 개인전을 나타낸다.
       */
      'team':number;
      /**
       * 게임 중 방에 입장 여부.
       */
      'cameWhenGaming':boolean;
      /**
       * 참여 유형.
       *
       * 가능한 값은 다음과 같다.
       * - `J`: 게임에 직접 참여.
       * - `O`: 옵저버. 게임이 끝나면 자동으로 퇴장한다.
       * - `S`: 게임 관전.
       */
      'form':"J"|"O"|"S";
      /**
       * 획득 점수.
       */
      'score':number;
    };
    /**
     * 사용자 객체.
     */
    type User = {
      /**
       * 계정 식별자.
       */
      'id':string;
      /**
       * 손님 여부.
       */
      'guest':boolean;
      /**
       * 끄투 봇 여부.
       */
      'robot':boolean;
      /**
       * 소개말.
       */
      'exordial':string;
      /**
       * 프로필 정보.
       */
      'profile':KKuTu.Game.Profile;
      /**
       * 게임 정보.
       */
      'data':{
        /**
         * 경험치.
         */
        'score':number;
        /**
         * 유형별 게임 플레이 기록 객체.
         */
        'record':Table<{
          /**
           * 판 수.
           */
          'plays':number;
          /**
           * 1위 횟수.
           */
          'wins':number;
          /**
           * 총 획득 경험치.
           */
          'scores':number;
          /**
           * 총 플레이타임(㎳).
           */
          'playtime':number;
        }>;
      };
      /**
       * 방 번호. 0인 경우 로비를 가리킨다.
       */
      'place':number;
      /**
       * 장착 아이템 목록 객체.
       */
      'equip':Table<string>;
    };
  }
  namespace Packet{
    type RequestType = keyof KKuTu.Packet.RequestTable;
    type ResponseType = keyof KKuTu.Packet.ResponseTable;
    type RequestData<T extends KKuTu.Packet.RequestType> = {
      'type'?:T;
    }&KKuTu.Packet.RequestTable[T];
    type ResponseData<T extends KKuTu.Packet.ResponseType> = {
      'type'?:T;
    }&KKuTu.Packet.ResponseTable[T];
    /**
     * 요청(외부 → 게임 서버) 메시지를 유형별로 처리하는 핸들러 객체.
     */
    type RequestHandlerTable = {
      [key in KKuTu.Packet.RequestType]?:(data:KKuTu.Packet.RequestData<key>)=>void
    };
    /**
     * 응답(게임 서버 → 외부) 메시지를 유형별로 처리하는 핸들러 객체.
     */
    type ResponseHandlerTable = {
      [key in KKuTu.Packet.ResponseType]?:(data:KKuTu.Packet.ResponseData<key>)=>void
    };

    type RequestTable = {
      /**
       * (오류) (로비 서버 → 게임 방 서버)
       * 예약이 성사되고 `room-new`의 과정 (5)까지 마쳤으나
       * 그 사이 방이 이미 생겼거나 사용자가 접속 종료했을 경우,
       * 게임 방 서버로 예약을 지우라는 요청.
       */
      'room-invalid':{
        'room':KKuTu.Packet.RequestData<'room-new'>;
      };
      /**
       * (사용자 → 로비 서버 및 게임 방 서버)
       * 방 만들기 요청.
       *
       * 방 만들기는 아래 과정을 따라 이루어진다.
       * ```plain
       *. ┌──────────┐
       *. │  사용자  ├──────┬─────┐
       *. └─┬────────┘      │  ↑  │
       *.  (1) ↑           (4) │ (6)
       *.   ↓ (3)           ↓ (5) ↓
       *. ┌────┴─────┐    ┌────┴─────┐
       *. │   로비   ├(2)→│  게임방  │
       *. │   서버   │←(7)┤   서버   │
       *. └──────────┘    └──────────┘
       * ```
       * (1) 웹소켓 `room-new` 요청을 보낸다. \
       * (2) IPC `room-reserve` 요청을 보낸다. \
       * (3) 웹소켓 `pre-room` 응답을 보낸다. \
       * (4) 게임 방 서버로 접속한다. \
       * (5) 웹소켓 'welcome' 응답을 보낸다. \
       * (6) 웹소켓 `room-new` 요청을 보낸다. \
       * (7) IPC `room-reserve` 응답을 보낸다.
       */
      'room-new':{
        /**
         * *(과정 (4)에만 존재)*
         * 방 식별자.
         */
        'id'?:number;
        /**
         * 방 제목.
         */
        'title':string;
        /**
         * 방 암호.
         */
        'password':string;
        /**
         * 최대 인원.
         */
        'limit':number;
        /**
         * 게임 유형.
         */
        'rule':string;
        /**
         * 총 라운드 수.
         */
        'round':number;
        /**
         * 한 라운드당 시간(초).
         */
        'time':number;
        /**
         * 특수 규칙 객체.
         */
        'options':KKuTu.Game.RoomOptions;
      };
      /**
       * (로비 서버 → 게임 방 서버)
       * 방 만들기 요청.
       */
      'room-reserve':{
        /**
         * 예약한 사용자의 세션 식별자.
         */
        'session':string;
        /**
         * 예약된 방 정보 객체.
         */
        'room':KKuTu.Packet.RequestData<'room-new'>;
      };
      /**
       * (사용자 → 게임 방 서버)
       * 방 정보 수정 요청.
       */
      'room-set':KKuTu.Packet.RequestData<'room-new'>;
      /**
       * (웹 서버 → 로비 서버)
       * 접속 인원 확인 요청.
       */
      'seek':{};
      /**
       * (사용자 → 로비 서버)
       * 초대 요청.
       */
      'invite':{
        'target':string;
      };
      /**
       * (사용자 → 로비 서버 및 게임 방 서버)
       * 대화 전송 요청.
       */
      'talk':{
        /**
         * 차례를 넘기기 위해 입력한 단어 여부.
         */
        'relay'?:boolean;
        /**
         * 대화 내용.
         */
        'value':string;
        /**
         * 귓속말 대상 계정 식별자.
         */
        'whisper'?:string;
      };
    };
    type ResponseTable = {
      /**
       * (로비 서버 → 사용자)
       * 차단 고지 응답.
       */
      'blocked':never;
      /**
       * (로비 서버 → 사용자)
       * 사용자의 접속 종료 응답.
       */
      'disconnected':{
        /**
         * 접속을 종료한 계정 식별자.
         */
        'id':string;
      };
      /**
       * (게임 방 서버 → 사용자)
       * 이 채널 접속자의 접속 종료 응답.
       */
      'disconnected-room':{
        /**
         * 접속을 종료한 계정 식별자.
         */
        'id':string;
      };
      /**
       * (오류) (로비 서버 → 사용자)
       * 일반 오류 응답.
       */
      'error':{
        /**
         * 오류 번호.
         */
        'code':number;
        /**
         * 추가 정보.
         */
        'message':string;
      };
      /**
       * (로비 서버 → 사용자)
       * 방 예약 완료 응답.
       *
       * 빈 방 생성이 완료되었으니 주어진 채널과 방 번호로
       * 사용자가 웹소켓 클라이언트를 만들어 접속해야 한다.
       */
      'pre-room':{
        /**
         * 새 방 번호.
         */
        'id':number;
        /**
         * 새 방의 채널 번호.
         */
        'channel':number;
      };
      /**
       * (로비 서버 또는 게임 방 서버 → 사용자)
       * 방 상태 갱신 응답.
       */
      'room':{
        /**
         * 대상 사용자 식별자.
         */
        'target'?:string;
        /**
         * 강퇴 투표 상태 객체.
         */
        'kick-vote'?:KKuTu.Game.KickVote;
        /**
         * *(게임 중 입장 전용)* 릴레이 횟수.
         */
        'chain'?:number;
        /**
         * *(게임 중 입장 전용)* *(자음퀴즈 전용)* 이번 라운드에 선택된 주제.
         */
        'theme'?:KKuTu.Game.Play['theme'];
        /**
         * *(게임 중 입장 전용)* *(자음퀴즈 전용)* 이번 라운드에 제시되는 초성.
         */
        'consonants'?:KKuTu.Game.Play['consonants'];
        /**
         * *(게임 중 입장 전용)* *(십자말풀이 전용)* 답이 공개된 단어들을 (좌표, 단어) 쌍으로 묶은 객체.
         */
        'prisoners'?:KKuTu.Game.Play['prisoners'];
        /**
         * *(게임 중 입장 전용)* *(십자말풀이 전용)* 보드 목록.
         */
        'boards'?:KKuTu.Game.Play['boards'];
        /**
         * *(게임 중 입장 전용)* *(십자말풀이 전용)* 개별 단어 정보 목록.
         */
        'means'?:KKuTu.Game.Play['means'];
        /**
         * *(게임 중 입장 전용)* 참여자 점수 객체.
         */
        'scores'?:Table<number>;
        /**
         * 방 객체.
         */
        'room':KKuTu.Game.Room;
      };
      /**
       * (게임 방 서버 → 로비 서버)
       * 방 입장 안내 응답.
       */
      'room-come':{
        /**
         * 입장한 사용자 식별자.
         */
        'target':string;
        /**
         * 입장한 방 번호.
         */
        'id':number;
      };
      /**
       * (오류) (게임 방 서버 → 로비 서버)
       * 방 예약 만료 응답.
       */
      'room-expired':{
        /**
         * 예약한 사용자의 세션 식별자.
         */
        'session':string;
        /**
         * 예약된 방 번호.
         */
        'id':number;
      };
      /**
       * (게임 방 서버 → 로비 서버)
       * 방 퇴장 안내 응답.
       */
      'room-go':{
        /**
         * 퇴장한 사용자 식별자.
         */
        'target':string;
        /**
         * 대상 방 번호.
         */
        'id':number;
        /**
         * 대상 방 제거 여부.
         */
        'removed':boolean;
      };
      /**
       * (게임 방 서버 → 로비 서버)
       * 방 상태 갱신 응답.
       */
      'room-publish':{
        /**
         * 방 인스턴스.
         */
        'room':any;
      };
      /**
       * (게임 방 서버 → 로비 서버)
       * 방 예약 성공 응답.
       */
      'room-reserve':{
        /**
         * 예약한 사용자 식별자.
         */
        'master':string;
        /**
         * 예약된 방 정보 객체.
         */
        'room':KKuTu.Packet.RequestData<'room-new'>;
      };
      /**
       * (오류) (로비 서버 → 사용자)
       * 로비가 아닌 상황에서 방 입장 시도 응답.
       */
      'room-stuck':never;
      /**
       * (로비 서버 → 웹 서버)
       * 접속 인원 응답.
       */
      'seek':{
        /**
         * 접속 인원.
         */
        'value':number;
      };
      /**
       * (로비 서버 → 사용자)
       * 대화 응답.
       */
      'talk':{
        /**
         * 오류 번호.
         */
        'code'?:number;
        /**
         * 공지 여부.
         */
        'notice'?:boolean;
        /**
         * 대화 주체의 정보를 담은 객체.
         */
        'profile':KKuTu.Game.Profile;
        /**
         * 대화 내용.
         */
        'value':string;
      };
      /**
       * (로비 서버 또는 게임 방 서버 → 사용자)
       * 초기 정보(접속자 목록, 방 목록 등) 응답.
       */
      'welcome':{
        /**
         * 관리자 여부.
         */
        'administrator':boolean;
        /**
         * 접속한 서버 번호.
         */
        'server':number;
        /**
         * 접속자 목록.
         */
        'users':KKuTu.Game.User[];
        /**
         * 개설된 방 목록.
         */
        'rooms':KKuTu.Game.Room[];
      };
    };
  }
}
