// ===========================================================================
// SIGN PSYCHOLOGY TABLES
// ---------------------------------------------------------------------------
// The knowledge base of the personality engine. Unlike the old system (one
// static 0-100 value per sign per ring), each sign is scored across ALL 29
// psychological dimensions. These values encode standard Western astrology's
// behavioral reading of each sign — how a strong placement in that sign
// tends to show up in a person's psychology.
// ===========================================================================

import type { Dimension } from "./core";
import type { SignId } from "../types";

// Order matters — keep in sync with DIMENSIONS in core.ts.
// Keys: so socialEnergy | ss socialSelectivity | ex expressiveness | es emotionalSensitivity
// ec emotionalControl | vo vulnerabilityOpenness | an attachmentNeed | id independence
// tc trustCaution | jr jealousyRisk | cd communicationDirectness | at analyticalThinking
// ov overthinking | it intuition | cf confidence | sc selfCriticism | am ambition
// di discipline | pa patience | im impulsivity | ad adaptability | cr creativity
// ro romanticism | nu nurturance | int intensityDepth | nc needForControl
// il idealism | re resilience | pl playfulness
const D = [
  "socialEnergy", "socialSelectivity", "expressiveness", "emotionalSensitivity",
  "emotionalControl", "vulnerabilityOpenness", "attachmentNeed", "independence",
  "trustCaution", "jealousyRisk", "communicationDirectness", "analyticalThinking",
  "overthinking", "intuition", "confidence", "selfCriticism",
  "ambition", "discipline", "patience", "impulsivity",
  "adaptability", "creativity", "romanticism", "nurturance",
  "intensityDepth", "needForControl", "idealism", "resilience", "playfulness",
] as const;

export const SIGN_VECS: Record<SignId, Record<Dimension, number>> = {
  aries: vec([78, 35, 92, 55, 30, 60, 45, 90, 25, 35, 95, 45, 25, 40, 88, 35, 82, 42, 25, 90, 55, 62, 70, 62, 58, 55, 65, 75, 85]),
  taurus: vec([48, 55, 45, 62, 68, 38, 78, 45, 62, 65, 55, 42, 35, 30, 62, 40, 62, 85, 92, 15, 22, 55, 82, 68, 52, 58, 38, 72, 45]),
  gemini: vec([90, 48, 82, 45, 52, 55, 38, 72, 40, 25, 78, 85, 72, 55, 58, 42, 55, 32, 30, 75, 92, 78, 52, 48, 38, 30, 70, 65, 90]),
  cancer: vec([58, 62, 60, 95, 45, 52, 92, 38, 72, 62, 42, 45, 68, 78, 45, 58, 48, 58, 48, 45, 42, 72, 85, 92, 78, 55, 55, 55, 52]),
  leo: vec([85, 42, 95, 68, 48, 55, 62, 62, 45, 58, 72, 38, 32, 42, 90, 45, 85, 52, 45, 62, 45, 92, 85, 72, 55, 48, 72, 68, 82]),
  virgo: vec([52, 68, 42, 60, 78, 35, 52, 58, 68, 35, 82, 95, 90, 45, 52, 88, 68, 92, 62, 30, 48, 62, 48, 72, 48, 72, 35, 58, 38]),
  libra: vec([88, 52, 72, 62, 62, 52, 82, 42, 48, 42, 48, 68, 68, 55, 52, 52, 52, 48, 52, 42, 72, 75, 92, 72, 42, 38, 78, 58, 68]),
  scorpio: vec([48, 82, 55, 92, 55, 30, 85, 55, 90, 82, 55, 82, 78, 88, 62, 52, 78, 72, 45, 48, 35, 62, 85, 45, 97, 88, 45, 62, 42]),
  sagittarius: vec([78, 35, 85, 50, 38, 72, 35, 95, 30, 22, 92, 52, 25, 58, 78, 30, 72, 35, 30, 85, 88, 70, 62, 52, 48, 25, 92, 85, 88]),
  capricorn: vec([45, 58, 38, 52, 88, 25, 55, 72, 75, 38, 68, 82, 55, 35, 72, 72, 95, 95, 82, 25, 35, 48, 45, 52, 62, 75, 38, 82, 32]),
  aquarius: vec([72, 62, 68, 42, 72, 38, 32, 92, 45, 25, 82, 88, 52, 72, 62, 38, 65, 55, 45, 62, 85, 85, 45, 42, 52, 35, 88, 68, 72]),
  pisces: vec([55, 45, 65, 97, 25, 75, 82, 35, 48, 35, 42, 48, 72, 95, 42, 55, 42, 30, 38, 48, 82, 88, 95, 85, 72, 25, 92, 45, 62]),
};

