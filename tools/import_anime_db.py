#!/usr/bin/env python3

import csv
import io
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_SQL = ROOT / "db.sql"

KOREAN_WIKI_BASE = "https://kkukowiki.kr/w/%EB%A7%8C%ED%99%94/%EC%95%A0%EB%8B%88%EB%A9%94%EC%9D%B4%EC%85%98/%EA%B8%80%EC%9E%90%EB%B3%84_%EB%8B%A8%EC%96%B4_%EB%AA%A9%EB%A1%9D/{}?action=raw"
KOREAN_INDEX = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]
HF_MAL_CSV = "https://huggingface.co/datasets/lyfesan/myanimelist-top-anime-dataset/resolve/main/mal_top_anime_dataset.csv"
KOREAN_MANUAL_POPULAR = [
    "귀멸의칼날", "주술회전", "스파이패밀리", "최애의아이", "체인소맨", "도쿄구울",
    "약속의네버랜드", "봇치더록", "블루록", "장송의프리렌", "리코리스리코일",
    "기동전사건담수성의마녀", "던전밥", "괴수팔호", "지옥락", "마슐",
    "메이드인어비스", "바이올렛에버가든", "사이버펑크엣지러너", "사카모토데이즈",
    "패배히로인이너무많아", "야한이야기라는개념이존재하지않는지루한세계",
    "비스크돌은사랑을한다", "내마음의위험한녀석", "마법소녀마도카마기카",
    "빙과", "코노스바", "전생했더니슬라임이었던건에대하여", "무직전생",
    "소녀종말여행", "하이카드", "샹그릴라프론티어", "언데드언럭",
    "괴롭히지말아요나가토로양", "어서오세요실력지상주의교실에",
    "카구야님은고백받고싶어", "아픈건싫으니까방어력에올인하려고합니다",
    "어떤과학의초전자포", "어떤마술의금서목록", "러브라이브", "러브라이브선샤인",
    "데이트어라이브", "중이병이라도사랑이하고싶어", "나만이없는거리",
    "강철의연금술사브라더후드", "헌터헌터", "클라나드", "슈타인즈게이트",
    "소드아트온라인", "페이트제로", "페이트스테이나이트", "페이트그랜드오더",
    "유유백서", "에반게리온", "카우보이비밥", "사무라이참프루",
    "코드기어스반역의를르슈", "바람의검심", "마기", "노게임노라이프",
    "어쨌든귀여워", "슬라임을잡으면서삼백년모르는사이에레벨맥스가되었습니다",
    "그비스크돌은사랑을한다", "오버로드", "유녀전기", "리제로",
    "데스노트", "도쿄리벤저스", "쟈히님은기죽지않아", "천국대마경",
    "체인솔저", "언어의정원", "너의이름은", "날씨의아이", "스즈메의문단속"
]

KO_COPY_TOKEN = "COPY kkutu_ko (_id, type, mean, hit, flag, theme) FROM stdin;\n"
JA_COPY_TOKEN = "COPY kkutu_ja (_id, type, mean, hit, theme, flag, reading, surface) FROM stdin;\n"


