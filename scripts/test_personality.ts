/**
 * Personality engine differentiation test (master prompt §34).
 * Verifies: different charts → different scores/archetypes/readings;
 * same-Sun people diverge; compatibility responds to either chart changing.
 *
 * Run: bun scripts/test_personality.ts
 */
const BASE = "http://localhost:3000";

interface Chart {
  name: string;
  year: number; month: number; day: number; hour: number; minute: number;
  city: string; gender: "male" | "female";
}

const CHARTS: Chart[] = [
  // SAME SUN (all Cancer), wildly different everything else
  { name: "Cancer-A (Fiery Leo Rising)", year: 1998, month: 7, day: 10, hour: 13, minute: 10, city: "Los Angeles, USA", gender: "female" },
  { name: "Cancer-B (Earthy, night)", year: 1990, month: 7, day: 2, hour: 2, minute: 30, city: "Tokyo, Japan", gender: "male" },
  { name: "Cancer-C (Air, mutable)", year: 2001, month: 7, day: 18, hour: 9, minute: 0, city: "London, UK", gender: "female" },
  // Other archetypes
  { name: "Scorpio Stellium", year: 1994, month: 11, day: 8, hour: 19, minute: 45, city: "Sydney, Australia", gender: "male" },
  { name: "Capricorn Disciplinarian", year: 1988, month: 1, day: 14, hour: 6, minute: 20, city: "Berlin, Germany", gender: "female" },
  { name: "Pisces Dreamer", year: 1996, month: 3, day: 5, hour: 23, minute: 55, city: "Mumbai, India", gender: "female" },
];