function vec(vals: readonly number[]): Record<Dimension, number> {
  const out = {} as Record<Dimension, number>;
  D.forEach((k, i) => {
    out[k] = vals[i];
  });
  return out;
}

// ---------------------------------------------------------------------------
// PLANET WEIGHTS — how loud a planet is in the personality.
// Luminaries and personal planets dominate; outers color the generation.
// ---------------------------------------------------------------------------

export const PLANET_WEIGHT: Record<string, number> = {
  sun: 3.0,
  moon: 3.0,
  mercury: 2.2,
  venus: 2.2,
  mars: 2.2,
  jupiter: 1.5,
  saturn: 1.8,
  uranus: 1.0,
  neptune: 1.0,
  pluto: 1.2,
  north_node: 0.7,
  chiron: 0.7,
  lilith: 0.5,
};

// Which planets are relevant to which dimension, and how strongly.
// Absent = that planet doesn't feed this dimension.
export const DIM_PLANET_RELEVANCE: Partial<Record<Dimension, Partial<Record<string, number>>>> = {
  socialEnergy: { venus: 2.0, mercury: 1.8, moon: 1.4, jupiter: 1.2, sun: 1.0, mars: 0.6 },
  socialSelectivity: { saturn: 1.6, moon: 1.2, pluto: 1.0, venus: 0.8, mars: 0.6 },
  expressiveness: { sun: 2.2, mars: 1.6, mercury: 1.2, moon: 1.0, jupiter: 1.0 },
  emotionalSensitivity: { moon: 3.0, venus: 1.2, neptune: 1.6, pluto: 1.0, chiron: 1.0, mars: 0.4 },
  emotionalControl: { saturn: 2.2, moon: 2.0, pluto: 1.4, mercury: 0.6, uranus: 0.8 },
  vulnerabilityOpenness: { moon: 2.2, venus: 1.6, neptune: 1.2, saturn: 1.0, pluto: 0.8, chiron: 0.8 },
  attachmentNeed: { moon: 3.0, venus: 2.0, neptune: 0.8, pluto: 0.8 },
  independence: { sun: 1.8, mars: 2.0, uranus: 2.0, saturn: 1.0, mercury: 0.6 },
  trustCaution: { saturn: 1.8, pluto: 1.8, moon: 1.4, mars: 0.8, chiron: 1.0 },
  jealousyRisk: { venus: 1.8, pluto: 2.0, mars: 1.2, moon: 1.4 },
  communicationDirectness: { mars: 2.4, mercury: 2.2, sun: 1.0, jupiter: 0.8 },
  analyticalThinking: { mercury: 3.0, uranus: 1.4, saturn: 1.0, pluto: 0.8 },
  overthinking: { mercury: 2.6, moon: 1.2, saturn: 1.0, pluto: 0.8, uranus: 0.5 },
  intuition: { moon: 2.2, neptune: 2.2, pluto: 1.4, uranus: 1.2, mercury: 0.6 },
  confidence: { sun: 3.0, mars: 2.2, jupiter: 1.6, saturn: 0.8, pluto: 0.6 },
  selfCriticism: { saturn: 2.6, mercury: 1.4, moon: 0.8, chiron: 1.4, pluto: 0.6 },
  ambition: { saturn: 2.2, mars: 2.0, sun: 1.6, pluto: 1.2, jupiter: 1.0 },
  discipline: { saturn: 3.0, mars: 1.2, mercury: 0.8, sun: 0.8, pluto: 0.6 },
  patience: { saturn: 2.4, moon: 1.2, venus: 1.0, mars: 0.8, uranus: 0.5 },
  impulsivity: { mars: 2.8, uranus: 1.8, sun: 0.8, mercury: 0.8, jupiter: 1.0 },
  adaptability: { mercury: 2.2, uranus: 1.4, moon: 1.0, mars: 0.6, jupiter: 0.8 },
  creativity: { venus: 2.0, neptune: 1.8, sun: 1.4, uranus: 1.4, moon: 1.0, mercury: 0.8 },
  romanticism: { venus: 3.0, neptune: 2.0, moon: 1.4, pluto: 0.6, jupiter: 0.6 },
  nurturance: { moon: 3.0, venus: 1.6, chiron: 1.2, jupiter: 0.8, mars: 0.4 },
  intensityDepth: { pluto: 2.6, moon: 1.8, mars: 1.4, venus: 0.8, saturn: 0.6 },
  needForControl: { pluto: 2.2, saturn: 1.8, mars: 1.2, sun: 0.8, uranus: 0.4 },
  idealism: { neptune: 2.6, jupiter: 2.2, venus: 1.0, moon: 0.6, uranus: 0.6 },
  resilience: { mars: 2.0, saturn: 1.6, sun: 1.4, jupiter: 1.2, pluto: 1.0, moon: 0.6 },
  playfulness: { jupiter: 2.2, mercury: 1.6, venus: 1.2, uranus: 1.0, sun: 0.8, moon: 0.6 },
};

