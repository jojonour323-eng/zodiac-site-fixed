import "server-only";
import type {
  BirthRequest,
  NatalApiResponse,
  SynastryApiResponse,
} from "./types";

const API_BASE =
  process.env.FREE_ASTRO_API_BASE || "https://api.freeastroapi.com";

function assertKey(): string {
  const key = process.env.FREE_ASTRO_API_KEY;
  if (!key) {
    throw new Error(
      "FREE_ASTRO_API_KEY is not set. Add it to your .env file (server-side only)."
    );
  }
  return key;
}

// Free-tier limit is 1 req/s. A tiny in-process gate keeps us under it
// even when two requests land in the same tick.
let lastCallAt = 0;
const MIN_GAP_MS = 1100;
async function respectRps() {
  const now = Date.now();
  const wait = MIN_GAP_MS - (now - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

// Hard timeout for the upstream fetch. Without this, a hung connection
// (Cloudflare keeping the socket open, the API server stalling, etc.)
// blocks the request forever and the UI stays in its loading state.
const UPSTREAM_TIMEOUT_MS = 20_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `FreeAstroAPI request timed out after ${UPSTREAM_TIMEOUT_MS / 1000}s. The astrology service may be slow or unreachable. Please try again.`
      );
    }
    // Network errors (DNS, connection refused, socket reset, etc.)
    throw new Error(
      `Could not reach the astrology service: ${err instanceof Error ? err.message : "network error"}. Please try again in a moment.`
    );
  } finally {
    clearTimeout(timer);
  }
}

// Custom error type so the route handler can distinguish rate-limit / quota
// errors (which the user can't fix by retrying immediately) from other errors.
export class AstroApiError extends Error {
  readonly kind: "quota" | "rate_limit" | "http" | "network" | "timeout";
  readonly status: number;
  constructor(
    kind: "quota" | "rate_limit" | "http" | "network" | "timeout",
    message: string,
    status = 0
  ) {
    super(message);
    this.name = "AstroApiError";
    this.kind = kind;
    this.status = status;
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  await respectRps();
  const key = assertKey();

  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "Accept-Encoding": "gzip",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  // 429 — rate limited or daily quota hit. Read the body to figure out which.
  if (res.status === 429) {
    const text = await res.text().catch(() => "");
    const lower = text.toLowerCase();
    // Daily quota: "daily request limit" or "usage resets tomorrow".
    // Don't retry these — they won't succeed for hours.
    if (
      lower.includes("daily") ||
      lower.includes("quota") ||
      lower.includes("usage resets") ||
      lower.includes("monthly")
    ) {
      throw new AstroApiError(
        "quota",
        `The astrology service's daily request limit has been reached for this API key. It resets tomorrow. Please try again then.`,
        429
      );
    }
    // Per-second rate limit: safe to retry once after a short wait.
    const retryAfterHeader = res.headers.get("retry-after-ms");
    const retryAfterSec = res.headers.get("retry-after");
    let waitMs = 1500;
    if (retryAfterHeader) {
      const n = Number(retryAfterHeader);
      if (!Number.isNaN(n) && n > 0) waitMs = Math.min(n + 200, 4000);
    } else if (retryAfterSec) {
      const n = Number(retryAfterSec);
      if (!Number.isNaN(n) && n > 0) waitMs = Math.min(n * 1000, 4000);
    }
    await new Promise((r) => setTimeout(r, waitMs));
    // Retry once. If it 429s again, surface the error.
    const retryRes = await fetchWithTimeout(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "Accept-Encoding": "gzip",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!retryRes.ok) {
      const retryText = await retryRes.text().catch(() => "");
      const rl = retryText.toLowerCase();
      if (
        rl.includes("daily") ||
        rl.includes("quota") ||
        rl.includes("usage resets")
      ) {
        throw new AstroApiError(
          "quota",
          `The astrology service's daily request limit has been reached. It resets tomorrow. Please try again then.`,
          429
        );
      }
      throw new AstroApiError(
        "rate_limit",
        `The astrology service is rate-limiting requests right now. Please wait a few seconds and try again.`,
        429
      );
    }
    return (await retryRes.json()) as T;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // 400/422 with a city-geocoding error — surface a friendly message.
    if (text.includes("could not be resolved")) {
      throw new AstroApiError(
        "http",
        `We couldn't find that city. Try "City, Country" — e.g. "Paris, France".`,
        res.status
      );
    }
    throw new AstroApiError(
      "http",
      `The astrology service returned an error (${res.status}). ${text.slice(0, 200)}`,
      res.status
    );
  }

  return (await res.json()) as T;
}

// Build the request body expected by /api/v1/natal/calculate.
// When the user does not know their birth time, we still send a noon default
// so the API can return planetary signs (the Moon may be off, but Sun and
// outer planets are safe). time_known=false tells the engine to mark houses
// as low-confidence.
//
// IMPORTANT: if lat/lng are not provided, we OMIT them entirely so the API
// falls back to its own city geocoding. Sending lat=0,lng=0 would be treated
// literally (Null Island, UTC) and would shift the Moon by hours.
export function buildNatalBody(b: BirthRequest) {
  const timeKnown = b.timeKnown !== false && b.hour !== undefined && b.minute !== undefined;
  const body: Record<string, unknown> = {
    name: b.name || "User",
    year: b.year,
    month: b.month,
    day: b.day,
    hour: timeKnown ? b.hour : 12,
    minute: timeKnown ? b.minute : 0,
    time_known: timeKnown,
    city: b.city || "Unknown",
    tz_str: b.tzStr || "AUTO",
    house_system: "placidus",
    zodiac_type: "tropical",
    response_format: "full",
  };
  if (typeof b.lat === "number" && typeof b.lng === "number") {
    body.lat = b.lat;
    body.lng = b.lng;
  }
  return body;
}

export async function fetchNatal(b: BirthRequest): Promise<NatalApiResponse> {
  return postJson<NatalApiResponse>("/api/v1/natal/calculate", buildNatalBody(b));
}

export async function fetchSynastry(
  a: BirthRequest,
  b: BirthRequest
): Promise<SynastryApiResponse> {
  const toPerson = (p: BirthRequest) => {
    const timeKnown = p.timeKnown !== false && p.hour !== undefined && p.minute !== undefined;
    const hour = String(timeKnown ? p.hour : 12).padStart(2, "0");
    const minute = String(timeKnown ? p.minute : 0).padStart(2, "0");
    return {
      datetime: `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}T${hour}:${minute}:00`,
      location: { city: p.city || "Unknown" },
      tz_str: p.tzStr || "AUTO",
    };
  };

  const body = {
    person_a: toPerson(a),
    person_b: toPerson(b),
    settings: {
      zodiac: "tropical",
      aspect_set: "extended",
      bodies: [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "asc", "mc",
      ],
      include: {
        natal_snapshots: true,
        aspects: true,
        house_overlays: true,
        scores: true,
        archetype: true,
        text: true,
      },
    },
  };

  return postJson<SynastryApiResponse>("/api/v2/western/synastry", body);
}
