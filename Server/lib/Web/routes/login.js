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

const MainDB	 = require("../db");
const JLog	 = require("../../sub/jjlog");
// const Ajae	 = require("../../sub/ajaejs").checkAjae;
const passport = require('passport');
const glob = require('glob-promise');
const GLOBAL	 = require("../../sub/global");
var config;
try {
	config = require('../../sub/auth.json');
} catch(e) {
	config = {};
}
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
    if (!storedPassword || !storedPassword.includes(':')) return false;
    const [salt, hash] = storedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

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
    MainDB.users.findOne([ '_id', $p.id ]).on(($body) => {
        req.session.profile = $p;
        MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();
    });

    if (done) done(null, $p);
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
    
	for (let i in config) {
		try {
			let auth = require(path.resolve(__dirname, '..', 'auth', 'auth_' + i + '.js'))
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

			JLog.info(`OAuth Strategy ${i} loaded successfully.`)
		} catch (error) {
			JLog.error(`OAuth Strategy ${i} is not loaded`)
			JLog.error(error.message)
		}
	}
	
	Server.get("/login", (req, res) => {
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

    Server.post("/login/local", (req, res) => {
        const { username, password, remember } = req.body;
        if (!username || !password) {
            JLog.warn("Local login failed: Missing username or password");
            return res.redirect("/login?desc=loginFail");
        }

        const userId = "local:" + username;
        MainDB.users.findOne([ '_id', userId ]).on(($user) => {
            if ($user && verifyPassword(password, $user.password)) {
                let now = Date.now();
                const profile = {
                    authType: "local",
                    id: userId,
                    name: username,
                    title: username,
                    sid: req.session.id,
                    birth: [ 4, 16, 0 ], // Default birth for local users
                    _age: { min: 20, max: undefined }
                };
                
                req.session.admin = GLOBAL.ADMIN.includes(userId);
                req.session.authType = "local";
                req.session.profile = profile;

                if (remember) {
                    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
                } else {
                    req.session.cookie.expires = false; // Session cookie
                }

                MainDB.session.upsert([ '_id', req.session.id ]).set({
                    'profile': profile,
                    'createdAt': now
                }).on(() => {
                    MainDB.users.update([ '_id', userId ]).set([ 'lastLogin', now ]).on(() => {
                        JLog.info("Local login success: " + userId);
                        res.redirect("/");
                    });
                });
            } else {
                JLog.warn("Local login failed: Invalid credentials for " + userId);
                res.redirect("/login?desc=loginFail");
            }
        });
    });

    Server.post("/register", (req, res) => {
        const { username, password, passwordConfirm } = req.body;
        if (!username || !password || username.length < 2 || password.length < 4) {
            JLog.warn("Registration failed: Invalid input length");
            return res.redirect("/login?desc=registerFail");
        }
        if (password !== passwordConfirm) {
            JLog.warn("Registration failed: Password mismatch");
            return res.redirect("/login?desc=registerFail");
        }

        const userId = "local:" + username;
        MainDB.users.findOne([ '_id', userId ]).on(($user) => {
            if ($user) {
                JLog.warn("Registration failed: User already exists - " + userId);
                return res.redirect("/login?desc=registerFail");
            }

            const hashedPassword = hashPassword(password);
            MainDB.users.insert([ '_id', userId ], [ 'password', hashedPassword ], [ 'money', 0 ]).on(() => {
                JLog.info("Registration success: " + userId);
                res.redirect("/login?desc=registerSuccess");
            }, null, (err) => {
                JLog.error("Registration failed: DB error - " + err.toString());
                res.redirect("/login?desc=registerFail");
            });
        });
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
}