// ===========================================================================
// PERSONALITY MODEL — whole-chart psychological scoring
// ---------------------------------------------------------------------------
// Takes ChartFacts and produces ~29 psychological dimensions, each scored
// 0–100 from MULTIPLE chart factors:
//   1. sign vectors × planet relevance × planet weight
//   2. house placements (incl. angular emphasis, deep-house load)
//   3. natal aspects, orb-weighted, via psychological interaction rules
//   4. weighted element / modality shares
//   5. retrograde modifiers
// Every factor records a human-readable driver for provenance, so scores and
// prose always agree, and minor placements cannot outweigh major patterns.
// ===========================================================================

import type { Element, Modality } from "../types";
import { SIGN_META } from "../signs";
import {
  DIMENSIONS,
  clamp,
  type Dimension,
  type DimensionScore,
  type Driver,
} from "./core";
import {
  SIGN_VECS,
  PLANET_WEIGHT,
  DIM_PLANET_RELEVANCE,
  ASPECT_RULES,
  HOUSE_RULES,
  ELEMENT_RULES,
  MODALITY_RULES,
} from "./signPsych";
import type { ChartFacts } from "./facts";

// Extra relevance for the Ascendant (surface-level dimensions only).
const ASC_RELEVANCE: Partial<Record<Dimension, number>> = {
  socialEnergy: 1.4,
  socialSelectivity: 0.8,
  expressiveness: 2.0,
  communicationDirectness: 0.7,
  confidence: 0.8,
  emotionalSensitivity: 0.4,
  adaptability: 0.5,
  impulsivity: 0.5,
  playfulness: 0.5,
};

interface Acc {
  sum: number;
  max: number;
  drivers: Driver[];
}

function newAcc(): Acc {
  return { sum: 0, max: 0, drivers: [] };
}

const PRETTY: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune",
  pluto: "Pluto", north_node: "North Node", chiron: "Chiron", lilith: "Lilith",
  ascendant: "Rising", asc: "Ascendant", mc: "Midheaven",
};

export function prettyPlanet(id: string): string {
  return PRETTY[id] ?? id;
}

const STRENGTH_WORD = (s: number) =>
  s >= 0.75 ? "tight" : s >= 0.45 ? "clear" : "loose";

export interface PersonalityProfile {
  scores: DimensionScore[];
  byKey: Record<Dimension, DimensionScore>;
  facts: ChartFacts;
  /** Derived behavioral styles used by all tab generators. */
  styles: {
    attachment: { kind: "secure-leaning" | "anxious-leaning" | "avoidant-leaning" | "ambivalent"; note: string };
    conflict: { kind: "confrontational" | "diplomatic" | "avoidant" | "explosive-controlled"; note: string };
    social: { kind: "outgoing" | "selective" | "private" | "situational" | "ambiverted"; note: string };
    thinking: { kind: "analytical" | "intuitive" | "hybrid" | "deliberate"; note: string };
  };
  contradictions: { title: string; body: string; dims: [Dimension, Dimension] }[];
  themes: { key: string; label: string; strength: number }[];
}

