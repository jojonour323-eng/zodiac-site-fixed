// ===========================================================================
// FULL READING — the deep version of the same personality model
// ---------------------------------------------------------------------------
// Sections adapt to what the chart actually supports: strong patterns get
// long treatment, unsupported sections shrink or vanish. Interaction between
// placements is the spine of every paragraph, not isolated keywords.
// Output shape matches the existing ReadingView (PersonalReading).
// ===========================================================================

import type { ReadingSection, ReadingBlock } from "../readingEngine";
import type { PersonalityProfile } from "./model";
import { prettyPlanet } from "./model";
import type { Dimension, Rng } from "./core";
import { makeRng } from "./core";
import { v, isHigh, isLow, topDims, citeDim, joinAnd, cap } from "./prose";
import { HOUSE_DOMAIN } from "./signPsych";

const para = (text: string): ReadingBlock => ({ type: "paragraph", text });
const callout = (label: string, text: string, variant: ReadingBlock["variant"] = "insight"): ReadingBlock => ({ type: "callout", label, text, variant });
const example = (text: string): ReadingBlock => ({ type: "example", text });
const sub = (text: string): ReadingBlock => ({ type: "subheading", text });
const bullets = (items: string[]): ReadingBlock => ({ type: "bullets", items });

export function buildFullReading(p: PersonalityProfile, gender?: "male" | "female" | null): { archetype: string; archetypeLine: string; intro: string; sections: ReadingSection[] } {
  const rng = makeRng(p.facts.seed + "|full");
  const sections: ReadingSection[] = [];

  sections.push(whoYouAre(p, rng));
  sections.push(visibleVsHidden(p, rng));
  sections.push(emotionalWorld(p, rng));
  sections.push(mindAndCommunication(p, rng));
  sections.push(loveAndRelationships(p, rng, gender));
  sections.push(desireAndDrive(p, rng));
  sections.push(socialPersonality(p, rng));
  sections.push(ambitionMoneyWorth(p, rng));
  sections.push(strengthsAndShadows(p, rng));
  const themesSec = recurringThemes(p);
  if (themesSec) sections.push(themesSec);
  const blind = blindSpots(p, rng);
  if (blind) sections.push(blind);
  sections.push(growthDirection(p, rng));

  const top = topDims(p, 2);
  const archetypeLine = top.length
    ? `Defined chiefly by ${top.map((t) => humanDim(t.key, t.value)).join(" and ")}.`
    : "A broadly balanced chart with no single runaway pattern.";

  const intro = buildIntro(p, rng);

  return { archetype: "", archetypeLine, intro, sections };
}

function humanDim(d: Dimension, value: number): string {
  const names: Partial<Record<Dimension, [string, string]>> = {
    independence: ["a fierce independent streak", "a preference for leaning on others"],
    attachmentNeed: ["deep attachment needs", "self-contained relating"],
    emotionalSensitivity: ["high emotional sensitivity", "emotional evenness"],
    emotionalControl: ["strong emotional containment", "openly expressed feeling"],
    overthinking: ["a relentlessly analyzing mind", "an easygoing mental pace"],
    intensityDepth: ["all-or-nothing intensity", "an even, moderate intensity"],
    confidence: ["solid self-trust", "inner doubt that needs managing"],
    impulsivity: ["act-first instinct", "deliberate pacing"],
    romanticism: ["a romantic core", "pragmatic love style"],
    nurturance: ["a caretaker instinct", "self-focused reserves"],
    needForControl: ["a need for authorship", "relaxed control needs"],
    trustCaution: ["carefully issued trust", "default-open trust"],
  };
  const pair = names[d];
  if (pair) return value >= 50 ? pair[0] : pair[1];
  return d.replace(/([A-Z])/g, " $1").toLowerCase();
}

// ---------------------------------------------------------------------------
// 1. Who you are
// ---------------------------------------------------------------------------

function whoYouAre(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const f = p.facts;
  const el = f.dominantElement;

  blocks.push(para(
    rng.pick([
      "Start with the foundation, because everything else in this reading stands on it.",
      "Before placements and details — here is the structure underneath.",
    ])
  ));

  const elText: Record<string, string> = {
    fire: "This chart runs on fire: identity is built through action, and feeling alive is a requirement, not a luxury. When their life has momentum, everything else works; when it stalls, they suffer in a way that's easy to mistake for laziness or moodiness but is actually fuel with nowhere to go.",
    earth: "This chart runs on earth: worth is proven through tangible results, and security is a need, not a preference. They trust what can be touched, measured, and repeated — and they quietly judge their life by whether it's actually working, not whether it looks good.",
    air: "This chart runs on air: experience gets processed through ideas, language, and perspective before it lands anywhere emotional. Understanding something is how they control it; being denied information or conversation is uniquely uncomfortable for them.",
    water: "This chart runs on water: emotional truth is the primary data source, and it rarely negotiates. Mood is information, atmosphere is tangible, and decisions that look irrational from the outside usually made complete sense to their feelings first.",
  };
  blocks.push(para(elText[el]));

  if (f.secondaryElement) {
    const second: Record<string, string> = {
      fire: "A strong secondary fire current adds heat — impatience, appetite, and the need to be up to something.",
      earth: "A strong secondary earth current keeps pulling them toward practicality — even their wildest ideas eventually get asked what they're good for.",
      air: "A strong secondary air current keeps things conceptual — analysis, framing, and re-framing are how they take breaks from feeling.",
      water: "A strong secondary water current keeps the emotional channel open even when everything else says be practical.",
    };
    blocks.push(para(second[f.secondaryElement]));
  }

  const dom = f.dominantModality;
  const modText: Record<string, string> = {
    cardinal: `The dominant mode is cardinal — starting is instinctive. ${"They are wired to initiate: new projects, new plans, new versions of themselves. Finishing and maintaining are learned skills for them, not defaults."}`,
    fixed: "The dominant mode is fixed — sustaining is instinctive. Once they commit to something (a person, a position, a plan), moving them requires either their consent or a truck. Staying is the strength; leaving is the learned skill.",
    mutable: "The dominant mode is mutable — adapting is instinctive. They change approach easily, sometimes several times before others have picked one, and that flexibility is both their survival mechanism and the thing people find hardest to pin down about them.",
  };
  blocks.push(para(modText[dom]));

  // Chart-wide interaction: most distinctive dimension blended with Sun visibility
  const dims = topDims(p, 3);
  if (dims.length) {
    const lines = dims.map((d) => {
      const cite = citeDim(p, d.key);
      const desc = humanDim(d.key, d.value);
      if (d.value >= 62) return `${cap(desc)}${cite ? ` — this trace comes from ${cite.toLowerCase()}` : ""}`;
      if (d.value <= 40) return `${cap(desc)}${cite ? ` — sourced from ${cite.toLowerCase()}` : ""}`;
      return "";
    }).filter(Boolean);
    if (lines.length) {
      blocks.push(para(`What makes this chart distinctive when it's read as a whole: ${joinAnd(lines).replace(/\.$/, "")}. No single placement explains it — it's the overlap that creates it.`));
    }
  }

  // stellium / chart ruler as the life focus
  const stel = f.stelliums[0];
  if (stel && f.timeKnown) {
    const where = stel.kind === "house" ? `house ${stel.target} — ${HOUSE_DOMAIN[stel.target as number]}` : `the sign of ${String(stel.target)[0].toUpperCase() + String(stel.target).slice(1)}`;
    blocks.push(callout(
      "Where life keeps concentrating",
      `Multiple planets pile into ${where}. In practice this means one area of life carries more than its share of development: it's where energy pools, where events repeat, and where most of this person's growing up happens.`,
      "insight"
    ));
  } else if (f.chartRuler) {
    blocks.push(callout(
      "The steering planet",
      `${prettyPlanet(f.chartRuler.planet)} rules the Ascendant and sits in house ${f.chartRuler.house} (${HOUSE_DOMAIN[f.chartRuler.house]}), quietly steering this life toward that territory.`,
      "insight"
    ));
  }

  return { id: "who-you-are", title: "Who You Are", blocks };
}

