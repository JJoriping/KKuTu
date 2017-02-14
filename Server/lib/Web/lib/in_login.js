(function(){
	$(document).ready(function(){
		var fbStatus;
		var fbTimer = setInterval(function(){
			if(!FB) return;
			try{
				FB.getLoginStatus(function(res){
					fbStatus = res;
				});
			}catch(e){
				return;
			}
			clearInterval(fbTimer);
		}, 400);
		var ggStatus = false;
		var ggTimer = setInterval(function(){
			if(!gapi) return;
			gapi.signin2.render('with-google', {
				scope: 'profile email https://www.googleapis.com/auth/plus.login',
				width: 210,
				height: 35,
				longtitle: true,
				onsuccess: gOK,
				onfailure: gNO
			});
			clearInterval(ggTimer);
		}, 400);
		$(".with-naver").on('click', function(e){
			var url = "https://nid.naver.com/oauth2.0/authorize?";
			
			url += "response_type=code&";
			url += "client_id=????????????????&";
			url += "redirect_uri="+encodeURI("http://kkutu.kr")+"&";
			url += "state="+encodeURI($("#stateKey").html())+"&";
			
			redirect(url);
		});
		/*$(".with-twitter").on('click', function(e){
			redirect("/login/twitter");
		});*/
		$(".with-facebook").on('click', function(e){
			if(!FB){
				alert("Please wait... (1)");
				return;
			}
			if(!fbStatus){
				FB.getLoginStatus(function(res){ fbStatus = res; });
				alert("Please wait... (2)");
				return;
			}
			
			if(fbStatus.status == "connected"){
				redirect("/?token="+fbStatus.authResponse.accessToken);
			}else{
				FB.login(function(res){
					if(res.authResponse){
						redirect("/?token="+res.authResponse.accessToken);
					}else{
						history.back();
					}
				}, { scope: "user_birthday" });
			}
		});
		$("#with-google").on('click', function(e){
			ggStatus = true;
		});
		function gOK(user){
			if(!ggStatus) return;
			var ar = user.getAuthResponse(true);
			
			console.log(ar);
			$.post("/login/google", { it: ar.id_token, at: ar.access_token }, onLoggedIn);
		}
		function gNO(err){
			if(!ggStatus) return;
			alert(JSON.stringify(err));
		}
		function onLoggedIn(res){
			if(res.error) return alert("ERROR " + res.error);
			redirect("/register");
		}
		function redirect(to){
			$.post("/session/set", { bm: $.cookie('bm') }, function(res){
				$.cookie('prevpage', document.referrer);
				location.href = to;
			});
		}
	});
})();