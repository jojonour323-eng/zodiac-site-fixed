// ===========================================================================
// GENERATE — z-ai SDK calls, tolerant parsing, retry, and packaging
// ---------------------------------------------------------------------------
// Everything is server-only. The model receives the locally computed digest;
// responses are parsed with a TOLERANT sanitizer (LLMs drift on JSON shapes:
// single string vs array, missing optional fields, long labels — all fine as
// long as the substance is there) and converted into the exact payload shapes
// the UI already renders, so AI content drops into existing components
// without layout changes. Any failed task degrades to the deterministic
// version for that part only.
// ===========================================================================

import ZAI from "z-ai-web-dev-sdk";
import type { ChartDigest } from "./digest";
import {
  systemPrompt, identityPrompt, readingPrompt, soulmatePrompt,
  compatPrompt,
} from "./prompts";
import type { ReadingSection } from "../readingEngine";
import type { CompatPayload } from "../types";

const CALL_TIMEOUT_MS = 170_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Raw chat call with hard timeout, empty-response guard and 429 backoff. */
async function chat(system: string, user: string): Promise<string> {
  let lastErr: unknown = null;
  const waits = [2_000, 8_000, 18_000, 30_000];
  for (let attempt = 0; attempt < waits.length; attempt++) {
    try {
      const zai = await ZAI.create();
      const work = (async () => {
        const completion = await zai.chat.completions.create({
          messages: [
            { role: "assistant", content: system },
            { role: "user", content: user },
          ],
          thinking: { type: "disabled" },
        });
        return completion.choices[0]?.message?.content ?? "";
      })();
      const timeout = new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("ai-timeout")), CALL_TIMEOUT_MS)
      );
      const text = await Promise.race([work, timeout]);
      if (!text || text.trim().length === 0) throw new Error("empty ai response");
      return text;
    } catch (err) {
      lastErr = err;
      const msg = String(err);
      // Rate limit / transient server errors: wait it out and retry.
      const transient =
        msg.includes("429") || msg.includes("Too many requests") ||
        msg.includes("500") || msg.includes("502") || msg.includes("503");
      if (transient && attempt < waits.length - 1) {
        await sleep(waits[attempt]);
        continue;
      }
      if (!transient && attempt >= 1) break;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/** Extract the first JSON object from a possibly chatty response. */
function extractJson(raw: string): unknown {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  const start = s.indexOf("{");
  if (start > 0) s = s.slice(start);
  const lastBrace = s.lastIndexOf("}");
  if (lastBrace !== -1 && lastBrace < s.length - 1) s = s.slice(0, lastBrace + 1);
  try {
    return JSON.parse(s);
  } catch {
    const cleaned = s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
    return JSON.parse(cleaned);
  }
}

async function parseTolerant(
  makeCall: () => Promise<string>,
  label: string,
): Promise<unknown> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await makeCall();
      return extractJson(raw);
    } catch (err) {
      lastErr = err;
      await sleep(3_000);
    }
  }
  throw new Error(`${label} generation failed: ${String(lastErr).slice(0, 200)}`);
}

// ---------------------------------------------------------------------------
// Tolerant sanitizers — coerce instead of reject.
// ---------------------------------------------------------------------------

const strArr = (v: unknown, max = 8): string[] => {
  if (typeof v === "string") return v.trim() ? [v] : [];
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter(Boolean).slice(0, max);
};
const s = (v: unknown): string => String(v ?? "").trim();

export interface SanIdentity {
  title: string; paragraphs: string[];
  archetype: { label: string; reason: string };
}
export interface SanSection {
  id: string; title: string; label?: string;
  paragraphs: string[]; bullets?: string[]; scenario?: string;
}
export interface SanReading { intro: string; sections: SanSection[] }
export interface SanSoulmate {
  archetype: { label: string; why: string };
  sections: { id: string; title: string; body: string }[];
  greenFlags: string[]; redFlags: string[]; growthLesson: string;
}
export interface SanCompat {
  headline: { emoji?: string; label: string; why: string };
  areaNotes: Record<string, string>;
  sections: { id: string; title: string; body: string }[];
  frictionPoint: { title: string; body: string };
  toxicityRisk: string;
  eachNeeds: { a: string; b: string };
  strongest: { label: string; body: string }[];
  hardest: { label: string; body: string }[];
}

