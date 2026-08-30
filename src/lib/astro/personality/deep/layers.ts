// ===========================================================================
// LAYERS — the opening "Outside vs Inside" contradiction + the closing
// three-layer synthesis. Built from the ACTUAL chart: Rising (the front),
// angular planets (front volume), Moon (the floor), Venus + 8th/12th house
// occupants (the private storage). No generic template text.
// Authored neutral plural; gv() genderizes at render. Quotes stay as-is.
// ===========================================================================

import type { ReadingSection, ReadingBlock } from "../../readingEngine";
import type { PersonalityProfile } from "../model";
import { prettyPlanet } from "../model";
import { SIGN_META } from "../../signs";
import type { Voice } from "./voice";

const para = (text: string): ReadingBlock => ({ type: "paragraph", text });
const sub = (text: string): ReadingBlock => ({ type: "subheading", label: text });
const quote = (text: string): ReadingBlock => ({ type: "quote", text });

// ── Trait tables ───────────────────────────────────────────────────────────

/** What people meet FIRST — keyed by Rising sign. */
const OUTSIDE: Record<string, { traits: string[]; want: string }> = {
  aries: {
    traits: ["direct", "quick to move", "obviously confident"],
    want: "The front wants one thing above all: to never be caught unready.",
  },
  taurus: {
    traits: ["calm", "steady", "hard to rush"],
    want: "The front wants to be the stable one in every room it enters.",
  },
  gemini: {
    traits: ["quick-witted", "talkative", "effortlessly social"],
    want: "The front wants conversation running at all times — silence feels like danger up there.",
  },
  cancer: {
    traits: ["warm", "caring", "protected by a soft shell"],
    want: "The front wants everyone fed, included, and okay — especially the people it adopted without asking.",
  },
  leo: {
    traits: ["warm", "larger than life", "built for an audience"],
    want: "The front wants to be seen doing well — visibility feels like safety from up there.",
  },
  virgo: {
    traits: ["composed", "put-together", "quietly on top of everything"],
    want: "The front wants to look like nothing is being dropped, ever.",
  },
  libra: {
    traits: ["gracious", "easy to be around", "smooth under pressure"],
    want: "The front wants the room comfortable — including at the front's own expense.",
  },
  scorpio: {
    traits: ["guarded", "intense", "clearly reading everything"],
    want: "The front wants to give away nothing while seeing everything.",
  },
  sagittarius: {
    traits: ["upbeat", "blunt", "ready for the next thing"],
    want: "The front wants to stay in motion — options open, exits visible.",
  },
  capricorn: {
    traits: ["competent", "reserved", "older than their years"],
    want: "The front wants to be the one who can handle it, whatever it turns out to be.",
  },
  aquarius: {
    traits: ["original", "detached", "interestingly different"],
    want: "The front wants to be interesting — above all, never boring.",
  },
  pisces: {
    traits: ["gentle", "dreamy", "hard to pin down"],
    want: "The front wants to keep the deeper water out of view.",
  },
};

/** What actually runs UNDERNEATH — keyed by Moon sign. */
const INSIDE: Record<string, { traits: string[]; need: string; voice: string }> = {
  aries: {
    traits: ["fast-burning feelings that demand action now", "anger that is usually hurt wearing armor"],
    need: "to have the storm met with steadiness instead of fear.",
    voice: "I feel it all the way through, right now, or not at all.",
  },
  taurus: {
    traits: ["slower and deeper feelings than the surface ever shows", "a real allergy to being rushed"],
    need: "unhurried safety — routine, comfort, and a person who stays.",
    voice: "Don't rush me. I come around when it's safe to come around.",
  },
  gemini: {
    traits: ["a mind that processes feelings by narrating them out loud", "restlessness that is usually nervousness in motion"],
    need: "an audience that stays for the whole story.",
    voice: "If I stop talking about it, that's how you know it's bad.",
  },
  cancer: {
    traits: ["tidal feelings that follow everyone else's weather", "a memory that files every kindness and every slight"],
    need: "proof of belonging, repeated until it sticks.",
    voice: "I remember everything you did when I needed you. Everything.",
  },
  leo: {
    traits: ["pride operating as armor over a genuinely soft heart", "a private hunger to be someone's good news"],
    need: "to be celebrated, not just tolerated.",
    voice: "I'd rather be too much than unnoticed.",
  },
  virgo: {
    traits: ["a running audit that never fully clocks out", "worry dressed up as preparation"],
    need: "to be useful to the people they love — and to hear it counted.",
    voice: "If I didn't care, I wouldn't have noticed. Noticing is the love.",
  },
  libra: {
    traits: ["a private discomfort with conflict that never fully leaves", "feelings tuned to the atmosphere of the room"],
    need: "harmony, and permission to stop performing it.",
    voice: "I'll keep the peace. Someone has to, and it's always been me.",
  },
  scorpio: {
    traits: ["feelings at ocean depth with surface control to match", "a trust valve that opens once and welds shut on betrayal"],
    need: "one person with full clearance — and no surprises.",
    voice: "I don't trust easily. What you're seeing is the short version of the test.",
  },
  sagittarius: {
    traits: ["a spirit that experiences confinement as physical pain", "optimism that doubles as an escape hatch"],
    need: "room to roam without the door being locked behind them.",
    voice: "I need the door open. I stay because I can leave.",
  },
  capricorn: {
    traits: ["feelings treated like unscheduled meetings", "an inner standard almost nobody else ever meets"],
    need: "to occasionally be told the load can be put down.",
    voice: "I'm fine. I'm always fine. That's the arrangement.",
  },
  aquarius: {
    traits: ["feelings routed through analysis first and felt later", "a quiet private certainty of being different"],
    need: "space that is given freely, not negotiated.",
    voice: "I'm not distant. I'm processing at a different altitude.",
  },
  pisces: {
    traits: ["porous boundaries that absorb every room they enter", "an inner life rich enough to live in"],
    need: "safe harbors — and someone who doesn't mock the ocean.",
    voice: "I feel everything in the room. That was never a choice I made.",
  },
};

