// ===========================================================================
// PERSONAL READING ENGINE
// ---------------------------------------------------------------------------
// Completely replaces the old per-planet explanation system.
//
// This engine reads the WHOLE chart first, identifies themes, contradictions,
// and patterns, then generates a flowing personal reading organized into
// 13 narrative sections — from "Who you are" to "How your chart works together."
//
// Every section weaves multiple placements together. The goal is for the user
// to feel like they're reading about one whole person, not 15 separate planets.
// ===========================================================================

import type { NatalProfile, PlanetSummary, SignId, PlanetId, Element, Modality } from "./types";
import { SIGN_META, ELEMENT_VIBE } from "./signs";
import { houseMeaning, ordinal } from "./interpretations";

// ---- Public types ----

export type BlockType = "paragraph" | "callout" | "example" | "subheading" | "bullets" | "quote" | "meta";

export interface ReadingBlock {
  type: BlockType;
  text?: string;        // for paragraph / callout / example / subheading
  items?: string[];     // for bullets
  label?: string;       // for callout label or subheading text
  variant?: "insight" | "shadow" | "example" | "strength" | "growth";
  tone?: "good" | "avoid"; // for bullets — green-for-good / red-for-avoid
}

export interface ReadingSection {
  id: string;
  title: string;
  label?: string;       // memorable nickname, e.g. "The Cannonball"
  blocks: ReadingBlock[];
}

export interface PersonalReading {
  archetype: string;     // overall chart nickname
  archetypeLine: string; // one-line summary of the archetype
  intro: string;         // hook paragraph
  sections: ReadingSection[];
}

// ===========================================================================
// CHART ANALYSIS
// ---------------------------------------------------------------------------
// The engine looks at the whole chart BEFORE writing anything.
// ===========================================================================

interface ChartAnalysis {
  sun: PlanetSummary;
  moon: PlanetSummary;
  rising: SignId;
  midheaven: SignId;
  mercury?: PlanetSummary;
  venus?: PlanetSummary;
  mars?: PlanetSummary;
  jupiter?: PlanetSummary;
  saturn?: PlanetSummary;
  uranus?: PlanetSummary;
  neptune?: PlanetSummary;
  pluto?: PlanetSummary;
  northNode?: PlanetSummary;
  chiron?: PlanetSummary;
  lilith?: PlanetSummary;
  dominantElement: Element;
  dominantModality: Modality;
  elementCounts: Record<Element, number>;
  modalityCounts: Record<Modality, number>;
  stelliums: { house: number; planets: string[] }[];
  retrogrades: PlanetId[];
  themes: string[];          // top 3 recurring themes
  contradictions: string[];  // detected contradiction descriptions
  houseActivity: Record<number, PlanetSummary[]>;
}

function analyzeChart(profile: NatalProfile): ChartAnalysis {
  const find = (id: string) => profile.planets.find((p) => p.id === id);

  // Element + modality counts
  const elementCounts: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCounts: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  const allSigns: SignId[] = [profile.sun.signId, profile.moon.signId, profile.ascendant.signId, ...profile.planets.map((p) => p.signId)];
  for (const sid of allSigns) {
    elementCounts[SIGN_META[sid].element]++;
    modalityCounts[SIGN_META[sid].modality]++;
  }
  const dominantElement = (Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "fire") as Element;
  const dominantModality = (Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "cardinal") as Modality;

  // Stelliums — houses with 3+ planets
  const houseActivity: Record<number, PlanetSummary[]> = {};
  for (const p of profile.planets) {
    if (!houseActivity[p.house]) houseActivity[p.house] = [];
    houseActivity[p.house].push(p);
  }
  const stelliums = Object.entries(houseActivity)
    .filter(([_, planets]) => planets.length >= 3)
    .map(([house, planets]) => ({ house: Number(house), planets: planets.map((p) => p.name) }))
    .sort((a, b) => b.planets.length - a.planets.length);

  // Retrogrades
  const retrogrades = profile.planets.filter((p) => p.retrograde).map((p) => p.id);

  // Theme detection — map signs to themes, aggregate
  const themeCounts: Record<string, number> = {};
  for (const sid of allSigns) {
    for (const theme of SIGN_THEMES[sid] || []) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  }
  // Also add house themes
  for (const p of profile.planets) {
    for (const theme of HOUSE_THEMES[p.house] || []) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 0.5; // house themes weighted less
    }
  }
  const themes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t]) => t);

  // Contradiction detection
  const contradictions: string[] = [];
  const sunEl = SIGN_META[profile.sun.signId].element;
  const moonEl = SIGN_META[profile.moon.signId].element;
  const risingEl = SIGN_META[profile.ascendant.signId].element;

  if (sunEl !== moonEl) {
    contradictions.push(`your core wants ${sunEl} energy but your emotional needs run on ${moonEl} energy — what you chase and what you need aren't always the same thing`);
  }
  if (risingEl !== sunEl) {
    contradictions.push(`the face you show the world (${SIGN_META[profile.ascendant.signId].name}) doesn't fully match who you are underneath (${SIGN_META[profile.sun.signId].name}) — people are often surprised when they get to know the real you`);
  }
  const venus = find("venus");
  const mars = find("mars");
  if (venus && mars && venus.signId !== mars.signId) {
    contradictions.push(`what attracts you (${SIGN_META[venus.signId].name}) and how you pursue it (${SIGN_META[mars.signId].name}) pull in different directions — you can be drawn to one kind of energy but chase another`);
  }
  const saturn = find("saturn");
  if (saturn && saturn.house !== profile.sun.house) {
    contradictions.push(`you shine most in ${houseDomainShort(profile.sun.house)}, but your hardest work — and biggest growth — is in ${houseDomainShort(saturn.house)} — where you want to be and where you have to grow aren't the same place`);
  }

  return {
    sun: profile.sun,
    moon: profile.moon,
    rising: profile.ascendant.signId,
    midheaven: profile.midheaven.signId,
    mercury: find("mercury"),
    venus,
    mars,
    jupiter: find("jupiter"),
    saturn,
    uranus: find("uranus"),
    neptune: find("neptune"),
    pluto: find("pluto"),
    northNode: find("north_node"),
    chiron: find("chiron"),
    lilith: find("lilith"),
    dominantElement,
    dominantModality,
    elementCounts,
    modalityCounts,
    stelliums,
    retrogrades,
    themes,
    contradictions,
    houseActivity,
  };
}

// Theme keywords per sign
const SIGN_THEMES: Record<SignId, string[]> = {
  aries: ["independence", "action", "courage", "starting"],
  taurus: ["stability", "patience", "possession", "building"],
  gemini: ["curiosity", "communication", "movement", "variety"],
  cancer: ["belonging", "protection", "feeling", "home"],
  leo: ["recognition", "expression", "warmth", "performance"],
  virgo: ["service", "precision", "improvement", "duty"],
  libra: ["partnership", "harmony", "beauty", "fairness"],
  scorpio: ["intensity", "control", "transformation", "depth"],
  sagittarius: ["freedom", "meaning", "adventure", "truth"],
  capricorn: ["ambition", "authority", "discipline", "achievement"],
  aquarius: ["individuality", "community", "rebellion", "future"],
  pisces: ["empathy", "imagination", "escape", "spirituality"],
};

const HOUSE_THEMES: Record<number, string[]> = {
  1: ["identity", "self-expression"],
  2: ["security", "possession", "money"],
  3: ["communication", "movement"],
  4: ["home", "belonging", "roots"],
  5: ["creativity", "romance", "play"],
  6: ["service", "routine", "duty"],
  7: ["partnership", "relationship"],
  8: ["intensity", "transformation", "control"],
  9: ["meaning", "freedom", "adventure"],
  10: ["ambition", "authority", "recognition"],
  11: ["community", "individuality", "future"],
  12: ["escape", "spirituality", "solitude"],
};

// ===========================================================================
// SIGN BEHAVIOR LIBRARY
// ---------------------------------------------------------------------------
// Rich, behavioral descriptions — not labels. Used by section generators.
// ===========================================================================

function signCore(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you move first and figure it out on the way. Hesitation isn't really in your vocabulary — you'd rather try and fail than wonder what if, and your instinct is always to charge at the thing in front of you",
    taurus: "you commit slow and then don't budge. Once you've decided something — a person, a path, a plan — you're in it for the long haul, and what you build tends to stick around because you refuse to quit on it",
    gemini: "you're always three ideas ahead, running five tabs in your head at once. You'd rather know a little about everything than go deep on one thing, and boring is your actual enemy",
    cancer: "you feel the room before anyone speaks. Your instinct is to take care of the people in it, and your loyalty is fierce — but you also retreat into your shell when you're hurt, and people don't always realize how much you remember",
    leo: "you walk in like you belong there, and honestly you do. You want to be seen — not for applause, but for who you actually are — and you give back the same warmth you're hoping to receive",
    virgo: "you notice the one thing that's off and you can't leave it alone until it's fixed. Helping is how you show love, but you're harder on yourself than anyone knows, and your standards are quietly brutal",
    libra: "you'd rather find the middle than win the fight, and you're genuinely good at it. You want things beautiful, fair, and peaceful — but you can swallow your own needs to keep the harmony, then resent everyone involved",
    scorpio: "you don't do surface. You want the real thing, the deep thing, the true thing — and you'd rather have nothing than have something fake. Once you're in, you're all the way in, but trust takes forever",
    sagittarius: "you'd rather be on a plane than at a desk. 'Settling down' sounds like a threat — you want meaning, adventure, and the freedom to chase the next big thing, and routine slowly kills you",
    capricorn: "you've been playing the long game since you were young. You're ambitious, patient, and you'll outlast everyone who started faster — but you can forget to live along the way because the goal is always ahead",
    aquarius: "you see how things could be different, and you're not afraid to be the one who's not like everyone else. You care about the big picture and the collective — but people can feel like they can't quite reach you, even when you're right there",
    pisces: "you feel what other people can't put into words. The line between your mood and theirs is thin, and you have real intuition — but you can absorb so much that you lose track of what's actually yours",
  };
  return map[signId];
}

// Verb-only version: returns the behavior WITHOUT the leading "you".
// Use this when the sentence already has a subject, e.g. "Your mind [verb phrase]."
// This fixes the "Your mind you move first" bug.
function signCoreVerb(signId: SignId): string {
  const core = signCore(signId);
  // Remove the leading "you " or "you're " and capitalize the first letter
  let v = core.replace(/^you're\s+/i, "").replace(/^you\s+/i, "");
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function signNeed(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "to feel like you're moving — stagnation feels like death to you, and you need action, challenge, and the freedom to charge",
    taurus: "to feel solid — comfort, beauty, and knowing what's yours. You need things you can touch and trust, not promises in the air",
    gemini: "to feel mentally stimulated — you need new ideas, new people, new input, or you start to fade",
    cancer: "to feel safe and belong — you need your people, your home base, and the sense that you're protected",
    leo: "to feel seen and appreciated — you need to know you matter, that your presence is noticed, that your effort counts",
    virgo: "to feel useful — you need to be of service, to fix something, to make things better. Idle hands make you anxious",
    libra: "to feel harmonious — you need peace, beauty, and partnership. Conflict physically drains you",
    scorpio: "to feel the truth — you need depth, honesty, and real intimacy. Surface-level anything makes you itch",
    sagittarius: "to feel free — you need space, movement, and meaning. Being fenced in slowly suffocates you",
    capricorn: "to feel like you're building something — you need a goal, a structure, and the sense that you're climbing toward something real",
    aquarius: "to feel like yourself — you need freedom, authenticity, and a sense that you're not just following the crowd",
    pisces: "to feel connected — you need beauty, imagination, and the sense that there's something bigger than the daily grind",
  };
  return map[signId];
}

function signFear(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "being stuck, being weak, being told no — you fear losing your edge and your freedom to act",
    taurus: "loss, instability, having what's yours taken away — you fear the ground shifting under your feet",
    gemini: "being bored, being trapped, being silent — you fear not having anything to say or anyone to say it to",
    cancer: "rejection, not belonging, being alone — you fear being unloved or unprotected",
    leo: "being invisible, being irrelevant, not mattering — you fear being forgotten or ignored",
    virgo: "being useless, being wrong, being a mess — you fear chaos and your own imperfection",
    libra: "conflict, being disliked, disharmony — you fear being the reason things are ugly",
    scorpio: "betrayal, being vulnerable, being powerless — you fear giving someone the power to hurt you",
    sagittarius: "being trapped, being limited, being lied to — you fear losing your freedom and your truth",
    capricorn: "failure, being nobody, losing control — you fear not achieving what you set out to do",
    aquarius: "conformity, being ordinary, being boxed in — you fear losing your individuality",
    pisces: "cruelty, isolation, the harshness of reality — you fear the coldness of the world without softness",
  };
  return map[signId];
}

function signLoveStyle(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you fall fast and hard — the chase is the best part, and you want to win them. Once you have them, you're passionate but you can lose interest when the spark fades",
    taurus: "you love through the body — touch, presence, feeding them, making them comfortable. You're loyal to the bone, but you can hold on past the expiration date",
    gemini: "you fall in love through conversation — if the banter's dead, the attraction is too. You need mental stimulation or you start to wander",
    cancer: "you love through care and protection — you want to make them feel safe, and you remember everything. But you can mother-smother when you're anxious",
    leo: "you love big and warm and out loud — you want to adore them and be adored back. You need to feel special, and you'll wither without appreciation",
    virgo: "you love through small acts of service — you fix their life, you remember the details, you make things work. But you can turn helpful into critical without meaning to",
    libra: "you love through partnership and beauty — you want it to feel like a real team, and you're a romantic at heart. But you'll swallow your needs to keep the peace",
    scorpio: "you love intense and all-consuming — you want to merge, to know them completely, to be trusted with their dark. But you can tip into possessiveness and control",
    sagittarius: "you love through shared adventure — you want a partner in crime, not a ball and chain. You need freedom inside the relationship or you'll bolt",
    capricorn: "you love through commitment over time — you're in it for real, and you show up. But you can be cold on the surface and forget to be tender",
    aquarius: "you love unconventionally — you want a best friend first, and you need your own space. But you can be so independent that your partner feels shut out",
    pisces: "you love romantically, deeply, without limits — you want to merge souls. But you can fall in love with potential instead of the real person, and lose yourself in them",
  };
  return map[signId];
}