function sanitizeIdentity(v: unknown): SanIdentity {
  const o = v as Record<string, Record<string, unknown> & { paragraphs?: unknown }>;
  const paragraphs = strArr(o?.paragraphs, 6).filter((p) => p.length > 30);
  if (!(o?.title && s(o.title).length > 1) || paragraphs.length < 2)
    throw new Error("identity output unusable");
  const arch = o.archetype ?? {};
  return {
    title: s(o.title).slice(0, 90),
    paragraphs,
    archetype: {
      label: (s(arch.label) || "Undated Original").slice(0, 50),
      reason: s(arch.reason).slice(0, 400),
    },
  };
}

function sanitizeReading(v: unknown): SanReading {
  const o = v as { intro?: unknown; sections?: unknown };
  const rawSections = Array.isArray(o?.sections) ? o.sections : [];
  const seen = new Set<string>();
  const sections: SanSection[] = [];
  for (const r of rawSections) {
    const sec = r as Record<string, unknown>;
    const title = s(sec.title);
    if (!title) continue;
    const paragraphs = strArr(sec.paragraphs, 8).filter((p) => p.length > 25);
    if (paragraphs.length === 0) continue;
    let id = s(sec.id).toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
    if (!id) id = `sec-${sections.length}`;
    if (seen.has(id)) id = `${id}-${sections.length}`;
    seen.add(id);
    const out: SanSection = {
      id,
      title: title.slice(0, 110),
      paragraphs,
    };
    const label = s(sec.label);
    if (label && label.length <= 90) out.label = label;
    const bullets = strArr(sec.bullets, 5);
    if (bullets.length >= 2) out.bullets = bullets.map((b) => b.slice(0, 260));
    const scenario = s(sec.scenario);
    if (scenario && scenario.length > 20) out.scenario = scenario.slice(0, 420);
    sections.push(out);
  }
  if (sections.length < 4) throw new Error(`reading output unusable (${sections.length} valid sections)`);
  return { intro: s(o.intro).slice(0, 400), sections: sections.slice(0, 26) };
}

