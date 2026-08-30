#!/usr/bin/env python3
"""Measure production client bundle: raw + gzip sizes per chunk, and
identify which source modules (and packages) are inside the biggest chunks."""
import gzip, os, re, sys
from collections import defaultdict

CHUNKS = "/home/z/my-project/.next/static/chunks"

def human(n):
    return f"{n/1024:.1f} KB" if n < 1024*1024 else f"{n/1024/1024:.2f} MB"

files = []
total_raw = total_gz = 0
for dirpath, _, names in os.walk(CHUNKS):
    for n in names:
        if n.endswith(".js"):
            p = os.path.join(dirpath, n)
            raw = os.path.getsize(p)
            with open(p, "rb") as f:
                gz = len(gzip.compress(f.read(), 9))
            files.append((p, raw, gz))
            total_raw += raw; total_gz += gz

print("=== client JS chunks (raw -> gzip) ===")
for p, raw, gz in sorted(files, key=lambda x: -x[1]):
    print(f"{human(raw):>10} -> {human(gz):>10}  {os.path.basename(p)}")
print(f"\nTOTAL client JS: {human(total_raw)} raw / {human(total_gz)} gzipped")

# CSS
css_dir = "/home/z/my-project/.next/static/css"
if os.path.isdir(css_dir):
    tr = tg = 0
    for n in os.listdir(css_dir):
        p = os.path.join(css_dir, n)
        raw = os.path.getsize(p)
        with open(p, "rb") as f: gz = len(gzip.compress(f.read(), 9))
        tr += raw; tg += gz
    print(f"TOTAL client CSS: {human(tr)} raw / {human(tg)} gzipped")

# What's inside the biggest chunks: look for distinctive module markers
print("\n=== module fingerprint in top chunks ===")
markers = {
    "interpretations": ["Rising Sign Energies", "Dating ", "mercury_retrograde", "SIGN_META"],
    "flagContent": ["What's actually happening", "How to work with it"],
    "readingEngine": ["buildReading", "planetSection"],
    "kink": ["bdsm-test", "registerFor", "House8"],
    "react-dom": ["react-dom", "ReactDOM"],
    "framer-motion": ["AnimatePresence", "motion("],
    "recharts": ["CartesianGrid", "PolarAngleAxis"],
    "lucide": ["LucideIcon", "createLucideIcon"],
    "date-fns": ["date-fns", "addDays"],
    "@mdxeditor": ["mdxeditor"],
    "swisseph": ["swisseph"],
    "all-the-cities": ["all-the-cities"],
    "geoip-lite": ["geoip-lite"],
    "geo-tz": ["geo-tz"],
    "radix": ["Radix", "DismissableLayer"],
    "zod": ["zod"],
    "embla": ["embla"],
    "recharts/DataTable": ["shadcnTable"],
}
for p, raw, gz in sorted(files, key=lambda x: -x[1])[:6]:
    with open(p, encoding="utf-8", errors="replace") as f:
        content = f.read()
    hits = []
    for label, needles in markers.items():
        c = sum(1 for nd in needles if nd in content)
        if c > 0:
            hits.append(f"{label}({c})")
    print(f"{os.path.basename(p)} [{human(raw)}]: {', '.join(hits) if hits else '(no marker match)'}")

# package side: check if server-only heavy deps appear anywhere in client chunks
print("\n=== server-only deps leaked into client? ===")
for dep in ["swisseph", "all-the-cities", "geoip-lite", "geo-tz", "suncalc"]:
    found = [os.path.basename(p) for p, _, _ in files if dep in open(p, encoding="utf-8", errors="replace").read()]
    if found:
        print(f"  {dep}: FOUND in {found}")
    else:
        print(f"  {dep}: clean")
