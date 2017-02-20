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

/* 망할 셧다운제
exports.checkAjae = function(birth, ageRange){
	var now = new Date();
	var YEAR = now.getFullYear(), MONTH = now.getMonth() + 1, DATE = now.getDate();
	var age;
	
	if(birth && birth[2]){
		age = YEAR - birth[2];
		if(MONTH < birth[0]) age--;
		else if(MONTH == birth[0] && DATE < birth[1]) age--;
		
		return age >= 16;
	}else if(ageRange){
		return ageRange.min >= 16;
	}else return null;
};
exports.confirmAjae = function(input, birth, ageRange){
	// input는 [ M, D, Y ] 꼴이다.
	// ageRange가 존재한다는 것이 보장되어야 한다.
	if(!input) return false;
	
	var y = input[2], m = input[0], d = input[1];
	var now = new Date();
	var YEAR = now.getFullYear();
	var yearExp = {
		min: YEAR - ageRange.max - 1,
		max: YEAR - (ageRange.min || 0)
	};
	console.log(input, birth, ageRange);
	
	return yearExp.min <= y && y <= yearExp.max && birth[0] == m && birth[1] == d && (!birth[2] || birth[2] == y);
}; */