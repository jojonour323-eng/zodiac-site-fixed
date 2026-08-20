// ============================================================================
// Celestial Astrology Microservice
// ============================================================================
// Standalone Node.js HTTP server that runs Swiss Ephemeris.
// Deploy this to any Node host (Railway, fly.io, Render, VPS, Cloud Run).
//
// Endpoints:
//   POST /natal     — compute a natal chart from birth data
//   POST /synastry  — compute synastry between two birth charts
//   GET  /geocode   — geocode a city query (returns matches)
//   GET  /health    — health check
//
// The Cloudflare Worker (the main Next.js app) proxies all astrology
// requests to this service via the ASTROLOGY_API_URL env var.
// ============================================================================

import http from "node:http";
import swisseph from "swisseph";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import cities from "all-the-cities";
import { find as findTz } from "geo-tz";
import { DateTime } from "luxon";

const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Swiss Ephemeris setup ----

function resolveEphePath() {
  // Strategy 1: node_modules relative to this file
  try {
    const candidate = path.join(__dirname, "node_modules", "swisseph", "ephe");
    if (fs.existsSync(candidate)) return candidate;
  } catch {}

  // Strategy 2: process.cwd() + node_modules
  const cwdCandidate = path.join(process.cwd(), "node_modules", "swisseph", "ephe");
  if (fs.existsSync(cwdCandidate)) return cwdCandidate;

  // Strategy 3: global install
  try {
    const pkgPath = require.resolve("swisseph/package.json");
    if (fs.existsSync(pkgPath)) {
      const p = path.join(path.dirname(pkgPath), "ephe");
      if (fs.existsSync(p)) return p;
    }
  } catch {}

  throw new Error("Could not locate Swiss Ephemeris data files (ephe directory).");
}

const EPHE_PATH = resolveEphePath();
swisseph.swe_set_ephe_path(EPHE_PATH);
swisseph.swe_set_tid_acc(0.0);
console.log(`[astrology] Swiss Ephemeris initialized, ephe path: ${EPHE_PATH}`);

// ---- Constants ----

const SEFLG_SWIEPH = 2;
const SEFLG_MOSEPH = 4;
const SEFLG_SPEED = 256;
const SE_GREG_CAL = 1;

const SE_SUN = 0, SE_MOON = 1, SE_MERCURY = 2, SE_VENUS = 3, SE_MARS = 4;
const SE_JUPITER = 5, SE_SATURN = 6, SE_URANUS = 7, SE_NEPTUNE = 8, SE_PLUTO = 9;
const SE_TRUE_NODE = 11, SE_CHIRON = 15, SE_MEAN_APOG = 12;

const PLANET_DEFS = [
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

const SIGN_ABBRS = ["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"];
const SIGN_ORDER = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];

function signAbbr(absPos) { return SIGN_ABBRS[Math.floor((((absPos % 360) + 360) % 360) / 30)]; }
function signId(absPos) { return SIGN_ORDER[Math.floor((((absPos % 360) + 360) % 360) / 30)]; }
function posInSign(absPos) { return ((absPos % 360) + 360) % 360 % 30; }

const COUNTRY_NAME_TO_CODE = {
  "usa":"US","united states":"US","united states of america":"US",
  "uk":"GB","united kingdom":"GB","britain":"GB","england":"GB",
  "france":"FR","germany":"DE","italy":"IT","spain":"ES","japan":"JP",
  "china":"CN","india":"IN","russia":"RU","canada":"CA","australia":"AU",
  "brazil":"BR","mexico":"MX","argentina":"AR","switzerland":"CH",
  "netherlands":"NL","belgium":"BE","sweden":"SE","norway":"NO",
  "denmark":"DK","finland":"FI","poland":"PL","ireland":"IE","portugal":"PT",
  "greece":"GR","turkey":"TR","egypt":"EG","south africa":"ZA",
  "south korea":"KR","korea":"KR","thailand":"TH","indonesia":"ID",
  "philippines":"PH","malaysia":"MY","singapore":"SG","new zealand":"NZ",
  "austria":"AT","czech republic":"CZ","czechia":"CZ","hungary":"HU",
  "romania":"RO","ukraine":"UA","israel":"IL","iran":"IR","iraq":"IQ",
  "saudi arabia":"SA","uae":"AE","united arab emirates":"AE",
  "morocco":"MA","algeria":"DZ","tunisia":"TN","lebanon":"LB",
  "pakistan":"PK","bangladesh":"BD","vietnam":"VN","nigeria":"NG",
  "kenya":"KE","libya":"LY","sudan":"SD","jordan":"JO","syria":"SY",
  "yemen":"YE","oman":"OM","qatar":"QA","kuwait":"KW","bahrain":"BH",
  "cyprus":"CY","iceland":"IS","lithuania":"LT","latvia":"LV","estonia":"EE",
  "bulgaria":"BG","serbia":"RS","croatia":"HR","slovenia":"SI","slovakia":"SK",
  "uruguay":"UY","paraguay":"PY","bolivia":"BO","chile":"CL","peru":"PE",
  "colombia":"CO","venezuela":"VE","ecuador":"EC","cuba":"CU",
  "dominican republic":"DO","puerto rico":"PR","jamaica":"JM","panama":"PA",
  "costa rica":"CR","guatemala":"GT","honduras":"HN","el salvador":"SV","nicaragua":"NI",
};

