import { gv } from "../src/lib/astro/personality/deep/voice";
const t = "Independence 67, attachment 10 — commitment feels less like a promise and more like a door quietly closing. They need room the way others need oxygen.";
console.log("F:", gv(t, "female"));
const t2 = "She need room the way others need oxygen.";
console.log("F2:", gv(t2, "female"));