// ---------------------------------------------------------------------------
// 2. Visible vs hidden
// ---------------------------------------------------------------------------

function visibleVsHidden(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const express = v(p, "expressiveness");
  const conf = v(p, "confidence");
  const sc = v(p, "selfCriticism");
  const sens = v(p, "emotionalSensitivity");
  const ctrl = v(p, "emotionalControl");
  const vuln = v(p, "vulnerabilityOpenness");

  blocks.push(para(
    rng.pick([
      "Every personality has two layers: the broadcast and the signal underneath. Here's how they split for this person.",
      "Read the surface and the subsurface side by side, because they don't match — and the gap is where most misunderstandings about this person happen.",
    ])
  ));

  const seen: string[] = [];
  const hidden: string[] = [];

  if (express >= 58) seen.push("energetic, expressive, easy to read in the moment — reactions show before words do");
  else seen.push("composed, economical with self-disclosure, slightly hard to read at first contact");

  if (conf >= 60) seen.push("self-assured — they speak like someone who expects to be taken seriously");
  if (conf <= 45) seen.push("capable and low-key, more comfortable proving than proclaiming");
  if (v(p, "socialEnergy") >= 60) seen.push("socially available, quick to engage");
  if (v(p, "socialSelectivity") >= 60) seen.push("polite with everyone, but clearly holding something back");

  if (sc >= 60 && conf >= 55) hidden.push("a harsh internal auditor that grades everything they do, far more strict than anything they'd say aloud to another person");
  if (sens >= 60 && ctrl >= 58) hidden.push("emotional processing at full volume, happening privately and on a delay — most reactions they show are the second draft");
  if (v(p, "attachmentNeed") >= 60 && v(p, "independence") >= 60) hidden.push("genuine dependence on their chosen people that the independent image carefully disguises");
  if (vuln <= 45) hidden.push("a curated inner world — access is granted by decision, not by time alone");
  if (v(p, "trustCaution") >= 60) hidden.push("quiet background testing of people's reliability, running even in friendly contexts");

  blocks.push(sub("What people see"));
  blocks.push(bullets(seen));

  blocks.push(sub("What is actually happening underneath"));
  if (hidden.length) {
    blocks.push(bullets(hidden));
  } else {
    blocks.push(para("Less than usual hides here — this is one of the more internally consistent charts. What's on display and what's underneath largely agree, which makes this person easier to trust and harder to misunderstand."));
  }

  // The gap sentence
  if (sc >= 60 && conf >= 60) {
    blocks.push(callout("The gap that matters", "Confidence on the outside and self-criticism on the inside coexist without canceling out. People take the confidence at face value and push them harder as a result — feedback lands on someone already grading themselves, so criticism from others cuts twice as deep as intended.", "shadow"));
  } else if (sens >= 62 && ctrl >= 60) {
    blocks.push(callout("The gap that matters", "The calm people observe is a managed product. By the time they mention that something bothered them, it has usually been analyzed, downscaled, and repackaged into something palatable — which means small resentments can exist invisibly for months.", "shadow"));
  }

  return { id: "visible-hidden", title: "What People See vs What's Underneath", blocks };
}

// ---------------------------------------------------------------------------
// 3. Emotional world
// ---------------------------------------------------------------------------

