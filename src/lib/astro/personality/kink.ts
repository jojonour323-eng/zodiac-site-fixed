// ===========================================================================
// KINK — chart-only engine. NO QUESTIONS.
// ---------------------------------------------------------------------------
// The result is generated straight from the birth chart, the same data the
// main reading uses:
//   Mars       — drive and desire (who leads, how hard, how fast)
//   Venus      — attraction and love style (surrender, romance, taste)
//   Pluto      — intensity and power (edge, obsession, control)
//   5th house  — pleasure and play (how you have fun, what you're into)
//   8th house  — intimacy and merging (depth, bonds, taboos)
//   Moon/Mercury/Saturn — connection, explicit talk, structure (support only)
//
// RESULTS SPEAK INTERNET SLANG, NOT EUPHEMISM: "you're a dom" / "you're a
// switch" / "you're vanilla" — the words people actually use. Mature,
// respectful, non-judgmental, consent-forward. Same custom per-placement
// style as the main reading: different chart, different text.
// ===========================================================================

import type { NatalProfile, PlanetId, SignId } from "../types";
import { SIGN_META } from "../signs";
import { clamp } from "./core";

// ---- Result shape (same consumers as before) ----

export interface KinkIdentity {
  id: string;
  label: string;
  pct: number;
  description: string;
  /** All rows are chart reads now; kept for UI compatibility. */
  source: "chart";
}

export interface KinkProfile {
  verdict: { label: string; blurb: string };
  identities: KinkIdentity[];
  appetite: { pct: number; line: string };
  axes: { key: KinkAxis; label: string; value: number; note: string }[];
  mayNotAppeal: string[];
  chartNote: string;
  interpretation: string[];
}

export type KinkAxis =
  | "control" | "submission" | "intensity" | "novelty"
  | "emotionalConnection" | "communication" | "boundaries" | "curiosity";

export const AXIS_LABELS: Record<KinkAxis, string> = {
  control: "Taking control",
  submission: "Handing it over",
  intensity: "Intensity & edge",
  novelty: "Novelty & play",
  emotionalConnection: "Emotional depth",
  communication: "Explicit talk",
  boundaries: "Rules & structure",
  curiosity: "Curiosity",
};

// ===========================================================================
// AUTHORED PER-SIGN REGISTERS — each value earns its line from the sign's
// actual nature. Different placements → different numbers AND different text.
// ===========================================================================

type Register = {
  line?: string;
  control?: number;
  submission?: number;
  intensity?: number;
  novelty?: number;
  connection?: number;
  structure?: number;
  talk?: number;
};

// --- Mars: drive and desire ---
const MARS: Record<SignId, Register> = {
  aries: { line: "Mars in Aries wants to be first — in the chase, in the room, in the lead.", control: 84, intensity: 78, novelty: 70 },
  taurus: { line: "Mars in Taurus leads by not moving — steady pressure and patient, physical will.", control: 60, intensity: 55, novelty: 28 },
  gemini: { line: "Mars in Gemini runs desire through words — flirting, teasing, and mental chase.", control: 46, intensity: 44, novelty: 86 },
  cancer: { line: "Mars in Cancer defends rather than dominates — desire hides behind care.", control: 36, intensity: 48, novelty: 32 },
  leo: { line: "Mars in Leo takes the stage — being in charge is the natural temperature.", control: 76, intensity: 68, novelty: 64 },
  virgo: { line: "Mars in Virgo controls the details, not the room — precision is the power.", control: 52, intensity: 44, novelty: 34 },
  libra: { line: "Mars in Libra weighs, charms, and would rather invite than push.", control: 34, intensity: 38, novelty: 54 },
  scorpio: { line: "Mars in Scorpio is the quiet hand on the wheel — total control, minimal noise.", control: 90, intensity: 92, novelty: 58 },
  sagittarius: { line: "Mars in Sagittarius leads the adventure but resents the leash.", control: 56, intensity: 64, novelty: 88 },
  capricorn: { line: "Mars in Capricorn runs the hierarchy — authority is the comfort zone.", control: 82, intensity: 70, novelty: 38 },
  aquarius: { line: "Mars in Aquarius leads systems more than people — control with distance.", control: 48, intensity: 54, novelty: 84 },
  pisces: { line: "Mars in Pisces flows around power — forcing things feels wrong to it.", control: 28, intensity: 46, novelty: 60 },
};

// --- Venus: attraction and love style ---
const VENUS: Record<SignId, Register> = {
  aries: { line: "Venus in Aries wants to want — pursuit is the pleasure, not the kneel.", submission: 28, connection: 55, novelty: 68, talk: 74 },
  taurus: { line: "Venus in Taurus surrenders to comfort and being spoiled — on its own clock.", submission: 46, connection: 74, novelty: 26, talk: 44 },
  gemini: { line: "Venus in Gemini yields to wit — whoever keeps up gets the lead.", submission: 50, connection: 44, novelty: 80, talk: 84 },
  cancer: { line: "Venus in Cancer melts for safety — being held by someone solid is the fantasy.", submission: 62, connection: 84, novelty: 34, talk: 50 },
  leo: { line: "Venus in Leo wants to be adored, not ordered — worship, not commands.", submission: 38, connection: 64, novelty: 62, talk: 66 },
  virgo: { line: "Venus in Virgo serves — there's real sub wiring in being useful to someone.", submission: 58, connection: 58, novelty: 40, talk: 70 },
  libra: { line: "Venus in Libra delights in being chosen and gracefully led.", submission: 54, connection: 60, novelty: 56, talk: 58 },
  scorpio: { line: "Venus in Scorpio hands over everything or nothing — total surrender is the intimacy.", submission: 72, connection: 88, novelty: 60, talk: 58 },
  sagittarius: { line: "Venus in Sagittarius stays free — love and leash don't rhyme.", submission: 40, connection: 50, novelty: 76, talk: 74 },
  capricorn: { line: "Venus in Capricorn respects authority but won't dissolve into it.", submission: 44, connection: 54, novelty: 30, talk: 46 },
  aquarius: { line: "Venus in Aquarius refuses the cage — surrender reads as losing the self.", submission: 34, connection: 40, novelty: 80, talk: 72 },
  pisces: { line: "Venus in Pisces is the textbook romantic surrender — merging, devotion, giving over.", submission: 80, connection: 92, novelty: 58, talk: 40 },
};

