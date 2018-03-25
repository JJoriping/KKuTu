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

/**
 * 볕뉘 수정사항
 * 보안처리 관련 코드 생성
 */

const Const = require('../const')
const File = require('fs')

module.exports = () => {
    const options = {};
    if(Const.SSL_OPTIONS.isPFX == true) {
        options.pfx = File.readFileSync(Const.SSL_OPTIONS.PFX);
    } else {
        options.key = File.readFileSync(Const.SSL_OPTIONS.PRIVKEY);
        options.cert = File.readFileSync(Const.SSL_OPTIONS.CERT);
        if(Const.SSL_OPTIONS.isCA == true) {
            options.ca = File.readFileSync(Const.SSL_OPTIONS.CA);
        }
    }
    return options;
}