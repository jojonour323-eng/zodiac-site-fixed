/**
 * COMPAT UPGRADE — coherent ratings + zero cross-card repetition.
 * Verifies the user's round-18 requirements:
 *   1. The big rating is HONEST: equals the seven-area honest breakdown
 *      average (no more detached 11-vs-37 split), and nothing on the page
 *      says "out of 100" anymore.
 *   2. Five domains mirror the honest areas 1:1 (no clashing numbers).
 *   3. "Why this score" is structured (>=6 headed sections with bullets),
 *      leads with the out-of-10 number.
 *   4. Honest-breakdown notes never contradict their numbers (e.g. never
 *      claims "similar directness" when the gap is > 20).
 *   5. eachNeeds bullets are detailed (2+ sentences).
 *   6. Tension points never repeat a contact already shown as a friction card.
 *   7. Aspect cards: with signs resolved, NO full sentence (>=40 chars) is
 *      shared between two different contacts on the same page.
 *
 * Run: bun scripts/test_compat_upgrade.ts   (dev server on :3000 required)
 */
const BASE = "http://localhost:3000";

import { generateSynastryAspectReading } from "../src/lib/astro/synastryReading";
import type { CompatibilityProfile, SignId } from "../src/lib/astro/types";

const PAIRS: [{ name: string; year: number; month: number; day: number; hour: number; minute: number; city: string; gender: "male" | "female" }, { name: string; year: number; month: number; day: number; hour: number; minute: number; city: string; gender: "male" | "female" }][] = [
  [
    { name: "Layla", year: 1997, month: 4, day: 25, hour: 14, minute: 30, city: "Cairo, Egypt", gender: "female" },
    { name: "Omar", year: 1990, month: 11, day: 8, hour: 19, minute: 45, city: "Sydney, Australia", gender: "male" },
  ],
  [
    { name: "Mia", year: 2001, month: 7, day: 18, hour: 9, minute: 0, city: "London, UK", gender: "female" },
    { name: "Leo", year: 1988, month: 1, day: 14, hour: 6, minute: 20, city: "Berlin, Germany", gender: "male" },
  ],
  [
    { name: "Zara", year: 1995, month: 2, day: 3, hour: 11, minute: 15, city: "Paris, France", gender: "female" },
    { name: "Kai", year: 1993, month: 9, day: 27, hour: 22, minute: 40, city: "Toronto, Canada", gender: "male" },
  ],
];

let fails = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${!ok && detail ? " — " + detail : ""}`);
  if (!ok) fails++;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

async function synastry(a: unknown, b: unknown): Promise<CompatibilityProfile> {
  const res = await fetch(`${BASE}/api/synastry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personA: a, personB: b }),
  });
  if (!res.ok) throw new Error(`synastry: ${res.status} ${await res.text()}`);
  return res.json();
}

function placementKey(point: string): string {
  const p = point.toLowerCase();
  if (p === "asc" || p === "ascendant") return "ascendant";
  if (p === "mc" || p === "midheaven") return "midheaven";
  if (p === "node") return "north_node";
  return p;
}

// Collect every user-visible string of a card (summary + bodies + bullets).
function cardStrings(reading: ReturnType<typeof generateSynastryAspectReading>): string[] {
  const out: string[] = [reading.summary];
  for (const s of reading.sections) {
    if (s.body) out.push(s.body);
    if (s.bullets) out.push(...s.bullets);
  }
  return out;
}

