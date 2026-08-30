import type { NatalProfile, SignId, PlanetId } from "./types";
import { SIGN_META } from "./signs";
import { makeFlagCtx, getFlagCopy } from "./personality/flagContent";

// ===========================================================================
// RED FLAGS — full chart, 4 categories, brutally honest
// ---------------------------------------------------------------------------
// CONDITIONS ONLY. Every text (detail, bullets, examples, fixes, takeaways)
// is fully custom-written per flag in personality/flagContent.ts — one entry
// per trait, generated from the person's real placements. Nothing is shared
// between different traits.
// ===========================================================================

export interface Flag {
  title: string;
  detail: string;
  sources: string[];
}

export interface FlagResult {
  redFlags: {
    relationship: Flag[];
    communication: Flag[];
    emotional: Flag[];
    behavioral: Flag[];
  };
  growthAreas: {
    relationship: Flag[];
    communication: Flag[];
    emotional: Flag[];
    behavioral: Flag[];
  };
  quirks: {
    relationship: Flag[];
    communication: Flag[];
    emotional: Flag[];
    behavioral: Flag[];
  };
  greenFlags: Flag[];
}

function planetSign(profile: NatalProfile, id: string): SignId | undefined {
  return profile.planets.find((p) => p.id === id)?.signId;
}

function planetHouse(profile: NatalProfile, id: string): number | undefined {
  return profile.planets.find((p) => p.id === id)?.house;
}

function isRetro(profile: NatalProfile, id: string): boolean {
  return profile.planets.find((p) => p.id === id)?.retrograde ?? false;
}

const FIRE = ["aries", "leo", "sagittarius"];
const EARTH = ["taurus", "virgo", "capricorn"];
const AIR = ["gemini", "libra", "aquarius"];
const WATER = ["cancer", "scorpio", "pisces"];

const isFire = (s?: SignId) => s && FIRE.includes(s);
const isEarth = (s?: SignId) => s && EARTH.includes(s);
const isAir = (s?: SignId) => s && AIR.includes(s);
const isWater = (s?: SignId) => s && WATER.includes(s);

const signName = (s?: SignId) => (s ? SIGN_META[s].name : "");

