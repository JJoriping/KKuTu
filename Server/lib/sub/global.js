/**
 * Rule the words! KKuTu Online
 * Runtime configuration loaded from environment variables.
 * On local/Docker, create Server/lib/sub/global.json instead.
 */

var config;

try {
	config = require("./global.json");
} catch (e) {
	config = {};
}

module.exports = {
	MAIN_PORTS: config.MAIN_PORTS || JSON.parse(process.env.MAIN_PORTS || "[8496]"),
	GAME_SERVER_HOST: config.GAME_SERVER_HOST || process.env.GAME_SERVER_HOST || "localhost",
	ADMIN: config.ADMIN || JSON.parse(process.env.ADMIN || "[]"),
	IS_SECURED: config.IS_SECURED !== undefined ? config.IS_SECURED : (process.env.IS_SECURED === "true"),
	SSL_OPTIONS: config.SSL_OPTIONS || JSON.parse(process.env.SSL_OPTIONS || "{}"),
	SQLITE_PATH: config.SQLITE_PATH || process.env.SQLITE_PATH || "kkutu.db",
	DATABASE_URL: config.DATABASE_URL || process.env.DATABASE_URL || "",
	SEASON: config.SEASON !== undefined ? config.SEASON : (Number(process.env.SEASON) || 0),
	SEASON_PRE: config.SEASON_PRE !== undefined ? config.SEASON_PRE : (process.env.SEASON_PRE === "true"),
	GOOGLE_RECAPTCHA_SECRET_KEY: config.GOOGLE_RECAPTCHA_SECRET_KEY || process.env.GOOGLE_RECAPTCHA_SECRET_KEY || "",
	KKT_SV_NAME: config.KKT_SV_NAME || process.env.KKT_SV_NAME || "KKuTu"
};
