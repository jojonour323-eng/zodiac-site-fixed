import "server-only";
import type {
  BirthRequest,
  NatalApiResponse,
  SynastryApiResponse,
  SignId,
} from "./types";
import { SIGN_BY_ABBR, signIdFromAbsPos } from "./signs";

// ---- Swiss Ephemeris setup ----
import swisseph from "swisseph";
import path from "path";
import fs from "fs";

// Resolve the ephemeris data path. We try multiple strategies because
// Turbopack's `serverExternalPackages` can mangle `require.resolve()` paths.
function resolveEphePath(): string {
  // Strategy 1: require.resolve (works in plain Node, may fail in Turbopack)
  try {
    const pkgPath = require.resolve("swisseph/package.json");
    if (fs.existsSync(pkgPath)) {
      const p = path.join(path.dirname(pkgPath), "ephe");
      if (fs.existsSync(p)) return p;
    }
  } catch {}

  // Strategy 2: walk up from this file to find node_modules/swisseph
  // This file is at src/lib/astro/local.ts, so node_modules is 4 levels up.
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, "node_modules", "swisseph", "ephe");
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }

  // Strategy 3: process.cwd() + node_modules
  const cwdCandidate = path.join(process.cwd(), "node_modules", "swisseph", "ephe");
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;

  throw new Error("Could not locate Swiss Ephemeris data files (ephe directory).");
}

const EPHE_PATH = resolveEphePath();
let _epheInitialized = false;
function ensureEphe() {
  // Always call swe_set_ephe_path — it's cheap, and the native addon's
  // state can be lost when Turbopack hot-reloads the JS module.
  swisseph.swe_set_ephe_path(EPHE_PATH);
  if (!_epheInitialized) {
    swisseph.swe_set_tid_acc(0.0);
    _epheInitialized = true;
  }
}
// Initialize on module load.
ensureEphe();

// Swiss Ephemeris flag constants (hardcoded for the same reason as the
// body IDs above — to avoid module-load-order issues with the native addon).
const SEFLG_SWIEPH = 2;    // Use Swiss Ephemeris data files (most accurate)
const SEFLG_MOSEPH = 4;    // Use Moshier ephemeris (fallback, no files needed)
const SEFLG_SPEED = 256;   // Compute speed (for retrograde detection)
const SE_GREG_CAL = 1;     // Gregorian calendar

// ---- Geocoding (city name → lat/lng) ----
// We use the `all-the-cities` database (138k cities worldwide, offline).
// For each query we parse "City, Country" and match by name + country code.
import cities from "all-the-cities";

// Country name → ISO-2 code map, so the user can type "France" instead of "FR".
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "usa": "US", "united states": "US", "united states of america": "US",
  "uk": "GB", "united kingdom": "GB", "britain": "GB", "england": "GB",
  "france": "FR", "germany": "DE", "italy": "IT", "spain": "ES",
  "japan": "JP", "china": "CN", "india": "IN", "russia": "RU",
  "canada": "CA", "australia": "AU", "brazil": "BR", "mexico": "MX",
  "argentina": "AR", "switzerland": "CH", "netherlands": "NL",
  "belgium": "BE", "sweden": "SE", "norway": "NO", "denmark": "DK",
  "finland": "FI", "poland": "PL", "ireland": "IE", "portugal": "PT",
  "greece": "GR", "turkey": "TR", "egypt": "EG", "south africa": "ZA",
  "south korea": "KR", "korea": "KR", "thailand": "TH", "indonesia": "ID",
  "philippines": "PH", "malaysia": "MY", "singapore": "SG", "new zealand": "NZ",
  "austria": "AT", "czech republic": "CZ", "czechia": "CZ",
  "hungary": "HU", "romania": "RO", "ukraine": "UA",
  "israel": "IL", "iran": "IR", "iraq": "IQ", "saudi arabia": "SA",
  "uae": "AE", "united arab emirates": "AE",
};

