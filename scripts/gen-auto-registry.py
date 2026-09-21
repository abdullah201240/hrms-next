#!/usr/bin/env python3
"""
Generates src/lib/crud/registry.auto.ts and rewrites plain DataTable list pages
to <CrudList/>, giving every doctype screen full New/Detail/Edit parity.

Configs are auto-cloned from the MOCK TypeScript interfaces: string-union prop
types (e.g. `status: RequestDocStatus`, `frequency: "Daily" | "Weekly"`) ARE the
real Frappe Select options. Field labels come from each page's existing column
headers, falling back to a prettified prop name.

The set of routes + their columns/labels is captured in scripts/auto-targets.json
so the script is IDEMPOTENT: after list pages have been rewritten to <CrudList/>
(which no longer contain the original columns), the snapshot is reused instead of
re-scanning the now-plain pages. Delete auto-targets.json to force a fresh scan
(from pristine pages: `git checkout -- "src/app/(app)"` first).

After running this, create the New/Detail/Edit sub-routes for every registered
doctype:
    python3 scripts/gen-auto-registry.py
    node scripts/scaffold-crud.mjs
"""
import os
import re
import glob
import json

ROOT = "src/app/(app)"
HERE = os.path.dirname(os.path.abspath(__file__))
SNAPSHOT = os.path.join(HERE, "auto-targets.json")
OUT_TS = "src/lib/crud/registry.auto.ts"

MOCK = {p: open(p).read() for p in glob.glob("src/lib/mock/data*.ts")}

# Routes that are dashboards / self-service / bespoke tools, NOT single-doctype
# lists — intentionally skipped by the engine.
EXCLUDE = {
    "/attendance", "/payroll", "/expenses", "/leave", "/employees", "/company",
    "/settings", "/dashboard", "/org-chart", "/notifications", "/reports",
    "/change-password", "/profile", "/attendance/my-timesheets",
    "/attendance/mark-attendance", "/attendance/roster",
    "/attendance/shift-assignment-tool", "/payroll/bulk-assignment",
    "/payroll/processing", "/recruitment/pipeline", "/expenses/approvals",
    "/leave/apply", "/leave/approvals", "/leave/balances", "/leave/control-panel",
    "/performance/goals", "/recruitment/jobs", "/my-advance", "/my-claims",
    "/my-leave", "/my-salary", "/branches-extra",
}

ISO_D = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ISO_DT = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}")


def parse_meta():
    aliases, ifaces, colls = {}, {}, {}
    for src in MOCK.values():
        for m in re.finditer(r"export type (\w+)\s*=\s*([^;]+);", src):
            lits = re.findall(r'"([^"]*)"', m.group(2))
            if lits:
                aliases[m.group(1)] = lits
        for m in re.finditer(r"export interface (\w+)\s*\{(.*?)\}", src, re.S):
            props = re.findall(r"(\w+)\??\s*:\s*([^;]+);", m.group(2))
            ifaces[m.group(1)] = [(p, t.strip()) for p, t in props]
    for fname, src in MOCK.items():
        for m in re.finditer(r"export const (\w+)\s*:\s*(\w+)\[\]\s*=\s*\[(.*?)\n\];", src, re.S):
            recs = re.findall(r"\{[^{}]*\}", m.group(3))
            colls[m.group(1)] = (m.group(2), recs, os.path.basename(fname))
    return aliases, ifaces, colls


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def prettify(k):
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", k)
    s = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", s)
    return (s[0].upper() + s[1:]) if s else k


def singular(t):
    t = t.strip()
    if t.endswith("ies"):
        return t[:-3] + "y"
    if t.endswith("sses"):
        return t[:-2]
    if t.endswith("s") and not t.endswith("ss"):
        return t[:-1]
    return t


