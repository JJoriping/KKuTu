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

import { Rule, RuleOption } from "back/utils/Rule";
import { forkChat, notice, replaceInsults, sendWhisper } from "./Chat";
import { UIPhase } from "./enums/UIPhase";
import { G, L } from "./Global";
import { Iterator } from "back/utils/Utility";
import { JTImage, LevelImage, RoomListBar, UserListBar, getOptionText } from "./PlayComponent";
import { send } from "./GameClient";
import { moremiImage } from "./Moremi";
import { ItemGroup } from "back/utils/enums/ItemGroup";
import { Sound, playSound, stopAllSounds } from "./Audio";
import { prettyTime } from "./Format";
import { Logger } from "back/utils/Logger";

/**
 * 자주 쓰이는 JQuery 객체를 담은 객체.
 */
export const $stage:Partial<{
  'chat':JQuery;
  'chatLog':JQuery;
  'talk':JQuery;
  'intro':JQuery;
  'introText':JQuery;
  'loading':JQuery;
  'balloons':JQuery;
  'box':{
    'me':JQuery;
    'chat':JQuery;
    'room':JQuery;
    'room-list':JQuery;
    'user-list':JQuery;
    'shop':JQuery;
  };
  'dialog':{
    'chat-log':JQuery;
    'extended-theme':JQuery;
    'help':JQuery;
    'invite-list':JQuery;
    'profile':JQuery;
    'profile-dress':JQuery;
    'profile-handover':JQuery;
    'profile-kick':JQuery;
    'profile-level':JQuery;
    'profile-shut':JQuery;
    'profile-whisper':JQuery;
    'quick':JQuery;
    'room':JQuery;
    'settings':JQuery;
  };
  'game':{
    'here':JQuery;
    'here-text':JQuery;
  };
  'lobby':{
    'room-create':JQuery;
    'room-list':JQuery;
    'room-list-title':JQuery;
    'user-list':JQuery;
    'user-list-title':JQuery;
  };
  'menu':{
    'help':JQuery;
    'settings':JQuery;
    'community':JQuery;
    'spectate':JQuery;
    'room-set':JQuery;
    'room-new':JQuery;
    'room-quick':JQuery;
    'shop':JQuery;
    'dictionary':JQuery;
    'invite':JQuery;
    'practice':JQuery;
    'ready':JQuery;
    'start':JQuery;
    'exit':JQuery;
    'replay':JQuery;
    'leaderboard':JQuery;
  };
}> = {};
/**
 * 자주 쓰이는 전역 정보를 담은 객체.
 */