// Extended country map for the full geocode-search endpoint (matches the
// Next.js route's country detection exactly).
const COUNTRY_MAP_FULL = { ...COUNTRY_NAME_TO_CODE };

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n; if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// Full geocode search — matches the Next.js /api/geocode behavior exactly:
// country detection, exact match, contains match, fuzzy "did you mean".
function geocodeSearch(query) {
  const q = query.trim();
  if (!q || q.length < 2) return { found: false, results: [], error: "Please enter a city name." };

  const lower = q.toLowerCase();
  const parts = q.split(",").map(p => p.trim());
  const countryPart = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

  // Step 1: Country lookup
  const countryQuery = parts.length === 1 ? lower : countryPart;
  const countryCode = COUNTRY_MAP_FULL[countryQuery];
  if (countryCode) {
    const countryCities = cities
      .filter(c => c.country === countryCode)
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 15);
    if (countryCities.length > 0) {
      return { found: true, results: countryCities.map(c => ({ city: c.name, lat: c.loc.coordinates[1], lng: c.loc.coordinates[0], country: c.country, population: c.population || 0 })) };
    }
  }

  // Step 2: Exact city match (via the geocode function)
  // (handled separately — this function returns the search results, the
  // caller can try the async geocode() for Nominatim fallback)

  // Step 3: Contains match
  const cityName = parts[0].toLowerCase();
  let matches = cities.filter(c => {
    const name = c.name.toLowerCase();
    if (!name.includes(cityName)) return false;
    if (countryPart) {
      const cc = c.country.toLowerCase();
      const expectedCode = (COUNTRY_MAP_FULL[countryPart] || countryPart.toUpperCase()).toLowerCase();
      if (cc !== expectedCode) return false;
    }
    return true;
  });

  if (matches.length > 0) {
    const results = matches
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 15)
      .map(c => ({ city: c.name, lat: c.loc.coordinates[1], lng: c.loc.coordinates[0], country: c.country, population: c.population || 0 }));
    return { found: true, results };
  }

  // Step 4: Fuzzy match — "did you mean"
  const candidates = cities
    .filter(c => (c.population || 0) > 50000)
    .map(c => {
      const dist = levenshtein(lower, c.name.toLowerCase());
      const maxDist = Math.max(2, Math.floor(lower.length * 0.4));
      return { city: c, dist, maxDist };
    })
    .filter(x => x.dist <= x.maxDist)
    .sort((a, b) => a.dist - b.dist || (b.city.population || 0) - (a.city.population || 0))
    .slice(0, 5);

  if (candidates.length > 0) {
    return {
      found: false, results: [],
      didYouMean: candidates.map(c => ({ city: c.city.name, lat: c.city.loc.coordinates[1], lng: c.city.loc.coordinates[0], country: c.city.country, population: c.city.population || 0 })),
      error: `We couldn't find "${q}". Did you mean ${candidates[0].city.name}?`,
    };
  }

  return { found: false, results: [], error: `We couldn't find "${q}". Try "City, Country" — e.g. "Paris, France" or just "France".` };
}

// ---- Geocoding ----

