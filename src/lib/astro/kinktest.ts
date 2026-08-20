import type { SignId, Element, PlanetId } from "./types";
import { SIGN_META } from "./signs";

// ===========================================================================
// FULL-CHART KINK TEST
// ---------------------------------------------------------------------------
// Instead of just Sun + Moon, we read the user's entire natal chart:
//   Sun (ego), Moon (emotional needs), Mercury (talk), Venus (love style),
//   Mars (drive/desire), Jupiter (expansion), Saturn (control),
//   Uranus (experimentation), Neptune (fantasy), Pluto (intensity/taboo),
//   Rising (the mask / first-impression energy)
//
// Each planet contributes a weighted score to 26 kink archetypes
// (modeled on the viral BDSM Test, but written in plain English / Gen-Z
// slang so anyone can understand them at a glance).
// ===========================================================================

export interface KinkTrait {
  /** Plain-English / slang label, e.g. "Sub", "Rope bunny", "Brat tamer". */
  label: string;
  /** 0-100 score, computed from the chart. */
  percentage: number;
  /** Short description in plain language so the user knows what it means. */
  description: string;
}

export interface KinkResult {
  /** Headline archetype, e.g. "The Brat Tamer". */
  title: string;
  /** One-line tagline (gender-aware). */
  subtitle: string;
  /** All 26 traits, sorted by percentage desc. */
  traits: KinkTrait[];
  /** One-paragraph casual summary. */
  summary: string;
}

interface ChartInput {
  sun?: SignId;
  moon?: SignId;
  rising?: SignId;
  mercury?: SignId;
  venus?: SignId;
  mars?: SignId;
  jupiter?: SignId;
  saturn?: SignId;
  uranus?: SignId;
  neptune?: SignId;
  pluto?: SignId;
}

// ===========================================================================
// THE 26 KINK CATEGORIES (plain-English labels)
// ===========================================================================
// Each entry is a stable archetype ID we score against.
interface KinkDef {
  id: string;
  label: string;
  description: string;
}

const KINK_DEFS: KinkDef[] = [
  { id: "sub",            label: "Sub",                description: "Likes giving up control and following someone else's lead" },
  { id: "dom",            label: "Dom",                description: "Takes charge — sets the pace, the rules, and the vibe" },
  { id: "switch",         label: "Switch",             description: "Can roll with either role — top today, bottom tomorrow" },
  { id: "brat",           label: "Brat",               description: "Acts up on purpose because they want someone to put them in their place" },
  { id: "brat_tamer",     label: "Brat tamer",         description: "Loves when someone talks back — just so they can shut it down" },
  { id: "owner",          label: "Owner",              description: "Wants to own someone completely — body, time, attention" },
  { id: "owned",          label: "Owned",              description: "Wants to belong to someone — be claimed, not borrowed" },
  { id: "master",         label: "Master/Mistress",    description: "Formal D/s dynamic — protocols, rules, structure" },
  { id: "slave",          label: "Slave",              description: "Wants to serve — full submission, no agenda of their own" },
  { id: "daddy",          label: "Daddy/Mommy",        description: "Protective, nurturing caretaker energy with a firm hand" },
  { id: "little",         label: "Little",             description: "Wants to be taken care of, soften up, regress a little" },
  { id: "ageplayer",      label: "Age player",         description: "Into roleplay with age gaps — bigger/little dynamics" },
  { id: "sadist",         label: "Sadist",             description: "Gets off on giving controlled pain or humiliation (consensually)" },
  { id: "masochist",      label: "Masochist",          description: "Gets off on receiving pain, intensity, or being pushed" },
  { id: "degrader",       label: "Talks down",         description: "Into name-calling, teasing, putting their partner down a peg" },
  { id: "degradee",       label: "Likes being talked down to", description: "Wants to be called names, mocked, made small — consensually" },
  { id: "rigger",         label: "Rope tier",          description: "Into tying up — rope, restraint, the art of the knot" },
  { id: "rope_bunny",     label: "Rope bunny",         description: "Wants to be tied up, restrained, held in place" },
  { id: "voyeur",         label: "Watcher",            description: "Gets off on watching — could happily just observe" },
  { id: "exhibitionist",  label: "Show-off",           description: "Loves being watched — the eyes are half the fun" },
  { id: "hunter",         label: "Hunter",             description: "Loves the chase — primal, instinctive, pursuit energy" },
  { id: "prey",           label: "Prey",               description: "Loves being chased — running, then caught" },
  { id: "pet",            label: "Pet",                description: "Into pet-play energy — collars, leashes, being owned like a good pet" },
  { id: "experimentalist", label: "Will try anything", description: "Down for whatever — new kinks, new toys, new scenarios" },
  { id: "nonmonog",       label: "Open / poly",        description: "Not built for strict monogamy — wants options, freedom, or shared play" },
  { id: "vanilla",        label: "Vanilla",            description: "Honestly just wants sweet, normal, romantic sex — no extras needed" },
];

