// ===========================================================================
// ARCHETYPE ENGINE — personality labels that emerge from the analysis
// ---------------------------------------------------------------------------
// Each archetype is scored against the psychological DIMENSION PROFILE (never
// against Sun signs), so two people with the same Sun get different labels
// when their actual psychology differs. The top scorer above threshold wins;
// runners-up add flavor. Each result carries its reasons (top dimensions that
// earned it) so the UI can explain WHY.
// ===========================================================================

import type { PersonalityProfile } from "./model";
import type { Dimension } from "./core";
import { gv } from "./deep/voice";

export interface ArchetypeResult {
  id: string;
  emoji: string;
  label: string;
  /** One-line "why this fits" citing the real dimension drivers. */
  reason: string;
  runnerUps: { label: string; emoji: string }[];
}

interface ArchetypeDef {
  id: string;
  emoji: string;
  labels: string[];
  /** Score 0-100 from dimensions; higher = stronger match. */
  score: (v: Record<Dimension, number>) => number;
  /** Dims that most earned it — used for the reason line. */
  evidence: Dimension[];
  /** Reason template: takes top-2 evidence descriptions. */
  reason: (v: Record<Dimension, number>, facts: PersonalityProfile["facts"]) => string;
}

const hi = (v: Record<Dimension, number>, d: Dimension, t = 62) => Math.max(0, v[d] - t) * 2.2;
const lo = (v: Record<Dimension, number>, d: Dimension, t = 40) => Math.max(0, t - v[d]) * 2.2;
const band2 = (v: Record<Dimension, number>, d: Dimension, a: number, b: number) =>
  v[d] >= a && v[d] <= b ? 20 : 0;

