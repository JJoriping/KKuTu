var File = require('fs');

exports.PROVERBS = {
	'ko': [],
	'en': []
};

File.readFile(`${__dirname}/../../data/proverbs.txt`, function(err, res){
	if(err) throw Error(err.toString());
	var db = res.toString().split('~~~');
	
	db.forEach(function(item){
		var lang = item.slice(0, 2);
		
		exports.PROVERBS[lang] = item.slice(3).split('\r\n');	
	});
});