def scan_targets():
    reg = open("src/lib/crud/registry.ts").read()
    done = set(re.findall(r'route:\s*"(/[^"]*)"', reg))
    targets = []
    for f in sorted(glob.glob(os.path.join(ROOT, "**", "page.tsx"), recursive=True)):
        rel = f.replace(ROOT + "/", "").replace("/page.tsx", "")
        route = "/" + rel
        if "[id]" in route or "[slug]" in route or route.endswith("/new"):
            continue
        if route in EXCLUDE or route in done:
            continue
        s = open(f).read()
        if "DataTable" not in s:
            continue
        mrow = re.search(r"rows=\{([A-Za-z0-9_]+)\}", s)
        if not mrow:
            continue
        mtitle = re.search(r'title="([^"]+)"', s)
        plural = mtitle.group(1) if mtitle else prettify(rel.split("/")[-1])
        mdesc = re.search(r'description=\{?"([^"]+)"', s)
        cols = re.findall(r'\{\s*key:\s*"(\w+)"[^}]*?header:\s*"([^"]+)"(.*?)\}', s, re.S)
        columns = []
        for k, h, rest in cols:
            if k in ("id", "actions"):
                continue
            align = re.search(r'align:\s*"(\w+)"', rest)
            columns.append([k, h, align.group(1) if align else None, "sortable: true" in rest])
        if not columns:
            continue
        targets.append({"route": route, "var": mrow.group(1), "plural": plural,
                        "desc": (mdesc.group(1) if mdesc else None), "columns": columns})
    return targets


def build_field(prop, typ, recs, label):
    opts = None
    lits = re.findall(r'"([^"]*)"', typ)
    if lits:
        opts = [l for l in lits if l != ""]
    elif typ in ALIASES:
        opts = ALIASES[typ]
    vals = []
    for r in recs:
        mm = re.search(r"\b" + re.escape(prop) + r'\s*:\s*"([^"]*)"', r)
        if mm:
            vals.append(mm.group(1))
    base = typ.replace("?", "").strip()
    if opts:
        ft = "select"
    elif base == "boolean":
        ft = "check"
    elif base == "number":
        ft = "float"
    elif vals and all(ISO_DT.match(v) for v in vals):
        ft = "datetime"
    elif vals and all(ISO_D.match(v) for v in vals):
        ft = "date"
    elif re.search(r"(description|remark|note|reason|address|detail|resume|body|summary|bio|comment|template)$", prop, re.I) or any(len(v) > 40 for v in vals):
        ft = "long"
    else:
        ft = "data"
    f = {"key": prop, "label": label, "type": ft}
    if opts is not None:
        f["options"] = opts
    if ft == "long":
        f["full"] = True
    return f


ALIASES, IFACES, COLLS = parse_meta()

if os.path.exists(SNAPSHOT):
    targets = json.load(open(SNAPSHOT))
    for t in targets:
        t["columns"] = [tuple(c) for c in t["columns"]]
else:
    targets = scan_targets()
    json.dump(targets, open(SNAPSHOT, "w"), indent=0)
    print("wrote snapshot", SNAPSHOT)

imports = {}
configs = []
for t in targets:
    var = t["var"]
    if var not in COLLS:
        print("  skip (no collection):", t["route"], var)
        continue
    ty, recs, fn = COLLS[var]
    props = IFACES.get(ty) or ([(k, "string") for k in re.findall(r"(\w+)\s*:", recs[0])] if recs else [])
    header = {c[0]: c[1] for c in t["columns"]}
    fields, seen = [], set()
    for prop, typ in props:
        if prop == "id":
            continue
        fields.append(build_field(prop, typ, recs, header.get(prop) or prettify(prop)))
        seen.add(prop)
    title_key = next((c for c in ("name", "title", "employee", "label") if c in seen),
                     (fields[0]["key"] if fields else "name"))
    for f in fields:
        if f["key"] == title_key:
            f["req"] = True
    columns = []
    for (k, h, a, srt) in t["columns"]:
        if k not in seen:
            continue
        c = {"key": k, "header": h}
        if srt:
            c["sortable"] = True
        if a:
            c["align"] = a
        columns.append(c)
    if not any(c["key"] == title_key for c in columns):
        columns.insert(0, {"key": title_key, "header": header.get(title_key, prettify(title_key)), "sortable": True})
    search = [c["key"] for c in columns if c["key"] in seen
              and next(f for f in fields if f["key"] == c["key"])["type"] == "data"][:3]
    imports.setdefault(fn, set()).add(var)
    configs.append({"route": t["route"], "label": singular(t["plural"]), "plural": t["plural"],
                    "desc": t["desc"], "var": var, "titleKey": title_key,
                    "columns": columns, "searchKeys": search, "fields": fields})


