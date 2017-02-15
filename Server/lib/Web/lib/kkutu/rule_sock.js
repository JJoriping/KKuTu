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

$lib.Sock.roundReady = function(data, spec){
	var turn = data.seq ? data.seq.indexOf($data.id) : -1;
	
	clearBoard();
	$data._relay = true;
	$(".jjoriping,.rounds,.game-body").addClass("cw");
	$data._va = [];
	$data._lang = RULE[MODE[$data.room.mode]].lang;
	$data._board = data.board;
	$data._maps = [];
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 10000;
	$stage.game.items.hide();
	$stage.game.bb.show();
	$lib.Sock.drawDisplay();
	drawRound(data.round);
	if(!spec) playSound('round_start');
	clearInterval($data._tTime);
};
$lib.Sock.turnEnd = function(id, data){
	var $sc = $("<div>").addClass("deltaScore").html("+" + data.score);
	var $uc = $("#game-user-" + id);
	var key;
	var i, j, l;
	
	if(data.score){
		key = data.value;
		l = key.length;
		$data._maps.push(key);
		for(i=0; i<l; i++){
			$data._board = $data._board.replace(key.charAt(i), "　");
		}
		if(id == $data.id){
			playSound('success');
		}else{
			playSound('mission');
		}
		$lib.Sock.drawDisplay();
		addScore(id, data.score);
		updateScore(id, getScore(id));
		drawObtainedScore($uc, $sc);
	}else{
		stopBGM();
		$data._relay = false;
		playSound('horr');
	}
};
$lib.Sock.drawMaps = function(){
	var i;
	
	$stage.game.bb.empty();
	$data._maps.sort(function(a, b){ return b.length - a.length; }).forEach(function(item){
		$stage.game.bb.append($word(item));
	});
	function $word(text){
		var $R = $("<div>").addClass("bb-word");
		var i, len = text.length;
		var $c;
		
		for(i=0; i<len; i++){
			$R.append($c = $("<div>").addClass("bb-char").html(text.charAt(i)));
			// if(text.charAt(i) != "？") $c.css('color', "#EEEEEE");
		}
		return $R;
	}
};
$lib.Sock.drawDisplay = function(){
	var $a = $("<div>").css('height', "100%"), $c;
	var va = $data._board.split("");
	var size = ($data._lang == "ko") ? "12.5%" : "10%";
	
	va.forEach(function(item, index){
		$a.append($c = $("<div>").addClass("sock-char sock-" + item).css({ width: size, height: size }).html(item));
		if($data._va[index] && $data._va[index] != item){
			$c.html($data._va[index]).addClass("sock-picked").animate({ 'opacity': 0 }, 500);
		}
	});
	$data._va = va;
	$stage.game.display.empty().append($a);
	$lib.Sock.drawMaps();
};
$lib.Sock.turnStart = function(data, spec){
	var i, j;
	
	clearInterval($data._tTime);
	$data._tTime = addInterval(turnGoing, TICK);
	playBGM('jaqwi');
};
$lib.Sock.turnGoing = $lib.Jaqwi.turnGoing;
$lib.Sock.turnHint = function(data){
	playSound('fail');
};
