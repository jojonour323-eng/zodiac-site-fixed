// ===========================================================================
// ASPECT CHAPTERS — "Mercury square Pluto — where the mind gets obsessive"
// ---------------------------------------------------------------------------
// Each chapter explains what the aspect DOES psychologically: both the gift
// and the cost, in real behavior. Pair library covers the high-impact
// personal-planet combinations; a role-based fallback handles rare pairs.
// Authored in neutral plural voice.
// ===========================================================================

type AspectType = "conjunction" | "opposition" | "trine" | "square" | "sextile";

export interface AspectChapter {
  title: string;      // theme suffix WITHOUT planet names — caller prepends them
  blocks: string[];   // 2-3 paragraphs (mechanism + example + shadow/gift)
  monologue?: string;
}

const ROLE: Record<string, string> = {
  sun: "core identity",
  moon: "emotional world",
  mercury: "mind",
  venus: "way of loving",
  mars: "drive",
  jupiter: "appetite for more",
  saturn: "inner authority and fear",
  uranus: "need for freedom",
  neptune: "imagination and fog",
  pluto: "depth and control",
};

/** pairKey = sorted "a|b" */
const PAIRS: Record<string, Partial<Record<AspectType, AspectChapter>>> = {
  // ── luminaries & self ──
  "moon|sun": {
    conjunction: {
      title: "what they want and what they need point the same direction",
      blocks: [
        "Want and need run on the same rail here. What they consciously identify with and what emotionally sustains them agree so closely that their inner life has unusual continuity — decisions feel clean because nothing internal votes against. The catch is one-sidedness: when the shared sign's strategy fails, EVERYTHING fails at once, because there's no second system to absorb the shock.",
      ],
      monologue: "\"At least I always know what I want. Whether I can get it is a different question.\"",
    },
    opposition: {
      title: "who they are vs what keeps them settled pull in opposite directions",
      blocks: [
        "Conscious identity and emotional needs were built to negotiate, not cooperate. Who they're trying to become demands one lifestyle; what actually soothes them requires another — so they swing between 'this is who I am' phases and 'screw it, I need comfort' phases.",
        "The mature version of this aspect is remarkable integration: each side translates for the other. Identity informs needs ('I don't actually want that comfort, I want rest'), needs inform identity. Until then, people close to them experience two versions arriving on alternate weeks.",
      ],
      monologue: "\"Half of me wants the mission. Half of me wants a nap. They take turns driving.\"",
    },
    square: {
      title: "identity and emotional needs keep stepping on each other",
      blocks: [
        "What they identify with and what emotionally nourishes them operate from incompatible assumptions, so satisfying one reliably irritates the other. Pursue ambition and loneliness arrives; sink into comfort and purposelessness follows. Neither state is wrong — the schedule is just wrong.",
        "Growth here means scheduling both honestly instead of alternating secretly. When they stop pretending one side doesn't exist, the friction becomes engine rather than demolition.",
      ],
    },
    trine: {
      title: "want and need reinforce each other almost silently",
      blocks: [
        "This is quiet luck: identity and emotional needs were designed compatible. Decisions that look risky still leave them emotionally fed, because instinct and self-image negotiate without meetings. Others read it as confidence or good instincts; mechanically, it's low internal drag.",
      ],
    },
  },

  "saturn|sun": {
    square: {
      title: "where self-belief gets audited by an inner judge",
      blocks: [
        "Something early taught them that being themselves wasn't automatically acceptable — achievement had to be earned twice, behavior pre-approved, mistakes paid for with interest. So a permanent inner auditor formed: harsher than any real boss, sharp about flaws, suspicious of confidence nobody earned yet.",
        "The compensation built into the same wiring is real: Saturn-square-Sun people out-prepare everyone, deliver under pressure that breaks looser personalities, and earn respect through sheer reliability. The work of a lifetime is distinguishing the auditor's voice from their own — and demoting it from warden to advisor.",
      ],
      monologue: "\"Everyone thinks I'm confident. If they only knew the performance review running in my head.\"",
    },
    opposition: {
      title: "self-expression meets resistance — from others, then from inside",
      blocks: [
        "Authority figures and circumstances historically reflected limits back onto them: shrink this, delay that, prove it more. Over time they swallow that outside gatekeeper, and now they hesitate on their own behalf. Watch the pattern flip mid-life, though — oppositions integrate late but powerfully, producing people whose authority eventually exceeds everyone who once evaluated them.",
      ],
    },
    conjunction: {
      title: "seriousness baked into the core self",
      blocks: [
        "They were old when young: responsibility arrived early, play took audit trails, and self-worth got welded to competence decades before peers noticed anything was due. Life grants this configuration real authority over time — earned, layered, unfakeable — though joy often needs deliberate scheduling even now.",
      ],
    },
    trine: {
      title: "discipline feeding identity instead of repressing it",
      blocks: [
        "Structure serves the self here rather than starving it: goals set get reached, habits hold, promises to themselves clear like bills. What looks like iron willpower is really alignment — the inner authority and the core self signed the same contract long ago.",
      ],
    },
  },

  "pluto|sun": {
    square: {
      title: "intensity issues with ego — control battles internal and external",
      blocks: [
        "Life periodically dismantles who they thought they were, often through power struggles: bosses who dominate, partners who control, situations that strip choice down to bare will. Each reconstruction leaves them harder to manipulate and more afraid, simultaneously, of losing control again.",
        "The signature strength built here is phoenix-capacity — nobody recovers from devastation quite like this. The signature risk is preemptive control: managing everyone subtly to guarantee no ambush ever happens again.",
      ],
      monologue: "\"I've already survived the thing you're threatening me with.\"",
    },
    conjunction: {
      title: "a magnetic, all-or-nothing core",
      blocks: [
        "Presence announces itself regardless of volume. People feel watched, weighed, seen-through — often correctly. Their identity carries real intensity: commitments made like vows, interests pursued all the way to mastery, and ordinary small talk endured like a waiting room.",
        "Power themes follow them: given leadership, they transform organizations; denied legitimate channels, the same force goes underground into manipulation or self-destruction. Channeling is everything.",
      ],
    },
    opposition: {
      title: "others' intensity mirrors what they refuse to own",
      blocks: [
        "Control-minded, deeply feeling people keep appearing across their life like mirrors — reflecting back the power, obsession, and depth they refuse to claim in themselves. The relationships escalate: wonderful at full closeness, dangerous during conflict, never superficial for a single week. The fix is claiming the intensity as their own instead of fighting it in whoever mirrors it.",
      ],
    },
    trine: {
      title: "depth operating as native talent",
      blocks: [
        "Psychological X-ray vision comes built in and constructive: they see through pretense AND handle what they find responsibly. Crises recruit them naturally; others trust them with heavy things precisely because their intensity flows steadily instead of explosively.",
      ],
    },
  },

  // ── moon pairs ──
  "moon|saturn": {
    square: {
      title: "where feelings learned to ask permission first",
      blocks: [
        "Somewhere early, emotional expression met consequences: tears ignored, needs called excessive, comfort rationed by someone stretched thin. The adaptation was efficient and costly — feelings now need approval before they're allowed to surface, and most of them die quietly in review.",
        "Adult version: enormous self-sufficiency, relationships chosen seriously and entered slowly, loyalty underneath once trust lands. Partners misread the contained style as coldness; it's actually discipline holding an ocean back. What heals it: people who respond to small disclosures with warmth, again and again, instead of demanding full access upfront.",
      ],
      monologue: "\"I'll deal with it myself. It's fine. It's always fine.\"",
    },
    opposition: {
      title: "needing closeness while bracing against it",
      blocks: [
        "Emotional needs and the discipline they absorbed early sit at opposite ends of one seesaw: reach for warmth, brace for judgment; withdraw to safety, starve quietly. Relationships cycle through craving-then-distance patterns that feel like fate but are really just mechanics.",
        "The fix looks unglamorous: scheduled vulnerability, agreed-on reassurance rituals — plain, repeatable structures that let a guarded heart receive care without a crisis happening first.",
      ],
    },
    conjunction: {
      title: "deep feeling under official management",
      blocks: [
        "Reserve and depth live at the same address. Emotions register fully but get shown selectively, loyalty expresses through consistency rather than declarations, and trust builds layer by layer, like sediment. People earn lifetime access here through years of showing up — nobody shortcuts the process, including the person themselves.",
      ],
    },
    trine: {
      title: "steady feelings, durable bonds",
      blocks: [
        "The emotional structure holds real weight: moods swing inside safe limits, commitments survive bad seasons, and support arrives practical and reliable. Others describe them as 'the stable one' without grasping how much design effort hides inside that stability.",
      ],
    },
  },

  "moon|pluto": {
    square: {
      title: "where feelings go nuclear before anyone sees the reactor",
      blocks: [
        "Emotional intensity runs several grades above the displayed setting: hurt converts to obsession quickly, small slights expand into full investigations, and love attaches at depths that frighten the person carrying it. Jealousy, if present anywhere in the chart, lives HERE — not from malice, but from genuine terror of abandonment combined with a mind built for evidence.",
        "Superpowers ride along: emotional perception so accurate it feels psychic, loyalty beyond reason, and the ability to walk others through darkness because they know its geography personally. The lifelong task is feeling it fully WITHOUT acting on it destructively.",
      ],
      monologue: "\"I'm fine. I've just been thinking about that thing you said four days ago. Constantly.\"",
    },
    conjunction: {
      title: "volcanic interior beneath controlled surface",
      blocks: [
        "Feeling runs all-or-nothing at the foundation: attachments form at full-merge depth, betrayals register like earthquakes, and everyday emotions carry a weight most people never notice. Their private world runs at pressures most humans never visit.",
      ],
    },
    opposition: {
      title: "attraction to intense partners reflects inner intensity",
      blocks: [
        "Deeply intense, emotionally dramatic partners keep showing up — carrying on the outside the depths they keep banked on the inside. The relationships escalate: wonderful at full closeness, dangerous during conflict, never superficial for one week. Naming the wild swings out loud defuses half of their destructive paths.",
      ],
    },
    trine: {
      title: "emotional depth flowing productively",
      blocks: [
        "Intensity flows in a useful direction: empathy aimed accurately, crises handled with strange calm, loyalty felt as physical fact. Others sense they could bring ANYTHING to this person — and they'd be right.",
      ],
    },
  },

  "mars|moon": {
    square: {
      title: "where desire and emotional safety fight over the wheel",
      blocks: [
        "Wants and feelings interrupt each other mid-move: pursue boldly, then anxiety floods; retreat safely, then restlessness ignites. Anger usually masks hurt here — snapping at loved ones within minutes of feeling dismissed, then regretting delivery methods while defending content.",
        "Working model: name the hurt BEFORE the temper fires. Easier typed than lived, but every successful rep rewires the circuit slightly.",
      ],
    },
    conjunction: {
      title: "feelings with engines attached",
      blocks: [
        "Emotion converts to motion almost instantly: excited means moving, angry means acting, protective means intervening NOW. Enormous energy, minimal gap between impulse and action, courage available whenever loved ones need a defender. Learning to pause costs them something every day — and it's what buys their relationships their full potential.",
      ],
    },
    trine: {
      title: "instinct and action cooperating",
      blocks: [
        "Feelings translate straight into useful behavior, with no committee meeting in between: protective without smothering, assertive without exploding, motivated by genuine desire instead of hidden pressure. The athletic, sexual, and fight-ready capacities here come reasonably tuned from the start.",
      ],
    },
  },

  "neptune|moon": {
    square: {
      title: "where feelings and reality check different sources",
      blocks: [
        "Their emotional perception absorbs the atmosphere so completely that separating their own feelings from everyone else's takes deliberate practice. Moods arrive carrying invisible cargo: other people's stress, room tension, stories imagined vividly enough to produce real grief. The compassion is close to limitless; keeping boundaries takes huge, deliberate effort.",
        "The risk list includes idealizing unavailable people, staying loyal to fantasies after the facts left, and escaping overwhelm through whatever turns the volume down — sleep, screens, substances, daydreams. The medicine is boring on purpose: regular sleep, verified facts said out loud, and friends contracted to gently reality-check them.",
      ],
      monologue: "\"I can't explain why I'm sad. There doesn't have to be a why, apparently.\"",
    },
    conjunction: {
      title: "porous empathy as a baseline state",
      blocks: [
        "Feelings pass through without a filter: cinematic emotion, spiritual openness, artistic reception as standard equipment. Beautiful at best, debilitating when unprotected — managing their moods IS managing their life for this placement.",
      ],
    },
    trine: {
      title: "imagination and instinct collaborating gracefully",
      blocks: [
        "Intuition reads accurately through creative channels: knowing who needs calling before the phone rings, processing grief through music, sensing what's coming dimly and usually correctly. The sensitivity protects itself — feelings move through without flooding the place.",
      ],
    },
  },

  "uranus|moon": {
    square: {
      title: "where security needs and freedom needs renegotiate weekly",
      blocks: [
        "Their emotional wiring has built-in protection against routine: comfort zones trigger restlessness they can't explain, stability satisfies briefly then suffocates suddenly. Moods shift weather-system-fast, sometimes startling the person themselves. Commitment only works if the escape hatches are negotiated up front.",
        "Underneath sits a real irony: the radical independence is protecting a genuinely tender nervous system from engulfment fears. Naming the pattern doesn't change it automatically, but it turns it from fate into weather — manageable.",
      ],
    },
    conjunction: {
      title: "electric feelings on independent circuits",
      blocks: [
        "Their feelings discharge on their own circuits: flashes, surges, and sudden complete reversals they sincerely experience as clarity. Their attachment style ships without a normal setting — 'standard' intimacy always feels slightly wrong. Genius-level intuition about what a whole group is feeling compensates publicly for the intimacy puzzles they practice privately.",
      ],
    },
    trine: {
      title: "independence embraced cleanly, no guilt residue",
      blocks: [
        "The need for space integrates without drama: alone-time gets requested openly instead of engineered secretly, emotions get felt fully without drowning risk, and change gets treated as food. A calm kind of rebellion defines the whole setup.",
      ],
    },
  },

  // ── mercury pairs ──
  "mercury|pluto": {
    square: {
      title: "where the mind interrogates everything, including peace",
      blocks: [
        "Their thinking pierces surfaces: statements get weighed for hidden meanings, stories get checked for inconsistencies, silences get read forensically. What they understand arrives deep and stays — but so does the overthinking. A two-line text message can fund a three-hour investigation, sometimes uncovering real intelligence, sometimes producing pure fiction.",
        "Same wiring, aimed properly: research excellence, psychological insight, persuasive precision, and a refusal to accept official explanations that don't survive cross-examination. Managing the shadow means choosing investigation targets on purpose instead of letting anxiety nominate them.",
      ],
      monologue: "\"Their tone changed between sentence one and sentence two. Why.\"",
    },
    conjunction: {
      title: "laser perception with obsessive bandwidth",
      blocks: [
        "Mind and depth-hunger fused: they see through things instantly and speak with unsettling precision. They need truth the way lungs need air. Talking with them feels like an X-ray; their research projects come out at forensic standards on deadlines natural to no one else.",
      ],
    },
    opposition: {
      title: "surface talk vs bottom-truth negotiation ongoing",
      blocks: [
        "Polite conversation and the investigative urge run a permanent trade agreement. Small talk exhausts them; tasting the truth compels them. Partners learn the tell — when their questions sharpen exactly where a topic turns protected, the X-ray is on, so proceed honestly.",
      ],
    },
    trine: {
      title: "depth-perception installed without the obsession tax",
      blocks: [
        "The investigative power switches on voluntarily and off cleanly: profound questions pursued with passion, dropped when dinner starts. They read people accurately without ruining nights replaying micro-signals. A rare setting — a quiet advantage everywhere.",
      ],
    },
  },

  "mercury|saturn": {
    square: {
      title: "where thinking double-checks itself into exhaustion",
      blocks: [
        "Their words went through inspection gates early in life — maybe criticism landed on casual speech, maybe careful adults modeled measured language — and now every sentence gets reviewed before it goes out and again afterward, like an autopsy. Speaking up carries a risk tax; being misunderstood ranks among their private worst-case scenarios.",
        "The built-in compensation is real: precision, patience with complex material, and reliability of word matched by very few. Loosening the protocol means learning to tolerate drafts — sharing rough versions of their thoughts trains flexibility back into hardened certainty.",
      ],
    },
    conjunction: {
      title: "gravity and authority attached to words",
      blocks: [
        "Their speech arrives weighted: few sentences, dense content, a seriousness the listener can feel physically. They think in systems whether they're learning law or code. The humor exists — dry as bone, worth waiting for, landing days later in the shower.",
      ],
    },
    trine: {
      title: "structured thinking as straight advantage",
      blocks: [
        "Their mental structure supports blueprints most people don't have: plans forming in sequence, complexity tamed methodically, credibility accumulating automatically. Their words carry weight in proportion to the preparation behind them.",
      ],
    },
  },

  "mercury|neptune": {
    square: {
      title: "where logic and imagination corrupt each other usefully",
      blocks: [
        "Precise thinking and associative dreaming interfere like overlapping radio stations: focus drifts mid-task into daydreams, details blur conveniently, directions get remembered artistically. At the same time the fog ENABLES — metaphor comes natively, possibilities show up before the evidence, and for some carriers this fog structures entire careers.",
        "The practical defense is external systems, used aggressively: notes written instantly, appointments triple-alarmed, important statements repeated back word for word. Self-trust repairs through keeping receipts.",
      ],
      monologue: "\"Wait — did that happen, or did I imagine telling someone about it?\"",
    },
    conjunction: {
      title: "a mind tuned to dream-frequency natively",
      blocks: [
        "Their thinking runs on a poetic frequency: symbols processed fluently, rationality consulted politely and late. Their absorption makes storytelling mesmerizing and spreadsheet review genuinely painful. Anchoring habits decide whether this becomes artistry or career-limiting absentmindedness.",
      ],
    },
    trine: {
      title: "imagination disciplined by gentle structure",
      blocks: [
        "The creative and logical channels cooperate here: visions translated into buildable steps, intuitive hunches documented and tested respectfully. The blend produces engineers who paint and writers who prototype — a rare hybrid the market currently overpays for.",
      ],
    },
  },

  "mercury|mars": {
    square: {
      title: "where words fire faster than editing catches them",
      blocks: [
        "The gap between thought and mouth measures in insufficient milliseconds: retorts launch loaded, sarcasm fires reflexively, and debates get entered competitively regardless of whether the stakes deserve it. Regret typically stamps in fifteen seconds after launch — frequently while defending a position they misstated at speed.",
        "The fix has a map: writing before speaking hard conversations turns the liability into an asset. The same combustible fuel powers legendary debate performances when they choose the arena on purpose.",
      ],
    },
    conjunction: {
      title: "speech carrying live-wire charge",
      blocks: [
        "Their words cut or spark depending on the aim: the same blunt delivery reads as refreshing from one person and as an attack from another, depending on context. Racing minds come paired with racing tongues, and impatience shows up conversationally. Precision improves only through deliberately slowing down — practiced daily, forever.",
      ],
    },
    trine: {
      title: "verbal agility serving actual purposes",
      blocks: [
        "The quick thinking lands constructively: negotiations navigated by instinct, wit used to bond rather than cut, arguments resolved through a speed-plus-goodwill combination opponents rarely match.",
      ],
    },
  },

  // ── venus pairs ──
  "venus|saturn": {
    square: {
      title: "where love learned to cost something up front",
      blocks: [
        "Affection met conditions somewhere formative: approval tied to performance, warmth handed out carefully, or role models who showed love as work. The adult pattern runs defensive: wanting closeness fiercely while doubting they deserve it, testing partners without meaning to, and brushing off compliments like a professional.",
        "These relationships famously improve with age — the early chapters feel starved or formal, and the later ones build marriages people envy. Because less was assumed for free, more gets verified slowly, and the foundation ends up surveyor-grade solid once it's finally poured.",
      ],
      monologue: "\"I keep waiting for them to realize I'm too much work. Meanwhile they just... stay.\"",
    },
    opposition: {
      title: "wanting devotion while deflecting receiving it",
      blocks: [
        "A push-pull dance defines their romantic history: openly craving commitment while quietly sabotaging the receiving of it. Compliments deflected, gestures discounted, partners who love them well somehow accused of not doing enough. Awareness interrupts the auto-pattern; deliberately practiced gratitude slowly rewires the ability to receive.",
      ],
    },
    conjunction: {
      title: "loyalty coded traditional-romantic at core",
      blocks: [
        "Their love aesthetic runs classic: commitment is serious, courtship is respectful, relationships get treated like institutions that matter. Their skepticism of modern looseness isn't prudishness — it's a sober valuation of something rare. Partners who prove durability discover old-world romance astonishingly intact underneath the reserve.",
      ],
    },
    trine: {
      title: "steady affection that compounds",
      blocks: [
        "Their loving style banks trust the plain way: consistent presence, realistic expectations, and satisfaction drawn from the whole length of the partnership instead of the honeymoon moment. The longest-standing couples statistically look exactly like this quiet configuration.",
      ],
    },
  },

  "venus|pluto": {
    square: {
      title: "where love and obsession share circulation",
      blocks: [
        "Attraction starts volcanic sequences: interest escalates at merge speed, boundaries dissolve invitingly, and possessiveness simmers under a mutually enjoyed intensity until conflict opens deeper layers. Ordinary relationship fights bite harder here because EVERYTHING reads as a question of ultimate loyalty.",
        "The healing arc is specific: learning that intensity doesn't equal doom. Keeping passion healthy takes paradox practices — keeping your separate self INSIDE the union, and naming jealousy out loud so it becomes negotiable information instead of contagious paranoia.",
      ],
      monologue: "\"I don't want to monitor your phone. I want to not want to.\"",
    },
    conjunction: {
      title: "magnetism described unanimously as UNFAIR",
      blocks: [
        "Their presence generates gravity, documented by entire communities: eye contact that leaves marks, exes who keep something like shrines. Love is experienced as all-or-nothing; attraction means both people are guaranteed to be transformed.",
      ],
    },
    opposition: {
      title: "intense partners appearing, mirror-obligated",
      blocks: [
        "Possessive, passionate lovers keep recurring through their biography — like projections of their own unclaimed depths looking for a body to live in. Their relationship histories read like transformation courses disguised as romance novels. Integration means claiming authorship of the story, retroactively.",
      ],
    },
    trine: {
      title: "depth-of-devotion flowing sustainably",
      blocks: [
        "The passion burns steady-hot without the explosive cycle: commitment absolute by choice, intimacy descended into courageously, trust handed out precisely. Partners report feeling CHOSEN continuously — a rarer experience than the dating market advertises.",
      ],
    },
  },

  "venus|uranus": {
    square: {
      title: "where stability and electricity keep undercutting each other",
      blocks: [
        "Relationships stabilize and the fascination mysteriously evaporates; partners excite and the longevity becomes doubtful. The wiring underneath is honest but awkward: love-arousal responds to novelty while attachment-security craves consistency, producing alternating chapters of comfortable-but-boring and electric-but-unsustainable.",
        "The workable version gets engineered on purpose: freedom clauses negotiated up front, moving in paced strategically, boredom fought with planned novelty instead of flight. Boredom here isn't evidence of wrong love — it's maintenance data.",
      ],
    },
    conjunction: {
      title: "attraction that follows nobody's approved checklist",
      blocks: [
        "Their type bypasses demographics entirely: chemistry decides, unconventional partners win, and conventional suitors get rejected bewilderingly fast. Attractions strike suddenly and end suddenly; a noncommittal reputation chases this placement around accurately unless honesty comes first.",
      ],
    },
    trine: {
      title: "independence and intimacy balanced from the factory",
      blocks: [
        "Space neither threatens nor gets weaponized, novelty arrives collaboratively, and commitments hold firmly and lightly at the same time. The partnership structure most couples struggle to negotiate after years comes pre-installed here.",
      ],
    },
  },

  "venus|neptune": {
    square: {
      title: "where falling in love edits the evidence",
      blocks: [
        "Romance activates maximum projection: the beloved arrives idealized, red flags get reprocessed charitably, potential counts as present tense. Disillusionment lands eventually — devastating in proportion to prior inflation.",
        "Recovery is procedural, not poetic: friends consulted as reality baselines, actions tracked against narratives out loud, grief for the fantasy formally permitted alongside exiting the reality. The idealism itself deserves preservation; only its verification protocol needs professional-grade installation.",
      ],
      monologue: "\"I fell for someone who doesn't exist yet. Again.\"",
    },
    conjunction: {
      title: "romanticism at mythological dosage",
      blocks: [
        "Love gets imagined with a full orchestral score: soulmates sought literally, poetry composed involuntarily, compassion extended even toward betrayers. The boundary blur is expensive — savior complexes activate routinely — though the same openness channels genuine artistry when reality-checks are anchored around it.",
      ],
    },
    trine: {
      title: "idealism tempered into something workable",
      blocks: [
        "Devotion stays spiritual AND sustainable at once: beauty perceived everywhere and shared generously, forgiveness extended wisely instead of blindly, creativity poured into courtship consistently. Enchantment without the abandon-reality bill.",
      ],
    },
  },

  // ── mars & outer planets ──
  "mars|saturn": {
    square: {
      title: "where drive keeps meeting brakes that were installed early",
      blocks: [
        "Ambition collides with the brakes on a loop: the engine revs bravely, then cautious braking kicks in at arbitrary moments; initiative and paralysis alternate in cycles that frustrate everyone, including them. Early environments often punished boldness or rewarded caution inconsistently — installing two operating systems that each believe they're the boss.",
        "The repair is small completed commitments, taken aggressively one at a time — rebuilding activation confidence systematically. Once the two systems sync, this setup regularly embarrasses unburdened peers: disciplined power defines the cured version completely.",
      ],
      monologue: "\"I want it. I'm scared of wanting it. Fine — watch me do both.\"",
    },
    conjunction: {
      title: "endurance that outlasts every flashier competitor",
      blocks: [
        "The drive runs like a diesel engine: slow-starting, unstoppable once the momentum is established, with frustration tolerance near industrial grade. Competitions decided across decades favor carriers of this aspect almost every time. Anger likewise compounds quietly until the settlement gets negotiated very seriously indeed.",
      ],
    },
    trine: {
      title: "disciplined power, integrated and quiet",
      blocks: [
        "Effort concentrates efficiently and lasts: persistence harmonized with patience, ambition harnessed to restraint like two partners working together, achievements stacked on engineered foundations. Leadership presence accrues automatically, unrequested.",
      ],
    },
  },

  "mars|pluto": {
    square: {
      title: "where willpower runs at supercar danger ratings",
      blocks: [
        "Desire intensifies to obsession-capable grades: goals absorb total bandwidth, competitors acquire personal significance, and persistence crosses from admirable into alarming territory with nobody posting a sign. Power struggles attach themselves like gravity; workplace politics discovers tournament players who never asked to be seeded.",
        "Where they channel it decides the legacy: athletics, entrepreneurship, surgery, activism absorb the force legendarily — while relationships collect the collateral damage instead. Channeling projects are scheduled for a lifetime, deliberately.",
      ],
    },
    conjunction: {
      title: "a force that rearranges rooms",
      blocks: [
        "Their willpower broadcasts at regional strength: objections get reconsidered after one glance, rooms reorganize around their arrival, determination communicates on a physics frequency. Accusations of ruthlessness land often — sometimes accurate, always incomplete; instrument-grade focus describes the mechanics better than the adjectives their critics prefer.",
      ],
    },
    trine: {
      title: "formidable, centered, sustainable",
      blocks: [
        "Intensity managed at mastery grade: power exercised legitimately, endurance applied strategically, crisis leadership volunteered instinctively. Capabilities built at stadium scale deploy with boardroom precision — the rare version of this aspect where nothing needs disarming afterward.",
      ],
    },
  },

  "mars|neptune": {
    square: {
      title: "where motivation dissolves and reforms unpredictably",
      blocks: [
        "The drive runs tide-powered: inspiration floods alternate with drought phases that feel inexplicably guilty. Assertion leaks out sideways — anger expressed as headaches, boundaries defended vaguely, pursuit targets abandoned quietly so often it barely registers as a choice anymore.",
        "Stabilization requires explicit rigging: commitments sized honestly against current capacity, downtime scheduled guilt-free, and direct communication trained deliberately to replace the passive systems being retired.",
      ],
      monologue: "\"I swear I wanted to help. By the time I figured out how, the moment had drowned.\"",
    },
    conjunction: {
      title: "desire reporting from imaginative jurisdictions",
      blocks: [
        "Want-power routes through aesthetic and spiritual channels: athletic, artistic, and contemplative outlets function as necessary translators, confrontation-avoidance skews behavior indirect, and compassionate service turns heroic when a context finally feels worthy of the charge.",
      ],
    },
    trine: {
      title: "inspiration powering action cleanly",
      blocks: [
        "Vision executes: intuition supplies excellent timing, imagination supplies the story that keeps stamina alive during grind phases, and flow states arrive reliably enough to build professions on. Dreams convert to shipped products at enviable rates.",
      ],
    },
  },
};

