import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import geoip from "geoip-lite";
import type { BirthRequest } from "@/lib/astro/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Where the user data file lives. We store one JSON object per line
// (JSON Lines / NDJSON) so we can append safely without re-reading the
// whole file every time.
const DATA_DIR = path.join(process.cwd(), "private");
const DATA_FILE = path.join(DATA_DIR, "submissions.jsonl");

// ===========================================================================
// PRIVATE-LINK TOKEN
// ---------------------------------------------------------------------------
// The GET endpoint that lists all submissions is protected by a token in the
// URL. Anyone with the link (https://yoursite.com/api/collect?token=XXX) can
// view the data — no one else. This is the "private link" pattern: the URL
// itself is the password.
//
// The token is read from the COLLECT_VIEW_TOKEN env var if set, otherwise it
// falls back to a fixed default. **Change the default before going to prod**
// or set the env var to override it.
// ===========================================================================
const VIEW_TOKEN = process.env.COLLECT_VIEW_TOKEN || "celestial-view-7f3a9b2e8d1c";

interface SubmissionRecord {
  timestamp: string;
  name?: string;
  identifier: string;
  city?: string;
  country?: string;
  age: number | null;
  birthday: string;
  birthdayDisplay: string;
  fullBirthday: string;
  timeKnown: boolean;
  gender?: "male" | "female";
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  // The user's claimed location + their real IP, in the (location, ip)
  // format the owner asked for. Stored separately so the owner can spot
  // when someone lied about where they are.
  locationAndIp: string;
  ip?: string;
  // Where the IP address actually resolves to, looked up locally via the
  // offline geoip-lite database (no external API call). Lets the site
  // owner compare "what they typed" vs "where their connection really is".
  ipLocation?: string;
}

function computeAge(birth: { year: number; month: number; day: number }): number {
  const today = new Date();
  let age = today.getFullYear() - birth.year;
  const m = today.getMonth() + 1 - birth.month;
  if (m < 0 || (m === 0 && today.getDate() < birth.day)) age--;
  return age;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function formatBirthday(req: BirthRequest): { iso: string; display: string; full: string } {
  const iso = `${req.year}-${String(req.month).padStart(2, "0")}-${String(req.day).padStart(2, "0")}`;
  const display = `${MONTH_NAMES[req.month - 1]} ${req.day}, ${req.year}`;
  let full = display;
  if (req.timeKnown && req.hour !== undefined && req.minute !== undefined) {
    const h12 = req.hour % 12 === 0 ? 12 : req.hour % 12;
    const ampm = req.hour < 12 ? "AM" : "PM";
    full = `${display} at ${h12}:${String(req.minute).padStart(2, "0")} ${ampm}`;
  }
  return { iso, display, full };
}

function splitCityCountry(cityField?: string): { city?: string; country?: string } {
  if (!cityField) return {};
  const parts = cityField.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 1) return { city: parts[0] };
  return { city: parts[0], country: parts.slice(1).join(", ") };
}

// Extract the client IP from common headers. Behind a reverse proxy (Caddy,
// nginx, Vercel), the IP comes in via x-forwarded-for or x-real-ip. We take
// the first IP in the list (the original client) when there's a chain.
function getClientIp(req: Request): string | undefined {
  const headers = req.headers;
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  const cfConnecting = headers.get("cf-connecting-ip");
  if (cfConnecting) return cfConnecting.trim();
  return undefined;
}

// Resolve a real-world location from an IP address using the offline
// geoip-lite database — no external API, no network call, works even if
// the internet is down. Loopback/private IPs (like local dev) return null.
function resolveIpLocation(ip?: string): string | undefined {
  if (!ip) return undefined;
  try {
    const geo = geoip.lookup(ip);
    if (!geo) return undefined;
    const parts = [geo.city, geo.region, geo.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : undefined;
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  let body: BirthRequest & { sunSign?: string; moonSign?: string; risingSign?: string };
  try {
    body = await req.json() as BirthRequest & { sunSign?: string; moonSign?: string; risingSign?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.year || !body?.month || !body?.day) {
    return NextResponse.json({ error: "year, month, and day are required." }, { status: 400 });
  }

  const { city, country } = splitCityCountry(body.city);
  const { iso, display, full } = formatBirthday(body);
  const age = computeAge({ year: body.year, month: body.month, day: body.day });
  const ip = getClientIp(req);
  const ipLocation = resolveIpLocation(ip);

  // If no name was provided, fall back to "City, Country" as the identifier.
  const identifier = body.name?.trim() || (city && country ? `${city}, ${country}` : city || "Anonymous");

  // The user's claimed location string — what they typed into the form.
  const claimedLocation = city && country ? `${city}, ${country}` : city || "Unknown";

  // The (location, ip) pair the owner asked for, so they can spot liars.
  const locationAndIp = `(${claimedLocation}, ${ip || "ip unknown"})`;

  const record: SubmissionRecord = {
    timestamp: new Date().toISOString(),
    name: body.name?.trim() || undefined,
    identifier,
    city,
    country,
    age,
    birthday: iso,
    birthdayDisplay: display,
    fullBirthday: full,
    timeKnown: !!body.timeKnown,
    gender: body.gender,
    sunSign: body.sunSign,
    moonSign: body.moonSign,
    risingSign: body.risingSign,
    locationAndIp,
    ip,
    ipLocation,
  };

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(DATA_FILE, JSON.stringify(record) + "\n", "utf8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Could not save submission: ${msg}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, identifier });
}

// ===========================================================================
// GET — token-protected view of all submissions.
// Use: GET /api/collect?token=YOUR_TOKEN
// Returns JSON { count, records } if the token matches, 403 otherwise.
// ===========================================================================
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (token !== VIEW_TOKEN) {
    return NextResponse.json(
      { error: "Unauthorized. Append ?token=YOUR_TOKEN to the URL." },
      { status: 403 }
    );
  }

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const records = lines.map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
    return NextResponse.json({
      count: records.length,
      viewTokenHint: "Anyone with this URL can view the data. Keep it private.",
      records,
    });
  } catch {
    return NextResponse.json({ count: 0, records: [] });
  }
}