/** The side few people see — keyed by Venus sign. */
const PRIVATE: Record<string, string> = {
  aries: "Under the pursuit and the boldness: someone braced for rejection, who ends things first so they can't be ended.",
  taurus: "Under the calm and the comfort: someone deeply possessive of what they love, and quietly terrified of change they didn't choose.",
  gemini: "Under the wit and the lightness: someone who has left more relationships in their head than anyone knows, and fears that being truly known would end the magic.",
  cancer: "Under the caring and the warmth: someone keeping a private ledger of every crack in the safety, waiting for the one that breaks it.",
  leo: "Under the performance: someone who rehearses the confidence and privately replays every room they didn't own.",
  virgo: "Under the competence: someone who believes love must be earned through usefulness, and fears being useless to the people they need.",
  libra: "Under the grace: someone with an entire file of unspoken opinions, afraid that full honesty is the thing that finally makes someone leave.",
  scorpio: "Under the control: someone who loves at a depth that scares them, and tests loyalty because losing it once rearranged everything.",
  sagittarius: "Under the freedom: someone who jokes about commitment because the real fear is being loved with conditions attached.",
  capricorn: "Under the competence and the reserve: someone waiting to be chosen for who they are when nothing is being achieved.",
  aquarius: "Under the detachment: someone who feels everything and has never found a frequency for saying so that doesn't sound like surrender.",
  pisces: "Under the softness: someone with an escape hatch of their own — private worlds where the unspoken hurt gets stored.",
};

// ── Shape of the contradiction ─────────────────────────────────────────────

const EL_FRONT: Record<string, string> = {
  fire: "hot and visible — it moves fast and says what it wants",
  earth: "slow and solid — it shows up as calm",
  air: "verbal and quick — it shows up as conversation",
  water: "deep and moody — it shows up as atmosphere",
};

