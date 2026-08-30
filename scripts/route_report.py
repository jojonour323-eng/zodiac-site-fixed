#!/usr/bin/env python3
"""Report: which JS chunks does each route require on first load, and totals."""
import os, re, gzip

BASE = "/home/z/my-project/.next"
ROUTES = {
    "/": "server/app/index.html",
    "/admin": "server/app/admin.html",
}

def route_chunks(html_path):
    if not os.path.exists(html_path):
        return []
    with open(html_path, encoding="utf-8", errors="replace") as f:
        c = f.read()
    # match any chunk reference in script/preload links
    refs = set(re.findall(r'static/chunks/([a-f0-9]+\.js)', c))
    out = []
    for r in refs:
        p = os.path.join(BASE, "static/chunks", r)
        if os.path.exists(p):
            out.append((r, os.path.getsize(p)))
    return sorted(out, key=lambda x: -x[1])

def route_css(html_path):
    if not os.path.exists(html_path):
        return []
    with open(html_path, encoding="utf-8", errors="replace") as f:
        c = f.read()
    refs = set(re.findall(r'static/css/([a-f0-9]+\.css)', c))
    out = []
    for r in refs:
        p = os.path.join(BASE, "static/css", r)
        if os.path.exists(p):
            out.append((r, os.path.getsize(p)))
    return out

for route, rel in ROUTES.items():
    chunks = route_chunks(os.path.join(BASE, rel))
    total = sum(s for _, s in chunks)
    gz = sum(len(gzip.compress(open(os.path.join(BASE, "static/chunks", r), 'rb').read(), 9)) for r, _ in chunks)
    css = route_css(os.path.join(BASE, rel))
    css_t = sum(s for _, s in css)
    print(f"\n=== {route} first-load JS: {total/1024:.0f} KB raw / {gz/1024:.0f} KB gzip  (+CSS {css_t/1024:.0f} KB) ===")
    for r, s in chunks:
        print(f"  {s/1024:7.1f} KB  {r}")

# what's in the biggest async chunks now
print("\n=== async chunk identities ===")
probes = {
    "interpretations content": "Rising Sign",
    "flagContent": "What's actually happening",
    "kink": "The placements behind this",
    "soulmate": "soulmate",
    "readingEngine": "planetOrdered",
    "compat": "Why this score",
    "framer-motion": "AnimatePresence",
}
for n in sorted(os.listdir(os.path.join(BASE, "static/chunks"))):
    if not n.endswith(".js"):
        continue
    p = os.path.join(BASE, "static/chunks", n)
    s = os.path.getsize(p)
    if s < 60 * 1024:
        continue
    c = open(p, encoding="utf-8", errors="replace").read()
    hits = [k for k, v in probes.items() if v.lower() in c.lower()]
    print(f"  {s/1024:7.1f} KB  {n}  <- {hits}")
