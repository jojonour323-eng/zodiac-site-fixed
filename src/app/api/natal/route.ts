import { NextResponse } from "next/server";
import { fetchNatal } from "@/lib/astro/local";
import { mapNatalProfile } from "@/lib/astro/mappers";
import type { BirthRequest } from "@/lib/astro/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: BirthRequest;
  try {
    body = (await req.json()) as BirthRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.year || !body?.month || !body?.day) {
    return NextResponse.json(
      { error: "year, month, and day are required." },
      { status: 400 }
    );
  }
  if (!body?.city) {
    return NextResponse.json(
      { error: "Birth city is required — your Rising sign and houses depend on it." },
      { status: 400 }
    );
  }

  try {
    const raw = await fetchNatal(body);
    const profile = mapNatalProfile(raw);
    return NextResponse.json(profile);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Surface a friendlier message when the geocoder can't find the city.
    const friendly = msg.includes("couldn't find that city")
      ? msg
      : `Something went wrong while computing your chart. ${msg}`;
    return NextResponse.json({ error: friendly }, { status: 502 });
  }
}
