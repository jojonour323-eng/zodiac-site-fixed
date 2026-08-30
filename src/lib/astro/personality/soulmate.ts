// ===========================================================================
// SOULMATE V2 — real relationship psychology from the WHOLE chart
// ---------------------------------------------------------------------------
// Draws on BOTH systems: the multi-factor dimension model (attachment,
// jealousy, control…) AND raw placement content (Moon safety list,
// Venus pull-away triggers, Mars limit behavior). Ends with a chart-emergent
// soulmate archetype. Third-person, gender-aware through gv().
// Authored neutral-plural.
// ===========================================================================

import type { PersonalityProfile } from "./model";
import type { Dimension } from "./core";
import type { Rng } from "./core";
import { makeRng } from "./core";
import { v, isHigh, isLow } from "./prose";
import { makeVoice } from "./deep/voice";
import { SIGNS_1 } from "./deep/signContent1";
import { SIGNS_2 } from "./deep/signContent2";
import { SIGNS_3 } from "./deep/signContent3";

const ALL_SIGNS = { ...SIGNS_1, ...SIGNS_2, ...SIGNS_3 };

// ---------------------------------------------------------------------------
// Dimension-derived love phrases — used when no single dimension is extreme
// enough to fire a specific bullet. Composed from THIS person's actual top
// dimensions, so the fallback text still traces to their real chart and
// differs from person to person. Never a saved generic line.
// ---------------------------------------------------------------------------

const DIM_LOVE: Record<Dimension, { high: string; low: string }> = {
  socialEnergy: { high: "someone whose social life can host theirs without shrinking it", low: "someone who treats quiet nights in as a valid form of togetherness" },
  socialSelectivity: { high: "someone who doesn't take the slow-entry policy personally", low: "someone at ease in any room, so the evening never depends on the crowd" },
  expressiveness: { high: "someone who can meet the volume of what they feel, out loud", low: "someone who reads the understated version of affection fluently" },
  emotionalSensitivity: { high: "someone who handles their softness carefully instead of teasing it", low: "someone steady enough that the room's mood doesn't have to be managed" },
  emotionalControl: { high: "someone patient while feelings get sorted behind the composure", low: "someone who enjoys a partner whose face announces every mood" },
  vulnerabilityOpenness: { high: "someone who honors it when the guard comes all the way down", low: "someone who lets trust arrive on its own schedule without prying" },
  attachmentNeed: { high: "frequent reassurance, given as routine rather than squeezed out in a crisis", low: "room to miss someone because the togetherness isn't constant" },
  independence: { high: "space that's given freely — the partner who allows distance is the one they return to closest", low: "someone who actually wants the togetherness they keep offering" },
  trustCaution: { high: "proof over promises — consistency that files evidence for months", low: "someone who handles being trusted quickly with real care" },
  jealousyRisk: { high: "predictability — someone whose patterns never hand the worry fuel", low: "someone who notices how rarely the green-eyed thing shows up and values it" },
  communicationDirectness: { high: "someone who says the thing plainly so nobody has to decode", low: "someone gentle with a partner who talks around the hard stuff first" },
  analyticalThinking: { high: "someone who enjoys the dissecting — problems get solved here, not just felt", low: "someone who leads with feeling when the spreadsheet version isn't helping" },
  overthinking: { high: "clear, direct answers — vagueness pours fuel on the mental fires", low: "someone who appreciates a partner who just takes things as they come" },
  intuition: { high: "someone honest enough to be readable — the radar catches everything", low: "someone who says things out loud rather than expecting it to be sensed" },
  confidence: { high: "someone secure enough to share the stage without competing", low: "someone whose steadiness doesn't need performing to" },
  selfCriticism: { high: "someone who notices the inner critic and answers it out loud", low: "someone who can relax around a partner who isn't re-litigating everything" },
  ambition: { high: "someone building something — mutual respect for the hours it takes", low: "someone who provides the ambition the relationship runs on happily" },
  discipline: { high: "someone reliable — small kept promises are the love language here", low: "someone flexible when plans loosen and structures soften" },
  patience: { high: "someone who doesn't mistake calm pace for absence of desire", low: "someone who slows down willingly instead of dragging them forward" },
  impulsivity: { high: "someone who can say yes at 9pm to a 10pm idea", low: "someone who plans so the spontaneity is optional, not mandatory" },
  adaptability: { high: "someone unbothered by change — new cities, new plans, new rules", low: "someone who keeps the world predictable enough to stand still in" },
  creativity: { high: "someone who plays along — the imagination needs a co-conspirator", low: "someone pragmatic enough to handle the real world the dreams float above" },
  romanticism: { high: "someone who takes the big love seriously instead of mocking it", low: "someone who proves love in practical acts rather than grand gestures" },
  nurturance: { high: "someone who lets themselves be looked after without flinching", low: "someone who carries the caretaking load without keeping score" },
  intensityDepth: { high: "at least one person who can sit with the heavy stuff — shallow doesn't hold", low: "someone who keeps things light enough to breathe in" },
  needForControl: { high: "a real say in the decisions that affect both people", low: "someone happy to steer — they'd genuinely rather not" },
  idealism: { high: "someone real enough to survive the picture being revised", low: "someone grounded when the standards get impossible" },
  resilience: { high: "someone who knows recovery is coming and doesn't hover through it", low: "someone gentle in the seasons when bouncing back takes longer" },
  playfulness: { high: "laughter that clicks within the first ten minutes — non-negotiable", low: "someone calm who enjoys being the steady one in the joke" },
};

