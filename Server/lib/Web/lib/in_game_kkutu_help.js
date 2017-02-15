/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

$(document).ready(function(){
	$("#list").children().each(function(index, obj){
		var p = "c" + (index + 1);
		
		$(obj).attr('id', p).on('click', onMenu).find("li").each(function(_index, _obj){
			$(_obj).attr('id', p + "p" + (_index + 1)).on('click', onMenu);
		});
	});
	$("img").on('click', function(e){
		var $target = $(e.currentTarget);
		
		window.open($target.attr('src'), "", [
			"resizable=no", "status=no"
		].join(','));
	});
	
	function onMenu(e){
		$(".selected").removeClass("selected");
		var $target = $(e.currentTarget).addClass("selected");
		var id = $target.attr('id');
		var title = $target.children("label").html();
		var $tp = $target.parents("li");
		
		if($tp.length) title = $tp.children("label").html() + " > " + title;
		$("#page-head").html(title);
		$(".page-body").hide();
		$("#box-" + id).show();
		e.stopPropagation();
	}
});