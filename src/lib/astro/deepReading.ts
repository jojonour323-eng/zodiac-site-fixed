// ===========================================================================
// DEEP READING ENGINE — v3
// ---------------------------------------------------------------------------
// Nine rules applied:
//   1. No repeating the same point across sections
//   2. No length limit, but no filler — real content stays, repetition goes
//   3. No defining terms mid-sentence — describe the person directly
//   4. Connections woven INSIDE sections, not in a separate section at the end
//   5. No repeated template sentence patterns for connections
//   6. Short lines under small headers, not long paragraphs
//   7. Self-recognition tone — "wow, that's actually me"
//   8. Keep nicknames, vibe lines, bars, empty houses (handled elsewhere)
//   9. Plain English everywhere
// ===========================================================================

import type { NatalProfile, PlanetSummary, SignId, PlanetId, Element, Modality } from "./types";
import { SIGN_META, ELEMENT_VIBE } from "./signs";
import {
  interpretPlanetInSign,
  houseMeaning,
  ordinal,
  PLANET_ROLES,
  pointDisplayName,
  ascendantLong,
  ascendantHeadline,
  ascendantTraits,
} from "./interpretations";
import type { SoulmatePersona } from "./matches";
import type { Flag } from "./redflags";

// ---- Public types ----

export interface ExplanationSection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export interface DeepExplanation {
  headline: string;
  summary: string;
  sections: ExplanationSection[];
}

// ===========================================================================
// PLAIN-ENGLISH DESCRIPTIONS
// ---------------------------------------------------------------------------
// These describe BEHAVIOR, not definitions. No "this is your X, which means..."
// ===========================================================================

// What a person with this sign DOES — written as behavior, not as a label
function signBehavior(signId: SignId): string {
  // Pronoun-free gerund phrases — usable in any sentence frame
  // ("One of you is …", "This person is …", "Your core: …").
  const map: Record<SignId, string> = {
    aries: "moving first and figuring it out on the way — waiting isn't in the wiring",
    taurus: "committing slow and then never budging — what gets built sticks around",
    gemini: "running five tabs in the head at once, preferring a little of everything to a lot of one thing",
    cancer: "feeling the room before anyone speaks, with an instinct to take care of the people in it",
    leo: "walking in like the spotlight was installed for a reason — being noticed matters",
    virgo: "spotting the one thing that's off and not leaving it alone until it's fixed",
    libra: "finding the middle instead of winning the fight — sometimes too good at it",
    scorpio: "skipping the surface and going straight for the real, deep thing",
    sagittarius: "choosing the plane over the desk, every time — 'settling down' sounds like a threat",
    capricorn: "playing the long game since the start — outlasting everyone who began faster",
    aquarius: "seeing how things could be different and being fine being the only one there",
    pisces: "feeling what others can't put into words, with a thin line between own mood and everyone else's",
  };
  return map[signId];
}

// The specific CATCH with each sign — the honest shadow, not generic
function signCatch(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you start things you don't finish, and your temper flares before your brain catches up — the words you say in that window can do real damage",
    taurus: "you dig in and refuse to move even when moving is clearly the right call — 'steady' can calcify into 'stuck' without you noticing",
    gemini: "you skim the surface and miss the depth — you start ten books and finish two, and people can't always tell if you're listening or just waiting to talk",
    cancer: "you remember everything, including the things you'd be better off letting go of — and you can retreat into your shell so hard that people think you've disappeared",
    leo: "you need attention more than you admit, and you can make everything about you without realizing you're doing it — pride can stop you from apologizing first",
    virgo: "you're harder on yourself than anyone knows, and your 'helping' can turn into criticism that lands harder than you meant it to",
    libra: "you'll swallow your own needs to keep the peace, and then quietly resent everyone involved — you can stay in situations past their expiration because ending it feels too messy",
    scorpio: "you don't trust easily and you don't forget — you can hold a grudge for years, and your intensity can feel like control to people who don't know you well",
    sagittarius: "you're already mentally on the next thing before the current thing is done — commitment is hard when there's always something more interesting around the corner",
    capricorn: "you're so focused on the goal that you forget to live along the way — you can be cold without meaning to, and you'll work yourself into the ground before you ask for help",
    aquarius: "you can be so focused on being different that you forget to be close — people feel like they can't quite reach you, even when you're right there",
    pisces: "you absorb so much that you lose track of what's actually yours — escapism is a real risk when it all gets too much, and you can drown in someone else's stuff",
  };
  return map[signId];
}

// Where each sign's energy naturally concentrates — for connecting to houses
function signFocus(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "starting things, going first, charging at what you want",
    taurus: "building slowly, holding steady, making things last",
    gemini: "talking, learning, connecting ideas and people",
    cancer: "home, family, the people you call your own",
    leo: "being seen, creating, performing, giving warmth",
    virgo: "fixing, refining, being of service, getting it right",
    libra: "partnership, beauty, fairness, finding middle ground",
    scorpio: "depth, intensity, what's hidden, transformation",
    sagittarius: "freedom, travel, meaning, the big picture",
    capricorn: "ambition, structure, the long climb, authority",
    aquarius: "community, causes, being different, the future",
    pisces: "imagination, empathy, the unseen, escape",
  };
  return map[signId];
}

