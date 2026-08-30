// ===========================================================================
// PLAYBOOK — "How to Actually Deal With Them": the whole chart translated
// into behavior. Four blocks: respond-well / NOT-to-do / attract / upset
// script. Keyed by Moon (emotional handling), Venus (attraction), Mars
// (conflict). No new astrology — same placements, organized as moves.
// Authored neutral plural; voice.t() at render. Green/red via block tone.
// ===========================================================================

import type { ReadingSection, ReadingBlock } from "../../readingEngine";
import type { PersonalityProfile } from "../model";
import type { Voice } from "./voice";

const para = (text: string): ReadingBlock => ({ type: "paragraph", text });
const sub = (text: string): ReadingBlock => ({ type: "subheading", label: text });
const bulletsGood = (items: string[]): ReadingBlock => ({ type: "bullets", items, tone: "good" });
const bulletsAvoid = (items: string[]): ReadingBlock => ({ type: "bullets", items, tone: "avoid" });

// ── What they'll respond well to (keyed by Moon) ───────────────────────────

const RESPOND_WELL: Record<string, string[]> = {
  aries: [
    "Let them have the first word in a conflict, then give your honest one. They de-escalate once fully heard, not before.",
    "Say yes to physical outlets when they're stressed — the walk, the gym, the drive. Their body discharges what their mouth can't yet.",
    "Keep your volume normal when theirs rises. Matching the panic doubles it; staying level ends it in minutes.",
  ],
  taurus: [
    "Warn them before changing anything — the plan, the menu, the arrival time. The change costs nothing once they've had time to sit with it.",
    "Feed them before hard conversations. A Taurus Moon negotiating on an empty stomach is a different person entirely.",
    "Use touch as punctuation: a hand on the shoulder during fights, a hug after. Contact reboots them faster than words.",
  ],
  gemini: [
    "Answer the weird 11pm question seriously. Being met intellectually at odd hours is how they feel chosen.",
    "Let them narrate the whole thing, out of order. They find the feeling by talking; cutting the story short leaves the feeling unfound.",
    "Change the scene when they're low — a drive, an errand, a new café. Movement plus novelty resets their mood faster than sympathy does.",
  ],
  cancer: [
    "Invite them into your family stuff — the group chat, the dinner, the problem. Inclusion is the proof; words alone don't count.",
    "Remember their hard dates. No grand gesture required — just remembering. A Cancer Moon keeps score of who noticed.",
    "When they retreat into the shell, knock softly and stay nearby. Chasing or leaving both make it worse; availability works.",
  ],
  leo: [
    "Praise them in front of other people and correct them in private. The order matters more than the content.",
    "Let them be dramatic without laughing at it. What looks like theatrics is real feeling at real volume.",
    "Accept their gifts and plans enthusiastically. Refusing a Leo Moon's gesture refuses the person.",
  ],
  virgo: [
    "Thank them for the specific things they did, not just the sentiment. 'You fixed it before I noticed' lands harder than 'you're the best.'",
    "Let them help. Refusing their care feels like refusing them; assign them something real.",
    "Give criticism in single servings with evidence. Piles of vague complaints overwhelm; one clear point gets fixed tonight.",
  ],
  libra: [
    "Reconcile visibly and quickly after fights. Leaving conflict hanging poisons everything else in their head.",
    "Ask their opinion and wait for it. The pause feels long because they're running all sides — filling it answers for them.",
    "Keep the shared world beautiful: the tidy room, the nice plate, the soft light. Environment IS emotional state for them.",
  ],
  scorpio: [
    "Volunteer information before they have to ask. Nothing buys trust with a Scorpio Moon like unrequested honesty.",
    "When they test you — and they will — stay consistent. Passing three small boring tests matters more than any grand gesture.",
    "Let silence sit without filling it nervously. Panic-talk reads as concealment; calm reads as nothing-to-hide.",
  ],
  sagittarius: [
    "Say yes to the unplanned thing. Momentum is their happiness default, and company on the adventure is the love they recognize.",
    "Give real space without punishing them for it later. The mood for the whole week depends on how the exit went.",
    "Debate ideas with them honestly, including when you disagree. Nimble, honest argument is affection in their dialect.",
  ],
  capricorn: [
    "Notice the work, not just the results. They'll never ask to be seen carrying things; seeing it anyway lands enormous.",
    "Let them be competent for you sometimes. Being needed practically is how they risk being loved.",
    "Take things off their plate by doing, not by insisting they rest. 'I already handled it' outperforms 'you should relax.'",
  ],
  aquarius: [
    "Give solitude without making them earn it back. Space freely granted reads as security; space extracted reads as surveillance.",
    "Befriend their mind first: send the article, ask the strange question, engage the theory. Intimacy walks in through the ideas.",
    "Stay steady when they go flat or distant. Treating it as weather instead of verdict is the only response that keeps the door open.",
  ],
  pisces: [
    "Protect them from harshness when they're depleted — the noisy room, the cruel joke. They absorb everything nearby; a quiet evening is first aid.",
    "Believe their first instinct, out loud. Their radar catches things before reasons exist; validation keeps the channel open.",
    "Anchor them with small rituals — the same table, the same song, the good-morning text. Rituals are the structure their ocean doesn't have.",
  ],
};

