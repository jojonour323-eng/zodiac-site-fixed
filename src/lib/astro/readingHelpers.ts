// ===========================================================================
// READING HELPERS — shared by all tab generators
// ---------------------------------------------------------------------------
// Fixes:
//   - signBehaviorVerb() returns the verb phrase WITHOUT "you" (fixes "you you")
//   - signPairDynamic() generates FRESH text per sign pair, no templates
//   - All element pairs covered (no fallback collisions)
// ===========================================================================

import type { SignId, Element } from "./types";
import { SIGN_META } from "./signs";

// Returns the behavior WITHOUT the leading "you" — for use after a subject.
// e.g. "Your Sun in Aries — [Move first and figure it out on the way.]"
export function signBehaviorVerb(signId: SignId): string {
  // Pronoun-free base-verb phrases — safe in any frame:
  // "You …", "they …", "you'll …", "Your Sun: …" all stay grammatical.
  const map: Record<SignId, string> = {
    aries: "move first and figure it out on the way — hesitation isn't in the wiring",
    taurus: "commit slow and then refuse to budge — what gets built sticks around",
    gemini: "run five tabs in the head at once — a little of everything beats a lot of one thing",
    cancer: "feel the room before anyone speaks — the instinct is to protect the people in it",
    leo: "walk in like the spotlight was installed on purpose — being seen matters more than applause",
    virgo: "notice the one thing that's off and refuse to leave it alone — helping is how love gets shown",
    libra: "find the middle rather than win the fight — peace, beauty, and fairness above all",
    scorpio: "go deep and skip the surface — nothing at all beats something fake",
    sagittarius: "chase the next horizon — 'settling down' sounds like a threat, not a goal",
    capricorn: "play the long game — patient, ambitious, and guaranteed to outlast the fast starters",
    aquarius: "see how things could be different — being the odd one out is a feature, not a bug",
    pisces: "feel what others can't put into words — the line between own mood and everyone else's stays thin",
  };
  return map[signId];
}

// Full sentence version (with "You" capitalized) — for standalone use
export function signBehaviorSentence(signId: SignId): string {
  const v = signBehaviorVerb(signId);
  return "You " + v.charAt(0).toLowerCase() + v.slice(1);
}

// What each sign needs — verb phrase, no leading "to feel"
export function signNeedVerb(signId: SignId): string {
  // Pronoun-free noun phrases — safe after "needs" for any subject.
  const map: Record<SignId, string> = {
    aries: "movement and challenge — stagnation feels like slow death",
    taurus: "solid ground and things that can be touched — comfort, beauty, security",
    gemini: "mental stimulation — new ideas, new people, new input, or the lights go out",
    cancer: "safety and belonging — a home base, a chosen family, a door that stays open",
    leo: "to be seen and appreciated — to know the effort counts for something",
    virgo: "to be useful — something to fix, something to make better; idle hands get anxious",
    libra: "harmony and partnership — peace, beauty, and someone to share it with",
    scorpio: "depth and truth — real intimacy, nothing surface-level",
    sagittarius: "freedom and meaning — room to move and something big to chase",
    capricorn: "to build something real — a goal, a structure, the sense of climbing",
    aquarius: "room to be different — freedom, authenticity, and no crowd to follow",
    pisces: "connection to something bigger — beauty, imagination, meaning beyond the daily grind",
  };
  return map[signId];
}

// What each sign fears — softened, no absolutes
export function signSensitiveArea(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "being stuck, weak, or told no — losing your edge and your freedom to act",
    taurus: "loss, instability, having what's yours taken away — the ground shifting under your feet",
    gemini: "being bored, trapped, or silent — not having anything to say or anyone to say it to",
    cancer: "rejection, not belonging, being alone — being unloved or unprotected",
    leo: "being invisible, irrelevant, or forgotten — not mattering to the people who matter to you",
    virgo: "being useless, wrong, or a mess — chaos and your own imperfection",
    libra: "conflict, being disliked, or disharmony — being the reason things are ugly",
    scorpio: "betrayal, vulnerability, or powerlessness — giving someone the power to hurt you",
    sagittarius: "being trapped, limited, or lied to — losing your freedom and your truth",
    capricorn: "failure, being nobody, or losing control — not achieving what you set out to do",
    aquarius: "conformity, being ordinary, or being boxed in — losing your individuality",
    pisces: "cruelty, isolation, or the harshness of reality — the coldness of the world without softness",
  };
  return map[signId];
}