// ---------------------------------------------------------------------------
// ASPECT RULES — psychological interactions between planets.
// hard = square/opposition, soft = trine/sextile, conj = conjunction.
// Each rule lists dimension deltas applied scaled by (strength × planet weights).
// ---------------------------------------------------------------------------

export interface AspectRuleDelta {
  dim: Dimension;
  /** Delta applied for the hard expression of this pair. Soft inverts sign. */
  hardDelta: number;
  /** Optional different delta for the soft expression (defaults to -hardDelta). */
  softDelta?: number;
  /** Conjunction behaves like a fusion: use this delta (can be non-inverted). */
  conjDelta?: number;
}

/** Shorthand: both keys sorted alphabetically. */
const P = (a: string, b: string): string => [a, b].sort().join("|");

export const ASPECT_RULES: Record<string, AspectRuleDelta[]> = {
  // Moon × personal/social planets — emotional wiring
  [P("moon", "saturn")]: [
    { dim: "emotionalControl", hardDelta: 16, softDelta: 6, conjDelta: 10 },
    { dim: "selfCriticism", hardDelta: 14, softDelta: 4, conjDelta: 8 },
    { dim: "vulnerabilityOpenness", hardDelta: -13, softDelta: 5 },
    { dim: "resilience", hardDelta: -8, softDelta: 8 },
    { dim: "attachmentNeed", hardDelta: -6, softDelta: 3 },
  ],
  [P("moon", "pluto")]: [
    { dim: "intensityDepth", hardDelta: 16, softDelta: 8, conjDelta: 18 },
    { dim: "jealousyRisk", hardDelta: 12, softDelta: 4, conjDelta: 10 },
    { dim: "emotionalSensitivity", hardDelta: 10, softDelta: 6, conjDelta: 10 },
    { dim: "trustCaution", hardDelta: 9, softDelta: 2 },
  ],
  [P("moon", "uranus")]: [
    { dim: "independence", hardDelta: 12, softDelta: 7, conjDelta: 10 },
    { dim: "attachmentNeed", hardDelta: -10, softDelta: -4 },
    { dim: "emotionalSensitivity", hardDelta: 8, softDelta: 4 },
    { dim: "adaptability", hardDelta: 8, softDelta: 6, conjDelta: 6 },
  ],
  [P("moon", "neptune")]: [
    { dim: "emotionalSensitivity", hardDelta: 13, softDelta: 9, conjDelta: 12 },
    { dim: "intuition", hardDelta: 10, softDelta: 10, conjDelta: 11 },
    { dim: "idealism", hardDelta: 8, softDelta: 7, conjDelta: 8 },
    { dim: "vulnerabilityOpenness", hardDelta: 7, softDelta: 6 },
  ],
  [P("moon", "mars")]: [
    { dim: "impulsivity", hardDelta: 12, softDelta: 6, conjDelta: 12 },
    { dim: "communicationDirectness", hardDelta: 9, softDelta: 5 },
    { dim: "emotionalControl", hardDelta: -10, softDelta: 4 },
    { dim: "intensityDepth", hardDelta: 7, softDelta: 4 },
  ],
  [P("moon", "venus")]: [
    { dim: "romanticism", hardDelta: 6, softDelta: 12, conjDelta: 13 },
    { dim: "nurturance", hardDelta: 8, softDelta: 10, conjDelta: 10 },
    { dim: "attachmentNeed", hardDelta: 9, softDelta: 8, conjDelta: 9 },
  ],
  [P("moon", "mercury")]: [
    { dim: "communicationDirectness", hardDelta: 6, softDelta: 8 },
    { dim: "vulnerabilityOpenness", hardDelta: 5, softDelta: 9, conjDelta: 9 },
    { dim: "overthinking", hardDelta: 7, softDelta: 3 },
  ],
  [P("moon", "jupiter")]: [
    { dim: "resilience", hardDelta: 5, softDelta: 11, conjDelta: 10 },
    { dim: "expressiveness", hardDelta: 6, softDelta: 8 },
    { dim: "playfulness", hardDelta: 5, softDelta: 9, conjDelta: 8 },
  ],
  [P("moon", "chiron")]: [
    { dim: "emotionalSensitivity", hardDelta: 13, softDelta: 6, conjDelta: 12 },
    { dim: "selfCriticism", hardDelta: 11, softDelta: 3 },
    { dim: "nurturance", hardDelta: 6, softDelta: 8, conjDelta: 7 },
  ],
  // Sun × planets — identity wiring
  [P("sun", "saturn")]: [
    { dim: "confidence", hardDelta: -12, softDelta: 7, conjDelta: 4 },
    { dim: "discipline", hardDelta: 11, softDelta: 10, conjDelta: 11 },
    { dim: "selfCriticism", hardDelta: 10, softDelta: 3 },
    { dim: "ambition", hardDelta: 8, softDelta: 8, conjDelta: 8 },
  ],
  [P("sun", "pluto")]: [
    { dim: "intensityDepth", hardDelta: 13, softDelta: 7, conjDelta: 15 },
    { dim: "needForControl", hardDelta: 11, softDelta: 5, conjDelta: 10 },
    { dim: "confidence", hardDelta: 6, softDelta: 5, conjDelta: 6 },
  ],
  [P("sun", "uranus")]: [
    { dim: "independence", hardDelta: 12, softDelta: 9, conjDelta: 12 },
    { dim: "adaptability", hardDelta: 7, softDelta: 7, conjDelta: 7 },
    { dim: "expressiveness", hardDelta: 5, softDelta: 4 },
  ],
  [P("sun", "neptune")]: [
    { dim: "idealism", hardDelta: 10, softDelta: 10, conjDelta: 11 },
    { dim: "creativity", hardDelta: 7, softDelta: 9, conjDelta: 9 },
    { dim: "confidence", hardDelta: -5, softDelta: 2 },
    { dim: "intuition", hardDelta: 6, softDelta: 7, conjDelta: 7 },
  ],
  [P("sun", "mars")]: [
    { dim: "confidence", hardDelta: 9, softDelta: 10, conjDelta: 12 },
    { dim: "impulsivity", hardDelta: 10, softDelta: 6, conjDelta: 9 },
    { dim: "ambition", hardDelta: 8, softDelta: 8, conjDelta: 8 },
    { dim: "communicationDirectness", hardDelta: 7, softDelta: 4 },
  ],
  [P("sun", "jupiter")]: [
    { dim: "confidence", hardDelta: 6, softDelta: 10, conjDelta: 10 },
    { dim: "resilience", hardDelta: 5, softDelta: 9, conjDelta: 8 },
    { dim: "playfulness", hardDelta: 6, softDelta: 8, conjDelta: 7 },
    { dim: "idealism", hardDelta: 5, softDelta: 7, conjDelta: 6 },
  ],
  [P("sun", "mercury")]: [
    { dim: "communicationDirectness", hardDelta: 5, softDelta: 6, conjDelta: 7 },
    { dim: "expressiveness", hardDelta: 5, softDelta: 6, conjDelta: 6 },
  ],
  [P("sun", "venus")]: [
    { dim: "romanticism", hardDelta: 5, softDelta: 8, conjDelta: 9 },
    { dim: "playfulness", hardDelta: 4, softDelta: 6, conjDelta: 6 },
    { dim: "expressiveness", hardDelta: 4, softDelta: 5, conjDelta: 5 },
  ],
  [P("sun", "chiron")]: [
    { dim: "selfCriticism", hardDelta: 12, softDelta: 4, conjDelta: 10 },
    { dim: "confidence", hardDelta: -9, softDelta: 3, conjDelta: -3 },
    { dim: "intuition", hardDelta: 5, softDelta: 4 },
  ],
  // Venus × planets — love wiring
  [P("venus", "saturn")]: [
    { dim: "trustCaution", hardDelta: 12, softDelta: 5, conjDelta: 8 },
    { dim: "romanticism", hardDelta: -10, softDelta: 4, conjDelta: 2 },
    { dim: "attachmentNeed", hardDelta: 8, softDelta: 4 },
    { dim: "vulnerabilityOpenness", hardDelta: -9, softDelta: 3 },
  ],
  [P("venus", "pluto")]: [
    { dim: "intensityDepth", hardDelta: 14, softDelta: 7, conjDelta: 16 },
    { dim: "jealousyRisk", hardDelta: 12, softDelta: 5, conjDelta: 11 },
    { dim: "romanticism", hardDelta: 7, softDelta: 6, conjDelta: 8 },
  ],
  [P("venus", "uranus")]: [
    { dim: "independence", hardDelta: 11, softDelta: 7, conjDelta: 9 },
    { dim: "attachmentNeed", hardDelta: -9, softDelta: -3 },
    { dim: "playfulness", hardDelta: 6, softDelta: 7, conjDelta: 6 },
  ],
  [P("venus", "neptune")]: [
    { dim: "idealism", hardDelta: 12, softDelta: 10, conjDelta: 13 },
    { dim: "romanticism", hardDelta: 10, softDelta: 12, conjDelta: 13 },
    { dim: "creativity", hardDelta: 7, softDelta: 8, conjDelta: 8 },
  ],
  [P("venus", "mars")]: [
    { dim: "impulsivity", hardDelta: 8, softDelta: 5, conjDelta: 9 },
    { dim: "intensityDepth", hardDelta: 7, softDelta: 5, conjDelta: 7 },
    { dim: "playfulness", hardDelta: 5, softDelta: 6, conjDelta: 6 },
  ],
  [P("venus", "jupiter")]: [
    { dim: "romanticism", hardDelta: 6, softDelta: 10, conjDelta: 9 },
    { dim: "socialEnergy", hardDelta: 6, softDelta: 9, conjDelta: 8 },
    { dim: "idealism", hardDelta: 5, softDelta: 7, conjDelta: 6 },
  ],
  // Mercury × planets — mind wiring
  [P("mercury", "saturn")]: [
    { dim: "analyticalThinking", hardDelta: 9, softDelta: 10, conjDelta: 10 },
    { dim: "overthinking", hardDelta: 10, softDelta: 4, conjDelta: 6 },
    { dim: "communicationDirectness", hardDelta: -6, softDelta: 4 },
  ],
  [P("mercury", "pluto")]: [
    { dim: "intensityDepth", hardDelta: 10, softDelta: 5, conjDelta: 11 },
    { dim: "overthinking", hardDelta: 11, softDelta: 5, conjDelta: 8 },
    { dim: "analyticalThinking", hardDelta: 8, softDelta: 7, conjDelta: 8 },
    { dim: "trustCaution", hardDelta: 7, softDelta: 3 },
  ],
  [P("mercury", "uranus")]: [
    { dim: "adaptability", hardDelta: 9, softDelta: 9, conjDelta: 9 },
    { dim: "creativity", hardDelta: 7, softDelta: 8, conjDelta: 8 },
    { dim: "communicationDirectness", hardDelta: 6, softDelta: 5 },
  ],
  [P("mercury", "neptune")]: [
    { dim: "intuition", hardDelta: 9, softDelta: 10, conjDelta: 10 },
    { dim: "idealism", hardDelta: 7, softDelta: 7, conjDelta: 7 },
    { dim: "analyticalThinking", hardDelta: -6, softDelta: 2 },
  ],
  [P("mercury", "mars")]: [
    { dim: "communicationDirectness", hardDelta: 12, softDelta: 7, conjDelta: 11 },
    { dim: "impulsivity", hardDelta: 8, softDelta: 5, conjDelta: 7 },
  ],
  [P("mercury", "jupiter")]: [
    { dim: "playfulness", hardDelta: 6, softDelta: 9, conjDelta: 8 },
    { dim: "socialEnergy", hardDelta: 5, softDelta: 7, conjDelta: 6 },
    { dim: "idealism", hardDelta: 4, softDelta: 6, conjDelta: 5 },
  ],
  // Mars × outer — drive wiring
  [P("mars", "saturn")]: [
    { dim: "discipline", hardDelta: 10, softDelta: 11, conjDelta: 10 },
    { dim: "impulsivity", hardDelta: -8, softDelta: -2 },
    { dim: "patience", hardDelta: 7, softDelta: 9, conjDelta: 8 },
    { dim: "resilience", hardDelta: 5, softDelta: 8, conjDelta: 7 },
  ],
  [P("mars", "pluto")]: [
    { dim: "intensityDepth", hardDelta: 12, softDelta: 6, conjDelta: 14 },
    { dim: "needForControl", hardDelta: 10, softDelta: 5, conjDelta: 9 },
    { dim: "ambition", hardDelta: 8, softDelta: 7, conjDelta: 8 },
  ],
  [P("mars", "uranus")]: [
    { dim: "impulsivity", hardDelta: 12, softDelta: 8, conjDelta: 12 },
    { dim: "adaptability", hardDelta: 7, softDelta: 7, conjDelta: 7 },
    { dim: "patience", hardDelta: -8, softDelta: -4 },
  ],
  [P("mars", "neptune")]: [
    { dim: "idealism", hardDelta: 7, softDelta: 7, conjDelta: 7 },
    { dim: "impulsivity", hardDelta: -4, softDelta: 2 },
    { dim: "creativity", hardDelta: 5, softDelta: 6, conjDelta: 6 },
  ],
  [P("mars", "jupiter")]: [
    { dim: "confidence", hardDelta: 5, softDelta: 8, conjDelta: 7 },
    { dim: "ambition", hardDelta: 6, softDelta: 8, conjDelta: 7 },
    { dim: "impulsivity", hardDelta: 5, softDelta: 5, conjDelta: 5 },
  ],
  // Venus–Saturn-adjacent relational echoes
  [P("venus", "chiron")]: [
    { dim: "trustCaution", hardDelta: 10, softDelta: 4, conjDelta: 8 },
    { dim: "selfCriticism", hardDelta: 9, softDelta: 3 },
    { dim: "romanticism", hardDelta: -5, softDelta: 4 },
  ],
  [P("saturn", "pluto")]: [
    { dim: "needForControl", hardDelta: 8, softDelta: 4, conjDelta: 9 },
    { dim: "discipline", hardDelta: 6, softDelta: 6, conjDelta: 6 },
  ],
  [P("saturn", "chiron")]: [
    { dim: "selfCriticism", hardDelta: 10, softDelta: 4, conjDelta: 9 },
    { dim: "resilience", hardDelta: -5, softDelta: 5 },
  ],
  [P("uranus", "pluto")]: [
    { dim: "independence", hardDelta: 5, softDelta: 3, conjDelta: 5 },
  ],
  [P("neptune", "pluto")]: [
    { dim: "intensityDepth", hardDelta: 4, softDelta: 3, conjDelta: 4 },
  ],
  [P("jupiter", "saturn")]: [
    { dim: "patience", hardDelta: 5, softDelta: 6, conjDelta: 5 },
  ],
  [P("jupiter", "chiron")]: [
    { dim: "resilience", hardDelta: 4, softDelta: 7, conjDelta: 6 },
  ],
};