export interface GeoLocation {
  city: string;
  lat: number;
  lng: number;
  countryCode?: string;
}

// Parse a "City, Country" query and return the best match.
// Handles "New York, USA", "Paris, France", "London, UK", "Tokyo, Japan", etc.
// Falls back to the Nominatim (OpenStreetMap) geocoding API for cities not
// in the local database (small towns, villages, etc.).
export async function geocode(query: string): Promise<GeoLocation | null> {
  const q = query.trim();
  if (!q) return null;

  // Split on comma: "City, Country" or "City, State, Country"
  const parts = q.split(",").map((p) => p.trim());
  const cityName = parts[0];
  const countryPart = parts[parts.length - 1].toLowerCase();

  // Resolve country code (if the user typed a country name)
  const countryCode = COUNTRY_NAME_TO_CODE[countryPart] || countryPart.toUpperCase();

  // Search the cities database. Match by name (case-insensitive). If we
  // have a country code, filter by it. Sort by population (biggest city
  // first) so "Paris, France" returns Paris the capital, not a tiny Paris
  // elsewhere.
  const matches = cities.filter((c) => {
    if (c.name.toLowerCase() !== cityName.toLowerCase()) return false;
    if (parts.length > 1) {
      // If country code is 2 letters, match it. Otherwise, accept any
      // country (the user might have typed a state/region instead).
      if (countryCode.length === 2 && c.country !== countryCode) return false;
    }
    return true;
  });

  if (matches.length > 0) {
    matches.sort((a, b) => (b.population || 0) - (a.population || 0));
    const best = matches[0];
    return {
      city: best.name,
      lat: best.loc.coordinates[1],
      lng: best.loc.coordinates[0],
      countryCode: best.country,
    };
  }

  // Fallback: try a "contains" match for cities with suffixes
  // (e.g., "New York" → "New York City").
  const contains = cities.filter((c) => {
    if (!c.name.toLowerCase().includes(cityName.toLowerCase())) return false;
    if (parts.length > 1 && countryCode.length === 2 && c.country !== countryCode) return false;
    return true;
  });
  if (contains.length > 0) {
    contains.sort((a, b) => (b.population || 0) - (a.population || 0));
    const best = contains[0];
    return {
      city: best.name,
      lat: best.loc.coordinates[1],
      lng: best.loc.coordinates[0],
      countryCode: best.country,
    };
  }

  // Final fallback: Nominatim (OpenStreetMap) geocoding API.
  // This handles small towns and villages not in the local database.
  // Free, no API key, rate-limited to 1 req/s (which is fine for our use).
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Celestial/1.0 (zodiac chart app)",
        "Accept-Language": "en",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      address?: { city?: string; town?: string; village?: string; country_code?: string };
    }>;
    if (!data || data.length === 0) return null;
    const hit = data[0];
    const name =
      hit.address?.city ||
      hit.address?.town ||
      hit.address?.village ||
      cityName;
    return {
      city: name,
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      countryCode: hit.address?.country_code?.toUpperCase(),
    };
  } catch {
    return null;
  }
}

// ---- Timezone resolution (lat/lng → IANA timezone) ----
import { find as findTz } from "geo-tz";
import { DateTime } from "luxon";