function signAngerStyle(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "fast and loud — you blow up, then it's over. But the words you say in that window can do real damage",
    taurus: "slow burn — you don't get angry often, but when you do, it's a wall. You dig in and refuse to move",
    gemini: "verbal — you argue to win, and you're good at it. But you can talk in circles and never actually resolve anything",
    cancer: "you go quiet and retreat into your shell — the anger comes out as withdrawal, sulking, or indirect jabs",
    leo: "dramatic — you want the anger to be seen and felt. You'll make a scene, but you also forgive fast if you're acknowledged",
    virgo: "critical — your anger comes out as nitpicking, fixing, pointing out everything that's wrong. It's sharper than you mean it to be",
    libra: "you avoid it — you'll swallow the anger to keep the peace, then it leaks out as passive-aggression or quiet resentment",
    scorpio: "cold and precise — you don't forget, and you can wait a long time. Your anger is controlled, not explosive, which makes it scarier",
    sagittarius: "blunt and fast — you say the true thing, sometimes too true, and then you've moved on while they're still processing",
    capricorn: "controlled — you don't show it. You handle it coldly, strategically, and you might just cut the person off without a scene",
    aquarius: "detached — you get intellectually angry, arguing from principle. You can feel cold when you're actually furious",
    pisces: "you absorb it — your anger often gets tangled with sadness, and it can come out as tears, withdrawal, or a vague sense of being wronged without saying why",
  };
  return map[signId];
}

function signUnderStress(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you push harder, faster, more recklessly — you charge at the stress instead of sitting with it, which can burn bridges",
    taurus: "you freeze and dig in — you refuse to move, comfort-eat or comfort-spend, and the world has to wait for you to be ready",
    gemini: "you talk more, think more, spiral more — your mind runs a hundred scenarios and you can't sleep because you're processing out loud",
    cancer: "you retreat into your shell — you go home, close the door, and might not answer texts. You need safety before you can function",
    leo: "you make it about you — you perform your stress, you need an audience, and you can make a 3-act production out of a minor inconvenience",
    virgo: "you try to fix everything — you go into overdrive, organizing, cleaning, controlling, because if you can fix the small things, maybe the big thing feels manageable",
    libra: "you can't decide — you weigh every option endlessly, ask everyone's opinion, and freeze because you're terrified of making the wrong call",
    scorpio: "you go dark — you withdraw, you get suspicious, you obsess over who's to blame, and you can spiral into paranoia or control",
    sagittarius: "you want to flee — you book a ticket, quit the thing, or mentally check out. Your instinct is that distance will fix it",
    capricorn: "you work harder — you put your head down, suppress the feeling, and grind through it. You'll handle it like an adult, but you might not feel it until months later",
    aquarius: "you detach — you go cool and intellectual, observe your own stress like it's happening to someone else, and people feel like they can't reach you",
    pisces: "you escape — screens, substances, sleep, daydreams. You blur the edges of the stress because feeling it clearly is too much",
  };
  return map[signId];
}

function signWhenConfident(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you're unstoppable — you start things other people are afraid to start, and your courage is genuinely contagious",
    taurus: "you're a rock — people lean on you because you don't waver, and what you build has real weight and staying power",
    gemini: "you're brilliant — you connect ideas no one else sees, and you can talk to anyone about anything, which opens doors everywhere",
    cancer: "you're the heart — people feel safe with you, and your care is the thing that holds groups, families, and relationships together",
    leo: "you light up the room — your warmth is magnetic, and when you're confident, you give other people permission to shine too",
    virgo: "you're the one who makes it work — your precision and care turn chaos into order, and people trust you with what matters",
    libra: "you're the diplomat — you can broker peace between anyone, and your taste and fairness make everything you touch more beautiful",
    scorpio: "you're transformative — you go deep where others won't, and your intensity can heal, change, and rebuild what's broken",
    sagittarius: "you're the explorer — you expand everyone's horizons, and your honesty and optimism are genuinely inspiring",
    capricorn: "you're the one who actually does it — you build the thing, you climb the mountain, and your discipline makes real things happen",
    aquarius: "you're the visionary — you see the future, you question the system, and you give people permission to be themselves",
    pisces: "you're the mystic — you feel what others can't, you create what others can't imagine, and your empathy is a genuine superpower",
  };
  return map[signId];
}

function signShadow(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you start things you don't finish, your temper flares before your brain catches up, and you can steamroll people who move slower than you",
    taurus: "you dig in and refuse to move even when moving is the right call — 'steady' can calcify into 'stuck' without you noticing",
    gemini: "you skim the surface and miss the depth, you start ten books and finish two, and people can't always tell if you're listening or just waiting to talk",
    cancer: "you remember everything — including what you'd be better off letting go of — and you can retreat so hard into your shell that people think you've disappeared",
    leo: "you need attention more than you admit, and you can make everything about you without realizing it. Pride can stop you from apologizing first",
    virgo: "you're harder on yourself than anyone knows, and your 'helping' can turn into criticism that lands harder than you meant it to",
    libra: "you'll swallow your own needs to keep the peace, then quietly resent everyone involved. You can stay in situations past their expiration because ending it feels too messy",
    scorpio: "you don't trust easily and you don't forget — you can hold a grudge for years, and your intensity can feel like control to people who don't know you well",
    sagittarius: "you're already mentally on the next thing before the current thing is done — commitment is hard when there's always something more interesting around the corner",
    capricorn: "you're so focused on the goal that you forget to live along the way — you can be cold without meaning to, and you'll work yourself into the ground before you ask for help",
    aquarius: "you can be so focused on being different that you forget to be close — people feel like they can't quite reach you, even when you're right there",
    pisces: "you absorb so much that you lose track of what's actually yours — escapism is a real risk when it all gets too much, and you can drown in someone else's stuff",
  };
  return map[signId];
}

// ===========================================================================
// HOUSE DOMAIN HELPERS
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
// CROSS-PLACEMENT INSIGHTS
// ===========================================================================

function elementPairInsight(aEl: Element, bEl: Element, aLabel: string, bLabel: string): string {
  if (aEl === bEl) {
    const insights: Record<Element, string> = {
      fire: `both your ${aLabel} and ${bLabel} run on the same fuel — action and instinct — so you charge ahead consistently, but you might burn out together too`,
      earth: `both want things you can touch and trust — steady, real, lasting — so you're consistent, but you might get stuck in routine`,
      air: `both live in their heads — ideas, words, connections — so you're mentally sharp, but you might forget to actually feel anything`,
      water: `both feel everything — so you understand yourself deeply, but you can also drown in your own moods`,
    };
    return insights[aEl];
  }
  const pair = `${aEl}-${bEl}`;
  const insights: Record<string, string> = {
    "fire-air": `your ${aLabel} charges ahead and your ${bLabel} feeds it ideas — you act on inspiration fast, but you can spin out without finishing`,
    "air-fire": `your ${aLabel} generates ideas and your ${bLabel} acts on them — you make a fast, exciting team inside yourself, but you can burn through things too quick`,
    "earth-water": `your ${aLabel} builds the structure and your ${bLabel} fills it with feeling — you make something real and deep, but you can get stuck in the same groove`,
    "water-earth": `your ${aLabel} feels it and your ${bLabel} holds it steady — you ground yourself, but feeling can calcify into stubbornness if neither moves`,
    "fire-water": `your ${aLabel} wants to act and your ${bLabel} wants to feel — you're passionate and intense, but you can evaporate yourself: pushing while retreating`,
    "water-fire": `your ${aLabel} is sensitive and your ${bLabel} is intense — the chemistry is real, but you trigger yourself: one part feels too much while the other does too much`,
    "earth-air": `your ${aLabel} wants results and your ${bLabel} wants ideas — you speak different languages inside yourself, so you'll have to translate: land the ideas, stay open to concepts`,
    "air-earth": `your ${aLabel} wants concepts and your ${bLabel} wants tangibles — you move at different speeds internally, which can frustrate you unless you name it`,
  };
  return insights[pair] || `your ${aLabel} and ${bLabel} pull in different directions, and integrating them is the work of your life`;
}

// ===========================================================================
// SECTION GENERATORS
// ===========================================================================

function generateWhoYouAre(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const sun = a.sun;
  const moon = a.moon;
  const blocks: ReadingBlock[] = [];

  // Opening — the big picture, weaving Sun + Moon + dominant element
  blocks.push({
    type: "paragraph",
    text: `Your Sun is in ${SIGN_META[sun.signId].name} — the core of who you are. With this placement, ${signCore(sun.signId)}. That's the engine running underneath everything you do. But you also have a Moon in ${SIGN_META[moon.signId].name} — your emotional self. ${signCoreVerb(moon.signId)}. So your conscious self wants one thing and your emotional self needs another, and the relationship between those two is a big part of who you are.`,
  });

  // The dominant element theme
  blocks.push({
    type: "paragraph",
    text: `Your chart overall leans heavily into ${elementVibe(a.dominantElement)}. That's not a detail — it's the climate of your whole personality. It means you process life through ${elementChannel(a.dominantElement)}, and when you're in a situation that doesn't let you do that, you feel off in a way you can't always name.`,
  });

  // Callout — the one-line essence
  blocks.push({
    type: "callout",
    variant: "insight",
    label: "The one-line version",
    text: oneLineEssence(sun.signId, moon.signId, a.dominantElement),
  });

  // What drives you vs what you need — woven, not separate
  const sunEl = SIGN_META[sun.signId].element;
  const moonEl = SIGN_META[moon.signId].element;
  if (sunEl !== moonEl) {
    blocks.push({
      type: "paragraph",
      text: `Here's the interesting part: ${elementPairInsight(sunEl, moonEl, "core drive", "emotional needs")}. In practice, this means you'll sometimes feel like two different people — the you who charges at what you want, and the you who needs to feel safe before you can actually relax. Neither is wrong. They're just running on different fuel, and the work of your life is learning to fuel both without letting one starve the other.`,
    });
  } else {
    blocks.push({
      type: "paragraph",
      text: `Because your core drive and your emotional needs run on the same fuel (${sunEl} energy), you're more consistent than most people. What you want and what you need aren't fighting each other — they're pointing the same direction. The catch: you share the same blind spots on both sides, so there's no internal counterweight to catch what you miss. You'll need other people to show you what you can't see in yourself.`,
    });
  }

  // Example
  blocks.push({
    type: "example",
    text: realLifeExampleWhoYouAre(sun.signId, moon.signId),
  });

  // Subheading + what you're here to do
  blocks.push({
    type: "subheading",
    label: "What you're here to do",
  });
  blocks.push({
    type: "paragraph",
    text: `You're here to ${lifePurpose(sun.signId, moon.signId, a)}. Not in a mystical "destiny" way — in the sense that this is the energy you're built to express, and when you're expressing it, you feel most alive. When you're not, you feel like you're living someone else's life.`,
  });

  return {
    id: "who-you-are",
    title: "Who you are",
    label: archetypeName(sun.signId, moon.signId, a.dominantElement),
    blocks,
  };
}

function generateHowPeopleSeeYou(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const rising = a.rising;
  const sun = a.sun;
  const moon = a.moon;
  const risingName = SIGN_META[rising].name;
  const sunName = SIGN_META[sun.signId].name;
  const moonName = SIGN_META[moon.signId].name;

  blocks.push({
    type: "paragraph",
    text: `Your Rising sign is ${SIGN_META[rising].name} — the first thing people pick up from you. When someone meets you, they're not meeting your core self yet; they're meeting the version of you that ${signCore(rising).split(".")[0].toLowerCase().replace(/^you /, "")}. That's your front door: the version that comes out in new situations, with strangers, in job interviews, on first dates. It's not fake — it's just the outermost layer, the one that opens before the rest of you walks through.`,
  });

  // The gap — woven, not separate
  const sameAsSun = rising === sun.signId;
  const sameAsMoon = rising === moon.signId;

  if (sameAsSun) {
    blocks.push({
      type: "paragraph",
      text: `Here's the thing: your front door and your inside match. What people see is what they get — you're consistent, and people get you right away. That's a real advantage. The trade-off: you share the same blind spots on the outside and the inside, so there's no internal counterweight. Your ${moonName} emotional self is the part that still surprises people once they get close — that's the layer underneath that doesn't match the surface.`,
    });
  } else if (sameAsMoon) {
    blocks.push({
      type: "paragraph",
      text: `Your front door and your emotional foundation are the same energy — which means people can read your mood, even if they don't know why. You wear your feelings closer to the surface than most. The benefit: you feel congruent, what you show matches how you feel. The catch: it's harder to hide how you feel, which is tough when you need privacy. Your ${sunName} core is the part that's different — the center of you that doesn't match the surface, and that people discover over time.`,
    });
  } else {
    blocks.push({
      type: "callout",
      variant: "insight",
      label: "The gap",
      text: `People meet ${risingName} energy first. But once they get close, your ${sunName} core comes through — and that's when they see who you really are. Your ${moonName} feelings are the last layer — what people see when they've earned real closeness.`,
    });
    blocks.push({
      type: "paragraph",
      text: `This gap between your front door and your inside is one of the most important things about you. You'll surprise people as they get to know you — "I didn't expect you to be like that" is something you've probably heard. That's not inconsistency; that's depth. You're not one thing, and the work is integrating these layers into one whole person, not picking one over the others.`,
    });
  }

  // Example
  blocks.push({
    type: "example",
    text: `Think about the last time someone said "I didn't expect you to be like this" or "you're so different from how I first thought you were." That's the gap in action. The version of you that walks into a room isn't the version they get once they know you — and that's by design, not by accident.`,
  });

  // How it shifts under stress
  blocks.push({
    type: "subheading",
    label: "How your front door shifts under stress",
  });
  blocks.push({
    type: "paragraph",
    text: `Under stress, your ${risingName} front door gets louder, not quieter — it's the version of you that takes over when you don't have the energy to be your full self. ${signUnderStress(rising).charAt(0).toUpperCase() + signUnderStress(rising).slice(1)}. The real you is still in there, but the mask is doing the work.`,
  });

  return {
    id: "how-people-see-you",
    title: "How people see you",
    blocks,
  };
}