export const $data:Partial<{
  /**
   * DOM API 없이 소리 처리를 하기 위한 오디오 콘텍스트.
   */
  'audioContext':AudioContext;
  /**
   * 현재 재생 중인 배경 음악의 오디오 버퍼.
   */
  'bgm':AudioBuffer;
  /**
   * 차단한 사용자 목록 객체.
   */
  'blacklist':Table<true>;
  /**
   * 최근 설정된 어인정 주제 목록.
   */
  'extensions':string[];
  /**
   * 어인정 주제 선택 중, 어떤 언어의 목록에서 골랐는지를 구분하기 위해 쓰는
   * CSS 선택자의 접두어.
   */
  'extensionPrefix':string;
  /**
   * 자동 준비를 활성화한 상태에서 자동 준비 완료 여부.
   *
   * 방에 입장 후 최초 1번만 자동 준비가 활성화되어야 하기 때문에 필요하다.
   */
  'firstAutoReady':boolean;
  /**
   * 게임 중 상태 여부.
   */
  'gaming':boolean;
  /**
   * 현재 접속한 계정의 식별자.
   */
  'id':string;
  /**
   * 현재 방의 방장 식별자.
   */
  'master':boolean;
  /**
   * 최근 설정된 배경 음악 음소거 여부.
   */
  'mutedBGM':boolean;
  /**
   * 최근 설정된 효과음 음소거 여부.
   */
  'mutedSE':boolean;
  /**
   * 설정할 수 있는 특수 규칙 목록.
   */
  'options':RuleOption[];
  /**
   * `room-new` 과정 (4)를 위해 잠시 기록되는 방 정보 객체.
   */
  'pendingRoom':KKuTu.Packet.RequestData<'room-new'>;
  /**
   * 현재 UI에서 보여줘야 할 화면.
   */
  'phase':UIPhase;
  /**
   * 현재 내 위치.
   */
  'place':number;
  /**
   * 현재 방 참여자 식별자 배열의 문자열 표현.
   */
  'players':string;
  /**
   * 오늘 총 플레이 시간(㎳).
   */
  'playTime':number;
  /**
   * 연습 상태 여부.
   */
  'practicing':boolean;
  /**
   * 프로필 창에 나타난 정보의 주체 식별자.
   */
  'profiledUser':string;
  /**
   * 빠른 입장 처리를 위해 필요한 정보 객체.
   */
  'quick':{
    /**
     * 빠른 입장 경과 시간(㎳).
     */
    'tick':number;
    /**
     * 경과 시간을 계산하고 입장 시도를 하기 위해 사용하는
     * `setInterval()` 함수의 반환값.
     */
    'timer':number;
    /**
     * 입장할 수 있는 방이 나와 입장을 시도하는 중인지 여부.
     */
    'prepared':boolean;
  };
  /**
   * 최근 이 클라이언트로 귓속말을 보낸 계정 식별자.
   */
  'recentFrom':string;
  /**
   * 연습 모드를 위해 방이 새로 만들어질 때, 기존 방의 정보를 담은 객체.
   */
  'recentRoomData':{
    'room':KKuTu.Game.Room;
    'place':number;
    'master':boolean;
    'players':string;
    'title':string;
    'mode':string;
    'limit':number;
    'round':number;
    'time':number;
  };
  /**
   * 게임 결과 화면 표시 여부.
   */
  'resulting':boolean;
  /**
   * 게임 방에 입장한 끄투 봇 목록 객체.
   */
  'robots':Table<KKuTu.Game.User>;
  /**
   * 이 클라이언트가 입장한 방 정보 객체.
   */
  'room':KKuTu.Game.Room;
  /**
   * 이 서버의 방 목록.
   */
  'rooms':Table<KKuTu.Game.Room>;
  /**
   * 최근 연 방 설정 대화상자의 목적.
   *
   * 방을 만드려는 경우 `room-new`, 방장으로서 수정하려는 경우 `room-set`을 갖는다.
   */
  'roomAction':"room-new"|"room-set";
  /**
   * 접속한 서버 번호.
   */
  'server':number;
  /**
   * 최근 설정된 설정 객체.
   */
  'settings':KKuTu.ClientSettings;
  /**
   * 전체 아이템 목록 객체.
   */
  'shop':Table<KKuTu.Game.Item>;
  /**
   * 상점 표출 여부.
   */
  'shopping':boolean;
  /**
   * 접속할 게임 로비 서버의 주소.
   */
  'url':string;
  /**
   * 현재 접속 중인 사용자 목록 객체.
   */
  'users':Table<KKuTu.Game.User>;
  /**
   * 귓속말 상대.
   */
  'whisper':string;
}> = {};

const SIZE_CHAT_WIDTH = 790;
const SIZE_CHAT_HEIGHT = 190;
const SIZE_INNER_CHAT_HEIGHT = 120;
const SIZE_ROOM_HEIGHT = 360;
const COMMAND_TABLE:Table<(chunk:string[])=>void> = {
  ㄱ: () => {
    if(!$data.room){
      return;
    }
    if($data.room.master === $data.id){
      $stage.menu.start.trigger('click');
    }else{
      $stage.menu.ready.trigger('click');
    }
  },
  ㄷ: chunk => {
    sendWhisper(chunk[1], chunk.slice(2).join(' '));
  },
  ㄹ: () => {
    showDialog($stage.dialog['chat-log']);
    $stage.chatLog.scrollTop(Number.MAX_SAFE_INTEGER);
  },
  청소: () => {
    $stage.chat.empty();
  }
};
const MAX_LEVEL = 360;
const EXP_TABLE = [
  ...Iterator(MAX_LEVEL).map((_, i) => getRequiredScore(i)).slice(1),
  Infinity,
  Infinity
];

/**
 * 대화상자를 보인다.
 *
 * 이미 보이는 경우 `noToggle`이 `true`가 아닌 한 대화상자를 숨긴다.
 *
 * @param $target 보여줄 대화상자 객체.
 * @param noToggle 토글 비활성화 여부. `true`인 경우 이 함수 호출로는 대화상자가 숨겨지지 않는다.
 */
