import { gv } from "../src/lib/astro/personality/deep/voice";
const cases: [string,string][] = [
  ["They don't apologize for it. They do it because they must.", "neg+do"],
  ["She just refuse to perform it.", "adv fix (authored-wrong shown for demo)"],
  ["They just refuse to quit.", "adv refuse"],
  ["They often wonder what their life would look like elsewhere.", "adv wonder"],
  ["When someone finally sees them, they never let that go unnoticed.", "never let"],
  ["They push limits, then they watch everyone recover.", "explicit second subject"],
];
for (const [text] of cases) console.log("F:", gv(text,"female"), "\nM:", gv(text,"male"), "\n");