function emotionalWorld(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const sens = v(p, "emotionalSensitivity");
  const ctrl = v(p, "emotionalControl");

  blocks.push(para(
    rng.pick([
      "The emotional system is the engine room of this chart, so it gets the longest look.",
      "How feelings actually move through this person — arrival, processing, expression — tells you more about them than any single trait.",
    ])
  ));

  if (sens >= 62) {
    blocks.push(para(
      rng.pick([
        "Sensitivity runs high. Emotional information — tone, mood, the pause before an answer — reaches them early and at high resolution. This makes them exceptional at reading people and also means an ordinary day delivers more emotional input to them than to the average person. Crowds, conflict, and even good news carry intensity.",
        "They feel in high definition. The upside is empathy that people can physically feel when they're on the receiving end; the cost is that emotional shocks hit harder and last longer than they'd choose.",
      ])
    ));
  } else if (sens <= 42) {
    blocks.push(para(
      rng.pick([
        "The emotional system is a stabilizer rather than an amplifier. Feelings register, get assessed, and move through without taking over the controls. In crises, they're the person whose voice actually gets calmer.",
        "Emotions here are real but low-drama. They don't chase intensity of feeling, don't spiral easily, and are often the one reminding others that the situation is survivable.",
      ])
    ));
  }

  if (ctrl >= 62) {
    blocks.push(para(
      rng.pick([
        `Expression is deliberately gated (${ctrl} control). Feelings are processed, edited, and released on schedule — theirs. The system works well until it doesn't: sustained suppression converts to physical tension, sudden irritability, or an uncharacteristic blow-up that surprises everyone, including them.`,
        "Containment is the default. They believe — usually correctly — that most feelings expire if not fed, so they starve them privately. The flaw in the method is that some feelings don't expire; they just go underground and drive behavior from there.",
      ])
    ));
  }

  // State-based behaviors (only what the chart supports)
  const states: string[] = [];
  if (sens >= 58 && isHigh(p, "overthinking", 58)) {
    states.push("When hurt: they withdraw and analyze. Expect shorter answers, longer response times, and a polite normalcy that isn't normal. The fastest repair is naming the thing directly — they rarely volunteer that something landed.");
  }
  if (isHigh(p, "impulsivity", 58) && v(p, "emotionalControl") <= 55) {
    states.push("When angry: it shows immediately and burns fast. Words come out at full velocity, some of them harder than intended — then it's over, often with genuine confusion about why the other person is still upset an hour later.");
  }
  if (ctrl >= 62) {
    states.push("When overwhelmed: they go quieter, not louder. The world shrinks to what must be handled, feelings go to voicemail, and they white-knuckle through. It looks like competence from the outside and costs more than anyone knows.");
  }
  if (isLow(p, "resilience", 45)) {
    states.push("After rejection: it lingers. They replay what went wrong, audit their own behavior, and need actual time before the confidence returns. A check-in from someone they trust does more than they'll admit.");
  }
  if (v(p, "attachmentNeed") >= 60) {
    states.push("When feeling insecure about someone: reassurance-seeking can go covert — testing, comparing, fishing. Explicit reassurance works almost instantly; making them ask for it repeatedly breeds resentment.");
  }
  if (v(p, "independence") >= 62) {
    states.push("When upset: they need space first, connection later. Pushing for immediate emotional processing triggers the opposite of what it's for.");
  }
  if (states.length) {
    blocks.push(sub("In specific states"));
    blocks.push(bullets(states.slice(0, 4)));
  }

  // Emotional safety
  const safety: string[] = [];
  if (isHigh(p, "nurturance", 58)) safety.push("feeling useful to the people they love");
  if (isHigh(p, "independence", 60)) safety.push("knowing exit exists — options, savings, their own space");
  if (v(p, "emotionalSensitivity") >= 58) safety.push("environments without low-grade tension — they can't relax next to unspoken conflict");
  if (isHigh(p, "needForControl", 58)) safety.push("having a plan and the authority to adjust it");
  if (isHigh(p, "attachmentNeed", 58)) safety.push("consistency — the same person answering on Friday as on Monday");
  if (safety.length) {
    blocks.push(callout("What actually creates emotional safety for them", joinAnd(safety) + ".", "insight"));
  }

  return { id: "emotional-world", title: "The Emotional World", blocks };
}

// ---------------------------------------------------------------------------
// 4. Mind & communication
// ---------------------------------------------------------------------------

function mindAndCommunication(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const t = p.styles.thinking;
  const over = v(p, "overthinking");
  const dir = v(p, "communicationDirectness");

  blocks.push(para(
    rng.pick([
      "Their mind is a specific instrument, not a generic one. Here's how it actually runs.",
      "How they think decides how they argue, decide, and fall for things — so this section is really about all three.",
    ])
  ));

  const thinkText: Record<string, string> = {
    analytical: "Processing is analytical: claims get taken apart, mechanisms get checked, and 'because I said so' has never once worked. They build understanding brick by brick and distrust conclusions that arrived without construction.",
    intuitive: "Processing is intuitive: the answer arrives finished, and the reasoning gets reconstructed afterward if anyone demands it. Their first read of a person or situation is frequently correct, and they've learned to respect it even when they can't yet defend it.",
    hybrid: "Processing runs on two channels — logic and gut — and they notice when the channels disagree. That internal ping between 'it makes sense' and 'it feels wrong' is one of their most reliable decision tools, if they listen to it.",
    deliberate: "Processing is deliberate: they think things through at length, from multiple angles, and arrive at conclusions that are hard to shake because too much was considered to reach them. Speed costs them; accuracy pays them back.",
  };
  blocks.push(para(thinkText[t.kind]));

  if (over >= 60) {
    blocks.push(para(
      rng.pick([
        "The loop is real: conversations get replayed, messages get re-read for the third hidden meaning, decisions get audited after they're already made. This produces genuine insight and genuine exhaustion in equal amounts. The pattern intensifies at night and after social events.",
        "Overthinking is the tax this mind pays for its depth. A two-line text can generate forty minutes of analysis — what was the tone, why that word, what changed. The same engine makes them excellent at spotting what's off in a situation; it just never fully clocks out.",
      ])
    ));
    blocks.push(example(
      rng.pick([
        "A friend replies 'ok' to a long message. Most people move on. They reread it, compare it to how the friend usually writes, and by midnight have a working theory about what's wrong — which is sometimes right, which is exactly why the habit survives.",
        "After a job interview they can reconstruct every answer they gave, grade each one, and identify the exact sentence where it went wrong — real skill, brutal cost.",
      ])
    ));
  }

  blocks.push(sub("Communication style"));
  if (dir >= 62) {
    blocks.push(para(
      rng.pick([
        "Direct to a fault. They say the thing — in meetings, in relationships, in comments sections. Softening a message feels dishonest to them, so they don't much do it, and they extend the same expectation: don't manage them, just be clear.",
        "Blunt by default. They'd rather have an awkward five minutes than a vague five months. People who need constant cushioning find them exhausting; people who hate decoding love them.",
      ])
    ));
  } else if (dir <= 45) {
    blocks.push(para(
      rng.pick([
        "Indirect and adaptive. They communicate to keep connection intact, which means hard truths arrive packaged, delayed, or via hint. Conflict-avoidant isn't quite right — they'll engage, but only after the message has been softened enough to be safe.",
        "Their words are chosen for effect on the listener, not precision of the sender. It makes them diplomatic and sometimes unreadable — even the people close to them wish they'd just say the thing.",
      ])
    ));
  } else {
    blocks.push(para("Communication flexes with context: direct where they're confident, measured where stakes are high. They can hold a hard conversation when it's worth it and smooth one over when it isn't."));
  }

  // What opens them up / shuts them down
  const opens: string[] = [];
  const shuts: string[] = [];
  if (v(p, "emotionalSensitivity") >= 55) opens.push("genuine curiosity about their inner state ('what was that like for you?') — tone matters more than wording");
  if (v(p, "analyticalThinking") >= 58) opens.push("intellectual respect — engaging their reasoning instead of overruling it");
  if (isHigh(p, "trustCaution", 58)) opens.push("consistency over time; the vault opens on evidence, not on request");
  if (v(p, "playfulness") >= 58) opens.push("humor — they reveal themselves sideways, through jokes that are only half jokes");
  if (isHigh(p, "needForControl", 58)) shuts.push("feeling managed or cornered — demand a sharing and they'll inventory their privacy instead");
  if (v(p, "emotionalSensitivity") >= 58) shuts.push("criticism wrapped in sarcasm about something they care about");
  if (isLow(p, "patience", 45) ? false : v(p, "independence") >= 60) shuts.push("being crowded the moment they start to open up");
  if (opens.length || shuts.length) {
    const items: string[] = [];
    if (opens.length) items.push(`Opens them up: ${joinAnd(opens)}.`);
    if (shuts.length) items.push(`Shuts them down: ${joinAnd(shuts)}.`);
    blocks.push(bullets(items));
  }

  return { id: "mind-communication", title: "How the Mind Works & How They Communicate", blocks };
}

