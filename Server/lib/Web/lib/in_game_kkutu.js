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

var MODE;
var BEAT = [ null,
	"10000000",
	"10001000",
	"10010010",
	"10011010",
	"11011010",
	"11011110",
	"11011111",
	"11111111"
];
var NULL_USER = {
	profile: { title: L['null'] },
	data: { score: 0 }
};
var MOREMI_PART;
var AVAIL_EQUIP;
var RULE;
var OPTIONS;
var MAX_LEVEL = 360;
var TICK = 30;
var EXP = [];
var BAD = new RegExp([ "느으*[^가-힣]*금마?", "니[^가-힣]*(엄|앰|엠)", "(ㅄ|ㅅㅂ|ㅂㅅ)", "미친(년|놈)?", "(병|븅|빙)[^가-힣]*신", "보[^가-힣]*지", "(새|섀|쌔|썌)[^가-힣]*(기|끼)", "섹[^가-힣]*스", "(시|씨|쉬|쒸)이*입?[^가-힣]*(발|빨|벌|뻘|팔|펄)", "십[^가-힣]*새", "씹", "(애|에)[^가-힣]*미", "자[^가-힣]*지", "존[^가-힣]*나", "좆|죶", "지랄", "창[^가-힣]*(녀|년|놈)", "fuck", "sex" ].join('|'), "g");

var ws, rws;
var $stage;
var $sound = {};
var $_sound = {}; // 현재 재생 중인 것들
var $data = {};
var $lib = { Classic: {}, Jaqwi: {}, Crossword: {}, Typing: {}, Hunmin: {}, Daneo: {}, Sock: {} };
var $rec;
var mobile;

var audioContext = window.hasOwnProperty("AudioContext") ? (new AudioContext()) : false;
var _WebSocket = window['WebSocket'];
var _setInterval = setInterval;
var _setTimeout = setTimeout;
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
	var i;
	
	$data.PUBLIC = $("#PUBLIC").html() == "true";
	$data.URL = $("#URL").html();
	$data.version = $("#version").html();
	$data.server = location.href.match(/\?.*server=(\d+)/)[1];
	$data.shop = {};
	$data._okg = 0;
	$data._playTime = 0;
	$data._kd = "";
	$data._timers = [];
	$data._obtain = [];
	$data._wblock = {};
	$data._shut = {};
	$data.usersR = {};
	EXP.push(getRequiredScore(1));
	for(i=2; i<MAX_LEVEL; i++){
		EXP.push(EXP[i-2] + getRequiredScore(i));
	}
	EXP[MAX_LEVEL - 1] = Infinity;
	EXP.push(Infinity);
	$stage = {
		loading: $("#Loading"),
		lobby: {
			userListTitle: $(".UserListBox .product-title"),
			userList: $(".UserListBox .product-body"),
			roomListTitle: $(".RoomListBox .product-title"),
			roomList: $(".RoomListBox .product-body"),
			createBanner: $("<div>").addClass("rooms-item rooms-create").append($("<div>").html(L['newRoom']))
		},
		chat: $("#Chat"),
		chatLog: $("#chat-log-board"),
		talk: $("#Talk"),
		chatBtn: $("#ChatBtn"),
		menu: {
			help: $("#HelpBtn"),
			setting: $("#SettingBtn"),
			community: $("#CommunityBtn"),
			newRoom: $("#NewRoomBtn"),
			setRoom: $("#SetRoomBtn"),
			quickRoom: $("#QuickRoomBtn"),
			spectate: $("#SpectateBtn"),
			shop: $("#ShopBtn"),
			dict: $("#DictionaryBtn"),
			wordPlus: $("#WordPlusBtn"),
			invite: $("#InviteBtn"),
			practice: $("#PracticeBtn"),
			ready: $("#ReadyBtn"),
			start: $("#StartBtn"),
			exit: $("#ExitBtn"),
			notice: $("#NoticeBtn"),
			replay: $("#ReplayBtn"),
			leaderboard: $("#LeaderboardBtn")
		},
		dialog: {
			setting: $("#SettingDiag"),
				settingServer: $("#setting-server"),
				settingOK: $("#setting-ok"),
			community: $("#CommunityDiag"),
				commFriends: $("#comm-friends"),
				commFriendAdd: $("#comm-friend-add"),
			room: $("#RoomDiag"),
				roomOK: $("#room-ok"),
			quick: $("#QuickDiag"),
				quickOK: $("#quick-ok"),
			result: $("#ResultDiag"),
				resultOK: $("#result-ok"),
				resultSave: $("#result-save"),
			practice: $("#PracticeDiag"),
				practiceOK: $("#practice-ok"),
			dict: $("#DictionaryDiag"),
				dictInjeong: $("#dict-injeong"),
				dictSearch: $("#dict-search"),
			wordPlus: $("#WordPlusDiag"),
				wordPlusOK: $("#wp-ok"),
			invite: $("#InviteDiag"),
				inviteList: $(".invite-board"),
				inviteRobot: $("#invite-robot"),
			roomInfo: $("#RoomInfoDiag"),
				roomInfoJoin: $("#room-info-join"),
			profile: $("#ProfileDiag"),
				profileShut: $("#profile-shut"),
				profileHandover: $("#profile-handover"),
				profileKick: $("#profile-kick"),
				profileLevel: $("#profile-level"),
				profileDress: $("#profile-dress"),
				profileWhisper: $("#profile-whisper"),
			kickVote: $("#KickVoteDiag"),
				kickVoteY: $("#kick-vote-yes"),
				kickVoteN: $("#kick-vote-no"),
			purchase: $("#PurchaseDiag"),
				purchaseOK: $("#purchase-ok"),
				purchaseNO: $("#purchase-no"),
			replay: $("#ReplayDiag"),
				replayView: $("#replay-view"),
			leaderboard: $("#LeaderboardDiag"),
				lbTable: $("#ranking tbody"),
				lbPage: $("#lb-page"),
				lbNext: $("#lb-next"),
				lbMe: $("#lb-me"),
				lbPrev: $("#lb-prev"),
			dress: $("#DressDiag"),
				dressOK: $("#dress-ok"),
			charFactory: $("#CharFactoryDiag"),
				cfCompose: $("#cf-compose"),
			injPick: $("#InjPickDiag"),
				injPickAll: $("#injpick-all"),
				injPickNo: $("#injpick-no"),
				injPickOK: $("#injpick-ok"),
			chatLog: $("#ChatLogDiag"),
			obtain: $("#ObtainDiag"),
				obtainOK: $("#obtain-ok"),
			help: $("#HelpDiag")
		},
		box: {
			chat: $(".ChatBox"),
			userList: $(".UserListBox"),
			roomList: $(".RoomListBox"),
			shop: $(".ShopBox"),
			room: $(".RoomBox"),
			game: $(".GameBox"),
			me: $(".MeBox")
		},
		game: {
			display: $(".jjo-display"),
			hints: $(".GameBox .hints"),
			cwcmd: $(".GameBox .cwcmd"),
			bb: $(".GameBox .bb"),
			items: $(".GameBox .items"),
			chain: $(".GameBox .chain"),
			round: $(".rounds"),
			here: $(".game-input").hide(),
			hereText: $("#game-input"),
			history: $(".history"),
			roundBar: $(".jjo-round-time .graph-bar"),
			turnBar: $(".jjo-turn-time .graph-bar")
		},
		yell: $("#Yell").hide(),
		balloons: $("#Balloons")
	};
	if(_WebSocket == undefined){
		loading(L['websocketUnsupport']);
		alert(L['websocketUnsupport']);
		return;
	}
	$data._soundList = [
		{ key: "k", value: "/media/kkutu/k.mp3" },
		{ key: "lobby", value: "/media/kkutu/LobbyBGM.mp3" },
		{ key: "jaqwi", value: "/media/kkutu/JaqwiBGM.mp3" },
		{ key: "jaqwiF", value: "/media/kkutu/JaqwiFastBGM.mp3" },
		{ key: "game_start", value: "/media/kkutu/game_start.mp3" },
		{ key: "round_start", value: "/media/kkutu/round_start.mp3" },
		{ key: "fail", value: "/media/kkutu/fail.mp3" },
		{ key: "timeout", value: "/media/kkutu/timeout.mp3" },
		{ key: "lvup", value: "/media/kkutu/lvup.mp3" },
		{ key: "Al", value: "/media/kkutu/Al.mp3" },
		{ key: "success", value: "/media/kkutu/success.mp3" },
		{ key: "missing", value: "/media/kkutu/missing.mp3" },
		{ key: "mission", value: "/media/kkutu/mission.mp3" },
		{ key: "kung", value: "/media/kkutu/kung.mp3" },
		{ key: "horr", value: "/media/kkutu/horr.mp3" },
	];
	for(i=0; i<=10; i++) $data._soundList.push(
		{ key: "T"+i, value: "/media/kkutu/T"+i+".mp3" },
		{ key: "K"+i, value: "/media/kkutu/K"+i+".mp3" },
		{ key: "As"+i, value: "/media/kkutu/As"+i+".mp3" }
	);
	loadSounds($data._soundList, function(){
		processShop(connect);
	});
	delete $data._soundList;
	
	MOREMI_PART = $("#MOREMI_PART").html().split(',');
	AVAIL_EQUIP = $("#AVAIL_EQUIP").html().split(',');
	RULE = JSON.parse($("#RULE").html());
	OPTIONS = JSON.parse($("#OPTIONS").html());
	MODE = Object.keys(RULE);
	mobile = $("#mobile").html() == "true";
	if(mobile) TICK = 200;
	$data._timePercent = false ? function(){
		return $data._turnTime / $data.turnTime * 100 + "%";
	} : function(){
		var pos = $data._turnSound.audio ? $data._turnSound.audio.currentTime : (audioContext.currentTime - $data._turnSound.startedAt);
		
		return (100 - pos/$data.turnTime*100000) + "%";
	};
	$data.setRoom = function(id, data){
		var isLobby = getOnly() == "for-lobby";
		
		if(data == null){
			delete $data.rooms[id];
			if(isLobby) $("#room-" + id).remove();
		}else{
			// $data.rooms[id] = data;
			if(isLobby && !$data.rooms[id]) $stage.lobby.roomList.append($("<div>").attr('id', "room-" + id));
			$data.rooms[id] = data;
			if(isLobby) $("#room-" + id).replaceWith(roomListBar(data));
		}
		// updateRoomList();
	};
	$data.setUser = function(id, data){
		var only = getOnly();
		var needed = only == "for-lobby" || only == "for-master";
		var $obj;
		
		if($data._replay){
			$rec.users[id] = data;
			return;
		}
		if(data == null){
			delete $data.users[id];
			if(needed) $("#users-item-" + id + ",#invite-item-" + id).remove();
		}else{
			if(needed && !$data.users[id]){
				$obj = userListBar(data, only == "for-master");
				
				if(only == "for-master") $stage.dialog.inviteList.append($obj);
				else $stage.lobby.userList.append($obj);
			}
			$data.users[id] = data;
			if(needed){
				if($obj) $("#" + $obj.attr('id')).replaceWith($obj);
				else $("#" + ((only == "for-lobby") ? "users-item-" : "invite-item") + id).replaceWith(userListBar(data, only == "for-master"));
			}
		}
	};

// 객체 설정
	/*addTimeout(function(){
		$("#intro-start").hide();
		$("#intro").show();
	}, 1400);*/
	$(document).on('paste', function(e){
		if($data.room) if($data.room.gaming){
			e.preventDefault();
			return false;
		}
	});
	$stage.talk.on('drop', function(e){
		if($data.room) if($data.room.gaming){
			e.preventDefault();
			return false;
		}
	});
	$data.opts = $.cookie('kks');
	if($data.opts){
		applyOptions(JSON.parse($data.opts));
	}
	$(".dialog-head .dialog-title").on('mousedown', function(e){
		var $pd = $(e.currentTarget).parents(".dialog");
		
		$(".dialog-front").removeClass("dialog-front");
		$pd.addClass("dialog-front");
		startDrag($pd, e.pageX, e.pageY);
	}).on('mouseup', function(e){
		stopDrag();
	});
	// addInterval(checkInput, 1);
	$stage.chatBtn.on('click', function(e){
		checkInput();
		
		var value = (mobile && $stage.game.here.is(':visible'))
			? $stage.game.hereText.val()
			: $stage.talk.val();
		var o = { value: value };
		if(!value) return;
		if(o.value[0] == "/"){
			o.cmd = o.value.split(" ");
			runCommand(o.cmd);
		}else{
			if($stage.game.here.is(":visible") || $data._relay){
				o.relay = true;
			}
			send('talk', o);
		}
		if($data._whisper){
			$stage.talk.val("/e " + $data._whisper + " ");
			delete $data._whisper;
		}else{
			$stage.talk.val("");
		}
		$stage.game.hereText.val("");
	}).hotkey($stage.talk, 13).hotkey($stage.game.hereText, 13);
	$("#cw-q-input").on('keydown', function(e){
		if(e.keyCode == 13){
			var $target = $(e.currentTarget);
			var value = $target.val();
			var o = { relay: true, data: $data._sel, value: value };
			
			if(!value) return;
			send('talk', o);
			$target.val("");
		}
	}).on('focusout', function(e){
		$(".cw-q-body").empty();
		$stage.game.cwcmd.css('opacity', 0);
	});
	$("#room-limit").on('change', function(e){
		var $target = $(e.currentTarget);
		var value = $target.val();
		
		if(value < 2 || value > 8){
			$target.css('color', "#FF4444");
		}else{
			$target.css('color', "");
		}
	});
	$("#room-round").on('change', function(e){
		var $target = $(e.currentTarget);
		var value = $target.val();
		
		if(value < 1 || value > 10){
			$target.css('color', "#FF4444");
		}else{
			$target.css('color', "");
		}
	});
	$stage.game.here.on('click', function(e){
		mobile || $stage.talk.focus();
	});
	$stage.talk.on('keyup', function(e){
		$stage.game.hereText.val($stage.talk.val());
	});
	$(window).on('beforeunload', function(e){
		if($data.room) return L['sureExit'];
	});
	function startDrag($diag, sx, sy){
		var pos = $diag.position();
		$(window).on('mousemove', function(e){
			var dx = e.pageX - sx, dy = e.pageY - sy;
			
			$diag.css('left', pos.left + dx);
			$diag.css('top', pos.top + dy);
		});
	}
	function stopDrag($diag){
		$(window).off('mousemove');
	}
	$(".result-me-gauge .graph-bar").addClass("result-me-before-bar");
	$(".result-me-gauge")
		.append($("<div>").addClass("graph-bar result-me-current-bar"))
		.append($("<div>").addClass("graph-bar result-me-bonus-bar"));
