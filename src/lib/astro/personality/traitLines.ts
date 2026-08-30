// ===========================================================================
// TRAIT LINES — the person's traits, one per line, in detail
// ---------------------------------------------------------------------------
// The site-wide "traits on a bullet list" engine: picks the chart's most
// distinctive traits and writes each one as a detailed bullet — what it
// looks like in daily life (simple words) plus WHY, citing the real
// placements that produced it. Used by the Home tab, the full reading, and
// adapted per tab. Authored neutral-plural ("They …") so gv() genderizes.
// ===========================================================================

import type { Dimension, DimensionScore } from "./core";
import type { PersonalityProfile } from "./model";
import { citesFor } from "./rings";

export type TraitLevel = "very high" | "high" | "low" | "very low";

export interface TraitLine {
  key: Dimension;
  /** Friendly name, e.g. "Straight talk" instead of "communicationDirectness". */
  label: string;
  level: TraitLevel;
  value: number;
  /** Detailed, concrete description of the trait at this level. */
  line: string;
  /** Real chart citation, e.g. "Venus in Taurus ♉️ + Moon square Saturn". */
  why: string;
}

/** Friendly labels (the raw dimension names read like a textbook). */
const TRAIT_LABELS: Record<Dimension, string> = {
  socialEnergy: "Social battery",
  socialSelectivity: "Picky with people",
  expressiveness: "Showing feelings",
  emotionalSensitivity: "Emotional radar",
  emotionalControl: "Keeping a poker face",
  vulnerabilityOpenness: "Opening up",
  attachmentNeed: "Need for closeness",
  independence: "Independence",
  trustCaution: "Trust pace",
  jealousyRisk: "Jealous streak",
  communicationDirectness: "Straight talk",
  analyticalThinking: "Analytical mind",
  overthinking: "Overthinking",
  intuition: "Gut instinct",
  confidence: "Self-belief",
  selfCriticism: "Inner critic",
  ambition: "Drive to achieve",
  discipline: "Follow-through",
  patience: "Patience",
  impulsivity: "Act-first instinct",
  adaptability: "Going with change",
  creativity: "Creative wiring",
  romanticism: "Romantic heart",
  nurturance: "Caring instinct",
  intensityDepth: "Intensity",
  needForControl: "Need for control",
  idealism: "High standards",
  resilience: "Bounce-back",
  playfulness: "Playfulness",
};

/**
 * The detailed copy. One entry per dimension per polarity — concrete daily
 * behavior in simple words, 2 sentences. Starts with "They" so the voice
 * transform conjugates cleanly.
 */
