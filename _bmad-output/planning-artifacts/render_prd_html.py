from pathlib import Path
import datetime
import markdown


def main() -> None:
    md_path = Path(
        r"c:\Users\dhire\OneDrive\Documents\mybmadproj\_bmad-output\planning-artifacts\prd-agile-forum.md"
    )
    out_path = md_path.with_suffix(".html")
    text = md_path.read_text(encoding="utf-8")
    body = markdown.markdown(
        text,
        extensions=["tables", "fenced_code", "toc", "sane_lists"],
    )

    css = (
        "body{font-family:Inter,Segoe UI,Arial,sans-serif;max-width:1080px;margin:0 auto;"
        "padding:32px;line-height:1.6;color:#1f2937;background:#f8fafc}"
        "h1,h2,h3{line-height:1.25;color:#0f172a}"
        "h1{font-size:2rem;margin-top:0}"
        "h2{font-size:1.45rem;margin-top:2rem;border-bottom:1px solid #e5e7eb;padding-bottom:.35rem}"
        "h3{font-size:1.15rem;margin-top:1.2rem}"
        "table{border-collapse:collapse;width:100%;margin:1rem 0;background:#fff}"
        "th,td{border:1px solid #d1d5db;padding:.55rem;vertical-align:top}"
        "th{background:#f1f5f9;text-align:left}"
        "code{background:#eef2ff;padding:.1rem .3rem;border-radius:4px}"
        "pre{background:#0b1020;color:#e2e8f0;padding:1rem;border-radius:8px;overflow:auto}"
        "blockquote{border-left:4px solid #cbd5e1;padding:.2rem .9rem;margin:1rem 0;color:#334155;background:#f8fafc}"
        "ul,ol{padding-left:1.4rem}"
        ".meta{color:#64748b;font-size:.9rem;margin-bottom:1rem}"
    )
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    html = (
        "<!doctype html><html lang='en'><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width, initial-scale=1'>"
        "<title>PRD - Agile Forum</title>"
        f"<style>{css}</style></head><body>"
        f"<div class='meta'>Generated from {md_path.name} on {now}</div>"
        f"{body}</body></html>"
    )
    out_path.write_text(html, encoding="utf-8")
    print(out_path)


if __name__ == "__main__":
    main()