function generateEmotionalWorld(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const moon = a.moon;
  const moonName = SIGN_META[moon.signId].name;

  blocks.push({
    type: "paragraph",
    text: `Your Moon is in ${SIGN_META[moon.signId].name} (${houseDomainShort(moon.house)}) — your emotional self. ${signCoreVerb(moon.signId)}. This part is running the show more than you probably realize. Your conscious mind makes decisions, but your emotional self decides whether you actually feel okay about them.`,
  });

  // What you need to feel safe — woven with house
  blocks.push({
    type: "subheading",
    label: "What you need to feel safe",
  });
  blocks.push({
    type: "paragraph",
    text: `To feel safe, you need ${signNeed(moon.signId)}. And this isn't abstract — it lives in ${houseDomain(moon.house)}. When that area of your life is solid, you feel grounded. When it's off, your whole system feels it, even if your conscious mind hasn't caught up yet.`,
  });

  // Emotional triggers
  blocks.push({
    type: "subheading",
    label: "What triggers you",
  });
  blocks.push({
    type: "paragraph",
    text: `Your deepest fear is ${signFear(moon.signId)}. When something touches that fear — even subtly — your emotional self reacts before your rational mind can intervene. You might not even notice the trigger in the moment, but you'll feel the reaction for hours or days afterward.`,
  });

  // What you do when hurt — woven with Rising (the mask)
  blocks.push({
    type: "subheading",
    label: "What you do when you're hurt",
  });
  blocks.push({
    type: "paragraph",
    text: `Your Moon in ${SIGN_META[moon.signId].name} shapes how you react when hurt: ${signAngerStyle(moon.signId).replace(/^you /, "")}. But here's where it gets interesting — the face you show the world (Rising in ${SIGN_META[a.rising].name}) often covers for what's actually happening underneath. People might see your ${SIGN_META[a.rising].name} front while your ${moonName} feelings are doing something completely different. The gap between what you show and what you feel is where a lot of your emotional complexity lives.`,
  });

  // Example
  blocks.push({
    type: "example",
    text: hurtExample(moon.signId, a.rising),
  });

  // Connection to Sun
  blocks.push({
    type: "subheading",
    label: "How your feelings and your drive interact",
  });
  const sunEl = SIGN_META[a.sun.signId].element;
  const moonEl = SIGN_META[moon.signId].element;
  blocks.push({
    type: "paragraph",
    text: `Your core self wants ${signNeed(a.sun.signId).replace("to feel ", "to ")} — that's what drives you consciously. But your emotional self needs ${signNeed(moon.signId).replace("to feel ", "")}. ${elementPairInsight(sunEl, moonEl, "what drives you", "what you need")}. In practice: you might chase something hard, achieve it, and then feel weirdly empty — because your emotional self didn't actually want that thing, your drive did. Learning to tell the difference between "what I want" and "what I need" is one of the most important skills you'll develop.`,
  });

  return {
    id: "emotional-world",
    title: "Your inner emotional world",
    blocks,
  };
}

function generateHowYourMindWorks(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const mercury = a.mercury;

  if (!mercury) {
    blocks.push({ type: "paragraph", text: "Your mind works in a way that's shaped by your overall chart, even though we don't have a specific reading for it here." });
    return { id: "mind", title: "How your mind works", blocks };
  }

  const mercName = SIGN_META[mercury.signId].name;

  blocks.push({
    type: "paragraph",
    text: `Your Mercury is in ${SIGN_META[mercury.signId].name} (${houseDomainShort(mercury.house)}) — how you think, process, and communicate. ${signCoreVerb(mercury.signId)}. Your mental energy concentrates in ${houseDomain(mercury.house)} — that's where you're sharpest, where you do your best thinking.`,
  });

  // Thought patterns
  blocks.push({
    type: "subheading",
    label: "Your thought patterns",
  });
  blocks.push({
    type: "paragraph",
    text: `You tend to think in ${thinkingStyle(mercury.signId)}. ${mercury.retrograde ? "And because Mercury was retrograde when you were born, your mind works in spirals rather than lines — you revisit ideas, you process in layers, and you're better at reviewing than first drafts. Getting things out takes a beat longer, but what comes out is usually deeper." : ""}`,
  });

  // Communication style
  blocks.push({
    type: "subheading",
    label: "How you communicate",
  });
  blocks.push({
    type: "paragraph",
    text: `Your Mercury in ${SIGN_META[mercury.signId].name} shapes how you argue and communicate: ${signAngerStyle(mercury.signId).replace(/^you /, "")}. ${mercury.signId === a.sun.signId ? "Because your Mercury and Sun are in the same sign, your words and your core self are aligned — what you say is who you are, which makes you easy to trust but also means you sometimes say things before you've thought them through." : `Your Mercury and Sun are in different signs, so your words and your core self don't perfectly match — the you people meet in your sentences can feel slightly different from the you they get in person. That's not fake; it's just that your communication style and your presence speak different dialects.`}`,
  });

  // Decision-making
  blocks.push({
    type: "subheading",
    label: "How you make decisions",
  });
  blocks.push({
    type: "paragraph",
    text: `${decisionStyle(mercury.signId, a.moon.signId)}`,
  });

  // Mental blind spots
  blocks.push({
    type: "subheading",
    label: "Your mental blind spots",
  });
  blocks.push({
    type: "paragraph",
    text: `${signShadow(mercury.signId)}`,
  });

  // Example
  blocks.push({
    type: "example",
    text: `Think about the last time you had to make a big decision. ${decisionExample(mercury.signId)}`,
  });

  return {
    id: "mind",
    title: "How your mind works",
    blocks,
  };
}

function generateLoveAndRelationships(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const venus = a.venus;
  const mars = a.mars;
  const moon = a.moon;

  // Opening — love is not just Venus
  blocks.push({
    type: "paragraph",
    text: `Love isn't just one thing in your chart — it's a pattern woven from how you feel (${SIGN_META[moon.signId].name}), what you're drawn to (${venus ? SIGN_META[venus.signId].name : "your overall energy"}), and how you pursue it (${mars ? SIGN_META[mars.signId].name : "your drive"}). Together, those three tell the real story of how you love. Here's the pattern.`,
  });

  if (!venus) {
    blocks.push({ type: "paragraph", text: "We don't have a specific Venus reading for you, but your love pattern is still shaped by your Moon and Mars." });
    return { id: "love", title: "Love and relationships", blocks };
  }

  // What attracts you
  blocks.push({
    type: "subheading",
    label: "What attracts you",
  });
  blocks.push({
    type: "paragraph",
    text: `${signLoveStyle(venus.signId)} And this concentrates in ${houseDomain(venus.house)} — that's where love and attraction show up in your life. That's where you give affection, where you find beauty, where "love" stops being abstract and becomes something real you do.`,
  });

  // How you fall for someone — woven with Moon
  blocks.push({
    type: "subheading",
    label: "How you fall for someone",
  });
  blocks.push({
    type: "paragraph",
    text: `Attraction starts in your ${SIGN_META[venus.signId].name} heart, but whether it deepens into something real depends on your ${SIGN_META[moon.signId].name} feelings. ${elementPairInsight(SIGN_META[venus.signId].element, SIGN_META[moon.signId].element, "what attracts you", "what makes you feel safe")} — so you can be drawn to someone instantly, but you won't actually let them in until your emotional self feels safe. That gap between "attracted" and "safe" is where a lot of your love life happens.`,
  });

  // What you need
  blocks.push({
    type: "subheading",
    label: "What you need",
  });
  blocks.push({
    type: "paragraph",
    text: `To stay in love, you need ${signNeed(moon.signId)}. Without that, the spark fades no matter how strong the attraction was. You also need ${signNeed(venus.signId)} — and when those two needs pull in different directions, you'll feel torn in ways that are hard to explain.`,
  });

  // How you behave when attached — woven with Mars
  if (mars) {
    blocks.push({
      type: "subheading",
      label: "How you behave when you're attached",
    });
    blocks.push({
      type: "paragraph",
      text: `Once you're in, your ${SIGN_META[mars.signId].name} drive takes over — ${signLoveStyle(mars.signId).toLowerCase()} The dynamic between your ${SIGN_META[venus.signId].name} heart and your ${SIGN_META[mars.signId].name} drive is the engine of your love life. ${venus.signId === mars.signId ? "They're the same energy, so you're consistent — you don't chase one kind of person and be attracted to another. That makes you easy to read, but you can get stuck in patterns." : elementPairInsight(SIGN_META[venus.signId].element, SIGN_META[mars.signId].element, "what you want", "how you go after it")}`,
    });
  }

  // What makes you jealous / pull away / feel secure
  blocks.push({
    type: "subheading",
    label: "What makes you jealous",
  });
  blocks.push({
    type: "paragraph",
    text: `${jealousyPattern(venus.signId, moon.signId)}`,
  });

  blocks.push({
    type: "subheading",
    label: "What makes you pull away",
  });
  blocks.push({
    type: "paragraph",
    text: `${pullAwayPattern(venus.signId, moon.signId)}`,
  });

  blocks.push({
    type: "subheading",
    label: "What makes you feel secure",
  });
  blocks.push({
    type: "paragraph",
    text: `${securePattern(venus.signId, moon.signId)}`,
  });

  // What creates conflict
  blocks.push({
    type: "subheading",
    label: "What creates conflict in your relationships",
  });
  blocks.push({
    type: "paragraph",
    text: `${conflictPattern(venus.signId, mars?.signId, moon.signId)}`,
  });

  // What healthy love looks like for you
  blocks.push({
    type: "callout",
    variant: "growth",
    label: "What healthy love looks like for you",
    text: healthyLovePattern(venus.signId, moon.signId, mars?.signId),
  });

  // Example
  blocks.push({
    type: "example",
    text: loveExample(venus.signId, moon.signId, a.rising),
  });

  return {
    id: "love",
    title: "Love and relationships",
    blocks,
  };
}

function generateSocialPersonality(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];

  const eleventhHousePlanets = a.houseActivity[11] || [];
  const moon = a.moon;
  const rising = a.rising;

  blocks.push({
    type: "paragraph",
    text: `Your Rising sign is ${SIGN_META[rising].name} — your social front door. ${signCoreVerb(rising)}. That's how you show up in groups, at parties, in new situations. But your social needs run deeper than that, and they come from your Moon in ${SIGN_META[moon.signId].name}.`,
  });

  blocks.push({
    type: "subheading",
    label: "With strangers",
  });
  blocks.push({
    type: "paragraph",
    text: `${strangerBehavior(rising)} — that's the version of you that handles the first ten minutes of any social situation. Once you're settled, the real you starts to come through.`,
  });

  blocks.push({
    type: "subheading",
    label: "With close friends",
  });
  blocks.push({
    type: "paragraph",
    text: `${closeFriendBehavior(moon.signId)} — that's the version of you that only comes out with people you trust. ${elementPairInsight(SIGN_META[rising].element, SIGN_META[moon.signId].element, "your social front", "your real social self")} — so the gap between how you are with strangers and how you are with friends is real, and people who only know the first version don't actually know you yet.`,
  });

  blocks.push({
    type: "subheading",
    label: "What kind of people you connect with",
  });
  blocks.push({
    type: "paragraph",
    text: `${peopleYouConnectWith(moon.signId, a.dominantElement)}`,
  });

  blocks.push({
    type: "subheading",
    label: "What kind of people drain you",
  });
  blocks.push({
    type: "paragraph",
    text: `${peopleWhoDrainYou(moon.signId, a.dominantElement)}`,
  });

  if (eleventhHousePlanets.length > 0) {
    blocks.push({
      type: "subheading",
      label: "Your relationship to groups and community",
    });
    blocks.push({
      type: "paragraph",
      text: `You have ${eleventhHousePlanets.length} planet${eleventhHousePlanets.length > 1 ? "s" : ""} in your house of friends and community — ${eleventhHousePlanets.map((p) => p.name).join(", ")}. That means groups, causes, and your wider circle are a big deal for you. ${eleventhHousePlanets.length >= 3 ? "In fact, this is a stellium — community and belonging are central to who you are, not a side note." : "It's a real part of your life, not a background thing."}`,
    });
  }

  return {
    id: "social",
    title: "Your social personality",
    blocks,
  };
}