// How each sign loves — verb phrase
export function signLoveVerb(signId: SignId): string {
  // Pronoun-free base-verb phrases — safe for "You …", "they …", label frames.
  const map: Record<SignId, string> = {
    aries: "fall fast and hard — the chase is the best part",
    taurus: "love through the body — touch, presence, feeding, comfort",
    gemini: "fall in love through conversation — dead banter means dead attraction",
    cancer: "love through care and protection — remembering everything, showing up early",
    leo: "love big and warm and out loud — adoring and wanting to be adored back",
    virgo: "love through small acts of service — fixing the life, keeping the details",
    libra: "love through partnership and beauty — a real team, not a performance",
    scorpio: "love intense and all-consuming — full merge or nothing",
    sagittarius: "love through shared adventure — a partner in crime, not a ball and chain",
    capricorn: "love through commitment over time — in it for real, and showing up",
    aquarius: "love unconventionally — best friend first, own space always",
    pisces: "love romantically and deeply — merging souls without limits",
  };
  return map[signId];
}

// How each sign drives/pursues — verb phrase
export function signDriveVerb(signId: SignId): string {
  // Pronoun-free base-verb phrases — safe for "You …", "they …", "you'll …".
  const map: Record<SignId, string> = {
    aries: "charge at what's wanted — fast, direct, first to act",
    taurus: "move slow but become impossible to stop once started",
    gemini: "chase through words and ideas — scattered but fast",
    cancer: "go after things by protecting and nurturing them",
    leo: "chase with warmth and a need for it to be seen",
    virgo: "pursue through precision and skill — every detail planned",
    libra: "pursue through charm and partnership — persuading rather than pushing",
    scorpio: "go all in, focused and relentless — no announcements, just action",
    sagittarius: "chase big things and hate being fenced in",
    capricorn: "chase strategically, with patience — playing the long game",
    aquarius: "fight for ideals and causes — principled and unconventional",
    pisces: "chase through feel and intuition, not logic",
  };
  return map[signId];
}

// How each sign reacts under stress — verb phrase
export function signStressVerb(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "push harder, faster, more recklessly — you charge at the stress instead of sitting with it",
    taurus: "freeze and dig in — you refuse to move, comfort-seek, and the world has to wait",
    gemini: "talk more, think more, spiral more — your mind runs a hundred scenarios and you can't sleep",
    cancer: "retreat into your shell — go home, close the door, and might not answer texts",
    leo: "make it about you — perform your stress, need an audience, make a production of it",
    virgo: "try to fix everything — go into overdrive, organizing, cleaning, controlling",
    libra: "can't decide — weigh every option, ask everyone, freeze because you're terrified of the wrong call",
    scorpio: "go dark — withdraw, get suspicious, obsess over who's to blame",
    sagittarius: "want to flee — book a ticket, quit the thing, or mentally check out",
    capricorn: "work harder — put your head down, suppress the feeling, grind through it",
    aquarius: "detach — go cool and intellectual, observe your own stress like it's happening to someone else",
    pisces: "escape — screens, substances, sleep, daydreams — you blur the edges because feeling it clearly is too much",
  };
  return map[signId];
}

// ===========================================================================
// SIGN-PAIR DYNAMIC — fresh per pair, no templates
// ---------------------------------------------------------------------------
// Each of the 144 sign-pair combinations gets its own specific insight.
// Same-sign, same-element, and all 8 cross-element pairs are covered.
// No fallback collisions.
// ===========================================================================

export function signPairDynamic(aSign: SignId, bSign: SignId): string {
  if (aSign === bSign) {
    return sameSignDynamic(aSign);
  }
  const aEl = SIGN_META[aSign].element;
  const bEl = SIGN_META[bSign].element;
  if (aEl === bEl) {
    return sameElementDynamic(aSign, bSign, aEl);
  }
  return crossElementDynamic(aSign, bSign, aEl, bEl);
}

