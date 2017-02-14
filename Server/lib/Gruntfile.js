var File = require('fs');

const LIST = [
	"global",
	
	"in_login",
	"in_game_kkutu",
	"in_game_kkutu_help",
	"in_admin",
	"in_portal"
];
const KKUTU_LIST = [
	"Web/lib/kkutu/head.js",
	"Web/lib/kkutu/ready.js",
	"Web/lib/kkutu/rule_classic.js",
	"Web/lib/kkutu/rule_jaqwi.js",
	"Web/lib/kkutu/rule_crossword.js",
	"Web/lib/kkutu/rule_typing.js",
	"Web/lib/kkutu/rule_hunmin.js",
	"Web/lib/kkutu/rule_daneo.js",
	"Web/lib/kkutu/rule_sock.js",
	"Web/lib/kkutu/body.js",
	"Web/lib/kkutu/tail.js"
];

module.exports = function(grunt){
	var i, files = {}, cons = {};
	var KKUTU = "Web/public/js/in_game_kkutu.min.js";
	
	for(i in LIST){
		files["Web/public/js/"+LIST[i]+".min.js"] = "Web/lib/"+LIST[i]+".js";
	}
	files[KKUTU] = KKUTU_LIST;
	
	grunt.initConfig({
		uglify: {
			options: {
				banner: "// JJoLoL v3\n\n"
			},
			build: {
				files: files
			}
		},
		concat: {
			basic: {
				src: KKUTU_LIST,
				dest: "Web/lib/in_game_kkutu.js"
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	grunt.registerTask('default', ['concat', 'uglify']);
	grunt.registerTask('pack', 'Log', function(){
		var done = this.async();
		var url = __dirname + "/" + KKUTU;
		
		File.readFile(url, function(err, res){
			File.writeFile(url, "(function(){" + res.toString() + "})();", function(err, res){
				done();
			});
		})
	});
};