function generateAmbitionAndSuccess(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const sun = a.sun;
  const mars = a.mars;
  const saturn = a.saturn;
  const jupiter = a.jupiter;

  blocks.push({
    type: "paragraph",
    text: `Your ambition is shaped by a few different forces working together: what you want to achieve (${SIGN_META[sun.signId].name}), how you chase it (${mars ? SIGN_META[mars.signId].name : "your overall drive"}), where you'll work hardest (${saturn ? SIGN_META[saturn.signId].name : "your discipline"}), and where life tends to open doors for you (${jupiter ? SIGN_META[jupiter.signId].name : "your growth"}). Here's how those fit together.`,
  });

  blocks.push({
    type: "subheading",
    label: "What motivates you",
  });
  blocks.push({
    type: "paragraph",
    text: `${motivationPattern(sun.signId, mars?.signId)}`,
  });

  blocks.push({
    type: "subheading",
    label: "How you chase goals",
  });
  if (mars) {
    blocks.push({
      type: "paragraph",
      text: `Your Mars is in ${SIGN_META[mars.signId].name} (${houseDomainShort(mars.house)}) — how you go after things. ${signCoreVerb(mars.signId)}. And that drive is pointed at ${houseDomain(mars.house)}. When ${houseDomainShort(mars.house)} is at stake, you move. When it's not, you might drag your feet — because your drive lives there, not everywhere.`,
    });
  }

  blocks.push({
    type: "subheading",
    label: "How you react to failure",
  });
  blocks.push({
    type: "paragraph",
    text: `${failureResponse(sun.signId, saturn?.signId)}`,
  });

  blocks.push({
    type: "subheading",
    label: "What type of work suits you",
  });
  blocks.push({
    type: "paragraph",
    text: `${workEnvironment(a.dominantElement, a.dominantModality, sun.house, saturn?.house, mars?.house)}`,
  });

  blocks.push({
    type: "subheading",
    label: "Your relationship with money",
  });
  blocks.push({
    type: "paragraph",
    text: `${moneyPattern(sun.signId, a.houseActivity[2] || [])}`,
  });

  if (saturn) {
    blocks.push({
      type: "subheading",
      label: "Where you'll work the hardest (and grow the most)",
    });
    blocks.push({
      type: "paragraph",
      text: `Your ${SIGN_META[saturn.signId].name} discipline sits in ${houseDomain(saturn.house)}. This is your long apprenticeship — the area where you'll outwork everyone and earn real authority by midlife. Your twenties and thirties might feel heavy here. By midlife, it becomes your strength. Don't confuse "hard" with "wrong" — hard is the point.`,
    });
  }

  if (jupiter) {
    blocks.push({
      type: "subheading",
      label: "Where life opens doors for you",
    });
    blocks.push({
      type: "paragraph",
      text: `Your ${SIGN_META[jupiter.signId].name} growth energy sits in ${houseDomain(jupiter.house)}. That's where life tends to be generous with you — where opportunities show up, where effort pays off more than it should. Don't waste it. Lean in.`,
    });
  }

  return {
    id: "ambition",
    title: "Your ambition and success",
    blocks,
  };
}

function generateAngerConflict(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const mars = a.mars;
  const moon = a.moon;
  const mercury = a.mercury;

  blocks.push({
    type: "paragraph",
    text: `Anger isn't one thing for you — it's a chain reaction. What triggers you, what you feel, what you do, and what other people see are often four different things. Here's the chain, based on your chart.`,
  });

  blocks.push({
    type: "subheading",
    label: "What triggers you",
  });
  blocks.push({
    type: "paragraph",
    text: `${angerTrigger(mars?.signId || a.sun.signId, moon.signId)}`,
  });

  blocks.push({
    type: "subheading",
    label: "What you feel",
  });
  blocks.push({
    type: "paragraph",
    text: `Your Moon in ${SIGN_META[moon.signId].name} drives the emotional experience: ${signAngerStyle(moon.signId).replace(/^you /, "")}. But what you feel and what you show are often different.`,
  });

  blocks.push({
    type: "subheading",
    label: "What you do",
  });
  if (mars) {
    blocks.push({
      type: "paragraph",
      text: `Your Mars in ${SIGN_META[mars.signId].name} drives the action: ${signAngerStyle(mars.signId).replace(/^you /, "")}. That's how you actually act when you're angry.`,
    });
  }

  blocks.push({
    type: "subheading",
    label: "What other people see",
  });
  blocks.push({
    type: "paragraph",
    text: `Your Rising in ${SIGN_META[a.rising].name} is what people actually see: ${signAngerStyle(a.rising).replace(/^you /, "")}. That's your front door reacting, which might be completely different from what's happening inside.`,
  });

  blocks.push({
    type: "subheading",
    label: "What's actually happening underneath",
  });
  blocks.push({
    type: "paragraph",
    text: `Underneath the anger, a pattern in your Moon points to this being a sensitive area: ${signFear(moon.signId).replace(/^being /, "the fear of being ")}. Anger is almost always a bodyguard for something more vulnerable. When you can name the fear underneath the anger, the anger loses its grip.`,
  });

  // Example
  blocks.push({
    type: "example",
    text: angerExample(mars?.signId || a.sun.signId, moon.signId, a.rising),
  });

  // Healthier response
  blocks.push({
    type: "callout",
    variant: "growth",
    label: "A healthier response",
    text: healthierAngerResponse(mars?.signId || a.sun.signId, moon.signId),
  });

  return {
    id: "anger",
    title: "Your anger, conflict, and pressure response",
    blocks,
  };
}

function generateShadowSide(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];

  blocks.push({
    type: "paragraph",
    text: `Every chart has a shadow — the parts of you that can become difficult when they're unconscious. This isn't about making you feel bad. It's about naming the patterns so you can work with them instead of being run by them. Here are the specific shadows your chart points to, with the trigger, the behavior, the underlying reason, and a healthier response.`,
  });

  // Sun shadow
  blocks.push({
    type: "subheading",
    label: `${SIGN_META[a.sun.signId].name} shadow`,
  });
  blocks.push({
    type: "paragraph",
    text: `Trigger: feeling like you don't matter, or like your effort isn't being recognized. Behavior: ${signShadow(a.sun.signId)}. Underneath: ${signFear(a.sun.signId)}. Healthier response: ${healthierShadowResponse(a.sun.signId)}`,
  });

  // Moon shadow
  blocks.push({
    type: "subheading",
    label: `${SIGN_META[a.moon.signId].name} emotional shadow`,
  });
  blocks.push({
    type: "paragraph",
    text: `Trigger: ${signFear(a.moon.signId)}. Behavior: ${signShadow(a.moon.signId)}. Underneath: a need for ${signNeed(a.moon.signId).replace("to feel ", "")} that isn't being met. Healthier response: ${healthierMoonShadow(a.moon.signId)}`,
  });

  // Mars shadow (if present)
  if (a.mars) {
    blocks.push({
      type: "subheading",
      label: `${SIGN_META[a.mars.signId].name} drive shadow`,
    });
    blocks.push({
      type: "paragraph",
      text: `Trigger: being blocked, controlled, or told no. Behavior: ${signShadow(a.mars.signId)}. Underneath: a fear of powerlessness. Healthier response: ${healthierMarsShadow(a.mars.signId)}`,
    });
  }

  // Venus shadow (if present)
  if (a.venus) {
    blocks.push({
      type: "subheading",
      label: `${SIGN_META[a.venus.signId].name} love shadow`,
    });
    blocks.push({
      type: "paragraph",
      text: `Trigger: feeling unloved, unappreciated, or rejected. Behavior: ${signShadow(a.venus.signId)}. Underneath: ${signFear(a.venus.signId)}. Healthier response: ${healthierVenusShadow(a.venus.signId)}`,
    });
  }

  return {
    id: "shadow",
    title: "Your shadow side",
    blocks,
  };
}

function generateContradictions(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];

  if (a.contradictions.length === 0) {
    blocks.push({
      type: "paragraph",
      text: `Your chart is unusually consistent — the main pieces of who you are point in roughly the same direction. That's a real advantage: you don't have the internal war that a lot of people have. The catch is that you share the same blind spots across the board, so you'll need other people to show you what you can't see in yourself.`,
    });
    return { id: "contradictions", title: "Your contradictions", blocks };
  }

  blocks.push({
    type: "paragraph",
    text: `This is one of the most personal parts of your chart. Everyone has contradictions — places where two parts of them pull in different directions. Here are the ones your chart actually shows, and why both sides exist.`,
  });

  for (const contradiction of a.contradictions) {
    blocks.push({
      type: "callout",
      variant: "insight",
      text: contradiction,
    });
  }

  blocks.push({
    type: "paragraph",
    text: `These contradictions aren't flaws — they're the source of your depth. A person with no contradictions is flat. You're not flat. The work is learning to hold both sides at once, without collapsing one into the other or pretending one doesn't exist.`,
  });

  // Example
  blocks.push({
    type: "example",
    text: `Think about the last time you felt torn — maybe you wanted to charge ahead but also wanted to retreat, or you wanted closeness but also wanted space. That wasn't you being indecisive. That was two real parts of you, both wanting something true, and neither being wrong.`,
  });

  return {
    id: "contradictions",
    title: "Your contradictions",
    blocks,
  };
}

function generateDeepestPatterns(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];

  blocks.push({
    type: "paragraph",
    text: `When you look at a whole chart, certain themes keep showing up — not in one placement, but across many. These are the patterns that run your life from underneath. Here's what keeps appearing in yours.`,
  });

  if (a.themes.length === 0) {
    blocks.push({ type: "paragraph", text: "Your chart doesn't have one overwhelming theme — it's balanced across several areas, which gives you range but also means you might take longer to find your throughline." });
    return { id: "patterns", title: "Your deepest patterns", blocks };
  }

  for (const theme of a.themes.slice(0, 3)) {
    blocks.push({
      type: "subheading",
      label: themeLabel(theme),
    });
    blocks.push({
      type: "paragraph",
      text: themeDescription(theme, a),
    });
  }

  return {
    id: "patterns",
    title: "Your deepest patterns",
    blocks,
  };
}

function generateGrowthDirection(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];

  blocks.push({
    type: "paragraph",
    text: `This isn't destiny — it's a growth framework. Your chart points to certain lessons, certain habits that hold you back, and certain qualities you're here to develop. Here's the direction life seems to be pulling you.`,
  });

  if (a.northNode) {
    blocks.push({
      type: "subheading",
      label: "Your growth direction",
    });
    blocks.push({
      type: "paragraph",
      text: `Your North Node (the direction you're growing toward) is in ${SIGN_META[a.northNode.signId].name} — which means ${nodeGrowthDirection(a.northNode.signId)}. This won't always feel natural — in fact, it probably feels uncomfortable. That's the point. Growth happens outside your comfort zone, and your comfort zone is the opposite sign (${SIGN_META[oppositeSign(a.northNode.signId)].name}).`,
    });
  }

  if (a.saturn) {
    blocks.push({
      type: "subheading",
      label: "Where you'll do the hard work",
    });
    blocks.push({
      type: "paragraph",
      text: `Your ${SIGN_META[a.saturn.signId].name} discipline sits in ${houseDomain(a.saturn.house)}. This is the area where you'll be tested, where you'll work the hardest, and where you'll grow the most. By midlife, this becomes your real authority — the thing people come to you for. The apprenticeship is long, but the mastery is real.`,
    });
  }

  if (a.chiron) {
    blocks.push({
      type: "subheading",
      label: "Your wound and your gift",
    });
    blocks.push({
      type: "paragraph",
      text: `Your Chiron (the wound that's also your healing gift) is in ${SIGN_META[a.chiron.signId].name}. This is a pain you carry — ${chironWound(a.chiron.signId)}. But here's the thing: the same wound, once you've worked with it, becomes the thing you can offer others. Your pain in this area is also your medicine. The people who hurt the same way you do will feel understood by you in a way they can't get from anyone else.`,
    });
  }

  // What habits hold you back
  blocks.push({
    type: "subheading",
    label: "What habits may hold you back",
  });
  blocks.push({
    type: "paragraph",
    text: `${habitsThatHoldBack(a.sun.signId, a.moon.signId)}`,
  });

  // What healthier version looks like
  blocks.push({
    type: "callout",
    variant: "growth",
    label: "What the healthier version of you looks like",
    text: healthierVersion(a.sun.signId, a.moon.signId, a.dominantElement),
  });

  return {
    id: "growth",
    title: "Your growth direction",
    blocks,
  };
}

function generateHowChartWorksTogether(profile: NatalProfile, a: ChartAnalysis): ReadingSection {
  const blocks: ReadingBlock[] = [];

  blocks.push({
    type: "paragraph",
    text: `This is where it all comes together. Your chart isn't 15 separate planets — it's one whole person, and the way the pieces interact is what makes you specifically you. Here are the key combinations that shape your life.`,
  });

  // Mind + emotions
  blocks.push({
    type: "subheading",
    label: "Your mind + your emotions",
  });
  if (a.mercury) {
    blocks.push({
      type: "paragraph",
      text: `${elementPairInsight(SIGN_META[a.mercury.signId].element, SIGN_META[a.moon.signId].element, "your mind", "your feelings")} In practice: ${mindEmotionDynamic(a.mercury.signId, a.moon.signId)}`,
    });
  }

  // Love + desire
  blocks.push({
    type: "subheading",
    label: "Your love style + your desire style",
  });
  if (a.venus && a.mars) {
    blocks.push({
      type: "paragraph",
      text: `${elementPairInsight(SIGN_META[a.venus.signId].element, SIGN_META[a.mars.signId].element, "what you want", "how you go after it")} In practice: ${venusMarsDynamic(a.venus.signId, a.mars.signId)}`,
    });
  }

  // Identity + public image
  blocks.push({
    type: "subheading",
    label: "Your identity + your public image",
  });
  blocks.push({
    type: "paragraph",
    text: `${identityPublicDynamic(a.sun.signId, a.rising, a.midheaven)}`,
  });

  // Ambition + discipline
  blocks.push({
    type: "subheading",
    label: "Your ambition + your discipline",
  });
  if (a.mars && a.saturn) {
    blocks.push({
      type: "paragraph",
      text: `${elementPairInsight(SIGN_META[a.mars.signId].element, SIGN_META[a.saturn.signId].element, "your drive", "your discipline")} In practice: ${marsSaturnDynamic(a.mars.signId, a.saturn.signId)}`,
    });
  }

  // Emotional needs + relationships
  blocks.push({
    type: "subheading",
    label: "Your emotional needs + your relationships",
  });
  blocks.push({
    type: "paragraph",
    text: `${moonRelationshipDynamic(a.moon.signId, a.venus?.signId)}`,
  });

  // Biggest internal conflict
  blocks.push({
    type: "subheading",
    label: "Your biggest internal conflict",
  });
  blocks.push({
    type: "paragraph",
    text: `${biggestConflict(a)}`,
  });

  // Strongest natural advantage
  blocks.push({
    type: "callout",
    variant: "strength",
    label: "Your strongest natural advantage",
    text: strongestAdvantage(a),
  });

  return {
    id: "chart-together",
    title: "How your chart works together",
    blocks,
  };
}

