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

import $ = require("jquery");

import { DateUnit } from "back/utils/enums/DateUnit";
import { Rule, RULE_TABLE, RuleOption } from "back/utils/Rule";
import { loadSounds } from "./utils/Audio";
import { UIPhase } from "./utils/enums/UIPhase";
import { prettyTime } from "./utils/Format";
import { connectLobby, send } from "./utils/GameClient";
import { initialize, L } from "./utils/Global";
import { $data, $stage, getGameOptions, runCommand, showDialog, updateGameOptions, updateLoading } from "./utils/PlayUtility";
import { isRoomMatched } from "./utils/Room";
import { applySettings, checkCompatibility } from "./utils/Utility";

$(document).ready(async () => {
  initialize();
  if(!checkCompatibility()){
    updateLoading(L('compatibility-error'));

    return;
  }
  $stage.chat = $("#chat");
  $stage.chatLog = $("#chat-log-board");
  $stage.talk = $("#talk");
  $stage.intro = $("#intro");
  $stage.introText = $("#intro-text");
  $stage.loading = $("#loading");
  $stage.box = {
    chat: $(".chat-box")
  };
  $stage.balloons = $("#balloons");
  $stage.dialog = {
    'chat-log': $("#dialog-chat-log"),
    'help': $("#dialog-help"),
    'settings': $("#dialog-settings"),
    'room': $("#dialog-room"),
    'extended-theme': $("#dialog-extended-theme"),
    'quick': $("#dialog-quick")
  };
  $stage.game = {
    'here': $(".game-input").hide(),
    'here-text': $("#game-input")
  };
  $stage.menu = {
    'help': $("#menu-help"),
    'settings': $("#menu-settings"),
    'community': $("#menu-community"),
    'spectate': $("#menu-spectate"),
    'room-set': $("#menu-room-set"),
    'room-new': $("#menu-room-new"),
    'room-quick': $("#menu-room-quick"),
    'shop': $("#menu-shop"),
    'dictionary': $("#menu-dictionary"),
    'invite': $("#menu-invite"),
    'practice': $("#menu-practice"),
    'ready': $("#menu-ready"),
    'start': $("#menu-start"),
    'exit': $("#menu-exit"),
    'replay': $("#menu-replay"),
    'leaderboard': $("#menu-leaderboard")
  };

  $data.options = Object.values(RuleOption).filter(w => w.length === 3);
  $data.rooms = [];
  $data.users = {};
  $data.url = $("#url").text();

  await loadSounds();
  await connectLobby($data.url);

  // 메뉴
  $stage.menu.help.on('click', () => {
    $("#help-board").attr('src', "/help");
    showDialog($stage.dialog.help);
  });
  $stage.menu.settings.on('click', () => {
    showDialog($stage.dialog.settings);
  });
  $stage.menu['room-new'].on('click', () => {
    $data.roomAction = "room-new";
    $stage.dialog.quick.hide();
    showDialog($stage.dialog.room);
    $stage.dialog.room.find(".dialog-title").html(L('dialog-room-new-title'));
  });
  $stage.menu['room-set'].on('click', () => {
    const rule = RULE_TABLE[$data.room.rule as Rule];

    $data.roomAction = "room-set";
    $("#room-title").val($data.room.title);
    $("#room-limit").val($data.room.limit);
    $("#room-mode").val($data.room.rule).trigger('change');
    $("#room-round").val($data.room.round);
    $("#room-time").val($data.room.time / rule.time);
    for(const v of $data.options){
      $(`#room-option-${v}`).attr('checked', $data.room.options[v] ? "checked" : null);
    }
    $data.extensions = $data.room.options.extensions;
    showDialog($stage.dialog.room);
    $stage.dialog.room.find(".dialog-title").html(L('dialog-room-set-title'));
  });
  // 대화상자 - 설정
  $("#settings-ok").on('click', () => {
    applySettings({
      mb: $("#mute-bgm").is(':checked'),
      me: $("#mute-effect").is(':checked'),
      di: $("#deny-invite").is(':checked'),
      dw: $("#deny-whisper").is(':checked'),
      df: $("#deny-friend").is(':checked'),
      ar: $("#auto-ready").is(':checked'),
      su: $("#sort-user").is(':checked'),
      ow: $("#only-waiting").is(':checked'),
      ou: $("#only-unlock").is(':checked')
    });
    $.cookie('kks', JSON.stringify($data.settings));
    $stage.dialog.settings.hide();
  });
  $("#settings-server").on('click', () => {
    location.href = "/";
  });
  // 대화상자 - 방
  $("#room-mode").on('change', () => {
    const value = $("#room-mode").val() as Rule;
    const rule = RULE_TABLE[value];

    $("#game-mode-expl").html(L(`x-mode-${value}`));
    updateGameOptions(rule.options, 'room');

    $data.extensions = [];
    if(rule.options.includes(RuleOption.EXTENSIONS)){
      $("#room-extensions").show();
    }else{
      $("#room-extensions").hide();
    }
    if(rule.name === "Typing"){
      $("#room-round").val(3);
    }
    $("#room-time").children("option").each((i, o) => {
      $(o).html(Number($(o).val()) * rule.time + L('SECOND'));
    });
  }).trigger('change');
  $("#room-ok").on('click', () => {
    send($data.roomAction, {
      title: $("#room-title").val().trim() || $("#room-title").attr('placeholder').trim(),
      password: $("#room-pw").val(),
      limit: Number($("#room-limit").val()),
      rule: $("#room-mode").val(),
      round: Number($("#room-round").val()),
      time: Number($("#room-time").val()),
      options: {
        ...getGameOptions('room'),
        extensions: $data.extensions
      }
    });
    $stage.dialog.room.hide();
  });
  // 대화상자 - 주제 선택
  $("#room-extensions").on('click', () => {
    const rule = RULE_TABLE[$("#room-mode").val() as Rule];

    $("#extension-list>div").hide();
    if(rule.locale === "ko"){
      $data.extensionPrefix = "#ko-pick-";
      $("#ko-pick-list").show();
    }else if(rule.locale === "en"){
      $data.extensionPrefix = "#en-pick-";
      $("#en-pick-list").show();
    }
    $("#pick-none").trigger('click');
    for(const v of $data.extensions){
      $($data.extensionPrefix + v).prop('checked', true);
    }
    showDialog($stage.dialog['extended-theme']);
  });
  $("#pick-all").on('click', () => {
    $("#extension-list input").prop('checked', true);
  });
  $("#pick-none").on('click', () => {
    $("#extension-list input").prop('checked', false);
  });
  $("#injpick-ok").on('click', () => {
    const $target = $(`${$data.extensionPrefix}list`);
    const PREFIX_OFFSSET = 8;
    const list:string[] = [];

    $target.find("input").each((i, o) => {
      const id = $(o).attr('id').slice(PREFIX_OFFSSET);

      if($(o).is(':checked')){
        list.push(id);
      }
    });
    $data.extensions = list;
    $stage.dialog['extended-theme'].hide();
  });
  // 대화상자 - 빠른 입장
  $stage.menu['room-quick'].on('click', () => {
    $stage.dialog.room.hide();
    showDialog($stage.dialog.quick);
    if($stage.dialog.quick.is(':visible')){
      $("#dialog-quick>.dialog-body").find("*").prop('disabled', false);
      $("#quick-mode").trigger('change');
      $("#quick-queue").html("");
      $("#quick-ok").removeClass("searching").html(L('OK'));
    }
  });
  $("#quick-ok").on('click', () => {
    const INTERVAL_QUICK = 1000;
    const rule = $("#quick-mode").val() as Rule;
    const options = getGameOptions('quick');

    if($data.phase !== UIPhase.LOBBY){
      return;
    }
    if($("#quick-ok").hasClass("searching")){
      $stage.dialog.quick.hide();
      onTick();
      $stage.menu['room-quick'].trigger('click');

      return;
    }
    $("#dialog-quick>.dialog-body").find("*").prop('disabled', true);
    $("#quick-ok")
      .addClass("searching")
      .html(`<i class="fa fa-spinner fa-spin"></i> ${L('NO')}`)
      .prop('disabled', false)
    ;
    $data.quick = {
      tick: 0,
      timer: window.setInterval(onTick, INTERVAL_QUICK),
      prepared: false
    };
    function onTick():void{
      const candidates:number[] = [];

      if(!$stage.dialog.quick.is(':visible')){
        clearTimeout($data.quick.timer);

        return;
      }
      $("#quick-queue").html(L('quick-queue', prettyTime($data.quick.tick++ * DateUnit.SECOND)));
      for(const v of $data.rooms){
        if(isRoomMatched(v, rule, options)){
          candidates.push(v.id);
        }
      }
      if(candidates.length){
        $data.quick.prepared = true;
        $(`#room-${candidates[Math.floor(Math.random() * candidates.length)]}`).trigger('click');
      }
    }
  });
  $("#quick-mode, #dialog-quick .game-option").on('change', e => {
    const value = $("#quick-mode").val() as Rule;
    let counter = 0;
    let options:Table<true>;

    if(e.currentTarget.id === "quick-mode"){
      $("#dialog-quick .game-option").prop('checked', false);
    }
    options = getGameOptions('quick');
    updateGameOptions(RULE_TABLE[value].options, 'quick');
    for(const v of $data.rooms){
      if(isRoomMatched(v, value, options, true)){
        counter++;
      }
    }
    $("#quick-status").html(L('quick-status', counter));
  });
  // 제품 - 채팅
  $("#chat-send").on('click', () => {
    const chunk = {
      relay: false,
      value: String($stage.talk.val())
    };

    if(!chunk.value){
      return;
    }
    if(chunk.value[0] === "/"){
      runCommand(chunk.value.split(' '));
    }else{
      if($stage.game.here.is(':visible')){
        chunk.relay = true;
      }
      send('talk', chunk);
    }
    if($data.whisper){
      $stage.talk.val(`/e ${$data.whisper} `);
      delete $data.whisper;
    }else{
      $stage.talk.val("");
    }
  }).hotKey($stage.talk, "Enter");
});
