// ===========================================================================
// HOUSE LINES — what a planet IN A HOUSE adds to a placement chapter
// ---------------------------------------------------------------------------
// BEGINNER RULE (global website rule): each line must read like it's being
// explained to someone who has never seen a birth chart. Plain words, short
// sentences, no astro shorthand. One or two sentences per planet+house combo.
// These are woven INTO Sun/Moon/Mercury/Venus/Mars chapters.
// Authored in neutral plural voice; gv() genderizes at render.
// WRITING GUARDS: vary the openers between roles so chapters don't rhyme;
// no "they X and Y" finite-verb chains (gv() mangles them) — use gerunds or
// restate the subject.
// ===========================================================================

type Role = "sun" | "moon" | "mercury" | "venus" | "mars";

const HOUSES: Record<number, { area: string; lines: Partial<Record<Role, string[]>> & { any?: string[] } }> = {
  1: {
    area: "identity itself",
    lines: {
      sun: ["The Sun sits in house 1 — the house of the self itself. Everything about them is more visible than they plan: their posture, their choices, their way of walking into a room. Who they are is not a private thing here. It broadcasts."],
      moon: ["The Moon sits in house 1, so the feelings show before words do. People can read their mood within seconds of saying hello. Hiding an emotion is possible for about a minute."],
      mercury: ["Mercury sits in house 1 — the mind works in public. Thoughts come out fast, first impressions form instantly, and thinking is something people can watch them do."],
      venus: ["Venus sits in house 1, so pleasantness is part of the package. People tend to find them likeable or good-looking before a single word is said. Looks and first impressions genuinely matter to how they feel about themselves."],
      mars: ["Mars sits in house 1 — the drive is visible in the body. Restless energy, a competitive streak, and a walk that says 'I'm going somewhere' before any conversation starts."],
    },
  },
  2: {
    area: "money, security, and self-worth",
    lines: {
      sun: ["The Sun sits in house 2 — the house of money, safety, and self-worth. Feeling like a real person comes down to practical checks: money coming in, skills that hold value, promises kept. Praise is nice, but a paid bill proves more."],
      moon: ["The Moon sits in house 2, which ties calm feelings directly to feeling safe about money. Money stress becomes mood stress almost the same day. Savings aren't just savings — they're peace of mind."],
      mercury: ["Mercury sits in house 2 — the mind thinks in terms of worth and cost. Conversations drift to 'but is it actually useful?' fast. Trade-offs, prices, and value are interesting to them by default."],
      venus: ["Venus sits in house 2, so love shows up as giving. Good food, real gifts, comfort arranged on purpose — spending money on someone IS the affection, made visible."],
      mars: ["Mars sits in house 2 — the drive connects straight to earning. When income or safety is the goal, they can outwork almost anybody."],
    },
  },
  3: {
    area: "communication, siblings, daily movement",
    lines: {
      sun: ["The Sun sits in house 3 — the house of talking, learning, and everyday movement. They basically ARE how they speak: opinions coming out constantly, facts collected from everywhere, always half-writing something in their head."],
      moon: ["The Moon sits in house 3, so feelings need to be spoken out loud to be understood. Texting siblings, chatting with neighbors, thinking by talking — silence actually slows their emotional processing down."],
      mercury: ["Mercury sits in house 3, which is Mercury's home base — the mind gets extra sharp here. Words multiply, wit speeds up, and they learn better through people and conversation than through books."],
      venus: ["Venus sits in house 3, so attraction starts with conversation. Flirty texts, shared jokes, wordplay — if the talking is good, the interest is already halfway there."],
      mars: ["Mars sits in house 3 — arguments are where this energy lives. They enjoy a real debate, use sarcasm well, and compete with words before anything physical."],
    },
  },
  4: {
    area: "home, family roots, private foundations",
    lines: {
      sun: ["The Sun sits in house 4 — the house of home and family. Everything they build on the outside rests on having a solid base: a real home, a private space, family that holds. Success without that base feels fake to them."],
      moon: ["The Moon sits in house 4 — its own house — so home and feelings are the same system. The living space gets set up with real care, because the walls genuinely hold their nervous system together."],
      mercury: ["Mercury sits in house 4 — the mind turns private and looks backward. Family history, old conversations, big decisions made quietly at the kitchen table overnight instead of out loud in meetings."],
      venus: ["Venus sits in house 4, so love turns domestic fast. Cooking together, nesting, meeting the family early — romance means building a private world worth hiding inside."],
      mars: ["Mars sits in house 4 — the fighting instinct protects home turf. Conflict over family, house, or private boundaries triggers a level of force that shocks people who've only seen their usual calm."],
    },
  },
  5: {
    area: "romance, creativity, play, performance",
    lines: {
      sun: ["The Sun sits in house 5 — the house of fun, romance, and creative output. Self-expression isn't a hobby here; it's the engine. Being ordinary on purpose would feel like an insult to who they are."],
      moon: ["The Moon sits in house 5, so feelings want a stage. Joy needs a celebration, sadness needs an outlet like music or art, and drama genuinely cleans their emotional system out."],
      mercury: ["Mercury sits in house 5 — the mind plays. Puns, games, wild ideas, stories. Even serious subjects go down easier once they're dressed up as fun."],
      venus: ["Venus sits in house 5 — the house of romance — so romance is the main event. Grand gestures feel natural, flirting is a sport, and a relationship without any spark confuses them completely."],
      mars: ["Mars sits in house 5, so desire runs through games and play. Sports, bets, creative rivalry — the chase honestly feels better than the win."],
    },
  },
  6: {
    area: "work routines, health, acts of service",
    lines: {
      sun: ["The Sun sits in house 6 — the house of daily work and health. Identity gets earned every single day here: being useful, staying healthy, keeping systems running. It builds real reliability — and a quiet tiredness nobody sees."],
      moon: ["The Moon sits in house 6, so feelings depend on routine. A broken schedule becomes a broken mood. Helping people with small practical things is actually how they calm their own inner weather."],
      mercury: ["Mercury sits in house 6 — the mind organizes. Lists, fixes, spotting mistakes as a hobby. Worry shows up as triple-checking, and busy-but-useful work is what makes them calm again."],
      venus: ["Venus sits in house 6, so love comes out as service. Rides given, problems absorbed, errands remembered. Nobody applauds it, but this is how they say 'I love you' — louder than any grand gesture."],
      mars: ["Mars sits in house 6 — the drive goes into steady work. Consistent effort beats talented but lazy, every time. Anger usually leaks out as overwork instead of a fight."],
    },
  },
  7: {
    area: "partnership and one-on-one bonds",
    lines: {
      sun: ["The Sun sits in house 7 — the house of serious one-on-one partnership. The people they pair up with, in love or in work, define whole chapters of their life. Being someone's real partner matters more to them than being publicly impressive."],
      moon: ["The Moon sits in house 7, so emotional safety comes from one committed bond — not from a crowd. One good relationship steadies them more than ten friendships, for better and for worse."],
      mercury: ["Mercury sits in house 7 — the mind works best as a conversation. Ideas get tested on another person before they trust them. Deciding alone feels off; talking it through feels honest."],
      venus: ["Venus sits in house 7 — the house of partnership — so being paired is the natural state. Single stretches feel like waiting rooms no matter how long they last. They're most drawn to people who clearly choose them back."],
      mars: ["Mars sits in house 7 — conflict lives inside close relationships. Strangers never see the temper; partners know every version of it. The stakes are just higher where the feelings are."],
    },
  },
  8: {
    area: "intimacy, trust, shared resources, transformation",
    lines: {
      sun: ["The Sun sits in house 8 — the house of depth, trust, and big changes. Identity here rebuilds itself a few times in a lifetime: crises survived, trust built and broken, rooms most people never enter. A shallow life genuinely can't hold them."],
      moon: ["The Moon sits in house 8, so the emotional life runs underground. Trust questions go all the way down, closeness needs to be total, and betrayal gets remembered with interest. Nothing about this Moon is casual."],
      mercury: ["Mercury sits in house 8 — the mind investigates. Secrets, motives, psychology, taboo subjects. Small talk starves this mind; a truth-or-nothing conversation at midnight feeds it."],
      venus: ["Venus sits in house 8, so attraction means going deep. Mystery, intensity, the willingness to be changed by someone — casual arrangements don't just bore them, they short-circuit the whole wiring."],
      mars: ["Mars sits in house 8 — desire here has real weight. When they commit to something or someone, it's all-in, and fights (when they happen) tend to rearrange the whole relationship."],
    },
  },
  9: {
    area: "beliefs, travel, meaning, higher learning",
    lines: {
      sun: ["The Sun sits in house 9 — the house of big ideas, travel, and meaning. They grow by going further: other countries, bigger questions, beliefs tested against real life. A small life feels like slow suffocation to them."],
      moon: ["The Moon sits in house 9, so mood follows horizon. Travel lifts them almost chemically, learning something new settles them, and being stuck in a small box — literal or mental — drains them fast."],
      mercury: ["Mercury sits in house 9 — the mind goes for the big picture. Meaning, belief, teaching, the 'why' behind everything. Details get delegated; the vision stays theirs."],
      venus: ["Venus sits in house 9, so attraction crosses borders. Different backgrounds, foreign accents, someone who teaches them something. Love also needs room to talk about big ideas, or it thins out."],
      mars: ["Mars sits in house 9 — the drive aims at expeditions. Big learning curves, real adventures, causes they defend like missionaries once convinced."],
    },
  },
  10: {
    area: "career, reputation, public role",
    lines: {
      sun: ["The Sun sits in house 10 — the house of career and public reputation. Reputation isn't vanity here; it's the structure itself. Job choices are identity choices, and respect in their field feeds the core self directly."],
      moon: ["The Moon sits in house 10, so feelings tie to work standing more than they'd like. A bad week at work becomes a bad mood everywhere. Public appreciation soothes them in a way private comfort barely reaches."],
      mercury: ["Mercury sits in house 10 — the mind stays career-shaped. Strategy, positioning, saying the right thing to the right people. Even their 'fun reading' is suspiciously useful."],
      venus: ["Venus sits in house 10, so attraction follows competence. Someone good at what they do reads as beautiful here. How the couple looks in public genuinely matters to them."],
      mars: ["Mars sits in house 10 — ambition stacks visibly. Promotions chased, reputation built brick by brick. Even fights get handled carefully, because there's always an audience in this house."],
    },
  },
  11: {
    area: "friendships, communities, long-term visions",
    lines: {
      sun: ["The Sun sits in house 11 — the house of friends, groups, and long-term hopes. They find out who they are partly through their people: friend groups are a mirror, and a cause gives their effort weight. Doing life fully alone isn't the plan here."],
      moon: ["The Moon sits in house 11, so the group is the emotional home base. The group chat steadies them more than any single friend does. Feeling included matters a lot — being left out genuinely hurts, and it shows."],
      mercury: ["Mercury sits in house 11 — the mind works socially. Brainstorming refuels them, and they deliberately collect smart people to sharpen ideas against."],
      venus: ["Venus sits in house 11, so the main road to love runs through friendship. Attraction grows from familiarity and shared circles — strangers start too far away to date comfortably."],
      mars: ["Mars sits in house 11 — ambition works as a team sport. Group wins beat solo glory, networks get used openly and well, and the competitive fire lights up hardest when the group's stakes are on the table."],
    },
  },
  12: {
    area: "the private inner world, solitude, the unconscious",
    lines: {
      sun: ["The Sun sits in house 12 — the house of the private inner world. Big parts of who they are stay backstage on purpose. Even close friends hold only partial maps. Being alone isn't lonely here; it's maintenance."],
      moon: ["The Moon sits in house 12, so feelings process invisibly. Felt at full depth, shown at almost zero volume. This Moon needs real, unsupervised alone time to digest ordinary life — that's not a mood, it's a requirement."],
      mercury: ["Mercury sits in house 12 — the mind works privately, at length, before anything goes public. Thoughts get aged for years. The conclusion arrives suddenly and sounds final, because privately it's been done for a while."],
      venus: ["Venus sits in house 12, so love runs quietly. Crushes stay completely hidden, feelings live in a rich private world, and affection comes out late and selectively — but overwhelmingly once it finally does."],
      mars: ["Mars sits in house 12 — anger turns inward. Frustration converts to exhaustion or a bad stomach instead of words, until the pressure finds a way out that looks like it came from nowhere."],
    },
  },
};

/**
 * House overlay paragraph for a placement chapter, or "" if none applies
 * (e.g. birth time unknown → houses unavailable).
 */
export function houseLine(planet: string, house: number, rng: () => number): string {
  if (!Number.isInteger(house) || house < 1 || house > 12) return "";
  const h = HOUSES[house];
  const pool = h.lines[planet as Role] ?? h.lines.any ?? [];
  if (!pool.length) return "";
  return pool[Math.floor(rng() * pool.length) % pool.length];
}

/** Where-life-concentrates blurb used by synthesis sections. */
export function houseAreaName(house: number): string {
  return HOUSES[house]?.area ?? "that area of life";
}
