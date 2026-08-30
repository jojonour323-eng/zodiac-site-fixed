// ===========================================================================
// PERSONALITY RINGS — whole-chart ring scores + placement-cited writing
// ---------------------------------------------------------------------------
// Each ring blends 4–6 psychological dimensions (which themselves were built
// from the whole chart), so two people with the same Sun can diverge wildly.
// The NOTE under every ring is written from the person's REAL chart — it
// cites the actual placements/aspects that produced the number (from the
// dimension drivers), plus one plain-English line about what the level means
// in daily life. A low ring says so plainly; the ring color turns red.
// ===========================================================================

import type { DimensionScore, Dimension, Rng } from "./core";
import { clamp } from "./core";
import type { ChartFacts } from "./facts";
import { SIGN_EMOJI } from "../signs";

export interface RingResult {
  key: string;
  label: string;
  value: number;
  /** One-line headline, generated from the real drivers. */
  headline: string;
  /** 1–2 sentences of "why this number" — cites the person's real placements. */
  note: string;
}

interface RingDef {
  key: string;
  label: string;
  /** dimension → weight (0-1). Negative value = inverted (100 - x). */
  mix: Partial<Record<Dimension, number>>;
  /** Which chart placements to cite first when explaining this ring. */
  citePlanets: string[];
  headlines: {
    high: string[];
    mid: string[];
    low: string[];
  };
  /** What the level looks like in real life (one concrete sentence). */
  life: { high: string; mid: string; low: string };
}

