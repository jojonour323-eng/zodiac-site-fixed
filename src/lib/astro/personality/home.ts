// ===========================================================================
// HOME PORTRAIT V2 — "Who you are" compressed version
// ---------------------------------------------------------------------------
// Third-person gender-aware prose built from the whole-chart dimension
// model. Names the top contradiction explicitly, keeps the archetype card.
// Authored neutral-plural; gv() genderizes at render time.
// ===========================================================================

import type { PersonalityProfile } from "./model";
import { selectArchetype, type ArchetypeResult } from "./archetype";
import type { Rng } from "./core";
import { makeRng } from "./core";
import { v, isHigh, isLow, topDims } from "./prose";
import { makeVoice } from "./deep/voice";

export interface HomePortrait {
  title: string;
  paragraphs: string[];
  archetype: ArchetypeResult;
}

// ---------------------------------------------------------------------------
// Title generation — from the dominant psychological pattern
// ---------------------------------------------------------------------------

interface TitleRule {
  test: (p: PersonalityProfile) => boolean;
  titles: string[];
}

const TITLE_RULES: TitleRule[] = [
  {
    test: (p) => isHigh(p, "intensityDepth") && isLow(p, "vulnerabilityOpenness", 45),
    titles: ["Calm Face, Burning Core", "Deep Water, Still Surface", "The Contained Inferno"],
  },
  {
    test: (p) => isHigh(p, "independence") && isHigh(p, "attachmentNeed"),
    titles: ["Free, But Never Careless", "Untamed and Still Yours"],
  },
  {
    test: (p) => isHigh(p, "overthinking") && isHigh(p, "analyticalThinking", 58),
    titles: ["The Mind That Never Clocks Out", "Everything, Examined"],
  },
  {
    test: (p) => isHigh(p, "confidence") && isHigh(p, "expressiveness"),
    titles: ["Made to Be Seen", "The Room Adjusts"],
  },
  {
    test: (p) => isHigh(p, "emotionalSensitivity") && isHigh(p, "emotionalControl", 58),
    titles: ["Deep Feeling, Tight Edit", "Composure With a Cost"],
  },
  {
    test: (p) => isHigh(p, "ambition") && isHigh(p, "discipline"),
    titles: ["Built for the Long Game", "Relentless, In Order"],
  },
  {
    test: (p) => isHigh(p, "impulsivity") && isHigh(p, "playfulness", 58),
    titles: ["Here for the Plot", "Spark First, Map Later"],
  },
  {
    test: (p) => isHigh(p, "romanticism") && isHigh(p, "idealism", 58),
    titles: ["Love as the Operating System", "Believer in the Big Feeling"],
  },
  {
    test: (p) => isHigh(p, "nurturance") && isHigh(p, "intuition", 58),
    titles: ["Everyone's Safe Place", "Feels First, Fixes Second"],
  },
  {
    test: (p) => isHigh(p, "independence") && isHigh(p, "idealism", 58),
    titles: ["Own Road, Own Reasons"],
  },
];

function pickTitle(p: PersonalityProfile, rng: Rng): string {
  for (const rule of TITLE_RULES) {
    if (rule.test(p)) return rng.pick(rule.titles);
  }
  const map: Record<string, string[]> = {
    fire: ["Runs Hot", "Lit From Inside"],
    earth: ["Solid Ground Energy", "Down to Business"],
    air: ["Lives in Ideas", "Airborne Thinking"],
    water: ["Moves by Feeling", "Tidal Inner Life"],
  };
  return rng.pick(map[p.facts.dominantElement] ?? ["One of a Kind"]);
}

// ---------------------------------------------------------------------------
// Paragraph builders
// ---------------------------------------------------------------------------