/** The person's most distinctive dimensions, strongest signal first. */
function topDims(p: PersonalityProfile, n: number): { dim: Dimension; high: boolean }[] {
  return DIM_LOVE
    ? (Object.keys(DIM_LOVE) as Dimension[])
        .map((dim) => ({ dim, high: v(p, dim) >= 50, dist: Math.abs(v(p, dim) - 50) }))
        .sort((a, b) => b.dist - a.dist)
        .slice(0, n)
        .map(({ dim, high }) => ({ dim, high }))
    : [];
}

function dimLoveLines(p: PersonalityProfile, n: number): string[] {
  return topDims(p, n).map(({ dim, high }) => DIM_LOVE[dim][high ? "high" : "low"]);
}

export interface SoulmateProfile {
  archetype: { emoji: string; label: string; why: string };
  /** Trait-bullet structure: one-line lead, one bullet per specific trait, short tail. */
  sections: { id: string; title: string; lead: string; bullets: string[]; tail?: string }[];
  greenFlags: string[];
  redFlags: string[];
  growthLesson: string;
}

export function buildSoulmateProfile(p: PersonalityProfile, gender?: "male" | "female" | null): SoulmateProfile {
  const rng = makeRng(p.facts.seed + "|soulmate-v2");
  // Seeded frame picker: the connective sentences around the personalized
  // content rotate per chart so two personas never share verbatim framing.
  const frng = makeRng(p.facts.seed + "|soulmate-frames");
  const fpick = <T,>(arr: readonly T[]): T => arr[Math.floor(frng.next() * arr.length) % arr.length];
  const voice = makeVoice(gender ?? null);
  const T = (x: string) => voice.t(x);
  const s = voice.s;

  const sections: SoulmateProfile["sections"] = [];
  const signContentFor = (id?: string) => (id ? ALL_SIGNS[id] : undefined);
  const getSign = (planetId: string) => p.facts.planets.find((x) => x.id === planetId)?.sign_id;
  const venusC = signContentFor(getSign("venus"));
  const marsC = signContentFor(getSign("mars"));
  const capItem = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // 1. What they need emotionally
  {
    const needs: string[] = [];
    if (isHigh(p, "attachmentNeed", 58)) needs.push("steady reassurance, more often than they'd ever admit out loud");
    if (isHigh(p, "independence", 60)) needs.push("room to be themselves, without anyone making them feel guilty for it");
    if (isHigh(p, "emotionalSensitivity", 58)) needs.push("a gentle hand during hard conversations");
    if (isHigh(p, "needForControl", 58)) needs.push("a real say in the decisions that affect both people");
    if (isHigh(p, "intensityDepth", 60)) needs.push("at least one person who can sit with the heavy stuff");
    if (!needs.length) {
      const lines = dimLoveLines(p, 3);
      needs.push(lines[0] ?? "honesty, effort, and someone who treats the relationship like it's worth maintaining");
      if (lines[1]) needs.push(lines[1]);
    }
    sections.push({
      id: "needs",
      title: `What ${s} need${voice.s === "they" ? "" : "s"} emotionally`,
      lead: T(fpick([
        "Take the astrology away and the needs are still specific:",
        "Underneath all the chart talk, the real needs are simple:",
        "What it comes down to, in plain terms:",
      ])),
      bullets: needs.map((x) => T(capItem(x))),
      tail: T(fpick([
        "The common thread is capacity — whoever gets closest has to be able to handle the real person, not a toned-down version of them.",
        "One requirement runs under all of it: the person who gets closest must be able to handle who they actually are, not a quieter copy.",
      ])),
    });
  }

  // 2. Safety
  const moonSign = getSign("moon");
  const moonSafe = moonSign && ALL_SIGNS[moonSign] ? ALL_SIGNS[moonSign].moon.safe.slice(0, 4) : [];
  {
    sections.push({
      id: "safe",
      title: `What makes ${voice.o} feel safe`,
      lead: T(fpick([
        "Safety has a very specific address here — it's a list, not a mood:",
        "The safety list is concrete, not mysterious:",
        `What actually makes ${voice.o === "them" ? "them" : voice.o} feel safe:`,
      ])),
      bullets: (moonSafe.length ? moonSafe : dimLoveLines(p, 3)).map((x) => T(capItem(x))),
      tail: T(fpick([
        "None of it is exotic — it's the boring consistency anxious partners underestimate and secure ones provide without ceremony. When those conditions hold, extraordinary openness becomes available.",
        "Nothing on the list is complicated — it's steady, repeatable behavior. Meet those conditions and the walls come down faster than anyone expects.",
      ])),
    });
  }

  // 3. Attraction
  {
    const moments: string[] = [];
    if (isHigh(p, "emotionalSensitivity", 58)) moments.push("being truly seen — someone describing their inner world better than they could");
    if (isHigh(p, "confidence", 58)) moments.push("watching someone be genuinely great at what they do");
    if (isHigh(p, "playfulness", 58)) moments.push("laughter that clicks within the first ten minutes");
    if (isHigh(p, "intensityDepth", 58)) moments.push("conversations that go deep right away instead of eventually");
    if (isHigh(p, "vulnerabilityOpenness", 58)) moments.push("someone else being honest first, so they don't have to go alone");
    if (isHigh(p, "independence", 60)) moments.push("watching someone live fine without them — and then choose them anyway");
    if (!moments.length) {
      const lines = dimLoveLines(p, 3);
      moments.push(lines[0] ?? "steady consistency, repeated until trust has room to grow");
      if (lines[1]) moments.push(lines[1]);
    }
    sections.push({
      id: "attraction",
      title: `What makes ${voice.o} fall`,
      lead: T(fpick([
        "Falling happens slowly for them and then all at once — one moment tips it over. The tipping moments are specific:",
        "Interest builds quietly, then one moment flips the switch. The moments are specific:",
      ])),
      bullets: moments.map((x) => T(capItem(x))),
      tail: T(fpick([
        "Notice that none of that is about looks. Every item on the list is about character.",
        "Looks aren't on that list anywhere. Character is every single item on it.",
      ])),
    });
  }

  // 4. Attachment
  {
    const glue: string[] = [];
    if (isHigh(p, "attachmentNeed", 58)) glue.push("shared history — fights survived, private jokes, proof of time");
    if (isHigh(p, "trustCaution", 58)) glue.push("passing the trust test — once someone is cleared, the loyalty locks in");
    if (isHigh(p, "emotionalSensitivity", 58)) glue.push("being understood correctly, over and over, specifically them");
    if (isHigh(p, "intensityDepth", 58)) glue.push("hard seasons survived together — difficulty bonds this chart tighter than fun does");
    if (isHigh(p, "independence", 58)) glue.push("space that's given freely — the partner who allows distance is the one they come back to closest");
    if (!glue.length) {
      const lines = dimLoveLines(p, 3);
      glue.push(lines[0] ?? "time, plus proof they're the same person on good days and bad ones");
      if (lines[1]) glue.push(lines[1]);
    }
    sections.push({
      id: "attach",
      title: `What makes ${voice.o} stay attached`,
      lead: T(fpick([
        "Attraction is one thing; staying attached is another. What keeps them:",
        "Getting their interest and keeping it are two different jobs. What keeps them:",
      ])),
      bullets: glue.map((x) => T(capItem(x))),
      tail: T(fpick([
        "Once someone is truly attached, loyalty stops being a daily decision and becomes part of who they are.",
        "After that point, loyalty isn't a choice they reconsider — it's just part of them.",
      ])),
    });
  }

  // 5. Loss of interest — Venus grounded
  {
    const killers: string[] = [];
    if (venusC?.venus.pullAway[0]) {
      killers.push(capItem(venusC.venus.pullAway[0]));
      killers.push(isHigh(p, "playfulness")
        ? "When the joy drains out of things, the interest drains with it — and it does not come back"
        : "Saying one thing and doing another — unreliability costs them faster than flaws do");
    } else {
      if (isHigh(p, "independence", 60)) killers.push("Control creeping in — checking up on them disguised as caring about them");
      if (isHigh(p, "intensityDepth", 58)) killers.push("Smallness — a relationship where the plans never get bigger and the talks never go deeper");
      if (isHigh(p, "overthinking", 58)) killers.push("Vagueness — unclear answers feed the overthinking until worry kills the interest");
      if (isHigh(p, "emotionalSensitivity", 58)) killers.push("Contempt — an eye-roll at something they take seriously does real damage");
      if (!killers.length) {
        const lines = dimLoveLines(p, 3);
        killers.push(lines[0] ?? "Cruelty during fights, saying one thing and doing another, or making them feel small");
        if (lines[1]) killers.push(lines[1]);
      }
    }
    sections.push({
      id: "kills",
      title: `What kills ${voice.p} interest`,
      lead: T("Interest doesn't fade here — it gets killed by specific things:"),
      bullets: killers.map((x) => T(capItem(x))),
      tail: T("All of these are about character — none of them are about effort or looks."),
    });
  }

  // 6. How affection shows
  {
    const dialects: string[] = [];
    if (venusC?.venus.showLove[0]) dialects.push(capItem(venusC.venus.showLove[0]));
    if (marsC?.mars.core[0]) dialects.push(T(`Under desire or pressure, behavior defaults to Mars settings: ${(marsC.mars.core[0].split(". ")[0] ?? "").toLowerCase()}`));
    if (isHigh(p, "nurturance", 58) && !venusC) dialects.push("Taking care of practical things — feeding, fixing, driving, remembering");
    if (isHigh(p, "playfulness", 58) && !venusC) dialects.push("Teasing that gets softer the closer someone gets");
    if (!dialects.length) {
      const lines = dimLoveLines(p, 2);
      dialects.push(lines[0] ?? "Steady presence — just being there, reliably");
    }
    sections.push({
      id: "show",
      title: `How ${s} show${voice.s === "they" ? "" : "s"} love`,
      lead: T("Love comes out in a specific language here:"),
      bullets: dialects.map((x) => (x.charAt(0) === x.charAt(0).toLowerCase() ? capItem(x) : x)),
      tail: T("People waiting for big movie gestures might miss it completely. People paying attention never will."),
    });
  }

  // 7. Vulnerability & conflict
  {
    const conflictBits: string[] = [
      capItem(p.styles.conflict.note) + ".",
      T(v(p, "trustCaution") >= 58
        ? "Trust was given slowly, only after proof — so a fight is never just a fight; it shakes the proof"
        : "Trust was given freely, so fights shake something else: the belief that this person is safe to be wrong around"),
      T("Most fights are not about the dishes — they're really asking one question: is this bond strong enough to survive not being perfect?"),
    ];
    sections.push({
      id: "conflict",
      title: "Vulnerability and conflict style",
      lead: T(`${capitalizeFirst(p.styles.conflict.kind)} conflict processor — here's what that means in practice:`),
      bullets: conflictBits,
    });
  }

  // 8. Complementing partner
  {
    const bits: string[] = [];
    if (isHigh(p, "emotionalSensitivity", 58)) bits.push("emotionally smart enough to handle their sensitivity without mocking it");
    if (isLow(p, "patience", 45)) bits.push("patient enough for two — calm where this chart runs hot");
    if (isHigh(p, "independence", 60)) bits.push("secure in their own life — choosing them daily instead of needing them constantly");
    if (isHigh(p, "nurturance", 58)) bits.push("giving back — noticing the care they give and returning it without being asked");
    if (isHigh(p, "overthinking", 60)) bits.push("clear and direct — vagueness pours fuel on their mental fires");
    if (!bits.length) {
      const lines = dimLoveLines(p, 3);
      bits.push(lines[0] ?? "kind, steady, and grown — the unexciting foundation that long relationships actually run on");
      if (lines[1]) bits.push(lines[1]);
    }
    sections.push({
      id: "complement",
      title: `The kind of person who complements ${voice.o}`,
      lead: T("The right match is specific, not generic. It's someone:"),
      bullets: bits.map((x) => T(capItem(x))),
      tail: T("The goal isn't finding a copy of themselves — it's finding someone whose steadiness makes their intensity feel safe instead of scary."),
    });
  }

  // 9. Destabilizing partner
  {
    const bits: string[] = [];
    if (isHigh(p, "jealousyRisk", 55) || isHigh(p, "intensityDepth", 60)) {
      bits.push("hot-and-cold partners — mixes of attention and distance this chart can get hooked on");
    }
    if (isHigh(p, "idealism", 60)) {
      bits.push("people with obvious potential — falling for who someone COULD be produces the same heartbreak every time");
    }
    if (isLow(p, "trustCaution", 45)) {
      bits.push("skilled manipulators — they trust openly first, so the exploitation lands before the verification starts");
    } else if (isHigh(p, "trustCaution", 62)) {
      bits.push("charm offensives that rush closeness — pressure skips the trust-building that took years");
    }
    if (isHigh(p, "attachmentNeed", 60)) {
      bits.push("unavailable partners — the distance reads like a puzzle to solve instead of an answer to accept");
    }
    if (!bits.length) {
      const lines = dimLoveLines(p, 2);
      bits.push(lines[0] ?? "reliable unreliability — the same lesson arriving again, with the same tuition");
    }
    sections.push({
      id: "destabilize",
      title: `The kind of person who destabilizes ${voice.o}`,
      lead: T("The people who wreck them come in predictable types:"),
      bullets: bits.map((x) => T(capItem(x))),
      tail: T("Spotting the pattern early is the whole defense."),
    });
  }

  // 10. Healthiest dynamic
  {
    const bits: string[] = [];
    const a = p.styles.attachment;
    if (a.kind === "avoidant-leaning" || isHigh(p, "independence", 60)) {
      bits.push("agreed-on space — distance that's planned calmly instead of requested in the middle of a fight");
    } else if (a.kind === "anxious-leaning" || a.kind === "ambivalent" || isHigh(p, "attachmentNeed", 60)) {
      bits.push("regular reassurance given as routine, not squeezed out during a crisis");
    } else {
      bits.push("shared rituals and honest check-ins that neither person has to make a big deal of");
    }
    if (isHigh(p, "emotionalSensitivity", 58)) bits.push("starting hard conversations gently — the first sentence decides the whole fight");
    if (isHigh(p, "needForControl", 58)) bits.push("clear areas of decision-making, agreed while things are calm");
    if (isHigh(p, "playfulness", 58)) bits.push("fun that's protected on purpose, not treated as a luxury");
    sections.push({
      id: "dynamic",
      title: `${capitalizeFirst(voice.p)} healthiest dynamic`,
      lead: T(fpick([
        "What works with them, concretely:",
        "The setup that actually lasts:",
      ])),
      bullets: bits.map((x) => T(capItem(x))),
      tail: T(fpick([
        "None of it is exotic — it's listed here because stress quietly trades all of it away for short-term peace.",
        "Basic on purpose — stress is what makes couples drop these, one busy month at a time.",
      ])),
    });
  }

  const archetype = soulmateArchetype(p, rng);
  const greenFlags = greenFlagList(p).map(T);
  const redFlags = redFlagList(p).map(T);
  const growthLesson = T(growthLessonFor(p, rng));

  return { archetype, sections, greenFlags, redFlags, growthLesson };
}