// ===========================================================================
// HELPER CONTENT FUNCTIONS
// ===========================================================================

function elementVibe(el: Element): string {
  const map: Record<Element, string> = {
    fire: "action, courage, and a quick spark — you move on instinct",
    earth: "practicality, patience, and the real world — you build things that last",
    air: "ideas, words, and connection — you think fast and love to talk",
    water: "feeling, intuition, and depth — you feel everything deeply",
  };
  return map[el];
}

function elementChannel(el: Element): string {
  const map: Record<Element, string> = {
    fire: "acting, charging, starting things",
    earth: "building, holding, making things real",
    air: "thinking, talking, connecting ideas",
    water: "feeling, intuiting, reading the room",
  };
  return map[el];
}

function oneLineEssence(sunSign: SignId, moonSign: SignId, domEl: Element): string {
  const sunBehavior = signCore(sunSign).split(".")[0];
  const moonBehavior = signCore(moonSign).split(".")[0];
  if (sunSign === moonSign) {
    return `You're ${sunBehavior.toLowerCase()} — inside and out, that's the core of you.`;
  }
  return `On the surface, you ${sunBehavior.toLowerCase()}. Underneath, you ${moonBehavior.toLowerCase()}. The whole person is both.`;
}

function realLifeExampleWhoYouAre(sunSign: SignId, moonSign: SignId): string {
  const sunBehaviors: Record<SignId, string> = {
    aries: "you charge at the thing in front of you",
    taurus: "you commit to it and refuse to let go",
    gemini: "you get excited about five new ideas at once",
    cancer: "you feel the situation before anyone says anything",
    leo: "you walk in like you belong there",
    virgo: "you immediately notice what needs fixing",
    libra: "you try to find the fair and beautiful solution",
    scorpio: "you go straight to the depth, skipping the surface",
    sagittarius: "you're already thinking about the next adventure",
    capricorn: "you start planning the long game",
    aquarius: "you see how it could be different",
    pisces: "you feel the undercurrent everyone else is missing",
  };
  const moonBehaviors: Record<SignId, string> = {
    aries: "but later that night, you're still buzzing and can't wind down",
    taurus: "but underneath, you need comfort and solid ground to feel okay",
    gemini: "but underneath, your mind is processing a hundred things at once",
    cancer: "but underneath, you're absorbing everyone's mood and it's exhausting",
    leo: "but underneath, you need to feel seen for it to count",
    virgo: "but underneath, you're anxious about whether you did it right",
    libra: "but underneath, you're weighing whether everyone's actually okay",
    scorpio: "but underneath, you're watching for who you can really trust",
    sagittarius: "but underneath, you need freedom or you start to suffocate",
    capricorn: "but underneath, you're measuring whether this is actually working",
    aquarius: "but underneath, you're observing yourself from a slight distance",
    pisces: "but underneath, you can't tell what's yours and what's everyone else's",
  };
  return `Picture a normal Tuesday. You're dealing with something that matters. On the surface, ${sunBehaviors[sunSign]}. ${sunSign === moonSign ? "And underneath, it's the same energy — you're consistent." : moonBehaviors[moonSign]}. That's the whole person in one moment.`;
}

function lifePurpose(sunSign: SignId, moonSign: SignId, a: ChartAnalysis): string {
  const sunPurpose: Record<SignId, string> = {
    aries: "start things — be the one who goes first, who charges, who breaks the trail",
    taurus: "build things that last — commit to what's real and make it solid",
    gemini: "connect ideas and people — learn, teach, and keep things moving",
    cancer: "take care of your people — create safety and belonging",
    leo: "shine — create, perform, and give warmth to the people around you",
    virgo: "make things work — fix, refine, and be of real service",
    libra: "create harmony and beauty — broker peace and build partnership",
    scorpio: "go deep — transform, heal, and uncover what's hidden",
    sagittarius: "explore — chase meaning, truth, and the next horizon",
    capricorn: "build something real — climb, achieve, and earn your authority",
    aquarius: "be different — question the system and envision what's next",
    pisces: "feel and imagine — create, empathize, and connect to something bigger",
  };
  return sunPurpose[sunSign];
}

function archetypeName(sunSign: SignId, moonSign: SignId, domEl: Element): string {
  // Generate a memorable archetype name based on the chart
  const sunNames: Record<SignId, string> = {
    aries: "The Cannonball", taurus: "The Anchor", gemini: "The Switchboard",
    cancer: "The Hearth", leo: "The Spotlight", virgo: "The Craftsperson",
    libra: "The Diplomat", scorpio: "The Deep End", sagittarius: "The Horizon Chaser",
    capricorn: "The Architect", aquarius: "The Visionary", pisces: "The Mystic",
  };
  return sunNames[sunSign];
}

function hurtExample(moonSign: SignId, rising: SignId): string {
  const moonHurt: Record<SignId, string> = {
    aries: "you feel a flash of anger and want to do something about it now",
    taurus: "you go quiet, dig in, and need time to feel safe again",
    gemini: "you want to talk it out, find the words, maybe text three friends",
    cancer: "you retreat into your shell and need comfort before you can engage",
    leo: "you feel it big, and you want someone to notice and care",
    virgo: "you start trying to fix it, even if no one asked you to",
    libra: "you feel the imbalance and want to restore harmony before anything else",
    scorpio: "you go private, intense, and you don't let it go until you understand it",
    sagittarius: "you want to find the meaning in it, the lesson, the bigger picture",
    capricorn: "you keep a lid on it and handle the situation, then feel it later alone",
    aquarius: "you step back and observe yourself feeling it, a little from the outside",
    pisces: "you absorb the whole emotional atmosphere and can't tell what's yours",
  };
  const risingFront: Record<SignId, string> = {
    aries: "but on the outside, you look like you're ready to fight",
    taurus: "but on the outside, you look completely unbothered",
    gemini: "but on the outside, you're cracking jokes about it",
    cancer: "but on the outside, you're checking that everyone else is okay",
    leo: "but on the outside, you're acting like it's no big deal while hoping someone notices",
    virgo: "but on the outside, you're organizing something to feel in control",
    libra: "but on the outside, you're smiling and keeping things smooth",
    scorpio: "but on the outside, you're giving nothing away",
    sagittarius: "but on the outside, you're already talking about something else",
    capricorn: "but on the outside, you're handling it like a professional",
    aquarius: "but on the outside, you're intellectually analyzing the situation",
    pisces: "but on the outside, you're going along with whatever's happening",
  };
  return `Say someone you care about says something that hurts you. Underneath, ${moonHurt[moonSign]}. ${risingFront[rising]}. The gap between those two is where a lot of your emotional complexity lives — and it's why people sometimes don't realize they've hurt you, because your front door is doing such a good job of covering for what's actually happening inside.`;
}

function thinkingStyle(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "fast bursts — you get the answer before you can explain how, and you'd rather act on instinct than deliberate",
    taurus: "deliberate lines — you think things through once, decide, and then you don't change your mind easily",
    gemini: "webs and branches — you connect ideas in ways other people miss, and you think best out loud",
    cancer: "feelings first — how it feels matters as much as the facts, and you think with your gut",
    leo: "stories and pictures — you think in narratives, and you're good at making ideas sound exciting",
    virgo: "details and systems — you see the one thing that's off, and you think in lists and categories",
    libra: "weighing options — you can see every side, which makes you fair but also slow to decide",
    scorpio: "deep investigation — you don't stop at the surface, you want to know what's really going on",
    sagittarius: "big pictures — you think in meaning and themes, not details, and you'd rather get the gist than the fine print",
    capricorn: "strategy and structure — you think in plans, steps, and long-term outcomes",
    aquarius: "original connections — you see things other people miss, and you think in systems and patterns",
    pisces: "images and feelings — you think in vibes and intuition more than straight lines, and you often know things without knowing how",
  };
  return map[signId];
}

function decisionStyle(mercurySign: SignId, moonSign: SignId): string {
  if (mercurySign === moonSign) {
    return "Your mind and your feelings are singing the same song — what you think and what you feel usually agree, which makes deciding relatively easy. The catch: you might decide too fast, without enough distance between feeling and acting.";
  }
  const mercEl = SIGN_META[mercurySign].element;
  const moonEl = SIGN_META[moonSign].element;
  if (mercEl === moonEl) {
    return "Your mind and your feelings speak the same language — deciding feels natural because your head and your gut aren't fighting. Just don't take the harmony for granted.";
  }
  return `Your mind ${thinkingStyle(mercurySign)} But your feelings ${signAngerStyle(moonSign).toLowerCase()} When you have to make a big decision, your head and your gut might pull in different directions — the trick is naming both: "my head says X, my gut says Y" — and then deciding which one to trust for this specific decision.`;
}

function decisionExample(mercurySign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "You probably decided fast — maybe too fast — and then dealt with the consequences. That's your mind in action.",
    taurus: "You probably took your time, weighed it, and then committed. Once you decided, you didn't look back.",
    gemini: "You probably talked it through with three people, changed your mind twice, and then landed somewhere. That's your process.",
    cancer: "You probably felt your way to the answer — it might not have made logical sense, but it felt right.",
    leo: "You probably went with the option that felt most exciting or most like 'you.'",
    virgo: "You probably made a pros-and-cons list, researched it, and went with the option that made the most sense on paper.",
    libra: "You probably weighed every option for way too long, asked everyone's opinion, and then picked the one that felt most balanced.",
    scorpio: "You probably went deep — investigated, questioned, and chose the option that felt most real, even if it was harder.",
    sagittarius: "You probably went with your gut and the option that felt most meaningful or adventurous.",
    capricorn: "You probably chose the option that made the most long-term sense, even if it was the harder one.",
    aquarius: "You probably chose the option that was most original or most aligned with your principles, even if it wasn't popular.",
    pisces: "You probably sat with it until the answer surfaced on its own — you might not be able to explain why you chose what you chose, but it felt right.",
  };
  return map[mercurySign];
}

function jealousyPattern(venusSign: SignId, moonSign: SignId): string {
  const venusJealousy: Record<SignId, string> = {
    aries: "you get jealous when you feel like you're losing the chase — if they're not pursuing you anymore, or if someone else is getting the attention you used to get",
    taurus: "you get jealous when your security feels threatened — if they're spending time or energy somewhere else, it feels like possession being taken",
    gemini: "you get jealous when the conversation dies — if they're mentally stimulated by someone else and not you, that's the threat",
    cancer: "you get jealous when you feel replaced — if they're nurturing someone else or being nurtured by them, it cuts deep",
    leo: "you get jealous when you're not the spotlight — if they're admiring someone else, it feels like being demoted",
    virgo: "you get jealous when you feel not-good-enough — if they seem to value someone else's qualities over yours, it stings",
    libra: "you get jealous when the harmony breaks — if they're clearly more interested in someone else, it feels like the partnership is threatened",
    scorpio: "you get jealous deeply and intensely — any hint of betrayal or divided loyalty triggers a primal response",
    sagittarius: "you get jealous when your freedom feels threatened — but you'll also leave before you'll compete",
    capricorn: "you get jealous when your status feels threatened — if they're investing in someone who seems 'better' on paper",
    aquarius: "you rarely get jealous in the traditional sense — but you'll pull away if you feel like you're not being treated as an equal",
    pisces: "you get jealous when the romantic spell breaks — if they're being romantic with someone else, it feels like the dream is dying",
  };
  return venusJealousy[venusSign];
}

function pullAwayPattern(venusSign: SignId, moonSign: SignId): string {
  const venusPull: Record<SignId, string> = {
    aries: "you pull away when the spark dies — once it's not exciting anymore, you start looking elsewhere",
    taurus: "you pull away when your security is threatened — if it feels unsafe, you dig in or you leave",
    gemini: "you pull away when you're bored — if the mental stimulation is gone, you check out",
    cancer: "you pull away when you feel unsafe or unloved — you retreat into your shell and might not explain why",
    leo: "you pull away when you feel unappreciated — if you're not being seen, you stop showing up",
    virgo: "you pull away when you feel criticized or not-good-enough — you get cold and critical in return",
    libra: "you pull away when there's too much conflict — you'll leave to keep the peace, even if you don't want to",
    scorpio: "you pull away when trust is broken — and once you pull away, you're gone",
    sagittarius: "you pull away when you feel trapped — the moment freedom is threatened, you're already halfway out",
    capricorn: "you pull away when it feels like a bad investment — if it's not going anywhere, you cut your losses",
    aquarius: "you pull away when you feel smothered — you need space, and you'll take it without explaining",
    pisces: "you pull away when reality harshens the dream — if it's not romantic anymore, you drift",
  };
  return venusPull[venusSign];
}

