// ===========================================================================
// FULL READING V2 — numbered placement chapters + integrated whole-chart
// analysis, modeled on a real psychological report (user's 18-section spec).
// ---------------------------------------------------------------------------
// Structure:
//   1..6  Sun / Moon / Rising / Mercury / Venus / Mars chapters
//         (sign psychology + house overlay + monologue quote + Q&A subheads)
//   ..N   Top scored aspects as themed chapters ("Mercury square Pluto — ...")
//   N+1   North Node lesson (if data available)
//   then  The repeating pattern · The big contradiction · The bottom line
//
// Every sentence derives from actual chart data: real sign/house/aspect/
// degree/retrograde. Authored copy is neutral-plural; gv() genderizes.
// ===========================================================================

import type { ReadingSection, ReadingBlock } from "../../readingEngine";
import type { PersonalityProfile } from "../model";
import { prettyPlanet } from "../model";
import type { DimensionScore } from "../core";
import { makeRng } from "../core";
import { v as dim } from "../prose";
import { SIGNS_1 } from "./signContent1";
import { SIGNS_2 } from "./signContent2";
import { SIGNS_3 } from "./signContent3";
import { SIGN_META, SIGN_EMOJI } from "../../signs";
import { houseLine, houseAreaName } from "./houseLines";
import { buildAspectChapter, pickAspectChapters } from "./aspectChapters";
import { buildNodeChapter } from "./nodes";
import { makeVoice, type Gender, type Voice } from "./voice";
import { buildTension, buildOpeningSection, buildLayersSection } from "./layers";
import { buildPlaybookSection } from "./playbook";
import { SAY_LINES } from "./sayLines";
import { JUPITER_SIGNS, SATURN_SIGNS, type OuterSignMap } from "./outerSigns1";
import { URANUS_SIGNS, NEPTUNE_SIGNS, PLUTO_SIGNS } from "./outerSigns2";
import { outerHouseLine, HOUSE_PLAIN, HOUSE_PLANET_ORDER } from "./outerHouses";
import { PRIMER_FOR } from "./primers";
import { buildTraitLines } from "../traitLines";
import { selectArchetype } from "../archetype";
import { buildConclusionSection } from "./conclusion";

const ALL_SIGNS = { ...SIGNS_1, ...SIGNS_2, ...SIGNS_3 };

/**
 * Two-beat lead-ins: first the SIGN speaks, then the HOUSE adds what it
 * changes. One distinct connector per planet so no two chapters read alike.
 */
const HOUSE_BEATS: Record<string, string> = {
  sun: "That's the sign on its own. The house adds a second, separate layer — where all of this actually plays out:",
  moon: "That's the sign-level emotion. The house says where the feeling actually lives:",
  mercury: "That's the mind the sign builds. The house shows what the mind gets spent on:",
  venus: "That's the love style the sign supplies. The house moves it onto real ground:",
  mars: "That's the drive the sign hands over. The house picks the target:",
  jupiter: "That's the luck the sign gives. The house shows where in life it tends to land:",
  saturn: "That's the weight the sign carries. The house shows where life applies it:",
  uranus: "That's where the difference shows. The house says which part of life it shakes up:",
  neptune: "That's the dream the sign paints. The house shows where it plays out:",
  pluto: "That's the depth the sign brings. The house shows where it does its work:",
};

/** The five slow planets, in the order the walkthrough teaches them. */
const OUTER_PLANETS = ["jupiter", "saturn", "uranus", "neptune", "pluto"] as const;
const OUTER_SIGNS_MAP: Record<string, OuterSignMap> = {
  jupiter: JUPITER_SIGNS,
  saturn: SATURN_SIGNS,
  uranus: URANUS_SIGNS,
  neptune: NEPTUNE_SIGNS,
  pluto: PLUTO_SIGNS,
};
/** Walkthrough position: Jupiter is chapter 7 … Pluto is chapter 11. */
const OUTER_CHAPTER_NUM: Record<string, number> = { jupiter: 7, saturn: 8, uranus: 9, neptune: 10, pluto: 11 };
const OUTER_CHAPTER_TITLE: Record<string, (signName: string, v: Voice, emoji: string) => string> = {
  jupiter: (s, _v, e) => `7 · ${e} ${s} Jupiter — where the good luck lives`,
  saturn: (s, v, e) => `8 · ${e} ${s} Saturn — ${v.p} strictest teacher`,
  uranus: (s, v, e) => `9 · ${e} ${s} Uranus — where ${v.s} ${v.be} different`,
  neptune: (s, v, e) => `10 · ${e} ${s} Neptune — ${v.p} dream life`,
  pluto: (s, v, e) => `11 · ${e} ${s} Pluto — ${v.p} deepest power`,
};
const RETRO_NOTE =
  "Retrograde just means the planet looked like it was moving backward in the sky that day. For the slow planets it's a minor note — the sign and the house matter far more.";

