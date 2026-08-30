// ===========================================================================
// COMPATIBILITY — what happens when two actual personalities interact
// ---------------------------------------------------------------------------
// Inputs: personality model A, personality model B, and the synastry
// cross-aspects (unchanged calculation). Area scores blend BOTH sources, so
// the numbers reflect the interaction of two whole charts — and strong
// attraction with poor conflict handling is allowed to coexist.
// ===========================================================================

import type { PersonalityProfile } from "./model";
import { prettyPlanet } from "./model";
import type { SynastryApiResponse, SignId } from "../types";
import { clamp, makeRng, type Rng } from "./core";
import { v, isHigh, isLow, joinAnd } from "./prose";
import { SIGN_META } from "../signs";

// Short placement-citation helper — "Venus in Taurus". Uses the person's
// REAL chart facts, so every bullet traces back to an actual placement.
const POINT_LABELS: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune",
  pluto: "Pluto", north_node: "North Node", chiron: "Chiron", lilith: "Lilith",
  ascendant: "Rising",
};

function citePlacement(p: PersonalityProfile, ids: string[]): string {
  for (const id of ids) {
    const pl = p.facts.planets.find((x) => x.id === id);
    if (pl) return `${POINT_LABELS[id] ?? id} in ${SIGN_META[pl.sign_id as SignId].name}`;
  }
  // Fall back to the Sun, which always exists.
  return `${SIGN_META[p.facts.sun].name} Sun`;
}

function citeBoth(a: PersonalityProfile, b: PersonalityProfile, ids: string[]): string {
  return `${citePlacement(a, ids)} × ${citePlacement(b, ids)}`;
}

export interface CompatArea {
  key: string;
  label: string;
  value: number;
  note: string;
}

export interface CompatAnalysis {
  areas: CompatArea[];
  overall: number;
  headline: { emoji: string; label: string; why: string };
  sections: { id: string; title: string; body?: string; bullets?: string[] }[];
  frictionPoint: { title: string; body: string };
  toxicityRisk: string;
  eachNeeds: { a: string[]; b: string[] };
  strongest: { label: string; body: string }[];
  hardest: { label: string; body: string }[];
}

interface SynastryDomains {
  romance: number;
  communication: number;
  stability: number;
  intimacy: number;
  growth: number;
  tension: number;
  overall: number;
}

export function extractDomains(syn: SynastryApiResponse): SynastryDomains {
  return syn.synastry.scores as unknown as SynastryDomains;
}

const blend = (astro: number, psycho: number, wAstro = 0.55) =>
  Math.round(clamp(astro * wAstro + psycho * (1 - wAstro), 3, 97));

