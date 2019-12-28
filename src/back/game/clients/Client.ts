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

import WS = require("ws");

import { SETTINGS } from "back/utils/System";
import { WSClient } from "back/utils/WSClient";

/**
 * 일반 사용자의 클라이언트 클래스.
 */
export class Client extends WSClient{
  protected requestHandlerTable:KKuTu.Packet.RequestHandlerTable = null;
  protected responseHandlerTable:KKuTu.Packet.ResponseHandlerTable = null;

  constructor(id:string, socket:WS){
    super(id, socket);
    this.response('welcome', {
      administrator: Boolean(SETTINGS.administrators.find(v => v.id === id))
    });
  }
}
