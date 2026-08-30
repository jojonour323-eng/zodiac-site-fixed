// ===========================================================================
// FLAG CONTENT — fully custom written content for EVERY flag on the Full Read
// ---------------------------------------------------------------------------
// One entry per flag, keyed by flag title. Nothing here is shared between
// flags: every detail, bullet, example, shadow, bright side, fix, and
// takeaway is written for that exact trait and its actual placement(s).
// Entries are functions of FlagCtx so multi-sign flags can name the real
// sign from THIS person's chart. Second person, simple words, no filler.
// ===========================================================================

import type { NatalProfile, SignId } from "../types";
import { SIGN_META } from "../signs";

export interface FlagCtx {
  /** Actual sign name of a planet in this chart, e.g. "Aries". Accepts "rising". */
  sign: (planetId: string) => string;
  /** Element of a planet's sign. */
  element: (planetId: string) => string;
  /** House a planet sits in (may be undefined when birth time is unknown). */
  house: (planetId: string) => number | undefined;
  /** Whether a planet is retrograde. */
  retro: (planetId: string) => boolean;
  /** Sign name on a house cusp. */
  houseSign: (house: number) => string;
  /** Count of placements per element. */
  elementCount: (element: string) => number;
  /** Number of tense / harmonious aspects. */
  tense: number;
  harmonious: number;
}

export function makeFlagCtx(profile: NatalProfile): FlagCtx {
  const find = (id: string) =>
    id === "sun"
      ? { signId: profile.sun.signId as SignId, house: profile.sun.house, retrograde: false }
      : id === "moon"
        ? { signId: profile.moon.signId as SignId, house: profile.moon.house, retrograde: false }
        : id === "rising"
          ? { signId: profile.ascendant.signId as SignId, house: 1, retrograde: false }
          : profile.planets.find((p) => p.id === id);
  return {
    sign: (id) => {
      const p = find(id);
      return p ? SIGN_META[p.signId].name : "";
    },
    element: (id) => {
      const p = find(id);
      return p ? SIGN_META[p.signId].element : "";
    },
    house: (id) => find(id)?.house,
    retro: (id) => find(id)?.retrograde ?? false,
    houseSign: (n) => {
      const h = profile.houses.find((x) => x.house === n);
      return h ? SIGN_META[h.signId].name : "";
    },
    elementCount: (el) => {
      const signs = [profile.sun.signId, profile.moon.signId, profile.ascendant.signId,
        ...profile.planets.map((p) => p.signId)] as SignId[];
      return signs.filter((s) => s && SIGN_META[s].element === el).length;
    },
    tense: 0,
    harmonious: 0,
  };
}

export interface FlagCopy {
  /** Card text shown right under the flag title — second person. */
  detail: (c: FlagCtx) => string;
  /** "What's actually happening" — the mechanics under the pattern. */
  happening: (c: FlagCtx) => string[];
  /** "How it shows up in real life" — one concrete scene. */
  example: (c: FlagCtx) => string;
  /** "The shadow" / "The risk" / "The catch". */
  shadow: (c: FlagCtx) => string[];
  /** "The bright side" / "Why this is a strength". */
  bright: (c: FlagCtx) => string[];
  /** "How to work with it". */
  work: (c: FlagCtx) => string[];
  /** "Takeaway". */
  takeaway: (c: FlagCtx) => string[];
}

/**
 * Registry lookup. Exact title first, then variant keys
 * ("Title::source" — used where one title covers two placements, e.g.
 * Emotional Whiplash from Moon in Aries vs Moon square Mars).
 * Aspect words are normalized out so "Moon Square Mars" and
 * "Moon Opposition Mars" both reach the same variant.
 */
