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

var Cluster = require("cluster");
var Const = require('../const');
var JLog = require('../sub/jjlog');
var SID = Number(process.argv[2]);
var CPU = Number(process.argv[3]); //require("os").cpus().length;

if(isNaN(SID)){
	if(process.argv[2] == "test"){
		global.test = true;
		CPU = 1;
	}else{
		console.log(`Invalid Server ID ${process.argv[2]}`);
		process.exit(1);
	}
}
if(isNaN(CPU)){
	console.log(`Invalid CPU Number ${process.argv[3]}`);
	process.exit(1);
}
if(Cluster.isMaster){
	var channels = {}, chan;
	var i;
	
	for(i=0; i<CPU; i++){
		chan = i + 1;
		channels[chan] = Cluster.fork({ SERVER_NO_FORK: true, KKUTU_PORT: Const.MAIN_PORTS[SID] + 416 + i, CHANNEL: chan });
	}
	Cluster.on('exit', function(w){
		for(i in channels){
			if(channels[i] == w){
				chan = Number(i);
				break;
			}
		}
		JLog.error(`Worker @${chan} ${w.process.pid} died`);
		channels[chan] = Cluster.fork({ SERVER_NO_FORK: true, KKUTU_PORT: Const.MAIN_PORTS[SID] + 416 + (chan - 1), CHANNEL: chan });
	});
	process.env['KKUTU_PORT'] = Const.MAIN_PORTS[SID];
	require("./master.js").init(SID.toString(), channels);
}else{
	require("./slave.js");
}