// 메뉴 버튼
	for(i in $stage.dialog){
		if($stage.dialog[i].children(".dialog-head").hasClass("no-close")) continue;
		
		$stage.dialog[i].children(".dialog-head").append($("<div>").addClass("closeBtn").on('click', function(e){
			$(e.currentTarget).parent().parent().hide();
		}).hotkey(false, 27));
	}
	$stage.menu.help.on('click', function(e){
		$("#help-board").attr('src', "/help");
		showDialog($stage.dialog.help);
	});
	$stage.menu.setting.on('click', function(e){
		showDialog($stage.dialog.setting);
	});
	$stage.menu.community.on('click', function(e){
		if($data.guest) return fail(451);
		showDialog($stage.dialog.community);
	});
	$stage.dialog.commFriendAdd.on('click', function(e){
		var id = prompt(L['friendAddNotice']);
		
		if(!id) return;
		if(!$data.users[id]) return fail(450);
		
		send('friendAdd', { target: id }, true);
	});
	$stage.menu.newRoom.on('click', function(e){
		var $d;
		
		$stage.dialog.quick.hide();
		
		$data.typeRoom = 'enter';
		showDialog($d = $stage.dialog.room);
		$d.find(".dialog-title").html(L['newRoom']);
	});
	$stage.menu.setRoom.on('click', function(e){
		var $d;
		var rule = RULE[MODE[$data.room.mode]];
		var i, k;
		
		$data.typeRoom = 'setRoom';
		$("#room-title").val($data.room.title);
		$("#room-limit").val($data.room.limit);
		$("#room-mode").val($data.room.mode).trigger('change');
		$("#room-round").val($data.room.round);
		$("#room-time").val($data.room.time / rule.time);
		for(i in OPTIONS){
			k = OPTIONS[i].name.toLowerCase();
			$("#room-" + k).attr('checked', $data.room.opts[k]);
		}
		$data._injpick = $data.room.opts.injpick;
		showDialog($d = $stage.dialog.room);
		$d.find(".dialog-title").html(L['setRoom']);
	});
	function updateGameOptions(opts, prefix){
		var i, k;
		
		for(i in OPTIONS){
			k = OPTIONS[i].name.toLowerCase();
			if(opts.indexOf(i) == -1) $("#" + prefix + "-" + k + "-panel").hide();
			else $("#" + prefix + "-" + k + "-panel").show();
		}
	}
	function getGameOptions(prefix){
		var i, name, opts = {};
		
		for(i in OPTIONS){
			name = OPTIONS[i].name.toLowerCase();
			
			if($("#" + prefix + "-" + name).is(':checked')) opts[name] = true;
		}
		return opts;
	}
	function isRoomMatched(room, mode, opts, all){
		var i;
		
		if(!all){
			if(room.gaming) return false;
			if(room.password) return false;
			if(room.players.length >= room.limit) return false;
		}
		if(room.mode != mode) return false;
		for(i in opts) if(!room.opts[i]) return false;
		return true;
	}
	$("#quick-mode, #QuickDiag .game-option").on('change', function(e){
		var val = $("#quick-mode").val();
		var ct = 0;
		var i, opts;
		
		if(e.currentTarget.id == "quick-mode"){
			$("#QuickDiag .game-option").prop('checked', false);
		}
		opts = getGameOptions('quick');
		updateGameOptions(RULE[MODE[val]].opts, 'quick');
		for(i in $data.rooms){
			if(isRoomMatched($data.rooms[i], val, opts, true)) ct++;
		}
		$("#quick-status").html(L['quickStatus'] + " " + ct);
	});
	$stage.menu.quickRoom.on('click', function(e){
		$stage.dialog.room.hide();
		showDialog($stage.dialog.quick);
		if($stage.dialog.quick.is(':visible')){
			$("#QuickDiag>.dialog-body").find("*").prop('disabled', false);
			$("#quick-mode").trigger('change');
			$("#quick-queue").html("");
			$stage.dialog.quickOK.removeClass("searching").html(L['OK']);
		}
	});
	$stage.dialog.quickOK.on('click', function(e){
		var mode = $("#quick-mode").val();
		var opts = getGameOptions('quick');
		
		if(getOnly() != "for-lobby") return;
		if($stage.dialog.quickOK.hasClass("searching")){
			$stage.dialog.quick.hide();
			quickTick();
			$stage.menu.quickRoom.trigger('click');
			return;
		}
		$("#QuickDiag>.dialog-body").find("*").prop('disabled', true);
		$stage.dialog.quickOK.addClass("searching").html("<i class='fa fa-spinner fa-spin'></i> " + L['NO']).prop('disabled', false);
		$data._quickn = 0;
		$data._quickT = addInterval(quickTick, 1000);
		function quickTick(){
			var i, arr = [];
			
			if(!$stage.dialog.quick.is(':visible')){
				clearTimeout($data._quickT);
				return;
			}
			$("#quick-queue").html(L['quickQueue'] + " " + prettyTime($data._quickn++ * 1000));
			for(i in $data.rooms){
				if(isRoomMatched($data.rooms[i], mode, opts)) arr.push(i);
			}
			if(arr.length){
				i = arr[Math.floor(Math.random() * arr.length)];
				$data._preQuick = true;
				$("#room-" + i).trigger('click');
			}
		}
	});
	$("#room-mode").on('change', function(e){
		var v = $("#room-mode").val();
		var rule = RULE[MODE[v]];
		$("#game-mode-expl").html(L['modex' + v]);

		updateGameOptions(rule.opts, 'room');
		
		$data._injpick = [];
		if(rule.opts.indexOf("ijp") != -1) $("#room-injpick-panel").show();
		else $("#room-injpick-panel").hide();
		if(rule.rule == "Typing") $("#room-round").val(3);
		$("#room-time").children("option").each(function(i, o){
			$(o).html(Number($(o).val()) * rule.time + L['SECOND']);
		});
	}).trigger('change');
	$stage.menu.spectate.on('click', function(e){
		var mode = $stage.menu.spectate.hasClass("toggled");
		
		if(mode){
			send('form', { mode: "J" });
			$stage.menu.spectate.removeClass("toggled");
		}else{
			send('form', { mode: "S" });
			$stage.menu.spectate.addClass("toggled");
		}
	});
	$stage.menu.shop.on('click', function(e){
		if($data._shop = !$data._shop){
			loadShop();
			$stage.menu.shop.addClass("toggled");
		}else{
			$stage.menu.shop.removeClass("toggled");
		}
		updateUI();
	});
	$(".shop-type").on('click', function(e){
		var $target = $(e.currentTarget);
		var type = $target.attr('id').slice(10);
		
		$(".shop-type.selected").removeClass("selected");
		$target.addClass("selected");
		
		filterShop(type == 'all' || $target.attr('value'));
	});
	$stage.menu.dict.on('click', function(e){
		showDialog($stage.dialog.dict);
	});
	$stage.menu.wordPlus.on('click', function(e){
		showDialog($stage.dialog.wordPlus);
	});
	$stage.menu.invite.on('click', function(e){
		showDialog($stage.dialog.invite);
		updateUserList(true);
	});
	$stage.menu.practice.on('click', function(e){
		if(RULE[MODE[$data.room.mode]].ai){
			$("#PracticeDiag .dialog-title").html(L['practice']);
			$("#ai-team").val(0).prop('disabled', true);
			showDialog($stage.dialog.practice);
		}else{
			send('practice', { level: -1 });
		}
	});
	$stage.menu.ready.on('click', function(e){
		send('ready');
	});
	$stage.menu.start.on('click', function(e){
		send('start');
	});
	$stage.menu.exit.on('click', function(e){
		if($data.room.gaming){
			if(!confirm(L['sureExit'])) return;
			clearGame();
		}
		send('leave');
	});
	$stage.menu.replay.on('click', function(e){
		if($data._replay){
			replayStop();
		}
		showDialog($stage.dialog.replay);
		initReplayDialog();
		if($stage.dialog.replay.is(':visible')){
			$("#replay-file").trigger('change');
		}
	});
	$stage.menu.leaderboard.on('click', function(e){
		$data._lbpage = 0;
		if($stage.dialog.leaderboard.is(":visible")){
			$stage.dialog.leaderboard.hide();
		}else $.get("/ranking", function(res){
			drawLeaderboard(res);
			showDialog($stage.dialog.leaderboard);
		});
	});
	$stage.dialog.lbPrev.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/ranking?p=" + ($data._lbpage - 1), function(res){
			drawLeaderboard(res);
		});
	});
	$stage.dialog.lbMe.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/ranking?id=" + $data.id, function(res){
			drawLeaderboard(res);
		});
	});
	$stage.dialog.lbNext.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/ranking?p=" + ($data._lbpage + 1), function(res){
			drawLeaderboard(res);
		});
	});
	$stage.dialog.settingServer.on('click', function(e){
		location.href = "/";
	});
	$stage.dialog.settingOK.on('click', function(e){
		applyOptions({
			mb: $("#mute-bgm").is(":checked"),
			me: $("#mute-effect").is(":checked"),
			di: $("#deny-invite").is(":checked"),
			dw: $("#deny-whisper").is(":checked"),
			df: $("#deny-friend").is(":checked"),
			ar: $("#auto-ready").is(":checked"),
			su: $("#sort-user").is(":checked"),
			ow: $("#only-waiting").is(":checked"),
			ou: $("#only-unlock").is(":checked")
		});
		$.cookie('kks', JSON.stringify($data.opts));
		$stage.dialog.setting.hide();
	});
	$stage.dialog.profileLevel.on('click', function(e){
		$("#PracticeDiag .dialog-title").html(L['robot']);
		$("#ai-team").prop('disabled', false);
		showDialog($stage.dialog.practice);
	});
	$stage.dialog.practiceOK.on('click', function(e){
		var level = $("#practice-level").val();
		var team = $("#ai-team").val();
		
		$stage.dialog.practice.hide();
		if($("#PracticeDiag .dialog-title").html() == L['robot']){
			send('setAI', { target: $data._profiled, level: level, team: team });
		}else{
			send('practice', { level: level });
		}
	});
	$stage.dialog.roomOK.on('click', function(e){
		var i, k, opts = {
			injpick: $data._injpick
		};
		for(i in OPTIONS){
			k = OPTIONS[i].name.toLowerCase();
			opts[k] = $("#room-" + k).is(':checked');
		}
		send($data.typeRoom, {
			title: $("#room-title").val().trim() || $("#room-title").attr('placeholder').trim(),
			password: $("#room-pw").val(),
			limit: $("#room-limit").val(),
			mode: $("#room-mode").val(),
			round: $("#room-round").val(),
			time: $("#room-time").val(),
			opts: opts,
		});
		$stage.dialog.room.hide();
	});
	$stage.dialog.resultOK.on('click', function(e){
		if($data._resultPage == 1 && $data._resultRank){
			drawRanking($data._resultRank[$data.id]);
			return;
		}
		if($data.practicing){
			$data.room.gaming = true;
			send('leave');
		}
		$data.resulting = false;
		$stage.dialog.result.hide();
		delete $data._replay;
		delete $data._resultRank;
		$stage.box.room.height(360);
		playBGM('lobby');
		forkChat();
		updateUI();
	});
	$stage.dialog.resultSave.on('click', function(e){
		var date = new Date($rec.time);
		var blob = new Blob([ JSON.stringify($rec) ], { type: "text/plain" });
		var url = URL.createObjectURL(blob);
		var fileName = "KKuTu" + (
			date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " "
			+ date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
		) + ".kkt";
		var $a = $("<a>").attr({
			'download': fileName,
			'href': url
		}).on('click', function(e){
			$a.remove();
		});
		$("#Jungle").append($a);
		$a[0].click();
	});
	$stage.dialog.dictInjeong.on('click', function(e){
		var $target = $(e.currentTarget);
		
		if($target.is(':disabled')) return;
		if(!$("#dict-theme").val()) return;
		$target.prop('disabled', true);
		$("#dict-output").html(L['searching']);
		$.get("/injeong/" + $("#dict-input").val() + "?theme=" + $("#dict-theme").val(), function(res){
			addTimeout(function(){
				$target.prop('disabled', false);
			}, 2000);
			if(res.error) return $("#dict-output").html(res.error + ": " + L['wpFail_' + res.error]);
			
			$("#dict-output").html(L['wpSuccess'] + "(" + res.message + ")");
		});
	});
	$stage.dialog.dictSearch.on('click', function(e){
		var $target = $(e.currentTarget);
		
		if($target.is(':disabled')) return;
		$target.prop('disabled', true);
		$("#dict-output").html(L['searching']);
		tryDict($("#dict-input").val(), function(res){
			addTimeout(function(){
				$target.prop('disabled', false);
			}, 500);
			if(res.error) return $("#dict-output").html(res.error + ": " + L['wpFail_' + res.error]);
			
			$("#dict-output").html(processWord(res.word, res.mean, res.theme, res.type.split(',')));
		});
	}).hotkey($("#dict-input"), 13);
	$stage.dialog.wordPlusOK.on('click', function(e){
		var t;
		if($stage.dialog.wordPlusOK.hasClass("searching")) return;
		if(!(t = $("#wp-input").val())) return;
		t = t.replace(/[^a-z가-힣]/g, "");
		if(t.length < 2) return;
		
		$("#wp-input").val("");
		$(e.currentTarget).addClass("searching").html("<i class='fa fa-spin fa-spinner'></i>");
		send('wp', { value: t });
	}).hotkey($("#wp-input"), 13);
	$stage.dialog.inviteRobot.on('click', function(e){
		requestInvite("AI");
	});
	$stage.box.me.on('click', function(e){
		requestProfile($data.id);
	});
	$stage.dialog.roomInfoJoin.on('click', function(e){
		$stage.dialog.roomInfo.hide();
		tryJoin($data._roominfo);
	});
	$stage.dialog.profileHandover.on('click', function(e){
		if(!confirm(L['sureHandover'])) return;
		send('handover', { target: $data._profiled });
	});
	$stage.dialog.profileKick.on('click', function(e){
		send('kick', { robot: $data.robots.hasOwnProperty($data._profiled), target: $data._profiled });
	});
	$stage.dialog.profileShut.on('click', function(e){
		var o = $data.users[$data._profiled];
		
		if(!o) return;
		toggleShutBlock(o.profile.title || o.profile.name);
	});
	$stage.dialog.profileWhisper.on('click', function(e){
		var o = $data.users[$data._profiled];
		
		$stage.talk.val("/e " + (o.profile.title || o.profile.name).replace(/\s/g, "") + " ").focus();
	});
	$stage.dialog.profileDress.on('click', function(e){
		// alert(L['error_555']);
		if($data.guest) return fail(421);
		if($data._gaming) return fail(438);
		if(showDialog($stage.dialog.dress)) $.get("/box", function(res){
			if(res.error) return fail(res.error);
			
			$data.box = res;
			drawMyDress();
		});
	});
	$stage.dialog.dressOK.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.post("/exordial", { data: $("#dress-exordial").val() }, function(res){
			$stage.dialog.dressOK.attr('disabled', false);
			if(res.error) return fail(res.error);
			
			$stage.dialog.dress.hide();
		});
	});
	$("#DressDiag .dress-type").on('click', function(e){
		var $target = $(e.currentTarget);
		var type = $target.attr('id').slice(11);
		
		$(".dress-type.selected").removeClass("selected");
		$target.addClass("selected");
		
		drawMyGoods(type == 'all' || $target.attr('value'));
	});
	$("#dress-cf").on('click', function(e){
		if($data._gaming) return fail(438);
		if(showDialog($stage.dialog.charFactory)) drawCharFactory();
	});
	$stage.dialog.cfCompose.on('click', function(e){
		if(!$stage.dialog.cfCompose.hasClass("cf-composable")) return fail(436);
		if(!confirm(L['cfSureCompose'])) return;
		
		$.post("/cf", { tray: $data._tray.join('|') }, function(res){
			var i;
			
			if(res.error) return fail(res.error);
			send('refresh');
			alert(L['cfComposed']);
			$data.users[$data.id].money = res.money;
			$data.box = res.box;
			for(i in res.gain) queueObtain(res.gain[i]);
			
			drawMyDress($data._avGroup);
			updateMe();
			drawCharFactory();
		});
	});
	$("#room-injeong-pick").on('click', function(e){
		var rule = RULE[MODE[$("#room-mode").val()]];
		var i;
		
		$("#injpick-list>div").hide();
		if(rule.lang == "ko"){
			$data._ijkey = "#ko-pick-";
			$("#ko-pick-list").show();
		}else if(rule.lang == "en"){
			$data._ijkey = "#en-pick-";
			$("#en-pick-list").show();
		}
		$stage.dialog.injPickNo.trigger('click');
		for(i in $data._injpick){
			$($data._ijkey + $data._injpick[i]).prop('checked', true);
		}
		showDialog($stage.dialog.injPick);
	});
	$stage.dialog.injPickAll.on('click', function(e){
		$("#injpick-list input").prop('checked', true);
	});
	$stage.dialog.injPickNo.on('click', function(e){
		$("#injpick-list input").prop('checked', false);
	});
	$stage.dialog.injPickOK.on('click', function(e){
		var $target = $($data._ijkey + "list");
		var list = [];
		
		$data._injpick = $target.find("input").each(function(i, o){
			var $o = $(o);
			var id = $o.attr('id').slice(8);
			
			if($o.is(':checked')) list.push(id);
		});
		$data._injpick = list;
		$stage.dialog.injPick.hide();
	});
	$stage.dialog.kickVoteY.on('click', function(e){
		send('kickVote', { agree: true });
		clearTimeout($data._kickTimer);
		$stage.dialog.kickVote.hide();
	});
	$stage.dialog.kickVoteN.on('click', function(e){
		send('kickVote', { agree: false });
		clearTimeout($data._kickTimer);
		$stage.dialog.kickVote.hide();
	});
	$stage.dialog.purchaseOK.on('click', function(e){
		$.post("/buy/" + $data._sgood, function(res){
			var my = $data.users[$data.id];
			
			if(res.error) return fail(res.error);
			alert(L['purchased']);
			my.money = res.money;
			my.box = res.box;
			updateMe();
		});
		$stage.dialog.purchase.hide();
	});
	$stage.dialog.purchaseNO.on('click', function(e){
		$stage.dialog.purchase.hide();
	});
	$stage.dialog.obtainOK.on('click', function(e){
		var obj = $data._obtain.shift();
		
		if(obj) drawObtain(obj);
		else $stage.dialog.obtain.hide();
	});
	for(i=0; i<5; i++) $("#team-" + i).on('click', onTeam);
	function onTeam(e){
		if($(".team-selector").hasClass("team-unable")) return;
		
		send('team', { value: $(e.currentTarget).attr('id').slice(5) });
	}
// 리플레이
	function initReplayDialog(){
		$stage.dialog.replayView.attr('disabled', true);
	}
	$("#replay-file").on('change', function(e){
		var file = e.target.files[0];
		var reader = new FileReader();
		var $date = $("#replay-date").html("-");
		var $version = $("#replay-version").html("-");
		var $players = $("#replay-players").html("-");
	
		$rec = false;
		$stage.dialog.replayView.attr('disabled', true);
		if(!file) return;
		reader.readAsText(file);
		reader.onload = function(e){
			var i, data;
			
			try{
				data = JSON.parse(e.target.result);
				$date.html((new Date(data.time)).toLocaleString());
				$version.html(data.version);
				$players.empty();
				for(i in data.players){
					var u = data.players[i];
					var $p;
					
					$players.append($p = $("<div>").addClass("replay-player-bar ellipse")
						.html(u.title)
						.prepend(getLevelImage(u.data.score).addClass("users-level"))
					);
					if(u.id == data.me) $p.css('font-weight', "bold");
				}
				$rec = data;
				$stage.dialog.replayView.attr('disabled', false);
			}catch(ex){
				console.warn(ex);
				return alert(L['replayError']);
			}
		};
	});
	$stage.dialog.replayView.on('click', function(e){
		replayReady();
	});
	
// 스팸
	addInterval(function(){
		if(spamCount > 0) spamCount = 0;
		else if(spamWarning > 0) spamWarning -= 0.03;
	}, 1000);

// 웹소켓 연결
	function connect(){
		ws = new _WebSocket($data.URL);
		ws.onopen = function(e){
			loading();
			/*if($data.PUBLIC && mobile) $("#ad").append($("<ins>").addClass("daum_ddn_area")
				.css({ 'display': "none", 'margin-top': "10px", 'width': "100%" })
				.attr({
					'data-ad-unit': "DAN-1ib8r0w35a0qb",
					'data-ad-media': "4I8",
					'data-ad-pubuser': "3iI",
					'data-ad-type': "A",
					'data-ad-width': "320",
					'data-ad-height': "100"
				})
			).append($("<script>")
				.attr({
					'type': "text/javascript",
					'src': "//t1.daumcdn.net/adfit/static/ad.min.js"
				})
			);*/
		};
		ws.onmessage = _onMessage = function(e){
			onMessage(JSON.parse(e.data));
		};
		ws.onclose = function(e){
			var ct = L['closed'] + " (#" + e.code + ")";
			
			if(rws) rws.close();
			stopAllSounds();
			alert(ct);
			$.get("/kkutu_notice.html", function(res){
				loading(res);
			});
		};
		ws.onerror = function(e){
			console.warn(L['error'], e);
		};
	}
});

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

$lib.Classic.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html(getCharText(data.char, data.subChar));
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	if(MODE[$data.room.mode] == "KAP"){
		$(".jjoDisplayBar .graph-bar").css({ 'float': "right", 'text-align': "left" });
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.Classic.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	if(!($data._tid = $data.room.game.seq[data.turn])) return;
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char = getCharText(data.char, data.subChar, data.wordLength));
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Classic.turnGoing = function(){
	if(!$data.room) clearInterval($data._tTime);
	$data._turnTime -= TICK;
	$data._roundTime -= TICK;
	
	$stage.game.turnBar
		.width($data._timePercent())
		.html(($data._turnTime*0.001).toFixed(1) + L['SECOND']);
	$stage.game.roundBar
		.width($data._roundTime/$data.room.time*0.1 + "%")
		.html(($data._roundTime*0.001).toFixed(1) + L['SECOND']);
	
	if(!$stage.game.roundBar.hasClass("round-extreme")) if($data._roundTime <= 5000) $stage.game.roundBar.addClass("round-extreme");
};
$lib.Classic.turnEnd = function(id, data){
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	if($data._turnSound) $data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		checkFailCombo();
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		checkFailCombo(id);
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		if(MODE[$data.room.mode] == "KAP") $stage.game.display.empty()
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(0, hi)))
			.append($("<label>").html(data.hint.slice(hi)));
		else $stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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