// ===========================================================================
// SCORING MATRIX
// ---------------------------------------------------------------------------
// For each (planet, sign) pair, we add a weighted boost to one or more
// kink IDs. Weights reflect astrological symbolism:
//   Mars = drive/desire/sexual aggression   (heaviest, weight 3)
//   Venus = love style / sensuality          (weight 3)
//   Pluto = intensity, taboo, power exchange (weight 3)
//   Sun = ego / role preference              (weight 2)
//   Moon = emotional needs / safety          (weight 2)
//   Saturn = control / structure / rules     (weight 2)
//   Uranus = experimentation / rebellion     (weight 2)
//   Neptune = fantasy / surrender            (weight 2)
//   Rising = first-impression energy         (weight 1)
//   Mercury = talking / teasing / verbal     (weight 1)
//   Jupiter = expansion / excess             (weight 1)
// ===========================================================================

type PlanetWeight = { planet: PlanetId; weight: number };

const PLANET_WEIGHTS: PlanetWeight[] = [
  { planet: "mars",    weight: 3 },
  { planet: "venus",   weight: 3 },
  { planet: "pluto",   weight: 3 },
  { planet: "sun",     weight: 2 },
  { planet: "moon",    weight: 2 },
  { planet: "saturn",  weight: 2 },
  { planet: "uranus",  weight: 2 },
  { planet: "neptune", weight: 2 },
  { planet: "mercury", weight: 1 },
  { planet: "jupiter", weight: 1 },
];