export function buildCompatibilityAnalysis(
  a: PersonalityProfile,
  b: PersonalityProfile,
  syn: SynastryApiResponse,
  genderA?: "male" | "female" | null,
  genderB?: "male" | "female" | null
): CompatAnalysis {
  const rng = makeRng(a.facts.seed + "|" + b.facts.seed + "|compat");
  const domains = extractDomains(syn);
  const aspectList = syn.synastry.aspects ?? [];

  const aspectByPair = (pa: string, pb: string) => {
    const want = new Set([`${pa}|${pb}`, `${pb}|${pa}`]);
    return aspectList.filter((x) => want.has([x.a_point, x.b_point].sort().join("|")));
  };
  const harmScore = (pairs: [string, string][]) => {
    let pos = 0, neg = 0;
    for (const [x, y] of pairs) {
      for (const asp of aspectByPair(x, y)) {
        const w = asp.strength;
        if (asp.polarity === "harmonious" || asp.polarity === "supportive") pos += w;
        else if (asp.polarity === "tense" || asp.polarity === "challenging") neg += w;
        else pos += w * 0.4;
      }
    }
    return clamp(Math.round(50 + (pos - neg) * 18), 3, 97);
  };

  // ---- Emotional Connection ----
  const sensGap = Math.abs(v(a, "emotionalSensitivity") - v(b, "emotionalSensitivity"));
  const sensAvg = (v(a, "emotionalSensitivity") + v(b, "emotionalSensitivity")) / 2;
  const gapPenalty = sensGap > 30 ? -12 : sensGap > 18 ? -6 : 4;
  const emotional = blend(
    (domains.intimacy + harmScore([["moon", "moon"], ["moon", "venus"], ["moon", "sun"], ["moon", "asc"]])) / 2,
    clamp(sensAvg * 0.6 + 50 * 0.4 + gapPenalty, 0, 100),
    0.55
  );

  // ---- Communication ----
  const dirGap = Math.abs(v(a, "communicationDirectness") - v(b, "communicationDirectness"));
  const commPsycho = clamp(
    55 + (dirGap > 35 ? -14 : dirGap > 20 ? -6 : 6) +
    (v(a, "overthinking") > 62 && v(b, "communicationDirectness") < 45 ? -8 : 0) +
    ((v(a, "playfulness") + v(b, "playfulness")) / 2 - 50) * 0.3,
    0, 100
  );
  const communication = blend(
    (domains.communication + harmScore([["mercury", "mercury"], ["mercury", "moon"], ["mercury", "sun"], ["mercury", "asc"]])) / 2,
    commPsycho,
    0.55
  );

  // ---- Attraction ----
  const attractPsycho = clamp(
    46 +
    Math.abs(v(a, "intensityDepth") - 50) * 0.25 + Math.abs(v(b, "intensityDepth") - 50) * 0.25 +
    (Math.abs(v(a, "impulsivity") - v(b, "impulsivity")) > 25 ? 8 : 0) +
    ((v(a, "romanticism") + v(b, "romanticism")) / 2 - 50) * 0.35,
    0, 100
  );
  const attraction = blend(
    (domains.romance + harmScore([["venus", "mars"], ["venus", "venus"], ["mars", "mars"], ["venus", "asc"], ["mars", "asc"], ["sun", "moon"]])) / 2,
    attractPsycho,
    0.6
  );

  // ---- Trust ----
  const trustPsycho = clamp(
    100 - (v(a, "trustCaution") + v(b, "trustCaution")) / 2 +
    (isHigh(a, "jealousyRisk", 60) || isHigh(b, "jealousyRisk", 60) ? -10 : 5),
    0, 100
  );
  const trust = blend(
    (domains.stability + harmScore([["saturn", "sun"], ["saturn", "moon"], ["saturn", "venus"], ["moon", "saturn"]])) / 2,
    trustPsycho * 0.9 + domains.overall * 0.1,
    0.5
  );

  // ---- Lifestyle / pace ----
  const impGap = Math.abs(v(a, "impulsivity") - v(b, "impulsivity"));
  const socGap = Math.abs(v(a, "socialEnergy") - v(b, "socialEnergy"));
  const discGap = Math.abs(v(a, "discipline") - v(b, "discipline"));
  const lifestylePsycho = clamp(62 - impGap * 0.5 - socGap * 0.35 - discGap * 0.3 +
    ((v(a, "patience") + v(b, "patience")) / 2 - 50) * 0.2, 0, 100);
  const lifestyle = blend(domains.stability, lifestylePsycho, 0.45);

  // ---- Conflict handling ----
  const conflictPsycho = conflictCompatibility(a, b);
  const conflict = blend(
    clamp(100 - domains.tension, 0, 100),
    conflictPsycho,
    0.5
  );

  // ---- Long-term potential ----
  const saturnGlue = harmScore([["saturn", "sun"], ["saturn", "moon"], ["saturn", "venus"], ["saturn", "asc"]]);
  const nodeGlue = harmScore([["north_node", "sun"], ["north_node", "moon"], ["north_node", "venus"]]);
  const ltpAstro = (domains.growth + saturnGlue * 0.6 + nodeGlue * 0.4 + domains.overall * 0.6) / 2.6;
  const attachFit = attachmentFit(a, b);
  const longTerm = blend(ltpAstro, attachFit * 0.5 + conflict * 0.25 + trust * 0.25, 0.5);

  const areas: CompatArea[] = [
    {
      key: "emotional", label: "Emotional Connection", value: emotional,
      note: areaNote(emotional, sensGap > 20
        ? `You register feeling at different volumes (${Math.round(v(a, "emotionalSensitivity"))} vs ${Math.round(v(b, "emotionalSensitivity"))}) — what lands hard on one barely stirs the other. Workable, but it needs translating.`
        : `You feel things at similar volumes (${Math.round(v(a, "emotionalSensitivity"))} vs ${Math.round(v(b, "emotionalSensitivity"))}), so the strain here isn't sensitivity — it's the chart contacts underneath.`),
    },
    {
      key: "communication", label: "Communication", value: communication,
      note: areaNote(communication, dirGap > 20
        ? `One of you says it straight, the other packages it (${Math.round(v(a, "communicationDirectness"))} vs ${Math.round(v(b, "communicationDirectness"))} directness) — same message, different dialects.`
        : `You talk at similar directness (${Math.round(v(a, "communicationDirectness"))} vs ${Math.round(v(b, "communicationDirectness"))}), so when talks still go sideways, blame the Mercury contacts, not the styles.`),
    },
    { key: "attraction", label: "Attraction", value: attraction, note: areaNote(attraction, `Measured from the Venus–Mars circuits plus how your desire systems compare.`) },
    {
      key: "trust", label: "Trust", value: trust,
      note: areaNote(trust, (() => {
        const ca = Math.round(v(a, "trustCaution")), cb = Math.round(v(b, "trustCaution"));
        const gap = Math.abs(ca - cb);
        if (ca > 58 || cb > 58) return "At least one of you issues trust on evidence only — it builds on proof, not promises.";
        if (gap > 20) return `One of you issues trust faster than the other (${ca} vs ${cb}) — the faster one can read the slower one's caution as rejection, so name the lag instead of resenting it.`;
        return `Both of you hold trust at a similar cautious setting (${ca} vs ${cb}) — it ramps up slowly here, and the score reflects that ramp.`;
      })()),
    },
    {
      key: "lifestyle", label: "Lifestyle & Pace", value: lifestyle,
      note: areaNote(lifestyle, (impGap > 28 || socGap > 28)
        ? "Your daily rhythms differ — one sprints, one strolls (or one hosts, one recharges)."
        : `Your daily rhythms actually line up (impulse gap ${Math.round(impGap)}, social gap ${Math.round(socGap)}) — the drag here is the chart's stability contacts, not how you live.`),
    },
    { key: "conflict", label: "Conflict Handling", value: conflict, note: areaNote(conflict, conflictNoteFor(a, b)) },
    { key: "longTerm", label: "Long-Term Potential", value: longTerm, note: areaNote(longTerm, "Weighted on commitment glue, attachment fit, and whether repair is possible after fights.") },
  ];

  const overall = Math.round(areas.reduce((acc, x) => acc + x.value, 0) / areas.length);

  // ---- strongest / hardest cross aspects ----
  const MAJOR = new Set(["conjunction", "opposition", "trine", "square", "sextile"]);
  const strongest = [...aspectList]
    .filter((x) => (x.polarity === "harmonious" || x.polarity === "supportive") && MAJOR.has(x.aspect.toLowerCase()))
    .sort((x, y) => y.strength - x.strength)
    .slice(0, 3)
    .map((x) => ({
      label: `${prettyPlanet(x.a_point)} trine/sextile ${prettyPlanet(x.b_point)}`.replace("trine/sextile", x.aspect.toLowerCase()),
      body: aspectStory(x.a_point, x.b_point, true, rng, x.aspect),
    }));
  const hardest = [...aspectList]
    .filter((x) => (x.polarity === "tense" || x.polarity === "challenging") && MAJOR.has(x.aspect.toLowerCase()))
    .sort((x, y) => y.strength - x.strength)
    .slice(0, 3)
    .map((x) => ({
      label: `${prettyPlanet(x.a_point)} ${x.aspect.toLowerCase()} ${prettyPlanet(x.b_point)}`,
      body: aspectStory(x.a_point, x.b_point, false, rng, x.aspect),
    }));

  const headline = compatHeadline(areas, a, b, rng);
  // Chart-specific citations so tier-shared paragraph bodies still end with
  // THIS pair's real astrology — two different pairs never read identical.
  const strongestIn = (points: string[]): string => {
    const pool = aspectList.filter((x) => {
      const [p1, p2] = [x.a_point, x.b_point];
      return points.some((pt) => p1 === pt || p2 === pt) && (x.polarity === "harmonious" || x.polarity === "tense" || x.polarity === "supportive" || x.polarity === "challenging");
    }).sort((x, y) => y.strength - x.strength);
    const pick = pool[0];
    return pick ? `${prettyPlanet(pick.a_point)} ${pick.aspect.toLowerCase()} ${prettyPlanet(pick.b_point)}` : "";
  };
  const chemCite = strongestIn(["venus", "mars"]) || strongestIn(["sun", "moon", "asc"]);
  const commCite = strongestIn(["mercury"]) || chemCite;
  const sections = buildSections(a, b, areas, domains, rng, genderA, genderB, { chemCite, commCite });
  const frictionPoint = biggestFriction(a, b, hardest, rng);
  const toxicityRisk = toxicity(a, b, conflict, attraction, rng);
  const eachNeeds = eachNeedsToUnderstand(a, b, genderA, genderB);

  return { areas, overall, headline, sections, frictionPoint, toxicityRisk, eachNeeds, strongest, hardest };
}