export function getFlagCopy(title: string, sources: string[]): FlagCopy | null {
  const direct = FLAG_CONTENT[title];
  if (direct) return direct;
  const prefix = title + "::";
  const srcRaw = (sources[0] ?? "").toLowerCase();
  const norm = (s: string) =>
    s
      .replace(/\b(square|opposition|trine|sextile|conjunction|conjunct|opposite)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const src = norm(srcRaw);
  for (const key of Object.keys(FLAG_CONTENT)) {
    if (!key.startsWith(prefix)) continue;
    const variantSrc = norm(key.slice(prefix.length));
    if (src === variantSrc || src.startsWith(variantSrc)) return FLAG_CONTENT[key];
  }
  return null;
}

type Copy = (c: FlagCtx) => string;
type Bullets = (c: FlagCtx) => string[];

const simple = (detail: Copy, happening: Bullets, example: Copy, shadow: Bullets, bright: Bullets, work: Bullets, takeaway: Bullets): FlagCopy =>
  ({ detail, happening, example, shadow, bright, work, takeaway });

// ===========================================================================
// RED FLAGS — RELATIONSHIP
// ===========================================================================

export const FLAG_CONTENT: Record<string, FlagCopy> = {
  // ---------------------------------------------------- Situationship Energy
  "Situationship Energy": simple(
    (c) => `You keep things in a "we're just seeing where this goes" zone for months and genuinely don't get why that drives people crazy. With Venus in ${c.sign("venus")}, you crave variety in love more than you crave certainty, and labels feel tighter than you want. You're not being cruel — commitment just isn't your default setting.`,
    (c) => [
      `Venus in ${c.sign("venus")} is built on options. The moment a relationship closes a door, part of you starts watching the window.`,
      `The vagueness isn't a game you're playing on purpose — the undefined zone is genuinely where you're most comfortable, so you stay there without noticing nobody else agreed to it.`,
      `You read commitment talk as pressure while the other person reads your dodge as rejection. Same conversation, two different languages.`,
    ],
    () => `Three months in, they ask "what are we?" and you hear an alarm — so you answer with a joke, change the subject, and the question hangs there until it turns into a fight.`,
    () => [
      `People who want something real will eventually stop waiting. The ones who stay in the fog with you are often the ones fine with keeping you at a distance too.`,
      `You can spend years sampling connections that never get deep enough to actually feed you.`,
      `The label-avoidance becomes a self-fulfilling loop: nothing is defined, so nothing gets built, so nothing is worth defining.`,
    ],
    () => [
      `You're genuinely great at keeping connection light and fun — most people strangle the early spark by over-planning it, and you never do.`,
      `Your comfort with undefined space means you don't cling, don't suffocate, and don't panic when someone needs air.`,
    ],
    () => [
      `Name a timeline to yourself first — not to them. Decide what "seeing where this goes" means to you in weeks, not vibes, and you'll notice how long you've been floating.`,
      `When the "what are we" question comes, answer with one honest sentence even if it's "I like this and it scares me." That sentence keeps more people than a perfect speech.`,
      `Pick one relationship to stop keeping optional. See what happens when you actually plant one flag.`,
    ],
    () => [
      `You're not afraid of love — you're allergic to boxes that don't fit. Fine. Just make sure the box is actually too small, not just unfamiliar.`,
      `Freedom costs something too. Decide the price you're paying is one you chose.`,
    ]
  ),

  // ------------------------------------------------------------ Guarded Lover
  "Guarded Lover": simple(
    () => `Your love style runs private and slow-burn. You test people for months before you let them in, and you have a pattern of falling for people who are unavailable. The love is real when it arrives — it just arrives on a delay, and the other person spends the first three months wondering if you're actually into them.`,
    () => [
      `Venus retrograde turns the love function inward first. Feelings get reviewed, re-checked, and edited before they're allowed out — so by the time they show, they've been real for months.`,
      `Unavailable people are safer to want. Someone who can't fully reciprocate can never fully reject you either, and part of you knows that math.`,
      `Your tests are invisible. You're scoring people on consistency they don't know they're being graded on, so they keep failing exams they never saw.`,
    ],
    () => `Someone texts you good morning every day for two weeks and you feel... cornered. You reply slower, not faster — the nicer they are, the more you check for the catch.`,
    () => [
      `You can fall hardest exactly when the other person has already given up and moved on. The timing gap is the whole tragedy.`,
      `Half-available crushes eat years — the fantasy stays warm because it's never tested by reality.`,
      `People who would have stayed forever leave before your guard finishes its review, and you experience it as "nobody chooses me" instead of "nobody got the access code."`,
    ],
    () => [
      `Depth is your superpower — when you do commit, it's total, and nobody ever has to wonder where they stand with you again.`,
      `You can't be love-bombed. Every manipulator's fastest trick simply does not work on you, and that has saved you more than you know.`,
      `You feel love in a way most people never learn to — slowly enough that it's actually yours, not just inflection borrowed from a moment.`,
    ],
    () => [
      `Say the delay out loud once: "I go slow, it's not a no." That one sentence keeps the good ones from reading your guard as disinterest.`,
      `Give one person a fast yes on something small — a plan, a call, a favor. The muscle you're building is letting yourself be known in real time.`,
      `Notice when you're drawn to someone unavailable and ask what about the distance feels safe. The answer is usually the actual thing to work on.`,
    ],
    () => [
      `Slow-burn isn't a flaw — it's a style. Just tell people which door you're behind so they stop knocking on all the wrong ones.`,
      `The right person isn't the one who breaks your guard down. It's the one you open the door for on purpose.`,
    ]
  ),

  // ------------------------------------------------------ Fight-or-Flip Energy
  "Fight-or-Flip Energy": simple(
    (c) => `Conflict hits different for you. With Mars in ${c.sign("mars")}, you go from 0 to 100 in an argument and say something you can't take back — or you flip the table and walk out. There's no "let's talk about this calmly" setting, at least not without self-awareness work you haven't done yet.`,
    (c) => [
      `Mars in ${c.sign("mars")} runs fight as a reflex, not a decision. The anger arrives fully formed before the thinking brain has even been notified.`,
      `The walkout isn't sulking — it's an emergency exit. Staying in the room feels like agreeing to burn, so you leave to survive.`,
      `You experience your intensity as honesty while the other person experiences it as danger. That gap is what turns arguments into aftermath.`,
    ],
    () => `A comment about the dishes becomes a thirty-minute war, you say the one thing you know will scar, then twenty minutes later you're fine — and confused that they're still shaking.`,
    () => [
      `The people closest to you start editing themselves preemptively. That's the real cost — not the fights, but the silence they train into everyone who loves you.`,
      `You can lose years of trust in the ninety seconds it takes to say the unforgivable thing.`,
      `Thrown dishes can be replaced. The sentence you said at full volume in 2019 is still in the room.`,
    ],
    () => [
      `That same engine makes you the person who ACTS while everyone else is still forming a committee. When something's wrong, you move.`,
      `You never let real problems rot under politeness. The truth comes out in your vicinity, fast, and everyone secretly knows where they stand.`,
      `Your heat is also protection — people think twice before disrespecting someone who visibly will not absorb it.`,
    ],
    () => [
      `Learn your ninety-second rule: nothing said in the first ninety seconds of rage is allowed to be about the relationship. Anger yes, verdicts no.`,
      `Practice the walkout WITH a return time: "I need twenty minutes, then we finish this." Leaving is fine — vanishing is what breaks people.`,
      `After the blast, name your part first. One sentence of ownership resets more than an hour of explaining why you were right.`,
    ],
    () => [
      `Your intensity isn't the problem — the unattended landing is. Learn to land, and this same fire makes you formidable.`,
      `Nobody fears your anger as much as future-you does. Build the pause now.`,
    ]
  ),

  // -------------------------------------------------------- People-Pleaser AF
  "People-Pleaser AF": simple(
    () => `You'd rather agree than be honest. You say "whatever you want" and quietly resent the person for it. By the time you finally snap, they have no idea what went wrong — you've been keeping score for months without telling anyone there was a game.`,
    () => [
      `Sun and Venus both in Libra wire you to keep the peace as the top priority. Agreement feels like safety, so you buy it at the cost of your actual opinion.`,
      `The resentment isn't their fault — they accepted the "yes" you sold them. You were the one hiding the price tag.`,
      `Harmony is your drug. You'd rather be quietly furious than risk one awkward minute of someone being disappointed in you.`,
    ],
    () => `They pick the restaurant you hate for the fourth time. You say "perfect." You eat it angry. Two weeks later you go cold over something tiny and they're blindsided — you knew, the whole time, and said nothing.`,
    () => [
      `You end up living a life assembled from other people's preferences — their restaurants, their plans, their timeline — and calling it easygoing.`,
      `The snap, when it comes, is always out of proportion. One small request detonates six months of swallowed "fines."`,
      `People can't actually love you, because you keep serving them a customized version and hiding the real customer.`,
    ],
    () => [
      `You read rooms better than anyone. You can walk into tension and feel the whole map of it — that's a genuinely rare instrument.`,
      `People feel safe and accommodated around you. Done honestly, that same skill makes you the person everyone wants around.`,
      `Your diplomacy can talk two angry people off a ledge. You just have to start aiming it at your own conflicts.`,
    ],
    () => [
      `Start tiny: one honest preference per day, out loud. "Actually I'd rather stay in" — said while it's still small.`,
      `Disappointing someone once, on purpose, and surviving it, is the whole training program. Book the rep.`,
      `When resentment shows up, treat it as a receipt: something you said yes to that you meant to decline. Find it, and decline the next one.`,
    ],
    () => [
      `Peace that costs your honesty isn't peace — it's a slow invoice. Pay the smaller price early: the truth.`,
      `The people worth keeping don't need the customized you. They can handle the actual order.`,
    ]
  ),

  // --------------------------------------------------- Emotionally Walled Off
  "Emotionally Walled Off": simple(
    () => `You process feelings through control, not expression. You handle someone's meltdown like a project manager and have zero idea why that feels cold. To you, "being strong" means not showing weakness; to them, it looks like you don't care. You do care — you just have no idea how to show it without feeling exposed.`,
    () => [
      `Moon in Capricorn builds the emotional system like a load-bearing wall: feelings are handled, managed, and scheduled — never just had.`,
      `Somewhere early you learned that being the competent one was safer than being the needy one. The wall isn't spite; it's old architecture that worked.`,
      `You think support means solutions. The person crying usually wants company, not a plan — and every plan you offer reads as "stop being upset."`,
    ],
    () => `They're crying about their bad day and you're already three steps into fixing it — new job leads, a budget spreadsheet, action items. They get quieter. You call the evening a success.`,
    () => [
      `The people who love you start believing they're a burden, because every reaching attempt gets met with competence instead of warmth.`,
      `You carry everything alone by default, then feel unseen — but nobody can offer help to someone who never shows the weight.`,
      `Intimacy requires being affectable. If nothing gets in, nobody ever actually reaches you, no matter how long they stay.`,
    ],
    () => [
      `You are the calm one in every storm — genuinely, not performed. People anchor to you because you don't add weather.`,
      `Your steadiness is rare and real: when you say it's fine, it's actually fine, and nobody has to manage your moods.`,
      `You build things that last — relationships included — because you don't act on feeling; you act on commitment.`,
    ],
    () => [
      `Practice the bottom rung first: name the feeling out loud, one word is enough. "Tired" counts. "Fine" doesn't.`,
      `When someone cries, ban yourself from solutions for ten minutes. Arm around them, one question: "you want comfort or help?" Then do what they pick.`,
      `Let one person see you fail at something small per month — on purpose. The wall comes down in bricks, not all at once.`,
    ],
    () => [
      `The wall kept you safe once. It doesn't get to keep you alone forever — those are different jobs now.`,
      `Strength that can't be seen isn't strength people can love. Show the weight; you'll still be the strong one.`,
    ]
  ),

  // ------------------------------------------------------ Stubborn AF In Fights
  "Stubborn AF In Fights": simple(
    () => `Once you've decided you're right, no argument, evidence, or tears will move you. You'll also hold a grudge from years back and bring it up at dinner. The good news: you don't start fights. The bad news: you don't end them either, and you will out-stubborn every single person who tries.`,
    () => [
      `Mars in Taurus doesn't fight often — but once engaged, it simply does not retreat. Anger consolidates like poured concrete.`,
      `You experience holding position as integrity while the other person experiences it as a locked door. Both are true.`,
      `The grudge isn't theatre — Taurus Mars genuinely does not release a wrong until it's been acknowledged. The problem is you'd rather store it than ask for the acknowledgment.`,
    ],
    () => `The argument ended Tuesday. It's Friday dinner and you reference something they said in it — calmly, with an example — and everyone at the table realizes the war never actually ended; it just went quiet.`,
    () => [
      `You can be technically right and relationally alone. Winning the point costs the room.`,
      `Unreleased grudges don't hurt the other person — they rent space in your body. Chronic jaw, bad sleep, the works.`,
      `People stop bringing you problems, because a conversation with a wall teaches them to take their stuff elsewhere.`,
    ],
    () => [
      `Your word is granite — when you commit to someone, they never have to check if you meant it.`,
      `You cannot be bullied, rushed, or manipulated into anything. That's a spine most people have to fake.`,
      `You fight about real things, rarely and seriously — no drama for sport.`,
    ],
    () => [
      `Adopt the sacred phrase: "I might be missing something." Say it once, mid-fight, and mean it. It costs you nothing but it reopens the door.`,
      `Set a grudge curfew — 48 hours to either raise it and resolve it, or actually drop it. No third option where it ferments.`,
      `Ask yourself in the freeze: "do I want to be right, or do I want to be close?" You get one.`,
    ],
    () => [
      `Steady isn't the problem. Immovable is — and only you can tell the difference from inside.`,
      `The strongest people are the ones who can move on purpose. Flexibility you choose is stronger than stiffness you can't help.`,
    ]
  ),

  // ------------------------------------------------------ All-Or-Nothing Lover
  "All-Or-Nothing Lover": simple(
    () => `You don't do casual. Someone is either your entire world or they don't exist. You want to merge souls on date two, and if they don't match that intensity, you take it personally and spiral. Also: you find out everything about someone before the first date ends — and you're good at hiding that you know.`,
    () => [
      `Venus in Scorpio doesn't have a "light" setting. Attraction triggers a full background check and a depth-first interview — small talk physically hurts you.`,
      `You read the intensity gap as rejection. When someone wants Tuesday drinks and you want soul fusion, you hear "not enough" when they're really just saying "slower."`,
      `The research habit comes from a need for certainty: knowing everything in advance feels like safety. It also means you've often decided about someone before they've shown up.`,
    ],
    () => `Second date, and you've already formed the five-year picture. They mention they're "seeing where things go" and your stomach drops — you go quiet, then text two friends a full analysis of what their word choice meant.`,
    () => [
      `The people who fail your depth test often weren't failing — they were just at a normal human pace, and you counted the difference as betrayal.`,
      `Jealousy and the detective habit can corrode something good long before any real threat arrives.`,
      `Each not-matched intensity is stored as evidence that you're "too much," which makes the next merge attempt even heavier.`,
    ],
    () => [
      `When you love, it's legendary. People spend their whole lives hoping someone will look at them the way you look at what's yours.`,
      `You're incapable of the shallow version — which filters out an enormous amount of waste most people wade through for decades.`,
      `Your loyalty is absolute. Being chosen by you is a one-way door, and the right person knows exactly what that's worth.`,
    ],
    () => [
      `Learn the phrase "interesting — tell me more" and use it instead of the third probing question. Let people volunteer their depths; don't excavate.`,
      `Match intensity to evidence, not to hope. Give 60% at month two and see if they climb toward it, instead of pre-paying 200% on credit.`,
      `When someone asks for slower, try treating it as a direction, not a rejection. Slower still arrives.`,
    ],
    () => [
      `Deep is your native language — the work isn't shallowing out, it's pacing the dive so people can follow you down.`,
      `The right person won't need convincing to go deep. They'll just need time to trust that the depth is safe.`,
    ]
  ),

  // ---------------------------------------------------------------- Flight Risk
  "Flight Risk": simple(
    (c) => `The moment someone makes you feel trapped, you're already mentally on a plane. You fall in love fast and disappear faster${c.sign("sun") === "Sagittarius" ? " — with Sun in Sagittarius, freedom isn't a preference, it's the operating system" : ""}. "Catch me if you can" isn't a joke — it's a relationship strategy. When you feel suffocated, you won't communicate it; you'll just leave.`,
    (c) => [
      `${c.sign("sun") === "Sagittarius" ? "Sun in Sagittarius" : "Sagittarius wiring"} treats commitment like a wall where you expected a door. The second the exit closes, the whole building starts feeling smaller.`,
      `You don't announce the suffocation — you just start citing distance, busyness, or "timing." The leaving was decided days before the conversation that "caused" it.`,
      `What reads as coldness is actually panic. Trapped is one of the few feelings you genuinely can't tolerate, and you'll burn a good thing down to make it stop.`,
    ],
    () => `They mention meeting their parents in three weeks. You smile, say "can't wait" — and by Sunday you've picked a fight about nothing, because the calendar invite felt like a cage door clicking.`,
    () => [
      `You can exit right at the moment things were about to get real — and pay the full cost of the gamble after the winnings were already on the table.`,
      `The people who love you learn to hold you loosely, which means you never actually get held.`,
      `Running is a reflex, not a decision — which means you keep having the same exit, with different people, and calling it bad luck.`,
    ],
    () => [
      `Your independence is real and total — you never stay out of fear or comfort, which means any commitment you do make is honest.`,
      `You keep life expanding. Nobody who loves you ever has to worry about you settling into a half-alive routine and taking them with you.`,
      `You're honest in the ways that matter — you'd rather leave than cheat, and that instinct spares everyone the slow betrayal.`,
    ],
    () => [
      `Install a gap between the panic and the exit: when you feel the run coming, say "I need a weekend to myself" instead of ending things. Space you scheduled is the release valve — vanishing is the explosion.`,
      `Notice the trigger pattern: it's usually right at closeness milestones. Name it to them in calm moments: "when things get real, I bolt. If I get weird, ask me to stay — it works."`,
      `Pick one commitment you keep through the first big urge to flee. Prove to your own nervous system that trapped and committed are different things.`,
    ],
    () => [
      `You're not broken — you're fast. The work is giving the people you love a chance to be fast with you, not just left behind by you.`,
      `Freedom you protect by running stops being freedom. It becomes a loop. Break it once and the exits become doors you choose.`,
    ]
  ),

  // -------------------------------------------------------------- Control Issues
  "Control Issues": simple(
    (c) => `You need to feel like you have the upper hand — in relationships, in arguments, in the dynamic. With Pluto in ${c.sign("pluto")}, you'll frame it as "protecting yourself," but it's really about not being the one who gets hurt. Vulnerability feels like losing. You'd rather be in control than be close.`,
    (c) => [
      `Pluto in ${c.sign("pluto")} runs a background process that always asks one question: who has the power here? You track it in tone, in who texts first, in who apologizes first — constantly, and mostly under the radar.`,
      `Control is your scar tissue. Somewhere you learned that the vulnerable position is the one that gets destroyed, so you hold the leverage instead.`,
      `You don't experience your moves as controlling — you experience them as correct. That's what makes the pattern hard to see from inside.`,
    ],
    () => `They want to plan the trip. You let them — then adjust the flights, question the hotel, and reorganize the itinerary "helpfully." Every seat stays yours to steer, and somehow they notice without being able to name it.`,
    () => [
      `People eventually feel managed rather than loved, and they can't prove it, so they just quietly get tired.`,
      `You win every power contest and lose the thing the contest was supposed to protect — being actually known.`,
      `The constant watching wears you down. Running surveillance on everyone you love is a full-time job with no days off — and you never clock out.`,
    ],
    () => [
      `You see through people. The read you get in the first ten minutes takes most people years to earn — and it's almost always right.`,
      `You cannot be played. Scam artists, love-bombers, and casual liars all bounce off you completely.`,
      `When you commit to protecting something — a person, a project, a family — you are relentless, and it shows.`,
    ],
    () => [
      `Practice losing small on purpose: let them pick, let them plan, let them be right about something minor. Notice you survive it. That's the whole training.`,
      `Say one vulnerability out loud per week to someone safe — no spin, no framing, no strength bonus. "That hurt my feelings" counts.`,
      `When you feel the steering reflex, ask the question underneath: "what am I afraid happens if I let go?" The answer is usually older than this relationship.`,
    ],
    () => [
      `Power keeps you safe and keeps you separate. At some point you have to pick which one you actually want.`,
      `The strongest move available to you is the one that feels weakest — being seen without leverage.`,
    ]
  ),

  // ------------------------------------------------------------ Commitment Delay
  "Commitment Delay": simple(
    () => `You take forever to commit — not because you don't want to, but because you need to be 100% sure, and 100% sure doesn't exist. You'll find reasons to delay, pick apart the relationship, and convince yourself you need more time. You're not playing games — you're genuinely scared of getting it wrong.`,
    () => [
      `Saturn in the 7th makes partnership the subject of your harshest exam. You treat the decision like a contract with lifetime penalties, so every flaw gets audited like a risk.`,
      `The delay feels responsible from inside and feels like rejection from outside. Nobody can see your due diligence — they only feel the wait.`,
      `Certainty is the trap: real people are always partly unknown, so the threshold you set can only be met by someone who doesn't exist.`,
    ],
    () => `Two years in, they ask where this is going. You say "I just want to get the new job settled first" — and then it's the apartment, then the savings goal, then something else. The relationship is always waiting for life to finish happening.`,
    () => [
      `Great relationships expire in your waiting room while you complete one more round of review.`,
      `The other person spends the prime of their patience proving a case you keep refusing to hear.`,
      `You can build a habit of almost — becoming someone who's always one more check away from a life that never starts.`,
    ],
    () => [
      `When you DO commit, it's load-bearing. Nobody with Saturn here does casual — your yes is the real thing, built to hold weight.`,
      `You take other people's hearts seriously. Nobody is ever a placeholder with you, and partners eventually feel that honor.`,
      `Your standards saved you from at least one wrong room. The discernment is real; it just needs a deadline.`,
    ],
    () => [
      `Replace "am I sure?" with "is this good enough to build on?" — buildings get renovated. Souls on hold don't.`,
      `Set a decision date for the relationship you're in. Not a proposal — a decision. Write down what would disqualify them, and if none of it is present, the review is over.`,
      `Tell one trusted friend the truth about why you're waiting. Out loud, the reason either sounds real or dissolves — you'll hear which.`,
    ],
    () => [
      `Caution built you; it also parked you. You're allowed to invest without a guarantee — that's what everyone else is actually doing.`,
      `The risk was never choosing wrong. It was choosing nothing, carefully, forever.`,
    ]
  ),

  // ------------------------------------------------------------ Secret Love Life
  "Secret Love Life": simple(
    () => `Your love life is private to the point of being secret. You'll date someone for months and not tell your friends. You fall for unavailable people — married, distant, emotionally closed off — because the distance feels safe. A public relationship feels exposing.`,
    () => [
      `Venus in the 12th keeps love behind glass. The moment a relationship becomes visible, it becomes judged — and judged love feels like it can be taken away.`,
      `Unavailable people are the perfect habitat for this placement: all of the feeling, none of the exposure. The distance isn't an obstacle to the love; it's a feature.`,
      `You're not hiding shame exactly — you're hiding access. What people can see, people can interfere with, and nobody gets to interfere with what's yours.`,
    ],
    () => `Six months of dating and your best friend thinks they're "someone from work." You like it that way — the relationship lives in a sealed room where nobody's opinion can touch it.`,
    () => [
      `Hidden love can't be supported. When it cracks — and everything cracks sometimes — you're alone with the pieces by design.`,
      `The unavailable pattern can consume years in loops that produce feeling without ever producing a life.`,
      `Secrecy distorts the relationship itself: what you're hiding starts to shape what you allow, and the love stays stunted on purpose.`,
    ],
    () => [
      `You love without an audience, which makes it the purest kind — nothing you feel is performed for anyone.`,
      `Your private world is deep and safe. People who get invited in find a sanctuary most people never build.`,
      `You see the hidden currents in love — what's unsaid, what's longed for. That perception makes you devastatingly attentive.`,
    ],
    () => [
      `Tell one person one true thing about your love life this month. Not everything — one window. Secrecy shrinks with exactly this kind of breach.`,
      `When you notice yourself drawn to someone unavailable, ask what about them can't hurt you. Then ask whether "can't hurt me" and "can't reach me" might be the same setting.`,
      `Try one public act of love — a photo, a mention, a plus-one. Small enough to survive; big enough to change the temperature.`,
    ],
    () => [
      `Love kept off the books stays thin. You don't have to perform it — just let one or two witnesses in.`,
      `The safest vault in the world is still a room you can't leave. Leave one door open on purpose — that's what the good ones are for.`,
    ]
  ),

  // --------------------------------------------------------- Relationship Anxiety
  "Relationship Anxiety": simple(
    () => `There's tension between your love nature and your sense of limits. You second-guess whether someone really likes you, test them without realizing it, and then feel vindicated when they "fail." The anxiety is real — but it's also self-fulfilling.`,
    () => [
      `Venus–Saturn tension runs a permanent audit on love: is this real, is this safe, do they mean it, will they stay? No answer ever fully clears the audit.`,
      `The tests are real and invisible: cancelled plans to see if they reschedule, one-word texts to see if they chase. You're collecting evidence for a trial that never closes.`,
      `The cruel mechanic: when someone passes, the anxiety re-files the paperwork instead of resting. When they fail, it says "told you." Either way it grows.`,
    ],
    () => `They take four hours to reply and you re-read your last message eleven times, decide you came on too strong, and send nothing else all evening — then feel confirmed when they "went quiet too."`,
    () => [
      `The tests eventually exhaust even devoted people — being on trial forever reads, correctly, as distrust.`,
      `You can lose real love to a phantom: the relationship dies not of what happened, but of what you were sure was about to happen.`,
      `The constant vigilance burns the joy out of the good parts, because you can't be in the moment and the courtroom at once.`,
    ],
    () => [
      `You take love seriously in a world of people who treat it casually — nothing about your heart is careless.`,
      `Your radar for half-interest is genuinely accurate. You spot the fakers immediately; the anxiety is the radar turned on someone who actually showed up.`,
      `Once you finally trust someone, your loyalty is rock-solid and long — Saturn cements what it approves.`,
    ],
    () => [
      `Retire the tests. Pick your one recurring one (the reply-timing, the cancelled plan) and ban it for a month. Ask directly instead; direct questions get direct answers.`,
      `Keep a "receipts" note: real things they did that show care. When the audit spins, read the note — evidence over mood.`,
      `Say the quiet part once: "sometimes I need proof you're here. Tell me when you notice me spiraling." Naming it halves it.`,
    ],
    () => [
      `The audit was built to protect you from someone specific in your past. They're gone. The security guard can clock out now.`,
      `Trust isn't the absence of proof — it's the decision to stop holding court. Make the decision on purpose.`,
    ]
  ),

  // -------------------------------------------------------------- Power Struggles
  "Power Struggles": simple(
    () => `Your drive and your intensity are in tension — you pursue things with a force that can feel like compulsion to others. In relationships, this shows up as a need for control, or as attracting people who try to control you. The energy is real and magnetic, but it needs a healthy outlet or it'll find an unhealthy one.`,
    () => [
      `Mars–Pluto tension is raw power running through a person. You don't do anything at half strength — including wanting, including fighting, including loving.`,
      `The dynamic repeats: you either grip the steering wheel until your knuckles whiten, or you end up with someone who grips it for you. Dominance or surrender — the middle setting is missing.`,
      `Other people can FEEL the current. That's the magnetism and the danger — it draws people in before they know whether they can handle the voltage.`,
    ],
    () => `You don't yell. You just... never lose. Every disagreement ends with them conceding, every plan ends up being yours, and one day they say "it's easier to just agree with you" — and mean it as a surrender note, not a compliment.`,
    () => [
      `Power struggles hollow out love: you keep winning the dynamic and losing the person.`,
      `Suppressed, this energy turns inward and becomes self-destruction — obsession, compulsion, burnout cycles that look like "motivation" from outside.`,
      `The intensity draws in power-hungry people too. You can spend years in exhausting duels that feel like passion from the inside.`,
    ],
    () => [
      `This is generator-grade energy. When it's aimed at something real — a body of work, a person to protect, a mountain to climb — you outlast everyone.`,
      `You're unkillable. Circumstances that flatten other people leave you scarred and still moving.`,
      `Your presence changes rooms. People feel stronger and more alive around you when the current is running clean.`,
    ],
    () => [
      `Give the current a legal outlet — training, competition, a big project. Power that's exercised daily stops leaking into the relationship.`,
      `Practice the phrase "you decide this one" and actually let it stand. Small surrenders keep the big current honest.`,
      `When you notice the duel starting (score-keeping, silent contests), name it: "we're doing the power thing again." Naming it breaks the spell.`,
    ],
    () => [
      `The power isn't the problem — the wrestling is. Put it to work and it stops wrestling you.`,
      `You were built to move mountains. Just stop using the mountain gear on the people in your house.`,
    ]
  ),

  // =========================================================================
  // RED FLAGS — COMMUNICATION
  // =========================================================================

  // -------------------------------------------------------- Says The First Thing
  "Says The First Thing": simple(
    () => `You say whatever's in your head the second it arrives. It's refreshing and occasionally a disaster. You'll text the unfiltered truth at 11pm, then wake up at 7am and wish you hadn't. Apologies will be frequent and sincere, and the cycle will repeat forever.`,
    () => [
      `Mercury in Aries has no editing department. Thought and speech are the same event — the words leave at the speed the idea lands.`,
      `You genuinely don't feel the impact while it's happening. From inside, it's just honesty leaving the building; the blast radius only exists for other people.`,
      `The 7am regret is real progress — it means the review function exists, it just arrives late. The work isn't creating it; it's moving it earlier.`,
    ],
    () => `Your friend asks "do you like my new haircut?" and the answer is out before the question lands — "not really, the last one was better." Silence. You knew at 0.2 seconds in that was the wrong lane.`,
    () => [
      `People never have to wonder where they stand with you. In a world of polite fog, your clarity is a service.`,
      `You say the thing the whole room is thinking but nobody will touch. Half your "mistakes" are actually everyone else's relief.`,
      `You never carry the poison of unsaid things. It all leaves, it's all clean, and there's nothing rotting in you.`,
    ],
    () => [
      `Your speed makes you the person who says the hard thing FIRST — the conversation everyone dreaded is over in a minute because you broke the seal.`,
      `Nobody ever has to guess if you're upset. The people close to you relax into that honesty; there's no second text to decode.`,
    ],
    () => [
      `Install the one-breath rule: thought arrives, one breath, THEN talk. You don't need an hour — you need ninety seconds of review. That's it.`,
      `For texts specifically: write it, don't send it, re-read once after doing something else. The 11pm message dies in drafts and the 7am regret never gets born.`,
      `When you do fire one off, repair fast and specifically: "that was blunt and it landed wrong, here's what I actually meant." Speed of repair is your superpower — use it.`,
    ],
    () => [
      `Your directness is a gift with one sharp edge. You don't have to become someone else — just add the ninety seconds.`,
      `The goal isn't a filter that strangles the truth. It's a delay that lets the truth wear its good clothes.`,
    ]
  ),

  // ------------------------------------------------------------ The Interrogator
  "The Interrogator": simple(
    () => `You ask one question and suddenly the other person has told you their entire childhood. You don't do small talk — you go straight for the deep cuts, and you remember everything they say. You'll bring up something they mentioned in passing six months later like it's nothing, and they'll wonder how you even remembered that.`,
    () => [
      `Mercury in Scorpio skips the weather and goes for the wiring. "What do you do" is boring to you; "what are you actually afraid of" is a normal second question.`,
      `Your memory for personal detail is total. People hand you facts casually and don't realize they've been archived permanently.`,
      `The probing isn't nosiness — it's how you build trust. To you, knowing someone deeply IS caring about them. To them, it can feel like being handled.`,
    ],
    () => `Coffee with a new colleague. Forty minutes in they've told you about the divorce, the brother, and the thing they've never told anyone — and they leave unsure how it happened, holding a latte and their own biography.`,
    () => [
      `People can feel X-rayed. Some will like it; the ones who need gradual trust feel violated instead of seen.`,
      `Your knowledge gives you leverage whether you want it or not — people start guarding themselves around you once they notice you don't forget.`,
      `Deep-only intimacy can skip the light layers where relationships actually breathe. Not everything needs to be a excavation to matter.`,
    ],
    () => [
      `You find the truth in people the way sonar finds the bottom. Nothing fake survives five minutes with you.`,
      `Your memory tells people they matter. Remembering someone's small detail six months later is one of the deepest forms of respect there is.`,
      `You're the person people tell the real story to — the one they've never said out loud. That's a role, and it's a gift.`,
    ],
    () => [
      `Match depth permission: one deep question, then offer one of yours. Reciprocity turns interrogation into intimacy.`,
      `Let people volunteer the deep cuts. Ask the lighter question and wait — you'll be surprised how often they still get there, and how much better it lands when they choose it.`,
      `Tell people you remember. "I remembered you said X — how did that go?" said warmly is magic; the same fact discovered later feels like surveillance.`,
    ],
    () => [
      `The depth is the gift; the surprise is the problem. Let people know what you're holding and it becomes connection instead of exposure.`,
      `You were built for real talk. Just hand people the map of how you get there.`,
    ]
  ),

  // ------------------------------------------- Misunderstood Communicator
  "Misunderstood Communicator": simple(
    () => `Your texts are 12-paragraph essays that you then unsend. Your brain runs faster than your typing, and you'll say a thing, mean a different thing, and get frustrated when they took the first one. "You know what I meant!" — no, they didn't. Clarity is not your strong suit.`,
    () => [
      `Mercury in Gemini retrograde runs three drafts of every thought simultaneously, and sometimes sends the wrong one. The gap between what you meant and what you typed is where the problems live.`,
      `You hear yourself correctly from inside — the context, the tone, the joke are all present in your head. Everyone else only gets the words, minus all of that.`,
      `The unsend-and-rewrite habit isn't flakiness. It's your brain re-processing in real time and expecting the world to follow the update.`,
    ],
    () => `You send a three-line reply meaning it playfully. They read it as cold. You send a full paragraph explaining the tone, which now reads as intense. You delete it, send "lol nevermind," and now THAT needs explaining.`,
    () => [
      `You can spend more energy on being understood than on the actual relationship — clarifying becomes a second job.`,
      `The misunderstandings stack: people start reading your messages in the worst tone by default, because experience taught them to.`,
      `Quick-talking plus slow-clarity means you sometimes win conversations while losing the point entirely.`,
    ],
    () => [
      `Your mind moves at a speed most people never experience. Ideas connect in you in real time — being around it is genuinely electric.`,
      `You're interesting. The essays, the tangents, the three thoughts at once — it makes you the best texter and talker most people know.`,
      `You care enough to clarify. The rewriting habit that annoys you exists because being understood matters to you — that's love wearing a clumsy costume.`,
    ],
    () => [
      `Before sending anything with emotional stakes, read it once in their voice. Not yours — theirs. That single re-read kills most misfires.`,
      `When misunderstood, skip "you know what I meant." Say the meaning fresh in six plain words: "joke — I actually think it's great."`,
      `Save the essays for the page, not the chat. One idea per message reads calm; twelve reads like a storm.`,
    ],
    () => [
      `You're not a bad communicator — you're a fast one without subtitles. Add the subtitles and the speed becomes pure advantage.`,
      `The person who understands your drafts is out there. Send them the final versions until they arrive.`,
    ]
  ),

  // ------------------------------------------------------- Picks Everything Apart
  "Picks Everything Apart": simple(
    () => `You'll mentally correct someone's grammar and also their life choices. You notice every detail — including the ones they didn't want noticed. You think you're helping; they feel like they're being audited. Your feedback is always technically right, which makes it worse, because nobody can even argue with it.`,
    () => [
      `Mercury in Virgo runs a constant quality scan — errors surface in your mind uninvited, with corrections attached. Noticing isn't a choice; it's the placement's native output.`,
      `You deliver fixes as care. In your operating system, "here's what's wrong" means "I took you seriously enough to help." The receiver hears judgment.`,
      `The accuracy is what makes it land hardest. Nobody can dispute the correction — so it sticks, and the sting of being corrected in public sticks with it.`,
    ],
    () => `They show you the resume they're proud of. You hand back three typos, a weak verb, and a structural suggestion — all correct. They say thanks flatly, and you genuinely don't know why the room got colder.`,
    () => [
      `People start hiding their work, their plans, their dreams from you — the audit tax gets too high.`,
      `The people you love receive the message "you are not acceptable as you are," even though your insides never sent that message.`,
      `You're living with an inner quality inspector that never clocks out — and it inspects you hardest of all.`,
    ],
    () => [
      `Your precision is elite. You catch what everyone else walks past, and when something actually needs a sharp eye, you're the one who has it.`,
      `When you praise someone, they believe it — because they know your praise isn't cheap. It cleared a real bar.`,
      `You make things better. Genuinely: resumes, plans, houses, systems — everything you touch comes out improved.`,
    ],
    () => [
      `Adopt the 3:1 rule — three true positives before any correction. The correction lands better AND the person stays open.`,
      `Ask before fixing: "want feedback or support?" It takes four seconds and it's the difference between a coach and an auditor.`,
      `Once a day, notice a detail and let it go WITHOUT saying it. Feel the urge, stay silent, watch nothing bad happen. That's the muscle.`,
    ],
    () => [
      `Your eye is a gift, not a weapon — it just needs permission slips before it operates.`,
      `Being right is cheap. Being trusted with someone's rough draft is the actual prize.`,
    ]
  ),

  // ---------------------------------------------------------------- Tangled Words
  "Tangled Words": simple(
    (c) => `You often say the wrong thing first. Not lies — just imprecise. You'll text "I'm 5 min away" from the couch. You genuinely meant to be 5 minutes away; you just didn't translate that into action. Clarification becomes part of every conversation, and it gets old — for you and for Mercury retrograde in ${c.sign("mercury")}.`,
    (c) => [
      `Mercury retrograde in ${c.sign("mercury")} routes expression through an extra internal layer. First drafts of words come out bent, and the correction usually arrives mid-sentence or after.`,
      `The mismatch is sincere — inside, the intention is fully formed and correct. The translation to words just drops pieces on the way out.`,
      `You've learned to expect the correction round, so conversations carry a background hum of "wait, let me say that better."`,
    ],
    () => `"Leaving now" — sent from bed. You show up 40 minutes late genuinely confused at their annoyance: you MEANT leaving now. In your head, meaning and saying are the same event; everyone else only got the words.`,
    () => [
      `People who need reliability start reading your words as noise, and stop believing the actual content — even when it's true.`,
      `Small credibility leaks: enough bent words and even your real promises sound like estimates.`,
      `You spend real energy on repair conversations that better first drafts would have made unnecessary.`,
    ],
    () => [
      `Your mind runs a second, deeper pass on everything — you routinely arrive at insights fast talkers miss entirely.`,
      `You're forgiving of other people's verbal stumbles. You know better than anyone that words are drafts.`,
      `When it matters, your reconsidered word is iron — the re-checked version of you is more solid than most people's first.`,
    ],
    () => [
      `Change the default sentence: "I'll confirm the exact time" instead of an optimistic guess. Precision about small things buys credit for big things.`,
      `One re-read on anything with a time, place, or promise attached. The ninety-second check catches most of the bends.`,
      `When you catch your own miss, correct it BEFORE they respond — "correction: leaving in 20, not now." Self-correction reads as honesty; theirs reads as caught.`,
    ],
    () => [
      `Retrograde isn't broken wiring — it's wiring with a review step. Let the review run first and your words stop lying.`,
      `The world doesn't need faster sentences from you. It needs the second draft sooner.`,
    ]
  ),

  // -------------------------------------------------------- Reads Into Everything
  "Reads Into Everything": simple(
    () => `You take everything personally. A 3-word text becomes a 40-minute analysis of what they "really meant." You assume subtext even when there isn't any, and you'll test people by saying less than you mean. Good luck getting a straight answer from you when you're upset.`,
    () => [
      `Scorpio-heavy Mercury plus Scorpio Sun or Moon runs pattern-recognition on everything — tone, timing, word choice — and it never returns "nothing there."`,
      `The analysis feels like perception from inside and feels like accusation from outside. You're not being paranoid on purpose; the scanner doesn't have an off switch.`,
      `Saying less than you mean is a protection and a test at once: if they care, they'll dig. Most people don't dig — they just leave, confused.`,
    ],
    () => `They reply "ok." Two letters. You spend the commute constructing what "ok" could mean, land on "they're done with me," and go quiet for two days. Meanwhile they were driving, and "ok" meant ok.`,
    () => [
      `You can wound real closeness — people start over-explaining everything to preempt the trial, which exhausts them.`,
      `The 40-minute analyses cost YOU the most: hours of real stress spent on events that never existed.`,
      `Going quiet as a test means the people who fail it were often just respecting what looked like your wish for space.`,
    ],
    () => [
      `Your read on people is real. When there IS subtext, you catch it from orbit — nobody gaslights you successfully.`,
      `You're loyal with a depth most people never get to experience. The intensity that analyzes is the same intensity that protects.`,
      `You don't skim people or moments. You're fully present to everything, which is a form of respect most of the world has lost.`,
    ],
    () => [
      `Adopt the direct question as your weapon: "hey, that text felt short — all good?" One sentence replaces the 40-minute analysis and it's actually accurate.`,
      `Before spiraling, list two innocent explanations and one dark one. Sit with the innocent ones as long as you'd sit with the dark one.`,
      `When upset, say the thing at 30% volume instead of 0%. "I'm a bit off today because of the text thing" — half-coded signals nobody can decode.`,
    ],
    () => [
      `The scanner stays — it's yours. Just make it show its work before it hands down a verdict.`,
      `Most "ok" means ok. Save the deep read for the times the deep read is actually needed.`,
    ]
  ),

  // --------------------------------------------------------- Overthinks Everything
  "Overthinks Everything": simple(
    () => `Your mind and your sense of responsibility are fighting. You'll edit your thoughts before you express them, second-guess what you said after you say it, and rehearse conversations before they happen. The precision is real — but so is the exhaustion. You'd benefit from a "good enough" filter, not a "perfect" one.`,
    () => [
      `Mercury–Saturn tension puts a strict editor between thought and speech. Every sentence gets reviewed for accuracy, consequence, and how it could be held against you later.`,
      `The rehearsal habit comes from responsibility, not vanity — you feel accountable for every word's effect, so you pre-fight the conversations.`,
      `The worst part is retroactive: you re-open conversations hours later and re-score your performance. Nothing is ever fully filed.`,
    ],
    () => `You sent "sounds good!" to a plan. At 11pm you're replaying whether the exclamation mark read as sarcastic, drafting a clarification, and deciding against it — then repeating the loop tomorrow.`,
    () => [
      `The editor taxes your speed: opportunities get answered late, jokes get delivered flat, and spontaneity gets processed out of you.`,
      `People read your deliberateness as distance — they can't see the machinery, only the delay.`,
      `The review never signs off. Without a "filed" stamp, your mind re-opens old conversations for years.`,
    ],
    () => [
      `Your word, once given, is precise and kept. People learn your sentences can be trusted literally.`,
      `You catch consequences before they happen — the rehearsing brain is also the brain that spots the flaw in the plan everyone else loved.`,
      `You rarely put your foot in your mouth. The editor embarrasses you, but it also saves you — publicly, often.`,
    ],
    () => [
      `Set a filing rule: once said and not objected to within a day, the conversation is CLOSED. No re-litigating at night.`,
      `Ship at "good enough" in low-stakes moments — texts, small talk, plans. Save the full editor for the decisions that earn it.`,
      `Out loud, once: "I said it, it was fine." Hearing yourself grant the sign-off is what trains the brain to grant it without you.`,
    ],
    () => [
      `The editor made you careful; it doesn't get to make you tired. It works for you, not the reverse.`,
      `Perfect sentences were never the assignment. Said sentences were.`,
    ]
  ),

  // =========================================================================
  // RED FLAGS — EMOTIONAL
  // =========================================================================

  // -------------------------------------------- Emotional Whiplash (Moon in Aries)
  "Emotional Whiplash::moon in aries": simple(
    () => `Feelings go from 0 to 100 in 0.3 seconds. You'll scream, cry, or rage, and 20 minutes later you're completely fine and wondering why everyone else is still upset. The intensity is real — but so is the cooldown. You genuinely don't understand why they can't reset just as fast, and you'll get impatient with them for being "stuck."`,
    () => [
      `Moon in Aries lights the fuse first and asks questions during the explosion. The emotion IS the reaction — there's no buffer stage between feeling it and being it.`,
      `The reset is equally fast. The fire burns hot and clean, leaving no residue — which is why you never get that everyone else is still standing in the smoke.`,
      `Your impatience with their slow cooldown reads as "my feelings don't matter" to them, when to you it's genuinely "but we're fine now — why aren't we fine?"`,
    ],
    () => `A forgotten errand sparks a full-volume argument, doors, the works. Twenty minutes later you're proposing dinner plans, genuinely cheerful. They're still at hour two of hurt, and you're annoyed they're "starting again."`,
    () => [
      `People brace around you. The unpredictability of the next flash trains everyone you love to stay slightly tense.`,
      `The fast reset can look like the feelings weren't serious — so the outbursts get discounted, even the ones about real things.`,
      `You can leave real damage in the blast zone while genuinely not remembering it as a big deal. They remember everything.`,
    ],
    () => [
      `You never fake a feeling. What you show is always exactly what's real in that moment — total emotional honesty.`,
      `You don't hold grudges. The anger cleans out completely, and you can love fully five minutes after a war.`,
      `Your emotional speed makes you brave in feeling — you go first in hard conversations, and everyone secretly benefits from that.`,
    ],
    () => [
      `Adopt the 20-minute contract: blast if you must, but at minute twenty, ASK them where they are instead of assuming the reset. Their timeline is not slow — it's just longer.`,
      `Warn people once, plainly: "I flare fast and I'm over it fast — it's not manipulation, it's my thermostat." Naming it halves the damage.`,
      `When they're still hurt after your reset, resist "get over it." Try "walk me through where you are" — one sentence, and watch what it saves.`,
    ],
    () => [
      `Fast hearts aren't wrong hearts. Yours just needs to learn that other thermometers run slower.`,
      `The fire is yours to keep. The landing is the part to work on.`,
    ]
  ),

  // -------------------------------------------- Emotional Whiplash (Moon–Mars aspect)
  "Emotional Whiplash::moon square mars": simple(
    () => `Your emotional world and your drive are in direct conflict — what you feel and what you want to do about it pull in different directions. You'll react before you process, and then have to deal with the aftermath. The anger is fast; the cooling down is slow. People will learn to give you space, not advice.`,
    () => [
      `Moon square Mars wires feeling and action to the same trigger. Something hurts → something fires. There's no pause where most people keep their deliberation.`,
      `The cooldown is slower than the ignition — the flare is instant, but the chemical aftermath hangs around for hours. That asymmetry is what makes it dangerous.`,
      `You don't explode out of nowhere; you explode out of a build-up nobody saw, including you. The pressure compiles silently until the smallest thing releases it.`,
    ],
    () => `A comment lands wrong at dinner. You're not yelling — you're just abruptly doing dishes harder than dishes require, one-word answers, radio silence. Everyone can feel it. Nobody knows what to do with it, including you.`,
    () => [
      `The people closest to you learn to walk on the specific eggs — and that carefulness slowly becomes distance.`,
      `You can do real damage in the red zone — say the thing, send the message, make the decision — and spend days cleaning up what seconds cost.`,
      `Unprocessed anger doesn't disappear; it goes into the body — jaw, shoulders, sleep — and comes out sideways at people who didn't cause it.`,
    ],
    () => [
      `You feel at full volume. Nobody ever has to guess whether something mattered to you — the answer is always visible.`,
      `The same current is what makes you a fierce defender. When someone you love is threatened, you are the person people are glad exists.`,
      `You never sit on a real problem. It comes out, it gets handled, nothing festers underground.`,
    ],
    () => [
      `Build the circuit-breaker: when the heat rises, physical output FIRST — walk, gym, scrub something. The chemistry needs a drain that isn't a person.`,
      `Learn your early warning: tight chest, short sentences, sudden task-focus. When you catch it, announce it: "I'm at a 7 right now, not about you, I'll come back." That announcement saves relationships.`,
      `No permanent decisions inside the red zone. Nothing said, sent, or signed while the square is lit. Sleep, then decide.`,
    ],
    () => [
      `The wiring gives you force; the work is giving it a steering wheel.`,
      `You're not "too much" — you're at full power with no neutral gear. Find the neutral.`,
    ]
  ),

  // ---------------------------------------------------------- Emotionally Detached
  "Emotionally Detached": simple(
    () => `You process feelings like a nature documentary — fascinating, but from a safe distance. You'll watch yourself having emotions instead of actually having them. People call you cold; you call it "objective." You need space, and you need a lot of it, and you'll take it without warning.`,
    () => [
      `Moon in Aquarius installs a layer of air between you and your own feelings. Something happens, and the first thing you do is describe it to yourself rather than feel it.`,
      `The no-warning space retreat isn't a message — it's oxygen. Crowded emotions genuinely overheat your system, and leaving is how you cool down.`,
      `You treat your own pain as an interesting case study. It protects you, and it also means feelings take the scenic route to actually being processed.`,
    ],
    () => `Mid-argument, they're crying, and you notice you're... observing. Noting their points, evaluating their logic, vaguely fascinated. Later you realize you were supposed to be THERE, not taking notes.`,
    () => [
      `Partners can spend years reaching for someone who responds with analysis, and conclude they're loved but never held.`,
      `The unplanned disappearances accumulate. People can't tell the difference between "needs air" and "is leaving," so they brace.`,
      `Unfelt feelings don't disappear — they surface later as sudden burnout, weird body symptoms, or one unexplained explosion a year.`,
    ],
    () => [
      `You're the calm in everyone's emergency. Nothing rattles you enough to make you useless, and people literally survive crises better with you there.`,
      `Your objectivity is a real gift — you see relationship dynamics, politics, and family systems with a clarity nobody emotional can match.`,
      `You give others the freedom you need. Nobody gets smothered in your orbit, ever.`,
    ],
    () => [
      `Pre-schedule the retreat: "I need a walk, back at 8" — same oxygen, zero alarm. The warning costs you nothing and saves them the spiral.`,
      `Once a day, name the feeling physically: "chest is tight, that's anxiety." Don't analyze it — just locate it in the body. Feeling starts there for you.`,
      `When someone cries, stay. Three minutes of just being there, no fixing, no observing. It's the longest three minutes of your week and the most important.`,
    ],
    () => [
      `The distance is a real skill — it's just not the whole toolkit. Add the body back in and you're complete.`,
      `Cold isn't what you are. Delayed is what you are. Learn the delay and people stop misreading you.`,
    ]
  ),

  // ----------------------------------------------------------------- Mood Sponge
  "Mood Sponge": simple(
    () => `You absorb everyone else's feelings and forget which ones are yours. You'll need a 3-hour nap after a 30-minute conversation because someone was sad. You can't watch the news without spiraling. Your empathy is a superpower and a vulnerability, and you have no boundaries around it.`,
    () => [
      `Moon in Pisces has permeable walls — the boundary between your mood and the room's mood simply doesn't exist unless you build one on purpose.`,
      `You don't always notice the download happening. You just notice that you're suddenly sad, anxious, or heavy — and assume it's yours.`,
      `Other people's pain registers as yours to carry. The news, the stranger, the friend's crisis — all of it lands at full volume.`,
    ],
    () => `A friend unloads for half an hour. They leave relieved. You lie on the floor for three hours with their sadness in your chest like it's yours, wondering why you're so tired.`,
    () => [
      `Chronic absorption looks like "moodiness" from outside and feels like drowning from inside — you never get to know what YOU actually feel.`,
      `No filter means no recovery time. A day full of other people's emotions can flatten you like actual labor.`,
      `You can get manipulated by pure guilt — the "please, think of them" lever works on you even when your brain says no.`,
    ],
    () => [
      `You feel people at a depth that makes you genuinely healing to be around — the hurting person leaves lighter after time with you.`,
      `Your intuition about people is near-psychic. You know who's lying, who's hurting, who needs the call — before anyone says anything.`,
      `Your art, your care, your presence — all of it runs on this same openness. Seal it off and the gifts go with it.`,
    ],
    () => [
      `Learn the question "is this mine?" — when a mood lands, ask it literally. If the answer is no, imagine hanging the mood back on its owner's hook. It sounds silly; it works.`,
      `Build decompression after absorbing days: alone, quiet, water, no input. You're not lazy — you're draining the day off.`,
      `Limit the news to once a day, on purpose. You cannot "handle more" — your system isn't built for ambient global grief, and pretending otherwise just burns you.`,
    ],
    () => [
      `The openness is the gift and the leak. It doesn't need sealing — it needs doors you operate.`,
      `You were built to feel with people. Just make sure at least one of the feelings in you is actually yours.`,
    ]
  ),

  // -------------------------------------------------------- Feels Through Thoughts
  "Feels Through Thoughts": simple(
    () => `You process feelings through your head, not your body. You'll have the same conversation 14 times in your mind and change your mind 9 of those times. You'll text a 6-paragraph feelings essay at 2am and then delete it. Actually feeling the feeling? That's the hard part — you'd rather think about it.`,
    () => [
      `Moon in Gemini routes emotion through language. The feeling doesn't register as done until it's been SAID or written — ideally several times, from several angles.`,
      `The deletion habit is real: the 2am essay is honest, the 9am self is embarrassed by it, and the version of you that needed to send it never gets witnessed.`,
      `Thinking about a feeling and having it are different events, and you can confuse a well-analyzed emotion with a felt one for years.`,
    ],
    () => `You draft the "hey, can we talk about the other night" message, write six paragraphs, delete four, send one sentence, and spend the next hour re-reading their "sure" for tone.`,
    () => [
      `The people around you get the summary of your feelings, never the live show — closeness stalls at the commentary track.`,
      `Analysis becomes a delay tactic: as long as you're still thinking about it, you don't have to actually sit in it.`,
      `Decisions that need the body's vote (this job, this person, this move) get stuck in committee forever.`,
    ],
    () => [
      `You understand yourself in prose. Your self-awareness, once it arrives, is articulate and sharp in a way feelers' rarely is.`,
      `You can talk about anything. Emotionally hard conversations don't scare you the way they scare most people — words are your home field.`,
      `Your curiosity about your own inner weather never stops, and it makes you interesting to yourself — genuinely good company for your own head.`,
    ],
    () => [
      `Try the body vote once a day: before deciding, ask "what does my chest say?" One word answers. You're collecting data from a department you've been ignoring.`,
      `Send ONE unedited honest sentence per week — the 2am version, single line, no essay. "I actually felt hurt on Tuesday." That's the whole practice.`,
      `When the loop starts (same conversation, 15th take), set it down: write the thought on paper, close the notebook. Paper remembers so you don't have to.`,
    ],
    () => [
      `Your head isn't the enemy of your heart — it's just been doing its job. Hire your body back and the whole system balances.`,
      `The feeling you're avoiding is usually smaller than the thoughts about it. Go feel the small thing.`,
    ]
  ),

  // ------------------------------------------------------ Takes Everything Personally
  "Takes Everything Personally": simple(
    () => `You'll bring up something they said in years ago as evidence in a current argument. Emotional memory is long, and you remember every tone, every pause, every "k." You don't hold grudges — you curate them, and you will deploy them at the worst possible moment.`,
    () => [
      `Cancer Sun with a water Moon gives you near-total recall for emotional events. The archive isn't spiteful — it's automatic. Hurt just... files itself, complete with date, tone, and exact wording.`,
      `Because feelings are how you navigate, a dismissive tone lands like data. You can't NOT receive it.`,
      `The deployment habit: the archive is private, so when you finally bring up the receipts, the other person is hit by years of unshared grievance at once.`,
    ],
    () => `You're arguing about whose turn it is to call the plumber, and you say "this is exactly like March when you sighed at me in front of your sister." They blink. The connection was real — and invisible to everyone but you.`,
    () => [
      `Unshared hurt doesn't dissolve — it compounds. The archive grows, and the eventual bill arrives with years of interest.`,
      `People feel trialed by a memory they can't see. They think things are fine; you're three receipts deep.`,
      `The personalization reflex means neutral events (a short reply, a tired evening) register as verdicts on your worth.`,
    ],
    () => [
      `Your memory makes people feel unforgettable. Remembering someone's small moment years later is a form of love most people never experience.`,
      `You are loyal to a fault — the same archive that stores hurt also stores every kindness done to you, and you repay those decades later.`,
      `You notice emotional weather before anyone else. When something's wrong in a room, you knew first.`,
    ],
    () => [
      `Adopt the 24-hour rule: hurt gets raised within a day, at room temperature, or it gets released. No multi-year storage. "Hey, that sigh Tuesday stung" beats the 2019 exhibit.`,
      `Before taking it personally, run the reality check: "would I do this on purpose if I loved them?" If no — assume exhaustion, not verdict.`,
      `Tell one person from the archive about one old receipt, gently, with no accusation attached. Watch how much lighter the file gets when it's finally shared.`,
    ],
    () => [
      `The long memory is a real gift with one bad habit: solitary confinement for the evidence. Let the evidence out.`,
      `You don't have to forget to forgive. You just have to stop filing things you never showed anyone.`,
    ]
  ),

  // ---------------------------------------------------------- Emotionally Controlled
  "Emotionally Controlled": simple(
    (c) => `You treat emotions like a performance review. You'll suppress what you're feeling because "showing weakness isn't productive." You're not cold — you're bracing. It takes years for you to actually let someone in, and most people give up before they get there. With Saturn sitting on your ${c.sign("sun") === c.sign("moon") ? "Sun and Moon" : c.sign("sun") === "Aries" ? "Sun" : "Sun or Moon"} in ${c.sign("sun")}, the control runs deep.`,
    (c) => [
      `Saturn in ${c.sign("sun")} on your ${c.sign("sun") === c.sign("moon") ? "core and your feelings at once" : "core self"} installs a governor on expression. Feelings get checked against "is this acceptable to show" before release — and most fail the check.`,
      `The bracing isn't coldness. It's a body that learned early that display costs something, and budgeted accordingly.`,
      `The governor never relaxes on its own. Years in, the people closest to you still get the managed version — and think that's all there is.`,
    ],
    () => `You get genuinely bad news in front of your partner — the kind that warrants tears. You say "I'll deal with it tomorrow," go quiet, and process it alone at the gym. They spend the night feeling shut out of something huge.`,
    () => [
      `Suppression doesn't delete — it stores. The stored weight shows up as tension, fatigue, and eventually one inexplicable breakdown.`,
      `People can't love what they can't see. The managed version is loved; the real one stays alone in the control room.`,
      `The effort of constant governance is exhausting — you're running emotional compliance software 24/7 and calling it personality.`,
    ],
    () => [
      `You are the person everyone relies on when things actually go wrong. Your composure is load-bearing for everyone around you.`,
      `Nothing about you is performative. When you finally express something, everyone believes it completely.`,
      `Your endurance is real. You can carry seasons that would fold other people — and you do it quietly.`,
    ],
    () => [
      `Lower the drawbridge in increments: one honest sentence about a real feeling per day, to someone safe. "Today was heavier than I said." That's the whole dose.`,
      `Find the one person who's earned the unmanaged version and let them see you fail at something, on purpose. The world doesn't end — and something in you unlocks.`,
      `When you notice the governor engaging (straightening up, changing the subject), say the thing it's blocking FIRST: "actually, that did hurt." Thirty seconds, done.`,
    ],
    () => [
      `The control was armor once. It doesn't know the war changed — you're the one who has to tell it.`,
      `Letting someone in isn't losing the structure. It's the structure finally having somewhere to rest.`,
    ]
  ),

  // ------------------------------------------------------------- Reality Is Optional
  "Reality Is Optional": simple(
    (c) => `You'll see what you want to see, not what's there. With Neptune in ${c.sign("neptune")}, you fall in love with potential, not the person. You'll stay in bad situations way too long because you're convinced the "real" version of them is just around the corner. Reality checks bounce off you.`,
    (c) => [
      `Neptune in ${c.sign("neptune")} runs a beautiful filter over everything. Data that doesn't fit the dream gets quietly reinterpreted until it does.`,
      `Potential is your native optics. You meet a person (or a job, or a plan) and meet their ceiling at the same time — then wait, sometimes for years, for the ceiling to arrive.`,
      `The check-bouncing isn't stubbornness. The filter is pre-conscious: red flags enter as "misunderstood," "going through a phase," or "my fault for asking."`,
    ],
    () => `Friends lay out the pattern: the broken promises, the dates, the patterns — point by point. You nod, and inside you're thinking "they just haven't seen what I've seen." Two more years pass. The friends were right.`,
    () => [
      `You can donate years to projections — loving a hypothetical while the actual person sits unused across the table.`,
      `The crash, when the filter finally breaks, takes the whole structure with it: trust, time, and your faith in your own judgment.`,
      `People who benefit from your fog learn they can — the least scrupulous person in the room gets the most rope from you.`,
    ],
    () => [
      `You see what people could be. Artists, healers, and great leaders run on exactly this — you meet the future early.`,
      `Your compassion has no ceiling. You extend the belief in someone's better self that nobody else will give them.`,
      `When the dream is REAL — a person who grows into it, a plan that lands — your faith is the thing that carried it there. You've made magic happen by refusing to unbelieve.`,
    ],
    () => [
      `Institute the evidence rule: judge by the last three data points, not the best one ever. Recent actions are the only real biography.`,
      `Borrow one skeptic. Before big commitments, ask the friend who loves you bluntly: "what am I not seeing?" Then LISTEN without defending.`,
      `Set escape dates: "if X hasn't changed by March, I re-decide." The fog can't survive a written deadline.`,
    ],
    () => [
      `The vision isn't the enemy — the deadline-less waiting is. Give your dreams dates and they stop eating your years.`,
      `You don't have to stop believing in people. Just start believing them at the pace they've actually shown.`,
    ]
  ),

  // ------------------------------------------------------ All-Or-Nothing Attachment
  "All-Or-Nothing Attachment": simple(
    () => `You attach with your whole soul — when you let someone in, it's total. The flip side: you also detach with your whole soul, and once you're done, there's no going back. The middle ground (casual, light, gradual) is genuinely hard for you.`,
    () => [
      `Pluto in the 8th bonds at depth — intimacy pulls the entire psyche in. There's no version of you that's "kind of" in something.`,
      `The detachment is a protection with a hair trigger: one deep-enough betrayal and the whole bond gets amputated, cleanly, without anesthesia.`,
      `The middle gears physically don't exist for you. Situationships, "seeing where it goes," light — these feel like drowning slowly, so you convert everything to all-or-nothing.`,
    ],
    () => `Two months in, you already know this person is it. You've restructured plans, opened vaults, and told them things your best friend doesn't know. They say "isn't it a bit early for all that?" — and you feel the floor tilt.`,
    () => [
      `The total attachment can overwhelm people who bond at human speed — they experience your depth as pressure, your openness as debt.`,
      `The amputation reflex can kill salvageable bonds. One bad season, and a decade of love gets cut instead of repaired.`,
      `The intensity burns you too: total attachment means total exposure, and every ending hurts at full scale.`,
    ],
    () => [
      `When you love someone, they get the rarest thing on earth: one person who is fully, entirely THERE.`,
      `Your loyalty is structural. Bonds with you don't leak — they hold, for decades, through things that break other people.`,
      `You transform people. Being loved by you changes what they believe they deserve, usually upward, permanently.`,
    ],
    () => [
      `Add the middle gear on purpose: practice letting one relationship stay at 70% for six months. Watch it not die. Build the gear the chart skipped.`,
      `Before the amputation, install a review: "is this a betrayal of the bond, or a season of the person?" Seasons pass. Amputations don't undo.`,
      `Tell new people the manual: "I bond deep and I bond slow-to-fast — tell me if I'm outpacing you." The honesty converts intensity from pressure to invitation.`,
    ],
    () => [
      `All-or-nothing made you — it doesn't have to limit you. The middle gear is learnable, and it's where the long lives are lived.`,
      `The depth stays. Just stop making people pass a depth test they didn't know they were taking.`,
    ]
  ),

  // ----------------------------------------------------------- Home Is Complicated
  "Home Is Complicated": simple(
    () => `Your relationship with home, family, and roots is heavy. You may have grown up fast, taken on responsibility too young, or felt like you had to earn your place in the family. You carry that weight into every home you build as an adult — it's hard for you to just relax at home.`,
    () => [
      `Saturn in the 4th puts the weight at the very bottom of the chart. Home — the place others use for refueling — was your first job site.`,
      `You learned early that belonging had conditions. That lesson generalizes: every room you're in afterward gets checked for "am I allowed to be at ease here."`,
      `Rest feels foreign because your system was built on duty. Even in a safe house, the guard post stays staffed.`,
    ],
    () => `Sunday, nothing to do, safe apartment. You reorganize the kitchen, fix the shelf, answer emails — sitting still makes your skin crawl by 2pm. Home is where you WORK, even when nobody's watching.`,
    () => [
      `You can build adult homes that feel like offices — clean, functional, and quietly stressful for everyone inside.`,
      `Unexamined, the "earn your place" script runs on your own family: you struggle to receive rest, love, or ease without paying for it first.`,
      `The carrying never gets put down voluntarily — you'll hold the family weight until your body invoices you.`,
    ],
    () => [
      `You are the person people bring their real problems to, because you've been competent since before you should have been.`,
      `Nothing about you is shallow-rooted. When you build something — a home, a family, a tradition — it's built to last centuries.`,
      `You understand other people's family pain instantly. No one has to explain complicated to you; you'd recognize it anywhere.`,
    ],
    () => [
      `Claim one chair, one room, one hour per week that is for REST ONLY — nothing productive allowed. Relearning ease is a skill, and skills need reps.`,
      `Say the sentence: "I don't have to earn my spot here." Out loud, in your own kitchen. The child who learned otherwise needs to hear the adult say it.`,
      `When the family weight lands again, ask: "is this actually mine to carry?" Some of it is. Most of it was borrowed. Put the borrowed part down.`,
    ],
    () => [
      `The weight made you who you are — solid, early. It doesn't get the final word on how your own home feels.`,
      `Rest isn't a reward you failed to earn. It's the thing you were owed all along and are finally collecting.`,
    ]
  ),

  // ------------------------------------------------------------ Emotionally Isolated
  "Emotionally Isolated": simple(
    () => `You process feelings alone, always. Even when you're surrounded by people, you go inside yourself to deal with emotions — and you often don't know what you're feeling until long after the moment has passed. You need serious alone time to recharge, and you won't ask for it.`,
    () => [
      `Moon in the 12th keeps the emotional life behind a closed door — even from you. Feelings surface late, processed offstage, and arrive as moods you can't initially explain.`,
      `The alone time isn't preference, it's infrastructure. Your emotional system literally cannot run with an audience.`,
      `Asking for help feels like handing someone a loaded weapon — so you don't. Whatever it is, the answer stays "I'm fine."`,
    ],
    () => `A rough week happens — real loss, real stress. You mention none of it. Friends see you Friday, you're "great." The processing happens at 1am, alone, and they find out months later, casually, like it was nothing.`,
    () => [
      `People who love you can feel the sealed door and conclude they don't matter — the isolation they experience is real, even if yours is too.`,
      `Late-arriving feelings arrive pre-mixed with distortion: months of unprocessed material lands at once and reads way darker than the original event.`,
      `Carrying everything solo eventually shows up in the body — sleep, digestion, that permanent low-grade exhaustion nobody can diagnose.`,
    ],
    () => [
      `You have an inner world most people never build — deep, private, and genuinely yours. It makes you self-contained in a way nobody can take.`,
      `Your intuition runs quietly and it's accurate. You know things about people and situations without being able to show your work.`,
      `When you DO let someone in, the trust is sacred. Being chosen past that door is one of the biggest gifts you give.`,
    ],
    () => [
      `Give one feeling a witness per month — not the whole archive, one item. "Something's been heavy lately" is enough to start.`,
      `Learn your own early signals: when the retreat urge spikes, that IS the feeling arriving. Ask "what am I actually processing?" before you vanish.`,
      `Keep one standing appointment where showing up honest is the rule — a friend, a journal group, a therapist. One room without the seal.`,
    ],
    () => [
      `The private world is your sanctuary. It doesn't need demolishing — it needs one door that opens from the inside.`,
      `You're not easier to love when you're fine. You're easier to love when you're KNOWN.`,
    ]
  ),

  // ------------------------------------------------------------- Self-Critical Loop
  "Self-Critical Loop": simple(
    () => `There's real tension between your core identity and your sense of responsibility. You'll hold yourself to standards that aren't sustainable and then beat yourself up for not meeting them. The inner critic is loud and specific. The growth: learning that "good enough" is actually good enough.`,
    () => [
      `Sun–Saturn tension hires a permanent quality inspector whose only target is you. Nothing you do passes without a written report of shortcomings.`,
      `The standards weren't chosen by you — they were installed, usually early, usually by someone whose voice the critic still borrows.`,
      `The critic frames everything as motivation ("I'm just pushing myself"). But motivation that runs on shame eventually stops producing and starts eroding.`,
    ],
    () => `You finish something real — good work, actual praise. All you remember from the day is the one section that was mediocre. The praise bounces off; the flaw files itself. Dinner that night has a soundtrack, and it's your own voice.`,
    () => [
      `Chronic self-criticism isn't humble — it's expensive. Confidence, sleep, and joy all pay dues to it forever.`,
      `The people who love you watch you do this and can't reach you: their praise bounces off the same wall your critic built.`,
      `Left alone, the loop narrows your life — you stop trying things you can't immediately be excellent at, and the range shrinks year by year.`,
    ],
    () => [
      `Your standards produce real quality. Things you actually ship are solid in a way breezy people's never are.`,
      `You're accountable. When you mess up, nobody has to convene a tribunal — you've already done the review, thoroughly.`,
      `The critic also made you fair. You extend to others the same honest accounting you give yourself, minus the cruelty.`,
    ],
    () => [
      `Separate the voice from the truth: write the criticism down, then answer it like you'd answer a friend saying it about themselves. The gap between those two answers is the work.`,
      `Set a "done" standard per task BEFORE starting — what good enough means, in writing. Then let done mean done.`,
      `Log three things that went well every night for two weeks. It sounds trivial. It's actually re-training the inspector's report format.`,
    ],
    () => [
      `The critic thinks it's keeping you excellent. Actually it's just keeping you tired. Fire it from the quality job and re-hire it as an advisor.`,
      `You were never supposed to be flawless. You were supposed to be real, and real includes mercy.`,
    ]
  ),

  // ----------------------------------------------------------------- Identity Blur
  "Identity Blur": simple(
    () => `There's tension between who you are and who you think you should be. You'll absorb other people's expectations and lose track of your own direction. Boundaries are hard — not because you can't set them, but because you genuinely can't tell where you end and others begin.`,
    () => [
      `Sun–Neptune tension makes the self porous. Other people's wants, moods, and blueprints for you flow in and get mistaken for your own.`,
      `The "should" voice often isn't yours — it's a mashup of parents, partners, and culture, playing in your own accent. That's why it's so convincing.`,
      `You can't enforce a boundary you can't locate. When the self is blurry, "no" feels arbitrary rather than legitimate.`,
    ],
    () => `Someone asks what YOU want to do with your life. You hear yourself give the good answer — career, plan, timeline — and realize halfway through you're reciting your mother's version. Your actual want is somewhere under that, unsurfaced for years.`,
    () => [
      `A life assembled from other people's expectations eventually feels haunted — successful on paper, hollow at 2am.`,
      `Resentment builds silently: you keep agreeing to things "you" chose, and the real you keeps getting overruled without a vote.`,
      `The porosity makes you vulnerable to whoever speaks with the most confidence about who you should be.`,
    ],
    () => [
      `Your empathy is structural — you feel into other people's lives so well that you're the one who understands everyone.`,
      `You have no ego armor, which makes you genuinely open: people can tell, and they bring you their real selves.`,
      `When you DO connect with a true want, you pursue it with a purity nobody pressured-self can match. The real voice, once found, is unshakeable.`,
    ],
    () => [
      `Run the wants audit: write "I want ___" twenty times, fast, no editing. The list that embarrasses you is the honest one. Start with the smallest item on it.`,
      `Before saying yes to anything significant, insert a 24-hour delay. The porous self says yes instantly; the real self needs a night to speak.`,
      `Practice the sentence "let me check with myself" — out loud if needed. It buys the space where your actual opinion loads.`,
    ],
    () => [
      `The blur isn't weakness — it's permeability without a filter. Build the filter and the same openness becomes a superpower.`,
      `The person you're trying to be for everyone has been drowning out the person you are. Give the quiet one the microphone for a month.`,
    ]
  ),

  // =========================================================================
  // GROWTH AREAS
  // =========================================================================

  // ------------------------------------------------------------- Can't Pick A Side
  "Can't Pick A Side": simple(
    () => `You'll weigh every option so long that decisions paralyze you. You see all perspectives, which is a gift — but it also means you can't commit to one. You'll need someone who makes decisions for you, or you'll spend 45 minutes choosing where to eat.`,
    () => [
      `Mercury in Libra holds every viewpoint at once, and each one is genuinely valid from inside. Choosing one feels like unjustly executing the others.`,
      `The 45 minutes aren't indecision — they're jurisprudence. You're running a fair trial for both restaurants, both jobs, both answers.`,
      `Decisions feel permanent to you in a way they aren't. From inside, picking one option means shutting a door forever; from outside, it usually means trying a thing on Tuesday.`,
    ],
    () => `The group asks where you want to eat. You say "I'm easy either way" (you're not), then internally run the pros and cons of both options for the entire walk, and feel a real stab of regret about the one you didn't pick — for the rest of the night.`,
    () => [
      `Small decisions leak hours weekly. Add them up and the paralysis has a real cost in energy and in other people's patience.`,
      `Outsourcing decisions trains dependency — you end up living on a defaults-of-others operating system.`,
      `The regret replay doubles the cost: you don't just fail to choose fast, you keep choosing retroactively all evening.`,
    ],
    () => [
      `You genuinely see every side. In arguments, negotiations, and group conflicts, you're the translator nobody else can be.`,
      `People feel fairly heard by you. Your reviews of their dilemma take ALL their reasons seriously — that's rare and valuable.`,
      `Your taste, once it commits, is excellent — because it survived a real gauntlet.`,
    ],
    () => [
      `Use the coin-flip rule for small stuff: flip a coin, and notice which side you're HOPING it lands on while it's in the air. That hope is your actual answer. Take it.`,
      `Set decision budgets: dinner gets 2 minutes, plans get 10, big stuff gets a day — then it's decided, and re-litigating is banned.`,
      `Once a week, choose something nobody forced you to choose and don't review the unchosen option afterward. Practice the closed door.`,
    ],
    () => [
      `Your even-handedness is real — it just needs a supervisor. Give it deadlines and it becomes wisdom instead of drag.`,
      `Both options were fine. The refusing-to-pick was the only bad option on the table.`,
    ]
  ),

  // -------------------------------------------------------------- Boundary Issues
  "Boundary Issues": simple(
    () => `You absorb everyone's stuff and forget where you end and they begin. Setting a boundary feels mean to you, so you don't. The growth edge: learning that "no" is a complete sentence and that protecting your energy isn't selfish.`,
    () => [
      `Sun in Pisces has osmotic edges — you take in requests, moods, and problems without checking whether you agreed to the delivery.`,
      `The "mean" feeling is mislabeled. It's actually the fear of disconnection: someone, long ago, taught you that being loved and being available were the same job.`,
      `You don't notice the leak while it's happening — you notice it later as exhaustion, resentment, or a mysterious urge to disappear for a week.`,
    ],
    () => `A friend asks for a huge favor on your only free day. You say "of course" instantly, spend the day helping, come home hollow, and cancel your own plans for the next week because you're depleted — and you'd do it again tomorrow.`,
    () => [
      `Chronic over-giving ends in either explosion or evacuation — you blow up at someone undeserving, or vanish on everyone.`,
      `The people who take advantage aren't always villains; a person without visible limits teaches others to walk past where the fence should be.`,
      `Your own life — projects, rest, dreams — keeps getting rescheduled for other people's emergencies, and eventually rescheduled into nonexistence.`,
    ],
    () => [
      `Your generosity is genuinely bottomless. People in real crisis end up okay because of you — that matters more than the tidy boundaries everyone preaches.`,
      `You forgive without keeping score. The compassion you extend is real, not transactional.`,
      `Your sensitivity makes people safe with you. Hurting humans pick you instinctively — and they're right to.`,
    ],
    () => [
      `Buy the delay: "let me check and get back to you" is a complete response. It breaks the auto-yes and gives the real answer time to load.`,
      `Start with one small no per week — low stakes, kind tone, no essay attached. "Can't make it Saturday" needs no apology paragraph.`,
      `Notice the body signal: the tight "ugh" feeling when you agree. That feeling IS the boundary. Follow it backward to what you actually wanted.`,
    ],
    () => [
      `Boundaries aren't walls — they're the doors that let you keep being generous without going bankrupt.`,
      `"No" said kindly is not mean. It's the sentence that keeps your "yes" worth having.`,
    ]
  ),

  // ----------------------------------------------------- Passive-Aggressive Conflict
  "Passive-Aggressive Conflict": simple(
    () => `You won't fight directly — you'll hint, sigh, withdraw, and hope they figure it out. Your conflict style is "if you loved me you'd know." The growth edge: saying the thing out loud instead of waiting for mind-reading.`,
    () => [
      `Mars in Libra routes anger through diplomacy until diplomacy becomes distortion. Direct conflict feels dangerous to the relationship, so the feeling goes sideways instead.`,
      `The hints feel LOUD from inside — the sigh, the shorter texts, the pointed comment about "some people." From outside, they're basically silent.`,
      `The withdrawal is a strategy: reduce warmth until they notice and ask. Most people don't decode it — they just experience unexplained cold and pull back too.`,
    ],
    () => `They were late again. You said "no worries." Then: one-word answers all evening, you "forget" to share the fries, and when they ask what's wrong — "nothing." You'd rather eat cold fries angry than say "when you're late I feel like I don't matter."`,
    () => [
      `Nothing gets resolved because nothing gets named. The same fight happens monthly in costume.`,
      `The other person gets punished by weather they can't see or fix — that's exhausting and quietly unfair.`,
      `Your real needs stay unmet for years while you wait for a mind-reader who was never coming.`,
    ],
    () => [
      `You never nuke anything. Your conflicts don't leave craters the way hotheads' do — you'd rather lose than devastate.`,
      `You're the person who keeps relationships pleasant and repairable. Most people love that about you before they ever hit the wall.`,
      `When you DO finally say something directly, it's fair and measured — Libra Mars argues like a judge, not a brawler.`,
    ],
    () => [
      `Use the 10-word script: "[thing] happened, I felt [feeling], can we fix it?" Ten words, direct, no hints. It's shorter than the sigh campaign.`,
      `Ban "nothing" as an answer for a month. If asked what's wrong and something is wrong, name the smallest version of it.`,
      `Set a personal deadline: any irritation older than 48 hours gets SAID. The deadline forces directness before the resentment compounds.`,
    ],
    () => [
      `Your gentleness is real — it just shouldn't be a smokescreen. Say the thing kindly and you get both.`,
      `People can't love you well if they can't read you. Directness is a gift you give them, not a risk you take.`,
    ]
  ),

  // ----------------------------------------------------------------- Anxiety Spiral
  "Anxiety Spiral": simple(
    () => `Your default setting is "what if it goes wrong" and you'll rehearse every possible failure scenario. The growth edge: learning that most of what you worry about never happens, and that the worry itself is more exhausting than the actual problem.`,
    () => [
      `Moon in Virgo runs risk analysis as a background process — every plan, message, and health twitch gets scanned for the failure mode automatically.`,
      `The scanning feels like responsibility. It's actually an attempt to control the future by pre-suffering it — and the future never signs the contract.`,
      `The spiral has a shape: one trigger → one vivid scenario → the scenario generates three more → by midnight you're managing outcomes for events that exist nowhere but your head.`,
    ],
    () => `Boss says "can we talk tomorrow?" Nothing else. You run the termination scenario, the reorganization scenario, the "they found the mistake in your report from March" scenario. Tomorrow's topic: your vacation request. The Tuesday was ruined for nothing.`,
    () => [
      `The body can't tell rehearsal from reality — you're running cortisol for disasters that never occur. That's real wear.`,
      `The spiral taxes sleep, the one place your system restores itself. Nights become shift two.`,
      `People around you start managing YOUR weather — hiding things to prevent spirals, which builds its own distance.`,
    ],
    () => [
      `Your catch-rate for real problems is elite. When something IS actually wrong, you spotted it days before anyone else.`,
      `You're the most prepared person in every room. Travel with you feels safe for a reason.`,
      `Your care is total — the worry is love and duty running at full power, aimed at the people and work you take seriously.`,
    ],
    () => [
      `Use the "then what" ladder: follow the fear three steps down on paper. Written scenarios look smaller than felt ones — usually step three ends in "and then I'd handle it," which is true.`,
      `Set worry office hours: 5pm–5:15pm, all worries must wait for the window. By 5pm, most have expired.`,
      `Separate signal from noise: "can I act on this right now?" No → it goes on the list for office hours, not on repeat in your head.`,
    ],
    () => [
      `The scanner that guards you also drains you. It doesn't need demolition — it needs a schedule.`,
      `You've survived every worst day so far. That's a better statistic than any scenario your head can write.`,
    ]
  ),

  // =========================================================================
  // RED FLAGS — BEHAVIORAL
  // =========================================================================

  // ----------------------------------------------------------------- Over-Promiser
  "Over-Promiser": simple(
    (c) => `You'll say yes to everything — every project, every plan, every favor — and genuinely mean it at the time. Then reality hits and you can't deliver on half of it. It's not malice — with Jupiter in ${c.sign("jupiter")}, you just see the best-case scenario and commit to it before checking if the math works.`,
    (c) => [
      `Jupiter in ${c.sign("jupiter")} runs on expansion — every yes is made at the moment of maximum enthusiasm, when the future looks limitless and the calendar looks empty.`,
      `The optimism is sincere. You're not lying when you promise — you're describing the world as it looks from inside the ${c.sign("jupiter")} glow.`,
      `The check that never runs: hours available, energy available, the other promises already on the books. ${c.sign("jupiter")} Jupiter says yes first and lets reality do the accounting later.`,
    ],
    (c) => `You commit to helping with the move, taking the extra project, AND hosting Sunday. Each one felt totally doable when you said it. By Thursday you're cancelling one, half-assing another, and apologizing to everyone — again — with genuine horror at your own calendar. Jupiter in ${c.sign("jupiter")} wrote checks; the calendar cashed them.`,
    (c) => [
      `Chronic over-commitment has an interest rate: your "yes" devalues. People start discounting the ${c.sign("jupiter")} promises because the delivery rate speaks for itself.`,
      `You spend real life force on guilt — the gap between what ${c.sign("jupiter")} Jupiter promised and what you did becomes its own exhausting part-time job.`,
      `The things that mattered most get the leftovers, because the best energy went to whatever said yes loudest first — the ${c.sign("jupiter")} signature.`,
    ],
    (c) => [
      `Your enthusiasm is contagious and real — it's the ${c.sign("jupiter")} engine. Rooms get more ambitious when you're in them, and people dare to say yes to big things because you already did.`,
      `When you DO deliver, it's beyond what was asked — ${c.sign("jupiter")} over-delivers on whatever survives the calendar.`,
      `You genuinely believe in people and projects — Jupiter in ${c.sign("jupiter")} believes on contact. That belief has talked more than one person out of quitting something good.`,
    ],
    (c) => [
      `Install the 24-hour rule: nothing gets a yes on the day it's asked — especially not on a ${c.sign("jupiter")} day, when everything sounds doable. "Let me check and confirm tomorrow" — then actually check the calendar, energy included.`,
      `Count before you commit: for every new yes, name the thing already promised that will get less — a ${c.sign("jupiter")} audit, but it works. If you can't name it, fine. If you can, you've found the real price.`,
      `Downgrade vocabulary — hard for ${c.sign("jupiter")}, essential for it: "I can do part of that" and "I can do that in two weeks" are complete sentences, and they save relationships.`,
    ],
    (c) => [
      `The big heart is real — it just needs a bouncer at the door, and with Jupiter in ${c.sign("jupiter")} the bouncer is you.`,
      `Every yes is also a no to something you already love — and a ${c.sign("jupiter")} yes counts double. Choose with both facts on the table.`,
    ]
  ),

  // -------------------------------------------------------------- Growth Runs Inward
  "Growth Runs Inward": simple(
    () => `Your growth happens privately, not publicly. You'll be working on yourself for months and nobody will see any of it until it shows up as a sudden shift. You don't broadcast your evolution — you just show up different one day.`,
    () => [
      `Jupiter retrograde runs expansion through an internal review loop first. New ideas get test-driven in private journals, mental drafts, and quiet experiments before they're allowed outside.`,
      `The outside world gets the release version, not the beta. That's why people experience your changes as sudden — the whole timeline happened where they couldn't see.`,
      `There's a hidden cost: without outside witnesses, you sometimes doubt your own growth. The work was real, but nobody clapped, including you.`,
    ],
    () => `You spend six months quietly rebuilding your relationship with money — books, spreadsheets, real changes. You tell no one. At a family dinner someone makes an old joke about you being "terrible with money," and everyone laughs while you sit there holding six months of invisible progress.`,
    () => [
      `Growth without witnesses can stall — feedback is part of the loop, and you've cut the line.`,
      `People keep relating to the old version of you and responding to who you WERE, which shapes what you get offered.`,
      `The private-only habit can tip into isolation at the exact seasons when you most need one person outside your head.`,
    ],
    () => [
      `Your growth is load-bearing, not performative. When you change, it STAYS changed — no announcement ever had to be walked back.`,
      `You're immune to trend-guru noise. The self-help theater that fills feeds does nothing for you; you only keep what actually worked.`,
      `Nobody can market you out of your own development. That independence makes your progress unshakeable.`,
    ],
    () => [
      `Find one witness for one real change — tell a single person what you've been working on. Not for applause; for accuracy. Outside eyes calibrate.`,
      `Keep a "done" log of internal work. On doubt days, the log is evidence — you're the only stakeholder but the meeting still needs minutes.`,
      `Let the new version be visible in small ways before you feel "ready" — wear the change; don't archive it for later.`,
    ],
    () => [
      `Quiet growth is real growth — just make sure the quiet isn't also hiding you from yourself.`,
      `You don't owe anyone the tour. One window is enough to keep the air fresh.`,
    ]
  ),

  // ------------------------------------------------- Disruption For Disruption's Sake
  "Disruption For Disruption's Sake": simple(
    (c) => `You'll change things just to change them — rearrange the furniture, switch jobs, start a new hobby, end a friendship — and call it "growth" even when it's just restlessness. With Uranus in ${c.sign("uranus")}, you get bored with stability and sabotage it on purpose.`,
    (c) => [
      `Uranus in ${c.sign("uranus")} treats routine as a low-grade emergency. When things run smoothly for too long, your system reads the calm as stagnation and demands a jolt.`,
      `The changes come labeled as growth, and sometimes they are. The tell: real growth survives the honeymoon; restlessness leaves wreckage and starts looking for the next switch.`,
      `You don't experience it as sabotage — you experience the itch as intolerable and the change as inevitable. The collateral only exists for other people.`,
    ],
    () => `Two good years at a job you like. Nothing's wrong. You start browsing listings "just to see," and six weeks later you've accepted an offer in a different field — and can't fully explain to your friends why, only that you felt trapped.`,
    () => [
      `You can reset your own progress to zero repeatedly — the tenth fresh start costs the compound interest the ninth would have paid.`,
      `The people who love you can't plan around the demolition schedule, so some stop investing in shared plans at all.`,
      `Restlessness lies. It tells you the problem is outside (the job, the city, the person) when it's often a thermostat that's never been checked.`,
    ],
    () => [
      `You are impossible to bore into despair. While others calcify, you keep renewing — and that keeps you younger than your age.`,
      `Your reinventions are real when they matter: you've become interesting in several fields, not one.`,
      `You'll never be the person who stayed thirty years somewhere wrong out of pure fear. The exit reflex also saves you from genuinely dead situations.`,
    ],
    () => [
      `Give the itch a legal outlet that doesn't demolish anything: a rotating side project, a new skill every quarter, a rearranged room. Small jolts satisfy the system without nuking the load-bearing walls.`,
      `Use the two-moon rule: any big change waits one full lunar cycle after the urge peaks. If the itch survives 30 days, it's real. If not, it was weather.`,
      `Audit the last three "fresh starts": what did each one actually fix, and what followed you there anyway? The pattern you find is the real renovation project.`,
    ],
    () => [
      `The electricity is yours — it just needs somewhere legal to ground.`,
      `Real freedom includes the freedom to stay. Try exercising that one sometime; it's harder and stranger than leaving.`,
    ]
  ),

  // ------------------------------------------------------------- Can't Settle Down
  "Can't Settle Down": simple(
    () => `You're always looking for the next horizon — the next country, the next degree, the next big idea. Settling feels like dying to you. You'll commit to a plan and be mentally on the next one before the first one starts.`,
    () => [
      `Jupiter in the 9th makes expansion the home base. The horizon isn't a vacation from your life; it IS your life — arrival is just the ticket to the next departure.`,
      `You don't experience restlessness as a problem to solve. You experience settling as the problem — until you notice the same hollow arriving at every destination.`,
      `The pattern has a signature: commitment triggers premature evacuation. You start mentally drafting the exit (or the next plan) around the same time the current thing gets real.`,
    ],
    () => `You finally book the big trip. Before the flight lands, you've already researched the next three destinations. You're never where you are — you're where you're going next, always.`,
    () => [
      `Depth requires dwelling somewhere past the exciting phase, and that's exactly the phase you keep exiting.`,
      `The people who love you learn their place in the queue — after the next plan, the next trip, the next obsession.`,
      `You can collect beginnings your whole life and never experience what the middle of anything has to offer.`,
    ],
    () => [
      `You are genuinely alive. Rooms, cities, and lives light up around your appetite — you're the friend people call when their own life feels small.`,
      `Your range is real: languages, ideas, places. You're the most interesting person in most compilations of your friends.`,
      `Your faith that life has more to offer is usually correct — you just need to let the current offering finish paying out first.`,
    ],
    () => [
      `Practice "finish before next": the current thing gets its harvest before the next seed goes in the ground. Book the next trip AFTER this trip's stories are told.`,
      `Find a horizon that moves with you — a long study, a craft, a deep practice. You need expansion; it doesn't have to mean relocation every time.`,
      `Try staying through the boring middle of ONE thing on purpose. The middle is where mastery lives; you've never actually met it.`,
    ],
    () => [
      `The wandering is a gift — it just owes some stays. Depth and range are both yours; you've only been collecting one.`,
      `You won't miss much by finishing something. You'll miss everything by never finishing anything.`,
    ]
  ),

  // ------------------------------------------------------------- Workaholic Identity
  "Workaholic Identity": simple(
    () => `Your identity is tied to your career. Ask "who are you?" and you'll tell them what you do. You'll skip family events for work, judge others for not grinding, and treat burnout like a badge of honor. Rest feels like laziness to you.`,
    () => [
      `Sun in the 10th fuses self-worth to public achievement. The work isn't what you do — it's who you are, which is why stopping feels like disappearing.`,
      `The metrics became the self: titles, results, recognition. Every quiet evening gets scored as lost ground.`,
      `Rest doesn't compute as refueling — it computes as an identity leak. You rest badly even when you technically take the day.`,
    ],
    () => `You're at your kid's birthday party answering a "quick" work email, then another. You're physically there, but the real you is at the office — and everyone can see it, including the person blowing out the candles.`,
    () => [
      `The people you love get the residue — whatever's left after the job takes its cut. They can do that math.`,
      `Your body will eventually present the invoice for years of overtime; bodies always collect.`,
      `You've built a self with one pillar. When the career shakes — layoffs, retirement, a bad boss — the whole identity shakes with it.`,
    ],
    () => [
      `You build things that LAST. Careers, teams, reputations — your name means something in your field, and that's rare.`,
      `You provide at a level most people never manage. The security you create around your people is real and felt.`,
      `You have standards and live by them. Nobody has to wonder whether you'll show up for the work — you always, always do.`,
    ],
    () => [
      `Schedule rest like revenue: it goes in the calendar with the same status as a client meeting, and it does not move.`,
      `Build one identity pillar with zero ROI — a hobby you're allowed to be mediocre at. The point isn't skill; it's proving you exist without output.`,
      `Once a week, ask the question in the mirror: "if the job vanished tomorrow, who's left?" Start giving that person actual airtime.`,
    ],
    () => [
      `The drive built everything you're proud of. It just doesn't get to be the ONLY thing you are.`,
      `You are a human being, not a human output. The people who love the being deserve the same hours.`,
    ]
  ),

  // ----------------------------------------------------------------- Chronic Flake
  "Chronic Flake": simple(
    (c) => `You'll say yes to plans you have no intention of attending. You genuinely meant it at the time — you just forgot, double-booked, or got a better offer. You'll text "so sorry, can we reschedule??" two hours after you were supposed to be there. You feel bad about it. Briefly. Then with ${c.sign("sun")} Sun, you do it again next week.`,
    (c) => [
      `${c.sign("sun")} Sun lives in the present tense. The plan made for next Thursday exists in a region of your mind where it's technically stored and practically vaporized.`,
      `The yes is real in the moment — the future self who has to pay for it is a stranger you keep writing checks against.`,
      `The reschedule text isn't a lie; it's the current self genuinely preferring the sofa. The problem is the OTHER person's timeline doesn't run on your upgrades.`,
    ],
    () => `Your friend booked the table for your "definitely" — you bailed at 6pm with a "rain check?" and an apology with exclamation points. Next week you propose Thursday. They hesitate. Their calendar app has a folder called "unreliable" and you're in it.`,
    () => [
      `Trust erodes in grams. Each flake is small; the pile stops being small, and people quietly stop inviting you.`,
      `You can lose the people who actually show up — they build their lives around reliable others, and you get the leftovers of their calendars.`,
      `Your own plans suffer too: half-started commitments train YOU to not believe your own word.`,
    ],
    () => [
      `You're the easiest yes in the room. People love your openness — the appetite for everything is genuinely one of your best features.`,
      `When you DO show up, you're fully there — fun, present, no dragging of the evening. You're worth the wait; there's just been a lot of wait.`,
      `You never attend anything bitter. Your presence is a real gift when it arrives.`,
    ],
    () => [
      `Stop committing in real time: "let me check Thursday and confirm" is a legal sentence. It converts fake-yes into real-maybe, and people can build on maybes.`,
      `Put everything in the calendar the moment you say yes, with an alarm. The flake is usually a memory bug, not a character flaw — patch the bug.`,
      `Adopt the flake tax: every time you cancel inside 12 hours, the next invitation is a MUST-attend. Self-enforced, no exceptions.`,
    ],
    () => [
      `Your word is the currency. Right now it's inflated — tighten the supply and people will trust you like they used to.`,
      `Being fun isn't enough if you're never there. Reliability is the least glamorous superpower and the one everyone remembers.`,
    ]
  ),

  // ------------------------------------------------------- Refuses To Try New Things
  "Refuses To Try New Things": simple(
    () => `You'll refuse to try the new restaurant because the old one is "fine." You take 3 business days to reply to a text and act like it's normal. You have strong opinions about how the dishwasher should be loaded, and you are correct. Good luck moving you off any position you've taken.`,
    () => [
      `Sun in Taurus runs on proven. The known thing works, costs nothing, and carries zero risk of disappointment — which makes "fine" a legitimate verdict in your system.`,
      `The slowness isn't disrespect — your processing runs at geological speed on purpose. You answer when the answer is finished, not when the question arrives.`,
      `Change isn't exciting to you; it's expensive. Every new thing must beat the incumbent in your internal court, and the incumbent has seniority.`,
    ],
    () => `Friends want to try the new spot. You say "the usual place is right there" for the fourth time. Eventually they stop asking — and you're genuinely confused when you find out they've been trying new places without you for months.`,
    () => [
      `The world changes around the immovable. You can wake up one year and find the culture, the tech, and your friends' lives two versions ahead.`,
      `Relationships feel the friction: every suggestion becomes a negotiation against a fortress, so people stop suggesting.`,
      `"Fine" quietly becomes the ceiling. The good-enough life you defended keeps being good enough, and nothing ever gets to be great.`,
    ],
    () => [
      `Your loyalty to what works makes you the most reliable person in every room. When you commit, it's for decades.`,
      `You actually enjoy things. The known pleasure, fully savored, is a lost art — you never rush a good meal or a good evening.`,
      `Your standards are load-bearing. The people around you benefit from a benchmark in a world of chaos.`,
    ],
    () => [
      `Run the one-new-thing protocol: one new restaurant, route, or activity per week. Tiny, scheduled, non-negotiable. You're not changing who you are — you're collecting data.`,
      `When someone suggests something, the default answer is "yes, when?" — the fortress answer "no" only loads if the new thing actually fails.`,
      `Reply to one text per day immediately, before the processing lag hits. The three-day reply habit costs more than the effort of the instant one.`,
    ],
    () => [
      `Steady is your brand — just make sure it's a garden, not a museum. Gardens grow.`,
      `The new thing won't kill you. You'd know, because you've checked every possible way it could, twice.`,
    ]
  ),

  // --------------------------------------------- Makes Everything About Themselves
  "Makes Everything About Themselves": simple(
    () => `You'll make someone else's breakup about how it affects you. You genuinely don't realize you're doing it — you just assume the spotlight is shared. You'll also post the story before checking if they're okay with it. It's not narcissism, it's just how you're wired — but it's exhausting to be around.`,
    () => [
      `Sun in Leo orbits its own gravity out of design, not malice. Every story that enters your radius gets related back to your experience automatically — the reflex runs before ethics wake up.`,
      `The sharing instinct treats big events as communal property: of COURSE you told the group about their news — it was exciting, and excitement is meant to be broadcast.`,
      `You never notice the takeover, because from inside there's nothing to notice. The blind spot is total; only the aftermath (people drifting) ever signals.`,
    ],
    () => `Your best friend tells you they got fired. Ninety seconds later you're comforting THEM about how hard this is for YOU to watch. By minute five you're telling the story of your own layoff in 2021. They leave the conversation less supported than they arrived.`,
    () => [
      `People start rationing their news with you — the big moments go to others first, and you get the press release later.`,
      `The friendships that survive are the ones with people who don't need much mirroring. That filters out a lot of deep connections.`,
      `You miss the actual person in front of you — their moment, their feelings — because your own reactions keep photobombing.`,
    ],
    () => [
      `Your warmth is genuine and enormous. People feel lit up in your attention — when the spotlight DOES land on them, it's the best light there is.`,
      `You bring generosity and energy nobody matches. Your celebrations of your people, when you remember to center them, are legendary.`,
      `You take up space unapologetically — which quietly gives other people permission to do the same.`,
    ],
    () => [
      `Adopt the 5-minute rule: when someone brings news, the first five minutes are 100% theirs — questions about THEIR experience, zero references to yours. The urge to relate can wait; it's not going anywhere.`,
      `Before sharing anyone's story, ask: "you good with me sending that?" Four words, and it buys you back all the trust the broadcasting spent.`,
      `Practice the follow-up question as a discipline: after anything you say about yourself, end with "— enough about me, what about you?" and MEAN the second half.`,
    ],
    () => [
      `The sun is at its best when it warms others, not just when it shines. Same power, better aim.`,
      `Making space for someone else's story won't shrink you. There's enough stage.`,
    ]
  ),

  // ------------------------------------------------------- Silently Judges Your Life
  "Silently Judges Your Life": simple(
    () => `You're mentally noting every life choice your people make and "helpfully" pointing out the ones that could be improved. You'll send a 4-paragraph text about why their morning routine is suboptimal. You think you're being supportive; they feel like they're being audited. You mean well. It still sucks.`,
    () => [
      `Sun in Virgo processes love through improvement. Noticing the flaw IS the attention — in your operating system, effort spent fixing someone is effort spent caring.`,
      `The observations are constant and automatic. You can't not see the suboptimal — the same eye that finds your own faults finds everyone's.`,
      `The delivery misses the mark: your notes arrive unsolicited, in detail, and with an accuracy that makes them impossible to laugh off.`,
    ],
    () => `Your friend mentions the new business idea once. You send a 4-point analysis of the risks that evening, with examples. You feel like a good friend. They read it as "you think I'm going to fail" and don't mention the business again for a year.`,
    () => [
      `People stop sharing dreams with you. The audit receipt you send with each one teaches them to keep the good stuff away from your desk.`,
      `Your love reads as conditional acceptance: "I like you AND here's what's wrong with you." Nobody feels fully embraced.`,
      `You're running the same audit on yourself all day too — the cruelty you distribute is the same dosage you take internally.`,
    ],
    () => [
      `You're the person people call when something needs to be DONE right. Your competence is trusted because your standards are real.`,
      `Nobody ever has to wonder if you're paying attention. Your noticing is a form of deep investment.`,
      `When it actually matters — health, money, real risk — your early warnings have saved your people more than once.`,
    ],
    () => [
      `Adopt the "ask first" protocol: "want a full breakdown or just support?" — then obey the answer completely. Four seconds; it changes everything.`,
      `Ration the improvement notes: one per person per month, max, and only the important ones. The rest stay in your head where they were born.`,
      `Practice pure witnessing: once a week, respond to someone's news with ONLY interest and zero notes. Notice they tell you more the next time.`,
    ],
    () => [
      `The sharp eye is a gift; the unsolicited shipping is the leak. Aim it where it's hired.`,
      `People remember how you made them feel about their dreams. Be the door, not the gatekeeper.`,
    ]
  ),

  // ------------------------------------- Responds To Feelings With A Status Update
  "Responds To Feelings With A Status Update": simple(
    () => `When someone asks "how are you feeling?" you'll tell them about your career. You have never spontaneously done anything in your life. You'll judge others for taking a day off and call it "concern." Vulnerability is not in your vocabulary — productivity is.`,
    () => [
      `Sun in Capricorn answers emotional questions in professional currency. Feelings get translated to status, progress, and plans — the language your system trusts.`,
      `The overtake is total: work didn't just become important, it became the self. Every hour of rest is benchmarked against what it could have produced.`,
      `You judge others' rest as "concern" because their ease genuinely threatens your operating thesis — that everything must be earned through output.`,
    ],
    () => `A friend, clearly struggling, tells you they're "just tired lately." You respond with a productivity podcast recommendation and a question about their five-year plan. They change the subject. You notice they call less now, and can't figure out why.`,
    () => [
      `The people who need presence get performance reviews instead. The loneliest thing about you is also the most impressive thing about you.`,
      `Your own feelings get deferred so long they lose their native language — you genuinely can't answer "how do you feel" without a status update.`,
      `Burnout is inevitable on this operating system: the machine treats maintenance as optional until it physically can't.`,
    ],
    () => [
      `You are the most reliable person anyone knows. When everything collapses, you're the one still standing with a plan.`,
      `Your standards built real security for your people. The shelter you provide is physical, actual, and unmatched.`,
      `You respect effort wherever you see it. Nobody gets more genuinely earned praise than yours.`,
    ],
    () => [
      `Learn the two-answer format: when asked how you feel, give one feeling word, THEN the status update. "Anxious — also, work's fine." The order matters more than you think.`,
      `Schedule one unproductive block per week — no goals, no metrics, no "recovery optimization." Just time. The discomfort you feel IS the workout.`,
      `When someone shares a feeling, ban advice for the first five minutes. Questions only: "that sounds heavy — what's it been like?"`,
    ],
    () => [
      `The mountain got built. It's allowed to have a garden now.`,
      `Your worth was never actually pegged to output — that was the deal you signed, not the one reality offered.`,
    ]
  ),

  // --------------------------------------------------- Disappears Into New Interest
  "Disappears Into New Interest": simple(
    () => `You'll vanish into a new hyperfixation for two weeks and forget everyone exists. You have strong opinions about things you learned ten minutes ago. You're emotionally available in theory, less so in practice. When you finally come back up for air, you'll act like nothing happened.`,
    () => [
      `Sun in Aquarius locks onto ideas with total absorption. When the new system, project, or interest takes over, the social layer simply gets deprioritized — not rejected, just paused without notice.`,
      `The strong opinions aren't arrogance — two days in, you've genuinely read more on the topic than most people ever will. The confidence is earned at your speed, which nobody else can see.`,
      `You assume the people who care about you understand the cycles. They don't — they experience each disappearance as fresh evidence of their low priority.`,
    ],
    () => `A friend texts Tuesday. You see it, think "reply tonight," and surface eleven days later having built an entire home automation system. You reply "sorry, deep in a project!!" with three exclamation points, as if eleven days were a lunch break.`,
    () => [
      `The disappearances teach people not to rely on you — the warmth is real but the availability is vaporware.`,
      `You miss real events in people's lives: the hard weeks, the wins, the moments that needed you there.`,
      `The loop costs you too — you return from every immersion to relationships that cooled, and the repair effort compounds.`,
    ],
    () => [
      `Your focus is a superpower. The things you build in those two weeks would take other people a year.`,
      `You're never boring. New knowledge, new systems, new angles — conversations with you never run on rails.`,
      `Your independence is total. Nobody has to entertain you, manage you, or orbit you for you to function.`,
    ],
    () => [
      `Set a relationship heartbeat: one message or call per day DURING the immersion — two minutes, non-negotiable. It's the maintenance dose that keeps the bonds alive.`,
      `Before vanishing, announce it: "going dark into a project, back in ~2 weeks, text me anything." The notice converts disappearance into something people can live with.`,
      `On resurfacing, ask about THEIR two weeks first — before the project tour. The order of that first conversation tells people exactly where they rank.`,
    ],
    () => [
      `The mind is free to roam — it just can't take the hostages with it.`,
      `A two-minute text costs nothing and saves everything. Set the timer.`,
    ]
  ),

  // ------------------------------------------------------------ Yes-To-Everything Flake
  "Yes-To-Everything Flake": simple(
    () => `You'll say yes to plans you have no intention of attending, then disappear into your room for three days and call it "recharging." You absorb everyone's bad mood and then blame them for ruining yours. You genuinely meant to show up — you just couldn't, and you feel terrible about it, and you'll do it again.`,
    () => [
      `Sun in Pisces says yes at the soul level and pays at the body level. In the moment, the plan feels like connection; on the day, it feels like a tax your system refuses to pay.`,
      `The absorption you don't manage makes socializing expensive — you arrive home from ordinary events carrying the whole room's weather.`,
      `The blame-shifting is real: your saturation has to land somewhere, and the people who filled you up catch it as "your energy drained me."`,
    ],
    () => `You said yes to the birthday dinner a week ago. The day arrives and your social battery is at zero — you cancel "something came up," feel genuine guilt, and spend the evening on the couch feeling the party's vibe from across town through sheer guilt.`,
    () => [
      `The cancel pattern trains people to plan without you — invitations thin out, then stop, and the isolation deepens the very thing causing it.`,
      `Your moods get externalized: everyone around you learns to check which version of you arrived, and to brace.`,
      `The guilt-cancel-guilt loop is genuinely corrosive to self-trust — you stop believing your own commitments, so the commitments stop meaning anything.`,
    ],
    () => [
      `Your empathy at the event itself is magic — when you DO arrive, you're the person everyone remembers the next day.`,
      `You feel everything honestly. There's no performance in your warmth; people trust the realness even when they can't count on the calendar.`,
      `Your imagination and inner world never switch off — you're never actually boring, even when you're absent.`,
    ],
    () => [
      `Check the battery BEFORE saying yes: "sounds great — let me confirm on the day" is honest. Better: decide in the moment with a body check, not a soul check.`,
      `Pre-schedule recovery: say yes AND plan the next day as empty. Committing WITH the refuel built in makes the yes survivable.`,
      `Own the weather: when you're saturated, name it — "I'm soaked from the week, I'll be quiet company tonight" — instead of leaking it as blame.`,
    ],
    () => [
      `The softness is real; the accounting is broken. Fix the ledger and people get both the warmth and the presence.`,
      `One honest "I need to stay in tonight" beats five fake yeses. The first one protects everyone.`,
    ]
  ),

  // --------------------------------------------------------------- Drive Runs Quiet
  "Drive Runs Quiet": simple(
    () => `Your ambition is real but invisible. You'll be working on something huge for six months and not mention it once. People underestimate you for a year, then wonder how you lapped everyone. You don't need the spotlight — you need to be left alone, and you'll get there eventually.`,
    () => [
      `Mars retrograde turns the drive inward — the energy that others spend on visibility, you spend on the actual work. The scoreboard is private until it isn't.`,
      `Talking about a thing feels like losing it — attention pre-spends the momentum. You show results, not process, and only when they're undeniable.`,
      `The quiet isn't shyness. It's efficiency: why narrate what the outcome will announce?`,
    ],
    () => `Colleagues assume you're coasting — you never speak up in the showcase meetings, never mention the side project. Eighteen months later your thing ships and it's genuinely excellent. The room recalibrates. You'd already moved on to the next quiet thing.`,
    () => [
      `Undervaluation compounds: promotions, opportunities, and credit flow to the visible, and you keep declining to be visible.`,
      `The people who'd champion you don't know there's a cause. Your silence withholds from allies, not just skeptics.`,
      `Working alone works — until the season where it doesn't, and you've trained nobody to be there when you need hands.`,
    ],
    () => [
      `Your work speaks with a voice that never needs volume. The finished thing argues better than any pitch.`,
      `You're immune to hype cycles. While others chase trends, you compound — quietly, and then all at once.`,
      `Your independence is armor: no validation required, no audience withdrawal to fear. The engine is self-contained.`,
    ],
    () => [
      `Install a visibility minimum: one share per month — a post, a demo, a tell-one-person. Not for ego; for the allies who need to know the work exists.`,
      `Recruit one loud friend: give them permission to brag about you. Some engines need a megaphone they didn't buy for themselves.`,
      `Track your own output quarterly, in writing. The quiet drive needs its own scoreboard, or the underestimation leaks inward.`,
    ],
    () => [
      `Quiet isn't absent. Let the world hear the hum sometimes — the right people are listening for it.`,
      `You'll get there either way. The visibility is just about arriving with company.`,
    ]
  ),

  // ----------------------------------------------------------------- Comfort Zone CEO
  "Comfort Zone CEO": simple(
    (c) => `You treat your routine like a religion. You'll resist any plan that disrupts your schedule, and "spontaneous" is not in your vocabulary. The upside: you're reliable. The downside: you're predictable, and you will judge people for being less organized than you. With ${c.elementCount("earth")} earth placements, the structure is bedrock.`,
    (c) => [
      `${c.elementCount("earth")} earth placements build a life on rails: same systems, same order, same results. The rails are why everything works — and why everything is the same.`,
      `You experience disruption as inefficiency — with ${c.elementCount("earth")} earth placements, others' spontaneity looks like chaos with extra steps while your schedule looks like civilization.`,
      `The judgment is real and quiet: with ${c.elementCount("earth")} earth placements you've decided the organized way is the right way, and everyone running on vibes is doing life wrong. You keep it mostly to yourself. Mostly.`,
    ],
    (c) => `Friends propose a spontaneous weekend trip leaving in four hours. You say no — laundry day, gym schedule, the meal prep is done. They go. The photos come back and everyone looks deliriously happy, and you feel something you refuse to call regret. (That's the ${c.elementCount("earth")}-placement rails talking.)`,
    (c) => [
      `Life narrows to the planned corridor. With ${c.elementCount("earth")} earth placements, the experiences that only happen off-schedule keep happening to other people.`,
      `People stop offering spontaneity, and the relationship variety dies with it — a ${c.elementCount("earth")}-placement calendar fills with identical Tuesdays.`,
      `The rails can't handle the big shakes — illness, loss, upheaval — because a ${c.elementCount("earth")}-earth stability strategy assumed rails.`,
    ],
    (c) => [
      `You are the most reliable human in every room. ${c.elementCount("earth")} earth placements make your word a calendar event that never moves.`,
      `Your systems produce peace. Bills paid, house ordered, body maintained — the ${c.elementCount("earth")}-placement machinery eliminated 90% of the chaos most people swim in.`,
      `The people near you quietly benefit from your structure — the ${c.elementCount("earth")}-placement one who has the ladder, the spare battery, and the plan.`,
    ],
    (c) => [
      `Schedule the unscheduled: one spontaneous block per week where the plan is "no plan." paradoxically, put it in the calendar — that's how a ${c.elementCount("earth")}-earth system accepts it.`,
      `Say yes to the small version: you don't need the 4-hour trip; take the 40-minute detour. Reps of flexibility build the muscle the ${c.elementCount("earth")}-placement rails never use.`,
      `Retire one judgment per week: when the "why are they so disorganized" thought fires — and with ${c.elementCount("earth")} earth placements it fires a lot — replace it with "their system, their life." It's a practice, not a switch.`,
    ],
    (c) => [
      `The structure is a genuine gift — just leave one gate in the fence, on purpose. ${c.elementCount("earth")} earth placements won't mind one gate.`,
      `The best days of your life will mostly be typos in the ${c.elementCount("earth")}-placement schedule. Allow a few typos.`,
    ]
  ),

  // ------------------------------------------------------- Impulse Buyer, Impulse Liver
  "Impulse Buyer, Impulse Liver": simple(
    (c) => `You make every decision in 0.5 seconds and reverse half of them by morning. You'll book a flight to another continent on a Tuesday. Your credit card statement is a personality trait, and your impulse control is genuinely concerning. With ${c.elementCount("fire")} fire placements, the spark becomes the decision.`,
    (c) => [
      `${c.elementCount("fire")} fire placements run desire-to-action as a single step. The want arrives and the doing starts before the "should" department has even been cc'd.`,
      `The purchases, the bookings, the messages sent at full speed — each one feels completely right IN the moment. The morning-after self is a different committee reviewing a different era.`,
      `You don't experience this as recklessness. You experience deliberation as death — the spark dies in committee, so you skip the committee.`,
    ],
    (c) => `It's Tuesday. You see a flight deal, and by Wednesday you've booked it, told six people, and bought hiking boots for a trail you researched for nine minutes. The trip is great. The credit card statement in three weeks is not. (${c.elementCount("fire")} fire placements, zero hesitation.)`,
    (c) => [
      `The financial leak is real: death by a thousand small sparks plus a few enormous ones. The statement is the receipts of every 0.5-second decision your ${c.elementCount("fire")}-placement chart ever made.`,
      `Reputation whiplash: the people around you can't tell which of your announcements are real plans and which are Tuesday's weather.`,
      `The reversals teach you to distrust your own enthusiasm, which poisons even the good impulses.`,
    ],
    (c) => [
      `You are alive in a way planners never are. The Tuesday flight produces the story everyone else tells at dinner.`,
      `Your courage is reflexive — opportunities that require instant movement belong to a ${c.elementCount("fire")}-placement chart. Others are still "thinking about it" while you're already there.`,
      `The enthusiasm is infectious. Rooms heat up when you arrive with the new thing.`,
    ],
    (c) => [
      `Use the 72-hour ledger for anything over a set amount: write it down, wait three days, buy it only if the want survives. Most don't — and the ones that do were always real.`,
      `Keep one "impulse budget" — a monthly amount that's legally allowed to burn on sparks. The rest of the money gets a mandatory 72-hour delay, even with ${c.elementCount("fire")} fire placements arguing otherwise.`,
      `Before announcing plans, wait one news cycle. Announcing locks you in; waiting lets the real ones and the weather ones sort themselves out.`,
    ],
    () => [
      `The fire is the gift — it just needs a hearth instead of a house fire.`,
      `Three days won't kill the dream. It kills only the duds.`,
    ]
  ),

  // -------------------------------------- Can't Watch The News Without Spiraling
  "Can't Watch The News Without Spiraling": simple(
    (c) => `You can't watch the news without spiraling, and a sad look from a stranger can ruin your afternoon. You need decompression time after parties. Your sensitivity is real and not optional — you can't "just not let it get to you," and telling you to toughen up will backfire. With ${c.elementCount("water")} water placements, the feelings come in at full volume.`,
    (c) => [
      `${c.elementCount("water")} water placements receive everything — other people's moods, the news, the tone of a text — with no native volume knob.`,
      `The absorption is automatic and physical: your body responds to a stranger's grief like it's your own assignment.`,
      `The exhaustion after people isn't antisocialness. It's drainage — you carried a room's worth of feeling and now have to put it all down somewhere.`,
    ],
    (c) => `One heavy news story at breakfast and the whole day carries its weight. You cancel the evening plans because you're "tired" — really you're full, and there's nowhere to put what you're carrying. That's what ${c.elementCount("water")} water placements absorbs before lunch.`,
    (c) => [
      `The sponge has no wringing schedule — ${c.elementCount("water")} water placements accumulate feelings until they leak out as irritability, tears, or sudden shutdown.`,
      `You can get manipulated through pure guilt and distress. Anyone who knows the lever can move you.`,
      `Chronic overload mimics depression: flat, tired, dreading input — when it's actually saturation with no drain.`,
    ],
    (c) => [
      `You feel the world at a depth most people numb out of — ${c.elementCount("water")} water placements' worth of depth. Your presence makes hurting people feel genuinely held.`,
      `Your instincts about people are near-perfect — you read the unsaid thing in the room every time.`,
      `Your care has no performance in it. When you show up for someone, they can tell it's the whole of you.`,
    ],
    (c) => [
      `Build the daily drain: alone time, water, movement, or tears — something that empties the tank on schedule. Saturation without drainage is the whole problem.`,
      `Ration the inputs: news once a day, on purpose, never first thing or last thing. With ${c.elementCount("water")} water placements you're running an open port in a loud world — the schedule is the firewall.`,
      `After heavy socializing, book the decompression BEFORE you need it: the quiet morning after is not laziness, it's maintenance.`,
    ],
    () => [
      `The volume knob isn't coming — the drain is the fix. Build it and the sensitivity stays a gift.`,
      `You were never "too sensitive." You were under-maintained for how much you actually carry.`,
    ]
  ),

  // -------------------------------------------------------------- Brain Never Closes
  "Brain Never Closes": simple(
    (c) => `Your brain runs 6 tabs at all times. You'll fall down a Wikipedia rabbit hole at 3am and wonder where the night went. You're great in conversation but bad at feeling your feelings — you think them instead, which means you take twice as long to actually process anything emotional. With ${c.elementCount("air")} air placements, the mind is the main room.`,
    (c) => [
      `${c.elementCount("air")} air placements make the mind the primary residence. Everything — including feelings — gets routed through analysis, translation, and commentary.`,
      `The tabs don't close on command. Sleep, conversations, feelings — all compete with the six open loops, and the loops usually win.`,
      `Processing feelings through thought doubles the timeline: the emotion has to be understood before it's allowed to be felt, and understanding takes you a while.`,
    ],
    (c) => `It's 3:17am. You started with a video about bridges and you're now reading about medieval tax policy, fully awake, tomorrow's energy already mortgaged. The six other tabs of your life — including the feelings one — are still open in the background. (${c.elementCount("air")} air placements run like this.)`,
    (c) => [
      `Sleep debt compounds: the never-closing ${c.elementCount("air")}-placement mind borrows from the body nightly and never repays.`,
      `The emotional delay means your people experience you as processing them, not being with them — presence takes the long route.`,
      `The tabs include worries; the mind doesn't distinguish useful loops from anxious ones. Everything spins at the same speed.`,
    ],
    (c) => [
      `Your mind is genuinely fun. Conversations with you go places nobody else's do — you're the person people think of when something interesting happens.`,
      `You connect ideas across fields. The ${c.elementCount("air")}-placement synthesis you do casually is what other people write books trying to do.`,
      `Your curiosity never ages. You will be interesting at 80, guaranteed.`,
    ],
    (c) => [
      `Build the shutdown ritual: screens off, one paper notebook, "park" the open loops by writing them down — the mind lets go when the tabs are saved somewhere it trusts.`,
      `Body-first processing for feelings: before analyzing a feeling, locate it physically — chest, gut, throat — and stay there 90 seconds. Analysis AFTER sensation, not instead of it.`,
      `Sleep window rules: the rabbit holes are fine at 3pm. After 11pm, the ${c.elementCount("air")}-placement curiosity is stealing from tomorrow — pick one tab and close the browser.`,
    ],
    () => [
      `The six tabs are a gift with a sleep tax. Bank the mind's best hours and it becomes pure advantage.`,
      `You don't need fewer thoughts. You need a filing cabinet and a bedtime.`,
    ]
  ),

  // ----------------------------------------------------- Suspiciously Well-Adjusted
  "Suspiciously Well-Adjusted": simple(
    () => `Your chart doesn't trigger any of the usual red flags. Either you're genuinely balanced, or you're so chaotic that the algorithm gave up. We're watching you. (Lovingly.)`,
    () => [
      `No single placement is screaming — your chart's tension is distributed, not concentrated. That usually means the friction is real but spread thin across many small leaks instead of one fire.`,
      `Balanced charts hide their cost differently: instead of one loud pattern, there's a quiet hum — restlessness, vague dissatisfaction, the sense of untapped something.`,
      `The absence of drama can also mean absence of engagement: nothing pressing enough to flag is also nothing pulling hard enough to define.`,
    ],
    () => `Friends compare their chaotic charts and trade their red flags like trophies. Yours reads... quiet. You're not sure if you won or if the test ran out of vocabulary for you.`,
    () => [
      `The quiet chart can drift — without a loud inner conflict forcing the question, "what do I actually want" goes unanswered for years.`,
      `Balanced people get underestimated: the assumption is that nothing interesting is happening because nothing is on fire.`,
      `The distributed tension still exists — it just needs to be found on purpose instead of found by crisis.`,
    ],
    () => [
      `Nothing about you needs fixing — that's not a flaw of this reading, that's the finding. The stability is real and rarer than you think.`,
      `You get to choose your growth edges instead of being assigned them. Most people spend decades working on what their chart forced; you get to pick.`,
      `Your steadiness is the thing people remember about being around you. It's load-bearing for others.`,
    ],
    () => [
      `Pick a direction on purpose — the chart gives you no excuse, which is both the freedom and the assignment.`,
      `Ask the people who love you what pattern THEY see. The flag the algorithm missed, the humans usually caught.`,
    ],
    () => [
      `No red flags isn't no material. It's uncut material — same person, more choice about the shape.`,
      `The watching continues. (Lovingly.)`,
    ]
  ),

  // ----------------------------------------------------------------- Friction-Heavy Chart
  "Friction-Heavy Chart": simple(
    (c) => `Your chart has ${c.tense} tense aspects and only ${c.harmonious} harmonious ones. Things don't come easy — the friction is built in. This makes you real, gritty, and self-aware in ways that people with easy charts never need to be. It also means you'll work harder for the same results. Not broken — just wired for growth through conflict.`,
    () => [
      `Tense aspects are internal engines with no idle setting. Every area they touch runs on pushing — which produces drive, and produces wear.`,
      `You don't get free wins. What others receive, you negotiate for — which is why your victories feel earned and theirs sometimes look effortless.`,
      `The friction is constant, not episodic. Your baseline includes a background hum of resistance that easy-chart people genuinely don't have.`,
    ],
    () => `You watch someone with an easy chart get handed the thing you've been grinding toward for two years. They're not bad people. It just landed in their lap. You take a breath, remind yourself what the grinding built in you, and keep going.`,
    () => [
      `The constant resistance can tip into hopelessness — when everything is effort, the mind starts asking whether anything is worth it.`,
      `Relationships carry the friction too: you can bring fight-or-flight energy into rooms that were actually fine.`,
      `Rest feels undeserved, because your system only knows the earning state. Recovery becomes another hill.`,
    ],
    () => [
      `You are unbreakable in the specific way that only resistance builds. Things that end other people barely register as setbacks for you.`,
      `Your self-awareness is years deeper than easy-chart people's. The friction forces the questions earlier and harder.`,
      `When you actually master something, it's mastered FOR LIFE — nothing you learned came cheap enough to lose.`,
    ],
    () => [
      `Track the wins explicitly: your chart discounts them automatically. A written record of what the grinding produced is fuel, not vanity.`,
      `Schedule rest with the same seriousness as the work — recovery isn't a detour from your path; it's a segment of it.`,
      `Find the others: easy-chart allies who lend their ease, and friction-chart friends who get it without explanation. Both matter.`,
    ],
    () => [
      `The hard way is still a way. You're not behind — you're just being built while you travel.`,
      `One day the friction becomes your authority. Most people's certainty was never tested; yours is forged.`,
    ]
  ),

  // =========================================================================
  // GREEN FLAGS
  // =========================================================================

  // ------------------------------------------------------------- Emotionally Safe
  "Emotionally Safe": simple(
    (c) => `You actually know what you're feeling and can tell people about it. You make people feel comfortable without trying, and your home is genuinely a sanctuary. When the world is on fire, people go to you — you'll have snacks and a plan. With Moon in ${c.sign("moon")}, the safety isn't performed; it's manufactured.`,
    (c) => [
      `Moon in ${c.sign("moon")} keeps the emotional floor solid. People can set heavy things down near you without bracing for a reaction.`,
      `Your home reflects the placement: soft, fed, warm. It's not decor — it's your instincts about what safety is made of, expressed as furniture.`,
      `You don't flare, don't punish, don't keep score. That's why people test truths out loud around you before they can say them anywhere else.`,
    ],
    () => `A friend shows up at your door mid-crisis, barely talking. Two hours later they're on your couch with tea and a blanket, finally saying the real thing. They don't even know what changed. You never asked them to change it.`,
    () => [
      `Even your steadiness has a shadow: people can lean TOO hard, and you'll absorb it long past fair.`,
      `The safe harbor attracts people in perpetual storm — you can end up staffed as everyone's emergency services.`,
      `Being the calm one can mean your own hard days get less airtime than everyone else's easy ones.`,
    ],
    () => [
      `You are the person people mean when they say "a safe person." That's a rarer thing than being exciting.`,
      `Your consistency compounds — decade-long friendships, partners who still feel held at year ten. You build the things that last.`,
      `You know what you feel and say it plainly. Half the world's conflicts would dissolve at your level of emotional literacy.`,
    ],
    () => [
      `Guard the harbor: it's okay to have visiting hours. Safe people are allowed to be unavailable sometimes.`,
      `Ask for the sofa sometimes. The people you hold would genuinely love to hold you back.`,
    ],
    () => [
      `The steadiness is a genuine gift — one of the few that makes every life it touches better.`,
      `Keep being the place people can land. Just make sure somewhere in your life, you have one too.`,
    ]
  ),

  // ----------------------------------------------------------------- Loyal Lover
  "Loyal Lover": simple(
    (c) => `When you're in, you're in. You'll remember their favorite snack, their mom's birthday, and the song that was playing the first time you held hands. You show up consistently, not just when it's convenient — and that consistency is rarer than it sounds. Venus in ${c.sign("venus")} builds love out of proof.`,
    (c) => [
      `Venus in ${c.sign("venus")} loves in specifics. Not "I love you" as a mood — "I remembered" as a practice, repeated until it becomes a life.`,
      `Your loyalty isn't a promise you made once; it's a choice you keep making visibly. The person you love never has to audit the relationship for temperature.`,
      `You show love in maintenance: the practical check-ins, the remembered dates, the favorite thing quietly acquired. It's not flashy — it's structural.`,
    ],
    () => `They mention offhand, once, in a store, that they loved a discontinued candy from childhood. Three months later it appears in their bag — you found a supplier. They look at you differently after that. That's your whole method.`,
    () => [
      `Your constancy can be taken for granted — partners can forget that being reliably loved is extraordinary, because you make it look easy.`,
      `You can stay loyal past the expiry date, honoring a bond long after it stopped being honored back.`,
      `Loving this way means giving a lot of evidence. If someone needs drama to feel love, your steadiness gets misread as flatness.`,
    ],
    () => [
      `You are the answer to "where have all the committed people gone." People describe relationships with you as the calmest love of their life.`,
      `Your memory for the people you love is a form of devotion most people never receive.`,
      `When you choose someone, the choosing is visible in a hundred small proofs. Nobody has to guess.`,
    ],
    () => [
      `Say the worth out loud sometimes: "this is how I love, and it's not the default." Let them know what they're holding.`,
      `Match your loyalty to reciprocal loyalty. You deserve someone who remembers YOUR things too.`,
    ],
    () => [
      `Steady love is the rarest kind. Never let anyone make you feel boring for being certain.`,
      `The proofs you keep giving? They become the story people tell at your retirement party. Keep going.`,
    ]
  ),

  // -------------------------------------------------------- Internally Consistent
  "Internally Consistent": simple(
    (c) => `Your inner self and outer self actually match. What you see is what you get. No constant inner tension between who you are and who you pretend to be — with Sun and Moon both in ${c.element("sun")} signs, you're aligned, and it makes you stable in a way that's hard to fake.`,
    () => [
      `Sun and Moon in the same element means the core self and the emotional system speak the same language. What you want and what you need pull the same direction — most people spend their lives mediating between those two.`,
      `The alignment shows up as low overhead: no energy spent maintaining a performance, no 2am self-audits about the gap.`,
      `People read you as "the same person everywhere" — at work, at home, at 2am. That's rarer than you probably realize.`,
    ],
    () => `Someone meets you at a funeral, then at a party, then working a crisis. Same person all three times. Eventually someone says it out loud: "you're exactly who you say you are." You blink — isn't everyone?`,
    () => [
      `The one cost of transparency: people know exactly how to reach you, including the ones you'd rather not.`,
      `You can be slower to adapt personas for rooms that want someone you're not — some doors open slower for the authentic version.`,
      `Consistency can read as predictability to people who confuse drama with depth.`,
    ],
    () => [
      `Your stability is contagious. Chaotic people regulate around you without knowing why.`,
      `You never have imposter fatigue — the self doing the living and the self doing the telling are the same one. That's a superpower most people never get.`,
      `Trust arrives fast and stays. Being known doesn't cost you anything, because there's no hidden version to protect.`,
    ],
    () => [
      `Protect the alignment: the world will offer you performative upgrades. They cost more than they pay.`,
      `Use the clarity in conflicts — you can say "here is exactly where I am" and be believed. That's leverage for honesty.`,
    ],
    () => [
      `Same inside and out — it's the most boring-looking superpower and one of the strongest.`,
      `Keep it. The people who love the real version are the only ones that count anyway.`,
    ]
  ),

  // ----------------------------------------------------------------- Reliable AF
  "Reliable AF": simple(
    (c) => `When you say you'll do something, you do it. You show up on time, you follow through, and you don't flake. In a world full of "sorry I forgot" texts, you're the one who actually remembered — and that's worth more than people give it credit for. Saturn in ${c.sign("saturn")} makes your word a contract.`,
    (c) => [
      `Saturn in ${c.sign("saturn")} binds commitment to identity. Breaking your word isn't an inconvenience to you — it's a small structural collapse, so it basically doesn't happen.`,
      `You budget promises like money. You don't say yes to what you can't deliver, which is why your yes is trusted at full value.`,
      `The reliability runs on standards you hold privately. Nobody supervises you; the auditor is internal and never sleeps.`,
    ],
    () => `Moving day. Half the invited friends cancel by 9am. You're there at 8:45 with the truck loaded and a spare tape gun. Three years later, when someone describes you to a stranger, this exact story is what they tell.`,
    () => [
      `The same standard applies to everyone — including people who'd never hold it for you. You get quietly disappointed a lot.`,
      `Reliable people get assigned more weight than they should carry, because the load always lands somewhere stable.`,
      `Your self-worth can get welded to the delivery record. One missed commitment can eat you alive from inside.`,
    ],
    () => [
      `You are the load-bearing person in every group, family, and team you're part of. Things stand because you stand.`,
      `Your trustworthiness compounds — people bring you the big things of their lives because you've never dropped a small one.`,
      `You've built a reputation most people spend careers failing to earn, and you did it by just... being what you said.`,
    ],
    () => [
      `Charge appropriately: reliability is a premium service. It's okay to decline the jobs that would make you fake your own standard.`,
      `Let people reciprocate sometimes. Being the strong one is a role, not a species.`,
    ],
    () => [
      `Your word is worth more than most people's contracts. Keep it that way by never spending it cheap.`,
      `The world runs on people like you. It should say thank you more.`,
    ]
  ),

  // ------------------------------------------------------------- Disciplined Drive
  "Disciplined Drive": simple(
    (c) => `Your ambition is real, focused, and patient. You don't burn out — you outlast. You'll quietly work on something for five years and then suddenly everyone knows your name. The patience is genuinely intimidating. Mars in ${c.sign("mars")} runs a marathon the sprinters never see coming.`,
    (c) => [
      `Mars in ${c.sign("mars")} spends energy like an investor, not a gambler. Every effort is placed, tracked, and compounded — no flare, no waste.`,
      `Your discipline isn't white-knuckle willpower; it's architecture. The habits are load-bearing walls, so motivation isn't required for the building to stand.`,
      `You measure progress in years, which makes you immune to the weekly noise that resets everyone else to zero.`,
    ],
    () => `January five years ago you started the certification nobody noticed. This month you passed the final one, and the promotion announcement has your name on it. People ask how it happened so fast. You started answering honestly once, saw their faces, and switched to "just kept at it."`,
    () => [
      `The long game can starve the present — five-year plans have a way of postponing everything worth feeling today.`,
      `Your standard for "enough" keeps receding; the finish line is a horizon, and you can burn quietly without the dramatic warning signs others get.`,
      `Impatient people misread you as unambitious early on — which costs you early opportunities you'd have crushed.`,
    ],
    () => [
      `You outlast. Everything volatile around you burns off, and you're still there, still building.`,
      `Your results are permanent. Nothing you built on discipline ever needed to be rebuilt on hype.`,
      `The quiet confidence of someone who knows what they're doing in year four is a force people either respect or fear — usually both.`,
    ],
    () => [
      `Put joy in the plan, not just after it. The five-year structure should include Tuesday nights that feel good NOW.`,
      `Tell the story earlier: your patience is intimidating in the best way, and the people watching would learn from the middle chapters.`,
    ],
    () => [
      `Slow is smooth and smooth is fast. You already knew that.`,
      `The name will arrive. It always does for people like you.`,
    ]
  ),

  // =========================================================================
  // QUIRKS — neutral, just who you are
  // =========================================================================

  // ------------------------------------------------------------- Thinks Out Loud
  "Thinks Out Loud": simple(
    () => `Your thought process has an audience whether you plan it or not. Ideas arrive half-formed and you narrate the whole assembly line — tangents, revisions, dead ends, all of it. People either find it magnetic or need a minute.`,
    () => [
      `Mercury in Gemini runs thought as dialogue. Silent thinking is a subset for you — the real processing happens in air, out loud, at speed.`,
      `The revisions are live: you'll state a position, contradict it mid-sentence, and land somewhere better than either draft. That's not confusion; that's the method.`,
      `Silence for you isn't golden — it's mostly unfinished. A thought you haven't said yet genuinely doesn't feel like yours yet.`,
    ],
    () => `Someone asks your opinion on a movie. Ninety seconds later you've covered the cinematography, your ex, postal systems, and landed on a genuinely interesting point nobody else would've reached. They forgot the question. You didn't — it was the on-ramp.`,
    () => [
      `The broadcast can bury the point — not everyone can follow the assembly process to the finished product.`,
      `Quiet types can feel steamrolled in your current; the airtime math isn't always fair.`,
      `Things said out loud early can be quoted later as "positions" — you get held to drafts you'd already retired.`,
    ],
    () => [
      `Your mind out loud is one of the more entertaining places a person can stand. Groups light up around you.`,
      `You think faster with an audience. Collaboration isn't just possible for you — it's where you're at your best.`,
      `The tangents ARE the insight. Half of what people love about talking to you lives in the detours.`,
    ],
    () => [
      `Give listeners a map once in a while: "thinking out loud, here's the question I'm actually trying to answer." It turns the current from flood to river.`,
      `Ask and pause: one full question per conversation where the other person gets the same out-loud room you take by default.`,
    ],
    () => [
      `The narration is the gift. The only upgrade needed is the occasional table of contents.`,
      `Keep thinking in public. Half the best ideas in the room were yours, said out loud, mid-tangent.`,
    ]
  ),

  // ------------------------------------------------------- Same Order Every Time
  "Same Order Every Time": simple(
    () => `You've ordered the same coffee for years and you're not apologizing for it. When you find something that works — meal, route, jacket, brand — you form a partnership. People call it boring. You call it solved.`,
    () => [
      `Venus in Taurus locks onto pleasure that delivers. When a thing has earned its place in your life, replacing it with an experiment is genuinely unappealing.`,
      `Your loyalty to favorites is sensory: the specific taste, feel, and fit are part of the value. A "similar" substitute is not a substitute.`,
      `You're not anti-new — you're pro-proven. New things get a fair trial and either beat the champion or join the rotation, which stays small.`,
    ],
    () => `The waiter knows. You've never had to say the order in three years — you walk in and it's already being made. Friends tease you. The waiter doesn't. The waiter understands excellence.`,
    () => [
      `The comfort loop can quietly shrink your world — restaurants, experiences, even art stay in a narrow lane that was optimized years ago.`,
      `Partners who crave novelty can read your consistency as disinterest when it's actually contentment.`,
      `The same order is sometimes a shield: the known thing can't disappoint you the way the untried thing might.`,
    ],
    () => [
      `You know what you like. That certainty is rarer and more restful than it gets credit for — no decision fatigue, no regret spirals.`,
      `Your pleasures compound. The same song, the same spot, the same meal — enjoyed for the hundredth time at full value.`,
      `You're the person people trust to pick the restaurant. You've never once sent anyone to a bad table.`,
    ],
    () => [
      `Keep the classics; add one experiment a month. Order the weird thing on the specials board once — worst case, you've confirmed the champion.`,
      `Notice when "the usual" is comfort versus when it's fear. They feel identical. They're not.`,
    ],
    () => [
      `Solved is a legitimate place to be. The world needs people who've actually decided.`,
      `The usual, but once in a while — the usual, with a twist.`,
    ]
  ),

  // ------------------------------------------------------- Runs On Their Own Clock
  "Runs On Their Own Clock": simple(
    () => `You operate on a personal time zone that doesn't sync with anyone else's. Not rude — just liquid. You arrive when you arrive, deadlines bend around you, and somehow the important things get done. Watching people panic about the clock genuinely confuses you.`,
    () => [
      `Pisces rising processes time as a suggestion. Your attention lives in tides, not schedules — when you're in something, the clock simply isn't in the room.`,
      `The lateness isn't defiance; it's absence. You didn't decide to be late — you surfaced from whatever you were in and time had moved.`,
      `You genuinely deliver. Things done on your clock get done well, which is what makes the pattern survive — the results keep vouching for you.`,
    ],
    () => `The dinner was at 7. You arrive at 7:40, serene, mid-thought about something you saw on the way. Nobody's mad by the second course — you brought the story, the story was worth 40 minutes, and everyone secretly knows it.`,
    () => [
      `People who run tight ships experience your clock as disrespect, even when it isn't.`,
      `The important-but-unglamorous appointments (DMV, dentist, taxes) exist on rigid time — your tide system keeps losing to them.`,
      `There's a version of this that costs real things: flights, ceremonies, first impressions. The tide doesn't care, but the world does.`,
    ],
    () => [
      `You're the most present person in the room. When you're somewhere, you're THERE — no split attention, no phone-checking.`,
      `Your relationship with time produces work nobody clock-bound person makes. The tangents are where your gold lives.`,
      `People find your pace calming. You're proof that most deadlines were softer than they claimed.`,
    ],
    () => [
      `Set alarms with consequences attached to the START of things (leave-at time, not arrive-at). You don't need urgency — you need an early signal.`,
      `Build in tide margins: put "leave by" 30 minutes before others would. Your lateness is a constant; constants can be engineered around.`,
      `For the rigid-world appointments, recruit a co-pilot who runs on grid time. Trade them something they're soft on.`,
    ],
    () => [
      `Your clock isn't broken — it's just not the public one. A few engineering tricks keep both running.`,
      `The tide is where your best work happens. Just don't let it swallow the flights.`,
    ]
  ),

  // -------------------------------------------------- Schedules Fun Like A Meeting
  "Schedules Fun Like A Meeting": simple(
    () => `Your leisure has structure. Hobbies have progress trackers, vacations have itineraries, and game night has a start time. People tease you for it. Your trips are also the ones that actually happen, fully enjoyed, with zero standing in line wondering what's next.`,
    () => [
      `Saturn in the 5th runs pleasure through the same operating system as work: planned, prepared, done properly. Fun isn't spontaneous for you — it's built.`,
      `The structure isn't fear of fun. It's how you guarantee fun actually occurs — unstructured leisure tends to dissolve into chores and scrolling, and you know it.`,
      `You enjoy the planning itself. The anticipation phase is a genuine pleasure center for you, not overhead.`,
    ],
    () => `The group trip: you have a doc. Times, bookings, a rain plan, restaurant links. They laugh at the doc. By day two, everyone is silently grateful — nobody argued, nothing closed early, and the one rainy afternoon already had a museum in it.`,
    () => [
      `Spontaneous invitations can feel like chaos to you, and you'll decline joy because it arrived without paperwork.`,
      `Partners and friends can misread the planning as control, when it's your way of relaxing.`,
      `Play without purpose can genuinely not compute — some kinds of silly, aimless fun never make it onto your calendar, and those are sometimes the best kind.`,
    ],
    () => [
      `Your planned fun ACTUALLY HAPPENS. Half the world's good intentions dissolve; yours are on the calendar and executed.`,
      `The itineraries are gifts. Traveling with you is restful in a way nobody expects until they've done it.`,
      `Your hobbies get deep. Structured practice accumulates into real skill while dabblers restart every season.`,
    ],
    () => [
      `Keep one unstructured slot per trip or per weekend — a blank block where whatever happens, happens. The doc can include it; that's allowed.`,
      `Say yes to one plan you didn't make per month. Somebody else's sloppy, joyful chaos won't hurt you.`,
    ],
    () => [
      `Planned joy is still joy. The people who tease the doc are the ones who end up in it.`,
      `Structure plus one blank block — that's the whole cheat code.`,
    ]
  ),

  // ------------------------------------------------------------------ Big Fun Energy
  "Big Fun Energy": simple(
    () => `You plan the parties, hype the trips, and remember everyone's birthday. Fun isn't a consumer activity for you — you're in production. The group chat is quiet until you propose something, and then it's 40 messages in ten minutes.`,
    () => [
      `Jupiter in the 5th enlarges the pleasure sector. Whatever fun exists in your orbit, you scale it — bigger games, better themes, more people included.`,
      `The generosity is built in: you'd rather over-invite than leave someone out. The party is better when it's full, and you know it.`,
      `Celebration is a genuine instinct. Good news in your presence gets properly honored — no "nice, anyway" energy survives near you.`,
    ],
    () => `Someone in the group gets a promotion. You've started a thread, proposed Saturday, booked the table, and designed a toast before lunch. By the weekend, the person who got promoted says it's the most celebrated they've felt in years.`,
    () => [
      `The production role can become permanent — you end up doing the emotional logistics of joy for everyone, always, and the role doesn't rotate.`,
      `When people don't match your energy back, the silence reads as rejection of YOU, not just of the plan.`,
      `Bigger is a bias: small, quiet hangouts can feel like failures to you even when they were exactly right.`,
    ],
    () => [
      `You create the memories. Years later, the stories people tell are from your events.`,
      `Your enthusiasm is a public service — people's lives are literally more fun because you exist in them.`,
      `You include people nobody else thinks to. The outsider at the party is usually your invite.`,
    ],
    () => [
      `Let someone else host once in a while, and attend as a guest. Being produced FOR is its own pleasure.`,
      `Scale down sometimes: two people, one pizza, no theme. Small counts. It was always allowed to count.`,
    ],
    () => [
      `The energy is real and rare. Keep producing — just invoice the group occasionally (in attendance, not money).`,
      `The world's fun doesn't happen by accident. Most of it happens because someone like you refused to let Thursday be boring.`,
    ]
  ),

  // ------------------------------------------------------- Home Is The Whole World
  "Home Is The Whole World": simple(
    () => `Your center of gravity is your home. Not in a shy way — in a magnetic way. The best evenings you know are the ones where people end up at your table, and you've built your whole life around a kitchen everyone gravitates to.`,
    () => [
      `Sun in the 4th locates the self at the base of the chart. Identity, purpose, and rest all run through the private center — your home isn't where you recharge FROM life; it's where life is actually happening.`,
      `The pull is deep, not defensive: you're not avoiding the world, you're prioritizing the layer of it that lasts.`,
      `You notice the difference between hosting and housing. Your home is a working relationship — it gets tended, improved, and loved back.`,
    ],
    () => `They planned the night out. By 10pm everyone's somehow at your place, shoes off, someone stirring something in your kitchen. Nobody planned it. It happens every few weeks. You wouldn't have it any other way.`,
    () => [
      `The inward pull can shrink the map — invitations, travel, and new circles quietly lose to the gravity of home.`,
      `Home can become the only stage: big parts of your life (career ambitions, public sides) get less development because the center absorbs everything.`,
      `When home shakes — a move, a break, family turbulence — everything shakes, because everything was built on it.`,
    ],
    () => [
      `You build the thing everyone else is searching for. Most people rent their sense of home; you own it.`,
      `Your table does the work of a therapist's office, a church, and a comedy club combined. That's a genuine social gift.`,
      `Your loyalty to the inner circle is absolute. The people in your kitchen know they're permanent.`,
    ],
    () => [
      `Take home on the road once in a while — a trip where you make a temporary kitchen social. The skill travels better than you think.`,
      `Protect one outward ambition with the same seriousness as the home ones. The world outside deserves your gifts too.`,
    ],
    () => [
      `Centering your life on home isn't small — done like you do it, it's architecture for everyone.`,
      `The kitchen is a legacy. Keep the light on.`,
    ]
  ),

  // --------------------------------------------------------------- Random Hyperfocus
  "Random Hyperfocus": simple(
    () => `You decide to learn knot theory, or sourdough, or the entire history of a small Baltic nation — and for two weeks it's ALL you do. Then the interest finishes its arc and files itself. The breadth of things you know deeply-but-briefly is genuinely strange and genuinely yours.`,
    () => [
      `Uranus in the 3rd feeds the mind electric current in irregular pulses. An idea arrives, seizes the system, and demands full processing NOW.`,
      `The depth is real while it lasts — you're not skimming. For the duration of the fixation you operate at specialist level, then surface.`,
      `The endings are natural, not failures. The interest leaves when it's finished with you; holding onto it past that point feels fake.`,
    ],
    () => `Two weeks ago you couldn't have found Lithuania on a map. Today you're explaining the Hanseatic trade routes to a coworker who asked how your weekend was. Next month it'll be mushroom foraging. The coworker has learned to just enjoy the ride.`,
    () => [
      `The unfinished projects accumulate: the guitar, the language app streak, the half-built thing in the corner.`,
      `Careers built on single tracks chafe — your mind wants a portfolio, not a lane, and forcing it into one lane makes it leak energy elsewhere.`,
      `People can't predict what version of you shows up at dinner this month.`,
    ],
    () => [
      `You're the most interesting person at any table. The random depth library pays out in conversation, connection, and unexpected competence.`,
      `The hyperfocus is a productivity engine. When it fires on something useful, you produce in two weeks what takes others a quarter.`,
      `You never stop being a student. Your brain stays decades younger for it.`,
    ],
    () => [
      `Keep a "someday shelf": when a new fixation arrives, park the previous one with notes on where it stopped. Returns are allowed — some fixations have sequels.`,
      `Point the engine at your actual goals occasionally: ask "what would a two-week specialist sprint do for my work?" Then let the current take it.`,
    ],
    () => [
      `The wandering mind isn't scattered — it's wide. The world runs on people who've been everywhere briefly and remember all of it.`,
      `Let it be strange. The strange is the feature.`,
    ]
  ),

  // -------------------------------------------------- Wears Every Mood On Their Face
  "Wears Every Mood On Their Face": simple(
    () => `You have no poker face. The mood you're in arrives before you do — everyone in the room reads you instantly. Happy is visible, annoyed is visible, that thing you decided not to mention is extremely visible. You've stopped pretending otherwise.`,
    () => [
      `Moon in the 1st puts the emotional weather on the outside. The inner state and the outer signal broadcast on the same channel — there's no delay, no editing.`,
      `The transparency isn't a choice. When the mood shifts, the face shifts, and you find out from other people's reactions.`,
      `Rooms read you as the temperature gauge. People check your face to know how the meeting is REALLY going.`,
    ],
    () => `You walk into work having had a rough morning. You say "I'm fine" twice. By 10am, three colleagues have asked what's wrong and your manager has rearranged the meeting. The face already held the press conference.`,
    () => [
      `Professional settings punish transparency — you've probably been told to "manage your expressions" by someone who's never had to.`,
      `People respond to your displayed mood instead of your words, so small moods get escalated without your consent.`,
      `Privacy is hard: the inner weather is public whether you've processed it or not.`,
    ],
    () => [
      `Nobody ever wonders where they stand with you. The people close to you relax into that honesty — no decoding required.`,
      `Your face does the vulnerability work others spend years in therapy attempting. People trust you because you're visibly real.`,
      `Moods move through you visibly AND quickly. Nobody has to guess; the weather updates in real time.`,
    ],
    () => [
      `Build the bridge sentence: "my face is ahead of my mouth — ask me in ten minutes." It buys time and goodwill.`,
      `For high-stakes rooms, arrive early and settle — the baseline you walk in with is the one they'll read all day.`,
    ],
    () => [
      `The transparency is you. Manage the timing, not the truth.`,
      `Being readable is a feature of honest people. The ones who matter prefer the signal.`,
    ]
  ),
};



