// ===========================================================================
// PROSE — shared sentence builders for natural, varied writing
// ---------------------------------------------------------------------------
// Central place where dimension levels become human sentences, so every tab
// describes the same person the same way. All generators use these.
// ===========================================================================

import type { Dimension, DimensionScore, Rng } from "./core";
import { getDim } from "./core";
import type { PersonalityProfile } from "./model";
import { prettyPlanet } from "./model";
import type { ChartFacts } from "./facts";

export interface Ctx {
  profile: PersonalityProfile;
  rng: Rng;
}

export const v = (p: PersonalityProfile, d: Dimension): number => getDim(p.scores, d).value;

export const isHigh = (p: PersonalityProfile, d: Dimension, t = 62) => v(p, d) >= t;
export const isLow = (p: PersonalityProfile, d: Dimension, t = 42) => v(p, d) <= t;

/** Top N most distinctive dimensions (|value-50| desc, min |Δ| 8). */
export function topDims(p: PersonalityProfile, n = 4): DimensionScore[] {
  return [...p.scores]
    .sort((a, b) => Math.abs(b.value - 50) - Math.abs(a.value - 50))
    .filter((s) => Math.abs(s.value - 50) >= 8)
    .slice(0, n);
}

/** Human phrase for a dimension at its current level. */
export function level(p: PersonalityProfile, d: Dimension): "very high" | "high" | "moderate" | "low" | "very low" {
  const x = v(p, d);
  if (x >= 80) return "very high";
  if (x >= 65) return "high";
  if (x >= 42) return "moderate";
  if (x >= 28) return "low";
  return "very low";
}

export function joinAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** Best citation string for a dimension: its strongest driver. */
export function citeDim(p: PersonalityProfile, d: Dimension): string {
  const s = getDim(p.scores, d);
  const top = s.drivers[0];
  return top ? top.source : "";
}

/** "Moon in Scorpio, Pluto in the 8th"-style compact citation list. */
export function citeDims(p: PersonalityProfile, dims: Dimension[], max = 2): string {
  const cites: string[] = [];
  for (const d of dims) {
    const c = citeDim(p, d);
    if (c && !cites.includes(c)) cites.push(c);
    if (cites.length >= max) break;
  }
  return cites.join(", ");
}

/** Sign name of a planet from facts. */
export function signOf(f: ChartFacts, planet: string): string | undefined {
  const p = f.planets.find((x) => x.id === planet);
  return p ? `${prettyPlanet(planet)} in ${signNameOf(f, planet)}` : undefined;
}

export function signNameOf(f: ChartFacts, planet: string): string {
  const p = f.planets.find((x) => x.id === planet);
  return p ? p.sign_id.charAt(0).toUpperCase() + p.sign_id.slice(1) : "";
}

/** Capitalize first letter. */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** They/them-safe subject handling: returns subject pronoun set. */
export interface Pronouns {
  they: string;
  them: string;
  their: string;
  theirs: string;
  themselves: string;
  are: string;
  verb: (present3rd: string, plural: string) => string;
}

export function pronounsFor(gender?: "male" | "female" | null): Pronouns {
  if (gender === "female") {
    return {
      they: "she", them: "her", their: "her", theirs: "hers", themselves: "herself",
      are: "is", verb: (s) => s,
    };
  }
  if (gender === "male") {
    return {
      they: "he", them: "him", their: "his", theirs: "his", themselves: "himself",
      are: "is", verb: (s) => s,
    };
  }
  return {
    they: "they", them: "them", their: "their", theirs: "theirs", themselves: "themselves",
    are: "are", verb: (s, p) => p,
  };
}

/**
 * Build prose from a set of candidate sentences conditioned on dimension
 * levels. Each candidate has a condition and 2+ variants; rng picks.
 */
export interface SentenceRule {
  when: (p: PersonalityProfile) => boolean;
  variants: ((c: Ctx) => string)[];
}

export function renderRules(rules: SentenceRule[], ctx: Ctx, max = 3): string[] {
  const out: string[] = [];
  for (const rule of rules) {
    if (!rule.when(ctx.profile)) continue;
    const picked = ctx.rng.pick(rule.variants);
    out.push(picked(ctx));
    if (out.length >= max) break;
  }
  return out;
}