// Convert a local birth date/time at a given lat/lng to UTC.
// Uses the IANA timezone database (via geo-tz + luxon) so historical
// DST and timezone rules are applied correctly for the exact birth date.
//
// For dates before standardized time zones (roughly pre-1900 in most places),
// the IANA tz database returns LMT (Local Mean Time) based on the city's
// longitude. However, the LMT in the IANA DB is computed for a specific
// reference point (often the capital or largest city of the zone), not the
// exact birth city. For maximum accuracy with historical charts, we detect
// the LMT case and compute the exact LMT offset from the birth city's
// longitude instead.
export function localToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  lat: number,
  lng: number
): { utc: DateTime; timezone: string } {
  const tzArr = findTz(lat, lng);
  const timezone = (tzArr && tzArr[0]) || "UTC";

  // Build a Luxon DateTime in the local timezone.
  const local = DateTime.fromObject(
    { year, month, day, hour, minute, second: 0 },
    { zone: timezone }
  );

  if (!local.isValid) {
    throw new Error(
      `Invalid date/time: ${year}-${month}-${day} ${hour}:${minute} in timezone ${timezone}`
    );
  }

  // Check if the offset is LMT (Local Mean Time). Luxon reports the zone
  // name as "LMT" when the IANA DB has no standardized zone for that date.
  // In this case, compute the exact LMT from the city's longitude for
  // better accuracy.
  const offsetMinutes = local.offset;
  const zoneName = local.zoneName;
  const isLmt = zoneName === "Local" || (year < 1900 && Math.abs(offsetMinutes) % 60 !== 0 && Math.abs(offsetMinutes) % 15 !== 0);

  if (isLmt) {
    // LMT offset = longitude × 4 minutes (east = positive)
    const lmtOffsetMinutes = lng * 4;
    const sign = lmtOffsetMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(lmtOffsetMinutes);
    const h = Math.floor(absMinutes / 60);
    const m = Math.floor(absMinutes % 60);
    const lmtZone = `UTC${sign}${h}:${String(m).padStart(2, "0")}`;
    const lmtLocal = DateTime.fromObject(
      { year, month, day, hour, minute, second: 0 },
      { zone: lmtZone }
    );
    if (lmtLocal.isValid) {
      return { utc: lmtLocal.toUTC(), timezone: `LMT (${lmtZone})` };
    }
  }

  return { utc: local.toUTC(), timezone };
}

// ---- Planet position calculation ----

// Swiss Ephemeris body IDs (hardcoded to avoid any module-load-order issues
// with the native addon). These are stable constants from the Swiss Ephemeris
// C API and never change.
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MERCURY = 2;
const SE_VENUS = 3;
const SE_MARS = 4;
const SE_JUPITER = 5;
const SE_SATURN = 6;
const SE_URANUS = 7;
const SE_NEPTUNE = 8;
const SE_PLUTO = 9;
const SE_TRUE_NODE = 11;
const SE_CHIRON = 15;
const SE_MEAN_APOG = 12; // Black Moon Lilith (mean apogee)

const PLANET_DEFS: { id: string; name: string; seId: number }[] = [
  { id: "sun", name: "Sun", seId: SE_SUN },
  { id: "moon", name: "Moon", seId: SE_MOON },
  { id: "mercury", name: "Mercury", seId: SE_MERCURY },
  { id: "venus", name: "Venus", seId: SE_VENUS },
  { id: "mars", name: "Mars", seId: SE_MARS },
  { id: "jupiter", name: "Jupiter", seId: SE_JUPITER },
  { id: "saturn", name: "Saturn", seId: SE_SATURN },
  { id: "uranus", name: "Uranus", seId: SE_URANUS },
  { id: "neptune", name: "Neptune", seId: SE_NEPTUNE },
  { id: "pluto", name: "Pluto", seId: SE_PLUTO },
  { id: "north_node", name: "North Node", seId: SE_TRUE_NODE },
  { id: "chiron", name: "Chiron", seId: SE_CHIRON },
  { id: "lilith", name: "Lilith", seId: SE_MEAN_APOG },
];

// 3-letter sign abbreviations (what the old API returned)
const SIGN_ABBRS = [
  "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
  "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
];

function signAbbr(absPos: number): string {
  const idx = Math.floor(((absPos % 360) + 360) % 360 / 30);
  return SIGN_ABBRS[idx];
}

function signId(absPos: number): SignId {
  return signIdFromAbsPos(absPos);
}

function posInSign(absPos: number): number {
  return ((absPos % 360) + 360) % 360 % 30;
}