// ---------------------------------------------------------------------------
// HOUSE RULES — planets in houses feed life-area psychology.
// ---------------------------------------------------------------------------

export const HOUSE_RULES: Record<number, Partial<Record<Dimension, number>>> = {
  1: { confidence: 5, expressiveness: 5, independence: 4, impulsivity: 2 },
  2: { patience: 4, discipline: 3, trustCaution: 3, attachmentNeed: 2 },
  3: { socialEnergy: 3, adaptability: 4, analyticalThinking: 3, playfulness: 2 },
  4: { attachmentNeed: 4, emotionalSensitivity: 4, nurturance: 3, vulnerabilityOpenness: 2 },
  5: { creativity: 5, playfulness: 4, romanticism: 4, expressiveness: 3 },
  6: { discipline: 4, selfCriticism: 4, patience: 2, analyticalThinking: 2 },
  7: { attachmentNeed: 5, socialEnergy: 3, romanticism: 3, socialSelectivity: 2 },
  8: { intensityDepth: 6, trustCaution: 5, jealousyRisk: 4, needForControl: 3, emotionalSensitivity: 3 },
  9: { idealism: 5, independence: 4, adaptability: 3, socialEnergy: 2 },
  10: { ambition: 6, discipline: 3, confidence: 3, needForControl: 2 },
  11: { socialEnergy: 4, adaptability: 3, idealism: 3, independence: 2 },
  12: { emotionalSensitivity: 4, intuition: 4, vulnerabilityOpenness: -3, socialEnergy: -3, intensityDepth: 3 },
};

