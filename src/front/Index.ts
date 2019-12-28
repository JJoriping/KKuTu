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

import { initialize, L } from "./utils/Global";

const $stage:{
  'list'?:JQuery,
  'total'?:JQuery,
  'start'?:JQuery,
  'refresh'?:JQuery,
  'refreshIcon'?:JQuery
} = {};

$(document).ready(() => {
  const PERCENTILE = 100;
  const THRESHOLD_RED = 99;
  const THRESHOLD_YELLOW = 90;
  const INTERVAL_SEEK = 1000;
  const INTERVAL_AUTOSEEK = 60000;

  let servers:KKuTu.ServerList;

  initialize();
  $stage.list = $("#server-list");
  $stage.total = $("#server-total");
  $stage.start = $("#game-start");
  $stage.refresh = $("#server-refresh");
  $stage.refreshIcon = $("#server-refresh>i");

  $stage.start.prop('disabled', true).on('click', () => {
    const RATIO_START = 0.9;
    const RATIO_STEP = 0.01;

    for(let ratio = RATIO_START; ratio < 1; ratio += RATIO_STEP){
      for(let i = 0; i < servers.list.length; i++){
        if(servers.list[i] < ratio * servers.max){
          return void $(`#server-${i}`).trigger('click');
        }
      }
    }
  });
  $stage.refresh.on('click', () => {
    if($stage.refreshIcon.hasClass("fa-spin")){
      return alert(L('refreshing'));
    }
    $stage.refreshIcon.addClass("fa-spin");
    window.setTimeout(seek, INTERVAL_SEEK);
  });
  window.setInterval(() => {
    $stage.refresh.trigger('click');
  },                 INTERVAL_AUTOSEEK);
  seek();

  function seek():void{
    $.get("/servers", (data:KKuTu.ServerList) => {
      let sum = 0;

      $stage.list.empty();
      servers = data;
      data.list.forEach((v, i) => {
        let status = v === null ? "x" : "o";
        const percentile = v / data.max * PERCENTILE;
        const people = (status === "x") ? "-" : `${v} / ${data.max}`;
        let $baby:JQuery;

        sum += v || 0;
        if(status === "o"){
          if(percentile >= THRESHOLD_RED) status = "q";
          else if(percentile >= THRESHOLD_YELLOW) status = "p";
        }
        $baby = $("<div>").addClass("server").attr('id', `server-${i}`)
          .append($("<div>").addClass(`server-status ss-${status}`))
          .append($("<div>").addClass("server-name").html(L(`server-${i}`)))
          .append($("<div>").addClass("server-people graph")
            .append($("<div>").addClass("graph-bar").width(`${percentile}%`))
            .append($("<label>").html(people))
          )
          .append($("<div>").addClass("server-enter").html(L('server-enter')))
        ;
        $stage.list.append($baby);
        if(status === "x"){
          $baby.children(".server-enter").html("-");
        }else{
          $baby.on('click', () => {
            location.href = `/server/${i}`;
          });
        }
      });
      $stage.total.html(`&nbsp; ${L('server-counter', sum.toLocaleString())}`);
      $stage.refreshIcon.removeClass("fa-spin");
      $stage.start.prop('disabled', false);
    });
  }
});