// ── What NOT to do (Moon half) ─────────────────────────────────────────────

const NOT_TODO_MOON: Record<string, string[]> = {
  aries: [
    "Don't punish with silence — it converts their anger into restlessness, and restlessness into a decision about the relationship.",
    "Don't stack three grievances into one conversation. They can take any single hit; a list reads as ambush.",
  ],
  taurus: [
    "Don't rush their 'no'. Pushing only welds it shut — come back after food and time.",
    "Don't change plans mid-flight. The resentment isn't about the plan; it's about the whiplash.",
  ],
  gemini: [
    "Don't demand emotional seriousness on demand — clowning is load-bearing. The depth shows up mid-joke; catch it there.",
    "Don't monitor their messages. Curated freedom dies under audit, and it takes the wit with it.",
  ],
  cancer: [
    "Don't dismiss the mood as 'nothing'. The weather report is data.",
    "Don't joke about the family, even gently. The roots are sacred ground; jokes there get remembered for decades.",
  ],
  leo: [
    "Don't correct them in public — even a friendly tease registers as a crown knocked off.",
    "Don't withhold praise to keep them humble. It doesn't humble; it makes them audition somewhere else.",
  ],
  virgo: [
    "Don't hand-wave details. 'It's fine' without proof starts their silent audit of everything else you've said.",
    "Don't take over their systems. Rearranging their method — even improved — reads as criticism of them.",
  ],
  libra: [
    "Don't force the conflict at the worst moment. 'We need to talk NOW' guarantees the diplomatic dodge instead of the truth.",
    "Don't decide for them 'to save time'. The resentment of being skipped outlasts any time saved.",
  ],
  scorpio: [
    "Don't lie small. A Scorpio Moon forgives brutal truth; one discovered 'harmless' lie converts every memory into a suspect.",
    "Don't share their secrets — with anyone. What's confided is on loan, not owned.",
  ],
  sagittarius: [
    "Don't guilt them for wanting out the door. The exit isn't rejection; being made to feel it is.",
    "Don't over-schedule their calendar. Open space isn't laziness to be filled; it's oxygen.",
  ],
  capricorn: [
    "Don't mock the ambition, even as a joke. The goal is the sensitive organ.",
    "Don't force vulnerability with talks about talks. It emerges sideways, mid-project, when nothing is being graded.",
  ],
  aquarius: [
    "Don't demand constant emotional check-ins. Closeness arrives on their frequency; forcing yours gets you a polite recording.",
    "Don't argue with 'everyone thinks…'. The crowd's opinion carries negative weight in their court.",
  ],
  pisces: [
    "Don't exploit the forgiving nature. Forgiveness happens, but the ledger is quiet and final.",
    "Don't deliver hard truth with blunt force. Same words, softened entry — the difference between medicine and a wound.",
  ],
};