export function showDialog($target:JQuery, noToggle?:boolean):boolean{
  if(!noToggle && $target.is(':visible')){
    $target.hide();

    return false;
  }
  $(".dialog-front").removeClass("dialog-front");
  $target.show().addClass("dialog-front").css({
    left: (G.windowSize[0] - $target.width()) / 2,
    top : (G.windowSize[1] - $target.height()) / 2
  });

  return true;
}
/**
 * 주어진 식별자로부터 특수 규칙 활성화 여부 표를 구해 반환한다.
 *
 * @param prefix 객체 식별자의 접두어.
 */
export function getGameOptions(prefix:string):{
  [key in RuleOption]?:true
}{
  const R:{
    [key in RuleOption]?:true
  } = {};

  for(const v of $data.options){
    if($(`#${prefix}-${v}`).is(':checked')){
      R[v] = true;
    }
  }

  return R;
}
/**
 * 주어진 경험치로부터 레벨을 구해 반환한다.
 *
 * @param score 경험치.
 */
export function getLevel(score:number):number{
  let i:number;

  for(i = 0; i < EXP_TABLE.length; i++){
    if(score < EXP_TABLE[i]) break;
  }

  return i + 1;
}
/**
 * 주어진 레벨에서 다음 레벨로 올리기 위해 필요한 경험치를 반환한다.
 *
 * @param level 레벨.
 */
export function getRequiredScore(level:number):number{
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const BUMPED_SMALL = level % 5 ? 1 : 1.3;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const BUMPED_MIDDLE = level % 15 ? 1 : 1.4;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const BUMPED_BIG = level % 45 ? 1 : 1.5;

  return Math.round(
    BUMPED_SMALL * BUMPED_MIDDLE * BUMPED_BIG * (
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      120 + Math.floor(level / 5) * 60 + Math.floor(level * level / 225) * 120 + Math.floor(level * level / 2025) * 180
    )
  );
}
/**
 * `room` 응답을 처리한다.
 *
 * @param data `room` 응답 정보.
 */
export function processRoom({ modify, room, target, 'kick-vote': kickVote }:KKuTu.Packet.ResponseData<'room'>):void{
  const isMyRoom = $data.place === room.id || $data.id === target;
  let $target:KKuTu.Game.User = null;

  if(isMyRoom){
    $target = $data.users[target];
    if(kickVote){
      notice(L(
        kickVote.Y >= kickVote.N ? "kicked" : "kick-denied",
        kickVote.Y,
        kickVote.N,
        $target.profile.title || $target.profile.name
      ));
      if($target.id === $data.id){
        alert(L('has-kicked'));
      }
    }
    if(room.players.indexOf($data.id) === -1){
      if($data.room?.gaming){
        stopAllSounds();
        $data.practicing = false;
        $data.gaming = false;
        $stage.box.room.height(SIZE_ROOM_HEIGHT);
        playSound(Sound.BGM_LOBBY, true);
      }
      $data.users[$data.id].status = {
        ready: false,
        team : 0,
        form : "J"
      };
      $stage.menu.spectate.removeClass("toggled");
      $stage.menu.ready.removeClass("toggled");
      $data.room = null;
      $data.resulting = false;
      $data.players = null;
      $data.place = 0;
      if(room.practice){
        delete $data.users[0];
        $data.room = $data.recentRoomData.room;
        $data.place = $data.recentRoomData.place;
        $data.master = $data.recentRoomData.master;
        $data.players = $data.recentRoomData.players;
      }
    }else{
      if(room.practice && !$data.practicing){
        $data.practicing = true;
        Object.assign($data.recentRoomData, {
          room   : $data.room,
          place  : $data.place,
          master : $data.master,
          players: $data.players
        });
      }
      if($data.room){
        $data.players = $data.room.players.toString();
        Object.assign(
          $data.recentRoomData, {
            master : $data.master,
            players: $data.players,
            title  : $data.room.title,
            mode   : getOptionText($data.room.rule as Rule, $data.room.options, true).join(','),
            limit  : $data.room.limit,
            round  : $data.room.round,
            time   : $data.room.time
          }
        );
      }
      $data.room = room;
      $data.place = $data.room.id;
      $data.master = $data.room.master === $data.id;
      // TODO if(data.spec && data.target == $data.id){ ... }
    }
    if(!modify && target === $data.id){
      forkChat();
    }
  }
  if(target && $data.users[target]){
    // TODO
  }
  if(room.practice){
    return;
  }
  if(room.players.length){
    setRoom(room.id, room);
    for(const k in room.readies){
      if(!$data.users[k]){
        continue;
      }
      $data.users[k].status.ready = room.readies[k].r;
      $data.users[k].status.team = room.readies[k].t;
    }
  }else{
    setRoom(room.id, null);
  }
}
/**
 * 주어진 JQuery 객체에 모레미를 그린다.
 *
 * @param $target 대상 JQuery 객체.
 * @param equip 착용한 아이템 목록 객체.
 */
