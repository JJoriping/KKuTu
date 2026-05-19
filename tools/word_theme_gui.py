#!/usr/bin/env python3

from pathlib import Path
import argparse
import html
import json
import unicodedata
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote, urlparse

try:
    import tkinter as tk
    from tkinter import ttk, messagebox

    TK_AVAILABLE = True
    TK_IMPORT_ERROR = None
except Exception as exc:
    tk = None
    ttk = None
    messagebox = None
    TK_AVAILABLE = False
    TK_IMPORT_ERROR = exc

ROOT = Path(__file__).resolve().parent.parent
DB_SQL = ROOT / "db.sql"
ALL_THEMES = "(전체)"
DISPLAY_LIMIT = 5000

TABLES = {
    "한국어 (kkutu_ko)": {
        "copy_header": "COPY kkutu_ko (_id, type, mean, hit, flag, theme) FROM stdin;",
        "word_index": 0,
        "theme_index": 5,
    },
    "일본어 (kkutu_ja)": {
        "copy_header": "COPY kkutu_ja (_id, type, mean, hit, theme, flag, reading, surface) FROM stdin;",
        "word_index": 0,
        "theme_index": 4,
        "display_word_indices": [7, 0],
        "search_word_indices": [0, 6, 7],
    },
    "영어 (kkutu_en)": {
        "copy_header": "COPY kkutu_en (_id, type, mean, hit, theme, flag) FROM stdin;",
        "word_index": 0,
        "theme_index": 4,
    },
}

WEB_PAGE = """<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KKuTu 단어/테마 뷰어</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; background: #121212; color: #efefef; }
    .wrap { padding: 12px; }
    .row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
    select, input, button { padding: 7px 8px; border-radius: 6px; border: 1px solid #444; background: #1d1d1d; color: #efefef; }
    button { cursor: pointer; }
    table { width: 100%; border-collapse: collapse; background: #1a1a1a; }
    th, td { border: 1px solid #333; padding: 7px; text-align: left; vertical-align: top; }
    th { background: #222; position: sticky; top: 0; }
    .table-wrap { max-height: calc(100vh - 130px); overflow: auto; border: 1px solid #333; }
    #status { color: #b8b8b8; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="row">
      <label>사전: <select id="source"></select></label>
      <label>테마: <select id="theme"></select></label>
      <label>단어 검색: <input id="query" type="text" placeholder="단어 일부 입력"></label>
      <button id="refresh">새로고침</button>
    </div>
    <div id="status">로딩 중...</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th style="width: 33%;">단어</th><th>테마</th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
  </div>
  <script>
    const sourceEl = document.getElementById("source");
    const themeEl = document.getElementById("theme");
    const queryEl = document.getElementById("query");
    const rowsEl = document.getElementById("rows");
    const statusEl = document.getElementById("status");
    const refreshBtn = document.getElementById("refresh");
    const ALL = "(전체)";
    let currentThemes = [ALL];

    function fillSelect(select, values, selected) {
      select.innerHTML = "";
      for (const value of values) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        if (value === selected) option.selected = true;
        select.appendChild(option);
      }
    }

    async function loadSources() {
      const res = await fetch("/api/sources");
      const data = await res.json();
      fillSelect(sourceEl, data.sources, data.sources[0] || "");
      await reload();
    }

    function renderRows(rows) {
      rowsEl.innerHTML = "";
      for (const row of rows) {
        const tr = document.createElement("tr");
        const tdWord = document.createElement("td");
        const tdTheme = document.createElement("td");
        tdWord.textContent = row.word;
        tdTheme.textContent = row.theme_raw;
        tr.appendChild(tdWord);
        tr.appendChild(tdTheme);
        rowsEl.appendChild(tr);
      }
    }

    async function reload(force = false) {
      const source = sourceEl.value;
      const theme = themeEl.value || ALL;
      const q = queryEl.value || "";
      const url = `/api/data?source=${encodeURIComponent(source)}&theme=${encodeURIComponent(theme)}&q=${encodeURIComponent(q)}&force=${force ? "1" : "0"}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        statusEl.textContent = data.error;
        rowsEl.innerHTML = "";
        return;
      }
      currentThemes = [ALL].concat(data.themes || []);
      fillSelect(themeEl, currentThemes, currentThemes.includes(theme) ? theme : ALL);
      renderRows(data.rows || []);
      statusEl.textContent = data.status || "";
    }

    sourceEl.addEventListener("change", () => reload());
    themeEl.addEventListener("change", () => reload());
    queryEl.addEventListener("input", () => reload());
    refreshBtn.addEventListener("click", () => reload(true));

    loadSources().catch((e) => {
      statusEl.textContent = `오류: ${e}`;
    });
  </script>
</body>
</html>
"""


def decode_copy_value(value: str) -> str:
    if value == r"\N":
        return ""
    return (
        value.replace(r"\\", "\\")
        .replace(r"\t", "\t")
        .replace(r"\n", "\n")
        .replace(r"\r", "\r")
    )


