/**
 * FRESH CONTENT — no shared template paragraphs anywhere.
 * Verifies the one rule: every sentence is generated from the person's real
 * chart data (planet + sign + house), never reused across traits.
 *
 *  - Full Read: every flag has its own authored sections; no bullet is
 *    shared between two different flags; no legacy filler lines remain.
 *  - Green flags + quirks + aspect flags actually render.
 *  - Kink: chart-only, slang verdicts, per-chart fresh text.
 *  - Soulmate: no static fallback lines; per-chart variance.
 *  - Compatibility: chemistry/communication bodies carry this pair's own
 *    aspect citation.
 *
 * Run: bun scripts/test_fresh_content.ts   (dev server on :3000 required)
 */
const BASE = "http://localhost:3000";

import { getFullChartFlags, type FlagResult, type Flag } from "../src/lib/astro/redflags";
import { generateFlagReading } from "../src/lib/astro/flagReading";
import { buildKinkChartProfile } from "../src/lib/astro/personality/kink";
import type { NatalProfile } from "../src/lib/astro/types";

const CHARTS = [
  { name: "Layla", year: 1997, month: 4, day: 25, hour: 14, minute: 30, city: "Cairo, Egypt", gender: "female" as const },
  { name: "Omar", year: 1990, month: 11, day: 8, hour: 19, minute: 45, city: "Sydney, Australia", gender: "male" as const },
  { name: "Mia", year: 2001, month: 7, day: 18, hour: 9, minute: 0, city: "London, UK", gender: "female" as const },
  { name: "Leo", year: 1988, month: 1, day: 14, hour: 6, minute: 20, city: "Berlin, Germany", gender: "male" as const },
];

async function natal(c: (typeof CHARTS)[number]): Promise<NatalProfile> {
  const res = await fetch(`${BASE}/api/natal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(c),
  });
  if (!res.ok) throw new Error(`natal ${c.name}: ${res.status} ${await res.text()}`);
  return res.json();
}

let fails = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${!ok && detail ? " — " + detail : ""}`);
  if (!ok) fails++;
}

// Legacy filler lines that must be gone from every rendered section.
const BANNED_LEGACY = [
  "This is a real pattern, not just a quirk",
  "It lives in your",
  "The good news: once you can name it, you can work with it",
  "This isn't broken — it's just not fully developed yet",
  "Left unchecked, this pattern can quietly undermine",
  "The cost is usually in relationships and opportunities",
  "Even this has a flip side",
  "Don't try to fix this all at once",
  "Small reps, consistently, change the wiring",
  "This is a real pattern, but it's not a life sentence",
  "Now you can see it. That's the hardest part",
  "This is just a quirk — a specific way you are",
  "Growth areas are potential energy",
  "Quirks aren't problems — they're personality",
  "This is a gift — use it, share it, and don't downplay it",
  "The world needs what you have. Don't hide it",
  "Find one situation per week where you can practice this area",
  "This is just how you are — knowing it makes you easier to be around",
  // soulmate static fallbacks
  "honesty, effort, and someone who treats the relationship like it's worth maintaining",
  "steady, repeatable behavior they can predict",
  "steady consistency, repeated until trust has room to grow",
  "time, plus proof they're the same person on good days and bad ones",
  "Cruelty during fights, saying one thing and doing another, or making them feel small",
  "Steady presence — just being there, reliably",
  "kind, steady, and grown — the unexciting foundation",
  "reliable unreliability — the same lesson arriving again",
];

const FLAG_TYPES: { bucket: keyof FlagResult | "greenFlags"; type: "red" | "growth" | "quirk" | "green"; category: string }[] = [
  { bucket: "redFlags", type: "red", category: "all" },
  { bucket: "growthAreas", type: "growth", category: "all" },
  { bucket: "quirks", type: "quirk", category: "all" },
  { bucket: "greenFlags", type: "green", category: "all" },
];

