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

/**
 * 일반 오류 열거형.
 */
export enum ApplicationError{
  /**
   * 클라이언트 변조 등에 의한 잘못된 요청.
   */
  BAD_REQUEST = 400,
  /**
   * 손님 권한으로 할 수 없는 것을 요청.
   */
  GUEST_NOT_ALLOWED = 401,
  /**
   * 로비가 아닌 곳에서 방 생성 요청.
   */
  NOT_LOBBY = 409
}

/**
 * HTTP 상태 코드 열거형.
 */
export enum StatusCode{
  OK = 200,
  MOVED = 302,
  NOT_FOUND = 404
}

/**
 * 웹소켓 종료 코드 열거형.
 */
export enum WebSocketCloseCode{
  /**
   * 게임 방 서버 접속 시, 잘못된 채널 입장으로 인한 강제 접속 종료.
   */
  INVALID_CHANNEL = 4000,
  /**
   * 게임 방 서버 접속 시, 방 예약 없이 방 생성 시도로 인한 강제 접속 종료.
   */
  NOT_RESERVED,
  /**
   * 게임 방 서버 접속 시, 다중 접속으로 인한 기존 클라이언트의 강제 접속 종료.
   */
  MULTI_CONNECTION,
  /**
   * 테스트 서버로 권한 없이 접속해 강제 접속 종료.
   */
  TEST,
  /**
   * 데이터베이스로부터 받은 정보의 상태에 의한 강제 접속 종료.
   */
  REFRESH_FAILED,
  /**
   * 도배로 인한 강제 접속 종료.
   */
  SPAM
}