def field_ts(f):
    parts = [f'label: "{esc(f["label"])}"', f'type: "{f["type"]}"']
    if f.get("req"):
        parts.insert(0, "req: true")
    if "options" in f:
        parts.append("options: [%s]" % ", ".join('"%s"' % esc(o) for o in f["options"]))
    if f.get("full"):
        parts.append("full: true")
    return '          { key: "%s", %s },' % (f["key"], ", ".join(parts))


def col_ts(c):
    parts = ['header: "%s"' % esc(c["header"])]
    if c.get("sortable"):
        parts.append("sortable: true")
    if c.get("align"):
        parts.append('align: "%s"' % c["align"])
    return '      { key: "%s", %s },' % (c["key"], ", ".join(parts))


modmap = {"data.ts": "@/lib/mock/data", "data-2.ts": "@/lib/mock/data-2",
          "data-3.ts": "@/lib/mock/data-3", "data-4.ts": "@/lib/mock/data-4"}
imp_lines = []
for fn in sorted(imports, key=lambda x: (x not in ("data.ts", "data-2.ts", "data-3.ts"), x)):
    imp_lines.append('import { %s } from "%s";' % (", ".join(sorted(imports[fn])), modmap.get(fn, "@/lib/mock/" + fn.replace(".ts", ""))))

out = ["// AUTO-GENERATED by scripts/gen-auto-registry.py — cloned from the mock doctype",
       "// interfaces (which mirror the real Frappe forms). Do not hand-edit; regenerate.",
       'import type { DoctypeConfig } from "@/lib/crud/types";', *imp_lines, "",
       "export const AUTO_CONFIGS: DoctypeConfig[] = ["]
for c in configs:
    out.append("  {")
    out.append('    route: "%s",' % c["route"])
    out.append('    label: "%s",' % esc(c["label"]))
    out.append('    plural: "%s",' % esc(c["plural"]))
    if c["desc"]:
        out.append('    desc: "%s",' % esc(c["desc"]))
    out.append("    rows: %s," % c["var"])
    out.append('    titleKey: "%s",' % c["titleKey"])
    if c["searchKeys"]:
        out.append("    searchKeys: [%s]," % ", ".join('"%s"' % k for k in c["searchKeys"]))
    out.append("    columns: [")
    for col in c["columns"]:
        out.append(col_ts(col))
    out.append("    ],")
    out.append("    sections: [")
    out.append('      { title: "%s", fields: [' % esc(c["plural"]))
    for f in c["fields"]:
        out.append(field_ts(f))
    out.append("      ] },")
    out.append("    ],")
    out.append("  },")
out.append("];")
open(OUT_TS, "w").write("\n".join(out) + "\n")
print("wrote %s (%d configs)" % (OUT_TS, len(configs)))

for c in configs:
    p = os.path.join(ROOT, c["route"].lstrip("/"), "page.tsx")
    open(p, "w").write('"use client";\n\nimport { CrudList } from "@/components/shared/crud/crud-list";\n\nexport default function Page() {\n  return <CrudList doctype="%s" />;\n}\n' % c["route"])
print("rewrote %d list pages" % len(configs))
