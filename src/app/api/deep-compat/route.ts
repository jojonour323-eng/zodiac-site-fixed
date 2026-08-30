// ===========================================================================
// /api/deep-compat — LLM deep compatibility narrative for two real charts
// ---------------------------------------------------------------------------
// POST: { personA: BirthRequest, personB: BirthRequest }
// Numbers are always computed locally; the model only writes the words and
// must honestly match the given scores. Deterministic CompatPayload stays
// the fallback if generation fails.
// ===========================================================================

import { NextResponse } from "next/server";
import { fetchSynastry } from "@/lib/astro/local";
import { buildCompatPayload } from "@/lib/astro/personality/payload";
import { buildChartDigest } from "@/lib/astro/ai/digest";
import { cacheKey, cacheGet, cacheSet } from "@/lib/astro/ai/cache";
import { generateCompat, mergeCompatAi } from "@/lib/astro/ai/generate";
import type { BirthRequest } from "@/lib/astro/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  let body: { personA?: BirthRequest; personB?: BirthRequest };
  try {
    body = (await req.json()) as { personA?: BirthRequest; personB?: BirthRequest };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { personA, personB } = body;
  if (!personA?.year || !personB?.year || !personA?.city || !personB?.city) {
    return NextResponse.json(
      { error: "personA and personB need year/month/day + city each." },
      { status: 400 },
    );
  }

  try {
    const raw = await fetchSynastry(personA, personB);
    const nameA = (personA.name ?? "").trim() || "Person A";
    const nameB = (personB.name ?? "").trim() || "Person B";
    const gA = personA.gender ?? null;
    const gB = personB.gender ?? null;

    // Deterministic base = fixed numbers + fallback copy.
    const compat = buildCompatPayload(raw, gA, gB);

    const keyObj = {
      a: { y: personA.year, m: personA.month, d: personA.day, h: personA.hour ?? 12, mi: personA.minute ?? 0, c: (personA.city ?? "").toLowerCase(), lat: personA.lat ?? null, lng: personA.lng ?? null },
      b: { y: personB.year, m: personB.month, d: personB.day, h: personB.hour ?? 12, mi: personB.minute ?? 0, c: (personB.city ?? "").toLowerCase(), lat: personB.lat ?? null, lng: personB.lng ?? null },
      genderA: gA, genderB: gB,
      names: [nameA.toLowerCase(), nameB.toLowerCase()],
    };
    const key = cacheKey("compat", keyObj);
    const cached = cacheGet<{ compat: unknown }>(key);
    if (cached?.compat) return NextResponse.json({ deep: cached.compat });

    const digestA = buildChartDigest(raw.natal.person_a, { name: nameA, gender: gA });
    const digestB = buildChartDigest(raw.natal.person_b, { name: nameB, gender: gB });

    const aspectsTop = raw.synastry.aspects
      .slice()
      .sort((x, y) => y.strength - x.strength)
      .slice(0, 14)
      .map((a) => ({
        contact: `${nameA}'s ${humanPoint(a.a_point)} ${a.aspect} ${nameB}'s ${humanPoint(a.b_point)}`,
        nature: a.polarity,
        strength: a.strength_label,
      }));

    const synastrySummary = JSON.stringify(aspectsTop);
    const scoresJson = JSON.stringify({
      overall: compat.overall,
      areas: compat.areas.map((a) => ({ key: a.key, label: a.label, value: a.value })),
    });

    const ai = await generateCompat(digestA, digestB, synastrySummary, scoresJson, nameA, nameB);
    const merged = mergeCompatAi(compat, ai);
    cacheSet(key, { compat: merged });
    return NextResponse.json({ deep: merged });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Deep compatibility is unavailable right now. ${msg}` },
      { status: 502 },
    );
  }
}

function humanPoint(p: string): string {
  return p
    .replace(/asc/i, "Ascendant")
    .replace(/mc/i, "Midheaven")
    .replace(/dc/i, "Descendant")
    .replace(/ic/i, "IC")
    .replace(/_/, " ");
}