function securePattern(venusSign: SignId, moonSign: SignId): string {
  const venusSecure: Record<SignId, string> = {
    aries: "you feel secure when the spark is alive — when they're still pursuing you, still excited, still choosing you",
    taurus: "you feel secure when there's consistency — touch, presence, routine, knowing they're not going anywhere",
    gemini: "you feel secure when the conversation is alive — when you can talk about anything and they get it",
    cancer: "you feel secure when you feel safe and nurtured — when they take care of you and you take care of them",
    leo: "you feel secure when you feel seen and appreciated — when they notice you and tell you that you matter",
    virgo: "you feel secure when they show up in the small ways — when the acts of service are consistent and real",
    libra: "you feel secure when the partnership feels balanced and fair — when you're a real team",
    scorpio: "you feel secure when there's real depth and trust — when you know them completely and they know you",
    sagittarius: "you feel secure when you have freedom inside the relationship — when you can be yourself and still be loved",
    capricorn: "you feel secure when there's commitment and a future — when you know you're building something together",
    aquarius: "you feel secure when you're accepted as you are — when you don't have to perform or pretend",
    pisces: "you feel secure when the romance is real — when it feels like a dream you're both living in",
  };
  return venusSecure[venusSign];
}

function conflictPattern(venusSign: SignId, marsSign: SignId | undefined, moonSign: SignId): string {
  if (!marsSign) return "Conflict in your relationships often comes from the gap between what you want and what you need — and from not being honest about which is which.";
  const venusEl = SIGN_META[venusSign].element;
  const marsEl = SIGN_META[marsSign].element;
  if (venusEl === marsEl) {
    return "Conflict usually comes from outside forces, not from inside you — your love style and your drive are aligned, so when there's conflict, it's usually about circumstances, not about you two being misaligned.";
  }
  return `Conflict often comes from the gap between what you want (${SIGN_META[venusSign].name}) and how you go after it (${SIGN_META[marsSign].name}). ${elementPairInsight(venusEl, marsEl, "what you want", "how you pursue it")} — and that internal tension can create external conflict, especially when you're not conscious of it.`;
}

function healthyLovePattern(venusSign: SignId, moonSign: SignId, marsSign?: SignId): string {
  const venusHealth: Record<SignId, string> = {
    aries: "A partner who keeps the spark alive — who chooses you actively, not just passively. Someone who gives you something to chase without making you feel trapped.",
    taurus: "A partner who shows up consistently — touch, presence, routine. Someone who makes you feel solid, not anxious. Someone who stays.",
    gemini: "A partner who talks to you — really talks, about anything, forever. Someone who keeps your mind stimulated and doesn't take your curiosity personally.",
    cancer: "A partner who makes you feel safe — who nurtures you and lets you nurture them. Someone who comes home to you, literally and emotionally.",
    leo: "A partner who sees you and tells you — who appreciates you out loud, who makes you feel like you matter. Someone who gives you the spotlight sometimes.",
    virgo: "A partner who notices the small things you do and values them. Someone who doesn't take your service for granted, and who serves you back.",
    libra: "A partner who's a real teammate — who shares the load, who's fair, who makes things beautiful with you. Someone who meets you in the middle.",
    scorpio: "A partner who goes deep with you — who's not afraid of your intensity, who earns your trust by being trustworthy. Someone who lets you in completely.",
    sagittarius: "A partner who gives you freedom inside the relationship — who's your adventure buddy, not your ball and chain. Someone who grows with you, not against you.",
    capricorn: "A partner who's committed to building something real with you — who takes the long view, who shows up, who's in it for the duration.",
    aquarius: "A partner who accepts you as you are — who doesn't need you to be normal, who gives you space, who's your best friend first.",
    pisces: "A partner who keeps the romance real — who dreams with you but also grounds you. Someone who doesn't break the spell but also doesn't let you drown in it.",
  };
  return venusHealth[venusSign];
}

function loveExample(venusSign: SignId, moonSign: SignId, rising: SignId): string {
  const examples: Record<SignId, string> = {
    aries: "Say you're into someone. You probably made the first move — or wanted to. The chase is the best part, and once you 'win' them, you might feel a dip in excitement. The work is learning to stay interested after the spark settles into something steady.",
    taurus: "Say you're into someone. You took your time — watched them, felt them out, made sure they were real. Once you committed, you were in it for the long haul. The risk: holding on past the expiration date because change feels worse than the slow pain of staying.",
    gemini: "Say you're into someone. You probably fell for them through conversation — the banter was the foreplay. If the talking dies, the attraction dies with it. The work is learning to love the silence too, not just the words.",
    cancer: "Say you're into someone. You probably started taking care of them before you admitted you were into them. Your love language is nurturing, but you can mother-smother when you're anxious. The work is trusting them to take care of themselves sometimes.",
    leo: "Say you're into someone. You probably wanted them to notice you — and once they did, you gave them the full treatment: warmth, generosity, big gestures. The risk: needing the attention more than you admit, and withering without it.",
    virgo: "Say you're into someone. You probably showed it by helping them — fixing their life, remembering the details, being useful. The risk: your 'help' can turn into criticism, and you might not realize they experience it that way.",
    libra: "Say you're into someone. You probably wanted it to feel like a real partnership — beautiful, balanced, fair. The risk: swallowing your own needs to keep the harmony, then quietly resenting them for not noticing.",
    scorpio: "Say you're into someone. You probably went all in — intense, private, all-consuming. You wanted to know them completely. The risk: tipping into possessiveness and control, and not trusting them until they've proven themselves a hundred times.",
    sagittarius: "Say you're into someone. You probably wanted them to be your adventure partner — someone to explore with, not someone to settle down with in the traditional sense. The risk: bolting the moment it feels like a cage.",
    capricorn: "Say you're into someone. You probably took it seriously — you were in it for real, not for fun. You showed up. The risk: being so focused on the future that you forget to be tender in the present.",
    aquarius: "Say you're into someone. You probably wanted them to be your best friend first — someone who accepts you as you are, who doesn't need you to be normal. The risk: being so independent that they feel shut out.",
    pisces: "Say you're into someone. You probably fell for the dream of them — the potential, the romance, the soul-connection feeling. The risk: loving the fantasy instead of the real person, and losing yourself in them.",
  };
  return examples[venusSign];
}

function strangerBehavior(rising: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you come in hot — energy first, words second. People feel your momentum before you speak",
    taurus: "you come in steady — calm, unhurried, and people relax around you without knowing why",
    gemini: "you come in talking — you can make friends with anyone in the first five minutes",
    cancer: "you come in warm but watchful — people feel they can open up to you, but you're reading them the whole time",
    leo: "you come in noticed — people see you when you walk in, and you know it",
    virgo: "you come in observant — you're taking in everything before you say a word",
    libra: "you come in charming — you make people comfortable immediately, and they like you right away",
    scorpio: "you come in intense — people feel like you're really looking at them, and some lean in while others step back",
    sagittarius: "you come in open — you seem up for anything, and people want to include you",
    capricorn: "you come in composed — you seem like you've got your life together, and people respect that immediately",
    aquarius: "you come in distinctive — people can't quite place you, and that's interesting to them",
    pisces: "you come in soft — people feel approachable to you, almost dreamy",
  };
  return map[rising];
}

function closeFriendBehavior(moonSign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you're direct, passionate, and always up for something. You're the friend who says 'let's go' first",
    taurus: "you're steady, loyal, and you remember what people like. You're the friend who always has the good snacks and the comfortable couch",
    gemini: "you're the group chat — you know everything about everyone, you're always texting, and you keep everyone connected",
    cancer: "you're the heart — you feel everyone's mood, you take care of people, and you remember the important dates",
    leo: "you're generous, warm, and you make things fun. You're the friend who plans the big nights out",
    virgo: "you're the one who actually helps — you'll reorganize their life, remember the details, and show up when it matters",
    libra: "you're the peacemaker — you keep the friend group harmonious and you're good at mediating drama",
    scorpio: "you're the vault — people tell you their darkest secrets because they know you'd rather die than repeat them",
    sagittarius: "you're the adventure friend — you're always suggesting trips, sending memes, and keeping things light",
    capricorn: "you're the steady one — you give real advice, you're reliable, and you're in it for the long haul",
    aquarius: "you're the weird one — you bring the unusual perspective, the interesting takes, and you accept everyone as they are",
    pisces: "you're the empath — you feel what your friends feel, you're creative, and you're the one they call when they need to be understood",
  };
  return map[moonSign];
}

function peopleYouConnectWith(moonSign: SignId, domEl: Element): string {
  const map: Record<SignId, string> = {
    aries: "people who move — who do things, who don't overthink, who are up for adventure. You connect with action-oriented people who don't need a month of planning to do something",
    taurus: "people who are real and steady — who show up, who don't flake, who appreciate the good things in life. You connect with people who feel solid",
    gemini: "people who talk — who are curious, who have ideas, who can keep up with you mentally. You connect with people who make you think and laugh",
    cancer: "people who feel safe — who are warm, who have depth, who let you take care of them and take care of you back. You connect with people who feel like home",
    leo: "people who shine — who have presence, who are generous, who appreciate you and let you appreciate them. You connect with people who aren't afraid to be seen",
    virgo: "people who are thoughtful — who notice details, who are genuinely helpful, who don't do drama. You connect with people who are real and reliable",
    libra: "people who are fair and charming — who can hold a conversation, who appreciate beauty, who don't pick fights. You connect with people who feel balanced",
    scorpio: "people who go deep — who aren't afraid of intensity, who are honest, who can be trusted. You connect with people who are real, not surface",
    sagittarius: "people who explore — who have big ideas, who are honest, who don't need to be tied down. You connect with people who feel free",
    capricorn: "people who are serious — who have goals, who are reliable, who don't waste your time. You connect with people who are building something",
    aquarius: "people who are different — who have their own thing going, who don't follow the crowd, who accept you as you are. You connect with people who feel like individuals",
    pisces: "people who feel — who have depth, who are creative, who don't need everything to be logical. You connect with people who understand without words",
  };
  return map[moonSign];
}

function peopleWhoDrainYou(moonSign: SignId, domEl: Element): string {
  const map: Record<SignId, string> = {
    aries: "people who move too slow, who overthink everything, who can't make a decision. You feel drained by people who won't just pick a direction and go",
    taurus: "people who are chaotic, who change plans constantly, who don't respect your need for stability. You feel drained by unpredictability",
    gemini: "people who can't hold a conversation, who are boring, who don't have curiosity. You feel drained by people who make you carry the mental load",
    cancer: "people who are cold, who don't seem to care, who make you feel unsafe. You feel drained by people who don't have warmth",
    leo: "people who don't notice you, who don't appreciate you, who make you feel invisible. You feel drained by people who take without giving back",
    virgo: "people who are messy, who don't follow through, who create chaos you have to clean up. You feel drained by people who aren't reliable",
    libra: "people who pick fights, who are aggressive, who don't care about fairness. You feel drained by conflict and drama",
    scorpio: "people who are surface, who lie, who aren't real. You feel drained by people you can't trust",
    sagittarius: "people who are clingy, who need constant reassurance, who want to tie you down. You feel drained by people who want to possess you",
    capricorn: "people who are flaky, who don't take things seriously, who waste your time. You feel drained by people who aren't building anything",
    aquarius: "people who are conformist, who judge you, who need you to be like everyone else. You feel drained by people who can't accept your individuality",
    pisces: "people who are harsh, who are cruel, who have no empathy. You feel drained by people who feel cold or mean",
  };
  return map[moonSign];
}

function motivationPattern(sunSign: SignId, marsSign?: SignId): string {
  const sunMotivation: Record<SignId, string> = {
    aries: "you're motivated by the chance to start something — to be first, to break through, to charge at what's in front of you. The spark of a new thing is your fuel",
    taurus: "you're motivated by building something real and lasting — security, comfort, things you can touch. The long-term reward is your fuel",
    gemini: "you're motivated by curiosity — by learning something new, talking to someone new, connecting ideas. Mental stimulation is your fuel",
    cancer: "you're motivated by taking care of your people — by creating safety, by nurturing, by belonging. Connection is your fuel",
    leo: "you're motivated by being seen and appreciated — by creating something that matters, by getting recognition. Being noticed is your fuel",
    virgo: "you're motivated by making things work — by fixing, refining, being of service. Being useful is your fuel",
    libra: "you're motivated by creating harmony and beauty — by partnership, by fairness, by making things balanced. Connection is your fuel",
    scorpio: "you're motivated by going deep — by uncovering what's hidden, by transforming, by intensity. Truth is your fuel",
    sagittarius: "you're motivated by freedom and meaning — by adventure, by truth, by the next horizon. Expansion is your fuel",
    capricorn: "you're motivated by achievement — by climbing, by building, by earning your authority. The long game is your fuel",
    aquarius: "you're motivated by being different — by questioning, by innovating, by being yourself. Individuality is your fuel",
    pisces: "you're motivated by connection to something bigger — by imagination, by empathy, by meaning. The unseen is your fuel",
  };
  return sunMotivation[sunSign];
}

