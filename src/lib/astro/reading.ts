import type { NatalProfile, PlanetSummary, SignId, Element, Modality, PlanetId } from "./types";
import { SIGN_META } from "./signs";

// ===========================================================================
// QUICK READING ENGINE — full-chart nickname + bio generator
// ---------------------------------------------------------------------------
// Reads the WHOLE chart (Sun, Moon, Rising, Mercury, Venus, Mars, Saturn,
// Jupiter, Uranus, Neptune, Pluto, houses, dominant element + modality,
// retrogrades) and produces ONE nickname + ONE bio in current slang.
//
// The engine scores ~15 archetypes based on how many chart signals match,
// picks the top-scoring one for the nickname, and uses the 2nd/3rd as
// "color" in the bio.
// ===========================================================================

export interface ChartReading {
  nickname: string;          // e.g. "Main Character Energy"
  bio: string;               // 2-3 sentence paragraph citing specific placements
  archetype: string;         // the winning archetype id (for debugging)
  runnerUps: string[];       // 2nd + 3rd archetype names
}

// ---- Chart signal collection ----

interface ChartSignals {
  sun: SignId;
  moon: SignId;
  rising: SignId;
  mercury?: SignId;
  venus?: SignId;
  mars?: SignId;
  saturn?: SignId;
  jupiter?: SignId;
  uranus?: SignId;
  neptune?: SignId;
  pluto?: SignId;
  sunElement: Element;
  moonElement: Element;
  risingElement: Element;
  dominantElement: Element;
  dominantModality: Modality;
  retroCount: number;        // how many of Mer/Ven/Mars are retrograde
  venusRetro: boolean;
  marsRetro: boolean;
  mercuryRetro: boolean;
  sunHouse?: number;
  moonHouse?: number;
  venusHouse?: number;
  marsHouse?: number;
  mercuryHouse?: number;
  saturnHouse?: number;
  jupiterHouse?: number;
  uranusHouse?: number;
  neptuneHouse?: number;
  plutoHouse?: number;
  // Cross-planet relationships
  sunMoonSameSign: boolean;
  sunMoonSameElement: boolean;
  sunRisingSameSign: boolean;
}

function collectSignals(profile: NatalProfile): ChartSignals {
  const find = (id: string) => profile.planets.find((p) => p.id === id);
  const sun = profile.sun.signId;
  const moon = profile.moon.signId;
  const rising = profile.ascendant.signId;
  const mercury = find("mercury")?.signId;
  const venus = find("venus")?.signId;
  const mars = find("mars")?.signId;
  const saturn = find("saturn")?.signId;
  const jupiter = find("jupiter")?.signId;
  const uranus = find("uranus")?.signId;
  const neptune = find("neptune")?.signId;
  const pluto = find("pluto")?.signId;

  // Find house placements for ALL planets (not just 4)
  const findHouse = (id: string) => find(id)?.house;
  const sunHouse = findHouse("sun");
  const moonHouse = findHouse("moon");
  const venusHouse = findHouse("venus");
  const marsHouse = findHouse("mars");
  const mercuryHouse = findHouse("mercury");
  const saturnHouse = findHouse("saturn");
  const jupiterHouse = findHouse("jupiter");
  const uranusHouse = findHouse("uranus");
  const neptuneHouse = findHouse("neptune");
  const plutoHouse = findHouse("pluto");

  // Retrograde checks
  const merRetro = find("mercury")?.retrograde ?? false;
  const venRetro = find("venus")?.retrograde ?? false;
  const marRetro = find("mars")?.retrograde ?? false;
  const retroCount = [merRetro, venRetro, marRetro].filter(Boolean).length;

  // Dominant element — count ALL 10 planets + Rising (not just 6)
  const elementCounts: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCounts: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const sid of [sun, moon, rising, mercury, venus, mars, saturn, jupiter, uranus, neptune, pluto].filter(Boolean) as SignId[]) {
    elementCounts[SIGN_META[sid].element]++;
    modalityCounts[SIGN_META[sid].modality]++;
  }
  const dominantElement = (Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "fire") as Element;
  const dominantModality = (Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "cardinal") as Modality;

  return {
    sun, moon, rising,
    mercury, venus, mars, saturn, jupiter, uranus, neptune, pluto,
    sunElement: SIGN_META[sun].element,
    moonElement: SIGN_META[moon].element,
    risingElement: SIGN_META[rising].element,
    dominantElement,
    dominantModality,
    retroCount,
    venusRetro: venRetro,
    marsRetro: marRetro,
    mercuryRetro: merRetro,
    sunHouse, moonHouse, venusHouse, marsHouse,
    mercuryHouse, saturnHouse, jupiterHouse, uranusHouse, neptuneHouse, plutoHouse,
    sunMoonSameSign: sun === moon,
    sunMoonSameElement: SIGN_META[sun].element === SIGN_META[moon].element,
    sunRisingSameSign: sun === rising,
  };
}