// --- Pluto: intensity and power (generational — the house carries the personal weight) ---
const PLUTO: Record<SignId, Register> = {
  aries: { control: 70, intensity: 76 },
  taurus: { control: 62, intensity: 64 },
  gemini: { control: 48, intensity: 52 },
  cancer: { control: 52, intensity: 60 },
  leo: { control: 62, intensity: 64 },
  virgo: { control: 52, intensity: 56 },
  libra: { control: 48, intensity: 52 },
  scorpio: { control: 82, intensity: 86 },
  sagittarius: { control: 56, intensity: 60 },
  capricorn: { control: 78, intensity: 74 },
  aquarius: { control: 54, intensity: 58 },
  pisces: { control: 46, intensity: 56 },
};

// --- 8th house cusp: intimacy and merging ---
const HOUSE8: Record<SignId, Register> = {
  aries: { line: "Your 8th house in Aries makes intimacy physical, direct, and fast — you'd rather show than talk.", intensity: 12 },
  taurus: { line: "Your 8th house in Taurus makes intimacy slow and sensual — touch, taste, and patience are the language.", connection: 10, intensity: 6 },
  gemini: { line: "Your 8th house in Gemini makes intimacy verbal — talking and mental games ARE the intimacy.", novelty: 10 },
  cancer: { line: "Your 8th house in Cancer makes intimacy emotional merging — feelings and closeness can't be separated.", connection: 12 },
  leo: { line: "Your 8th house in Leo makes intimacy performative and warm — being fully seen is the thrill.", novelty: 6, connection: 6 },
  virgo: { line: "Your 8th house in Virgo makes intimacy precise — technique and details are where the attention goes.", structure: 6, intensity: 6 },
  libra: { line: "Your 8th house in Libra makes intimacy a duet — balance and reciprocity are non-negotiable.", connection: 8 },
  scorpio: { line: "Your 8th house in Scorpio is at home — intimacy is total fusion and power exchange, nothing halfway.", intensity: 14, control: 10, submission: 8 },
  sagittarius: { line: "Your 8th house in Sagittarius makes intimacy experimental — new places, new rules, laughter included.", novelty: 12 },
  capricorn: { line: "Your 8th house in Capricorn makes intimacy structured — rules, roles, and earned trust are the point.", structure: 12, control: 8 },
  aquarius: { line: "Your 8th house in Aquarius makes intimacy unconventional — the unusual is your normal.", novelty: 14 },
  pisces: { line: "Your 8th house in Pisces makes intimacy boundary-less — merging, fantasy, and role-play blur everything.", submission: 12, connection: 10, novelty: 6 },
};

// --- 5th house cusp: pleasure and play ---
const HOUSE5: Record<SignId, Register> = {
  aries: { line: "Your 5th house in Aries plays to win — fun is fast, competitive, and a little reckless.", novelty: 10, intensity: 6 },
  taurus: { line: "Your 5th house in Taurus pleasures through the senses — food, touch, comfort, beauty.", intensity: 6 },
  gemini: { line: "Your 5th house in Gemini plays with words — flirting is the sport.", novelty: 8 },
  cancer: { line: "Your 5th house in Cancer plays at home base — cozy, nostalgic, private fun.", connection: 8 },
  leo: { line: "Your 5th house in Leo plays for the stage — performative fun and being watched.", novelty: 8, control: 6 },
  virgo: { line: "Your 5th house in Virgo plays precisely — games with rules, perfected pleasures.", structure: 6 },
  libra: { line: "Your 5th house in Libra plays in pairs — everything's better with a partner.", connection: 6 },
  scorpio: { line: "Your 5th house in Scorpio plays with fire — the fun has edge, stakes, and intensity.", intensity: 12 },
  sagittarius: { line: "Your 5th house in Sagittarius plays big — travel, risk, laughing too loud.", novelty: 10 },
  capricorn: { line: "Your 5th house in Capricorn plays to win respect — even fun has achievements.", structure: 6, control: 6 },
  aquarius: { line: "Your 5th house in Aquarius plays unusual — strange hobbies, strange rules, full commitment.", novelty: 12 },
  pisces: { line: "Your 5th house in Pisces plays in fantasy — role-play and daydreams do the heavy lifting.", novelty: 8, submission: 8 },
};

// --- Moon: connection & aftercare ---
const MOON_CONN: Record<SignId, number> = {
  aries: 50, taurus: 72, gemini: 46, cancer: 88, leo: 62, virgo: 64,
  libra: 58, scorpio: 86, sagittarius: 48, capricorn: 52, aquarius: 40, pisces: 90,
};

// --- Mercury: explicit talk about wants ---
const MERCURY_TALK: Record<SignId, number> = {
  aries: 78, taurus: 44, gemini: 84, cancer: 50, leo: 68, virgo: 70,
  libra: 58, scorpio: 62, sagittarius: 76, capricorn: 48, aquarius: 74, pisces: 40,
};

// --- Saturn: rules & structure ---
const SATURN_STRUCT: Record<SignId, number> = {
  aries: 40, taurus: 66, gemini: 42, cancer: 46, leo: 48, virgo: 72,
  libra: 56, scorpio: 76, sagittarius: 44, capricorn: 86, aquarius: 60, pisces: 38,
};

