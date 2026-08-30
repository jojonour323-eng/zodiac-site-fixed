// ===========================================================================
// SYNASTRY READING ENGINE — per-aspect, fresh per pair
// ---------------------------------------------------------------------------
// GLOBAL RULE (user): every sentence must be generated fresh from the real
// chart data of THIS pair — planets, signs, aspect. No saved paragraph is
// reused across two different aspect cards. All section bullets embed the
// pair's actual planets (and signs when known), so two different contacts
// can never render the same line. Where a fragment registry is used, the
// full sentence is composed from BOTH planets' fragments + the aspect type,
// which differs per pair.
// ===========================================================================

import type { SignId } from "./types";
import { SIGN_META } from "./signs";
import { signBehaviorVerb } from "./readingHelpers";
import type { ExplanationSection } from "./deepReading";

export interface SynastryAspectReading {
  headline: string;
  summary: string;
  sections: ExplanationSection[];
  placementTags: { icon: string; label: string }[];
}

// Deterministic variant picker — same pair always gets the same variant,
// different pairs scatter across variants.
function pick(seed: string, arr: string[]): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// What each aspect TYPE does, as a fragment composed with the pair's roles
// so the sentence is unique per pair.
function aspectTypeClause(aspectName: string, roleA: string, roleB: string): string {
  const a = aspectName?.toLowerCase();
  switch (a) {
    case "conjunction":
      return `a conjunction means your ${roleA} and their ${roleB} occupy the same channel — they blend, fuel each other, and amplify whatever passes through`;
    case "trine":
      return `a trine means your ${roleA} and their ${roleB} feed each other without effort — no translation needed`;
    case "sextile":
      return `a sextile means your ${roleA} and their ${roleB} cooperate when you reach for it — a talent on tap, not an autopilot`;
    case "square":
      return `a square means your ${roleA} and their ${roleB} want different things at the same moment — uncomfortable, and where the most growth lives`;
    case "opposition":
      return `an opposition means your ${roleA} and their ${roleB} pull from opposite ends — the work is honoring both instead of picking one`;
    default:
      return `this angle shapes how your ${roleA} and their ${roleB} work together — a minor-key contact, felt in small moments more than big ones`;
  }
}

