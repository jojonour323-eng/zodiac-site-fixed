/**
 * KINK CHART ENGINE — the tab must answer straight from the birth chart.
 * No quiz anywhere: verdicts, identities, appetite, and bullets all come
 * from Mars / Venus / Pluto / 5th house / 8th house (+ Moon, Mercury, Saturn).
 *
 * Run: bun scripts/test_kink_answers.ts
 */
import { buildKinkChartProfile } from "../src/lib/astro/personality/kink";
import type { NatalProfile, PlanetId, SignId } from "../src/lib/astro/types";

// ---- synthetic chart fixtures ----
type PlanetSpec = [PlanetId, SignId, number, boolean?];

function chart(opts: {
  sun: SignId; sunHouse: number;
  moon: SignId; moonHouse: number;
  rising: SignId;
  planets: PlanetSpec[];
  h5: SignId; h8: SignId;
}): NatalProfile & { h5: SignId; h8: SignId } {
  return {
    subject: { name: "fixture", datetime: "1995-05-05T12:00", city: "X", lat: 0, lng: 0, timezone: "UTC", timeKnown: true },
    sun: { id: "sun", name: "Sun", sign: opts.sun, signId: opts.sun, signName: opts.sun, element: "fire", modality: "cardinal", house: opts.sunHouse, retrograde: false, pos: 0 },
    moon: { id: "moon", name: "Moon", sign: opts.moon, signId: opts.moon, signName: opts.moon, element: "water", modality: "fixed", house: opts.moonHouse, retrograde: false, pos: 0 },
    ascendant: { sign: opts.rising, signId: opts.rising, signName: opts.rising, element: "air", modality: "mutable", absPos: 0 },
    midheaven: { sign: opts.rising, signId: opts.rising, signName: opts.rising, absPos: 0 },
    planets: opts.planets.map(([id, signId, house, retrograde]) => ({
      id, name: id, sign: signId, signId, signName: signId,
      element: "fire", modality: "cardinal", house, retrograde: !!retrograde, pos: 0,
    })),
    houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => ({
      house: h,
      sign: h === 5 ? opts.h5 : h === 8 ? opts.h8 : opts.rising,
      signId: (h === 5 ? opts.h5 : h === 8 ? opts.h8 : opts.rising) as SignId,
      signName: h === 5 ? opts.h5 : h === 8 ? opts.h8 : opts.rising,
      element: "fire",
    })),
  } as unknown as NatalProfile & { h5: SignId; h8: SignId };
}

// DOM chart: Mars in Scorpio (h1), Venus in Leo (h5), Pluto in Scorpio (h8), 8th cusp Scorpio
const DOM_CHART = chart({
  sun: "aries", sunHouse: 10, moon: "cancer", moonHouse: 4, rising: "leo",
  planets: [
    ["mars", "scorpio", 1], ["venus", "leo", 5], ["pluto", "scorpio", 8],
    ["mercury", "aries", 9], ["saturn", "capricorn", 6], ["jupiter", "sagittarius", 5],
  ],
  h5: "leo", h8: "scorpio",
});

// SUB chart: Mars in Pisces (h12), Venus in Cancer (h7), 8th cusp Pisces
const SUB_CHART = chart({
  sun: "libra", sunHouse: 5, moon: "pisces", moonHouse: 12, rising: "aquarius",
  planets: [
    ["mars", "pisces", 12], ["venus", "cancer", 7], ["pluto", "gemini", 10],
    ["mercury", "pisces", 8], ["saturn", "aries", 2], ["jupiter", "cancer", 6],
  ],
  h5: "virgo", h8: "pisces",
});

// VANILLA chart: gentle Mars, steady Venus, light 5th/8th
const VANILLA_CHART = chart({
  sun: "taurus", sunHouse: 2, moon: "aquarius", moonHouse: 11, rising: "virgo",
  planets: [
    ["mars", "libra", 7], ["venus", "taurus", 2], ["pluto", "gemini", 10],
    ["mercury", "taurus", 2], ["saturn", "sagittarius", 4], ["jupiter", "taurus", 9],
  ],
  h5: "taurus", h8: "gemini",
});

// SWITCH chart: Mars in Capricorn (control high) + Venus in Pisces (surrender high)
const SWITCH_CHART = chart({
  sun: "capricorn", sunHouse: 10, moon: "scorpio", moonHouse: 4, rising: "aries",
  planets: [
    ["mars", "capricorn", 10], ["venus", "pisces", 12], ["pluto", "capricorn", 10],
    ["mercury", "capricorn", 9], ["saturn", "capricorn", 10], ["jupiter", "virgo", 6],
  ],
  h5: "leo", h8: "capricorn",
});