const RING_DEFS: RingDef[] = [
  {
    key: "social",
    label: "Social",
    mix: { socialEnergy: 0.5, expressiveness: 0.2, socialSelectivity: -0.2, playfulness: 0.1 },
    citePlanets: ["mercury", "moon", "sun", "venus"],
    headlines: {
      high: ["People-powered, by choice", "Socially fluent and energized by it", "Rooms are their habitat"],
      mid: ["Social with a thermostat", "Engaged, but on their own dial", "People person with a mute button"],
      low: ["Small circles, deep roots", "Socially economical", "Company by invitation only"],
    },
    life: {
      high: "They get charged up around people — a full day with a crowd leaves them more alive, not drained.",
      mid: "People time is enjoyable in doses, then they need quiet to reset the battery.",
      low: "People time drains them fast — small circles and alone time are where they refill.",
    },
  },
  {
    key: "emotional",
    label: "Emotional",
    mix: { emotionalSensitivity: 0.35, vulnerabilityOpenness: 0.2, emotionalControl: -0.15, intensityDepth: 0.15, attachmentNeed: 0.15 },
    citePlanets: ["moon", "neptune", "pluto", "venus"],
    headlines: {
      high: ["Feels at full volume", "Emotionally porous and deep", "Everything registers, most of it stays"],
      mid: ["Feeling with a filter", "Emotionally attuned, selectively open", "Deep water, managed surface"],
      low: ["Calm by default", "Feelings logged, not dramatized", "Low waves, calm waters"],
    },
    life: {
      high: "They feel everything strongly — moods, tone shifts, atmosphere — and it colors the whole day.",
      mid: "Feelings land clearly, but they choose what to act on and what to let pass.",
      low: "Feelings show up quietly and move on fast — they stay steady even when things get heavy.",
    },
  },
  {
    key: "creativity",
    label: "Creativity",
    mix: { creativity: 0.55, playfulness: 0.15, idealism: 0.1, impulsivity: 0.2 },
    citePlanets: ["venus", "neptune", "sun", "mercury"],
    headlines: {
      high: ["Original output is the point", "Makes things nobody asked for — beautifully", "Ideas arrive faster than hands can follow"],
      mid: ["Creative in bursts", "Makes things when it matters", "Craft over constant output"],
      low: ["Practical imagination", "Appreciates more than produces", "Creativity in service of function"],
    },
    life: {
      high: "They need to make things — music, outfits, jokes, plans, anything — and it shows in everything they touch.",
      mid: "The creative side comes out when something matters to them, not on demand.",
      low: "They'd rather use what works than invent something new — practical beats clever in their book.",
    },
  },
  {
    key: "communication",
    label: "Communication",
    mix: { communicationDirectness: 0.35, adaptability: 0.2, socialEnergy: 0.15, analyticalThinking: 0.15, overthinking: -0.1, playfulness: 0.05 },
    citePlanets: ["mercury", "sun", "moon", "mars"],
    headlines: {
      high: ["Words arrive fast and land clean", "Talks like it's a sport they train for", "Says the thing, then explains the thing"],
      mid: ["Communicates with intent", "Measured and clear", "Talks when there's something to say"],
      low: ["Economical with words", "Says less, means more", "Processes first, speaks later"],
    },
    life: {
      high: "They think out loud, reply fast, and say what they mean without wrapping it up first.",
      mid: "They speak when they have something to say — and it usually comes out clear.",
      low: "They take their time answering; the reply is short because the thinking already happened inside.",
    },
  },
  {
    key: "confidence",
    label: "Confidence",
    mix: { confidence: 0.5, resilience: 0.2, selfCriticism: -0.2, independence: 0.1 },
    citePlanets: ["sun", "mars", "saturn", "chiron"],
    headlines: {
      high: ["Backs themselves, visibly", "Self-assured without performing it", "Trusts their own read first"],
      mid: ["Confident on known ground", "Self-belief with contexts", "Sure of themselves where it counts"],
      low: ["Quiet doubts, loud competence", "Competence outrunning confidence", "Proves it before believing it"],
    },
    life: {
      high: "They decide, they move, and other people's doubt barely registers.",
      mid: "They're sure of themselves in familiar territory and more careful outside it.",
      low: "They second-guess themselves even when they're clearly good at what they do.",
    },
  },
  {
    key: "discipline",
    label: "Discipline",
    mix: { discipline: 0.45, patience: 0.25, impulsivity: -0.25, ambition: 0.05 },
    citePlanets: ["saturn", "mars", "sun", "moon"],
    headlines: {
      high: ["Structure is comfort", "Follow-through is automatic", "Builds on schedule, reliably"],
      mid: ["Disciplined when it matters", "Consistent with stakes", "Structure on demand"],
      low: ["Allergic to rigid routine", "Motivated by sparks, not systems", "Discipline depends on desire"],
    },
    life: {
      high: "They finish what they start — routines hold, plans stick, the boring parts get done.",
      mid: "They can run structure when the goal is worth it; otherwise it slides.",
      low: "Routine collapses fast unless they actually want it — motivation runs on sparks.",
    },
  },
  {
    key: "energy",
    label: "Energy",
    mix: { impulsivity: 0.3, resilience: 0.2, expressiveness: 0.15, confidence: 0.15, patience: -0.2 },
    citePlanets: ["mars", "sun", "jupiter", "saturn"],
    headlines: {
      high: ["Runs hot and recovers fast", "High-output engine", "Constant motion, genuine appetite"],
      mid: ["Steady burn with flares", "Energy in waves", "Strong output, real recharging"],
      low: ["Conserves by default", "Low idle, efficient", "Energy spent deliberately"],
    },
    life: {
      high: "They move fast, start things at midnight, and burn through to-do lists other people dread.",
      mid: "They run in waves — big output days, then real recharge days.",
      low: "They pace themselves; energy goes where it counts and nowhere else.",
    },
  },
  {
    key: "romance",
    label: "Romance",
    mix: { romanticism: 0.55, attachmentNeed: 0.15, intensityDepth: 0.15, nurturance: 0.15 },
    citePlanets: ["venus", "moon", "mars", "sun"],
    headlines: {
      high: ["Loves like it's the main plot", "Romance runs the engine", "All-in: hearts fully on the table"],
      mid: ["Romantic with standards", "Love deeply, choose carefully", "Warm heart, open only to the vetted"],
      low: ["Love as partnership, not cinema", "Grounded in affection", "Shows love through reliability"],
    },
    life: {
      high: "Love is the main plot — big feelings, big gestures, and no interest in half-way versions of it.",
      mid: "They want real love, but they pick carefully before going deep.",
      low: "Love is shown by showing up — reliable, practical, and not built for grand cinematic gestures.",
    },
  },
];