/** Sentence fragments per dimension, keyed high/low — authored neutral. */
const HIGH_PHRASES: Record<string, string[]> = {
  independence: [
    "they need to make their own choices, and being told what to do makes them dig in fast",
    "they like doing things their own way — it can look like confidence, but some days it's just stubbornness",
  ],
  attachmentNeed: [
    "they love the people they let in more than they show, and those people are not replaceable",
    "loyalty is baked in — once they commit, they stay committed",
  ],
  emotionalSensitivity: [
    "they notice how people feel even when nobody says it out loud",
    "they feel things early and strongly, even when their face stays calm",
  ],
  emotionalControl: [
    "they keep a tight lid on what they show — calm outside, busy inside",
    "they hide their feelings so well that most people never notice them",
  ],
  intensityDepth: [
    "they go all-in on what they care about — halfway interested isn't a mode they have",
    "they either commit fully or walk away",
  ],
  overthinking: [
    "they replay conversations and re-check decisions long after everything is over",
    "they lie in bed thinking things over when they should be sleeping",
  ],
  confidence: [
    "they trust themselves — they decide, they move, and they don't need applause to do it",
    "when other people doubt them, it doesn't shake them much",
  ],
  impulsivity: [
    "when they want something, they act fast — sometimes faster than they should",
    "acting comes first and thinking comes later, which makes life fun and sometimes expensive",
  ],
  expressiveness: [
    "their feelings show on their face before they say a word",
    "when they walk in, the room notices",
  ],
  ambition: [
    "they keep building toward their goals even on bad days",
    "almost every decision quietly serves a bigger goal",
  ],
  discipline: [
    "when they commit to something, they actually stick to it",
    "they can do the boring parts again and again until it works",
  ],
  romanticism: [
    "they take love seriously, believing in the big version of it",
    "casual dating doesn't feed them — they want real depth",
  ],
  nurturance: [
    "they notice what people need and quietly take care of it before being asked",
    "they're protective and warm, sometimes even with people they barely know",
  ],
  adaptability: [
    "when plans change, they adjust without making a scene",
    "they can start over more easily than most people, which some find strange",
  ],
  idealism: [
    "they hold very high standards, so real life often disappoints them",
    "they compare everything to how they think life should be",
  ],
  resilience: [
    "they bounce back fast — they take the hit, they learn from it, and they keep going",
    "people quietly draw strength from how they handle hard times",
  ],
  trustCaution: [
    "they trust slowly, based on proof — and if someone betrays them, that trust is gone",
    "they quietly size people up while being friendly",
  ],
  socialSelectivity: [
    "only a few people get to know the real them",
    "their close circle is tiny and carefully chosen",
  ],
  needForControl: [
    "they're easygoing when they get to choose, and stubborn when it's forced on them",
    "they get uncomfortable when things are out of their control",
  ],
  communicationDirectness: [
    "they say things straight — some people find it refreshing, others find it a lot",
    "they skip the small talk and they go straight to the point",
  ],
  intuition: [
    "their first impressions are usually right, and they've learned to trust them",
    "they read people and rooms fast by gut feel",
  ],
  selfCriticism: [
    "they're much harder on themselves than they are on other people",
    "a harsh inner voice is always grading them",
  ],
  patience: [
    "they can outwait almost anyone",
    "they play the long game better than most people can",
  ],
  analyticalThinking: [
    "they want to know how things actually work, not just the story",
    "they take ideas apart before they believe them",
  ],
  creativity: [
    "they need to make things — it's as basic as breathing for them",
    "they put their own spin on everything they touch",
  ],
  playfulness: [
    "they kept their playful side as an adult",
    "jokes slip out at serious times, even when they shouldn't",
  ],
};

const LOW_PHRASES: Record<string, string[]> = {
  patience: ["they get annoyed fast with slow people and slow processes", "waiting shows on their face"],
  discipline: ["they only keep structure when they feel like it", "routines are hard for them — not out of rebellion, that's just how their motivation works"],
  emotionalSensitivity: ["their feelings show up late and leave fast", "they stay calm, so people may think they don't care"],
  vulnerabilityOpenness: ["they keep a wall up around their inner life", "even people close to them only know parts of them"],
  attachmentNeed: ["they don't need much reassurance", "they stay self-sufficient even in relationships"],
  overthinking: ["they're unusually good at letting things go", "their mind moves on instead of looping"],
  impulsivity: ["they wait for things to settle before deciding", "they'd rather wait than act on impulse"],
  socialEnergy: ["being around people drains them; alone time recharges them", "crowds and small talk don't do much for them"],
  confidence: ["they doubt themselves even when they're clearly good at things", "they hide their self-doubt well"],
  needForControl: ["they're fine letting someone else take the lead", "they don't need to be in charge"],
  nurturance: ["they show care on purpose, not automatically", "they help best when asked, rather than hunting for what people need"],
  idealism: ["they accept things as they are", "their expectations match reality"],
  resilience: ["they need real time and support to bounce back", "setbacks stay with them longer than they admit"],
  adaptability: ["they prefer what's familiar and stable", "routine makes them feel safe"],
  romanticism: ["they measure love by reliability, not big gestures", "they're practical about love"],
  expressiveness: ["they keep to themselves and don't show much", "they have a natural poker face"],
  intensityDepth: ["they stay moderate about almost everything", "they don't do extremes"],
  socialSelectivity: ["they're open to new people", "they're comfortable with strangers right away"],
  communicationDirectness: ["they soften how they say things", "they choose words that keep the mood pleasant"],
  intuition: ["they trust evidence more than gut feelings", "they only trust what they can check"],
};

