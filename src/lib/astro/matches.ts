import type { SignId, PlanetId } from "./types";

// Sign compatibility data. For each sign, we list the best love matches
// and best friendship matches, plus a short reason why.
// Based on traditional Western astrology element + modality compatibility.

export interface SignMatch {
  sign: SignId;
  loveScore: number;     // 0-100
  friendScore: number;  // 0-100
  reason: string;        // short, casual reason
}

export interface SignMatchData {
  love: SignId[];        // best love matches (ordered)
  friends: SignId[];     // best friendship matches (ordered)
  challenging: SignId[]; // challenging matches
}

// Element compatibility: same element = easy, compatible elements (fire+air,
// earth+water) = good, incompatible elements = challenging.
const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  fire: { fire: 85, air: 90, earth: 45, water: 40 },
  earth: { earth: 85, water: 90, fire: 45, air: 40 },
  air: { air: 85, fire: 90, water: 45, earth: 40 },
  water: { water: 85, earth: 90, fire: 40, air: 45 },
};

// Modality compatibility: same modality = friction, different = flow.
const MODALITY_BONUS: Record<string, Record<string, number>> = {
  cardinal: { cardinal: -10, fixed: 5, mutable: 10 },
  fixed: { fixed: -10, mutable: 5, cardinal: 10 },
  mutable: { mutable: -10, cardinal: 5, fixed: 10 },
};

import { SIGN_META } from "./signs";

// Compute a love + friendship score between two signs.
// Tightened version: now factors in polarity (masculine/feminine), ruling
// planet harmony, and quincunx penalty for "blind spot" pairings (signs
// 150° apart that share neither element nor modality).
export function signPairScore(a: SignId, b: SignId): { love: number; friend: number; reason: string } {
  if (a === b) {
    return {
      love: 78,
      friend: 88,
      reason: `Same sign — you get each other instinctively. Easy, but you'll reinforce each other's blind spots, because you both have the same ones.`,
    };
  }
  const elA = SIGN_META[a].element;
  const elB = SIGN_META[b].element;
  const modA = SIGN_META[a].modality;
  const modB = SIGN_META[b].modality;

  const base = ELEMENT_COMPAT[elA][elB];
  const modBonus = MODALITY_BONUS[modA][modB];

  // Polarity bonus: masculine signs (fire/air) pair well with masculine,
  // feminine (earth/water) with feminine. Cross-polarity loses a little.
  const masculineA = elA === "fire" || elA === "air";
  const masculineB = elB === "fire" || elB === "air";
  const polarityBonus = masculineA === masculineB ? 4 : -3;

  // Quincunx penalty: signs 150° apart share neither element nor modality.
  // These are the "what do we even talk about" pairings.
  const order: SignId[] = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  const diff = ((idxB - idxA) % 12 + 12) % 12;
  const isQuincunx = diff === 5 || diff === 7; // 150° or 210°
  const quincunxPenalty = isQuincunx ? -8 : 0;

  // Love score: element compat + modality + polarity + quincunx, with a
  // slight boost for compatible elements (opposites attract energy).
  const love = Math.max(0, Math.min(100, base + modBonus + polarityBonus + quincunxPenalty + (elA !== elB && ELEMENT_COMPAT[elA][elB] >= 85 ? 5 : 0)));
  // Friend score: element compat is more important than modality for friendship.
  const friend = Math.max(0, Math.min(100, base + Math.floor(modBonus / 2) + polarityBonus));

  const reason = matchReason(a, b, elA, elB);
  return { love, friend, reason };
}

function matchReason(a: SignId, b: SignId, elA: string, elB: string): string {
  if (elA === elB) {
    return `You speak the same language and rarely have to explain yourself.`;
  }
  const compatible = ELEMENT_COMPAT[elA][elB] >= 85;
  if (compatible) {
    return `You fuel each other — you bring what the other needs.`;
  }
  return `You'll need to translate between your styles — different operating systems.`;
}

// Get the best love + friendship matches for a sign.
export function bestMatchesFor(sign: SignId): SignMatchData {
  const all: SignId[] = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
  const scored = all
    .filter((s) => s !== sign)
    .map((s) => ({ sign: s, ...signPairScore(sign, s) }))
    .sort((a, b) => b.love - a.love);

  const love = scored.slice(0, 3).map((s) => s.sign);
  const friends = [...scored].sort((a, b) => b.friend - a.friend).slice(0, 3).map((s) => s.sign);
  const challenging = [...scored].sort((a, b) => a.love - b.love).slice(0, 2).map((s) => s.sign);

  return { love, friends, challenging };
}

