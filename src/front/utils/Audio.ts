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

import { Logger } from "back/utils/Logger";
import { $data, updateLoading } from "front/Play";
import { L } from "./Global";

/**
 * 끄투에서 활용할 수 있는 소리 열거형.
 */
export enum Sound{
  BGM_LOBBY = "bgm-lobby.mp3",
  CHAT = "chat.mp3"
}

const sounds:{
  [key in Sound]?: AudioBuffer
} = {};

/**
 * 소리 열거형에 나열된 소리들을 모두 불러와 메모리에 저장한다.
 */
export function loadSounds():Promise<void>{
  const list = Object.values(Sound).filter(v => v.endsWith(".mp3"));
  let remain = list.length;

  $data.audioContext = new AudioContext();

  return new Promise((res, rej) => {
    for(const v of list){
      const req = new XMLHttpRequest();

      req.open('GET', `/media/sounds/${v}`);
      req.responseType = "arraybuffer";
      req.onload = () => {
        $data.audioContext.decodeAudioData(req.response, chunk => {
          sounds[v] = chunk;
          if(--remain === 0){
            res();
          }else{
            updateLoading(L('loading-remain', remain));
          }
        });
      };
      req.onerror = e => {
        Logger.error("XMLHttpRequest").out();
        rej();
      };
      req.send();
    }
  });
}
/**
 * 소리를 재생한다.
 *
 * @param key 재생할 소리.
 * @param isBGM 배경 음악 여부. `true`인 경우 반복 재생한다.
 */
export function playSound(key:Sound, isBGM?:boolean):void{
  const sound = sounds[key];
  const muted = (isBGM && $data.mutedBGM) || (!isBGM && $data.mutedSE);
  const source = $data.audioContext.createBufferSource();

  source.startedAt = $data.audioContext.currentTime;
  source.loop = isBGM;
  if(muted){
    source.buffer = $data.audioContext.createBuffer(2, sound.length, $data.audioContext.sampleRate);
  }else{
    source.buffer = sound;
  }
  source.connect($data.audioContext.destination);
  if(sound.playingSource){
    sound.playingSource.stop();
  }
  sound.playingSource = source;
  source.key = key;
  source.start();
}
/**
 * 재생 중인 모든 소리들을 멈춘다.
 */
export function stopAllSounds():void{
  for(const v of Object.values(sounds)){
    if(!v.playingSource){
      continue;
    }
    v.playingSource.stop();
    v.playingSource = null;
  }
}