$lib.Jaqwi.roundReady = function(data){
	var tv = L['jqTheme'] + ": " + L['theme_' + data.theme];
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 10000;
	$stage.game.display.html(tv);
	$stage.game.items.hide();
	$stage.game.hints.show();
	$(".jjo-turn-time .graph-bar")
		.width("100%")
		.html(tv)
		.css('text-align', "center");
	drawRound(data.round);
	playSound('round_start');
	clearInterval($data._tTime);
};
$lib.Jaqwi.turnStart = function(data){
	$(".game-user-current").removeClass("game-user-current");
	$(".game-user-bomb").removeClass("game-user-bomb");
	if($data.room.game.seq.indexOf($data.id) >= 0) $stage.game.here.show();
	$stage.game.display.html($data._char = data.char);
	clearInterval($data._tTime);
	$data._tTime = addInterval(turnGoing, TICK);
	playBGM('jaqwi');
};
$lib.Jaqwi.turnGoing = function(){
	var $rtb = $stage.game.roundBar;
	var bRate;
	var tt;
	
	if(!$data.room) clearInterval($data._tTime);
	$data._roundTime -= TICK;
	
	tt = $data._spectate ? L['stat_spectate'] : ($data._roundTime*0.001).toFixed(1) + L['SECOND'];
	$rtb
		.width($data._roundTime/$data.room.time*0.1 + "%")
		.html(tt);
		
	if(!$rtb.hasClass("round-extreme")) if($data._roundTime <= $data._fastTime){
		bRate = $data.bgm.currentTime / $data.bgm.duration;
		if($data.bgm.paused) stopBGM();
		else playBGM('jaqwiF');
		$data.bgm.currentTime = $data.bgm.duration * bRate;
		$rtb.addClass("round-extreme");
	}
};
$lib.Jaqwi.turnHint = function(data){
	playSound('mission');
	pushHint(data.hint);
};
$lib.Jaqwi.turnEnd = function(id, data){
	var $sc = $("<div>").addClass("deltaScore").html("+" + data.score);
	var $uc = $("#game-user-" + id);

	if(data.giveup){
		$uc.addClass("game-user-bomb");
	}else if(data.answer){
		$stage.game.here.hide();
		$stage.game.display.html($("<label>").css('color', "#FFFF44").html(data.answer));
		stopBGM();
		playSound('horr');
	}else{
		// if(data.mean) turnHint(data);
		if(id == $data.id) $stage.game.here.hide();
		addScore(id, data.score);
		if($data._roundTime > 10000) $data._roundTime = 10000;
		drawObtainedScore($uc, $sc);
		updateScore(id, getScore(id)).addClass("game-user-current");
		playSound('success');
	}
};

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

$lib.Crossword.roundReady = function(data, spec){
	var turn = data.seq ? data.seq.indexOf($data.id) : -1;
	
	clearBoard();
	$(".jjoriping,.rounds,.game-body").addClass("cw");
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 30000;
	$data.selectedRound = (turn == -1) ? 1 : (turn % $data.room.round + 1);
	$stage.game.items.hide();
	$stage.game.cwcmd.show().css('opacity', 0);
	drawRound($data.selectedRound);
	if(!spec) playSound('round_start');
	clearInterval($data._tTime);
};
$lib.Crossword.turnEnd = function(id, data){
	var $sc = $("<div>").addClass("deltaScore").html("+" + data.score);
	var $uc = $("#game-user-" + id);
	var $cr;
	var key;
	
	if(data.score){
		key = data.pos.join(',');
		if(id == $data.id){
			$stage.game.cwcmd.css('opacity', 0);
			playSound('success');
		}else{
			if($data._sel) if(data.pos.join(',') == $data._sel.join(',')) $stage.game.cwcmd.css('opacity', 0);
			playSound('mission');
		}
		$data._bdb[key][4] = data.value;
		$data._bdb[key][5] = id;
		if(data.pos[0] == $data.selectedRound - 1) $lib.Crossword.drawDisplay();
		else{
			$cr = $($stage.game.round.children("label").get(data.pos[0])).addClass("round-effect");
			addTimeout(function(){ $cr.removeClass("round-effect"); }, 800);
		}
		addScore(id, data.score);
		updateScore(id, getScore(id));
		drawObtainedScore($uc, $sc);
	}else{
		stopBGM();
		$stage.game.round.empty();
		playSound('horr');
	}
};
$lib.Crossword.drawDisplay = function(){
	var CELL = 100 / 8;
	var board = $data._boards[$data.selectedRound - 1];
	var $pane = $stage.game.display.empty();
	var $bar;
	var i, j, x, y, vert, len, word, key;
	var $w = {};
	
	for(i in board){
		x = Number(board[i][0]);
		y = Number(board[i][1]);
		vert = board[i][2] == "1";
		len = Number(board[i][3]);
		word = board[i][4];
		$pane.append($bar = $("<div>").addClass("cw-bar")
			.attr('id', "cw-" + x + "-" + y + "-" + board[i][2])
			.css({
				top: y * CELL + "%", left: x * CELL + "%",
				width: (vert ? 1 : len) * CELL + "%",
				height: (vert ? len : 1) * CELL + "%"
			})
		);
		if(word) $bar.addClass("cw-open");
		if(board[i][5] == $data.id) $bar.addClass("cw-my-open");
		else $bar.on('click', $lib.Crossword.onBar).on('mouseleave', $lib.Crossword.onSwap);
		for(j=0; j<len; j++){
			key = x + "-" + y;
			
			if(word) $w[key] = word.charAt(j);
			$bar.append($("<div>").addClass("cw-cell")
				.attr('id', "cwc-" + key)
				.html($w[key] || "")
			);
			if(vert) y++; else x++;
		}
	}
};
$lib.Crossword.onSwap = function(e){
	$stage.game.display.prepend($(e.currentTarget));
};
$lib.Crossword.onRound = function(e){
	var round = $(e.currentTarget).html().charCodeAt(0) - 9311;
	
	drawRound($data.selectedRound = round);
	$(".rounds label").on('click', $lib.Crossword.onRound);
	$lib.Crossword.drawDisplay();
};
$lib.Crossword.onBar = function(e){
	var $bar = $(e.currentTarget);
	var pos = $bar.attr('id').slice(3).split('-');
	var data = $data._means[$data.selectedRound - 1][pos.join(',')];
	var vert = data.dir == "1";
	
	$stage.game.cwcmd.css('opacity', 1);
	$data._sel = [ $data.selectedRound - 1, pos[0], pos[1], pos[2] ];
	$(".cw-q-head").html(L[vert ? 'cwVert' : 'cwHorz'] + data.len + L['cwL']);
	$("#cw-q-input").val("").focus();
	$(".cw-q-body").html(processWord("★", data.mean, data.theme, data.type.split(',')));
};
$lib.Crossword.turnStart = function(data, spec){
	var i, j;
	
	$data._bdb = {};
	$data._boards = data.boards;
	$data._means = data.means;
	for(i in data.boards){
		for(j in data.boards[i]){
			$data._bdb[[ i, data.boards[i][j][0], data.boards[i][j][1], data.boards[i][j][2] ].join(',')] = data.boards[i][j];
		}
	}
	$(".rounds label").on('click', $lib.Crossword.onRound);
	$lib.Crossword.drawDisplay();
	clearInterval($data._tTime);
	$data._tTime = addInterval(turnGoing, TICK);
	playBGM('jaqwi');
};
$lib.Crossword.turnGoing = $lib.Jaqwi.turnGoing;
$lib.Crossword.turnHint = function(data){
	playSound('fail');
};

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