export function buildPersonalityProfile(facts: ChartFacts): PersonalityProfile {
  const acc = new Map<Dimension, Acc>();
  const getAcc = (dim: Dimension): Acc => {
    let a = acc.get(dim);
    if (!a) {
      a = newAcc();
      acc.set(dim, a);
    }
    return a;
  };

  const add = (dim: Dimension, delta: number, maxMag: number, source: string) => {
    if (!delta || !maxMag) return;
    const a = getAcc(dim);
    a.sum += delta;
    a.max += maxMag;
    a.drivers.push({ source, delta: Math.round(delta * 10) / 10, maxMag });
  };

  // ---- 1. sign vectors × planet relevance × planet weight ----
  const placements: { id: string; signId: keyof typeof SIGN_VECS; weight: number }[] = [];
  for (const p of facts.planets) {
    placements.push({ id: p.id, signId: p.sign_id, weight: PLANET_WEIGHT[p.id] ?? 0.5 });
  }
  placements.push({ id: "ascendant", signId: facts.rising, weight: facts.timeKnown ? 2.2 : 1.1 });

  for (const { id, signId, weight } of placements) {
    const vec = SIGN_VECS[signId];
    const signName = SIGN_META[signId].name;
    for (const dim of DIMENSIONS) {
      const relTable = DIM_PLANET_RELEVANCE[dim] ?? {};
      const rel =
        id === "ascendant"
          ? (ASC_RELEVANCE[dim] ?? 0)
          : (relTable[id] ?? 0);
      if (!rel) continue;
      const signVal = vec[dim];
      // (value - 50)/50 ∈ [-1, 1] scaled by relevance × planet weight
      const delta = ((signVal - 50) / 50) * rel * weight;
      const maxMag = rel * weight;
      const retro = facts.retrogrades.includes(id) ? " (retrograde)" : "";
      add(dim, delta, maxMag, `${PRETTY[id] ?? id} in ${signName}${retro}`);
    }
  }

  // ---- 2. house placements ----
  if (facts.timeKnown) {
    for (const p of facts.planets) {
      const rules = HOUSE_RULES[p.house];
      if (!rules) continue;
      const w = PLANET_WEIGHT[p.id] ?? 0.5;
      const angular = [1, 4, 7, 10].includes(p.house);
      const mult = (w / 3) * (angular ? 1.25 : 1);
      for (const [dim, val] of Object.entries(rules) as [Dimension, number][]) {
        const delta = val * mult;
        add(dim, delta, Math.abs(val), `${PRETTY[p.id]} in house ${p.house}`);
      }
    }
    // Chart ruler placement echoes its house agenda
    if (facts.chartRuler) {
      const rules = HOUSE_RULES[facts.chartRuler.house];
      if (rules) {
        for (const [dim, val] of Object.entries(rules) as [Dimension, number][]) {
          add(dim, val * 0.8, Math.abs(val) * 0.8, `Chart ruler in house ${facts.chartRuler.house}`);
        }
      }
    }
  }

  // ---- 3. aspects (orb-weighted psychological interactions) ----
  for (const asp of facts.aspects) {
    const pairKey = [asp.a, asp.b].sort().join("|");
    const rules = ASPECT_RULES[pairKey];
    if (!rules) continue;
    const avgW = ((PLANET_WEIGHT[asp.a] ?? 0.5) + (PLANET_WEIGHT[asp.b] ?? 0.5)) / 2;
    // Normalize against the typical moon×saturn weight (2.4) so aspects don't
    // blow out; tight orbs still dominate loose ones.
    const scale = (avgW / 2.4) * (0.35 + asp.strength * 0.65);
    for (const rule of rules) {
      let delta: number;
      if (asp.polarity === "conj") {
        delta = rule.conjDelta ?? rule.hardDelta;
      } else if (asp.polarity === "hard") {
        delta = rule.hardDelta;
      } else {
        delta = rule.softDelta ?? -rule.hardDelta * 0.7;
      }
      delta *= scale;
      const maxMag = Math.abs(rule.hardDelta) * (avgW / 2.4);
      add(
        rule.dim,
        delta,
        maxMag,
        `${asp.label.replace(" conjunction ", " conjunct ")} (${STRENGTH_WORD(asp.strength)} orb)`
      );
    }
  }

  // ---- 4. weighted element / modality shares ----
  for (const [el, rules] of Object.entries(ELEMENT_RULES)) {
    const share = facts.elementShare[el as Element] / 100;
    const scale = share * 1.6; // 100% share → 1.6×, 30% → 0.48×
    for (const [dim, val] of Object.entries(rules) as [Dimension, number][]) {
      add(dim, val * scale, Math.abs(val) * 1.6, `${capitalize(el)}-dominant chart`);
    }
  }
  for (const [mo, rules] of Object.entries(MODALITY_RULES)) {
    const share = facts.modalityShare[mo as Modality] / 100;
    const scale = share * 1.4;
    for (const [dim, val] of Object.entries(rules) as [Dimension, number][]) {
      add(dim, val * scale, Math.abs(val) * 1.4, `${capitalize(mo)}-dominant chart`);
    }
  }

  // ---- 5. retrograde modifiers ----
  const retro = (id: string) => facts.retrogrades.includes(id);
  if (retro("mercury")) {
    add("overthinking", 5, 8, "Mercury retrograde");
    add("expressiveness", -4, 8, "Mercury retrograde");
    add("intuition", 3, 8, "Mercury retrograde");
  }
  if (retro("venus")) {
    add("trustCaution", 5, 7, "Venus retrograde");
    add("vulnerabilityOpenness", -4, 7, "Venus retrograde");
  }
  if (retro("mars")) {
    add("impulsivity", -4, 6, "Mars retrograde");
    add("patience", 3, 6, "Mars retrograde");
  }

  // ---- normalize to 0-100 ----
  // Noise control: keep only the strongest drivers per dimension so that
  // 25+ minor aspects can't drown the few loud signals (master prompt §3).
  const NOISE_FLOOR = 0.12; // drivers below 12% of the dim's biggest driver are dropped
  const TOP_DRIVERS = 9;

  const scores: DimensionScore[] = DIMENSIONS.map((dim) => {
    const a = acc.get(dim) ?? newAcc();
    const sorted = [...a.drivers].sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
    if (sorted.length) {
      const biggest = Math.abs(sorted[0].delta) || 1;
      const kept = sorted.filter((d) => Math.abs(d.delta) >= biggest * NOISE_FLOOR).slice(0, TOP_DRIVERS);
      let sum = 0;
      let max = 0;
      for (const d of kept) {
        sum += d.delta;
        max += d.maxMag ?? Math.abs(d.delta);
      }
      const ratio = max > 0 ? sum / max : 0;
      const centered = ratio - (CALIBRATION[dim] ?? 0);
      // Shrinkage: dimensions with weak total evidence (few/small factors)
      // get pulled toward 50 — we don't claim confidence the chart can't back.
      const confidence = Math.min(1, a.max / 8);
      const value = clamp(Math.round(50 + centered * 62 * confidence), 8, 92);
      return { key: dim, value, drivers: kept.slice(0, 4) };
    }
    return { key: dim, value: 50, drivers: [] };
  });

  const byKey = Object.fromEntries(scores.map((s) => [s.key, s])) as Record<Dimension, DimensionScore>;
  const v = (d: Dimension) => byKey[d].value;

  // ---- derived styles ----
  const styles = deriveStyles(byKey, facts);

  // ---- contradictions ----
  const contradictions = deriveContradictions(scores, byKey);

  // ---- recurring themes ----
  const themes = deriveThemes(byKey, contradictions, facts);

  return { scores, byKey, facts, styles, contradictions, themes };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// CALIBRATION — per-dimension mean ratio measured over a corpus of random
// charts (scripts/calibrate.ts). Subtracting it centers the average chart at
// 50 so scores reflect deviation from the average person, not absolute
// one-sided accumulation. Regenerate after changing factor rules.
// ---------------------------------------------------------------------------

export const CALIBRATION: Partial<Record<Dimension, number>> = {
  socialEnergy: 0.4501,
  socialSelectivity: 0.2276,
  expressiveness: 0.4456,
  emotionalSensitivity: 0.3166,
  emotionalControl: 0.0172,
  vulnerabilityOpenness: 0.0584,
  attachmentNeed: 0.3356,
  independence: 0.4963,
  trustCaution: 0.3874,
  jealousyRisk: 0.1902,
  communicationDirectness: 0.493,
  analyticalThinking: 0.4038,
  overthinking: 0.3056,
  intuition: 0.3777,
  confidence: 0.4126,
  selfCriticism: 0.2722,
  ambition: 0.5188,
  discipline: 0.3004,
  patience: 0.1579,
  impulsivity: 0.2208,
  adaptability: 0.2056,
  creativity: 0.5813,
  romanticism: 0.5832,
  nurturance: 0.4215,
  intensityDepth: 0.4638,
  needForControl: 0.2852,
  idealism: 0.614,
  resilience: 0.3783,
  playfulness: 0.4852,
};

// ---------------------------------------------------------------------------
// Derived behavioral styles
// ---------------------------------------------------------------------------

function deriveStyles(byKey: Record<Dimension, DimensionScore>, facts: ChartFacts): PersonalityProfile["styles"] {
  const v = (d: Dimension) => byKey[d].value;

  // Attachment: anxious (high attachment need + fear), avoidant (independence + guarded), secure (balanced)
  const att = v("attachmentNeed");
  const trust = v("trustCaution");
  const vuln = v("vulnerabilityOpenness");
  const indep = v("independence");
  let attachment: PersonalityProfile["styles"]["attachment"];
  if (att >= 60 && trust >= 55) {
    attachment = {
      kind: "ambivalent",
      note: "crave closeness but brace for it to disappear, so closeness and suspicion arrive together",
    };
  } else if (att >= 60) {
    attachment = {
      kind: "anxious-leaning",
      note: "bond hard once someone is let in, and need steady reassurance that the bond still holds",
    };
  } else if (indep >= 60 && vuln <= 45) {
    attachment = {
      kind: "avoidant-leaning",
      note: "handle feelings alone, in their own time and their own way — closeness is wanted, but on their terms",
    };
  } else {
    attachment = {
      kind: "secure-leaning",
      note: "connects without losing themselves — closeness doesn't trigger panic or escape",
    };
  }

  // Conflict style
  const dir = v("communicationDirectness");
  const imp = v("impulsivity");
  const ec = v("emotionalControl");
  const pat = v("patience");
  let conflict: PersonalityProfile["styles"]["conflict"];
  if (dir >= 62 && imp >= 60) {
    conflict = { kind: "confrontational", note: "meets conflict head-on and says what's wrong while it's happening" };
  } else if (ec >= 60 && dir >= 50) {
    conflict = { kind: "explosive-controlled", note: "stays composed for a long time, then detonates all at once when the limit finally arrives" };
  } else if (dir <= 45 && pat >= 50) {
    conflict = { kind: "diplomatic", note: "smooths things over, reads the room first, and only names the problem when it's safe" };
  } else {
    conflict = { kind: "avoidant", note: "goes quiet or exits rather than argue — distance is the conflict style" };
  }

  // Social style
  const se = v("socialEnergy");
  const ss = v("socialSelectivity");
  let social: PersonalityProfile["styles"]["social"];
  if (se >= 62 && ss <= 50) {
    social = { kind: "outgoing", note: "warms up fast and enjoys most people — strangers are just friends they haven't met" };
  } else if (se >= 55 && ss >= 60) {
    social = { kind: "situational", note: "can work any room, but saves real energy for a very short list of people" };
  } else if (ss >= 58) {
    social = { kind: "selective", note: "polite with everyone, open with almost no one — the inner circle is earned, not entered" };
  } else if (se <= 42) {
    social = { kind: "private", note: "doesn't need much social contact to feel fine — company is chosen carefully and sparingly" };
  } else {
    social = { kind: "ambiverted", note: "takes company or leaves it depending on the day — neither wired to perform nor wired to hide" };
  }

  // Thinking style
  const an = v("analyticalThinking");
  const it2 = v("intuition");
  const ov = v("overthinking");
  let thinking: PersonalityProfile["styles"]["thinking"];
  if (an >= 58 && it2 >= 58) {
    thinking = { kind: "hybrid", note: "runs logic and gut feeling in parallel, and notices when the two disagree" };
  } else if (an >= 58) {
    thinking = { kind: "analytical", note: "takes things apart before trusting them — understanding comes before feeling" };
  } else if (it2 >= 60) {
    thinking = { kind: "intuitive", note: "knows the answer before the reasoning catches up — first impressions carry real information" };
  } else if (ov >= 62) {
    thinking = { kind: "deliberate", note: "turns things over far longer than seems necessary, and usually finds what a quick look misses" };
  } else {
    thinking = { kind: "hybrid", note: "mixes reasoning and feel depending on the situation" };
  }

  void facts;
  return { attachment, conflict, social, thinking };
}

// ---------------------------------------------------------------------------
// Contradictions — interactions between opposing extremes
// ---------------------------------------------------------------------------

interface ContraDef {
  dims: [Dimension, Dimension];
  title: string;
  test: (a: number, b: number) => boolean;
  body: (aLabel: string, bLabel: string) => string;
}

const CONTRA_DEFS: ContraDef[] = [
  {
    dims: ["independence", "attachmentNeed"],
    title: "Fiercely independent, quietly devoted",
    test: (a, b) => a >= 62 && b >= 62,
    body: () =>
      "They guard their autonomy hard — being told what to do, when, or how tends to trigger resistance almost immediately. And yet the people they've let in matter to them with a seriousness they rarely announce. The result: they may pull away from control while still needing, more than they'd admit, to know that their person is solidly there. Partners who mistake the distance for not caring get it exactly wrong.",
  },
  {
    dims: ["confidence", "selfCriticism"],
    title: "Confident outside, exacting judge inside",
    test: (a, b) => a >= 62 && b >= 62,
    body: () =>
      "They carry themselves like someone who knows exactly what they're doing — and often they do. Underneath, an internal auditor replays their performance and flags every flaw. Others rarely see this; most assume the self-assurance runs all the way down. It doesn't. The criticism is aimed inward first, and it's stricter than anything they'd say to another person.",
  },
  {
    dims: ["emotionalSensitivity", "emotionalControl"],
    title: "Deep feeler, tight lid",
    test: (a, b) => a >= 62 && b >= 58,
    body: () =>
      "They register emotional shifts most people miss — a change in tone, a slightly off reply. Almost none of that shows in real time. Feelings get processed privately, on a delay, and by the time they mention something it has usually been turned over for days. People who only see the calm surface can seriously underestimate how much is moving underneath it.",
  },
  {
    dims: ["socialEnergy", "socialSelectivity"],
    title: "Works every room, belongs to few",
    test: (a, b) => a >= 58 && b >= 60,
    body: () =>
      "They can talk to anyone and often do — warm, quick, socially fluent. But fluency isn't access. The list of people who actually know them is startlingly short, and the difference between their public self and their private self is considerable. If someone treats the charm as intimacy, they'll find the wall without ever seeing it go up.",
  },
  {
    dims: ["impulsivity", "overthinking"],
    title: "Fast on some triggers, spirals on others",
    test: (a, b) => a >= 60 && b >= 60,
    body: () =>
      "In parts of their life they decide in seconds, and they act — spending, speaking, starting. In others they replay a two-line text message for an hour. It isn't inconsistency; it's that speed depends on stakes. Where outcomes feel reversible, they move. Where they can't take it back, the mind loops.",
  },
  {
    dims: ["romanticism", "trustCaution"],
    title: "Hopeless romantic with a background check",
    test: (a, b) => a >= 62 && b >= 58,
    body: () =>
      "They want the kind of love people write about — and they watch for evidence it's safe before surrendering to it. Early on, this looks like mixed signals: intense interest paired with testing, warmth followed by sudden evaluation. The person who passes the checks without mocking them gets something most people never see.",
  },
  {
    dims: ["ambition", "patience"],
    title: "Hungry engine, short fuse on pace",
    test: (a, b) => a >= 62 && b <= 45,
    body: () =>
      "They want to move, build, and win — and they want it to happen faster than it usually does. Slow processes, gatekeepers, and waiting rooms wear on them in a way they don't always hide well. Their ambition is real fuel; their challenge is that significant things rarely arrive at the speed of their wanting.",
  },
  {
    dims: ["intensityDepth", "vulnerabilityOpenness"],
    title: "Volcano with a lid on it",
    test: (a, b) => a >= 65 && b <= 45,
    body: () =>
      "What they feel runs at a depth most conversations can't hold — all-or-nothing loyalty, total absorption in what matters. Almost none of that is on display. They share opinions easily and feelings selectively, which reads as mystery or distance from the outside. Inside, it's simply that the full truth feels too heavy to hand to someone untested.",
  },
  {
    dims: ["needForControl", "adaptability"],
    title: "Flexible until the control slips",
    test: (a, b) => a >= 60 && b >= 60,
    body: () =>
      "They handle change well — new plans, new situations, new people. What they don't handle well is having no say in the change. If they chose it, they'll improvise happily; if it was imposed, the same disruption lands completely differently. Control, for them, isn't about rigidity. It's about authorship.",
  },
  {
    dims: ["emotionalSensitivity", "independence"],
    title: "Doesn't need anyone — notices everything",
    test: (a, b) => a >= 62 && b >= 62,
    body: () =>
      "They are genuinely fine alone and they want people to know it. At the same time, they register every slight, mood shift, and half-said thing with uncomfortable accuracy. The independence is real, not a pose — but the sensitivity means 'I don't care' and 'I noticed' are both true at the same time, which confuses people who think those exclude each other.",
  },
];

function deriveContradictions(
  scores: DimensionScore[],
  byKey: Record<Dimension, DimensionScore>
): PersonalityProfile["contradictions"] {
  const out: PersonalityProfile["contradictions"] = [];
  for (const def of CONTRA_DEFS) {
    const [d1, d2] = def.dims;
    if (def.test(byKey[d1].value, byKey[d2].value)) {
      out.push({ title: def.title, body: def.body("", ""), dims: def.dims });
    }
  }
  void scores;
  // Max 4, strongest pairs first by combined extremity
  return out.sort((x, y) => extremityOf(y, byKey) - extremityOf(x, byKey)).slice(0, 4);
}

// Re-do sorting with real extremity — cleaner implementation
function extremityOf(c: PersonalityProfile["contradictions"][number], byKey: Record<Dimension, DimensionScore>): number {
  return c.dims.reduce((acc, d) => acc + Math.abs(byKey[d].value - 50), 0);
}

// ---------------------------------------------------------------------------
// Recurring themes
// ---------------------------------------------------------------------------

interface ThemeDef {
  key: string;
  label: string;
  score: (v: Record<Dimension, number>, contradictions: PersonalityProfile["contradictions"]) => number;
}

const THEME_DEFS: ThemeDef[] = [
  {
    key: "independence_attachment",
    label: "Independence vs attachment",
    score: (v, c) => (c.some((x) => x.dims.includes("independence") && x.dims.includes("attachmentNeed")) ? 85 : (v.independence + v.attachmentNeed) / 2 < 50 ? 30 : 45),
  },
  {
    key: "control_sensitivity",
    label: "Emotional control vs sensitivity",
    score: (v, c) => (c.some((x) => x.dims.includes("emotionalSensitivity") && x.dims.includes("emotionalControl")) ? 85 : (v.emotionalControl + v.emotionalSensitivity) / 2),
  },
  {
    key: "security_freedom",
    label: "Security vs freedom",
    score: (v) => (v.independence + (100 - v.attachmentNeed) + v.independence) / 3 * 0.8 + v.patience * 0.2,
  },
  {
    key: "idealism_reality",
    label: "Idealism vs reality",
    score: (v) => (v.idealism >= 60 && v.analyticalThinking >= 55) ? 80 : v.idealism * 0.7,
  },
  {
    key: "depth_intensity",
    label: "Depth and intensity",
    score: (v) => (v.intensityDepth + v.emotionalSensitivity) / 2,
  },
  {
    key: "visibility",
    label: "Visibility and performance",
    score: (v) => (v.expressiveness + v.confidence) / 2,
  },
  {
    key: "precision",
    label: "Precision and self-improvement",
    score: (v) => (v.analyticalThinking + v.selfCriticism + v.discipline) / 3,
  },
  {
    key: "care",
    label: "Care and connection",
    score: (v) => (v.nurturance + v.attachmentNeed) / 2,
  },
  {
    key: "chaos",
    label: "Chaos and reinvention",
    score: (v) => (v.impulsivity + v.adaptability) / 2,
  },
];

function deriveThemes(
  byKey: Record<Dimension, DimensionScore>,
  contradictions: PersonalityProfile["contradictions"],
  facts: ChartFacts
): PersonalityProfile["themes"] {
  const v = Object.fromEntries(Object.entries(byKey).map(([k, s]) => [k, s.value])) as Record<Dimension, number>;
  const scored = THEME_DEFS.map((t) => ({ key: t.key, label: t.label, strength: Math.round(t.score(v, contradictions)) }))
    .sort((a, b) => b.strength - a.strength);
  // Require genuine support: keep themes scoring >= 55, max 4.
  const kept = scored.filter((t) => t.strength >= 55).slice(0, 4);
  // Element theme as fallback flavor
  if (kept.length < 2) {
    kept.push({ key: `element_${facts.dominantElement}`, label: `${capitalize(facts.dominantElement)} as a default setting`, strength: 60 });
  }
  return kept;
}

// Fix the contradictions sort to use real extremity
export { extremityOf };