// What each planet PAIR means — fresh per pair.
function planetPairMeaning(aPoint: string, bPoint: string): string {
  const a = aPoint.toLowerCase();
  const b = bPoint.toLowerCase();
  const pair = [a, b].sort().join("-");

  const meanings: Record<string, string> = {
    "moon-sun": `your core identity and their emotional needs are wired into each other — who you are at your center affects how they feel, and what they need emotionally shapes how you show up`,
    "sun-sun": `your core identities interact directly — this is about whether your fundamental selves click or clash, whether you run on the same fuel`,
    "moon-moon": `your emotional worlds interact — this decides whether private, un-performed time together feels like home or like work`,
    "mercury-mercury": `your communication styles interact — this shapes how you talk, argue, and whether misunderstandings self-correct or stack up`,
    "mercury-sun": `how one of you thinks meets how the other is at their core — this decides whether your words land or miss`,
    "mercury-moon": `how one of you speaks meets how the other feels — this decides whether hard talks end with "I felt heard" or "you made it worse"`,
    "mars-mars": `your drives and energy levels interact — this decides whether you move at the same pace or convert the mismatch into irritation`,
    "mars-sun": `one person's drive meets the other's identity — this decides whether the push feels like support or pressure`,
    "mars-moon": `one person's drive meets the other's emotions — passionate when handled well, volatile when handled carelessly`,
    "mars-venus": `the classic attraction circuit — your pursuit and their magnetism (or the reverse) set the rhythm of the spark`,
    "venus-venus": `your love languages and values interact — this decides whether gestures arrive in a language the other actually reads`,
    "venus-sun": `one person's love nature meets the other's identity — this decides whether being loved feels like being seen or being managed`,
    "venus-moon": `one person's love style meets the other's emotional needs — this decides whether affection lands or misses`,
    "venus-mercury": `one person's love language meets the other's words — sweet talk, written love, and whether "I love you" arrives in the right dialect`,
    "jupiter-sun": `one person's growth drive meets the other's identity — this decides whether the relationship makes each of you bigger or smaller`,
    "jupiter-moon": `one person's growth meets the other's feelings — support for expansion, or growth that feels like destabilization`,
    "saturn-sun": `one person's structure meets the other's identity — commitment glue, or a cage, depending on how the rules get applied`,
    "saturn-moon": `one person's steadiness meets the other's emotions — a floor under the feelings, or a lid on them`,
    "saturn-venus": `one person's commitment style meets the other's love nature — loyalty that deepens with time, or standards that read as audits`,
    "saturn-mars": `one person's limits meet the other's drive — brakes and accelerator negotiating for the same pedal`,
    "asc-sun": `one person's outer style meets the other's core self — first impressions were instant recognition, or a wrong first read that took time to fix`,
    "asc-moon": `one person's outer vibe meets the other's emotional world — whether the presence feels safe before a word is spoken`,
    "asc-venus": `one person's outer style meets the other's attraction wiring — the love-at-first-sight channel`,
    "asc-mars": `one person's outer style meets the other's drive — the energy between you reads as exciting or abrasive`,
    "asc-asc": `your outward personalities interact — whether you present as a team to the world or as opposites`,
    "mc-sun": `one person's public life meets the other's identity — whether ambitions align or compete for the same spotlight`,
    "chiron-sun": `one person's old wound meets the other's identity — deeply healing or deeply triggering, and sometimes both in the same week`,
    "chiron-moon": `one person's old wound meets the other's emotional world — vulnerability becomes the intimacy channel`,
    "chiron-venus": `one person's old wound meets the other's love nature — this decides whether love here feels healing or whether it reopens the injury`,
    "node-sun": `one person's life direction meets the other's identity — a fated-feeling pull, like there's a lesson assigned to this meeting`,
    "node-moon": `one person's life direction meets the other's emotional world — the relationship tugs both of you toward who you're becoming`,
    "node-venus": `one person's life direction meets the other's love nature — the love feels meant-to-be, whatever that turns out to mean`,
    "uranus-sun": `one person's need for change meets the other's identity — electric, unpredictable, never boring`,
    "uranus-moon": `one person's freedom drive meets the other's emotional rhythm — liberating or unsettling depending on the day`,
    "uranus-venus": `one person's unconventionality meets the other's love style — attraction with a short-circuit in it`,
    "uranus-mars": `one person's rebellion meets the other's drive — sudden bursts of energy and conflict, rarely dull`,
    "neptune-sun": `one person's dreams meet the other's identity — inspiring, or dissolving, depending on how grounded both stay`,
    "neptune-moon": `one person's imagination meets the other's emotions — deeply soulful some days, unreadable on others`,
    "neptune-venus": `one person's idealism meets the other's love nature — magical, with a real risk of loving a fantasy instead of a person`,
    "neptune-mars": `one person's dreams meet the other's drive — big inspiration or beautiful plans that never quite land`,
    "pluto-sun": `one person's intensity meets the other's identity — a power connection, transformative and occasionally controlling`,
    "pluto-moon": `one person's depth meets the other's emotional world — bonding at the bottom of the pool, where manipulation can also live`,
    "pluto-venus": `one person's intensity meets the other's love nature — the classic obsession chemistry: deep, passionate, consuming`,
    "pluto-mars": `one person's power drive meets the other's will — friction and attraction from the same socket`,
    "lilith-sun": `one person's wild side meets the other's identity — something untamed gets brought out in both of you`,
    "lilith-moon": `one person's hidden desires meets the other's emotional world — deep, often unconscious patterns get touched`,
    "lilith-venus": `one person's wild side meets the other's love nature — raw chemistry that doesn't follow the rules`,
    "lilith-mars": `one person's wild side meets the other's drive — pure voltage, hard to ignore`,
    "chiron-chiron": `your wounds interact — a shared ache, and healing it together is part of why you met`,
    "node-node": `your life paths interact — parallel lessons, learned side by side`,
    "lilith-lilith": `your hidden desires interact — a shared shadow space, intimate or unsettling (or both)`,
  };

  return meanings[pair] || `this contact links ${roleLabel(aPoint)} with ${roleLabel(bPoint)} — a private channel through which the two of you affect each other`;
}

function roleLabel(pointId: string): string {
  const map: Record<string, string> = {
    sun: "your core self", moon: "your emotional self", mercury: "your communication style",
    venus: "your love nature", mars: "your drive", jupiter: "your growth edge",
    saturn: "your structure", uranus: "your need for change", neptune: "your dreams",
    pluto: "your intensity", asc: "your outer presence", ascendant: "your outer presence",
    mc: "your public life", midheaven: "your public life", chiron: "your wounds and healing",
    north_node: "your life path", node: "your life path", lilith: "your wild side",
  };
  return map[pointId.toLowerCase()] || pointId;
}