export function getFullChartFlags(profile: NatalProfile): FlagResult {
  const ctx = makeFlagCtx(profile);
  const sun = profile.sun.signId;
  const moon = profile.moon.signId;
  const rising = profile.ascendant.signId;
  const mercury = planetSign(profile, "mercury");
  const venus = planetSign(profile, "venus");
  const mars = planetSign(profile, "mars");
  const saturn = planetSign(profile, "saturn");
  const jupiter = planetSign(profile, "jupiter");
  const uranus = planetSign(profile, "uranus");
  const neptune = planetSign(profile, "neptune");
  const pluto = planetSign(profile, "pluto");

  // Houses — actually read them (previously dead code)
  const sunHouse = planetHouse(profile, "sun");
  const moonHouse = planetHouse(profile, "moon");
  const venusHouse = planetHouse(profile, "venus");
  const marsHouse = planetHouse(profile, "mars");
  const mercuryHouse = planetHouse(profile, "mercury");
  const saturnHouse = planetHouse(profile, "saturn");
  const jupiterHouse = planetHouse(profile, "jupiter");
  const plutoHouse = planetHouse(profile, "pluto");

  // Retrogrades — widen beyond just Merc/Ven/Mars
  const saturnRetro = isRetro(profile, "saturn");
  const jupiterRetro = isRetro(profile, "jupiter");
  void saturnRetro;

  const sunName = SIGN_META[sun].name;
  const moonName = SIGN_META[moon].name;
  const venusName = signName(venus);
  const marsName = signName(mars);
  const mercuryName = signName(mercury);
  const jupiterName = signName(jupiter);
  const uranusName = signName(uranus);
  const neptuneName = signName(neptune);
  const plutoName = signName(pluto);

  const result: FlagResult = {
    redFlags: { relationship: [], communication: [], emotional: [], behavioral: [] },
    growthAreas: { relationship: [], communication: [], emotional: [], behavioral: [] },
    quirks: { relationship: [], communication: [], emotional: [], behavioral: [] },
    greenFlags: [],
  };

  /** Push a flag: title + sources here; every word comes from flagContent. */
  const push = (
    bucket: Flag[],
    title: string,
    sources: string[]
  ) => {
    const copy = getFlagCopy(title, sources);
    const detail = copy
      ? copy.detail(ctx)
      : `Driven by ${sources.filter(Boolean).join(" + ") || "your chart"}.`;
    bucket.push({ title, detail, sources: sources.filter(Boolean) });
  };

  // ============ RELATIONSHIP RED FLAGS ============

  if (venus === "gemini" || venus === "sagittarius") {
    push(result.redFlags.relationship, "Situationship Energy", [`Venus in ${venusName}`]);
  }

  if (isRetro(profile, "venus")) {
    push(result.redFlags.relationship, "Guarded Lover", ["Venus retrograde"]);
  }

  if (mars === "aries" || mars === "scorpio") {
    push(result.redFlags.relationship, "Fight-or-Flip Energy", [`Mars in ${marsName}`]);
  }

  if (sun === "libra" && venus === "libra") {
    push(result.redFlags.relationship, "People-Pleaser AF", ["Sun in Libra", "Venus in Libra"]);
  }

  if (moon === "capricorn") {
    push(result.redFlags.relationship, "Emotionally Walled Off", ["Moon in Capricorn"]);
  }

  if (mars === "taurus") {
    push(result.redFlags.relationship, "Stubborn AF In Fights", ["Mars in Taurus"]);
  }

  if (venus === "scorpio") {
    push(result.redFlags.relationship, "All-Or-Nothing Lover", ["Venus in Scorpio"]);
  }

  if (sun === "sagittarius" || (mars === "sagittarius" && venus === "sagittarius")) {
    push(result.redFlags.relationship, "Flight Risk", [
      sun === "sagittarius" ? "Sun in Sagittarius" : "",
      mars === "sagittarius" ? "Mars in Sagittarius" : "",
      venus === "sagittarius" ? "Venus in Sagittarius" : "",
    ]);
  }

  // ============ COMMUNICATION RED FLAGS ============

  if (mercury === "aries") {
    push(result.redFlags.communication, "Says The First Thing", ["Mercury in Aries"]);
  }

  if (mercury === "scorpio") {
    push(result.redFlags.communication, "The Interrogator", ["Mercury in Scorpio"]);
  }

  if (mercury === "gemini" && isRetro(profile, "mercury")) {
    push(result.redFlags.communication, "Misunderstood Communicator", ["Mercury in Gemini", "Mercury retrograde"]);
  }

  if (mercury === "virgo") {
    push(result.redFlags.communication, "Picks Everything Apart", ["Mercury in Virgo"]);
  }

  if (isRetro(profile, "mercury") && mercury !== "gemini") {
    push(result.redFlags.communication, "Tangled Words", [`Mercury in ${mercuryName} (retrograde)`]);
  }

  if ((sun === "scorpio" || moon === "scorpio") && mercury === "scorpio") {
    push(result.redFlags.communication, "Reads Into Everything", ["Scorpio placement", "Mercury in Scorpio"]);
  }

  // ============ EMOTIONAL RED FLAGS ============

  if (moon === "aries") {
    push(result.redFlags.emotional, "Emotional Whiplash", ["Moon in Aries"]);
  }

  if (moon === "aquarius") {
    push(result.redFlags.emotional, "Emotionally Detached", ["Moon in Aquarius"]);
  }

  if (moon === "pisces") {
    push(result.redFlags.emotional, "Mood Sponge", ["Moon in Pisces"]);
  }

  if (moon === "gemini") {
    push(result.redFlags.emotional, "Feels Through Thoughts", ["Moon in Gemini"]);
  }

  if (sun === "cancer" && isWater(moon)) {
    push(result.redFlags.emotional, "Takes Everything Personally", ["Sun in Cancer", `Moon in ${moonName}`]);
  }

  if (saturn === sun || saturn === moon) {
    push(result.redFlags.emotional, "Emotionally Controlled", [`Saturn in ${saturn === sun ? sunName : moonName}`]);
  }

  // ============ BEHAVIORAL RED FLAGS (incl. Jupiter growth-drivers) ============

  // Jupiter expansion issues — over-promiser, over-extender
  if (jupiter && ["sagittarius", "pisces", "cancer", "leo"].includes(jupiter)) {
    push(result.redFlags.behavioral, "Over-Promiser", [`Jupiter in ${jupiterName}`]);
  }

  // Jupiter retrograde — growth runs inward, not outward
  if (jupiterRetro) {
    push(result.redFlags.behavioral, "Growth Runs Inward", ["Jupiter retrograde"]);
  }

  // Uranus strong — disruption for disruption's sake
  if (uranus && ["aquarius", "aries", "gemini"].includes(uranus)) {
    push(result.redFlags.behavioral, "Disruption For Disruption's Sake", [`Uranus in ${uranusName}`]);
  }

  // Neptune strong — delusional idealist / boundary blurrer
  if (neptune && ["pisces", "cancer", "libra"].includes(neptune)) {
    push(result.redFlags.emotional, "Reality Is Optional", [`Neptune in ${neptuneName}`]);
  }

  // Pluto strong — control / power issues
  if (pluto && ["scorpio", "capricorn", "aries"].includes(pluto)) {
    push(result.redFlags.relationship, "Control Issues", [`Pluto in ${plutoName}`]);
  }

  // Pluto in 8th house — deep attachment issues
  if (plutoHouse === 8) {
    push(result.redFlags.emotional, "All-Or-Nothing Attachment", ["Pluto in 8th house"]);
  }

  // Saturn in 7th — relationship delay / fear of commitment
  if (saturnHouse === 7) {
    push(result.redFlags.relationship, "Commitment Delay", ["Saturn in 7th house"]);
  }

  // Saturn in 4th — family/home issues
  if (saturnHouse === 4) {
    push(result.redFlags.emotional, "Home Is Complicated", ["Saturn in 4th house"]);
  }

  // Jupiter in 9th — wanderer / can't settle
  if (jupiterHouse === 9) {
    push(result.redFlags.behavioral, "Can't Settle Down", ["Jupiter in 9th house"]);
  }

  // Sun in 10th — workaholic / identity tied to career
  if (sunHouse === 10) {
    push(result.redFlags.behavioral, "Workaholic Identity", ["Sun in 10th house"]);
  }

  // Moon in 12th — emotional isolation
  if (moonHouse === 12) {
    push(result.redFlags.emotional, "Emotionally Isolated", ["Moon in 12th house"]);
  }

  // Venus in 12th — secret love life / hidden relationships
  if (venusHouse === 12) {
    push(result.redFlags.relationship, "Secret Love Life", ["Venus in 12th house"]);
  }

  // ============ GROWTH AREAS ============

  // Mercury in Libra — can't pick a side
  if (mercury === "libra") {
    push(result.growthAreas.communication, "Can't Pick A Side", ["Mercury in Libra"]);
  }

  // Sun in Pisces — boundary issues
  if (sun === "pisces") {
    push(result.growthAreas.emotional, "Boundary Issues", ["Sun in Pisces"]);
  }

  // Mars in Libra — passive-aggressive conflict
  if (mars === "libra") {
    push(result.growthAreas.relationship, "Passive-Aggressive Conflict", ["Mars in Libra"]);
  }

  // Moon in Virgo — anxiety spiral
  if (moon === "virgo") {
    push(result.growthAreas.emotional, "Anxiety Spiral", ["Moon in Virgo"]);
  }

  // ============ BEHAVIORAL RED FLAGS — sun-sign driven ============

  if (sun === "gemini" || sun === "sagittarius") {
    push(result.redFlags.behavioral, "Chronic Flake", [`Sun in ${sunName}`]);
  }

  if (sun === "taurus") {
    push(result.redFlags.behavioral, "Refuses To Try New Things", ["Sun in Taurus"]);
  }

  if (sun === "leo") {
    push(result.redFlags.behavioral, "Makes Everything About Themselves", ["Sun in Leo"]);
  }

  if (sun === "virgo") {
    push(result.redFlags.behavioral, "Silently Judges Your Life", ["Sun in Virgo"]);
  }

  if (sun === "capricorn") {
    push(result.redFlags.behavioral, "Responds To Feelings With A Status Update", ["Sun in Capricorn"]);
  }

  if (sun === "aquarius") {
    push(result.redFlags.behavioral, "Disappears Into New Interest", ["Sun in Aquarius"]);
  }

  if (sun === "pisces") {
    push(result.redFlags.behavioral, "Yes-To-Everything Flake", ["Sun in Pisces"]);
  }

  if (isRetro(profile, "mars")) {
    push(result.redFlags.behavioral, "Drive Runs Quiet", ["Mars retrograde"]);
  }

  const elementCounts: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  // Count ALL 10 planets + Rising for dominant element — not just 6.
  for (const s of [sun, moon, rising, mercury, venus, mars, saturn, jupiter, uranus, neptune, pluto].filter(Boolean) as SignId[]) {
    elementCounts[SIGN_META[s].element]++;
  }
  const dominantEl = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (dominantEl === "earth" && elementCounts.earth >= 3) {
    push(result.redFlags.behavioral, "Comfort Zone CEO", [`${elementCounts.earth} earth placements`]);
  }
  if (dominantEl === "fire" && elementCounts.fire >= 3) {
    push(result.redFlags.behavioral, "Impulse Buyer, Impulse Liver", [`${elementCounts.fire} fire placements`]);
  }
  if (dominantEl === "water" && elementCounts.water >= 3) {
    push(result.redFlags.behavioral, "Can't Watch The News Without Spiraling", [`${elementCounts.water} water placements`]);
  }
  if (dominantEl === "air" && elementCounts.air >= 3) {
    push(result.redFlags.behavioral, "Brain Never Closes", [`${elementCounts.air} air placements`]);
  }

  // ============ NEUTRAL QUIRKS (not good, not bad — just specific) ============

  if (mercury === "gemini" && !isRetro(profile, "mercury")) {
    push(result.quirks.communication, "Thinks Out Loud", ["Mercury in Gemini"]);
  }

  if (venus === "taurus") {
    push(result.quirks.relationship, "Same Order Every Time", ["Venus in Taurus"]);
  }

  if (rising === "pisces") {
    push(result.quirks.behavioral, "Runs On Their Own Clock", ["Pisces rising"]);
  }

  if (saturnHouse === 5) {
    push(result.quirks.behavioral, "Schedules Fun Like A Meeting", ["Saturn in 5th house"]);
  }

  if (jupiterHouse === 5) {
    push(result.quirks.relationship, "Big Fun Energy", ["Jupiter in 5th house"]);
  }

  if (sunHouse === 4) {
    push(result.quirks.emotional, "Home Is The Whole World", ["Sun in 4th house"]);
  }

  if (planetHouse(profile, "uranus") === 3) {
    push(result.quirks.communication, "Random Hyperfocus", ["Uranus in 3rd house"]);
  }

  if (moonHouse === 1) {
    push(result.quirks.emotional, "Wears Every Mood On Their Face", ["Moon in 1st house"]);
  }

  const totalFlags = result.redFlags.relationship.length + result.redFlags.communication.length + result.redFlags.emotional.length + result.redFlags.behavioral.length;
  if (totalFlags === 0) {
    push(result.redFlags.behavioral, "Suspiciously Well-Adjusted", ["no major triggers found"]);
  }

  // ============ GREEN FLAGS (from the dedicated positives pass) ============
  result.greenFlags = getFullChartGreenFlags(profile, ctx);

  // Aspect-aware additions — natal aspects are real chart data and change
  // HOW the signs express. (These flags were authored but never wired in.)
  return applyAspectFlags(result, profile);
}