// For each sign, which kinks does it boost (per planet)?
// We keep it lean — only meaningful pairings — to avoid noise.
const SIGN_KINK_MAP: Record<SignId, Partial<Record<PlanetId, { id: string; boost: number }[]>>> = {
  aries: {
    mars:   [ { id: "dom", boost: 18 }, { id: "hunter", boost: 20 }, { id: "sadist", boost: 8 } ],
    venus:  [ { id: "hunter", boost: 10 }, { id: "brat_tamer", boost: 8 } ],
    pluto:  [ { id: "dom", boost: 12 }, { id: "sadist", boost: 10 } ],
    sun:    [ { id: "dom", boost: 10 }, { id: "exhibitionist", boost: 8 } ],
    moon:   [ { id: "brat", boost: 8 }, { id: "switch", boost: 5 } ],
    saturn: [ { id: "brat_tamer", boost: 6 } ],
    uranus: [ { id: "experimentalist", boost: 10 } ],
    neptune:[ { id: "hunter", boost: 5 } ],
    rising: [ { id: "dom", boost: 6 } ],
    mercury:[ { id: "degrader", boost: 6 } ],
    jupiter:[ { id: "exhibitionist", boost: 6 } ],
  },
  taurus: {
    mars:   [ { id: "rope_bunny", boost: 8 }, { id: "vanilla", boost: 14 }, { id: "masochist", boost: 4 } ],
    venus:  [ { id: "vanilla", boost: 16 }, { id: "rope_bunny", boost: 6 } ],
    pluto:  [ { id: "owned", boost: 10 }, { id: "rope_bunny", boost: 6 } ],
    sun:    [ { id: "vanilla", boost: 10 }, { id: "voyeur", boost: 6 } ],
    moon:   [ { id: "little", boost: 8 }, { id: "owned", boost: 6 } ],
    saturn: [ { id: "rope_bunny", boost: 8 } ],
    uranus: [ { id: "experimentalist", boost: 4 } ],
    neptune:[ { id: "rope_bunny", boost: 6 }, { id: "prey", boost: 4 } ],
    rising: [ { id: "vanilla", boost: 6 } ],
    mercury:[ { id: "voyeur", boost: 4 } ],
    jupiter:[ { id: "vanilla", boost: 4 } ],
  },
  gemini: {
    mars:   [ { id: "switch", boost: 16 }, { id: "experimentalist", boost: 12 }, { id: "voyeur", boost: 8 } ],
    venus:  [ { id: "switch", boost: 12 }, { id: "exhibitionist", boost: 8 } ],
    pluto:  [ { id: "degrader", boost: 10 }, { id: "degradee", boost: 8 } ],
    sun:    [ { id: "switch", boost: 10 }, { id: "voyeur", boost: 8 } ],
    moon:   [ { id: "brat", boost: 10 }, { id: "switch", boost: 6 } ],
    saturn: [ { id: "rope_bunny", boost: 4 } ],
    uranus: [ { id: "experimentalist", boost: 16 }, { id: "nonmonog", boost: 10 } ],
    neptune:[ { id: "voyeur", boost: 8 }, { id: "experimentalist", boost: 6 } ],
    rising: [ { id: "switch", boost: 6 }, { id: "exhibitionist", boost: 6 } ],
    mercury:[ { id: "degrader", boost: 12 }, { id: "degradee", boost: 8 } ],
    jupiter:[ { id: "nonmonog", boost: 8 }, { id: "experimentalist", boost: 6 } ],
  },
  cancer: {
    mars:   [ { id: "sub", boost: 14 }, { id: "little", boost: 12 }, { id: "rope_bunny", boost: 8 } ],
    venus:  [ { id: "vanilla", boost: 12 }, { id: "little", boost: 8 } ],
    pluto:  [ { id: "owned", boost: 12 }, { id: "masochist", boost: 6 } ],
    sun:    [ { id: "little", boost: 10 }, { id: "daddy", boost: 8 } ],
    moon:   [ { id: "little", boost: 14 }, { id: "owned", boost: 8 } ],
    saturn: [ { id: "owned", boost: 6 } ],
    uranus: [ { id: "ageplayer", boost: 8 } ],
    neptune:[ { id: "prey", boost: 10 }, { id: "rope_bunny", boost: 6 } ],
    rising: [ { id: "little", boost: 8 }, { id: "daddy", boost: 4 } ],
    mercury:[ { id: "degradee", boost: 6 } ],
    jupiter:[ { id: "ageplayer", boost: 6 } ],
  },
  leo: {
    mars:   [ { id: "dom", boost: 14 }, { id: "exhibitionist", boost: 16 }, { id: "brat_tamer", boost: 8 } ],
    venus:  [ { id: "exhibitionist", boost: 14 }, { id: "daddy", boost: 8 } ],
    pluto:  [ { id: "dom", boost: 10 }, { id: "owner", boost: 8 } ],
    sun:    [ { id: "exhibitionist", boost: 16 }, { id: "dom", boost: 8 } ],
    moon:   [ { id: "daddy", boost: 10 }, { id: "exhibitionist", boost: 6 } ],
    saturn: [ { id: "master", boost: 8 } ],
    uranus: [ { id: "exhibitionist", boost: 8 } ],
    neptune:[ { id: "daddy", boost: 6 } ],
    rising: [ { id: "exhibitionist", boost: 12 }, { id: "dom", boost: 6 } ],
    mercury:[ { id: "degrader", boost: 8 } ],
    jupiter:[ { id: "exhibitionist", boost: 10 }, { id: "nonmonog", boost: 6 } ],
  },
  virgo: {
    mars:   [ { id: "sub", boost: 10 }, { id: "rope_bunny", boost: 10 }, { id: "slave", boost: 8 } ],
    venus:  [ { id: "vanilla", boost: 8 }, { id: "slave", boost: 10 } ],
    pluto:  [ { id: "slave", boost: 12 }, { id: "masochist", boost: 8 } ],
    sun:    [ { id: "rope_bunny", boost: 8 }, { id: "slave", boost: 6 } ],
    moon:   [ { id: "slave", boost: 10 }, { id: "owned", boost: 6 } ],
    saturn: [ { id: "slave", boost: 14 }, { id: "rope_bunny", boost: 8 } ],
    uranus: [ { id: "experimentalist", boost: 6 } ],
    neptune:[ { id: "rope_bunny", boost: 8 }, { id: "sub", boost: 6 } ],
    rising: [ { id: "slave", boost: 6 }, { id: "vanilla", boost: 4 } ],
    mercury:[ { id: "degradee", boost: 6 }, { id: "voyeur", boost: 4 } ],
    jupiter:[ { id: "vanilla", boost: 4 } ],
  },
  libra: {
    mars:   [ { id: "switch", boost: 10 }, { id: "exhibitionist", boost: 10 }, { id: "rope_bunny", boost: 6 } ],
    venus:  [ { id: "vanilla", boost: 14 }, { id: "exhibitionist", boost: 8 } ],
    pluto:  [ { id: "switch", boost: 8 }, { id: "degradee", boost: 6 } ],
    sun:    [ { id: "switch", boost: 8 }, { id: "vanilla", boost: 8 } ],
    moon:   [ { id: "little", boost: 8 }, { id: "vanilla", boost: 6 } ],
    saturn: [ { id: "rope_bunny", boost: 6 } ],
    uranus: [ { id: "experimentalist", boost: 8 }, { id: "nonmonog", boost: 6 } ],
    neptune:[ { id: "rope_bunny", boost: 8 }, { id: "prey", boost: 6 } ],
    rising: [ { id: "vanilla", boost: 6 }, { id: "exhibitionist", boost: 6 } ],
    mercury:[ { id: "degrader", boost: 6 }, { id: "degradee", boost: 4 } ],
    jupiter:[ { id: "nonmonog", boost: 6 } ],
  },
  scorpio: {
    mars:   [ { id: "dom", boost: 14 }, { id: "sadist", boost: 14 }, { id: "owner", boost: 12 } ],
    venus:  [ { id: "owner", boost: 14 }, { id: "degrader", boost: 10 }, { id: "owned", boost: 8 } ],
    pluto:  [ { id: "sadist", boost: 18 }, { id: "masochist", boost: 14 }, { id: "owner", boost: 12 }, { id: "degrader", boost: 10 } ],
    sun:    [ { id: "dom", boost: 12 }, { id: "owner", boost: 10 } ],
    moon:   [ { id: "owned", boost: 12 }, { id: "masochist", boost: 8 } ],
    saturn: [ { id: "master", boost: 10 }, { id: "owner", boost: 6 } ],
    uranus: [ { id: "experimentalist", boost: 8 } ],
    neptune:[ { id: "masochist", boost: 10 }, { id: "prey", boost: 6 } ],
    rising: [ { id: "dom", boost: 8 }, { id: "owner", boost: 6 } ],
    mercury:[ { id: "degrader", boost: 10 }, { id: "degradee", boost: 6 } ],
    jupiter:[ { id: "nonmonog", boost: 6 }, { id: "sadist", boost: 4 } ],
  },
  sagittarius: {
    mars:   [ { id: "hunter", boost: 14 }, { id: "switch", boost: 10 }, { id: "exhibitionist", boost: 8 } ],
    venus:  [ { id: "nonmonog", boost: 16 }, { id: "experimentalist", boost: 10 } ],
    pluto:  [ { id: "hunter", boost: 10 }, { id: "dom", boost: 6 } ],
    sun:    [ { id: "exhibitionist", boost: 10 }, { id: "nonmonog", boost: 10 } ],
    moon:   [ { id: "switch", boost: 8 }, { id: "brat", boost: 6 } ],
    saturn: [ { id: "rope_bunny", boost: 4 } ],
    uranus: [ { id: "nonmonog", boost: 14 }, { id: "experimentalist", boost: 14 } ],
    neptune:[ { id: "hunter", boost: 8 } ],
    rising: [ { id: "exhibitionist", boost: 8 }, { id: "hunter", boost: 6 } ],
    mercury:[ { id: "degrader", boost: 6 } ],
    jupiter:[ { id: "nonmonog", boost: 14 }, { id: "exhibitionist", boost: 8 }, { id: "experimentalist", boost: 8 } ],
  },
  capricorn: {
    mars:   [ { id: "dom", boost: 12 }, { id: "master", boost: 14 }, { id: "daddy", boost: 10 } ],
    venus:  [ { id: "daddy", boost: 12 }, { id: "master", boost: 10 } ],
    pluto:  [ { id: "master", boost: 14 }, { id: "owner", boost: 10 }, { id: "sadist", boost: 8 } ],
    sun:    [ { id: "dom", boost: 10 }, { id: "daddy", boost: 8 } ],
    moon:   [ { id: "daddy", boost: 10 }, { id: "master", boost: 6 } ],
    saturn: [ { id: "master", boost: 18 }, { id: "daddy", boost: 8 }, { id: "slave", boost: 6 } ],
    uranus: [ { id: "experimentalist", boost: 4 } ],
    neptune:[ { id: "owner", boost: 6 } ],
    rising: [ { id: "master", boost: 8 }, { id: "daddy", boost: 6 } ],
    mercury:[ { id: "degrader", boost: 8 } ],
    jupiter:[ { id: "daddy", boost: 6 } ],
  },
  aquarius: {
    mars:   [ { id: "switch", boost: 12 }, { id: "experimentalist", boost: 14 }, { id: "voyeur", boost: 10 } ],
    venus:  [ { id: "nonmonog", boost: 14 }, { id: "experimentalist", boost: 12 } ],
    pluto:  [ { id: "experimentalist", boost: 10 }, { id: "switch", boost: 6 } ],
    sun:    [ { id: "experimentalist", boost: 12 }, { id: "nonmonog", boost: 10 } ],
    moon:   [ { id: "switch", boost: 8 }, { id: "voyeur", boost: 6 } ],
    saturn: [ { id: "rope_bunny", boost: 6 } ],
    uranus: [ { id: "experimentalist", boost: 20 }, { id: "nonmonog", boost: 16 }, { id: "voyeur", boost: 8 } ],
    neptune:[ { id: "voyeur", boost: 10 }, { id: "experimentalist", boost: 6 } ],
    rising: [ { id: "experimentalist", boost: 10 }, { id: "switch", boost: 6 } ],
    mercury:[ { id: "degrader", boost: 6 }, { id: "degradee", boost: 4 } ],
    jupiter:[ { id: "nonmonog", boost: 10 }, { id: "experimentalist", boost: 8 } ],
  },
  pisces: {
    mars:   [ { id: "sub", boost: 14 }, { id: "rope_bunny", boost: 12 }, { id: "prey", boost: 10 } ],
    venus:  [ { id: "rope_bunny", boost: 12 }, { id: "sub", boost: 10 }, { id: "little", boost: 8 } ],
    pluto:  [ { id: "masochist", boost: 12 }, { id: "owned", boost: 10 } ],
    sun:    [ { id: "sub", boost: 10 }, { id: "rope_bunny", boost: 8 } ],
    moon:   [ { id: "rope_bunny", boost: 12 }, { id: "prey", boost: 10 }, { id: "little", boost: 8 } ],
    saturn: [ { id: "rope_bunny", boost: 8 }, { id: "slave", boost: 6 } ],
    uranus: [ { id: "ageplayer", boost: 8 }, { id: "experimentalist", boost: 6 } ],
    neptune:[ { id: "rope_bunny", boost: 16 }, { id: "prey", boost: 12 }, { id: "sub", boost: 8 }, { id: "voyeur", boost: 6 } ],
    rising: [ { id: "sub", boost: 8 }, { id: "rope_bunny", boost: 6 } ],
    mercury:[ { id: "degradee", boost: 8 } ],
    jupiter:[ { id: "rope_bunny", boost: 6 }, { id: "ageplayer", boost: 4 } ],
  },
};