async function main() {
  for (const [a, b] of PAIRS) {
    const profile = await synastry(a, b);
    const tag = `${a.name}+${b.name}`;
    const pageCards: { key: string; strings: string[] }[] = [];

    // 1. Honest rating coherence.
    check(`${tag}: overall === compat.overall`, profile.compat != null && profile.overall === profile.compat!.overall,
      `overall=${profile.overall} compat=${profile.compat?.overall}`);
    check(`${tag}: page never says out of 100`, !JSON.stringify(profile).includes("out of 100"));
    check(`${tag}: overall is a real 0-100 number`, profile.overall >= 0 && profile.overall <= 100, String(profile.overall));

    // 2. Domain scores mirror the honest areas.
    const area = (k: string) => profile.compat?.areas.find((x) => x.key === k)?.value;
    const dom = (k: string) => profile.domainScores.find((d) => d.key === k)?.value;
    const mirror: [string, string][] = [
      ["romance", "attraction"], ["communication", "communication"],
      ["stability", "trust"], ["intimacy", "emotional"], ["growth", "longTerm"],
    ];
    for (const [dk, ak] of mirror) {
      check(`${tag}: domain ${dk} mirrors area ${ak}`, dom(dk) === area(ak), `${dom(dk)} vs ${area(ak)}`);
    }

    // 3. Structured narrative.
    check(`${tag}: narrativeSections >= 6`, (profile.narrativeSections?.length ?? 0) >= 6, String(profile.narrativeSections?.length));
    check(`${tag}: narrative leads with out-of-10`, /out of 10/.test(profile.narrativeSections?.[0]?.body ?? ""));
    const narrBullets = profile.narrativeSections.flatMap((s) => s.bullets ?? []);
    check(`${tag}: narrative has bullets`, narrBullets.length >= 8, String(narrBullets.length));

    // 4. Area notes never contradict their numbers.
    for (const ar of profile.compat?.areas ?? []) {
      const m = ar.note.match(/\((\d+) vs (\d+)\)/);
      if (m) {
        const diff = Math.abs(Number(m[1]) - Number(m[2]));
        if (/similar|comparable/i.test(ar.note) && diff > 20) {
          check(`${tag}: ${ar.key} note matches its numbers`, false, ar.note);
        }
      }
    }
    check(`${tag}: communication note honest`, (() => {
      const note = profile.compat?.areas.find((x) => x.key === "communication")?.note ?? "";
      const m = note.match(/(\d+) vs (\d+)/);
      if (!m) return true;
      const diff = Math.abs(Number(m[1]) - Number(m[2]));
      return diff > 20 ? !/similar directness/i.test(note) : true;
    })());

    // 5. eachNeeds detail.
    for (const side of ["a", "b"] as const) {
      const bullets = profile.compat?.eachNeeds[side] ?? [];
      check(`${tag}: eachNeeds.${side} has bullets`, bullets.length >= 1);
      for (const bl of bullets) {
        const sentences = bl.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
        check(`${tag}: eachNeeds.${side} bullet detailed`, bl.length >= 80 && sentences >= 2, bl.slice(0, 60));
      }
    }

    // 6. Tension points don't repeat friction cards.
    const frictionKeys = new Set((profile.frictions ?? []).map((f) => `${f.aPoint} ${f.aspect.toLowerCase()} ${f.bPoint}`));
    for (const tp of profile.tensionPoints ?? []) {
      check(`${tag}: tension "${tp.title}" not a duplicate friction card`, !frictionKeys.has(tp.source.toLowerCase()), tp.source);
    }

    // 7. Collect per-card strings with signs resolved (dedupe within the page).
    const items = [...(profile.strengths ?? []), ...(profile.frictions ?? [])];
    for (const it of items) {
      const aSign = profile.allPlacementsA.find((p) => p.id === placementKey(it.aPoint))?.signId;
      const bSign = profile.allPlacementsB.find((p) => p.id === placementKey(it.bPoint))?.signId;
      const reading = generateSynastryAspectReading(it.aPoint, it.bPoint, it.aspect, it.polarity, it.strength, aSign as SignId | undefined, bSign as SignId | undefined);
      check(`${tag}: headline carries real signs`, aSign && bSign ? reading.headline.includes("in ") : true, reading.headline);
      pageCards.push({ key: `${it.aPoint}|${it.bPoint}|${it.aspect}`, strings: cardStrings(reading) });
    }

    // 7b. Zero full-sentence sharing across different contacts on THIS page.
    const seen = new Map<string, string>();
    let dupes = 0;
    for (const card of pageCards) {
      for (const s of card.strings) {
        const n = norm(s);
        if (n.length < 40) continue;
        const prev = seen.get(n);
        if (prev && prev !== card.key) {
          dupes++;
          console.log(`   DUPE across "${prev}" and "${card.key}": ${n.slice(0, 90)}…`);
        } else {
          seen.set(n, card.key);
        }
      }
    }
    check(`${tag}: no sentence shared between two different aspect cards`, dupes === 0, `${dupes} duplicates`);
    check(`${tag}: enough cards sampled`, pageCards.length >= 4, String(pageCards.length));
  }

  console.log(fails === 0 ? "\nALL COMPAT-UPGRADE CHECKS PASS" : `\n${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
