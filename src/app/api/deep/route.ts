// ===========================================================================
// /api/deep — LLM-powered deep reading generation for one natal chart
// ---------------------------------------------------------------------------
// POST: BirthRequest (same body as /api/natal).
// Flow: local chart math first (unchanged), deterministic personality payload
// second (fallback + consistency context), then three independent AI tasks
// (identity portrait / deep reading / soulmate psychology) run in parallel.
// Every part that succeeds upgrades the UI; every part that fails silently
// keeps its deterministic version.
// ===========================================================================

import { NextResponse } from "next/server";
import { fetchNatal } from "@/lib/astro/local";
import { buildPersonalityPayload } from "@/lib/astro/personality/payload";
import { buildChartDigest } from "@/lib/astro/ai/digest";
import { cacheKey, cacheGet, cacheSet } from "@/lib/astro/ai/cache";
import { generateIdentity, generateReading, generateSoulmate, type DeepSections } from "@/lib/astro/ai/generate";
import type { BirthRequest } from "@/lib/astro/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  let body: BirthRequest;
  try {
    body = (await req.json()) as BirthRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body?.year || !body?.month || !body?.day || !body?.city) {
    return NextResponse.json(
      { error: "year, month, day and city are required." },
      { status: 400 },
    );
  }

  const gender = body.gender ?? null;

  try {
    // Deterministic base (also the fallback content + consistency context).
    const natal = await fetchNatal(body);
    const personality = buildPersonalityPayload(natal, gender);

    // Cache short-circuit. Name + gender participate in the key so a person
    // changing their gender gets gender-aware output regenerated.
    const keyObj = {
      year: body.year, month: body.month, day: body.day,
      hour: body.hour ?? 12, minute: body.minute ?? 0,
      city: (body.city ?? "").toLowerCase(),
      lat: body.lat ?? null, lng: body.lng ?? null,
      tzStr: body.tzStr ?? null,
      timeKnown: body.timeKnown ?? true,
      gender,
      name: (body.name ?? "").toLowerCase().trim() || undefined,
    };
    const key = cacheKey("deep", keyObj);

    const cached = cacheGet<{
      identity?: unknown; fullReading?: DeepSections; soulmate?: unknown;
    }>(key);
    if (cached && cached.fullReading?.sections?.length) {
      return NextResponse.json({ deep: cached });
    }

    const digest = buildChartDigest(natal, { name: body.name, gender });
    const ringsSummary = personality.rings
      .map((r) => `${r.label} ${r.value}/100 — ${r.headline}`)
      .join("; ");
    const archHint = [
      `${personality.archetype.label}`,
      ...personality.archetype.runnerUps.map((r) => r.label),
    ].join(", ");

    // Sequential (reading first — biggest + most important) to stay under
    // rate limits; each success is written to cache immediately, so an
    // interrupted request only ever regenerates the missing pieces.
    const deep: {
      identity?: unknown; fullReading?: DeepSections; soulmate?: unknown;
    } = cached ?? {};

    const tasks: [string, () => Promise<unknown>][] = [
      ["fullReading", () => generateReading(digest, ringsSummary)],
      ["soulmate", () => generateSoulmate(digest)],
      ["identity", () => generateIdentity(digest, archHint)],
    ];

    for (const [slot, task] of tasks) {
      if (deep[slot as keyof typeof deep]) continue;
      try {
        deep[slot as keyof typeof deep] = (await task()) as never;
        if (deep.fullReading) cacheSet(key, deep);
      } catch (err) {
        console.error(`[deep] ${slot}:`, String(err).slice(0, 400));
      }
    }

    return NextResponse.json({ deep });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Deep analysis is unavailable right now. ${msg}` },
      { status: 502 },
    );
  }
}