// House placements of the personal planets — the WHERE that personalizes everything.
function houseNudge(planet: string, house: number | undefined, add: (k: keyof Register, v: number) => void) {
  if (!house) return;
  if (planet === "mars") {
    if (house === 1) add("control", 8);
    if (house === 8) { add("intensity", 12); add("control", 6); }
    if (house === 10) add("control", 8);
    if (house === 12) add("submission", 10);
    if (house === 7) add("submission", 6);
  }
  if (planet === "venus") {
    if (house === 8) { add("submission", 8); add("intensity", 8); }
    if (house === 12) add("submission", 10);
    if (house === 7) add("submission", 6);
    if (house === 1) add("control", 6);
    if (house === 5) add("novelty", 8);
  }
  if (planet === "pluto") {
    if (house === 8) { add("intensity", 10); add("control", 6); }
    if (house === 1) { add("intensity", 6); add("control", 6); }
    if (house === 10) add("control", 6);
  }
}

/** Planets inside the 5th / 8th house — flavor lines + small score nudges. */
const OCCUPANT_LINES: Record<PlanetId, { h5: string; h8: string; n5?: Partial<Register>; n8?: Partial<Register> }> = {
  sun: { h5: "The Sun in your 5th makes play identity-level — fun is where you're most yourself.", h8: "The Sun in your 8th makes intimacy self-defining — merging is who you are.", n5: { novelty: 6, control: 4 }, n8: { intensity: 6, connection: 6 } },
  moon: { h5: "The Moon in your 5th makes play emotional — you play how you feel.", h8: "The Moon in your 8th bonds at full depth — there's no casual anything.", n5: { connection: 6 }, n8: { connection: 8, intensity: 4 } },
  mercury: { h5: "Mercury in your 5th plays with words — the flirting is verbal and constant.", h8: "Mercury in your 8th probes — conversations go straight to the basement.", n5: { novelty: 4 }, n8: { novelty: 4, intensity: 4 } },
  venus: { h5: "Venus in your 5th is the romantic classic — dates, flirting, pleasure as a native language.", h8: "Venus in your 8th is the classic deep-intimacy signature — attraction and obsession are neighbors.", n5: { novelty: 4 }, n8: { intensity: 8, submission: 4 } },
  mars: { h5: "Mars in your 5th makes play competitive and physical.", h8: "Mars in your 8th makes desire physical and raw — the drive lives in the deep end.", n5: { intensity: 6, novelty: 4 }, n8: { intensity: 10, control: 4 } },
  jupiter: { h5: "Jupiter in your 5th scales fun up — the party grows around you.", h8: "Jupiter in your 8th expands intimacy — you say yes to more in the deep end.", n5: { novelty: 6 }, n8: { novelty: 6 } },
  saturn: { h5: "Saturn in your 5th structures play — the fun is earned and kept.", h8: "Saturn in your 8th makes intimacy earned — trust gets built, tested, then absolute.", n5: { structure: 6, control: 4 }, n8: { structure: 8, control: 4 } },
  uranus: { h5: "Uranus in your 5th makes play experimental — the strange is the appeal.", h8: "Uranus in your 8th makes intimacy electric — the taboo is the turn-on.", n5: { novelty: 10 }, n8: { novelty: 10 } },
  neptune: { h5: "Neptune in your 5th makes play dreamlike — fantasy is the default playground.", h8: "Neptune in your 8th blurs intimacy — fantasy and reality melt together.", n5: { novelty: 6, submission: 4 }, n8: { submission: 6, novelty: 4 } },
  pluto: { h5: "Pluto in your 5th makes play intense — hobbies and flings become obsessions.", h8: "Pluto in your 8th is Pluto at home — power, depth, and transformation ARE the intimacy.", n5: { intensity: 8 }, n8: { intensity: 12, control: 6 } },
  north_node: { h5: "Your North Node in the 5th points growth through play and self-expression.", h8: "Your North Node in the 8th points growth through depth and letting someone in." },
  chiron: { h5: "Chiron in your 5th makes play tender — creative risks carry old wounds and real healing.", h8: "Chiron in your 8th makes intimacy the tender spot — and the place you heal most." },
  lilith: { h5: "Lilith in your 5th makes play defiant — the forbidden is the fun.", h8: "Lilith in your 8th makes intimacy raw and untamed — the wild side lives here.", n5: { novelty: 6, intensity: 4 }, n8: { intensity: 6, novelty: 4 } },
};

// ===========================================================================
// ENGINE
// ===========================================================================

