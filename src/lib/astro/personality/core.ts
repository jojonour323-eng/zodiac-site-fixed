// ===========================================================================
// PERSONALITY ENGINE — shared core
// ---------------------------------------------------------------------------
// Deterministic helpers, seeded RNG (so one person always gets the same
// reading, but different charts get varied prose), band labels, and the
// canonical list of psychological dimensions.
// ===========================================================================

/** Every psychological dimension the engine tracks (0–100). */
export const DIMENSIONS = [
  "socialEnergy",
  "socialSelectivity",
  "expressiveness",
  "emotionalSensitivity",
  "emotionalControl",
  "vulnerabilityOpenness",
  "attachmentNeed",
  "independence",
  "trustCaution",
  "jealousyRisk",
  "communicationDirectness",
  "analyticalThinking",
  "overthinking",
  "intuition",
  "confidence",
  "selfCriticism",
  "ambition",
  "discipline",
  "patience",
  "impulsivity",
  "adaptability",
  "creativity",
  "romanticism",
  "nurturance",
  "intensityDepth",
  "needForControl",
  "idealism",
  "resilience",
  "playfulness",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  socialEnergy: "Social energy",
  socialSelectivity: "Social selectivity",
  expressiveness: "Expressiveness",
  emotionalSensitivity: "Emotional sensitivity",
  emotionalControl: "Emotional control",
  vulnerabilityOpenness: "Vulnerability openness",
  attachmentNeed: "Attachment need",
  independence: "Independence",
  trustCaution: "Trust caution",
  jealousyRisk: "Jealousy risk",
  communicationDirectness: "Directness",
  analyticalThinking: "Analytical thinking",
  overthinking: "Overthinking",
  intuition: "Intuition",
  confidence: "Confidence",
  selfCriticism: "Self-criticism",
  ambition: "Ambition",
  discipline: "Discipline",
  patience: "Patience",
  impulsivity: "Impulsivity",
  adaptability: "Adaptability",
  creativity: "Creativity",
  romanticism: "Romanticism",
  nurturance: "Nurturance",
  intensityDepth: "Intensity & depth",
  needForControl: "Need for control",
  idealism: "Idealism",
  resilience: "Resilience",
  playfulness: "Playfulness",
};

/** A weighted contribution to a dimension, with a human-readable reason. */
export interface Driver {
  /** Short human-readable provenance, e.g. "Moon square Saturn (tight)". */
  source: string;
  /** Signed contribution before normalization. */
  delta: number;
  /** The theoretical max |contribution| of this factor (for normalization). */
  maxMag?: number;
}

export interface DimensionScore {
  key: Dimension;
  /** 0–100. */
  value: number;
  /** The individual factors that pushed the score, strongest first. */
  drivers: Driver[];
}

// ---------------------------------------------------------------------------
// Number helpers
// ---------------------------------------------------------------------------

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

/** Scale a raw accumulated score to 0–100 given the max possible magnitude. */
export function scaleTo100(raw: number, maxAbs: number): number {
  if (maxAbs <= 0) return 50;
  // raw is centered at 0; map [-maxAbs, +maxAbs] → [0, 100] around 50
  const pct = 50 + (raw / maxAbs) * 50;
  return clamp(Math.round(pct));
}

export function band(value: number): "very low" | "low" | "moderate" | "high" | "very high" {
  if (value >= 82) return "very high";
  if (value >= 65) return "high";
  if (value >= 42) return "moderate";
  if (value >= 25) return "low";
  return "very low";
}

// ---------------------------------------------------------------------------
// Seeded RNG — mulberry32 + string hash.
// Deterministic per seed: same chart → same prose. Different chart → different
// prose variation, satisfying "no generic paragraph reused for everyone".
// ---------------------------------------------------------------------------

export function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export interface Rng {
  next(): number;
  pick<T>(arr: readonly T[]): T;
  /** Pick n distinct items (or fewer if the array is smaller). */
  sample<T>(arr: readonly T[], n: number): T[];
  chance(p: number): boolean;
  int(minInclusive: number, maxInclusive: number): number;
}

export function makeRng(seed: number | string): Rng {
  let s = typeof seed === "string" ? hashSeed(seed) : seed >>> 0;
  const next = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const sample = <T,>(arr: readonly T[], n: number): T[] => {
    const copy = [...arr];
    const out: T[] = [];
    while (copy.length && out.length < n) {
      out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]);
    }
    return out;
  };
  const rng: Rng = {
    next,
    pick: (arr) => arr[Math.floor(next() * arr.length) % arr.length],
    sample,
    chance: (p) => next() < p,
    int: (minInclusive, maxInclusive) =>
      minInclusive + Math.floor(next() * (maxInclusive - minInclusive + 1)),
  };
  return rng;
}

// ---------------------------------------------------------------------------
// Ranking helpers
// ---------------------------------------------------------------------------

/** Returns the dims sorted by |value - 50| descending (most distinctive first). */
export function mostDistinctive(scores: DimensionScore[], n = 5): DimensionScore[] {
  return [...scores]
    .sort((a, b) => Math.abs(b.value - 50) - Math.abs(a.value - 50))
    .slice(0, n);
}

export function getDim(scores: DimensionScore[], key: Dimension): DimensionScore {
  return scores.find((s) => s.key === key) ?? { key, value: 50, drivers: [] };
}

export function dimValue(scores: DimensionScore[], key: Dimension): number {
  return getDim(scores, key).value;
}

/** Weighted mix of two dimension values (used for derived patterns). */
export function mix(a: number, b: number, wa = 0.5): number {
  return a * wa + b * (1 - wa);
}