// How two signs interact — written FRESH for each pair, no template
function signPairInsight(a: SignId, b: SignId, aLabel: string, bLabel: string): string {
  if (a === b) {
    return `your ${aLabel} and ${bLabel} want the same thing, so you're consistent — but you share the same blind spots, and neither of you will catch what the other misses`;
  }
  const aEl = SIGN_META[a].element;
  const bEl = SIGN_META[b].element;

  // Specific cross-element insights — no template, each written fresh
  if (aEl === bEl) {
    const insights: Record<string, string> = {
      fire: `both ${aLabel} and ${bLabel} run on the same fuel — action and instinct — so you charge ahead together, but you might burn out together too`,
      earth: `both want things you can touch and trust — steady, real, lasting — so you build slowly together, but you might get stuck in routine together too`,
      air: `both live in their heads — ideas, words, connections — so you can talk for hours, but you might forget to actually feel anything together`,
      water: `both feel everything — so you understand each other without words, but you can also drown in each other's moods`,
    };
    return insights[aEl];
  }

  // Cross-element — each pair gets its own specific insight
  const pair = `${aEl}-${bEl}`;
  const insights: Record<string, string> = {
    "fire-air": `your ${aLabel} charges ahead and your ${bLabel} feeds it ideas — so you act on inspiration fast, but you can also spin out without finishing`,
    "air-fire": `your ${aLabel} generates ideas and your ${bLabel} acts on them — you make a fast, exciting team, but you can burn through things too quick`,
    "earth-water": `your ${aLabel} builds the structure and your ${bLabel} fills it with feeling — you make something real and deep together, but you can also get stuck in the same emotional groove`,
    "water-earth": `your ${aLabel} feels it and your ${bLabel} holds it steady — you ground each other, but the feeling can calcify into stubbornness if neither of you moves`,
    "fire-water": `your ${aLabel} wants to act and your ${bLabel} wants to feel — you're passionate and intense, but you can also evaporate each other: one pushes while the other retreats`,
    "water-fire": `your ${aLabel} is sensitive and your ${bLabel} is intense — the chemistry is real, but you trigger each other: one feels too much while the other does too much`,
    "earth-air": `your ${aLabel} wants results and your ${bLabel} wants ideas — you speak different languages, so you'll have to translate: the idea person has to land things, the builder has to stay open`,
    "air-earth": `your ${aLabel} wants concepts and your ${bLabel} wants tangibles — you move at different speeds, so you'll frustrate each other unless you name it: one's not wrong, they're just built different`,
  };
  return insights[pair] || `your ${aLabel} and ${bLabel} pull in different directions, and the work of your life is to integrate them`;
}

// ===========================================================================
// CROSS-CHART CONNECTION DETECTION
// ===========================================================================

