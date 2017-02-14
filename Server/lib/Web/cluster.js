var Cluster = require("cluster");
var CPU = Number(process.argv[2]); //require("os").cpus().length;

if(isNaN(CPU)){
	console.log(`Invalid CPU Number ${CPU}`);
	return;
	// process.exit(1);
}
if(Cluster.isMaster){
	for(var i=0; i<CPU; i++){
		Cluster.fork({ SERVER_NO_FORK: true, WS_KEY: i+1 });
	}
	Cluster.on('exit', function(w){
		console.log(`Worker ${w.process.pid} died`);
	});
}else{
	require("./main.js");
}