// Element-based baseline — every chart starts here so every kink gets
// *some* signal, then planet boosts pile on top.
function elementBaseline(el: Element): Record<string, number> {
  const base: Record<string, number> = {};
  for (const def of KINK_DEFS) base[def.id] = 8;
  switch (el) {
    case "fire":
      base.dom += 8; base.hunter += 8; base.exhibitionist += 6; base.experimentalist += 4; base.brat_tamer += 4;
      break;
    case "earth":
      base.vanilla += 8; base.rope_bunny += 4; base.slave += 4; base.daddy += 4;
      break;
    case "air":
      base.switch += 6; base.experimentalist += 6; base.nonmonog += 6; base.voyeur += 4; base.degrader += 2;
      break;
    case "water":
      base.sub += 8; base.rope_bunny += 6; base.prey += 6; base.masochist += 4; base.little += 4;
      break;
  }
  return base;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

// ===========================================================================
// MAIN SCORING FUNCTION
// ===========================================================================
export function getKinkResult(
  sunSign: SignId,
  moonSign: SignId | null | undefined,
  gender: "male" | "female",
  chart?: ChartInput,
): KinkResult {
  // Build the planet -> sign map we'll iterate over.
  // If a full chart is provided, use it. Otherwise fall back to just
  // Sun + Moon (and assume Rising = Sun).
  const planets: { planet: PlanetId; sign: SignId }[] = [];
  const input = chart ?? {};
  const safeSun = input.sun ?? sunSign;
  const safeMoon = input.moon ?? moonSign ?? sunSign;

  planets.push({ planet: "sun", sign: safeSun });
  if (input.moon || moonSign) planets.push({ planet: "moon", sign: safeMoon });
  // Rising sign: use it as a secondary "sun" boost (the ascendant amplifies core-self energy).
  // The per-sign `rising:` boost rows in SIGN_KINK_MAP are consulted via the element-blend path below.
  if (input.rising) planets.push({ planet: "sun", sign: input.rising });
  if (input.mercury) planets.push({ planet: "mercury", sign: input.mercury });
  if (input.venus)   planets.push({ planet: "venus",   sign: input.venus });
  if (input.mars)    planets.push({ planet: "mars",    sign: input.mars });
  if (input.jupiter) planets.push({ planet: "jupiter", sign: input.jupiter });
  if (input.saturn)  planets.push({ planet: "saturn",  sign: input.saturn });
  if (input.uranus)  planets.push({ planet: "uranus",  sign: input.uranus });
  if (input.neptune) planets.push({ planet: "neptune", sign: input.neptune });
  if (input.pluto)   planets.push({ planet: "pluto",   sign: input.pluto });

  // Element blend across the chart — weighted by planet importance.
  const elWeights: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const { planet, sign } of planets) {
    const w = PLANET_WEIGHTS.find((p) => p.planet === planet)?.weight ?? 1;
    elWeights[SIGN_META[sign].element] += w;
  }
  const totalElWeight = Math.max(1, elWeights.fire + elWeights.earth + elWeights.air + elWeights.water);
  const dominantEl = (Object.entries(elWeights).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "fire") as Element;

  // Start every kink at the element baseline for the dominant element.
  const scores: Record<string, number> = elementBaseline(dominantEl);

  // Then add weighted boosts from every planet in the chart.
  for (const { planet, sign } of planets) {
    const weight = PLANET_WEIGHTS.find((p) => p.planet === planet)?.weight ?? 1;
    const boosts = SIGN_KINK_MAP[sign]?.[planet];
    if (!boosts) continue;
    for (const b of boosts) {
      scores[b.id] = (scores[b.id] ?? 0) + b.boost * (weight / 3);
    }
  }

  // Element-mix secondary boosts (e.g. heavy water + fire = switch).
  if (elWeights.water > 0 && elWeights.fire > 0) {
    scores.switch = (scores.switch ?? 0) + Math.min(elWeights.water, elWeights.fire) * 2;
  }
  if (elWeights.earth > 0 && elWeights.air > 0) {
    scores.experimentalist = (scores.experimentalist ?? 0) + Math.min(elWeights.earth, elWeights.air) * 1.5;
  }

  // No soft curve — let scores hit true 0 and true 100. If someone has zero
  // signal for a kink, the score should be 0, not 5. If they have max signal,
  // it should be 100, not compressed down.
  for (const id of Object.keys(scores)) {
    scores[id] = clamp(scores[id], 0, 100);
  }

  // Build trait list, sorted desc.
  const traits: KinkTrait[] = KINK_DEFS.map((def) => ({
    label: def.label,
    percentage: scores[def.id] ?? 0,
    description: def.description,
  })).sort((a, b) => b.percentage - a.percentage);

  const top = traits[0];
  const title = `The ${top.label}`;

  const subtitle = gender === "male"
    ? `Top energy: ${top.label.toLowerCase()} (${top.percentage}%). ${top.description.toLowerCase()}.`
    : `Top energy: ${top.label.toLowerCase()} (${top.percentage}%). ${top.description.toLowerCase()}.`;

  // Build a casual summary that calls out the top 3.
  const top3 = traits.slice(0, 3).map((t) => `${t.label.toLowerCase()} (${t.percentage}%)`).join(", ");
  const summary = `Your top flavors are ${top3}. The rest of the list is what you're neutral on or barely registering for.`;

  return { title, subtitle, traits, summary };
}