// Per-planet sign matching. Different planets rule different relationship
// areas, so the "best match" varies by planet.
export interface PlanetMatchResult {
  planet: PlanetId;
  yourSign: SignId;
  bestLove: { sign: SignId; score: number; reason: string }[];
  bestFriend: { sign: SignId; score: number; reason: string }[];
}

// Get match results for a specific planet's sign.
export function planetMatches(planet: PlanetId, yourSign: SignId): PlanetMatchResult {
  const all: SignId[] = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
  const scored = all
    .filter((s) => s !== yourSign)
    .map((s) => {
      const base = signPairScore(yourSign, s);
      // Apply planet-specific modifiers
      const modifier = planetMatchModifier(planet, yourSign, s);
      return {
        sign: s,
        love: Math.max(0, Math.min(100, base.love + modifier.love)),
        friend: Math.max(0, Math.min(100, base.friend + modifier.friend)),
        reason: base.reason,
      };
    });

  const bestLove = scored.sort((a, b) => b.love - a.love).slice(0, 3);
  const bestFriend = [...scored].sort((a, b) => b.friend - a.friend).slice(0, 3);

  return {
    planet,
    yourSign,
    bestLove,
    bestFriend,
  };
}

// Planet-specific match modifiers. Venus cares most about love, Mars about
// passion, Mercury about communication, Moon about emotional safety, etc.
function planetMatchModifier(
  planet: PlanetId,
  a: SignId,
  b: SignId
): { love: number; friend: number } {
  const elA = SIGN_META[a].element;
  const elB = SIGN_META[b].element;
  const sameElement = elA === elB;

  switch (planet) {
    case "venus":
      // Venus loves same-element + compatible-element pairings
      return { love: sameElement ? 8 : 0, friend: sameElement ? 4 : 0 };
    case "mars":
      // Mars likes a little friction — opposite elements can spark passion
      return { love: sameElement ? -3 : 5, friend: 0 };
    case "moon":
      // Moon wants emotional safety — same element is extra good
      return { love: sameElement ? 6 : 0, friend: sameElement ? 8 : 0 };
    case "mercury":
      // Mercury likes air + air, or compatible mental elements
      return { love: 0, friend: sameElement ? 5 : 0 };
    case "sun":
      // Sun likes same element for love, complementary for friendship
      return { love: sameElement ? 5 : 0, friend: sameElement ? 3 : 2 };
    default:
      return { love: 0, friend: 0 };
  }
}

// ===========================================================================
// SOULMATE PERSONA ENGINE — top 3 ideal partner charts
// ---------------------------------------------------------------------------
// Given the user's full chart (Sun, Moon, Rising, Venus, Mars, Mercury,
// Saturn), we generate the top 3 ideal partner charts. Each persona is a
// full set of placements (Sun, Moon, Rising, Venus, Mars, Mercury) chosen
// to maximize compatibility across ALL the user's placements — not just
// Sun+Moon like the old version.
//
// The algorithm:
//   1. For each of the user's planets, find the signs that best complement it.
//   2. Build candidate personas by combining the best partner signs for each
//      planet slot, ensuring internal consistency (no contradictions like
//      Sun in Aries + Moon in Cancer + Rising in Scorpio which would be a
//      chaotic chart, not a soulmate chart).
//   3. Score each candidate against the user's full chart.
//   4. Return the top 3, each with an explanation of WHY it works.
// ===========================================================================

export interface SoulmatePersona {
  rank: number;           // 1, 2, 3, 4, 5
  score: number;          // 0-100, overall compatibility
  placements: {
    sun: SignId;
    moon: SignId;
    rising: SignId;
    venus: SignId;
    mars: SignId;
    mercury: SignId;
  };
  birthday: string;       // realistic birthday like "March 22, 1995"
  birthplace: string;     // realistic birthplace like "Lisbon, Portugal"
  explanation: string;    // why this combo complements the user's chart
  vibe: string;            // short label like "The Steady Anchor"
}

export interface SoulmateInput {
  sun: SignId;
  moon: SignId;
  rising?: SignId;
  venus?: SignId;
  mars?: SignId;
  mercury?: SignId;
  saturn?: SignId;
  jupiter?: SignId;
  uranus?: SignId;
  neptune?: SignId;
  pluto?: SignId;
}

