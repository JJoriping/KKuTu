exports.all = function(tails){
	var R = new exports.Tail([]);
	var left = tails.length;
	var i;
	
	if(left == 0) R.go(true);
	else for(i in tails){
		if(tails[i]) tails[i].then(onEnded, Number(i));
		else left--;
	}
	function onEnded(data, __i){
		R.returns[__i] = data;
		if(--left == 0) R.go(R.returns);
	}
	
	return R;
};

exports.Tail = function(res){
	var callback, value = undefined;
	var _i;
	
	this.returns = res;
	this.go = function(data){
		if(callback) callback(data, _i);
		else value = data;
	};
	this.then = function(cb, __i){
		_i = __i;
		
		if(value === undefined) callback = cb;
		else cb(value, __i);
	};
}