async function geocode(query) {
  const q = query.trim();
  if (!q) return null;

  const parts = q.split(",").map(p => p.trim());
  const cityName = parts[0];
  const countryPart = parts[parts.length - 1].toLowerCase();
  const countryCode = COUNTRY_NAME_TO_CODE[countryPart] || countryPart.toUpperCase();

  const matches = cities.filter(c => {
    if (c.name.toLowerCase() !== cityName.toLowerCase()) return false;
    if (parts.length > 1 && countryCode.length === 2 && c.country !== countryCode) return false;
    return true;
  });

  if (matches.length > 0) {
    matches.sort((a, b) => (b.population || 0) - (a.population || 0));
    const best = matches[0];
    return { city: best.name, lat: best.loc.coordinates[1], lng: best.loc.coordinates[0], countryCode: best.country };
  }

  const contains = cities.filter(c => {
    if (!c.name.toLowerCase().includes(cityName.toLowerCase())) return false;
    if (parts.length > 1 && countryCode.length === 2 && c.country !== countryCode) return false;
    return true;
  });
  if (contains.length > 0) {
    contains.sort((a, b) => (b.population || 0) - (a.population || 0));
    const best = contains[0];
    return { city: best.name, lat: best.loc.coordinates[1], lng: best.loc.coordinates[0], countryCode: best.country };
  }

  // Nominatim fallback
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { headers: { "User-Agent": "Celestial/1.0", "Accept-Language": "en" }, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const hit = data[0];
    const name = hit.address?.city || hit.address?.town || hit.address?.village || cityName;
    return { city: name, lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), countryCode: hit.address?.country_code?.toUpperCase() };
  } catch {
    return null;
  }
}

// ---- Timezone ----

function localToUtc(year, month, day, hour, minute, lat, lng) {
  const tzArr = findTz(lat, lng);
  const timezone = (tzArr && tzArr[0]) || "UTC";
  const local = DateTime.fromObject({ year, month, day, hour, minute, second: 0 }, { zone: timezone });
  if (!local.isValid) throw new Error(`Invalid date/time: ${year}-${month}-${day} ${hour}:${minute} in ${timezone}`);

  const offsetMinutes = local.offset;
  const zoneName = local.zoneName;
  const isLmt = zoneName === "Local" || (year < 1900 && Math.abs(offsetMinutes) % 60 !== 0 && Math.abs(offsetMinutes) % 15 !== 0);

  if (isLmt) {
    const lmtOffsetMinutes = lng * 4;
    const sign = lmtOffsetMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(lmtOffsetMinutes);
    const h = Math.floor(absMinutes / 60);
    const m = Math.floor(absMinutes % 60);
    const lmtZone = `UTC${sign}${h}:${String(m).padStart(2, "0")}`;
    const lmtLocal = DateTime.fromObject({ year, month, day, hour, minute, second: 0 }, { zone: lmtZone });
    if (lmtLocal.isValid) return { utc: lmtLocal.toUTC(), timezone: `LMT (${lmtZone})` };
  }
  return { utc: local.toUTC(), timezone };
}

// ---- Planet computation ----