const SIGN_ORDER: SignId[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

function absPosOf(signId: SignId, posInSign: number): number {
  const idx = SIGN_ORDER.indexOf(signId);
  return idx * 30 + (posInSign % 30);
}

function normalizeAngle(deg: number): number {
  const d = ((deg % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

const ASPECTS: { name: string; angle: number; orb: number; flavor: string }[] = [
  { name: "conjunction", angle: 0, orb: 8, flavor: "blends with" },
  { name: "opposition", angle: 180, orb: 8, flavor: "pulls against" },
  { name: "trine", angle: 120, orb: 7, flavor: "flows with" },
  { name: "square", angle: 90, orb: 7, flavor: "clashes with" },
  { name: "sextile", angle: 60, orb: 6, flavor: "cooperates with" },
];

interface DetectedConnection {
  otherId: PlanetId;
  otherSign: SignId;
  aspectName: string;
  flavor: string;
}

function detectConnections(planet: PlanetSummary, profile: NatalProfile): DetectedConnection[] {
  const myAbs = absPosOf(planet.signId, planet.pos);
  const found: DetectedConnection[] = [];

  for (const other of profile.planets) {
    if (other.id === planet.id) continue;
    const otherAbs = absPosOf(other.signId, other.pos);
    const sep = normalizeAngle(otherAbs - myAbs);

    let best: { name: string; angle: number; orb: number; flavor: string } | null = null;
    let bestOrb = Infinity;
    for (const def of ASPECTS) {
      const orb = Math.abs(sep - def.angle);
      if (orb <= def.orb && orb < bestOrb) {
        best = def;
        bestOrb = orb;
      }
    }

    if (best) {
      found.push({
        otherId: other.id,
        otherSign: other.signId,
        aspectName: best.name,
        flavor: best.flavor,
      });
    }
  }

  const order: Record<string, number> = { conjunction: 1, opposition: 2, square: 3, trine: 4, sextile: 5 };
  found.sort((a, b) => (order[a.aspectName] || 99) - (order[b.aspectName] || 99));
  return found.slice(0, 3);
}

function dominantElement(profile: NatalProfile): Element {
  const counts: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const all = [profile.sun.signId, profile.moon.signId, profile.ascendant.signId, ...profile.planets.map((p) => p.signId)];
  for (const sid of all) counts[SIGN_META[sid].element]++;
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "fire") as Element;
}

// ===========================================================================
// HOUSE DOMAIN — plain English, no "Nth house"
// ===========================================================================

function houseDomain(house: number): string {
  const map: Record<number, string> = {
    1: "how you come across to people — your body, your style, your first impression",
    2: "what you own, what you earn, and what you actually value",
    3: "everyday thinking and talking — how you learn, how you text, the small comings and goings",
    4: "home, family, and where you come from",
    5: "creativity, romance, and the things you do just because they're fun",
    6: "daily work, health, and the routines that hold everything together",
    7: "partnership and committed relationships",
    8: "intimacy, deep bonding, and the stuff that transforms you",
    9: "beliefs, big questions, travel, and what you're looking for when you go looking for meaning",
    10: "career, public role, and what people remember you for",
    11: "friends, groups, causes, and the future you're working toward",
    12: "solitude, dreams, and your private inner world",
  };
  return map[house] || "this area of your life";
}

function houseDomainShort(house: number): string {
  const map: Record<number, string> = {
    1: "your identity and first impression",
    2: "money and what you value",
    3: "everyday thinking and talking",
    4: "home and family",
    5: "creativity and fun",
    6: "daily work and health",
    7: "partnership",
    8: "intimacy and deep change",
    9: "meaning and big questions",
    10: "career and public life",
    11: "friends and community",
    12: "solitude and your inner world",
  };
  return map[house] || "this area of life";
}

// ===========================================================================
// MAIN: PLANET EXPLANATION
// ---------------------------------------------------------------------------
// Connections to other planets are WOVEN INTO the relevant sections,
// not dumped in a separate "connections" section.
// Each idea is said ONCE. No defining terms mid-sentence.
// ===========================================================================

export function generateDeepPlanetExplanation(
  planet: PlanetSummary,
  profile: NatalProfile
): DeepExplanation {
  const signName = SIGN_META[planet.signId].name;
  const element = SIGN_META[planet.signId].element;
  const interp = interpretPlanetInSign(planet.id, planet.signId);
  const sunSign = profile.sun.signId;
  const moonSign = profile.moon.signId;
  const risingSign = profile.ascendant.signId;

  // Detect real aspects to other planets — these get woven in naturally
  const connections = detectConnections(planet, profile);

  // Headline — a direct insight, not a label
  const headline = planetHeadline(planet.id, planet.signId);

  // Summary — sets up the whole picture in 2-3 sentences, weaving in the house
  const summary = planetSummary(planet, profile);

  const sections: ExplanationSection[] = [];

  // ---- SECTION 1: Where this hits hardest ----
  // Combines the house + sign energy + connection to Sun/Moon if relevant
  const whereBullets: string[] = [];
  whereBullets.push(`this concentrates in ${houseDomain(planet.house)}`);
  whereBullets.push(`when ${houseDomainShort(planet.house)} is going well, this part of you feels alive; when it's off, you feel it in your body`);

  // Weave in the sign energy as behavior, not definition
  whereBullets.push(`you bring ${signBehavior(planet.signId)} to this area specifically`);

  // Connection to Sun (if this isn't the Sun)
  if (planet.id !== "sun") {
    whereBullets.push(`this ${signPairInsight(planet.signId, sunSign, planetShort(planet.id), "core self")} — so what drives you consciously and what's happening here aren't always on the same page`);
  }

  sections.push({
    heading: "Where this hits hardest",
    bullets: whereBullets,
  });

  // ---- SECTION 2: What you actually do ----
  // Specific behaviors + a real moment, with connections woven in
  const whatBullets: string[] = [];

  // Use the traits but rephrase to be specific behaviors
  const traits = interp.traits || [];
  if (traits.length > 0) {
    for (const t of traits.slice(0, 2)) {
      whatBullets.push(`${t.label.toLowerCase().replace(/^you /, "")} ${t.text}`);
    }
  }

  // Add a real-moment example that's specific
  whatBullets.push(realMoment(planet, profile));

  // Weave in a connection to Moon (if this isn't the Moon)
  if (planet.id !== "moon") {
    whatBullets.push(`underneath all this, your emotional self ${signPairInsight(planet.signId, moonSign, planetShort(planet.id), "feelings")} — so even when you're doing your thing on the surface, your mood is running the show underneath`);
  }

  sections.push({
    heading: "What you actually do",
    bullets: whatBullets,
  });

  // ---- SECTION 3: The catch ----
  // The honest shadow — specific, not generic
  const catchBullets: string[] = [];
  catchBullets.push(signCatch(planet.signId));

  // Add the interp shadow if it adds something new
  if (interp.long.shadow && !catchBullets[0].includes(interp.long.shadow.slice(0, 30).toLowerCase())) {
    catchBullets.push(interp.long.shadow);
  }

  // Weave in a connection-based catch if there's a tense aspect
  const tenseConn = connections.find((c) => c.aspectName === "square" || c.aspectName === "opposition");
  if (tenseConn) {
    catchBullets.push(`this ${tenseConn.flavor} your ${planetShort(tenseConn.otherId)} — and when those two parts pull against each other, you feel torn in a way that's hard to name`);
  }

  sections.push({
    heading: "The catch",
    bullets: catchBullets,
  });

  // ---- SECTION 4: The fix ----
  // Actionable, specific — woven with the house
  const fixBullets: string[] = [];
  fixBullets.push(planetFix(planet.id, element));
  fixBullets.push(`pay attention to ${houseDomainShort(planet.house)} — that's where this energy has the most room to breathe or to go sideways`);
  fixBullets.push(interp.long.takeaway);

  sections.push({
    heading: "The fix",
    bullets: fixBullets,
  });

  return { headline, summary, sections };
}

// ---- Helpers for the planet explanation ----

function planetShort(id: PlanetId): string {
  const map: Record<string, string> = {
    sun: "core self", moon: "feelings", mercury: "mind", venus: "heart",
    mars: "drive", jupiter: "growth", saturn: "discipline", uranus: "rebel side",
    neptune: "dreamer", pluto: "depth", north_node: "life path", chiron: "wound", lilith: "wild side",
  };
  return map[id] || "this part";
}

function planetHeadline(id: PlanetId, signId: SignId): string {
  const behavior = signBehavior(signId);
  const map: Record<string, string> = {
    sun: `At your core, ${behavior}.`,
    moon: `Deep down, ${behavior}.`,
    mercury: `Your mind ${behavior}.`,
    venus: `In love, ${behavior}.`,
    mars: `Your drive ${behavior}.`,
    jupiter: `Life opens doors for you when ${behavior}.`,
    saturn: `Your hardest work — and biggest growth — comes because ${behavior}.`,
    uranus: `Your rebel side ${behavior}.`,
    neptune: `Your dreamer ${behavior}.`,
    pluto: `Your intensity ${behavior}.`,
    north_node: `You're being pulled toward a life where ${behavior}.`,
    chiron: `Your deepest wound — and your healing gift — is shaped by how ${behavior}.`,
    lilith: `Your wild side ${behavior}.`,
  };
  return map[id] || behavior.charAt(0).toUpperCase() + behavior.slice(1) + ".";
}

function planetSummary(planet: PlanetSummary, profile: NatalProfile): string {
  const signName = SIGN_META[planet.signId].name;
  const behavior = signBehavior(planet.signId);
  const domain = houseDomainShort(planet.house);

  // Vary the summary opening by planet
  if (planet.id === "sun") {
    return `You ${behavior}. This shows up most in ${domain} — that's where who you really are gets expressed loudest.`;
  }
  if (planet.id === "moon") {
    return `Underneath everything else, ${behavior}. This lives in ${domain} — when that area is off, your whole system feels it.`;
  }
  if (planet.id === "venus") {
    return `When it comes to love and attraction, ${behavior}. This concentrates in ${domain}.`;
  }
  if (planet.id === "mars") {
    return `When you go after something, ${behavior}. This energy points at ${domain}.`;
  }
  return `${behavior}. This part of you lives in ${domain}.`;
}

function realMoment(planet: PlanetSummary, profile: NatalProfile): string {
  const signName = SIGN_META[planet.signId].name;
  const domain = houseDomainShort(planet.house);
  const behavior = signBehavior(planet.signId);

  const map: Record<string, string> = {
    sun: `say someone criticizes something you did in ${domain}. You don't just brush it off — you take it personally, because this is where your identity lives. You might ${behavior.split(" — ")[0]} in response`,
    moon: `imagine coming home after a hard day. Whatever happened, you process it through ${domain}. If that area is solid, you recover. If it's a mess, the hard day gets harder`,
    mercury: `think about the last conversation that really mattered. You ${behavior}, and it was pointed at ${domain} — that's where you're sharpest`,
    venus: `remember the last time you felt truly drawn to someone. You ${behavior}, and it pulled you toward ${domain}`,
    mars: `remember the last time you got fired up. You ${behavior}, and it lit up in ${domain} — that's where you move without being told twice`,
    jupiter: `remember a time things just worked out, almost suspiciously well. You were probably ${behavior}, and it was happening through ${domain}`,
    saturn: `picture the thing in ${domain} that's been hard for as long as you can remember. That's the work — and it'll become your greatest strength if you put in the years`,
    uranus: `remember the last time your life in ${domain} suddenly changed without warning. You don't get gradual evolution here — you get plot twists`,
    neptune: `think about the part of ${domain} you idealize — the version in your head that's more beautiful than the real thing. That's your dreamer at work`,
    pluto: `picture the thing in ${domain} you can't stop thinking about, that pulls you in even when you know you should look away. It's not casual`,
    north_node: `think about what feels scary but important in ${domain}. Every time you lean toward it instead of away, you're growing in the direction you're meant to grow`,
    chiron: `remember the hurt in ${domain} you don't talk about much but that shaped you. Notice how you can sit with someone else hurting the same way and say exactly what they need — that's your medicine`,
    lilith: `picture the part of you that comes out in ${domain} that you don't fully control. The wild, untamed part`,
  };
  return map[planet.id] || `in daily life, this shows up most in ${domain}`;
}

function planetFix(id: PlanetId, element: Element): string {
  const map: Record<string, string> = {
    sun: element === "fire" ? "let someone else have the spotlight sometimes — it comes back doubled" : element === "earth" ? "let things change before you're forced to" : element === "air" ? "go deeper instead of wider — depth is where the surprise is" : "check what's actually yours to carry",
    moon: element === "fire" ? "sleep on big reactions — the feeling is real, the words can wait" : element === "earth" ? "let yourself feel instead of going numb" : element === "air" ? "get out of your head and into your body" : "build boundaries so you don't drown in others' feelings",
    mercury: element === "fire" ? "think before you speak — the first thing that comes to mind isn't always the right thing" : element === "earth" ? "stay open to other perspectives" : element === "air" ? "decide instead of endlessly discussing" : "don't take every conversation personally",
    venus: element === "fire" ? "slow down and let love build, not just spark" : element === "earth" ? "let go of what's past its time" : element === "air" ? "go deeper than surface attraction" : "keep yourself intact instead of merging completely",
    mars: element === "fire" ? "channel the fire instead of letting it explode" : element === "earth" ? "be willing to change course when needed" : element === "air" ? "argue to understand, not to win" : "be direct instead of passive-aggressive",
    jupiter: "pace yourself — more isn't always better, and growth doesn't have to be loud",
    saturn: "be gentle with yourself — the work matters, but so do you",
    uranus: "channel the rebellion instead of letting it run the show — being different is a tool, not a personality",
    neptune: "love the dream but check it against reality — potential isn't the same as a person",
    pluto: "let go of what you can't control — transformation doesn't require you to steer it",
    north_node: "lean toward what scares you — that's literally the direction you're meant to go",
    chiron: "let the wound teach you instead of defining you — your pain is also your medicine",
    lilith: "own it consciously — don't repress it, don't let it run you, learn its name",
  };
  return map[id] || "find the middle path instead of the extreme";
}

// ===========================================================================
// ASCENDANT (Rising) EXPLANATION
// ===========================================================================

export function generateDeepAscendantExplanation(profile: NatalProfile): DeepExplanation {
  const asc = profile.ascendant;
  const signName = SIGN_META[asc.signId].name;
  const sunSign = profile.sun.signId;
  const moonSign = profile.moon.signId;
  const sunName = SIGN_META[sunSign].name;
  const moonName = SIGN_META[moonSign].name;

  const headline = ascendantHeadline(asc.signId);

  const summary = `The first thing people pick up from you is ${signBehavior(asc.signId)}. This is your front door — the version of you that people meet before they're invited in.`;

  const sections: ExplanationSection[] = [];

  // 1. How people meet you
  const traits = ascendantTraits(asc.signId);
  sections.push({
    heading: "How people meet you",
    body: `When someone new meets you, here's what they're actually picking up:`,
    bullets: traits.map((t) => `${t.label.toLowerCase().replace(/^you /, "")} ${t.text}`),
  });

  // 2. The gap between your door and your inside
  // This WOVES IN the Sun and Moon connection naturally
  const sameAsSun = asc.signId === sunSign;
  const sameAsMoon = asc.signId === moonSign;

  let gapBody: string;
  const gapBullets: string[] = [];

  if (sameAsSun) {
    gapBody = `Your front door and your inside match — what people see is what they get.`;
    gapBullets.push(`people get you right away, and that's a real advantage`);
    gapBullets.push(`the catch: you share the same blind spots on the outside and the inside — there's no internal counterweight to catch what you miss`);
    gapBullets.push(`your ${moonName} feelings are the part that still surprises people once they get close — that's the layer underneath`);
  } else if (sameAsMoon) {
    gapBody = `Your front door and your emotional foundation are the same energy.`;
    gapBullets.push(`people can read your mood, even if they don't know why — you wear your feelings closer to the surface than most`);
    gapBullets.push(`the benefit: you feel congruent — what you show matches how you feel`);
    gapBullets.push(`the catch: it's harder to hide how you feel, which is tough when you need privacy`);
    gapBullets.push(`your ${sunName} core is the part that's different — it's the center of you that doesn't match the surface`);
  } else {
    gapBody = `Your front door, your inside, and your foundation are all different energies — that's normal, and it's actually a strength.`;
    gapBullets.push(`people meet ${signName} energy first, but once they get close, your ${sunName} core comes through — and that's when they see who you really are`);
    gapBullets.push(`your ${moonName} feelings are the last layer — that's what people see when they've earned real closeness`);
    gapBullets.push(`you'll surprise people as they get to know you: "I didn't expect you to be like that" — that's not inconsistency, that's depth`);
    gapBullets.push(`the work is integrating these layers into one whole person, not picking one over the others`);
  }

  sections.push({
    heading: "The gap between your door and your inside",
    body: gapBody,
    bullets: gapBullets,
  });

  // 3. The catch
  const long = ascendantLong(asc.signId);
  sections.push({
    heading: "The catch",
    bullets: [
      long.shadow,
      `people who only see your front door don't really know you yet — and sometimes you forget that too`,
    ],
  });

  // 4. The fix
  sections.push({
    heading: "The fix",
    bullets: [
      long.takeaway,
      `let people earn the deeper layers — don't assume someone knows you just because they've met your front door`,
    ],
  });

  return { headline, summary, sections };
}

// ===========================================================================
// SYNASTRY (Compatibility) EXPLANATION
// ---------------------------------------------------------------------------
// Per Rule 7: explain the REAL reason two specific placements click or clash,
// not a generic pairing description or just a score.
// ===========================================================================

export function generateDeepSynastryExplanation(
  pointId: string,
  aSign: SignId,
  bSign: SignId,
  _profile?: CompatibilityContext
): DeepExplanation {
  const a = SIGN_META[aSign];
  const b = SIGN_META[bSign];
  const name = pointDisplayName(pointId);
  const sameSign = aSign === bSign;
  const sameEl = a.element === b.element;

  const headline = synastryHeadline(pointId, aSign, bSign);

  const summary = `One of you is ${signBehavior(aSign)}; the other is ${signBehavior(bSign)}. Here's what that actually means for the two of you.`;

  const sections: ExplanationSection[] = [];

  // 1. What this part is about for both of you
  sections.push({
    heading: "What this part is about",
    bullets: [
      synastryDomain(pointId),
      `this is the area where you'll either click naturally or need to translate for each other`,
    ],
  });

  // 2. Why you click (or don't) — written FRESH, no template
  const clickBullets: string[] = [];

  if (sameSign) {
    clickBullets.push(`you both ${signBehavior(aSign)} — so you don't have to explain yourself here, they just get it`);
    clickBullets.push(`the risk: you share the same blind spots, so where one of you is weak, the other is too — and neither of you will notice`);
    clickBullets.push(`you might amplify each other's extremes because there's no counterbalance`);
  } else if (sameEl) {
    clickBullets.push(`you process this area through the same basic flavor — different words, same grammar`);
    clickBullets.push(`${signPairInsight(aSign, bSign, "your approach", "their approach")}`);
    clickBullets.push(`easy to understand each other, even when the surface details differ — you won't challenge each other to grow here, and that's fine if you don't need to`);
  } else {
    clickBullets.push(`${signPairInsight(aSign, bSign, "your approach", "their approach")}`);
    clickBullets.push(`you bring different strengths: where one of you is weak, the other might be strong — if you learn from each other instead of fighting, you'll grow in ways you couldn't alone`);
    clickBullets.push(`the friction is real — you'll misunderstand each other here, even when you're both trying. The key is not assuming your way is the right way; it's just your way`);
  }

  sections.push({
    heading: sameSign ? "Why you mirror each other" : sameEl ? "Why you understand each other" : "Why you'll need to translate",
    bullets: clickBullets,
  });

  // 3. What this looks like in daily life — specific to the point
  const dailyBullets: string[] = synastryDailyLife(pointId, sameSign, sameEl);
  if (dailyBullets.length > 0) {
    sections.push({
      heading: "What this looks like day to day",
      bullets: dailyBullets,
    });
  }

  // 4. The real insight — what you each need to learn
  const insightBullets: string[] = [];
  if (sameSign) {
    insightBullets.push(`you'll both avoid the same conversations — name the thing neither of you wants to talk about, and you'll unlock something real`);
    insightBullets.push(`don't take the understanding for granted — same-sign bonds can get lazy because everything feels easy`);
  } else if (sameEl) {
    insightBullets.push(`you have natural compatibility — lean into it, this is one of the easy parts of your relationship`);
    insightBullets.push(`if you want to grow, you'll have to seek it outside this area — you won't push each other here`);
  } else {
    insightBullets.push(`this is a growth area — don't avoid it, but don't force it either. Meet each other halfway`);
    insightBullets.push(`${signBehavior(aSign)} meets ${signBehavior(bSign)} — the tension between those two approaches is where you'll either grow together or wear each other down`);
    insightBullets.push(`the person who can name what's happening ("you're approaching this from feeling, I'm approaching it from logic") usually dissolves the friction`);
  }

  sections.push({
    heading: "The real insight",
    bullets: insightBullets,
  });

  return { headline, summary, sections };
}

function synastryHeadline(pointId: string, aSign: SignId, bSign: SignId): string {
  const sameSign = aSign === bSign;
  const sameEl = SIGN_META[aSign].element === SIGN_META[bSign].element;
  const name = pointDisplayName(pointId);

  if (sameSign) {
    return `You both ${signBehavior(aSign)} — same wavelength here.`;
  }
  if (sameEl) {
    return `You speak the same language here — different words, same grammar.`;
  }
  return `You'll need to translate for each other here.`;
}

function synastryDomain(pointId: string): string {
  const map: Record<string, string> = {
    sun: "this is about who you fundamentally are — when your core selves align, you recognize something essential in each other",
    moon: "this is about your emotional world — what you need to feel safe, what comforts you, whether living together feels like home or like work",
    mercury: "this is about how you think and talk — your communication style, how you argue, whether you feel understood",
    venus: "this is about love and attraction — your love language, what you find beautiful, whether there's real chemistry",
    mars: "this is about drive — how you go after things, your energy, your temper, whether you fight well or badly",
    jupiter: "this is about growth and meaning — whether you inspire each other or hold each other back",
    saturn: "this is about structure and limits — your work ethic, your fears, what gives the relationship staying power",
    uranus: "this is about change and rebellion — excitement and unpredictability, or destabilizing chaos",
    neptune: "this is about dreams and imagination — magical and fated, or seeing what you want to see",
    pluto: "this is about power and transformation — life-changing intensity, or a power struggle",
    north_node: "this is about your life path — what you're meant to learn from each other",
    chiron: "this is about wounds and healing — one of you will touch the other's old wound",
    lilith: "this is about your wild side — intensity, sexuality, and shadow",
    ascendant: "this is about how you come across — your first-impression energy",
    midheaven: "this is about your calling — your public role and ambitions",
    mc: "this is about your calling — your public role and ambitions",
  };
  return map[pointId.toLowerCase()] || "this is an important part of how you connect";
}

function synastryDailyLife(pointId: string, sameSign: boolean, sameEl: boolean): string[] {
  const map: Record<string, string[]> = {
    sun: [
      sameSign ? "you either feel like teammates or like you're competing for the same space — the daily question is whose needs come first today" : "you'll either feel like you're running on the same fuel or like you're speaking different languages",
    ],
    moon: [
      sameSign ? "you feel comfortable in the same ways — similar rhythms of closeness and space, similar ideas of what 'home' feels like" : "you process feelings differently — one of you might need to talk it out while the other needs to retreat",
      "this shows up at home, in private, when you're not performing — do you relax around each other, or stay slightly on guard?",
    ],
    mercury: [
      "this is every conversation, every text, every argument — do you find the right words with each other, or talk past each other?",
      sameSign ? "you argue the same way, which means fights are fast and over quick — or they escalate fast because neither of you backs down" : "you argue in different styles — one direct, one indirect — and misunderstandings stack up if you don't name it",
    ],
    venus: [
      "this is the chemistry — the way you touch, flirt, and show affection",
      sameSign ? "you love the same way, so affection feels effortless — but you might also have the same blind spots in love" : "you show love differently — one of you might need words, the other might need touch, and you'll have to learn each other's language",
    ],
    mars: [
      "this is how you do things together — make decisions, fight, chase what you want",
      sameSign ? "you move at the same pace, which is great until you both charge at the same wall" : "you move at different speeds — one fast, one slow — and that takes patience but prevents stalemate",
    ],
  };
  return map[pointId.toLowerCase()] || [];
}

export interface CompatibilityContext {
  aHouse?: number;
  bHouse?: number;
}

// ===========================================================================
// SOULMATE EXPLANATION
// ===========================================================================

export function generateDeepSoulmateExplanation(
  profile: NatalProfile,
  persona: SoulmatePersona
): DeepExplanation {
  const userSun = profile.sun.signId;
  const userMoon = profile.moon.signId;
  const userVenus = profile.planets.find((p) => p.id === "venus")?.signId;
  const userMars = profile.planets.find((p) => p.id === "mars")?.signId;

  const pSun = persona.placements.sun;
  const pMoon = persona.placements.moon;
  const pVenus = persona.placements.venus;
  const pMars = persona.placements.mars;

  const headline = `${persona.vibe} — ${persona.score}/100 match`;

  const summary = `This person is ${signBehavior(pSun)}. Here's why that specifically complements your chart — and what being with them would actually feel like.`;

  const sections: ExplanationSection[] = [];

  // 1. Why their core matches yours
  sections.push({
    heading: "Why their core matches yours",
    bullets: [
      `Your core: ${signBehavior(userSun)}. Theirs: ${signBehavior(pSun)}.`,
      `${signPairInsight(userSun, pSun, "your core", "their core")}`,
      userSun === pSun ? "you'll recognize each other immediately — but you'll also share the same blind spots" : "different energies means you bring different strengths — where one is weak, the other is strong",
    ],
  });

  // 2. Why their feelings match yours
  sections.push({
    heading: "Why their feelings match yours",
    bullets: [
      `Your emotional self: ${signBehavior(userMoon)}. Theirs: ${signBehavior(pMoon)}.`,
      `${signPairInsight(userMoon, pMoon, "your feelings", "their feelings")}`,
      userMoon === pMoon ? "your rhythms sync naturally — same idea of what 'home' feels like" : "you'll need to learn each other's emotional rhythms, but you won't trigger each other the same way every time",
      "this is the part that decides whether living together feels like home or like work",
    ],
  });

  // 3. Why their love nature matches yours
  if (userVenus) {
    sections.push({
      heading: "Why their love nature matches yours",
      bullets: [
        `In love — you: ${signBehavior(userVenus)}. Them: ${signBehavior(pVenus)}.`,
        `${signPairInsight(userVenus, pVenus, "your heart", "their heart")}`,
        "this is the chemistry layer — whether there's real attraction or just friendship",
      ],
    });
  }

  // 4. Why their drive matches yours
  if (userMars) {
    sections.push({
      heading: "Why their drive matches yours",
      bullets: [
        `Going after things — you: ${signBehavior(userMars)}. Them: ${signBehavior(pMars)}.`,
        `${signPairInsight(userMars, pMars, "your drive", "their drive")}`,
        userMars === pMars ? "you'll move at the same pace — for better and worse" : "different drive energies means you'll approach things differently, which takes patience but prevents stalemate",
        "this is the spark layer — physical chemistry, how you fight, how you chase what you want together",
      ],
    });
  }

  // 5. What this would actually feel like
  sections.push({
    heading: "What this would actually feel like",
    bullets: [
      `mornings: your ${SIGN_META[userMoon].name} feelings and their ${SIGN_META[pMoon].name} feelings ${userMoon === pMoon ? "are the same — same rhythms, same idea of home" : "sync naturally — your emotional rhythms complement each other"}`,
      `evenings: your ${SIGN_META[userSun].name} core and their ${SIGN_META[pSun].name} core ${userSun === pSun ? "are the same — being yourselves together feels effortless" : "complement each other — being yourselves together feels easy"}`,
      `when you disagree: ${userMars && userMars === pMars ? "your drive energies match — quick, direct, over fast" : "your different drive energies mean you'll approach conflict differently — patience prevents stalemate"}`,
    ],
  });

  // 6. The growth edge
  const sunSameEl = SIGN_META[userSun].element === SIGN_META[pSun].element;
  sections.push({
    heading: "The growth edge",
    bullets: [
      sunSameEl
        ? `you share the same core energy, which means you share the same blind spots — where ${SIGN_META[userSun].name} is weak, you're both weak, and neither will notice`
        : userMoon === pMoon
        ? `your emotional selves are the same, so you'll trigger each other the same way every time — you'll need to develop tools neither of you naturally has`
        : `your charts complement each other, so you'll sometimes feel like you're speaking different languages — the growth is learning to translate`,
      "this isn't a dealbreaker — it's just the area where you'll do real work. Every strong relationship has one",
    ],
  });

  // 7. Takeaway
  sections.push({
    heading: "Takeaway",
    bullets: [
      persona.rank === 1
        ? "this is your top match — if you meet someone whose chart looks like this, pay attention. The foundation is real"
        : `this is a strong match — ranked #${persona.rank}. The foundation is solid, even if it's not #1`,
      "real people are more than their charts, but if you meet someone with these placements, they're worth your time",
    ],
  });

  return { headline, summary, sections };
}

// ===========================================================================
// FLAG EXPLANATION
// ===========================================================================

export type FlagType = "red" | "growth" | "quirk" | "green";

export function generateDeepFlagExplanation(
  profile: NatalProfile,
  flag: Flag,
  flagType: FlagType,
  category: string
): DeepExplanation {
  const headline = flag.title;

  const typeLabel = flagType === "red" ? "Red flag" : flagType === "growth" ? "Growth area" : flagType === "green" ? "Green flag" : "Quirk";
  const summary = `${typeLabel} in ${category}: ${flag.detail}`;

  const sections: ExplanationSection[] = [];

  // 1. What's actually happening
  sections.push({
    heading: "What's actually happening",
    bullets: [
      flag.detail,
      flagTypeContext(flagType),
    ],
  });

  // 2. Where this comes from in your chart
  sections.push({
    heading: "Where this comes from",
    body: flagSourcesExplanation(profile, flag.sources),
  });

  // 3. How it shows up
  sections.push({
    heading: "How it shows up",
    bullets: [
      `this pattern shows up ${flagCategoryContext(category)}`,
      "it might not happen every day, but when it does, you'll recognize it — the first step to working with any pattern is catching it in the moment",
    ],
  });

  // 4. The catch (for red/growth/quirk)
  if (flagType !== "green") {
    sections.push({
      heading: flagType === "red" ? "The shadow" : "The risk",
      bullets: [flagShadow(flagType)],
    });
  }

  // 5. The fix (for red/growth)
  if (flagType !== "green" && flagType !== "quirk") {
    sections.push({
      heading: "The fix",
      bullets: [flagAdvice(flagType)],
    });
  }

  // 6. Takeaway
  sections.push({
    heading: "Takeaway",
    bullets: [flagTakeaway(flagType)],
  });

  return { headline, summary, sections };
}

function flagTypeContext(flagType: FlagType): string {
  if (flagType === "red") return "this is a real problem pattern, not just a quirk — left unaddressed, it can sabotage the things you care about";
  if (flagType === "growth") return "this isn't broken — it's just not fully developed yet, and it's where you have the most potential to expand";
  if (flagType === "green") return "this is a genuine strength — something that comes naturally to you and other people notice";
  return "this is just a quirk — a specific way you are, not good or bad, but worth knowing about";
}

function flagSourcesExplanation(profile: NatalProfile, sources: string[]): string {
  if (!sources || sources.length === 0) {
    return "This pattern comes from the overall shape of your chart, not one single placement — it's how your different parts interact.";
  }

  const lines = sources.map((src) => {
    const lower = src.toLowerCase();
    const planetMatch = lower.match(/^(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|north node|chiron|lilith|rising|ascendant)/);
    if (!planetMatch) return `${src} — one of the chart signals driving this pattern.`;

    const planetName = planetMatch[1];
    const planetId = planetName === "rising" || planetName === "ascendant" ? null : planetName.replace(" ", "_");
    const planet = planetId ? profile.planets.find((p) => p.id === planetId) : null;

    if (planet) {
      const signName = SIGN_META[planet.signId].name;
      const domain = houseDomainShort(planet.house);
      const retroNote = planet.retrograde ? " (and it works in a more internal way for you)" : "";
      return `${src}${retroNote}. In your chart, this is colored by ${signName} energy and shows up most in ${domain}.`;
    }
    if (planetName === "rising" || planetName === "ascendant") {
      return `${src}. Your rising sign is ${SIGN_META[profile.ascendant.signId].name}, which shapes how this pattern shows up outwardly.`;
    }
    return `${src} — one of the chart signals driving this pattern.`;
  });

  return lines.join("\n\n");
}

function flagCategoryContext(category: string): string {
  const map: Record<string, string> = {
    relationship: "in how you show up in love and partnership",
    communication: "in how you talk and argue",
    emotional: "in how you process feelings",
    behavioral: "in your day-to-day patterns",
  };
  return map[category] || "in your daily life";
}

function flagShadow(flagType: FlagType): string {
  if (flagType === "red") return "left unchecked, this can sabotage the things you care about — not all at once, but like a slow leak. You'll notice it in hindsight: 'why does this keep happening?'";
  if (flagType === "growth") return "the risk isn't that this stays underdeveloped — it's that you'll compensate in ways that cost you later. Workarounds work for a while, then don't.";
  return "the risk is you'll either suppress this (which doesn't work) or lean into it too hard (which makes it define you). The middle path is knowing when it serves you and when it gets in the way.";
}

function flagAdvice(flagType: FlagType): string {
  if (flagType === "red") return "don't try to fix this all at once. Pick one small moment per day where this pattern shows up, and practice doing it differently. Tell someone you trust — outsiders see it more clearly than you do.";
  if (flagType === "growth") return "find one situation per week where you can practice this area. Growth happens through repetition, not intensity. Be patient — this is the part of you that's still becoming.";
  return "notice when this quirk helps you and when it doesn't. You don't need to change it — just get conscious about when to lean in and when to dial back.";
}

function flagTakeaway(flagType: FlagType): string {
  if (flagType === "red") return "this is a real pattern, but it's not a life sentence. Awareness is the first move — you can't change what you can't see.";
  if (flagType === "growth") return "this is your edge. The work is real, but so is the payoff.";
  if (flagType === "green") return "this is a gift. Use it, share it, don't downplay it.";
  return "this is just how you are. Knowing it makes you easier to be around — for yourself and for others.";
}

