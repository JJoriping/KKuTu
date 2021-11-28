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

const { EntitySchema } = require("typeorm");
const { User } = require("../model/User");

module.exports = new EntitySchema({
	name: "User",
	target: User,
	tableName: "users",
	columns: {
		_id: {
			primary: true,
			type: "varchar"
		},
		money: {
			type: "int8",
			default: 0
		},
		kkutu: {
			type: "json"
		},
		lastLogin: {
			type: "int8"
		},
		box: {
			type: "json"
		},
		equip: {
			type: "json"
		},
		exordial: {
			type: "text"
		},
		black: {
			type: "text",
			nullable: true
		},
		blockeduntil: {
			type: "text",
			nullable: true
		},
		server: {
			type: "varchar",
			nullable: true
		},
		password: {
			type: "text",
			nullable: true
		},
		friends: {
			type: "json"
		}
	}
});