﻿$lib.Typing.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	$data._chatter = mobile ? $stage.game.hereText : $stage.talk;
	clearBoard();
	$data._round = data.round;
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 10000;
	$data._list = data.list.concat(data.list);
	$data.chain = 0;
	drawList();
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
function onSpace(e){
	if(e.keyCode == 32){
		$stage.chatBtn.trigger('click');
		e.preventDefault();
	}
}
function drawList(){
	var wl = $data._list.slice($data.chain);
	var lv = $data.room.opts.proverb ? 1 : 5;
	var pts = "";
	var w0l = wl[0].length;
	
	if(w0l >= 20) pts = "18px";
	if(w0l >= 50) pts = "15px";
	$stage.game.display.css('font-size', pts);
	wl[0] = "<label style='color: #FFFF44;'>" + wl[0] + "</label>";
	$stage.game.display.html(wl.slice(0, lv).join(' '));
	$stage.game.chain.show().html($data.chain);
	$(".jjo-turn-time .graph-bar")
		.width("100%")
		.html(wl.slice(lv, 2 * lv).join(' '))
		.css({ 'text-align': "center", 'background-color': "#70712D" });
}
$lib.Typing.spaceOn = function(){
	if($data.room.opts.proverb) return;
	$data._spaced = true;
	$("body").on('keydown', "#" + $data._chatter.attr('id'), onSpace);
};
$lib.Typing.spaceOff = function(){
	delete $data._spaced;
	$("body").off('keydown', "#" + $data._chatter.attr('id'), onSpace);
};
$lib.Typing.turnStart = function(data){
	if(!$data._spectate){
		$stage.game.here.show();
		if(mobile) $stage.game.hereText.val("").focus();
		else $stage.talk.val("").focus();
		$lib.Typing.spaceOn();
	}
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._tTime = addInterval(turnGoing, TICK);
	$data._roundTime = data.roundTime;
	playBGM('jaqwi');
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Typing.turnGoing = $lib.Jaqwi.turnGoing;
$lib.Typing.turnEnd = function(id, data){
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html("+" + data.score);
	var $uc = $("#game-user-" + id);
	
	if(data.error){
		$data.chain++;
		drawList();
		playSound('fail');
	}else if(data.ok){
		if($data.id == id){
			$data.chain++;
			drawList();
			playSound('mission');
			pushHistory(data.value, "");
		}else if($data._spectate){
			playSound('mission');
		}
		addScore(id, data.score);
		drawObtainedScore($uc, $sc);
		updateScore(id, getScore(id));
	}else{
		clearInterval($data._tTime);
		$lib.Typing.spaceOff();
		$stage.game.here.hide();
		stopBGM();
		playSound('horr');
		addTimeout(drawSpeed, 1000, data.speed);
		if($data._round < $data.room.round) restGoing(10);
	}
};
function restGoing(rest){
	$(".jjo-turn-time .graph-bar")
		.html(rest + L['afterRun']);
	if(rest > 0) addTimeout(restGoing, 1000, rest - 1);
}
function drawSpeed(table){
	var i;
	
	for(i in table){
		$("#game-user-" + i + " .game-user-score").empty()
			.append($("<div>").css({ 'float': "none", 'color': "#4444FF", 'text-align': "center" }).html(table[i] + "<label style='font-size: 11px;'>" + L['kpm'] + "</label>"));
	}
}

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

$lib.Hunmin.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html($data._char = "&lt;" + data.theme + "&gt;");
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.Hunmin.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	$data._tid = $data.room.game.seq[data.turn];
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char);
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Hunmin.turnGoing = $lib.Classic.turnGoing;
$lib.Hunmin.turnEnd = function(id, data){
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	$data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		$stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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

$lib.Daneo.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html($data._char = "&lt;" + (L['theme_' + data.theme]) + "&gt;");
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.Daneo.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	$data._tid = $data.room.game.seq[data.turn];
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char);
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Daneo.turnGoing = $lib.Classic.turnGoing;
$lib.Daneo.turnEnd = function(id, data){
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	$data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		$stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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

var spamWarning = 0;
var spamCount = 0;
// var smile = 94, tag = 35;

function zeroPadding(num, len){ var s = num.toString(); return "000000000000000".slice(0, Math.max(0, len - s.length)) + s; }
function send(type, data, toMaster){
	var i, r = { type: type };
	var subj = toMaster ? ws : (rws || ws);
	
	for(i in data) r[i] = data[i];
	
	/*if($data._talkValue == r.value){
		if(++$data._sameTalk >= 3) return fail();
	}else $data._sameTalk = 0;
	$data._talkValue = r.value;*/
	
	if(type != "test") if(spamCount++ > 10){
		if(++spamWarning >= 3) return subj.close();
		spamCount = 5;
	}
	subj.send(JSON.stringify(r));
}
function loading(text){
	if(text){
		if($("#Intro").is(':visible')){
			$stage.loading.hide();
			$("#intro-text").html(text);
		}else $stage.loading.show().html(text);
	}else $stage.loading.hide();
}
function showDialog($d, noToggle){
	var size = [ $(window).width(), $(window).height() ];
	
	if(!noToggle && $d.is(":visible")){
		$d.hide();
		return false;
	}else{
		$(".dialog-front").removeClass("dialog-front");
		$d.show().addClass("dialog-front").css({
			'left': (size[0] - $d.width()) * 0.5,
			'top': (size[1] - $d.height()) * 0.5
		});
		return true;
	}
}
function applyOptions(opt){
	$data.opts = opt;
	
	$data.muteBGM = $data.opts.mb;
	$data.muteEff = $data.opts.me;
	
	$("#mute-bgm").attr('checked', $data.muteBGM);
	$("#mute-effect").attr('checked', $data.muteEff);
	$("#deny-invite").attr('checked', $data.opts.di);
	$("#deny-whisper").attr('checked', $data.opts.dw);
	$("#deny-friend").attr('checked', $data.opts.df);
	$("#auto-ready").attr('checked', $data.opts.ar);
	$("#sort-user").attr('checked', $data.opts.su);
	$("#only-waiting").attr('checked', $data.opts.ow);
	$("#only-unlock").attr('checked', $data.opts.ou);
	
	if($data.bgm){
		if($data.muteBGM){
			$data.bgm.volume = 0;
			$data.bgm.stop();
		}else{
			$data.bgm.volume = 1;
			$data.bgm = playBGM($data.bgm.key, true);
		}
	}
}
function checkInput(){
	/*var v = $stage.talk.val();
	var len = v.length;
	
	if($data.room) if($data.room.gaming){
		if(len - $data._kd.length > 3) $stage.talk.val($data._kd);
		if($stage.talk.is(':focus')){
			$data._kd = v;
		}else{
			$stage.talk.val($data._kd);
		}
	}
	$data._kd = v;*/
}
function addInterval(cb, v, a1, a2, a3, a4, a5){
	var R = _setInterval(cb, v, a1, a2, a3, a4, a5);
	
	$data._timers.push(R);
	return R;
}
function addTimeout(cb, v, a1, a2, a3, a4, a5){
	var R = _setTimeout(cb, v, a1, a2, a3, a4, a5);
	
	$data._timers.push(R);
	return R;
}
function clearTrespasses(){ return; // 일단 비활성화
	var jt = [];
	var xStart = $data._xintv || 0;
	var xEnd = _setTimeout(checkInput, 1);
	var rem = 0;
	var i;
	
	for(i in $.timers){
		jt.push($.timers[i].id);
	}
	function censor(id){
		if(jt.indexOf(id) == -1 && $data._timers.indexOf(id) == -1){
			rem++;
			clearInterval(id);
		}
	}
	for(i=0; i<53; i++){
		censor(i);
	}
	for(i=xStart; i<xEnd; i++){
		censor(i);
	}
	$data._xintv = xEnd;
}
function route(func, a0, a1, a2, a3, a4){
	if(!$data.room) return;
	var r = RULE[MODE[$data.room.mode]];
	
	if(!r) return null;
	$lib[r.rule][func].call(this, a0, a1, a2, a3, a4);
}
function connectToRoom(chan, rid){
	var url = $data.URL.replace(/:(\d+)/, function(v, p1){
		return ":" + (Number(p1) + 416 + Number(chan) - 1);
	}) + "&" + chan + "&" + rid;
	
	if(rws) return;
	rws = new _WebSocket(url);
	
	loading(L['connectToRoom'] + "\n<center><button id='ctr-close'>" + L['ctrCancel'] + "</button></center>");
	$("#ctr-close").on('click', function(){
		loading();
		if(rws) rws.close();
	});
	rws.onopen = function(e){
		console.log("room-conn", chan, rid);
	};
	rws.onmessage = _onMessage;
	rws.onclose = function(e){
		console.log("room-disc", chan, rid);
		rws = undefined;
	};
	rws.onerror = function(e){
		console.warn(L['error'], e);
	};
}
function checkAge(){
	if(!confirm(L['checkAgeAsk'])) return send('caj', { answer: "no" }, true);
	
	while(true){
		var input = [], lv = 1;
		
		while(lv <= 3){
			var str = prompt(L['checkAgeInput' + lv]);
			
			if(!str || isNaN(str = Number(str))){
				if(--lv < 1) break; else continue;
			}
			if(lv == 1 && (str < 1000 || str > 2999)){
				alert(str + "\n" + L['checkAgeNo']);
				continue;
			}
			if(lv == 2 && (str < 1 || str > 12)){
				alert(str + "\n" + L['checkAgeNo']);
				continue;
			}
			if(lv == 3 && (str < 1 || str > 31)){
				alert(str + "\n" + L['checkAgeNo']);
				continue;
			}
			input[lv++ - 1] = str;
		}
		if(lv == 4){
			if(confirm(L['checkAgeSure'] + "\n"
			+ input[0] + L['YEAR'] + " "
			+ input[1] + L['MONTH'] + " "
			+ input[2] + L['DATE'])) return send('caj', { answer: "yes", input: [ input[1], input[2], input[0] ] }, true);
		}else{
			if(confirm(L['checkAgeCancel'])) return send('caj', { answer: "no" }, true);
		}
	}
}
function onMessage(data){
	var i;
	var $target;

    switch (data.type) {
        case 'recaptcha':
            var $introText = $("#intro-text");
            $introText.empty();
            $introText.html('게스트는 캡챠 인증이 필요합니다.' +
                '<br/>로그인을 하시면 캡챠 인증을 건너뛰실 수 있습니다.' +
                '<br/><br/>');
            $introText.append($('<div class="g-recaptcha" id="recaptcha" style="display: table; margin: 0 auto;"></div>'));

            grecaptcha.render('recaptcha', {
                'sitekey': data.siteKey,
                'callback': recaptchaCallback
            });
            break;
		case 'welcome':
			$data.id = data.id;
			$data.guest = data.guest;
			$data.admin = data.admin;
			$data.users = data.users;
			$data.robots = {};
			$data.rooms = data.rooms;
			$data.place = 0;
			$data.friends = data.friends;
			$data._friends = {};
			$data._playTime = data.playTime;
			$data._okg = data.okg;
			$data._gaming = false;
			$data.box = data.box;
			if(data.test) alert(L['welcomeTestServer']);
			if(location.hash[1]) tryJoin(location.hash.slice(1));
			updateUI(undefined, true);
			welcome();
			if(data.caj) checkAge();
			updateCommunity();
			break;
		case 'conn':
			$data.setUser(data.user.id, data.user);
			updateUserList();
			break;
		case 'disconn':
			$data.setUser(data.id, null);
			updateUserList();
			break;
		case 'connRoom':
			if($data._preQuick){
				playSound('success');
				$stage.dialog.quick.hide();
				delete $data._preQuick;
			}
			$stage.dialog.quick.hide();
			$data.setUser(data.user.id, data.user);
			$target = $data.usersR[data.user.id] = data.user;
			
			if($target.id == $data.id) loading();
			else notice(($target.profile.title || $target.profile.name) + L['hasJoined']);
			updateUserList();
			break;
		case 'disconnRoom':
			$target = $data.usersR[data.id];
			
			if($target){
				delete $data.usersR[data.id];
				notice(($target.profile.title || $target.profile.name) + L['hasLeft']);
				updateUserList();
			}
			break;
		case 'yell':
			yell(data.value);
			notice(data.value, L['yell']);
			break;
		case 'dying':
			yell(L['dying']);
			notice(L['dying'], L['yell']);
			break;
		case 'tail':
			notice(data.a + "|" + data.rid + "@" + data.id + ": " + ((data.msg instanceof String) ? data.msg : JSON.stringify(data.msg)).replace(/</g, "&lt;").replace(/>/g, "&gt;"), "tail");
			break;
		case 'chat':
			if(data.notice){
				notice(L['error_' + data.code]);
			}else{
				chat(data.profile || { title: L['robot'] }, data.value, data.from, data.timestamp);
			}
			break;
		case 'roomStuck':
			rws.close();
			break;
		case 'preRoom':
			connectToRoom(data.channel, data.id);
			break;
		case 'room':
			processRoom(data);
			checkRoom(data.modify && data.myRoom);
			updateUI(data.myRoom);
			if(data.modify && $data.room && data.myRoom){
				if($data._rTitle != $data.room.title) animModified('.room-head-title');
				if($data._rMode != getOptions($data.room.mode, $data.room.opts, true)) animModified('.room-head-mode');
				if($data._rLimit != $data.room.limit) animModified('.room-head-limit');
				if($data._rRound != $data.room.round) animModified('.room-head-round');
				if($data._rTime != $data.room.time) animModified('.room-head-time');
			}
			break;
		case 'user':
			$data.setUser(data.id, data);
			if($data.room) updateUI($data.room.id == data.place);
			break;
		case 'friends':
			$data._friends = {};
			for(i in data.list){
				data.list[i].forEach(function(v){
					$data._friends[v] = { server: i };
				});
			}
			updateCommunity();
			break;
		case 'friend':
			$data._friends[data.id] = { server: (data.stat == "on") ? data.s : false };
			if($data._friends[data.id] && $data.friends[data.id])
				notice(((data.stat == "on") ? ("&lt;<b>" + L['server_' + $data._friends[data.id].server] + "</b>&gt; ") : "")
				+ L['friend'] + " " + $data.friends[data.id] + L['fstat_' + data.stat]);
			updateCommunity();
			break;
		case 'friendAdd':
			$target = $data.users[data.from].profile;
			i = ($target.title || $target.name) + "(#" + data.from.substr(0, 5) + ")";
			send('friendAddRes', {
				from: data.from,
				res: $data.opts.df ? false : confirm(i + L['attemptFriendAdd'])
			}, true);
			break;
		case 'friendAddRes':
			$target = $data.users[data.target].profile;
			i = ($target.title || $target.name) + "(#" + data.target.substr(0, 5) + ")";
			notice(i + L['friendAddRes_' + (data.res ? 'ok' : 'no')]);
			if(data.res){
				$data.friends[data.target] = $target.title || $target.name;
				$data._friends[data.target] = { server: $data.server };
				updateCommunity();
			}
			break;
		case 'friendEdit':
			$data.friends = data.friends;
			updateCommunity();
			break;
		case 'starting':
			loading(L['gameLoading']);
			break;
		case 'roundReady':
			route("roundReady", data);
			break;
		case 'turnStart':
			route("turnStart", data);
			break;
		case 'turnError':
			turnError(data.code, data.value);
			break;
		case 'turnHint':
			route("turnHint", data);
			break;
		case 'turnEnd':
			data.score = Number(data.score);
			data.bonus = Number(data.bonus);
			if($data.room){
				$data._tid = data.target || $data.room.game.seq[$data.room.game.turn];
				if($data._tid){
					if($data._tid.robot) $data._tid = $data._tid.id;
					turnEnd($data._tid, data);
				}
				if(data.baby){
					playSound('success');
				}
			}
			break;
		case 'roundEnd':
			for(i in data.users){
				$data.setUser(i, data.users[i]);
			}
			/*if($data.guest){
				$stage.menu.exit.trigger('click');
				alert(L['guestExit']);
			}*/
			$data._resultRank = data.ranks;
			roundEnd(data.result, data.data);
			break;
		case 'kickVote':
			$data._kickTarget = $data.users[data.target];
			if($data.id != data.target && $data.id != $data.room.master){
				kickVoting(data.target);
			}
			notice(($data._kickTarget.profile.title || $data._kickTarget.profile.name) + L['kickVoting']);
			break;
		case 'kickDeny':
			notice(getKickText($data._kickTarget.profile, data));
			break;
		case 'invited':
			send('inviteRes', {
				from: data.from,
				res: $data.opts.di ? false : confirm(data.from + L['invited'])
			});
			break;
		case 'inviteNo':
			$target = $data.users[data.target];
			notice(($target.profile.title || $target.profile.name) + L['inviteDenied']);
			break;
		case 'okg':
			if($data._playTime > data.time){
				notice(L['okgExpired']);
			}else if($data._okg != data.count) notice(L['okgNotice'] + " (" + L['okgCurrent'] + data.count +")");
			$data._playTime = data.time;
			$data._okg = data.count;
			break;
		case 'obtain':
			queueObtain(data);
			// notice(L['obtained'] + ": " + iName(data.key) + " x" + data.q);
			break;
		case 'expired':
			for(i in data.list){
				notice(iName(data.list[i]) + L['hasExpired']);
			}
			break;
		case 'blocked':
			notice(L['blocked']);
			break;
		case 'test':
			if($data._test = !$data._test){
				$data._testt = addInterval(function(){
					if($stage.talk.val() != $data._ttv){
						send('test', { ev: "c", v: $stage.talk.val() }, true);
						$data._ttv = $stage.talk.val();
					}
				}, 100);
				document.onkeydown = function(e){
					send('test', { ev: "d", c: e.keyCode }, true);
				};
				document.onkeyup = function(e){
					send('test', { ev: "u", c: e.keyCode }, true);
				};
			}else{
				clearInterval($data._testt);
				document.onkeydown = undefined;
				document.onkeyup = undefined;
			}
			break;
		case 'error':
			i = data.message || "";
			if(data.code == 401){
				/* 로그인
				$.cookie('preprev', location.href);
				location.href = "/login?desc=login_kkutu"; */
			}else if(data.code == 403){
				loading();
			}else if(data.code == 406){
				if($stage.dialog.quick.is(':visible')){
					$data._preQuick = false;
					break;
				}
			}else if(data.code == 409){
				i = L['server_' + i];
			}else if(data.code == 416){
				// 게임 중
				if(confirm(L['error_'+data.code])){
					stopBGM();
					$data._spectate = true;
					$data._gaming = true;
					send('enter', { id: data.target, password: $data._pw, spectate: true }, true);
				}
				return;
			}else if(data.code == 413){
				$stage.dialog.room.hide();
				$stage.menu.setRoom.trigger('click');
			}else if(data.code == 429){
				playBGM('lobby');
			}else if(data.code == 430){
				$data.setRoom(data.message, null);
				if($stage.dialog.quick.is(':visible')){
					$data._preQuick = false;
					break;
				}
			}else if(data.code == 431 || data.code == 432 || data.code == 433){
				$stage.dialog.room.show();
			}else if(data.code == 444){
				i = data.message;
				if(i.indexOf("생년월일") != -1){
					alert("생년월일이 올바르게 입력되지 않아 게임 이용이 제한되었습니다. 잠시 후 다시 시도해 주세요.");
					break;
				}
			} else if (data.code === 447) {
				alert("자동화 봇 방지를 위한 캡챠 인증에 실패했습니다. 메인 화면에서 다시 시도해 주세요.");
				break;
			}
			alert("[#" + data.code + "] " + L['error_'+data.code] + i);
			break;
		default:
			break;
	}
	if($data._record) recordEvent(data);

    function recaptchaCallback(response) {
        ws.send(JSON.stringify({type: 'recaptcha', token: response}));
    }
}
function welcome(){
	playBGM('lobby');
	$("#Intro").animate({ 'opacity': 1 }, 1000).animate({ 'opacity': 0 }, 1000);
	$("#intro-text").text(L['welcome']);
	addTimeout(function(){
		$("#Intro").hide();
	}, 2000);
	
	if($data.admin) console.log("관리자 모드");
}
function getKickText(profile, vote){
	var vv = L['agree'] + " " + vote.Y + ", " + L['disagree'] + " " + vote.N + L['kickCon'];
	if(vote.Y >= vote.N){
		vv += (profile.title || profile.name) + L['kicked'];
	}else{
		vv += (profile.title || profile.name) + L['kickDenied'];
	}
	return vv;
}
function runCommand(cmd){
	var i, c, CMD = {
		'/ㄱ': L['cmd_r'],
		'/청소': L['cmd_cls'],
		'/ㄹ': L['cmd_f'],
		'/ㄷ': L['cmd_e'],
		'/ㄷㄷ': L['cmd_ee'],
		'/무시': L['cmd_wb'],
		'/차단': L['cmd_shut'],
		'/id': L['cmd_id']
	};
	
	switch(cmd[0].toLowerCase()){
		case "/ㄱ":
		case "/r":
			if($data.room){
				if($data.room.master == $data.id) $stage.menu.start.trigger('click');
				else $stage.menu.ready.trigger('click');
			}
			break;
		case "/청소":
		case "/cls":
			clearChat();
			break;
		case "/ㄹ":
		case "/f":
			showDialog($stage.dialog.chatLog);
			$stage.chatLog.scrollTop(999999999);
			break;
		case "/귓":
		case "/ㄷ":
		case "/e":
			sendWhisper(cmd[1], cmd.slice(2).join(' '));
			break;
		case "/답":
		case "/ㄷㄷ":
		case "/ee":
			if($data._recentFrom){
				sendWhisper($data._recentFrom, cmd.slice(1).join(' '));
			}else{
				notice(L['error_425']);
			}
			break;
		case "/무시":
		case "/wb":
			toggleWhisperBlock(cmd[1]);
			break;
		case "/차단":
		case "/shut":
			toggleShutBlock(cmd.slice(1).join(' '));
			break;
		case "/id":
			if(cmd[1]){
				c = 0;
				cmd[1] = cmd.slice(1).join(' ');
				for(i in $data.users){
					if(($data.users[i].profile.title || $data.users[i].profile.name) == cmd[1]){
						notice("[" + (++c) + "] " + i);
					}
				}
				if(!c) notice(L['error_405']);
			}else{
				notice(L['myId'] + $data.id);
			}
			break;
		default:
			for(i in CMD) notice(CMD[i], i);
			break;
	}
}
function sendWhisper(target, text){
	if(text.length){
		$data._whisper = target;
		send('talk', { whisper: target, value: text }, true);
		chat({ title: "→" + target }, text, true);
	}
}
function toggleWhisperBlock(target){
	if($data._wblock.hasOwnProperty(target)){
		delete $data._wblock[target];
		notice(target + L['wnblocked']);
	}else{
		$data._wblock[target] = true;
		notice(target + L['wblocked']);
	}
}
function toggleShutBlock(target){
	if($data._shut.hasOwnProperty(target)){
		delete $data._shut[target];
		notice(target + L['userNShut']);
	}else{
		$data._shut[target] = true;
		notice(target + L['userShut']);
	}
}
function tryDict(text, callback){
	var text = text.replace(/[^\sa-zA-Zㄱ-ㅎ0-9가-힣]/g, "");
	var lang = text.match(/[ㄱ-ㅎ가-힣]/) ? 'ko' : 'en';
	
	if(text.length < 1) return callback({ error: 404 });
	$.get("/dict/" + text + "?lang=" + lang, callback);
}
function processRoom(data){
	var i, j, key, o;
	
	data.myRoom = ($data.place == data.room.id) || (data.target == $data.id);
	if(data.myRoom){
		$target = $data.users[data.target];
		if(data.kickVote){
			notice(getKickText($target.profile, data.kickVote));
			if($target.id == data.id) alert(L['hasKicked']);
		}
		if(data.room.players.indexOf($data.id) == -1){
			if($data.room) if($data.room.gaming){
				stopAllSounds();
				$data.practicing = false;
				$data._gaming = false;
				$stage.box.room.height(360);
				playBGM('lobby');
			}
			$data.users[$data.id].game.ready = false;
			$data.users[$data.id].game.team = 0;
			$data.users[$data.id].game.form = "J";
			$stage.menu.spectate.removeClass("toggled");
			$stage.menu.ready.removeClass("toggled");
			$data.room = null;
			$data.resulting = false;
			$data._players = null;
			$data._master = null;
			$data.place = 0;
			if(data.room.practice){
				delete $data.users[0];
				$data.room = $data._room;
				$data.place = $data._place;
				$data.master = $data.__master;
				$data._players = $data.__players;
				delete $data._room;
			}
		}else{
			if(data.room.practice && !$data.practicing){
				$data.practicing = true;
				$data._room = $data.room;
				$data._place = $data.place;
				$data.__master = $data.master;
				$data.__players = $data._players;
			}
			if($data.room){
				$data._players = $data.room.players.toString();
				$data._master = $data.room.master;
				$data._rTitle = $data.room.title;
				$data._rMode = getOptions($data.room.mode, $data.room.opts, true);
				$data._rLimit = $data.room.limit;
				$data._rRound = $data.room.round;
				$data._rTime = $data.room.time;
			}
			$data.room = data.room;
			$data.place = $data.room.id;
			$data.master = $data.room.master == $data.id;
			if(data.spec && data.target == $data.id){
				if(!$data._spectate){
					$data._spectate = true;
					clearBoard();
					drawRound();
				}
				if(data.boards){
					// 십자말풀이 처리
					$data.selectedRound = 1;
					for(i in data.prisoners){
						key = i.split(',');
						for(j in data.boards[key[0]]){
							o = data.boards[key[0]][j];
							if(o[0] == key[1] && o[1] == key[2] && o[2] == key[3]){
								o[4] = data.prisoners[i];
								break;
							}
						}
					}
					$lib.Crossword.roundReady(data, true);
					$lib.Crossword.turnStart(data, true);
				}
				for(i in data.spec){
					$data.users[i].game.score = data.spec[i];
				}
			}
		}
		if(!data.modify && data.target == $data.id) forkChat();
	}
	if(data.target){
		if($data.users[data.target]){
			if(data.room.players.indexOf(data.target) == -1){
				$data.users[data.target].place = 0;
			}else{
				$data.users[data.target].place = data.room.id;
			}
		}
	}
	if(!data.room.practice){
		if(data.room.players.length){
			$data.setRoom(data.room.id, data.room);
			for(i in data.room.readies){
				if(!$data.users[i]) continue;
				$data.users[i].game.ready = data.room.readies[i].r;
				$data.users[i].game.team = data.room.readies[i].t;
			}
		}else{
			$data.setRoom(data.room.id, null);
		}
	}
}
function getOnly(){
	return $data.place ? (($data.room.gaming || $data.resulting) ? "for-gaming" : ($data.master ? "for-master" : "for-normal")) : "for-lobby";
}
function updateUI(myRoom, refresh){
/*
	myRoom이 undefined인 경우: 상점/결과 확인
	myRoom이 true/false인 경우: 그 외
*/
	var only = getOnly();
	var i;
	
	if($data._replay){
		if(myRoom === undefined || myRoom){
			replayStop();
		}else return;
	}
	if($data._replay) return;
	if(only == "for-gaming" && !myRoom) return;
	if($data.practicing) only = "for-gaming";
	
	$(".kkutu-menu button").hide();
	for(i in $stage.box) $stage.box[i].hide();
	$stage.box.me.show();
	$stage.box.chat.show().width(790).height(190);
	$stage.chat.height(120);
	
	if(only == "for-lobby"){
		$data._ar_first = true;
		$stage.box.userList.show();
		if($data._shop){
			$stage.box.roomList.hide();
			$stage.box.shop.show();
		}else{
			$stage.box.roomList.show();
			$stage.box.shop.hide();
		}
		updateUserList(refresh || only != $data._only);
		updateRoomList(refresh || only != $data._only);
		updateMe();
		if($data._jamsu){
			clearTimeout($data._jamsu);
			delete $data._jamsu;
		}
	}else if(only == "for-master" || only == "for-normal"){
		$(".team-chosen").removeClass("team-chosen");
		if($data.users[$data.id].game.ready || $data.users[$data.id].game.form == "S"){
			$stage.menu.ready.addClass("toggled");
			$(".team-selector").addClass("team-unable");
		}else{
			$stage.menu.ready.removeClass("toggled");
			$(".team-selector").removeClass("team-unable");
			$("#team-" + $data.users[$data.id].game.team).addClass("team-chosen");
			if($data.opts.ar && $data._ar_first){
				$stage.menu.ready.addClass("toggled");
				$stage.menu.ready.trigger('click');
				$data._ar_first = false;
			}
		}
		$data._shop = false;
		$stage.box.room.show().height(360);
		if(only == "for-master") if($stage.dialog.inviteList.is(':visible')) updateUserList();
		updateRoom(false);
		updateMe();
	}else if(only == "for-gaming"){
		if($data._gAnim){
			$stage.box.room.show();
			$data._gAnim = false;
		}
		$data._shop = false;
		$data._ar_first = true;
		$stage.box.me.hide();
		$stage.box.game.show();
		$(".ChatBox").width(1000).height(140);
		$stage.chat.height(70);
		updateRoom(true);
	}
	$data._only = only;
	setLocation($data.place);
	$(".kkutu-menu ."+only).show();
}
function animModified(cls){
	$(cls).addClass("room-head-modified");
	addTimeout(function(){ $(cls).removeClass("room-head-modified"); }, 3000);
}
function checkRoom(modify){
	if(!$data._players) return;
	if(!$data.room) return;
	
	var OBJ = {} + '';
	var i, arr = $data._players.split(',');
	var lb = arr.length, la = $data.room.players.length;
	var u;
	
	for(i in arr){
		if(arr[i] == OBJ) lb--;
	}
	for(i in $data.room.players){
		if($data.room.players[i].robot) la--;
	}
	if(modify){
		for(i in arr){
			if(arr[i] != OBJ) $data.users[arr[i]].game.ready = false;
		}
		notice(L['hasModified']);
	}
	if($data._gaming != $data.room.gaming){
		if($data.room.gaming){
			gameReady();
			$data._replay = false;
			startRecord($data.room.game.title);
		}else{
			if($data._spectate){
				$stage.dialog.resultSave.hide();
				$data._spectate = false;
				playBGM('lobby');
			}else{
				$stage.dialog.resultSave.show();
				$data.resulting = true;
			}
			clearInterval($data._tTime);
		}
	}
	if($data._master != $data.room.master){
		u = $data.users[$data.room.master];
		notice((u.profile.title || u.profile.name) + L['hasMaster']);
	}
	$data._players = $data.room.players.toString();
	$data._master = $data.room.master;
	$data._gaming = $data.room.gaming;
}
function updateMe(){
	var my = $data.users[$data.id];
	var i, gw = 0;
	var lv = getLevel(my.data.score);
	var prev = EXP[lv-2] || 0;
	var goal = EXP[lv-1];
	
	for(i in my.data.record) gw += my.data.record[i][1];
	renderMoremi(".my-image", my.equip);
	// $(".my-image").css('background-image', "url('"+my.profile.image+"')");
	$(".my-stat-level").replaceWith(getLevelImage(my.data.score).addClass("my-stat-level"));
	$(".my-stat-name").html(my.profile.title || my.profile.name);
	$(".my-stat-record").html(L['globalWin'] + " " + gw + L['W']);
	$(".my-stat-ping").html(commify(my.money) + L['ping']);
	$(".my-okg .graph-bar").width(($data._playTime % 600000) / 6000 + "%");
	$(".my-okg-text").html(prettyTime($data._playTime));
	$(".my-level").html(L['LEVEL'] + " " + lv);
	$(".my-gauge .graph-bar").width((my.data.score-prev)/(goal-prev)*190);
	$(".my-gauge-text").html(commify(my.data.score) + " / " + commify(goal));
}
function prettyTime(time){
	var min = Math.floor(time / 60000) % 60, sec = Math.floor(time * 0.001) % 60;
	var hour = Math.floor(time / 3600000);
	var txt = [];
	
	if(hour) txt.push(hour + L['HOURS']);
	if(min) txt.push(min + L['MINUTE']);
	if(!hour) txt.push(sec + L['SECOND']);
	return txt.join(' ');
}
function updateUserList(refresh){
	var $bar;
	var i, o, len = 0;
	var arr;
	
	// refresh = true;
	// if(!$stage.box.userList.is(':visible')) return;
	if($data.opts.su){
		arr = [];
		for(i in $data.users){
			len++;
			arr.push($data.users[i]);
		}
		arr.sort(function(a, b){ return b.data.score - a.data.score; });
		refresh = true;
	}else{
		arr = $data.users;
		
		for(i in $data.users) len++;
	}
	$stage.lobby.userListTitle.html("<i class='fa fa-users'></i>"
		+ "&lt;<b>" + L['server_' + $data.server] + "</b>&gt; "
		+ L['UserList'].replace("FA{users}", "")
		+ " [" + len + L['MN'] + "]");
	
	if(refresh){
		$stage.lobby.userList.empty();
		$stage.dialog.inviteList.empty();
		for(i in arr){
			o = arr[i];
			if(o.robot) continue;
			
			$stage.lobby.userList.append(userListBar(o));
			if(o.place == 0) $stage.dialog.inviteList.append(userListBar(o, true));
		}
	}
}
function userListBar(o, forInvite){
	var $R;
	
	if(forInvite){
		$R = $("<div>").attr('id', "invite-item-"+o.id).addClass("invite-item users-item")
		.append($("<div>").addClass("jt-image users-image").css('background-image', "url('"+o.profile.image+"')"))
		.append(getLevelImage(o.data.score).addClass("users-level"))
		// .append($("<div>").addClass("jt-image users-from").css('background-image', "url('/img/kkutu/"+o.profile.type+".png')"))
		.append($("<div>").addClass("users-name").html(o.profile.title || o.profile.name))
		.on('click', function(e){
			requestInvite($(e.currentTarget).attr('id').slice(12));
		});
	}else{
		$R = $("<div>").attr('id', "users-item-"+o.id).addClass("users-item")
		.append($("<div>").addClass("jt-image users-image").css('background-image', "url('"+o.profile.image+"')"))
		.append(getLevelImage(o.data.score).addClass("users-level"))
		// .append($("<div>").addClass("jt-image users-from").css('background-image', "url('/img/kkutu/"+o.profile.type+".png')"))
		.append($("<div>").addClass("users-name ellipse").html(o.profile.title || o.profile.name))
		.on('click', function(e){
			requestProfile($(e.currentTarget).attr('id').slice(11));
		});
	}
	addonNickname($R, o);
	
	return $R;
}
function addonNickname($R, o){
	if(o.equip['NIK']) $R.addClass("x-" + o.equip['NIK']);
	if(o.equip['BDG'] == "b1_gm") $R.addClass("x-gm");
}
function updateRoomList(refresh){
	var i;
	var len = 0;
	
	if(!refresh){
		$(".rooms-create").remove();
		for(i in $data.rooms) len++;
	}else{
		$stage.lobby.roomList.empty();
		for(i in $data.rooms){
			$stage.lobby.roomList.append(roomListBar($data.rooms[i]));
			len++;
		}
	}
	$stage.lobby.roomListTitle.html(L['RoomList'].replace("FA{bars}", "<i class='fa fa-bars'></i>") + " [" + len + L['GAE'] + "]");
	
	if(len){
		$(".rooms-gaming").css('display', $data.opts.ow ? "none" : "");
		$(".rooms-locked").css('display', $data.opts.ou ? "none" : "");
	}else{
		$stage.lobby.roomList.append($stage.lobby.createBanner.clone().on('click', onBanner));
	}
	function onBanner(e){
		$stage.menu.newRoom.trigger('click');
	}
}
function roomListBar(o){
	var $R, $ch;
	var opts = getOptions(o.mode, o.opts);
	
	$R = $("<div>").attr('id', "room-"+o.id).addClass("rooms-item")
	.append($ch = $("<div>").addClass("rooms-channel channel-" + o.channel).on('click', function(e){ requestRoomInfo(o.id); }))
	.append($("<div>").addClass("rooms-number").html(o.id))
	.append($("<div>").addClass("rooms-title ellipse").text(badWords(o.title)))
	.append($("<div>").addClass("rooms-limit").html(o.players.length + " / " + o.limit))
	.append($("<div>").width(270)
		.append($("<div>").addClass("rooms-mode").html(opts.join(" / ").toString()))
		.append($("<div>").addClass("rooms-round").html(L['rounds'] + " " + o.round))
		.append($("<div>").addClass("rooms-time").html(o.time + L['SECOND']))
	)
	.append($("<div>").addClass("rooms-lock").html(o.password ? "<i class='fa fa-lock'></i>" : "<i class='fa fa-unlock'></i>"))
	.on('click', function(e){
		if(e.target == $ch.get(0)) return;
		tryJoin($(e.currentTarget).attr('id').slice(5));
	});
	if(o.gaming) $R.addClass("rooms-gaming");
	if(o.password) $R.addClass("rooms-locked");
	
	return $R;
}
function normalGameUserBar(o){
	var $m, $n, $bar;
	var $R = $("<div>").attr('id', "game-user-"+o.id).addClass("game-user")
		.append($m = $("<div>").addClass("moremi game-user-image"))
		.append($("<div>").addClass("game-user-title")
			.append(getLevelImage(o.data.score).addClass("game-user-level"))
			.append($bar = $("<div>").addClass("game-user-name ellipse").html(o.profile.title || o.profile.name))
			.append($("<div>").addClass("expl").html(L['LEVEL'] + " " + getLevel(o.data.score)))
		)
		.append($n = $("<div>").addClass("game-user-score"));
	renderMoremi($m, o.equip);
	global.expl($R);
	addonNickname($bar, o);
	if(o.game.team) $n.addClass("team-" + o.game.team);
	
	return $R;
}
function miniGameUserBar(o){
	var $n, $bar;
	var $R = $("<div>").attr('id', "game-user-"+o.id).addClass("game-user")
		.append($("<div>").addClass("game-user-title")
			.append(getLevelImage(o.data.score).addClass("game-user-level"))
			.append($bar = $("<div>").addClass("game-user-name ellipse").html(o.profile.title || o.profile.name))
		)
		.append($n = $("<div>").addClass("game-user-score"));
	if(o.id == $data.id) $bar.addClass("game-user-my-name");
	addonNickname($bar, o);
	if(o.game.team) $n.addClass("team-" + o.game.team);
	
	return $R;
}
function getAIProfile(level){
	return {
		title: L['aiLevel' + level] + ' ' + L['robot'],
		image: "/img/kkutu/robot.png"
	};
}
function updateRoom(gaming){
	var i, o, $r;
	var $y, $z;
	var $m;
	var $bar;
	var rule = RULE[MODE[$data.room.mode]];
	var renderer = (mobile || rule.big) ? miniGameUserBar : normalGameUserBar;
	var spec;
	var arAcc = false, allReady = true;
	
	setRoomHead($(".RoomBox .product-title"), $data.room);
	setRoomHead($(".GameBox .product-title"), $data.room);
	if(gaming){
		$r = $(".GameBox .game-body").empty();
		// updateScore(true);
		for(i in $data.room.game.seq){
			if($data._replay){
				o = $rec.users[$data.room.game.seq[i]] || $data.room.game.seq[i];
			}else{
				o = $data.users[$data.room.game.seq[i]] || $data.robots[$data.room.game.seq[i].id] || $data.room.game.seq[i];
			}
			if(o.robot && !o.profile){
				o.profile = getAIProfile(o.level);
				$data.robots[o.id] = o;
			}
			$r.append(renderer(o));
			updateScore(o.id, o.game.score || 0);
		}
		clearTimeout($data._jamsu);
		delete $data._jamsu;
	}else{
		$r = $(".room-users").empty();
		spec = $data.users[$data.id].game.form == "S";
		// 참가자
		for(i in $data.room.players){
			o = $data.users[$data.room.players[i]] || $data.room.players[i];
			if(!o.game) continue;
			
			var prac = o.game.practice ? ('/' + L['stat_practice']) : '';
			var spec = (o.game.form == "S") ? ('/' + L['stat_spectate']) : false;
			
			if(o.robot){
				o.profile = getAIProfile(o.level);
				$data.robots[o.id] = o;
			}
			$r.append($("<div>").attr('id', "room-user-"+o.id).addClass("room-user")
				.append($m = $("<div>").addClass("moremi room-user-image"))
				.append($("<div>").addClass("room-user-stat")
					.append($y = $("<div>").addClass("room-user-ready"))
					.append($z = $("<div>").addClass("room-user-team team-" + o.game.team).html($("#team-" + o.game.team).html()))
				)
				.append($("<div>").addClass("room-user-title")
					.append(getLevelImage(o.data.score).addClass("room-user-level"))
					.append($bar = $("<div>").addClass("room-user-name").html(o.profile.title || o.profile.name))
				).on('click', function(e){
					requestProfile($(e.currentTarget).attr('id').slice(10));
				})
			);
			renderMoremi($m, o.equip);
			if(spec) $z.hide();
			if(o.id == $data.room.master){
				$y.addClass("room-user-master").html(L['master'] + prac + (spec || ''));
			}else if(spec){
				$y.addClass("room-user-spectate").html(L['stat_spectate'] + prac);
			}else if(o.game.ready || o.robot){
				$y.addClass("room-user-readied").html(L['stat_ready']);
				if(!o.robot) arAcc = true;
			}else if(o.game.practice){
				$y.addClass("room-user-practice").html(L['stat_practice']);
				allReady = false;
			}else{
				$y.html(L['stat_noready']);
				allReady = false;
			}
			addonNickname($bar, o);
		}
		if(arAcc && $data.room.master == $data.id && allReady){
			if(!$data._jamsu) $data._jamsu = addTimeout(onMasterSubJamsu, 5000);
		}else{
			clearTimeout($data._jamsu);
			delete $data._jamsu;
		}
	}
	if($stage.dialog.profile.is(':visible')){
		requestProfile($data._profiled);
	}
}
function onMasterSubJamsu(){
	notice(L['subJamsu']);
	$data._jamsu = addTimeout(function(){
		send('leave');
		alert(L['masterJamsu']);
	}, 30000);
}
function updateScore(id, score){
	var i, o, t;
	
	if(o = $data["_s"+id]){
		clearTimeout(o.timer);
		o.$obj = $("#game-user-"+id+" .game-user-score");
		o.goal = score;
	}else{
		o = $data["_s"+id] = {
			$obj: $("#game-user-"+id+" .game-user-score"),
			goal: score,
			now: 0
		};
	}
	animateScore(o);
	/*if(id === true){
		// 팀 정보 초기화
		$data.teams = [];
		for(i=0; i<5; i++) $data.teams.push({ list: [], score: 0 });
		for(i in $data.room.game.seq){
			t = $data.room.game.seq[i];
			o = $data.users[t] || $data.robots[t] || t;
			if(o){
				$data.teams[o.game.team].list.push(t.id ? t.id : t);
				$data.teams[o.game.team].score += o.game.score;
			}
		}
		for(i in $data.room.game.seq){
			t = $data.room.game.seq[i];
			o = $data.users[t] || $data.robots[t] || t;
			updateScore(t.id || t, o.game.score);
		}
	}else{
		o = $data.users[id] || $data.robots[id];
		if(o.game.team){
			t = $data.teams[o.game.team];
			i = $data["_s"+id];
			t.score += score - (i ? i.goal : 0);
		}else{
			t = { list: [ id ], score: score };
		}
		for(i in t.list){
			if(o = $data["_s"+t.list[i]]){
				clearTimeout(o.timer);
				o.$obj = $("#game-user-"+t.list[i]+" .game-user-score");
				o.goal = t.score;
			}else{
				o = $data["_s"+t.list[i]] = {
					$obj: $("#game-user-"+t.list[i]+" .game-user-score"),
					goal: t.score,
					now: 0
				};
			}
			animateScore(o);
		}
		return $("#game-user-" + id);
	}*/
	return $("#game-user-" + id);
}
function animateScore(o){
	var v = (o.goal - o.now) * Math.min(1, TICK * 0.01);
	
	if(v < 0.1) v = o.goal - o.now;
	else o.timer = addTimeout(animateScore, TICK, o);
	
	o.now += v;
	drawScore(o.$obj, Math.round(o.now));
}
function drawScore($obj, score){
	var i, sc = (score > 99999) ? (zeroPadding(Math.round(score * 0.001), 4) + 'k') : zeroPadding(score, 5);
	
	$obj.empty();
	for(i=0; i<sc.length; i++){
		$obj.append($("<div>").addClass("game-user-score-char").html(sc[i]));
	}
}
function drawMyDress(avGroup){
	var $view = $("#dress-view");
	var my = $data.users[$data.id];
	
	renderMoremi($view, my.equip);
	$(".dress-type.selected").removeClass("selected");
	$("#dress-type-all").addClass("selected");
	$("#dress-exordial").val(my.exordial);
	drawMyGoods(avGroup || true);
}
function renderGoods($target, preId, filter, equip, onClick){
	var $item;
	var list = [];
	var obj, q, g, equipped;
	var isAll = filter === true;
	var i;
	
	$target.empty();
	if(!equip) equip = {};
	for(i in equip){
		if(!$data.box.hasOwnProperty(equip[i])) $data.box[equip[i]] = { value: 0 };
	}
	for(i in $data.box) list.push({ key: i, obj: iGoods(i), value: $data.box[i] });
	list.sort(function(a, b){
		return (a.obj.name < b.obj.name) ? -1 : 1;
	});
	for(i in list){
		obj = list[i].obj;
		q = list[i].value;
		g = obj.group;
		if(g.substr(0, 3) == "BDG") g = "BDG";
		equipped = (g == "Mhand") ? (equip['Mlhand'] == list[i].key || equip['Mrhand'] == list[i].key) : (equip[g] == list[i].key);
		
		if(typeof q == "number") q = {
			value: q
		};
		if(!q.hasOwnProperty("value") && !equipped) continue;
		if(!isAll) if(filter.indexOf(obj.group) == -1) continue;
		$target.append($item = $("<div>").addClass("dress-item")
			.append(getImage(obj.image).addClass("dress-item-image").html("x" + q.value))
			.append(explainGoods(obj, equipped, q.expire))
		);
		$item.attr('id', preId + "-" + obj._id).on('click', onClick);
		if(equipped) $item.addClass("dress-equipped");
	}
	global.expl($target);
}
function drawMyGoods(avGroup){
	var equip = $data.users[$data.id].equip || {};
	var filter;
	var isAll = avGroup === true;
	
	$data._avGroup = avGroup;
	if(isAll) filter = true;
	else filter = (avGroup || "").split(',');
	
	renderGoods($("#dress-goods"), 'dress', filter, equip, function(e){
		var $target = $(e.currentTarget);
		var id = $target.attr('id').slice(6);
		var item = iGoods(id);
		var isLeft;
		
		if(e.ctrlKey){
			if($target.hasClass("dress-equipped")) return fail(426);
			if(!confirm(L['surePayback'] + commify(Math.round((item.cost || 0) * 0.2)) + L['ping'])) return;
			$.post("/payback/" + id, function(res){
				if(res.error) return fail(res.error);
				alert(L['painback']);
				$data.box = res.box;
				$data.users[$data.id].money = res.money;
				
				drawMyDress($data._avGroup);
				updateUI(false);
			});
		}else if(AVAIL_EQUIP.indexOf(item.group) != -1){
			if(item.group == "Mhand"){
				isLeft = confirm(L['dressWhichHand']);
			}
			requestEquip(id, isLeft);
		}else if(item.group == "CNS"){
			if(!confirm(L['sureConsume'])) return;
			$.post("/consume/" + id, function(res){
				if(res.exp) notice(L['obtainExp'] + ": " + commify(res.exp));
				if(res.money) notice(L['obtainMoney'] + ": " + commify(res.money));
				res.gain.forEach(function(item){ queueObtain(item); });
				$data.box = res.box;
				$data.users[$data.id].data = res.data;
				send('refresh');
				
				drawMyDress($data._avGroup);
				updateMe();
			});
		}
	});
}
function requestEquip(id, isLeft){
	var my = $data.users[$data.id];
	var part = $data.shop[id].group;
	if(part == "Mhand") part = isLeft ? "Mlhand" : "Mrhand";
	if(part.substr(0, 3) == "BDG") part = "BDG";
	var already = my.equip[part] == id;
	
	if(confirm(L[already ? 'sureUnequip' : 'sureEquip'] + ": " + L[id][0])){
		$.post("/equip/" + id, { isLeft: isLeft }, function(res){
			if(res.error) return fail(res.error);
			$data.box = res.box;
			my.equip = res.equip;
			
			drawMyDress($data._avGroup);
			send('refresh');
			updateUI(false);
		});
	}
}
function drawCharFactory(){
	var $tray = $("#cf-tray");
	var $dict = $("#cf-dict");
	var $rew = $("#cf-reward");
	var $goods = $("#cf-goods");
	var $cost = $("#cf-cost");
	
	$data._tray = [];
	$dict.empty();
	$rew.empty();
	$cost.html("");
	$stage.dialog.cfCompose.removeClass("cf-composable");
	
	renderGoods($goods, 'cf', [ 'PIX', 'PIY', 'PIZ' ], null, function(e){
		var $target = $(e.currentTarget);
		var id = $target.attr('id').slice(3);
		var bd = $data.box[id];
		var i, c = 0;
		
		if($data._tray.length >= 6) return fail(435);
		for(i in $data._tray) if($data._tray[i] == id) c++;
		if(bd - c > 0){
			$data._tray.push(id);
			drawCFTray();
		}else{
			fail(434);
		}
	});
	function trayEmpty(){
		$tray.html($("<h4>").css('padding-top', "8px").width("100%").html(L['cfTray']));
	}
	function drawCFTray(){
		var LEVEL = { 'WPC': 1, 'WPB': 2, 'WPA': 3 };
		var gd, word = "";
		var level = 0;
		
		$tray.empty();
		$(".cf-tray-selected").removeClass("cf-tray-selected");
		$data._tray.forEach(function(item){
			gd = iGoods(item);
			word += item.slice(4);
			level += LEVEL[item.slice(1, 4)];
			$tray.append($("<div>").addClass("jt-image")
				.css('background-image', "url(" + gd.image + ")")
				.attr('id', "cf-tray-" + item)
				.on('click', onTrayClick)
			);
			$("#cf-\\" + item).addClass("cf-tray-selected");
		});
		$dict.html(L['searching']);
		$rew.empty();
		$stage.dialog.cfCompose.removeClass("cf-composable");
		$cost.html("");
		tryDict(word, function(res){
			var blend = false;
			
			if(res.error){
				if(word.length == 3){
					blend = true;
					$dict.html(L['cfBlend']);
				}else return $dict.html(L['wpFail_' + res.error]);
			}
			viewReward(word, level, blend);
			$stage.dialog.cfCompose.addClass("cf-composable");
			if(!res.error) $dict.html(processWord(res.word, res.mean, res.theme, res.type.split(',')));
		});
		if(word == "") trayEmpty();
	}
	function viewReward(text, level, blend){
		$.get("/cf/" + text + "?l=" + level + "&b=" + (blend ? "1" : ""), function(res){
			if(res.error) return fail(res.error);
			
			$rew.empty();
			res.data.forEach(function(item){
				var bd = iGoods(item.key);
				var rt = (item.rate >= 1) ? L['cfRewAlways'] : ((item.rate * 100).toFixed(1) + '%');
				
				$rew.append($("<div>").addClass("cf-rew-item")
					.append($("<div>").addClass("jt-image cf-rew-image")
						.css('background-image', "url(" + bd.image + ")")
					)
					.append($("<div>").width(100)
						.append($("<div>").width(100).html(bd.name))
						.append($("<div>").addClass("cf-rew-value").html("x" + item.value))
					)
					.append($("<div>").addClass("cf-rew-rate").html(rt))
				);
			});
			$cost.html(L['cfCost'] + ": " + res.cost + L['ping']);
		});
	}
	function onTrayClick(e){
		var id = $(e.currentTarget).attr('id').slice(8);
		var bi = $data._tray.indexOf(id);
		
		if(bi == -1) return;
		$data._tray.splice(bi, 1);
		drawCFTray();
	}
	trayEmpty();
}
function drawLeaderboard(data){
	var $board = $stage.dialog.lbTable.empty();
	var fr = data.data[0] ? data.data[0].rank : 0;
	var page = (data.page || Math.floor(fr / 20)) + 1;
	
	data.data.forEach(function(item, index){
		var profile = $data.users[item.id];
		
		if(profile) profile = profile.profile.title || profile.profile.name;
		else profile = L['hidden'];
		
		item.score = Number(item.score);
		$board.append($("<tr>").attr('id', "ranking-" + item.id)
			.addClass("ranking-" + (item.rank + 1))
			.append($("<td>").html(item.rank + 1))
			.append($("<td>")
				.append(getLevelImage(item.score).addClass("ranking-image"))
				.append($("<label>").css('padding-top', 2).html(getLevel(item.score)))
			)
			.append($("<td>").html(profile))
			.append($("<td>").html(commify(item.score)))
		);
	});
	$("#ranking-" + $data.id).addClass("ranking-me");
	$stage.dialog.lbPage.html(L['page'] + " " + page);
	$stage.dialog.lbPrev.attr('disabled', page <= 1);
	$stage.dialog.lbNext.attr('disabled', data.data.length < 15);
	$stage.dialog.lbMe.attr('disabled', !!$data.guest);
	$data._lbpage = page - 1;
}
function updateCommunity(){
	var i, o, p, memo;
	var len = 0;
	
	$stage.dialog.commFriends.empty();
	for(i in $data.friends){
		len++;
		memo = $data.friends[i];
		o = $data._friends[i] || {};
		p = ($data.users[i] || {}).profile;
		
		$stage.dialog.commFriends.append($("<div>").addClass("cf-item").attr('id', "cfi-" + i)
			.append($("<div>").addClass("cfi-status cfi-stat-" + (o.server ? 'on' : 'off')))
			.append($("<div>").addClass("cfi-server").html(o.server ? L['server_' + o.server] : "-"))
			.append($("<div>").addClass("cfi-name ellipse").html(p ? (p.title || p.name) : L['hidden']))
			.append($("<div>").addClass("cfi-memo ellipse").text(memo))
			.append($("<div>").addClass("cfi-menu")
				.append($("<i>").addClass("fa fa-pencil").on('click', requestEditMemo))
				.append($("<i>").addClass("fa fa-remove").on('click', requestRemoveFriend))
			)
		);
	}
	function requestEditMemo(e){
		var id = $(e.currentTarget).parent().parent().attr('id').slice(4);
		var _memo = $data.friends[id];
		var memo = prompt(L['friendEditMemo'], _memo);
		
		if(!memo) return;
		send('friendEdit', { id: id, memo: memo }, true);
	}
	function requestRemoveFriend(e){
		var id = $(e.currentTarget).parent().parent().attr('id').slice(4);
		var memo = $data.friends[id];
		
		if($data._friends[id].server) return fail(455);
		if(!confirm(memo + "(#" + id.substr(0, 5) + ")\n" + L['friendSureRemove'])) return;
		send('friendRemove', { id: id }, true);
	}
	$("#CommunityDiag .dialog-title").html(L['communityText'] + " (" + len + " / 100)");
}
function requestRoomInfo(id){
	var o = $data.rooms[id];
	var $pls = $("#ri-players").empty();
	
	$data._roominfo = id;
	$("#RoomInfoDiag .dialog-title").html(id + L['sRoomInfo']);
	$("#ri-title").html((o.password ? "<i class='fa fa-lock'></i>&nbsp;" : "") + o.title);
	$("#ri-mode").html(L['mode' + MODE[o.mode]]);
	$("#ri-round").html(o.round + ", " + o.time + L['SECOND']);
	$("#ri-limit").html(o.players.length + " / " + o.limit);
	o.players.forEach(function(p, i){
		var $p, $moremi;
		var rd = o.readies[p] || {};
		
		p = $data.users[p] || NULL_USER;
		if(o.players[i].robot){
			p.profile = { title: L['robot'] };
			p.equip = { robot: true };
		}else rd.t = rd.t || 0;
		
		$pls.append($("<div>").addClass("ri-player")
			.append($moremi = $("<div>").addClass("moremi rip-moremi"))
			.append($p = $("<div>").addClass("ellipse rip-title").html(p.profile.title || p.profile.name))
			.append($("<div>").addClass("rip-team team-" + rd.t).html($("#team-" + rd.t).html()))
			.append($("<div>").addClass("rip-form").html(L['pform_' + rd.f]))
		);
		if(p.id == o.master) $p.prepend($("<label>").addClass("rip-master").html("[" + L['master'] + "]&nbsp;"));
		$p.prepend(getLevelImage(p.data.score).addClass("profile-level rip-level"));
		
		renderMoremi($moremi, p.equip);
	});
	showDialog($stage.dialog.roomInfo);
	$stage.dialog.roomInfo.show();
}
function requestProfile(id){
	var o = $data.users[id] || $data.robots[id];
	var $rec = $("#profile-record").empty();
	var $pi, $ex;
	var i;
	
	if(!o){
		notice(L['error_405']);
		return;
	}
	$("#ProfileDiag .dialog-title").html((o.profile.title || o.profile.name) + L['sProfile']);
	$(".profile-head").empty().append($pi = $("<div>").addClass("moremi profile-moremi"))
		.append($("<div>").addClass("profile-head-item")
			.append(getImage(o.profile.image).addClass("profile-image"))
			.append($("<div>").addClass("profile-title ellipse").html(o.profile.title || o.profile.name)
				.append($("<label>").addClass("profile-tag").html(" #" + o.id.toString().substr(0, 5)))
			)
		)
		.append($("<div>").addClass("profile-head-item")
			.append(getLevelImage(o.data.score).addClass("profile-level"))
			.append($("<div>").addClass("profile-level-text").html(L['LEVEL'] + " " + (i = getLevel(o.data.score))))
			.append($("<div>").addClass("profile-score-text").html(commify(o.data.score) + " / " + commify(EXP[i - 1]) + L['PTS']))
		)
		.append($ex = $("<div>").addClass("profile-head-item profile-exordial ellipse").text(badWords(o.exordial || ""))
			.append($("<div>").addClass("expl").css({ 'white-space': "normal", 'width': 300, 'font-size': "11px" }).text(o.exordial))
		);
	if(o.robot){
		$stage.dialog.profileLevel.show();
		$stage.dialog.profileLevel.prop('disabled', $data.id != $data.room.master);
		$("#profile-place").html($data.room.id + L['roomNumber']);
	}else{
		$stage.dialog.profileLevel.hide();
		$("#profile-place").html(o.place ? (o.place + L['roomNumber']) : L['lobby']);
		for(i in o.data.record){
			var r = o.data.record[i];
			
			$rec.append($("<div>").addClass("profile-record-field")
				.append($("<div>").addClass("profile-field-name").html(L['mode' + i]))
				.append($("<div>").addClass("profile-field-record").html(r[0] + L['P'] + " " + r[1] + L['W']))
				.append($("<div>").addClass("profile-field-score").html(commify(r[2]) + L['PTS']))
			);
		}
		renderMoremi($pi, o.equip);
	}
	$data._profiled = id;
	$stage.dialog.profileKick.hide();
	$stage.dialog.profileShut.hide();
	$stage.dialog.profileDress.hide();
	$stage.dialog.profileWhisper.hide();
	$stage.dialog.profileHandover.hide();
	
	if($data.id == id) $stage.dialog.profileDress.show();
	else if(!o.robot){
		$stage.dialog.profileShut.show();
		$stage.dialog.profileWhisper.show();
	}
	if($data.room){
		if($data.id != id && $data.id == $data.room.master){
			$stage.dialog.profileKick.show();
			$stage.dialog.profileHandover.show();
		}
	}
	showDialog($stage.dialog.profile);
	$stage.dialog.profile.show();
	global.expl($ex);
}
function requestInvite(id){
	var nick;
	
	if(id != "AI"){
		nick = $data.users[id].profile.title || $data.users[id].profile.name;
		if(!confirm(nick + L['sureInvite'])) return;
	}
	send('invite', { target: id });
}
function checkFailCombo(id){
	if(!$data._replay && $data.lastFail == $data.id && $data.id == id){
		$data.failCombo++;
		if($data.failCombo == 1) notice(L['trollWarning']);
		if($data.failCombo > 1){
			send('leave');
			fail(437);
		}
	}else{
		$data.failCombo = 0;
	}
	$data.lastFail = id;
}
function clearGame(){
	if($data._spaced) $lib.Typing.spaceOff();
	clearInterval($data._tTime);
	$data._relay = false;
}
function gameReady(){
	var i, u;
	
	for(i in $data.room.players){
		if($data._replay){
			u = $rec.users[$data.room.players[i]] || $data.room.players[i];
		}else{
			u = $data.users[$data.room.players[i]] || $data.robots[$data.room.players[i].id];
		}
		u.game.score = 0;
		delete $data["_s"+$data.room.players[i]];
	}
	delete $data.lastFail;
	$data.failCombo = 0;
	$data._spectate = $data.room.game.seq.indexOf($data.id) == -1;
	$data._gAnim = true;
	$stage.box.room.show().height(360).animate({ 'height': 1 }, 500);
	$stage.box.game.height(1).animate({ 'height': 410 }, 500);
	stopBGM();
	$stage.dialog.resultSave.attr('disabled', false);
	clearBoard();
	$stage.game.display.html(L['soon']);
	playSound('game_start');
	forkChat();
	addTimeout(function(){
		$stage.box.room.height(360).hide();
		$stage.chat.scrollTop(999999999);
	}, 500);
}
function replayPrevInit(){
	var i;
	
	for(i in $data.room.game.seq){
		if($data.room.game.seq[i].robot){
			$data.room.game.seq[i].game.score = 0;
		}
	}
	$rec.users = {};
	for(i in $rec.players){
		var id = $rec.players[i].id;
		var rd = $rec.readies[id] || {};
		var u = $data.users[id] || $data.robots[id];
		var po = id;
		
		if($rec.players[i].robot){
			u = $rec.users[id] = { robot: true };
			po = $rec.players[i];
			po.game = {};
		}else{
			u = $rec.users[id] = {};
		}
		$data.room.players.push(po);
		u.id = po;
		u.profile = $rec.players[i];
		u.data = u.profile.data;
		u.equip = u.profile.equip;
		u.game = { score: 0, team: rd.t };
	}
	$data._rf = 0;
}
function replayReady(){
	var i;
	
	replayStop();
	$data._replay = true;
	$data.room = {
		title: $rec.title,
		players: [],
		events: [],
		time: $rec.roundTime,
		round: $rec.round,
		mode: $rec.mode,
		limit: $rec.limit,
		game: $rec.game,
		opts: $rec.opts,
		readies: $rec.readies
	};
	replayPrevInit();
	for(i in $rec.events){
		$data.room.events.push($rec.events[i]);
	}
	$stage.box.userList.hide();
	$stage.box.roomList.hide();
	$stage.box.game.show();
	$stage.dialog.replay.hide();
	gameReady();
	updateRoom(true);
	$data.$gp = $(".GameBox .product-title").empty()
		.append($data.$gpt = $("<div>").addClass("game-replay-title"))
		.append($data.$gpc = $("<div>").addClass("game-replay-controller")
			.append($("<button>").html(L['replayNext']).on('click', replayNext))
			.append($("<button>").html(L['replayPause']).on('click', replayPause))
			.append($("<button>").html(L['replayPrev']).on('click', replayPrev))
		);
	$data._gpp = L['replay'] + " - " + (new Date($rec.time)).toLocaleString();
	$data._gtt = $data.room.events[$data.room.events.length - 1].time;
	$data._eventTime = 0;
	$data._rt = addTimeout(replayTick, 2000);
	$data._rprev = 0;
	$data._rpause = false;
	replayStatus();
}
function replayPrev(e){
	var ev = $data.room.events[--$data._rf];
	var c;
	var to;
	
	if(!ev) return;
	c = ev.time;
	do{
		if(!(ev = $data.room.events[--$data._rf])) break;
	}while(c - ev.time < 1000);
	
	to = $data._rf - 1;
	replayPrevInit();
	c = $data.muteEff;
	$data.muteEff = true;
	for(i=0; i<to; i++){
		replayTick();
	}
	$(".deltaScore").remove();
	$data.muteEff = c;
	replayTick();
	/*var pev, ev = $data.room.events[--$data._rf];
	var c;
	
	if(!ev) return;
	
	c = ev.time;
	clearTimeout($data._rt);
	do{
		if(ev.data.type == 'turnStart'){
			$(".game-user-current").removeClass("game-user-current");
			if((pev = $data.room.events[$data._rf - 1]).data.profile) $("#game-user-" + pev.data.profile.id).addClass("game-user-current");
		}
		if(ev.data.type == 'turnEnd'){
			$stage.game.chain.html(--$data.chain);
			if(ev.data.profile){
				addScore(ev.data.profile.id, -(ev.data.score + ev.data.bonus));
				updateScore(ev.data.profile.id, getScore(ev.data.profile.id));
			}
		}
		if(!(ev = $data.room.events[--$data._rf])) break;
	}while(c - ev.time < 1000);
	if($data._rf < 0) $data._rf = 0;
	if(ev) if(ev.data.type == 'roundReady'){
		$(".game-user-current").removeClass("game-user-current");
	}
	replayTick(true);*/
}
function replayPause(e){
	var p = $data._rpause = !$data._rpause;
	
	$(e.target).html(p ? L['replayResume'] : L['replayPause']);
}
function replayNext(e){
	clearTimeout($data._rt);
	replayTick();
}
function replayStatus(){
	$data.$gpt.html($data._gpp
		+ " (" + ($data._eventTime * 0.001).toFixed(1) + L['SECOND']
		+ " / " + ($data._gtt * 0.001).toFixed(1) + L['SECOND']
		+ ")"
	);
}
function replayTick(stay){
	var event = $data.room.events[$data._rf];
	var args, i;
	
	clearTimeout($data._rt);
	if(!stay) $data._rf++;
	if(!event){
		replayStop();
		return;
	}
	if($data._rpause){
		$data._rf--;
		return $data._rt = addTimeout(replayTick, 100);
	}
	args = event.data;
	if(args.hint) args.hint = { _id: args.hint };
	if(args.type == 'chat') args.timestamp = $rec.time + event.time;
	
	onMessage(args);
	
	$data._eventTime = event.time;
	replayStatus();
	if($data.room.events.length > $data._rf) $data._rt = addTimeout(replayTick,
		$data.room.events[$data._rf].time - event.time
	);
	else replayStop();
}
function replayStop(){
	delete $data.room;
	$data._replay = false;
	$stage.box.room.height(360);
	clearTimeout($data._rt);
	updateUI();
	playBGM('lobby');
}
function startRecord(title){
	var i, u;
	
	$rec = {
		version: $data.version,
		me: $data.id,
		players: [],
		events: [],
		title: $data.room.title,
		roundTime: $data.room.time,
		round: $data.room.round,
		mode: $data.room.mode,
		limit: $data.room.limit,
		game: $data.room.game,
		opts: $data.room.opts,
		readies: $data.room.readies,
		time: (new Date()).getTime()
	};
	for(i in $data.room.players){
		var o;
		
		u = $data.users[$data.room.players[i]] || $data.room.players[i];
		o = { id: u.id, score: 0 };
		if(u.robot){
			o.id = u.id;
			o.robot = true;
			o.data = { score: 0 };
			u = { profile: getAIProfile(u.level) };
		}else{
			o.data = u.data;
			o.equip = u.equip;
		}
		o.title = "#" + u.id; // u.profile.title;
		// o.image = u.profile.image;
		$rec.players.push(o);
	}
	$data._record = true;
}
function stopRecord(){
	$data._record = false;
}
function recordEvent(data){
	if($data._replay) return;
	if(!$rec) return;
	var i, _data = data;

	if(!data.hasOwnProperty('type')) return;
	if(data.type == "room") return;
	if(data.type == "obtain") return;
	data = {};
	for(i in _data) data[i] = _data[i];
	if(data.profile) data.profile = { id: data.profile.id, title: "#" + data.profile.id };
	if(data.user) data.user = { id: data.user.profile.id, profile: { id: data.user.profile.id, title: "#" + data.user.profile.id }, data: { score: 0 }, equip: {} };
	
	$rec.events.push({
		data: data,
		time: (new Date()).getTime() - $rec.time
	});
}
function clearBoard(){
	$data._relay = false;
	loading();
	$stage.game.here.hide();
	$stage.dialog.result.hide();
	$stage.dialog.dress.hide();
	$stage.dialog.charFactory.hide();
	$(".jjoriping,.rounds,.game-body").removeClass("cw");
	$stage.game.display.empty();
	$stage.game.chain.hide();
	$stage.game.hints.empty().hide();
	$stage.game.cwcmd.hide();
	$stage.game.bb.hide();
	$stage.game.round.empty();
	$stage.game.history.empty();
	$stage.game.items.show().css('opacity', 0);
	$(".jjo-turn-time .graph-bar").width(0).css({ 'float': "", 'text-align': "", 'background-color': "" });
	$(".jjo-round-time .graph-bar").width(0).css({ 'float': "", 'text-align': "" }).removeClass("round-extreme");
	$(".game-user-bomb").removeClass("game-user-bomb");
}
function drawRound(round){
	var i;
	
	$stage.game.round.empty();
	for(i=0; i<$data.room.round; i++){
		$stage.game.round.append($l = $("<label>").html($data.room.game.title[i]));
		if((i+1) == round) $l.addClass("rounds-current");
	}
}
function turnGoing(){
	route("turnGoing");
}
function turnHint(data){
	route("turnHint", data);
}
function turnError(code, text){
	$stage.game.display.empty().append($("<label>").addClass("game-fail-text")
		.text((L['turnError_'+code] ? (L['turnError_'+code] + ": ") : "") + text)
	);
	playSound('fail');
	clearTimeout($data._fail);
	$data._fail = addTimeout(function(){
		$stage.game.display.html($data._char);
	}, 1800);
}
function getScore(id){
	if($data._replay) return $rec.users[id].game.score;
	else return ($data.users[id] || $data.robots[id]).game.score;
}
function addScore(id, score){
	if($data._replay) $rec.users[id].game.score += score;
	else ($data.users[id] || $data.robots[id]).game.score += score;
}
function drawObtainedScore($uc, $sc){
	$uc.append($sc);
	addTimeout(function(){ $sc.remove(); }, 2000);
	
	return $uc;
}
function turnEnd(id, data){
	route("turnEnd", id, data);
}
function roundEnd(result, data){
	if(!data) data = {};
	var i, o, r;
	var $b = $(".result-board").empty();
	var $o, $p;
	var lvUp, sc;
	var addit, addp;
	
	$(".result-me-expl").empty();
	$stage.game.display.html(L['roundEnd']);
	$data._resultPage = 1;
	$data._result = null;
	for(i in result){
		r = result[i];
		if($data._replay){
			o = $rec.users[r.id];
		}else{
			o = $data.users[r.id];
		}
		if(!o){
			o = NULL_USER;
		}
		if(!o.data) continue;
		if(!r.reward) continue;
		
		r.reward.score = $data._replay ? 0 : Math.round(r.reward.score);
		lvUp = getLevel(sc = o.data.score) > getLevel(o.data.score - r.reward.score);
		
		$b.append($o = $("<div>").addClass("result-board-item")
			.append($p = $("<div>").addClass("result-board-rank").html(r.rank + 1))
			.append(getLevelImage(sc).addClass("result-board-level"))
			.append($("<div>").addClass("result-board-name").html(o.profile.title || o.profile.name))
			.append($("<div>").addClass("result-board-score")
				.html(data.scores ? (L['avg'] + " " + commify(data.scores[r.id]) + L['kpm']) : (commify(r.score || 0) + L['PTS']))
			)
			.append($("<div>").addClass("result-board-reward").html(r.reward.score ? ("+" + commify(r.reward.score)) : "-"))
			.append($("<div>").addClass("result-board-lvup").css('display', lvUp ? "block" : "none")
				.append($("<i>").addClass("fa fa-arrow-up"))
				.append($("<div>").html(L['lvUp']))
			)
		);
		if(o.game.team) $p.addClass("team-" + o.game.team);
		if(r.id == $data.id){
			r.exp = o.data.score - r.reward.score;
			r.level = getLevel(r.exp);
			$data._result = r;
			$o.addClass("result-board-me");
			$(".result-me-expl").append(explainReward(r.reward._score, r.reward._money, r.reward._blog));
		}
	}
	$(".result-me").css('opacity', 0);
	$data._coef = 0;
	if($data._result){
		addit = $data._result.reward.score - $data._result.reward._score;
		addp = $data._result.reward.money - $data._result.reward._money;
		
		$data._result._exp = $data._result.exp;
		$data._result._score = $data._result.reward.score;
		$data._result._bonus = addit;
		$data._result._boing = $data._result.reward._score;
		$data._result._addit = addit;
		$data._result._addp = addp;
		
		if(addit > 0){
			addit = "<label class='result-me-bonus'>(+" + commify(addit) + ")</label>";
		}else addit = "";
		if(addp > 0){
			addp = "<label class='result-me-bonus'>(+" + commify(addp) + ")</label>";
		}else addp = "";
		
		notice(L['scoreGain'] + ": " + commify($data._result.reward.score) + ", " + L['moneyGain'] + ": " + commify($data._result.reward.money));
		$(".result-me").css('opacity', 1);
		$(".result-me-score").html(L['scoreGain']+" +"+commify($data._result.reward.score)+addit);
		$(".result-me-money").html(L['moneyGain']+" +"+commify($data._result.reward.money)+addp);
	}
	function roundEndAnimation(first){
		var v, nl;
		var going;
		
		$data._result.goal = EXP[$data._result.level - 1];
		$data._result.before = EXP[$data._result.level - 2] || 0;
		/*if(first){
			$data._result._before = $data._result.before;
		}*/
		if($data._result.reward.score > 0){
			v = $data._result.reward.score * $data._coef;
			if(v < 0.05 && $data._coef) v = $data._result.reward.score;
			
			$data._result.reward.score -= v;
			$data._result.exp += v;
			nl = getLevel($data._result.exp);
			if($data._result.level != nl){
				$data._result._boing -= $data._result.goal - $data._result._exp;
				$data._result._exp = $data._result.goal;
				playSound('lvup');
			}
			$data._result.level = nl;
			
			addTimeout(roundEndAnimation, 50);
		}
		going = $data._result.exp - $data._result._exp;
		draw('before', $data._result._exp, $data._result.before, $data._result.goal);
		draw('current', Math.min(going, $data._result._boing), 0, $data._result.goal - $data._result.before);
		draw('bonus', Math.max(0, going - $data._result._boing), 0, $data._result.goal - $data._result.before);
		
		$(".result-me-level-body").html($data._result.level);
		$(".result-me-score-text").html(commify(Math.round($data._result.exp)) + " / " + commify($data._result.goal));
	}
	function draw(phase, val, before, goal){
		$(".result-me-" + phase + "-bar").width((val - before) / (goal - before) * 100 + "%");
	}
	function explainReward(orgX, orgM, list){
		var $sb, $mb;
		var $R = $("<div>")
			.append($("<h4>").html(L['scoreGain']))
			.append($sb = $("<div>"))
			.append($("<h4>").html(L['moneyGain']))
			.append($mb = $("<div>"));
		
		row($sb, L['scoreOrigin'], orgX);
		row($mb, L['moneyOrigin'], orgM);
		list.forEach(function(item){
			var from = item.charAt(0);
			var type = item.charAt(1);
			var target = item.slice(2, 5);
			var value = Number(item.slice(5));
			var $t, vtx, org;
			
			if(target == 'EXP') $t = $sb, org = orgX;
			else if(target == 'MNY') $t = $mb, org = orgM;
			
			if(type == 'g') vtx = "+" + (org * value).toFixed(1);
			else if(type == 'h') vtx = "+" + Math.floor(value);
			
			row($t, L['bonusFrom_' + from], vtx);
		});
		function row($t, h, b){
			$t.append($("<h5>").addClass("result-me-blog-head").html(h))
				.append($("<h5>").addClass("result-me-blog-body").html(b));
		}
		return $R;
	}
	addTimeout(function(){
		showDialog($stage.dialog.result);
		if($data._result) roundEndAnimation(true);
		$stage.dialog.result.css('opacity', 0).animate({ opacity: 1 }, 500);
		addTimeout(function(){
			$data._coef = 0.05;
		}, 500);
	}, 2000);
	stopRecord();
}
function drawRanking(ranks){
	var $b = $(".result-board").empty();
	var $o, $v;
	var me;
	
	$data._resultPage = 2;
	if(!ranks) return $stage.dialog.resultOK.trigger('click');
	for(i in ranks.list){
		r = ranks.list[i];
		o = $data.users[r.id] || {
			profile: { title: L['hidden'] }
		};
		me = r.id == $data.id;
		
		$b.append($o = $("<div>").addClass("result-board-item")
			.append($("<div>").addClass("result-board-rank").html(r.rank + 1))
			.append(getLevelImage(r.score).addClass("result-board-level"))
			.append($("<div>").addClass("result-board-name").html(o.profile.title || o.profile.name))
			.append($("<div>").addClass("result-board-score").html(commify(r.score) + L['PTS']))
			.append($("<div>").addClass("result-board-reward").html(""))
			.append($v = $("<div>").addClass("result-board-lvup").css('display', me ? "block" : "none")
				.append($("<i>").addClass("fa fa-arrow-up"))
				.append($("<div>").html(ranks.prev - r.rank))
			)
		);
		
		if(me){
			if(ranks.prev - r.rank <= 0) $v.hide();
			$o.addClass("result-board-me");
		}
	}
}
function kickVoting(target){
	var op = $data.users[target].profile;
	
	$("#kick-vote-text").html((op.title || op.name) + L['kickVoteText']);
	$data.kickTime = 10;
	$data._kickTime = 10;
	$data._kickTimer = addTimeout(kickVoteTick, 1000);
	showDialog($stage.dialog.kickVote);
}
function kickVoteTick(){
	$(".kick-vote-time .graph-bar").width($data.kickTime / $data._kickTime * 300);
	if(--$data.kickTime > 0) $data._kickTimer = addTimeout(kickVoteTick, 1000);
	else $stage.dialog.kickVoteY.trigger('click');
}
function loadShop(){
	var $body = $("#shop-shelf");
	
	$body.html(L['LOADING']);
	processShop(function(res){
		$body.empty();
		if($data.guest) res.error = 423;
		if(res.error){
			$stage.menu.shop.trigger('click');
			return fail(res.error);
		}
		res.goods.sort(function(a, b){ return b.updatedAt - a.updatedAt; }).forEach(function(item, index, my){
			if(item.cost < 0) return;
			var url = iImage(false, item);
			
			$body.append($("<div>").attr('id', "goods_" + item._id).addClass("goods")
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + url + ")"))
				.append($("<div>").addClass("goods-title").html(iName(item._id)))
				.append($("<div>").addClass("goods-cost").html(commify(item.cost) + L['ping']))
				.append(explainGoods(item, false))
			.on('click', onGoods));
		});
		global.expl($body);
	});
	$(".shop-type.selected").removeClass("selected");
	$("#shop-type-all").addClass("selected");
}
function filterShop(by){
	var isAll = by === true;
	var $o, obj;
	var i;
	
	if(!isAll) by = by.split(',');
	for(i in $data.shop){
		obj = $data.shop[i];
		if(obj.cost < 0) continue;
		$o = $("#goods_" + i).show();
		if(isAll) continue;
		if(by.indexOf(obj.group) == -1) $o.hide();
	}
}
function explainGoods(item, equipped, expire){
	var i;
	var $R = $("<div>").addClass("expl dress-expl")
		.append($("<div>").addClass("dress-item-title").html(iName(item._id) + (equipped ? L['equipped'] : "")))
		.append($("<div>").addClass("dress-item-group").html(L['GROUP_' + item.group]))
		.append($("<div>").addClass("dress-item-expl").html(iDesc(item._id)));
	var $opts = $("<div>").addClass("dress-item-opts");
	var txt;
	
	if(item.term) $R.append($("<div>").addClass("dress-item-term").html(Math.floor(item.term / 86400) + L['DATE'] + " " + L['ITEM_TERM']));
	if(expire) $R.append($("<div>").addClass("dress-item-term").html((new Date(expire * 1000)).toLocaleString() + L['ITEM_TERMED']));
	for(i in item.options){
		if(i == "gif") continue;
		var k = i.charAt(0);
		
		txt = item.options[i];
		if(k == 'g') txt = "+" + (txt * 100).toFixed(1) + "%p";
		else if(k == 'h') txt = "+" + txt;
		
		$opts.append($("<label>").addClass("item-opts-head").html(L['OPTS_' + i]))
			.append($("<label>").addClass("item-opts-body").html(txt))
			.append($("<br>"));
	}
	if(txt) $R.append($opts);
	return $R;
}
function processShop(callback){
	var i;
	
	$.get("/shop", function(res){
		$data.shop = {};
		for(i in res.goods){
			$data.shop[res.goods[i]._id] = res.goods[i];
		}
		if(callback) callback(res);
	});
}
function onGoods(e){
	var id = $(e.currentTarget).attr('id').slice(6);
	var $obj = $data.shop[id];
	var my = $data.users[$data.id];
	var ping = my.money;
	var after = ping - $obj.cost;
	var $oj;
	var spt = L['surePurchase'];
	var i, ceq = {};
	
	if($data.box) if($data.box[id]) spt = L['alreadyGot'] + " " + spt;
	showDialog($stage.dialog.purchase, true);
	$("#purchase-ping-before").html(commify(ping) + L['ping']);
	$("#purchase-ping-cost").html(commify($obj.cost) + L['ping']);
	$("#purchase-item-name").html(L[id][0]);
	$oj = $("#purchase-ping-after").html(commify(after) + L['ping']);
	$("#purchase-item-desc").html((after < 0) ? L['notEnoughMoney'] : spt);
	for(i in my.equip) ceq[i] = my.equip[i];
	ceq[($obj.group == "Mhand") ? [ "Mlhand", "Mrhand" ][Math.floor(Math.random() * 2)] : $obj.group] = id;
	
	renderMoremi("#moremi-after", ceq);
	
	$data._sgood = id;
	$stage.dialog.purchaseOK.attr('disabled', after < 0);
	if(after < 0){
		$oj.addClass("purchase-not-enough");
	}else{
		$oj.removeClass("purchase-not-enough");
	}
}
function vibrate(level){
	if(level < 1) return;
	
	$("#Middle").css('padding-top', level);
	addTimeout(function(){
		$("#Middle").css('padding-top', 0);
		addTimeout(vibrate, 50, level * 0.7);
	}, 50);
}
function pushDisplay(text, mean, theme, wc){
	var len;
	var mode = MODE[$data.room.mode];
	var isKKT = mode == "KKT";
	var isRev = mode == "KAP";
	var beat = BEAT[len = text.length];
	var ta, kkt;
	var i, j = 0;
	var $l;
	var tick = $data.turnTime / 96;
	var sg = $data.turnTime / 12;
	
	$stage.game.display.empty();
	if(beat){
		ta = 'As' + $data._speed;
		beat = beat.split("");
	}else if(RULE[mode].lang == "en" && len < 10){
		ta = 'As' + $data._speed;
	}else{
		ta = 'Al';
		vibrate(len);
	}
	kkt = 'K'+$data._speed;
	
	if(beat){
		for(i in beat){
			if(beat[i] == "0") continue;
			
			$stage.game.display.append($l = $("<div>")
				.addClass("display-text")
				.css({ 'float': isRev ? "right" : "left", 'margin-top': -6, 'font-size': 36 })
				.hide()
				.html(isRev ? text.charAt(len - j - 1) : text.charAt(j))
			);
			j++;
			addTimeout(function($l, snd){
				var anim = { 'margin-top': 0 };
				
				playSound(snd);
				if($l.html() == $data.mission){
					playSound('mission');
					$l.css({ 'color': "#66FF66" });
					anim['font-size'] = 24;
				}else{
					anim['font-size'] = 20;
				}
				$l.show().animate(anim, 100);
			}, Number(i) * tick, $l, ta);
		}
		i = $stage.game.display.children("div").get(0);
		$(i).css(isRev ? 'margin-right' : 'margin-left', ($stage.game.display.width() - 20 * len) * 0.5);
	}else{
		j = "";
		if(isRev) for(i=0; i<len; i++){
			addTimeout(function(t){
				playSound(ta);
				if(t == $data.mission){
					playSound('mission');
					j = "<label style='color: #66FF66;'>" + t + "</label>" + j;
				}else{
					j = t + j;
				}
				$stage.game.display.html(j);
			}, Number(i) * sg / len, text[len - i - 1]);
		}
		else for(i=0; i<len; i++){
			addTimeout(function(t){
				playSound(ta);
				if(t == $data.mission){
					playSound('mission');
					j += "<label style='color: #66FF66;'>" + t + "</label>";
				}else{
					j += t;
				}
				$stage.game.display.html(j);
			}, Number(i) * sg / len, text[i]);
		}
	}
	addTimeout(function(){
		for(i=0; i<3; i++){
			addTimeout(function(v){
				if(isKKT){
					if(v == 1) return;
					else playSound('kung');
				}
				(beat ? $stage.game.display.children(".display-text") : $stage.game.display)
					.css('font-size', 21)
					.animate({ 'font-size': 20 }, tick);
			}, i * tick * 2, i);
		}
		addTimeout(pushHistory, tick * 4, text, mean, theme, wc);
		if(!isKKT) playSound(kkt);
	}, sg);
}
function pushHint(hint){
	var v = processWord("", hint);
	var $obj;
	
	$stage.game.hints.append(
		$obj = $("<div>").addClass("hint-item")
			.append($("<label>").html(v))
			.append($("<div>").addClass("expl").css({ 'white-space': "normal", 'width': 200 }).html(v.html()))
	);
	if(!mobile) $obj.width(0).animate({ width: 215 });
	global.expl($obj);
}
function pushHistory(text, mean, theme, wc){
	var $v, $w, $x;
	var wcs = wc ? wc.split(',') : [], wd = {};
	var val;
	
	$stage.game.history.prepend($v = $("<div>")
		.addClass("ellipse history-item")
		.width(0)
		.animate({ width: 200 })
		.html(text)
	);
	$w = $stage.game.history.children();
	if($w.length > 6){
		$w.last().remove();
	}
	val = processWord(text, mean, theme, wcs);
	/*val = mean;
	if(theme) val = "<label class='history-theme-c'>&lt;" + theme + "&gt;</label> " + val;*/
	
	wcs.forEach(function(item){
		if(wd[item]) return;
		if(!L['class_'+item]) return;
		wd[item] = true;
		$v.append($("<label>").addClass("history-class").html(L['class_'+item]));
	});
	$v.append($w = $("<div>").addClass("history-mean ellipse").append(val))
		.append($x = $("<div>").addClass("expl").css({ 'width': 200, 'white-space': "normal" })
			.html("<h5 style='color: #BBBBBB;'>" + val.html() + "</h5>")
		);
	global.expl($v);
}
function processNormal(word, mean){
	return $("<label>").addClass("word").html(mean);
}
function processWord(word, _mean, _theme, _wcs){
	if(!_mean || _mean.indexOf("＂") == -1) return processNormal(word, _mean);
	var $R = $("<label>").addClass("word");
	var means = _mean.split(/＂[0-9]+＂/).slice(1).map(function(m1){
		return (m1.indexOf("［") == -1) ? [[ m1 ]] : m1.split(/［[0-9]+］/).slice(1).map(function(m2){
			return m2.split(/（[0-9]+）/).slice(1);
		});
	});
	var types = _wcs ? _wcs.map(function(_wc){
		return L['class_' + _wc];
	}) : [];
	var themes = _theme ? _theme.split(',').map(function(_t){
		return L['theme_' + _t];
	}) : [];
	var ms = means.length > 1;
	
	means.forEach(function(m1, x1){
		var $m1 = $("<label>").addClass("word-m1");
		var m1s = m1.length > 1;
		
		if(ms) $m1.append($("<label>").addClass("word-head word-m1-head").html(x1 + 1));
		m1.forEach(function(m2, x2){
			var $m2 = $("<label>").addClass("word-m2");
			var m2l = m2.length;
			var m2s = m2l > 1;
			var tl = themes.splice(0, m2l);
			
			if(m1s) $m2.append($("<label>").addClass("word-head word-m2-head").html(x2 + 1));
			m2.forEach(function(m3, x3){
				var $m3 = $("<label>").addClass("word-m3");
				var _t = tl.shift();
				
				if(m2s) $m3.append($("<label>").addClass("word-head word-m3-head").html(x3 + 1));
				if(_t) $m3.append($("<label>").addClass("word-theme").html(_t));
				$m3.append($("<label>").addClass("word-m3-body").html(formMean(m3)));
				
				$m2.append($m3);
			});
			$m1.append($m2);
		});
		$R.append($m1);
	});
	function formMean(v){
		return v.replace(/\$\$[^\$]+\$\$/g, function(item){
			var txt = item.slice(2, item.length - 2)
				.replace(/\^\{([^\}]+)\}/g, "<sup>$1</sup>")
				.replace(/_\{([^\}]+)\}/g, "<sub>$1</sub>")
				.replace(/\\geq/g, "≥")
			;
			
			return "<equ>" + txt + "</equ>";
		})
		.replace(/\*\*([^\*]+)\*\*/g, "<sup>$1</sup>")
		.replace(/\*([^\*]+)\*/g, "<sub>$1</sub>");
	}
	return $R;
}
function getCharText(char, subChar, wordLength){
	var res = char + (subChar ? ("("+subChar+")") : "");
	
	if(wordLength) res += "<label class='jjo-display-word-length'>(" + wordLength + ")</label>";
	
	return res;
}
function getRequiredScore(lv){
	return Math.round(
		(!(lv%5)*0.3 + 1) * (!(lv%15)*0.4 + 1) * (!(lv%45)*0.5 + 1) * (
			120 + Math.floor(lv/5)*60 + Math.floor(lv*lv/225)*120 + Math.floor(lv*lv/2025)*180
		)
	);
}
function getLevel(score){
	var i, l = EXP.length;
	
	for(i=0; i<l; i++) if(score < EXP[i]) break;
	return i+1;
}
function getLevelImage(score){
	var lv = getLevel(score) - 1;
	var lX = (lv % 25) * -100;
	var lY = Math.floor(lv * 0.04) * -100;
	
	// return getImage("/img/kkutu/lv/lv" + zeroPadding(lv+1, 4) + ".png");
	return $("<div>").css({
		'float': "left",
		'background-image': "url('/img/kkutu/lv/newlv.png')",
		'background-position': lX + "% " + lY + "%",
		'background-size': "2560%"
	});
}
function getImage(url){
	return $("<div>").addClass("jt-image").css('background-image', "url('"+url+"')");
}
function getOptions(mode, opts, hash){
	var R = [ L["mode"+MODE[mode]] ];
	var i, k;
	
	for(i in OPTIONS){
		k = OPTIONS[i].name.toLowerCase();
		if(opts[k]) R.push(L['opt' + OPTIONS[i].name]);
	}
	if(hash) R.push(opts.injpick.join('|'));
	
	return hash ? R.toString() : R;
}
function setRoomHead($obj, room){
	var opts = getOptions(room.mode, room.opts);
	var rule = RULE[MODE[room.mode]];
	var $rm;
	
	$obj.empty()
		.append($("<h5>").addClass("room-head-number").html("["+(room.practice ? L['practice'] : room.id)+"]"))
		.append($("<h5>").addClass("room-head-title").text(badWords(room.title)))
		.append($rm = $("<h5>").addClass("room-head-mode").html(opts.join(" / ")))
		.append($("<h5>").addClass("room-head-limit").html((mobile ? "" : (L['players'] + " ")) + room.players.length + " / " +room.limit))
		.append($("<h5>").addClass("room-head-round").html(L['rounds'] + " " + room.round))
		.append($("<h5>").addClass("room-head-time").html(room.time + L['SECOND']));
		
	if(rule.opts.indexOf("ijp") != -1){
		$rm.append($("<div>").addClass("expl").html("<h5>" + room.opts.injpick.map(function(item){
			return L["theme_" + item];
		}) + "</h5>"));
		global.expl($obj);
	}
}
function loadSounds(list, callback){
	$data._lsRemain = list.length;
	
	list.forEach(function(v){
		getAudio(v.key, v.value, callback);
	});
}
function getAudio(k, url, cb){
	var req = new XMLHttpRequest();
	
	req.open("GET", /*($data.PUBLIC ? "http://jjo.kr" : "") +*/ url);
	req.responseType = "arraybuffer";
	req.onload = function(e){
		if(audioContext) audioContext.decodeAudioData(e.target.response, function(buf){
			$sound[k] = buf;
			done();
		}, onErr); else onErr();
	};
	function onErr(err){
		$sound[k] = new AudioSound(url);
		done();
	}
	function done(){
		if(--$data._lsRemain == 0){
			if(cb) cb();
		}else loading(L['loadRemain'] + $data._lsRemain);
	}
	function AudioSound(url){
		var my = this;
		
		this.audio = new Audio(url);
		this.audio.load();
		this.start = function(){
			my.audio.play();
		};
		this.stop = function(){
			my.audio.currentTime = 0;
			my.audio.pause();
		};
	}
	req.send();
}
function playBGM(key, force){
	if($data.bgm) $data.bgm.stop();
	
	return $data.bgm = playSound(key, true);
}
function stopBGM(){
	if($data.bgm){
		$data.bgm.stop();
		delete $data.bgm;
	}
}
function playSound(key, loop){
	var src, sound;
	var mute = (loop && $data.muteBGM) || (!loop && $data.muteEff);
	
	sound = $sound[key] || $sound.missing;
	if(window.hasOwnProperty("AudioBuffer") && sound instanceof AudioBuffer){
		src = audioContext.createBufferSource();
		src.startedAt = audioContext.currentTime;
		src.loop = loop;
		if(mute){
			src.buffer = audioContext.createBuffer(2, sound.length, audioContext.sampleRate);
		}else{
			src.buffer = sound;
		}
		src.connect(audioContext.destination);
	}else{
		if(sound.readyState) sound.audio.currentTime = 0;
		sound.audio.loop = loop || false;
		sound.audio.volume = mute ? 0 : 1;
		src = sound;
	}
	if($_sound[key]) $_sound[key].stop();
	$_sound[key] = src;
	src.key = key;
	src.start();
	/*if(sound.readyState) sound.currentTime = 0;
	sound.loop = loop || false;
	sound.volume = ((loop && $data.muteBGM) || (!loop && $data.muteEff)) ? 0 : 1;
	sound.play();*/
	
	return src;
}
function stopAllSounds(){
	var i;
	
	for(i in $_sound) $_sound[i].stop();
}
function tryJoin(id){
	var pw;
	
	if(!$data.rooms[id]) return;
	if($data.rooms[id].password){
		pw = prompt(L['putPassword']);
		if(!pw) return;
	}
	$data._pw = pw;
	send('enter', { id: id, password: pw });
}
function clearChat(){
	$("#Chat").empty();
}
function forkChat(){
	var $cs = $("#Chat,#chat-log-board");
	var lh = $cs.children(".chat-item").last().get(0);
	
	if(lh) if(lh.tagName == "HR") return;
	$cs.append($("<hr>").addClass("chat-item"));
	$stage.chat.scrollTop(999999999);
}
function badWords(text){
	return text.replace(BAD, "♥♥");
}
function chatBalloon(text, id, flag){
	$("#cb-" + id).remove();
	var offset = ((flag & 2) ? $("#game-user-" + id) : $("#room-user-" + id)).offset();
	var img = (flag == 2) ? "chat-balloon-bot" : "chat-balloon-tip";
	var $obj = $("<div>").addClass("chat-balloon")
		.attr('id', "cb-" + id)
		.append($("<div>").addClass("jt-image " + img))
		[(flag == 2) ? 'prepend' : 'append']($("<h4>").text(text));
	var ot, ol;
	
	if(!offset) return;
	$stage.balloons.append($obj);
	if(flag == 1) ot = 0, ol = 220;
	else if(flag == 2) ot = 35 - $obj.height(), ol = -2;
	else if(flag == 3) ot = 5, ol = 210;
	else ot = 40, ol = 110;
	$obj.css({ top: offset.top + ot, left: offset.left + ol });
	addTimeout(function(){
		$obj.animate({ 'opacity': 0 }, 500, function(){ $obj.remove(); });
	}, 2500);
}
function chat(profile, msg, from, timestamp){
	var time = timestamp ? new Date(timestamp) : new Date();
	var equip = $data.users[profile.id] ? $data.users[profile.id].equip : {};
	var $bar, $msg, $item;
	var link;
	
	if($data._shut[profile.title || profile.name]) return;
	if(from){
		if($data.opts.dw) return;
		if($data._wblock[from]) return;
	}
	msg = badWords(msg);
	playSound('k');
	stackChat();
	if(!mobile && $data.room){
		$bar = ($data.room.gaming ? 2 : 0) + ($(".jjoriping").hasClass("cw") ? 1 : 0);
		chatBalloon(msg, profile.id, $bar);
	}
	$stage.chat.append($item = $("<div>").addClass("chat-item")
		.append($bar = $("<div>").addClass("chat-head ellipse").text(profile.title || profile.name))
		.append($msg = $("<div>").addClass("chat-body").text(msg))
		.append($("<div>").addClass("chat-stamp").text(time.toLocaleTimeString()))
	);
	if(timestamp) $bar.prepend($("<i>").addClass("fa fa-video-camera"));
	$bar.on('click', function(e){
		requestProfile(profile.id);
	});
	$stage.chatLog.append($item = $item.clone());
	$item.append($("<div>").addClass("expl").css('font-weight', "normal").html("#" + (profile.id || "").substr(0, 5)));
	
	if(link = msg.match(/https?:\/\/[\w\.\?\/&#%=-_\+]+/g)){
		msg = $msg.html();
		link.forEach(function(item){
			msg = msg.replace(item, "<a href='#' style='color: #2222FF;' onclick='if(confirm(\"" + L['linkWarning'] + "\")) window.open(\"" + item + "\");'>" + item + "</a>");
		});
		$msg.html(msg);
	}
	if(from){
		if(from !== true) $data._recentFrom = from;
		$msg.html("<label style='color: #7777FF; font-weight: bold;'>&lt;" + L['whisper'] + "&gt;</label>" + $msg.html());
	}
	addonNickname($bar, { equip: equip });
	$stage.chat.scrollTop(999999999);
}
function notice(msg, head){
	var time = new Date();
	
	playSound('k');
	stackChat();
	$("#Chat,#chat-log-board").append($("<div>").addClass("chat-item chat-notice")
		.append($("<div>").addClass("chat-head").text(head || L['notice']))
		.append($("<div>").addClass("chat-body").html(msg))
		.append($("<div>").addClass("chat-stamp").text(time.toLocaleTimeString()))
	);
	$stage.chat.scrollTop(999999999);
	if(head == "tail") console.warn(time.toLocaleString(), msg);
}
function stackChat(){
	var $v = $("#Chat .chat-item");
	var $w = $("#chat-log-board .chat-item");
	
	if($v.length > 99){
		$v.first().remove();
	}
	if($w.length > 199){
		$w.first().remove();
	}
}
function iGoods(key){
	var obj;
	
	if(key.charAt() == "$"){
		obj = $data.shop[key.slice(0, 4)];
	}else{
		obj = $data.shop[key];
	}
	return {
		_id: key,
		group: obj.group,
		term: obj.term,
		name: iName(key),
		cost: obj.cost,
		image: iImage(key, obj),
		desc: iDesc(key),
		options: obj.options
	};
}
function iName(key){
	if(key.charAt() == "$") return L[key.slice(0, 4)][0] + ' - ' + key.slice(4);
	else return L[key][0];
}
function iDesc(key){
	if(key.charAt() == "$") return L[key.slice(0, 4)][1];
	else return L[key][1];
}
function iImage(key, sObj){
	var obj;
	var gif;
	
	if(key){
		if(key.charAt() == "$"){
			return iDynImage(key.slice(1, 4), key.slice(4));
		}
	}else if(typeof sObj == "string") sObj = { _id: "def", group: sObj, options: {} };
	obj = $data.shop[key] || sObj;
	gif = obj.options.hasOwnProperty('gif') ? ".gif" : ".png";
	if(obj.group.slice(0, 3) == "BDG") return "/img/kkutu/moremi/badge/" + obj._id + gif;
	return (obj.group.charAt(0) == 'M')
		? "/img/kkutu/moremi/" + obj.group.slice(1) + "/" + obj._id + gif
		: "/img/kkutu/shop/" + obj._id + ".png";
}
function iDynImage(group, data){
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext('2d');
	var i;
	
	canvas.width = canvas.height = 50;
	ctx.font = "24px NBGothic";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	switch(group){
		case 'WPC':
		case 'WPB':
		case 'WPA':
			i = [ 'WPC', 'WPB', 'WPA' ].indexOf(group);
			ctx.beginPath();
			ctx.arc(25, 25, 25, 0, 2 * Math.PI);
			ctx.fillStyle = [ "#DDDDDD", "#A6C5FF", "#FFEF31" ][i];
			ctx.fill();
			ctx.fillStyle = [ "#000000", "#4465C3", "#E69D12" ][i];
			ctx.fillText(data, 25, 25);
			break;
		default:
	}
	return canvas.toDataURL();
}
function queueObtain(data){
	if($stage.dialog.obtain.is(':visible')){
		$data._obtain.push(data);
	}else{
		drawObtain(data);
		showDialog($stage.dialog.obtain, true);
	}
}
function drawObtain(data){
	playSound('success');
	$("#obtain-image").css('background-image', "url(" + iImage(data.key) + ")");
	$("#obtain-name").html(iName(data.key));
}
function renderMoremi(target, equip){
	var $obj = $(target).empty();
	var LR = { 'Mlhand': "Mhand", 'Mrhand': "Mhand" };
	var i, key;
	
	if(!equip) equip = {};
	for(i in MOREMI_PART){
		key = 'M' + MOREMI_PART[i];
		
		$obj.append($("<img>")
			.addClass("moremies moremi-" + key.slice(1))
			.attr('src', iImage(equip[key], LR[key] || key))
			.css({ 'width': "100%", 'height': "100%" })
		);
	}
	if(key = equip['BDG']){
		$obj.append($("<img>")
			.addClass("moremies moremi-badge")
			.attr('src', iImage(key))
			.css({ 'width': "100%", 'height': "100%" })
		);
	}
	$obj.children(".moremi-back").after($("<img>").addClass("moremies moremi-body")
		.attr('src', equip.robot ? "/img/kkutu/moremi/robot.png" : "/img/kkutu/moremi/body.png")
		.css({ 'width': "100%", 'height': "100%" })
	);
	$obj.children(".moremi-rhand").css('transform', "scaleX(-1)");
}
function commify(val){
	var tester = /(^[+-]?\d+)(\d{3})/;
	
	if(val === null) return "?";
	
	val = val.toString();
	while(tester.test(val)) val = val.replace(tester, "$1,$2");
	
	return val;
}
function setLocation(place){
	if(place) location.hash = "#"+place;
	else location.hash = "";
}
function fail(code){
	return alert(L['error_' + code]);
}
function yell(msg){
	$stage.yell.show().css('opacity', 1).html(msg);
	addTimeout(function(){
		$stage.yell.animate({ 'opacity': 0 }, 3000);
		addTimeout(function(){
			$stage.yell.hide();
		}, 3000);
	}, 1000);
}

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

delete window.WebSocket;
delete window.setInterval;