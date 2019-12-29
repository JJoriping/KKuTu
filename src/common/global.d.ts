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

declare type ScheduleOptions = {
  /**
   * `true`인 경우 시작할 때 한 번 즉시 호출한다.
   */
  'callAtStart': boolean,
  /**
   * `true`인 경우 정시에 호출된다. 가령 1시간마다 호출하려는 경우
   * 시작 시점과는 관계 없이 0시 정각, 1시 정각, …에 맞추어 호출된다.
   */
  'punctual': boolean
};
declare type Table<T> = {
  [key in string]: T
};