def iter_copy_rows(file_path: Path, copy_header: str):
    in_target_block = False
    with file_path.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.rstrip("\n")
            if not in_target_block:
                if line == copy_header:
                    in_target_block = True
                continue
            if line == r"\.":
                break
            yield line.split("\t")


def load_words(file_path: Path, table_key: str):
    cfg = TABLES[table_key]
    display_word_indices = cfg.get("display_word_indices", [cfg["word_index"]])
    search_word_indices = cfg.get("search_word_indices", [cfg["word_index"]])
    rows = []
    themes = set()
    for fields in iter_copy_rows(file_path, cfg["copy_header"]):
        if len(fields) <= cfg["theme_index"]:
            continue
        decoded_fields = [decode_copy_value(value).strip() for value in fields]

        word = ""
        for index in display_word_indices:
            if index < len(decoded_fields) and decoded_fields[index]:
                word = decoded_fields[index]
                break

        if not word:
            continue

        searchable_parts = []
        for index in search_word_indices:
            if index < len(decoded_fields) and decoded_fields[index]:
                searchable_parts.append(normalize_text(decoded_fields[index]))
        searchable_text = " ".join(searchable_parts)

        theme_raw = decoded_fields[cfg["theme_index"]].strip()
        tokens = tuple(token.strip() for token in theme_raw.split(",") if token.strip())
        rows.append((word, theme_raw, tokens, searchable_text))
        themes.update(tokens)
    return rows, sorted(themes)


def normalize_text(value: str) -> str:
    return unicodedata.normalize("NFKC", value).casefold()


def filter_rows(rows, selected_theme, query, limit):
    query_normalized = normalize_text(query.strip())
    matched = 0
    shown_rows = []
    for word, theme_raw, theme_tokens, searchable_text in rows:
        if selected_theme != ALL_THEMES and selected_theme not in theme_tokens:
            continue
        if query_normalized and query_normalized not in searchable_text:
            continue
        matched += 1
        if len(shown_rows) < limit:
            shown_rows.append({"word": word, "theme_raw": theme_raw})
    return matched, shown_rows


if TK_AVAILABLE:

    class WordThemeGui(tk.Tk):
        def __init__(self):
            super().__init__()
            self.title("KKuTu 단어/테마 뷰어")
            self.geometry("980x640")

            self.db_sql_path = DB_SQL
            self.cache = {}

            self.source_var = tk.StringVar(value=next(iter(TABLES.keys())))
            self.theme_var = tk.StringVar(value=ALL_THEMES)
            self.search_var = tk.StringVar()
            self.status_var = tk.StringVar(value="데이터를 불러오려면 [불러오기]를 누르세요.")

            self._build_ui()

        def _build_ui(self):
            controls = ttk.Frame(self, padding=10)
            controls.pack(fill=tk.X)

            ttk.Label(controls, text="사전:").pack(side=tk.LEFT)
            self.source_combo = ttk.Combobox(
                controls, textvariable=self.source_var, values=list(TABLES.keys()), state="readonly", width=20
            )
            self.source_combo.pack(side=tk.LEFT, padx=(6, 12))
            self.source_combo.bind("<<ComboboxSelected>>", lambda _ev: self.on_source_changed())

            ttk.Label(controls, text="테마:").pack(side=tk.LEFT)
            self.theme_combo = ttk.Combobox(
                controls, textvariable=self.theme_var, values=[ALL_THEMES], state="readonly", width=28
            )
            self.theme_combo.pack(side=tk.LEFT, padx=(6, 12))
            self.theme_combo.bind("<<ComboboxSelected>>", lambda _ev: self.apply_filter())

            ttk.Label(controls, text="단어 검색:").pack(side=tk.LEFT)
            search_entry = ttk.Entry(controls, textvariable=self.search_var, width=24)
            search_entry.pack(side=tk.LEFT, padx=(6, 8))
            search_entry.bind("<KeyRelease>", lambda _ev: self.apply_filter())

            ttk.Button(controls, text="불러오기", command=self.load_current_source).pack(side=tk.LEFT, padx=(0, 8))
            ttk.Button(controls, text="새로고침", command=self.refresh_current_source).pack(side=tk.LEFT)

            table_wrap = ttk.Frame(self, padding=(10, 0, 10, 0))
            table_wrap.pack(fill=tk.BOTH, expand=True)

            self.tree = ttk.Treeview(table_wrap, columns=("word", "theme"), show="headings")
            self.tree.heading("word", text="단어")
            self.tree.heading("theme", text="테마")
            self.tree.column("word", width=320, anchor=tk.W)
            self.tree.column("theme", width=620, anchor=tk.W)

            y_scroll = ttk.Scrollbar(table_wrap, orient=tk.VERTICAL, command=self.tree.yview)
            x_scroll = ttk.Scrollbar(table_wrap, orient=tk.HORIZONTAL, command=self.tree.xview)
            self.tree.configure(yscrollcommand=y_scroll.set, xscrollcommand=x_scroll.set)

            self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            y_scroll.pack(side=tk.RIGHT, fill=tk.Y)
            x_scroll.pack(side=tk.BOTTOM, fill=tk.X)

            ttk.Label(self, textvariable=self.status_var, padding=10).pack(fill=tk.X)

        def on_source_changed(self):
            self.theme_var.set(ALL_THEMES)
            if self.source_var.get() in self.cache:
                self._update_theme_combo()
                self.apply_filter()
                return
            self.status_var.set("선택한 사전이 아직 로드되지 않았습니다. [불러오기]를 누르세요.")
            self._clear_rows()

        def load_current_source(self):
            source = self.source_var.get()
            try:
                rows, themes = load_words(self.db_sql_path, source)
            except Exception as exc:
                messagebox.showerror("로드 실패", f"데이터를 읽는 중 오류가 발생했습니다.\n{exc}")
                return
            self.cache[source] = {"rows": rows, "themes": themes}
            self._update_theme_combo()
            self.apply_filter()

        def refresh_current_source(self):
            source = self.source_var.get()
            if source in self.cache:
                del self.cache[source]
            self.load_current_source()

        def _update_theme_combo(self):
            source = self.source_var.get()
            themes = self.cache[source]["themes"]
            self.theme_combo["values"] = [ALL_THEMES] + themes
            if self.theme_var.get() not in self.theme_combo["values"]:
                self.theme_var.set(ALL_THEMES)

        def _clear_rows(self):
            self.tree.delete(*self.tree.get_children())

        def apply_filter(self):
            source = self.source_var.get()
            if source not in self.cache:
                return

            selected_theme = self.theme_var.get()
            query = self.search_var.get()
            rows = self.cache[source]["rows"]
            matched, shown_rows = filter_rows(rows, selected_theme, query, DISPLAY_LIMIT)

            self._clear_rows()
            for row in shown_rows:
                self.tree.insert("", tk.END, values=(row["word"], row["theme_raw"]))

            if matched > DISPLAY_LIMIT:
                self.status_var.set(
                    f"총 {matched:,}개 단어가 검색되어 상위 {DISPLAY_LIMIT:,}개만 표시했습니다. "
                    "더 구체적으로 검색해 주세요."
                )
            else:
                self.status_var.set(f"총 {matched:,}개 단어를 표시 중입니다.")