// ---- Helper predicates ----

const FIRE = ["aries", "leo", "sagittarius"];
const EARTH = ["taurus", "virgo", "capricorn"];
const AIR = ["gemini", "libra", "aquarius"];
const WATER = ["cancer", "scorpio", "pisces"];

const isFire = (s?: SignId) => s && FIRE.includes(s);
const isEarth = (s?: SignId) => s && EARTH.includes(s);
const isAir = (s?: SignId) => s && AIR.includes(s);
const isWater = (s?: SignId) => s && WATER.includes(s);

// Element-count helpers
function elementTotal(signs: (SignId | undefined)[], target: Element): number {
  return signs.filter((s) => s && SIGN_META[s].element === target).length;
}

// ---- Archetype definitions ----
// Each archetype has:
//   id: unique key
//   nicknames: pool of slang nicknames to randomly pick from
//   score: function that takes ChartSignals → 0-100
//   bio: function that takes ChartSignals → string (cites specific placements)

interface Archetype {
  id: string;
  nicknames: string[];
  score: (s: ChartSignals) => number;
  bio: (s: ChartSignals) => string;
}

const ARCHETYPES: Archetype[] = [
  // ---- 1. DRAMATIC ----
  {
    id: "dramatic",
    nicknames: ["Drama Queen", "Drama King", "Main Character Energy", "Extra AF", "It's Giving Everything"],
    score: (s) => {
      let n = 0;
      if (isFire(s.sun)) n += 25;
      if (isFire(s.moon)) n += 25;
      if (s.sun === "leo" || s.rising === "leo") n += 25;
      if (s.venus && ["leo", "aries", "libra"].includes(s.venus)) n += 15;
      if (s.sunHouse === 1 || s.sunHouse === 5 || s.sunHouse === 10) n += 15;
      if (s.dominantElement === "fire") n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `You don't enter rooms — you make entrances. You feel things out loud, you love out loud, and your group chat is essentially a reality show. The flip side: you'll make a 3-act production out of a minor inconvenience.`;
    },
  },

  // ---- 2. HOMEBODY ----
  {
    id: "homebody",
    nicknames: ["Certified Homebody", "Comfort Zone CEO", "Cozy AF", "Indoor Cat Energy"],
    score: (s) => {
      let n = 0;
      if (isEarth(s.sun) || isWater(s.sun)) n += 20;
      if (isEarth(s.moon)) n += 25;
      if (["taurus", "cancer"].includes(s.sun) || ["taurus", "cancer"].includes(s.moon)) n += 25;
      if (s.sunHouse === 4 || s.moonHouse === 4) n += 20;
      if (s.saturn === "capricorn" || s.saturn === "taurus") n += 10;
      if (s.dominantElement === "earth") n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `Your happy place is your place. You'd rather host than go out, you'd rather cook than Uber, and your bed has its own gravitational field. People think you're boring — you're actually just comfortable, and there's a difference.`;
    },
  },

  // ---- 3. CHAOTIC ----
  {
    id: "chaotic",
    nicknames: ["Chaos Gremlin", "Wildcard", "Feral Energy", "Unhinged (Affectionate)", "Menace Society"],
    score: (s) => {
      let n = 0;
      if (s.sun === "aquarius" || s.moon === "aquarius" || s.rising === "aquarius") n += 25;
      if (s.uranus && ["aquarius", "aries", "gemini"].includes(s.uranus)) n += 15;
      if (isAir(s.sun) && isAir(s.moon)) n += 20;
      if (s.dominantModality === "mutable") n += 15;
      if (s.mars && ["gemini", "aquarius", "sagittarius"].includes(s.mars)) n += 15;
      if (s.marsHouse === 11) n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `Your brain runs 5 tabs at all times and at least 2 of them are unhinged. You'll send a meme at 3am that derails the group chat, and people either think you're a genius or genuinely feral. There's no in-between.`;
    },
  },

  // ---- 4. GUARDED ----
  {
    id: "guarded",
    nicknames: ["Emotionally Unavailable Icon", "Guarded AF", "Vibes Only", "Hard To Get Energy", "Mystery Box"],
    score: (s) => {
      let n = 0;
      if (s.moon === "capricorn" || s.moon === "aquarius") n += 25;
      if (s.saturn && [s.sun, s.moon].includes(s.saturn)) n += 15;
      if (isEarth(s.moon) && isWater(s.sun)) n += 15;
      if (s.retroCount >= 2) n += 15;
      if (s.venusRetro) n += 10;
      if (s.sun === "scorpio" || s.moon === "scorpio") n += 15;
      return Math.min(100, n);
    },
    bio: () => {
      return `You feel everything and show nothing. Your love style is private and intense, not broadcast. People call you guarded — you call it vetting. The right person will get in eventually; everyone else gets the vibes-only treatment.`;
    },
  },

  // ---- 5. CHARMER ----
  {
    id: "charmer",
    nicknames: ["Rizz God", "Rizz Goddess", "Life of the Party", "Social Butterfly Fr", "Flirt Energy"],
    score: (s) => {
      let n = 0;
      if (s.venus && ["leo", "libra", "taurus", "gemini"].includes(s.venus)) n += 30;
      if (s.rising === "libra" || s.rising === "leo") n += 20;
      if (s.sun === "libra" || s.sun === "leo" || s.sun === "gemini") n += 15;
      if (isAir(s.sun)) n += 10;
      if (s.sunHouse === 5 || s.sunHouse === 7) n += 15;
      if (s.mercury && ["libra", "gemini", "leo"].includes(s.mercury)) n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `Charm is your default setting. You can talk anyone into anything, and you don't even have to try — it's just how you're wired. The weakness: you'd rather be liked than be honest, and people can tell.`;
    },
  },

  // ---- 6. CONFIDENT ----
  {
    id: "confident",
    nicknames: ["Main Character", "Unbothered King", "Unbothered Queen", "That Bitch (Respectfully)", "Boss Energy"],
    score: (s) => {
      let n = 0;
      if (["leo", "aries", "sagittarius"].includes(s.sun)) n += 30;
      if (s.sunHouse === 1 || s.sunHouse === 5 || s.sunHouse === 10) n += 25;
      if (s.mars && ["aries", "leo", "capricorn"].includes(s.mars)) n += 15;
      if (s.rising === "leo" || s.rising === "aries") n += 15;
      if (s.jupiter && ["leo", "aries", "sagittarius"].includes(s.jupiter)) n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `You walk in like you've got somewhere to be, even when you don't. You know your worth and it shows. People either want to be you or be with you — either is fine by you.`;
    },
  },

  // ---- 7. OVERTHINKER ----
  {
    id: "overthinker",
    nicknames: ["Overthinker Supreme", "Spiraling Since Birth", "Anxiety Admin", "2am Thoughts CEO"],
    score: (s) => {
      let n = 0;
      if (s.mercury && ["virgo", "gemini", "capricorn", "scorpio"].includes(s.mercury)) n += 30;
      if (s.moon === "virgo" || s.moon === "gemini") n += 25;
      if (s.saturn && ["gemini", "virgo"].includes(s.saturn)) n += 15;
      if (s.sun === "virgo" || s.sun === "gemini") n += 15;
      if (isEarth(s.moon) && s.mercury && isAir(s.mercury)) n += 10;
      if (s.mercuryRetro) n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `Your brain doesn't have an off switch. You'll replay a 3-second interaction from 2019 at 2am. The upside: you notice everything. The downside: you notice everything, and you can't turn it off.`;
    },
  },

  // ---- 8. DISCIPLINED ----
  {
    id: "disciplined",
    nicknames: ["Locked In", "No Days Off", "Grindset Mentality", "Discipline CEO", "Sigma Energy"],
    score: (s) => {
      let n = 0;
      if (s.saturn === "capricorn" || s.saturn === "aquarius") n += 25;
      if (s.sun === "capricorn" || s.moon === "capricorn") n += 25;
      if (s.mars === "capricorn" || s.mars === "virgo") n += 15;
      if (s.sunHouse === 10 || s.sunHouse === 6) n += 15;
      if (s.dominantElement === "earth") n += 15;
      if (s.saturn && [s.sun, s.moon].includes(s.saturn)) n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `You treat discipline like a personality trait. You've had a 5-year plan since you were 12, it's working, and people are both impressed and slightly intimidated. You'll outlast everyone — that's the whole strategy.`;
    },
  },

  // ---- 9. LAZY ----
  {
    id: "lazy",
    nicknames: ["Professional Procrastinator", "Bare Minimum Energy", "Nap Enthusiast", "Comfort First", "Soft Life Advocate"],
    score: (s) => {
      let n = 0;
      if (s.sun === "taurus" || s.moon === "taurus") n += 25;
      if (s.venus === "taurus" || s.venus === "libra") n += 20;
      if (s.sunHouse === 2 || s.sunHouse === 7) n += 15;
      if (s.mars === "taurus") n += 15;
      if (s.dominantElement === "earth" && s.mars && ["taurus", "libra", "pisces"].includes(s.mars)) n += 15;
      if (s.marsRetro) n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `You'd rather do things well than do them fast, and you'd rather not do them at all if you can help it. Comfort is your compass. People call it lazy — you call it energy conservation, and honestly, you're not wrong.`;
    },
  },

  // ---- 10. ROMANTIC ----
  {
    id: "romantic",
    nicknames: ["Down Bad", "Simp Energy", "Soft Launch Season", "Hopeless Romantic Fr", "Heart Eyes 24/7"],
    score: (s) => {
      let n = 0;
      if (s.venus && ["pisces", "cancer", "libra", "taurus", "leo"].includes(s.venus)) n += 30;
      if (isWater(s.moon)) n += 20;
      if (s.sun === "pisces" || s.sun === "cancer" || s.sun === "libra") n += 15;
      if (s.venusHouse === 5 || s.venusHouse === 7) n += 15;
      if (s.neptune && [s.sun, s.moon, s.venus].filter(Boolean).includes(s.neptune)) n += 10;
      if (s.dominantElement === "water") n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `Love is your religion. You fall for potential, you romanticize the small stuff, and your love language is grand gesture. The cost: you'll simp for someone who hasn't earned it, and reality is your weak spot. You know this. You do it anyway.`;
    },
  },

  // ---- 11. PETTY ----
  {
    id: "petty",
    nicknames: ["Petty King", "Petty Queen", "Receipts Ready", "Scorekeeper", "Don't Test Me Energy"],
    score: (s) => {
      let n = 0;
      if (s.mercury && ["scorpio", "aries", "gemini"].includes(s.mercury)) n += 25;
      if (s.moon === "scorpio" || s.moon === "aries") n += 20;
      if (s.mars && ["scorpio", "aries", "gemini"].includes(s.mars)) n += 20;
      if (s.sun === "scorpio" || s.sun === "aries") n += 15;
      if (s.dominantModality === "fixed") n += 10;
      if (s.marsHouse === 3 || s.marsHouse === 8) n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `You argue to win, not to understand. You'll bring up a text from 8 months ago if it proves your point. People respect your honesty, fear your screenshots, and know not to cross you twice.`;
    },
  },

  // ---- 12. INTENSE ----
  {
    id: "intense",
    nicknames: ["Whole Different Breed", "Heavy Vibes Only", "Deep End Energy", "Not For Everyone"],
    score: (s) => {
      let n = 0;
      if (s.sun === "scorpio" || s.moon === "scorpio") n += 30;
      if (s.pluto && [s.sun, s.moon, s.rising].filter(Boolean).includes(s.pluto)) n += 15;
      if (isWater(s.sun) && isWater(s.moon)) n += 20;
      if (s.sunHouse === 8 || s.moonHouse === 8) n += 20;
      if (s.dominantElement === "water") n += 10;
      if (s.saturn === "scorpio" || s.mars === "scorpio") n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `You don't do surface. Everything with you is either all-in or nothing, and people can feel that intensity the second they meet you. It's magnetic and a little terrifying — you're not for everyone, and you know it.`;
    },
  },

  // ---- 13. WANDERER ----
  {
    id: "wanderer",
    nicknames: ["Catch Me If You Can", "Passport Bros", "Anywhere But Here", "Flight Risk", "Nomad Energy"],
    score: (s) => {
      let n = 0;
      if (s.sun === "sagittarius" || s.moon === "sagittarius") n += 30;
      if (s.jupiter === "sagittarius" || s.jupiter === "leo" || s.jupiter === "aries") n += 15;
      if (s.sunHouse === 9 || s.moonHouse === 9) n += 25;
      if (s.dominantModality === "mutable") n += 15;
      if (isFire(s.sun) && s.dominantElement === "fire") n += 10;
      if (s.venus === "sagittarius" || s.mars === "sagittarius") n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `You literally cannot sit still. You'd rather be on a plane than at a desk, and "settling down" sounds like a threat. You'll commit to a plan and be in a different country by the time it happens.`;
    },
  },

  // ---- 14. MOM FRIEND ----
  {
    id: "momfriend",
    nicknames: ["Mom Friend", "Emotional Support Friend", "Group Chat Therapist", "Care Taker Energy"],
    score: (s) => {
      let n = 0;
      if (s.moon === "cancer" || s.rising === "cancer") n += 30;
      if (s.sun === "cancer") n += 25;
      if (s.venus === "cancer") n += 20;
      if (s.sunHouse === 4 || s.moonHouse === 4) n += 15;
      if (isWater(s.moon) && isEarth(s.sun)) n += 10;
      if (s.dominantElement === "water" || s.dominantElement === "earth") n += 5;
      return Math.min(100, n);
    },
    bio: () => {
      return `You feel everyone's mood before they open their mouth, and your instinct is to take care of them. You'll cancel your own plans to bring soup to someone who didn't ask. The cost: you forget to take care of yourself, and everyone lets you.`;
    },
  },

  // ---- 15. MYSTERIOUS ----
  {
    id: "mysterious",
    nicknames: ["Undefined Vibe", "Can't Read Them", "Enigma", "Heavily Curated", "Lowkey AF"],
    score: (s) => {
      let n = 0;
      if (isWater(s.sun) && (s.moon === "aquarius" || s.moon === "capricorn")) n += 25;
      if (s.rising === "scorpio" || s.rising === "aquarius") n += 20;
      if (s.sunHouse === 12 || s.moonHouse === 12) n += 25;
      if (s.neptune && [s.sun, s.moon, s.rising].filter(Boolean).includes(s.neptune)) n += 15;
      if (s.retroCount >= 2) n += 10;
      if (s.venusRetro) n += 10;
      return Math.min(100, n);
    },
    bio: () => {
      return `People can't quite figure you out, and you're fine with that. You reveal on a need-to-know basis, and most people don't need to know. There's a lot going on behind the eyes — they just don't get to see it.`;
    },
  },
];