function failureResponse(sunSign: SignId, saturnSign?: SignId): string {
  const sunResponse: Record<SignId, string> = {
    aries: "you bounce back fast — you're already onto the next thing while others are still processing. But you might not sit with the lesson long enough to learn from it",
    taurus: "you take it hard and you take it slow — you need time to process, and you might dig in and refuse to try again for a while",
    gemini: "you reframe it fast — you'll talk about it, process it, find the angle. But you might rationalize instead of actually feeling it",
    cancer: "you take it personally — it hits your emotional core, and you might retreat for a while before you can try again",
    leo: "your pride takes the hit — you feel embarrassed, maybe even humiliated. You need someone to remind you that you still matter",
    virgo: "you analyze it — you'll figure out exactly what went wrong and how to fix it next time. But you might beat yourself up in the process",
    libra: "you try to find balance — you'll weigh what happened, maybe blame yourself, maybe blame circumstances. You need to restore equilibrium before you can move on",
    scorpio: "you go deep — you won't rest until you understand what really happened and why. Failure can become fuel, but it can also become obsession",
    sagittarius: "you find the lesson — you reframe it as part of the journey and move on. But you might skip the actual feeling",
    capricorn: "you take it as data — you're already planning the next attempt. But you might suppress the emotional hit and feel it months later",
    aquarius: "you detach — you analyze it objectively, figure out what went wrong, and try again. But you might skip the emotional processing",
    pisces: "you feel it deeply — it can knock you off your feet for a while. You need time to recover before you can try again, and you might escape into fantasy in the meantime",
  };
  return sunResponse[sunSign];
}

function workEnvironment(domEl: Element, domMod: Modality, sunHouse: number, saturnHouse?: number, marsHouse?: number): string {
  let base = "";
  if (domEl === "fire") base = "You need a work environment that lets you move, start things, and act on instinct. Slow, bureaucratic, or overly structured places will slowly kill you. You thrive in fast-paced, dynamic environments where you can charge.";
  else if (domEl === "earth") base = "You need a work environment that's real — tangible results, steady progress, things you can point to. Chaos and constant change drain you. You thrive in structured, practical environments where you can build.";
  else if (domEl === "air") base = "You need a work environment that's mentally stimulating — ideas, communication, problem-solving. Repetitive or mindless work will bore you to death. You thrive in collaborative, intellectual environments where you can think and talk.";
  else base = "You need a work environment that has emotional depth — where you can feel, connect, and care. Cold or purely transactional places drain you. You thrive in environments where intuition and empathy matter.";

  if (domMod === "cardinal") base += " You're a starter — you do best when you can initiate, lead, and drive things forward.";
  else if (domMod === "fixed") base += " You're a holder — you do best when you can commit to something long-term and see it through.";
  else base += " You're an adapter — you do best when you can shift, adjust, and wear different hats.";

  return base;
}

function moneyPattern(sunSign: SignId, secondHousePlanets: PlanetSummary[]): string {
  const sunMoney: Record<SignId, string> = {
    aries: "you spend on impulse — if you want it, you get it, and you figure out the budget later. You can make money fast and lose it just as fast",
    taurus: "you're careful with money — you value what you buy, you save for quality, and you don't like waste. Money means security to you",
    gemini: "you spend on experiences and information — books, courses, trips, conversations. Money is fuel for curiosity",
    cancer: "you spend on home and family — making your space comfortable, taking care of your people. Money means safety",
    leo: "you spend on quality and presence — things that make you feel good and look good. Money is a way to express yourself",
    virgo: "you're practical with money — you budget, you research, you get value for what you spend. Money is a tool to be managed well",
    libra: "you spend on beauty and partnership — nice things, shared experiences, making things harmonious. Money is for creating beauty",
    scorpio: "you're strategic with money — you don't talk about it much, but you're watching it closely. Money means power and security",
    sagittarius: "you spend on adventure and growth — travel, learning, experiences. Money is freedom, not status",
    capricorn: "you're disciplined with money — you save, you invest, you think long-term. Money is security and achievement",
    aquarius: "you spend unconventionally — on causes, on weird interests, on things that matter to you even if no one else gets it. Money is a tool for what you care about",
    pisces: "you spend emotionally — on things that make you feel something, on helping people, on dreams. Money can slip through your fingers if you're not paying attention",
  };
  if (secondHousePlanets.length > 0) {
    return `${sunMoney[sunSign]} You have ${secondHousePlanets.length} planet${secondHousePlanets.length > 1 ? "s" : ""} in your money house, which means finances are an active area of your life, not a background thing.`;
  }
  return sunMoney[sunSign];
}

function angerTrigger(marsSign: SignId, moonSign: SignId): string {
  const marsTrigger: Record<SignId, string> = {
    aries: "being blocked, slowed down, or told no. Anything that gets between you and what you want right now",
    taurus: "having your routine disrupted, your possessions threatened, or your patience tested beyond its limit",
    gemini: "being misunderstood, being lied to, or having to repeat yourself. Bad communication is your trigger",
    cancer: "feeling unloved, unprotected, or like your care isn't being returned. Threats to your people or your home",
    leo: "being ignored, disrespected, or made to feel small. Anything that threatens your sense of importance",
    virgo: "things being done wrong, chaos you can't fix, or feeling incompetent. Disorder is your trigger",
    libra: "unfairness, conflict, or being put in no-win situations. Anything that disrupts harmony",
    scorpio: "betrayal, lies, or feeling powerless. Anything that threatens your trust or your control",
    sagittarius: "being trapped, limited, or lied to. Anything that cages you or insults your intelligence",
    capricorn: "incompetence, wasted time, or feeling like you're losing status. Anything that threatens your progress",
    aquarius: "conformity, being told what to do, or feeling like your individuality is under attack",
    pisces: "cruelty, harshness, or feeling like your empathy is being taken advantage of",
  };
  return marsTrigger[marsSign];
}

function angerExample(marsSign: SignId, moonSign: SignId, rising: SignId): string {
  return `Say someone cuts you off in traffic, or sends a text that lands wrong. Underneath, you feel ${signAngerStyle(moonSign).toLowerCase()} On the outside, you probably look ${signAngerStyle(rising).toLowerCase()} But what you actually do — the action you take — is ${signAngerStyle(marsSign).toLowerCase()} Three different responses, happening at once, for one event. That's why your anger can be confusing to other people — and to you.`;
}

function healthierAngerResponse(marsSign: SignId, moonSign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "pause before you react — the feeling is real, but the words can wait till morning. Count to ten, literally. Your instinct to act is good, but it needs a beat of reflection first.",
    taurus: "don't dig in — ask yourself if you're refusing to move because it's the right call or because you're comfortable. Sometimes change is the right response, even if it's uncomfortable.",
    gemini: "don't argue to win — argue to understand. Ask a question before you make a point. Your verbal skills are a tool for connection, not just for winning.",
    cancer: "don't retreat and sulk — say what's wrong, even if it feels vulnerable. People can't read your shell, and they won't know they hurt you unless you tell them.",
    leo: "don't make it about you — ask what's actually happening for the other person. Your warmth is bigger than your pride, and people respond better to it.",
    virgo: "don't criticize — ask for what you need directly. Your instinct to fix is good, but it lands as judgment when you're angry. Be direct instead.",
    libra: "don't swallow it — name the conflict out loud. Peace at any cost isn't actually peace, it's just delayed resentment. Speak up while it's still small.",
    scorpio: "don't go cold and wait — say what you're feeling now, before it calcifies into a grudge. Your depth is a gift, but it can become a prison if you don't let things out.",
    sagittarius: "don't bolt — stay and have the hard conversation. Your instinct to find the meaning is good, but sometimes the meaning is just: this needs to be talked through.",
    capricorn: "don't go cold and strategic — let yourself feel it. You're so good at handling things that you forget you're also a person who gets hurt. Name the feeling.",
    aquarius: "don't detach — stay present with the emotion, even if it's uncomfortable. Your ability to observe is good, but it can become avoidance if you never actually feel.",
    pisces: "don't absorb and drift — name what's yours. You're so empathic that you might end up feeling the other person's anger instead of your own. Ask: what am I actually mad about?",
  };
  return map[marsSign];
}

function healthierShadowResponse(sunSign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "finish what you start before chasing the next spark, and let other people have the spotlight sometimes",
    taurus: "let go of one thing you've been holding onto past its time, and notice when 'steady' has turned into 'stuck'",
    gemini: "pick one thing and go deep — depth is where the surprise is, and variety without depth becomes shallow",
    cancer: "let go of what you'd be better off releasing, and don't retreat so hard that people think you've disappeared",
    leo: "let someone else shine sometimes, and notice when you're making things about you without realizing it",
    virgo: "be gentle with yourself — your standards are quietly brutal, and you're allowed to be a work in progress",
    libra: "have the hard conversation early, and don't swallow your needs to keep the peace — it costs you later",
    scorpio: "let yourself trust before it's been earned a hundred times, and don't hold onto grudges that are only hurting you",
    sagittarius: "commit to something — depth comes from staying, not just from exploring. Freedom inside commitment is the real edge",
    capricorn: "remember to live along the way — the goal is important, but so are the days you're spending to get there",
    aquarius: "let people in — being different is a gift, but it can become a wall if you never let anyone close enough to actually know you",
    pisces: "build boundaries so you don't drown in other people's stuff — your empathy is a superpower, but it needs a container",
  };
  return map[sunSign];
}

function healthierMoonShadow(moonSign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "sleep on big reactions — the feeling is real, but the words can wait. Learn to sit with the pause before you act",
    taurus: "let yourself feel instead of going numb — comfort is good, but it can become avoidance if you never actually process",
    gemini: "get out of your head and into your body — your mind is great, but it can spin without ever landing. Try moving, breathing, feeling",
    cancer: "build boundaries so you don't absorb everyone else's mood — your care is real, but it needs a limit so you don't drown",
    leo: "notice when you need attention and ask for it directly — performing for it is exhausting, and people would rather give it if you just said so",
    virgo: "be gentle with yourself — you're harder on yourself than anyone, and your anxiety is usually lying about how bad things are",
    libra: "name what you actually need — swallowing it to keep the peace costs you, and people would rather know than guess",
    scorpio: "let yourself be vulnerable — your depth is a gift, but it can become a prison if you never let anyone in far enough to actually see you",
    sagittarius: "stay when it gets hard — your instinct to find the meaning and move on is good, but sometimes the meaning is in the staying",
    capricorn: "let yourself feel — handling it like an adult is good, but you're allowed to not be okay sometimes. Name it before it leaks out sideways",
    aquarius: "stay present with the feeling — observing it is good, but it can become avoidance if you never actually let yourself feel it",
    pisces: "name what's yours — your empathy is beautiful, but you can lose yourself in other people's stuff. Ask: what am I actually feeling?",
  };
  return map[moonSign];
}

function healthierMarsShadow(marsSign: SignId): string {
  return healthierAngerResponse(marsSign, marsSign);
}

function healthierVenusShadow(venusSign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "learn to stay interested after the spark settles — steady love has its own kind of excitement, if you let it",
    taurus: "let go of what's past its time — holding on past the expiration date costs you more than letting go does",
    gemini: "go deeper than the conversation — surface attraction fades, but depth grows. Learn to love the silence too",
    cancer: "trust people to take care of themselves sometimes — your nurturing is love, but it can become control if you don't let them be independent",
    leo: "notice when you need appreciation and ask for it directly — performing for it is exhausting, and people would rather give it than guess",
    virgo: "notice when your 'helping' is actually criticism — ask if they want help before you give it, and be gentle with what you point out",
    libra: "have the hard conversation instead of swallowing it — peace at any cost isn't peace, it's delayed resentment",
    scorpio: "let yourself trust before it's been earned a hundred times — possessiveness costs you the love you're trying to protect",
    sagittarius: "commit to something — freedom inside commitment is the real edge, and bolting prevents the depth you actually want",
    capricorn: "remember to be tender in the present — the future is important, but so is today. Don't forget to actually be here for it",
    aquarius: "let people in — independence is good, but it can become a wall. Your partner needs to feel like they can reach you",
    pisces: "love the person, not the potential — the dream is beautiful, but reality has its own kind of romance if you let it",
  };
  return map[venusSign];
}

function nodeGrowthDirection(nodeSign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "learning to act on your own impulses — to start things, to go first, to trust your instinct instead of waiting for permission or consensus",
    taurus: "learning to build slowly and value what lasts — to commit to the real, the tangible, the steady, instead of chasing intensity or constant change",
    gemini: "learning to stay curious and communicate — to ask questions, to learn, to stay open to new ideas and new people instead of clinging to certainty",
    cancer: "learning to feel and to nurture — to let yourself care, to build a home, to belong, instead of staying armored or detached",
    leo: "learning to shine — to create, to express, to let yourself be seen for who you really are, instead of hiding or playing small",
    virgo: "learning to be of service and to refine — to use your skills to help, to care about the details, to be useful instead of just dreaming",
    libra: "learning to partner — to find middle ground, to create harmony, to share your life instead of going it alone",
    scorpio: "learning to go deep — to trust, to merge, to transform, to let go of what needs to die instead of holding onto surface-level safety",
    sagittarius: "learning to seek meaning — to explore, to question, to find your truth, instead of getting stuck in the small details or the daily grind",
    capricorn: "learning to take responsibility — to build something real, to commit to the long game, to earn your authority instead of waiting for it to be given",
    aquarius: "learning to be yourself — to question the system, to find your tribe, to be the individual you are instead of conforming",
    pisces: "learning to let go — to feel, to imagine, to connect to something bigger, to surrender instead of needing to control everything",
  };
  return map[nodeSign];
}

function oppositeSign(signId: SignId): SignId {
  const opposites: Record<SignId, SignId> = {
    aries: "libra", taurus: "scorpio", gemini: "sagittarius", cancer: "capricorn",
    leo: "aquarius", virgo: "pisces", libra: "aries", scorpio: "taurus",
    sagittarius: "gemini", capricorn: "cancer", aquarius: "leo", pisces: "virgo",
  };
  return opposites[signId];
}