def run_web_gui():
    cache = {}

    class Handler(BaseHTTPRequestHandler):
        def _json(self, payload, status=200):
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _html(self, body, status=200):
            data = body.encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def log_message(self, _format, *_args):
            return

        def do_GET(self):
            parsed = urlparse(self.path)
            if parsed.path == "/":
                self._html(WEB_PAGE)
                return

            if parsed.path == "/api/sources":
                self._json({"sources": list(TABLES.keys())})
                return

            if parsed.path == "/api/data":
                qs = parse_qs(parsed.query)
                source = (qs.get("source") or [next(iter(TABLES.keys()))])[0]
                selected_theme = (qs.get("theme") or [ALL_THEMES])[0]
                query = (qs.get("q") or [""])[0]
                force = (qs.get("force") or ["0"])[0] == "1"

                if source not in TABLES:
                    self._json({"error": "유효하지 않은 사전입니다."}, 400)
                    return

                try:
                    if force or source not in cache:
                        rows, themes = load_words(DB_SQL, source)
                        cache[source] = {"rows": rows, "themes": themes}
                    rows = cache[source]["rows"]
                    themes = cache[source]["themes"]
                    matched, shown_rows = filter_rows(rows, selected_theme, query, DISPLAY_LIMIT)
                    if matched > DISPLAY_LIMIT:
                        status_text = (
                            f"총 {matched:,}개 단어가 검색되어 상위 {DISPLAY_LIMIT:,}개만 표시했습니다. "
                            "더 구체적으로 검색해 주세요."
                        )
                    else:
                        status_text = f"총 {matched:,}개 단어를 표시 중입니다."
                    self._json({"themes": themes, "rows": shown_rows, "status": status_text})
                except Exception as exc:
                    self._json({"error": html.escape(str(exc))}, 500)
                return

            self.send_response(404)
            self.end_headers()

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    host, port = server.server_address
    url = f"http://{host}:{port}/"
    print("tkinter를 사용할 수 없어 브라우저 GUI 모드로 실행합니다.")
    print(f"브라우저에서 열기: {url}")
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


def main():
    parser = argparse.ArgumentParser(description="KKuTu 단어 목록/테마 필터 GUI")
    parser.add_argument("--web", action="store_true", help="tkinter 대신 브라우저 GUI 모드로 강제 실행")
    args = parser.parse_args()

    if args.web or not TK_AVAILABLE:
        if not TK_AVAILABLE and TK_IMPORT_ERROR:
            print(f"tkinter 로드 실패: {TK_IMPORT_ERROR}")
        run_web_gui()
        return

    app = WordThemeGui()
    app.mainloop()


if __name__ == "__main__":
    main()
