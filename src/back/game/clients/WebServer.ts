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

import { WSClient } from "back/utils/WSClient";
import { clients } from "../Lobby";

/**
 * 웹 서버의 클라이언트 클래스.
 *
 * 게임 서버가 웹 서버로부터의 연결을 처리하기 위해 쓰인다.
 */
export class WebServer extends WSClient{
  protected requestHandlerTable:KKuTu.Packet.RequestHandlerTable = {
    seek: () => {
      this.response('seek', {
        value: Object.keys(clients).length
      });
    }
  };
  protected responseHandlerTable:KKuTu.Packet.ResponseHandlerTable = null;
}