const DETAIL: Record<Dimension, { high: string; low: string }> = {
  socialEnergy: {
    high: "They come alive around people — a hangout, a party, a busy group chat all give them energy instead of taking it. After a whole day surrounded by people, they feel better, not tired.",
    low: "People time costs them energy, so they spend it carefully. A quiet night alone is not a fallback for them — it's the plan that keeps them sane.",
  },
  socialSelectivity: {
    high: "Plenty of people know their name; almost nobody knows their business. Getting into the real inner circle takes time and proof, and most people never make the cut.",
    low: "They let people in easily and quickly — new faces feel like potential friends, not threats. There isn't much of a wall to get past.",
  },
  expressiveness: {
    high: "Their face broadcasts everything before their mouth says a word — excitement, boredom, hurt, all of it visible. People always know where they stand with them.",
    low: "Their face stays calm even when a lot is happening inside, which people often misread as not caring. Most of what they feel never makes it to the surface.",
  },
  emotionalSensitivity: {
    high: "They pick up on the tiny stuff — a change in someone's tone, a text that reads slightly off, a mood in the room. It registers early and it sticks with them.",
    low: "Emotions reach them on a delay and slide off quickly. Someone can be upset with them for an hour before they even notice, and it won't haunt them after.",
  },
  emotionalControl: {
    high: "They keep a tight grip on what they show — feelings get processed privately and released on purpose, if at all. When something finally does get out, people know it's serious.",
    low: "What they feel is what people see, right away, at full size. There's no delay between the feeling arriving and it showing.",
  },
  vulnerabilityOpenness: {
    high: "They can show the unpolished stuff — fear, need, mess — without it feeling like danger. Being truly known matters more to them than looking fine.",
    low: "The inner world stays behind a closed door, even with people they love. They share facts easily and feelings on a strict need-to-know basis.",
  },
  attachmentNeed: {
    high: "Closeness is a real need, not a nice extra — once they bond, they need to know the bond holds. Late replies and cold days hit them harder than they'd admit.",
    low: "They don't need much reassurance to feel secure, and they don't fall apart when someone's away. They can be fully in love and still fully themselves.",
  },
  independence: {
    high: "They need to be the author of their own life — being told what to do triggers instant resistance. They'd rather do it alone, their way, even the hard way.",
    low: "They're genuinely comfortable leaning on people and letting someone else lead. Sharing decisions feels like relief to them, not a loss.",
  },
  trustCaution: {
    high: "Trust is issued on evidence only — they watch what people do, not what they say. Betray the trust once and there is rarely a second chance.",
    low: "They lead with trust and give people the benefit of the doubt. It makes them easy to be around — and occasionally easy to hurt.",
  },
  jealousyRisk: {
    high: "When they feel insecure, the possessive side wakes up — checking, comparing, testing. It's a fear response, not a character flaw, but it needs to be named out loud.",
    low: "Possessiveness just isn't in them — if their person wants space or has other friends, it doesn't spike anything. Freedom in a relationship relaxes them.",
  },
  communicationDirectness: {
    high: "They say the thing directly — no wrapping it up, no softening landing. Some people find it refreshing; others find it a lot.",
    low: "They package words carefully so nobody gets hurt, which makes them pleasant company. The downside: people sometimes miss what they actually meant.",
  },
  analyticalThinking: {
    high: "They take things apart before trusting them — how it works, why it works, what breaks it. Feelings are data, but the explanation has to make sense.",
    low: "They decide by feel first and explain later, if ever. Long analysis bores them; their first read is usually the one they keep.",
  },
  overthinking: {
    high: "Their mind replays conversations, re-reads texts, and re-checks decisions long after everyone else moved on. Bedtime is when it gets loudest.",
    low: "They let things go — genuinely, not just saying it. Once a conversation is over, it's over; no replay, no 2am analysis.",
  },
  intuition: {
    high: "They know before they can explain why — people, rooms, decisions, all of it arrives as a feeling first. Their first impression usually turns out right.",
    low: "They want evidence before they believe anything, and hunches don't count. Gut feelings are noted but never trusted blindly.",
  },
  confidence: {
    high: "They back themselves — they decide, they move, and other people's doubt barely registers. Self-belief is the default setting, not something they psych up for.",
    low: "The doubt shows up even when they're clearly good at something. They usually get it right anyway — they just don't believe it afterwards.",
  },
  selfCriticism: {
    high: "An inner voice grades everything they do, and it's stricter with them than they'd ever be with anyone else. Praise bounces off; one small mistake sticks.",
    low: "They judge themselves by fair rules — same standards they'd use on a friend. Mistakes get noted, fixed, and let go.",
  },
  ambition: {
    high: "Nearly every decision quietly serves a bigger goal — they're building toward something even on the days they look relaxed. Standing still feels like falling behind.",
    low: "They're not chasing a ladder — a good day, good people, and real rest are the goals. If ambition shows up, it's for something they actually care about.",
  },
  discipline: {
    high: "They do the boring parts again and again until it works — routines hold, promises to themselves stick. Consistency is their quiet superpower.",
    low: "Structure only holds when they feel like it, and that changes daily. They work in bursts of real motivation, not schedules.",
  },
  patience: {
    high: "They can outwait almost anyone — slow processes don't frustrate them because they're playing a longer game than the people around them.",
    low: "Slow things show on their face within minutes — slow walkers, slow replies, slow loading bars. Waiting feels like something being taken from them.",
  },
  impulsivity: {
    high: "When they want something, they move — buy it, say it, book it — sometimes before the thinking part catches up. It makes life fun and occasionally expensive.",
    low: "They wait for things to settle before deciding, and sleep on anything that costs money. Fast decisions feel reckless to them, not exciting.",
  },
  adaptability: {
    high: "Plans changing doesn't rattle them — they reroute calmly and sometimes the new plan is better. Starting over is easier for them than for most people.",
    low: "They like the known: same places, same routines, same people. Change is doable, but they need warning and a reason.",
  },
  creativity: {
    high: "They need to make things — it's as basic as breathing — and they put their own spin on everything they touch. Off-the-shelf versions of anything feel wrong to them.",
    low: "They appreciate other people's creativity more than they produce their own. If it exists and works, they'd rather use it than reinvent it.",
  },
  romanticism: {
    high: "They take love seriously in the big-movie sense — grand feelings, real meaning, no casual versions. Half-hearted romance doesn't feed them at all.",
    low: "They measure love by reliability, not by gestures — showing up, remembering, staying steady. Grand romantic theater honestly embarrasses them a little.",
  },
  nurturance: {
    high: "They notice what people need and quietly handle it before anyone asks — food, rides, reminders, backups. Caring is a reflex, not a decision.",
    low: "They care on purpose rather than automatically, and they help best when asked. They don't hover — they trust people to handle their own lives.",
  },
  intensityDepth: {
    high: "Everything they care about, they care about at full volume — interests, people, arguments, loyalty. Halfway-in isn't a mode they have.",
    low: "They keep almost everything at a moderate setting on purpose. Extremes exhaust them; steady and sustainable wins.",
  },
  needForControl: {
    high: "They need to be the author of their own plans — it's about authorship, not bossiness. When change is imposed on them, the same disruption lands twice as hard.",
    low: "They're relaxed about outcomes and happy to let someone else drive. Not deciding is a vacation for them, not a threat.",
  },
  idealism: {
    high: "They hold everything up against how it should be — and real life regularly loses that comparison. The standards build great things and cost real peace.",
    low: "They take life as it is, expectations included. Disappointment rarely lands hard because they didn't promise themselves a perfect version.",
  },
  resilience: {
    high: "They take the hit, learn from it, and keep moving — sometimes faster than the people watching expected. Setbacks are information to them, not injuries.",
    low: "Setbacks stay with them longer than they admit, and recovery needs real time and usually real support. They get there — just slower and less loudly.",
  },
  playfulness: {
    high: "The playful side never got retired — jokes land at serious moments, games break out anywhere, and they tease the people they like the most.",
    low: "Their default register is serious, and jokes have to earn their way in. People who know them well know the dry humor is there — it's just rationed.",
  },
};

