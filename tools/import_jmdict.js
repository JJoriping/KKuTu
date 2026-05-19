#!/usr/bin/env node

const fs = require("fs");
const zlib = require("zlib");

const gzPath = process.argv[2] || "/private/tmp/JMdict_e.gz";
const dbPath = process.argv[3] || "db.sql";

const JA_ID = /^[ぁ-ゖ一-龯々〆〇ー]+$/;
const JA_READING = /^[ぁ-ゖー]+$/;

function toHiragana(text){
	return (text || "").normalize("NFKC").replace(/[ァ-ヶ]/g, function(ch){
		return String.fromCharCode(ch.charCodeAt(0) - 0x60);
	});
}
function normalizeJaWord(text){
	return toHiragana(text)
		.replace(/[ 　\t\r\n・･=＝\-‐‑‒–—―、。,.，．/／()（）［］\[\]{}｛｝<>＜＞「」『』【】"'＂＇]/g, "")
		.replace(/[^ぁ-ゖ一-龯々〆〇ー]/g, "");
}
function xmlText(text){
	return (text || "")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'");
}
function tagAll(xml, tag){
	const out = [];
	const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "g");
	let m;
	
	while((m = re.exec(xml))) out.push(xmlText(m[1].trim()));
	return out;
}
function entityAll(xml, tag){
	const out = [];
	const re = new RegExp(`<${tag}(?:\\s[^>]*)?>&([^;]+);<\\/${tag}>`, "g");
	let m;
	
	while((m = re.exec(xml))) out.push(m[1]);
	return out;
}
function unique(list){
	const seen = {};
	return list.filter(function(item){
		if(!item || seen[item]) return false;
		seen[item] = true;
		return true;
	});
}
function copyEscape(value){
	if(value === null || value === undefined || value === "") return "\\N";
	return String(value)
		.replace(/\\/g, "\\\\")
		.replace(/\t/g, "\\t")
		.replace(/\r/g, "\\r")
		.replace(/\n/g, "\\n");
}
function priorityHit(pris){
	let hit = 1000;
	
	pris.forEach(function(pri){
		const nf = pri.match(/^nf(\d\d)$/);
		
		if(nf) hit += Math.max(0, 520 - Number(nf[1]) * 10);
		else if(/^(news1|ichi1|spec1|gai1)$/.test(pri)) hit += 700;
		else if(/^(news2|ichi2|spec2|gai2)$/.test(pri)) hit += 350;
	});
	return hit;
}
function senseMean(entry){
	const senses = [];
	const re = /<sense>([\s\S]*?)<\/sense>/g;
	let m;
	
	while((m = re.exec(entry))){
		const glosses = tagAll(m[1], "gloss").slice(0, 4);
		if(glosses.length) senses.push(glosses.join("; "));
	}
	return senses.slice(0, 8).map(function(item, i){
		return `＂${i + 1}＂ ${item} `;
	}).join(" ");
}
function addRow(rows, id, row){
	const prev = rows.get(id);
	
	if(prev){
		row.type.split(",").forEach(function(type){ prev.types.add(type); });
		prev.hit = Math.max(prev.hit, row.hit);
		if(prev.mean.indexOf(row.mean) == -1) prev.mean += " " + row.mean;
		if(!prev.surface && row.surface) prev.surface = row.surface;
		return;
	}
	rows.set(id, {
		id: id,
		types: new Set(row.type.split(",")),
		mean: row.mean,
		hit: row.hit,
		reading: row.reading,
		surface: row.surface
	});
}
function buildRows(xml){
	const rows = new Map();
	const re = /<entry>([\s\S]*?)<\/entry>/g;
	let m;
	
	while((m = re.exec(xml))){
		const entry = m[1];
		const readings = unique(tagAll(entry, "reb").map(normalizeJaWord)).filter(function(reading){
			return reading.length >= 2 && JA_READING.test(reading);
		});
		if(!readings.length) continue;
		
		const kanji = unique(tagAll(entry, "keb"));
		const forms = unique(kanji.concat(readings));
		const pos = unique(entityAll(entry, "pos"));
		const pri = tagAll(entry, "ke_pri").concat(tagAll(entry, "re_pri"));
		const hit = priorityHit(pri);
		const type = pos.length ? pos.join(",") : "n";
		const baseMean = senseMean(entry);
		const formText = forms.slice(0, 8).join("; ");
		const mean = `＂1＂ [表記: ${formText}; 読み: ${readings.slice(0, 4).join("; ")}] ${baseMean.replace(/^＂1＂\s*/, "")}`;
		
		readings.forEach(function(reading){
			addRow(rows, reading, { type, mean, hit, reading, surface: reading });
		});
		kanji.forEach(function(form){
			const id = normalizeJaWord(form);
			if(id.length < 2 || !JA_ID.test(id)) return;
			addRow(rows, id, { type, mean, hit, reading: readings[0], surface: form });
		});
	}
	return Array.from(rows.values()).sort(function(a, b){
		return a.id.localeCompare(b.id, "ja");
	});
}
function copyBlock(rows){
	const lines = [
		"--",
		"-- Data for Name: kkutu_ja; Type: TABLE DATA; Schema: public; Owner: postgres",
		"--",
		"",
		"COPY kkutu_ja (_id, type, mean, hit, theme, flag, reading, surface) FROM stdin;"
	];
	
	rows.forEach(function(row){
		lines.push([
			copyEscape(row.id),
			copyEscape(Array.from(row.types).sort().join(",")),
			copyEscape(row.mean),
			row.hit,
			"\\N",
			0,
			copyEscape(row.reading),
			copyEscape(row.surface)
		].join("\t"));
	});
	lines.push("\\.", "", "", "--", "-- Data for Name: kkutu_manner_ja; Type: TABLE DATA; Schema: public; Owner: postgres", "--", "", "COPY kkutu_manner_ja (_id, \"JSH_\") FROM stdin;", "\\.", "");
	return lines.join("\n");
}
function insertOnce(sql, marker, block){
	const unique = block.split("\n").filter(function(line){
		return line.indexOf("Name: ") != -1 || line.indexOf("CREATE TABLE ") == 0 || line.indexOf("ALTER TABLE ONLY ") == 0;
	})[0];
	if(unique && sql.indexOf(unique) != -1) return sql;
	return sql.replace(marker, block + "\n\n" + marker);
}

const xml = zlib.gunzipSync(fs.readFileSync(gzPath)).toString("utf8");
const rows = buildRows(xml);
let sql = fs.readFileSync(dbPath, "utf8");

sql = insertOnce(sql, "--\n-- Name: kkutu_injeong; Type: TABLE; Schema: public; Owner: postgres\n--", [
	"--",
	"-- Name: kkutu_ja; Type: TABLE; Schema: public; Owner: postgres",
	"--",
	"",
	"CREATE TABLE kkutu_ja (",
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
	"",
	"ALTER TABLE kkutu_ja OWNER TO postgres;"
].join("\n"));
sql = insertOnce(sql, "--\n-- Name: kkutu_shop; Type: TABLE; Schema: public; Owner: postgres\n--", [
	"--",
	"-- Name: kkutu_manner_ja; Type: TABLE; Schema: public; Owner: postgres",
	"--",
	"",
	"CREATE TABLE kkutu_manner_ja (",
	"    _id character varying(256) NOT NULL,",
	"    \"JSH_\" boolean",
	");",
	"",
	"",
	"ALTER TABLE kkutu_manner_ja OWNER TO postgres;"
].join("\n"));

const dataStart = sql.indexOf("--\n-- Data for Name: kkutu_ja; Type: TABLE DATA; Schema: public; Owner: postgres\n--");
if(dataStart != -1){
	const dataEnd = sql.indexOf("--\n-- Data for Name: kkutu_manner_en; Type: TABLE DATA; Schema: public; Owner: postgres\n--", dataStart);
	sql = sql.slice(0, dataStart) + copyBlock(rows) + "\n\n" + sql.slice(dataEnd);
}else{
	sql = sql.replace("--\n-- Data for Name: kkutu_manner_en; Type: TABLE DATA; Schema: public; Owner: postgres\n--", copyBlock(rows) + "\n\n--\n-- Data for Name: kkutu_manner_en; Type: TABLE DATA; Schema: public; Owner: postgres\n--");
}

sql = insertOnce(sql, "--\n-- Name: kkutu_ko kkutu_kr_key; Type: CONSTRAINT; Schema: public; Owner: postgres\n--", [
	"--",
	"-- Name: kkutu_ja kkutu_ja_key; Type: CONSTRAINT; Schema: public; Owner: postgres",
	"--",
	"",
	"ALTER TABLE ONLY kkutu_ja",
	"    ADD CONSTRAINT kkutu_ja_key PRIMARY KEY (_id);"
].join("\n"));
sql = insertOnce(sql, "--\n-- Name: kkutu_manner_ko kkuut_manner_ko_key; Type: CONSTRAINT; Schema: public; Owner: postgres\n--", [
	"--",
	"-- Name: kkutu_manner_ja kkuut_manner_ja_key; Type: CONSTRAINT; Schema: public; Owner: postgres",
	"--",
	"",
	"ALTER TABLE ONLY kkutu_manner_ja",
	"    ADD CONSTRAINT kkuut_manner_ja_key PRIMARY KEY (_id);"
].join("\n"));

fs.writeFileSync(dbPath, sql);
console.log(`Imported ${rows.length} JMdict aliases into ${dbPath}.`);