// Archetype + flags + lesson

function soulmateArchetype(p: PersonalityProfile, rng: Rng): SoulmateProfile["archetype"] {
  void rng;
  const candidates: { id: string; emoji: string; label: string; why: string; score: number }[] = [];

  if (isHigh(p, "independence", 60) && isHigh(p, "romanticism", 55))
    candidates.push({ id: "wildheart", emoji: "🔥", label: "The Wildheart", why: "Loves completely and freely — staying always a choice, never a cage.", score: 90 });
  if (isHigh(p, "intensityDepth", 62))
    candidates.push({ id: "deepwater", emoji: "🌊", label: "Deep Water", why: "Not built for shallow swimmers. All-in or all-away — fathoms guaranteed.", score: 88 });
  if (isHigh(p, "nurturance", 60) && isHigh(p, "emotionalSensitivity", 58))
    candidates.push({ id: "hearth", emoji: "🏡", label: "The Hearth", why: "People warm themselves on this steadiness and build homes around it.", score: 85 });
  if (isHigh(p, "trustCaution", 60) && isHigh(p, "intensityDepth", 55))
    candidates.push({ id: "fortress", emoji: "🏰", label: "The Fortress", why: "Difficult entry, impossible eviction. Gate-holders receive everything.", score: 84 });
  if (isHigh(p, "romanticism", 62))
    candidates.push({ id: "believer", emoji: "🌹", label: "The Believer", why: "Still convinced big love is real. Quietly, annoyingly, probably correct.", score: 82 });
  if (isHigh(p, "playfulness", 62))
    candidates.push({ id: "spark", emoji: "⚡", label: "The Spark", why: "Falling for them feels like laughing one second and catching feelings the next.", score: 80 });
  if (isHigh(p, "ambition", 60) && isHigh(p, "discipline", 55))
    candidates.push({ id: "architect", emoji: "🏛️", label: "The Architect", why: "Shows love by building — devotion measured in the things they make together.", score: 78 });
  if (isHigh(p, "emotionalSensitivity", 62))
    candidates.push({ id: "barometer", emoji: "🫀", label: "The Barometer", why: "Feels a shift in the relationship before anyone else has noticed anything.", score: 76 });

  if (!candidates.length)
    candidates.push({ id: "constant", emoji: "🧭", label: "The Constant", why: "Neither loud nor complicated — simply, reliably there.", score: 60 });

  candidates.sort((a, b) => b.score - a.score);
  const pick = candidates[0];
  return { emoji: pick.emoji, label: pick.label, why: pick.why };
}