// ── What NOT to do (Mars half) ─────────────────────────────────────────────

const NOT_TODO_MARS: Record<string, string[]> = {
  aries: [
    "Don't compete with their temper. Out-shouting an Aries Mars is how disagreements become tournaments.",
    "Don't bring up a fight they considered settled. To them it was finished the day it was shouted about.",
  ],
  taurus: [
    "Don't poke the bear to get a reaction. You'll get one, and it will be about you, forever.",
    "Don't move their things, their routine, or their food. Small invasions read as declarations of war.",
  ],
  gemini: [
    "Don't answer a rhetorical argument with 'calm down'. The argument was the calm.",
    "Don't use their own words from an old joke as evidence. Satire is not a deposition.",
  ],
  cancer: [
    "Don't go for the soft target mid-fight. Family, home, their people — hitting there turns a spat into a scar.",
    "Don't force them to talk before they resurface. The shell opens on its own schedule or not at all.",
  ],
  leo: [
    "Don't win in public. A public win against a Leo Mars costs more than the argument was worth.",
    "Don't demand an apology on the spot. Pride needs a runway before it can land.",
  ],
  virgo: [
    "Don't call the critique 'overreacting'. The audit is the wound, and dismissal reopens it.",
    "Don't improvise their careful plans. Chaos introduced on purpose reads as disrespect with extra steps.",
  ],
  libra: [
    "Don't mistake the calm for consent. A Libra Mars agrees to end the tension, not because agreement happened.",
    "Don't keep score out loud. Weaponized fairness turns their best skill into their deepest grudge.",
  ],
  scorpio: [
    "Don't bluff. An empty ultimatum teaches a Scorpio Mars that every word you say is negotiable.",
    "Don't use their weak spots against them. Finding them was easy; using them ends the trust permanently.",
  ],
  sagittarius: [
    "Don't fight about the fighting. Meta-arguments are where humor goes to die, and humor was the repair mechanism.",
    "Don't trap them in a corner — literal or conversational. Corners are for exits, and they know where the door is.",
  ],
  capricorn: [
    "Don't question their competence during a conflict. It's the one insult that lands below the armor.",
    "Don't escalate emotionally to force engagement. Escalation gets file-closed, not resolution.",
  ],
  aquarius: [
    "Don't fight with appeals to tradition. 'That's how it's done' is, to them, an argument for doing it differently.",
    "Don't push for tears. They arrive on their own decade, if ever, and rushing them reads as intrusion.",
  ],
  pisces: [
    "Don't use the sharp tone as a shortcut. They register tone before content, and the content never arrives after a cruel delivery.",
    "Don't force a confrontation they're avoiding. It converts to withdrawal, and withdrawal converts to escape plans.",
  ],
};

// ── How to actually attract them (keyed by Venus) ──────────────────────────