function elementOf(signId: string): string {
  return SIGN_META[signId]?.element ?? "fire";
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ── Tension object shared by opening + closing ─────────────────────────────

export interface Tension {
  risingName: string;
  moonName: string;
  venusName: string;
  outsideTraits: string[];
  insideTraits: string[];
  /** short phrases used by the closing tie-back */
  outsideShort: string;
  insideShort: string;
  shape: string;
}

export function buildTension(p: PersonalityProfile): Tension {
  const f = p.facts;
  const risingName = SIGN_META[f.rising].name;
  const moonName = SIGN_META[f.moon].name;
  const venusName = f.venus ? SIGN_META[f.venus].name : "";
  const out = OUTSIDE[f.rising] ?? OUTSIDE.aries;
  const ins = INSIDE[f.moon] ?? INSIDE.aries;

  let outsideTraits = [...out.traits];
  let insideTraits = [...ins.traits];

  // Angular planet turns the front up; deep-house planets push the floor down.
  const angular = f.timeKnown ? f.angularPlanets[0] : undefined;
  if (angular && outsideTraits.length < 4) {
    outsideTraits = [...outsideTraits, `broadcast louder than intended (${prettyPlanet(angular.planet)} on the ${angular.angle} angle)`];
  }
  if (f.timeKnown && insideTraits.length < 4) {
    const deep = f.planets.filter((pl) => (pl.house === 8 || pl.house === 12) && ["venus", "moon", "sun", "pluto", "neptune"].includes(pl.id));
    if (deep[0]) insideTraits = [...insideTraits, `parts stored below deck (${prettyPlanet(deep[0].id)} in house ${deep[0].house})`];
  }

  const risingEl = elementOf(f.rising);
  const moonEl = elementOf(f.moon);
  const shape =
    risingEl !== moonEl
      ? `The front runs on ${risingEl} — ${EL_FRONT[risingEl]}. The floor runs on ${moonEl} — ${EL_FRONT[moonEl]}. Most misreadings of them happen when someone takes the front for the whole building.`
      : `The front and the floor share one element, so the gap is quieter than it looks: ${out.traits[0]} in company, ${ins.traits[0]} when the door closes. It still organizes everything — it just does it without an audience.`;

  return {
    risingName,
    moonName,
    venusName,
    outsideTraits,
    insideTraits,
    outsideShort: out.traits[0],
    insideShort: ins.traits[0],
    shape,
  };
}

// ── 0. OPENING — the outside and the inside ────────────────────────────────

export function buildOpeningSection(p: PersonalityProfile, voice: Voice, t: Tension): ReadingSection {
  const f = p.facts;
  const listOut = t.outsideTraits.slice(0, 3).join(", ");
  const listIn = t.insideTraits.slice(0, 3).join(", ");

  let gap = `The ${t.risingName} Rising hands people the first list; the ${t.moonName} Moon keeps the second one where almost nobody checks.`;
  if (t.venusName) gap += ` The ${t.venusName} Venus quietly decides who ever gets shown the difference.`;

  const blocks: ReadingBlock[] = [
    para(
      voice.t(
        `Read this person in two layers before anything else. Outside: ${listOut}. Inside: ${listIn}.`
      ) + " " +
      voice.t(gap) + " " +
      voice.t(t.shape) + " " +
      `Neither layer is the performance and neither is the truth alone — the gap between the two is where the actual person lives.`
    ),
  ];

  return { id: "opening", title: "The Outside and the Inside", blocks };
}

// ── FINAL. The person, in three layers ─────────────────────────────────────

export function buildLayersSection(p: PersonalityProfile, voice: Voice, t: Tension): ReadingSection {
  const f = p.facts;
  const s = voice.s;
  const out = OUTSIDE[f.rising] ?? OUTSIDE.aries;
  const ins = INSIDE[f.moon] ?? INSIDE.aries;
  const privateLine = t.venusName ? (PRIVATE[t.venusName.toLowerCase()] ?? PRIVATE.aries) : PRIVATE.aries;

  const angular = f.timeKnown ? f.angularPlanets[0] : undefined;
  const deep = f.timeKnown
    ? f.planets.filter((pl) => (pl.house === 8 || pl.house === 12) && ["venus", "moon", "sun", "pluto", "neptune"].includes(pl.id))
    : [];

  // element essence — absorbed from the old bottom line
  const elCopy: Record<string, string> = {
    fire: `Strip the biography down and something combustible remains: ${s} ${s === "they" ? "move" : "moves"} toward aliveness and away from maintenance.`,
    earth: `Strip the biography down and something load-bearing remains: ${s} ${s === "they" ? "trust" : "trusts"} what ${s} can touch, verify, and repeat.`,
    air: `Strip the biography down and something conceptual remains: ${s} ${s === "they" ? "live" : "lives"} inside questions, framings, and the next interesting angle.`,
    water: `Strip the biography down and something tidal remains: feeling ${voice.p} way through decisions logic merely ratifies afterward.`,
  };

  const blocks: ReadingBlock[] = [];

  blocks.push(para(voice.t(elCopy[f.dominantElement])));

  // Layer 1 — outer
  blocks.push(sub("The outer layer — what the world meets"));
  blocks.push(
    para(
      voice.t(
        `The ${t.risingName} Rising runs the front: ${out.traits.join(", ")}. ${out.want}` +
        (angular ? ` ${prettyPlanet(angular.planet)} on the angle makes the entrance louder than ${s} plan.` : "")
      )
    )
  );

  // Layer 2 — emotional
  blocks.push(sub("The emotional layer — what it runs on"));
  blocks.push(
    para(
      voice.t(
        `The ${t.moonName} Moon runs the interior: ${ins.traits.join(", ")}. What that layer needs: ${ins.need}` +
        ` ${capitalizeFirst(voice.p)} attachment pattern reads as ${p.styles.attachment.kind.replace(/-leaning$/, "")}: ${firstSentence(p.styles.attachment.note)}`
      )
    )
  );
  blocks.push(quote(`“${ins.voice}”`));

  // Layer 3 — private
  blocks.push(sub("The private layer — what almost nobody is shown"));
  blocks.push(
    para(
      voice.t(
        (t.venusName ? `The ${t.venusName} Venus runs this one. ` : "") +
        privateLine +
        (deep.length
          ? ` With ${deep.map((d) => (d.id === "sun" || d.id === "moon" ? "the " : "") + prettyPlanet(d.id)).join(" and ")} living in house${deep.length > 1 ? "s" : ""} ${[...new Set(deep.map((d) => d.house))].join(" and ")}, more of the real story stays below deck than most people are ever shown.`
          : "")
      )
    )
  );

  // Tie-back — the opening contradiction, resolved
  blocks.push(
    para(
      voice.t(
        `The gap this reading opened with — ${t.outsideShort} on the street, ${t.insideShort} behind the door — was never a contradiction to fix. It is the design: the front handles the world, and the floor holds the person. People who only ever meet the front will describe someone else entirely.`
      )
    )
  );

  return { id: "layers", title: "The Person, in Three Layers", blocks };
}

// ── helpers ────────────────────────────────────────────────────────────────

function firstSentence(text: string): string {
  const idx = text.indexOf(". ");
  const out = idx > 0 ? text.slice(0, idx + 1) : text;
  return /[.!?]$/.test(out.trim()) ? out : `${out.trim()}.`;
}

function capitalizeFirst(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