function shortRole(pointId: string): string {
  return roleLabel(pointId).replace(/^your /, "");
}

// What each planet contributes when supported / costs when tense — fragments
// composed into full pair-specific sentences.
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
  north_node: "a forward pull neither could generate alone",
  chiron: "healing where it's been needed longest",
  lilith: "edge — want gets said out loud",
};

const FIGHTS: Record<string, string> = {
  sun: "lets pride run the show — respect before the issue",
  moon: "floods first, and logic comes back online later",
  mercury: "sharpens the words fast — precise, then personal",
  venus: "goes on strike — affection disappears right when it's needed",
  mars: "spikes the temperature and pushes harder",
  jupiter: "inflates everything until the argument is about everything",
  saturn: "raises walls and swaps feelings for cold facts",
  uranus: "starts eyeing the exit door",
  neptune: "fogs the conversation until what was said becomes negotiable",
  pluto: "goes underground and turns silence into leverage",
  asc: "drops the mask and gives the room the real mood",
  mc: "inflates the stakes and drags work into it",
  north_node: "hooks the future — 'is this where this is going?'",
  chiron: "hits the old wound, and the reaction outsizes the trigger",
  lilith: "bolts — the wild side takes the wheel",
};

const USE: Record<string, string> = {
  sun: "make space for each other's individuality on purpose",
  moon: "keep the small daily check-ins alive — small beats grand here",
  mercury: "keep talking — this channel is the relationship's repair kit",
  venus: "schedule the beautiful stuff — this contact rewards ritual",
  mars: "give the energy a shared project to live in",
  jupiter: "plan the next adventure together — growth wants company",
  saturn: "make the promises explicit — this contact honors commitments",
  asc: "let each other show up unedited in public",
  mc: "say the ambitions out loud — the support here is real",
  uranus: "leave room for surprise inside the routine",
  neptune: "keep the dream grounded — check stories against reality",
  pluto: "choose trust deliberately — depth is a gift when it's safe",
  north_node: "say yes to what pulls you both forward",
  chiron: "handle the old wound gently — it heals by being touched right",
  lilith: "give the wild side a consenting outlet",
};

const NEEDS: Record<string, string> = {
  sun: "needs to feel respected before it can flex",
  moon: "needs the feeling acknowledged before any fixing starts",
  mercury: "needs the words checked twice before sending",
  venus: "needs warmth restored before the issue gets solved",
  mars: "needs an outlet that isn't the relationship",
  jupiter: "needs permission to grow without guilt",
  saturn: "needs the standard said plainly, not hinted",
  uranus: "needs breathing room granted before it takes it",
  neptune: "needs reality checks delivered kindly",
  pluto: "needs trust proven, not demanded",
  asc: "needs the first read of them to be a generous one",
  mc: "needs ambitions treated as allies, not rivals",
  north_node: "needs the future talked about, not assumed",
  chiron: "needs the old wound named once, gently, then left alone",
  lilith: "needs the want named without shame",
};

// Per-pair daily-life fallbacks for the rare case signs aren't available.
const DAILY: Record<string, string> = {
  "moon-sun": "you naturally affirm who they are, and they naturally feel at home around you — the daily version is small moments of feeling seen",
  "sun-sun": "you either feel like teammates or like you're competing for the same square meter — the daily question is whose call it is today",
  "moon-moon": "you're comfortable in the same ways — similar rhythms of closeness and space, similar idea of what 'home' feels like",
  "mercury-mercury": "you either talk the same language or talk past each other — and since daily life is mostly conversation, the quality of it decides the mood of the house",
  "mars-venus": "there's a natural push-pull between desire and affection — one reaches, the other draws in, and the spark lives in the switch",
  "venus-venus": "you show love in compatible or clashing ways — daily life becomes a running test of whether the gesture lands as intended",
  "saturn-sun": "one brings structure and the other brings identity — some days that's scaffolding, some days it's surveillance",
  "saturn-moon": "one steadies, one feels — the grounding reads as safe or as cold depending on the day",
  "asc-sun": "who they are interacts with the version of them you met first — daily life keeps comparing the two",
};

// Aspect-specific tail for the collapsed summary — same planet pair with two
// different aspects (possible on one page) still never reads identically.
function aspectSummaryTail(aspectName: string): string {
  const a = aspectName?.toLowerCase();
  switch (a) {
    case "trine": return "here as a trine, it flows without effort";
    case "sextile": return "here as a sextile, it's a talent you switch on when you want it";
    case "square": return "here as a square, it shows up as recurring friction you can grow through";
    case "opposition": return "here as an opposition, it pulls in two directions until you honor both";
    case "conjunction": return "here as a conjunction, the two blend into one channel and amplify each other";
    default: return `as a ${a || "minor angle"}, it works in the background — felt more in small moments than big ones`;
  }
}

