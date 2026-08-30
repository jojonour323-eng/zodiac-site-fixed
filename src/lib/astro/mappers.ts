import type {
  NatalApiResponse,
  NatalProfile,
  PlanetId,
  PlanetSummary,
  SignId,
  SynastryApiResponse,
  CompatibilityProfile,
  CompatibilityPairItem,
  SynastryAspect,
  TensionPoint,
} from "./types";
import { SIGN_BY_ABBR, SIGN_META, signIdFromAbsPos } from "./signs";
import { computeTraits, buildQuickSummary } from "./traits";
import {
  personalityTag,
  combinedSummary,
  combinedPlanetNarratives,
  quickLine,
} from "./interpretations";
import { buildPersonalityPayload, buildCompatPayload } from "./personality/payload";

const PLANET_ORDER: PlanetId[] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
  "north_node", "chiron", "lilith",
];

function planetSummary(p: {
  id: PlanetId;
  name: string;
  sign: string;
  sign_id?: SignId;
  pos: number;
  abs_pos: number;
  retrograde: boolean;
  house: number;
}): PlanetSummary {
  const signId = p.sign_id || SIGN_BY_ABBR[p.sign] || signIdFromAbsPos(p.abs_pos);
  const meta = SIGN_META[signId];
  return {
    id: p.id,
    name: p.name,
    sign: p.sign,
    signId,
    signName: meta.name,
    element: meta.element,
    modality: meta.modality,
    house: p.house,
    retrograde: p.retrograde,
    pos: p.pos,
  };
}

export function mapNatalProfile(resp: NatalApiResponse, gender?: "male" | "female" | null): NatalProfile {
  const planets = resp.planets.map(planetSummary);

  const findPlanet = (id: PlanetId) => planets.find((p) => p.id === id);
  const sun = findPlanet("sun")!;
  const moon = findPlanet("moon")!;

  // When time_known=false the API omits houses and angles entirely.
  // In that case we use the Sun's sign as a stand-in for the Ascendant so the
  // UI still renders; we surface a clear notice to the user about accuracy.
  const houses = Array.isArray(resp.houses) ? resp.houses : [];
  const angles = resp.angles;

  const firstHouse = houses.find((h) => h.house === 1);
  const ascAbsPos = angles?.asc ?? firstHouse?.abs_pos ?? sun.pos;
  const ascSignId: SignId = firstHouse?.sign_id
    || SIGN_BY_ABBR[firstHouse?.sign || ""]
    || (angles?.asc != null ? signIdFromAbsPos(angles.asc) : sun.signId);
  const ascMeta = SIGN_META[ascSignId];

  const mcAbsPos = angles?.mc ?? 0;
  const mcSignId = angles?.mc != null ? signIdFromAbsPos(angles.mc) : sun.signId;
  const mcMeta = SIGN_META[mcSignId];

  const orderedPlanets = PLANET_ORDER
    .map((id) => findPlanet(id))
    .filter((p): p is PlanetSummary => Boolean(p));

  const traits = computeTraits(orderedPlanets, ascSignId);
  const summary = buildQuickSummary(sun, moon, { signId: ascSignId });

  // Build the short punchy tag and the combined narratives.
  const tag = personalityTag(sun.signId, moon.signId, ascSignId);
  const profile: NatalProfile = {
    subject: {
      name: resp.subject.name,
      datetime: resp.subject.datetime,
      city: resp.subject.location.city,
      lat: resp.subject.location.lat,
      lng: resp.subject.location.lng,
      timezone: resp.subject.location.timezone,
      timeKnown: resp.subject.settings.time_known,
    },
    sun,
    moon,
    ascendant: {
      sign: ascMeta.abbr,
      signId: ascSignId,
      signName: ascMeta.name,
      element: ascMeta.element,
      modality: ascMeta.modality,
      absPos: ascAbsPos,
    },
    midheaven: {
      sign: mcMeta.abbr,
      signId: mcSignId,
      signName: mcMeta.name,
      absPos: mcAbsPos,
    },
    planets: orderedPlanets,
    houses: houses.map((h) => {
      const sid = h.sign_id || SIGN_BY_ABBR[h.sign] || signIdFromAbsPos(h.abs_pos);
      return {
        house: h.house,
        sign: h.sign,
        signId: sid,
        signName: SIGN_META[sid].name,
        element: SIGN_META[sid].element,
      };
    }),
    traits,
    summary,
    quickLine: "",
    personalityTag: tag,
    combinedNarratives: [],
    confidence: resp.confidence,
  };
  // Compute combined narratives + quick line after the profile object exists,
  // since they read from the profile.
  profile.summary = combinedSummary(profile);
  profile.quickLine = quickLine(profile);
  profile.combinedNarratives = combinedPlanetNarratives(profile);

  // New whole-chart personality system (safe failure: chart still renders).
  try {
    profile.personality = buildPersonalityPayload(resp, gender);
  } catch (err) {
    console.error("personality payload failed:", err);
  }
  return profile;
}

// ----- Synastry mapping -----

function describeAspect(
  aspect: SynastryAspect,
  textByKey: Record<string, { title: string; summary: string; detail: string; advice: string[] }> | undefined
): CompatibilityPairItem {
  const key = aspect.kind === "angle_contact"
    ? `angle_contact.a_${aspect.a_point}_${aspect.aspect}_b_${aspect.b_point}`
    : `aspect.a_${aspect.a_point}_${aspect.aspect}_b_${aspect.b_point}`;
  const text = textByKey?.[key];

  // Generate plain-English explanations based on the planet pair + aspect type.
  // No jargon — just what this connection means for the relationship.
  const aName = pretty(aspect.a_point);
  const bName = pretty(aspect.b_point);
  const aspectLower = aspect.aspect.toLowerCase();
  const isHarmonious = aspect.polarity === "harmonious" || aspect.polarity === "supportive";
  const isTense = aspect.polarity === "tense" || aspect.polarity === "challenging";

  // Short, plain-English summary (shown before clicking)
  const plainSummary = text?.summary || plainAspectSummary(aspect.a_point, aspect.b_point, aspectLower, isHarmonious, isTense);

  // Longer, detailed explanation (shown after clicking)
  const plainDetail = text?.detail || plainAspectDetail(aspect.a_point, aspect.b_point, aspectLower, isHarmonious, isTense, aspect.strength);

  // Practical advice
  const plainAdvice = text?.advice.length ? text.advice : plainAspectAdvice(aspect.a_point, aspect.b_point, isHarmonious, isTense);

  return {
    aPoint: aspect.a_point,
    bPoint: aspect.b_point,
    aspect: aspect.aspect,
    polarity: aspect.polarity,
    strength: aspect.strength,
    strengthLabel: aspect.strength_label,
    themes: aspect.themes,
    categories: aspect.categories,
    title: text?.title || `${aName} + ${bName}`,
    summary: plainSummary,
    detail: plainDetail,
    advice: plainAdvice,
  };
}

