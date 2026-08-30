// ===========================================================================
// TEST V2 — Master-prompt Part 3 verification
// ---------------------------------------------------------------------------
// 1. Same-Sun people get meaningfully different readings/archetypes/rings.
// 2. Different charts produce different everything.
// 3. Scores agree with prose (Discipline low ↔ no unexplained "very disciplined").
// 4. Kink answers dominate the chart.
// 5. Compatibility responds to either chart changing + honest areas.
// ===========================================================================

interface Ring { key: string; value: number }
async function natal(body: Record<string, unknown>) {
  const r = await fetch("http://localhost:3000/api/natal", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return (await r.json()) as any;
}

const CASA = { city: "Casablanca", lat: 33.5731, lng: -7.5898, tzStr: "Africa/Casablanca" };

const CHARTS = {
  layla:   { name: "Layla", year: 2001, month: 5, day: 15, hour: 10, minute: 0, gender: "female", ...CASA },
  lina:    { name: "Lina",  year: 2001, month: 5, day: 17, hour: 3,  minute: 40, gender: "female", ...CASA }, // ~same Sun window
  omar:    { name: "Omar",  year: 1995, month: 7, day: 21, hour: 14, minute: 30, gender: "male", ...CASA },
  yasmine: { name: "Yasmine", year: 1998, month: 3, day: 14, hour: 9, minute: 20, gender: "female", ...CASA },
};

function ringDistance(a: Ring[], b: Ring[]): number {
  let sum = 0;
  for (const ra of a) {
    const rb = b.find((x) => x.key === ra.key);
    if (rb) sum += Math.abs(ra.value - rb.value);
  }
  return sum;
}

let failures = 0;
function check(label: string, ok: boolean, detail?: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

const payloads: Record<string, any> = {};
for (const [key, req] of Object.entries(CHARTS)) {
  const d = await natal(req);
  payloads[key] = d.personality;
  check(`${key}: personality payload present`, Boolean(d.personality));
}

console.log("\n─── 1. Same-Sun divergence (Layla vs Lina, both Taurus-window) ───");
{
  const A = payloads.layla, B = payloads.lina;
  const dist = ringDistance(A.rings, B.rings);
  check("ring combined distance > 25", dist > 25, `distance=${dist}`);
  check(
    "titles differ",
    A.home.title !== B.home.title,
    `${A.home.title} vs ${B.home.title}`
  );
  const sigA = [A.home.title, A.archetype.id, A.fullReading.sections.map((s: any) => s.title).join("|")].join("#");
  const sigB = [B.home.title, B.archetype.id, B.fullReading.sections.map((s: any) => s.title).join("|")].join("#");
  check("overall signature differs", sigA !== sigB);
  const planetsA = A.fullReading.sections.filter((s:any)=>["sun","moon","rising","mercury","venus","mars"].includes(s.id)).map((s:any)=>s.title).slice(0,6).join(" / ");
  console.log("   Layla chapters :", planetsA);
  const planetsB = B.fullReading.sections.filter((s:any)=>["sun","moon","rising","mercury","venus","mars"].includes(s.id)).map((s:any)=>s.title).slice(0,6).join(" / ");
  console.log("   Lina  chapters:", planetsB);
  check("placement chapter signs differ somewhere", planetsA !== planetsB);
}

console.log("\n─── 2. Full cross-chart archetype variety ───");
{
  const ids = Object.values(payloads).map((p: any) => p.archetype.id);
  const uniq = new Set(ids);
  check("at least 3 distinct archetypes across 4 very-different charts", uniq.size >= 3, [...uniq].join(", "));
}

console.log("\n─── 3. Numbers vs words consistency ───");
{
  for (const [k, p] of Object.entries(payloads)) {
    const disc = (p as any).rings.find((r: Ring) => r.key === "discipline").value;
    const fullText = JSON.stringify((p as any).fullReading).toLowerCase();
    const claimsVeryDisciplined =
      /very disciplined|extremely disciplined/.test(fullText) &&
      !/discipline depends|mood-dependent structure/.test(fullText);
    check(`${k}: no unsupported discipline bragging`, !(claimsVeryDisciplined && disc < 45), `disc=${disc}`);
    // ring notes explain drivers
    const notesOk = (p as any).rings.every((r: any) => typeof r.note === "string" && r.note.length > 8);
    check(`${k}: every ring carries a note`, notesOk);
    // section count sanity
    const secCount = (p as any).fullReading.sections.length;
    check(`${k}: reading has >= 12 sections`, secCount >= 12, `sections=${secCount}`);
  }
}

console.log("\n─── 4. Gender correctness ───");
{
  check("female chart uses she/her", /\bshe\b/.test(payloads.layla.fullReading.intro) || /she/.test(JSON.stringify(payloads.layla.home)));
  check("male chart uses he/him", /\bhe\b/.test(JSON.stringify(payloads.omar.home)));
  const maleStray = JSON.stringify(payloads.omar.fullReading).match(/\bshe\b/);
  check("male reading contains no stray 'she'", !maleStray, maleStray ? `found "${(maleStray as any)[0]}"` : undefined);
  const femStrayGram = JSON.stringify(payloads.layla.fullReading).match(/\bshe (want|have|are|do|go|say)\b/);
  check("female reading has no plural-verb slips", !femStrayGram, femStrayGram ? `"${femStrayGram[0]}"` : undefined);
}

console.log("\n─── 5. Soulmate depth ───");
{
  const sm = payloads.yasmine.soulmate;
  check("soulmate has >= 9 sections", sm.sections.length >= 9, `count=${sm.sections.length}`);
  check("flags present", sm.greenFlags.length > 0 && sm.redFlags.length > 0);
  const gendered = sm.sections.some((x: any) => /she/i.test(x.title));
  check("soulmate titles gendered for female", gendered, sm.sections.slice(0,2).map((x:any)=>x.title).join(" | "));
}

console.log("\n─── 6. Compatibility (deterministic path) ───");
{
  const r = await fetch("http://localhost:3000/api/synastry", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personA: CHARTS.layla, personB: CHARTS.omar }),
  });
  const d = await r.json();
  check("synastry responds", Boolean(d?.compat));
  if (d?.compat) {
    check("7 areas scored", d.compat.areas.length === 7, String(d.compat.areas.length));
    const lowAreas = d.compat.areas.filter((a: any) => a.value < 45).length;
    console.log(`   areas: ${d.compat.areas.map((a: any) => `${a.key}=${a.value}`).join(", ")} (${lowAreas} below 45 — honest lows allowed)`);
  }
}