// Compute a single planet's position at a given Julian Day (UT).
function computePlanet(jd: number, def: { id: string; name: string; seId: number }) {
  ensureEphe(); // re-set ephe path in case of module reload
  const flags = SEFLG_SWIEPH | SEFLG_SPEED;
  let result: any;
  // swe_calc_ut can return either a direct object or {rc, ...} depending
  // on the swisseph binding version. Handle both.
  try {
    result = swisseph.swe_calc_ut(jd, def.seId, flags);
  } catch (e) {
    // Some bindings throw on error; others return {rc: <error>}.
    throw new Error(`Failed to compute ${def.name}: ${e instanceof Error ? e.message : String(e)}`);
  }
  // Check for NaN (the binding returns NaN when it can't find ephemeris data,
  // rather than null or an error code). Also check for null/undefined.
  if (
    !result ||
    result.longitude == null ||
    (typeof result.longitude === "number" && isNaN(result.longitude))
  ) {
    // Try Moshier ephemeris as fallback (no data files needed).
    try {
      result = swisseph.swe_calc_ut(jd, def.seId, SEFLG_MOSEPH | SEFLG_SPEED);
    } catch (e) {
      // give up
    }
  }
  if (
    !result ||
    result.longitude == null ||
    (typeof result.longitude === "number" && isNaN(result.longitude))
  ) {
    throw new Error(`Failed to compute ${def.name} (no ephemeris data for this date)`);
  }
  const retrograde = result.longitudeSpeed < 0;
  return {
    id: def.id,
    name: def.name,
    sign: signAbbr(result.longitude),
    sign_id: signId(result.longitude),
    pos: posInSign(result.longitude),
    abs_pos: result.longitude,
    retrograde,
    declination_deg: result.declination || 0,
  };
}

// ---- House calculation ----

function computeHouses(
  jd: number,
  lat: number,
  lng: number
): { houses: number[]; ascendant: number; mc: number; armc: number; vertex: number; houseSystem: string } {
  // Try Placidus first ('P' = Placidus). For extreme latitudes (> ~66°)
  // Placidus can fail — in that case fall back to Whole Sign ('W').
  let result = swisseph.swe_houses(jd, lat, lng, "P");
  if (!result || !result.house || result.house.some((h: number) => isNaN(h))) {
    result = swisseph.swe_houses(jd, lat, lng, "W");
    return {
      houses: result.house,
      ascendant: result.ascendant,
      mc: result.mc,
      armc: result.armc,
      vertex: result.vertex,
      houseSystem: "Whole Sign (Placidus not available at this latitude)",
    };
  }
  return {
    houses: result.house,
    ascendant: result.ascendant,
    mc: result.mc,
    armc: result.armc,
    vertex: result.vertex,
    houseSystem: "Placidus",
  };
}

// Assign each planet to a house (1-12) based on which house cusp it falls
// after. Houses are numbered 1-12; house[0] is the 1st house cusp, etc.
function planetHouse(absPos: number, cusps: number[]): number {
  const pos = ((absPos % 360) + 360) % 360;
  // cusps[0] = 1st house cusp, cusps[1] = 2nd house cusp, ..., cusps[11] = 12th house cusp
  // A planet is in house N if its position is >= cusps[N-1] and < cusps[N].
  // Houses wrap around 0°, so we need to handle that.
  for (let i = 11; i >= 0; i--) {
    const cusp = ((cusps[i] % 360) + 360) % 360;
    if (pos >= cusp || cusp > pos + 180) {
      // Check if the planet is between this cusp and the next
      const nextCusp = ((cusps[(i + 1) % 12] % 360) + 360) % 360;
      if (cusp <= nextCusp) {
        if (pos >= cusp && pos < nextCusp) return i + 1;
      } else {
        // Wrap-around house (cusp > nextCusp, meaning it crosses 0°)
        if (pos >= cusp || pos < nextCusp) return i + 1;
      }
    }
  }
  // Fallback: find the house whose cusp is the largest one <= pos
  for (let i = 11; i >= 0; i--) {
    const cusp = ((cusps[i] % 360) + 360) % 360;
    if (cusp <= pos) return i + 1;
  }
  return 1;
}