/** Sign emoji appended to a "Venus in Taurus"-style driver source. */
function emojiCite(source: string): string {
  const m = source.match(/\bin (Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/);
  if (!m) return source;
  const id = m[1].toLowerCase() as keyof typeof SIGN_EMOJI;
  return `${source} ${SIGN_EMOJI[id] ?? ""}`.trim();
}

/**
 * Real chart citations for a dimension: prefer placement-like drivers
 * ("Venus in Taurus", "Moon in house 8"), then aspect drivers
 * ("Moon square Saturn"), then chart-shape drivers ("Air-dominant chart").
 */
export function citesFor(score: DimensionScore | undefined, max = 2): string {
  if (!score || !score.drivers.length) return "";
  const placement = score.drivers.filter((d) => /\bin (house\s+\d|[A-Z][a-z]+)/.test(d.source) && !/dominant chart/.test(d.source));
  const aspect = score.drivers.filter((d) => /\b(square|trine|sextile|opposition|conjunct)\b/i.test(d.source));
  const shape = score.drivers.filter((d) => /dominant chart/.test(d.source));
  // Prefer citing DIFFERENT planets/aspects: skip a driver whose leading
  // planet name is already used ("Venus in house 7 + Venus in Aries" reads
  // redundant; "Venus in Aries + Moon in Aquarius" reads like analysis).
  const used = new Set<string>();
  const picked: string[] = [];
  for (const d of [...placement, ...aspect, ...shape]) {
    const planet = d.source.split(" ")[0].toLowerCase();
    if (used.has(planet) && !/dominant chart/.test(d.source)) continue;
    used.add(planet);
    picked.push(emojiCite(d.source));
    if (picked.length >= max) break;
  }
  return [...new Set(picked)].join(" + ");
}

export function computeRings(scores: DimensionScore[], rng: Rng, facts?: ChartFacts): RingResult[] {
  const v = Object.fromEntries(scores.map((s) => [s.key, s.value])) as Record<Dimension, number>;

  return RING_DEFS.map((def) => {
    let weighted = 0;
    let totalW = 0;
    const contributions: { dim: Dimension; weight: number; contribution: number }[] = [];
    for (const [dim, w] of Object.entries(def.mix) as [Dimension, number][]) {
      const val = w < 0 ? 100 - v[dim] : v[dim];
      const absW = Math.abs(w);
      weighted += val * absW;
      totalW += absW;
      contributions.push({ dim, weight: w, contribution: val * absW });
    }
    const raw = totalW ? weighted / totalW : 50;
    // Contrast stretch (+45% away from midpoint): rings blend several
    // dimensions, which averages out real variance. A strong stretch keeps
    // genuine differences LOUD — a romantic chart should visibly peg the
    // Romance ring, a private one should see it red. Capped at 2–98 so it
    // exaggerates without lying.
    const value = clamp(Math.round(50 + (raw - 50) * 1.45), 2, 98);

    const sorted = contributions.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
    const topDim = sorted[0];
    const topScore = scores.find((s) => s.key === topDim.dim);

    const tier = value >= 65 ? "high" : value <= 42 ? "low" : "mid";
    const headline = rng.pick(def.headlines[tier]);

    // The note is written from the person's REAL chart: cite the placements
    // that actually drove the top dimension, then say what the level means.
    let cites = citesFor(topScore, 2);
    if (!cites && facts) {
      const first = def.citePlanets.map((id) => facts.planets.find((p) => p.id === id)).find(Boolean);
      if (first) {
        const signName = first.sign_id.charAt(0).toUpperCase() + first.sign_id.slice(1);
        cites = emojiCite(`${first.name} in ${signName}`);
      }
    }

    const life = def.life[tier];
    const note = cites
      ? `${cites} set this. ${life}`
      : life;

    return {
      key: def.key,
      label: def.label,
      value,
      headline,
      note,
    };
  });
}