/** Houses considered emotionally "deep" (used by the emotional-world prose). */
export const DEEP_HOUSES = [4, 8, 12];

/** Houses considered relational. */
export const RELATIONAL_HOUSES = [5, 7, 8];

/** Angular houses. */
export const ANGULAR_HOUSES = [1, 4, 7, 10];

/** Domain label per house — used in prose when citing placements. */
export const HOUSE_DOMAIN: Record<number, string> = {
  1: "identity and how you carry yourself",
  2: "money, self-worth, and what makes you feel secure",
  3: "communication, learning, and everyday thinking",
  4: "home, family, and your private emotional base",
  5: "romance, creativity, and self-expression",
  6: "work, routines, and health",
  7: "partnerships and one-on-one relationships",
  8: "intimacy, trust, and shared vulnerability",
  9: "meaning, beliefs, and freedom",
  10: "career, reputation, and long-term goals",
  11: "friendships, community, and the future you want",
  12: "your private inner world and subconscious patterns",
};

/** Chart ruler planet for each rising sign (traditional rulership). */
export const SIGN_RULER: Record<SignId, string> = {
  aries: "mars",
  taurus: "venus",
  gemini: "mercury",
  cancer: "moon",
  leo: "sun",
  virgo: "mercury",
  libra: "venus",
  scorpio: "pluto",
  sagittarius: "jupiter",
  capricorn: "saturn",
  aquarius: "uranus",
  pisces: "neptune",
};

// Element psychology — applied by weighted share of the chart.
export const ELEMENT_RULES: Record<string, Partial<Record<Dimension, number>>> = {
  fire: { confidence: 10, impulsivity: 9, expressiveness: 9, patience: -6, resilience: 7, playfulness: 5 },
  earth: { discipline: 10, patience: 9, impulsivity: -7, adaptability: -5, trustCaution: 4 },
  air: { socialEnergy: 9, adaptability: 8, analyticalThinking: 7, emotionalSensitivity: -6, overthinking: 5 },
  water: { emotionalSensitivity: 12, intuition: 9, intensityDepth: 7, vulnerabilityOpenness: 4, emotionalControl: -5 },
};

// Modality psychology — applied by weighted share.
export const MODALITY_RULES: Record<string, Partial<Record<Dimension, number>>> = {
  cardinal: { impulsivity: 7, ambition: 6, independence: 5, patience: -4 },
  fixed: { patience: 8, discipline: 6, adaptability: -9, intensityDepth: 5, jealousyRisk: 4 },
  mutable: { adaptability: 9, impulsivity: 4, discipline: -6, overthinking: 4 },
};