export function renderMoremi($target:JQuery, equip:KKuTu.Game.User['equip'] = {}):void{
  const LR:Table<ItemGroup> = {
    'Mlhand': ItemGroup.MOREMI_HAND,
    'Mrhand': ItemGroup.MOREMI_HAND
  };

  $target.empty();
  for(const v of window.CONSTANTS['moremi-parts']){
    const key = `M${v}` as ItemGroup;

    $target.append(
      $("<img>")
        .addClass(`moremies moremi-${v}`)
        .attr('src', moremiImage(equip[key], LR[key] || key))
        .css({ width: "100%", height: "100%" })
    );
  }
  if(equip[ItemGroup.BADGE]){
    $target.append(
      $("<img>")
        .addClass(`moremies moremi-badge`)
        .attr('src', moremiImage(equip[ItemGroup.BADGE]))
        .css({ width: "100%", height: "100%" })
    );
  }
  $target.children(".moremi-back").after(
    $("<img>")
      .addClass("moremies moremi-body")
      .attr('src', equip[ItemGroup.ROBOT] ? "/media/images/moremi/robot.png" : "/media/images/moremi/body.png")
      .css({ width: "100%", height: "100%" })
  );
  $target.children(".moremi-rhand").css('transform', "scaleX(-1)");
}
/**
 * 대상 사용자에게 초대 메시지를 보낸다.
 *
 * @param target 대상 사용자의 식별자. 값이 AI인 경우 끄투 봇을 추가한다.
 */
export function requestInvite(target:string):void{
  if(target !== "AI"){
    const name = $data.users[target].profile.title || $data.users[target].profile.name;

    if(!confirm(L('sure-invite', name))) return;
  }
  send('invite', { target });
}
/**
 * 대상 사용자의 정보 창을 띄운다.
 *
 * @param target 대상 사용자의 식별자.
 */
export function requestProfile(target:string):void{
  const TITLE_LENGTH = 5;
  const user = $data.users[target] || $data.robots[target];
  const $record = $("#profile-record").empty();
  let $moremi:JQuery;
  let $exordial:JQuery;
  let level:number;

  if(!user){
    notice(L('error-405'));

    return;
  }
  $("#dialog-profile .dialog-title").html(L('dialog-profile-title', user.profile.title || user.profile.name));
  $(".profile-head").empty()
    .append($moremi = $("<div>").addClass("moremi profile-moremi"))
    .append(
      $("<div>").addClass("profile-head-item")
        .append(JTImage(user.profile.image).addClass("profile-image"))
        .append(
          $("<div>").addClass("profile-title ellipse").html(user.profile.title || user.profile.name)
            .append(
              $("<label>").addClass("profile-tag").html(` #${String(user.id).substr(0, TITLE_LENGTH)}`)
            )
        )
    )
    .append(
      $("<div>").addClass("profile-head-item")
        .append(LevelImage(user.data.score).addClass("profile-level"))
        .append($("<div>").addClass("profile-level-text").html(L('LEVEL', level = getLevel(user.data.score))))
        .append(
          $("<div>").addClass("profile-score-text")
            .html(`${user.data.score.toLocaleString()} / ${(EXP_TABLE[level - 1]).toLocaleString()} ${L('PTS')}`)
        )
    )
    .append(
      $exordial = $("<div>").addClass("profile-head-item profile-exordial ellipse")
        .text(replaceInsults(user.exordial || ""))
    )
  ;
  if(user.robot){
    $stage.dialog['profile-level'].show();
    $stage.dialog['profile-level'].prop('disabled', $data.id !== $data.room.master);
    $("#profile-place").html(L('room-number', $data.room.id));
  }else{
    $stage.dialog['profile-level'].hide();
    $("#profile-place").html(user.place ? L('room-number', user.place) : L('lobby'));
    for(const [ k, v ] of Object.entries(user.data.record)){
      $record.append(
        $("<div>").addClass("profile-record-field")
          .append($("<div>").addClass("profile-field-name").html(L(`mode-${k}`)))
          .append($("<div>").addClass("profile-field-record").html(L('record-p-w', v.plays, v.wins)))
          .append($("<div>").addClass("profile-field-score").html(`${v.scores.toLocaleString()} ${L('PTS')}`))
      );
    }
    renderMoremi($moremi, user.equip);
  }
  $stage.dialog['profile-kick'].hide();
  $stage.dialog['profile-shut'].hide();
  $stage.dialog['profile-dress'].hide();
  $stage.dialog['profile-whisper'].hide();
  $stage.dialog['profile-handover'].hide();

  if($data.id === target){
    $stage.dialog['profile-dress'].show();
  }else if(!user.robot){
    $stage.dialog['profile-shut'].show();
    $stage.dialog['profile-whisper'].show();
  }
  if($data.room){
    if($data.id !== target && $data.id === $data.room.master){
      $stage.dialog['profile-kick'].show();
      $stage.dialog['profile-handover'].show();
    }
  }
  $data.profiledUser = target;
  showDialog($stage.dialog.profile);
  $stage.dialog.profile.show();
}
/**
 * 주어진 방의 정보 창을 띄운다.
 *
 * @param roomId 방 번호.
 */
