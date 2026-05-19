#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const dbSqlPath = path.join(root, "db.sql");
const globalPath = path.join(root, "Server/lib/sub/global.json");

function copySection(sql, table){
	const startToken = `COPY ${table} `;
	const start = sql.indexOf(startToken);
	const endToken = "\n\\.";
	let end;
	
	if(start == -1) throw new Error(`${table} COPY block was not found in db.sql`);
	end = sql.indexOf(endToken, start);
	if(end == -1) throw new Error(`${table} COPY block is not terminated in db.sql`);
	return sql.slice(start, end + endToken.length);
}

function buildMigration(sql){
	return [
		"BEGIN;",
		"",
		"CREATE TABLE IF NOT EXISTS kkutu_ja (",
		"    _id character varying(256) NOT NULL,",
		"    type text,",
		"    mean text NOT NULL,",
		"    hit integer DEFAULT 0 NOT NULL,",
		"    theme text,",
		"    flag integer,",
		"    reading character varying(256),",
		"    surface character varying(256)",
		");",
		"",
		"CREATE TABLE IF NOT EXISTS kkutu_manner_ja (",
		"    _id character varying(256) NOT NULL,",
		"    \"JSH_\" boolean",
		");",
		"",
		"ALTER TABLE ONLY kkutu_ja DROP CONSTRAINT IF EXISTS kkutu_ja_key;",
		"ALTER TABLE ONLY kkutu_manner_ja DROP CONSTRAINT IF EXISTS kkuut_manner_ja_key;",
		"TRUNCATE TABLE kkutu_ja;",
		copySection(sql, "kkutu_ja"),
		"TRUNCATE TABLE kkutu_manner_ja;",
		copySection(sql, "kkutu_manner_ja"),
		"ALTER TABLE ONLY kkutu_ja ADD CONSTRAINT kkutu_ja_key PRIMARY KEY (_id);",
		"ALTER TABLE ONLY kkutu_manner_ja ADD CONSTRAINT kkuut_manner_ja_key PRIMARY KEY (_id);",
		"COMMIT;",
		"",
		"SELECT COUNT(*) AS kkutu_ja_rows FROM kkutu_ja;"
	].join("\n");
}

function psqlArgs(global){
	const args = [ "--quiet", "--set", "ON_ERROR_STOP=1" ];
	
	if(global.PG_HOST) args.push("--host", String(global.PG_HOST));
	if(global.PG_PORT) args.push("--port", String(global.PG_PORT));
	if(global.PG_USER) args.push("--username", String(global.PG_USER));
	if(global.PG_DATABASE) args.push("--dbname", String(global.PG_DATABASE));
	return args;
}

const global = JSON.parse(fs.readFileSync(globalPath, "utf8"));
const sql = fs.readFileSync(dbSqlPath, "utf8");
const migration = buildMigration(sql);
const child = spawn("psql", psqlArgs(global), {
	cwd: root,
	env: Object.assign({}, process.env, {
		PGPASSWORD: global.PG_PASSWORD || ""
	}),
	stdio: [ "pipe", "inherit", "inherit" ]
});

child.on("error", function(err){
	console.error(err.message);
	process.exit(1);
});
child.stdin.on("error", function(err){
	if(err.code != "EPIPE") console.error(err.message);
});
child.on("exit", function(code){
	process.exit(code);
});
child.stdin.end(migration);
