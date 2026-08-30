// ===========================================================================
// FLAG READING ENGINE — per-flag, fully custom content
// ---------------------------------------------------------------------------
// Every flag gets its own custom-written sections from personality/
// flagContent.ts — authored for that exact trait and its real placements.
// No bullet is ever shared between two different traits: each section comes
// from the flag's own registry entry. The only non-registry content is the
// "Where this comes from" section, which reads THIS person's actual chart
// (planet, sign, house) — different charts, different text.
// ===========================================================================

import type { NatalProfile, SignId } from "./types";
import { SIGN_META } from "./signs";
import type { Flag } from "./redflags";
import { placementTag } from "./readingHelpers";
import { getFlagCopy, makeFlagCtx, type FlagCtx } from "./personality/flagContent";
import type { ExplanationSection } from "./deepReading";

export type FlagType = "red" | "growth" | "quirk" | "green";

export interface FlagReading {
  headline: string;
  summary: string;
  sections: ExplanationSection[];
  placementTags: { icon: string; label: string }[];
}

export function generateFlagReading(
  profile: NatalProfile,
  flag: Flag,
  flagType: FlagType,
  category: string
): FlagReading {
  void category;
  const headline = flag.title;
  const copy = getFlagCopy(flag.title, flag.sources);

  const sections: ExplanationSection[] = [];
  const tags: { icon: string; label: string }[] = [];

  // Source placements for tagging
  const sourcePlanets = extractSourcePlanets(flag.sources, profile);
  for (const sp of sourcePlanets) {
    tags.push(placementTag(sp.planetId, sp.signId));
  }

  // 1. What's actually happening — custom mechanics for THIS trait
  if (copy) {
    sections.push({
      heading: "What's actually happening",
      body: "",
      bullets: copy.happening(ctxFor(profile)),
    });

    // 2. Where this comes from — the person's REAL placements, anchored to
    //    THIS trait so two flags sharing a placement never share the sentence.
    const sourceBullets = generateSourceBullets(profile, flag.sources, flag.title);
    if (sourceBullets.length > 0) {
      sections.push({
        heading: "Where this comes from in your chart",
        body: "",
        bullets: sourceBullets,
      });
    }

    // 3. How it shows up — one concrete scene, written for this trait
    sections.push({
      heading: "How it shows up in real life",
      body: "",
      bullets: [copy.example(ctxFor(profile))],
    });

    // 4. The shadow / risk / catch — custom per trait (every type gets one,
    //    even green flags: strength overplayed is a real risk)
    const shadowHeading =
      flagType === "red" ? "The shadow" :
      flagType === "green" ? "The catch" : "The risk";
    sections.push({
      heading: shadowHeading,
      body: "",
      bullets: copy.shadow(ctxFor(profile)),
    });

    // 5. The bright side / why it's a strength
    sections.push({
      heading: flagType === "green" ? "Why this is a strength" : "The bright side",
      body: "",
      bullets: copy.bright(ctxFor(profile)),
    });

    // 6. How to work with it — custom moves for this trait
    sections.push({
      heading: flagType === "green" ? "How to make the most of it" : "How to work with it",
      body: "",
      bullets: copy.work(ctxFor(profile)),
    });

    // 7. Takeaway — custom per trait
    sections.push({
      heading: "Takeaway",
      body: "",
      bullets: copy.takeaway(ctxFor(profile)),
    });
  } else {
    // Registry miss (should not happen — tests guard this). Fall back to the
    // flag's own card text + real placements so nothing generic renders.
    sections.push({
      heading: "What's actually happening",
      body: flag.detail,
      bullets: [],
    });
    const sourceBullets = generateSourceBullets(profile, flag.sources, flag.title);
    if (sourceBullets.length > 0) {
      sections.push({
        heading: "Where this comes from in your chart",
        body: "",
        bullets: sourceBullets,
      });
    }
  }

  return { headline, summary: "", sections, placementTags: tags };
}