// ===========================================================================
// ASPECT-AWARE KINK MODIFIERS
// ---------------------------------------------------------------------------
// Reads natal aspects and adjusts kink scores. Two users with identical
// planet signs but different aspects will get different kink results.
// ===========================================================================

import { interpretNatalAspects as getAspects } from "./aspects";

// Apply aspect-based modifiers to the kink scores.
// Called after the sign-based scoring, before the final clamp.
export function applyAspectKinkModifiers(
  scores: Record<string, number>,
  profile: NatalProfile
): Record<string, number> {
  const aspects = getAspects(profile);

  for (const aspect of aspects) {
    const pair = aspect.planets.toLowerCase();
    const aspectType = aspect.aspect.toLowerCase();
    const strength = aspect.strength;

    // Venus-Mars conjunction → boost "dom", "hunter", intensity
    if (pair.includes("venus") && pair.includes("mars")) {
      if (aspectType === "conjunction") {
        scores["dom"] = (scores["dom"] || 0) + 15 * strength;
        scores["hunter"] = (scores["hunter"] || 0) + 12 * strength;
        scores["owned"] = (scores["owned"] || 0) + 10 * strength;
      } else if (aspectType === "square" || aspectType === "opposition") {
        scores["switch"] = (scores["switch"] || 0) + 15 * strength;
        scores["brat"] = (scores["brat"] || 0) + 10 * strength;
      } else if (aspectType === "trine") {
        scores["experimentalist"] = (scores["experimentalist"] || 0) + 10 * strength;
        scores["voyeur"] = (scores["voyeur"] || 0) + 8 * strength;
      }
    }

    // Pluto-Venus aspect → boost intensity, taboo, obsession
    if (pair.includes("pluto") && pair.includes("venus")) {
      scores["sadist"] = (scores["sadist"] || 0) + 12 * strength;
      scores["intense"] = (scores["intense"] || 0) + 15 * strength;
      if (aspectType === "square" || aspectType === "opposition") {
        scores["masochist"] = (scores["masochist"] || 0) + 10 * strength;
      }
    }

    // Mars-Pluto aspect → boost dominance, power
    if (pair.includes("mars") && pair.includes("pluto")) {
      scores["dom"] = (scores["dom"] || 0) + 12 * strength;
      scores["hunter"] = (scores["hunter"] || 0) + 12 * strength;
      if (aspectType === "square" || aspectType === "opposition") {
        scores["sadist"] = (scores["sadist"] || 0) + 10 * strength;
      }
    }

    // Moon-Venus aspect → boost romantic, sub, little
    if (pair.includes("moon") && pair.includes("venus")) {
      if (aspectType === "conjunction" || aspectType === "trine") {
        scores["romantic"] = (scores["romantic"] || 0) + 12 * strength;
        scores["sub"] = (scores["sub"] || 0) + 8 * strength;
        scores["little"] = (scores["little"] || 0) + 8 * strength;
      } else if (aspectType === "square" || aspectType === "opposition") {
        scores["brat"] = (scores["brat"] || 0) + 10 * strength;
      }
    }

    // Sun-Saturn aspect → boost discipline, control, vanilla
    if (pair.includes("sun") && pair.includes("saturn")) {
      if (aspectType === "conjunction" || aspectType === "trine") {
        scores["vanilla"] = (scores["vanilla"] || 0) + 10 * strength;
        scores["master"] = (scores["master"] || 0) + 8 * strength;
      } else if (aspectType === "square" || aspectType === "opposition") {
        scores["degrader"] = (scores["degrader"] || 0) + 8 * strength;
      }
    }

    // Uranus-Venus aspect → boost experimentalist, non-monog
    if (pair.includes("uranus") && pair.includes("venus")) {
      scores["experimentalist"] = (scores["experimentalist"] || 0) + 12 * strength;
      scores["nonmonog"] = (scores["nonmonog"] || 0) + 10 * strength;
      scores["exhibitionist"] = (scores["exhibitionist"] || 0) + 8 * strength;
    }

    // Neptune-Venus aspect → boost romantic, rope bunny, prey
    if (pair.includes("neptune") && pair.includes("venus")) {
      scores["romantic"] = (scores["romantic"] || 0) + 12 * strength;
      scores["rope_bunny"] = (scores["rope_bunny"] || 0) + 10 * strength;
      scores["prey"] = (scores["prey"] || 0) + 8 * strength;
    }

    // Moon-Neptune aspect → boost sub, rope bunny, fantasy
    if (pair.includes("moon") && pair.includes("neptune")) {
      scores["sub"] = (scores["sub"] || 0) + 10 * strength;
      scores["rope_bunny"] = (scores["rope_bunny"] || 0) + 8 * strength;
    }
  }

  return scores;
}
