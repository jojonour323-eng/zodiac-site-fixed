// ===========================================================================
// TEST SIMPLE ENGLISH — global website rule guard
// ---------------------------------------------------------------------------
// 1. STATIC: scan live content source files for banned "smart-sounding"
//    vocabulary and banned intro filler phrases.
// 2. DYNAMIC: generate real payloads for several personas via the running
//    dev server, walk EVERY user-visible string, and flag banned words,
//    filler intros, and runaway sentences.
// Fails non-zero when anything user-visible breaks the simple-English rule.
// ===========================================================================

import { readFileSync, existsSync } from "node:fs";

// ---------- banned vocabulary (displayed text only) ----------
const BANNED_WORDS: [string, RegExp][] = [
  ["oscillate", /\boscillat/i],
  ["even keel", /\beven keel/i],
  ["facilitate", /\bfacilitat/i],
  ["utilize", /\butiliz/i],
  ["veneer", /\bveneer/i],
  ["dissonance", /\bdissonance/i],
  ["attunement", /\battunement/i],
  ["interplay", /\binterplay/i],
  ["propensity", /\bpropensity/i],
  ["proclivity", /\bproclivity/i],
  ["ruminate", /\bruminate/i],
  ["intricate", /\bintricate/i],
  ["myriad", /\bmyriad/i],
  ["plethora", /\bplethora/i],
  ["quintessential", /\bquintessential/i],
  ["paramount", /\bparamount/i],
  ["meticulous", /\bmeticulous/i],
  ["seamless", /\bseamless/i],
  ["holistic", /\bholistic/i],
  ["visceral", /\bvisceral/i],
  ["coalesce", /\bcoalesc/i],
  ["confluence", /\bconfluence/i],
  ["dichotomy", /\bdichotomy/i],
  ["perpetually", /\bperpetually/i],
  ["penchant", /\bpenchant/i],
  ["amenable", /\bamenable/i],
  ["preamble", /\bpreamble/i],
  ["circuitry", /\bcircuitry/i],
  ["juxtapose", /\bjuxtapos/i],
  ["equanimity", /\bequanimity/i],
  ["intellectualize", /\bintellectualiz/i],
  ["psychological signature", /psychological signature/i],
  ["inner landscape", /inner landscape/i],
  ["emotional landscape", /emotional landscape/i],
  ["narrative arc", /narrative arc/i],
  ["hypervigilant", /\bhypervigilan/i],
];

// ---------- banned intro filler phrases ----------
const BANNED_INTROS: [string, RegExp][] = [
  ["core reading stripped", /core reading, stripped of context/i],
  ["central tension", /the central tension this chart/i],
  ["at the heart of this", /at the heart of this (placement|chart|aspect)/i],
  ["the deeper pattern here", /the deeper pattern here/i],
  ["what this reveals", /what this reveals/i],
  ["underlying dynamic", /the underlying dynamic/i],
  ["key theme emerges", /a key theme emerges/i],
  ["in essence", /in essence[:,]/i],
  ["at a deeper level", /at a deeper level[:,]/i],
  ["complex interplay", /complex interplay/i],
  ["chart suggests a complex", /the chart suggests a complex/i],
];

// ---------- live content files to static-scan ----------
const STATIC_FILES = [
  "src/lib/astro/personality/home.ts",
  "src/lib/astro/personality/compat.ts",
  "src/lib/astro/personality/soulmate.ts",
  "src/lib/astro/personality/kink.ts",
  "src/lib/astro/personality/archetype.ts",
  "src/lib/astro/personality/rings.ts",
  "src/lib/astro/personality/traitLines.ts",
  "src/lib/astro/personality/model.ts",
  "src/lib/astro/personality/deep/reading.ts",
  "src/lib/astro/personality/deep/signContent1.ts",
  "src/lib/astro/personality/deep/signContent2.ts",
  "src/lib/astro/personality/deep/signContent3.ts",
  "src/lib/astro/personality/deep/houseLines.ts",
  "src/lib/astro/personality/deep/aspectChapters.ts",
  "src/lib/astro/personality/deep/nodes.ts",
  "src/lib/astro/personality/deep/layers.ts",
  "src/lib/astro/personality/deep/playbook.ts",
  "src/lib/astro/personality/deep/sayLines.ts",
  "src/lib/astro/personality/deep/sayLines1.ts",
  "src/lib/astro/personality/deep/sayLines2.ts",
  "src/lib/astro/personality/deep/outerSigns1.ts",
  "src/lib/astro/personality/deep/outerSigns2.ts",
  "src/lib/astro/personality/deep/outerHouses.ts",
  "src/lib/astro/redflags.ts",
  "src/lib/astro/flagReading.ts",
  "src/lib/astro/personality/flagContent.ts",
  "src/lib/astro/matches.ts",
  "src/lib/astro/aspects.ts",
  "src/lib/astro/deepReading.ts",
  "src/lib/astro/synastryReading.ts",
  "src/lib/astro/compatibilityReading.ts",
  "src/lib/astro/readingHelpers.ts",
  "src/lib/astro/traits.ts",
  "src/lib/astro/readingEngine.ts",
  "src/lib/astro/interpretations.ts",
  "src/lib/astro/quotes.ts",
];

