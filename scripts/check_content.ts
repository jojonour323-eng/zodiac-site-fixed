import { SIGNS_1 } from "../src/lib/astro/personality/deep/signContent1";
import { SIGNS_2 } from "../src/lib/astro/personality/deep/signContent2";
import { SIGNS_3 } from "../src/lib/astro/personality/deep/signContent3";
const all = { ...SIGNS_1, ...SIGNS_2, ...SIGNS_3 };
const need = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
let missing = 0;
for (const s of need) {
  const c = (all as any)[s];
  if (!c) { console.log("MISSING", s); missing++; continue; }
  for (const planet of ["sun","moon","rising","mercury","venus","mars"]) {
    if (!c[planet]) { console.log("MISSING", s, planet); missing++; continue; }
    for (const [k,v] of Object.entries(c[planet] as Record<string, unknown>)) {
      if (!Array.isArray(v) || v.length === 0) { console.log("EMPTY", s, planet, k); missing++; }
    }
  }
}
console.log(missing === 0 ? "ALL CONTENT PRESENT: 12 signs x 6 planets" : `problems: ${missing}`);
// sample voice transform
