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

declare namespace Schema{
  type Package = {
    'version': string
  };
  type Settings = {
    '$schema': string,
    /**
     * 관리자 권한을 가질 수 있는 계정 목록.
     */
    'administrators': Array<{
      /**
       * 계정의 식별자.
       */
      'id': string,
      /**
       * 관리자 명령을 수행하기 위해 쓸 암호.
       */
      'password': string
    }>,
    /**
     * 끄투 게임 자체에 관한 설정 객체.
     */
    'application': {
      /**
       * 한 서버에 접속할 수 있는 최대 인원.
       */
      'server-capacity': number
    },
    /**
     * 멀티프로세스 서버 구축에 필요한 정보를 담은 객체.
     * 
     * 멀티프로세싱된 경우 프로세스가 마스터 하나와 슬레이브 하나 이상으로 나뉘며
     * 각 슬레이브는 0부터 시작하는 고유한 번호를 갖는다.
     */
    'cluster': {
      /**
       * 한 게임 서버당 갖는 슬레이브(게임 방 서버)의 수.
       */
      'game-slave': number,
      /**
       * 웹 서버의 프로세스 수.
       * 
       * 웹 서버가 멀티프로세싱된 경우 세션 유지를 위해서는
       * Redis 등 별도 세션 데이터베이스가 마련되어야 한다.
       */
      'web': number
    },
    /**
     * 저작권 안내문 표시에 필요한 정보를 담은 객체.
     */
    'copyright': {
      /**
       * 최근 업데이트 연도.
       */
      'year': number,
      /**
       * 배포하는 사람의 이름.
       */
      'publisher': string,
      /**
       * 배포하는 사람의 연락처(이메일 등).
       */
      'address': string,
      /**
       * 프로그램의 소스 코드를 확인할 수 있는 페이지 URL(GitHub 등).
       */
      'repository': string
    },
    /**
     * 데이터베이스 연결에 필요한 정보를 담은 객체.
     */
    'database': {
      /**
       * 접속할 서버의 주소.
       */
      'host': string,
      /**
       * 접속할 서버의 포트 번호.
       */
      'port': number,
      /**
       * 사용할 계정 이름.
       */
      'user': string,
      /**
       * 계정의 암호.
       */
      'password': string,
      /**
       * 사용할 데이터베이스 이름.
       */
      'name': string
    },
    /**
     * HTTPS 통신에 필요한 정보를 담은 객체.
     * 
     * 인증서 파일이 상대 경로로 입력된 경우 `data` 디렉토리 안을 기준으로 탐색한다.
     */
    'https'?: {
      /**
       * PKCS#12 통합 인증서 파일의 위치.
       */
      'pfx': string
    }|{
      /**
       * SSL 인증서 파일의 위치.
       */
      'cert': string,
      /**
       * SSL 개인 키 파일의 위치.
       */
      'key': string,
      /**
       * SSL 인증 기관 인증서 파일의 위치.
       */
      'ca'?: string
    },
    /**
     * 지원하는 언어 객체.
     * 
     * 키는 ISO 639 식별자, 값은 해당 언어 이름을 나타낸다.
     */
    'locales': {
      [key in string]: string
    },
    /**
     * 로그 기록에 필요한 정보를 담은 객체.
     */
    'log': {
      /**
       * 로그 파일이 담길 디렉토리.
       * 
       * 디렉토리가 없는 경우 새로 만든다.
       */
      'directory': string,
      /**
       * *끄투에서의 인기 단어* 서비스용 로그 디렉토리.
       * 
       * `directory` 값 뒤에 합쳐진 결과를 실제 경로로 삼는다.
       * 
       * @example
       * // dist/logs/k-hot 디렉토리에 파일을 만든다.
       * {
       *   "directory": "logs",
       *   "directory-k-hot": "k-hot"
       * }
       */
      'directory-k-hot': string,
      /**
       * 한 로그 파일이 다룰 수 있는 최대 시간(㎳).
       * 
       * @example
       * // 한 파일이 최대 하루 동안의 기록을 담는다.
       * {
       *   "interval": 86400000
       * }
       */
      'interval': number,
    },
    /**
     * 기본 포트 번호 목록.
     * 
     * 게임 로비 서버의 포트 번호가 곧 기본 포트이며,
     * 게임 방 서버의 포트 번호는 기본 포트에서 416과 슬레이브 번호를 더한 값이다.
     */
    'ports': number[],
    /**
     * 구글 reCAPTCHA 모듈에 필요한 정보를 담은 객체.
     * 
     * 게임 로비에 접속하기 위해 사용자에게 reCAPTCHA 통과를 요구할 수 있다.
     */
    'recaptcha'?: {
      /**
       * 손님 계정에게 표시할지 여부.
       */
      'to-guest': boolean,
      /**
       * 회원에게 표시할지 여부.
       */
      'to-user': boolean,
      /**
       * 구글에서 받은 사이트 키 값.
       */
      'site': string,
      /**
       * 구글에서 받은 시크릿 키 값.
       */
      'secret': string
    },
    /**
     * 프리서버 제목.
     */
    'title': string
  };
}