// ---------------------------------------------------------------------------

function areaNote(value: number, context: string): string {
  const tier = value >= 75 ? "genuinely strong" : value >= 60 ? "solid" : value >= 45 ? "mixed" : value >= 30 ? "strained" : "difficult";
  return `${tier.charAt(0).toUpperCase() + tier.slice(1)}. ${context}`;
}

function conflictCompatibility(a: PersonalityProfile, b: PersonalityProfile): number {
  const ka = a.styles.conflict.kind;
  const kb = b.styles.conflict.kind;
  const base = (ka: string, kb: string): number => {
    if (ka === kb) {
      if (ka === "confrontational") return 38; // two cannons
      if (ka === "avoidant") return 45; // peaceful surface, buried issues
      if (ka === "diplomatic") return 72; // both smooth
      return 42; // two pressure cookers
    }
    if ((ka === "diplomatic" && kb === "avoidant") || (kb === "diplomatic" && ka === "avoidant")) return 58;
    if ((ka === "confrontational" && kb === "avoidant") || (kb === "confrontational" && ka === "avoidant")) return 40; // chase & flee
    if ((ka === "confrontational" && kb === "diplomatic") || (kb === "confrontational" && ka === "diplomatic")) return 60;
    if ((ka === "explosive-controlled" && kb === "avoidant") || (kb === "explosive-controlled" && ka === "avoidant")) return 45;
    if ((ka === "explosive-controlled" && (kb === "confrontational" || kb === "diplomatic")) || ((ka === "confrontational" || ka === "diplomatic") && kb === "explosive-controlled")) return 50;
    return 55;
  };
  const patience = (v(a, "patience") + v(b, "patience")) / 2;
  const repair = (v(a, "resilience") + v(b, "resilience")) / 2;
  return clamp(base(ka, kb) + (patience - 50) * 0.25 + (repair - 50) * 0.2, 0, 100);
}

