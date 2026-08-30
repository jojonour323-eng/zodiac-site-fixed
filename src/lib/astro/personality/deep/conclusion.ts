// ===========================================================================
// CONCLUSION — the final section of the walkthrough: stop explaining
// placements and say what kind of PERSON all of this adds up to.
// ---------------------------------------------------------------------------
// User spec: "keep your archetype and analyse the person from what u know
// and come to conclusion about him". So this section:
//   1. names what the chart actually showed (real placements, plain words)
//   2. delivers the verdict: the archetype, committed to, in plain language
//   3. ties back to the outside/inside gap the reading opened with
// Written for a total beginner. No scores, no jargon, no hedging.
// Authored neutral plural; gv() genderizes at render.
// ===========================================================================

import type { ReadingSection, ReadingBlock } from "../../readingEngine";
import type { PersonalityProfile } from "../model";
import type { Voice } from "./voice";
import type { ArchetypeResult } from "../archetype";
import { SIGN_META } from "../../signs";
import type { Tension } from "./layers";

const para = (text: string): ReadingBlock => ({ type: "paragraph", text });
const callout = (label: string, text: string, variant: ReadingBlock["variant"] = "insight"): ReadingBlock => ({ type: "callout", label, text, variant });

/** "a Aquarius" → "an Aquarius" */
function anOrA(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

// ── Plain one-liners per sign, per role (fresh wording — never reuses
//    sentences from the sign chapters above) ──────────────────────────────

const SUN_SHORT: Record<string, string> = {
  aries: "someone who goes after life head-first",
  taurus: "someone who needs life steady and real",
  gemini: "someone who runs on curiosity and talk",
  cancer: "someone who takes care of people first",
  leo: "someone who needs to shine and be seen",
  virgo: "someone who notices everything and fixes it",
  libra: "someone who needs things fair and pleasant",
  scorpio: "someone who goes deep or not at all",
  sagittarius: "someone who needs room and meaning",
  capricorn: "someone who builds things that last",
  aquarius: "someone who does things their own way",
  pisces: "someone who feels everything around them",
};

const MOON_SHORT: Record<string, string> = {
  aries: "handles feelings fast and out loud",
  taurus: "calms down with routine and comfort",
  gemini: "needs to talk feelings out to understand them",
  cancer: "needs home and close people to feel safe",
  leo: "needs warmth and loyalty back",
  virgo: "settles down by fixing and organizing",
  libra: "needs peace around them to feel okay",
  scorpio: "needs total trust before opening up",
  sagittarius: "needs space and something to look forward to",
  capricorn: "keeps feelings private and under control",
  aquarius: "watches their own feelings from a step back",
  pisces: "soaks up every mood in the room",
};

const RISING_SHORT: Record<string, string> = {
  aries: "arrives like a spark",
  taurus: "arrives calm and solid",
  gemini: "arrives talking",
  cancer: "arrives warm and caring",
  leo: "arrives like the main event",
  virgo: "arrives neat and watchful",
  libra: "arrives friendly and smooth",
  scorpio: "arrives quiet but intense",
  sagittarius: "arrives laughing",
  capricorn: "arrives serious and put together",
  aquarius: "arrives different on purpose",
  pisces: "arrives soft and dreamy",
};

const VENUS_SHORT: Record<string, string> = {
  aries: "falls fast and says so",
  taurus: "loves slow and steady",
  gemini: "falls for words and laughs",
  cancer: "loves by taking care of you",
  leo: "loves big and loud",
  virgo: "loves by quietly fixing your life",
  libra: "loves romance itself",
  scorpio: "loves with everything or nothing",
  sagittarius: "needs a best friend, not just a partner",
  capricorn: "loves carefully and for real",
  aquarius: "needs a friend before a lover",
  pisces: "loves like a movie",
};

// ── The verdict per archetype — committed, plain, personal ────────────────

const VERDICT: Record<string, string> = {
  overthinker:
    "Here's the conclusion: this is a person whose mind never fully clocks out. They replay conversations, audit their own words, and spot problems nobody else has noticed yet. It makes them sharp — and tired. The overthinking isn't worry for its own sake; it's how they stay prepared.",
  vault:
    "Here's the conclusion: this is a person who feels at full volume and shows it at low volume. The calm is real, but it's work, not emptiness. They open on a schedule nobody else sets, and the ones who wait without pushing get a depth most people never see.",
  quiet_storm:
    "Here's the conclusion: this is a quiet person with a lot moving underneath. Almost nothing shows on the surface, and that fools people — the feelings, the drive, and the loyalty all run deeper than the outside suggests. Judge them by their actions, not their volume.",
  main_character:
    "Here's the conclusion: this is a person rooms reorganize around. They don't ask for attention — it just arrives, and they know what to do with it. Under the presence there's more softness than they advertise, and the people they love get it first.",
  plot_twist:
    "Here's the conclusion: this is a person you never fully finish figuring out. Plans bend, tastes change, and last month's version of them may not survive this month. It's not fakeness — it's real motion. The trick with them is enjoying the ride instead of gripping it.",
  lie_detector:
    "Here's the conclusion: this is a person you cannot lie to. They catch the pause before the answer, the story that changed, the smile that didn't reach the eyes. It's not paranoia — their read on people is usually right. Be straight with them and they're the most loyal ally you've ever had.",
  secret_softie:
    "Here's the conclusion: this is a soft person wearing a locked door. They take care of everyone and let almost nobody take care of them. The tenderness is completely real — the access is just restricted. Get past the door and you've got them for life.",
  hopeless_romantic:
    "Here's the conclusion: this is a person who loves the idea of love — and then out-loves it. They fall toward the best version of people, sometimes before the evidence shows up. Real love, once they find it, gets everything they imagined plus effort.",
  perfectionist:
    "Here's the conclusion: this is a person whose inner bar sits higher than everyone else's. Good is a checkpoint, never a destination. They get amazing things done — and pay for it in rest. What they most need to hear: the work was already enough.",
  menace:
    "Here's the conclusion: this is a person trouble follows like a puppy. Not mean — playful, fast, and allergic to boring rules. The glint in the eye arrives two seconds before chaos does. Life with them is never dull, and they'll defend the people they love harder than anyone.",
  therapist_friend:
    "Here's the conclusion: this is the person everyone goes to when things fall apart — and they're actually good at it. They read moods, absorb them, and hand back calm. The catch: after holding everyone, they need someone who asks how THEY are. That person is rare, and it matters.",
  control_freak:
    "Here's the conclusion: this is a person who needs to be the author of their own life. When they choose the plan, they're easygoing; when it's forced on them, cooperation dies. It's not bossiness — it's about authorship. Hand them the pen and everything goes smoother.",
  escape_artist:
    "Here's the conclusion: this is a person who keeps one foot near the door. When reality disappoints the picture in their head, they'd rather start fresh than repair. Doors are never fully closed behind them. If you love them, don't lock anything — make staying feel like a choice they keep getting to make.",
  golden:
    "Here's the conclusion: this is simply a good-hearted person. They like people by default, forgive fast, and don't keep score. Don't mistake the softness for weakness — it's a choice they keep making, and it makes every room they're in better.",
  drama_queen:
    "Here's the conclusion: this is a person who feels big and narrates big. Life at regular volume isn't enough for them, so they turn it up. The drama is real feeling looking for a stage — give it one, and the storms become the best stories you'll ever hear.",
  stoic:
    "Here's the conclusion: this is a person who carries more than they ever mention. They absorb what would fold other people, adjust the plan, and say nothing. Don't read the silence as distance — check on them anyway. That's the one thing they'll never ask for.",
  chaos_merchant:
    "Here's the conclusion: this is a person who makes decisions three hops ahead of the consequences. They don't create chaos on purpose — they just move fast and clean up later. Around them, life is unsteady but never boring, and their recoveries are honestly impressive.",
  strategist:
    "Here's the conclusion: this is a person playing a longer game than everyone else at the table. While others react to move one, they're already on move four. Patience plus planning makes them nearly unbeatable — just don't expect them to show their hand early.",
  free_spirit:
    "Here's the conclusion: this is one of the freest charts there is. They need room the way other people need air — not because they don't love people, but because closeness without space feels like a cage. Hold them tighter and they slip away; give them space and they stay.",
  steady_heart:
    "Here's the conclusion: this is a person who stays. When they're in, they're in — and the people they love get a consistency that's almost extinct these days. They move slowly, they mean everything, and they're the one still standing there when things get hard.",
};

// ── The section ─────────────────────────────────────────────────────────────

export function buildConclusionSection(
  p: PersonalityProfile,
  voice: Voice,
  t: Tension,
  archetype: ArchetypeResult
): ReadingSection {
  const f = p.facts;
  const signOf = (id: string | undefined) =>
    id ? SIGN_META[id]?.name ?? "" : "";

  // 1. Framing
  const p1 = voice.t(
    "The walkthrough is done — every part of the chart got explained. So here's the last section, and the only one that's an opinion: what all of it says about the actual person."
  );

  // 2. What the chart showed — real placements, plain words, fresh phrasing
  const sunName = signOf(f.sun);
  const moonName = signOf(f.moon);
  const risingName = SIGN_META[f.rising]?.name ?? "";
  const venusName = signOf(f.venus);

  const parts: string[] = [];
  if (sunName) parts.push(`${anOrA(sunName)} ${sunName} Sun — ${SUN_SHORT[f.sun] ?? "a clear main character"}`);
  if (moonName) parts.push(`${anOrA(moonName)} ${moonName} Moon that ${MOON_SHORT[f.moon] ?? "feels in its own way"}`);
  if (risingName) parts.push(`${anOrA(risingName)} ${risingName} Rising that ${RISING_SHORT[f.rising] ?? "makes its own entrance"}`);
  if (f.venus) parts.push(`${anOrA(venusName)} ${venusName} Venus that ${VENUS_SHORT[f.venus] ?? "loves in its own language"}`);

  const listStr =
    parts.length > 1
      ? `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`
      : parts[0] ?? "";

  // Short sentences rule: the placement list is split across two sentences.
  const firstPart = parts[0] ?? "";
  const restParts = parts.slice(1);
  const restStr =
    restParts.length > 1
      ? `${restParts.slice(0, -1).join(", ")}, and ${restParts[restParts.length - 1]}`
      : restParts[0] ?? "";

  let p2 = voice.t(
    parts.length > 1
      ? `Put simply: this chart belongs to ${firstPart}. Alongside it: ${restStr}.`
      : `Put simply: this chart belongs to ${listStr}.`
  );
  if (f.mars) {
    const marsClause = voice.t(`${anOrA(signOf(f.mars))} ${signOf(f.mars)} Mars sets the pace underneath all of it.`);
    p2 += " " + marsClause.charAt(0).toUpperCase() + marsClause.slice(1);
  }

  // 3. The verdict — archetype, committed to (the archetype's own reason
  //    line already lives on the Home tab card; never duplicate it here)
  const verdict = VERDICT[archetype.id] ?? VERDICT.steady_heart;
  const verdictBlock = callout(
    `The verdict: ${archetype.emoji} ${archetype.label}`,
    voice.t(verdict),
    "insight"
  );

  // 4. Tie-back to the opening gap + one thing to remember
  const p4 = voice.t(
    `One last thing. Remember the gap this reading started with — ${t.outsideShort} on the outside, ${t.insideShort} on the inside. That gap isn't a flaw and it isn't a mystery. It's the design of this person, and every part of the chart above agreed on it. Expect both layers, and ${voice.s === "they" ? "they" : voice.s} will make sense the whole way through.`
  );

  const blocks: ReadingBlock[] = [para(p1), para(p2), verdictBlock, para(p4)];

  const obj = voice.o === "them" ? "Them" : voice.o === "her" ? "Her" : "Him";
  return { id: "conclusion", title: `The Conclusion About ${obj}`, blocks };
}