// ---- Aspect calculation ----

// Major + minor aspects. The `orb` is the max allowed deviation (degrees).
const ASPECT_DEFS: { name: string; angle: number; orb: number }[] = [
  { name: "Conjunction", angle: 0, orb: 8 },
  { name: "Opposition", angle: 180, orb: 8 },
  { name: "Trine", angle: 120, orb: 7 },
  { name: "Square", angle: 90, orb: 7 },
  { name: "Sextile", angle: 60, orb: 6 },
  { name: "Quincunx", angle: 150, orb: 4 },
  { name: "Semisextile", angle: 30, orb: 3 },
  { name: "Semisquare", angle: 45, orb: 3 },
  { name: "Sesquisquare", angle: 135, orb: 3 },
];

// Determine polarity (harmonious/tense/neutral) from the aspect type.
function aspectPolarity(aspectName: string): "harmonious" | "tense" | "neutral" {
  const lower = aspectName.toLowerCase();
  if (["trine", "sextile", "semisextile"].includes(lower)) return "harmonious";
  if (["opposition", "square", "semisquare", "sesquisquare", "quincunx"].includes(lower)) return "tense";
  return "neutral"; // conjunction
}

// Compute the strength (0-1) from the orb. Tighter orb = stronger.
function aspectStrength(orb: number, maxOrb: number): number {
  const ratio = 1 - orb / maxOrb;
  return Math.max(0, Math.min(1, ratio));
}

function strengthLabel(strength: number): string {
  if (strength >= 0.9) return "very_strong";
  if (strength >= 0.7) return "strong";
  if (strength >= 0.5) return "moderate";
  if (strength >= 0.3) return "weak";
  return "very_weak";
}

// Compute aspects between two sets of planet positions.
// `aPlanets` and `bPlanets` are arrays of { id, name, abs_pos }.
function computeAspects(
  aPlanets: { id: string; name: string; abs_pos: number }[],
  bPlanets: { id: string; name: string; abs_pos: number }[],
  includeMinor: boolean
): SynastryApiResponse["synastry"]["aspects"] {
  const aspects: SynastryApiResponse["synastry"]["aspects"] = [];
  const aspectSet = includeMinor
    ? ASPECT_DEFS
    : ASPECT_DEFS.filter((a) => ["Conjunction", "Opposition", "Trine", "Square", "Sextile"].includes(a.name));

  for (const a of aPlanets) {
    for (const b of bPlanets) {
      const aPos = ((a.abs_pos % 360) + 360) % 360;
      const bPos = ((b.abs_pos % 360) + 360) % 360;
      let diff = Math.abs(aPos - bPos);
      if (diff > 180) diff = 360 - diff;

      for (const def of aspectSet) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          const strength = aspectStrength(orb, def.orb);
          const polarity = aspectPolarity(def.name);
          // For synastry, use the aspect angle to determine separation
          const separation = diff;
          aspects.push({
            id: `aspect_${a.id}_${def.name}_${b.id}`.toLowerCase(),
            kind: "planet_aspect",
            a_point: a.id,
            b_point: b.id,
            pair_key: `${a.id}|${b.id}`,
            canonical_key: `${a.id}|${b.id}|${def.name.toLowerCase()}`,
            aspect: def.name,
            aspect_angle_deg: def.angle,
            separation_deg: separation,
            delta_deg: separation - def.angle,
            orb_deg: orb,
            applying: false,
            strength,
            strength_label: strengthLabel(strength),
            polarity,
            polarity_confidence: 0.9,
            categories: [],
            domains: [],
            themes: aspectThemes(a.id, b.id, def.name),
            is_angle_contact: false,
          });
          break; // Only one aspect per pair
        }
      }
    }
  }

  return aspects.sort((a, b) => b.strength - a.strength);
}