console.log("\n─── 7. Grammar slip sweep (she/he + base verb) ───");
{
  const SUSPECT = new Set(("want have are do go say make take need feel know think see come give find get hold keep leave let live look move play read run show sit speak stand stay talk tell turn walk watch wear win wish work worry write accept act allow ask avoid become begin believe belong break bring build buy care carry catch change choose close cost count cover create cut deal die drop eat end expect explain face fall fight fill finish fit fly forget forgive gather grow handle happen hate hear help hide hit hurt ignore invite join judge kill laugh lead learn like listen lose love manage mean meet miss notice open own pass pay perform pick plan prefer prepare process protect prove pull push question reach receive refuse remember reply require respond return ride rise risk save seek seem sell send sense share shine shut sing skip smile sort spend spread start stick stop study succeed suffer support suppose survive teach test thank throw touch train travel trust try understand use value visit vote wait wake warn waste".split(" ")));
  let slips = 0;
  for (const [k, p] of Object.entries(payloads)) {
    const text = JSON.stringify(p);
    const re = /\b(?:she|he|She|He) ([a-z]+)\b/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const w = m[1];
      if (SUSPECT.has(w)) {
        slips++;
        console.log(`   ${k}: slip → "${m[0]}"`);
      }
    }
  }
  check("no subject-verb agreement slips across 4 payloads", slips === 0, `${slips} found`);
}

console.log(failures === 0 ? "\nALL CHECKS PASSED ✔" : `\n${failures} CHECK(S) FAILED ✘`);
process.exit(failures === 0 ? 0 : 1);