const DEFS: ArchetypeDef[] = [
  {
    id: "overthinker",
    emoji: "🧠",
    labels: ["Professional Overthinker", "Chief Replay Officer", "The Analyst of Everything"],
    score: (v) => hi(v, "overthinking", 58) + hi(v, "analyticalThinking", 55) + lo(v, "patience", 45) * 0.5 + band2(v, "overthinking", 58, 100),
    evidence: ["overthinking", "analyticalThinking"],
    reason: (v, facts) =>
      `Their mind replays everything — conversations, motives, old messages — and "let it go" isn't a setting they have.`,
  },
  {
    id: "vault",
    emoji: "🧊",
    labels: ["Emotional Vault", "The Locked Diary", "Classified Information"],
    score: (v) => hi(v, "emotionalControl", 58) + lo(v, "vulnerabilityOpenness", 45) + hi(v, "intensityDepth", 55) * 0.7,
    evidence: ["emotionalControl", "vulnerabilityOpenness", "intensityDepth"],
    reason: (v, facts) =>
      `Feeling at full volume while showing almost none of it — the calm reads as cold from the outside, but it's actually tight self-control.`,
  },
  {
    id: "quiet_storm",
    emoji: "🌪️",
    labels: ["The Quiet Storm", "Still Waters, Strong Current", "Calm Surface, Deep Water"],
    score: (v) => hi(v, "intensityDepth", 62) + lo(v, "expressiveness", 48) + hi(v, "emotionalSensitivity", 58) * 0.8,
    evidence: ["intensityDepth", "expressiveness", "emotionalSensitivity"],
    reason: (v, facts) =>
      `Everything moves hard underneath while almost nothing shows above the waterline — the quiet outside is not what's actually going on.`,
  },
  {
    id: "main_character",
    emoji: "🎬",
    labels: ["Main Character", "The Headline", "Born Leading Role"],
    score: (v) => hi(v, "confidence", 60) + hi(v, "expressiveness", 58) + hi(v, "ambition", 58) * 0.8,
    evidence: ["confidence", "expressiveness", "ambition"],
    reason: (v, facts) =>
      `Confidence with presence to match — they don't ask for attention, rooms just reorganize around them.`,
  },
  {
    id: "plot_twist",
    emoji: "⚡",
    labels: ["Walking Plot Twist", "The Wildcard", "Unpredictable by Design"],
    score: (v) => hi(v, "adaptability", 60) + hi(v, "impulsivity", 58) + lo(v, "discipline", 48) * 0.6,
    evidence: ["adaptability", "impulsivity"],
    reason: (v, facts) =>
      `Plans are suggestions, and the person they were last month may not survive this month — they change as fast as they adapt.`,
  },
  {
    id: "lie_detector",
    emoji: "🔍",
    labels: ["Human Lie Detector", "The X-Ray", "Sees Through Everything"],
    score: (v) => hi(v, "intuition", 60) + hi(v, "trustCaution", 58) + hi(v, "analyticalThinking", 52) * 0.7,
    evidence: ["intuition", "trustCaution", "analyticalThinking"],
    reason: (v, facts) =>
      `Their gut read on people is wired straight into caution — they clock the inconsistency in someone's story before the person telling it does.`,
  },
  {
    id: "secret_softie",
    emoji: "🧸",
    labels: ["Secret Softie", "The Guarded Caretaker", "Tough Shell, Warm Center"],
    score: (v) => hi(v, "nurturance", 58) + lo(v, "vulnerabilityOpenness", 48) + hi(v, "attachmentNeed", 55) * 0.6,
    evidence: ["nurturance", "vulnerabilityOpenness"],
    reason: (v, facts) =>
      `They take care of everyone while letting almost no one take care of them — the tenderness is real, the access is restricted.`,
  },
  {
    id: "hopeless_romantic",
    emoji: "🌹",
    labels: ["Hopeless Romantic", "Heart First", "Loves Like a Movie"],
    score: (v) => hi(v, "romanticism", 62) + hi(v, "idealism", 55) * 0.8 + hi(v, "attachmentNeed", 55) * 0.6,
    evidence: ["romanticism", "idealism", "attachmentNeed"],
    reason: (v, facts) =>
      `They fall toward the best version of love and of people, sometimes before any real evidence shows up.`,
  },
  {
    id: "perfectionist",
    emoji: "📐",
    labels: ["The Perfectionist", "Standards Department", "Nothing Below Excellent"],
    score: (v) => hi(v, "selfCriticism", 58) + hi(v, "discipline", 58) + hi(v, "analyticalThinking", 52) * 0.6,
    evidence: ["selfCriticism", "discipline"],
    reason: (v, facts) =>
      `Discipline plus a loud inner critic — good is a checkpoint, not a destination, and they're always the first to notice the gap.`,
  },
  {
    id: "menace",
    emoji: "😈",
    labels: ["The Menace", "Certified Problem", "Chaos With a Smile"],
    score: (v) => hi(v, "impulsivity", 60) + hi(v, "confidence", 55) + hi(v, "playfulness", 58) + lo(v, "patience", 45) * 0.7,
    evidence: ["impulsivity", "playfulness", "confidence"],
    reason: (v, facts) =>
      `Playfulness wired to impulse — rules read as opening bids, and the glint in their eye usually arrives two seconds before trouble does.`,
  },
  {
    id: "therapist_friend",
    emoji: "🛋️",
    labels: ["Therapist Friend", "Everyone's Anchor", "The Human Safe Space"],
    score: (v) => hi(v, "nurturance", 60) + hi(v, "intuition", 55) + hi(v, "emotionalSensitivity", 55) * 0.8,
    evidence: ["nurturance", "intuition", "emotionalSensitivity"],
    reason: (v, facts) =>
      `They read moods and absorb them — friends arrive upset and leave lighter, and this person quietly carries the residue afterward.`,
  },
  {
    id: "control_freak",
    emoji: "🎛️",
    labels: ["Control Freak", "The Project Manager of Reality", "Runs the Board"],
    score: (v) => hi(v, "needForControl", 60) + hi(v, "discipline", 52) * 0.7 + hi(v, "ambition", 52) * 0.6,
    evidence: ["needForControl", "discipline"],
    reason: (v, facts) =>
      `It's not about being bossy — it's about needing authorship. When they choose the plan, they're flexible; when it's imposed on them, cooperation expires.`,
  },
  {
    id: "escape_artist",
    emoji: "🕊️",
    labels: ["The Escape Artist", "Exit Strategy Personified", "Gone Before the Conflict Starts"],
    score: (v) => hi(v, "idealism", 55) + hi(v, "independence", 58) + lo(v, "attachmentNeed", 45) * 0.7 + hi(v, "adaptability", 52) * 0.5,
    evidence: ["independence", "idealism"],
    reason: (v, facts) =>
      `Independence tuned to idealism — when reality disappoints the picture in their head, they relocate rather than repair. Doors are never truly closed behind them.`,
  },
  {
    id: "golden",
    emoji: "🐕",
    labels: ["Golden Retriever Energy", "The Human Sunbeam", "Zero Threat, Full Heart"],
    score: (v) => hi(v, "socialEnergy", 58) + hi(v, "playfulness", 55) + hi(v, "nurturance", 52) * 0.7 + lo(v, "trustCaution", 42) * 0.8,
    evidence: ["socialEnergy", "playfulness"],
    reason: (v, facts) =>
      `Openness with real warmth underneath — liking people by default, forgiving fast, grudges rarely lasting past a bus ride.`,
  },
  {
    id: "drama_queen",
    emoji: "✨",
    labels: ["Drama Queen", "Certified Drama", "Main Character Energy"],
    score: (v) => hi(v, "expressiveness", 62) + hi(v, "emotionalSensitivity", 58) * 0.9 + hi(v, "romanticism", 55) * 0.6,
    evidence: ["expressiveness", "emotionalSensitivity"],
    reason: (v, facts) =>
      `Feelings arrive big, get narrated big, and regular life simply isn't dramatic enough to contain them.`,
  },
  {
    id: "stoic",
    emoji: "🏔️",
    labels: ["The Stoic", "Unshakeable", "Built Like Bedrock"],
    score: (v) => hi(v, "emotionalControl", 60) + hi(v, "discipline", 58) + hi(v, "resilience", 55) * 0.7 + lo(v, "expressiveness", 48) * 0.5,
    evidence: ["emotionalControl", "resilience", "discipline"],
    reason: (v, facts) =>
      `They absorb what would fold other people, adjust the plan, and mention none of it — the steadiness is the whole personality.`,
  },
  {
    id: "chaos_merchant",
    emoji: "🎲",
    labels: ["Chaos Merchant", "Dealer of Mayhem", "A Situation Waiting to Happen"],
    score: (v) => hi(v, "impulsivity", 62) + hi(v, "adaptability", 58) + lo(v, "discipline", 45) * 0.8,
    evidence: ["impulsivity", "adaptability"],
    reason: (v, facts) =>
      `They don't create chaos on purpose — they just make decisions three hops ahead of the consequences and clean up later.`,
  },
  {
    id: "strategist",
    emoji: "♟️",
    labels: ["The Strategist", "Three Moves Ahead", "The Long Game"],
    score: (v) => hi(v, "analyticalThinking", 60) + hi(v, "patience", 55) + hi(v, "needForControl", 52) * 0.6 + hi(v, "ambition", 55) * 0.6,
    evidence: ["analyticalThinking", "patience", "ambition"],
    reason: (v, facts) =>
      `Patience plus analysis — while everyone else reacts to move one, they're already playing move four.`,
  },
  {
    id: "free_spirit",
    emoji: "🎈",
    labels: ["Free Spirit", "Untethered", "The Wind Chose Them"],
    score: (v) => hi(v, "independence", 62) + hi(v, "adaptability", 55) + lo(v, "attachmentNeed", 45) * 0.8,
    evidence: ["independence", "adaptability"],
    reason: (v, facts) =>
      `Independence running the show with low attachment need — commitment feels less like a promise and more like a door quietly closing. They need room the way others need oxygen.`,
  },
  {
    id: "steady_heart",
    emoji: "🪨",
    labels: ["The Steady Heart", "The Constant", "Ride-or-Die Certified"],
    score: (v) => hi(v, "patience", 58) + hi(v, "nurturance", 55) + hi(v, "discipline", 52) * 0.6 + hi(v, "attachmentNeed", 55) * 0.6,
    evidence: ["patience", "nurturance", "attachmentNeed"],
    reason: (v, facts) =>
      `Patience plus deep loyalty — when they're in, they're in, and the people they love get a consistency that's almost extinct.`,
  },
];

