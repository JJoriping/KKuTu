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
 * 볕뉘 수정사항:
 * 로그인을 Passport 로 수행하기 위한 파일 생성
 * 쪼리핑님 요청에 따라 유동적으로 로그인 전략 생성
 */

 
const MainDB	 = require("../db");
const JLog	 = require("../../sub/jjlog");
// const Ajae	 = require("../../sub/ajaejs").checkAjae;
const passport = require('passport');
const glob = require('glob-promise');
const GLOBAL	 = require("../../sub/global.json");
const config = require('../../sub/auth.json');

function process(req, accessToken, MainDB, $p, done) {
    $p.token = accessToken;
    $p.sid = req.session.id;

    let now = Date.now();
    $p.sid = req.session.id;
    req.session.admin = GLOBAL.ADMIN.includes($p.id);
    req.session.authType = $p.authType;
    MainDB.session.upsert([ '_id', req.session.id ]).set({
        'profile': $p,
        'createdAt': now
    }).on();
    MainDB.users.findOne([ '_id', $p.id ]).on(function($body){
        req.session.profile = $p;
        MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();

        done(null, $p);
    });
}

exports.run = (Server, page) => {
    //passport configure
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    const strategyList = {};

    glob(__dirname + '/../auth/auth_*.js')
    .then((items) => {
        for (let i in items) {
            let auth = require(items[i])
            Server.get('/login/' + auth.config.vendor, passport.authenticate(auth.config.vendor))
            Server.get('/login/' + auth.config.vendor + '/callback', passport.authenticate(auth.config.vendor, {
                successRedirect: '/',
                failureRedirect: '/loginfail'
            }))
            passport.use(new auth.config.strategy(auth.strategyConfig, auth.strategy(process, MainDB /*, Ajae */)));
            strategyList[auth.config.vendor] = {
                vendor: auth.config.vendor,
                displayName: auth.config.displayName,
                color: auth.config.color,
                fontColor: auth.config.fontColor
            };
        }
    })
    .catch((e) => {
        console.error(e)
    })
    .then(() => {
        Server.get("/login", function(req, res){
            if(global.isPublic){
                page(req, res, "login", { '_id': req.session.id, 'text': req.query.desc, 'loginList': strategyList});
            }else{
                let now = Date.now();
                let id = req.query.id || "ADMIN";
                let lp = {
                    id: id,
                    title: "LOCAL #" + id,
                    birth: [ 4, 16, 0 ],
                    _age: { min: 20, max: undefined }
                };
                MainDB.session.upsert([ '_id', req.session.id ]).set([ 'profile', JSON.stringify(lp) ], [ 'createdAt', now ]).on(function($res){
                    MainDB.users.update([ '_id', id ]).set([ 'lastLogin', now ]).on();
                    req.session.admin = true;
                    req.session.profile = lp;
                    res.redirect("/");
                });
            }
        });

        Server.get("/logout", (req, res) => {
            if(!req.session.profile){
                return res.redirect("/");
            } else {
                req.session.destroy();
                res.redirect('/');
            }
        });

        Server.get("/loginfail", (req, res) => {
            page(req, res, "loginfail");
        });
    });  
}