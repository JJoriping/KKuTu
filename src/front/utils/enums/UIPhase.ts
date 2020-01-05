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
 * 현재 보일 UI 화면 열거형.
 */
export enum UIPhase{
  /**
   * 로비 화면.
   */
  LOBBY = "lobby",
  /**
   * 방장의 대기실 화면.
   */
  MASTER = "master",
  /**
   * 방장이 아닌 방 인원의 대기실 화면.
   */
  NORMAL = "normal",
  /**
   * 게임 화면.
   */
  GAMING = "gaming"
}