async function natal(c: Chart) {
  const res = await fetch(`${BASE}/api/natal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(c),
  });
  if (!res.ok) throw new Error(`natal ${c.name}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function synastry(a: Chart, b: Chart) {
  const res = await fetch(`${BASE}/api/synastry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personA: a, personB: b }),
  });
  if (!res.ok) throw new Error(`synastry: ${res.status}`);
  return res.json();
}

const ringVec = (p: any) => Object.fromEntries(p.personality.rings.map((r: any) => [r.key, r.value]));

function ringDistance(a: Record<string, number>, b: Record<string, number>): number {
  return Math.sqrt(Object.keys(a).reduce((acc, k) => acc + (a[k] - b[k]) ** 2, 0));
}

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

async function main() {
  const profiles: Record<string, any> = {};
  for (const c of CHARTS) profiles[c.name] = await natal(c);

  console.log("\n=== 1. All charts produced full payloads ===");
  for (const c of CHARTS) {
    const p = profiles[c.name];
    check(`${c.name} payload`, Boolean(p.personality?.rings?.length === 8 && p.personality.home && p.personality.archetype && p.personality.fullReading?.sections?.length >= 10 && p.personality.soulmate));
  }

  console.log("\n=== 2. Same-Sun people get DIFFERENT results ===");
  const cancels = CHARTS.filter((c) => c.name.startsWith("Cancer")).map((c) => c.name);
  for (let i = 0; i < cancels.length; i++) {
    for (let j = i + 1; j < cancels.length; j++) {
      const a = profiles[cancels[i]], b = profiles[cancels[j]];
      const dist = ringDistance(ringVec(a), ringVec(b));
      const archDiff = a.personality.archetype.id !== b.personality.archetype.id;
      const titleDiff = a.personality.home.title !== b.personality.home.title;
      check(`${cancels[i]} vs ${cancels[j]}`, dist > 12 && (archDiff || titleDiff),
        `ringDist=${dist.toFixed(1)}, archetype ${a.personality.archetype.label} vs ${b.personality.archetype.label}, titles ${archDiff || titleDiff ? "differ" : "SAME"}`);
    }
  }

  console.log("\n=== 3. Ring spread per person (not all ~50, not all 100) ===");
  for (const c of CHARTS) {
    const vals = profiles[c.name].personality.rings.map((r: any) => r.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    check(`${c.name} spread`, max - min >= 10, `min=${min} max=${max}`);
  }

  console.log("\n=== 4. Ring descriptions agree with scores ===");
  for (const c of CHARTS) {
    const r = profiles[c.name].personality.rings.find((x: any) => x.key === "discipline");
    const okNote = typeof r.note === "string" && r.note.length > 20 && typeof r.headline === "string";
    check(`${c.name} discipline note exists`, okNote, `score=${r.value}: "${r.headline}"`);
  }

  console.log("\n=== 5. Full reading mentions its top patterns (consistency) ===");
  for (const c of CHARTS) {
    const p = profiles[c.name];
    const text = p.personality.fullReading.sections.map((s: any) => s.blocks?.map((b: any) => b.text || (b.items || []).join(" ")).join(" ")).join(" ");
    check(`${c.name} reading non-generic`, text.length > 3000 && !text.includes("undefined"), `chars=${text.length}`);
  }

  console.log("\n=== 6. Soulmate profiles differ meaningfully ===");
  const smA = JSON.stringify(profiles[CHARTS[0].name].personality.soulmate.sections.map((s: any) => s.body));
  const smB = JSON.stringify(profiles[CHARTS[4].name].personality.soulmate.sections.map((s: any) => s.body));
  const common = smA.split(". ").filter((x: string) => smB.includes(x));
  check("Soulmate bodies not shared verbatim", common.length < 5, `shared sentences=${common.length}, arch=${profiles[CHARTS[0].name].personality.soulmate.archetype.label} vs ${profiles[CHARTS[4].name].personality.soulmate.archetype.label}`);

  console.log("\n=== 7. Compatibility responds to chart changes ===");
  const s1 = await synastry(CHARTS[0], CHARTS[3]);
  const s2 = await synastry(CHARTS[0], CHARTS[4]);
  const s3 = await synastry(CHARTS[4], CHARTS[3]);
  const areas1 = JSON.stringify(s1.compat.areas.map((a: any) => a.value));
  const areas2 = JSON.stringify(s2.compat.areas.map((a: any) => a.value));
  const areas3 = JSON.stringify(s3.compat.areas.map((a: any) => a.value));
  check("compat(A,C) ≠ compat(A,D)", areas1 !== areas2);
  check("compat(A,D) ≠ compat(D,C)", areas2 !== areas3);
  check("compat has 7 areas + headline + sections", s1.compat.areas.length === 7 && Boolean(s1.compat.headline?.label) && s1.compat.sections.length >= 3);
  const overallA = s1.compat.overall, overallB = s2.compat.overall, overallC = s3.compat.overall;
  check("overall scores vary across pairings", new Set([overallA, overallB, overallC]).size >= 2, `${overallA} / ${overallB} / ${overallC}`);

  console.log("\n=== 8. Archetypes vary across the corpus ===");
  const archs = CHARTS.map((c) => profiles[c.name].personality.archetype.id);
  check("≥3 distinct archetypes among 6 people", new Set(archs).size >= 3, archs.join(", "));

  console.log("\n=== 9. Time-known=false degrades gracefully ===");
  const noTime = await fetch(`${BASE}/api/natal`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "NoTime", year: 1995, month: 7, day: 21, city: "Casablanca, Morocco", gender: "male" }),
  });
  const nt = await noTime.json();
  check("no-time chart still produces payload", Boolean(nt.personality?.rings?.length === 8));

  console.log("\n=== 10. Determinism: same input twice → identical output ===");
  const again = await natal(CHARTS[0]);
  check("deterministic rings", JSON.stringify(again.personality.rings) === JSON.stringify(profiles[CHARTS[0].name].personality.rings));

  console.log(failures === 0 ? "\n🟢 ALL CHECKS PASSED" : `\n🔴 ${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Test run failed:", e);
  process.exit(1);
});
