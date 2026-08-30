#!/usr/bin/env python3
"""Deep probe: which packages/modules live in each client chunk + which routes load which chunks."""
import os, re, json, gzip
from collections import defaultdict

CHUNKS = "/home/z/my-project/.next/static/chunks"

def probe(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        c = f.read()
    pkgs = {
        "framer-motion": ["framer-motion", "AnimatePresence", "LayoutGroup", "MotionConfig"],
        "react-dom": ["react-dom", "hydrateRoot", "createPortal"],
        "react": ["react.production", "react.development", "useState"],
        "radix-ui": ["DismissableLayer", "Radix", "CollectibleSort", "popperContent", "rovingFocus"],
        "lucide-react": ["createLucideIcon", "LucideIcon"],
        "recharts": ["CartesianGrid", "PolarAngleAxis", "RadialBarChart", "recharts"],
        "date-fns": ["addDays", "formatISO", "dateFns"],
        "zod": ["ZodError", "zod"],
        "embla": ["emblaCarousel", "EmblaCarousel"],
        "vaul": ["vaul", "DrawerContent"],
        "sonner": ["sonner", "Toaster"],
        "react-hook-form": ["useForm", "Controller"],
        "@tanstack/react-query": ["QueryClient", "useQuery"],
        "@tanstack/react-table": ["flexRender", "getCoreRowModel"],
        "dnd-kit": ["DndContext", "useDraggable"],
        "next-themes": ["ThemeProvider", "next-themes"],
        "interpretations.ts content": ["Sun Sign Guide", "Moon Sign", "Rising Sign", "Venus in"],
        "flagContent.ts content": ["What's actually happening", "How to work with it"],
        "readingEngine": ["buildFullReading", "planetOrdered"],
        "signPsych/deep": ["signContent", "deep reading"],
        "kink engine": ["register", "House8", "bdsm"],
        "soulmate": ["soulmate", "SoulmateCard"],
        "swisseph client leak": ["swisseph", "FLG_SWIEPH"],
    }
    found = []
    for label, needles in pkgs.items():
        cnt = sum(c.count(nd) for nd in needles)
        if cnt > 0:
            found.append(f"{label}={cnt}")
    return found

print("=== chunk contents ===")
for n in sorted(os.listdir(CHUNKS)):
    if not n.endswith(".js"): continue
    p = os.path.join(CHUNKS, n)
    size = os.path.getsize(p)
    print(f"\n{n} ({size/1024:.0f} KB):")
    for f in probe(p):
        print(f"   {f}")

# which routes load which chunks
print("\n\n=== route -> chunk mapping ===")
appbuild = "/home/z/my-project/.next/app-build-manifest.json"
if os.path.exists(appbuild):
    with open(appbuild) as f:
        m = json.load(f)
    for route, files in m.get("pages", m.get("routes", {})).items():
        js = [os.path.basename(f2) for f2 in files if f2.endswith(".js") and "static/chunks" in f2]
        sizes = [os.path.getsize(os.path.join(CHUNKS, j))/1024 for j in js if os.path.exists(os.path.join(CHUNKS, j))]
        tot = sum(sizes)
        print(f"\n{route}: {tot:.0f} KB across {len(js)} chunks")
        for j, s in sorted(zip(js, sizes), key=lambda x: -x[1])[:8]:
            print(f"   {s:7.1f} KB  {j}")
else:
    print("no app-build-manifest.json")
