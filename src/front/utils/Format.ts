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

import { DateUnit } from "back/utils/enums/DateUnit";
import { L } from "./Global";

const MAX_MINUTE = 60;
const MAX_SECOND = 60;

/**
 * 주어진 시간 값을 `a시간 b분 c초` 꼴로 출력한다.
 *
 * `a`나 `b`는 그 값이 0인 경우 생략한다.
 *
 * @param time 시간(㎳).
 */
export function prettyTime(time:number):string{
  const second = Math.floor(time / DateUnit.SECOND) % MAX_SECOND;
  const minute = Math.floor(time / DateUnit.MINUTE) % MAX_MINUTE;
  const hour = Math.floor(time / DateUnit.HOUR);
  const R:string[] = [];

  if(hour) R.push(hour + L('HOUR'));
  if(minute) R.push(minute + L('MINUTE'));
  if(!hour) R.push(second + L('SECOND'));

  return R.join(' ');
}
