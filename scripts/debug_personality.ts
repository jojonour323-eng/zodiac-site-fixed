/** Debug: print dimension profile + archetype scores for a chart. */
const BASE = "http://localhost:3000";

const CHARTS = [
  { name: "Cancer-A", year: 1998, month: 7, day: 10, hour: 13, minute: 10, city: "Los Angeles, USA", gender: "female" as const },
  { name: "Cancer-B", year: 1990, month: 7, day: 2, hour: 2, minute: 30, city: "Tokyo, Japan", gender: "male" as const },
  { name: "Capricorn", year: 1988, month: 1, day: 14, hour: 6, minute: 20, city: "Berlin, Germany", gender: "female" as const },
];

async function main() {
  for (const c of CHARTS) {
    const res = await fetch(`${BASE}/api/natal`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c),
    });
    const p = await res.json();
    console.log(`\n===== ${c.name} — Sun ${p.sun.signName}, Moon ${p.moon.signName}, Rising ${p.ascendant.signName} =====`);
    const sorted = [...p.personality.scores].sort((a: any, b: any) => Math.abs(b.value - 50) - Math.abs(a.value - 50));
    console.log(sorted.map((s: any) => `${s.key}=${s.value}`).join("  "));
    console.log("archetype:", p.personality.archetype.id, "| rings:", p.personality.rings.map((r: any) => `${r.key}=${r.value}`).join(" "));
    const drivers = sorted[0].drivers;
    console.log("top drivers of", sorted[0].key, ":", drivers.map((d: any) => `${d.source}(${d.delta})`).join("; "));
  }
}
main();