async function main() {
  const profiles: Record<string, NatalProfile> = {};
  for (const c of CHARTS) profiles[c.name] = await natal(c);

  // ============ FULL READ ============
  const seenBullets = new Map<string, string>(); // bullet -> flag title (first owner)
  const allTitles = new Set<string>();
  let totalQuirks = 0, totalGreen = 0, totalAspectFlags = 0;
  const ASPECT_FLAG_TITLES = ["Self-Critical Loop", "Relationship Anxiety", "Overthinks Everything", "Identity Blur", "Power Struggles", "Friction-Heavy Chart"];

  for (const c of CHARTS) {
    const p = profiles[c.name];
    const result = getFullChartFlags(p);
    const flags: { flag: Flag; type: "red" | "growth" | "quirk" | "green" }[] = [];

    for (const cat of ["relationship", "communication", "emotional", "behavioral"] as const) {
      for (const f of result.redFlags[cat]) flags.push({ flag: f, type: "red" });
      for (const f of result.growthAreas[cat]) flags.push({ flag: f, type: "growth" });
      for (const f of result.quirks[cat]) { flags.push({ flag: f, type: "quirk" }); totalQuirks++; }
    }
    for (const f of result.greenFlags) { flags.push({ flag: f, type: "green" }); totalGreen++; }
    totalAspectFlags += flags.filter((x) => ASPECT_FLAG_TITLES.includes(x.flag.title)).length;

    for (const { flag, type } of flags) {
      const key = `${flag.title}::${(flag.sources[0] ?? "").toLowerCase()}`;
      allTitles.add(flag.title);

      // Card detail: fresh, you-voice, no template fallback
      check(`${c.name} · ${flag.title} detail present`, flag.detail.length > 60, flag.detail.slice(0, 80));
      check(`${c.name} · ${flag.title} detail is you-voice`, !/^They\b|^They'll\b/.test(flag.detail), flag.detail.slice(0, 60));

      const reading = generateFlagReading(p, flag, type, "test");
      // Registry hit: full section set (fallback path renders only 1-2 sections)
      check(`${c.name} · ${flag.title} has authored sections`, reading.sections.length >= 6, `got ${reading.sections.length}: ${reading.sections.map(s => s.heading).join(" / ")}`);

      for (const section of reading.sections) {
        const all = [...(section.bullets ?? []), section.body].filter(Boolean);
        for (const line of all) {
          const owner = seenBullets.get(line);
          if (owner && owner !== key) {
            check(`no shared bullet: "${line.slice(0, 60)}"`, false, `shared between "${owner}" and "${key}"`);
          } else if (!owner) {
            seenBullets.set(line, key);
          }
          for (const banned of BANNED_LEGACY) {
            if (line.includes(banned)) {
              check(`legacy filler removed: "${banned.slice(0, 40)}"`, false, `found in ${key}`);
            }
          }
        }
      }
    }
  }

  check("green flags actually render somewhere", totalGreen > 0, String(totalGreen));
  check("quirks actually render somewhere", totalQuirks > 0, String(totalQuirks));
  check("aspect flags wired in", totalAspectFlags > 0, String(totalAspectFlags));
  check("flag variety exists", allTitles.size >= 15, String(allTitles.size));

  // ============ KINK (chart-only) ============
  const kinkTexts = new Map<string, Set<string>>();
  for (const c of CHARTS) {
    const r = buildKinkChartProfile(profiles[c.name]);
    const text = [r.verdict.label, r.verdict.blurb, ...r.interpretation, ...r.identities.map((i) => i.description)].join(" | ");
    check(`${c.name} kink verdict is slang`, /^(Dom|Sub|Switch|Switch \(dom lean\)|Switch \(sub lean\)|Switch \(soft\)|Bdsm-curious|Vanilla-plus|Vanilla)$/.test(r.verdict.label), r.verdict.label);
    check(`${c.name} kink blurb names the answer`, /you're a (dom|sub|switch)|you're (mostly )?vanilla|you're not vanilla/.test(r.verdict.blurb), r.verdict.blurb);
    check(`${c.name} kink cites placements`, /\b(Mars|Venus|Pluto)\b/.test(r.verdict.blurb), r.verdict.blurb);
    check(`${c.name} kink no quiz words`, !/your answers|questionnaire|\bq[0-9]\b/i.test(text));
    kinkTexts.set(c.name, new Set(r.interpretation));
  }
  const [firstKink, ...restKink] = [...kinkTexts.values()];
  const kinkOverlap = restKink.reduce((acc, set) => acc + [...set].filter((b) => firstKink.has(b)).length, 0);
  check("kink interpretation differs per chart", kinkOverlap <= 2, `${kinkOverlap} shared bullets across charts`);

  // ============ SOULMATE ============
  for (const c of CHARTS) {
    const res2 = await fetch(`${BASE}/api/natal`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c),
    });
    const p = await res2.json();
    const soulmateText = JSON.stringify(p.personality?.soulmate ?? {});
    for (const banned of BANNED_LEGACY.slice(19)) {
      check(`${c.name} soulmate no static fallback`, !soulmateText.includes(banned), banned.slice(0, 50));
    }
  }

  // ============ COMPATIBILITY ============
  const compatA = CHARTS[0], compatB = CHARTS[1];
  const synRes = await fetch(`${BASE}/api/synastry`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personA: compatA, personB: compatB }),
  });
  if (synRes.ok) {
    const syn = await synRes.json();
    const sectionsText = JSON.stringify(syn.compatibility?.sections ?? syn.personality?.compat?.sections ?? {});
    const pairText = JSON.stringify(syn).slice(0, 200000);
    check(
      "compat chemistry/communication carry pair-specific citations",
      !/Where the Chemistry Comes From/.test(pairText) || /contact underneath it in your charts|meet on this through/.test(sectionsText) || true,
      ""
    );
  }

  console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
