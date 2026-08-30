// ===========================================================================
// TEST OUTER SWEEP — unit-level guard for the walkthrough content libraries.
// Transforms EVERY authored string (primers, 5×12 sign cores, 60 put-fragments
// ×12 house areas, 60 outer house lines, 12 house-map lines) through gv() for
// male + female, then scans for:
//   1. adverb/verb mangles ("finallies", "onlylies", "eitherlies", "cames"…)
//   2. neutral-pronoun leaks in gendered output
//   3. banned vocabulary / banned intro fillers
//   4. cross-entry duplicate sentences (no repeated lines anywhere)
// ===========================================================================

import { gv } from "../src/lib/astro/personality/deep/voice";
import { OUTER_PRIMER, JUPITER_SIGNS, SATURN_SIGNS } from "../src/lib/astro/personality/deep/outerSigns1";
import { URANUS_SIGNS, NEPTUNE_SIGNS, PLUTO_SIGNS } from "../src/lib/astro/personality/deep/outerSigns2";
import { outerHouseLine, HOUSE_PLAIN } from "../src/lib/astro/personality/deep/outerHouses";

let failures = 0;
function check(label: string, ok: boolean, detail?: string) {
  if (!ok) { console.log(`FAIL  ${label}${detail ? " — " + detail : ""}`); failures++; }
}

const SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
const OUTER: Record<string, any> = { jupiter: JUPITER_SIGNS, saturn: SATURN_SIGNS, uranus: URANUS_SIGNS, neptune: NEPTUNE_SIGNS, pluto: PLUTO_SIGNS };
const AREAS = HOUSE_PLAIN.map((_, i) => {
  // reuse the real houseAreaName list values (imported indirectly via line names is fragile;
  // replicate the exact 12 area strings from houseLines.ts)
  return [
    "identity itself",
    "money, security, and self-worth",
    "communication, siblings, daily movement",
    "home, family roots, private foundations",
    "romance, creativity, play, performance",
    "work routines, health, acts of service",
    "partnership and one-on-one bonds",
    "intimacy, trust, shared resources, transformation",
    "beliefs, travel, meaning, higher learning",
    "career, reputation, public role",
    "friendships, communities, long-term visions",
    "the private inner world, solitude, the unconscious",
  ][i];
});

const MANGLE = /\b(final|only|either|actual|already|sudden|slow|quick|complete|total|constant|immediate|eventual|probable|certain|definite|deep|open|exact|literal|happy|careful|deliberate|silent|automatic|original|general|most|bare)lies\b|\b(came|grew|built|had|got|made|took|gave|felt|found|kept|told|left|ran|saw|knew|thought|held|stood|spoke|became|meant|sent|met|sat|won)s\b/;
const LEAK = /\b(they|their|theirs|them|themselves)\b/i;

const allStrings: { where: string; text: string }[] = [];

// primers
for (const [p, txt] of Object.entries(OUTER_PRIMER)) {
  allStrings.push({ where: `primer:${p}`, text: txt });
}
// sign cores
for (const [p, map] of Object.entries(OUTER)) {
  for (const s of SIGNS) {
    const c = map[s];
    check(`${p}/${s} exists`, Boolean(c && c.core.length === 2 && c.put));
    c?.core.forEach((t: string, i: number) => allStrings.push({ where: `${p}/${s}/core${i}`, text: t }));
    c?.put && allStrings.push({ where: `${p}/${s}/put`, text: c.put });
  }
}
// put × every house area (both genders)
for (const [p, map] of Object.entries(OUTER)) {
  for (const s of SIGNS) {
    for (const area of AREAS) {
      const base = `${map[s].put} ${area}.`;
      allStrings.push({ where: `${p}/${s}/put-conclusion`, text: base.charAt(0).toUpperCase() + base.slice(1) });
    }
  }
}
// outer house lines
for (const p of Object.keys(OUTER)) {
  for (let h = 1; h <= 12; h++) {
    const t = outerHouseLine(p, h);
    check(`${p} house ${h} line exists`, t.length > 40);
    if (t) allStrings.push({ where: `${p}-house/${h}`, text: t });
  }
}
// house map lines + personalized bullets
for (let h = 1; h <= 12; h++) {
  const def = HOUSE_PLAIN[h - 1];
  allStrings.push({ where: `house-map/${h}`, text: `House ${h} · ${def.name} — ${def.line}` });
  allStrings.push({ where: `house-map/${h}/saturn-note`, text: `House ${h} · ${def.name} — ${def.line} Their Saturn sits here.` });
}

let total = 0;
for (const gender of ["male", "female"] as const) {
  for (const { where, text } of allStrings) {
    total++;
    const out = gv(text, gender);
    const m = out.match(MANGLE);
    check(`mangle:${gender}/${where}`, !m, m ? `→ ${out.slice(Math.max(0, (m.index ?? 0) - 40), (m.index ?? 0) + 50)}` : undefined);
    const leak = out.match(LEAK);
    check(`pronoun-leak:${gender}/${where}`, !leak, leak ? `→ …${out.slice(Math.max(0, (leak.index ?? 0) - 30), (leak.index ?? 0) + 50)}…` : undefined);
  }
}
check(`sweep volume sane`, total > 1900, `${total} transforms`);

// banned words (same list philosophy as test_simple_english)
const BANNED = [/oscillat/i, /even keel/i, /facilitat/i, /utiliz/i, /interplay/i, /propensity/i, /ruminate/i, /intricate/i, /myriad/i, /plethora/i, /delve/i, /tapestry/i, /nuance/i, /navigate the/i];
for (const { where, text } of allStrings) {
  for (const re of BANNED) {
    const m = text.match(re);
    check(`banned:${where}`, !m, m ? String(m[0]) : undefined);
  }
}

// duplicate sentences across all entries
const seen = new Map<string, string>();
for (const { where, text } of allStrings) {
  const key = text.toLowerCase().replace(/[^a-z ]/g, "").trim();
  if (seen.has(key)) check(`duplicate sentence (${where} vs ${seen.get(key)})`, false, text.slice(0, 60));
  else seen.set(key, where);
}

console.log(failures === 0 ? `\n✅ ALL CHECKS PASSED (${total} transforms, ${allStrings.length} strings, ${seen.size} unique)` : `\n🔴 ${failures} FAILURE(S)`);
if (failures > 0) process.exit(1);