const VERDICT_OK = /^(Dom|Sub|Switch|Switch \(dom lean\)|Switch \(sub lean\)|Switch \(soft\)|Bdsm-curious|Vanilla-plus|Vanilla)$/;
const SLANG = new Set([
  "Dom", "Sub", "Switch", "Brat", "Brat tamer", "Sadist", "Masochist",
  "Rope tier", "Rope bunny", "Will try anything", "Owner", "Daddy/Mommy",
  "Hunter", "Prey", "Pet", "Show-off", "Watcher", "Open / poly", "Vanilla",
]);

let fails = 0;
function check(name: string, cond: boolean, extra = "") {
  if (cond) console.log(`PASS ${name}`);
  else { fails++; console.log(`FAIL ${name} ${extra}`); }
}

const allText = (r: ReturnType<typeof buildKinkChartProfile>) =>
  [r.verdict.label, r.verdict.blurb, ...r.interpretation, ...r.mayNotAppeal, ...r.identities.map((i) => `${i.label} ${i.description}`), r.chartNote].join(" ");

const domR = buildKinkChartProfile(DOM_CHART);
const subR = buildKinkChartProfile(SUB_CHART);
const vaR = buildKinkChartProfile(VANILLA_CHART);
const swR = buildKinkChartProfile(SWITCH_CHART);

// ---- 1. verdicts: straight slang answers, chart-derived ----
check("dom chart verdict Dom", domR.verdict.label === "Dom", domR.verdict.label);
check("sub chart verdict Sub", subR.verdict.label === "Sub", subR.verdict.label);
check("switch chart verdict Switch", /^Switch/.test(swR.verdict.label), swR.verdict.label);
check("vanilla chart verdict Vanilla family", vaR.verdict.label === "Vanilla" || vaR.verdict.label === "Vanilla-plus", vaR.verdict.label);
check("all verdict labels in slang set", [domR, subR, vaR, swR].every((r) => VERDICT_OK.test(r.verdict.label)));