function chironWound(chironSign: SignId): string {
  const map: Record<SignId, string> = {
    aries: "a wound around your identity and your right to exist — feeling like you're too much or not enough, just for being yourself",
    taurus: "a wound around worth and security — feeling like you don't deserve comfort, or that what's yours can be taken away",
    gemini: "a wound around being heard and understood — feeling like your voice doesn't matter or your mind isn't sharp enough",
    cancer: "a wound around belonging and being loved — feeling like you don't quite belong anywhere, or that you have to earn love",
    leo: "a wound around being seen — feeling invisible, or feeling like you have to perform to be valued",
    virgo: "a wound around being good enough — feeling like you're fundamentally flawed, or that you have to be useful to be loved",
    libra: "a wound around relationship and fairness — feeling like you can't find your person, or that relationships are fundamentally unbalanced",
    scorpio: "a wound around trust and betrayal — feeling like you can't let anyone in, or that vulnerability will be used against you",
    sagittarius: "a wound around meaning and freedom — feeling trapped, or like life has no point, or like your truth doesn't matter",
    capricorn: "a wound around authority and achievement — feeling like you'll never be enough, or that you have to earn your right to exist through accomplishment",
    aquarius: "a wound around belonging while being yourself — feeling like you're too different to fit in, or that you have to choose between authenticity and acceptance",
    pisces: "a wound around the harshness of the world — feeling too sensitive for reality, or like your empathy makes you a target",
  };
  return map[chironSign];
}

function habitsThatHoldBack(sunSign: SignId, moonSign: SignId): string {
  const sunHabits: Record<SignId, string> = {
    aries: "starting things and not finishing them, and reacting before you've thought things through",
    taurus: "digging in when you should move, and comfort-seeking when you should be growing",
    gemini: "skimming the surface and avoiding depth, and talking instead of doing",
    cancer: "retreating when you should engage, and holding onto old hurts instead of letting them go",
    leo: "needing attention more than you admit, and letting pride stop you from apologizing or being vulnerable",
    virgo: "being too hard on yourself, and turning your helpfulness into criticism",
    libra: "swallowing your needs to keep the peace, and avoiding conflict until it becomes resentment",
    scorpio: "holding onto grudges, and not trusting people who've earned it",
    sagittarius: "bolting when things get hard, and avoiding commitment",
    capricorn: "working yourself into the ground, and forgetting to actually live along the way",
    aquarius: "being so independent that people can't reach you, and detaching when you should stay present",
    pisces: "escaping instead of facing things, and losing yourself in other people's stuff",
  };
  return `Based on your chart, the habits most likely to hold you back are: ${sunHabits[sunSign]}. These aren't flaws — they're patterns. The first step to working with them is noticing when they're happening, which is usually easier for the people around you than it is for you.`;
}

function healthierVersion(sunSign: SignId, moonSign: SignId, domEl: Element): string {
  const sunHealth: Record<SignId, string> = {
    aries: "someone who acts on instinct but has learned to finish what they start — who charges at life but also knows how to rest",
    taurus: "someone who builds real things but has learned to let go when it's time — who stays steady but doesn't get stuck",
    gemini: "someone who stays curious but has learned to go deep — who connects ideas but also connects to people",
    cancer: "someone who cares deeply but has learned to set boundaries — who nurtures without drowning",
    leo: "someone who shines but has learned to share the spotlight — who gives warmth without needing it back constantly",
    virgo: "someone who's genuinely helpful but has learned to be gentle — who serves without criticizing",
    libra: "someone who creates harmony but has learned to have the hard conversations — who partners without losing themselves",
    scorpio: "someone who goes deep but has learned to trust — who transforms without needing to control",
    sagittarius: "someone who explores but has learned to commit — who finds freedom inside dedication",
    capricorn: "someone who achieves but has learned to live along the way — who builds without forgetting to be present",
    aquarius: "someone who's authentically themselves but has learned to let people in — who's different without being distant",
    pisces: "someone who feels deeply but has learned to stay grounded — who imagines without losing themselves",
  };
  return `The healthier version of you is ${sunHealth[sunSign]}. That's not a different person — that's you, having done the work. The potential is already in the chart. The work is just uncovering it.`;
}

function themeLabel(theme: string): string {
  const labels: Record<string, string> = {
    independence: "Independence",
    action: "Action",
    courage: "Courage",
    starting: "Starting things",
    stability: "Stability",
    patience: "Patience",
    possession: "Possession",
    building: "Building",
    curiosity: "Curiosity",
    communication: "Communication",
    movement: "Movement",
    variety: "Variety",
    belonging: "Belonging",
    protection: "Protection",
    feeling: "Feeling",
    home: "Home",
    recognition: "Recognition",
    expression: "Expression",
    warmth: "Warmth",
    performance: "Performance",
    service: "Service",
    precision: "Precision",
    improvement: "Improvement",
    duty: "Duty",
    partnership: "Partnership",
    harmony: "Harmony",
    beauty: "Beauty",
    fairness: "Fairness",
    intensity: "Intensity",
    control: "Control",
    transformation: "Transformation",
    depth: "Depth",
    freedom: "Freedom",
    meaning: "Meaning",
    adventure: "Adventure",
    truth: "Truth",
    ambition: "Ambition",
    authority: "Authority",
    discipline: "Discipline",
    achievement: "Achievement",
    individuality: "Individuality",
    community: "Community",
    rebellion: "Rebellion",
    future: "The future",
    empathy: "Empathy",
    imagination: "Imagination",
    escape: "Escape",
    spirituality: "Spirituality",
    security: "Security",
    money: "Money",
    identity: "Identity",
    "self-expression": "Self-expression",
    routine: "Routine",
    relationship: "Relationship",
    solitude: "Solitude",
  };
  return labels[theme] || theme.charAt(0).toUpperCase() + theme.slice(1);
}

function themeDescription(theme: string, a: ChartAnalysis): string {
  const descriptions: Record<string, string> = {
    independence: "Independence shows up repeatedly in your chart — you need to do things your own way, on your own terms, and being micromanaged or controlled is one of your deepest stressors. This isn't just preference; it's structural. The challenge is learning that independence doesn't mean isolation — you can be your own person and still let people in.",
    control: "Control is a recurring theme — you want to be in charge of your own life, your own outcomes, and sometimes other people's. This can make you powerful and capable, but it can also make you anxious when you can't control something. The growth is learning the difference between what's yours to control and what isn't.",
    freedom: "Freedom keeps showing up — you need space, autonomy, and the ability to change course. Being fenced in slowly suffocates you, whether it's in work, love, or friendship. The challenge is finding freedom inside commitment, not just freedom from it.",
    recognition: "Recognition is a theme — you want to be seen, noticed, and appreciated for who you are and what you do. This isn't vanity; it's a need to know you matter. The challenge is learning to feel valuable internally, not just through external acknowledgment.",
    intensity: "Intensity shows up repeatedly — you don't do surface, you go deep, and you want things to feel real. This can make your life rich and your relationships profound, but it can also be exhausting. The growth is learning that not everything needs to be intense — some things can just be light.",
    stability: "Stability is a recurring theme — you need solid ground, things you can trust, and a sense that what you've built isn't going anywhere. This makes you reliable and grounded, but it can also make you resistant to change. The growth is learning that some changes make you more stable, not less.",
    transformation: "Transformation keeps appearing — your life seems to move in chapters, with deaths and rebirths of identity. You're not the same person you were five years ago, and you won't be the same in five more. The challenge is learning to let things die when their time is up, instead of holding onto them.",
    belonging: "Belonging is a theme — you need to feel like you fit somewhere, like you have a people, like you're part of something. This can make you a deeply loyal friend and partner, but it can also make you contort yourself to fit in. The growth is finding people you belong with as you actually are, not as you perform.",
    achievement: "Achievement shows up repeatedly — you're driven to build, accomplish, and earn your place. This can make you capable and successful, but it can also make you feel like you're never enough. The growth is learning that you're valuable as a person, not just as an achiever.",
    validation: "Validation is a theme — you need to know you matter, that your effort counts, that you're seen. This is human, but in your chart it's structural. The challenge is learning to validate yourself internally, so you're not dependent on external acknowledgment to feel okay.",
  };
  return descriptions[theme] || `"${theme}" is a recurring pattern in your chart — it shows up across multiple placements, which means it's not a side note, it's a core part of who you are. Pay attention to how it shapes your choices, your relationships, and your stress patterns.`;
}

function mindEmotionDynamic(mercurySign: SignId, moonSign: SignId): string {
  if (mercurySign === moonSign) {
    return "your mind and your feelings are aligned — what you think and what you feel usually agree. That makes you congruent and easy to read, but you might not have enough distance between feeling and thinking.";
  }
  return `your mind ${thinkingStyle(mercurySign)} But your feelings run on ${SIGN_META[moonSign].name} energy. Sometimes your head and your gut pull in different directions — you might think one thing and feel another, and learning to name both ("my head says X, my gut says Y") is one of the most useful skills you can develop.`;
}

function venusMarsDynamic(venusSign: SignId, marsSign: SignId): string {
  if (venusSign === marsSign) {
    return "what you want and how you go after it are the same energy — you're consistent in love, which makes you easy to read. The risk: getting stuck in a pattern, always going for the same type, always approaching the same way.";
  }
  return `you're drawn to ${SIGN_META[venusSign].name} energy, but you pursue with ${SIGN_META[marsSign].name} energy. That mismatch isn't a bug — it's why you have range. Different sides of you come out with different people. The trick is naming both: "I'm drawn to this because [Venus], and I'm approaching it this way because [Mars]."`;
}

function identityPublicDynamic(sunSign: SignId, rising: SignId, midheaven: SignId): string {
  const sunRisingMatch = sunSign === rising;
  if (sunRisingMatch) {
    return `your identity and your front door are the same energy — what people see is what they get. Your public image (${SIGN_META[midheaven].name}) might be a different flavor, which means the version of you that's known publicly can feel different from who you are privately.`;
  }
  return `your core identity (${SIGN_META[sunSign].name}) and your front door (${SIGN_META[rising].name}) are different energies — people meet one version of you and discover another over time. Your public image (${SIGN_META[midheaven].name}) adds a third layer. You're not one thing in any context — you're three layers that show up in different settings.`;
}

function marsSaturnDynamic(marsSign: SignId, saturnSign: SignId): string {
  if (marsSign === saturnSign) {
    return "your drive and your discipline are the same energy — you go after things with the same quality you use to sustain them. That makes you formidable, but you can also be too hard on yourself.";
  }
  return `your drive (${SIGN_META[marsSign].name}) and your discipline (${SIGN_META[saturnSign].name}) are different energies. Your drive wants to go one way, your discipline wants to go another. The tension between them is where you either burn out (too much drive, not enough structure) or freeze (too much structure, not enough drive). The work is learning to use both — drive to start, discipline to finish.`;
}

function moonRelationshipDynamic(moonSign: SignId, venusSign?: SignId): string {
  if (!venusSign) {
    return `your emotional needs (${SIGN_META[moonSign].name}) shape what you need from relationships — ${signNeed(moonSign)} Without that, no amount of attraction will sustain things.`;
  }
  if (moonSign === venusSign) {
    return "your emotional needs and your love style are the same energy — what makes you feel safe and what you're drawn to in love are aligned. That makes you consistent in relationships, but you might share the same blind spots in love and in emotional safety.";
  }
  return `your emotional needs (${SIGN_META[moonSign].name}) and your love style (${SIGN_META[venusSign].name}) are different energies. You can be attracted to someone instantly, but you won't actually let them in until your emotional self feels safe. That gap between "attracted" and "safe" is where a lot of your relationship complexity lives.`;
}

function biggestConflict(a: ChartAnalysis): string {
  if (a.contradictions.length === 0) {
    return "Your chart doesn't have one overwhelming internal conflict — it's relatively consistent, which is a real advantage. The challenge is that you share blind spots across the board, so you'll need other people to show you what you can't see.";
  }
  // Return the first (most significant) contradiction as the biggest conflict
  return a.contradictions[0];
}

function strongestAdvantage(a: ChartAnalysis): string {
  const sunStrength = signWhenConfident(a.sun.signId);
  const moonStrength = signWhenConfident(a.moon.signId);
  if (a.sun.signId === a.moon.signId) {
    return `Your biggest natural advantage is your consistency — your core drive and your emotional self are aligned (${SIGN_META[a.sun.signId].name} energy), so you don't have the internal war that a lot of people have. When you're at your best, ${sunStrength}. That's not potential — that's already in you. The work is just clearing away what's in the way.`;
  }
  return `Your biggest natural advantage is your range — your core drive (${SIGN_META[a.sun.signId].name}) and your emotional self (${SIGN_META[a.moon.signId].name}) are different energies, which means you can be different things in different situations. When you're at your best, ${sunStrength}, and ${moonStrength}. That combination — drive plus depth — is what makes you specifically you, and it's a real gift when you learn to use both instead of picking one.`;
}

// ===========================================================================
// MAIN ENTRY POINT
// ===========================================================================

export function generatePersonalReading(profile: NatalProfile): PersonalReading {
  const a = analyzeChart(profile);

  const sections: ReadingSection[] = [
    generateWhoYouAre(profile, a),
    generateHowPeopleSeeYou(profile, a),
    generateEmotionalWorld(profile, a),
    generateHowYourMindWorks(profile, a),
    generateLoveAndRelationships(profile, a),
    generateSocialPersonality(profile, a),
    generateAmbitionAndSuccess(profile, a),
    generateAngerConflict(profile, a),
    generateShadowSide(profile, a),
    generateContradictions(profile, a),
    generateDeepestPatterns(profile, a),
    generateGrowthDirection(profile, a),
    generateHowChartWorksTogether(profile, a),
  ];

  return {
    archetype: archetypeName(a.sun.signId, a.moon.signId, a.dominantElement),
    archetypeLine: oneLineEssence(a.sun.signId, a.moon.signId, a.dominantElement),
    intro: `This is a reading of your whole chart — not a list of placements, but a picture of one whole person. ${oneLineEssence(a.sun.signId, a.moon.signId, a.dominantElement)}`,
    sections,
  };
}
