import type { PlanetId, SignId } from "./types";

// Real, funny nicknames that a normal person would actually use.
// One nickname + one short funny description per planet-sign combo.
// The tone is a friend teasing you lovingly, not a robot describing a trait.

export interface NicknameEntry {
  nickname: string;
  description: string;  // short, funny, includes a compliment or light joke
}

export const TRAIT_NICKNAMES: Record<PlanetId, Partial<Record<SignId, NicknameEntry>>> = {
  sun: {
    aries: { nickname: "The Cannonball", description: "You cannonball into everything headfirst. It's either inspiring or terrifying, depending on who's watching." },
    taurus: { nickname: "The Cozy Fortress", description: "Impossible to move once you're comfortable. Your friends know dinner is always at yours." },
    gemini: { nickname: "The Group Chat", description: "You know everything about everyone and you're not even being nosy — people just tell you stuff." },
    cancer: { nickname: "The EmotionalArchivist", description: "You remember what someone said in 2019 and you still care. That's either sweet or concerning." },
    leo: { nickname: "Drama Queen", description: "You make life look like a movie. Sometimes it's a rom-com, sometimes it's a disaster film, but it's never boring." },
    virgo: { nickname: "The Fixer", description: "You'll reorganize someone's entire life and act like it was no big deal. They both love and fear you." },
    libra: { nickname: "The Charmer", description: "You could talk your way out of a parking ticket and into a wedding. People just want to agree with you." },
    scorpio: { nickname: "The Vault", description: "People tell you their darkest secrets because they know you'd rather die than repeat them. Also you haven't forgotten a single one." },
    sagittarius: { nickname: "The Escape Artist", description: "You have one foot out the door at all times, even when you're having a great time. Especially then." },
    capricorn: { nickname: "The CEO of Everything", description: "You've had a 5-year plan since you were 12. It's working. People are both impressed and slightly intimidated." },
    aquarius: { nickname: "The Wildcard", description: "Nobody knows what you're going to do next, including you. That's the fun part." },
    pisces: { nickname: "The Daydreamer", description: "You're physically here but spiritually somewhere else. The somewhere else is usually more interesting." },
  },
  moon: {
    aries: { nickname: "The Firecracker", description: "Your feelings go from 0 to 100 in 0.3 seconds. The good news: they're back to 0 just as fast." },
    taurus: { nickname: "The Comfort Seeker", description: "Your ideal evening is snacks, a blanket, and absolutely no surprises. And there's nothing wrong with that." },
    gemini: { nickname: "The Overthinker", description: "You've had the same conversation in your head 14 times and changed your mind 9 of those times." },
    cancer: { nickname: "The Feelings Sponge", description: "You walk into a room and absorb everyone's mood. You need a nap after parties." },
    leo: { nickname: "The Spotlight Heart", description: "You need to feel appreciated the way plants need sunlight. It's not needy, it's photosynthesis." },
    virgo: { nickname: "The Worrier", description: "You've thought of every possible thing that could go wrong. You're exhausted but also very prepared." },
    libra: { nickname: "The People Pleaser", description: "You'll change your entire opinion to avoid an argument, then quietly resent everyone involved." },
    scorpio: { nickname: "The Deep End", description: "Your feelings don't do shallow. It's either 'I'd die for you' or 'I never want to see you again.'" },
    sagittarius: { nickname: "The Free Spirit", description: "The moment someone makes you feel trapped, you're already mentally on a plane to somewhere." },
    capricorn: { nickname: "The Stoic", description: "You haven't cried in front of anyone since 2007 and you'd like to keep it that way, thank you." },
    aquarius: { nickname: "The Observer", description: "You watch yourself having feelings like it's a nature documentary. Fascinating, but from a safe distance." },
    pisces: { nickname: "The Empath", description: "You feel what the person three tables over is feeling. You don't even know them. It doesn't matter." },
  },
  mercury: {
    aries: { nickname: "The Blurter", description: "You say the thing everyone's thinking but nobody else would dare. It's refreshing and occasionally a disaster." },
    taurus: { nickname: "The Slow Thinker", description: "You take your sweet time forming an opinion, and once you have it, good luck changing it." },
    gemini: { nickname: "The Chatterbox", description: "You can talk to a brick wall and make it interesting. The brick wall will also tell you its life story." },
    cancer: { nickname: "The Feels Translator", description: "You explain emotions better than the person having them. They didn't even know that's what they felt." },
    leo: { nickname: "The Storyteller", description: "Everything you say sounds like a TED talk, and people are surprisingly here for it." },
    virgo: { nickname: "The Editor", description: "You mentally correct everyone's grammar and also their life choices. You're usually right, which makes it worse." },
    libra: { nickname: "The Smooth Talker", description: "You could sell ice to a penguin and the penguin would thank you. You're just that charming." },
    scorpio: { nickname: "The Interrogator", description: "You ask one question and suddenly the person has told you their entire childhood. They don't know how it happened." },
    sagittarius: { nickname: "The Truth Bomb", description: "You don't mean to be blunt, you just think everyone deserves the unfiltered truth. They usually don't want it." },
    capricorn: { nickname: "The Brief", description: "You say exactly what needs to be said and nothing more. People either love this or find it terrifying." },
    aquarius: { nickname: "The Concept Person", description: "You explain things nobody asked about and somehow make them fascinating. You're the human Wikipedia rabbit hole." },
    pisces: { nickname: "The Poet", description: "You describe things in ways that make people tear up. You didn't even mean to, you were just talking." },
  },
  venus: {
    aries: { nickname: "The Crush Machine", description: "You fall in love approximately 4 times a day. The barista, the stranger on the bus, the concept of love itself." },
    taurus: { nickname: "The Snuggle Bug", description: "Your love language is physical proximity, good food, and absolutely no plans on a Friday night." },
    gemini: { nickname: "The Flirt", description: "You don't even try, you just naturally flirt with everyone. The mail person thinks you're into them." },
    cancer: { nickname: "The Nurturer", description: "You show love by feeding people and asking if they're warm enough. It's aggressive caring." },
    leo: { nickname: "The Romantic", description: "Your idea of a date involves candles, a playlist you spent 3 hours curating, and at least one grand gesture." },
    virgo: { nickname: "The Acts of Service Person", description: "You fixed their sink, organized their closet, and remembered their mom's birthday. That's your flirting." },
    libra: { nickname: "The Charm Offensive", description: "You make everyone feel like the most interesting person in the room. It's devastating and effective." },
    scorpio: { nickname: "The All-In", description: "You don't do casual. You're either completely devoted or completely gone. There is no middle ground." },
    sagittarius: { nickname: "The Adventure Date", description: "Your ideal first date involves a passport. Your ideal second date involves a different passport." },
    capricorn: { nickname: "The Long Game", description: "You're not dating for fun, you're dating for a 401k and a mortgage. Refreshingly honest, actually." },
    aquarius: { nickname: "The Friend First", description: "You need to be friends before anything else, and 'anything else' is never quite what people expect." },
    pisces: { nickname: "The Soulmate Seeker", description: "You're looking for the kind of love that makes poets jealous. You've been disappointed. You're still looking." },
  },
  mars: {
    aries: { nickname: "The Firecracker", description: "You go from 0 to 100 before anyone else has found their shoes. Half the time it works out great." },
    taurus: { nickname: "The Bulldozer", description: "You're slow to start but once you're moving, no force on earth can stop you. Mountains have opinions about this." },
    gemini: { nickname: "The Multi-Tasker", description: "You're doing 7 things at once and somehow all of them are getting done. Nobody knows how." },
    cancer: { nickname: "The Mama Bear", description: "You're gentle until someone messes with your people. Then you're the scariest person in the room." },
    leo: { nickname: "The Showman", description: "You do everything with style. Even grocery shopping looks like a performance piece when you're involved." },
    virgo: { nickname: "The Perfectionist", description: "You'll redo something 12 times until it's right. Everyone else gave up at attempt 3. It's now perfect." },
    libra: { nickname: "The Diplomat", description: "You'd rather persuade than push, and honestly you usually win. People don't even realize they lost." },
    scorpio: { nickname: "The Relentless", description: "You don't give up. Ever. On anything. This is either inspiring or deeply concerning, depending on the situation." },
    sagittarius: { nickname: "The Adventurer", description: "You try everything once, and if you like it, you try it again in a different country." },
    capricorn: { nickname: "The Strategist", description: "You play chess while everyone else is playing checkers. You won 6 moves ago and they still don't know." },
    aquarius: { nickname: "The Rebel", description: "You fight for causes that haven't been invented yet. You're always right, just 10 years too early." },
    pisces: { nickname: "The Go-With-Flow", description: "You chase your dreams, which change approximately every Tuesday. But you chase them beautifully." },
  },
  jupiter: {
    aries: { nickname: "The Bold One", description: "You grow by doing the scary thing first. It works more often than it should." },
    taurus: { nickname: "The Patient Builder", description: "You grow slowly, like a tree. By the time people notice, you're already huge." },
    gemini: { nickname: "The Learner", description: "You know a little about everything. You're the best person to have at trivia night." },
    cancer: { nickname: "The Home Grower", description: "You grow through family, home, and emotional depth. Your dinner parties are legendary." },
    leo: { nickname: "The Shiner", description: "You grow by being seen and sharing your gifts. The spotlight is actually your sunlight." },
    virgo: { nickname: "The Master", description: "You grow by getting really, really good at something specific. Terrifyingly good." },
    libra: { nickname: "The Partner", description: "You grow through relationships. You're better when you have someone to grow with." },
    scorpio: { nickname: "The Transformer", description: "You grow by going through intense changes. You've reinvented yourself more times than Madonna." },
    sagittarius: { nickname: "The Explorer", description: "You grow by traveling, learning, and questioning everything. You have opinions about everything." },
    capricorn: { nickname: "The Ambitious", description: "You grow through discipline and long-term planning. Your patience is almost annoying." },
    aquarius: { nickname: "The Community Builder", description: "You grow by connecting with like-minded people. You know everyone in every group." },
    pisces: { nickname: "The Mystic", description: "You grow through compassion and intuition. You understand things you can't explain." },
  },
  saturn: {
    aries: { nickname: "The Brake Pedal", description: "Life keeps teaching you patience. You're getting better at it, but it's still not your favorite subject." },
    taurus: { nickname: "The Builder", description: "You're building material security one brick at a time. It's slow but it's real." },
    gemini: { nickname: "The Focused One", description: "You're learning to finish what you start. It's a work in progress. Literally." },
    cancer: { nickname: "The Responsible One", description: "You carry your family's emotional weight. You're good at it, but you're also tired." },
    leo: { nickname: "The Humble King", description: "You're learning that real authority doesn't need applause. It's a tough lesson." },
    virgo: { nickname: "The Craftsperson", description: "You do the unglamorous work that makes everything else possible. You're the foundation." },
    libra: { nickname: "The Commitment Person", description: "You're doing the real work of partnership, not just the romance part." },
    scorpio: { nickname: "The Truth Teller", description: "You face power and fear honestly. It's intense but you wouldn't have it any other way." },
    sagittarius: { nickname: "The Disciplined Seeker", description: "You're turning your big beliefs into actual lived practice. Less talking, more doing." },
    capricorn: { nickname: "The Boss", description: "You carry real authority and the weight that comes with it. You were born for this." },
    aquarius: { nickname: "The Structure Builder", description: "You build things that serve everyone. You're the architect of the group." },
    pisces: { nickname: "The Practical Dreamer", description: "You're learning to give form to your compassion. The dream is becoming real." },
  },
  uranus: {
    aries: { nickname: "The Plot Twist", description: "You reinvent yourself suddenly and without warning. Everyone's used to it by now." },
    taurus: { nickname: "The Pattern Breaker", description: "You keep disrupting your own comfort zone. It's confusing but it keeps things interesting." },
    gemini: { nickname: "The Mind Shift", description: "Your thinking changes abruptly. Yesterday's opinion is today's 'can you believe I used to think that?'" },
    cancer: { nickname: "The Home Rebel", description: "Your family life doesn't look like anyone else's. You're fine with that." },
    leo: { nickname: "The Surprise", description: "You keep shocking people with your choices. They've stopped being surprised by being surprised." },
    virgo: { nickname: "The Hacker", description: "You find unconventional solutions to everyday problems. Your routines are anything but routine." },
    libra: { nickname: "The Rule Breaker", description: "Your relationships don't follow the usual rules. You're writing your own manual." },
    scorpio: { nickname: "The Phoenix", description: "You go through sudden, deep transformations. You've had more lives than a cat." },
    sagittarius: { nickname: "The Belief Shaker", description: "Your worldview keeps getting rewritten. You're okay with not knowing." },
    capricorn: { nickname: "The Restructurer", description: "You approach ambition differently than expected. Your career path makes no sense and perfect sense." },
    aquarius: { nickname: "The Future", description: "You change communities and causes, not just yourself. You're ahead of everyone." },
    pisces: { nickname: "The Breakthrough", description: "You have mystical and artistic breakthroughs at the most unexpected moments." },
  },
  neptune: {
    aries: { nickname: "The Visionary", description: "You dream big and bold. The problem is getting yourself to actually follow through." },
    taurus: { nickname: "The Sensual Dreamer", description: "You idealize beauty and comfort. Pinterest was basically made for you." },
    gemini: { nickname: "The Idea Person", description: "You have inspired thoughts that come from nowhere. You should write them down more often." },
    cancer: { nickname: "The Home Dreamer", description: "You idealize home and family. Reality doesn't always match the dream, but you keep dreaming." },
    leo: { nickname: "The Glamour", description: "You dream of creative expression and being adored. You're a little extra and that's fine." },
    virgo: { nickname: "The Ideal Worker", description: "You idealize service and perfection. You're harder on yourself than any boss could be." },
    libra: { nickname: "The Romantic", description: "You idealize love. You see the best in people, sometimes past the point of realism." },
    scorpio: { nickname: "The Psychic", description: "You dream deep and you feel things before they happen. It's a little spooky." },
    sagittarius: { nickname: "The Mystic Seeker", description: "You dream of truth and meaning. You've read more philosophy books than most philosophers." },
    capricorn: { nickname: "The Ideal Builder", description: "You idealize ambition and calling. You dream of work that actually matters." },
    aquarius: { nickname: "The Utopian", description: "You dream of a better world for everyone. You're either a visionary or naive, depending on who you ask." },
    pisces: { nickname: "The Full Mystic", description: "You dream completely. The line between reality and imagination is more of a suggestion." },
  },
  pluto: {
    aries: { nickname: "The Reinventor", description: "You transform by destroying the old you. It's dramatic but effective." },
    taurus: { nickname: "The Value Shifter", description: "You transform what you value and own. Your relationship to money has changed completely." },
    gemini: { nickname: "The Mind Transformer", description: "You transform how you think. Your old beliefs don't survive contact with new information." },
    cancer: { nickname: "The Roots Shifter", description: "You transform family patterns. You're breaking cycles you didn't even know you were in." },
    leo: { nickname: "The Identity Transformer", description: "You transform how you express yourself. You've been several different people by now." },
    virgo: { nickname: "The Work Transformer", description: "You transform your relationship to work and service. You're not the same professional you were 10 years ago." },
    libra: { nickname: "The Relationship Transformer", description: "You transform how you do partnership. Your relationship patterns have been through hell and back." },
    scorpio: { nickname: "The Powerhouse", description: "You go to total depth. Pluto's home sign — you transform everything, repeatedly." },
    sagittarius: { nickname: "The Belief Transformer", description: "You transform your beliefs. What you believed at 20 and what you believe now are very different things." },
    capricorn: { nickname: "The Structure Transformer", description: "You transform structures and authority. You're here to change the system." },
    aquarius: { nickname: "The Community Transformer", description: "You transform communities and ideals. You leave every group different than you found it." },
    pisces: { nickname: "The Soul Transformer", description: "You transform through spiritual death and rebirth. It's as intense as it sounds." },
  },
  north_node: {
    aries: { nickname: "The Self Starter", description: "You're growing toward independence. Stop waiting for permission." },
    taurus: { nickname: "The Builder", description: "You're growing toward real security. Stop denying yourself comfort." },
    gemini: { nickname: "The Communicator", description: "You're growing toward curiosity and honest speech. Stop overthinking and start talking." },
    cancer: { nickname: "The Nurturer", description: "You're growing toward emotional depth. Stop controlling your feelings." },
    leo: { nickname: "The Shiner", description: "You're growing toward creative expression. Stop hiding in the group." },
    virgo: { nickname: "The Master", description: "You're growing toward skill and service. Stop waiting for the perfect moment." },
    libra: { nickname: "The Partner", description: "You're growing toward partnership. Stop going it alone." },
    scorpio: { nickname: "The Transformer", description: "You're growing toward depth and surrender. Stop holding on so tight." },
    sagittarius: { nickname: "The Explorer", description: "You're growing toward meaning and truth. Stop getting lost in details." },
    capricorn: { nickname: "The Climber", description: "You're growing toward authority. Stop waiting to feel ready." },
    aquarius: { nickname: "The Rebel", description: "You're growing toward community and your own path. Stop seeking approval." },
    pisces: { nickname: "The Mystic", description: "You're growing toward compassion. Stop trying to control everything." },
  },
  chiron: {
    aries: { nickname: "The Enough Healer", description: "Your wound is self-worth. Your gift is helping others feel they're enough — because you get it." },
    taurus: { nickname: "The Provider Healer", description: "Your wound is having enough. Your gift is helping others feel secure — because you've been there." },
    gemini: { nickname: "The Voice Healer", description: "Your wound is being heard. Your gift is helping others find their voice — because you lost yours." },
    cancer: { nickname: "The Home Healer", description: "Your wound is belonging. Your gift is helping others feel at home — because you've been homeless." },
    leo: { nickname: "The Shine Healer", description: "Your wound is being seen. Your gift is helping others shine — because you know what it's like to be invisible." },
    virgo: { nickname: "The Improve Healer", description: "Your wound is being good enough. Your gift is helping others improve — because you've been there." },
    libra: { nickname: "The Connect Healer", description: "Your wound is relationship. Your gift is helping others connect — because you've been alone." },
    scorpio: { nickname: "The Depth Healer", description: "Your wound is trust. Your gift is helping others go deep — because you've been to the bottom." },
    sagittarius: { nickname: "The Truth Healer", description: "Your wound is meaning. Your gift is helping others find it — because you've been lost." },
    capricorn: { nickname: "The Earn It Healer", description: "Your wound is recognition. Your gift is helping others earn it — because you've been overlooked." },
    aquarius: { nickname: "The Fit Healer", description: "Your wound is belonging to a group. Your gift is helping others find their people — because you've been the outsider." },
    pisces: { nickname: "The Compassion Healer", description: "Your wound is carrying everyone's pain. Your gift is helping others heal — because you feel it all." },
  },
  lilith: {
    aries: { nickname: "The Untamed", description: "Your wild self refuses to ask permission. Own it — it's your power." },
    taurus: { nickname: "The Possessive", description: "Your wild self won't let go of what's yours. It's fierce and a little scary." },
    gemini: { nickname: "The Sharp Tongue", description: "Your wild self says the things you're not supposed to say. It's cutting and honest." },
    cancer: { nickname: "The Fierce Protector", description: "Your wild self protects with raw emotional power. Don't cross your people." },
    leo: { nickname: "The Unapologetic", description: "Your wild self shines without permission. It's bold and impossible to ignore." },
    virgo: { nickname: "The Refuser", description: "Your wild self refuses to be diminished or used. It sets hard boundaries." },
    libra: { nickname: "The Compromise Refuser", description: "Your wild self won't compromise for peace. It demands real fairness." },
    scorpio: { nickname: "The Raw Power", description: "Your wild self is pure desire and intensity. It's scary and magnetic." },
    sagittarius: { nickname: "The Honest Rebel", description: "Your wild self speaks truth and breaks rules. It's free and unpredictable." },
    capricorn: { nickname: "The Obeys No One", description: "Your wild self pursues ambition on its own terms. It's relentless." },
    aquarius: { nickname: "The Cause Fighter", description: "Your wild self fights for principle, not popularity. It's principled and unbending." },
    pisces: { nickname: "The Formless", description: "Your wild self can't be contained or defined. It's vast and a little overwhelming." },
  },
};

// Get the nickname entry (nickname + description) for a planet-sign combo.
export function getNicknameEntry(planet: PlanetId, sign: SignId): NicknameEntry {
  const entry = TRAIT_NICKNAMES[planet]?.[sign];
  if (entry) return entry;
  return { nickname: "The Mystery", description: "You're one of a kind, and that's all there is to it." };
}

// Get just the nickname string.
export function getBestNickname(planet: PlanetId, sign: SignId): string {
  return getNicknameEntry(planet, sign).nickname;
}

// Backwards compat: returns an array of nickname strings (just the nickname, repeated for the old interface)
export function getNicknames(planet: PlanetId, sign: SignId): string[] {
  const entry = getNicknameEntry(planet, sign);
  return [entry.nickname];
}
