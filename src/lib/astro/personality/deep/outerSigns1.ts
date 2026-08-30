// ===========================================================================
// OUTER SIGNS 1/2 — JUPITER & SATURN sign content, written for total
// beginners: short sentences, everyday words, zero astrology jargon.
// ---------------------------------------------------------------------------
// Authoring rules (same as the rest of the deep engine):
//   - neutral third-person plural ("they want"), gv() genderizes at render
//   - no coordinated finite verbs right after "they" ("they X and Y" becomes
//     "she X and Y" — repeat the subject or use gerunds instead)
//   - no banned intro fillers, no banned vocabulary (see test_simple_english)
// ---------------------------------------------------------------------------

export interface OuterSignContent {
  /** Sign-level meaning. 2 short paragraphs, plain words. */
  core: string[];
  /**
   * Sentence fragment that combines with a house area name into a personal
   * conclusion: "<Put> money, security, and self-worth." Capitalized later.
   */
  put: string;
}

export type OuterSignMap = Record<string, OuterSignContent>;

/** Primers now live in primers.ts (all 12 walkthrough items in one place). */
export { OUTER_PRIMER } from "./primers";

// ── JUPITER — luck, growth, where chances keep showing up ──────────────────

export const JUPITER_SIGNS: OuterSignMap = {
  aries: {
    core: [
      "Jupiter in Aries: luck shows up when they move first. Doors open because they start things — even before they feel ready. Waiting for the perfect moment actually costs them chances.",
      "The trick this placement rewards: bold beats careful. When they ask directly, try early, and risk looking silly, the odds bend in their favor more often than they'd predict.",
    ],
    put: "the good luck tends to show up in",
  },
  taurus: {
    core: [
      "Jupiter in Taurus: good things grow slowly and reliably. This is one of the luckiest spots for money and comfort — not wild wins, but steady ones that keep paying year after year.",
      "Their job is mostly not to rush it. When they build at their own pace — savings, skills, a calm home — the result tends to last longer than anyone expected, including theirs.",
    ],
    put: "the good luck tends to pile up in",
  },
  gemini: {
    core: [
      "Jupiter in Gemini: luck travels through words. Talking to people, asking questions, reading, trying small new skills — that's where their chances keep coming from.",
      "They meet opportunity in ordinary conversations, not grand plans. The person they chat with in a queue is statistically more likely to change their life than a five-year strategy is.",
    ],
    put: "the lucky breaks tend to come through",
  },
  cancer: {
    core: [
      "Jupiter in Cancer: luck comes through people who care about them. Family, close friends, or someone who treats them like family tends to open the biggest doors.",
      "A warm home base protects their good fortune. And the care they give out — food, shelter, checking in — genuinely comes back to them, usually when they need it most.",
    ],
    put: "the good fortune tends to gather around",
  },
  leo: {
    core: [
      "Jupiter in Leo: luck arrives when they let themselves be seen. Confidence attracts help — people love backing them once they put themselves out there.",
      "Creative risks and generous gestures tend to come back around bigger. The times they hid their shine were, historically, the times the luck stayed home.",
    ],
    put: "the lucky spotlight tends to fall on",
  },
  virgo: {
    core: [
      "Jupiter in Virgo: luck hides in small daily work. Fixing things, getting better at a craft, being genuinely useful — opportunities attach themselves to reliability.",
      "They don't win lotteries; they win trust, and trust pays steadily. The quiet reputation for doing things properly is this placement's actual gold mine.",
    ],
    put: "the steady good luck tends to build in",
  },
  libra: {
    core: [
      "Jupiter in Libra: luck comes in twos. Partners, close friends, and friendly strangers are their good fortune — deals, introductions, and second chances usually arrive through someone else.",
      "Being fair keeps that pipeline open. Every time they play a situation honestly, the people who noticed send more good their way.",
    ],
    put: "the lucky partnerships tend to form in",
  },
  scorpio: {
    core: [
      "Jupiter in Scorpio: luck runs deep and often arrives through other people's resources — shared money, investments, or someone believing in them enough to stake them.",
      "Every ending they survive quietly hands them more power. Their luck curve looks flat for years, then jumps — usually right after they let something die that was already over.",
    ],
    put: "the deep, late-blooming luck tends to come through",
  },
  sagittarius: {
    core: [
      "Jupiter in Sagittarius: this is Jupiter at home — the luckiest placement it gets. Life keeps handing them room to grow: travel, teachers, chances to see more of everything.",
      "Their optimism is not naive. The world actually tends to catch them when they leap, which is why they keep leaping — and why it keeps working.",
    ],
    put: "the wide-open luck tends to pour through",
  },
  capricorn: {
    core: [
      "Jupiter in Capricorn: luck works like compound interest here. Nothing comes easy at the start — but everything they build keeps growing, and the second half of their life usually beats the first.",
      "Patience is their actual lucky charm. Every boring, disciplined year deposits something, and the interest shows up later as respect, position, and real security.",
    ],
    put: "the slow-compounding luck tends to gather in",
  },
  aquarius: {
    core: [
      "Jupiter in Aquarius: luck comes from being exactly themselves — the odd idea, the unusual crowd, the thing nobody else is doing yet.",
      "Groups and communities open doors that one-on-one gatekeepers keep shut. When they stop sanding down what makes them different, it starts paying.",
    ],
    put: "the unconventional luck tends to arrive through",
  },
  pisces: {
    core: [
      "Jupiter in Pisces: luck arrives sideways — through kindness, gut feelings, and strange coincidences that somehow work out.",
      "Helping someone with no guarantee of payback tends to return multiplied. And their intuition is genuinely lucky: when something feels right without a reason, it usually is.",
    ],
    put: "the quiet, sideways luck tends to flow through",
  },
};