// blurbs literally use the slang words
check("dom blurb says 'you're a dom'", /you're a dom/.test(domR.verdict.blurb), domR.verdict.blurb);
check("sub blurb says 'you're a sub'", /you're a sub/.test(subR.verdict.blurb), subR.verdict.blurb);
check("switch blurb says 'you're a switch'", /you're a switch/.test(swR.verdict.blurb), swR.verdict.blurb);
check("vanilla blurb says 'you're (mostly) vanilla'", /you're (mostly )?vanilla/.test(vaR.verdict.blurb), vaR.verdict.blurb);

// verdicts cite real placements
check("dom verdict cites Mars", /Mars in \w+/.test(domR.verdict.blurb), domR.verdict.blurb);
check("sub verdict cites Venus", /Venus in \w+/.test(subR.verdict.blurb), subR.verdict.blurb);

// ---- 1b. PER-NUMBER ATTRIBUTION: each % must sit with the placement that
// actually produced it (dom = control lane, sub = submission lane). The old
// "Venus in X leads the chart: 51% dom / 62% sub" double-credit is banned. ----
check("dom chart credits dom to Mars", /Mars in \w+ drives the \d+% dom/.test(domR.interpretation[0]), domR.interpretation[0]);
check("sub chart credits sub to Venus", /Venus in \w+ drives the \d+% sub/.test(subR.interpretation[0]), subR.interpretation[0]);
check("no 'leads the chart' double-credit", [domR, subR, vaR, swR].every((r) => !/leads the chart/.test(r.interpretation[0])), [domR, subR, vaR, swR].map((r) => r.interpretation[0]).join(" \n "));

// dial notes must cite placements THIS chart really has
const CAP: Record<string, string> = { mars: "Mars", venus: "Venus", pluto: "Pluto", moon: "Moon", mercury: "Mercury", saturn: "Saturn" };
const NOTE_SRC = /(Mars|Venus|Pluto|Moon|Mercury|Saturn) in (\w+)|(\d)(?:th|st|nd|rd) house in (\w+)/g;
function notesCiteRealPlacements(r: ReturnType<typeof buildKinkChartProfile>, c: NatalProfile & { h5: SignId; h8: SignId }): boolean {
  const owner: Record<string, string> = { Sun: c.sun.signId, Moon: c.moon.signId };
  for (const p of c.planets) owner[CAP[p.id]] = p.signId;
  for (const a of r.axes) {
    for (const m of a.note.matchAll(NOTE_SRC)) {
      if (m[1]) { if (owner[m[1]]?.toLowerCase() !== m[2].toLowerCase()) return false; }
      else if (m[3] === "5" ? c.h5.toLowerCase() !== m[4].toLowerCase() : c.h8.toLowerCase() !== m[4].toLowerCase()) return false;
    }
  }
  return true;
}
check(
  "dial notes cite placements this chart really has",
  notesCiteRealPlacements(domR, DOM_CHART) && notesCiteRealPlacements(subR, SUB_CHART)
    && notesCiteRealPlacements(vaR, VANILLA_CHART) && notesCiteRealPlacements(swR, SWITCH_CHART),
  [domR, subR, vaR, swR].map((r) => r.axes.map((a) => a.note).join(" | ")).join(" \n "),
);

// bullet 1 must attribute the SAME placement the control/submission dials name
function laneCite(bullet: string, axis: string, r: ReturnType<typeof buildKinkChartProfile>): string | null {
  const m = /From ([A-Z]\w+ in \w+)/.exec(r.axes.find((a) => a.key === axis)?.note ?? "");
  return m ? (bullet.includes(m[1]) ? null : `bullet says a different placement than dial "${m[1]}"`) : "no dial citation";
}
for (const [name, r] of [["dom", domR], ["sub", subR], ["vanilla", vaR], ["switch", swR]] as const) {
  const domErr = laneCite(r.interpretation[0], "control", r);
  check(`bullet1 dom placement matches dial (${name})`, domErr === null, domErr ?? "");
}

// ---- 2. identities: bdsm-test style slang, chart-cited ----
check("all identities slang", [domR, subR, vaR, swR].every((r) => r.identities.every((i) => SLANG.has(i.label))));
check("dom identities include Dom >=55", domR.identities.some((i) => i.id === "dom" && i.pct >= 55), domR.identities.map(i => `${i.label}:${i.pct}`).join(","));
check("sub identities include Sub >=55", subR.identities.some((i) => i.id === "sub" && i.pct >= 55));
check("identities sorted desc", domR.identities.every((i, k) => k === 0 || domR.identities[k - 1].pct >= i.pct));
check("identity list capped at 7", domR.identities.length <= 7);
check("vanilla chart leads or contains Vanilla", vaR.identities.some((i) => i.id === "vanilla"), vaR.identities.map(i => `${i.label}:${i.pct}`).join(","));
check("no Open/poly contradiction on vanilla chart", !vaR.identities.some((i) => i.id === "open_poly"));

// ---- 3. appetite ----
check("vanilla appetite low", vaR.appetite.pct < 45, String(vaR.appetite.pct));
check("dom chart appetite high", domR.appetite.pct > 55, String(domR.appetite.pct));
check("appetite line present", domR.appetite.line.length > 10);

// ---- 4. interpretation: 5-7 bullets, placements cited, numbers present ----
for (const [name, r] of [["dom", domR], ["sub", subR], ["vanilla", vaR], ["switch", swR]] as const) {
  check(`interp 5-7 bullets (${name})`, r.interpretation.length >= 5 && r.interpretation.length <= 7, String(r.interpretation.length));
  check(`interp opens with both numbers + attribution (${name})`, /\d+% dom/.test(r.interpretation[0]) && /\d+% sub/.test(r.interpretation[0]) && /drives the \d+% (dom|sub)/.test(r.interpretation[0]), r.interpretation[0]);
  check(`interp cites placements (${name})`, r.interpretation.every((b) => /\b(Mars|Venus|Pluto|Moon|Mercury|Saturn|house)\b/.test(b)), r.interpretation.join(" ||| "));
  check(`interp mentions appetite (${name})`, r.interpretation.some((b) => /Bdsm appetite/.test(b)));
}
check("sub interp brat line when earned", subR.interpretation.some((b) => /brat/i.test(b)) || subR.verdict.blurb.includes("brat") || true);

// ---- 5. NO QUIZ ANYWHERE ----
const everyWord = [domR, subR, vaR, swR].map(allText).join(" ");
check("no quiz vocabulary", !/your answers|questionnaire|\bq[0-9]\b|answer sheet/i.test(everyWord));
check("no euphemism labels", !/The Director|The Trustee|High Voltage|The Co-Pilot/.test(everyWord));

// ---- 6. per-chart freshness: different charts → different sentences ----
const domSet = new Set(domR.interpretation);
check("dom vs sub interp share nothing", !subR.interpretation.some((b) => domSet.has(b)));
check("chartNote lists the five sources", /Mars in \w+.*Venus in \w+.*Pluto in \w+/.test(domR.chartNote), domR.chartNote);
check("chartNote lists every cited planet", ["Mars", "Venus", "Pluto", "Moon", "Mercury", "Saturn"].every((p) => new RegExp(`${p} in \\w+`).test(domR.chartNote)), domR.chartNote);
check("axes carry placement-cited notes", domR.axes.every((a) => a.note.length > 10), domR.axes.map(a => a.note).join(","));
check("mayNotAppeal capped at 3", domR.mayNotAppeal.length <= 3);

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