let failures = 0;
let warnings = 0;
function fail(label: string, detail: string) {
  console.log(`FAIL  ${label} — ${detail}`);
  failures++;
}
function warn(label: string, detail: string) {
  console.log(`WARN  ${label} — ${detail}`);
  warnings++;
}

function checkText(text: string, where: string) {
  if (typeof text !== "string" || text.length < 8) return;
  for (const [name, re] of BANNED_WORDS) {
    const m = text.match(re);
    if (m) {
      const start = Math.max(0, (m.index ?? 0) - 40);
      const frag = text.slice(start, (m.index ?? 0) + 60);
      fail(`static:${where}`, `banned word "${name}" → …${frag}…`);
    }
  }
  for (const [name, re] of BANNED_INTROS) {
    if (re.test(text)) fail(`static:${where}`, `banned intro "${name}" → ${text.slice(0, 90)}…`);
  }
}

// ---------- 1. static scan ----------
console.log("─── STATIC SOURCE SCAN ───");
for (const rel of STATIC_FILES) {
  const p = `/home/z/my-project/${rel}`;
  if (!existsSync(p)) {
    warn("static", `missing file (skipped): ${rel}`);
    continue;
  }
  const src = readFileSync(p, "utf8");
  // crude string-literal extraction: '…', "…", `…` (single-line only)
  const literals = src.match(/(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g) ?? [];
  for (const lit of literals) {
    const inner = lit.slice(1, -1);
    // skip imports / paths / css-ish tokens / short ids
    if (inner.length < 12) continue;
    if (/^(use client|@\/|\.\.\/|\.\/|http|#|\w+\.\w+ )/.test(inner)) continue;
    checkText(inner, rel);
  }
}
console.log("static scan done");

// ---------- 2. dynamic payload scan ----------
console.log("\n─── DYNAMIC PAYLOAD SCAN (needs dev server on :3000) ───");
async function natal(body: Record<string, unknown>) {
  const r = await fetch("http://localhost:3000/api/natal", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return (await r.json()) as any;
}
async function synastry(a: Record<string, unknown>, b: Record<string, unknown>) {
  const r = await fetch("http://localhost:3000/api/synastry", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personA: a, personB: b }),
  });
  return (await r.json()) as any;
}

const CASA = { city: "Casablanca", lat: 33.5731, lng: -7.5898, tzStr: "Africa/Casablanca" };
const CHARTS: Record<string, Record<string, unknown>> = {
  layla: { name: "Layla", year: 2001, month: 5, day: 15, hour: 10, minute: 0, gender: "female", ...CASA },
  omar: { name: "Omar", year: 1995, month: 7, day: 21, hour: 14, minute: 30, gender: "male", ...CASA },
  yasmine: { name: "Yasmine", year: 1998, month: 3, day: 14, hour: 9, minute: 20, gender: "female", ...CASA },
  viktor: { name: "Viktor", year: 1987, month: 12, day: 2, hour: 22, minute: 5, gender: "male", ...CASA },
};

let serverUp = true;
for (const [key, req] of Object.entries(CHARTS)) {
  try {
    const d = await natal(req);
    if (!d?.personality) { fail(`payload:${key}`, "no personality payload"); continue; }
    walk(d.personality, `payload:${key}`);
  } catch {
    warn(`payload:${key}`, "dev server unreachable — dynamic scan skipped");
    serverUp = false;
  }
}
if (serverUp) {
  try {
    const s = await synastry(CHARTS.layla, CHARTS.omar);
    if (s?.compat) walk(s.compat, "synastry:compat");
    else if (s?.analysis) walk(s.analysis, "synastry:analysis");
  } catch { warn("synastry", "call failed — skipped"); }
}

function walk(node: unknown, where: string) {
  if (typeof node === "string") { checkText(node, where); checkLongSentence(node, where); return; }
  if (Array.isArray(node)) { node.forEach((x, i) => walk(x, `${where}[${i}]`)); return; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (["id", "key", "seed", "kind", "sign", "signId", "label", "emoji", "glyph", "color", "element", "modality"].includes(k)) continue;
      walk(v, `${where}.${k}`);
    }
  }
}

function checkLongSentence(text: string, where: string) {
  if (typeof text !== "string") return;
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    const words = s.split(/\s+/).filter(Boolean).length;
    if (words > 55) fail(`long:${where}`, `sentence with ${words} words → ${s.slice(0, 110)}…`);
    else if (words > 45) warn(`long:${where}`, `sentence with ${words} words → ${s.slice(0, 110)}…`);
  }
}

console.log(`\n═══ RESULT: ${failures} failures, ${warnings} warnings ═══`);
process.exit(failures > 0 ? 1 : 0);
