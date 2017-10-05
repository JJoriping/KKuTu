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

/**
 * 볕뉘 수정사항:
 * getCookie 코드오류로 인한 코드 수정
 */
var global = {};
var L;

(function(){
	var size;
	var _setTimeout = setTimeout;
	
	function setCookie(cName, cValue, cDay){
        var expire = new Date();
		
        expire.setDate(expire.getDate() + cDay);
        cookies = cName + '=' + escape(cValue) + '; path=/ ';
        if(typeof cDay != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
		
        document.cookie = cookies;
    }
    function getCookie(cName) {
        //볕뉘 수정
        var cName = cName+"=";
		var allCookie = decodeURIComponent(document.cookie).split(';');
		var cval = [];
		for(var i=0; i < allCookie.length; i++) {
			if (allCookie[i].trim().indexOf(cName) == 0) {
				cval = allCookie[i].trim().split("=");
			}
		}
		return unescape((cval.length > 0) ? cval[1] : "");
		//볕뉘 수정 끝
    }
	
	$.prototype.hotkey = function($f, code){
		var $this = $(this);
		($f || $(window)).on("keydown", function(e){
			if(!e.shiftKey){
				if(e.keyCode == code){
					// $("#JJoSearchTF").expl();
					$this.trigger("click");
					e.preventDefault();
				}
			}
		});
		return $this;
	};
	$.prototype.color = function(hex){
		return $(this).css({ 'color': hex });
	};
	$.prototype.bgColor = function(hex){
		return $(this).css({ 'background-color': hex });
	};
	$.cookie = function(key, value){
		if(value === undefined){
			return getCookie(key);
		}else{
			setCookie(key, value);
		}
	};
	$(document).ready(function(e){
		const LANG = {
			'ko_KR': "한국어"
		};
		var $gn = $("#global-notice").hide();
		var $c;
		var explSize;
		var gn = $("#gn-content").html() || "";
		
		global.profile = $("#profile").html();
		if(global.profile) global.profile = JSON.parse(global.profile);
		else global.profile = {};
		
		$.cookie('test', "good");
		if($.cookie('test') != "good"){
			$gn.html(gn = "쿠키 사용이 차단되어 있습니다. 로그인 관련 기능이 제한됩니다.<br>제한을 풀기 위해서는 브라우저 설정에서 쿠키 사용을 허용하도록 설정해야 합니다.<br>" + gn);
		}else{
			$.cookie('test', "");
		}
		if(gn.length > 1) $gn.show();
		$gn.on('click', function(e){ $gn.hide(); });
		
		$(window).on('resize', function(e){
			size = [ $(window).width(), $(window).height() ];
			
			$("#Middle").css('margin-left', Math.max(0, size[0] * 0.5 - 500));
			$("#Bottom").width(size[0]);
		}).on('mousemove', function(e){
			if(explSize == null) return;
			$(".expl-active").css({ 'left': Math.min(e.clientX + 5, size[0] - explSize[0] - 12), 'top': Math.min(e.clientY + 23, size[1] - explSize[1] - 12) });
		}).trigger('resize');
		
		$("#quick-search-btn").on('click', function(e){
			var v;
			
			if($("#quick-search-btn").hasClass("searching")) return;
			if(v = $(".autocomp-select").html()) $("#quick-search-tf").val(v);
			$("#quick-search-btn").addClass("searching").html($("<i>").addClass("fa fa-spin fa-spinner"));
			location.href = "http://jjo.kr?q=" + encodeURI($("#quick-search-tf").val());
		}).hotkey($("#quick-search-tf"), 13);
	
	// 계정
		if($.cookie('lc') == "") $.cookie('lc', "ko_KR");
		
		if(global.profile.token){
			$("#account-info").html(global.profile.title || global.profile.name).on('click', function(e){
				if(confirm(L['ASK_LOGOUT'])) requestLogout(e);
			});
		}else{
			if(window['FB']){
				try{
					FB.logout();
				}catch(e){
					_setTimeout(function(){ FB.logout(); }, 1000);
				}
			}
			$("#account-info").html(L['LOGIN']).on('click', requestLogin);
		}
		/*if($.cookie('forlogout')){
			requestLogout();
		}*/
		global.watchInput($("#quick-search-tf"));
		(global.expl = function($mother){
			var $q = $mother ? $mother.find(".expl") : $(".expl");
			
			$q.parent().addClass("expl-mother").on('mouseenter', function(e){
				var $e = $(e.currentTarget).children(".expl");
				
				explSize = [ $e.width(), $e.height() ];
				$(".expl-active").removeClass("expl-active");
				$e.addClass("expl-active");
			}).on('mouseleave', function(e){
				$(e.currentTarget).children(".expl").removeClass("expl-active");
			});
		})();
	});
	function requestLogin(e){
		var tl = [ (size[0] - 200) * 0.5, (size[1] - 300) * 0.5 ];
		
		// $.cookie('preprev', location.href);
		location.href = "/login";
	}
	function requestLogout(e){
		/*if(location.host == "kkutu.kr"){
			// $.cookie('forlogout', "true");
			location.href = "/logout";
			return;
		}*/
		//볕뉘 수정 구문 삭제(161~167, facebook js SDK 대응코드 삭제)
		location.href = "/logout";
	}
	function onWatchInput($o, prev){
		var cid = $o.attr('id');
		var $ac = $("#ac-"+cid);
		
		if($o.val() != prev){
			if(prev = $o.val()){
				$.get("http://jjo.kr/search?q=" + encodeURI(prev), function(res){
					var i, c = 0;
					
					$ac.empty();
					global['wl-'+cid] = res.list.slice(0, 10);
					global['wi-'+cid] = -1;
					for(i in res.list){
						if(c++ >= 10) break;
						$ac.append($("<div>")
							.attr('id', "aci-" + res.list[i]._id)
							.addClass("autocomp-item ellipse")
							.html(res.list[i].profile.name)
							.on('click', function(e){
								location.href = "http://jjo.kr/users/" + $(e.currentTarget).attr('id').slice(4);
							})
						);
					}
					if(c){
						$ac.show();
						$o.css('border-bottom-left-radius', 0);
					}else{
						$ac.hide();
						$o.css('border-bottom-left-radius', "");
					}
				});
			}else{
				$ac.hide();
				$o.css('border-bottom-left-radius', "");
			}
		}
		_setTimeout(onWatchInput, 200, $o, prev);
	}
	global.watchInput = function($tf){
		var cid = $tf.attr('id');
		
		$tf.after($("<div>")
			.addClass("autocomp")
			.attr('id', "ac-"+cid)
			.css({
				'margin-top': $tf.outerHeight(),
				'width': $tf.outerWidth() - 6
			})
			.hide()
		).on('keydown', function(e){
			var dir = (e.keyCode == 38) ? -1 : (e.keyCode == 40) ? 1 : 0;
			var list;
			
			if(!dir) return;
			if(!(list = global['wl-'+cid])) return;
			if(global['wi-'+cid] == -1) if(dir == -1) dir = 0;
			
			$(".autocomp-select").removeClass("autocomp-select");
			global['wi-'+cid] += dir;
			if(global['wi-'+cid] < 0) global['wi-'+cid] += list.length;
			if(global['wi-'+cid] >= list.length) global['wi-'+cid] = 0;
			
			$("#aci-" + list[global['wi-'+cid]]._id).addClass("autocomp-select");
			e.preventDefault();
		});
		return _setTimeout(onWatchInput, 200, $tf, $tf.val());
	};
	global.zeroPadding = function(num, len){ var s = num.toString(); return "000000000000000".slice(0, Math.max(0, len - s.length)) + s; };
	global.onPopup = function(url){
		location.href = url;
	};
})();