const ATTRACT: Record<string, { land: string[]; fails: string }> = {
  aries: {
    land: [
      "Text them something with a plan and a time: 'Saturday, 9am, I'm picking you up. Wear shoes you can run in.'",
      "Challenge them at something you're both bad at — the laughing matters more than the score.",
    ],
    fails: "Waiting three days to reply to seem mysterious. To Aries Venus that's not mystery, it's absence — and absence loses to whoever showed up.",
  },
  taurus: {
    land: [
      "Cook for them once, well, and let them see it took effort.",
      "Build a ritual: same bar, same table, 'our' song. Taurus Venus falls for things that repeat.",
    ],
    fails: "Expensive chaos — surprise trips, surprise guests, surprise everything. Novelty is fun once; dependability is what they date.",
  },
  gemini: {
    land: [
      "Send the article with 'this made me think of our argument on Tuesday.'",
      "Flirt at length over text — wordplay, in-jokes, escalation by wit. The mind is the erogenous zone here.",
    ],
    fails: "Playing hard to get with silence. They'll chat with whoever answers; the puzzle of your reply-time isn't interesting, it's boring.",
  },
  cancer: {
    land: [
      "Ask about their childhood and actually listen to the long version.",
      "Feed them something homemade and mention it was made for them.",
    ],
    fails: "Acting effortlessly unavailable. Cancer Venus bonds where being needed is safe — not where guessing games are the main activity.",
  },
  leo: {
    land: [
      "Compliment them specifically and in front of people: 'This whole trip worked because of them.'",
      "Show up looking intentional — dress like the date matters. Being visibly chosen is the romance.",
    ],
    fails: "Casual half-effort dates with low energy. Low voltage reads as low interest, and interest is the entire game.",
  },
  virgo: {
    land: [
      "Remember the small thing they mentioned once and act on it — the tea, the alley, the allergy.",
      "Ask for their help with something real and follow the advice. Being useful is how they fall.",
    ],
    fails: "Grand sweeping declarations with no follow-through. To Virgo Venus, the unanswered text undoes the bouquet.",
  },
  libra: {
    land: [
      "Curate the setting: good light, right playlist, no chaos. Beauty on purpose is a compliment in their language.",
      "Disagree gracefully once — a real opinion delivered kindly beats a whole evening of agreeable nothing.",
    ],
    fails: "Showing up sloppy and calling it honesty. Effort is read as respect, and they can't fall for someone in a room that doesn't care.",
  },
  scorpio: {
    land: [
      "Tell them one true thing you'd normally edit out. Depth-for-depth is the only currency accepted.",
      "Keep eye contact through the silence instead of filling it.",
    ],
    fails: "Keeping other options visibly warm. Scorpio Venus would rather be rejected outright than stored as an alternative.",
  },
  sagittarius: {
    land: [
      "Invite them toward the door: 'There's a thing happening across town. Come be underdressed with me.'",
      "Laugh hard at their humor instead of managing them. Being fun with beats being careful for.",
    ],
    fails: "Relationship timetables on date three. Pressure converts the adventure into a job interview, and they've mentally left the interview.",
  },
  capricorn: {
    land: [
      "Bring a plan to the table: booked, thought through, one decision left. Competence is the aphrodisiac.",
      "Take your own work seriously out loud — ambition respects ambition.",
    ],
    fails: "Performing flightiness to seem fun. Unreliability isn't charming to them; it's a risk profile.",
  },
  aquarius: {
    land: [
      "Open with the weirdest true thing you know, and let them top it.",
      "Give a real opinion that goes against the room, calmly.",
    ],
    fails: "Matching every opinion they have. Agreeable-because-strategic reads instantly as hollow, and hollow is a hard no.",
  },
  pisces: {
    land: [
      "Remember a feeling they mentioned once and check on it later: 'How did the thing with your dad go?'",
      "Make one small thing beautiful — the note, the saved seat, the song sent at the right moment. Their love lives in details with feeling.",
    ],
    fails: "Being bluntly practical about everything, all the time. It reads as a room with no door; they need some magic to enter.",
  },
};

// ── If they're upset with you (keyed by Mars) ──────────────────────────────