// ---- Green flags (positives) ----

export function getFullChartGreenFlags(profile: NatalProfile, ctx?: ReturnType<typeof makeFlagCtx>): Flag[] {
  const c = ctx ?? makeFlagCtx(profile);
  const sun = profile.sun.signId;
  const moon = profile.moon.signId;
  const venus = planetSign(profile, "venus");
  const mars = planetSign(profile, "mars");
  const saturn = planetSign(profile, "saturn");

  const flags: Flag[] = [];
  const push = (title: string, sources: string[]) => {
    const copy = getFlagCopy(title, sources);
    flags.push({
      title,
      detail: copy ? copy.detail(c) : `Driven by ${sources.join(" + ")}.`,
      sources,
    });
  };

  if (moon === "taurus" || moon === "cancer") {
    push("Emotionally Safe", [`Moon in ${SIGN_META[moon].name}`]);
  }

  if (venus && ["taurus", "cancer", "libra"].includes(venus)) {
    push("Loyal Lover", [`Venus in ${SIGN_META[venus].name}`]);
  }

  if (SIGN_META[sun].element === SIGN_META[moon].element) {
    push("Internally Consistent", ["Sun + Moon same element"]);
  }

  if (saturn === "capricorn" || saturn === "aquarius") {
    push("Reliable AF", [`Saturn in ${SIGN_META[saturn].name}`]);
  }

  if (mars === "capricorn" || mars === "virgo") {
    push("Disciplined Drive", [`Mars in ${SIGN_META[mars].name}`]);
  }

  return flags.slice(0, 3);
}