export function generateSynastryAspectReading(
  aPoint: string,
  bPoint: string,
  aspectName: string,
  polarity: string,
  strength: number,
  aSign?: SignId,
  bSign?: SignId
): SynastryAspectReading {
  const aId = aPoint.toLowerCase();
  const bId = bPoint.toLowerCase();
  const isHarmonious = polarity === "harmonious" || polarity === "supportive";
  const isTense = polarity === "tense" || polarity === "challenging";
  const pairKey = [aId, bId].sort().join("|") + "|" + aspectName.toLowerCase() + "|" + polarity;

  const strengthWord = strength >= 0.85 ? "very strong" : strength >= 0.7 ? "strong" : "moderate";
  const kindWord = isHarmonious ? "connection" : isTense ? "friction" : "bond";

  const aLabel = planetName(aId);
  const bLabel = planetName(bId);
  const aRole = shortRole(aId);
  const bRole = shortRole(bId);

  // Headline: concrete planets (+ signs when known) — scannable and unique.
  const headline = aSign && bSign
    ? `${aLabel} in ${SIGN_META[aSign].name} × ${bLabel} in ${SIGN_META[bSign].name} — ${strengthWord} ${kindWord}`
    : `${aLabel} × ${bLabel} — ${strengthWord} ${kindWord}`;

  const summary = `${cap(planetPairMeaning(aId, bId))} — ${aspectSummaryTail(aspectName)}.`;

  const sections: ExplanationSection[] = [];
  const tags: { icon: string; label: string }[] = [];
  if (aSign) tags.push(placementTagFor(aId, aSign));
  if (bSign) tags.push(placementTagFor(bId, bSign));

  // ---- Section 1: What this connection is about ----
  const aboutBullets: string[] = [
    `The loop (${aspectName.toLowerCase()}): your ${aRole}${aSign ? ` in ${SIGN_META[aSign].name}` : ""} — ${GIVES[aId] ?? "its own strength"} — crossed with their ${bRole}${bSign ? ` in ${SIGN_META[bSign].name}` : ""} — ${GIVES[bId] ?? "its own strength"}.`,
    `Strength: ${Math.round(strength * 100)}% — ${strengthWord}.`,
  ];
  sections.push({
    heading: "What this connection is about",
    body: `${cap(aspectTypeClause(aspectName, aRole, bRole))}.`,
    bullets: aboutBullets,
  });

  // ---- Section 2: How it shows up day to day ----
  const dailyBullets: string[] = [];
  if (aSign && bSign) {
    const shortVerb = (s: SignId): string => signBehaviorVerb(s).split(" — ")[0];
    dailyBullets.push(`Day to day: your ${aLabel} in ${SIGN_META[aSign].name} — you ${shortVerb(aSign)}; their ${bLabel} in ${SIGN_META[bSign].name} — they ${shortVerb(bSign)}. That's the everyday texture of this contact.`);
    const elA = SIGN_META[aSign].element, elB = SIGN_META[bSign].element;
    const elTail = elA === elB
      ? `same element (${elA}) — you process this area in the same basic language, which makes the daily version forgiving`
      : `crossed elements (${elA} × ${elB}) — the same event reads differently to each of you, so the daily version needs a little translation`;
    dailyBullets.push(`${aLabel} × ${bLabel} in real life: ${elTail}.`);
  } else {
    const dailyKey = [aId, bId].sort().join("-");
    dailyBullets.push(
      DAILY[dailyKey] ||
      `day to day, your ${aRole} and their ${bRole} keep trading the lead in small moments — you notice it most when something lands perfectly or misses completely`
    );
    dailyBullets.push(`It shows up in ordinary scenes, not dramatic ones — plans, messages, money, moods — wherever your ${aRole} and their ${bRole} share an edge.`);
  }
  sections.push({
    heading: "How it shows up day to day",
    body: `What your ${aRole} × their ${bRole} contact looks like in real life:`,
    bullets: dailyBullets,
  });

  // ---- Section 3: During conflict ----
  const conflictBullets: string[] = [];
  if (isTense) {
    conflictBullets.push(`Under stress, your ${aRole} ${FIGHTS[aId] ?? "digs in"}, while their ${bRole} ${FIGHTS[bId] ?? "digs in"} — that's the collision pattern for this contact.`);
    conflictBullets.push(pick(pairKey, [
      `The way out is naming the pattern while it's small: "this is the ${aLabel}/${bLabel} thing" — wiring, not a character flaw.`,
      `Slow the loop at the first spark of the ${aLabel}/${bLabel} friction — the first thirty seconds decide whether it becomes a talk or a fight.`,
      `Neither of you is doing it wrong on purpose — your ${aRole} and their ${bRole} just pull at different angles here.`,
    ]));
  } else if (isHarmonious) {
    conflictBullets.push(`Even in a fight, your ${aRole} (${GIVES[aId] ?? "steady"}) and their ${bRole} (${GIVES[bId] ?? "steady"}) stay on the same side — this contact is a built-in repair channel.`);
    conflictBullets.push(pick(pairKey, [
      `When things get tense elsewhere, use this one deliberately — your ${aRole} and their ${bRole} still work while everything else is loud.`,
      `This is the contact that ends the cold war between you — whoever reaches through ${aLabel}/${bLabel} first, the other answers.`,
    ]));
  } else {
    conflictBullets.push(`In conflict this contact amplifies whatever you bring to it: your ${aRole} and their ${bRole} merge, so a fight about one thing becomes a fight about everything fast.`);
    conflictBullets.push(`Keep one topic at a time — the ${aLabel}/${bLabel} blend is powerful when it's aimed, destructive when it's diffuse.`);
  }
  sections.push({
    heading: "During conflict",
    body: `How your ${aRole} × their ${bRole} contact behaves when things get tense:`,
    bullets: conflictBullets,
  });

  // ---- Section 4: How to work with it ----
  const workBullets: string[] = [];
  if (isTense) {
    workBullets.push(`When the friction hits: your ${aRole} ${NEEDS[aId] ?? "needs patience"}, and their ${bRole} ${NEEDS[bId] ?? "needs patience"}. Meet the needs and the friction shrinks to size.`);
    workBullets.push(pick(pairKey + "|work", [
      `Don't avoid the conversations this contact produces — the ${aLabel}/${bLabel} topic ferments when avoided, and softens once it's had.`,
      `The growth here is real, but only if your ${aRole} and their ${bRole} stay curious instead of defensive.`,
      `Pause before reacting, then ask what their ${bRole} was actually trying to say — the translation usually dissolves the ${aLabel}/${bLabel} spark.`,
    ]));
  } else if (isHarmonious) {
    workBullets.push(`Use it on purpose: your ${aRole} — ${USE[aId] ?? "lean on it"}; their ${bRole} — ${USE[bId] ?? "lean on it"}.`);
    workBullets.push(pick(pairKey + "|work", [
      `Don't take your ${aRole} × their ${bRole} flow for granted just because it's easy — effortless parts need feeding too.`,
      `When other areas of the bond get bumpy, route around through ${aLabel}/${bLabel} until the weather clears.`,
    ]));
  } else {
    workBullets.push(`Aim it deliberately: your ${aRole} and their ${bRole} magnify whatever they're pointed at — point the ${aLabel}/${bLabel} blend at a shared project, not at each other.`);
    workBullets.push(`Check in about intensity once in a while: "is the ${aLabel}/${bLabel} thing still fun, or too much?" The answer keeps the blend useful.`);
  }
  sections.push({
    heading: "How to work with it",
    body: `What to actually do with your ${aRole} × their ${bRole} contact:`,
    bullets: workBullets,
  });

  return { headline, summary, sections, placementTags: tags };
}

function planetName(id: string): string {
  const map: Record<string, string> = {
    sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
    jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune",
    pluto: "Pluto", asc: "Rising", ascendant: "Rising", mc: "Midheaven",
    midheaven: "Midheaven", north_node: "North Node", node: "North Node",
    chiron: "Chiron", lilith: "Lilith",
  };
  return map[id.toLowerCase()] || id;
}

function placementTagFor(planetId: string, signId: SignId): { icon: string; label: string } {
  const icons: Record<string, string> = {
    sun: "☀️", moon: "🌙", mercury: "💬", venus: "💞", mars: "🔥", jupiter: "🌱",
    saturn: "🧭", uranus: "⚡", neptune: "💧", pluto: "💀", north_node: "🧭",
    chiron: "🩹", lilith: "🔐", asc: "🧙", ascendant: "🧙", mc: "👑", midheaven: "👑",
  };
  return { icon: icons[planetId] ?? "✨", label: `${planetName(planetId)} in ${SIGN_META[signId].name}` };
}