function conflictNoteFor(a: PersonalityProfile, b: PersonalityProfile): string {
  const ka = a.styles.conflict.kind;
  const kb = b.styles.conflict.kind;
  const label: Record<string, string> = {
    confrontational: "meets conflict head-on",
    diplomatic: "smooths and mediates",
    avoidant: "withdraws to de-escalate",
    "explosive-controlled": "holds it in, then erupts",
  };
  if (ka === kb) {
    const base: Record<string, string> = {
      confrontational: "meet conflict head-on",
      diplomatic: "smooth and mediate instead of fighting",
      avoidant: "withdraw to de-escalate",
      "explosive-controlled": "hold it in until the limit, then erupt",
    };
    return `Under conflict, you both ${base[ka]} — the score measures how badly that mirrored style grinds (same weapon, double edge).`;
  }
  return `Under conflict, one of you ${label[ka]} while the other ${label[kb]} — the score measures how badly those two styles grind.`;
}

function attachmentFit(a: PersonalityProfile, b: PersonalityProfile): number {
  const ka = a.styles.attachment.kind;
  const kb = b.styles.attachment.kind;
  if (ka === "secure-leaning" || kb === "secure-leaning") return 74;
  const sameWound = ka === kb ? 58 : 66; // two avoidants = peaceful but distant; two anxious = intense volatility
  if (ka === "avoidant-leaning" && kb === "anxious-leaning") return 38;
  if (kb === "avoidant-leaning" && ka === "anxious-leaning") return 38;
  if ((ka === "ambivalent" || kb === "ambivalent") && (ka !== kb)) return 50;
  return sameWound;
}

function compatHeadline(areas: CompatArea[], a: PersonalityProfile, b: PersonalityProfile, rng: Rng): CompatAnalysis["headline"] {
  const attraction = areas.find((x) => x.key === "attraction")!.value;
  const conflict = areas.find((x) => x.key === "conflict")!.value;
  const emotional = areas.find((x) => x.key === "emotional")!.value;

  if (attraction >= 75 && conflict <= 45)
    return { emoji: "🌋", label: "Beautiful Disaster Potential", why: "The pull is real and so is the friction — this pairing runs hot enough to be unforgettable and hot enough to burn. Whether it's fireworks or a fire depends entirely on how the fights get handled." };
  if (emotional >= 70 && conflict >= 60)
    return { emoji: "🧭", label: "The Real Thing", why: "Rare combination: a genuine emotional fit plus the ability to survive disagreement. This is the pairing people mean when they say 'healthy doesn't have to mean boring.'" };
  if (attraction >= 72)
    return { emoji: "🔥", label: "Magnetic", why: "Chemistry leads this connection — the pull is immediate and real. The rest of the scores decide whether it becomes a relationship or a very memorable chapter." };
  if (emotional >= 65)
    return { emoji: "🏡", label: "The Safe Harbor", why: "This isn't lightning; it's warmth. The connection deepens with time and feels like rest — less cinematic, more durable." };
  if (conflict <= 40)
    return { emoji: "⚔️", label: "The Sparring Match", why: "These two personalities trigger each other reliably. Growth is available — but only if both people can hear feedback without treating it as an attack." };
  return { emoji: "🧩", label: "The Interesting Work", why: rng.pick([
    "Neither effortless nor disastrous — a connection with real texture that asks both people to stretch.",
    "This pairing rewards effort. The pieces don't click on their own; they lock when you build deliberately.",
  ]) };
}

// Per-planet "what this side contributes" fragments — combined into a full
// sentence per pair, so two different aspects never share a whole line.
const GIVES: Record<string, string> = {
  sun: "a clean sense of who each of you are",
  moon: "an early-warning system for moods",
  mercury: "words that actually fix things",
  venus: "warmth with a style both of you enjoy",
  mars: "momentum — plans move instead of stalling",
  jupiter: "room for both lives to get bigger",
  saturn: "structure that keeps promises alive",
  asc: "instant recognition at first sight",
  mc: "a visible direction to build toward",
  uranus: "air — the bond never fully calcifies",
  neptune: "a generous, dreamy layer",
  pluto: "depth — nothing stays surface for long",
  north_node: "a forward pull neither person could generate alone",
  chiron: "healing where it's been needed longest",
  lilith: "edge — want gets said out loud",
};