// Plain-English summary of what a synastry aspect means for the relationship.
// No jargon — just a quick, clear idea. Closers vary per pair so two cards
// never read as the same sentence.
function plainAspectSummary(aPoint: string, bPoint: string, aspect: string, harmonious: boolean, tense: boolean): string {
  const aRole = planetRoleShort(aPoint);
  const bRole = planetRoleShort(bPoint);
  const connection = planetPairConnection(aPoint, bPoint);
  const seed = aPoint + bPoint + aspect;

  if (harmonious) {
    const closer = pickVariant(seed, [
      "This makes the relationship feel easy in this area.",
      "Lean on this one when the rest of the bond gets loud.",
      "It's the part of the bond that works without maintenance.",
    ]);
    return `Your ${aRole} and their ${bRole} work together naturally. ${connection} ${closer}`;
  }
  if (tense) {
    const closer = pickVariant(seed, [
      "It isn't a dealbreaker — it's the spot that needs patience.",
      "Friction here is growth in disguise, as long as you both stay curious.",
      "Expect recurring sparks here — named out loud, they lose half their charge.",
    ]);
    return `Your ${aRole} and their ${bRole} create some friction. ${connection} ${closer}`;
  }
  // Neutral (conjunction)
  const closer = pickVariant(seed, [
    "You amplify each other here, for better or worse.",
    "Aimed at a shared goal, this blend is a superpower.",
    "This one magnifies whatever you feed it.",
  ]);
  return `Your ${aRole} and their ${bRole} sit in the same place. ${connection} ${closer}`;
}

// Deterministic variant picker (no rng dependency here).
function pickVariant(seed: string, arr: string[]): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

// Longer, detailed explanation of what this aspect means in real life.
function plainAspectDetail(aPoint: string, bPoint: string, aspect: string, harmonious: boolean, tense: boolean, strength: number): string {
  const aRole = planetRoleShort(aPoint);
  const bRole = planetRoleShort(bPoint);
  const connection = planetPairConnection(aPoint, bPoint);
  const strengthWord = strength >= 0.85 ? "very strong" : strength >= 0.7 ? "strong" : "moderate";

  const dailyLife = planetPairDailyLife(aPoint, bPoint);
  const conflictStyle = planetPairConflict(aPoint, bPoint, harmonious, tense);
  const supportStyle = planetPairSupport(aPoint, bPoint, harmonious);

  if (harmonious) {
    return `This is a ${strengthWord} connection. ${connection} In daily life: ${dailyLife} During conflict: ${conflictStyle} In how you support each other: ${supportStyle} This is one of the natural strengths of your relationship — lean into it.`;
  }
  if (tense) {
    return `This is a ${strengthWord} friction point. ${connection} In daily life: ${dailyLife} During conflict: ${conflictStyle} The good news: this friction can actually make the relationship grow, as long as you're both willing to work through it instead of avoiding it.`;
  }
  return `This is a ${strengthWord} bond — your ${aRole} and their ${bRole} are in the same place, which amplifies everything. In daily life: ${dailyLife} During conflict: ${conflictStyle} This can be incredibly powerful or incredibly overwhelming, depending on how you handle it.`;
}

// Practical advice for this aspect.
function plainAspectAdvice(aPoint: string, bPoint: string, harmonious: boolean, tense: boolean): string[] {
  if (harmonious) {
    return [`Enjoy this one — it's a natural strength. Don't take it for granted, but don't overthink it either.`];
  }
  if (tense) {
    return [
      `When this friction comes up, pause before reacting. Ask: "What are they actually trying to say?"`,
      `Remember that friction doesn't mean incompatibility — it means growth is happening here.`,
    ];
  }
  return [`This connection is powerful. Make sure you're using it consciously, not just being swept along by it.`];
}