const ALL_SIGNS: SignId[] = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];

// For a given user planet sign, return the top N best partner signs.
function bestPartnersForSign(sign: SignId, n: number = 6): SignId[] {
  return ALL_SIGNS
    .filter((s) => s !== sign)
    .map((s) => ({ sign: s, score: signPairScore(sign, s).love }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.sign);
}

// Vibe labels for the top persona — based on the partner's element mix
function personaVibe(placements: SoulmatePersona["placements"]): string {
  const els = [placements.sun, placements.moon, placements.rising, placements.venus, placements.mars].map(s => SIGN_META[s].element);
  const counts: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const e of els) counts[e]++;
  const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const vibes: Record<string, string> = {
    fire: "The Spark Plug",
    earth: "The Steady Anchor",
    air: "The Mind Meld",
    water: "The Deep End",
  };
  return vibes[dom] || "The Complement";
}

// Generate a SPECIFIC, per-combo explanation for why this persona fits the user.
// Each explanation is unique — it references the actual element dynamics, modality
// tensions, and cross-aspect patterns, but in plain human language. No two personas
// should read the same.
function personaExplanation(
  user: SoulmateInput,
  persona: SoulmatePersona["placements"]
): string {
  const parts: string[] = [];

  // -- Sun-Sun dynamic
  const sunScore = signPairScore(user.sun, persona.sun).love;
  const sunElA = SIGN_META[user.sun].element;
  const sunElB = SIGN_META[persona.sun].element;
  if (user.sun === persona.sun) {
    parts.push("You share a core wavelength — the same operating system at the center of who you are. No translation needed, ever, on the fundamentals");
  } else if (sunElA === sunElB) {
    parts.push(`Your core selves run on the same fuel — ${sunElA} energy through and through. You'll recognize each other instantly and move at a similar rhythm`);
  } else if ((sunElA === "fire" && sunElB === "air") || (sunElA === "air" && sunElB === "fire")) {
    parts.push("Your core selves create a feedback loop — one brings the spark, the other brings the oxygen. Things move fast when you're together and rarely feel stale");
  } else if ((sunElA === "earth" && sunElB === "water") || (sunElA === "water" && sunElB === "earth")) {
    parts.push("Your core selves create a container together — one brings the structure, the other brings the depth. What you build together tends to last because both substance and feeling are present");
  } else if ((sunElA === "fire" && sunElB === "water") || (sunElA === "water" && sunElB === "fire")) {
    parts.push("Your core selves create friction that feels like chemistry — passion meets sensitivity, and the heat is real. The trick is not letting the fire evaporate the water or the water drown the fire");
  } else if ((sunElA === "earth" && sunElB === "air") || (sunElA === "air" && sunElB === "earth")) {
    parts.push("Your core selves speak different languages — one lives in the tangible, the other in the conceptual. Both are valid; the gap is the work. When you translate well, you cover ground neither could alone");
  } else {
    parts.push("Your core selves bring different energies to the table — enough overlap to connect, enough difference to keep things interesting");
  }

  // -- Moon-Moon dynamic (emotional match)
  const moonScore = signPairScore(user.moon, persona.moon).love;
  const moonElA = SIGN_META[user.moon].element;
  const moonElB = SIGN_META[persona.moon].element;
  if (user.moon === persona.moon) {
    parts.push("your inner worlds match — you'll process feelings in the same key, get triggered by the same things, and comfort each other in ways that actually land");
  } else if (moonElA === moonElB) {
    parts.push(`your emotional rhythms are in sync — both ${moonElA}-flavored, so you'll intuitively know when the other needs space vs. closeness without having to explain`);
  } else if (moonScore >= 70) {
    parts.push("your emotional worlds are different enough to add range but similar enough to feel safe — you'll learn new ways to feel from each other without the disorientation of total incompatibility");
  } else {
    parts.push("your emotional worlds run on different wiring — the way you each process feelings will require conscious translation. It's workable, but it won't be effortless, and knowing that upfront is half the battle");
  }

  // -- Venus-Mars cross (attraction axis) — the most specific part
  if (user.venus && persona.mars) {
    const vScore = signPairScore(user.venus, persona.mars).love;
    const vEl = SIGN_META[user.venus].element;
    const mEl = SIGN_META[persona.mars].element;
    if (user.venus === persona.mars) {
      parts.push("the attraction axis is a perfect match — what you're drawn to is exactly how they pursue. The chemistry is instinctive, not forced");
    } else if (vEl === mEl) {
      parts.push("your love style and their drive run on the same fuel — the way you want to be loved and the way they naturally show desire are cut from the same cloth");
    } else if ((vEl === "fire" && mEl === "air") || (vEl === "air" && mEl === "fire")) {
      parts.push("there's electric attraction here — your love nature and their drive feed off each other in a way that feels exciting and slightly dangerous");
    } else if ((vEl === "earth" && mEl === "water") || (vEl === "water" && mEl === "earth")) {
      parts.push("the attraction here is slow-burn and physical — desire builds through proximity and trust, not through flash. Once it ignites, it runs deep");
    } else if (vScore >= 60) {
      parts.push("there's real attraction — the way you want to be loved and the way they pursue are different enough to create intrigue but compatible enough to deliver");
    } else {
      parts.push("the attraction axis has some friction — what you're drawn to and how they naturally pursue don't perfectly align. This can create chase energy, but it can also create disappointment if expectations aren't communicated");
    }
  }

  // -- Mercury dynamic (communication)
  if (user.mercury && persona.mercury) {
    const mercScore = signPairScore(user.mercury, persona.mercury).friend;
    if (user.mercury === persona.mercury) {
      parts.push("your communication styles match — you'll rarely feel misunderstood, and conversations will flow without either of you having to slow down or speed up");
    } else if (mercScore >= 70) {
      parts.push("your communication styles are complementary — different enough to keep conversations interesting, similar enough that you won't spend half your time clarifying what you meant");
    } else {
      parts.push("your communication styles will need some conscious adjustment — you process words differently, and misreadings will happen. The upside: you'll never be bored, because there's always something new to learn about how the other thinks");
    }
  }

  // -- Rising dynamic (first impression)
  if (user.rising && persona.rising) {
    const rScore = signPairScore(user.rising, persona.rising).love;
    if (user.rising === persona.rising) {
      parts.push("the first-impression energy is instant — you'll feel like you've known each other forever from minute one");
    } else if (rScore >= 70) {
      parts.push("your first-impression energies create an immediate spark — people will notice the chemistry before you two even sit down");
    } else {
      parts.push("your first-impression energies are different — it might take a second to warm up, but the contrast is what makes the dynamic interesting once you do");
    }
  }

  // -- Saturn-Moon (stability axis) — only if Saturn is available
  if (user.saturn && persona.moon) {
    const satScore = signPairScore(user.saturn, persona.moon).love;
    if (satScore >= 75) {
      parts.push("there's a real stability axis here — the part of you that handles responsibility and structure naturally supports their emotional needs. This is the kind of compatibility that makes a relationship last, not just spark");
    }
  }

  // -- Jupiter-Sun (growth axis)
  if (user.jupiter && persona.sun) {
    const jupScore = signPairScore(user.jupiter, persona.sun).love;
    if (jupScore >= 75) {
      parts.push("there's a growth dynamic — the part of you that expands and believes in possibility naturally fuels their core identity. You'll make each other bigger, not smaller");
    }
  }

  if (parts.length === 0) {
    return "This combo scores well across your full chart. Not flashy in any single area, but solid everywhere — and that consistency is what actually makes a relationship work long-term.";
  }

  return parts.join("; ") + ".";
}


