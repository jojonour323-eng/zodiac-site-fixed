// ===========================================================================
// OUTER HOUSES — where the slow planets land, plus the general 12-house map.
// Written for total beginners: short sentences, everyday words.
// Same gv-safety rules as the rest of the deep engine (repeat the subject
// instead of coordinating finite verbs after "they").
// ===========================================================================

type OuterRole = "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";

/** One or two plain sentences per outer planet in each house. */
const OUTER_HOUSES: Record<OuterRole, Record<number, string>> = {
  jupiter: {
    1: "Jupiter in house 1: the luck is personal — opportunities find them directly, and people naturally bet on them.",
    2: "Jupiter in house 2: money grows steadily over time. The trap is spending as fast as it arrives — the account loves them and they love it back.",
    3: "Jupiter in house 3: good fortune travels through words — siblings, neighbors, classmates, and everyday conversations keep opening doors.",
    4: "Jupiter in house 4: home is the lucky base. Family support runs unusually large, and life keeps upgrading where or how they live.",
    5: "Jupiter in house 5: luck flows through fun — creativity, romance, and play actually pay them back. Taking enjoyment seriously is not wasted time here.",
    6: "Jupiter in house 6: good things come through daily work and health routines. Jobs keep getting slightly better, and helping coworkers pays back in strange, useful ways.",
    7: "Jupiter in house 7: other people are the luck — partners and close allies bring opportunities that solo effort never could.",
    8: "Jupiter in house 8: money and second chances often arrive through other people — shared resources, inheritance, or someone investing in them.",
    9: "Jupiter in house 9: luck lives far away — travel, education, and big ideas expand their life every time they say yes.",
    10: "Jupiter in house 10: public life favors them. Bosses and audiences give them the benefit of the doubt, and their reputation tends to keep climbing.",
    11: "Jupiter in house 11: friends are the fortune — the right group at the right time keeps rescuing them and lifting them higher.",
    12: "Jupiter in house 12: luck works quietly, from behind the scenes. Time alone restores them, and protection keeps showing up right when things look worst.",
  },
  saturn: {
    1: "Saturn in house 1: early on they seemed older than their age — the serious one. That weight became steady strength they can rely on now.",
    2: "Saturn in house 2: money feels tight or slow at first — but what they build later is rock solid, in the bank and in their own sense of worth.",
    3: "Saturn in house 3: speaking up felt risky early. Now their words carry weight, because they choose them carefully.",
    4: "Saturn in house 4: family duty landed on them early. Everything they build later rests on foundations they poured themselves.",
    5: "Saturn in house 5: fun took practice — play and creativity felt like serious business, until they learned to let joy in without earning it first.",
    6: "Saturn in house 6: work and health run on duty. The habit of over-giving never stops on its own, so rest has to be scheduled on purpose.",
    7: "Saturn in house 7: relationships come with real weight. Commitment is the classroom here, and they take partnership more seriously than most people ever will.",
    8: "Saturn in house 8: trust is the exam. Sharing money, bodies, or secrets takes them years — but the bonds that pass are unbreakable.",
    9: "Saturn in house 9: they doubt easy answers and big promises. That makes them slow to commit to a worldview — and impossible to fool.",
    10: "Saturn in house 10: career is the mountain. Progress is slow and the slope is steep — they usually reach the top later than everyone, but far more solidly.",
    11: "Saturn in house 11: friendship feels like an interview — they keep few friends, and those last a lifetime. Groups get their full loyalty only once earned.",
    12: "Saturn in house 12: their fears and worries live backstage, quietly draining energy. Naming them out loud turns off most of their power.",
  },
  uranus: {
    1: "Uranus in house 1: first impressions include 'there's something different about this one' — their look, energy, or way of talking doesn't match any template.",
    2: "Uranus in house 2: income arrives in unusual ways and can jump up or down suddenly. Steady, for them, means diverse — not predictable.",
    3: "Uranus in house 3: their mind works in flashes. They say things that surprise even themselves, and their thinking runs a step ahead of the room.",
    4: "Uranus in house 4: home life had breaks or big moves, and the home they build as adults looks nothing like the childhood version.",
    5: "Uranus in house 5: their creativity is unconventional. The ideas people call weird at first tend to become the ones people copy.",
    6: "Uranus in house 6: strict routines physically bother them. They do their best work inside their own strange system, not the official one.",
    7: "Uranus in house 7: their relationships refuse the standard script — sudden starts, unusual partners, and rules they write together instead of inheriting.",
    8: "Uranus in house 8: intimacy and shared money carry sudden turns. Trust gets tested in unexpected ways, and reinvention happens in jumps.",
    9: "Uranus in house 9: their beliefs don't come from tradition. They build their worldview from raw experience and keep updating it without warning.",
    10: "Uranus in house 10: their career path makes no sense on paper — leaps, switches, and reinventions that only look obvious in hindsight.",
    11: "Uranus in house 11: they collect the misfits. Their friends are unusual people, and joining or leaving one group tends to change their whole direction.",
    12: "Uranus in house 12: their intuition arrives like lightning — sudden knowings from nowhere that usually turn out right.",
  },
  neptune: {
    1: "Neptune in house 1: people project onto them — they see what they want to see. Being misunderstood comes free; the upside is a natural magnetism nobody can quite name.",
    2: "Neptune in house 2: money can slip through their fingers — vague about numbers, generous by reflex. Simple systems work better than willpower here.",
    3: "Neptune in house 3: their words carry music. They think in images and stories, and plain facts need translating into their language.",
    4: "Neptune in house 4: home is the dream. They need a beautiful, peaceful space more than most people, and family memories blur nicer than they were.",
    5: "Neptune in house 5: romance and art are where the magic is real. Falling for potential instead of the actual person is the recurring trap.",
    6: "Neptune in house 6: boring routines dissolve their energy. They need daily work to mean something — or the body starts sending signals.",
    7: "Neptune in house 7: they fall for souls, not resumes — idealizing partners at first. Slow courtship and honest friends keep them grounded.",
    8: "Neptune in house 8: intimacy is spiritual for them. Merging with someone can feel like losing themselves, so they need a self to come back to.",
    9: "Neptune in house 9: they're spiritual by nature. Meaning matters more than facts, and their best answers arrive as feelings, not arguments.",
    10: "Neptune in house 10: their career needs a dream attached — titles alone never feed them. Public image can also glow bigger than the reality.",
    11: "Neptune in house 11: they love humanity more than individuals sometimes. Friendships run on shared dreams, and disappointment hits hard when friends turn out ordinary.",
    12: "Neptune in house 12: the sponge at maximum — they absorb the moods of everyone around them. Solitude isn't optional here; it's how they empty out other people's weather.",
  },
  pluto: {
    1: "Pluto in house 1: their presence is felt before they speak — intense eyes, strong energy, impossible to ignore. Life keeps tearing down and rebuilding their identity, and each version is stronger.",
    2: "Pluto in house 2: money and self-worth have been through collapse-and-rebuild cycles. They never take security for granted again, and their drive to provide is enormous.",
    3: "Pluto in house 3: their words can cut or uncover. They ask the questions others are afraid to ask, and small talk has never once satisfied them.",
    4: "Pluto in house 4: family life carried power struggles or heavy undercurrents. As adults they build the safe, honest home they didn't get, and they guard it fiercely.",
    5: "Pluto in house 5: passion is total. Love and creativity consume them whole, and half-hearted hobbies feel like a waste of their one life.",
    6: "Pluto in house 6: work is all-or-nothing. They can out-obsess anyone on a task they care about — burnout is the shadow to watch.",
    7: "Pluto in house 7: relationships are the crucible. Intense bonds, real betrayals, real loyalty — and partners who change them permanently.",
    8: "Pluto in house 8: this is Pluto at home. Intimacy, trust, and life-and-death feelings run at full depth — they handle crises better than anyone around them.",
    9: "Pluto in house 9: their beliefs are life-or-death serious. They'll tear down an entire worldview and rebuild it if reality demands it.",
    10: "Pluto in house 10: ambition with teeth. They don't just want a career — they want their name to mean something, and they'll outlast every rival to get it.",
    11: "Pluto in house 11: friendships transform them. One group can redirect their whole life, and betrayal from a friend cuts deeper than romance.",
    12: "Pluto in house 12: their power works invisibly — deep intuition, quiet endurance, and the ability to survive storms nobody else even sees coming.",
  },
};