export function requestRoomInfo(roomId:number):void{
  // TODO
}
/**
 * 채팅으로 입력한 명령어를 실행한다.
 *
 * @param chunk 명령 내용.
 */
export function runCommand(chunk:string[]):void{
  const name = chunk[0].slice(1);
  const runner = COMMAND_TABLE[name];

  if(runner){
    runner(chunk);
  }else{
    for(const k in COMMAND_TABLE){
      notice(L(`command-${k}`), k);
    }
  }
}
/**
 * 방 목록 객체를 갱신한다.
 *
 * @param id 방 식별자.
 * @param data 방 객체. Falsy한 경우 목록에서 뺀다.
 */
export function setRoom(id:number, data:KKuTu.Game.Room):void{
  const isLobby = $data.phase === UIPhase.LOBBY;

  if(data){
    if(isLobby && !$data.rooms[id]){
      $stage.lobby['room-list'].append($("<div>").attr('id', `room-${id}`).data('id', id));
    }
    $data.rooms[id] = data;
    if(isLobby){
      $(`#room-${id}`).replaceWith(RoomListBar(data));
    }
  }else{
    delete $data.rooms[id];
    if(isLobby){
      $(`#room-${id}`).remove();
    }
  }
}
/**
 * 주어진 방으로 입장을 시도한다.
 *
 * @param roomId 방 번호.
 */
export function tryJoin(roomId:number):void{
  // TODO
}
/**
 * 주어진 특수 규칙 목록에 맞게 객체의 표시 여부를 전환한다.
 *
 * @param options 특수 규칙 목록.
 * @param prefix 표시 여부를 바꿀 객체 식별자의 접두어.
 */
export function updateGameOptions(options:string[], prefix:string):void{
  for(const v of $data.options){
    const $target = $(`#${prefix}-${v}-panel`);

    if(options.includes(v)) $target.show();
    else $target.hide();
  }
}
/**
 * 로딩 화면에 내용을 표시한다.
 *
 * 인트로 화면이 나타나 있다면 로딩 화면 대신 인트로 화면에서 내용을 표시한다.
 * 로딩 화면은 다른 객체를 선택할 수 없게 만든다.
 *
 * @param html 표시할 내용. Falsy한 경우 로딩 화면을 숨긴다.
 */
export function updateLoading(html?:string):void{
  if(html){
    if($stage.intro.is(':visible')){
      $stage.loading.hide();
      $stage.introText.html(html);
    }else{
      $stage.loading.show().html(html);
    }
  }else{
    $stage.loading.hide();
  }
}
/**
 * 내 정보 화면을 갱신한다.
 */
export function updateMe():void{
  const GAUGE_WIDTH = 190;
  const my = $data.users[$data.id];
  const level = getLevel(my.data.score);
  const prevScore = EXP_TABLE[level - 2] || 0;
  const nextScore = EXP_TABLE[level - 1];
  let totalWins = 0;

  for(const k in my.data.record){
    totalWins += my.data.record[k].wins;
  }
  renderMoremi($(".my-image"), my.equip);
  $(".my-status-level").replaceWith(LevelImage(my.data.score).addClass("my-status-level"));
  $(".my-status-name").html(my.profile.title || my.profile.name);
  $(".my-status-record").html(L('total-wins', totalWins.toLocaleString()));
  $(".my-status-ping").html(my.money.toLocaleString() + L('ping'));
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  $(".my-okg .graph-bar").width($data.playTime % 600000 / 6000 + "%");
  $(".my-okg-text").html(prettyTime($data.playTime));
  $(".my-level").html(L('LEVEL', level));
  $(".my-gauge .graph-bar").width((my.data.score - prevScore) / (nextScore - prevScore) * GAUGE_WIDTH);
  $(".my-gauge-text").html(`${my.data.score.toLocaleString()} / ${nextScore.toLocaleString()}`);
}
/**
 * UI 페이즈를 갱신한다.
 *
 * UI 페이즈는 `UIPhase`의 한 값으로 결정된다.
 */