/** Gender-aware label swap so nicknames match how people actually talk. */
function genderSwap(label: string, gender?: "male" | "female" | null): string {
  if (gender === "male") return label.replace(/\bQueen\b/g, "King");
  return label;
}

export function selectArchetype(
  profile: PersonalityProfile,
  gender?: "male" | "female" | null,
): ArchetypeResult {
  const v = Object.fromEntries(profile.scores.map((s) => [s.key, s.value])) as Record<Dimension, number>;
  const ranked = DEFS.map((d) => ({ def: d, score: d.score(v) + d.evidence.length }))
    .sort((a, b) => b.score - a.score);

  const winner = ranked[0];
  const rngPick = genderSwap(pickLabel(profile.facts.seed, winner.def.labels), gender);
  // Reasons stay in third person and get gender-correct pronouns via gv().
  const reason = gv(winner.def.reason(v, profile.facts), gender ?? null);
  const runnerUps = ranked.slice(1, 3).map((r) => ({
    label: genderSwap(pickLabel(profile.facts.seed + r.def.id, r.def.labels), gender),
    emoji: r.def.emoji,
  }));

  return {
    id: winner.def.id,
    emoji: winner.def.emoji,
    label: rngPick,
    reason,
    runnerUps,
  };
}

/** Deterministic pick from a label pool seeded by the chart. */
function pickLabel(seed: string, labels: string[]): string {
  // Import-free tiny hash pick (mulberry-ish) to avoid circular imports.
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return labels[Math.abs(h) % labels.length];
}