function greenFlagList(p: PersonalityProfile): string[] {
  const flags: string[] = [];
  if (isHigh(p, "nurturance", 58)) flags.push("Shows love through action so consistently that nobody has to wonder");
  if (isHigh(p, "intensityDepth", 58) || isHigh(p, "attachmentNeed", 58)) flags.push("Commits fully — halfway loyalty isn't in them");
  if (isHigh(p, "emotionalSensitivity", 58)) flags.push("Notices something's wrong before being told — and actually asks");
  if (isHigh(p, "vulnerabilityOpenness", 58)) flags.push("Says the hard honest things while they're still small");
  if (isHigh(p, "independence", 58)) flags.push("Brings a full life to the relationship instead of demanding one from a partner");
  if (isHigh(p, "selfCriticism", 58)) flags.push("Looks at their own part first — you rarely have to guess where they stand");
  if (isHigh(p, "adaptability", 58)) flags.push("Handles change without punishing whoever caused it");
  if (!flags.length) flags.push("Consistency — the trait partners say they valued most, years later");
  return flags.slice(0, 5);
}

function redFlagList(p: PersonalityProfile): string[] {
  const flags: string[] = [];
  if (isHigh(p, "independence", 60) && !isHigh(p, "vulnerabilityOpenness", 55)) flags.push("Goes quiet and pulls away under stress — and unless they say so out loud, the people who love them experience it as being shut out");
  if (isHigh(p, "jealousyRisk", 60)) flags.push("Tests people and checks up on them when insecure — naming the fear out loud works better than collecting evidence");
  if (isHigh(p, "overthinking", 60)) flags.push("Reacts to stories they wrote in their own head instead of what actually happened");
  if (isHigh(p, "needForControl", 60)) flags.push("Slowly moves decisions toward themselves until a partner feels like a guest in their own shared life");
  if (isHigh(p, "selfCriticism", 60) && isHigh(p, "attachmentNeed", 55)) flags.push("Over-gives to keep the peace, then quietly builds resentment about an imbalance they created themselves");
  if (isHigh(p, "idealism", 62)) flags.push("Stays loyal to someone's potential long after the real person has shown they can't live up to it");
  if (!flags.length) flags.push("Avoids conflict until it builds up silently — then explodes, surprising everyone, including themselves");
  return flags.slice(0, 4);
}