export function updatePhase():void{
  if(!$data.place){
    $data.phase = UIPhase.LOBBY;
  }else if($data.room.gaming || $data.resulting){
    $data.phase = UIPhase.GAMING;
  }else if($data.master){
    $data.phase = UIPhase.MASTER;
  }else{
    $data.phase = UIPhase.NORMAL;
  }
}
/**
 * UI를 갱신한다.
 *
 * UI는 `UIPhase`에 따라 달라진다.
 */
export function updateUI():void{
  updatePhase();

  $(".kkutu-menu>button").hide();
  $(`.kkutu-menu>.for-${$data.phase}`).show();

  for(const $v of Object.values($stage.box)){
    $v.hide();
  }
  $stage.box.me.show();
  $stage.box.chat.show().width(SIZE_CHAT_WIDTH).height(SIZE_CHAT_HEIGHT);
  $stage.chat.height(SIZE_INNER_CHAT_HEIGHT);

  Logger.log("phase").put($data.phase).out();
  switch($data.phase){
    case UIPhase.LOBBY:
      $data.firstAutoReady = true;
      $stage.box['user-list'].show();
      if($data.shopping){
        $stage.box['room-list'].hide();
        $stage.box['shop'].show();
      }else{
        $stage.box['room-list'].show();
        $stage.box['shop'].hide();
      }
      updateUserList();
      updateRoomList();
      updateMe();
      break;
    case UIPhase.MASTER:
    case UIPhase.NORMAL:
      $(".team-chosen").removeClass("team-chosen");
      if($data.users[$data.id].status.ready || $data.users[$data.id].status.form === "S"){
        $stage.menu.ready.addClass("toggled");
        $(".team-selector").addClass("team-unable");
      }else{
        $stage.menu.ready.removeClass("toggled");
        $(".team-selector").removeClass("team-unable");
        $(`#team-${$data.users[$data.id].status.team}`).addClass("team-chosen");
        if($data.settings?.ar && $data.firstAutoReady){
          $stage.menu.ready.addClass("toggled").trigger('click');
          $data.firstAutoReady = false;
        }
      }
      $data.shopping = false;
      $stage.box.room.show().height(SIZE_ROOM_HEIGHT);
      if($data.phase === UIPhase.MASTER && $stage.dialog['invite-list'].is(':visible')){
        updateUserList();
      }
      updateRoom();
      updateMe();
      break;
    default:
      break;
  }
}
/**
 * 현재 방 UI를 갱신한다.
 */
export function updateRoom():void{
  // TODO
}
/**
 * 접속자 목록을 갱신한다.
 */
export function updateUserList():void{
  const list = Object.values($data.users);

  $stage.lobby['user-list-title'].html(L(
    'user-list-n',
    L(`server-${$data.server}`),
    list.length
  ));
  $stage.lobby['user-list'].empty();
  $stage.dialog['invite-list'].empty();
  for(const v of list){
    if(v.robot){
      continue;
    }
    $stage.lobby['user-list'].append(UserListBar(v));
    if(!v.place){
      $stage.dialog['invite-list'].append(UserListBar(v, true));
    }
  }
}
/**
 * 개설된 방 목록을 갱신한다.
 */
export function updateRoomList():void{
  const list = Object.values($data.rooms);

  $(".rooms-create").remove();

  $stage.lobby['room-list'].empty();
  for(const v of list){
    $stage.lobby['room-list'].append(RoomListBar(v));
  }
  $stage.lobby['room-list-title'].html(L(
    'room-list-n',
    list.length
  ));
  if(list.length){
    $(".rooms-gaming").css('display', $data.settings?.ow ? "none" : "");
    $(".rooms-locked").css('display', $data.settings?.ou ? "none" : "");
  }else{
    $stage.lobby['room-list'].append($stage.lobby['room-create'].clone().on('click', () => {
      $stage.menu['room-new'].trigger('click');
    }));
  }
}