const COSTS: Record<string, string> = {
  sun: "two identities competing for the same steering wheel",
  moon: "moods that misfire at the worst times",
  mercury: "messages that arrive mangled",
  venus: "affection given in a language the other doesn't read",
  mars: "engines running at different RPMs",
  jupiter: "one person's growth reading as the other's destabilizer",
  saturn: "rules that land like criticism",
  asc: "first impressions that keep getting revised",
  mc: "ambitions quietly competing for airtime",
  uranus: "changes nobody scheduled",
  neptune: "signals too blurry to trust",
  pluto: "intensity that tips into control",
  north_node: "life directions tugging at different angles",
  chiron: "old wounds getting touched at the wrong moments",
  lilith: "want that arrives too hot",
};

function aspectStory(pa: string, pb: string, harmonious: boolean, rng: Rng, aspectName?: string): string {
  const pair = stories[[pa, pb].sort().join("|")];
  const asp = (aspectName || "").toLowerCase();
  if (pair) return pair[harmonious ? 0 : 1];
  const role = (id: string) => ({ sun: "core identity", moon: "emotional world", mercury: "mind", venus: "way of loving", mars: "drive", saturn: "discipline", jupiter: "growth edge", asc: "outer presence", pluto: "depth", neptune: "ideals", uranus: "need for freedom", north_node: "life direction", chiron: "tender spot", lilith: "wild side", mc: "public life" } as Record<string, string>)[id] ?? id;
  const givesA = GIVES[pa] ?? "a strength of its own";
  const givesB = GIVES[pb] ?? "a strength of its own";
  const costA = COSTS[pa] ?? "its own kind of friction";
  const costB = COSTS[pb] ?? "its own kind of friction";
  if (harmonious) {
    const tail = asp === "sextile"
      ? rng.pick(["It works when you choose to use it — a talent, not an autopilot.", "It's a real skill this pair has on tap, as long as you actually reach for it."])
      : rng.pick(["It runs on its own power — no maintenance required.", "It's the part of the bond that holds when other things get bumpy.", "You never had to build this part; it came with the charts."]);
    return `Your ${role(pa)} brings ${givesA}, and their ${role(pb)} brings ${givesB} — together, ${tail}`;
  }
  const tail = rng.pick([
    "The friction is in the fit, not in either person — nobody is doing it wrong.",
    "Neither of you is the problem here; the angle between the two wiring systems is.",
    "Named out loud, it loses half its charge — treated as a character flaw, it doubles.",
  ]);
  return `Your ${role(pa)} runs the risk of ${costA}, and their ${role(pb)} of ${costB} — ${tail}`;
}

// Authored stories for the most common pairs — [harmonious, tense].
const stories: Record<string, [string, string]> = {
  "venus|mars": [ "The classic attraction loop — their way of wanting recognizes your way of loving and moves toward it without being asked. Pursuing and being pursued keep switching roles, which keeps the spark alive.", "Want and affection pull in different rhythms here — one reaches when the other retreats. The tension is electrifying early and exhausting later unless you name it." ],
  "sun|moon": [ "Their core self and your emotional needs fit together with almost no translation — you naturally affirm who they are, and they instinctively know what you need to feel safe.", "Who they are and what soothes you are at cross purposes — their instinctive reactions can unsettle your sense of security, and both keep wondering why the simplest things misfire." ],
  "moon|moon": [ "Your emotional languages are siblings — similar instincts about closeness, similar rhythms of retreat and return. Being home together feels like permission.", "Your emotional operating systems run on different schedules — when one needs processing, the other needs distance, and both can end up feeling chronically mistimed." ],
  "mercury|mercury": [ "Conversation is the relationship's heartbeat — you think at compatible speeds and misunderstandings self-correct quickly because neither has to translate.", "Your minds process at different voltages — details vs big picture, speed vs precision — and small logistical talks can turn into translations gone wrong." ],
  "venus|venus": [ "You value the same textures — similar ideas of beauty, affection, and what a good Tuesday looks like. Taste-level agreement is an underrated form of peace.", "Your aesthetic and affection languages differ enough that gestures can miss — one gives what the other doesn't read, and both keep score of the misses." ],
  "mars|mars": [ "Your drives sync — you want at similar tempos, compete on the same side, and burn energy together rather than at each other.", "Your engines run at different RPMs — when one is pushing, the other is pacing, and the mismatch converts to irritation in traffic, plans, and the gym." ],
  "sun|sun": [ "Your identities are built from compatible material — you recognize each other's core moves and neither has to shrink.", "Two similar cores in one ring — you want the same spotlight, the same veto, the same last word. Identity collision, not incompatibility." ],
  "moon|saturn": [ "Their steadiness gives your emotions a floor — you calm down around them because they don't add weather to yours.", "Their reserve can read as judgment to your emotional system — you reach, they contain, and the gap feels like rejection even when it's discipline." ],
  "venus|saturn": [ "This is commitment glue — the love here gets more serious and more loyal with time, not less.", "Affection meets audit — one wants warmth, the other applies standards, and early romance can feel like a performance review." ],
  "moon|pluto": [ "Emotional bonding goes to the bottom of the pool — this is the connection where neither of you can stay superficial, and it changes both people.", "Emotions escalate — small hurts become obsessions, reassurance gets consumed faster than it can be produced, and jealousy enters through the basement." ],
  "sun|asc": [ "Their presence makes your identity feel more visible — you like who you are in their light, and the first impression between you was instant recognition.", "Their outward style clashes with how you see yourself — early impressions carried static, and each of you had to revise a first read." ],
  "sun|saturn": [ "They give your ambitions structure — the relationship adds discipline to both lives, and each becomes more real because of the other.", "Authority friction — one becomes the evaluator, the other always feels graded, and resentment can harden into distance." ],
};