// What a planet pair connection means in plain English.
function planetPairConnection(aPoint: string, bPoint: string): string {
  const pair = [aPoint, bPoint].sort().join("-");
  const map: Record<string, string> = {
    "moon-sun": "Your core identity and their emotional needs are linked — how you feel and who you are affect each other deeply.",
    "sun-sun": "Your core identities interact directly — this is about whether your fundamental selves click or clash.",
    "moon-moon": "Your emotional worlds interact — this shapes how comfortable you feel together at home, in private, when you're not performing.",
    "mercury-mercury": "Your communication styles interact — this shapes how you talk, argue, and understand each other.",
    "mercury-sun": "How they think and how you are at your core interact — this affects whether you feel understood.",
    "mercury-moon": "How they communicate and how you feel interact — this affects whether you feel emotionally heard.",
    "mars-mars": "Your drives and energy levels interact — this affects how you do things together and how you handle conflict.",
    "mars-sun": "Their drive and your core identity interact — this affects whether you feel pushed or supported.",
    "mars-moon": "Their drive and your emotions interact — this can be passionate or volatile.",
    "mars-venus": "This is the classic attraction connection — it shapes physical chemistry, romantic tension, and how you pursue each other.",
    "venus-venus": "Your love languages and values interact — this shapes what you both find beautiful and how you show affection.",
    "venus-sun": "Their love nature and your core identity interact — this affects how loved you feel by being yourself.",
    "venus-moon": "Their love nature and your emotions interact — this affects how emotionally safe and cherished you feel.",
    "venus-mercury": "Their love language and your communication style interact — this affects whether you feel romantically understood.",
    "jupiter-sun": "Their growth and optimism and your core identity interact — this affects whether you feel expanded or overwhelmed.",
    "jupiter-moon": "Their growth and your emotions interact — this affects whether you feel emotionally supported to grow.",
    "saturn-sun": "Their limits and structure and your core identity interact — this affects whether you feel supported or restricted.",
    "saturn-moon": "Their structure and your emotions interact — this affects whether you feel emotionally safe or emotionally controlled.",
    "saturn-venus": "Their commitment style and your love nature interact — this affects whether you feel secure or trapped.",
    "saturn-mars": "Their limits and your drive interact — this affects whether you feel grounded or blocked.",
    "asc-sun": "Their outward personality and your core identity interact — this affects first impressions and how you see each other.",
    "asc-moon": "Their outward personality and your emotions interact — this affects whether you feel emotionally comfortable around them.",
    "asc-venus": "Their outward personality and your love nature interact — this affects attraction at first sight.",
    "asc-mars": "Their outward personality and your drive interact — this affects the energy between you.",
    "asc-asc": "Your outward personalities interact — this affects how you come across to each other and to the world as a couple.",
    "mc-sun": "Their public role and your core identity interact — this affects how your career and relationship mix.",
    "chiron-sun": "Their wound/healing and your core identity interact — this can be deeply healing or triggering.",
    "chiron-moon": "Their wound/healing and your emotions interact — this affects emotional vulnerability between you.",
    "chiron-venus": "Their wound/healing and your love nature interact — this affects whether love feels healing or painful.",
    "node-sun": "Their life path and your core identity interact — this can feel fated or destined.",
    "node-moon": "Their life path and your emotions interact — this affects emotional growth together.",
    "node-venus": "Their life path and your love nature interact — this can feel like a destined connection.",
    "uranus-sun": "Their need for change and your core identity interact — this brings unpredictability and excitement, but can also feel destabilizing.",
    "uranus-moon": "Their need for freedom and your emotions interact — this can feel liberating or emotionally unsettling.",
    "uranus-venus": "Their unconventionality and your love nature interact — this brings electric attraction, but also unpredictability in love.",
    "uranus-mars": "Their rebelliousness and your drive interact — this creates sudden bursts of energy and conflict, rarely boring.",
    "neptune-sun": "Their dreams and your identity interact — this can feel inspiring or like you're losing yourself in them.",
    "neptune-moon": "Their imagination and your emotions interact — this can feel deeply soulful or confusing and hard to read.",
    "neptune-venus": "Their romantic idealism and your love nature interact — this can feel magical or like you're loving a fantasy instead of a real person.",
    "neptune-mars": "Their dreams and your drive interact — this can inspire big action or lead to scattered energy that doesn't land.",
    "pluto-sun": "Their intensity and your core identity interact — this is a power connection, transformative but potentially controlling.",
    "pluto-moon": "Their depth and your emotions interact — this creates intense emotional bonding, but also the potential for emotional manipulation.",
    "pluto-venus": "Their intensity and your love nature interact — this is the classic obsession-chemistry aspect. Deep, passionate, consuming.",
    "pluto-mars": "Their power and your drive interact — this creates intense friction and attraction, can be combative or magnetic.",
    "lilith-sun": "Their wild side and your core identity interact — this brings out something untamed in both of you.",
    "lilith-moon": "Their hidden desires and your emotions interact — this touches deep, often unconscious, emotional patterns.",
    "lilith-venus": "Their wild side and your love nature interact — this brings raw, unfiltered chemistry that doesn't follow the rules.",
    "lilith-mars": "Their wild side and your drive interact — this is pure sexual and aggressive energy, intense and hard to ignore.",
    "chiron-chiron": "Your wounds and their wounds interact — you may share a similar pain, and healing it together is part of the connection's purpose.",
    "node-node": "Your life paths interact — this can feel like you're meant to walk parallel paths, learning similar lessons.",
    "lilith-lilith": "Your hidden desires and theirs interact — this creates a shared shadow space that can be deeply intimate or deeply unsettling.",
  };
  return map[pair] || `This links your ${planetRoleShort(aPoint)} with their ${planetRoleShort(bPoint)} — a private channel where the two of you affect each other, for better or worse.`;
}

// How this pair shows up in daily life.
function planetPairDailyLife(aPoint: string, bPoint: string): string {
  const pair = [aPoint, bPoint].sort().join("-");
  const map: Record<string, string> = {
    "moon-sun": "you naturally nurture who they are, and they naturally feel at home with you. Day-to-day, this looks like small moments of feeling seen.",
    "sun-sun": "you either feel like teammates or like you're competing for the same space. The daily question is: whose needs come first today?",
    "moon-moon": "you feel comfortable in the same ways — similar rhythms of closeness and space, similar ideas of what 'home' feels like together.",
    "mercury-mercury": "you either talk the same language or talk past each other. Daily life involves a lot of conversation, and the quality of it matters.",
    "mars-venus": "there's real chemistry here. Daily life has a natural push-pull between desire and affection — one of you pursues, the other attracts.",
    "venus-venus": "you show love in compatible (or different) ways. Daily life is about whether your love languages match or need translating.",
    "saturn-sun": "they bring structure to your life, which can feel either supportive or restrictive depending on the day.",
    "saturn-moon": "they bring a grounding energy to your emotions, which can feel either safe or controlling.",
    "asc-sun": "you see them a certain way, and who they are interacts with that perception. Daily life is about whether they match what you expected.",
  };
  return map[pair] || `your ${planetRoleShort(aPoint)} and their ${planetRoleShort(bPoint)} interact day to day in subtle ways — this is the kind of connection that shows up in small moments rather than big dramatic ones. You'll notice it most when one of you does something that either lands perfectly or misses the mark, and you can't quite explain why.`;
}

// How this pair shows up during conflict.
function planetPairConflict(aPoint: string, bPoint: string, harmonious: boolean, tense: boolean): string {
  const pair = [aPoint, bPoint].sort().join("-");
  const base = {
    "moon-sun": tense ? "your feelings and their identity can clash — they might feel like you're being too sensitive, and you might feel like they don't get it." : "your feelings and their identity work together — even in conflict, you fundamentally get each other.",
    "mercury-mercury": tense ? "you argue in different styles — one of you is direct, the other is indirect, and misunderstandings stack up fast." : "you argue in compatible ways — you can talk through problems without it escalating.",
    "mars-venus": tense ? "the chemistry can turn into tension — desire and affection pull in different directions during fights." : "even during fights, there's an underlying attraction and warmth that pulls you back together.",
    "saturn-sun": tense ? "their limits feel like control during fights, and your identity feels like rebellion to them." : "their structure helps you stay grounded during fights, even when things get heated.",
    "saturn-moon": tense ? "their emotional control feels cold during fights, and your feelings feel like too much to them." : "their steadiness helps you feel safe even when you're upset.",
  } as Record<string, string>;
  return base[pair] || tense ? `your ${planetRoleShort(aPoint)} and their ${planetRoleShort(bPoint)} create friction during arguments — this is the kind of tension that can actually lead to real growth if you both stay honest instead of shutting down.` : `your ${planetRoleShort(aPoint)} and their ${planetRoleShort(bPoint)} help you navigate conflict together — you bring different strengths to the table, and that variety is a strength, not a weakness.`;
}

