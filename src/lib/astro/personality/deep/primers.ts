// ===========================================================================
// PRIMERS — "First, what X even is:" for ALL TWELVE walkthrough items.
// ---------------------------------------------------------------------------
// The beginner walkthrough rule: before any placement is interpreted, the
// reader learns WHAT THE THING IS in plain words. The five slow planets
// already had primers (copied verbatim from outerSigns1). The personal
// planets, the Rising, and the North Node get the same treatment here.
// Authored neutral-plural ("they/their") — gv() genderizes at render.
// ===========================================================================

export const SUN_PRIMER =
  "First, what the Sun even is: the Sun is the basic self — the part that stays the same from childhood on. It shows the main personality, the strengths that come naturally, and what keeps a person feeling like themselves.";

export const MOON_PRIMER =
  "First, what the Moon even is: the Moon is the feelings part of the chart. It shows what makes a person feel safe, how they react when hurt, and what they're like late at night when nobody is watching.";

export const RISING_PRIMER =
  "First, what the Rising sign even is: the Rising is the front door of the chart. It's the layer people meet first — the energy, the style, the first impression. It's not fake; it's just the outside.";

export const MERCURY_PRIMER =
  "First, what Mercury even is: Mercury is the mind. It shows how a person thinks, learns, talks, and argues.";

export const VENUS_PRIMER =
  "First, what Venus even is: Venus is the love part of the chart. It shows how a person shows love, what makes feelings start, and what makes interest fade.";

export const MARS_PRIMER =
  "First, what Mars even is: Mars is the engine. It shows what a person wants, how they go after it, and what they're like when angry.";

export const NODE_PRIMER =
  "First, what the North Node even is: the North Node is not a planet — it's a direction. It points at the part of life that feels new and uncomfortable, but grows a person the most. Think of it as the lesson this life keeps teaching.";

/** The five slow planets — same text the outer chapters already used. */
export const OUTER_PRIMER: Record<string, string> = {
  jupiter:
    "First, what Jupiter even is: Jupiter is the good-luck part of the chart. It shows where life gives extra room, where things come a bit easier, and where chances keep showing up.",
  saturn:
    "First, what Saturn even is: Saturn is the strict teacher of the chart. It shows where life feels heavy at first, where the tests keep coming — and where they end up the strongest if they keep showing up.",
  uranus:
    "First, what Uranus even is: Uranus is the wildcard. It shows where they're different from everyone around them, where they refuse to be told what to do, and where life likes to surprise them.",
  neptune:
    "First, what Neptune even is: Neptune is the dreamer of the chart. It shows where they imagine more than they see, where things can turn fuzzy or too good to be true — and where their imagination works best.",
  pluto:
    "First, what Pluto even is: Pluto is the deep-change part of the chart. It shows where they've been through the most intense experiences, where they fear losing control — and where they come back stronger than anyone expects.",
};

const PERSONAL_PRIMER: Record<string, string> = {
  sun: SUN_PRIMER,
  moon: MOON_PRIMER,
  rising: RISING_PRIMER,
  mercury: MERCURY_PRIMER,
  venus: VENUS_PRIMER,
  mars: MARS_PRIMER,
};

/** One lookup for every walkthrough item. */
export const PRIMER_FOR: Record<string, string> = {
  ...PERSONAL_PRIMER,
  ...OUTER_PRIMER,
  north_node: NODE_PRIMER,
};