// ---------------------------------------------------------------------------
// Written analysis
// ---------------------------------------------------------------------------

function buildSections(
  a: PersonalityProfile, b: PersonalityProfile, areas: CompatArea[],
  domains: SynastryDomains, rng: Rng,
  genderA?: "male" | "female" | null, genderB?: "male" | "female" | null,
  cites?: { chemCite: string; commCite: string }
): CompatAnalysis["sections"] {
  void domains; void genderA; void genderB;
  const chemCite = cites?.chemCite ?? "";
  const commCite = cites?.commCite ?? "";
  const sections: CompatAnalysis["sections"] = [];

  // ---- Why You Connect: lead + one bullet per real dynamic + chart cite ----
  const connectParts = coreStoryParts(a, b);
  sections.push({
    id: "connect",
    title: "Why You Connect",
    body: rng.pick([
      "This connection exists because the two charts answer each other's strongest needs. It comes down to this:",
      "Underneath the surface details, the bond rests on something solid. It comes down to this:",
    ]),
    bullets: [
      ...connectParts,
      `Backed by the charts: ${citeBoth(a, b, ["sun"])} cores, ${citeBoth(a, b, ["moon"])} emotional wiring.`,
    ],
  });

  // ---- Where You Understand Each Other: one detailed bullet per shared trait ----
  const understand: string[] = [];
  const sensA = Math.round(v(a, "emotionalSensitivity")), sensB = Math.round(v(b, "emotionalSensitivity"));
  if (Math.abs(sensA - sensB) < 15) understand.push(`You register slights and warmth at similar volumes (${sensA} vs ${sensB}) — when something lands, you both know it landed, and nobody has to explain why.`);
  if (v(a, "independence") > 60 && v(b, "independence") > 60) understand.push(`You both protect autonomy instinctively — no one has to apologize for needing the evening, and nobody reads the closed door as rejection.`);
  if (v(a, "attachmentNeed") > 60 && v(b, "attachmentNeed") > 60) understand.push(`You both need frequent reassurance, and generously provide it — the demand is mutual, so it never turns into one person begging and the other conceding.`);
  if (v(a, "playfulness") > 58 && v(b, "playfulness") > 58) understand.push(`The private humor system came online early and never shut off — half the relationship lives in jokes nobody else would get.`);
  if (v(a, "ambition") > 60 && v(b, "ambition") > 60) understand.push(`You respect each other's drive instead of resenting the hours it takes — two builders recognize the cost of building.`);
  if (understand.length) {
    sections.push({
      id: "understand",
      title: "Where You Understand Each Other",
      body: "Silently, without negotiation — this is the part of the relationship that requires no maintenance. It just works:",
      bullets: understand.map(cap),
    });
  }

  // ---- Chemistry: lead + what it feels like + each person's wiring + the contact ----
  const chem = areas.find((x) => x.key === "attraction")!;
  const chemTier = chem.value >= 65
    ? "Built-in — real Venus-Mars recognition, not learned politeness."
    : chem.value >= 45
      ? "Real but selective — it shows up in certain moods and contexts, and grows with emotional safety."
      : "Quiet by chart design — this bond runs on companionship and warmth more than voltage.";
  const chemBullets = [
    `What it feels like: ${chemTier}`,
    `Your side: ${citePlacement(a, ["venus", "mars"])} sets how you want and attract.`,
    `Their side: ${citePlacement(b, ["venus", "mars"])} sets how they want and attract.`,
  ];
  if (chemCite) chemBullets.push(`The contact underneath it in your charts: ${chemCite}.`);
  sections.push({ id: "chemistry", title: "Where the Chemistry Comes From", bullets: chemBullets });

  // ---- Communication: lead + the numbers + the rule + the contact ----
  const comm = areas.find((x) => x.key === "communication")!;
  const dirA = Math.round(v(a, "communicationDirectness")), dirB = Math.round(v(b, "communicationDirectness"));
  const commTier = comm.value >= 65
    ? "Talks self-correct — misunderstandings get caught early and neither of you has to perform understanding."
    : comm.value >= 45
      ? "Works until it doesn't — hard topics arrive in different dialects, and the fix is agreeing on which dialect to use for the heavy stuff."
      : "Needs agreed rules — decide how you'll fight, slow down on hard topics, and confirm out loud what each of you actually heard. Assumption is the enemy here.";
  const commBullets = [
    `What it feels like: ${commTier}`,
    `The gap in numbers: directness ${dirA} vs ${dirB} — ${Math.abs(dirA - dirB) > 20 ? "one says it plain, the other wraps it up, so the same message arrives wearing different clothes." : "close enough that the style isn't the problem."}`,
  ];
  if (commCite) commBullets.push(`Your charts meet on this through ${commCite}.`);
  sections.push({ id: "comm", title: "Communication", bullets: commBullets });

  // ---- Where You Clash: honest area bullets (notes now match their numbers) ----
  const clashAreas = areas.filter((x) => x.value < 55);
  if (clashAreas.length) {
    sections.push({
      id: "clash",
      title: "Where You Clash",
      body: "None of these are dealbreakers by themselves — they're recurring costs that need to feel worth paying. They get worse when treated as character flaws instead of design differences:",
      bullets: clashAreas.map((x) => `${x.label} (${x.value}%): ${x.note}`),
    });
  }

  // ---- What Makes This Relationship Work: detailed bullets + cites ----
  const work: string[] = [];
  const trust = areas.find((x) => x.key === "trust")!;
  const emo = areas.find((x) => x.key === "emotional")!;
  if (trust.value >= 60) work.push(`Trust builds cleanly here (${trust.value}%) — neither of you needs surveillance to relax, which saves an enormous amount of energy.`);
  if (emo.value >= 60) work.push(`Emotional repair actually works (${emo.value}%) — after fights, you reconnect rather than just resume.`);
  if (v(a, "nurturance") > 55 || v(b, "nurturance") > 55) work.push(`At least one of you is a natural caretaker (${v(a, "nurturance") > v(b, "nurturance") ? citePlacement(a, ["moon", "venus"]) : citePlacement(b, ["moon", "venus"])} does most of the feeding), which keeps daily life warm.`);
  if (v(a, "intensityDepth") > 58 || v(b, "intensityDepth") > 58) work.push(`Loyalty runs deep on at least one side (${v(a, "intensityDepth") > v(b, "intensityDepth") ? citePlacement(a, ["pluto", "moon"]) : citePlacement(b, ["pluto", "moon"])}) — this person does not keep half a foot out the door.`);
  if (work.length) {
    sections.push({
      id: "works",
      title: "What Makes This Relationship Work",
      body: "Lean on these — they're the load-bearing walls:",
      bullets: work.map(cap),
    });
  }

  return sections;
}

