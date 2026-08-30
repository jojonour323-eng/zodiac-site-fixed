#!/usr/bin/env python3
"""Fetch a page from the prod server and sum first-load JS/CSS with gzip sizes."""
import re, os, sys, gzip, urllib.request

BASE = "/home/z/my-project/.next"
url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100/"
html = urllib.request.urlopen(url).read().decode("utf-8", "replace")

js = sorted(set(re.findall(r'static/chunks/[a-f0-9]+\.js', html)))
css = sorted(set(re.findall(r'static/css/[a-f0-9]+\.css', html)))

tot = gz_tot = 0
print("first-load JS chunks:")
for j in js:
    p = os.path.join(BASE, j)
    if not os.path.exists(p):
        print("  MISSING", j); continue
    raw = os.path.getsize(p)
    gz = len(gzip.compress(open(p, 'rb').read(), 9))
    tot += raw; gz_tot += gz
    print(f"  {raw/1024:7.1f} KB (gz {gz/1024:5.1f})  {os.path.basename(j)}")
print(f"FIRST-LOAD JS: {tot/1024:.0f} KB raw / {gz_tot/1024:.0f} KB gzip")
for cc in css:
    p = os.path.join(BASE, cc)
    print(f"CSS: {os.path.getsize(p)/1024:.1f} KB  {os.path.basename(cc)}")
print(f"HTML size: {len(html)/1024:.1f} KB")