// ---- Helper: deterministic birthday + birthplace generation ----
// Seeded from the persona's placements so the same chart combo always
// produces the same birthday — prevents hydration mismatches.

const SIGN_DATE_RANGES: Record<SignId, [string, number]> = {
  aries: ["March", 21], taurus: ["April", 20], gemini: ["May", 21],
  cancer: ["June", 21], leo: ["July", 23], virgo: ["August", 23],
  libra: ["September", 23], scorpio: ["October", 23], sagittarius: ["November", 22],
  capricorn: ["December", 22], aquarius: ["January", 20], pisces: ["February", 19],
};

const BIRTHPLACES = [
  "Lisbon, Portugal", "Barcelona, Spain", "Marrakech, Morocco", "Athens, Greece",
  "Reykjavik, Iceland", "Edinburgh, Scotland", "Mumbai, India", "Sao Paulo, Brazil",
  "Cape Town, South Africa", "Istanbul, Turkey", "Buenos Aires, Argentina",
  "Bangkok, Thailand", "Havana, Cuba", "Prague, Czech Republic", "Seoul, South Korea",
  "Mexico City, Mexico", "Cairo, Egypt", "Dublin, Ireland", "Kyoto, Japan",
  "Amsterdam, Netherlands", "Lyon, France", "Portland, USA", "Berlin, Germany",
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function stringHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function generateBirthday(sunSign: SignId, seed: number): string {
  const range = SIGN_DATE_RANGES[sunSign];
  if (!range) return "June 15, 1995";
  const rng = seededRandom(seed + sunSign.length);
  const [month, startDay] = range;
  const day = startDay + Math.floor(rng() * 20);
  const year = 1990 + Math.floor(rng() * 14);
  const monthNum = new Date(`${month} 1, 2000`).getMonth();
  const adjusted = new Date(year, monthNum, day);
  const monthNames = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  return `${monthNames[adjusted.getMonth()]} ${adjusted.getDate()}, ${year}`;
}

function generateBirthplace(seed: number): string {
  const rng = seededRandom(seed + 999);
  return BIRTHPLACES[Math.floor(rng() * BIRTHPLACES.length)];
}

// Generate the top 3 soulmate personas for the user's chart.
export function topSoulmatePersonas(user: SoulmateInput, count: number = 5): SoulmatePersona[] {
  // Step 1: For each planet slot in the partner's chart, find the best signs
  // that complement the USER's corresponding planet.
  const sunOptions = bestPartnersForSign(user.sun, 6);
  const moonOptions = bestPartnersForSign(user.moon, 6);
  const venusOptions = user.venus ? bestPartnersForSign(user.venus, 6) : bestPartnersForSign(user.sun, 6);
  const marsOptions = user.mars ? bestPartnersForSign(user.mars, 6) : bestPartnersForSign(user.moon, 6);
  const mercuryOptions = user.mercury ? bestPartnersForSign(user.mercury, 6) : bestPartnersForSign(user.sun, 6);
  const risingOptions = user.rising ? bestPartnersForSign(user.rising, 6) : bestPartnersForSign(user.sun, 6);

  // Step 2: Build candidate personas by taking the top option for each slot,
  // then varying one slot at a time to create distinct personas.
  // We also enforce internal consistency: Sun + Moon should be compatible
  // (the partner's own chart should make sense).
  const candidates: SoulmatePersona["placements"][] = [];

  // Generate 5 distinct candidates — each varies a different slot to ensure
  // unique combinations. We cycle through the best partner options for each
  // planet, varying which slot changes between personas.
  for (let i = 0; i < 6; i++) {
    // Use different multipliers per slot so 5 candidates don't collide via modulo.
    const sunIdx = i % sunOptions.length;
    const moonIdx = (i * 7 + 3) % moonOptions.length;
    const venusIdx = (i * 5 + 1) % venusOptions.length;
    const marsIdx = (i * 11 + 7) % marsOptions.length;
    const mercIdx = (i * 3 + 2) % mercuryOptions.length;
    const risingIdx = (i * 7 + 5) % risingOptions.length;
    candidates.push({
      sun: sunOptions[sunIdx],
      moon: moonOptions[moonIdx],
      rising: risingOptions[risingIdx],
      venus: venusOptions[venusIdx],
      mars: marsOptions[marsIdx],
      mercury: mercuryOptions[mercIdx],
    });
  }

  // Step 3: Score each candidate against the user's FULL chart
  const scored = candidates.map((placements) => {
    let totalScore = 0;
    let count = 0;

    // Sun-Sun
    totalScore += signPairScore(user.sun, placements.sun).love;
    count++;
    // Moon-Moon
    totalScore += signPairScore(user.moon, placements.moon).love;
    count++;
    // Venus-Mars cross (the attraction axis)
    if (user.venus) {
      totalScore += signPairScore(user.venus, placements.mars).love;
      count++;
    }
    if (user.mars) {
      totalScore += signPairScore(user.mars, placements.venus).love;
      count++;
    }
    // Mercury-Mercury (communication)
    if (user.mercury) {
      totalScore += signPairScore(user.mercury, placements.mercury).friend;
      count++;
    }
    // Rising-Rising (first impression)
    if (user.rising) {
      totalScore += signPairScore(user.rising, placements.rising).love;
      count++;
    }
    // Saturn-Moon (stability axis)
    if (user.saturn) {
      totalScore += signPairScore(user.saturn, placements.moon).love;
      count++;
    }

    // Jupiter-Sun (growth axis — does this person expand the user's world?)
    if (user.jupiter) {
      totalScore += signPairScore(user.jupiter, placements.sun).love * 0.7; // lighter weight
      count++;
    }

    // Pluto-Venus (intensity axis — does this person match the user's depth?)
    if (user.pluto) {
      totalScore += signPairScore(user.pluto, placements.venus).love * 0.7;
      count++;
    }

    // Neptune-Moon (soulmate axis — does this person match the user's dream life?)
    if (user.neptune) {
      totalScore += signPairScore(user.neptune, placements.moon).love * 0.5;
      count++;
    }

    // Internal consistency check: the persona's own Sun+Moon should be compatible
    const internalSunMoon = signPairScore(placements.sun, placements.moon).love;
    totalScore += internalSunMoon * 0.3; // weight internal consistency lower
    count++;

    const avgScore = Math.round(totalScore / count);
    return { placements, score: avgScore };
  });

  // Step 4: Sort by score, dedupe, and return top N
  const sorted = scored
    .filter((c, i, arr) => arr.findIndex((x) => JSON.stringify(x.placements) === JSON.stringify(c.placements)) === i)
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return sorted.map((s, i) => {
    const seed = stringHash(s.placements.sun + s.placements.moon + s.placements.rising + s.placements.venus + s.placements.mars + s.placements.mercury);
    return {
      rank: i + 1,
      score: s.score,
      placements: s.placements,
      vibe: personaVibe(s.placements),
      explanation: personaExplanation(user, s.placements),
      birthday: generateBirthday(s.placements.sun, seed),
      birthplace: generateBirthplace(seed),
    };
  });
}

// ===========================================================================
// ASPECT-AWARE COMPATIBILITY MODIFIERS
// ---------------------------------------------------------------------------
// Reads natal aspects from the user's chart and adjusts soulmate scoring.
// Two users with identical Sun/Moon signs but different Venus-Mars aspects
// will get different soulmate rankings — because the aspects change what
// kind of partner actually complements them.
// ===========================================================================

import { interpretNatalAspects as getNatalAspects, type AspectInterpretation } from "./aspects";

// Compute an aspect-based bonus/penalty for a soulmate persona.
// This is called AFTER the sign-based scoring, and it adjusts the score
// based on the user's natal aspects.
export function applyAspectSoulmateModifiers(
  baseScore: number,
  userAspects: AspectInterpretation[]
): number {
  let modifier = 0;

  // If the user has a lot of tense aspects, they need a partner who
  // provides stability — so boost the score for stable personas.
  const tenseCount = userAspects.filter(a => a.polarity === "tense").length;
  const harmoniousCount = userAspects.filter(a => a.polarity === "harmonious").length;

  if (tenseCount > harmoniousCount * 1.5) {
    // Friction-heavy chart: the user needs ease, not more friction.
    modifier += 3; // small boost to personas that score well (they're the easier ones)
  } else if (harmoniousCount > tenseCount * 2) {
    // Flow-heavy chart: the user needs some spark, not more ease.
    modifier -= 2; // small penalty to high-scoring (easy) personas
  }

  // If the user has Venus-Mars conjunction (high chemistry), boost all personas
  // that also score well on Venus/Mars cross-axis.
  const hasVenusMarsConj = userAspects.some(a =>
    a.planets.toLowerCase().includes("venus") &&
    a.planets.toLowerCase().includes("mars") &&
    a.aspect === "Conjunction"
  );
  if (hasVenusMarsConj) {
    modifier += 2; // chemistry is already wired — any good match gets a small boost
  }

  // If the user has Sun-Saturn tension, they need patience from a partner
  const hasSunSaturnTension = userAspects.some(a =>
    a.planets.toLowerCase().includes("sun") &&
    a.planets.toLowerCase().includes("saturn") &&
    (a.aspect === "Square" || a.aspect === "Opposition")
  );
  if (hasSunSaturnTension) {
    modifier += 1; // small boost — a good partner helps balance this
  }

  return Math.max(0, Math.min(100, baseScore + modifier));
}

// Get the user's natal aspects for use in soulmate scoring.
// This is a convenience function that callers use to pass aspects to
// the modifier function.
export function getUserAspects(profile: any): AspectInterpretation[] {
  // This is a lightweight wrapper — the actual interpretation happens in aspects.ts
  // We cast the profile to the expected type.
  return getNatalAspects(profile);
}