// ---------------------------------------------------------------------------
// 5. Love & relationships
// ---------------------------------------------------------------------------

function loveAndRelationships(p: PersonalityProfile, rng: Rng, gender?: "male" | "female" | null): ReadingSection {
  void gender;
  const blocks: ReadingBlock[] = [];
  const a = p.styles.attachment;
  const rom = v(p, "romanticism");
  const jel = v(p, "jealousyRisk");
  const trust = v(p, "trustCaution");

  blocks.push(para(
    rng.pick([
      "Relationships are where this chart's deepest patterns show up first — attachment, trust, control, and vulnerability all get tested there.",
      "In love, the personality model becomes visible: everything else in this reading gets acted out with a person they chose.",
    ])
  ));

  blocks.push(callout("Attachment pattern", `They ${a.note}. ${attachmentAdvice(a.kind)}`, "insight"));

  // Attraction
  const attract: string[] = [];
  if (isHigh(p, "intensityDepth", 60)) attract.push("depth — someone with layers they haven't fully mapped after three months");
  if (isHigh(p, "confidence", 60)) attract.push("self-possession — people with their own gravity who don't orbit anyone");
  if (isHigh(p, "playfulness", 58)) attract.push("play — someone who matches wit instead of demanding sincerity immediately");
  if (isHigh(p, "nurturance", 60)) attract.push("warmth that feels like home, not performance");
  if (isHigh(p, "independence", 62)) attract.push("self-sufficiency — a person with a full life who chooses them, not needs them");
  if (isHigh(p, "idealism", 60)) attract.push("vision — someone moved by something bigger than their own comfort");
  if (attract.length) {
    blocks.push(para(`What actually catches their attention: ${joinAnd(attract)}. Notice what's not on the list: availability logistics, smoothness of the approach, or how hard someone pursues — ${v(p, "trustCaution") >= 58 ? "and heavy pursuit early on actually raises suspicion rather than interest" : "consistent interest matters more than impressive gestures"}.`));
  }

  // What makes them fall / attached
  blocks.push(para(
    rng.pick([
      `Falling, for them, is less a moment than an accumulation — ${rom >= 60 ? "though when the accumulation crosses the line, they fall completely and structure their life around the person faster than they'd publicly admit" : "a steady deepening that they only notice once it's already structural"}. What cements attachment: ${joinAnd(attachmentGlue(p))}.`,
    ])
  ));

  // Trust
  if (trust >= 58) {
    blocks.push(para(
      rng.pick([
        "Trust is issued on evidence. Early on they watch how people treat waiters, keep small promises, handle their bad days — the background checks never formally announce themselves, but they're always running. Failing one doesn't always mean the end; failing it twice with the same category of behavior does.",
        "They give people clean slates and keep meticulous records. The slate stays clean through consistency, and the records mean that patterns — not incidents — are what end things.",
      ])
    ));
  } else {
    blocks.push(para(
      rng.pick([
        "Trust comes easily to them and betrayal genuinely confuses them — they tend to give people the benefit of the doubt long past the point others would withdraw it.",
        "They trust by default and extend second chances naturally, which builds loyalty fast and occasionally keeps them attached to people who should have been filtered out earlier.",
      ])
    ));
  }

  // Jealousy — only if supported
  if (jel >= 62) {
    blocks.push(callout(
      "The jealousy pattern (worth knowing)",
      rng.pick([
        "Possessive potential is genuinely present in this chart. It usually activates under uncertainty — ambiguous relationships, inconsistent contact, or a rival who seems to offer what they can't. Left unspoken it turns into monitoring and score-keeping; spoken early, it's surprisingly manageable.",
        "When they love, the thought of losing that person registers as threat, not tragedy. The impulse is to grip harder — more contact, more certainty, more proof. The growth move is the opposite: naming the fear instead of managing the evidence.",
      ]),
      "shadow"
    ));
  }

  // Unhealthy patterns — only what's supported
  const unhealthy: string[] = [];
  if (isHigh(p, "idealism", 62)) unhealthy.push("idealizing someone before the evidence supports the picture, then renegotiating reality painfully later");
  if (isHigh(p, "selfCriticism", 62) && v(p, "attachmentNeed") >= 58) unhealthy.push("over-apologizing and over-flexing to keep the peace, then quietly resenting the asymmetry they created");
  if (isHigh(p, "independence", 62) && v(p, "vulnerabilityOpenness") <= 48) unhealthy.push("using distance as a first response to hurt — the withdrawal that protects them is the thing that makes partners feel shut out");
  if (jel >= 62) unhealthy.push("managing anxiety through checking and testing instead of asking");
  if (isHigh(p, "overthinking", 60)) unhealthy.push("constructing entire narratives from partial data and then reacting to the story they wrote");
  if (isHigh(p, "needForControl", 60)) unhealthy.push("steering plans, logistics, and decisions until the other person feels like a passenger in their own relationship");
  if (unhealthy.length) {
    blocks.push(sub("Unhealthy patterns this chart is prone to"));
    blocks.push(bullets(unhealthy.slice(0, 4)));
    blocks.push(para("These are tendencies, not verdicts — they activate under specific conditions (uncertainty, loss of control, feeling unchosen) and mostly disappear in relationships where those conditions don't arise."));
  }

  // What a healthy relationship must provide
  const needs: string[] = [];
  if (isHigh(p, "independence", 58)) needs.push("real autonomy inside the relationship — a partner who has their own life and doesn't audit theirs");
  if (isHigh(p, "attachmentNeed", 58)) needs.push("emotional consistency — warmth that doesn't run on their bad days");
  if (isHigh(p, "emotionalSensitivity", 58)) needs.push("softness in conflict — tone matters more than content when they're triggered");
  if (isHigh(p, "needForControl", 58)) needs.push("shared authorship — veto power and genuine say, not consultation after decisions");
  if (isHigh(p, "playfulness", 58)) needs.push(" laughter that survives long-term — seriousness erodes them");
  if (isHigh(p, "ambition", 58)) needs.push("mutual growth — a partnership moving somewhere, not just comfortable");
  if (needs.length) {
    blocks.push(callout("What a healthy relationship must provide them", joinAnd(needs) + ".", "insight"));
  }

  return { id: "love", title: "Love & Relationship Psychology", blocks };
}