/** Rendered "what to say / what not to say" callout pair for a placement. */
function sayCallouts(signId: string, role: "moon" | "mercury" | "venus" | "mars", voice: Voice): ReadingBlock[] {
  const pair = SAY_LINES[signId]?.[role];
  if (!pair) return [];
  return [
    callout("What actually lands", `“${pair.works}” — ${voice.t(pair.worksWhy)}`, "strength"),
    callout("What backfires", `“${pair.avoid}” — ${voice.t(pair.avoidWhy)}`, "shadow"),
  ];
}

const para = (text: string): ReadingBlock => ({ type: "paragraph", text });
const callout = (label: string, text: string, variant: ReadingBlock["variant"] = "insight"): ReadingBlock => ({ type: "callout", label, text, variant });
const sub = (text: string): ReadingBlock => ({ type: "subheading", label: text });
const bullets = (items: string[]): ReadingBlock => ({ type: "bullets", items });
const quote = (text: string): ReadingBlock => ({ type: "quote", text });
const meta = (text: string): ReadingBlock => ({ type: "meta", text });

export interface DeepReading {
  archetypeLine: string;
  intro: string;
  sections: ReadingSection[];
}

export function buildDeepFullReading(
  p: PersonalityProfile,
  gender?: "male" | "female" | null
): DeepReading {
  const rng = makeRng(p.facts.seed + "|fullv2");
  const rand = () => rng.next();
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length) % arr.length];
  const voice = makeVoice(gender ?? null);
  const f = p.facts;

  /** Beginner primer paragraph — skipped silently if the id has none (never an empty para). */
  const primerBlock = (id: string): ReadingBlock[] => {
    const t = PRIMER_FOR[id];
    return t ? [para(voice.t(t))] : [];
  };

  const sections: ReadingSection[] = [];
  const getPlanet = (id: string) => f.planets.find((x) => x.id === id);

  // ── 0. OPENING — the outside and the inside ────────────────
  const tension = buildTension(p);
  sections.push(buildOpeningSection(p, voice, tension));

  // ── 0.5 TRAITS — one per line, strongest first ─────────────────────
  sections.push(buildTraitsSection(p, voice));

  // ── Chapter helpers ────────────────────────────────────────

  /** Meta badge text: "♉️ Taurus · 14° · house 2 · retrograde" */
  function metaFor(planetId: string, signId: string): string {
    const pl = getPlanet(planetId);
    const signName = SIGN_META[signId as keyof typeof SIGN_META]?.name ?? signId;
    const parts = [`${SIGN_EMOJI[signId as keyof typeof SIGN_EMOJI] ?? ""} ${signName}`.trim()];
    if (pl && typeof pl.pos === "number") parts.push(`${Math.floor(pl.pos)}°`);
    if (f.timeKnown && pl?.house) parts.push(`house ${pl.house}`);
    if (pl?.retrograde) parts.push("retrograde");
    return parts.join(" · ");
  }

  function houseAddOn(planetId: string): string | null {
    if (!f.timeKnown) return null;
    const pl = getPlanet(planetId);
    if (!pl) return null;
    return houseLine(planetId, pl.house, rand);
  }

  // ── 1. SUN ─────────────────────────────────────────────────
  const sunPl = getPlanet("sun");
  if (sunPl && ALL_SIGNS[sunPl.sign_id]) {
    const c = ALL_SIGNS[sunPl.sign_id];
    const signName = SIGN_META[sunPl.sign_id].name;
    const blocks: ReadingBlock[] = [meta(metaFor("sun", sunPl.sign_id))];
    blocks.push(...primerBlock("sun"));
    blocks.push(para(voice.t(c.sun.core[0])));
    if (c.sun.core[1]) blocks.push(para(voice.t(c.sun.core[1])));
    if (c.sun.core[2]) blocks.push(para(voice.t(c.sun.core[2])));
    if (c.sun.drive[0]) blocks.push(para(voice.t(c.sun.drive[0])));
    const ho = houseAddOn("sun");
    if (ho) {
      blocks.push(para(voice.t(HOUSE_BEATS.sun)));
      blocks.push(para(voice.t(ho)));
    }
    if (c.sun.monologue.length) blocks.push(quote(pick(c.sun.monologue)));
    sections.push({
      id: "sun",
      title: `1 · ${SIGN_EMOJI[sunPl.sign_id]} ${signName} Sun — who ${voice.s} ${voice.be} at ${voice.p} core`,
      blocks,
    });
  }

  // ── 2. MOON ────────────────────────────────────────────────
  const moonPl = getPlanet("moon");
  if (moonPl && ALL_SIGNS[moonPl.sign_id]) {
    const c = ALL_SIGNS[moonPl.sign_id];
    const signName = SIGN_META[moonPl.sign_id].name;
    const blocks: ReadingBlock[] = [meta(metaFor("moon", moonPl.sign_id))];
    blocks.push(...primerBlock("moon"));
    blocks.push(para(voice.t(c.moon.core[0])));
    if (c.moon.core[1]) blocks.push(para(voice.t(c.moon.core[1])));
    blocks.push(sub(capitalizeFirst(`${voice.s} ${conj3(voice, "feel")} safe when…`)));
    blocks.push(bullets(c.moon.safe.slice(0, 4).map((x) => voice.t(x))));
    blocks.push(sub(capitalizeFirst(`when ${voice.s === "they" ? "they're" : `${voice.s}'s`} hurt`)));
    blocks.push(para(voice.t(c.moon.hurt[Math.floor(rand() * c.moon.hurt.length)])));
    if (c.moon.talk[0]) blocks.push(para(voice.t(c.moon.talk[0])));
    const ho = houseAddOn("moon");
    if (ho) {
      blocks.push(para(voice.t(HOUSE_BEATS.moon)));
      blocks.push(para(voice.t(ho)));
    }
    blocks.push(...sayCallouts(moonPl.sign_id, "moon", voice));
    if (c.moon.monologue.length) blocks.push(quote(pick(c.moon.monologue)));
    sections.push({
      id: "moon",
      title: `2 · ${SIGN_EMOJI[moonPl.sign_id]} ${signName} Moon — how ${voice.s} ${conj3(voice, "process")} emotionally`,
      blocks,
    });
  }

  // ── 3. RISING ──────────────────────────────────────────────
  {
    const riseC = ALL_SIGNS[f.rising];
    if (riseC) {
      const signName = SIGN_META[f.rising].name;
      const blocks: ReadingBlock[] = [meta(`${SIGN_EMOJI[f.rising]} ${signName}${f.timeKnown ? "" : " · estimated"}`.trim())];
      blocks.push(...primerBlock("rising"));
      blocks.push(para(voice.t(riseC.rising.core[0])));
      if (riseC.rising.core[1]) blocks.push(para(voice.t(riseC.rising.core[1])));
      if (f.timeKnown) {
        blocks.push(para(voice.t("The Rising is always in house 1 — the house of the self itself. That's the whole job of this placement: it's the doorway the rest of the chart walks through.")));
      }
      if (riseC.rising.close[0]) blocks.push(para(voice.t(riseC.rising.close[0])));
      // angular planet flavor, factual bonus
      const angular = f.angularPlanets[0];
      if (angular && f.timeKnown) {
        blocks.push(callout(
          "Why first impressions hit harder than expected",
          `${prettyPlanet(angular.planet)} sits right on the Ascendant angle (${Math.round(angular.strength * 100)}% strength). Its themes color everything about entrances: people meet ${prettyPlanet(angular.planet)} energy before they meet much else.`,
          "insight"
        ));
      }
      sections.push({
        id: "rising",
        title: `3 · ${SIGN_EMOJI[f.rising]} ${signName} Rising — the version strangers meet first`,
        blocks,
      });
    }
  }

  // ── 4. MERCURY ─────────────────────────────────────────────
  const merPl = getPlanet("mercury");
  if (merPl && ALL_SIGNS[merPl.sign_id]) {
    const c = ALL_SIGNS[merPl.sign_id];
    const signName = SIGN_META[merPl.sign_id].name;
    const blocks: ReadingBlock[] = [meta(metaFor("mercury", merPl.sign_id))];
    blocks.push(...primerBlock("mercury"));
    blocks.push(para(voice.t(c.mercury.core[0])));
    if (c.mercury.core[1]) blocks.push(para(voice.t(c.mercury.core[1])));
    blocks.push(sub("Under pressure or anger"));
    if (c.mercury.angryComm[0]) blocks.push(para(voice.t(c.mercury.angryComm[0])));
    blocks.push(sub(`What makes ${voice.o} open up — or shut down`));
    if (c.mercury.openUp[0]) blocks.push(para(voice.t(c.mercury.openUp[0])));
    const ho = houseAddOn("mercury");
    if (ho) {
      blocks.push(para(voice.t(HOUSE_BEATS.mercury)));
      blocks.push(para(voice.t(ho)));
    }
    blocks.push(...sayCallouts(merPl.sign_id, "mercury", voice));
    if (c.mercury.monologue.length) blocks.push(quote(pick(c.mercury.monologue)));
    sections.push({
      id: "mercury",
      title: `4 · ${SIGN_EMOJI[merPl.sign_id]} ${signName} Mercury — how ${voice.s} ${conj3(voice, "think")} and ${conj3(voice, "decide")}`,
      blocks,
    });
  }

  // ── 5. VENUS ───────────────────────────────────────────────
  const venPl = getPlanet("venus");
  if (venPl && ALL_SIGNS[venPl.sign_id]) {
    const c = ALL_SIGNS[venPl.sign_id];
    const signName = SIGN_META[venPl.sign_id].name;
    const blocks: ReadingBlock[] = [meta(metaFor("venus", venPl.sign_id))];
    blocks.push(...primerBlock("venus"));
    blocks.push(para(voice.t(c.venus.core[0])));
    if (c.venus.core[1]) blocks.push(para(voice.t(c.venus.core[1])));
    blocks.push(sub("How affection actually shows"));
    if (c.venus.showLove[0]) blocks.push(para(voice.t(c.venus.showLove[0])));
    blocks.push(sub("What makes interest die"));
    if (c.venus.pullAway[0]) blocks.push(para(voice.t(c.venus.pullAway[0])));
    blocks.push(sub("How attachment forms"));
    if (c.venus.attach[0]) blocks.push(para(voice.t(c.venus.attach[0])));
    const ho = houseAddOn("venus");
    if (ho) {
      blocks.push(para(voice.t(HOUSE_BEATS.venus)));
      blocks.push(para(voice.t(ho)));
    }
    blocks.push(...sayCallouts(venPl.sign_id, "venus", voice));
    if (c.venus.monologue.length) blocks.push(quote(pick(c.venus.monologue)));
    sections.push({
      id: "venus",
      title: `5 · ${SIGN_EMOJI[venPl.sign_id]} ${signName} Venus — how ${voice.s} ${conj3(voice, "love")}`,
      blocks,
    });
  }

  // ── 6. MARS ────────────────────────────────────────────────
  const marPl = getPlanet("mars");
  if (marPl && ALL_SIGNS[marPl.sign_id]) {
    const c = ALL_SIGNS[marPl.sign_id];
    const signName = SIGN_META[marPl.sign_id].name;
    const blocks: ReadingBlock[] = [meta(metaFor("mars", marPl.sign_id))];
    blocks.push(...primerBlock("mars"));
    blocks.push(para(voice.t(c.mars.core[0])));
    if (c.mars.core[1]) blocks.push(para(voice.t(c.mars.core[1])));
    blocks.push(sub("Everyday anger"));
    if (c.mars.anger[0]) blocks.push(para(voice.t(c.mars.anger[0])));
    blocks.push(sub("At the absolute limit"));
    if (c.mars.limit[0]) blocks.push(para(voice.t(c.mars.limit[0])));
    const ho = houseAddOn("mars");
    if (ho) {
      blocks.push(para(voice.t(HOUSE_BEATS.mars)));
      blocks.push(para(voice.t(ho)));
    }
    blocks.push(...sayCallouts(marPl.sign_id, "mars", voice));
    if (c.mars.monologue.length) blocks.push(quote(pick(c.mars.monologue)));
    sections.push({
      id: "mars",
      title: `6 · ${SIGN_EMOJI[marPl.sign_id]} ${signName} Mars — how ${voice.s} ${conj3(voice, "want")} and ${conj3(voice, "fight")}`,
      blocks,
    });
  }

  // ── 7–11. THE SLOW PLANETS — Jupiter, Saturn, Uranus, Neptune, Pluto ──
  for (const planetId of OUTER_PLANETS) {
    const pl = getPlanet(planetId);
    if (!pl) continue;
    const c = OUTER_SIGNS_MAP[planetId][pl.sign_id];
    if (!c) continue;
    const signName = SIGN_META[pl.sign_id].name;
    const blocks: ReadingBlock[] = [meta(metaFor(planetId, pl.sign_id))];
    blocks.push(...primerBlock(planetId));
    for (const pgh of c.core) blocks.push(para(voice.t(pgh)));
    if (pl.retrograde) blocks.push(para(voice.t(RETRO_NOTE)));
    const hasHouse = f.timeKnown && Number.isInteger(pl.house) && pl.house >= 1 && pl.house <= 12;
    if (hasHouse) {
      blocks.push(para(voice.t(HOUSE_BEATS[planetId])));
      const hl = outerHouseLine(planetId, pl.house);
      if (hl) blocks.push(para(voice.t(hl)));
      // Personal conclusion: sign trait × real house area of life.
      blocks.push(callout(
        "Put it together",
        capitalizeFirst(voice.t(`${c.put} ${houseAreaName(pl.house)}`)) + ".",
        "insight"
      ));
    }
    sections.push({
      id: planetId,
      title: OUTER_CHAPTER_TITLE[planetId](signName, voice, SIGN_EMOJI[pl.sign_id]),
      blocks,
    });
  }

  // ── 12. NORTH NODE ─────────────────────────────────────────
  const nodePl = getPlanet("north_node");
  if (nodePl) {
    const nodeChapter = buildNodeChapter(
      nodePl.sign_id,
      f.timeKnown ? nodePl.house : undefined,
      f.timeKnown ? houseAreaName(nodePl.house) : undefined
    );
    if (nodeChapter) {
      const blocks: ReadingBlock[] = [
        meta(`${SIGN_EMOJI[nodePl.sign_id] ?? ""} ${nodeChapter.signName}${f.timeKnown ? ` · house ${nodePl.house}` : ""}`.trim()),
        ...primerBlock("north_node"),
        para(voice.t(nodeChapter.blocks[0])),
      ];
      if (nodeChapter.blocks[1]) blocks.push(para(voice.t(nodeChapter.blocks[1])));
      if (nodeChapter.blocks[2]) blocks.push(para(voice.t(nodeChapter.blocks[2])));
      sections.push({
        id: "north-node",
        title: `12 · 🧭 North Node in ${SIGN_EMOJI[nodePl.sign_id] ?? ""} ${nodeChapter.signName} — what this life keeps teaching`,
        blocks,
      });
    }
  }

  // ── THE 12 HOUSES, EXPLAINED — the map of a whole life ─────
  sections.push(buildHousesSection(p, voice));

  // ── DEEP COMBOS — top aspects as themed chapters ───────────
  const chapterAspects = pickAspectChapters(f.aspects, 5);
  let aspectIndex = 0;
  for (const asp of chapterAspects) {
    const ch = buildAspectChapter(asp.a, asp.b, asp.type, rand);
    // locate real orb/strength for honesty
    const raw = f.aspects.find((x) =>
      x.a === asp.a && x.b === asp.b && x.type === asp.type
    ) ?? f.aspects.find((x) => x.a === asp.a && x.b === asp.b);
    const strengthWord = raw ? (raw.strength >= 0.75 ? "tight" : raw.strength >= 0.45 ? "clear" : "wide") : "";
    const blocks: ReadingBlock[] = [];
    if (raw) {
      blocks.push(meta([
        prettyPlanet(asp.a),
        asp.type,
        prettyPlanet(asp.b),
        strengthWord ? `${strengthWord} orb` : "",
      ].filter(Boolean).join(" · ")));
    }
    for (const b of ch.blocks) blocks.push(para(voice.t(b)));
    if (ch.monologue) blocks.push(quote(ch.monologue));
    sections.push({
      id: `asp-${asp.a}-${asp.b}-${asp.type}-${aspectIndex++}`,
      title: `${prettyPlanet(asp.a)} ${asp.type} ${prettyPlanet(asp.b)} — ${ch.title}`,
      blocks,
    });
  }

  // ── SYNTHESIS: the repeating pattern ───────────────────────
  sections.push(buildPatternSection(p, voice));

  // ── SYNTHESIS: the big contradiction ───────────────────────
  const contraSec = buildContradictionSection(p, voice);
  if (contraSec) sections.push(contraSec);

  // ── PLAYBOOK — the whole chart as moves ────────────────────
  sections.push(buildPlaybookSection(p, voice));

  // ── FINAL: the person, in three layers ─────────────────────
  sections.push(buildLayersSection(p, voice, tension));

  // ── THE CONCLUSION — the verdict about the actual person ───
  const archetype = selectArchetype(p, gender ?? null);
  sections.push(buildConclusionSection(p, voice, tension, archetype));

  // ── intro ──────────────────────────────────────────────────
  const intro = buildIntro(p, voice);

  const top = [...p.scores].sort((a, b) => Math.abs(b.value - 50) - Math.abs(a.value - 50))[0];
  const archetypeLine = top
    ? `The loudest signal in the chart: ${dimensionPhrase(top)}. No single placement made it that way — several agreed at once.`
    : undefined;

  return {
    archetypeLine: archetypeLine ?? "",
    intro,
    sections,
  };
}

// ---------------------------------------------------------------------------
// Synthesis builders
// ---------------------------------------------------------------------------

/**
 * YOUR TRAITS, ONE BY ONE — the site-wide trait-list section. One bullet per
 * trait, strongest first, each with concrete daily detail + the real chart
 * citation that produced it.
 */
function buildTraitsSection(p: PersonalityProfile, voice: Voice): ReadingSection {
  const blocks: ReadingBlock[] = [];
  blocks.push(para(
    voice.t("Before the chapters, here are the loudest traits in the chart — one line each, strongest first. Every line names the trait and where it comes from.")
  ));

  const lines = buildTraitLines(p, 10);
  const items = lines.map((t) => {
    const label = `${t.label} — ${t.level}.`;
    const body = voice.t(t.line);
    return t.why ? `${label} ${body} This comes from ${t.why}.` : `${label} ${body}`;
  });

  if (items.length) {
    blocks.push(bullets(items));
  } else {
    blocks.push(para(voice.t("No single trait sits at an extreme — this chart runs on a balanced mix, which usually describes someone harder to typecast than their friends assume.")));
  }

  return { id: "traits", title: "Your Traits, One by One", blocks };
}

/**
 * THE 12 HOUSES, EXPLAINED — general beginner map of all twelve houses,
 * personalized with the planets this person actually has in each room.
 */
function buildHousesSection(p: PersonalityProfile, voice: Voice): ReadingSection {
  const f = p.facts;
  const blocks: ReadingBlock[] = [];

  blocks.push(para(
    voice.t(
      "Think of the chart as a house with 12 rooms. Every planet was sitting in one room on the day they were born — and that room is the area of life where that planet's story happens. Here's the full map, room by room."
    )
  ));

  const items: string[] = [];
  for (let h = 1; h <= 12; h++) {
    const def = HOUSE_PLAIN[h - 1];
    const occupants = f.planets
      .filter((pl) => Number.isInteger(pl.house) && pl.house === h)
      .sort((a, b) => HOUSE_PLANET_ORDER.indexOf(a.id) - HOUSE_PLANET_ORDER.indexOf(b.id));
    let text = `House ${h} · ${def.name} — ${def.line}`;
    if (f.timeKnown && occupants.length) {
      const names = occupants.map((pl) => prettyPlanet(pl.id)).join(" and ");
      text += ` Their ${names} ${occupants.length > 1 ? "sit" : "sits"} here.`;
    } else if (h === 1) {
      text += " This is also the Rising sign's room.";
    }
    items.push(voice.t(text));
  }
  blocks.push(bullets(items));

  return { id: "houses-explained", title: "The 12 Houses — the map of a whole life", blocks };
}

function buildPatternSection(p: PersonalityProfile, voice: Voice): ReadingSection {
  const rng = makeRng(p.facts.seed + "|pattern-v2");
  const blocks: ReadingBlock[] = [];

  blocks.push(para(
    voice.t(rng.pick([
      "Individual chapters are done — now read the chapters against each other. Certain subjects refuse to stay in one section of this chart; the same ones reappear through different planets until calling it a coincidence stops working.",
      "Step back from single placements and look at echoes: the same lesson keeps arriving through different doors. That repetition is what turns a list of positions into an actual personality.",
    ]))
  ));

  // theme rows with driver citations
  const themes = p.themes.slice(0, 3);
  const themeCopy: Record<string, (v: Voice) => string> = {
    independence_attachment: (v) => v.t("The central tug-of-war is freedom versus closeness. It shows up twice minimum: once in how much autonomy gets defended, once in how hard attachment lands once someone is truly let in. Neither side wins by fighting the other — the adult version is scheduling both."),
    control_sensitivity: (v) => v.t("Feeling deeply and controlling tightly run on the same fuel here. Sensitivity supplies the depth; control manages its release schedule. When management works, composure reads as maturity. When it jams, pressure finds unplanned exits."),
    security_freedom: (v) => v.t("Security and freedom argue politely but constantly. Stability matters genuinely — so does escape velocity. Relationships, careers and living situations all eventually face the same question: can this hold me without caging me?"),
    idealism_reality: (v) => v.t("High standards against concrete reality form the recurring collision: the visions stay vivid while the facts keep sending corrections. Discouragement isn't weakness here — it's idealism hitting inventory. Turning the vision into small sequenced steps converts the gap from pain into project."),
    depth_intensity: (v) => v.t("Intensity refuses casual mode anywhere it appears: interests, relationships, arguments, loyalty. Half-engagement doesn't physically occur. The danger isn't excess feeling — it's the all-or-nothing switch flipping before moderation gets consulted."),
    visibility: (v) => v.t("Being seen operates as a genuine need rather than vanity — and being overlooked registers as real harm. Watch confidence grow around audiences and quietly shrink in invisible seasons; both moves belong to the same mechanism."),
    precision: (v) => v.t("Self-monitoring runs as a permanent background process: work gets double-checked, conversations get replayed, standards get enforced on themselves first. This produces quality nobody questions and exhaustion nobody witnesses. The inner auditor deserves a supervisor — scheduled compassion, on purpose."),
    care: (v) => v.t("Caregiving threads through multiple placements independently: noticing needs is automatic, and meeting them happens before anyone asks. The catch: whoever gives this continuously has to learn to receive on purpose, or resentment builds up silently."),
    chaos: (v) => v.t("Their tolerance for change runs unusually high across separate areas of life: plans rerouted calmly, identities revised periodically, environments reinvented entirely. Others experience whiplash; internally it's one coherent policy — stagnation costs more than turbulence."),
  };

  for (const t of themes) {
    const fn = themeCopy[t.key];
    const body = fn ? fn(voice) : null;
    if (body) {
      const drivers = collectDrivers(p, t.key);
      blocks.push(para(body + (drivers ? ` Evidence trail: ${drivers}.` : "")));
    }
  }

  if (!themes.length) {
    blocks.push(para(voice.t("No single theme monopolizes this chart — instead several moderate currents run parallel, which usually describes someone harder to stereotype than either their friends or enemies assume.")));
  }

  return { id: "pattern", title: "The Repeating Pattern", blocks };
}

function collectDrivers(p: PersonalityProfile, themeKey: string): string {
  // map theme → underlying dimensions → top driver sources
  const map: Record<string, string[]> = {
    independence_attachment: ["independence", "attachmentNeed"],
    control_sensitivity: ["emotionalControl", "emotionalSensitivity"],
    security_freedom: ["independence", "patience"],
    idealism_reality: ["idealism", "analyticalThinking"],
    depth_intensity: ["intensityDepth", "emotionalSensitivity"],
    visibility: ["expressiveness", "confidence"],
    precision: ["selfCriticism", "analyticalThinking"],
    care: ["nurturance", "attachmentNeed"],
    chaos: ["impulsivity", "adaptability"],
  };
  const dims = map[themeKey] ?? [];
  const sources: string[] = [];
  for (const d of dims) {
    const s = p.scores.find((x) => x.key === d);
    if (s?.drivers[0]?.source) sources.push(s.drivers[0].source.toLowerCase());
  }
  return [...new Set(sources)].slice(0, 2).join(", ");
}

function buildContradictionSection(p: PersonalityProfile, voice: Voice): ReadingSection | null {
  if (!p.contradictions.length) return null;
  const rng = makeRng(p.facts.seed + "|contra-v2");
  const c = p.contradictions[0];

  const blocks: ReadingBlock[] = [];
  blocks.push(para(
    voice.t("Contradictions explain a person better than any single trait. This chart carries at least one internal tension strong enough to organize whole relationships around:")
  ));
  blocks.push(callout(c.title, voice.t(c.body), "shadow"));

  if (p.contradictions[1]) {
    blocks.push(para(
      voice.t(`A second, quieter mismatch runs alongside it: ${p.contradictions[1].body.split(". ")[0].toLowerCase()}. Both tensions share one instruction manual: stop expecting either side to convert the other.`)
    ));
  }

  blocks.push(para(
    voice.t(rng.pick([
      "Neither pole is the fake one. Whichever gets suppressed returns later with interest — resentment, burnout, sudden reversals other people never saw being assembled.",
      "Friends will swear one side is the true self based on which version they met first. The chart's honest answer: both were always load-bearing.",
    ]))
  ));

  return { id: "contradiction", title: "The Big Contradiction", blocks };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Conjugate a present-tense verb for the current voice: feel -> feels / feel */
function conj3(voice: Voice, base: string): string {
  if (voice.s === "they") return base;
  if (/(?:s|x|z|ch|sh)$/.test(base)) return `${base}es`;
  if (/[^aeiouy]y$/.test(base)) return `${base.slice(0, -1)}ies`;
  return `${base}s`;
}

function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function dimensionPhrase(d: DimensionScore): string {
  const names: Partial<Record<string, [string, string]>> = {
    socialEnergy: ["a big social battery", "a low social battery"],
    expressiveness: ["natural expressiveness", "a low, controlled profile"],
    emotionalSensitivity: ["feeling everything deeply", "staying calm under pressure"],
    emotionalControl: ["tight control over what feelings show", "feelings shown as they come"],
    vulnerabilityOpenness: ["willing to be seen unpolished", "strict privacy"],
    attachmentNeed: ["deep loyalty needs", "relating without needing anyone"],
    independence: ["fierce independence", "comfort leaning on others"],
    trustCaution: ["trust earned through proof", "default-open trust"],
    jealousyRisk: ["possessiveness that needs watching", "low possessive instinct"],
    communicationDirectness: ["saying things straight", "softening how they say things"],
    analyticalThinking: ["thinking in systems", "gut-led thinking"],
    overthinking: ["replaying everything in their head", "an ability to let things go"],
    intuition: ["a strong gut read on people", "believing evidence first"],
    confidence: ["solid base of self-belief", "self-doubt they have to manage"],
    selfCriticism: ["harsh standards for themselves", "fair self-expectations"],
    ambition: ["a steady push toward goals", "quiet personal goals"],
    discipline: ["real discipline", "structure that depends on mood"],
    patience: ["long-game patience", "a short fuse for slow processes"],
    impulsivity: ["act-now instinct", "deliberate pacing"],
    adaptability: ["high adaptability", "a preference for the known"],
    creativity: ["creative wiring", "selective creative output"],
    romanticism: ["running on romance", "a practical approach to love"],
    nurturance: ["caretaker instinct", "care shown through practical help"],
    intensityDepth: ["all-or-nothing intensity", "steady moderate engagement"],
    needForControl: ["needing to be the author of their own life", "staying relaxed about outcomes"],
    idealism: ["ideals shaping choices", "clear-eyed realism"],
    resilience: ["bouncing back fast", "recovery that needs time and support"],
    playfulness: ["playfulness showing up in everything", "a serious default mode"],
  };
  const pair = names[d.key];
  if (!pair) return `${d.key.replace(/([A-Z])/g, " $1").toLowerCase()} around ${d.value}%`;
  return d.value >= 50 ? pair[0] : pair[1];
}

function buildIntro(p: PersonalityProfile, voice: Voice): string {
  const f = p.facts;
  const elCopy: Record<string, string> = {
    fire: "energy moves fast, feelings ignite quickly, and momentum matters more than neatness.",
    earth: "results matter more than appearances, patience goes to things they can touch, and reliability outranks brilliance.",
    air: "life gets processed through ideas and conversation, changing perspective is easy, and connection travels through words.",
    water: "feelings are the main instrument they navigate by, the mood of a room counts as information, and truth usually arrives as a feeling before it becomes words.",
  };
  const paceCopy: Record<string, string> = {
    cardinal: "quick to start things, and restless once things stop moving.",
    fixed: "built to keep things going — starting over is the expensive part.",
    mutable: "flexible: plans bend easily when new information shows up.",
  };
  let intro = `Before the details, here's the big picture. This chart runs on mostly ${f.dominantElement} energy: ${elCopy[f.dominantElement]} The overall pace is ${paceCopy[f.dominantModality]}`;

  if (f.timeKnown && f.stelliums[0]?.kind === "house") {
    const h = f.stelliums[0].target as number;
    intro += ` One thing jumps out right away: ${f.stelliums[0].planets.length} planets crowd into house ${h}, making ${houseAreaName(h)} a big theme in this life.`;
  } else if (f.stelliums[0]?.kind === "sign") {
    const sid = String(f.stelliums[0].target);
    intro += ` One thing jumps out right away: several planets stack into ${sid.charAt(0).toUpperCase() + sid.slice(1)}, giving that sign more say than its headcount suggests.`;
  }
  return intro.trim();
}