// How this pair shows up in mutual support.
function planetPairSupport(aPoint: string, bPoint: string, harmonious: boolean): string {
  const pair = [aPoint, bPoint].sort().join("-");
  const map: Record<string, string> = {
    "moon-sun": "you support them by being emotionally present, and they support you by being themselves.",
    "sun-sun": "you support each other by simply being on the same page about what matters.",
    "moon-moon": "you support each other by creating a shared emotional language — you know what the other needs before they say it.",
    "mercury-mercury": "you support each other through conversation — talking it out actually works for both of you.",
    "mars-venus": "you support each other through a mix of passion and tenderness — desire and care go hand in hand.",
    "venus-venus": "you support each other by showing love in ways the other actually receives.",
    "saturn-sun": "they support you by being the steady hand when things get chaotic, and you support them by being the reason they stay steady.",
    "saturn-moon": "they support you by holding space for your feelings without getting swept up, and you support them by helping them feel.",
  };
  return map[pair] || `your ${planetRoleShort(aPoint)} and their ${planetRoleShort(bPoint)} support each other in a way that's specific to this pairing — it's not the same kind of support you'd get from anyone else, and that's what makes it valuable.`;
}

// Short role label for a planet/point.
function planetRoleShort(id: string): string {
  const map: Record<string, string> = {
    sun: "core self", moon: "emotional side", mercury: "communication style",
    venus: "love nature", mars: "drive and energy", jupiter: "growth and optimism",
    saturn: "structure and limits", uranus: "change and rebellion", neptune: "dreams and ideals",
    pluto: "power and depth", asc: "outward personality", mc: "public role",
    chiron: "wound and healing", north_node: "life path", lilith: "wild side",
  };
  return map[id.toLowerCase()] || id;
}

