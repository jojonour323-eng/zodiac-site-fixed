// ===========================================================================
// SCAN GV COORDINATED VERBS — find "they X and <baseverb>" patterns that the
// gv() voice transform cannot inflect (it only fixes the verb right after
// she/he). Scans raw source text of every authored content library.
// ===========================================================================

import { readFileSync } from "node:fs";

const FILES = [
  "src/lib/astro/personality/deep/signContent1.ts",
  "src/lib/astro/personality/deep/signContent2.ts",
  "src/lib/astro/personality/deep/signContent3.ts",
  "src/lib/astro/personality/deep/aspectChapters.ts",
  "src/lib/astro/personality/deep/nodes.ts",
  "src/lib/astro/personality/deep/houseLines.ts",
  "src/lib/astro/personality/deep/layers.ts",
  "src/lib/astro/personality/deep/playbook.ts",
  "src/lib/astro/personality/deep/sayLines.ts",
  "src/lib/astro/personality/deep/sayLines1.ts",
  "src/lib/astro/personality/deep/sayLines2.ts",
  "src/lib/astro/personality/home.ts",
  "src/lib/astro/personality/compat.ts",
  "src/lib/astro/personality/soulmate.ts",
  "src/lib/astro/personality/model.ts",
];

const VERBS = new Set([
  "renegotiate", "redefine", "want", "need", "feel", "think", "know",
  "take", "make", "give", "get", "show", "tell", "ask", "say", "keep", "hold",
  "build", "start", "stop", "move", "stay", "leave", "react", "respond",
  "adjust", "adapt", "defend", "demand", "punish", "reward", "choose", "lose",
  "win", "read", "watch", "notice", "handle", "chase", "drop", "fear", "love",
  "hate", "trust", "doubt", "test", "press", "open", "close", "carry",
  "deliver", "absorb", "learn", "teach", "lead", "follow", "argue", "agree",
  "disagree", "forgive", "forget", "remember", "mention", "explain", "expect",
  "assume", "compare", "measure", "weigh", "check", "fix", "solve", "plan",
  "push", "pull", "walk", "run", "act", "decide", "commit", "work", "play",
  "protect", "provide", "care", "help", "hurt", "heal", "fight", "retreat",
  "withdraw", "return", "reach", "arrive", "become", "remain", "seem",
  "sound", "taste", "smell", "grow", "change", "exist", "matter", "mean",
  "deserve", "require", "involve", "include", "create", "destroy", "burn",
  "freeze", "thaw", "melt", "shape", "form", "collect", "gather", "spend",
  "save", "earn", "pay", "owe", "buy", "sell", "trade", "offer", "refuse",
  "accept", "reject", "avoid", "ignore", "face", "meet", "greet", "welcome",
  "invite", "share", "hide", "mask", "cover", "reveal", "confess", "admit",
  "deny", "claim", "believe", "suspect", "wonder", "question", "study",
  "examine", "analyze", "review", "edit", "rewrite", "renovate", "rebuild",
  "restore", "come", "arrive", "begin", "end", "finish", "continue", "keep",
]);

const CONNECT = /\b(?:and|but|then|yet|before|after|while|when|once|until)\s+([a-z]{3,})\b/g;

let hits = 0;
for (const rel of FILES) {
  const src = readFileSync(`/home/z/my-project/${rel}`, "utf8");
  // extract double/single/backtick string literals
  const literals = src.match(/"((?:\\.|[^"\\\n])*)"/g) ?? [];
  for (const lit of literals) {
    const text = lit.slice(1, -1);
    if (text.length < 20) continue;
    const sentences = text.split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
      if (!/\bthey\b/i.test(s)) continue;
      CONNECT.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = CONNECT.exec(s))) {
        const v = m[1].toLowerCase();
        if (VERBS.has(v)) {
          hits++;
          console.log(`[${rel}] verb="${v}" → ${s.trim().slice(0, 140)}`);
        }
      }
    }
  }
}

console.log(hits ? `\n${hits} HIT(S) — fix by making the second verb passive/gerund or restructuring` : "\nCLEAN — no coordinated base verbs after 'they'");
process.exit(hits ? 1 : 0);
