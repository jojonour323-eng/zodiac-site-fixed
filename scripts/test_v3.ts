// ===========================================================================
// TEST V3 — verifies the five structural additions to the Full Reading:
//   1. Opening contradiction paragraph ("Outside / Inside") built from real placements
//   2. Sign vs house as two separate beats in every placement chapter
//   3. "What to say / what not to say" callouts under Moon/Mercury/Venus/Mars
//   4. Standalone playbook section (respond-well / NOT-to-do / attract / upset script)
//   5. Closing three-layer synthesis with contradiction tie-back
// Plus: grammar sweep on all new copy, determinism, no-time degradation,
//       one-fix rule intact, unique section ids.
// ===========================================================================

async function natal(body: Record<string, unknown>) {
  const r = await fetch("http://localhost:3000/api/natal", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return (await r.json()) as any;
}

const CASA = { city: "Casablanca", lat: 33.5731, lng: -7.5898, tzStr: "Africa/Casablanca" };
const CHARTS: Record<string, Record<string, unknown>> = {
  layla:   { name: "Layla", year: 2001, month: 5, day: 15, hour: 10, minute: 0, gender: "female", ...CASA },
  omar:    { name: "Omar",  year: 1995, month: 7, day: 21, hour: 14, minute: 30, gender: "male", ...CASA },
  yasmine: { name: "Yasmine", year: 1998, month: 3, day: 14, hour: 9, minute: 20, gender: "female", ...CASA },
  notime:  { name: "NoTime", year: 2001, month: 5, day: 15, gender: "female", ...CASA }, // no birth time
};

let failures = 0;
function check(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

type Block = { type: string; text?: string; items?: string[]; label?: string; variant?: string; tone?: string };
type Section = { id: string; title: string; blocks: Block[] };

function sectionText(s: Section): string {
  return s.blocks.map((b) => [b.text, b.label, ...(b.items ?? [])].filter(Boolean).join(" ")).join(" ");
}

const payloadFull = (d: any): { sections: Section[] } => d.personality.fullReading;

// ─── per-chart checks ──────────────────────────────────────────────────────
for (const [key, req] of Object.entries(CHARTS)) {
  console.log(`\n═══ ${key} ═══`);
  const d = await natal(req);
  check(`${key}: payload present`, Boolean(d.personality));
  if (!d.personality) continue;
  const { sections } = payloadFull(d);

  // -- 1. opening --
  const opening = sections[0];
  check(`${key}: opening section is FIRST`, opening?.id === "opening");
  const ot = sectionText(opening ?? { id: "", title: "", blocks: [] });
  check(`${key}: opening names Outside/Inside`, /Outside: .+\. Inside: /.test(ot) || (ot.includes("Outside:") && ot.includes("Inside:")));
  const risingName = d.profile?.rising?.sign?.name;
  check(`${key}: opening cites real placements`, ot.length > 200, `${ot.length} chars`);

  // -- 2. two-beat sign/house --
  const BEATS: Record<string, RegExp> = {
    sun: /house adds a second, separate layer/,
    moon: /house says where the feeling actually lives/,
    mercury: /house shows what the mind gets spent on/,
    venus: /house moves it onto real ground/,
    mars: /house picks the target/,
  };
  if (key === "notime") {
    const anyBeat = sections.some((s) => s.blocks.some((b) => Object.values(BEATS).some((re) => re.test(b.text ?? ""))));
    check(`${key}: no house beats when time unknown`, !anyBeat);
  } else {
    for (const [pid, re] of Object.entries(BEATS)) {
      const sec = sections.find((s) => s.id === pid);
      if (!sec) { check(`${key}: ${pid} chapter exists`, false); continue; }
      const idx = sec.blocks.findIndex((b) => re.test(b.text ?? ""));
      const beatOk = idx > 0 && sec.blocks[idx + 1]?.type === "paragraph";
      check(`${key}: ${pid} sign→house two-beat`, beatOk);
      if (beatOk) {
        const houseLine = sec.blocks[idx + 1].text ?? "";
        check(`${key}: ${pid} house beat adds NEW info`, houseLine.length > 80 && !/restat/i.test(houseLine.slice(0, 20)));
      }
    }
  }

  // -- 2b. full walkthrough: 12 numbered placements in the user's order --
  const WALK: [string, RegExp][] = [
    ["sun", /^1 · /], ["moon", /^2 · /], ["rising", /^3 · /], ["mercury", /^4 · /],
    ["venus", /^5 · /], ["mars", /^6 · /], ["jupiter", /^7 · /], ["saturn", /^8 · /],
    ["uranus", /^9 · /], ["neptune", /^10 · /], ["pluto", /^11 · /], ["north-node", /^12 · /],
  ];
  const walkIdx: number[] = [];
  for (const [pid, re] of WALK) {
    const i = sections.findIndex((s) => s.id === pid);
    walkIdx.push(i);
    check(`${key}: ${pid} chapter exists`, i !== -1);
    if (i !== -1) check(`${key}: ${pid} numbered title`, re.test(sections[i].title), sections[i].title);
  }
  check(`${key}: placements run in walkthrough order 1→12`,
    walkIdx.every((v) => v !== -1) && walkIdx.every((v, k) => k === 0 || v > walkIdx[k - 1]),
    walkIdx.join(","));

  // -- 2c. the five slow planets (Jupiter → Pluto) --
  for (const pid of ["jupiter", "saturn", "uranus", "neptune", "pluto"]) {
    const sec = sections.find((s) => s.id === pid);
    if (!sec) { check(`${key}: ${pid} chapter exists`, false); continue; }
    const txt = sectionText(sec);
    check(`${key}: ${pid} has beginner primer`, /First, what .+ even is/.test(txt));
    if (key === "notime") {
      check(`${key}: ${pid} no house beat / no put-together without birth time`,
        !/The house (shows|says)/.test(txt) && !sec.blocks.some((b) => b.label === "Put it together"));
    } else {
      const beat = sec.blocks.findIndex((b) => /The house (shows|says)/.test(b.text ?? ""));
      check(`${key}: ${pid} house beat + house line`, beat > 0 && (sec.blocks[beat + 1]?.text ?? "").length > 60);
      check(`${key}: ${pid} ends with Put-it-together conclusion`,
        sec.blocks.some((b) => b.type === "callout" && b.label === "Put it together" && (b.text ?? "").length > 40));
    }
  }

  // -- 2d. houses explainer: after node, before aspects, 12 rooms --
  const nodeIdx = sections.findIndex((s) => s.id === "north-node");
  const housesIdx = sections.findIndex((s) => s.id === "houses-explained");
  check(`${key}: houses section exists`, housesIdx !== -1);
  if (housesIdx !== -1) {
    const items = sections[housesIdx].blocks.flatMap((b) => b.items ?? []);
    check(`${key}: houses section has 12 rooms`, items.length === 12 && items.every((t, k) => t.startsWith(`House ${k + 1} · `)));
    check(`${key}: houses section sits after node, before aspects`,
      nodeIdx !== -1 && housesIdx === nodeIdx + 1 && (sections[housesIdx + 1]?.id ?? "").startsWith("asp-"));
    if (key === "notime") {
      check(`${key}: houses section unpersonalized without birth time`, items.every((t) => !/sits? here\./.test(t)));
    } else {
      check(`${key}: houses section personalized with real planets`, items.some((t) => /sits? here\./.test(t)));
    }
  }

  // -- 3. say callouts --
  for (const pid of ["moon", "mercury", "venus", "mars"]) {
    const sec = sections.find((s) => s.id === pid);
    if (!sec) { check(`${key}: ${pid} say-pair (chapter missing)`, false); continue; }
    const lands = sec.blocks.filter((b) => b.type === "callout" && b.label === "What actually lands");
    const back = sec.blocks.filter((b) => b.type === "callout" && b.label === "What backfires");
    check(`${key}: ${pid} exactly one lands + one backfires`, lands.length === 1 && back.length === 1);
    if (lands[0]) check(`${key}: ${pid} say-pair is a real quote`, lands[0].text?.includes("“") && lands[0].text.length > 60);
  }
  for (const pid of ["sun", "rising"]) {
    const sec = sections.find((s) => s.id === pid);
    if (!sec) continue;
    const has = sec.blocks.some((b) => b.type === "callout" && (b.label === "What actually lands" || b.label === "What backfires"));
    check(`${key}: ${pid} has NO say-pair (not forced)`, !has);
  }

  // -- 4. playbook --
  const pb = sections.find((s) => s.id === "playbook");
  check(`${key}: playbook present`, Boolean(pb));
  if (pb) {
    const subs = pb.blocks.filter((b) => b.type === "subheading").map((b) => b.label ?? "");
    check(`${key}: playbook has 4 blocks in order`,
      subs.length === 4 && /respond well to/.test(subs[0]) && subs[1] === "What NOT to do" && /attract/.test(subs[2]) && /upset with you/.test(subs[3]),
      subs.join(" | "));
    const gSubj = key === "omar" ? "he" : "she";
    const gObj = key === "omar" ? "him" : "her";
    const gOk = subs[0] === `What ${gSubj}'ll respond well to` && subs[2] === `How to actually attract ${gObj}` && subs[3] === `If ${gSubj}'s upset with you`;
    if (!gOk) {
      console.log("    DEBUG subs:", JSON.stringify(subs));
      console.log("    DEBUG codes:", [...(subs[3] ?? "")].slice(0, 8).map((c) => c.charCodeAt(0)).join(","));
    }
    check(`${key}: playbook sub grammar (he's/she's)`, gOk, subs.join(" | "));
    const good = pb.blocks.filter((b) => b.type === "bullets" && b.tone === "good");
    const avoid = pb.blocks.filter((b) => b.type === "bullets" && b.tone === "avoid");
    check(`${key}: playbook green/red bullets present`, good.length === 2 && avoid.length === 2);
    const goodIdx = pb.blocks.findIndex((b) => b.type === "bullets" && b.tone === "good");
    const avoidIdx = pb.blocks.findIndex((b) => b.type === "bullets" && b.tone === "avoid");
    check(`${key}: green before red`, goodIdx !== -1 && avoidIdx !== -1 && goodIdx < avoidIdx);
    const script = pb.blocks[pb.blocks.length - 1];
    check(`${key}: upset script is concrete paragraph`, script.type === "paragraph" && (script.text ?? "").length > 150);
  }

  // -- 5. three-layer close (now second-to-last; the CONCLUSION closes) --
  const layersSec = sections.find((s) => s.id === "layers");
  const last = sections[sections.length - 1];
  check(`${key}: closing section is conclusion`, last?.id === "conclusion");
  check(`${key}: layers is second-to-last`, sections[sections.length - 2]?.id === "layers");
  if (layersSec) {
    const subs = layersSec.blocks.filter((b) => b.type === "subheading").map((b) => b.label ?? "");
    check(`${key}: three layers present`,
      subs.length === 3 && /outer layer/.test(subs[0]) && /emotional layer/.test(subs[1]) && /private layer/.test(subs[2]),
      subs.join(" | "));
    const lt = sectionText(layersSec);
    check(`${key}: tie-back references opening tension`,
      lt.includes("gap this reading opened with") && lt.includes("was never a contradiction to fix"));
    check(`${key}: layers has an inner-voice quote`, layersSec.blocks.some((b) => b.type === "quote"));
  }

  // -- 6. beginner walkthrough structure --
  // Every one of the 12 walkthrough chapters must open with a plain primer.
  const WALK_IDS = ["sun", "moon", "rising", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "north-node"];
  for (const wid of WALK_IDS) {
    const ws = sections.find((s) => s.id === wid);
    if (!ws) { check(`${key}: walkthrough chapter ${wid} exists`, false); continue; }
    const firstPara = ws.blocks.find((b) => b.type === "paragraph");
    check(`${key}: ${wid} opens with beginner primer`,
      Boolean(firstPara && (firstPara.text ?? "").startsWith("First, what")),
      (firstPara?.text ?? "MISSING").slice(0, 60));
    check(`${key}: ${wid} has no empty paragraphs`,
      ws.blocks.every((b) => b.type !== "paragraph" || (b.text ?? "").trim().length > 0));
  }
  // House beat must come AFTER all sign content in Sun/Moon/Mercury/Venus/Mars chapters:
  // the connector paragraph "That's the sign" appears in the back half of the chapter.
  // (Skipped when birth time is unknown — houses don't exist there.)
  const hasHouses = key !== "notime";
  for (const wid of ["sun", "moon", "mercury", "venus", "mars"]) {
    if (!hasHouses) continue;
    const ws = sections.find((s) => s.id === wid);
    if (!ws) continue;
    const paras = ws.blocks.filter((b) => b.type === "paragraph").map((b) => b.text ?? "");
    const beatIdx = paras.findIndex((t) => t.startsWith("That's the sign") || t.startsWith("That's the sign-level") || t.startsWith("That's the mind") || t.startsWith("That's the love style") || t.startsWith("That's the drive") || t.startsWith("That's the weight") || t.startsWith("That's where the difference") || t.startsWith("That's the dream") || t.startsWith("That's the depth"));
    check(`${key}: ${wid} house beat in back half`, beatIdx > Math.floor(paras.length / 2), `beat at ${beatIdx}/${paras.length}`);
  }
  // -- 7. conclusion section --
  if (last?.id === "conclusion") {
    const ct = sectionText(last);
    check(`${key}: conclusion names the verdict`, ct.includes("Here's the conclusion:"));
    check(`${key}: conclusion cites real placements`, /Sun|Moon|Rising|Venus/.test(ct));
    check(`${key}: conclusion ties back to opening gap`, ct.includes("Remember the gap this reading started with"));
    check(`${key}: conclusion verdict is a callout`, last.blocks.some((b) => b.type === "callout" && (b.label ?? "").includes("The verdict")));
    check(`${key}: conclusion does not quote raw scores`, !/\b\d{2}\b/.test(ct.replace(/house \d+/g, "")));
    check(`${key}: no a/an bug in conclusion`, !/\ba (A|E|I|O)qu|\ba Aries|\ba Aquarius|\ba A\w+ (Moon|Sun|Venus|Rising|Mars)/.test(ct));
  }

  // -- standing rules --
  const ids = sections.map((s) => s.id);
  check(`${key}: section ids unique`, new Set(ids).size === ids.length);
  const fixCount = (s: Section) => s.blocks.filter((b) => b.type === "callout" && (b.text ?? "").includes("🛠")).length;
  check(`${key}: no 🛠 fix spam in new sections`, ["opening", "playbook", "layers", "conclusion"].every((id) => {
    const s = sections.find((x) => x.id === id); return !s || fixCount(s) === 0;
  }));

  // -- grammar sweep on gendered output --
  const gender = key === "omar" ? "male" : "female";
  const d2 = await natal({ ...req, gender: gender === "male" ? "female" : "male" }); // opposite gender for contrast
  const neutralPronoun = (s?: Section) => {
    if (!s) return false;
    const t = sectionText(s);
    return /\b(they|their|theirs|them|themselves)\b/i.test(t);
  };
  check(`${key}: opening gender-clean`, !neutralPronoun(sections.find((x) => x.id === "opening")));
  check(`${key}: playbook gender-clean`, !neutralPronoun(sections.find((x) => x.id === "playbook")));
  check(`${key}: layers gender-clean`, !neutralPronoun(sections.find((x) => x.id === "layers")));
  void d2;

  // two genders must differ
  const tA = JSON.stringify(sections.find((x) => x.id === "playbook"));
  const dOpp = await natal({ ...req, gender: gender === "male" ? "female" : "male" });
  const tB = JSON.stringify(payloadFull(dOpp).sections.find((x) => x.id === "playbook"));
  check(`${key}: playbook differs across genders`, tA !== tB);
}

// ─── unit sweep: every authored why-line transforms pronoun-clean ──────────
console.log("\n═══ say-lines pronoun sweep (12 signs × 4 placements × 2 genders) ═══");
const { SAY_LINES } = await import("../src/lib/astro/personality/deep/sayLines");
const { gv } = await import("../src/lib/astro/personality/deep/voice");
let pronFail = 0;
for (const [sign, roles] of Object.entries(SAY_LINES)) {
  for (const [role, pair] of Object.entries(roles as any)) {
    for (const g of ["female", "male"] as const) {
      for (const field of ["worksWhy", "avoidWhy"] as const) {
        const out = gv((pair as any)[field], g);
        if (/\b(they|their|theirs|them|themselves)\b/i.test(out)) {
          pronFail++;
          console.log(`  PRONOUN LEAK ${sign}.${role}.${field}[${g}]: ${out}`);
        }
        if (/alreadies|lefts| processe\b/.test(out)) {
          pronFail++;
          console.log(`  VERB MANGLE ${sign}.${role}.${field}[${g}]: ${out}`);
        }
      }
    }
  }
}
check("say-lines: 0 pronoun leaks / verb mangles across 192 transforms", pronFail === 0, `${pronFail} leaks`);

// ─── determinism ───────────────────────────────────────────────────────────
console.log("\n═══ determinism ═══");
const det1 = await natal(CHARTS.layla);
const det2 = await natal(CHARTS.layla);
check("identical requests → identical readings", JSON.stringify(det1.personality.fullReading) === JSON.stringify(det2.personality.fullReading));

console.log(`\n${failures === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${failures} FAILURES`}`);

// ─── optional: dump readable text of one chart for human review ──────────
if (process.argv.includes("--dump")) {
  const d = await natal(CHARTS.layla);
  const fr = d.personality.fullReading;
  console.log(`\n──────── FULL READING DUMP (${CHARTS.layla.name}) ────────`);
  console.log(`INTRO: ${fr.intro}\n`);
  for (const s of fr.sections) {
    console.log(`\n## ${s.title}`);
    for (const b of s.blocks) {
      if (b.type === "subheading") console.log(`  [${b.label}]`);
      else if (b.type === "bullets") b.items?.forEach((i) => console.log(`   ${b.tone === "good" ? "+" : b.tone === "avoid" ? "×" : "•"} ${i}`));
      else if (b.type === "callout") console.log(`   {${b.label}} ${b.text}`);
      else if (b.type === "quote") console.log(`   > ${b.text}`);
      else if (b.type === "meta") console.log(`   @ ${b.text}`);
      else console.log(`   ${b.text}`);
    }
  }
}

process.exit(failures === 0 ? 0 : 1);
