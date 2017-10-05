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
 */

 
const MainDB	 = require("../db");
const JLog	 = require("../../sub/jjlog");
// const Ajae	 = require("../../sub/ajaejs").checkAjae;
const passport = require('passport');
const Web = require('request');
const NaverStrategy = require('passport-naver').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const GLOBAL	 = require("../../sub/global.json");
const config = require('../../sub/auth.json');

exports.run = (Server, page) => {
    //passport configure
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    Server.get("/login", function(req, res){
        if(global.isPublic){
            page(req, res, "login", { '_id': req.session.id, 'text': req.query.desc });
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

    //naver
    Server.get("/login/naver", passport.authenticate('naver'));
    Server.get("/login/naver/callback", passport.authenticate('naver', {
        successRedirect: '/',
        failureRedirect: '/loginfail'
    }));
    passport.use(new NaverStrategy({
            clientID: config.naver.clientID,
            clientSecret: config.naver.clientSecret,
            callbackURL: config.naver.callbackURL,
            passReqToCallback: true
        },
        (req, accessToken, refreshToken, profile, done) => {
            const $p = {};

            $p.token = accessToken;
            $p.sid = req.session.id;

            Web.post({
                url: "https://openapi.naver.com/v1/nid/me",
                headers: { 'Authorization': "Bearer " + $p.token }
            }, function(err, res, doc){
                if(err) return done(null, false, { error: 400 });
                if(!doc) return done(null, false, { error: 500 });
                try{ doc = JSON.parse(doc); }catch(e){ return done(null, false, { error: 500 }); }
                
                if(doc.resultcode == "00"){
                    $p.type = "naver";
                    $p.id = doc.response.id;
                    $p.name = doc.response.name;
                    $p.title = doc.response.nickname;
                    $p.image = doc.response.profile_image;
                    
                    /* 망할 셧다운제
                    $p._age = doc.response.age.split('-').map(Number);
                    $p._age = { min: ($p._age[0] || 0) - 1, max: $p._age[1] - 1 };
                    $p.birth = doc.response.birthday.split('-').map(Number);
                    if(MONTH < $p.birth[0] || (MONTH == $p.birth[0] && DATE < $p.birth[1])){
                        $p._age.min--;
                        $p._age.max--;
                    }
                    $p.isAjae = Ajae($p.birth, $p._age);
                    */
                    // $p.sex = doc.response[0].gender[0];

                    let now = Date.now();
                    $p.sid = req.session.id;
                    req.session.admin = GLOBAL.ADMIN.includes($p.id);
                    MainDB.session.upsert([ '_id', req.session.id ]).set({
                        'profile': $p,
                        'createdAt': now
                    }).on();
                    MainDB.users.findOne([ '_id', $p.id ]).on(function($body){
                        req.session.profile = $p;
                        MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();
                    });

                    done(null, $p);
                }else{
                    done(null, false, { error: 401 });
                }
            });
        }
    ));

    //facebook
    Server.get("/login/facebook", passport.authenticate('facebook'));
    Server.get("/login/facebook/callback", passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/loginfail'
    }));
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id' ,'name' , 'gender', 'age_range', 'displayName'],
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.token = accessToken;
        $p.sid = req.session.id;

        $p.type = "facebook";
        $p.id = profile.id;
        $p.name = profile.displayName;
        $p.title = profile.displayName;
        $p.image = "https://graph.facebook.com/"+profile.id+"/picture";

        let now = Date.now();
        $p.sid = req.session.id;
        req.session.admin = GLOBAL.ADMIN.includes($p.id);
        MainDB.session.upsert([ '_id', req.session.id ]).set({
            'profile': $p,
            'createdAt': now
        }).on();
        MainDB.users.findOne([ '_id', $p.id ]).on(function($body){
            req.session.profile = $p;
            MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();
        });
        
        /* 망할 셧다운제
        
        $p._age = profile.age_range;
        if(profile.birthday){
            $p.birth = doc.birthday.split('/').map(Number);
        }
        $p.isAjae = Ajae($p.birth, $p._age);
        */
        // $p.sex = profile.gender;
    
        done(null, $p);
    }));

    //google
    Server.get("/login/google", passport.authenticate('google'));
    Server.get("/login/google/callback", passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/loginfail'
    }));
    passport.use(new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.token = accessToken;
        $p.sid = req.session.id;

        $p.type = "google";
        $p.id = profile.id;
        $p.name = (profile.name.familyName != '' ? profile.name.familyName+' ' : '')+profile.name.givenName;
        $p.title = profile.nickname;
        $p.image = profile.photos[0].value;

        let now = Date.now();
        $p.sid = req.session.id;
        req.session.admin = GLOBAL.ADMIN.includes($p.id);
        MainDB.session.upsert([ '_id', req.session.id ]).set({
            'profile': $p,
            'createdAt': now
        }).on();
        MainDB.users.findOne([ '_id', $p.id ]).on(function($body){
            req.session.profile = $p;
            MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();
        });

        done(null, $p);
    }));

    //twitter
    Server.get("/login/twitter", passport.authenticate('twitter'));
    Server.get("/login/twitter/callback", passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/loginfail'
    }));
    passport.use(new TwitterStrategy({
        consumerKey: config.twitter.consumerKey,
        consumerSecret: config.twitter.consumerSecret,
        callbackURL: config.twitter.callbackURL,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.token = accessToken;
        $p.sid = req.session.id;

        $p.type = "twitter";
        $p.id = profile.id;
        $p.name = profile.displayName;
        $p.title = profile.displayName;
        $p.image = profile.photos[0].value;

        let now = Date.now();
        $p.sid = req.session.id;
        req.session.admin = GLOBAL.ADMIN.includes($p.id);
        MainDB.session.upsert([ '_id', req.session.id ]).set({
            'profile': $p,
            'createdAt': now
        }).on();
        MainDB.users.findOne([ '_id', $p.id ]).on(function($body){
            req.session.profile = $p;
            MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();
        });
    
        done(null, $p);
    }));

    //kakao
    Server.get("/login/kakao", passport.authenticate('kakao'));
    Server.get("/login/kakao/callback", passport.authenticate('kakao', {
        successRedirect: '/',
        failureRedirect: '/loginfail'
    }));
    passport.use(new KakaoStrategy({
        clientID: config.kakao.clientID,
        callbackURL: config.kakao.callbackURL,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
        const $p = {};

        $p.token = accessToken;
        $p.sid = req.session.id;

        $p.type = "kakao";
        $p.id = profile.id.toString();
        $p.name = +profile.username;
        $p.title = profile.displayName;
        $p.image = profile._json.properties.profile_image;

        let now = Date.now();
        $p.sid = req.session.id;
        req.session.admin = GLOBAL.ADMIN.includes($p.id);
        MainDB.session.upsert([ '_id', req.session.id ]).set({
            'profile': $p,
            'createdAt': now
        }).on();
        MainDB.users.findOne([ '_id', $p.id ]).on(function($body){
            req.session.profile = $p;
            MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();
        });

        done(null, $p);
    }));

    Server.get("/logout", (req, res) => {
        if(!req.session.profile){
            return res.redirect("/");
        } else {
            req.session.destroy();
            res.redirect('/');
        }
    });
}