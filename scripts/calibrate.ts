/**
 * Calibrate the personality engine: measure per-dimension mean raw ratio over
 * a corpus of random charts, then emit a CALIBRATION table that centers the
 * average chart at 50. Run whenever factor rules change.
 *
 * Run (server on :3000 with CALIBRATION zeros or previous values):
 *   bun scripts/calibrate.ts
 */
const N = 120;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CITIES = [
  "New York, USA", "London, UK", "Tokyo, Japan", "Sao Paulo, Brazil",
  "Sydney, Australia", "Lagos, Nigeria", "Mumbai, India", "Reykjavik, Iceland",
];

async function main() {
  const r = rng(20260826);
  const acc: Record<string, { sum: number; n: number }> = {};
  let ok = 0;
  const prevCal: Record<string, number> = {}; // load current table if present

  for (let i = 0; i < N; i++) {
    const year = 1955 + Math.floor(r() * 50);
    const month = 1 + Math.floor(r() * 12);
    const day = 1 + Math.floor(r() * 28);
    const hour = Math.floor(r() * 24);
    const minute = Math.floor(r() * 60);
    const city = CITIES[Math.floor(r() * CITIES.length)];
    try {
      const res = await fetch("http://localhost:3000/api/natal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Cal${i}`, year, month, day, hour, minute, city }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const p = await res.json();
      if (!p?.personality?.scores) throw new Error("no personality payload");
      for (const s of p.personality.scores) {
        // value = 50 + (rawRatio - prevCal) * 62  →  rawRatio = (v-50)/62 + prevCal
        const ratio = (s.value - 50) / 62 + (prevCal[s.key] ?? 0);
        (acc[s.key] ??= { sum: 0, n: 0 });
        acc[s.key].sum += ratio;
        acc[s.key].n += 1;
      }
      ok++;
    } catch (e) {
      console.error(`chart ${i} failed:`, (e as Error).message);
    }
  }

  console.log(`// corpus: ${ok}/${N} charts`);
  console.log("export const CALIBRATION: Partial<Record<Dimension, number>> = {");
  for (const k of Object.keys(acc).sort()) {
    console.log(`  ${k}: ${(acc[k].sum / acc[k].n).toFixed(4)},`);
  }
  console.log("};");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