const HIGH_LEVELS: [number, TraitLevel][] = [[78, "very high"], [64, "high"]];
const LOW_LEVELS: [number, TraitLevel][] = [[22, "very low"], [36, "low"]];

function levelFor(value: number): TraitLevel | null {
  for (const [t, l] of HIGH_LEVELS) if (value >= t) return l;
  for (const [t, l] of LOW_LEVELS) if (value <= t) return l;
  return null;
}

/**
 * Pick the chart's most distinctive traits (extremes only) and write each as
 * a detailed bullet. Capped at `max`, sorted by how far they sit from the
 * average person, so the list leads with the loudest traits.
 */
export function buildTraitLines(p: PersonalityProfile, max = 10): TraitLine[] {
  const candidates = [...p.scores]
    .map((s) => ({ s, level: levelFor(s.value) }))
    .filter((x): x is { s: DimensionScore; level: TraitLevel } => x.level !== null)
    .sort((a, b) => Math.abs(b.s.value - 50) - Math.abs(a.s.value - 50))
    .slice(0, max);

  return candidates.map(({ s, level }) => {
    const entry = DETAIL[s.key];
    const line = s.value >= 50 ? entry.high : entry.low;
    const why = citesFor(s, 2);
    return {
      key: s.key,
      label: TRAIT_LABELS[s.key],
      level,
      value: s.value,
      line,
      why,
    };
  });
}