const UPSET_SCRIPT: Record<string, string> = {
  aries: "Say the real sentence in plain words, fast: 'I was out of line when I did X. Here's what I'm doing about it.' Let them vent at full volume without interrupting — the storm is short and it IS the apology process. Don't ask them to lower their voice; match their honesty instead. Then do something physical together. The fight is over when the body says so.",
  taurus: "Don't open with your defense. Open with food, quiet, and time: sit nearby and say 'I'm not going anywhere — take the time you need.' When they're ready, apologize once, concretely, and state exactly what changes. Then keep the change. Taurus Mars forgives behavior, not performances.",
  gemini: "Let them talk it into shape — every version, including the sarcastic ones. Respond with one honest piece of your own instead of a counter-argument. If they joke mid-fight, that's the olive branch; take it. Whatever happens, don't walk out mid-conversation — the talking IS the repair.",
  cancer: "Lead with the feeling, not the facts: 'You mattered more than being right, and I'm sorry.' Expect the mood to run long — don't rush the tide or call it dramatic. Stay physically close if allowed. Follow up with one act of care tomorrow; the apology is believed when it repeats.",
  leo: "Apologize out loud, specifically, and without a 'but' — the crown needs restoring before the details matter. Give eye contact and full sentences; mumbling reads as contempt. Then let them be generous back, because they will be. Never re-open it later to win.",
  virgo: "Ask for the specific version: 'Tell me exactly what I did and I'll fix it.' Take it seriously, no eye-rolling — precision is how they process hurt. Fix one thing visibly within the day. Don't call the reaction 'overreacting'; the audit is the wound and dismissal reopens it.",
  libra: "Restore peace visibly and quickly — but with a real apology, not just pleasant weather. Say both parts: 'I see why that hurt' and 'Here's what I'll do.' Don't push for the deep conversation the same night. Harmony first, truth later that week, gently.",
  scorpio: "Full honesty, no defenses, no exit: 'You were right to be angry. Here's everything, unasked.' Then survive the intensity without flinching — the storm is the trust test. Promise one true thing instead of everything, and keep it where it can be seen. Weeks of consistency close this wound; words alone never have.",
  sagittarius: "Keep it short, honest, and forward-looking: 'I messed that up. It won't happen again. Now come outside.' Long post-mortems suffocate — the apology lands better in motion than at a table. Let them be grumpy briefly without commentary. Don't hold the fight over them afterward; it was genuinely released.",
  capricorn: "Be direct and undramatic: name the mistake, state the fix, give a timeline. 'I was wrong about X. I've already started Y. It'll be done by Friday.' No groveling — competence in repair is respected more than theater. Then actually deliver; the kept promise is the apology.",
  aquarius: "Skip the emotional theater and go honest-plus-logical: 'That was a bad call. Here's why it happened, and here's what changes.' Give them space to go quiet and don't chase with escalating texts. Logic plus one real feeling said plainly — that combination gets through. Don't demand a performance of forgiveness on schedule.",
  pisces: "Soft entry, full responsibility: 'I hurt you and I hate that. Come here.' Hold the space while the wave passes — don't analyze, defend, or rush it. Follow up tomorrow with gentleness; Pisces Mars forgives in layers and needs the kindness repeated. Never mock the size of the feeling.",
};

// ── Section builder ────────────────────────────────────────────────────────

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function buildPlaybookSection(p: PersonalityProfile, voice: Voice): ReadingSection {
  const f = p.facts;
  const moonKey = f.moon;
  const marsKey = f.mars ?? f.moon;
  const venusKey = f.venus ?? f.moon;
  const s = voice.s;
  const sBe = s === "they" ? "they're" : `${s}'s`;
  const sWill = s === "they" ? "they'll" : `${s}'ll`;

  const at = ATTRACT[venusKey] ?? ATTRACT.aries;

  const blocks: ReadingBlock[] = [
    para(voice.t("Everything above, translated into moves: what works, what backfires, and the exact words for the hard moments.")),

    sub(`What ${sWill} respond well to`),
    bulletsGood((RESPOND_WELL[moonKey] ?? RESPOND_WELL.aries).map((x) => voice.t(x))),

    sub("What NOT to do"),
    bulletsAvoid([...(NOT_TODO_MOON[moonKey] ?? NOT_TODO_MOON.aries), ...(NOT_TODO_MARS[marsKey] ?? NOT_TODO_MARS.aries)].map((x) => voice.t(x))),

    sub(`How to actually attract ${voice.o}`),
    bulletsGood(at.land.map((x) => voice.t(x))),
    bulletsAvoid([voice.t(at.fails)]),

    sub(`If ${sBe} upset with you`),
    para(voice.t(UPSET_SCRIPT[marsKey] ?? UPSET_SCRIPT.aries)),
  ];

  return { id: "playbook", title: `How to Actually Deal With ${cap(voice.o === "them" ? "Them" : voice.o)}`, blocks };
}
