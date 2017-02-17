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

const NAVER_ID = "네이버 앱 아이디";
const NAVER_SECRET = "네이버 앱 시크릿";
const GOOGLE_ID = "Google App ID";
const GOOGLE_API = "Google API ID";
const GOOGLE_SECRET = "Google App Secret";
// const TWITTER_KEY = "";

var Web		 = require("request");
var Lizard	 = require("../sub/lizard");
var JLog	 = require("../sub/jjlog");
// var Ajae	 = require("../sub/ajae").checkAjae;

exports.login = function(type, token, sid, token2){
	var R = new Lizard.Tail();
	var now = new Date();
	var MONTH = now.getMonth() + 1, DATE = now.getDate();
	var $p = {};
	
	if(type == "naver"){
		Web.post("https://nid.naver.com/oauth2.0/token", { form: {
			grant_type: "authorization_code",
			client_id: NAVER_ID,
			client_secret: NAVER_SECRET,
			code: token,
			state: sid
		} }, function(err, res, doc){
			if(err){
				JLog.warn("Error on oAuth-naver: "+err.toString());
				R.go({ error: 500 });
			}else{
				try{ doc = JSON.parse(doc); }catch(e){ return R.go({ error: 500 }); }
				
				$p.token = doc.access_token;
				Web.post({
					url: "https://openapi.naver.com/v1/nid/me",
					headers: { 'Authorization': "Bearer " + $p.token }
				}, function(err, res, doc){
					if(err) return R.go({ error: 400 });
					if(!doc) return R.go({ error: 500 });
					try{ doc = JSON.parse(doc); }catch(e){ return R.go({ error: 500 }); }
					
					if(doc.resultcode == "00"){
						$p.type = "naver";
						$p.id = doc.response.id;
						$p.name = doc.response.name;
						$p.title = doc.response.nickname;
						$p.image = doc.response.profile_image;
						
						/* 망할 셧다운제
						$p._age = doc.response.age.split('-').map(Number);
						$p._age = { min: ($p._age[0] || 0) - 1, max: $p._age[1] - 1 };
						$p.birth = doc.response.birthday.split('-').map(Number);
						if(MONTH < $p.birth[0] || (MONTH == $p.birth[0] && DATE < $p.birth[1])){
							$p._age.min--;
							$p._age.max--;
						}
						$p.isAjae = Ajae($p.birth, $p._age);
						*/
						// $p.sex = doc.response[0].gender[0];
						R.go($p);
					}else{
						R.go({ error: 401 });
					}
				});
			}
		});
	}else if(type == "facebook"){
		$p.token = token;
		Web.get({
			url: "https://graph.facebook.com/v2.4/me",
			qs: {
				access_token: $p.token,
				fields: "id,name,gender"
			}
		}, function(err, res, doc){
			if(err){
				JLog.warn("Error on oAuth-facebook: "+err.toString());
				R.go({ error: 500 });
			}else{
				try{ doc = JSON.parse(doc); }catch(e){ return R.go({ error: 500 }); }
				
				$p.type = "facebook";
				$p.id = doc.id;
				$p.name = doc.name;
				$p.image = "https://graph.facebook.com/"+doc.id+"/picture?type=large";
				
				/* 망할 셧다운제
				
				$p._age = doc.age_range;
				if(doc.birthday){
					$p.birth = doc.birthday.split('/').map(Number);
				}
				$p.isAjae = Ajae($p.birth, $p._age);
				*/
				// $p.sex = doc.gender[0].toUpperCase();
				R.go($p);
			}
		});
	}else if(type == "google"){
		$p.token = token;
		Web.get({
			url: "https://www.googleapis.com/oauth2/v3/tokeninfo",
			qs: {
				id_token: token
			}
		}, function(err, res, doc){
			if(err){
				JLog.warn("Error on oAuth-google: "+err.toString());
				R.go({ error: 500 });
			}else{
				try{ doc = JSON.parse(doc); }catch(e){ return R.go({ error: 500 }); }
				if(doc.aud != GOOGLE_ID) return R.go({ error: 401 });
				if(!doc.email_verified) return R.go({ error: 402 });
				
				/*Web.get({
					url: "https://www.googleapis.com/plus/v1/people/me",
					qs: {
						fields: "ageRange,birthday",
						// key: GOOGLE_API,
						access_token: token2
					},
					headers: { 'Authorization': "Bearer " + token2 }
				}, function(_err, _res, _doc){
					if(_err){
						JLog.warn("Error on profile-google: "+err.toString());
						R.go({ error: 500 });
					}else{
						try{ _doc = JSON.parse(_doc); }catch(e){ return R.go({ error: 500 }); }
						if(_doc.error) return R.go({ error: _doc.error.code });*/
						
						$p.type = "google";
						$p.id = doc.sub;
						$p.name = doc.name;
						$p.image = doc.picture;
						
						R.go($p);
						/* 망할 셧다운제

						$p._age = _doc.ageRange;
						if(_doc.birthday){
							$p.birth = _doc.birthday.split('-').map(Number);
							$p.birth.push($p.birth.shift());
						}
						$p.isAjae = Ajae($p.birth, $p._age);
					}
				});*/
			}
		});
	}
	return R;
};
exports.logout = function($p){
	var R = new Lizard.Tail();
	
	if($p.type == "naver"){
		Web.post("https://nid.naver.com/oauth2.0/token", { form: {
			grant_type: "delete",
			client_id: NAVER_ID,
			client_secret: NAVER_SECRET,
			code: $p.token,
			service_provider: "NAVER"
		} }, function(err, res, doc){
			R.go(doc);
		});
	}else if($p.type == "facebook"){
		R.go(true);
	}else if($p.type == "google"){
		R.go(true);
	}
	return R;
};