function computePlanet(jd, def) {
  const flags = SEFLG_SWIEPH | SEFLG_SPEED;
  let result;
  try { result = swisseph.swe_calc_ut(jd, def.seId, flags); } catch (e) {
    throw new Error(`Failed to compute ${def.name}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!result || result.longitude == null || (typeof result.longitude === "number" && isNaN(result.longitude))) {
    try { result = swisseph.swe_calc_ut(jd, def.seId, SEFLG_MOSEPH | SEFLG_SPEED); } catch {}
  }
  if (!result || result.longitude == null || (typeof result.longitude === "number" && isNaN(result.longitude))) {
    throw new Error(`Failed to compute ${def.name}`);
  }
  return {
    id: def.id, name: def.name,
    sign: signAbbr(result.longitude), sign_id: signId(result.longitude),
    pos: posInSign(result.longitude), abs_pos: result.longitude,
    retrograde: result.longitudeSpeed < 0,
    declination_deg: result.declination || 0,
  };
}

function computeHouses(jd, lat, lng) {
  let result = swisseph.swe_houses(jd, lat, lng, "P");
  if (!result || !result.house || result.house.some(h => isNaN(h))) {
    result = swisseph.swe_houses(jd, lat, lng, "W");
    return { houses: result.house, ascendant: result.ascendant, mc: result.mc, armc: result.armc, vertex: result.vertex, houseSystem: "Whole Sign" };
  }
  return { houses: result.house, ascendant: result.ascendant, mc: result.mc, armc: result.armc, vertex: result.vertex, houseSystem: "Placidus" };
}

function planetHouse(absPos, cusps) {
  const pos = ((absPos % 360) + 360) % 360;
  for (let i = 11; i >= 0; i--) {
    const cusp = ((cusps[i] % 360) + 360) % 360;
    if (pos >= cusp || cusp > pos + 180) {
      const nextCusp = ((cusps[(i + 1) % 12] % 360) + 360) % 360;
      if (cusp <= nextCusp) { if (pos >= cusp && pos < nextCusp) return i + 1; }
      else { if (pos >= cusp || pos < nextCusp) return i + 1; }
    }
  }
  for (let i = 11; i >= 0; i--) { const cusp = ((cusps[i] % 360) + 360) % 360; if (cusp <= pos) return i + 1; }
  return 1;
}

// ---- Aspects ----

const ASPECT_DEFS = [
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

function aspectPolarity(name) {
  const l = name.toLowerCase();
  if (["trine","sextile","semisextile"].includes(l)) return "harmonious";
  if (["opposition","square","semisquare","sesquisquare","quincunx"].includes(l)) return "tense";
  return "neutral";
}
function aspectStrength(orb, maxOrb) { return Math.max(0, Math.min(1, 1 - orb / maxOrb)); }
function strengthLabel(s) {
  if (s >= 0.9) return "very_strong"; if (s >= 0.7) return "strong";
  if (s >= 0.5) return "moderate"; if (s >= 0.3) return "weak"; return "very_weak";
}

function aspectThemes(aId, bId, aspect) {
  const themes = [];
  const l = aspect.toLowerCase();
  if (l === "trine" || l === "sextile") themes.push("harmony");
  if (l === "square" || l === "opposition") themes.push("friction");
  if (l === "conjunction") themes.push("intensity");
  if (themes.length === 0) themes.push("connection");
  const all = [aId, bId];
  if (all.includes("venus") || all.includes("mars")) themes.push("romance");
  if (all.includes("mercury")) themes.push("communication");
  if (all.includes("moon")) themes.push("emotion");
  if (all.includes("sun")) themes.push("identity");
  if (all.includes("saturn")) themes.push("commitment");
  if (all.includes("jupiter")) themes.push("growth");
  return themes;
}

function computeAspects(aPlanets, bPlanets, includeMinor) {
  const aspects = [];
  const set = includeMinor ? ASPECT_DEFS : ASPECT_DEFS.filter(a => ["Conjunction","Opposition","Trine","Square","Sextile"].includes(a.name));
  for (const a of aPlanets) {
    for (const b of bPlanets) {
      const aPos = ((a.abs_pos % 360) + 360) % 360;
      const bPos = ((b.abs_pos % 360) + 360) % 360;
      let diff = Math.abs(aPos - bPos);
      if (diff > 180) diff = 360 - diff;
      for (const def of set) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          const strength = aspectStrength(orb, def.orb);
          aspects.push({
            id: `aspect_${a.id}_${def.name}_${b.id}`.toLowerCase(),
            kind: "planet_aspect", a_point: a.id, b_point: b.id,
            pair_key: `${a.id}|${b.id}`, canonical_key: `${a.id}|${b.id}|${def.name.toLowerCase()}`,
            aspect: def.name, aspect_angle_deg: def.angle, separation_deg: diff,
            delta_deg: diff - def.angle, orb_deg: orb, applying: false,
            strength, strength_label: strengthLabel(strength),
            polarity: aspectPolarity(def.name), polarity_confidence: 0.9,
            categories: [], domains: [], themes: aspectThemes(a.id, b.id, def.name),
            is_angle_contact: false,
          });
          break;
        }
      }
    }
  }
  return aspects.sort((a, b) => b.strength - a.strength);
}

// ---- Natal chart ----

async function fetchNatal(b) {
  if (!b.city) throw new Error("Birth city is required.");
  const geo = await geocode(b.city);
  if (!geo) throw new Error(`We couldn't find that city. Try "City, Country" — e.g. "Paris, France".`);

  const timeKnown = b.timeKnown !== false && b.hour !== undefined && b.minute !== undefined;
  const hour = timeKnown ? b.hour : 12;
  const minute = timeKnown ? b.minute : 0;
  const { utc, timezone } = localToUtc(b.year, b.month, b.day, hour, minute, geo.lat, geo.lng);

  const jd = swisseph.swe_julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600, SE_GREG_CAL);

  const planets = [];
  for (const def of PLANET_DEFS) {
    try { planets.push(computePlanet(jd, def)); } catch { /* skip */ }
  }

  const houseResult = computeHouses(jd, geo.lat, geo.lng);
  const planetsWithHouses = planets.map(p => ({ ...p, house: planetHouse(p.abs_pos, houseResult.houses) }));

  const natalAspects = computeAspects(
    planetsWithHouses.map(p => ({ id: p.id, name: p.name, abs_pos: p.abs_pos })),
    planetsWithHouses.map(p => ({ id: p.id, name: p.name, abs_pos: p.abs_pos })),
    false
  ).filter(a => a.a_point !== a.b_point);

  const byType = {};
  for (const a of natalAspects) { const k = a.aspect.toLowerCase(); byType[k] = (byType[k] || 0) + 1; }

  return {
    subject: {
      name: b.name || "User",
      datetime: `${b.year}-${String(b.month).padStart(2,"0")}-${String(b.day).padStart(2,"0")}T${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}:00`,
      location: { city: geo.city, lat: geo.lat, lng: geo.lng, timezone },
      settings: { house_system: houseResult.houseSystem, zodiac_type: "Tropical", time_known: timeKnown },
    },
    planets: planetsWithHouses,
    houses: houseResult.houses.map((cusp, i) => ({ house: i+1, name: String(i+1), sign: signAbbr(cusp), sign_id: signId(cusp), pos: posInSign(cusp), abs_pos: cusp })),
    angles: {
      asc: houseResult.ascendant, mc: houseResult.mc,
      ic: ((houseResult.mc + 180) % 360 + 360) % 360,
      dc: ((houseResult.ascendant + 180) % 360 + 360) % 360,
      vertex: houseResult.vertex,
    },
    aspects_summary: { total: natalAspects.length, major: natalAspects.length, minor: 0, by_type: byType },
    confidence: {
      houses: timeKnown ? "high" : "unavailable",
      angles: timeKnown ? "high" : "unavailable",
      overall: timeKnown ? "high" : "medium",
    },
  };
}

// ---- Synastry ----

function computeSynastryScores(aspects) {
  const domains = {
    romance: { positive: 0, negative: 0, count: 0 },
    communication: { positive: 0, negative: 0, count: 0 },
    stability: { positive: 0, negative: 0, count: 0 },
    intimacy: { positive: 0, negative: 0, count: 0 },
    growth: { positive: 0, negative: 0, count: 0 },
  };
  let totalPositive = 0, totalNegative = 0;

  for (const a of aspects) {
    const weight = (a.strength - 0.3) * 10;
    const isPositive = a.polarity !== "tense";
    if (isPositive) totalPositive += weight; else totalNegative += Math.abs(weight);
    const all = [a.a_point, a.b_point];
    if (all.includes("venus") || all.includes("mars")) { domains.romance.count++; if (isPositive) domains.romance.positive += weight; else domains.romance.negative += Math.abs(weight); }
    if (all.includes("mercury")) { domains.communication.count++; if (isPositive) domains.communication.positive += weight; else domains.communication.negative += Math.abs(weight); }
    if (all.includes("saturn")) { domains.stability.count++; if (isPositive) domains.stability.positive += weight; else domains.stability.negative += Math.abs(weight); }
    if (all.includes("moon") || all.includes("pluto")) { domains.intimacy.count++; if (isPositive) domains.intimacy.positive += weight; else domains.intimacy.negative += Math.abs(weight); }
    if (all.includes("jupiter") || all.includes("north_node")) { domains.growth.count++; if (isPositive) domains.growth.positive += weight; else domains.growth.negative += Math.abs(weight); }
  }

  const scoreDomain = d => { if (d.count === 0) return 50; return Math.max(10, Math.min(90, Math.round(50 + (d.positive - d.negative) * 3))); };
  const romance = scoreDomain(domains.romance);
  const communication = scoreDomain(domains.communication);
  const stability = scoreDomain(domains.stability);
  const intimacy = scoreDomain(domains.intimacy);
  const growth = scoreDomain(domains.growth);
  const overall = Math.round((romance + communication + stability + intimacy + growth) / 5);
  const tension = Math.max(10, Math.min(90, Math.round(30 + totalNegative * 2)));
  return { overall, romance, communication, stability, intimacy, growth, tension };
}

function determineArchetype(scores) {
  if (scores.stability >= 65 && scores.tension <= 50) return { id: "steady_rock", label: "Steady Rock", one_liner: "Reliability and structure shape your bond.", confidence: 0.7 };
  if (scores.romance >= 65) return { id: "romantic_spark", label: "Romantic Spark", one_liner: "Love and attraction are at the heart of your connection.", confidence: 0.65 };
  if (scores.tension >= 65) return { id: "passionate_storm", label: "Passionate Storm", one_liner: "Your connection is intense and charged.", confidence: 0.6 };
  if (scores.overall >= 60) return { id: "easy_flow", label: "Easy Flow", one_liner: "Things come naturally between you.", confidence: 0.65 };
  return { id: "work_in_progress", label: "Work in Progress", one_liner: "Your connection has potential, but it'll take effort.", confidence: 0.55 };
}

async function fetchSynastry(a, b) {
  const [natalA, natalB] = await Promise.all([fetchNatal(a), fetchNatal(b)]);
  const planetsA = natalA.planets.map(p => ({ id: p.id, name: p.name, abs_pos: p.abs_pos }));
  const planetsB = natalB.planets.map(p => ({ id: p.id, name: p.name, abs_pos: p.abs_pos }));
  const pointsA = [...planetsA, { id: "asc", name: "Ascendant", abs_pos: natalA.angles.asc }, { id: "mc", name: "Midheaven", abs_pos: natalA.angles.mc }];
  const pointsB = [...planetsB, { id: "asc", name: "Ascendant", abs_pos: natalB.angles.asc }, { id: "mc", name: "Midheaven", abs_pos: natalB.angles.mc }];
  const aspects = computeAspects(pointsA, pointsB, true);
  const scores = computeSynastryScores(aspects);
  const archetype = determineArchetype(scores);
  const highlights = aspects.slice(0, 6).map(a => ({ kind: "aspect", ref_id: a.id, reason_codes: a.polarity === "tense" ? ["STRENGTH_PERFECT","FRICTION"] : ["STRENGTH_PERFECT","HARMONY"] }));
  return {
    meta: { engine: { name: "Local Swiss Ephemeris", version: "1.0.0" }, settings_resolved: { zodiac: "tropical", house_system: "placidus" } },
    natal: { person_a: natalA, person_b: natalB },
    synastry: { aspects, highlights, scores, archetype, text: undefined },
  };
}

// ---- HTTP server ----

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk; if (body.length > 1e6) { req.destroy(); reject(new Error("Body too large")); } });
    req.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  const json = JSON.stringify(data);
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" });
  res.end(json);
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") { sendJson(res, 204, {}); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    if (pathname === "/health" && req.method === "GET") {
      sendJson(res, 200, { ok: true, service: "celestial-astrology", ephe: EPHE_PATH });
      return;
    }

    if (pathname === "/geocode" && req.method === "GET") {
      const q = url.searchParams.get("q");
      if (!q) { sendJson(res, 400, { error: "Missing ?q= parameter" }); return; }
      const result = geocodeSearch(q);
      // If no local results, try the async geocode (Nominatim fallback)
      if (!result.found && (!result.didYouMean || result.didYouMean.length === 0)) {
        const geo = await geocode(q);
        if (geo) {
          sendJson(res, 200, { found: true, results: [{ city: geo.city, lat: geo.lat, lng: geo.lng, country: geo.countryCode || "" }] });
          return;
        }
      }
      sendJson(res, 200, result);
      return;
    }

    if (pathname === "/natal" && req.method === "POST") {
      const body = await readBody(req);
      if (!body.year || !body.month || !body.day) { sendJson(res, 400, { error: "year, month, day are required" }); return; }
      const result = await fetchNatal(body);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === "/synastry" && req.method === "POST") {
      const body = await readBody(req);
      if (!body.personA || !body.personB) { sendJson(res, 400, { error: "personA and personB are required" }); return; }
      const result = await fetchSynastry(body.personA, body.personB);
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    console.error("[astrology] Error:", err);
    sendJson(res, 500, { error: err instanceof Error ? err.message : "Unknown error" });
  }
});

server.listen(PORT, () => {
  console.log(`[astrology] Server running on http://localhost:${PORT}`);
  console.log(`[astrology] Endpoints: POST /natal, POST /synastry, GET /geocode?q=, GET /health`);
});