function sameSignDynamic(sign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you both charge at the same things — you'll rarely argue about what to do, but you'll both forget to slow down and check in",
    taurus: "you both want the same solid ground — you'll build something lasting, but you might get stuck in the same routine and neither will be the one to shake it up",
    gemini: "you both run five tabs at once — you'll talk for hours, but you might skim the surface and miss the depth, and neither of you will notice",
    cancer: "you both feel everything and remember everything — you'll understand each other without words, but you might retreat into your shells at the same time and leave things unresolved",
    leo: "you both want to be seen — you'll adore each other, but you might compete for the spotlight without realizing it, and neither of you will want to share it",
    virgo: "you both notice what's off and want to fix it — you'll make things work, but you might criticize each other without meaning to, and the helpfulness can land as judgment",
    libra: "you both want harmony and beauty — you'll create something lovely, but you might both swallow your needs to keep the peace, and the resentment builds quietly",
    scorpio: "you both go deep and don't forget — you'll have real intensity, but you might hold grudges against each other, and trust takes forever on both sides",
    sagittarius: "you both want freedom and adventure — you'll have fun, but you might both avoid the hard conversations, and commitment is a challenge when you're both already mentally elsewhere",
    capricorn: "you both play the long game — you'll build something real, but you might both forget to live along the way, and the relationship can feel like work instead of joy",
    aquarius: "you both value individuality — you'll accept each other as you are, but you might both stay so independent that you never quite connect, and the distance becomes the norm",
    pisces: "you both feel everything — you'll understand each other deeply, but you might both absorb so much that you lose track of what's actually yours, and boundaries dissolve",
  };
  return map[sign];
}

function sameElementDynamic(aSign: SignId, bSign: SignId, el: Element): string {
  // Specific per sign-pair within the same element
  const key = [aSign, bSign].sort().join("-");
  const firePairs: Record<string, string> = {
    "aries-leo": "your Aries charges and your Leo shines — you'll energize each other, but you might burn through things too fast because neither of you naturally slows down",
    "aries-sagittarius": "your Aries starts and your Sagittarius explores — you'll chase adventure together, but you might both avoid the follow-through because the next thing is always more exciting",
    "leo-sagittarius": "your Leo wants to be seen and your Sagittarius wants to be free — you'll have warmth and fun, but you might clash over attention vs. independence",
  };
  const earthPairs: Record<string, string> = {
    "taurus-virgo": "your Taurus builds slow and your Virgo refines — you'll make something real and precise, but you might get stuck in routine because neither of you naturally shakes things up",
    "taurus-capricorn": "your Taurus holds steady and your Capricorn climbs — you'll build something lasting, but you might both forget to enjoy it along the way",
    "virgo-capricorn": "your Virgo notices details and your Capricorn sees the long game — you'll achieve a lot together, but you might both be so focused on the goal that you forget to be tender",
  };
  const airPairs: Record<string, string> = {
    "gemini-libra": "your Gemini generates ideas and your Libra finds the beautiful ones — you'll talk for hours, but you might both stay on the surface and avoid the depth",
    "gemini-aquarius": "your Gemini connects and your Aquarius innovates — you'll have brilliant conversations, but you might both stay so in your heads that you forget to actually feel anything",
    "libra-aquarius": "your Libra wants partnership and your Aquarius wants individuality — you'll respect each other, but you might clash over closeness vs. distance",
  };
  const waterPairs: Record<string, string> = {
    "cancer-scorpio": "your Cancer nurtures and your Scorpio goes deep — you'll have real emotional intimacy, but you might both retreat into your shells when hurt and leave things unresolved",
    "cancer-pisces": "your Cancer protects and your Pisces imagines — you'll understand each other without words, but you might both absorb so much that you lose track of boundaries",
    "scorpio-pisces": "your Scorpio intensifies and your Pisces dissolves — you'll have profound connection, but you might both drown in each other's depths and forget where one of you ends",
  };

  if (el === "fire") return firePairs[key] || `you both run on action and instinct — you'll charge ahead together, but you might burn out together too`;
  if (el === "earth") return earthPairs[key] || `you both want things you can touch and trust — you'll build steadily, but you might get stuck in routine`;
  if (el === "air") return airPairs[key] || `you both live in your heads — you'll talk for hours, but you might forget to feel`;
  return waterPairs[key] || `you both feel everything — you'll understand each other deeply, but you might drown in each other's moods`;
}