function attachmentAdvice(kind: string): string {
  switch (kind) {
    case "anxious-leaning":
      return "For partners: predictability is the love language here — estimated response times matter more than grand gestures.";
    case "avoidant-leaning":
      return "For partners: don't chase the withdrawal; leave the door visibly open and let them walk back through it on their own.";
    case "ambivalent":
      return "For partners: the closeness-and-suspicion combo isn't mixed feelings about you — it's the system testing whether safety holds under pressure.";
    default:
      return "This is about as secure as attachment wiring gets — conflict doesn't destabilize the bond, which makes them easy to be in a relationship with.";
  }
}

function attachmentGlue(p: PersonalityProfile): string[] {
  const glue: string[] = [];
  if (isHigh(p, "emotionalSensitivity", 58)) glue.push("being genuinely understood once — a single moment of feeling accurately seen does more than months of compliments");
  if (isHigh(p, "trustCaution", 58)) glue.push("someone staying consistent through one of their tests without resenting the test");
  if (isHigh(p, "nurturance", 58)) glue.push("being needed in practical ways — fixing, helping, showing up");
  if (isHigh(p, "vulnerabilityOpenness", 58)) glue.push("mutual disclosure — their openness deepens when it's matched");
  if (isHigh(p, "playfulness", 58)) glue.push("shared humor that no one else gets");
  if (!glue.length) glue.push("time plus consistency — slow-built reliability is what converts interest into attachment");
  return glue;
}

// ---------------------------------------------------------------------------
// 6. Desire & drive (Mars)
// ---------------------------------------------------------------------------

function desireAndDrive(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const imp = v(p, "impulsivity");
  const conf = v(p, "confidence");
  const disc = v(p, "discipline");
  const c = p.styles.conflict;

  blocks.push(para(
    rng.pick([
      "Desire, anger, and persistence share wiring. This is how theirs operates.",
      "The pursuit system — goals, friction, anger, limits — runs like this.",
    ])
  ));

  blocks.push(para(
    imp >= 62
      ? "They pursue the way a sprinter pursues: fast off the line, all momentum, tunnel vision. Obstacles get hit at speed rather than studied, which wins races and occasionally creates wreckage a slower person would have avoided. Waiting for readiness is not part of their process — readiness is something they decide has already happened."
      : imp <= 42
        ? "They pursue deliberately: survey, plan, begin, persist. What they lose in launch speed they gain in staying power — the person still working the problem at hour six is usually them. But delay has a cost too: opportunities with windows occasionally close while they're still preparing."
        : "They pursue in phases: quick start when interested, sustained effort when committed. The initial burst carries them through early obstacles; whether they continue depends almost entirely on whether the goal still feels like theirs."
  ));

  blocks.push(sub("Anger and confrontation"));
  const conflictText: Record<string, string> = {
    confrontational: "Conflict is engaged, not avoided. When something's wrong they say it — promptly, directly, and with more volume than the situation strictly requires. The upside: no slow poison, no buried resentment. The repair usually starts when they're ready to talk, which is soon.",
    diplomatic: "Conflict gets managed, not fought. They read the room, soften the entry, and aim for resolution that costs no one their dignity. What others miss: this isn't weakness — it's control. They choose battles with an accountant's precision.",
    avoidant: "Conflict is experienced as a threat to be de-escalated by distance. They go quiet, go busy, or go agreeable — anything that isn't the fight. The pattern protects everyone's short-term comfort and stores the real issue for later, when it's usually bigger.",
    "explosive-controlled": "Anger is banked, not spent. They absorb, stay functional, absorb more — until the limit arrives, and then the release is outsized and total. People who know them well read the early signs (shorter answers, less humor) and de-escalate before the dam breaks.",
  };
  blocks.push(para(conflictText[c.kind]));

  if (disc >= 58) {
    blocks.push(para(
      rng.pick([
        "Persistence is the quiet superpower. They can do unglamorous repetition on a schedule, which is the actual mechanism behind most impressive outcomes.",
        "Their discipline isn't loud. It's the boring, decisive kind — showing up again, on time, when the novelty died weeks ago.",
      ])
    ));
  }
  if (conf >= 60 && disc <= 45) {
    blocks.push(para(
      "The risk profile: huge starts, fragile middles. They begin with more energy than anyone and need either fast results or external structure to bridge the gap between enthusiasm and outcome."
    ));
  }

  blocks.push(callout(
    "When they reach their limit",
    rng.pick([
      `Past the limit they ${limitBehavior(p)}.`,
      `The tell that they've hit their ceiling: ${limitBehavior(p)}.`,
    ]),
    "shadow"
  ));

  return { id: "desire-drive", title: "Desire, Drive & the Limit", blocks };
}

function limitBehavior(p: PersonalityProfile): string {
  if (isHigh(p, "independence", 58) && v(p, "emotionalControl") >= 55) return "go silent and start rearranging logistics in their head — plans that quietly no longer include the thing that pushed them";
  if (isHigh(p, "impulsivity", 58)) return "act decisively and irreversibly — the resignation letter, the blocks, the burning of bridges happens faster than bystanders can intervene";
  if (isHigh(p, "emotionalSensitivity", 58)) return "take it personally in a way that outlasts the argument — the specific words get remembered for years";
  if (isHigh(p, "needForControl", 58)) return "take over completely — either total control of the situation or total exit from it, nothing in between";
  return "withdraw investment quietly; from the outside it looks like nothing changed until it's already over";
}

