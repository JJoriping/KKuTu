var File = require("fs");

global.isPublic = false;

File.readFile(__dirname + "/pub.txt", function(err, doc){
	if(doc){
		global.isPublic = true;
	}
	if(exports.ready) exports.ready(global.isPublic);
});