function growthLessonFor(p: PersonalityProfile, rng: Rng): string {
  const a = p.styles.attachment;
  if (a.kind === "avoidant-leaning") {
    return rng.pick([
      "The working lesson: letting closeness be the normal setting, not a reward someone earns. The right partner isn't whoever finally earns full access — it's whoever they let see them on an ordinary Tuesday.",
      "The lesson in progress: needing someone is not the same as being trapped by them.",
    ]);
  }
  if (a.kind === "anxious-leaning" || a.kind === "ambivalent") {
    return rng.pick([
      "The working lesson: building a sense of safety from the inside, so a late reply is just a late reply instead of a verdict on the relationship.",
      "The lesson in progress: anxiety makes a terrible storyteller, and people worth keeping don't need to be managed.",
    ]);
  }
  if (isHigh(p, "idealism", 60)) {
    return rng.pick([
      "The working lesson: loving what's real over what's possible — being grown-up means choosing an actual person on an ordinary day.",
      "The lesson in progress: chemistry and compatibility are different things — a match is not the same as a home.",
    ]);
  }
  return rng.pick([
    "The working lesson: letting people know them in real time — closeness happens live, not after all the flaws get fixed.",
    "The lesson in progress: the right people can handle the full version of them; hiding mostly just hides the interesting parts.",
  ]);
}

function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