function coreParagraph(p: PersonalityProfile, voiceT: (s: string) => string, rng: Rng): string {
  const dims = topDims(p, 3);
  const bits: string[] = [];
  for (const d of dims) {
    if (d.value >= 60) bits.push(rng.pick(HIGH_PHRASES[d.key] ?? []));
    else if (d.value <= 40) bits.push(rng.pick(LOW_PHRASES[d.key] ?? []));
  }
  const usable = bits.filter(Boolean);
  if (!usable.length) {
    return voiceT("This chart doesn't shout one pattern — several run at once, which usually describes someone who adapts to the room instead of forcing the room to adapt. People who pay attention can usually tell which mode is active.");
  }
  const elLine: Record<string, string> = {
    fire: "At their core there's fire: they need to feel alive, not just get through the day.",
    earth: "At their core there's earth: they need real results they can see and a life that feels safe.",
    air: "At their core there's air: they think about things first instead of reacting emotionally right away.",
    water: "At their core there's water: they feel first and find the words later. Moods are information to them.",
  };
  const joined = usable.join("; ");
  const cased = joined.charAt(0).toUpperCase() + joined.slice(1);
  return voiceT(`${cased}. ${elLine[p.facts.dominantElement]}`);
}

function lifeParagraph(p: PersonalityProfile, voiceT: (s: string) => string, rng: Rng): string {
  // motivation / ambition mix
  if (isHigh(p, "ambition") && isHigh(p, "discipline")) {
    return voiceT(rng.pick([
      "They want big things, and they can stick to a plan — they keep building even on days they don't feel like it. That mix is how they get results most people never reach.",
      "They naturally play the long game: they want it for real and they follow through, so it becomes more than talk.",
    ]));
  }
  if (isHigh(p, "ambition") && !isHigh(p, "discipline")) {
    return voiceT("They want big things, and they want them fast. The drive is real — but sticking to a plan doesn't come naturally, so they have to build that part on purpose. In short bursts they can outwork almost anyone.");
  }
  void rng;
  return voiceT("Their goals are mostly quiet ones: get really good at what they do, feel safe, and build a stable life. They don't need everyone to see them winning.");
}

export function buildHomePortrait(profile: PersonalityProfile, gender?: "male" | "female" | null): HomePortrait {
  const rng = makeRng(profile.facts.seed + "|home-v2");
  const voice = makeVoice(gender ?? null);
  const T = (x: string) => voice.t(x);
  const title = pickTitle(profile, rng);
  const archetype = selectArchetype(profile, gender);

  const paragraphs: string[] = [];
  paragraphs.push(coreParagraph(profile, T, rng));

  // emotional world compressed
  const sens = v(profile, "emotionalSensitivity");
  const ctrl = v(profile, "emotionalControl");
  const vuln = v(profile, "vulnerabilityOpenness");
  if (sens >= 62 && ctrl >= 58) {
    paragraphs.push(T("They feel everything at full volume inside, but very little shows on the outside. People usually have no idea how much is going on under the calm."));
  } else if (sens >= 62) {
    paragraphs.push(T("Their feelings arrive fast and show on their face. Everyone can read them, and they're okay with that — being honest feels better than hiding."));
  } else if (ctrl >= 62) {
    paragraphs.push(T("They deal with feelings privately, in their own time. Because they rarely show emotion, when they finally do, people can tell it's serious."));
  }

  // love world compressed
  const att = profile.styles.attachment.note;
  paragraphs.push(T(`In relationships, they ${att}.`));

  // THE contradiction — explicit
  if (profile.contradictions[0]) {
    const c = profile.contradictions[0];
    paragraphs.push(T(`The biggest contradiction in them: ${c.title.toLowerCase()} — ${firstSentence(c.body)}`));
  }

  paragraphs.push(lifeParagraph(profile, T, rng));

  return { title, paragraphs, archetype };
}

function firstSentence(body: string): string {
  const idx = body.indexOf(". ");
  return idx > 0 ? body.slice(0, idx + 1) : body.slice(0, 140);
}
