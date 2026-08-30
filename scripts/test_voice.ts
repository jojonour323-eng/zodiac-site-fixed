import { gv } from "../src/lib/astro/personality/deep/voice";
const samples = [
  "They are wired to move first and they don't apologize for it. Their people know this about them.",
  "When hurt, they retreat into themselves; their partner must notice them. They want to be chased, but they'd never say so.",
  "They push past limits most people respect, then watch everyone recover from what took them ten minutes.",
  "Trust operates like a checkpoint system: tests run unconsciously, loyalty gets verified repeatedly.",
  "They process feelings slowly, in waves. They're fine eventually — but today they're not.",
  "At their limit, the exit is clean: bags packed, doors closed, decisions announced mid-stride.",
];
for (const g of ["female","male",null] as const) {
  console.log(`--- ${g ?? "neutral"} ---`);
  for (const s of samples) console.log(" · " + gv(s, g));
}

console.log("=== extended ===");
const more = [
  "They have built this from nothing, and they won't hand it over.",
  "They don't need anyone — but they notice everything.",
  "They go quiet. They're not angry; they're calculating.",
  "Their story changed twice since Tuesday.",
  "They can hold almost anything. They just refuse to perform it.",
];
for (const g of ["female","male"] as const) {
  console.log(`--- ${g} ---`);
  for (const s of more) console.log(" · " + gv(s, g));
}