// ---- Main entry point ----

export function readChart(profile: NatalProfile): ChartReading {
  const signals = collectSignals(profile);

  // Score every archetype and sort high → low.
  const scored = ARCHETYPES.map((a) => ({
    archetype: a,
    score: a.score(signals),
  })).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const second = scored[1];
  const third = scored[2];

  // Pick a nickname deterministically from the top archetype's pool.
  // Seeded from the sun+moon+rising so the same chart always gets the same nickname.
  const seedStr = signals.sun + signals.moon + signals.rising;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) { seed = ((seed << 5) - seed) + seedStr.charCodeAt(i); seed |= 0; }
  seed = Math.abs(seed);
  const nickname = top.archetype.nicknames[seed % top.archetype.nicknames.length];

  // Build the bio: top archetype's bio + a sentence about the runner-up
  // if it's also reasonably strong (score >= 50).
  let bio = top.archetype.bio(signals);

  // If the 2nd-place archetype is also strong, add a transition sentence.
  if (second && second.score >= 50 && second.archetype.id !== top.archetype.id) {
    const secondNickname = second.archetype.nicknames[0];
    bio += ` There's also ${secondNickname} energy in you — it shows up in smaller ways, but it's there.`;
  }

  return {
    nickname,
    bio,
    archetype: top.archetype.id,
    runnerUps: [second?.archetype.id, third?.archetype.id].filter(Boolean) as string[],
  };
}

// Helper for components that just want the nickname.
export function getChartNickname(profile: NatalProfile): string {
  return readChart(profile).nickname;
}