// ---------------------------------------------------------------------------
// 7. Social personality
// ---------------------------------------------------------------------------

function socialPersonality(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const s = p.styles.social;

  blocks.push(para(
    rng.pick([
      "First impressions of this person are reliable — up to a point. Here's the full social map.",
      "Their social behavior has layers that only separate out over time.",
    ])
  ));

  blocks.push(para(
    s.kind === "outgoing"
      ? "With strangers they're warm immediately — conversation starts easily, humor comes out early, and people leave interactions feeling better. The openness is genuine, not tactical."
      : s.kind === "selective"
        ? "With strangers they're pleasant, composed, and slightly inscrutable — friendly enough to be likable, reserved enough that nobody mistakes it for closeness. First impressions are consistently 'likeable but hard to know,' and that read is accurate."
        : s.kind === "situational"
          ? "With strangers they adapt to the room's energy — lively where liveliness is welcomed, quiet where it isn't. People from different contexts often describe them as completely different people, and they're all correct."
          : "With strangers they're polite but economical — present, courteous, and largely self-contained. They're not shy in the painful sense; socializing simply isn't where they get value."
  ));

  const friendLines: string[] = [];
  if (isHigh(p, "playfulness", 58)) friendLines.push("teasing, inside jokes, and an energy only the inner circle sees");
  if (isHigh(p, "attachmentNeed", 58)) friendLines.push("fierce loyalty and real investment — they remember the details of your life");
  if (isHigh(p, "emotionalSensitivity", 58)) friendLines.push("quietly noticing who's off before anyone says it");
  if (isLow(p, "patience", 45)) friendLines.push("low tolerance for flakiness — cancelled plans cost more credit than people realize");
  if (friendLines.length) {
    blocks.push(sub("With close friends"));
    blocks.push(para(`The private version: ${joinAnd(friendLines)}.`));
  }

  // People they attract / drain
  blocks.push(callout(
    "People they attract vs people who drain them",
    rng.pick([
      "They attract people who need their steadiness (or their spark), and people who mistake their warmth for unlimited availability. The draining profile is consistent: high-maintenance, low-reciprocity, emotionally messy without self-awareness. They've learned — or are learning — that being liked by everyone is a tax they don't have to pay.",
      "Their warmth draws in people looking for an anchor; their competence draws people looking for a fixer. The ones who drain them are rarely villains — they're just people who take more than they return, and this person needs permission to stop subsidizing that.",
    ]),
    "insight"
  ));

  return { id: "social", title: "Social Personality", blocks };
}

// ---------------------------------------------------------------------------
// 8. Ambition, work, money & self-worth
// ---------------------------------------------------------------------------

function ambitionMoneyWorth(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const amb = v(p, "ambition");
  const disc = v(p, "discipline");
  const sc = v(p, "selfCriticism");

  blocks.push(para(
    amb >= 60
      ? rng.pick([
          "Ambition here is structural, not decorative. They want to build something significant and they organize real life around it — opportunities get evaluated by whether they move the ball.",
          "The drive to achieve is one of the chart's loudest signals. Rest feels earned only after progress, and 'good enough' is defined by their own standard, which is usually several notches above everyone else's.",
        ])
      : amb <= 45
        ? rng.pick([
            "Ambition exists but points inward — competence, security, self-mastery — rather than outward status. They work steadily and well without needing the title, and they quietly pity people who need the title.",
            "Their goals are about quality of life more than visibility. That isn't lack of drive; it's drive aimed at a target most people don't think to measure.",
          ])
        : "Ambition flexes by domain: full intensity for things they care about, minimalist effort for everything else. Their performance review depends heavily on whether the work means something to them."
  ));

  if (disc >= 60) {
    blocks.push(para(
      rng.pick([
        "Work style: systematic. Routines, deadlines, and standards are load-bearing walls for them, and they quietly extend the same expectation to colleagues. They're the person who reads the whole contract and follows up twice.",
        "Their reliability is a professional weapon. They deliver on time, remember commitments, and don't need supervision — which tends to result, over the years, in being quietly indispensable.",
      ])
    ));
  } else if (disc <= 45) {
    blocks.push(para(
      rng.pick([
        "Work style: sprints. They do exceptional work in focused bursts and coast between them. Rigid environments fight their operating system; autonomy, variety, and meaningful problems get their best output.",
        "Motivation at work is interest-driven. When engaged, their output embarrasses the org chart; when bored, they do the minimum with a competence that makes the minimum hard to criticize.",
      ])
    ));
  }

  // Money & self-worth
  const money: string[] = [];
  if (isHigh(p, "needForControl", 58)) money.push("Money is autonomy made visible — savings aren't greed, they're exit options. Financial dependence on anyone makes them itchy.");
  if (isHigh(p, "selfCriticism", 58)) money.push("Self-worth runs on achievement — they earn their own approval, and rest without productivity triggers vague guilt.");
  if (isHigh(p, "impulsivity", 60) && disc <= 48) money.push("Spending follows mood more than plan; the future self is expected to handle it.");
  if (isHigh(p, "patience", 60)) money.push("They're natural long-horizon builders — delayed gratification is genuinely easy for them.");
  if (money.length) {
    blocks.push(sub("Money and self-worth"));
    blocks.push(bullets(money.slice(0, 3)));
  }

  if (sc >= 62) {
    blocks.push(callout(
      "The internal scoreboard",
      rng.pick([
        "They grade themselves on a curve no one else can see, and it curves down. Wins get explained away ('it wasn't that hard'), losses get archived. Externally successful, internally unimpressed — praise bounces off the armor they built themselves.",
        "Achievement provides relief, not joy — the scoreboard resets the moment a goal lands. Learning to notice 'this is actually good' is, for them, a real skill and not a personality trait.",
      ]),
      "shadow"
    ));
  }

  return { id: "ambition", title: "Ambition, Work & Self-Worth", blocks };
}

// ---------------------------------------------------------------------------
// 9. Strengths & shadows
// ---------------------------------------------------------------------------

