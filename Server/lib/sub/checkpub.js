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

var File = require("fs");
var path = require("path");

global.isPublic = process.env.IS_PUBLIC === "true";

var pubTxtPath = path.join(__dirname, "pub.txt");

try {
	if(File.existsSync(pubTxtPath)){
		global.isPublic = true;
	}
} catch(e) {
	// ignore FS errors on Vercel
}

if(exports.ready) exports.ready(global.isPublic);

// Legacy async check kept for compatibility
File.readFile(pubTxtPath, function(err, doc){
	if(doc){
		global.isPublic = true;
	}
	if(exports.ready) exports.ready(global.isPublic);
});