// All the real "why you connect" dynamics that fire for this pair — each one
// becomes its own bullet, so the section shows every engine, not just the first.
function coreStoryParts(a: PersonalityProfile, b: PersonalityProfile): string[] {
  const parts: string[] = [];
  if (v(a, "independence") > 60 && v(b, "attachmentNeed") > 60) parts.push("One person's free spirit meets the other's loyal gravity — each provides exactly what the other's history made them hungry for.");
  else if (v(b, "independence") > 60 && v(a, "attachmentNeed") > 60) parts.push("Your loyal gravity meets their free spirit — the attraction of opposites who each hold a piece of the other's missing language.");
  if (v(a, "emotionalSensitivity") > 60 && v(b, "emotionalControl") > 55) parts.push("Their containment gives your sensitivity a calm surface to land on — storms get caught before they form.");
  if (v(b, "emotionalSensitivity") > 60 && v(a, "emotionalControl") > 55) parts.push("Your steadiness gives their sensitivity a place to rest — they can feel big things without bracing for impact.");
  if (v(a, "playfulness") > 58 && v(b, "intensityDepth") > 58) parts.push("Your lightness thaws their intensity, and their depth keeps your humor from staying shallow — each one upgrades the other.");
  if (v(a, "ambition") > 58 && v(b, "ambition") > 58) parts.push("Two builders recognized each other — mutual respect is baked in from the start, and neither has to fake admiration.");
  if (!parts.length) parts.push("The charts share rhythm where it counts — pace, loyalty, and how seriously to take each other. That's the exchange rate: each of you holds something the other's chart over-values.");
  return parts;
}