def fetch_text(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "KKuTu Anime Importer/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def to_hiragana(text: str) -> str:
    out = []
    for ch in unicodedata.normalize("NFKC", text):
        code = ord(ch)
        if 0x30A1 <= code <= 0x30F6:
            out.append(chr(code - 0x60))
        else:
            out.append(ch)
    return "".join(out)


def normalize_ko(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"[^가-힣]", "", text)
    return text


def normalize_ja_reading(text: str) -> str:
    text = to_hiragana(text)
    text = re.sub(r"[ 　\t\r\n・･=＝\-‐‑‒–—―、。,.，．/／()（）［］\[\]{}｛｝<>＜＞「」『』【】\"'＂＇:：;；!?！？…~〜*＊#＃]", "", text)
    text = re.sub(r"[^ぁ-ゖー]", "", text)
    return text


def normalize_ja_id(text: str) -> str:
    text = to_hiragana(text)
    text = re.sub(r"[ 　\t\r\n・･=＝\-‐‑‒–—―、。,.，．/／()（）［］\[\]{}｛｝<>＜＞「」『』【】\"'＂＇:：;；!?！？…~〜*＊#＃]", "", text)
    text = re.sub(r"[^ぁ-ゖ一-龯々〆〇ー]", "", text)
    return text


def extract_wiki_titles(raw_wikitext: str):
    words = set()
    for token in re.findall(r"\[\[([^\[\]\n]+)\]\]", raw_wikitext):
        w = token.split("|", 1)[0].split("#", 1)[0].strip()
        if ":" in w:
            continue
        nw = normalize_ko(w)
        if len(nw) >= 2:
            words.add(nw)
    return words


def parse_existing_ids(block: str):
    out = set()
    for line in block.splitlines():
        if not line:
            continue
        out.add(line.split("\t", 1)[0])
    return out


def split_copy_block(sql: str, token: str):
    start = sql.find(token)
    if start < 0:
        raise RuntimeError(f"COPY block not found: {token.strip()}")
    body_start = start + len(token)
    body_end = sql.find("\n\\.", body_start)
    if body_end < 0:
        raise RuntimeError("COPY block terminator not found")
    return body_start, body_end, sql[body_start:body_end]


def import_korean_anime(existing_ids):
    words = set()
    for idx in KOREAN_INDEX:
        url = KOREAN_WIKI_BASE.format(urllib.parse.quote(idx, safe=""))
        words |= extract_wiki_titles(fetch_text(url))
    for title in KOREAN_MANUAL_POPULAR:
        nw = normalize_ko(title)
        if len(nw) >= 2:
            words.add(nw)
    words -= existing_ids
    rows = [f"{w}\tINJEONG\t＂1＂［1］（1）\t0\t2\tJAN" for w in sorted(words)]
    return rows


def import_japanese_anime(existing_ids):
    text = fetch_text(HF_MAL_CSV)
    reader = csv.DictReader(io.StringIO(text))
    words = {}
    for row in reader:
        ja_title = (row.get("Japanese") or "").strip()
        if not ja_title:
            continue
        word_id = normalize_ja_id(ja_title)
        reading = normalize_ja_reading(ja_title)
        if len(word_id) < 2:
            continue
        if len(reading) < 2:
            continue
        if not re.fullmatch(r"[ぁ-ゖー]+", reading):
            continue
        if word_id not in existing_ids and word_id not in words:
            words[word_id] = (reading, word_id)
        if reading not in existing_ids and reading not in words:
            words[reading] = (reading, reading)
    rows = []
    for _id in sorted(words.keys()):
        reading, surface = words[_id]
        mean = "＂1＂ [表記: {}; 読み: {}] popular anime title (MAL/HuggingFace)".format(surface, reading)
        rows.append(f"{_id}\tINJEONG\t{mean}\t0\tJAN\t2\t{reading}\t{surface}")
    return rows


def main():
    sql = DB_SQL.read_text(encoding="utf-8")

    ko_start, ko_end, ko_block = split_copy_block(sql, KO_COPY_TOKEN)
    ja_start, ja_end, ja_block = split_copy_block(sql, JA_COPY_TOKEN)

    ko_existing = parse_existing_ids(ko_block)
    ja_existing = parse_existing_ids(ja_block)

    new_ko_rows = import_korean_anime(ko_existing)
    new_ja_rows = import_japanese_anime(ja_existing)

    updated_ko_block = ko_block + ("\n" if ko_block and not ko_block.endswith("\n") else "") + "\n".join(new_ko_rows)
    updated_ja_block = ja_block + ("\n" if ja_block and not ja_block.endswith("\n") else "") + "\n".join(new_ja_rows)

    sql = sql[:ko_start] + updated_ko_block + sql[ko_end:]
    ja_shift = len(updated_ko_block) - len(ko_block)
    ja_start += ja_shift
    ja_end += ja_shift
    sql = sql[:ja_start] + updated_ja_block + sql[ja_end:]

    DB_SQL.write_text(sql, encoding="utf-8")
    print(f"Added {len(new_ko_rows)} Korean anime rows and {len(new_ja_rows)} Japanese anime rows to db.sql")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