function pretty(id: string): string {
  if (id.toLowerCase() === "mc") return "MC";
  return id
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// Casual, deeper WHY-the-score walkthrough — now STRUCTURED like the full
// breakdown: headed sections with short leads and bullets, one topic per
// section (Suns, Moons, Risings, strongest thread, loudest friction, pattern).
// No more single wall of text. The number is shown out of 10, honest.
export interface NarrativeSection {
  id: string;
  title: string;
  body?: string;
  bullets?: string[];
}

function buildNarrativeSections(opts: {
  overall: number; // honest 0-100 (mean of the seven areas)
  personA: { sun: SignId; moon: SignId; ascendant: SignId };
  personB: { sun: SignId; moon: SignId; ascendant: SignId };
  topStrengths: CompatibilityPairItem[];
  topFrictions: CompatibilityPairItem[];
  archetype: { label: string; one_liner: string };
}): NarrativeSection[] {
  const { overall, personA, personB, topStrengths, topFrictions, archetype } = opts;
  const outOf10 = (overall / 10).toFixed(1);

  const bandPhrase =
    overall >= 70 ? "which is genuinely strong" :
    overall >= 55 ? "which is solid" :
    overall >= 40 ? "which is a mixed bag — some real strengths, some real friction" :
    overall >= 25 ? "which is on the hard side, but hard isn't hopeless" :
    "which is low — this pairing takes real work";

  const sections: NarrativeSection[] = [];

  // The score, honestly
  sections.push({
    id: "score",
    title: "The score, in plain words",
    body: `You two land at ${outOf10} out of 10 — ${bandPhrase}. That number is the average of the seven areas in the honest breakdown below, so read the parts, not just the total.`,
    bullets: [
      "The high areas are where you can lean on the connection without thinking about it.",
      "The low ones are where you'll need to say the quiet part out loud instead of assuming the other person sees it your way.",
      "A single number can't hold a whole relationship — the pattern matters more than the total.",
    ],
  });

  // Suns
  if (personA.sun === personB.sun) {
    sections.push({
      id: "suns",
      title: `Your Suns: both ${signName(personA.sun)}`,
      body: "Same core identity — you fundamentally get each other without explaining yourself the way you do with most people.",
      bullets: [
        "The advantage: you recognize each other's core moves on sight, and neither of you has to shrink to fit.",
        "The catch: same wiring means same blind spots — you can reinforce each other's worst habit instead of catching it.",
      ],
    });
  } else {
    sections.push({
      id: "suns",
      title: `Your Suns: ${signName(personA.sun)} and ${signName(personB.sun)}`,
      body: `Different core operating systems — ${elementCompat(personA.sun, personB.sun)}. ${sunImplication(personA.sun, personB.sun)}`,
    });
  }

  // Moons
  if (personA.moon === personB.moon) {
    sections.push({
      id: "moons",
      title: `Your Moons: both ${signName(personA.moon)}`,
      body: "Your inner emotional worlds actually match — you soothe each other the same way, get upset about the same things, recharge the same way. This is the secret sauce of feeling truly comfortable with someone.",
    });
  } else {
    sections.push({
      id: "moons",
      title: `Your Moons: ${signName(personA.moon)} and ${signName(personB.moon)}`,
      body: `Moon compatibility decides whether closeness feels like rest or like work. ${moonImplication(personA.moon, personB.moon)}`,
    });
  }

  // Risings
  if (personA.ascendant === personB.ascendant) {
    sections.push({
      id: "rising",
      title: `Your Rising signs: both ${signName(personA.ascendant)}`,
      body: "You come across to the world in a similar way — people probably read the same energy off both of you, which makes you feel like a unit early on.",
    });
  } else {
    sections.push({
      id: "rising",
      title: `Your Rising signs: ${signName(personA.ascendant)} and ${signName(personB.ascendant)}`,
      body: "The first impression each of you gives is different — not bad, just worth knowing. People might be surprised when they meet you two together.",
    });
  }

  // Strongest thread
  if (topStrengths.length > 0) {
    const s = topStrengths[0];
    sections.push({
      id: "strongest",
      title: "The strongest thread between you",
      body: `${s.title} — ${Math.round(s.strength * 100)}% strength, the loudest harmonious contact in the synastry.`,
      bullets: [
        s.summary,
        `This is the part of the bond that holds when other things get bumpy — lean on it on purpose.`,
      ],
    });
  }

  // Loudest friction
  if (topFrictions.length > 0) {
    const f = topFrictions[0];
    sections.push({
      id: "friction",
      title: "The loudest friction",
      body: `${f.title} — ${Math.round(f.strength * 100)}% strength, the heaviest recurring tension in the synastry.`,
      bullets: [
        f.summary,
        "Not a dealbreaker — just the place where you'll actually have to do the work of understanding each other instead of expecting it to be easy.",
      ],
    });
  } else {
    sections.push({
      id: "friction",
      title: "The loudest friction",
      body: "No major tension contacts between your charts — unusual and comfortable, but it can mean less of the spark that friction generates. Don't manufacture drama where there isn't any.",
    });
  }

  // The pattern + what to do
  sections.push({
    id: "pattern",
    title: `The pattern: ${archetype.label}`,
    body: `${archetype.one_liner}`,
    bullets: [
      `So ${outOf10} isn't a grade — it's a map.`,
      "Trust the high areas, talk through the low ones, and treat the friction as design, not damage.",
    ],
  });

  return sections;
}

function signName(id: SignId): string {
  return SIGN_META[id].name;
}

function elementCompat(a: SignId, b: SignId): string {
  const ea = SIGN_META[a].element;
  const eb = SIGN_META[b].element;
  if (ea === eb) return `same element (${ea}) \u2014 that's an easy, natural click`;
  // Fire+Air and Earth+Water are compatible pairs
  if (
    (ea === "fire" && eb === "air") || (ea === "air" && eb === "fire") ||
    (ea === "earth" && eb === "water") || (ea === "water" && eb === "earth")
  ) {
    return `compatible elements (${ea} + ${eb}) \u2014 you fuel each other in a good way`;
  }
  return `different elements (${ea} + ${eb}) \u2014 you'll need to consciously translate between your languages`;
}

function sunImplication(a: SignId, b: SignId): string {
  // Same modality = potential power struggles
  const ma = SIGN_META[a].modality;
  const mb = SIGN_META[b].modality;
  if (ma === mb) {
    return `Since both your Suns are ${ma} signs, you both ${ma === "cardinal" ? "want to lead" : ma === "fixed" ? "dig in and refuse to budge" : "adapt and shift"} \u2014 which can mean power struggles if neither of you is willing to step back first.`;
  }
  return `Your modalities are different (${ma} and ${mb}), so you approach life at different rhythms \u2014 which can be complementary or irritating, depending on the day.`;
}

function moonImplication(a: SignId, b: SignId): string {
  const ea = SIGN_META[a].element;
  const eb = SIGN_META[b].element;
  if (ea === eb) {
    return `You both process feelings through the same channel (${ea}), which makes emotional intimacy feel natural.`;
  }
  return `You each process feelings differently (${ea} vs ${eb}), so you'll sometimes feel like the other person 'doesn't get it' even when they care. Naming this out loud helps a lot.`;
}

// Build small, practical tension points from the friction aspects.
// Each one is a specific, named pattern + a real tip, not a vague warning.
// `exclude` removes contacts already shown as full friction cards, so the
// same aspect never appears twice on the page.
function buildTensionPoints(
  frictions: CompatibilityPairItem[],
  exclude?: Set<string>
): TensionPoint[] {
  const out: TensionPoint[] = [];
  const seen = new Set<string>();

  for (const f of frictions) {
    if (out.length >= 5) break;
    const key = `${f.aPoint}-${f.bPoint}-${f.aspect}`;
    if (seen.has(key)) continue;
    if (exclude?.has([f.aPoint, f.bPoint].sort().join("|") + "|" + f.aspect.toLowerCase())) continue;
    seen.add(key);

    const tp = tensionFromAspect(f);
    if (tp) out.push(tp);
  }

  return out;
}

function tensionFromAspect(f: CompatibilityPairItem): TensionPoint | null {
  const a = f.aPoint.toLowerCase();
  const b = f.bPoint.toLowerCase();
  const pair = [a, b].sort().join("-");

  // Each (planet-pair, tense aspect) maps to a small, named everyday tension
  // with a real, doable tip. Keys are in alphabetically-sorted form to match
  // the `pair` computation above.
  const isHard = ["square", "opposition", "sesquisquare", "semisquare", "quincunx"].includes(f.aspect.toLowerCase());
  const frictionAspect = isHard || f.aspect.toLowerCase() === "conjunction";
  if (!frictionAspect) return null;

  const map: Record<string, { title: string; what: string; tip: string }> = {
    "asc-jupiter": {
      title: "Different scales",
      what: "One of you is big-picture, expansive, optimistic. The other is more contained, focused, realistic. You can each feel like the other is missing the point.",
      tip: "Hear each other out fully before responding. The big-picture person isn't being naive; the contained person isn't being negative. You need both.",
    },
    "asc-mars": {
      title: "Clashing first instincts",
      what: "When something happens, your first instincts are different. One of you charges in, the other hangs back. Neither is wrong, but you'll judge each other for it.",
      tip: "Name it out loud when it happens: 'I notice I want to ___ and you want to ___.' Just naming it usually dissolves the friction.",
    },
    "asc-moon": {
      title: "Inner self vs. outer persona",
      what: "What one of you feels inside and what the other projects outward don't match. You'll each misread the other's mood.",
      tip: "Don't assume you know what they're feeling from their face. Ask. They might be projecting calm while churning inside.",
    },
    "asc-saturn": {
      title: "Different energy around commitment",
      what: "One of you reads as more serious or reserved to the other, especially at first. The reserved one can come across as cold; the open one as flighty. Both are reading each other wrong.",
      tip: "Give each other time to warm up. Don't read the first few months as the whole story.",
    },
    "asc-sun": {
      title: "Self vs. persona",
      what: "Who one of you actually is and how the other comes across don't quite match. You'll each catch the other off-guard.",
      tip: "Don't assume the mask is the person. Ask who they actually are underneath \u2014 and listen.",
    },
    "asc-venus": {
      title: "Persona vs. affection",
      what: "How one of you comes across and how the other shows affection don't quite match. Signals can get crossed early on.",
      tip: "Don't read too much into first impressions. Give it time to see how they actually show care.",
    },
    "jupiter-mars": {
      title: "Go big vs. go steady",
      what: "One of you wants to chase big things, the other wants steady wins. You'll judge each other's pace.",
      tip: "Take turns: one big swing per year, plus steady progress in between. Both scales matter.",
    },
    "jupiter-mercury": {
      title: "Detail vs. big picture",
      what: "One of you cares about specifics, the other about the big vision. You'll each feel like the other is missing the point.",
      tip: "Both views are needed. Let the detail person handle execution, the big-picture person handle direction. Trust each other's lane.",
    },
    "jupiter-moon": {
      title: "Different emotional scales",
      what: "One of you feels things big and loud, the other more contained. The big one can feel like the other doesn't care; the contained one can feel overwhelmed.",
      tip: "Neither way is wrong. Make space for both \u2014 the loud one gets to feel out loud, the quiet one gets to feel in their own time.",
    },
    "jupiter-saturn": {
      title: "Expansion vs. contraction",
      what: "One of you wants to grow, spend, say yes. The other wants to consolidate, save, be careful. Both are right \u2014 the trick is timing.",
      tip: "Take turns: a growth season, then a consolidation season. Don't try to do both at once.",
    },
    "jupiter-sun": {
      title: "Different scales of ambition",
      what: "One of you thinks bigger, the other more contained. The big one can feel held back; the contained one can feel swept up.",
      tip: "Find a shared vision that's big enough to excite you both but small enough to actually execute. Compromise on scale.",
    },
    "jupiter-venus": {
      title: "Different scales of affection",
      what: "One of you shows love big \u2014 grand gestures, lots of it. The other is more understated. You can each feel under-loved by the other's metric.",
      tip: "Learn each other's scale. A small gesture from the understated one might be huge in their language.",
    },
    "mars-mc": {
      title: "Ambition clashes",
      what: "Your drives around career and public life point in different directions, or one of you is more ambitious than the other.",
      tip: "Talk about what success means to each of you. You might be using the same word for different things.",
    },
    "mars-mercury": {
      title: "Words can cut",
      what: "Arguments can get sharp fast. One of you says something blunt, the other takes it personally, and it escalates before either of you notices.",
      tip: "Agree on a pause word \u2014 something you can both say when a conversation is heating up, no questions asked, and you take 10 minutes before continuing.",
    },
    "mars-moon": {
      title: "Feelings vs. action",
      what: "One of you processes things by feeling them, the other by doing something about them. The doer might rush to fix when the feeler just wants to be heard.",
      tip: "Ask: 'Do you want comfort or solutions right now?' before responding. It saves a lot of misfires.",
    },
    "mars-pluto": {
      title: "Willpower clashes",
      what: "When you both want your way, neither of you backs down easily. Power struggles can flare over things that don't really matter.",
      tip: "Ask: 'Is this worth fighting for, or just worth winning?' Most of the time, it's neither \u2014 let it go.",
    },
    "mars-saturn": {
      title: "Go vs. slow down",
      what: "One of you wants to move, decide, act. The other wants to plan, consider, wait. Both have merit. The friction is when neither will yield.",
      tip: "For decisions that affect both of you, set a shared deadline. The mover agrees to wait, the slower one agrees to commit by a date. Both compromise.",
    },
    "mars-sun": {
      title: "Clashing styles of going after things",
      what: "You each have strong opinions about how to get stuff done, and your approaches don't match. One might be direct, the other strategic. This can become power struggles over small things.",
      tip: "Pick your battles. Not every disagreement about how to do something is worth winning \u2014 sometimes just let them do it their way.",
    },
    "mars-uranus": {
      title: "Impulse vs. plan",
      what: "One of you acts on impulse, the other thinks it through. The impulsive one feels held back; the planner feels ambushed.",
      tip: "For big decisions, sleep on it. For small ones, let the impulsive one lead. Match the speed to the stakes.",
    },
    "mars-venus": {
      title: "Different rhythms of desire",
      what: "The chemistry is real, but your rhythms around affection, sex, and romance don't perfectly sync. One might want more intensity, the other more ease.",
      tip: "Talk about it like adults, not in the moment. What you each like, how often, what feels good \u2014 outside the bedroom is the right place for that conversation.",
    },
    "mc-moon": {
      title: "Public life vs. home life",
      what: "One of you is oriented outward (career, public role), the other inward (home, family, emotional base). You'll need to consciously balance both.",
      tip: "Make sure both worlds get real attention. Schedule home time as seriously as you schedule work time.",
    },
    "mc-venus": {
      title: "Public life vs. private love",
      what: "One of you prioritizes career and public role, the other prioritizes the relationship. These can pull in different directions.",
      tip: "Get explicit about priorities. 'This month is career-heavy; next month is us-heavy.' Rotate intentionally.",
    },
    "mercury-mercury": {
      title: "Different communication styles",
      what: "You each talk and think in different ways. One might be direct, the other indirect. One wants the bottom line, the other wants context. Misunderstandings stack up fast.",
      tip: "When something feels off, slow down and check: 'I heard you say ___, is that what you meant?' Don't assume.",
    },
    "mercury-moon": {
      title: "Feelings vs. words",
      what: "One of you leads with emotion, the other with logic. You'll talk past each other when something's wrong.",
      tip: "Slow down: 'I'm not asking you to fix it, I just need to say it.' Or: 'Help me understand what you're feeling, not just what happened.'",
    },
    "mercury-saturn": {
      title: "Heavy conversations",
      what: "Talks can feel weighty. One of you might be more serious, the other lighter. Important conversations can get bogged down in obligation instead of flowing.",
      tip: "Mix it up: not every conversation needs to be a summit. Light small talk is also intimacy \u2014 don't skip it.",
    },
    "mercury-sun": {
      title: "Identity vs. communication",
      what: "How one of you sees yourself and how the other communicates can clash. One might take things personally that were meant practically.",
      tip: "Don't assume every comment is about who you are. Ask: 'What did you actually mean by that?' before reacting.",
    },
    "mercury-venus": {
      title: "Head vs. heart in conversation",
      what: "One of you communicates to be understood, the other to connect. Same words, different goals.",
      tip: "Notice when you're talking past each other. 'Are we problem-solving or just connecting right now?' is a useful question.",
    },
    "moon-neptune": {
      title: "Boundaries blur",
      what: "One of you absorbs the other's moods. It's hard to tell whose feelings are whose. This can be beautiful and also exhausting.",
      tip: "Have a daily check-in: 'What's mine, what's yours?' Separating the two is a skill worth building.",
    },
    "moon-pluto": {
      title: "Emotional intensity",
      what: "Feelings between you run deep \u2014 sometimes too deep. Jealousy, possessiveness, or all-or-nothing emotional swings can show up.",
      tip: "When things get intense, take a breath before reacting. Intensity isn't the same as truth.",
    },
    "moon-saturn": {
      title: "Emotional closeness takes work",
      what: "One of you might be more emotionally reserved than the other. The open one can feel shut out; the reserved one can feel pressured. Trust takes longer to build this way.",
      tip: "Don't push for emotional depth on a schedule. Build it through small, consistent moments \u2014 not big talks.",
    },
    "moon-uranus": {
      title: "Mood swings vs. steadiness",
      what: "One of you has unpredictable emotional shifts, the other wants steadiness. The shifter can feel judged; the steady one can feel whiplashed.",
      tip: "Name it when it's happening: 'I'm having a mood swing, it's not about you.' Just naming it removes half the friction.",
    },
    "moon-venus": {
      title: "Emotional needs vs. affection style",
      what: "What one of you needs to feel emotionally safe and what the other naturally gives as affection don't quite match. One might crave deep talks, the other gives gifts or touch.",
      tip: "Try meeting in the middle: ask for the specific thing you need ('I'd love a hug right now') instead of waiting for them to figure it out.",
    },
    "neptune-sun": {
      title: "Reality vs. idealism",
      what: "One of you sees things as they are, the other as they could be. You'll each feel like the other is missing the point.",
      tip: "Honor both views: the realist keeps you grounded, the idealist keeps you growing. You need both, even when they clash.",
    },
    "neptune-venus": {
      title: "Real love vs. idealized love",
      what: "One of you loves the person in front of you, the other loves an idealized version. Reality vs. fantasy can become a real tension.",
      tip: "See each other clearly, flaws included. Love that includes the flaws is the kind that actually lasts.",
    },
    "pluto-sun": {
      title: "Power and identity",
      what: "Issues of control and identity can come up. One of you might inadvertently dominate, the other might resist being changed.",
      tip: "Name power dynamics out loud when you notice them. 'I feel like I'm losing myself here' is a sentence worth practicing.",
    },
    "pluto-venus": {
      title: "Love and control",
      what: "Love can tip into possession. One of you might want to merge completely, the other needs to keep some ground. Jealousy is a risk.",
      tip: "Trust until you have a reason not to. Possessiveness costs you the love you're trying to protect.",
    },
    "saturn-sun": {
      title: "Different ideas about responsibility",
      what: "One of you takes responsibility very seriously \u2014 duty, commitments, the long game. The other takes it more lightly. This can show up as one feeling like the 'adult' in the relationship.",
      tip: "Get clear on what you each consider non-negotiable. The serious one might be carrying weight that should be shared; the lighter one might need to step up.",
    },
    "saturn-uranus": {
      title: "Tradition vs. change",
      what: "One of you values what's proven, the other what's new. You'll each feel like the other is being reckless or stuck.",
      tip: "Honor both. Tradition without change stagnates; change without tradition destabilizes. You need both.",
    },
    "saturn-venus": {
      title: "Heavy vs. light",
      what: "One of you brings seriousness to the relationship \u2014 commitment, responsibility, the long view \u2014 and the other wants things lighter, more playful, more spontaneous. Neither is wrong.",
      tip: "Schedule both: real date nights for fun, and real talks for the heavy stuff. Don't let one crowd out the other.",
    },
    "sun-moon": {
      title: "Head vs. heart mismatch",
      what: "What you each consciously want (Sun) and what you emotionally need (Moon) pull in different directions. One of you might feel like the other 'doesn't really get them' even when there's love.",
      tip: "When you're stuck, ask each other: 'What do you actually need right now?' Not what makes sense \u2014 what you need. Then take turns giving it.",
    },
    "sun-uranus": {
      title: "Stability vs. disruption",
      what: "One of you wants things predictable, the other keeps shaking things up. Both have value \u2014 the friction is when neither will yield.",
      tip: "Build in planned surprises. If change is scheduled, the stable one can relax; if stability is honored, the disruptor can wait.",
    },
    "sun-venus": {
      title: "Different love languages",
      what: "The way one of you shows love and the way the other feels loved don't quite line up. One might want quality time, the other acts of service, and you'll miss each other's signals.",
      tip: "Tell each other directly: 'I feel most loved when you ___.' Don't make your partner guess.",
    },
    "uranus-venus": {
      title: "Stability vs. excitement",
      what: "One of you wants routine in love, the other wants surprise. Both have value \u2014 the friction is when neither bends.",
      tip: "Plan surprise inside the routine. Predictable doesn't have to mean boring; exciting doesn't have to mean unstable.",
    },
  };

  const entry = map[pair];
  if (!entry) {
    // Short, pair-specific fallback — never the long boilerplate.
    return {
      title: `${pretty(f.aPoint)} \u00d7 ${pretty(f.bPoint)} tension`,
      what: `Your ${planetRoleShort(f.aPoint)} and their ${planetRoleShort(f.bPoint)} rub against each other in everyday moments — small stuff sparks faster here than it should, in both directions.`,
      tip: `When it sparks, name it fast: "that's the ${pretty(f.aPoint)}/${pretty(f.bPoint)} thing" — wiring, not a character flaw. Then deal with the actual issue while it's still small.`,
      source: `${f.aPoint} ${f.aspect} ${f.bPoint}`,
    };
  }

  return {
    title: entry.title,
    what: entry.what,
    tip: entry.tip,
    source: `${f.aPoint} ${f.aspect} ${f.bPoint}`,
  };
}

export function mapSynastryProfile(resp: SynastryApiResponse, genderA?: "male" | "female" | null, genderB?: "male" | "female" | null): CompatibilityProfile {
  const syn = resp.synastry;
  const text = syn.text?.by_key;

  const aspects = syn.aspects;
  const sorted = [...aspects].sort((a, b) => b.strength - a.strength);

  const strengths: CompatibilityPairItem[] = [];
  const frictions: CompatibilityPairItem[] = [];

  // The API uses polarity values: "supportive", "challenging", "neutral", "mixed".
  // We bucket "challenging" as friction, "supportive" as strength, and
  // "mixed"/"neutral" as strength only if very strong (>=0.7).
  for (const a of sorted) {
    const item = describeAspect(a, text);
    const pol = (a.polarity || "").toLowerCase();
    if (pol === "challenging" || pol === "tense") {
      frictions.push(item);
    } else if (pol === "supportive" || pol === "harmonious") {
      strengths.push(item);
    } else if (a.strength >= 0.7) {
      // Strong neutral/mixed contacts default to strengths.
      strengths.push(item);
    }
  }

  const topStrengths = strengths.slice(0, 6);
  const topFrictions = frictions.slice(0, 6);

  // New whole-chart compatibility analysis (two personality models interacting).
  // Built FIRST so the big rating + five domains can be coherent with the
  // honest breakdown instead of quoting a different, harsher formula.
  let compatAnalysis: ReturnType<typeof buildCompatPayload> | null = null;
  try {
    compatAnalysis = buildCompatPayload(resp, genderA, genderB);
  } catch (err) {
    console.error("compat payload failed:", err);
  }

  // Honest overall: the mean of the seven whole-chart areas (falls back to
  // the raw synastry average only if the whole-chart analysis failed).
  const areaValue = (key: string): number =>
    compatAnalysis?.areas.find((x) => x.key === key)?.value ?? syn.scores.overall;
  const overall = compatAnalysis
    ? compatAnalysis.overall
    : syn.scores.overall;
  const scoreBand =
    overall >= 75 ? "exceptional" :
    overall >= 60 ? "strong" :
    overall >= 45 ? "balanced" :
    overall >= 30 ? "moderate" : "gentle";

  const tension = syn.scores.tension;
  const tensionBand =
    tension >= 70 ? "high" :
    tension >= 35 ? "moderate" : "low";

  const personA = resp.natal.person_a;
  const personB = resp.natal.person_b;

  const signOf = (resp: { planets: { id: string; sign_id?: SignId; sign: string; abs_pos: number }[] }, id: string): SignId => {
    const p = resp.planets.find((x) => x.id === id);
    if (!p) return "aries";
    return p.sign_id || SIGN_BY_ABBR[p.sign] || signIdFromAbsPos(p.abs_pos);
  };

  const ascOf = (r: { houses: { house: number; sign_id?: SignId; sign: string; abs_pos: number }[]; angles?: { asc?: number } }): SignId => {
    const h = r.houses.find((x) => x.house === 1);
    if (h?.sign_id) return h.sign_id;
    if (h?.sign) return SIGN_BY_ABBR[h.sign] || "aries";
    if (r.angles?.asc != null) return signIdFromAbsPos(r.angles.asc);
    return "aries";
  };

  const personASigns = {
    sun: signOf(personA, "sun"),
    moon: signOf(personA, "moon"),
    ascendant: ascOf(personA),
    venus: signOf(personA, "venus"),
    mars: signOf(personA, "mars"),
    mercury: signOf(personA, "mercury"),
    jupiter: signOf(personA, "jupiter"),
    saturn: signOf(personA, "saturn"),
  };
  const personBSigns = {
    sun: signOf(personB, "sun"),
    moon: signOf(personB, "moon"),
    ascendant: ascOf(personB),
    venus: signOf(personB, "venus"),
    mars: signOf(personB, "mars"),
    mercury: signOf(personB, "mercury"),
    jupiter: signOf(personB, "jupiter"),
    saturn: signOf(personB, "saturn"),
  };

  const narrativeSections = buildNarrativeSections({
    overall,
    personA: personASigns,
    personB: personBSigns,
    topStrengths,
    topFrictions,
    archetype: syn.archetype,
  });

  // Tension points: everyday friction patterns from the FULL friction list,
  // minus anything already shown as a full friction card (top 6) — so the
  // same contact never appears twice on the page.
  const shownFrictionKeys = new Set(
    topFrictions.map((f) => [f.aPoint, f.bPoint].sort().join("|") + "|" + f.aspect.toLowerCase())
  );
  const tensionPoints = buildTensionPoints(frictions, shownFrictionKeys);

  // Build the full placement lists for the expanded comparison grid.
  // Includes all planets + the Ascendant (from the 1st house) + Midheaven.
  const ALL_POINTS = [
    "sun", "moon", "ascendant", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
    "north_node", "chiron", "lilith", "midheaven",
  ];

  const signOfPoint = (resp: { planets: { id: string; sign_id?: SignId; sign: string; abs_pos: number }[]; houses: { house: number; sign_id?: SignId; sign: string; abs_pos: number }[]; angles?: { asc?: number; mc?: number } }, id: string): SignId => {
    if (id === "ascendant") return ascOf(resp);
    if (id === "midheaven") {
      if (resp.angles?.mc != null) return signIdFromAbsPos(resp.angles.mc);
      const h10 = resp.houses.find((x) => x.house === 10);
      if (h10?.sign_id) return h10.sign_id;
      if (h10?.sign) return SIGN_BY_ABBR[h10.sign] || "aries";
      return "aries";
    }
    return signOf(resp, id);
  };

  const allPlacementsA = ALL_POINTS.map((id) => ({
    id,
    signId: signOfPoint(personA, id),
  })).filter((p) => {
    // Hide points the API didn't return (avoid showing "Aries" for missing data).
    if (p.id === "ascendant" || p.id === "midheaven") return true;
    return personA.planets.some((pl) => pl.id === p.id);
  });

  const allPlacementsB = ALL_POINTS.map((id) => ({
    id,
    signId: signOfPoint(personB, id),
  })).filter((p) => {
    if (p.id === "ascendant" || p.id === "midheaven") return true;
    return personB.planets.some((pl) => pl.id === p.id);
  });

  const out: CompatibilityProfile = {
    personA: personASigns,
    personB: personBSigns,
    allPlacementsA,
    allPlacementsB,
    overall,
    // Five domains mirror the honest breakdown's areas 1:1 (same numbers, so
    // the page never shows two conflicting scores for the same concept).
    domainScores: [
      { key: "romance", label: "Romance", value: areaValue("attraction") },
      { key: "communication", label: "Communication", value: areaValue("communication") },
      { key: "stability", label: "Stability", value: areaValue("trust") },
      { key: "intimacy", label: "Intimacy", value: areaValue("emotional") },
      { key: "growth", label: "Growth", value: areaValue("longTerm") },
    ],
    archetype: syn.archetype,
    narrativeSections,
    strengths: topStrengths,
    frictions: topFrictions,
    tensionPoints,
    tensionBand,
    scoreBand,
  };

  if (compatAnalysis) {
    out.compat = compatAnalysis;
  }

  return out;
}