export function buildKinkChartProfile(profile: NatalProfile): KinkProfile {
  const find = (id: PlanetId) => profile.planets.find((p) => p.id === id);
  const signOf = (id: PlanetId): SignId =>
    id === "sun" ? profile.sun.signId
    : id === "moon" ? profile.moon.signId
    : (find(id)?.signId ?? profile.sun.signId);
  const houseOf = (id: PlanetId): number | undefined =>
    id === "sun" ? profile.sun.house : find(id)?.house;
  const retroOf = (id: PlanetId): boolean => find(id)?.retrograde ?? false;

  const cuspSign = (house: number): SignId | undefined =>
    profile.houses.find((h) => h.house === house)?.signId;

  const marsS = signOf("mars");
  const venusS = signOf("venus");
  const plutoS = signOf("pluto");
  const moonS = signOf("moon");
  const mercuryS = signOf("mercury");
  const saturnS = signOf("saturn");
  const h8S = cuspSign(8);
  const h5S = cuspSign(5);

  const name = (s: SignId) => SIGN_META[s].name;
  const marsRetro = retroOf("mars");
  const venusRetro = retroOf("venus");

  // ---- axis scores: authored register as the BASE, house placements as
  // additive nudges. The dominant planet (Mars for drive, Venus for love
  // style) actually leads its axis instead of being averaged into mush. ----
  const nudges: Record<string, number> = {
    control: 0, submission: 0, intensity: 0, novelty: 0,
    connection: 0, structure: 0, talk: 0,
  };

  // ---- attribution ledger: how much each placement really adds to each
  // axis (register values at mix weight + every nudge), so each number on
  // the tab is cited to the placement that actually produced it. ----
  const axisSrc: Record<string, Record<string, number>> = {
    control: {}, submission: {}, intensity: {}, novelty: {},
    connection: {}, communication: {}, boundaries: {},
  };
  const AXIS_OF_NUDGE: Record<string, string> = {
    control: "control", submission: "submission", intensity: "intensity",
    novelty: "novelty", connection: "connection",
    structure: "boundaries", talk: "communication",
  };
  const addSrc = (axis: string, label: string, amount: number | undefined) => {
    if (typeof amount !== "number" || amount === 0) return;
    axisSrc[axis][label] = (axisSrc[axis][label] ?? 0) + amount;
  };
  // Lead labels must always resolve to a "placements behind this" entry:
  // planets cite their sign, house occupants fold into the house layer.
  const h8Label = h8S ? `your 8th house in ${name(h8S)}` : "";
  const h5Label = h5S ? `your 5th house in ${name(h5S)}` : "";
  const PLANET_LAYER: Record<string, boolean> = { mars: true, venus: true, pluto: true };
  const nudge = (k: string, v: number | undefined) => {
    if (!v) return;
    nudges[k] += v;
  };
  /** Feed the score AND the ledger in one move (label = the placement causing it). */
  const trackedAdd = (label: string) => (k: keyof Register, v: number) => {
    nudge(k, v);
    const axis = AXIS_OF_NUDGE[k];
    if (axis) addSrc(axis, label, v);
  };

  houseNudge("mars", houseOf("mars"), trackedAdd(`Mars in ${name(marsS)}`));
  houseNudge("venus", houseOf("venus"), trackedAdd(`Venus in ${name(venusS)}`));
  houseNudge("pluto", houseOf("pluto"), trackedAdd(`Pluto in ${name(plutoS)}`));

  // Occupant flavor from planets sitting IN the 5th / 8th
  const inH5: { id: PlanetId; line: string }[] = [];
  const inH8: { id: PlanetId; line: string }[] = [];
  for (const p of profile.planets) {
    if (p.house === 5 && OCCUPANT_LINES[p.id]?.h5) {
      inH5.push({ id: p.id, line: OCCUPANT_LINES[p.id].h5 });
      const n = OCCUPANT_LINES[p.id].n5;
      if (n) {
        const label = PLANET_LAYER[p.id] ? `${prettyPlanet(p.id)} in ${name(p.signId)}` : h5Label;
        for (const [k, v] of Object.entries(n)) trackedAdd(label)(k as keyof Register, typeof v === "number" ? v : 0);
      }
    }
    if (p.house === 8 && OCCUPANT_LINES[p.id]?.h8) {
      inH8.push({ id: p.id, line: OCCUPANT_LINES[p.id].h8 });
      const n = OCCUPANT_LINES[p.id].n8;
      if (n) {
        const label = PLANET_LAYER[p.id] ? `${prettyPlanet(p.id)} in ${name(p.signId)}` : h8Label;
        for (const [k, v] of Object.entries(n)) trackedAdd(label)(k as keyof Register, typeof v === "number" ? v : 0);
      }
    }
  }

  /** Weighted mean of defined parts — undefined sources drop out, not dilute. */
  const mix = (parts: [number | undefined, number][]): number => {
    let s = 0, wsum = 0;
    for (const [v, wt] of parts) {
      if (typeof v !== "number") continue;
      s += v * wt; wsum += wt;
    }
    return wsum ? s / wsum : 50;
  };
  const reg = (r: Register | undefined, k: keyof Register): number | undefined =>
    typeof r?.[k] === "number" ? (r[k] as number) : undefined;

  const control = clamp(Math.round(mix([
    [reg(MARS[marsS], "control"), 1],
    [reg(PLUTO[plutoS], "control"), 0.5],
    [h8S ? reg(HOUSE8[h8S], "control") : undefined, 0.3],
  ]) + nudges.control), 3, 97);

  const submission = clamp(Math.round(mix([
    [reg(VENUS[venusS], "submission"), 1],
    [h8S ? reg(HOUSE8[h8S], "submission") : undefined, 0.3],
  ]) + nudges.submission), 3, 97);

  const intensity = clamp(Math.round(mix([
    [reg(MARS[marsS], "intensity"), 1],
    [reg(PLUTO[plutoS], "intensity"), 0.5],
    [h8S ? reg(HOUSE8[h8S], "intensity") : undefined, 0.5],
    [h5S ? reg(HOUSE5[h5S], "intensity") : undefined, 0.4],
  ]) + nudges.intensity), 3, 97);

  const novelty = clamp(Math.round(mix([
    [reg(MARS[marsS], "novelty"), 1],
    [reg(VENUS[venusS], "novelty"), 0.6],
    [h5S ? reg(HOUSE5[h5S], "novelty") : undefined, 0.8],
    [h8S ? reg(HOUSE8[h8S], "novelty") : undefined, 0.6],
  ]) + nudges.novelty), 3, 97);

  const connection = clamp(Math.round(mix([
    [MOON_CONN[moonS], 1],
    [reg(VENUS[venusS], "connection"), 0.7],
    [h8S ? reg(HOUSE8[h8S], "connection") : undefined, 0.5],
  ]) + nudges.connection), 3, 97);

  const communication = clamp(Math.round(mix([
    [MERCURY_TALK[mercuryS], 1],
    [reg(VENUS[venusS], "talk"), 0.5],
  ]) + nudges.talk), 3, 97);

  const boundaries = clamp(Math.round(mix([
    [SATURN_STRUCT[saturnS], 1],
    [h8S ? reg(HOUSE8[h8S], "structure") : undefined, 0.5],
    [h5S ? reg(HOUSE5[h5S], "structure") : undefined, 0.4],
  ]) + nudges.structure), 3, 97);

  const curiosity = clamp(Math.round(0.6 * novelty + 0.4 * communication), 3, 97);

  // ---- ledger: base register contributions at the exact mix weights above,
  // so a cited placement is always one that really produced part of the number ----
  const mul = (v: number | undefined, w: number): number | undefined =>
    typeof v === "number" ? v * w : undefined;
  addSrc("control", `Mars in ${name(marsS)}`, reg(MARS[marsS], "control"));
  addSrc("control", `Pluto in ${name(plutoS)}`, mul(reg(PLUTO[plutoS], "control"), 0.5));
  addSrc("control", h8Label, mul(h8S ? reg(HOUSE8[h8S], "control") : undefined, 0.3));
  addSrc("submission", `Venus in ${name(venusS)}`, reg(VENUS[venusS], "submission"));
  addSrc("submission", h8Label, mul(h8S ? reg(HOUSE8[h8S], "submission") : undefined, 0.3));
  addSrc("intensity", `Mars in ${name(marsS)}`, reg(MARS[marsS], "intensity"));
  addSrc("intensity", `Pluto in ${name(plutoS)}`, mul(reg(PLUTO[plutoS], "intensity"), 0.5));
  addSrc("intensity", h8Label, mul(h8S ? reg(HOUSE8[h8S], "intensity") : undefined, 0.5));
  addSrc("intensity", h5Label, mul(h5S ? reg(HOUSE5[h5S], "intensity") : undefined, 0.4));
  addSrc("novelty", `Mars in ${name(marsS)}`, reg(MARS[marsS], "novelty"));
  addSrc("novelty", `Venus in ${name(venusS)}`, mul(reg(VENUS[venusS], "novelty"), 0.6));
  addSrc("novelty", h5Label, mul(h5S ? reg(HOUSE5[h5S], "novelty") : undefined, 0.8));
  addSrc("novelty", h8Label, mul(h8S ? reg(HOUSE8[h8S], "novelty") : undefined, 0.6));
  addSrc("connection", `Moon in ${name(moonS)}`, MOON_CONN[moonS]);
  addSrc("connection", `Venus in ${name(venusS)}`, mul(reg(VENUS[venusS], "connection"), 0.7));
  addSrc("connection", h8Label, mul(h8S ? reg(HOUSE8[h8S], "connection") : undefined, 0.5));
  addSrc("communication", `Mercury in ${name(mercuryS)}`, MERCURY_TALK[mercuryS]);
  addSrc("communication", `Venus in ${name(venusS)}`, mul(reg(VENUS[venusS], "talk"), 0.5));
  addSrc("boundaries", `Saturn in ${name(saturnS)}`, SATURN_STRUCT[saturnS]);
  addSrc("boundaries", h8Label, mul(h8S ? reg(HOUSE8[h8S], "structure") : undefined, 0.5));
  addSrc("boundaries", h5Label, mul(h5S ? reg(HOUSE5[h5S], "structure") : undefined, 0.4));

  // The placement that actually produced the biggest share of each axis —
  // every % on the tab is cited to THIS placement, never a fixed planet.
  const ranked = (axis: string): [string, number][] =>
    Object.entries(axisSrc[axis]).sort((a, b) => b[1] - a[1]);
  const leadOf = (axis: string): string => ranked(axis)[0]?.[0] ?? "your chart";
  const secondOf = (axis: string): string | undefined => ranked(axis)[1]?.[0];
  const domLead = leadOf("control");
  const subLead = leadOf("submission");
  const intensityLead = leadOf("intensity");
  const intensitySecond = secondOf("intensity");
  const noveltyLead = leadOf("novelty");
  const connLead = leadOf("connection");
  const talkLead = leadOf("communication");
  const boundariesLead = leadOf("boundaries");

  // ---- role lanes ----
  const dom = control;
  const sub = submission;
  const switchPct = clamp(Math.round(Math.min(dom, sub) - 1.2 * Math.abs(dom - sub)), 0, 100);

  // ---- appetite ----
  const appetitePct = clamp(Math.round(
    0.35 * Math.max(dom, sub) + 0.3 * intensity + 0.25 * novelty + 0.1 * communication
  ), 3, 97);

  const bratRaw = clamp(Math.round(0.5 * sub + 0.35 * novelty + 0.15 * intensity), 0, 100);
  const bratTamerRaw = clamp(Math.round(0.5 * dom + 0.35 * novelty + 0.15 * intensity), 0, 100);
  const sadistRaw = clamp(Math.round(0.6 * intensity + 0.4 * dom), 0, 100);
  const masochistRaw = clamp(Math.round(0.6 * intensity + 0.4 * sub), 0, 100);
  const ropeTierRaw = clamp(Math.round(0.5 * boundaries + 0.5 * dom), 0, 100);
  const ropeBunnyRaw = clamp(Math.round(0.5 * boundaries + 0.5 * sub), 0, 100);
  const experimentalistRaw = clamp(Math.round(0.6 * novelty + 0.4 * curiosity), 0, 100);

  // ---- verdict (straight answer, computed before identity cuts) ----
  const verdict = buildVerdict({
    dom, sub, switchPct, appetitePct, bratRaw, bratTamerRaw,
    mars: name(marsS), venus: name(venusS),
    marsRetro, venusRetro,
    h8: h8S ? name(h8S) : "",
  });
  const vanillaFamily = verdict.label === "Vanilla" || verdict.label === "Vanilla-plus";

  // ---- identities ----
  const ids: KinkIdentity[] = [];
  const push = (id: string, label: string, pctValue: number, description: string, gate: boolean, minPct = 55) => {
    if (gate && pctValue >= minPct) ids.push({ id, label, pct: clamp(Math.round(pctValue), 3, 98), description, source: "chart" });
  };

  const domFromMars = domLead === `Mars in ${name(marsS)}`;
  push("dom", "Dom", dom, domFromMars ? `You take charge — ${MARS[marsS].line}` : `You take charge — ${domLead} is where the control actually comes from: deep, quiet, and total.`, true);
  push("sub", "Sub", sub, `You hand it over — ${VENUS[venusS].line}`, true);
  push("switch", "Switch", switchPct, "Either lane — top today, bottom tomorrow. Depends on the person, not the night.", true);
  push("brat_tamer", "Brat tamer", bratTamerRaw, "Talk-back is an invitation to you — you enjoy shutting it down, kindly.", dom >= 55);
  push("brat", "Brat", bratRaw, "You act up on purpose because you want someone to put you back in your place.", sub >= 50);
  push("sadist", "Sadist", sadistRaw, `Giving controlled intensity reads as connection — your chart carries real edge (${intensityLead}${intensitySecond ? ` with ${intensitySecond} behind it` : ""}).`, intensity >= 55);
  push("masochist", "Masochist", masochistRaw, "Receiving intensity — pressure, pain, being pushed — is how it starts to feel real.", intensity >= 55);
  push("rope_tier", "Rope tier", ropeTierRaw, "You like tying — rope, restraint, the craft of holding someone in place.", boundaries >= 55 && dom >= 50);
  push("rope_bunny", "Rope bunny", ropeBunnyRaw, "You want to be tied and held in place. The frame is the comfort.", boundaries >= 55 && sub >= 50);
  push("experimentalist", "Will try anything", experimentalistRaw, "Down for whatever — new kinks, new toys, new scenarios. Routine is the only enemy.", true);
  push("owner", "Owner", clamp(Math.round(0.6 * dom + 0.4 * boundaries)), "You want to own someone completely — body, time, attention.", dom >= 60 && boundaries >= 55);
  push("daddy", "Daddy/Mommy", clamp(Math.round(0.4 * dom + 0.35 * connection + 0.25 * boundaries)), "Caretaker energy with a firm hand — protective and in charge at once.", dom >= 55 && connection >= 60);
  push("hunter", "Hunter", clamp(Math.round(0.5 * dom + 0.5 * novelty)), "The chase is the fun — primal, instinctive pursuit energy.", dom >= 55 && novelty >= 60);
  push("prey", "Prey", clamp(Math.round(0.5 * sub + 0.3 * novelty + 0.2 * connection)), "You love being chased — run first, get caught on purpose.", sub >= 55 && novelty >= 55);
  push("pet", "Pet", clamp(Math.round(0.4 * sub + 0.35 * connection + 0.25 * novelty)), "Pet-play energy — collars, praise, and belonging to someone.", sub >= 55 && connection >= 60);
  push("show_off", "Show-off", clamp(Math.round(0.4 * dom + 0.35 * novelty + (houseOf("sun") === 5 ? 15 : 0) + (moonS === "leo" || marsS === "leo" ? 10 : 0))), "Being watched is half the fun — the eyes are the point.", true, 45);
  push("watcher", "Watcher", clamp(Math.round(0.5 * (100 - dom) + 0.5 * curiosity)), "You'd happily just watch — observing is its own thrill.", true, 45);
  push("open_poly", "Open / poly", clamp(Math.round(0.5 * novelty + 0.5 * (100 - connection))), "Strict monogamy doesn't fully fit — you want options, freedom, or shared play.", !vanillaFamily);
  push("vanilla", "Vanilla", clamp(Math.round(100 - appetitePct)), "Sweet, simple, romantic. No extras needed — and that's a complete answer.", appetitePct <= 55, 45);

  const ROLE_IDS = new Set(["dom", "sub", "switch"]);
  const sorted = [...ids].sort((a, b) => b.pct - a.pct);
  const roles = sorted.filter((i) => ROLE_IDS.has(i.id));
  const extras = sorted.filter((i) => !ROLE_IDS.has(i.id)).slice(0, 7 - roles.length);
  const identities = [...roles, ...extras].sort((a, b) => b.pct - a.pct);

  // ---- axes with placement-cited notes ----
  const axisInput: { key: KinkAxis; value: number }[] = [
    { key: "control", value: control },
    { key: "submission", value: submission },
    { key: "intensity", value: intensity },
    { key: "novelty", value: novelty },
    { key: "emotionalConnection", value: connection },
    { key: "communication", value: communication },
    { key: "boundaries", value: boundaries },
    { key: "curiosity", value: curiosity },
  ];
  const axisList: KinkProfile["axes"] = axisInput
    .map((a) => ({ ...a, label: AXIS_LABELS[a.key], note: axisNote(a.key, {
      control: domLead, submission: subLead, intensity: intensityLead, intensitySecond,
      novelty: noveltyLead, connection: connLead, communication: talkLead,
      boundaries: boundariesLead,
    }) }))
    .sort((x, y) => y.value - x.value);

  // ---- interpretation bullets, one point per bullet, placements cited ----
  const interpretation = buildInterpretation({
    dom, sub, appetitePct, intensity, novelty, boundaries, connection, communication,
    bratRaw, bratTamerRaw,
    domLead, subLead, intensityLead, intensitySecond, connLead, talkLead,
    pluto: name(plutoS), h5: h5S ? name(h5S) : "", saturn: name(saturnS),
  });

  // ---- may not appeal ----
  const mayNotAppeal = axisList
    .filter((x) => x.value <= 35)
    .slice(0, 3)
    .map((x) => notAppealBody(x.key));

  // ---- source card: every placement the dials and bullets actually cite ----
  const sources: string[] = [
    `Mars in ${name(marsS)}${marsRetro ? " (retrograde)" : ""}${houseOf("mars") ? ` · house ${houseOf("mars")}` : ""} — drive and desire`,
    `Venus in ${name(venusS)}${venusRetro ? " (retrograde)" : ""}${houseOf("venus") ? ` · house ${houseOf("venus")}` : ""} — attraction and love style`,
    `Pluto in ${name(plutoS)}${houseOf("pluto") ? ` · house ${houseOf("pluto")}` : ""} — intensity and power`,
    `Moon in ${name(moonS)}${houseOf("moon") ? ` · house ${houseOf("moon")}` : ""} — emotional depth and aftercare`,
    `Mercury in ${name(mercuryS)}${houseOf("mercury") ? ` · house ${houseOf("mercury")}` : ""} — how you talk about what you want`,
    `Saturn in ${name(saturnS)}${houseOf("saturn") ? ` · house ${houseOf("saturn")}` : ""} — rules and structure`,
  ];
  if (h5S) sources.push(`5th house in ${name(h5S)} — pleasure and play`);
  if (h8S) sources.push(`8th house in ${name(h8S)} — intimacy and merging`);

  const chartNote = `Read straight from your chart — no questions asked: ${sources.join("; ")}.${inH8.length ? ` ${inH8.map((x) => prettyPlanet(x.id)).join(" and ")} in your 8th house ${inH8.length === 1 ? "deepens" : "deepen"} it further.` : ""}`;

  return { verdict, identities, appetite: { pct: appetitePct, line: appetiteLine(appetitePct) }, axes: axisList, mayNotAppeal, chartNote, interpretation };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function prettyPlanet(id: PlanetId): string {
  const names: Record<string, string> = {
    sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
    jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune",
    pluto: "Pluto", north_node: "North Node", chiron: "Chiron", lilith: "Lilith",
  };
  return names[id] ?? id;
}

function axisNote(
  key: KinkAxis,
  leads: {
    control: string; submission: string; intensity: string; intensitySecond?: string;
    novelty: string; connection: string; communication: string; boundaries: string;
  },
): string {
  switch (key) {
    case "control": return `From ${leads.control} — how your drive handles the wheel.`;
    case "submission": return `From ${leads.submission} — how your love style handles being led.`;
    case "intensity": return `From ${leads.intensity}${leads.intensitySecond ? ` with ${leads.intensitySecond} behind it` : ""} — how much edge is in you.`;
    case "novelty": return `From ${leads.novelty} — how much play wants to change.`;
    case "emotionalConnection": return `From your ${leads.connection} — how much feelings belong in it.`;
    case "communication": return `From ${leads.communication} — how you talk about what you want.`;
    case "boundaries": return `From ${leads.boundaries} — how much structure relaxes you.`;
    case "curiosity": return `Blended from play and talk — how open the door is.`;
    default: return "From your chart.";
  }
}

function buildVerdict(x: {
  dom: number; sub: number; switchPct: number; appetitePct: number;
  bratRaw: number; bratTamerRaw: number;
  mars: string; venus: string; marsRetro: boolean; venusRetro: boolean; h8: string;
}): { label: string; blurb: string } {
  const powerLive = x.dom >= 55 || x.sub >= 55;
  const bothLive = x.dom >= 55 && x.sub >= 55;
  const marsDrive = `Mars in ${x.mars}${x.marsRetro ? " (quiet drive, but it's there)" : ""}`;
  const venusStyle = `Venus in ${x.venus}${x.venusRetro ? " (private, slow to open)" : ""}`;

  if (powerLive) {
    if (bothLive) {
      const lean = x.dom > x.sub + 8 ? "dom lean" : x.sub > x.dom + 8 ? "sub lean" : null;
      const label = lean ? `Switch (${lean})` : "Switch";
      let blurb = `Straight answer: you're a switch. ${marsDrive} wants the wheel and ${venusStyle} wants to hand it over — both lanes scored live, so the person decides, not the night. Don't let anyone squeeze you into one.`;
      if (x.bratRaw >= 62) blurb += " And there's brat in you — you push so someone will push back.";
      else if (x.bratTamerRaw >= 62) blurb += " And you'd enjoy taming one — talk-back just earns consequences.";
      return { label, blurb };
    }
    if (x.dom >= 55) {
      let blurb = `Straight answer: you're a dom. ${marsDrive} runs your desire built to lead — you want the wheel, and you want them happy to hand it over.`;
      if (x.h8) blurb += ` Your 8th house in ${x.h8} says the control isn't just habit — it's where the intimacy lives for you.`;
      if (x.bratTamerRaw >= 62) blurb += " You'd also enjoy a brat: the talk-back is the fun part.";
      return { label: "Dom", blurb };
    }
    let blurb = `Straight answer: you're a sub. ${venusStyle} is wired to hand control to someone who's earned it — giving it over scores way above taking the wheel, and that's where you actually relax.`;
    if (x.bratRaw >= 62) blurb += " And you're a bit of a brat — you act up because you want to be handled, not because you mean it.";
    return { label: "Sub", blurb };
  }

  if (x.switchPct >= 50 && Math.abs(x.dom - x.sub) <= 12 && x.appetitePct >= 45) {
    return {
      label: "Switch (soft)",
      blurb: `Straight answer: you're a soft switch. Neither lane scored hot and they're too close to call — ${marsDrive} can lead when it matters, ${venusStyle} can follow when it trusts. Who you're with decides which way you lean.`,
    };
  }

  if (x.appetitePct >= 55) {
    return {
      label: "Bdsm-curious",
      blurb: `Straight answer: you're not vanilla. No fixed dom or sub lane in your chart, but the bdsm side of the menu pulls — intensity and novelty are where your yes lives. ${marsDrive} and ${venusStyle} both score the adventurous side up.`,
    };
  }
  if (x.appetitePct >= 38) {
    return {
      label: "Vanilla-plus",
      blurb: `Straight answer: you're mostly vanilla, with sprinkles. ${venusStyle} keeps the base sweet and simple, and you wouldn't say no to some spice when the trust is there.`,
    };
  }
  return {
    label: "Vanilla",
    blurb: `Straight answer: you're vanilla. ${venusStyle} wants sweet, simple, and romantic — no extras needed, and that's a full answer, not a downgrade. Your chart scores the whole kinky menu low, honestly and consistently.`,
  };
}

function appetiteLine(pctValue: number): string {
  if (pctValue >= 70) return "Deep off vanilla — kink isn't a garnish for you, it's the meal.";
  if (pctValue >= 55) return "Off vanilla — you want real kink in the mix, not a hint of it.";
  if (pctValue >= 38) return "Vanilla-plus range — sweet base, open to spice.";
  return "Vanilla range — sweet and simple is a complete answer.";
}

function buildInterpretation(x: {
  dom: number; sub: number; appetitePct: number; intensity: number; novelty: number;
  boundaries: number; connection: number; communication: number;
  bratRaw: number; bratTamerRaw: number;
  domLead: string; subLead: string; intensityLead: string; intensitySecond?: string;
  connLead: string; talkLead: string;
  pluto: string; h5: string; saturn: string;
}): string[] {
  const out: string[] = [];

  // 1 — the role answer: each number cited to the placement that produced it
  if (x.dom >= 55 && x.sub >= 55) {
    out.push(`${x.domLead} drives the ${x.dom}% dom; ${x.subLead} drives the ${x.sub}% sub. Both lanes live — that's the textbook switch read, not indecision.`);
  } else if (x.dom >= 55) {
    out.push(`${x.domLead} drives the ${x.dom}% dom; ${x.subLead} carries the smaller ${x.sub}% sub. That's not close — your desire is built to take the wheel, and the verdict follows the drive.`);
  } else if (x.sub >= 55) {
    out.push(`${x.subLead} drives the ${x.sub}% sub; ${x.domLead} only carries the ${x.dom}% dom. That gap is the whole story — your love style would rather hand it over than manage it.`);
  } else {
    out.push(`Power play doesn't run your chart: ${x.domLead} drives the ${x.dom}% dom and ${x.subLead} drives the ${x.sub}% sub. You're here for the vibe, not the hierarchy — and plenty of good stuff lives outside dom/sub.`);
  }

  // 2 — bdsm appetite: the lane that actually leads comes first
  const laneLead = x.dom >= x.sub ? x.domLead : `${x.subLead} (the sub side leads)`;
  out.push(`Bdsm appetite: ${x.appetitePct}%, from ${laneLead}, Pluto in ${x.pluto}${x.h5 ? `, and your 5th house in ${x.h5}` : ""}. ${x.appetitePct >= 55
    ? `Well off vanilla — ${x.h5 ? `play is never boring with that 5th house` : "your chart wants kink in the mix, not a garnish"}.`
    : x.appetitePct >= 38
      ? "Vanilla-plus — sweet base, and you wouldn't turn down spice."
      : "Low — the sweet, simple version is genuinely your lane."}`);

  // 3 — intensity: cited to the placements that really carry it
  if (x.intensity >= 55) {
    out.push(`Intensity ${x.intensity}%: ${x.intensityLead}${x.intensitySecond ? ` with ${x.intensitySecond} behind it` : ""} carries real edge. Pressure and overwhelm-within-limits are in the menu — the sadist/masochist lane is worth an honest look.`);
  } else {
    out.push(`Intensity ${x.intensity}%: ${x.intensityLead}${x.intensitySecond ? ` and ${x.intensitySecond}` : ""} ${x.intensitySecond ? "keep" : "keeps"} the temperature kind. Rough-for-rough's-sake isn't your thing, and nobody should take that as a challenge.`);
  }

  // 4 — structure / rope (Saturn leads this axis in every chart)
  if (x.boundaries >= 55) {
    out.push(`Structure ${x.boundaries}%: Saturn in ${x.saturn} holds the rules, and clear edges relax you instead of killing the mood — rope-and-restraint territory when the trust is there. Edges mapped early are what let you play hard inside them.`);
  } else {
    out.push(`Structure ${x.boundaries}%: Saturn in ${x.saturn} doesn't crave the rulebook, and neither do you — you'd rather improvise. Fair — just keep one unambiguous stop word so the improvising stays safe.`);
  }

  // 5 — brat line, when the chart actually supports it
  if (x.bratRaw >= 60 && x.sub >= 50) {
    out.push(`There's brat in there: ${x.subLead} (${x.sub}% sub) with ${x.h5 ? `your 5th house in ${x.h5}` : `a ${x.novelty}% play score`} behind it — you'd act up on purpose just to get handled.`);
  } else if (x.bratTamerRaw >= 60 && x.dom >= 50) {
    out.push(`You've got brat-tamer wiring: ${x.domLead} (${x.dom}% dom) with ${x.h5 ? `your 5th house in ${x.h5}` : `that much play in the chart`} — someone talking back reads as an invitation, not a problem.`);
  }

  // 6 — connection & aftercare
  if (x.connection >= 55) {
    out.push(`Connection ${x.connection}%: your ${x.connLead} wants feelings IN it — aftercare and closeness aren't extras, they're half the point. The right aftercare turns a good night into a repeat event.`);
  } else {
    out.push(`Connection ${x.connection}%: your ${x.connLead} keeps it lighter — fun doesn't have to come with a feelings debrief. Just don't confuse low-need with no-need.`);
  }

  // 7 — communication
  if (x.communication >= 55) {
    out.push(`Talking about it: ${x.communication}%, from ${x.talkLead}. You'll say what you want out loud — that alone puts you ahead of most people, in or out of kink.`);
  } else {
    out.push(`Talking about it: ${x.communication}%, from ${x.talkLead}. You'd rather show than say. Fine — but one clear yes/no signal still protects the fun, so pick your words before you need them.`);
  }

  return out.slice(0, 7);
}

function notAppealBody(axis: KinkAxis): string {
  const bodies: Record<KinkAxis, string> = {
    control: "Running the show — you'd rather co-pilot or be flown. Sub energy, switch energy, or just no power pull — all complete answers.",
    submission: "Handing over the wheel — you relax when you keep authorship. No dom is going to argue you out of that.",
    intensity: "Pain and overwhelm — gentle is your lane, and 'gentle' isn't code for boring.",
    novelty: "The untried and the weird — the trusted classic, done well, wins for you.",
    emotionalConnection: "The deep-feelings layer — fun can stay fun without a meaning-of-us talk attached.",
    communication: "Long explicit negotiations — you prefer momentum over checklists (one agreed signal system is still worth thirty seconds).",
    boundaries: "Pre-negotiated architecture — you lean spontaneous; just keep one hard stop word everyone knows.",
    curiosity: "Studying the whole space — you already know what you like and see no obligation to apologize for it.",
  };
  return bodies[axis];
}