function sanitizeSoulmate(v: unknown): SanSoulmate {
  const o = v as Record<string, unknown>;
  const rawSections = Array.isArray(o?.sections) ? o.sections : [];
  const seenIds = new Set<string>();
  const sections = rawSections
    .map((r, i) => {
      const sec = r as Record<string, unknown>;
      let id = s(sec.id).slice(0, 40);
      if (!id) id = s(sec.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || `sec-${i}`;
      if (seenIds.has(id)) id = `${id}-${i}`;
      seenIds.add(id);
      return { id, title: s(sec.title).slice(0, 90), body: s(sec.body).slice(0, 2400) };
    })
    .filter((x) => x.id && x.body.length > 30)
    .slice(0, 12);
  if (sections.length < 5) throw new Error("soulmate output unusable");
  const arch = (o.archetype ?? {}) as Record<string, unknown>;
  return {
    archetype: {
      label: (s(arch.label) || "The Unknown Quantity").slice(0, 44),
      why: s(arch.why).slice(0, 400),
    },
    sections,
    greenFlags: strArr(o.greenFlags, 4),
    redFlags: strArr(o.redFlags, 4),
    growthLesson: s(o.growthLesson).slice(0, 600),
  };
}

function sanitizeCompat(v: unknown): SanCompat {
  const o = v as Record<string, unknown>;
  const rawSections = Array.isArray(o?.sections) ? o.sections : [];
  const slug = (id: string, title: string, idx: number) => {
    const fromId = id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (fromId) return fromId.slice(0, 40);
    const fromTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    return fromTitle || `sec-${idx}`;
  };
  const sections = rawSections
    .map((r, i) => {
      const sec = r as Record<string, unknown>;
      return { id: slug(s(sec.id), s(sec.title), i), title: s(sec.title).slice(0, 90), body: s(sec.body).slice(0, 2400) };
    })
    .filter((x) => x.id && x.body.length > 35)
    .slice(0, 9);
  const rawAreas = Array.isArray(o?.areas) ? o.areas : [];
  const areaNotes: Record<string, string> = {};
  for (const a of rawAreas) {
    const rec = a as Record<string, unknown>;
    const key = s(rec.key);
    const note = s(rec.note);
    if (key && note) areaNotes[key] = note.slice(0, 220);
  }
  const head = (o.headline ?? {}) as Record<string, unknown>;
  const fr = (o.frictionPoint ?? {}) as Record<string, unknown>;
  const en = (o.eachNeeds ?? {}) as Record<string, unknown>;
  if (sections.length < 4 || !areaNotes || Object.keys(areaNotes).length < 3)
    throw new Error("compat output unusable");
  return {
    headline: {
      ...(typeof head.emoji === "string" && head.emoji.length <= 4 ? { emoji: head.emoji } : {}),
      label: (s(head.label) || "The Meeting Point").slice(0, 48),
      why: s(head.why).slice(0, 400),
    },
    areaNotes,
    sections,
    frictionPoint: { title: (s(fr.title) || "The friction pattern").slice(0, 70), body: s(fr.body).slice(0, 900) },
    toxicityRisk: s(o.toxicityRisk).slice(0, 700),
    eachNeeds: { a: s(en.a).slice(0, 500), b: s(en.b).slice(0, 500) },
    strongest: (Array.isArray(o.strongest) ? o.strongest : []).slice(0, 3)
      .map((r) => { const x = r as Record<string, unknown>; return { label: s(x.label).slice(0, 70), body: s(x.body).slice(0, 800) }; })
      .filter((x) => x.label && x.body),
    hardest: (Array.isArray(o.hardest) ? o.hardest : []).slice(0, 3)
      .map((r) => { const x = r as Record<string, unknown>; return { label: s(x.label).slice(0, 70), body: s(x.body).slice(0, 800) }; })
      .filter((x) => x.label && x.body),
  };
}

// ---------------------------------------------------------------------------
// Public API — one task per concern so partial success still upgrades the UI.
// ---------------------------------------------------------------------------

export async function generateIdentity(digest: ChartDigest, archHint: string): Promise<SanIdentity> {
  return sanitizeIdentity(
    await parseTolerant(() => chat(systemPrompt("identity"), identityPrompt(digest, archHint)), "identity"),
  );
}

export interface DeepSections { intro: string; sections: ReadingSection[] }

/** Convert sanitized AI sections into the UI's ReadingSection block format. */
function mapToReadingSections(r: SanReading): DeepSections {
  const sections: ReadingSection[] = r.sections.map((sn) => {
    const blocks: ReadingSection["blocks"] = sn.paragraphs.map((t) => ({
      type: "paragraph" as const, text: t,
    }));
    if (sn.bullets?.length) blocks.push({ type: "bullets", items: sn.bullets });
    if (sn.scenario) blocks.push({ type: "example", text: sn.scenario });
    return {
      id: sn.id,
      title: sn.title,
      ...(sn.label ? { label: sn.label } : {}),
      blocks,
    };
  });
  return { intro: r.intro, sections };
}

export async function generateReading(digest: ChartDigest, ringsSummary: string): Promise<DeepSections> {
  const r = sanitizeReading(
    await parseTolerant(() => chat(systemPrompt("reading"), readingPrompt(digest, ringsSummary)), "reading"),
  );
  return mapToReadingSections(r);
}

export async function generateSoulmate(digest: ChartDigest): Promise<SanSoulmate> {
  return sanitizeSoulmate(
    await parseTolerant(() => chat(systemPrompt("soulmate"), soulmatePrompt(digest)), "soulmate"),
  );
}

export async function generateCompat(
  digestA: ChartDigest, digestB: ChartDigest,
  synastrySummary: string, scoresJson: string,
  nameA: string, nameB: string,
): Promise<SanCompat> {
  return sanitizeCompat(
    await parseTolerant(
      () => chat(systemPrompt("compat"),
        compatPrompt(digestA, digestB, synastrySummary, scoresJson, nameA, nameB)),
      "compat",
    ),
  );
}

// ---------------------------------------------------------------------------

/**
 * Apply an AI compat result over the deterministic one:
 * numbers stay computed; words get upgraded in place.
 */
export function mergeCompatAi(base: CompatPayload, ai: SanCompat): CompatPayload {
  const areas = base.areas.map((a) => {
    const note = ai.areaNotes[a.key];
    return note ? { ...a, note } : a;
  });
  return {
    ...base,
    areas,
    headline: {
      emoji: ai.headline.emoji || base.headline.emoji,
      label: ai.headline.label || base.headline.label,
      why: ai.headline.why || base.headline.why,
    },
    sections: ai.sections,
    frictionPoint: ai.frictionPoint.title ? ai.frictionPoint : base.frictionPoint,
    toxicityRisk: ai.toxicityRisk || base.toxicityRisk,
    eachNeeds: ai.eachNeeds.a || ai.eachNeeds.b
      ? { a: [ai.eachNeeds.a].filter(Boolean), b: [ai.eachNeeds.b].filter(Boolean) }
      : base.eachNeeds,
    strongest: ai.strongest.length ? ai.strongest : base.strongest,
    hardest: ai.hardest.length ? ai.hardest : base.hardest,
  };
}
