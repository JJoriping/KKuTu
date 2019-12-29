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

$(document).ready(() => {
  $("#list").children().each((i, o) => {
    const page = `c${i + 1}`;

    $(o).attr('id', page).on('click', onClick).find("li").each((j, p) => {
      $(p).attr('id', `${page}p${j + 1}`).on('click', onClick);
    });
  });
  $("img").on('click', e => {
    const $target = $(e.currentTarget);

    window.open($target.attr('src'), "", [
      "resizable=no",
      "status=no"
    ].join(','));
  });
  function onClick(e:JQueryEventObject):void{
    const $target = $(e.currentTarget);
    const $list = $target.parents("li");
    const id = $target.attr('id');
    let title = $target.children("label").html();

    $(".selected").removeClass("selected");
    $target.addClass("selected");

    if($list.length) title = `${$list.children("label").html()} > ${title}`;
    $("#page-head").html(title);
    $(".page-body").hide();
    $(`#box-${id}`).show();
    e.stopPropagation();
  }
});
