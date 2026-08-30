// Distinctness test: two people with the SAME SUN SIGN but different
// moons/risings/houses/aspects must get clearly different AI packages.
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

const A = { name: "Layla", year: 2001, month: 8, day: 5, hour: 14, minute: 30, city: "Casablanca", tzOffset: 1, gender: "female" };
const B = { name: "Omar", year: 1990, month: 8, day: 10, hour: 3, minute: 15, city: "Cairo", tzOffset: 2, gender: "male" };

console.log("requesting deep for chart A...");
const ra = await post("/api/deep", A);
console.log("requesting deep for chart B...");
const rb = await post("/api/deep", B);

const da = ra.deep ?? {}, db = rb.deep ?? {};
const out = [];
for (const [label, d] of [["A", da], ["B", db]]) {
  out.push(`== ${label} ==`);
  out.push(`identity: ${d.identity ? d.identity.title + " | " + d.identity.archetype.label : "MISSING"}`);
  if (d.fullReading) {
    const sun = d.fullReading.sections.find((s) => s.id === "sun" || s.title.startsWith("Sun "));
    out.push(`sun-title: ${sun?.title}`);
    out.push(`sun-first-para: ${(sun?.blocks[0]?.text ?? "").slice(0, 220)}`);
    out.push(`sections: ${d.fullReading.sections.length} | ids: ${d.fullReading.sections.map((s) => s.id).join(",")}`);
  } else out.push("fullReading: MISSING");
  if (d.soulmate) out.push(`soulmate-arch: ${d.soulmate.archetype.label} (${d.soulmate.sections.length} sections)`);
}
console.log(out.join("\n"));

// hard differences check
const t1 = da.identity?.title ?? "", t2 = db.identity?.title ?? "";
const p1 = (da.fullReading?.sections.find((s) => s.id === "sun")?.blocks[0]?.text ?? "");
const p2 = (db.fullReading?.sections.find((s) => s.id === "sun")?.blocks[0]?.text ?? "");
const ok = t1 !== t2 && p1.slice(0, 120) !== p2.slice(0, 120);
writeFileSync("scripts/distinct-check.json", JSON.stringify({ t1, t2, pass: ok }, null, 2));
console.log(ok ? "\nPASS: outputs are distinct" : "\nFAIL: outputs too similar");