// Map planet-pair + aspect to theme keywords (used by the UI for display).
function aspectThemes(aId: string, bId: string, aspect: string): string[] {
  const themes: string[] = [];
  const lower = aspect.toLowerCase();
  if (lower === "trine" || lower === "sextile") themes.push("harmony");
  if (lower === "square" || lower === "opposition") themes.push("friction");
  if (lower === "conjunction") themes.push("intensity");
  if (themes.length === 0) themes.push("connection");

  // Add domain themes based on the planets involved
  const all = [aId, bId];
  if (all.includes("venus") || all.includes("mars")) themes.push("romance");
  if (all.includes("mercury")) themes.push("communication");
  if (all.includes("moon")) themes.push("emotion");
  if (all.includes("sun")) themes.push("identity");
  if (all.includes("saturn")) themes.push("commitment");
  if (all.includes("jupiter")) themes.push("growth");

  return themes;
}

// ---- Main natal calculation ----

export async function fetchNatal(b: BirthRequest): Promise<NatalApiResponse> {
  ensureEphe();
  // 1. Geocode the city
  if (!b.city) throw new Error("Birth city is required.");
  const geo = await geocode(b.city);
  if (!geo) {
    throw new Error(
      `We couldn't find that city. Try "City, Country" — e.g. "Paris, France".`
    );
  }

  // 2. Determine time known + compute UTC
  const timeKnown =
    b.timeKnown !== false && b.hour !== undefined && b.minute !== undefined;
  const hour = timeKnown ? b.hour! : 12;
  const minute = timeKnown ? b.minute! : 0;

  const { utc, timezone } = localToUtc(
    b.year,
    b.month,
    b.day,
    hour,
    minute,
    geo.lat,
    geo.lng
  );

  // 3. Julian Day (UT) for Swiss Ephemeris
  const jd = swisseph.swe_julday(
    utc.year,
    utc.month,
    utc.day,
    utc.hour + utc.minute / 60 + utc.second / 3600,
    SE_GREG_CAL
  );

  // 4. Compute all planet positions. Some bodies (Chiron, Lilith) may not
  // have ephemeris data for very old dates — skip them gracefully rather
  // than failing the whole chart.
  const planets: ReturnType<typeof computePlanet>[] = [];
  for (const def of PLANET_DEFS) {
    try {
      planets.push(computePlanet(jd, def));
    } catch {
      // Skip bodies we can't compute (e.g. Chiron for very old dates).
      // The front-end handles missing planets gracefully.
    }
  }

  // 5. Compute houses (Placidus, with Whole Sign fallback)
  const houseResult = computeHouses(jd, geo.lat, geo.lng);

  // 6. Assign planets to houses
  const planetsWithHouses = planets.map((p) => ({
    ...p,
    house: planetHouse(p.abs_pos, houseResult.houses),
  }));

  // 7. Compute natal aspects (for the aspects_summary)
  const natalAspects = computeAspects(
    planetsWithHouses.map((p) => ({ id: p.id, name: p.name, abs_pos: p.abs_pos })),
    planetsWithHouses.map((p) => ({ id: p.id, name: p.name, abs_pos: p.abs_pos })),
    false // major aspects only for natal
  ).filter((a) => a.a_point !== a.b_point); // skip self-aspects

  // 8. Build the aspects summary
  const byType: Record<string, number> = {};
  for (const a of natalAspects) {
    const key = a.aspect.toLowerCase();
    byType[key] = (byType[key] || 0) + 1;
  }

  // 9. Build the response in the same shape the front-end expects
  const response: NatalApiResponse = {
    subject: {
      name: b.name || "User",
      datetime: `${b.year}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
      location: {
        city: geo.city,
        lat: geo.lat,
        lng: geo.lng,
        timezone,
      },
      settings: {
        house_system: houseResult.houseSystem,
        zodiac_type: "Tropical",
        time_known: timeKnown,
      },
    },
    planets: planetsWithHouses,
    houses: houseResult.houses.map((cusp, i) => ({
      house: i + 1,
      name: String(i + 1),
      sign: signAbbr(cusp),
      sign_id: signId(cusp),
      pos: posInSign(cusp),
      abs_pos: cusp,
    })),
    angles: {
      asc: houseResult.ascendant,
      mc: houseResult.mc,
      ic: ((houseResult.mc + 180) % 360 + 360) % 360,
      dc: ((houseResult.ascendant + 180) % 360 + 360) % 360,
      vertex: houseResult.vertex,
    },
    aspects_summary: {
      total: natalAspects.length,
      major: natalAspects.length,
      minor: 0,
      by_type: byType,
    },
    confidence: {
      houses: timeKnown ? "high" : "unavailable",
      angles: timeKnown ? "high" : "unavailable",
      overall: timeKnown ? "high" : "medium",
    },
  };

  return response;
}

// ---- Synastry calculation ----

export async function fetchSynastry(
  a: BirthRequest,
  b: BirthRequest
): Promise<SynastryApiResponse> {
  // Compute both natal charts
  const [natalA, natalB] = await Promise.all([fetchNatal(a), fetchNatal(b)]);

  // Compute cross-aspects (person A's planets vs person B's planets)
  const planetsA = natalA.planets.map((p) => ({
    id: p.id,
    name: p.name,
    abs_pos: p.abs_pos,
  }));
  const planetsB = natalB.planets.map((p) => ({
    id: p.id,
    name: p.name,
    abs_pos: p.abs_pos,
  }));

  // Add the Ascendant and MC as "planets" for aspect purposes
  const pointsA = [
    ...planetsA,
    { id: "asc", name: "Ascendant", abs_pos: natalA.angles.asc },
    { id: "mc", name: "Midheaven", abs_pos: natalA.angles.mc },
  ];
  const pointsB = [
    ...planetsB,
    { id: "asc", name: "Ascendant", abs_pos: natalB.angles.asc },
    { id: "mc", name: "Midheaven", abs_pos: natalB.angles.mc },
  ];

  const aspects = computeAspects(pointsA, pointsB, true);

  // Compute scores from the aspects
  const scores = computeSynastryScores(aspects);

  // Determine the archetype from the scores
  const archetype = determineArchetype(scores, aspects);

  // Build highlights (top aspects by strength)
  const highlights = aspects
    .slice(0, 6)
    .map((a) => ({
      kind: "aspect" as const,
      ref_id: a.id,
      reason_codes: a.polarity === "tense" ? ["STRENGTH_PERFECT", "FRICTION"] : ["STRENGTH_PERFECT", "HARMONY"],
    }));

  return {
    meta: {
      engine: { name: "Local Swiss Ephemeris", version: "1.0.0" },
      settings_resolved: {
        zodiac: "tropical",
        house_system: "placidus",
      },
    },
    natal: {
      person_a: natalA,
      person_b: natalB,
    },
    synastry: {
      aspects,
      highlights,
      scores,
      archetype,
      // No text from local calc — the mapper builds its own narrative.
      text: undefined,
    },
  };
}

// ---- Synastry scoring ----

function computeSynastryScores(aspects: SynastryApiResponse["synastry"]["aspects"]): {
  overall: number;
  romance: number;
  communication: number;
  stability: number;
  intimacy: number;
  growth: number;
  tension: number;
} {
  // Group aspects by domain based on the planets involved
  const domains: Record<string, { positive: number; negative: number; count: number }> = {
    romance: { positive: 0, negative: 0, count: 0 },
    communication: { positive: 0, negative: 0, count: 0 },
    stability: { positive: 0, negative: 0, count: 0 },
    intimacy: { positive: 0, negative: 0, count: 0 },
    growth: { positive: 0, negative: 0, count: 0 },
  };

  let totalPositive = 0;
  let totalNegative = 0;

  for (const a of aspects) {
    const weight = (a.strength - 0.3) * 10; // -3 to +7
    const isPositive = a.polarity !== "tense";

    if (isPositive) totalPositive += weight;
    else totalNegative += Math.abs(weight);

    // Assign to domains
    const all = [a.a_point, a.b_point];
    if (all.includes("venus") || all.includes("mars")) {
      domains.romance.count++;
      if (isPositive) domains.romance.positive += weight;
      else domains.romance.negative += Math.abs(weight);
    }
    if (all.includes("mercury")) {
      domains.communication.count++;
      if (isPositive) domains.communication.positive += weight;
      else domains.communication.negative += Math.abs(weight);
    }
    if (all.includes("saturn")) {
      domains.stability.count++;
      if (isPositive) domains.stability.positive += weight;
      else domains.stability.negative += Math.abs(weight);
    }
    if (all.includes("moon") || all.includes("pluto")) {
      domains.intimacy.count++;
      if (isPositive) domains.intimacy.positive += weight;
      else domains.intimacy.negative += Math.abs(weight);
    }
    if (all.includes("jupiter") || all.includes("north_node")) {
      domains.growth.count++;
      if (isPositive) domains.growth.positive += weight;
      else domains.growth.negative += Math.abs(weight);
    }
  }

  // Score each domain 0-100
  const scoreDomain = (d: { positive: number; negative: number; count: number }) => {
    if (d.count === 0) return 50; // neutral if no aspects
    const raw = 50 + (d.positive - d.negative) * 3;
    return Math.max(0, Math.min(100, Math.round(raw)));
  };

  const romance = scoreDomain(domains.romance);
  const communication = scoreDomain(domains.communication);
  const stability = scoreDomain(domains.stability);
  const intimacy = scoreDomain(domains.intimacy);
  const growth = scoreDomain(domains.growth);

  // Overall: weighted average of all domains
  const overall = Math.round(
    (romance + communication + stability + intimacy + growth) / 5
  );

  // Tension: based on negative aspects
  const tension = Math.max(0, Math.min(100, Math.round(30 + totalNegative * 2)));

  return { overall, romance, communication, stability, intimacy, growth, tension };
}

function determineArchetype(
  scores: { overall: number; stability: number; romance: number; tension: number },
  aspects: SynastryApiResponse["synastry"]["aspects"]
): { id: string; label: string; one_liner: string; confidence: number } {
  // Simple archetype determination based on score profile
  if (scores.stability >= 65 && scores.tension <= 50) {
    return {
      id: "steady_rock",
      label: "Steady Rock",
      one_liner: "Reliability and structure shape your bond. There is strength in consistency, creating a foundation that feels secure and dependable.",
      confidence: 0.7,
    };
  }
  if (scores.romance >= 65) {
    return {
      id: "romantic_spark",
      label: "Romantic Spark",
      one_liner: "Love and attraction are at the heart of your connection. There's real chemistry here, and it shows.",
      confidence: 0.65,
    };
  }
  if (scores.tension >= 65) {
    return {
      id: "passionate_storm",
      label: "Passionate Storm",
      one_liner: "Your connection is intense and charged. The friction is real, but so is the energy — channel it well.",
      confidence: 0.6,
    };
  }
  if (scores.overall >= 60) {
    return {
      id: "easy_flow",
      label: "Easy Flow",
      one_liner: "Things come naturally between you. The connection doesn't require much effort, which is its own kind of gift.",
      confidence: 0.65,
    };
  }
  return {
    id: "work_in_progress",
    label: "Work in Progress",
    one_liner: "Your connection has potential, but it'll take real effort to unlock. The areas that need attention are clear.",
    confidence: 0.55,
  };
}
