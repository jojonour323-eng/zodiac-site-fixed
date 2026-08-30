// ===========================================================================
// CHART FACTS — chart-wide pattern analysis
// ---------------------------------------------------------------------------
// Reads the whole natal chart and extracts weighted, structural facts:
// dominant elements/modalities (weighted by planet prominence, NOT flat
// counts), chart ruler, stelliums, hemisphere emphasis, angular planets,
// strongest aspects, and house emphasis. Every downstream consumer builds
// on this. Nothing here changes chart math — it only interprets it.
// ===========================================================================

import type { NatalApiResponse, PlanetSummary, PlanetInfo, SignId, Element, Modality } from "../types";
import { SIGN_META } from "../signs";
import { PLANET_WEIGHT, SIGN_RULER, ANGULAR_HOUSES, DEEP_HOUSES } from "./signPsych";

export interface ScoredAspect {
  a: string;
  b: string;
  type: "conjunction" | "opposition" | "trine" | "square" | "sextile";
  /** 0–1, tighter orb = stronger. */
  strength: number;
  polarity: "hard" | "soft" | "conj";
  /** Combined prominence weight of the two planets. */
  weight: number;
  label: string; // "Moon square Saturn"
}

export interface Stellium {
  kind: "sign" | "house";
  target: SignId | number;
  planets: string[];
  weight: number;
}

export interface ChartFacts {
  timeKnown: boolean;
  /** Weighted 0–100 share of each element. */
  elementShare: Record<Element, number>;
  modalityShare: Record<Modality, number>;
  dominantElement: Element;
  dominantModality: Modality;
  secondaryElement?: Element;
  /** Ruling planet of the Ascendant + where it sits. */
  chartRuler: { planet: string; sign: SignId; house: number } | null;
  stelliums: Stellium[];
  /** Weight per house 1–12 (personal planets weigh more). */
  houseWeight: Record<number, number>;
  topHouses: { house: number; weight: number }[];
  hemisphere: { east: number; west: number; north: number; south: number };
  /** Planets conjunct the angles (ASC/MC/IC/DC), strongest first. */
  angularPlanets: { planet: string; angle: "ASC" | "MC" | "IC" | "DC"; strength: number }[];
  aspects: ScoredAspect[];
  /** Single most prominent planet after luminaries (chart-ruler/angular/aspect load). */
  dominantPlanet: string | null;
  retrogrades: string[];
  /** Weighted water-house (4/8/12) vs fire-house activity etc. */
  deepHouseLoad: number;
  relationalHouseLoad: number;
  /** Sun/Moon/Rising signs for convenience. */
  sun: SignId;
  moon: SignId;
  rising: SignId;
  moonSign: SignId;
  venus?: SignId;
  mars?: SignId;
  mercury?: SignId;
  saturn?: SignId;
  jupiter?: SignId;
  neptune?: SignId;
  pluto?: SignId;
  uranus?: SignId;
  northNode?: SignId;
  chiron?: SignId;
  lilith?: SignId;
  /** degree positions */
  sunDeg: number;
  moonDeg: number;
  planets: PlanetInfo[];
  /** Seed for prose variation. */
  seed: string;
}

const MAJOR_ASPECT_ANGLES: { type: ScoredAspect["type"]; angle: number; orb: number }[] = [
  { type: "conjunction", angle: 0, orb: 8 },
  { type: "sextile", angle: 60, orb: 5 },
  { type: "square", angle: 90, orb: 7 },
  { type: "trine", angle: 120, orb: 7 },
  { type: "opposition", angle: 180, orb: 8 },
];

const norm360 = (d: number) => ((d % 360) + 360) % 360;

