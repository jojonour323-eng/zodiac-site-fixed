/**
 * KINK ATTRIBUTION FUZZ — every number must sit with the placement that
 * actually produced it, everywhere on the tab, for ANY chart.
 *
 * For 500 random charts:
 *  1. Bullet 1 must attach the dom % to the SAME placement the control dial
 *     cites (and the sub % to the submission dial's placement), with the
 *     dial's exact number.
 *  2. Every dial note's cited placement must exist in the chart (planet→sign,
 *     house→cusp).
 *  3. Axis bullets cite exactly the same placement set as their dial
 *     (intensity / structure / connection / communication).
 *  4. Every placement cited anywhere (dials, bullets, identities) resolves to
 *     an entry in the "placements behind this" sources card.
 *  5. "leads the chart" double-credit phrasing must not exist anywhere.
 *  6. Scores are computed fresh: no two charts share a full axis tuple.
 *
 * Run: bun scripts/test_kink_attribution.ts
 */
import { buildKinkChartProfile } from "../src/lib/astro/personality/kink";
import { SIGN_META } from "../src/lib/astro/signs";
import type { NatalProfile, PlanetId, SignId } from "../src/lib/astro/types";

const SIGNS = Object.keys(SIGN_META) as SignId[];
const PLANETS: PlanetId[] = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron", "lilith", "north_node"];

// seeded LCG for reproducibility
let seed = 20260831;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const ri = (n: number) => Math.floor(rnd() * n) + 1;

type Fixture = { profile: NatalProfile; h5: SignId; h8: SignId };
function randomChart(): Fixture {
  const h5 = pick(SIGNS);
  const h8 = pick(SIGNS);
  const rising = pick(SIGNS);
  const planets = PLANETS.map((id) => {
    // ~35% of planets land in the 5th/8th to exercise the occupant paths
    const house = rnd() < 0.35 ? pick([5, 8]) : ri(12);
    return { id, signId: pick(SIGNS), house };
  });
  return {
    h5, h8,
    profile: {
      subject: { name: "fuzz", datetime: "1995-05-05T12:00", city: "X", lat: 0, lng: 0, timezone: "UTC", timeKnown: true },
      sun: { id: "sun", name: "Sun", signId: pick(SIGNS), house: ri(12), retrograde: false, pos: 0 },
      moon: { id: "moon", name: "Moon", signId: pick(SIGNS), house: ri(12), retrograde: false, pos: 0 },
      ascendant: { signId: rising },
      midheaven: { signId: rising },
      planets: planets.map((p) => ({ id: p.id, signId: p.signId, house: p.house, retrograde: false, pos: 0 })),
      houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => ({
        house: h, signId: h === 5 ? h5 : h === 8 ? h8 : rising,
      })),
    } as unknown as NatalProfile,
  };
}

let fails = 0;
function check(name: string, cond: boolean, extra = "") {
  if (!cond) { fails++; console.log(`FAIL ${name} — ${String(extra).slice(0, 260)}`); }
}

const norm = (s: string) => s.toLowerCase();
const PLACEMENT_RE = /(Mars|Venus|Pluto|Moon|Mercury|Saturn) in ([A-Za-z]+)|(\d)(?:th|st|nd|rd) house in ([A-Za-z]+)/g;
/** Normalized placement keys: "mars|scorpio" / "h8|pisces" */
const placementsIn = (text: string): Set<string> => {
  const s = new Set<string>();
  for (const m of text.matchAll(PLACEMENT_RE)) {
    s.add(m[1] ? `${norm(m[1])}|${norm(m[2])}` : `h${m[3]}|${norm(m[4])}`);
  }
  return s;
};
const sameSet = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x));
const subset = (a: Set<string>, b: Set<string>) =>
  [...a].every((x) => b.has(x));

const seenTuples = new Map<string, string>();
const N = 500;

