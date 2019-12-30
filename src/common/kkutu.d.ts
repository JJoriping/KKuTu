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

declare namespace KKuTu{
  /**
   * 사용자가 설정 대화상자에서 설정하는 정보 객체.
   */
  type ClientSettings = {
    /**
     * 배경 음악 음소거 여부.
     */
    'mb': boolean,
    /**
     * 효과음 음소거 여부.
     */
    'me': boolean,
    /**
     * 초대 거부 여부.
     */
    'di': boolean,
    /**
     * 귓속말 거부 여부.
     */
    'dw': boolean,
    /**
     * 친구 요청 거부 여부.
     */
    'df': boolean,
    /**
     * 자동 준비 여부.
     */
    'ar': boolean,
    /**
     * 접속자 목록 정렬 여부.
     */
    'su': boolean,
    /**
     * 대기 중인 방만 보기 여부.
     */
    'ow': boolean,
    /**
     * 열려 있는 방만 보기 여부.
     */
    'ou': boolean
  };
  /**
   * 게임 유형의 특징을 설명하는 객체.
   */
  type RuleCharacteristics = {
    /**
     * 다루는 언어.
     */
    'locale': 'ko'|'en',
    /**
     * 유형 식별자.
     */
    'name': string,
    /**
     * 지원하는 특수 규칙 목록.
     */
    'options': string[],
    /**
     * 시간 상수.
     * 
     * 이 값이 1인 경우 사용자는 한 라운드의 총 시간을
     * 10초, 30초, 60초, 90초, 120초, 150초 중 하나로 설정할 수 있다.
     * 2인 경우 그 두 배의 목록 중 하나로 설정할 수 있다.
     */
    'time': number,
    /**
     * 끄투 봇 초대 가능 여부.
     */
    'ai': boolean,
    /**
     * 큰 화면 여부.
     * 
     * 단어를 입력하는 형식이 아닌 경우에 사용할 수 있다.
     */
    'big': boolean,
    /**
     * 현재 턴 사용자 퇴장 시 라운드 종료 여부.
     */
    'newRoundOnQuit': boolean
  };
  type ServerList = {
    'list': number[],
    'max': number
  };
  namespace Game{
    type Room = {
      /**
       * 방 번호.
       */
      'id': number,
      /**
       * 방 제목.
       */
      'title': string,
      /**
       * 게임 유형.
       */
      'rule': string,
      /**
       * 특수 규칙 객체.
       * 
       * `extensions`를 제외한 키들은 열거형 `RuleOption`에서 받는다.
       */
      'options': RoomOptions,
      /**
       * 총 라운드 수.
       */
      'round': number,
      /**
       * 한 라운드당 시간(초).
       */
      'time': number,
      /**
       * 게임 진행 중 여부.
       */
      'gaming': boolean,
      /**
       * 비밀번호 설정 여부.
       */
      'password': boolean,
      /**
       * 참여자 목록.
       */
      'players': any[],
      /**
       * 최대 인원.
       */
      'limit': number
    };
    type RoomOptions = {
      'man'?: boolean,
      'ext'?: boolean,
      'mis'?: boolean,
      'loa'?: boolean,
      'str'?: boolean,
      'k32'?: boolean,
      'ijp'?: boolean,
      'prv'?: boolean,
      'no2'?: boolean,
      /**
       * 어인정 주제 목록.
       */
      'extensions'?: string[]
    };
  }
  namespace Packet{
    type Type = keyof KKuTu.Packet.RequestTable
      | keyof KKuTu.Packet.ResponseTable
    ;
    type RequestData<T extends KKuTu.Packet.Type> = {
      'type'?: T
    }&KKuTu.Packet.RequestTable[T];
    type ResponseData<T extends KKuTu.Packet.Type> = {
      'type'?: T
    }&KKuTu.Packet.ResponseTable[T];
    /**
     * 요청(외부 → 게임 서버) 메시지를 유형별로 처리하는 핸들러 객체.
     */
    type RequestHandlerTable = {
      [key in KKuTu.Packet.Type]?: (data:KKuTu.Packet.RequestData<key>) => void
    };
    /**
     * 응답(게임 서버 → 외부) 메시지를 유형별로 처리하는 핸들러 객체.
     */
    type ResponseHandlerTable = {
      [key in KKuTu.Packet.Type]?: (data:KKuTu.Packet.ResponseData<key>) => void
    };

    type RequestTable = {
      // 새 방을 만드는 경우.
      'room-new': Partial<KKuTu.Game.Room>,
      // 방 정보를 수정하는 경우.
      'room-set': Partial<KKuTu.Game.Room>,
      // 웹 서버가 접속 인원을 확인하는 경우.
      'seek': {},
      // 채팅 내용을 보내는 경우.
      'talk': {
        /**
         * 대화 내용.
         */
        value: string
      }
      'welcome': never
    };
    type ResponseTable = {
      'room-new': never,
      'room-set': never,
      // 게임 서버가 접속 인원을 알리는 경우.
      'seek': {
        /**
         * 접속 인원.
         */
        'value': number
      },
      'talk': never,
      // 게임 서버가 사용자에게 접속자 목록이나 방 목록 등을 알리는 경우.
      'welcome': {
        /**
         * 관리자 여부.
         */
        'administrator': boolean
      }
    };
  }
}
