// ===========================================================================
// CHART DIGEST — compact, factual serialization of a computed natal chart
// ---------------------------------------------------------------------------
// The ONLY source of facts handed to the language model. Everything here is
// computed locally (Swiss Ephemeris) before the model sees anything, and the
// prompts explicitly forbid using anything not in this object. That is what
// makes fabrication structurally hard instead of just discouraged.
// ===========================================================================

import type { NatalApiResponse, PlanetInfo } from "../types";
import { SIGN_META } from "../signs";
import { analyzeChartFacts } from "../personality/facts";

export interface DigestPlanet {
  id: string;
  sign: string;
  degree: string;
  house: number | null;
  retrograde?: boolean;
}

export interface DigestAspect {
  label: string;      // "Mercury square Pluto"
  nature: string;     // "hard" | "soft" | "connection"
  orb: string;        // "2.1°"
}

export interface ChartDigest {
  name?: string;
  pronouns: "she/her" | "he/him" | "they/them";
  time_known: boolean;
  planets: DigestPlanet[];
  angles: { ascendant: string | null; midheaven: string | null };
  houses_cusp_signs: Record<string, string> | null;
  aspects: DigestAspect[];
  chart_ruler: string | null;
  dominant_element: string;
  element_shares: Record<string, number>;
  secondary_element?: string;
  dominant_modality: string;
  stelliums: string[];
  angular_planets: string[];
  strongest_houses: string[];
}

function fmtDeg(pos: number): string {
  const d = Math.floor(pos);
  const m = Math.round((pos - d) * 60);
  const mm = m === 60 ? 0 : m;
  const dd = m === 60 ? d + 1 : d;
  return `${dd}°${String(mm).padStart(2, "0")}′`;
}

const PLANET_ORDER: PlanetInfo["id"][] = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
  "north_node", "chiron", "lilith",
];

export function buildChartDigest(
  natal: NatalApiResponse,
  opts?: { name?: string; gender?: "male" | "female" | null }
): ChartDigest {
  const facts = analyzeChartFacts(natal);
  const byId = new Map(natal.planets.map((p) => [p.id, p]));

  const planets: DigestPlanet[] = [];
  for (const id of PLANET_ORDER) {
    const p = byId.get(id);
    if (!p) continue;
    planets.push({
      id,
      sign: p.sign,
      degree: fmtDeg(p.pos),
      house: natal.subject?.settings?.time_known ? p.house : null,
      ...(p.retrograde ? { retrograde: true } : {}),
    });
  }

  const ascHouse = natal.houses.find((h) => h.house === 1);
  const mcHouse = natal.houses.find((h) => h.house === 10);
  const timeKnown = Boolean(natal.subject?.settings?.time_known);

  const housesCuspSigns: Record<string, string> | null = timeKnown
    ? Object.fromEntries(
        natal.houses.map((h) => [`house_${h.house}`, h.sign])
      )
    : null;

  const aspects: DigestAspect[] = facts.aspects
    .slice()
    .sort((a, b) => b.strength * b.weight - a.strength * a.weight)
    .slice(0, 14)
    .map((a) => ({
      label: a.label,
      nature: a.polarity === "conj" ? "connection" : a.polarity,
      orb: `${(a.strength * (a.type === "sextile" ? 5 : 8)).toFixed(1)}°`,
    }));

  const HOUSE_DOMAINS_HINT: Record<number, string> = {
    1: "identity/appearance", 2: "money/self-worth", 3: "communication/siblings",
    4: "home/family/roots", 5: "creativity/romance/play", 6: "work/routines/health",
    7: "partnership", 8: "intimacy/shared resources/deep bonding",
    9: "beliefs/travel/big picture", 10: "career/public life/reputation",
    11: "friends/groups/future", 12: "private inner world/the hidden",
  };

  return {
    name: opts?.name || undefined,
    pronouns:
      opts?.gender === "female" ? "she/her"
      : opts?.gender === "male" ? "he/him"
      : "they/them",
    time_known: timeKnown,
    planets,
    angles: timeKnown
      ? {
          ascendant: ascHouse ? `${ascHouse.sign} ${fmtDeg(ascHouse.pos)}` : null,
          midheaven: mcHouse ? `${mcHouse.sign} ${fmtDeg(mcHouse.pos)}` : null,
        }
      : { ascendant: null, midheaven: null },
    houses_cusp_signs: housesCuspSigns,
    aspects,
    chart_ruler: facts.chartRuler
      ? `${facts.chartRuler.planet} in ${SIGN_META[facts.chartRuler.sign].name}, house ${facts.chartRuler.house}`
      : null,
    dominant_element: facts.dominantElement,
    element_shares: Object.fromEntries(
      Object.entries(facts.elementShare).map(([k, v]) => [k, Math.round(v)])
    ) as Record<string, number>,
    secondary_element: facts.secondaryElement,
    dominant_modality: facts.dominantModality,
    stelliums: facts.stelliums.slice(0, 3).map((s) =>
      s.kind === "sign"
        ? `${s.planets.join(", ")} clustered in ${SIGN_META[s.target as keyof typeof SIGN_META].name}`
        : `${s.planets.join(", ")} clustered in house ${s.target}`
    ),
    angular_planets: facts.angularPlanets
      .slice(0, 4)
      .map((a) => `${a.planet} conjunct ${a.angle}`),
    strongest_houses: timeKnown
      ? facts.topHouses.slice(0, 4).map((h) => `house ${h.house} (${HOUSE_DOMAINS_HINT[h.house] ?? ""})`)
      : [],
  };
}