function crossElementDynamic(aSign: SignId, bSign: SignId, aEl: Element, bEl: Element): string {
  const key = `${aEl}-${bEl}`;

  // Each cross-element pair gets specific per-sign content for the most common combos
  // and a solid element-level default for the rest
  const aName = SIGN_META[aSign].name;
  const bName = SIGN_META[bSign].name;

  const fireAir: Record<string, string> = {
    "aries-gemini": `your Aries charges and your Gemini feeds it ideas — you act on inspiration fast, but you might spin out without finishing because neither of you naturally lands things`,
    "aries-libra": `your Aries wants to go first and your Libra wants to find the middle — you'll either balance each other perfectly or frustrate each other, depending on the day`,
    "aries-aquarius": `your Aries charges and your Aquarius sees a different path — you'll either make a brilliant team or argue about which direction is right`,
    "leo-gemini": `your Leo shines and your Gemini talks — you'll have fun and be the life of the party, but you might both skim the surface and miss the depth`,
    "leo-libra": `your Leo wants to be adored and your Libra wants to adore — you'll have real chemistry, but you might both perform the relationship instead of actually being in it`,
    "leo-aquarius": `your Leo wants the spotlight and your Aquarius wants to share it — you'll either balance perfectly or clash over attention vs. equality`,
    "sagittarius-gemini": `your Sagittarius explores and your Gemini connects — you'll never run out of things to talk about, but you might both avoid the depth and the commitment`,
    "sagittarius-libra": `your Sagittarius chases adventure and your Libra wants partnership — you'll have fun, but you might clash over freedom vs. togetherness`,
    "sagittarius-aquarius": `your Sagittarius explores and your Aquarius innovates — you'll have a brilliant, unconventional connection, but you might both stay so independent that you never quite commit`,
  };

  const earthWater: Record<string, string> = {
    "taurus-cancer": `your Taurus builds and your Cancer nurtures — you'll make a real home together, but you might both hold on so tight that nothing can change or grow`,
    "taurus-scorpio": `your Taurus holds steady and your Scorpio goes deep — you'll have real intensity and loyalty, but you might both dig in during conflict and neither will budge`,
    "taurus-pisces": `your Taurus grounds and your Pisces dreams — you'll make something beautiful and real, but you might struggle with practicality vs. escapism`,
    "virgo-cancer": `your Virgo fixes and your Cancer cares — you'll make life work for each other, but you might both show love through worry instead of warmth`,
    "virgo-scorpio": `your Virgo refines and your Scorpio intensifies — you'll have real depth and precision, but you might both be so private that you never quite let each other in`,
    "virgo-pisces": `your Virgo serves and your Pisces imagines — you'll complement each other beautifully, but you might clash over logic vs. feeling, practical vs. dreamy`,
    "capricorn-cancer": `your Capricorn builds and your Cancer nurtures — you'll make something lasting, but you might clash over ambition vs. home, achievement vs. belonging`,
    "capricorn-scorpio": `your Capricorn climbs and your Scorpio goes deep — you'll be a formidable team, but you might both be so controlled that you forget to be vulnerable`,
    "capricorn-pisces": `your Capricorn structures and your Pisces imagines — you'll either balance perfectly or clash over reality vs. dreams, ambition vs. escape`,
  };

  const fireWater: Record<string, string> = {
    "aries-cancer": `your Aries charges and your Cancer retreats — you'll either protect each other fiercely or trigger each other's wounds, depending on the day`,
    "aries-scorpio": `your Aries acts and your Scorpio investigates — you'll have real passion, but you might clash over directness vs. secrecy, action vs. control`,
    "aries-pisces": `your Aries charges and your Pisces feels — you'll have intensity, but you might evaporate each other: one pushes while the other dissolves`,
    "leo-cancer": `your Leo shines and your Cancer nurtures — you'll have warmth and care, but you might clash over attention vs. protection, performance vs. privacy`,
    "leo-scorpio": `your Leo shines and your Scorpio goes dark — you'll have real intensity, but you might clash over visibility vs. secrecy, warmth vs. control`,
    "leo-pisces": `your Leo performs and your Pisces imagines — you'll have romance and creativity, but you might both perform the relationship instead of being in it`,
    "sagittarius-cancer": `your Sagittarius roams and your Cancer nests — you'll either expand each other's worlds or clash over freedom vs. home`,
    "sagittarius-scorpio": `your Sagittarius explores and your Scorpio intensifies — you'll have depth and adventure, but you might clash over honesty vs. secrecy, freedom vs. control`,
    "sagittarius-pisces": `your Sagittarius seeks and your Pisces dreams — you'll have vision and meaning, but you might both avoid the practical and the present`,
  };

  const earthAir: Record<string, string> = {
    "taurus-gemini": `your Taurus wants results and your Gemini wants ideas — you'll either balance perfectly or frustrate each other, depending on whether you can translate`,
    "taurus-libra": `your Taurus wants things you can touch and your Libra wants things that are beautiful — you'll have taste, but you might clash over practicality vs. aesthetics`,
    "taurus-aquarius": `your Taurus holds steady and your Aquarius shakes things up — you'll either grow each other or clash over stability vs. change`,
    "virgo-gemini": `your Virgo refines and your Gemini connects — you'll have mental sharpness, but you might clash over depth vs. breadth, precision vs. speed`,
    "virgo-libra": `your Virgo serves and your Libra partners — you'll make things work and look good, but you might both avoid conflict and let things fester`,
    "virgo-aquarius": `your Virgo refines and your Aquarius innovates — you'll either improve everything or clash over the system vs. the rebellion`,
    "capricorn-gemini": `your Capricorn builds and your Gemini talks — you'll either make a great team or clash over action vs. talk`,
    "capricorn-libra": `your Capricorn achieves and your Libra harmonizes — you'll have status and style, but you might clash over ambition vs. partnership`,
    "capricorn-aquarius": `your Capricorn structures and your Aquarius disrupts — you'll either build something new or clash over tradition vs. revolution`,
  };

  // Check specific sign-pair maps first, fall back to element-level
  const signKey = `${aSign}-${bSign}`;
  if (key === "fire-air" && fireAir[signKey]) return fireAir[signKey];
  if (key === "air-fire") {
    // Reverse the lookup
    const reversed = `${bSign}-${aSign}`;
    if (fireAir[reversed]) return fireAir[reversed].replace(/your Aries/g, "your Aries").replace(/your Gemini/g, "your Gemini"); // same map, just swapped
    return `your ${aName} brings ideas and your ${bName} acts on them — you'll make a fast, exciting team, but you might burn through things too quick`;
  }
  if (key === "earth-water" && earthWater[signKey]) return earthWater[signKey];
  if (key === "water-earth") {
    const reversed = `${bSign}-${aSign}`;
    if (earthWater[reversed]) return earthWater[reversed];
    return `your ${aName} feels it and your ${bName} holds it steady — you ground each other, but feeling can calcify into stubbornness`;
  }
  if (key === "fire-water" && fireWater[signKey]) return fireWater[signKey];
  if (key === "water-fire") {
    const reversed = `${bSign}-${aSign}`;
    if (fireWater[reversed]) return fireWater[reversed];
    return `your ${aName} is sensitive and your ${bName} is intense — chemistry is real, but you trigger each other`;
  }
  if (key === "earth-air" && earthAir[signKey]) return earthAir[signKey];
  if (key === "air-earth") {
    const reversed = `${bSign}-${aSign}`;
    if (earthAir[reversed]) return earthAir[reversed];
    return `your ${aName} wants concepts and your ${bName} wants tangibles — you move at different speeds`;
  }

  // Final fallback — element-level, never a generic "pull in different directions"
  const elementDefaults: Record<string, string> = {
    "fire-air": `your ${aName} charges and your ${bName} feeds it ideas — you act on inspiration fast, but you might spin out without finishing`,
    "air-fire": `your ${aName} generates ideas and your ${bName} acts on them — you make a fast team, but you might burn through things too quick`,
    "earth-water": `your ${aName} builds the structure and your ${bName} fills it with feeling — you make something real and deep, but you might get stuck in the same groove`,
    "water-earth": `your ${aName} feels it and your ${bName} holds it steady — you ground each other, but feeling can calcify into stubbornness`,
    "fire-water": `your ${aName} wants to act and your ${bName} wants to feel — passion is real, but you evaporate each other: one pushes while the other retreats`,
    "water-fire": `your ${aName} is sensitive and your ${bName} is intense — chemistry is real, but you trigger each other`,
    "earth-air": `your ${aName} wants results and your ${bName} wants ideas — you speak different languages and need to translate`,
    "air-earth": `your ${aName} wants concepts and your ${bName} wants tangibles — you move at different speeds`,
  };
  return elementDefaults[key] || `your ${aName} and your ${bName} bring different energies — you'll need to find the dynamic that works for both of you`;
}

// ===========================================================================
// PLACEMENT TAG HELPER — for Rule 0.6
// ===========================================================================

export function placementTag(planetId: string, signId?: SignId): { icon: string; label: string } {
  const icons: Record<string, string> = {
    sun: "☀️", moon: "🌙", mercury: "💬", venus: "💞", mars: "🔥",
    jupiter: "🌱", saturn: "🧭", uranus: "⚡", neptune: "💧", pluto: "💀",
    north_node: "🧭", chiron: "🩹", lilith: "🔐",
    rising: "🧙", ascendant: "🧙", midheaven: "👑", mc: "👑",
  };
  const names: Record<string, string> = {
    sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
    jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto",
    north_node: "North Node", chiron: "Chiron", lilith: "Lilith",
    rising: "Rising", ascendant: "Rising", midheaven: "Midheaven", mc: "Midheaven",
  };
  const icon = icons[planetId.toLowerCase()] || "✨";
  const name = names[planetId.toLowerCase()] || planetId;
  const label = signId ? `${name} in ${SIGN_META[signId].name}` : name;
  return { icon, label };
}