function strengthsAndShadows(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];

  blocks.push(para(
    "Every strength in this chart has a shadow version — the same trait, overdrawn. Neither version is the 'real' one; which shows up depends on stress, self-awareness, and context."
  ));

  const pairs: { strength: string; shadow: string; when: boolean }[] = [
    {
      strength: "Fierce independence — they handle what most people outsource and rarely burden others",
      shadow: "difficulty accepting help, even when accepting it would be kinder to everyone than heroic self-sufficiency",
      when: isHigh(p, "independence", 60),
    },
    {
      strength: "Deep loyalty — when they're in, they're catastrophically in",
      shadow: "staying too long: in relationships, jobs, and dynamics that ended long ago in spirit",
      when: isHigh(p, "attachmentNeed", 58) || isHigh(p, "intensityDepth", 60),
    },
    {
      strength: "Emotional attunement — they read rooms and people with unusual accuracy",
      shadow: "absorbing moods that aren't theirs and carrying emotional residue from conversations they didn't start",
      when: isHigh(p, "emotionalSensitivity", 60),
    },
    {
      strength: "Analytical depth — they understand things at the mechanism level",
      shadow: "analysis that converts to paralysis, and interactions that get audited when they should get enjoyed",
      when: isHigh(p, "analyticalThinking", 60) || isHigh(p, "overthinking", 60),
    },
    {
      strength: "Self-reliant standards — quality is guaranteed because they won't ship less",
      shadow: "impossible standards applied inward first, and a critic's eye that can drain the joy from their own wins",
      when: isHigh(p, "selfCriticism", 60),
    },
    {
      strength: "Decisive speed — they move while others are still forming committees",
      shadow: "occasional expensive quickness: sends, spends, and says things a 10-minute delay would have improved",
      when: isHigh(p, "impulsivity", 60),
    },
    {
      strength: "Romantic depth — they love with the kind of seriousness that's become rare",
      shadow: "expecting one person to hold the full weight of their emotional idealism, and punishing the gap between the ideal and the human",
      when: isHigh(p, "romanticism", 62),
    },
    {
      strength: "Resilience — setbacks get metabolized and the forward motion resumes",
      shadow: "under-recovery: they can keep going so well that they never actually stop to heal",
      when: isHigh(p, "resilience", 60),
    },
    {
      strength: "Steadiness — their consistency is something people build lives around",
      shadow: "rigidity: mistaking their familiar approach for the only correct one, and resenting change they didn't schedule",
      when: isHigh(p, "patience", 62) || isHigh(p, "discipline", 62),
    },
    {
      strength: "Adaptability — they reinvent cleanly and survive upheaval that breaks other people",
      shadow: "restlessness: abandoning things at the first plateau and mistaking novelty for growth",
      when: isHigh(p, "adaptability", 62),
    },
    {
      strength: "Empathy-driven care — people feel genuinely held by them",
      shadow: "rescuing: doing for others what they should do for themselves, then feeling unappreciated for services nobody ordered",
      when: isHigh(p, "nurturance", 62),
    },
    {
      strength: "Vision — they see how things could be and pull the present toward it",
      shadow: "chronic dissatisfaction with what is, and impatience with people who aren't ready to move yet",
      when: isHigh(p, "idealism", 62),
    },
  ];

  const active = pairs.filter((x) => x.when).slice(0, 5);
  if (active.length) {
    for (const pair of active) {
      blocks.push(bullets([`${pair.strength} — with a shadow: ${pair.shadow}.`]));
    }
  } else {
    blocks.push(para("This chart's strengths run at moderate volume, and so do their shadows — fewer extremes to manage, less drama in either direction."));
  }

  return { id: "strengths-shadows", title: "Strengths & Their Shadows", blocks };
}

// ---------------------------------------------------------------------------
// 10. Recurring themes
// ---------------------------------------------------------------------------

function recurringThemes(p: PersonalityProfile): ReadingSection | null {
  const blocks: ReadingBlock[] = [];
  const contra = p.contradictions;
  if (p.themes.length < 2 && !contra.length) return null;

  blocks.push(para(
    "Step back from the placements and certain patterns repeat across the whole chart. These are the load-bearing tensions — the themes this person will keep meeting until they're integrated."
  ));

  for (const c of contra.slice(0, 3)) {
    blocks.push(callout(c.title, c.body, "insight"));
  }

  for (const t of p.themes.slice(0, 3)) {
    blocks.push(bullets([themeLine(t.key, t.label)]));
  }

  return { id: "themes", title: "Recurring Psychological Themes", blocks };
}

function themeLine(key: string, label: string): string {
  const lines: Record<string, string> = {
    independence_attachment: "Independence vs attachment — choosing solitude and craving connection are both true, often in the same week.",
    control_sensitivity: "Emotional control vs sensitivity — deep feeling held under tight management, with periodic cost.",
    security_freedom: "Security vs freedom — they want a base and wings, and each one argues against the other.",
    idealism_reality: "Idealism vs reality — vision high, tolerance for the gap between vision and fact, limited.",
    depth_intensity: "Depth and intensity — surface-level anything doesn't hold them for long.",
    visibility: "Visibility and performance — being seen is both fuel and risk.",
    precision: "Precision and self-improvement — the endless iteration on themselves and their work.",
    care: "Care and connection — relationships are the primary theater of meaning.",
    chaos: "Chaos and reinvention — stability is reviewed periodically and sometimes declined.",
    element_fire: "Fire as a default setting — momentum is the natural state; stillness must be learned.",
    element_earth: "Earth as a default setting — the practical consequence is always part of the decision.",
    element_air: "Air as a default setting — everything is processed through thought and language first.",
    element_water: "Water as a default setting — feeling is the primary information channel.",
  };
  return lines[key] ?? `${label} — a pattern that repeats across the chart.`;
}

// ---------------------------------------------------------------------------
// 11. Blind spots
// ---------------------------------------------------------------------------