/**
 * Build an AspectChapter for a scored natal aspect.
 * Falls back to a role-based composition when the pair lacks a curated entry.
 */
export function buildAspectChapter(
  a: string,
  b: string,
  type: AspectType,
  rng: () => number
): AspectChapter {
  const key = [a, b].sort().join("|");
  const curated = PAIRS[key]?.[type];
  if (curated) return curated;

  const ra = ROLE[a] ?? a;
  const rb = ROLE[b] ?? b;
  void rng;

  const genericTitle: Record<AspectType, string> = {
    conjunction: `a fused pair — no daylight between them`,
    opposition: `two poles trading control`,
    square: `built-in friction between two engines`,
    trine: `an easy alliance`,
    sextile: `a helpful side-channel`,
  };
  const genericBody: Record<AspectType, string[]> = {
    conjunction: [
      `${capitalize(ra)} and ${capitalize(rb)} speak as one: where one shows up, the other arrives inseparably. Combined strength cuts both ways — amplification without moderation means this pairing amplifies good seasons and hard ones identically.`,
    ],
    opposition: [
      `${capitalize(ra)} wants one schedule; ${capitalize(rb)} keeps different office hours. Life teaches arbitration: swing too far either direction and the neglected side sends the bill. Integration, once earned, delivers uncommon range.`,
    ],
    square: [
      `${capitalize(ra)} and ${capitalize(rb)} create friction by design: each exposes the other's lazy defaults. Progress comes through discomfort, checked in milestones; the mastery here is genuinely earned.`,
    ],
    trine: [
      `${capitalize(ra)} and ${capitalize(rb)} work together with zero friction: cooperation that needs no translation. The natural-talent label applies — just watch for coasting, which quietly undervalues the gift.`,
    ],
    sextile: [
      `${capitalize(ra)} and ${capitalize(rb)} trade favors when opportunities appear: dormant until called on, responsive when used, never demanding anything.`,
    ],
  };

  return { title: genericTitle[type], blocks: genericBody[type] };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Ranked shortlist: strongest, personal-planet-preferring aspects for chapters. */
export function pickAspectChapters(
  aspects: { a: string; b: string; type: string; strength: number; weight: number }[],
  max = 5
): { a: string; b: string; type: AspectType }[] {
  const PERSONAL = new Set(["sun", "moon", "mercury", "venus", "mars", "pluto", "saturn"]);
  const eligible = aspects.filter((x) => PERSONAL.has(x.a) && PERSONAL.has(x.b) && x.strength >= 0.2);
  const score = (x: { a: string; b: string; type: string; strength: number; weight: number }) => {
    let s = x.weight * x.strength * 2;
    for (const p of [x.a, x.b]) if (["sun", "moon", "venus", "mars"].includes(p)) s *= 1.25;
    return s;
  };
  return eligible.sort((x, y) => score(y) - score(x)).slice(0, max).map((x) => ({ a: x.a, b: x.b, type: x.type as AspectType }));
}