// ===========================================================================
// ASPECT-AWARE FLAG MODIFIERS
// ---------------------------------------------------------------------------
// Read the natal aspects (computed by aspects.ts, calculation unchanged) and
// add flags based on aspect patterns. Text lives in flagContent.ts like all
// the other flags.
// ===========================================================================

import { interpretNatalAspects } from "./aspects";

const SIGN_ORDER: SignId[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

/** The mapped natal payload lacks absPos/angles — rebuild them so the
 * aspect engine gets real longitudes instead of NaN (which silently
 * produced zero aspects). */
function withAbsolutePositions(profile: NatalProfile): NatalProfile {
  const abs = (signId: SignId, pos: number | undefined) =>
    Math.max(0, SIGN_ORDER.indexOf(signId)) * 30 + (pos ?? 0);
  return {
    ...profile,
    planets: profile.planets.map((p) => ({
      ...p,
      absPos: typeof p.absPos === "number" ? p.absPos : abs(p.signId, p.pos),
    })),
    angles: {
      asc: profile.ascendant.absPos,
      mc: profile.midheaven.absPos,
    },
  } as NatalProfile;
}

export function applyAspectFlags(result: FlagResult, profile: NatalProfile): FlagResult {
  const ctx = makeFlagCtx(profile);
  const aspects = interpretNatalAspects(withAbsolutePositions(profile));
  ctx.tense = aspects.filter((a) => a.polarity === "tense").length;
  ctx.harmonious = aspects.filter((a) => a.polarity === "harmonious").length;

  const push = (
    bucket: Flag[],
    title: string,
    sources: string[]
  ) => {
    const copy = getFlagCopy(title, sources);
    const detail = copy ? copy.detail(ctx) : `Driven by ${sources.join(" + ")}.`;
    bucket.push({ title, detail, sources });
  };

  for (const aspect of aspects) {
    const pair = aspect.planets.toLowerCase();
    const aspectType = aspect.aspect.toLowerCase();

    // Sun-Saturn square/opposition → "Self-Critical" emotional flag
    if (pair.includes("sun") && pair.includes("saturn") && (aspectType === "square" || aspectType === "opposition")) {
      push(result.redFlags.emotional, "Self-Critical Loop", [`Sun ${aspect.aspect} Saturn`]);
    }

    // Moon-Mars square/opposition → emotional volatility flag
    if (pair.includes("moon") && pair.includes("mars") && (aspectType === "square" || aspectType === "opposition")) {
      push(result.redFlags.emotional, "Emotional Whiplash", [`Moon ${aspect.aspect} Mars`]);
    }

    // Venus-Saturn square/opposition → "Relationship Anxiety" relationship flag
    if (pair.includes("venus") && pair.includes("saturn") && (aspectType === "square" || aspectType === "opposition")) {
      push(result.redFlags.relationship, "Relationship Anxiety", [`Venus ${aspect.aspect} Saturn`]);
    }

    // Mercury-Saturn square → "Overthinks Everything" communication flag
    if (pair.includes("mercury") && pair.includes("saturn") && aspectType === "square") {
      push(result.redFlags.communication, "Overthinks Everything", [`Mercury ${aspect.aspect} Saturn`]);
    }

    // Sun-Neptune square/opposition → "Identity Blur" emotional flag
    if (pair.includes("sun") && pair.includes("neptune") && (aspectType === "square" || aspectType === "opposition")) {
      push(result.redFlags.emotional, "Identity Blur", [`Sun ${aspect.aspect} Neptune`]);
    }

    // Mars-Pluto square/opposition → "Power Struggles" relationship flag
    if (pair.includes("mars") && pair.includes("pluto") && (aspectType === "square" || aspectType === "opposition")) {
      push(result.redFlags.relationship, "Power Struggles", [`Mars ${aspect.aspect} Pluto`]);
    }
  }

  // Count harmonious vs tense aspects for a chart-level note
  const harmonious = ctx.harmonious;
  const tense = ctx.tense;
  if (tense > harmonious * 2) {
    push(result.redFlags.behavioral, "Friction-Heavy Chart", [`${tense} tense aspects`]);
  }

  return result;
}