function blindSpots(p: PersonalityProfile, rng: Rng): ReadingSection | null {
  const spots: string[] = [];

  if (isHigh(p, "confidence", 60) && isHigh(p, "expressiveness", 58))
    spots.push("Not realizing how much space they occupy — others sometimes don't voice disagreement, and they can mistake silence for consensus.");
  if (isHigh(p, "independence", 60) && v(p, "vulnerabilityOpenness") <= 50)
    spots.push("Confusing self-sufficiency with emotional availability — 'I don't need help' can quietly become 'I don't let anyone close enough to offer it.'");
  if (isHigh(p, "needForControl", 58))
    spots.push("Expecting others to know what they want without saying it — because admitting the need feels like losing the control they're trying to keep.");
  if (isHigh(p, "overthinking", 60))
    spots.push("Treating their anxious simulations as data — the 3am theory feels like insight but is usually just fear wearing a lab coat.");
  if (isHigh(p, "selfCriticism", 60))
    spots.push("Assuming others judge them as harshly as they judge themselves — almost nobody is keeping score the way they are.");
  if (isHigh(p, "romanticism", 62) && isHigh(p, "idealism", 58))
    spots.push("Falling for potential — they commit to the person someone could be and stay loyal to the projection long after the reality has filed objections.");
  if (isHigh(p, "emotionalControl", 60))
    spots.push("Believing their composure is more convincing than it is — the people close to them can read the tells, and feel shut out when told 'nothing's wrong.'");
  if (isHigh(p, "impulsivity", 60))
    spots.push("Mistaking the intensity of a feeling for its accuracy — fast certainty isn't the same as correct certainty.");
  if (isHigh(p, "nurturance", 60) && isHigh(p, "emotionalSensitivity", 58))
    spots.push("Over-functioning for under-functioning people — rescuing feels like love but sometimes teaches people they don't have to show up.");
  if (isHigh(p, "communicationDirectness", 65))
    spots.push("Underrating the cost of their bluntness — 'just being honest' lands harder on sensitive receivers than they model, and the feedback rarely gets back to them.");

  if (!spots.length) return null;

  return {
    id: "blind-spots",
    title: "Likely Blind Spots",
    blocks: [
      para("Blind spots are, by definition, hard to see from inside — treat these as possibilities worth checking rather than diagnoses."),
      bullets(spots.slice(0, 4)),
      para(rng.pick([
        "The common thread: the trait itself isn't the problem — the unchecked version of it is.",
        "None of these are character flaws. They're side effects of strengths that never got a curfew.",
      ])),
    ],
  };
}

// ---------------------------------------------------------------------------
// 12. Growth direction (+ developmental points)
// ---------------------------------------------------------------------------

function growthDirection(p: PersonalityProfile, rng: Rng): ReadingSection {
  const blocks: ReadingBlock[] = [];
  const growth: string[] = [];

  if (isHigh(p, "independence", 60) && isHigh(p, "attachmentNeed", 58))
    growth.push("Letting one or two people matter without an exit strategy — closeness at full altitude, not a supervised visit.");
  if (isHigh(p, "selfCriticism", 60))
    growth.push("Practicing 'done and decent' before 'perfect' — and noticing that the world doesn't end when something ships at 92%.");
  if (isHigh(p, "emotionalControl", 60) && isHigh(p, "emotionalSensitivity", 58))
    growth.push("Sharing feelings while they're still small — before private processing turns them into settled conclusions.");
  if (isHigh(p, "overthinking", 60))
    growth.push("Setting a decision deadline and honoring it like a contract with themselves; most loops stop paying insight after the third pass.");
  if (isHigh(p, "impulsivity", 62))
    growth.push("The 24-hour rule for anything irreversible. The feeling usually survives the wait — and if it doesn't, that's the answer.");
  if (isHigh(p, "needForControl", 60))
    growth.push("Practicing real delegation — someone else's way, all the way through — as a tolerance exercise rather than a failure state.");
  if (isHigh(p, "nurturance", 62))
    growth.push("Letting people struggle productively — support without takeover, care without a rescue mission.");
  if (isHigh(p, "jealousyRisk", 62))
    growth.push("Saying the insecure thing out loud instead of managing the evidence — 'I felt replaced today' beats three weeks of quiet accounting.");
  if (isHigh(p, "idealism", 62))
    growth.push("Choosing reality over the fantasy repeatedly, on purpose — loving the actual person, not the trajectory.");
  if (isLow(p, "patience", 42))
    growth.push("Building one long, slow thing on purpose — a practice, a craft, a compounding project — to teach the nervous system that slow isn't death.");
  if (isLow(p, "vulnerabilityOpenness", 42))
    growth.push("One unscheduled act of honesty per month: the feeling shared live, unedited, while it's still inconvenient.");

  // Developmental points from the actual chart
  const dev: string[] = [];
  const f = p.facts;
  if (f.northNode) {
    dev.push(`North Node in ${cap(f.northNode)}: the growth direction of this life points toward the ${cap(f.northNode)} qualities (and away from over-relying on its opposite). Treat it as a curriculum, not a fate.`);
  }
  const saturn = f.planets.find((x) => x.id === "saturn");
  if (saturn) {
    dev.push(`Saturn in ${cap(saturn.sign_id)}${f.timeKnown ? `, house ${saturn.house}` : ""}: the lifelong discipline project. Early in life this area feels heavier than it should — authority, self-doubt, delay. Handled honestly, it becomes the area where they're eventually the most solid person anyone knows.`);
  }
  const chiron = f.planets.find((x) => x.id === "chiron");
  if (chiron) {
    dev.push(`Chiron in ${cap(chiron.sign_id)}: the tender spot that becomes a teaching gift. The wound here shapes unusual compassion for others dealing with the same thing.`);
  }

  blocks.push(para(
    rng.pick([
      "Growth for this person isn't about becoming someone else — it's about updating specific defaults.",
      "The practical development list, tied to the actual patterns above rather than generic advice.",
    ])
  ));

  if (growth.length) {
    blocks.push(bullets(growth.slice(0, 5)));
  }
  if (dev.length) {
    blocks.push(sub("Deeper developmental currents"));
    blocks.push(para(dev.join(" ")));
  }

  blocks.push(para(
    rng.pick([
      "The direction of maturity for this chart: same person, better defaults — the intensity channeled instead of contained, the sensitivity used instead of managed, the standards met instead of feared.",
      "With age, the rough edges here don't disappear; they get repurposed. The strictness becomes standards, the sensitivity becomes insight, the intensity becomes commitment. That's the version of this person at forty that twenty would be proud of.",
    ])
  ));

  return { id: "growth", title: "Growth Direction", blocks };
}

function buildIntro(p: PersonalityProfile, rng: Rng): string {
  const dims = topDims(p, 2);
  if (!dims.length) {
    return "Some charts shout one pattern. This one hums in balance — which makes the reading less about a single theme and more about how several moderate forces cooperate inside one person.";
  }
  return rng.pick([
    "This reading was built from the whole chart at once — every placement, aspect, and emphasis interacting. What follows is the person that interaction creates, not a list of ingredients.",
    "Everything below comes from reading the chart as one system: how the pieces amplify, limit, and contradict each other. It's specific on purpose — this is a profile of one person, not a sign.",
  ]);
}
