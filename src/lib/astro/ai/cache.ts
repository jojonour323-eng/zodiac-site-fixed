// ===========================================================================
// CACHE — disk-backed cache for generated readings (private/, never public)
// ---------------------------------------------------------------------------
// Key = sha1 of the canonical birth request + purpose + engine version, so
// the same person gets instant reloads and consistent results across tabs,
// and we don't burn tokens re-generating identical charts.
// ===========================================================================

import { createHash } from "crypto";
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "private", "readings-cache");
const ENGINE_VERSION = "v4";
const MAX_FILES = 600;

function canonical(obj: unknown): string {
  return JSON.stringify(sortDeep(obj));
}

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, val]) => [k, sortDeep(val)]),
    );
  }
  return v;
}

export function cacheKey(purpose: string, payload: unknown): string {
  const h = createHash("sha1").update(`${purpose}|${ENGINE_VERSION}|${canonical(payload)}`).digest("hex");
  return `${purpose}-${h.slice(0, 20)}`;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const p = path.join(CACHE_DIR, `${key}.json`);
    const raw = readFileSync(p, "utf8");
    const parsed = JSON.parse(raw);
    return (parsed?.payload ?? null) as T | null;
  } catch {
    return null;
  }
}

export function cacheSet(key: string, payload: unknown): void {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(
      path.join(CACHE_DIR, `${key}.json`),
      JSON.stringify({ created: Date.now(), payload }),
    );
    prune();
  } catch {
    // Cache failures must never break a reading.
  }
}

/** Keep the cache directory bounded; delete oldest when over limit. */
let writes = 0;
function prune(): void {
  if (++writes % 25 !== 0) return;
  try {
    const files = readdirSync(CACHE_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const st = statSync(path.join(CACHE_DIR, f));
        return { f, m: st.mtimeMs };
      })
      .sort((a, b) => a.m - b.m);
    while (files.length > MAX_FILES) {
      const victim = files.shift();
      if (!victim) break;
      unlinkSync(path.join(CACHE_DIR, victim.f));
    }
  } catch {
    // ignore
  }
}
