var DB	 = require("../Web/db");
var len = Number(process.argv[2] || 10);

DB.ready = function(){
	var rank = 0;
	var phit = 0;
	
	DB.kkutu['ko'].find([ 'hit', { $gt: 0 } ]).sort([ 'hit', -1 ]).limit(len).on(function($res){
		var i, $o, c;
		var res = [];
		
		for(i in $res){
			$o = $res[i];
			if(phit == $o.hit){
				c = rank;
			}else{
				c = rank = Number(i) + 1;
				phit = $o.hit;
			}
			res.push(c + "위. " + $o._id + " (" + $o.hit + ")");
		}
		console.log(res.join('\n'));
		process.exit();
	});
};