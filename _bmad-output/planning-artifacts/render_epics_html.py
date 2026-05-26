from pathlib import Path
import datetime
import markdown


def main() -> None:
    md_path = Path(
        r"c:\Users\dhire\OneDrive\Documents\mybmadproj\_bmad-output\planning-artifacts\epics-agile-forum.md"
    )
    out_path = md_path.with_suffix(".html")

    text = md_path.read_text(encoding="utf-8")
    body = markdown.markdown(
        text,
        extensions=["tables", "fenced_code", "toc", "sane_lists"],
    )

    css = """
    :root{
      --bg:#f6f8fc;
      --card:#ffffff;
      --ink:#1f2937;
      --muted:#64748b;
      --h1:#0f172a;
      --h2:#1d4ed8;
      --h3:#7c3aed;
      --accent:#0ea5e9;
      --accent-soft:#e0f2fe;
      --border:#dbe2f0;
      --table-head:#eef2ff;
      --table-stripe:#f8fafc;
      --code-bg:#111827;
      --code-ink:#e5e7eb;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      background:var(--bg);
      color:var(--ink);
      font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;
      line-height:1.65;
      padding:30px;
    }
    .page{
      max-width:1180px;
      margin:0 auto;
      background:var(--card);
      border:1px solid var(--border);
      border-radius:14px;
      padding:32px 40px;
      box-shadow:0 10px 26px rgba(15,23,42,.06);
    }
    .meta{
      color:var(--muted);
      font-size:.92rem;
      margin-bottom:16px;
      padding:10px 12px;
      background:#f8fafc;
      border:1px solid var(--border);
      border-radius:8px;
    }
    h1,h2,h3{line-height:1.25;margin-top:1.4em}
    h1{
      color:var(--h1);
      font-size:2.05rem;
      margin-top:0;
      border-bottom:3px solid var(--accent);
      padding-bottom:10px;
    }
    h2{
      color:var(--h2);
      font-size:1.45rem;
      border-left:5px solid var(--accent);
      padding-left:10px;
      margin-top:2.1rem;
    }
    h3{
      color:var(--h3);
      font-size:1.1rem;
      margin-top:1.35rem;
    }
    strong{
      color:#111827;
      font-weight:700;
    }
    p code, li code{
      background:var(--accent-soft);
      color:#0c4a6e;
      border:1px solid #bae6fd;
      border-radius:6px;
      padding:2px 6px;
      font-weight:600;
    }
    pre{
      background:var(--code-bg);
      color:var(--code-ink);
      border-radius:10px;
      padding:14px 16px;
      overflow:auto;
      border:1px solid #1f2937;
    }
    pre code{
      background:none;
      border:none;
      color:inherit;
      padding:0;
      font-weight:500;
    }
    ul,ol{padding-left:1.3rem}
    li{margin:.35rem 0}
    hr{
      border:none;
      border-top:1px solid var(--border);
      margin:1.7rem 0;
    }
    blockquote{
      margin:1rem 0;
      border-left:4px solid var(--accent);
      background:#f8fdff;
      padding:8px 14px;
      color:#0f172a;
      border-radius:6px;
    }
    table{
      width:100%;
      border-collapse:collapse;
      margin:1rem 0 1.25rem;
      border:1px solid var(--border);
      font-size:.96rem;
    }
    thead th{
      background:var(--table-head);
      color:#1e3a8a;
      text-align:left;
      border:1px solid var(--border);
      padding:10px 12px;
      font-weight:700;
    }
    tbody td{
      border:1px solid var(--border);
      padding:9px 12px;
      vertical-align:top;
    }
    tbody tr:nth-child(even){background:var(--table-stripe)}
    """

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    html_doc = (
        "<!doctype html><html lang='en'><head>"
        "<meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width, initial-scale=1'>"
        "<title>Epics - Agile Forum MVP</title>"
        f"<style>{css}</style>"
        "</head><body>"
        "<main class='page'>"
        f"<div class='meta'>Generated from {md_path.name} on {now}</div>"
        f"{body}"
        "</main></body></html>"
    )

    out_path.write_text(html_doc, encoding="utf-8")
    print(out_path)


if __name__ == "__main__":
    main()
