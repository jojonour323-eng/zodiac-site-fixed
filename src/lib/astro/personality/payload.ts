// ===========================================================================
// PAYLOAD — serializable personality results attached to API responses
// ===========================================================================

import type { NatalApiResponse, SynastryApiResponse } from "../types";
import type { ReadingSection } from "../readingEngine";
import { analyzeChartFacts } from "./facts";
import { buildPersonalityProfile } from "./model";
import { computeRings, type RingResult } from "./rings";
import { buildTraitLines, type TraitLine } from "./traitLines";
import { makeVoice } from "./deep/voice";
import { selectArchetype, type ArchetypeResult } from "./archetype";
import { buildHomePortrait, type HomePortrait } from "./home";
import { buildDeepFullReading } from "./deep/reading";
import { buildSoulmateProfile, type SoulmateProfile } from "./soulmate";
import {
  buildCompatibilityAnalysis,
  type CompatAnalysis,
} from "./compat";
import { makeRng, type DimensionScore } from "./core";

export interface PersonalityPayload {
  rings: RingResult[];
  /** Detailed one-trait-per-line bullets (site-wide trait list engine). */
  traitLines: TraitLine[];
  archetype: ArchetypeResult;
  home: HomePortrait;
  fullReading: { archetypeLine: string; intro: string; sections: ReadingSection[] };
  soulmate: SoulmateProfile;
  /** Raw dimension scores (for consistency checks + kink secondary context). */
  scores: DimensionScore[];
}

export function buildPersonalityPayload(
  natal: NatalApiResponse,
  gender?: "male" | "female" | null
): PersonalityPayload {
  const facts = analyzeChartFacts(natal);
  const profile = buildPersonalityProfile(facts);
  const rng = makeRng(facts.seed + "|rings");
  // Trait lines are authored neutral-plural; transform once, here, so every
  // consumer (Home tab etc.) can render them directly.
  const voice = makeVoice(gender ?? null);
  const traitLines: TraitLine[] = buildTraitLines(profile, 10).map((t) => ({
    ...t,
    line: voice.t(t.line),
  }));
  return {
    rings: computeRings(profile.scores, rng, facts),
    traitLines,
    archetype: selectArchetype(profile, gender),
    home: buildHomePortrait(profile, gender),
    fullReading: (() => {
      const r = buildDeepFullReading(profile, gender);
      return { archetypeLine: r.archetypeLine, intro: r.intro, sections: r.sections };
    })(),
    soulmate: buildSoulmateProfile(profile, gender),
    scores: profile.scores,
  };
}

export function buildCompatPayload(
  raw: SynastryApiResponse,
  genderA?: "male" | "female" | null,
  genderB?: "male" | "female" | null
): CompatAnalysis {
  const factsA = analyzeChartFacts(raw.natal.person_a);
  const factsB = analyzeChartFacts(raw.natal.person_b);
  const profileA = buildPersonalityProfile(factsA);
  const profileB = buildPersonalityProfile(factsB);
  return buildCompatibilityAnalysis(profileA, profileB, raw, genderA, genderB);
}