// One shared ctx per profile is enough — the registry functions only read.
const ctxCache = new WeakMap<NatalProfile, FlagCtx>();
function ctxFor(profile: NatalProfile): FlagCtx {
  let ctx = ctxCache.get(profile);
  if (!ctx) {
    ctx = makeFlagCtx(profile);
    ctxCache.set(profile, ctx);
  }
  return ctx;
}

interface SourcePlanet {
  planetId: string;
  signId?: SignId;
  house?: number;
}

function extractSourcePlanets(sources: string[], profile: NatalProfile): SourcePlanet[] {
  const result: SourcePlanet[] = [];
  for (const src of sources || []) {
    const lower = src.toLowerCase();
    const match = lower.match(/^(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|north node|chiron|lilith|rising|ascendant)/);
    if (!match) continue;
    const planetName = match[1];
    const planetId = planetName === "rising" || planetName === "ascendant" ? "rising" : planetName.replace(" ", "_");

    if (planetId === "sun") {
      result.push({ planetId: "sun", signId: profile.sun.signId, house: profile.sun.house });
    } else if (planetId === "moon") {
      result.push({ planetId: "moon", signId: profile.moon.signId, house: profile.moon.house });
    } else if (planetId === "rising" || planetId === "ascendant") {
      result.push({ planetId: "rising", signId: profile.ascendant.signId });
    } else {
      const planet = profile.planets.find((p) => p.id === planetId);
      if (planet) {
        result.push({ planetId: planet.id, signId: planet.signId, house: planet.house });
      }
    }
  }
  return result;
}

function generateSourceBullets(profile: NatalProfile, sources: string[], flagTitle: string): string[] {
  // Every bullet ends anchored to THIS flag, so two flags drawing on the
  // same placement (e.g. Venus in Taurus behind both "Loyal Lover" and a
  // Taurus-Venus quirk) still get different sentences.
  const tail = `. That's the engine under "${flagTitle}".`;

  if (!sources || sources.length === 0) {
    return [`This pattern comes from the overall shape of your chart, not one single placement — it's how your different parts interact${tail}`];
  }

  const bullets: string[] = [];
  for (const src of sources) {
    const lower = src.toLowerCase();
    const match = lower.match(/^(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|north node|chiron|lilith|rising|ascendant)/);
    if (!match) {
      bullets.push(`${src} — one of the chart signals driving this pattern${tail}`);
      continue;
    }

    const planetName = match[1];
    const planetId = planetName === "rising" || planetName === "ascendant" ? null : planetName.replace(" ", "_");

    if (planetId === "sun") {
      const signName = SIGN_META[profile.sun.signId].name;
      bullets.push(`${src}. Your Sun is in ${signName} in house ${profile.sun.house} — the sign says HOW this pattern expresses, the house says WHERE it shows up${tail}`);
    } else if (planetId === "moon") {
      const signName = SIGN_META[profile.moon.signId].name;
      bullets.push(`${src}. Your Moon is in ${signName} in house ${profile.moon.house} — that's the placement driving this pattern${tail}`);
    } else if (planetName === "rising" || planetName === "ascendant") {
      const ascSign = profile.ascendant.signId;
      bullets.push(`${src}. Your Rising sign is ${SIGN_META[ascSign].name}, which shapes how this pattern looks from the outside — the version people meet first${tail}`);
    } else {
      const planet = profile.planets.find((p) => p.id === planetId);
      if (planet) {
        const signName = SIGN_META[planet.signId].name;
        const retroNote = planet.retrograde && !lower.includes("retrograde") ? " (retrograde, which turns it inward for you)" : "";
        bullets.push(`${src}${retroNote}. It sits in ${signName} in house ${planet.house} — the sign colors HOW, the house shows WHERE${tail}`);
      } else {
        bullets.push(`${src} — one of the chart signals driving this pattern${tail}`);
      }
    }
  }
  return bullets;
}
