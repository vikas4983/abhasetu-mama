#!/usr/bin/env python3
"""Parse ABDM Postman collections into docs/milestone-api-inventory.md"""
import json
import os
import re
from pathlib import Path

FILES = [
    r"c:\Users\ADMIN\Downloads\1 - Milestone_1_Postman_Collection_18_08_2025_postman_collection_d202ddf09a.json",
    r"c:\Users\ADMIN\Downloads\2 - Scan_and_Share_14_08_2025_postman_collection_0cfdcce1cf.json",
    r"c:\Users\ADMIN\Downloads\3 - Running_token_status_postman_collection_70ee95458d.json",
    r"c:\Users\ADMIN\Downloads\4 - Milestone_2_16_02_2026_6e734af067 (2).postman_collection",
    r"c:\Users\ADMIN\Downloads\5 - Milestone_3_16_02_2026_796709b791 (2).postman_collection",
]


def walk_items(items, folder=""):
    rows = []
    for it in items or []:
        name = it.get("name", "")
        path = f"{folder}/{name}".strip("/")
        if "item" in it:
            rows.extend(walk_items(it["item"], path))
        req = it.get("request")
        if req:
            method = req.get("method", "")
            url = req.get("url", {})
            raw = url.get("raw", "") if isinstance(url, dict) else str(url)
            m = re.search(r"https?://[^/]+(/.*)", raw)
            abdm_path = m.group(1) if m else raw
            bff = abdm_path
            if abdm_path.startswith("/api/") and not abdm_path.startswith("/api/abdm"):
                bff = "/api/abdm" + abdm_path[4:]
            rows.append(
                {
                    "collection_folder": path,
                    "method": method,
                    "abdm_path": abdm_path,
                    "bff_path": bff,
                }
            )
    return rows


def main():
    all_rows = []
    for f in FILES:
        if not os.path.exists(f):
            print("MISSING", f)
            continue
        with open(f, encoding="utf-8") as fh:
            data = json.load(fh)
        coll = data.get("info", {}).get("name", Path(f).stem)
        rows = walk_items(data.get("item", []))
        for r in rows:
            r["collection"] = coll
        all_rows.extend(rows)

    out = Path(__file__).resolve().parent.parent / "docs" / "milestone-api-inventory.md"
    out.parent.mkdir(exist_ok=True)
    lines = [
        "# ABDM API Inventory (Postman → BFF)",
        "",
        f"Total endpoints: {len(all_rows)}",
        "",
        "| Collection | Folder | Method | ABDM Path | BFF Path |",
        "|---|---|---|---|---|",
    ]
    for r in sorted(all_rows, key=lambda x: (x["collection"], x["abdm_path"])):
        lines.append(
            f"| {r['collection']} | {r['collection_folder']} | {r['method']} "
            f"| `{r['abdm_path']}` | `{r['bff_path']}` |"
        )
    out.write_text("\n".join(lines), encoding="utf-8")
    print("Wrote", out, "rows", len(all_rows))


if __name__ == "__main__":
    main()
