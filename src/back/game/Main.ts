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

import Cluster = require("cluster");

import { Logger } from "back/utils/Logger";
import { SETTINGS } from "back/utils/System";
import { main as runAsLobby } from "./Lobby";
import { main as runAsRoom } from "./Room";

const CLUSTER = Number(process.env['KKUTU_CLUSTER']) || 0;
const PORT = SETTINGS.ports[CLUSTER];
const CHANNEL = Number(process.env['KKUTU_CHANNEL']);
const ROOM_PORT_OFFSET = 416;

Logger.initialize(isNaN(CHANNEL) ? `game-${CLUSTER}` : `game-${CLUSTER}-${CHANNEL}`).then(() => {
  if(isNaN(CHANNEL)){
    const channels:Cluster.Worker[] = [];

    Logger.info("Game").next("Sequence").put(CLUSTER).next("Slaves").put(SETTINGS.cluster['game-slave']).out();
    for(let i = 0; i < SETTINGS.cluster['game-slave']; i++){
      channels.push(Cluster.fork({
        KKUTU_PORT: PORT + ROOM_PORT_OFFSET + i,
        KKUTU_CHANNEL: i
      }));
      runAsLobby(CLUSTER, channels);
    }
    Cluster.on('exit', worker => {
      let index:number;

      for(let i = 0; i < channels.length; i++){
        if(channels[i] === worker){
          index = i;
          break;
        }
      }
      Logger.error("Lobby").put(`Worker #${index} died`).out();
      channels[index] = Cluster.fork({
        KKUTU_PORT: PORT + ROOM_PORT_OFFSET + index,
        KKUTU_CHANNEL: index
      });
    });
  }else{
    runAsRoom(CLUSTER);
  }
});
process.on('unhandledRejection', (err:Error) => {
  Logger.error("Unhandled Promise Rejection").next("Error").put(err.stack).out();
});