function biggestFriction(a: PersonalityProfile, b: PersonalityProfile, hardest: CompatAnalysis["hardest"], rng: Rng): CompatAnalysis["frictionPoint"] {
  const ka = a.styles.conflict.kind;
  const kb = b.styles.conflict.kind;
  void rng;

  if ((ka === "confrontational" && kb === "avoidant") || (kb === "confrontational" && ka === "avoidant")) {
    return {
      title: "The Chase-and-Retreat Cycle",
      body: "When conflict starts, one of you advances (loudly, immediately) and the other exits (quietly, immediately). Each response makes the other stronger: pursuit reads as attack, retreat reads as abandonment. Without a shared plan — the pursuer learns to approach slower, the withdrawer learns to promise a return time — this loop becomes the relationship's defining story.",
    };
  }
  if (ka === "explosive-controlled" && kb === "explosive-controlled") {
    return {
      title: "Twin Pressure Cookers",
      body: "Both of you bank grievances quietly, stay functional, and detonate at the limit. The danger: your explosions start syncing up, and arguments that started as dishwashers become trials about the whole relationship. The fix is boring and effective: raise issues at 20% pressure, not 95%.",
    };
  }
  if (hardest.length) {
    return {
      title: hardest[0].label.replace(/\b\w/g, (c) => c.toUpperCase()),
      body: hardest[0].body + " This is the single most recurring friction generator in the synastry — naming it out loud removes about half its power.",
    };
  }
  return {
    title: "The Slow Accumulation",
    body: "No single explosive fault line — the risk here is quieter: small unspoken irritations banking up in the absence of regular honest check-ins. Preventable with maintenance; corrosive without it.",
  };
}

function toxicity(a: PersonalityProfile, b: PersonalityProfile, conflict: number, attraction: number, rng: Rng): string {
  const jel = v(a, "jealousyRisk") > 62 || v(b, "jealousyRisk") > 62;
  const ctrl = v(a, "needForControl") > 62 || v(b, "needForControl") > 62;
  const avoid = a.styles.attachment.kind === "avoidant-leaning" && b.styles.attachment.kind === "anxious-leaning";

  const risks: string[] = [];
  if (avoid) risks.push("an anxious–avoidant loop: one chases closeness, the other retreats from pressure, each confirming the other's worst fear");
  if (jel) risks.push("jealousy converting love into surveillance — checking, comparing, testing until trust can't breathe");
  if (ctrl) risks.push("control creep — logistics, plans, and eventually opinions migrating to one person by default");
  if (conflict <= 42 && attraction >= 65) risks.push("passion masking trouble: intense reunions after explosive fights start to feel like proof of love instead of a failure to fix things");
  if (!risks.length) {
    return rng.pick([
      "Nothing in this synastry patterns toward toxicity in the classic sense. The realistic risk is emotional drift — comfort quietly replacing curiosity. Schedule novelty like it's maintenance, because it is.",
      "The healthy-course warning is mild: don't let how easy this is become how unexamined it is. Easy needs check-ins too.",
    ]);
  }
  return `The toxic-risk pathway in this pairing is specific: ${joinAnd(risks)}. None of it is inevitable — each one is preventable by doing the exact opposite of the instinct in the moment it activates.`;
}

function eachNeedsToUnderstand(a: PersonalityProfile, b: PersonalityProfile, genderA?: "male" | "female" | null, genderB?: "male" | "female" | null): CompatAnalysis["eachNeeds"] {
  void genderA; void genderB;
  // Each bullet = the trait + what it actually means + what to do about it.
  // Card A = what Person A needs to understand about Person B (and vice versa).
  const needFor = (p: PersonalityProfile, other: PersonalityProfile): string[] => {
    const bits: string[] = [];
    if (isHigh(other, "independence", 60)) bits.push("Their need for space is not rejection — it's how they reset. Hand the evening back without asking why, and the distance stops growing.");
    if (isHigh(other, "attachmentNeed", 60)) bits.push("Their reassurance need is not weakness — it runs on a schedule, not on crises. Feed it regularly (a text, a check-in) and it stops being urgent.");
    if (isHigh(other, "emotionalSensitivity", 60)) bits.push("Tone carries more weight than content for them — the same sentence lands differently depending on delivery. Lead soft, then say the hard part.");
    if (isHigh(other, "needForControl", 60)) bits.push("Being included before decisions is how they read respect — being told after feels like being managed. Consult early, even when the call feels small.");
    if (isHigh(other, "overthinking", 60)) bits.push("When they bring a theory about your behavior, the theory isn't the point — the fear underneath it is. Answer the fear and the theory dissolves on its own.");
    if (isHigh(other, "communicationDirectness", 62) && !isHigh(p, "communicationDirectness", 55)) bits.push("Their bluntness is efficiency, not attack — they skip the packaging when they trust you. Respond to the content, not the voltage.");
    if (isHigh(other, "jealousyRisk", 60)) bits.push("Their jealousy is fear wearing armor, not suspicion of you. Reassurance given early costs nothing and buys everything.");
    if (isLow(other, "patience", 35) && !isLow(p, "patience", 35)) bits.push("Their impatience is pace, not disrespect — they're not rushing you, they're wired to move. Name when you genuinely need more time.");
    if (!bits.length) bits.push("They are exactly as steady as they appear — what you see is the whole depth. There's no hidden layer to manage here; take them at face value.");
    return bits.map(cap);
  };
  return {
    a: needFor(b, a),
    b: needFor(a, b),
  };
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