for (let i = 0; i < N; i++) {
  const { profile, h5, h8 } = randomChart();
  const r = buildKinkChartProfile(profile);
  const where = `chart#${i}`;

  const axis = (k: string) => r.axes.find((a) => a.key === k)!;
  const control = axis("control");
  const submission = axis("submission");
  const bullet1 = r.interpretation[0];
  const domLead = /^From (?:your )?(.+?) — /.exec(control.note)?.[1] ?? "";
  const subLead = /^From (?:your )?(.+?) — /.exec(submission.note)?.[1] ?? "";

  // real placements of this chart
  const owner: Record<string, string> = {
    Sun: (profile.sun as { signId: SignId }).signId,
    Moon: (profile.moon as { signId: SignId }).signId,
  };
  for (const p of profile.planets) owner[p.id[0].toUpperCase() + p.id.slice(1)] = p.signId;
  const realPlacement = (key: string): boolean => {
    const [who, sign] = key.split("|");
    if (who.startsWith("h")) return norm(who === "h5" ? h5 : h8) === sign;
    return norm(owner[who[0].toUpperCase() + who.slice(1)] ?? "") === sign;
  };

  // 1. bullet 1 cites the SAME placement AND number as the dials, per branch
  const domStr = `${domLead} drives the ${control.value}% dom`;
  const subStr = `${subLead} drives the ${submission.value}% sub`;
  const domCarry = `${domLead} only carries the ${control.value}% dom`;
  const subCarry = `${subLead} carries the smaller ${submission.value}% sub`;
  if (r.verdict.label === "Sub") {
    check(`${where} sub branch bullet`, bullet1.includes(subStr) && bullet1.includes(domCarry), bullet1);
  } else if (r.verdict.label === "Dom") {
    check(`${where} dom branch bullet`, bullet1.includes(domStr) && bullet1.includes(subCarry), bullet1);
  } else {
    check(`${where} ${r.verdict.label} bullet`, bullet1.includes(domStr) && bullet1.includes(subStr), bullet1);
  }

  // 2. dial notes cite placements this chart really has
  for (const a of r.axes) {
    for (const key of placementsIn(a.note)) {
      check(`${where} dial ${a.key} cites real placement`, realPlacement(key), `${a.note} key=${key}`);
    }
  }

  // 3. axis bullets cite exactly the same placement set as their dial
  const pairings: [string, string][] = [
    ["intensity", "Intensity"], ["boundaries", "Structure"],
    ["emotionalConnection", "Connection"], ["communication", "Talking about it"],
  ];
  for (const [key, prefix] of pairings) {
    const bullet = r.interpretation.find((b) => b.startsWith(prefix));
    if (!bullet) continue;
    const dialSet = placementsIn(axis(key).note);
    const bulletSet = placementsIn(bullet);
    check(`${where} ${key} bullet set === dial set`, sameSet(dialSet, bulletSet), `dial=${[...dialSet]} bullet=${[...bulletSet]} "${bullet}"`);
  }

  // 4. every placement cited anywhere resolves to the sources card
  const note = r.chartNote;
  const srcSet = placementsIn(note);
  const cited = new Set<string>();
  for (const a of r.axes) for (const k of placementsIn(a.note)) cited.add(k);
  for (const b of r.interpretation) for (const k of placementsIn(b)) cited.add(k);
  for (const id of r.identities) for (const k of placementsIn(id.description)) cited.add(k);
  check(`${where} every citation is a real placement`, [...cited].every(realPlacement), [...cited].filter((k) => !realPlacement(k)).join(", "));
  check(`${where} every citation resolves to sources card`, subset(cited, srcSet), `missing from card: ${[...cited].filter((k) => !srcSet.has(k)).join(", ")} card="${note}"`);
  for (const p of ["Mars", "Venus", "Pluto", "Moon", "Mercury", "Saturn"]) {
    check(`${where} sources list ${p}`, [...srcSet].some((k) => k.startsWith(p.toLowerCase() + "|")), note);
  }

  // 5. no double-credit phrasing anywhere
  const allText = [r.verdict.blurb, ...r.interpretation, ...r.mayNotAppeal, ...r.identities.map((x) => x.description), r.chartNote].join(" ");
  check(`${where} no 'leads the chart'`, !allText.includes("leads the chart"), allText.slice(0, 200));

  // identity rows cite the same placement as the dials
  const domRow = r.identities.find((x) => x.id === "dom");
  if (domRow) check(`${where} Dom row matches dial`, sameSet(placementsIn(domRow.description), placementsIn(control.note)) || placementsIn(control.note).size === 0, `${domRow.description} / dial=${control.note}`);
  const subRow = r.identities.find((x) => x.id === "sub");
  if (subRow) check(`${where} Sub row matches dial`, sameSet(placementsIn(subRow.description), placementsIn(submission.note)) || placementsIn(submission.note).size === 0, `${subRow.description} / dial=${submission.note}`);
  const sadistRow = r.identities.find((x) => x.id === "sadist");
  if (sadistRow) {
    const dialSet = placementsIn(axis("intensity").note);
    const rowSet = placementsIn(sadistRow.description);
    check(`${where} Sadist row set === intensity dial set`, sameSet(dialSet, rowSet), `dial=${[...dialSet]} row=${[...rowSet]}`);
  }

  // appetite bullet: cites a lane lead + only real placements
  const appBullet = r.interpretation.find((b) => b.startsWith("Bdsm appetite"));
  if (appBullet) {
    check(`${where} appetite cites a lane lead`, appBullet.includes(domLead) || appBullet.includes(subLead), appBullet);
    for (const key of placementsIn(appBullet)) check(`${where} appetite placement real`, realPlacement(key), `${appBullet} key=${key}`);
  }

  // brat bullets (when earned) cite lane leads
  const bratBullet = r.interpretation.find((b) => b.startsWith("There's brat"));
  if (bratBullet) check(`${where} brat cites sub lead`, bratBullet.includes(subLead), bratBullet);
  const tamerBullet = r.interpretation.find((b) => b.startsWith("You've got brat-tamer"));
  if (tamerBullet) check(`${where} tamer cites dom lead`, tamerBullet.includes(domLead), tamerBullet);

  // 6. fresh computation: the full axis tuple is unique per chart
  const tuple = r.axes.map((a) => a.value).join(",") + "|" + r.appetite.pct;
  const prev = seenTuples.get(tuple);
  check(`${where} axis tuple unique`, !prev, `same tuple as ${prev}: ${tuple}`);
  seenTuples.set(tuple, where);
}

console.log(fails === 0 ? `\nALL PASS — ${N} charts, every number sits with its real placement` : `\n${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
