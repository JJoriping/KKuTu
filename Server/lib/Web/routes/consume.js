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

var MainDB	 = require("../db");
var JLog	 = require("../../sub/jjlog");

exports.run = function(Server, page){

Server.post("/consume/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	
	MainDB.users.findOne([ '_id', uid ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) return res.json({ error: 400 });
		if(!$user.lastLogin) $user.lastLogin = new Date().getTime();
		var q = $user.box[gid];
		var output;
		
		if(!q) return res.json({ error: 430 });
		MainDB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			consume($user, gid, 1);
			output = useItem($user, $item, gid);
			MainDB.users.update([ '_id', uid ]).set($user).on(function($res){
				output.result = 200;
				output.box = $user.box;
				output.data = $user.kkutu;
				res.send(output);
			});
		});
	});
});

};
function useItem($user, $item, gid){
	var R = { gain: [] };
	
	switch($item._id){
		case 'boxB2':
			got(pick([ 'b2_fire', 'b2_metal' ]), 1, 604800);
			break;
		case 'boxB3':
			got(pick([ 'b3_do', 'b3_hwa', 'b3_pok' ]), 1, 604800);
			break;
		case 'boxB4':
			got(pick([ 'b4_bb', 'b4_hongsi', 'b4_mint' ]), 1, 604800);
			break;
		case 'dictPage':
			R.exp = Math.round(Math.sqrt(1 + 2 * ($user.kkutu.score || 0)));
			$user.kkutu.score += R.exp;
			break;
		default:
			JLog.warn(`Unhandled consumption type: ${$item._id}`);
	}
	function got(key, value, term){
		obtain($user, key, value, term);
		R.gain.push({ key: key, value: value });
	}
	function pick(arr){
		return arr[Math.floor(Math.random() * arr.length)];
	}
	return R;
}
function consume($user, key, value){
    var bd = $user.box[key];
    
    if(bd.value){
        // 기한이 끝날 때까지 box 자체에서 사라지지는 않는다. 기한 만료 여부 확인 시점: 1. 로그인 2. box 조회 3. 게임 결과 반영 직전 4. 해당 항목 사용 직전
        if((bd.value -= value) <= 0 && !bd.expire) delete $user.box[key];
    }else{
        if(($user.box[key] -= value) <= 0) delete $user.box[key];
    }
}
function obtain($user, key, value, term, addValue){
    var now = Math.round(Date.now() * 0.001);
    
    if(term){
        if($user.box[key]){
            if(addValue) $user.box[key].value += value;
            else $user.box[key].expire += term;
        }else $user.box[key] = { value: value, expire: addValue ? term : (now + term) };
    }else{
        $user.box[key] = ($user.box[key] || 0) + value;
    }
}