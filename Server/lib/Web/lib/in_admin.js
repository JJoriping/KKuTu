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

(function(){
	var WIDTH = { 'y': 50, 't': 50, 'g': 100, 'l': 200, 'm': 600 };
	var $temp = {};
	
	$(document).ready(function(){
	// 끄투 DB에 단어 추가하기
		$("#db-ok").on('click', function(e){
			var forView = $("#db-theme").val().charAt() == "~";
			
			if(forView){
				$("#db-list").val("");
				$.get("/gwalli/kkututheme?theme=" + $("#db-theme").val().slice(1) + "&lang=" + $("#db-lang").val(), function(res){
					$("#db-list").val(res.list.join('\n'));
				});
			}else{
				$.post("/gwalli/kkutudb", {
					pw: $("#db-password").val(),
					lang: $("#db-lang").val(),
					theme: $("#db-theme").val(),
					list: $("#db-list").val()
				}, function(res){
					alert(res);
				});
			}
		});
	
	// 어인정 신청
		$("#injeong-go").on('click', function(e){
			$.get("/gwalli/injeong", function(res){
				var $table = $("#injeong-data").empty();
				var $r;
				
				res.list.forEach(function(item){
					$table.append($r = $("<tr>").attr('id', ['ir', item._id.replace(/ /g, "-")].join('-')));
					$r
						.append($("<td>").append(putter("ij-" + item._id + "-check", 'y').attr('type', "checkbox")))
						.append($("<td>").append($("<a>").attr({ 'target': "_blank", 'href': "https://namu.moe/w/" + encodeURI(item._id) }).html("이동")))
						.append($("<td>").append(putter("ij-" + item._id + "-_id", 'l', item._id)))
						.append($("<td>").append(putter("ij-" + item._id + "-theme", 'g', item.theme)))
						.append($("<td>").append(putter("ij-" + item._id + "-writer", 'g', item.writer)))
						.append($("<td>").append(putter("ij-" + item._id + "-createdAt", 'g', item.createdAt)))
				});
			});
		});
		$("#injeong-everything").on('click', function(e){
			$("#injeong-data input[type='checkbox']").prop('checked', true);
		});
		$("#injeong-nothing").on('click', function(e){
			$("#injeong-data input[type='checkbox']").prop('checked', false);
		});
		$("#injeong-apply").on('click', function(e){
			var list = [];
			
			$("#injeong-data tr:visible").each(function(i, o){
				var $data = $(o).find("td>input");
				
				list.push({
					_origin: o.id.slice(3).replace(/-/g, " "),
					_id: $data.get(1).value,
					theme: $data.get(2).value,
					ok: $($data.get(0)).is(':checked')
				});
			});
			$.post("/gwalli/injeong", { list: JSON.stringify({ list: list }), pw: $("#db-password").val() }, function(res){
				alert(res);
			});
		});
	
	// 상점 DB 다루기
		$("#shop-go").on('click', function(e){
			$.get("/gwalli/shop/" + $("#shop-word").val(), function(res){
				var $table = $("#shop-data").empty();
				var i, $r;
				
				res.goods.forEach(function(item){
					$table.append($r = $("<tr>").attr('id', ['gu', item._id].join('-')));
					$r
						.append($("<td>").append(putter("si-" + item._id + "-_id", 'g', item._id)))
						.append($("<td>").append(putter("si-" + item._id + "-cost", 'y', item.cost)))
						.append($("<td>").append(putter("si-" + item._id + "-hit", 'y', item.hit)))
						.append($("<td>").append(putter("si-" + item._id + "-term", 'y', item.term)))
						.append($("<td>").append(putter("si-" + item._id + "-group", 'y', item.group)))
						.append($("<td>").append(putter("si-" + item._id + "-updatedAt", 'y', item.updatedAt)))
						.append($("<td>").append(putter("si-" + item._id + "-options", 'l', JSON.stringify(item.options || {}))))
						.append($("<td>").append(putter("si-" + item._id + "-name_ko_KR", 'l')))
						.append($("<td>").append(putter("si-" + item._id + "-desc_ko_KR", 'l')))
						.append($("<td>").append(putter("si-" + item._id + "-name_en_US", 'l')))
						.append($("<td>").append(putter("si-" + item._id + "-desc_en_US", 'l')));
				});
				res.desc.forEach(function(item){
					var id = item._id.replace("$", "\\$");
					
					for(i in item){
						if(i == "_id") continue;
						$("#si-" + id + "-" + i).val(item[i]);
					}
				});
			});
		});
		$("#shop-hide").on('click', function(e){
			$("#shop-data tr:not(.gu-new)").toggle();
		});
		$("#shop-add").on('click', function(e){
			var nid = prompt("식별자");
			
			if(!nid) return;
			$("#shop-data").append($("<tr>").attr('id', "gu-" + nid)
				.addClass("gu-new")
				.append($("<td>").append(putter("si-" + nid + "-_id", 'g', nid)))
				.append($("<td>").append(putter("si-" + nid + "-cost", 'y')))
				.append($("<td>").append(putter("si-" + nid + "-hit", 'y')))
				.append($("<td>").append(putter("si-" + nid + "-term", 'y')))
				.append($("<td>").append(putter("si-" + nid + "-group", 'y')))
				.append($("<td>").append(putter("si-" + nid + "-updatedAt", 'y')))
				.append($("<td>").append(putter("si-" + nid + "-options", 'l', "{}")))
				.append($("<td>").append(putter("si-" + nid + "-name_ko_KR", 'l')))
				.append($("<td>").append(putter("si-" + nid + "-desc_ko_KR", 'l')))
				.append($("<td>").append(putter("si-" + nid + "-name_en_US", 'l')))
				.append($("<td>").append(putter("si-" + nid + "-desc_en_US", 'l')))
			);
		});
		$("#shop-apply").on('click', function(e){
			var list = [];
			
			$("#shop-data tr:visible").each(function(i, o){
				var $data = $(o).find("td>input");
				
				list.push({
					_id: $data.get(0).value,
					core: {
						cost: $data.get(1).value,
						hit: $data.get(2).value || 0,
						term: $data.get(3).value || 0,
						group: $data.get(4).value,
						updatedAt: $data.get(5).value || (new Date()).getTime(),
						options: $data.get(6).value,
					},
					text: {
						name_ko_KR: $data.get(7).value,
						desc_ko_KR: $data.get(8).value,
						name_en_US: $data.get(9).value,
						desc_en_US: $data.get(10).value,
					}
				});
			});
			$.post("/gwalli/shop", {
				list: JSON.stringify({ list: list }),
				pw: $("#db-password").val()
			}, function(res){
				alert(res);
			});
		});
	// 유저 DB 다루기
		$("#user-go").on('click', function(e){
			$.get("/gwalli/users?id=" + $("#user-id").val() + "&name=" + $("#user-nick").val(), function(res){
				var $table = $("#user-data").empty();
				var $r;
				
				res.list.forEach(function(item){
					$table.append($r = $("<tr>").attr('id', ['ur', item._id].join('-')));
					$r
						.append($("<td>").append(putter("ud-" + item._id + "-_id", 'g', item._id)))
						.append($("<td>").append(putter("ud-" + item._id + "-money", 'g', item.money)))
						.append($("<td>").append(putter("ud-" + item._id + "-kkutu", 'l', JSON.stringify(item.kkutu || {}))))
						.append($("<td>").append(putter("ud-" + item._id + "-box", 'l', JSON.stringify(item.box || {}))))
						.append($("<td>").append(putter("ud-" + item._id + "-equip", 'l', JSON.stringify(item.equip || {}))))
						.append($("<td>").append(putter("ud-" + item._id + "-exordial", 'g', item.exordial)))
						.append($("<td>").append(putter("ud-" + item._id + "-server", 't', item.server)))
						.append($("<td>").append(putter("ud-" + item._id + "-lastLogin", 't', item.lastLogin)))
						.append($("<td>").append(putter("ud-" + item._id + "-black", 'g', item.black)))
						.append($("<td>").append(putter("ud-" + item._id + "-friends", 'g', JSON.stringify(item.friends || {}))));
				});
			});
		});
		$("#user-apply").on('click', function(e){
			var list = [];
			
			$("#user-data tr:visible").each(function(i, o){
				var $data = $(o).find("td>input");
				
				list.push({
					_id: $data.get(0).value,
					money: $data.get(1).value,
					kkutu: $data.get(2).value,
					box: $data.get(3).value,
					equip: $data.get(4).value,
					exordial: $data.get(5).value,
					server: $data.get(6).value,
					lastLogin: $data.get(7).value,
					black: $data.get(8).value,
					friends: $data.get(9).value
				});
			});
			$.post("/gwalli/users", {
				list: JSON.stringify({ list: list }),
				pw: $("#db-password").val()
			}, function(res){
				alert(res);
			});
		});
	
	// 유저 감시하기
		$("#gamsi-go").on('click', function(e){
			clearInterval($temp._gamsi);
			
			var $data = $("#gamsi-data").empty();
			var list = $("#gamsi-id").val().split(/,\s*/);
			var i, len = list.length;
			
			for(i in list){
				$data.append($("<tr>").attr('id', "gamsi-" + list[i]).html("<td>(" + list[i] + ") 감시 시작</td>"));
				onGamsi();
			}
			i = 0;
			$temp._gamsi = setInterval(onGamsi, 10000);
			
			function onGamsi(){
				var cid = list[i];
				var $obj = $("#gamsi-" + cid);
				
				$.get("/gwalli/gamsi?id=" + cid, function(res){
					if(!res) return $obj.html("(없는 사용자)" + cid);
					$obj.html([ res._id, res.title || "-", "<a target='_blank' href='/?server=" + res.server + "'>" + res.server + "</a>" ].map(function(v){ return "<td>" + v + "</td>"; }));
				});
				i = (i + 1) % len;
			}
		});
	
	// 끄투 DB 다루기
		$("#db-go").on('click', function(e){
			$.get("/gwalli/kkutudb/" + $("#db-word").val() + "?lang=" + $("#db-lang").val(), function(res){
				var $table = $("#wd-data").empty();
				var types = res.type ? res.type.split(',') : [];
				var themes = res.theme ? res.theme.split(',') : [];
				var means = res.mean ? res.mean.split(/＂[0-9]+＂/).slice(1).map(function(m1){
					return (m1.indexOf("［") == -1) ? [[ m1 ]] : m1.split(/［[0-9]+］/).slice(1).map(function(m2){
						return m2.split(/（[0-9]+）/).slice(1);
					});
				}) : [[[]]];
				
				$("#wd-flag").val(res.flag);
				means.forEach(function(m1, x1){
					m1.forEach(function(m2, x2){
						var type = types.shift();
						var theme;
						
						m2.forEach(function(m3, x3){
							theme = themes.shift();
							$table.append($("<tr>").attr('id', ['wr', x1, x2, x3].join('-'))
								.append($("<td>").html([x1, x2, x3].join('-')))
								.append($("<td>").append(wrPutter(x1, x2, x3, 'y', type)))
								.append($("<td>").append(wrPutter(x1, x2, x3, 't', theme)))
								.append($("<td>").append(wrPutter(x1, x2, x3, 'm', m3)))
								.append(actionTd(x1, x2, x3))
							);
						});
					});
				});
			});
		});
		$("#word-add").on('click', function(e){
			var key = prompt('key (-로 구분)');
			
			if(!key) return;
			key = key.split('-');
			$("#wd-data").append($("<tr>").attr('id', ['wr', key[0], key[1], key[2]].join('-'))
				.append($("<td>").html([key[0], key[1], key[2]].join('-')))
				.append($("<td>").append(wrPutter(key[0], key[1], key[2], 'y', "")))
				.append($("<td>").append(wrPutter(key[0], key[1], key[2], 't', "")))
				.append($("<td>").append(wrPutter(key[0], key[1], key[2], 'm', "")))
				.append(actionTd(key[0], key[1], key[2]))
			);
		});
		$("#db-apply").on('click', function(e){
			var obj = {
				_id: $("#db-word").val(),
				flag: $("#wd-flag").val(),
				type: [], theme: [], mean: []
			};
			var pvt = false;
			
			$("#wd-data tr").each(function(i, o){
				var $o = $(o);
				var key = $o.children("td").first().html().split('-');
				var tk = key[0]+'-'+key[1];
				var data = {
					type: $("#word-"+[key[0],key[1],key[2],'y'].join('-')).val(),
					theme: $("#word-"+[key[0],key[1],key[2],'t'].join('-')).val(),
					mean: $("#word-"+[key[0],key[1],key[2],'m'].join('-')).val()
				};
				if(pvt != tk){
					obj.type.push(data.type);
					pvt = tk;
				}
				obj.theme.push(data.theme);
				if(!obj.mean[key[0]]) obj.mean[key[0]] = [];
				if(!obj.mean[key[0]][key[1]]) obj.mean[key[0]][key[1]] = [];
				obj.mean[key[0]][key[1]][key[2]] = data.mean;
			});
			obj.type = obj.type.join(',');
			obj.theme = obj.theme.join(',');
			obj.mean = obj.mean.map(function(m1, x1){
				if($("#db-lang").val() == "ko") return "＂" + (x1 + 1) + "＂" + m1.map(function(m2, x2){
					return "［" + (x2 + 1) + "］" + m2.map(function(m3, x3){
						return "（" + (x3 + 1) + "）" + m3;
					}).join('');
				}).join('');
				else return "＂" + (x1 + 1) + "＂" + m1;
			}).join('');
			
			$.post("/gwalli/kkutudb/" + $("#db-word").val(), {
				pw: $("#db-password").val(),
				lang: $("#db-lang").val(),
				data: JSON.stringify(obj)
			}, function(res){
				alert(res);
			});
		});
	
	// 끄투에서의 인기 단어
		$("#kpw-query").on('click', function(e){
			var FIELD = [ "한국어 종합", "한국어 최근", "한국어 3글자", "한국어 어인정", "영어 종합" ];
			
			$.get("/gwalli/kkutuhot", function(res){
				var $table = $("#kpw-table").empty();
				
				res.data.splice(1, 0, getDeltaRank(res.prev, res.data[0]));
				FIELD.forEach(function(item, index){
					$table.append($("<div>")
						.append($("<h3>").html(item))
						.append(getTable(res.prev, res.data[index]))
					);
				});
				$("#kpw-html").html($table.html());
			});
			function getDeltaRank(prev, data){
				return data.slice(0).sort(function(a, b){
					return b.hit - (prev[b._id] || 0) - a.hit + (prev[a._id] || 0);
				});
			}
			function getTable(prev, data){
				var $R = $("<table>");
				var pr = 0, ph;
				
				data.forEach(function(item, index){
					if(index >= 30) return;
					var pd = prev[item._id] || 0;
					var rank = (item.hit == ph) ? pr : index;
					
					pd = item.hit - pd;
					item.delta = pd ? ("(+" + pd + ")") : '-';
					$R.append($("<tr>")
						.append($("<td style='width: 20px; text-align: center; background-color: #EEEEEE;'>").html(rank + 1))
						.append($("<td style='width: 200px;'>").html(item._id))
						.append($("<td style='width: 40px;'>").html(item.hit))
						.append($("<td style='width: 40px;'>").html(item.delta))
					);
					pr = rank;
					ph = item.hit;
				});
				return $R;
			}
		});
		$("#kpw-flush").on('click', function(e){
			$.post("/gwalli/kkutuhot", { pw: $("#db-password").val() }, function(res){
				alert(res);
			});
		});
	});
	function putter(id, w, value){
		return $("<input>").attr('id', id).css('width', WIDTH[w]).val(value);
	}
	function wrPutter(x1, x2, x3, k, v){
		return putter("word-" + [x1,x2,x3,k].join('-'), k, v);
	}
	function actionTd(x1, x2, x3){
		var key = ['wa',x1,x2,x3].join('-') + '-';
		
		return $("<td>")
			.append($("<button>").attr('id', key+'u').css('float', "left").html("▲").on('click', onAction))
			.append($("<button>").attr('id', key+'x').css('float', "left").html("X").on('click', onAction))
			.append($("<button>").attr('id', key+'e').css('float', "left").html("?").on('click', onAction))
			.append($("<button>").attr('id', key+'d').css('float', "left").html("▼").on('click', onAction));
	}
	function onAction(e){
		var key = $(e.currentTarget).attr('id').slice(3).split('-');
		var code = key.pop();
		var $target = $("#wr-" + key.join('-'));
		var temp;
		
		switch(code){
			case 'u':
				if(e.shiftKey){
					changeId($target, $target.prev().attr('id').slice(3));
					changeId($target.prev(), key.join('-'));
				}
				$target.prev().before($target);
				break;
			case 'x':
				$target.remove();
				break;
			case 'e':
				if(temp = prompt("새 key")){
					changeId($target, temp);
				}
				break;
			case 'd':
				if(e.shiftKey){
					changeId($target, $target.next().attr('id').slice(3));
					changeId($target.next(), key.join('-'));
				}
				$target.next().after($target);
				break;
		}
	}
	function changeId($target, cur){
		var prev = $target.attr('id').slice(3);
		
		$target.attr('id', "wr-" + cur).children("td").first().html(cur);
		$target.find("*").each(function(i, o){
			var $o = $(o);
			
			if(!$o.attr('id')) return;
			if($o.attr('id').indexOf(prev) == -1) return;
			$o.attr('id', $o.attr('id').replace(prev, cur));
		});
	}
})();