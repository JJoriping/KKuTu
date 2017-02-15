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

﻿var File = require('fs');

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