/** House line for an outer planet, or "" when no valid house. */
export function outerHouseLine(planet: string, house: number): string {
  const map = OUTER_HOUSES[planet as OuterRole];
  if (!map || !Number.isInteger(house) || house < 1 || house > 12) return "";
  return map[house] ?? "";
}

// ---------------------------------------------------------------------------
// THE 12 HOUSES — general meanings for people who have never studied
// astrology. One short, plain explanation each.
// ---------------------------------------------------------------------------

export const HOUSE_PLAIN: { name: string; line: string }[] = [
  { name: "Self and first impressions", line: "how they walk into a room, their body, their style — the way people size them up in the first ten seconds." },
  { name: "Money and self-worth", line: "earning, spending, saving — and the quiet kind of confidence that comes from feeling secure." },
  { name: "Talking and daily life", line: "conversations, siblings, neighbors, texts, short trips, and everything picked up by staying curious." },
  { name: "Home and family", line: "where they come from, who raised them, the home they build now, and their most private self." },
  { name: "Fun, romance, creativity", line: "flirting, hobbies, art, games, being a kid at heart — the parts of life that are supposed to be enjoyable." },
  { name: "Work routines and health", line: "daily jobs, habits, exercise, food, doctor visits — the small repeated stuff that decides how smoothly life runs." },
  { name: "Partners", line: "husbands, wives, best friends, business partners — the one-on-one bonds where a person commits." },
  { name: "Deep trust and big changes", line: "intimacy, shared money, secrets, big losses and big comebacks — the stuff most people avoid talking about." },
  { name: "Big ideas and far places", line: "travel, university, beliefs, philosophy — everything that stretches a world bigger." },
  { name: "Career and reputation", line: "the job, the public name, what strangers assume, and what they want to be known for." },
  { name: "Friends and the future", line: "friend groups, communities, teams, and the big hopes for the years ahead." },
  { name: "The hidden room", line: "the private inner world — dreams, fears, secrets, healing, everything kept even from people who know them well." },
];

/** Display order for planets named inside the houses map (personal first). */
export const HOUSE_PLANET_ORDER = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto", "north_node",
  "chiron", "lilith",
];