// ── SATURN — the strict teacher: weight, tests, and earned strength ────────

export const SATURN_SIGNS: OuterSignMap = {
  aries: {
    core: [
      "Saturn in Aries: the hard lesson is confidence. Acting alone, being the decider, or putting themselves first can feel risky — so life keeps making them practice it.",
      "Every time they do hard things on their own, the courage becomes permanent. The people who seem fearless usually just passed this class earlier; they're passing it now.",
    ],
    put: "the heaviest lessons keep coming from",
  },
  taurus: {
    core: [
      "Saturn in Taurus: the hard lesson is security. Money, food, or a stable base may have felt shaky early on — so they take safety very seriously as adults.",
      "The upside is real: over the years they get extremely good at building steady, lasting things. What they own at 40 tends to be worth more than what flashier people own.",
    ],
    put: "the hardest lessons keep coming through",
  },
  gemini: {
    core: [
      "Saturn in Gemini: the hard lesson is speaking up. Early on, their words may have been judged or dismissed, so they choose them carefully now.",
      "The upside: when they finally speak, they sound like someone who thinks before talking — because they do. That earned weight is worth more than fast talkers will ever have.",
    ],
    put: "the tough lessons keep showing up around",
  },
  cancer: {
    core: [
      "Saturn in Cancer: the hard lesson is family and feelings. Home may not have felt fully safe growing up, so as adults they build their own version of family very deliberately.",
      "The walls they make are real — and once someone is let inside, they protect that bond for life. Learning to trust slowly is not damage here; it's the actual skill.",
    ],
    put: "life keeps testing them in",
  },
  leo: {
    core: [
      "Saturn in Leo: the hard lesson is being seen. Attention can feel unsafe — like something that can be judged or taken away — so they downplay their shine.",
      "Life keeps handing them stages anyway. Each time they take one, the fear gets quieter. The world is not waiting to humiliate them; it's waiting to enjoy them.",
    ],
    put: "the toughest tests keep arriving in",
  },
  virgo: {
    core: [
      "Saturn in Virgo: the hard lesson is their own standards. They judge their work more brutally than anyone else ever could — which makes them genuinely excellent and quietly exhausted.",
      "The lesson isn't to care less. It's to let good enough be good sometimes, because the extra 10% they sweat over usually costs more than it returns.",
    ],
    put: "the heaviest pressure comes from",
  },
  libra: {
    core: [
      "Saturn in Libra: the hard lesson is relationships. Partnerships come with real weight here — commitments that test them, people who mirror their unfinished business back at them.",
      "Each serious bond teaches the same skill: staying fair without disappearing. When they finally hold that balance, they become the steadiest person most people know.",
    ],
    put: "the hardest tests keep coming through",
  },
  scorpio: {
    core: [
      "Saturn in Scorpio: the hard lesson is trust and control. Letting someone all the way in — or letting go of a situation — feels dangerous, so they grip.",
      "Life repeats that class until they learn it: what they can't control can still be survived. Every surrender they practice makes the next one cheaper.",
    ],
    put: "the deep tests keep happening around",
  },
  sagittarius: {
    core: [
      "Saturn in Sagittarius: the hard lesson is beliefs. They question big ideas — religion, rules, what everyone claims is true — and have to build their own answers from scratch.",
      "What they end up believing is solid, because they earned every piece of it. Nobody can shake a worldview that survived being tested on purpose.",
    ],
    put: "the serious questions keep coming from",
  },
  capricorn: {
    core: [
      "Saturn in Capricorn: this is Saturn at home, so the weight feels like normal life to them. They expect a lot from themselves, carry duties quietly, and grew up fast.",
      "The payoff is real: they tend to become the person everyone relies on, with the achievements to show for it. The missing class is letting someone else carry things sometimes.",
    ],
    put: "the pressure keeps building around",
  },
  aquarius: {
    core: [
      "Saturn in Aquarius: the hard lesson is belonging. Groups can feel conditional — like acceptance has rules they never agreed to — so they either stand slightly outside or test the rules.",
      "Over time they find their people by being genuinely themselves, not by fitting the template. The belonging that survives that honesty is the kind that lasts.",
    ],
    put: "the hard lessons keep arriving through",
  },
  pisces: {
    core: [
      "Saturn in Pisces: the hard lesson is boundaries. Their soft heart absorbs everyone's problems, and the world happily hands them more than their share.",
      "Learning to say 'that's not mine to carry' is the whole class. Passing it turns their compassion into a strength instead of a leak — and they still get to be kind.",
    ],
    put: "the heavy lessons keep coming through",
  },
};
