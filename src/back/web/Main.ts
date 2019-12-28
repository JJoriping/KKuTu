/*!
 * Rule the words! KKuTu Online
 * Copyright (C) 2020  JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import CookieParser = require("cookie-parser");
import Express = require("express");
import ExpressSession = require("express-session");
import HTTPS = require("https");
import Passport = require("passport");
import Path = require("path");

import { connectDatabase } from "back/utils/Database";
import { StatusCode } from "back/utils/enums/StatusCode";
import { getLocale, loadLanguages } from "back/utils/Language";
import { Logger, LogStyle } from "back/utils/Logger";
import { route } from "back/utils/Route";
import { SSL_OPTIONS } from "back/utils/SSL";
import { SETTINGS } from "back/utils/System";
import { GameClient } from "./GameClient";

const CLUSTER = Number(process.env['KKUTU_CLUSTER']) || 0;
const SECRET = "kkutu";
const PORT_HTTP = 80;
const PORT_HTTPS = 443;

const app = Express();

Logger.initialize(`web-${CLUSTER}`).then(async () => {
  await connectDatabase();
  loadLanguages();
  GameClient.initialize();

  app.set('views', Path.resolve(__dirname, "views"));
  app.set('view engine', "pug");
  app.use("/media", Express.static(`${__dirname}/media`));
  app.use("/scripts", Express.static(`${__dirname}/scripts`));
  app.use(CookieParser(SECRET));
  app.use(ExpressSession({
    secret: SECRET,
    resave: false,
    saveUninitialized: true
  }));
  app.use(Passport.initialize());
  app.use(Passport.session());
  app.use((req, res, next) => {
    req.address = req.ip || req.ips.join();
    req.locale = getLocale(req);
    if(req.xhr){
      Logger.log().putS(LogStyle.METHOD, req.method).putS(LogStyle.XHR, " XHR")
        .next("URL").put(req.originalUrl)
        .next("Address").put(req.address)
        .out()
      ;
    }else{
      Logger.log().putS(LogStyle.METHOD, req.method)
        .next("URL").put(req.originalUrl)
        .next("Address").put(req.address)
        .out()
      ;
    }
    if(SETTINGS.https && req.protocol === "http"){
      res.status(StatusCode.MOVED).redirect(`https://${req.get('host')}${req.path}`);
    }else{
      next();
    }
  });
  app.use("/", route());
  app.listen(PORT_HTTP);
  if(SETTINGS.https){
    HTTPS.createServer(SSL_OPTIONS, app).listen(PORT_HTTPS);
  }
});
