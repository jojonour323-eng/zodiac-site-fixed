/**
 * Find real birth dates (via the live dev-server natal API + the kink engine)
 * that trigger each kink branch, to eyeball-verify the on-page wording.
 * Run: bun scripts/find_branch_charts.ts   (dev server on :3000 required)
 */
import { buildKinkChartProfile } from "../src/lib/astro/personality/kink";
import type { NatalProfile } from "../src/lib/astro/types";

async function probe(year: number, month: number, day: number) {
  const res = await fetch("http://localhost:3000/api/natal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "probe", year, month, day, hour: 12, minute: 0, city: "Cairo", timeKnown: true, gender: "male" }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const profile = (await res.json()) as NatalProfile;
  const r = buildKinkChartProfile(profile);
  const dom = r.axes.find((a) => a.key === "control")!.value;
  const sub = r.axes.find((a) => a.key === "submission")!.value;
  const signOf = (id: string) => profile.planets.find((x) => x.id === id)?.signId ?? "?";
  return { date: `${year}-${month}-${day}`, dom, sub, verdict: r.verdict.label, mars: signOf("mars"), venus: signOf("venus"), bullet: r.interpretation[0], dialControl: r.axes.find((a) => a.key === "control")!.note, dialSub: r.axes.find((a) => a.key === "submission")!.note };
}

async function scan(days: [number, number, number][], want: (x: { dom: number; sub: number }) => boolean, label: string) {
  for (const [y, m, d] of days) {
    try {
      const x = await probe(y, m, d);
      if (want(x)) {
        console.log(`\n[${label}] ${x.date} — Mars in ${x.mars}, Venus in ${x.venus}`);
        console.log(`  dom=${x.dom} sub=${x.sub} verdict=${x.verdict}`);
        console.log(`  bullet: ${x.bullet}`);
        console.log(`  dial control: ${x.dialControl}`);
        console.log(`  dial submission: ${x.dialSub}`);
        return x;
      }
    } catch (e) {
      console.log(`  ${y}-${m}-${d} probe error: ${(e as Error).message}`);
    }
  }
  console.log(`\n[${label}] no match found`);
  return null;
}

const monthDays = (y: number, m: number) => Array.from({ length: 28 }, (_, i) => [y, m, i + 1] as [number, number, number]);

// SUB branch: Venus strong (Pisces/Cancer/Scorpio), Mars weak (Cancer/Libra/Pisces)
const subHit = await scan([
  ...monthDays(2001, 6), ...monthDays(2001, 7), ...monthDays(2002, 2), ...monthDays(2002, 3),
  ...monthDays(2003, 3), ...monthDays(2003, 4), ...monthDays(2005, 2), ...monthDays(2005, 3),
], (x) => x.sub >= 55 && x.dom < 55, "SUB");

console.log(subHit ? "FOUND SUB" : "no sub");
