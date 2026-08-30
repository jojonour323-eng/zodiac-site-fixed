import { NextResponse } from "next/server";
import { fetchSynastry } from "@/lib/astro/local";
import { mapSynastryProfile } from "@/lib/astro/mappers";
import type { SynastryRequest } from "@/lib/astro/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: SynastryRequest;
  try {
    body = (await req.json()) as SynastryRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { personA, personB } = body || {};
  if (!personA?.year || !personB?.year) {
    return NextResponse.json(
      { error: "Both personA and personB need at least year/month/day." },
      { status: 400 }
    );
  }

  try {
    const raw = await fetchSynastry(personA, personB);
    const profile = mapSynastryProfile(raw, personA.gender ?? null, personB.gender ?? null);
    return NextResponse.json(profile);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Something went wrong while computing compatibility. ${msg}` },
      { status: 502 }
    );
  }
}