export function analyzeChartFacts(natal: NatalApiResponse): ChartFacts {
  const planets = natal.planets;
  const byId = new Map(planets.map((p) => [p.id, p]));
  const timeKnown = Boolean(natal.subject?.settings?.time_known);
  const firstHouse = natal.houses?.find((h) => h.house === 1);
  const ascAbs = natal.angles?.asc ?? firstHouse?.abs_pos;
  const ascSign: SignId = firstHouse?.sign_id
    ?? (ascAbs != null ? signFromDeg(ascAbs) : byId.get("sun")!.sign_id);

  // ---- weighted element / modality shares ----
  const elementRaw = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityRaw = { cardinal: 0, fixed: 0, mutable: 0 };
  const addSign = (sid: SignId | undefined, w: number) => {
    if (!sid || !w) return;
    const m = SIGN_META[sid];
    elementRaw[m.element] += w;
    modalityRaw[m.modality] += w;
  };
  for (const p of planets) {
    addSign(p.sign_id, PLANET_WEIGHT[p.id] ?? 0.5);
  }
  // Angles add flavor when time is known
  if (timeKnown && ascAbs != null) addSign(ascSign, 2.4);
  const mcAbs = natal.angles?.mc;
  if (timeKnown && mcAbs != null) addSign(signFromDeg(mcAbs), 1.2);
  // House cusp signs whisper, not shout
  if (timeKnown) {
    for (const h of natal.houses ?? []) addSign(h.sign_id, 0.25);
  }

  const total = Object.values(elementRaw).reduce((a, b) => a + b, 0) || 1;
  const elementShare = Object.fromEntries(
    Object.entries(elementRaw).map(([k, v]) => [k, Math.round((v / total) * 100)])
  ) as Record<Element, number>;
  const modalityShare = Object.fromEntries(
    Object.entries(modalityRaw).map(([k, v]) => [k, Math.round((v / total) * 100)])
  ) as Record<Modality, number>;

  const sortedElements = Object.entries(elementShare).sort((a, b) => b[1] - a[1]);
  const dominantElement = sortedElements[0][0] as Element;
  const secondaryElement = sortedElements[1][1] >= 28 ? (sortedElements[1][0] as Element) : undefined;
  const dominantModality = Object.entries(modalityShare).sort((a, b) => b[1] - a[1])[0][0] as Modality;

  // ---- chart ruler ----
  const rulerPlanet = SIGN_RULER[ascSign];
  const ruler = byId.get(rulerPlanet as PlanetInfo["id"]);
  const chartRuler = timeKnown && ruler
    ? { planet: rulerPlanet, sign: ruler.sign_id, house: ruler.house }
    : null;

  // ---- stelliums (3+ planets per sign / per house) ----
  const stelliums: Stellium[] = [];
  const bySign = new Map<SignId, PlanetInfo[]>();
  const byHouse = new Map<number, PlanetInfo[]>();
  for (const p of planets) {
    (bySign.get(p.sign_id) ?? bySign.set(p.sign_id, []).get(p.sign_id)!).push(p);
    if (timeKnown) {
      (byHouse.get(p.house) ?? byHouse.set(p.house, []).get(p.house)!).push(p);
    }
  }
  for (const [sid, ps] of bySign) {
    if (ps.length >= 3) {
      stelliums.push({
        kind: "sign",
        target: sid,
        planets: ps.map((p) => p.id),
        weight: ps.reduce((a, p) => a + (PLANET_WEIGHT[p.id] ?? 0.5), 0),
      });
    }
  }
  for (const [h, ps] of byHouse) {
    if (ps.length >= 3) {
      stelliums.push({
        kind: "house",
        target: h,
        planets: ps.map((p) => p.id),
        weight: ps.reduce((a, p) => a + (PLANET_WEIGHT[p.id] ?? 0.5), 0),
      });
    }
  }
  stelliums.sort((a, b) => b.weight - a.weight);

  // ---- house weights ----
  const houseWeight: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) houseWeight[i] = 0;
  if (timeKnown) {
    for (const p of planets) {
      houseWeight[p.house] += PLANET_WEIGHT[p.id] ?? 0.5;
    }
    // angles count as house occupancy
    if (ascAbs != null && firstHouse) houseWeight[1] += 1.2;
  }
  const topHouses = Object.entries(houseWeight)
    .map(([h, w]) => ({ house: Number(h), weight: w }))
    .sort((a, b) => b.weight - a.weight);

  // ---- hemisphere emphasis (requires time) ----
  const hemisphere = { east: 0, west: 0, north: 0, south: 0 };
  if (timeKnown) {
    for (const p of planets) {
      const w = PLANET_WEIGHT[p.id] ?? 0.5;
      // Houses 1-6 are below the horizon (northern/private), 7-12 above (southern/public).
      // Houses 12-10-8... east/west: houses 1,2,3,10,11,12 = eastern (self); 4,5,6,7,8,9 = western (others).
      if ([1, 2, 3, 10, 11, 12].includes(p.house)) hemisphere.east += w;
      else hemisphere.west += w;
      if (p.house <= 6) hemisphere.north += w;
      else hemisphere.south += w;
    }
  }

  // ---- angular planets (conjunct ASC/MC within 8°, DC/IC implied) ----
  const angularPlanets: ChartFacts["angularPlanets"] = [];
  if (timeKnown && natal.angles) {
    const angles: { id: "ASC" | "MC" | "IC" | "DC"; deg: number }[] = [
      { id: "ASC", deg: natal.angles.asc },
      { id: "MC", deg: natal.angles.mc },
      { id: "IC", deg: natal.angles.ic },
      { id: "DC", deg: natal.angles.dc },
    ];
    for (const p of planets) {
      for (const a of angles) {
        if (a.deg == null) continue;
        let diff = Math.abs(norm360(p.abs_pos) - norm360(a.deg));
        if (diff > 180) diff = 360 - diff;
        if (diff <= 8) {
          angularPlanets.push({
            planet: p.id,
            angle: a.id,
            strength: 1 - diff / 8,
          });
        }
      }
    }
    angularPlanets.sort((x, y) => y.strength - x.strength);
  }

  // ---- scored natal aspects ----
  const aspects: ScoredAspect[] = [];
  const core = planets.filter((p) => p.id !== "north_node" && p.id !== "chiron" && p.id !== "lilith");
  for (let i = 0; i < core.length; i++) {
    for (let j = i + 1; j < core.length; j++) {
      const a = core[i];
      const b = core[j];
      let diff = Math.abs(norm360(a.abs_pos) - norm360(b.abs_pos));
      if (diff > 180) diff = 360 - diff;
      for (const def of MAJOR_ASPECT_ANGLES) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          const strength = Math.max(0, Math.min(1, 1 - orb / def.orb));
          const weight = (PLANET_WEIGHT[a.id] ?? 0.5) + (PLANET_WEIGHT[b.id] ?? 0.5);
          aspects.push({
            a: a.id,
            b: b.id,
            type: def.type,
            strength,
            polarity: def.type === "square" || def.type === "opposition" ? "hard" : def.type === "conjunction" ? "conj" : "soft",
            weight: weight * (0.5 + strength * 0.5),
            label: `${a.name} ${def.type} ${b.name}`,
          });
          break;
        }
      }
    }
  }
  aspects.sort((x, y) => y.weight * y.strength - x.weight * x.strength);

  // ---- dominant planet (non-luminary) ----
  let dominantPlanet: string | null = null;
  let bestScore = 0;
  for (const p of planets) {
    if (p.id === "sun" || p.id === "moon" || p.id === "north_node" || p.id === "chiron" || p.id === "lilith") continue;
    let score = PLANET_WEIGHT[p.id] ?? 0.5;
    if (chartRuler?.planet === p.id) score += 2.5;
    score += angularPlanets.filter((ap) => ap.planet === p.id).reduce((acc, ap) => acc + ap.strength * 2, 0);
    score += aspects.filter((as) => as.a === p.id || as.b === p.id).reduce((acc, as) => acc + as.strength, 0);
    if (score > bestScore) {
      bestScore = score;
      dominantPlanet = p.id;
    }
  }

  const deepHouseLoad = DEEP_HOUSES.reduce((acc, h) => acc + houseWeight[h], 0);
  const relationalHouseLoad = [5, 7, 8].reduce((acc, h) => acc + houseWeight[h], 0);

  const get = (id: string) => byId.get(id as PlanetInfo["id"])?.sign_id;
  const sunP = byId.get("sun")!;
  const moonP = byId.get("moon")!;

  return {
    timeKnown,
    elementShare,
    modalityShare,
    dominantElement,
    secondaryElement,
    dominantModality,
    chartRuler,
    stelliums,
    houseWeight,
    topHouses,
    hemisphere,
    angularPlanets,
    aspects,
    dominantPlanet,
    retrogrades: planets.filter((p) => p.retrograde).map((p) => p.id),
    deepHouseLoad,
    relationalHouseLoad,
    sun: sunP.sign_id,
    moon: moonP.sign_id,
    rising: ascSign,
    moonSign: moonP.sign_id,
    venus: get("venus"),
    mars: get("mars"),
    mercury: get("mercury"),
    saturn: get("saturn"),
    jupiter: get("jupiter"),
    neptune: get("neptune"),
    pluto: get("pluto"),
    uranus: get("uranus"),
    northNode: get("north_node"),
    chiron: get("chiron"),
    lilith: get("lilith"),
    sunDeg: sunP.pos,
    moonDeg: moonP.pos,
    planets,
    seed: `${natal.subject.datetime}|${natal.subject.location.lat.toFixed(2)}|${Math.round(sunP.abs_pos * 100)}`,
  };
}

function signFromDeg(deg: number): SignId {
  const idx = Math.floor(norm360(deg) / 30);
  return ([
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
  ] as SignId[])[idx];
}

// Convenience exports for consumers
export const isAngular = (house: number) => ANGULAR_HOUSES.includes(house);
