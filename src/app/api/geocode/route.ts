import { NextResponse } from "next/server";
import { geocode } from "@/lib/astro/local";
import cities from "all-the-cities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/geocode?q=Morocco
// Returns a list of real cities matching the query, sorted by population.
// If the query matches a single city exactly, returns found:true with that city.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ found: false, results: [], error: "Please enter a city name." });
  }
  const query = q.trim();
  try {
    const lower = query.toLowerCase();
    const parts = query.split(",").map((p) => p.trim());
    const countryPart = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

    // Country name → ISO-2 code map. Used to detect when the user typed
    // a country name (e.g. "Morocco") so we can return the biggest cities
    // in that country instead of matching a tiny town with the same name.
    const COUNTRY_MAP: Record<string, string> = {
      "usa": "US", "united states": "US", "united states of america": "US",
      "france": "FR", "germany": "DE", "japan": "JP", "china": "CN",
      "india": "IN", "uk": "GB", "united kingdom": "GB", "britain": "GB", "england": "GB",
      "morocco": "MA", "egypt": "EG", "brazil": "BR", "mexico": "MX",
      "spain": "ES", "italy": "IT", "russia": "RU", "canada": "CA",
      "australia": "AU", "turkey": "TR", "iran": "IR", "saudi arabia": "SA",
      "south korea": "KR", "korea": "KR", "thailand": "TH", "indonesia": "ID",
      "philippines": "PH", "malaysia": "MY", "singapore": "SG", "new zealand": "NZ",
      "switzerland": "CH", "netherlands": "NL", "belgium": "BE", "sweden": "SE",
      "norway": "NO", "denmark": "DK", "finland": "FI", "poland": "PL",
      "ireland": "IE", "portugal": "PT", "greece": "GR", "argentina": "AR",
      "south africa": "ZA", "uae": "AE", "united arab emirates": "AE",
      "austria": "AT", "czech republic": "CZ", "czechia": "CZ",
      "hungary": "HU", "romania": "RO", "ukraine": "UA",
      "israel": "IL", "iraq": "IQ", "pakistan": "PK", "bangladesh": "BD",
      "vietnam": "VN", "nigeria": "NG", "kenya": "KE", "algeria": "DZ",
      "tunisia": "TN", "libya": "LY", "sudan": "SD", "jordan": "JO",
      "lebanon": "LB", "syria": "SY", "yemen": "YE", "oman": "OM",
      "qatar": "QA", "kuwait": "KW", "bahrain": "BH", "cyprus": "CY",
      "iceland": "IS", "lithuania": "LT", "latvia": "LV", "estonia": "EE",
      "bulgaria": "BG", "serbia": "RS", "croatia": "HR", "slovenia": "SI",
      "slovakia": "SK", "uruguay": "UY", "paraguay": "PY", "bolivia": "BO",
      "chile": "CL", "peru": "PE", "colombia": "CO", "venezuela": "VE",
      "ecuador": "EC", "cuba": "CU", "dominican republic": "DO",
      "puerto rico": "PR", "jamaica": "JM", "panama": "PA", "costa rica": "CR",
      "guatemala": "GT", "honduras": "HN", "el salvador": "SV", "nicaragua": "NI",
    };

    // Step 1: If the query (or the country part) matches a country name,
    // return the biggest cities in that country. This takes priority over
    // matching a tiny town that happens to share the country's name.
    const countryQuery = parts.length === 1 ? lower : countryPart;
    const countryCode = COUNTRY_MAP[countryQuery];
    if (countryCode) {
      const countryCities = cities
        .filter((c) => c.country === countryCode)
        .sort((a, b) => (b.population || 0) - (a.population || 0))
        .slice(0, 15);
      if (countryCities.length > 0) {
        return NextResponse.json({
          found: true,
          results: countryCities.map((c) => ({
            city: c.name,
            lat: c.loc.coordinates[1],
            lng: c.loc.coordinates[0],
            country: c.country,
            population: c.population || 0,
          })),
        });
      }
    }

    // Step 2: Try the exact geocoder (handles "City, Country" format)
    const geo = await geocode(query);
    if (geo) {
      return NextResponse.json({
        found: true,
        results: [{ city: geo.city, lat: geo.lat, lng: geo.lng, country: geo.countryCode || "" }],
      });
    }

    // Step 3: Search by city name (contains match)
    const cityName = parts[0].toLowerCase();
    let matches = cities.filter((c) => {
      const name = c.name.toLowerCase();
      if (!name.includes(cityName)) return false;
      if (countryPart) {
        const cc = c.country.toLowerCase();
        const expectedCode = COUNTRY_MAP[countryPart] || countryPart.toUpperCase();
        if (cc !== expectedCode.toLowerCase()) return false;
      }
      return true;
    });

    if (matches.length === 0) {
      // Fuzzy match — find the closest city name by edit distance
      const lower = query.toLowerCase();
      const candidates = cities
        .filter((c) => (c.population || 0) > 50000) // only significant cities
        .map((c) => {
          const dist = levenshtein(lower, c.name.toLowerCase());
          // Allow up to ~40% of the query length in edits
          const maxDist = Math.max(2, Math.floor(lower.length * 0.4));
          return { city: c, dist, maxDist };
        })
        .filter((x) => x.dist <= x.maxDist)
        .sort((a, b) => a.dist - b.dist || (b.city.population || 0) - (a.city.population || 0))
        .slice(0, 5);

      if (candidates.length > 0) {
        return NextResponse.json({
          found: false,
          results: [],
          didYouMean: candidates.map((c) => ({
            city: c.city.name,
            lat: c.city.loc.coordinates[1],
            lng: c.city.loc.coordinates[0],
            country: c.city.country,
            population: c.city.population || 0,
          })),
          error: `We couldn't find "${q}". Did you mean ${candidates[0].city.name}?`,
        });
      }

      return NextResponse.json({
        found: false,
        results: [],
        error: `We couldn't find "${q}". Try "City, Country" — e.g. "Paris, France" or just "France".`,
      });
    }

    // Sort by population (biggest first) and return top 15
    const results = matches
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 15)
      .map((c) => ({
        city: c.name,
        lat: c.loc.coordinates[1],
        lng: c.loc.coordinates[0],
        country: c.country,
        population: c.population || 0,
      }));

    return NextResponse.json({
      found: true,
      results,
    });
  } catch {
    return NextResponse.json({
      found: false,
      results: [],
      error: "Could not verify that location. Please try again.",
    });
  }
}

// Levenshtein distance — measures how many edits (insert/delete/substitute)
// are needed to turn one string into another. Used for typo detection.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}
