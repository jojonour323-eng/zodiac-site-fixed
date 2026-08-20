import type { PlanetId, SignId } from "./types";
import { SIGN_META, ELEMENT_VIBE } from "./signs";

// Interpretations are written in plain English, the way a friend who
// actually knows astrology would explain it. Each (planet, sign) combination
// gets its own specific behavior, not generic element+modality boilerplate.

export interface TraitPoint {
  label: string;   // "YOU ARE" / "YOU DON'T" / "YOU MOVE" etc.
  text: string;    // the specific trait description
}

export interface PlanetSignInterp {
  headline: string;   // punchy one-liner shown at the top of the card
  short: string;      // 1-2 sentence summary (kept for backwards compat)
  traits: TraitPoint[];  // list of YOU-form trait points
  long: {
    positive: string;
    shadow: string;
    takeaway: string;
  };
}

// Conversational role labels for every planet. These show up as small tags
// next to every placement on the site, so someone with zero astrology
// background can follow along.
export const PLANET_ROLES: Record<PlanetId, string> = {
  sun: "Core Self \u2014 who you are",
  moon: "Emotions \u2014 how you feel inside",
  mercury: "Communication & Thinking",
  venus: "Love & Attraction",
  mars: "Drive & Action",
  jupiter: "Luck & Growth",
  saturn: "Discipline & Limits",
  uranus: "Change & Rebellion",
  neptune: "Dreams & Imagination",
  pluto: "Power & Transformation",
  north_node: "Life Path \u2014 where you're growing",
  chiron: "Wound & Healing Gift",
  lilith: "Hidden Desires \u2014 your wild side",
};

// Short tag-only version for compact displays.
export const PLANET_ROLE_SHORT: Record<PlanetId, string> = {
  sun: "Core Self",
  moon: "Emotions",
  mercury: "Thinking & Talking",
  venus: "Love & Attraction",
  mars: "Drive & Action",
  jupiter: "Luck & Growth",
  saturn: "Discipline & Limits",
  uranus: "Change & Rebellion",
  neptune: "Dreams & Imagination",
  pluto: "Power & Transformation",
  north_node: "Life Path",
  chiron: "Wound & Healing",
  lilith: "Hidden Desires",
};

// Emoji for every planet, point, and angle. Chosen to match what each one
// actually controls, so a glance at the emoji tells you the topic.
export const PLANET_EMOJI: Record<PlanetId, string> = {
  sun: "\u2600\uFE0F",       // sun
  moon: "\u{1F319}",         // crescent moon
  mercury: "\u{1F4AC}",      // speech balloon
  venus: "\u{1F49E}",        // revolving hearts (love & attraction)
  mars: "\u{1F525}",         // fire
  jupiter: "\u{1F331}",      // seedling (growth)
  saturn: "\u{1F9ED}",       // compass (structure / direction)
  uranus: "\u26A1",          // lightning bolt (sudden change)
  neptune: "\u{1F4A7}",      // droplet (dreams, water, dissolve)
  pluto: "\u{1F480}",        // skull (death & rebirth)
  north_node: "\u{1F9ED}",   // compass (life path direction)
  chiron: "\u{1FA79}",       // bandage (wound & healing)
  lilith: "\u{1F510}",       // lock with key (hidden / untamed)
};

// Emoji for the angles (Ascendant, Midheaven, etc.) used in compatibility.
export const ANGLE_EMOJI: Record<string, string> = {
  asc: "\u{1F9D9}",      // mage / mask
  mc: "\u{1F451}",       // crown (calling, public role)
  desc: "\u{1F91D}",     // handshake (partnership)
  ic: "\u{1F3E1}",       // house with garden (roots)
  vertex: "\u2728",      // sparkles (fated point)
};

// Look up the emoji for any point id (planet or angle).
export function pointEmoji(id: string): string {
  const lower = id.toLowerCase();
  if (lower in PLANET_EMOJI) {
    return PLANET_EMOJI[lower as PlanetId];
  }
  return ANGLE_EMOJI[lower] || "\u2728";
}

// Short display name for any point id (handles "north_node", "asc", etc.).
export function pointDisplayName(id: string): string {
  const lower = id.toLowerCase();
  if (lower === "asc") return "Ascendant";
  if (lower === "mc") return "Midheaven";
  if (lower === "desc") return "Descendant";
  if (lower === "ic") return "IC";
  if (lower === "vertex") return "Vertex";
  if (lower === "north_node") return "North Node";
  if (lower === "chiron") return "Chiron";
  if (lower === "lilith") return "Lilith";
  return id.charAt(0).toUpperCase() + id.slice(1);
}

// ---- Per-planet sign behaviors. Each function returns 1-2 specific lines
// for what that planet in that sign actually looks like in a person's life.

function sunInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const map: Record<SignId, { short: string; positive: string; shadow: string; takeaway: string }> = {
    aries: {
      short: `You're wired to start things. You see what you want and you go after it \u2014 hesitation isn't really your thing.`,
      positive: "You're brave, direct, and you don't wait around for permission. When something needs doing, you do it \u2014 people follow you because you move first, and your enthusiasm is genuinely contagious. In daily life, you're the one who initiates plans, speaks up first in meetings, and isn't afraid to try something new on a Tuesday. At work, you're a natural starter \u2014 great at launching projects, pitching ideas, and rallying people around a goal. In relationships, you're passionate and honest; you don't play games and you expect the same. Under stress, your instinct is to act \u2014 you'd rather do something than sit with anxiety. You recover from setbacks remarkably fast; you're already onto the next thing while others are still processing the last one. Over time, you grow by learning that not everything needs to be solved right now, and that some battles are won by waiting.",
      shadow: "Patience is your lifelong challenge. You can steamroll people who move slower, and you start things you don't finish \u2014 the excitement of the beginning is more fun than the grind of the middle. At work, this means you might have a desk full of half-finished projects. In relationships, your temper flares fast and burns out fast, but the words you say in that window can do real damage. Under stress, you can become aggressive, impatient, or reckless \u2014 acting before thinking. You may struggle with listening, especially when you've already decided what to do. Over time, the shadow shows up as burnout from constantly charging forward without resting.",
      takeaway: "Count to ten before you react. Finish what you start before chasing the next spark. And learn to sit with discomfort \u2014 not every problem needs to be solved in the next 30 seconds.",
    },
    taurus: {
      short: `You're here for the real, lasting stuff \u2014 good food, good people, a life you can touch and trust.`,
      positive: "You're steady, sensual, and you build things that last. Once you commit to a person or a path, you don't flinch \u2014 your loyalty is real, not performed. In daily life, you're the person who remembers the good restaurant, keeps the comfortable home, and shows up consistently. At work, you're the one who actually finishes things \u2014 you don't get distracted by the latest shiny idea. You're patient with process, good with resources, and people trust you with money and responsibility. In relationships, you're devoted and physical \u2014 your love language is presence, touch, and making sure the other person is fed and comfortable. Under stress, you slow down rather than speed up, which can be a superpower or a problem. You have genuine good taste and you don't pretend to like things you don't. Over time, you grow by learning that change isn't always a threat \u2014 sometimes it's the door to something even better than what you're holding onto.",
      shadow: "Your stubbornness is your blind spot. You can dig in and refuse to move even when moving is clearly the right call \u2014 'steady' can calcify into 'stuck' without you noticing. At work, you may resist new systems, new people, or new approaches long after the old way has stopped working. In relationships, you can hold on past the expiration date because change feels worse than the slow pain of staying. Under stress, you comfort yourself with stuff \u2014 food, shopping, scrolling, accumulating \u2014 and it takes a while before you notice you're doing it. You can also be possessive, confusing love with ownership. Over time, the shadow shows up as rigidity \u2014 the world moves and you refuse to move with it.",
      takeaway: "Notice when 'steady' has turned into 'stuck.' The discomfort of change is usually shorter than the cost of staying. And let go of one thing this year that you've been holding onto past its time.",
    },
    gemini: {
      short: `You live in your head and you love it there. You're curious about everything and bored by repetition.`,
      positive: "You're quick, funny, and you can talk to anyone about anything. You connect ideas and people in ways others miss. Learning is your happy place \u2014 you'd rather know a little about a lot than a lot about a little. You keep things light, which is a gift.",
      shadow: "You can skim the surface and miss the depth. You start ten books and finish two. People sometimes can't tell if you're really listening or just waiting to talk. Commitment is hard when there's always something more interesting around the corner.",
      takeaway: "Pick one thing and go deep this year \u2014 depth is where the surprise is.",
    },
    cancer: {
      short: `You feel everything and you take care of your people, even when it costs you.`,
      positive: "You're nurturing, intuitive, and loyal in a way that's hard to fake. You can read a room before anyone speaks. Your home and the people in it mean everything to you. You remember the small things \u2014 birthdays, the way someone takes their coffee, what they said they were worried about three months ago.",
      shadow: "You take things personally that weren't meant that way. You can retreat into your shell and wait for people to chase you, then resent them when they don't. Mood swings are real, and you expect people to just know what's wrong.",
      takeaway: "Say it out loud instead of waiting for people to read your mind \u2014 they can't, even when they love you.",
    },
    leo: {
      short: `Your Sun sign means you've got warmth and presence \u2014 you light up a room and you know it.`,
      positive: "You're generous, expressive, and you make people feel seen. You've got a big heart and you're not afraid to show it. You take pride in what you do and you want to be recognized for it \u2014 not because you're vain, but because you put real effort in. Kids and creative projects bring out your best.",
      shadow: "You need attention more than you admit, and you can get sulky or dramatic when you don't get it. Pride can stop you from apologizing first. You make everything about you without realizing you're doing it.",
      takeaway: "Shine the spotlight on someone else once in a while \u2014 it comes back to you doubled.",
    },
    virgo: {
      short: `You notice what's off and you want to fix it. You're the person who actually reads the instructions.`,
      positive: "You're sharp, helpful, and you care about getting things right. You see the detail everyone else misses. Helping is how you show love \u2014 you'll plan the trip, remember the allergies, fix the thing. You're not flashy about it, but you make everything around you work better.",
      shadow: "You're harder on yourself than anyone knows. The inner critic never shuts up. You can slip into nitpicking and not realize you're making people feel like nothing they do is ever enough. You also have trouble accepting help \u2014 you'd rather do it yourself.",
      takeaway: "Talk to yourself the way you talk to a friend \u2014 you're way more harsh internally than you'd ever be out loud.",
    },
    libra: {
      short: `You want things fair, pretty, and harmonious. You'd rather find middle ground than win a fight.`,
      positive: "You're charming, fair, and genuinely good at seeing all sides of a situation. You make people feel comfortable. You've got real taste \u2014 in art, in clothes, in how a room is laid out. Partnership matters to you, and you put real work into making relationships work.",
      shadow: "You'll swallow your own opinion to keep the peace, then feel resentful later. Decisions are hard because you can see every option. You can stay in a bad situation way too long hoping it'll smooth itself out.",
      takeaway: "Pick a side sometimes, even when it's uncomfortable \u2014 your real opinion is worth more than a fake yes.",
    },
    scorpio: {
      short: `You go deep. Surface stuff bores you \u2014 you want the truth, even when it's ugly.`,
      positive: "You're intense, loyal, and you read people like a book. You can tell when someone's lying, when something's off, when there's a secret in the room. Once you let someone in, you're all in \u2014 protective, devoted, the kind of person people call at 3am. You transform yourself over and over across your life.",
      shadow: "You can hold grudges for years. You don't forget, and sometimes you don't forgive either. Jealousy and possessiveness show up when you feel threatened. You can also test people in ways they don't know they're being tested.",
      takeaway: "Let one old grudge go this year \u2014 it's taking up space you could use for something better.",
    },
    sagittarius: {
      short: `You want the big picture, the next adventure, and the truth \u2014 in that order.`,
      positive: "You're honest, optimistic, and you hate being fenced in. You learn by doing and going. You've got a talent for teaching and storytelling \u2014 you make big ideas feel doable. People like being around you because you make life feel like it has possibilities.",
      shadow: "You can be blunt to the point of careless. You over-promise because the future always sounds better than the present. Commitment is hard because 'what if there's something better' is always humming in the background. You sometimes flee when things get heavy.",
      takeaway: "Stay for the boring middle part of something \u2014 that's where the real reward is hiding.",
    },
    capricorn: {
      short: `You play the long game. You knew what you wanted early and you're willing to climb for it.`,
      positive: "You're disciplined, responsible, and you take yourself seriously in a good way. You build things \u2014 a career, a home, a reputation \u2014 that last. You don't complain, you just handle it. Younger you probably felt older than your years, and it pays off later when everyone else is still figuring it out.",
      shadow: "You can be cold without realizing it. Work comes before people more often than you'd like to admit. You're hard on yourself and you don't let yourself off the hook. Rest feels like a weakness, which means burnout is a real risk.",
      takeaway: "Schedule rest the way you schedule work \u2014 your body is not a machine, even if it acts like one.",
    },
    aquarius: {
      short: `You see the world a little differently than most people, and you're fine with that.`,
      positive: "You're original, idealistic, and you actually care about the big picture \u2014 society, the future, what's fair for everyone. You think for yourself and you don't follow the crowd just because it's moving. Your friends are an eclectic mix and you like it that way.",
      shadow: "You can feel emotionally distant even to people you love. You'd rather be right than be close. You can be stubborn about your ideas in a way that feels like you're not really listening. 'Different' can become a wall instead of a window.",
      takeaway: "Let one person in on what you're actually feeling this week \u2014 it won't kill your independence, promise.",
    },
    pisces: {
      short: `You feel things other people can't put into words. You've got a rich inner world.`,
      positive: "You're empathetic, creative, and you absorb the world like a sponge. Music, art, and quiet moments hit you harder than they hit most people. You can feel what someone else is feeling before they say a word. You've got real intuition \u2014 not the cheesy kind, the kind that's actually right more often than not.",
      shadow: "Boundaries are hard. You take on other people's stuff and forget what's yours. You can drift into escapism \u2014 too much scrolling, too much drinking, too much daydreaming \u2014 when life gets heavy. You let things slide because confronting them feels too harsh.",
      takeaway: "Build one small daily ritual that's just yours \u2014 it gives your sponge-self something to wring out into.",
    },
  };
  return map[s] || { short: m.short, positive: m.vibe, shadow: "", takeaway: "" };
}

function moonInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const map: Record<SignId, { short: string; positive: string; shadow: string; takeaway: string }> = {
    aries: {
      short: `Your feelings come on fast and hot. You react first, then think about it.`,
      positive: "You don't sit on feelings \u2014 you process them in real time. If something's wrong, you say it. You recover from emotional hits fast because you don't bottle things up. You need emotional honesty, even when it's loud.",
      shadow: "Your temper can go off before your brain catches up. You can say things in the heat of the moment that you can't take back. You're not great at sitting with someone else's slow feelings \u2014 you want them to just deal with it already.",
      takeaway: "Sleep on the big reactions \u2014 the feeling is real, but the words can wait till morning.",
    },
    taurus: {
      short: `You need calm, comfort, and stability to feel okay inside.`,
      positive: "You're emotionally steady in a way other people lean on. Once you feel safe with someone, you're loyal and present. You take pleasure in small, physical things \u2014 good food, soft textures, a comfortable home \u2014 and they actually do reset you.",
      shadow: "You can shut down emotionally when you're stressed instead of talking. You resist change even when change is what you need. Comfort can slide into stagnation \u2014 the same routine, the same food, the same everything, because trying something new feels risky.",
      takeaway: "Notice when 'I'm fine' is actually 'I'm overwhelmed' \u2014 naming it is the first step to feeling better.",
    },
    gemini: {
      short: `You process feelings through your head \u2014 you talk them out, think them through, sometimes joke them away.`,
      positive: "You can find words for what you're feeling faster than almost anyone. Talking genuinely helps you. You're curious about other people's inner lives too, which makes you a good friend to vent to. Humor is one of your coping skills, and it works.",
      shadow: "You can intellectualize feelings instead of actually feeling them. You'll talk around something for hours without ever landing on it. Restlessness means you flee emotionally heavy moments instead of staying.",
      takeaway: "Once in a while, put the words down and just sit with the feeling \u2014 it won't hurt you, and it has information for you.",
    },
    cancer: {
      short: `You feel things deeply and you need a safe home base to come back to.`,
      positive: "Your emotional radar is unmatched \u2014 you know when someone's off before they do. You're nurturing and you remember the small things that make people feel loved. Home is your recharge station, and you build it carefully.",
      shadow: "You can retreat into your shell and expect people to come after you, then get hurt when they don't. You hold onto old hurts longer than is good for you. Mood shifts are real and can come out of nowhere \u2014 yours, and you absorb other people's too.",
      takeaway: "Tell people what you need instead of waiting for them to guess \u2014 they want to show up, they just don't always know how.",
    },
    leo: {
      short: `You need to feel seen and appreciated \u2014 not for show, but because it tells you you matter.`,
      positive: "You're warm, generous, and you feel things big. You celebrate your people hard \u2014 birthdays, wins, you go all in. You've got a playful side that comes out when you feel safe. Your heart is bigger than you let on.",
      shadow: "When you feel ignored or unappreciated, it hits you harder than you'd admit. You can get dramatic to get attention without realizing that's what you're doing. Pride can stop you from admitting you're hurt.",
      takeaway: "Ask for the appreciation you need out loud \u2014 most people want to give it, they just don't realize you need to hear it.",
    },
    virgo: {
      short: `You handle feelings by doing something about them \u2014 fixing, organizing, helping.`,
      positive: "You're emotionally thoughtful in a way that's actually rare \u2014 you remember what people said they needed and you do it. You process feelings best when your hands are busy. You're the friend who shows up with soup, not just texts.",
      shadow: "You turn feelings into tasks because tasks are easier. You can criticize yourself into the ground over small things. You'll help everyone else and forget to ask for help yourself.",
      takeaway: "Try just naming the feeling out loud once \u2014 not fixing it, not solving it, just 'I'm sad about this.' See what happens.",
    },
    libra: {
      short: `You feel best when things are peaceful and balanced. Conflict throws you off internally.`,
      positive: "You're emotionally attuned to other people \u2014 you can feel the temperature of a room instantly. You genuinely want everyone to be okay. You process feelings best in conversation with someone you trust.",
      shadow: "You'll swallow your own feelings to keep the peace, then build up resentment. You can stay in emotionally off situations because confronting them feels worse. Indecision isn't laziness \u2014 it's you trying to honor every feeling at once.",
      takeaway: "Ask yourself what YOU want, separately from what would make everyone else comfortable \u2014 that answer matters.",
    },
    scorpio: {
      short: `Your inner emotional life is deep, private, and intense. You don't let just anyone in.`,
      positive: "Your feelings are real and you don't do fake. Once you trust someone, you love them with a loyalty that's hard to shake. You can sit with heavy emotions \u2014 yours and other people's \u2014 without flinching. Your intuition about people is sharp.",
      shadow: "You can hold onto emotional wounds for years. Jealousy and possessiveness are real risks \u2014 when you feel threatened, you can clamp down. You test people without telling them you're testing them.",
      takeaway: "Trust someone with one true thing this week \u2014 the right people respond by getting closer, not running.",
    },
    sagittarius: {
      short: `You process feelings through meaning \u2014 you need to understand why, not just feel it.`,
      positive: "You bounce back emotionally because you can find the bigger picture in hard things. You need emotional freedom \u2014 being hemmed in feels suffocating. You're honest about what you're feeling, to a fault.",
      shadow: "You can flee emotionally when things get heavy. 'I just need space' can become a pattern of avoiding real intimacy. You process feelings so fast that you skip the actual feeling part.",
      takeaway: "Stay in one hard conversation a little longer than is comfortable \u2014 the freedom you want is on the other side of it.",
    },
    capricorn: {
      short: `You keep your feelings under control \u2014 more than is good for you.`,
      positive: "You're emotionally responsible \u2014 you don't dump your stuff on other people. You can hold it together when others fall apart, which makes you a rock in hard times. You process feelings privately and on your own schedule.",
      shadow: "You can be so controlled that feelings come out sideways \u2014 as a headache, a snappy comment, a sudden wall. You might equate 'having needs' with 'being weak.' Loneliness is a real risk because you don't reach out even when you should.",
      takeaway: "Tell one person one real thing this week \u2014 it doesn't make you weak, it makes you human.",
    },
    aquarius: {
      short: `You feel things but you watch yourself feeling them, like from a slight distance.`,
      positive: "You can stay objective in emotional situations where others lose it. You're emotionally fair \u2014 you don't play favorites. You care about people in the big-picture sense, and your detachment can be a real gift in a crisis.",
      shadow: "You can feel emotionally unreachable even to people you love. You'd rather understand a feeling than actually have it. Intimacy requires you to drop the observer act, and that's hard for you.",
      takeaway: "Once in a while, let yourself feel something without trying to understand it \u2014 just feel it, that's allowed.",
    },
    pisces: {
      short: `Your emotional life is huge, soft, and a little porous \u2014 you absorb everything.`,
      positive: "You feel what other people feel, sometimes before they do. Your empathy is real, not performed. Music, art, water, and quiet can reset you emotionally. You've got genuine intuition \u2014 not the woo kind, the kind that's actually right.",
      shadow: "Boundaries between your feelings and other people's are blurry. You can drown in someone else's emotional stuff and forget what's yours. Escapism is a real risk when it all gets too much \u2014 screens, substances, daydreams.",
      takeaway: "Have one place that's just yours \u2014 a room, a walk, a journal \u2014 where you can untangle what's actually yours.",
    },
  };
  return map[s];
}

function mercuryInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const map: Record<SignId, { short: string; positive: string; shadow: string; takeaway: string }> = {
    aries: {
      short: `You think fast and you talk blunt. You say what you mean and you don't dress it up much.`,
      positive: "You're quick on your feet and you can make a decision without agonizing. You're honest, sometimes refreshingly so. In a debate, you're sharp and you don't back down.",
      shadow: "You can cut people off without realizing it. Your mouth runs ahead of your brain sometimes. 'Just being honest' can be an excuse for being harsh.",
      takeaway: "Pause for one breath before you respond \u2014 it doesn't slow you down, it sharpens you.",
    },
    taurus: {
      short: `You think deliberately and you don't change your mind easily. Your words carry weight.`,
      positive: "You think things through. Once you've made up your mind, you're not easily swayed by a flashy argument. You explain things in plain, practical language. People trust what you say because you don't waste words.",
      shadow: "You can dig into a position and refuse to move even when new info shows up. Stubbornness in conversation is real. You tune out people who talk too fast or too much.",
      takeaway: "Once in a while, let yourself be talked into something \u2014 you might be surprised.",
    },
    gemini: {
      short: `You think in webs. One idea leads to ten more, and you can talk to anyone about anything.`,
      positive: "You're quick, witty, and you absorb information like a sponge. You can make connections other people miss. Small talk is genuinely fun for you, and so is big talk. You can translate between groups of people who don't usually get each other.",
      shadow: "You can talk around a feeling instead of into it. You start ten things and finish two. You can come across as scattered even when you're actually tracking.",
      takeaway: "Pick one conversation this week to go deep in \u2014 not wide, deep.",
    },
    cancer: {
      short: `You think with your feelings. How something feels matters as much as the facts.`,
      positive: "You can read between the lines of what people say. You remember emotional details \u2014 what someone was worried about, what they were hoping for. You're careful with your words because you know they can hurt.",
      shadow: "You can take things personally that weren't meant that way. You sometimes communicate sideways instead of directly, hinting instead of saying. You can hold onto an offhand comment for years.",
      takeaway: "Ask 'is this about me?' before you absorb it \u2014 half the time, it isn't.",
    },
    leo: {
      short: `You talk with warmth and a little flair. You're good at telling stories.`,
      positive: "You've got presence when you speak. You can make people laugh, make them care, make them feel something. You're generous with compliments and you mean them. You're good at encouraging people.",
      shadow: "You can dominate conversations without realizing it. You talk in declarations when a question would serve better. Pride can stop you from admitting you were wrong.",
      takeaway: "Ask one more question than feels natural \u2014 it opens doors your declarations won't.",
    },
    virgo: {
      short: `You think in details. You catch what other people miss and your words are precise.`,
      positive: "You're sharp, analytical, and you can break complicated things down into steps. You remember specifics. You give useful feedback because you actually noticed the thing. Your words are measured and they land.",
      shadow: "You can nitpick without realizing it. The inner critic is loud and you sometimes aim it outward. You can get so caught up in details that you miss the bigger picture.",
      takeaway: "For every one thing you correct, name two things that are working \u2014 it changes the whole conversation.",
    },
    libra: {
      short: `You communicate with charm and you can see every side of a question.`,
      positive: "You can frame things in a way that doesn't make people defensive. You're fair and you actually listen. You're good at mediating \u2014 you can find the version of the truth that both sides can accept.",
      shadow: "You can take so long to decide that the moment passes. You sometimes soften your message so much that the real point gets lost. You'll avoid saying the hard thing directly.",
      takeaway: "Practice saying the hard thing kindly but clearly \u2014 you can do both, you just don't always try.",
    },
    scorpio: {
      short: `You think deeply and you read people well. You don't miss a lie.`,
      positive: "You can see what's underneath a conversation \u2014 what's not being said, what someone's actually worried about. You ask the questions other people are too polite to ask. Your words have weight because you don't waste them.",
      shadow: "You can be too blunt in a cutting way. You hold onto things people said in arguments long after they've forgotten. Sarcasm is a defense mechanism.",
      takeaway: "Use your radar for connection, not just detection \u2014 it works for both, and connection feels better.",
    },
    sagittarius: {
      short: `You think in big pictures and you talk straight. You're not into small talk.`,
      positive: "You're honest, optimistic, and you can make big ideas feel doable. You're a natural teacher \u2014 you explain things in a way that makes people excited. You keep conversations moving forward.",
      shadow: "You can be blunt to the point of careless. You over-promise because the future always sounds better than the present. You miss details because you're already three steps ahead.",
      takeaway: "Underline the details when they matter \u2014 they're not boring, they're what make the big thing real.",
    },
    capricorn: {
      short: `You communicate carefully and with purpose. You don't waste words.`,
      positive: "You think strategically and you say what needs to be said, no more. You're good at structuring complicated ideas. People trust your judgment because you don't exaggerate. You can deliver hard news without flinching.",
      shadow: "You can come across as cold or dry. You miss the emotional undertone of a conversation. You'll skip the small talk that builds rapport.",
      takeaway: "Add one warm sentence before the practical one \u2014 it costs you nothing and changes how it lands.",
    },
    aquarius: {
      short: `You think originally and you see things other people miss. You like a good idea more than a comfortable one.`,
      positive: "You can see patterns and possibilities that other people don't. You think for yourself and you're not afraid to challenge a consensus. You're good at brainstorming and you genuinely enjoy other people's weird ideas.",
      shadow: "You can be so attached to being different that you disagree just to disagree. You can come across as emotionally detached in conversation. You explain things in a way that loses people.",
      takeaway: "Once in a while, agree with the obvious thing \u2014 it doesn't make you less original.",
    },
    pisces: {
      short: `You think in images and feelings more than in straight lines. You're poetic without trying.`,
      positive: "You can pick up the emotional subtext of a conversation. You communicate through metaphor, story, and feel. You're good with creative work and you can sit with someone's pain without trying to fix it.",
      shadow: "You can be vague when you need to be specific. You absorb other people's opinions without noticing. Details slip through the cracks because you're tracking the vibe.",
      takeaway: "Write the important things down \u2014 your memory is great for feelings, less great for facts.",
    },
  };
  return map[s];
}

function venusInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const map: Record<SignId, { short: string; positive: string; shadow: string; takeaway: string }> = {
    aries: {
      short: `You fall fast and you love the chase. You want to feel the spark.`,
      positive: "You're direct about who you want and you go for it. You bring passion and freshness into relationships \u2014 you don't let them get stale. You're generous with affection when you're into someone.",
      shadow: "You can lose interest once the chase is over. You can rush into things before you really know the person. Arguments can flare hot and burn out fast.",
      takeaway: "Stay past the honeymoon phase with someone worth it \u2014 the deeper love comes after the spark.",
    },
    taurus: {
      short: `You love through the body \u2014 touch, food, comfort, presence. You want love you can feel.`,
      positive: "You're sensual, loyal, and you show up consistently. You want a love that's built to last, and you put in the work. You've got real taste and you make your shared space beautiful.",
      shadow: "You can hold onto relationships past their expiration date because change feels worse than the slow pain. Possessiveness is real. You can love through comfort food and stuff when you're stressed.",
      takeaway: "Check in on whether you're staying out of love or out of habit \u2014 the answer matters.",
    },
    gemini: {
      short: `You fall in love through conversation. Words are your love language.`,
      positive: "You're playful, witty, and you keep things light in a good way. You need mental stimulation in a partner \u2014 if the conversation dies, so does your interest. You're a great flirt because you actually listen.",
      shadow: "You can get bored once the talking becomes routine. You can send mixed signals because you're tracking multiple possibilities. You might confuse attention for connection.",
      takeaway: "Go deep with one conversation instead of wide with five \u2014 that's where the real love shows up.",
    },
    cancer: {
      short: `You love through care. You want to feed, nurture, and protect the people you love.`,
      positive: "You're tender, devoted, and you remember what your people need. You want to build a home with someone, not just a fling. Your love is consistent and protective.",
      shadow: "You can smother without realizing it. You can take care of people so hard that they feel like they can't do anything themselves. Mood swings affect your relationships.",
      takeaway: "Ask 'do you want comfort or solutions?' before you leap in \u2014 it saves everyone a lot of friction.",
    },
    leo: {
      short: `You love big and you want to be adored back. Romance is supposed to feel like a movie.`,
      positive: "You're generous, warm, and you go all in on the people you love. You give grand gestures and you remember anniversaries. You want a love you can be proud of, and you'll work for it.",
      shadow: "You need a lot of reassurance and you can get sulky when you don't get it. Pride can stop you from apologizing. You can compete with your partner for the spotlight without realizing it.",
      takeaway: "Notice when you're performing love instead of just feeling it \u2014 the quiet version lands harder.",
    },
    virgo: {
      short: `You love through small acts of service. You do the dishes, you remember the allergies.`,
      positive: "You're thoughtful, reliable, and you notice what your person actually needs. Your love shows up in the details \u2014 you'll fix the thing, plan the trip, make sure they've eaten. You don't make a big show of it.",
      shadow: "You can criticize in the name of helping. You can give so much that you forget to receive. You're harder on your partner than you realize because you hold them to your own standards.",
      takeaway: "Receive once in a while without returning the favor \u2014 it's actually a gift to your person.",
    },
    libra: {
      short: `You're a classic romantic. You want partnership, beauty, and real equality.`,
      positive: "You're charming, fair, and you genuinely want a relationship that feels like a partnership. You're good at compromise and you make your person feel special. You've got great taste in dates, gifts, and shared spaces.",
      shadow: "You can avoid conflict so hard that real issues pile up. You'll swallow your own needs to keep the peace. You can stay in a relationship past its expiration date because ending it feels too messy.",
      takeaway: "Have the hard conversation early \u2014 it's less messy than the explosion later.",
    },
    scorpio: {
      short: `You love intense and deep. You want to merge, not just date.`,
      positive: "You're devoted, passionate, and you love with everything you have. Once you're in, you're in. You want to know your person at a level most people don't reach \u2014 and you want to be known that way too.",
      shadow: "Jealousy and possessiveness are real risks. You can test people without telling them. You hold onto relationships that have died because letting go feels like surgery.",
      takeaway: "Trust your person until they give you a reason not to \u2014 suspicion costs you the relationship even when nothing's wrong.",
    },
    sagittarius: {
      short: `You love with freedom. You want a partner in adventure, not a warden.`,
      positive: "You're fun, honest, and you bring optimism into your relationships. You want a partner who's also your friend and your adventure buddy. You don't do jealousy well, which can be a relief.",
      shadow: "You can flee when things get heavy. Commitment can feel like a cage even when it isn't. You can be blunt in ways that hurt without you realizing.",
      takeaway: "Stay for one hard conversation \u2014 the right partner will make the room feel bigger, not smaller.",
    },
    capricorn: {
      short: `You take love seriously. You want to build something that lasts.`,
      positive: "You're loyal, responsible, and you show up. You don't do flings lightly \u2014 you're in it for real. You want a partnership that's also a team, and you'll put in the work to make it happen.",
      shadow: "You can come across as emotionally reserved. You might prioritize the relationship's stability over its warmth. You can stay in something practical long after the love has gone.",
      takeaway: "Tell your person you love them out loud, unprompted, once a week \u2014 it changes the whole temperature.",
    },
    aquarius: {
      short: `You love unconventionally. You want a partner who's also a friend and a fellow weirdo.`,
      positive: "You're open-minded, fair, and you don't do jealousy. You want a relationship that respects both people's independence. You're attracted to people who are a little different \u2014 the boring conventional type doesn't do it for you.",
      shadow: "You can feel emotionally distant even to people you love. You might prioritize friendship over romance and wonder why the spark fades. You can be more committed to your ideals than to your person.",
      takeaway: "Let your person see you without the cool detached act once in a while \u2014 it's the real intimacy.",
    },
    pisces: {
      short: `You love romantically, deeply, and a little spiritually. You want a soulmate, not just a partner.`,
      positive: "You're tender, devoted, and you love without limits. You can feel your person's mood shift before they say anything. You bring poetry into relationships \u2014 small gestures, real romance, the works.",
      shadow: "You can idealize people and miss red flags. You'll absorb your partner's emotional state and forget what's yours. Boundaries are hard, and you can lose yourself in someone else.",
      takeaway: "Keep one part of your life that's just yours \u2014 it makes you a better partner, not a worse one.",
    },
  };
  return map[s];
}

function marsInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const map: Record<SignId, { short: string; positive: string; shadow: string; takeaway: string }> = {
    aries: {
      short: `You go after what you want, fast and direct. Hesitation isn't really your style.`,
      positive: "You're bold, decisive, and you act on instinct. You don't wait around for permission. You recover from setbacks fast \u2014 you're already onto the next thing.",
      shadow: "You can be impulsive and impatient. Anger flares fast. You can start things and not finish them once the initial charge wears off.",
      takeaway: "Pick one thing to finish this month \u2014 the follow-through is where your power actually compounds.",
    },
    taurus: {
      short: `You're slow to start but unstoppable once you're moving. You don't waste energy.`,
      positive: "You're patient, steady, and you don't get distracted by shiny things. Once you commit to a direction, you keep going long after others have given up. Your anger is rare but serious when it shows up.",
      shadow: "You can dig in and refuse to move even when moving is right. Stubbornness can cost you opportunities. You can be too slow to act when speed matters.",
      takeaway: "Set a deadline for decisions \u2014 sometimes 'good enough now' beats 'perfect later.'",
    },
    gemini: {
      short: `Your energy goes into your head and your words. You fight with ideas.`,
      positive: "You're quick, versatile, and you can juggle multiple projects. You handle conflict through conversation. You're good at talking your way into and out of things.",
      shadow: "You can scatter your energy across too many things. You can talk about doing something instead of doing it. Arguments can get sharp and verbal.",
      takeaway: "Pick one project and ship it this week \u2014 finished beats perfect.",
    },
    cancer: {
      short: `Your drive goes into protecting and providing for the people you love.`,
      positive: "You're emotionally driven \u2014 you'll work harder for your family than for yourself. You're tenacious when something you care about is on the line. Your energy goes into building a safe home.",
      shadow: "You can be passive-aggressive when you're angry instead of direct. Mood affects your energy more than you'd like. You can clamp down on people you're trying to protect.",
      takeaway: "Say what you're actually angry about \u2014 sideways anger hurts the people you love most.",
    },
    leo: {
      short: `You put your heart into what you do. You want your work to mean something and to be seen.`,
      positive: "You're warm-blooded, creative, and you bring real passion to your projects. You're a generous leader \u2014 you bring people along instead of leaving them behind. You play to win, but you want the win to feel good.",
      shadow: "Pride can stop you from doing unglamorous work. You can sulk when you don't get recognition. Drama can follow you without you noticing.",
      takeaway: "Do one thing this week with no audience \u2014 the work itself is allowed to be enough.",
    },
    virgo: {
      short: `Your drive goes into getting things right. You're the person who actually does the work.`,
      positive: "You're precise, helpful, and you channel your energy into useful action. You don't waste motion. You're good at fixing things and you actually finish what you start. Your standards are high and you meet them.",
      shadow: "You can criticize instead of motivate. You can get so caught up in perfection that you never ship. Your inner critic can run you into the ground.",
      takeaway: "Ship the 80% version once in a while \u2014 done is better than perfect, and you can always improve it.",
    },
    libra: {
      short: `you'd rather persuade than push. You fight for fairness, not for dominance.`,
      positive: "You're strategic, diplomatic, and you can get what you want without burning bridges. You're good at mediating conflicts. You fight best when you're fighting for justice or for someone else.",
      shadow: "You can avoid conflict that needs to happen. You can be indirect about what you want. Indecision can drain your energy.",
      takeaway: "Pick one thing you actually want and ask for it directly \u2014 it's less scary than it sounds.",
    },
    scorpio: {
      short: `Your drive is intense and focused. Once you decide on something, you don't quit.`,
      positive: "You've got stamina that other people don't. You can pour yourself into one thing for years. You're strategic and you don't telegraph your moves. You protect what's yours with everything you have.",
      shadow: "You can hold grudges and pursue revenge. You can be possessive. You can burn yourself out because you don't know how to half-do something.",
      takeaway: "Pick one battle to walk away from this year \u2014 your energy is too precious to spend on people who don't matter.",
    },
    sagittarius: {
      short: `You chase big goals and you don't like being told no.`,
      positive: "You're optimistic, adventurous, and you've got real stamina for new things. You'd rather try and fail than not try at all. You're honest about what you want.",
      shadow: "You can over-promise and under-deliver. You can start things and bail when they get boring. You can be tactless when you're fired up.",
      takeaway: "Commit to finishing one big thing this year \u2014 the follow-through is the lesson.",
    },
    capricorn: {
      short: `Your drive is patient and strategic. You're playing the long game.`,
      positive: "You're disciplined, ambitious, and you actually finish what you start. You're willing to do the unglamorous work because you see where it leads. You're reliable under pressure.",
      shadow: "You can be cold when you're focused. You can prioritize the goal over the people. Burnout is a real risk because you don't stop.",
      takeaway: "Schedule rest like you schedule work \u2014 it's part of the strategy, not a weakness.",
    },
    aquarius: {
      short: `You fight for your ideals. Your energy goes into causes and unconventional projects.`,
      positive: "You're original, idealistic, and you're willing to fight for what you believe in. You work well in groups and you're good at rallying people. You don't care about doing things the way they've always been done.",
      shadow: "You can be more committed to your ideas than to the people around you. You can be stubborn in unconventional ways. You can come across as detached when you're fired up.",
      takeaway: "Pick one person to fight alongside, not just a cause \u2014 relationships need that energy too.",
    },
    pisces: {
      short: `Your drive is emotional and intuitive. You go after what you feel called to.`,
      positive: "You can pour yourself into creative or spiritual work in a way that's hard to explain. You're adaptable and you go with the flow. Your energy is tied to meaning \u2014 if it matters, you'll do it.",
      shadow: "You can drift instead of drive. You can avoid conflict by disappearing. You can pour yourself into things that drain you because you can't tell where you end and they begin.",
      takeaway: "Pick one thing you actually want and chase it on purpose \u2014 drift is your enemy.",
    },
  };
  return map[s];
}

function jupiterInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const map: Record<SignId, string> = {
    aries: "growth through bold first moves and trusting your instincts",
    taurus: "growth through patient building and committing to what lasts",
    gemini: "growth through curiosity, learning, and connecting with new people",
    cancer: "growth through family, home, and emotional depth",
    leo: "growth through creative expression and being seen for who you are",
    virgo: "growth through mastery, skill, and being of real service",
    libra: "growth through partnership, beauty, and fair deals",
    scorpio: "growth through deep transformation and trusting people fully",
    sagittarius: "growth through travel, big questions, and following your truth",
    capricorn: "growth through long-term ambition and patient climbing",
    aquarius: "growth through community, causes, and following your own weird path",
    pisces: "growth through compassion, creativity, and trusting your intuition",
  };
  const short = `Jupiter in ${m.name} is where life feels generous when you lean into it \u2014 your growth comes from ${map[s]}.`;
  return {
    short,
    positive: `Jupiter in ${m.name} means life tends to expand you through ${map[s]}. When you lean into this sign's territory, doors open. You find teachers, opportunities, and meaning here. This is also where you tend to be generous with others, and that generosity comes back to you.`,
    shadow: `Jupiter can also mean too much of a good thing. In ${m.name}, you can overdo ${map[s]} \u2014 promising more than you can deliver, or trusting the universe to handle details that are actually yours to handle. Faith is good, but it works better with follow-through.`,
    takeaway: `Pick one ${m.name}-flavored goal and put real work behind it this year \u2014 Jupiter rewards follow-through as much as vision.`,
  };
}

function saturnInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const map: Record<SignId, string> = {
    aries: "learning patience with your own impulses and finishing what you start",
    taurus: "building material security and committing to what's worth keeping",
    gemini: "disciplining a scattered mind and following through on what you learn",
    cancer: "taking responsibility for emotional security and family patterns",
    leo: "earning your sense of self without needing applause",
    virgo: "doing the unglamorous detail work that mastery actually requires",
    libra: "doing the real work of partnership, not just the romance part",
    scorpio: "facing power, fear, and intimacy honestly instead of running",
    sagittarius: "turning your beliefs into actual lived discipline",
    capricorn: "carrying real authority and the weight that comes with it",
    aquarius: "building structures that serve everyone, not just you",
    pisces: "giving form to your compassion so it actually helps people",
  };
  const short = `Saturn in ${m.name} is where life asks you to grow up \u2014 ${map[s]}.`;
  return {
    short,
    positive: `Saturn in ${m.name} marks the area where you earn real authority over time. It's not easy, but the work pays off in ways that last. ${map[s].charAt(0).toUpperCase() + map[s].slice(1)} is your apprenticeship \u2014 the thing you'll be genuinely good at by midlife because you've put in the years.`,
    shadow: `Saturn in ${m.name} can also show up as fear, rigidity, or feeling like you're never doing enough. You might carry weight that isn't yours, or hold back from joy because it doesn't feel earned. The lesson isn't to remove the responsibility \u2014 it's to stop resenting it.`,
    takeaway: `Treat this part of your life as a long apprenticeship. The patience you put in now comes back as quiet, durable strength.`,
  };
}

function uranusInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const map: Record<SignId, string> = {
    aries: "bold, sudden reinventions of who you are and what you're about",
    taurus: "breaking old patterns around money, comfort, and what you value",
    gemini: "restless ideas and paradigm shifts in how you think and communicate",
    cancer: "unconventional family life and home that doesn't look like everyone else's",
    leo: "surprising acts of self-expression and breaking old patterns around being seen",
    virgo: "inventive approaches to work, health, and daily routine",
    libra: "unconventional relationships and breaking old patterns around partnership",
    scorpio: "sudden transformations and facing deep truths you used to avoid",
    sagittarius: "belief-system shake-ups and finding your own truth instead of inherited ones",
    capricorn: "restructuring ambition and breaking old patterns around authority",
    aquarius: "community, causes, and future-thinking \u2014 you change the world, not just yourself",
    pisces: "mystical or artistic breakthroughs and dissolving old boundaries",
  };
  const short = `Uranus in ${m.name} is where you refuse to stay the same \u2014 ${map[s]}.`;
  return {
    short,
    positive: `Uranus in ${m.name} is the part of you that breaks patterns and seeks freedom. You'll go through real changes in this area across your life \u2014 each one freeing you from something that used to define you. ${map[s].charAt(0).toUpperCase() + map[s].slice(1)} is the territory.`,
    shadow: `Uranus in ${m.name} can also mean restlessness for its own sake. You can break things that didn't need breaking, or rebel in ways that hurt people you love. Change that isn't anchored in something true tends to leave wreckage behind it.`,
    takeaway: `Honor your need for change \u2014 but channel it into choices you can live with tomorrow.`,
  };
}

function neptuneInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const map: Record<SignId, string> = {
    aries: "visionary action \u2014 dreams that want to become real, fast",
    taurus: "idealized beauty and a longing for the perfect sensory life",
    gemini: "inspired words and ideas that come from somewhere else",
    cancer: "idealized home and family \u2014 longing for the perfect belonging",
    leo: "glamorous self-expression and creative dreams",
    virgo: "idealized work and service \u2014 wanting to heal everything and everyone",
    libra: "idealized love \u2014 longing for the perfect partnership",
    scorpio: "deep psychic dreaming and a hunger for total intimacy",
    sagittarius: "mystical beliefs and a longing for the ultimate truth",
    capricorn: "idealized ambition \u2014 dreaming of work that actually matters",
    aquarius: "utopian ideals and a longing for a better world for everyone",
    pisces: "complete mystical sensitivity \u2014 the boundaries between you and everything else dissolve",
  };
  const short = `Neptune in ${m.name} is where you dream, imagine, and dissolve \u2014 ${map[s]}.`;
  return {
    short,
    positive: `Neptune in ${m.name} is the soft, oceanic layer of your chart. This is where art, meaning, and intuition live for you. ${map[s].charAt(0).toUpperCase() + map[s].slice(1)} is the territory where you sense things that don't have words.`,
    shadow: `Neptune in ${m.name} can also blur into escapism, illusion, or self-deception. You might idealize people who haven't earned it, or lose hours to things that numb you. Dreams need a container or they run you in the dark.`,
    takeaway: `Use your imagination on purpose \u2014 it's a gift, but it needs structure to actually land in the world.`,
  };
}

function plutoInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const map: Record<SignId, string> = {
    aries: "the death and rebirth of who you are",
    taurus: "transformation of what you value and what you call security",
    gemini: "transformation of how you think, speak, and learn",
    cancer: "transformation of family patterns and what home means to you",
    leo: "transformation of how you express yourself and seek recognition",
    virgo: "deep transformation of your work, health, and daily craft",
    libra: "transformation of how you do partnership",
    scorpio: "total psychological depth \u2014 you go where others won't",
    sagittarius: "transformation of your beliefs and what you consider true",
    capricorn: "transformation of structures, ambition, and authority",
    aquarius: "transformation of communities, ideals, and your role in the collective",
    pisces: "spiritual death and rebirth \u2014 the dissolution of old selves",
  };
  const short = `Pluto in ${m.name} is where you transform \u2014 ${map[s]}.`;
  return {
    short,
    positive: `Pluto in ${m.name} is the deepest current in your chart. This is where life will ask you to die and be reborn, sometimes more than once. ${map[s].charAt(0).toUpperCase() + map[s].slice(1)} isn't punishment \u2014 it's how you become more fully yourself.`,
    shadow: `Pluto in ${m.name} can also become control, obsession, or stuck grief. You might hold onto power past the point it serves you, or refuse to let something end that needs to. The lesson is honesty about what's already dead so something new can grow.`,
    takeaway: `Trust the cycles of ending and beginning here \u2014 they're not punishment, they're how you become more yourself.`,
  };
}

function northNodeInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const opposite: Record<SignId, SignId> = {
    aries: "libra", taurus: "scorpio", gemini: "sagittarius", cancer: "capricorn",
    leo: "aquarius", virgo: "pisces", libra: "aries", scorpio: "taurus",
    sagittarius: "gemini", capricorn: "cancer", aquarius: "leo", pisces: "virgo",
  };
  const opp = SIGN_META[opposite[s]];
  const short = `Your North Node in ${m.name} points to your growth edge \u2014 ${m.short.split(".")[0].toLowerCase()}`;
  return {
    short,
    positive: `Your North Node in ${m.name} is the direction you're here to grow toward in this lifetime. It's not what's easy \u2014 it's what's next. The qualities of ${m.name} (${m.short.split(".")[0].toLowerCase()}) might feel unfamiliar at first, but leaning into them is where your real development lives.`,
    shadow: `The South Node (directly opposite, in ${opp.name}) is your comfort zone \u2014 the skills and patterns that come naturally but keep you small. ${opp.short} is what you've already mastered. Leaning too hard on it is the trap.`,
    takeaway: `Lean toward the unfamiliar ${m.name} energy, even when it's uncomfortable \u2014 the discomfort is the direction.`,
  };
}

function chironInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const map: Record<SignId, string> = {
    aries: "the wound of self-worth \u2014 'am I enough as I am?'",
    taurus: "the wound of having enough \u2014 'will I be provided for?'",
    gemini: "the wound of being heard \u2014 'does what I say matter?'",
    cancer: "the wound of belonging \u2014 'do I have a home?'",
    leo: "the wound of being seen \u2014 'will I be recognized for who I really am?'",
    virgo: "the wound of being good enough \u2014 'am I doing it right?'",
    libra: "the wound of relationship \u2014 'will I be loved equally?'",
    scorpio: "the wound of trust \u2014 'can I let anyone all the way in?'",
    sagittarius: "the wound of meaning \u2014 'does my life matter?'",
    capricorn: "the wound of recognition \u2014 'will I ever be respected?'",
    aquarius: "the wound of belonging to a group \u2014 'do I fit anywhere?'",
    pisces: "the wound of carrying everyone's pain \u2014 'where do I end and you begin?'",
  };
  const short = `Chiron in ${m.name} marks an old wound that becomes your gift \u2014 ${map[s]}.`;
  return {
    short,
    positive: `Chiron in ${m.name} points to ${map[s]} This is the place where you carry an ache \u2014 and the place from which you eventually heal others. Your credibility in this area comes from having walked through it yourself.`,
    shadow: `In shadow, you might try to hide the wound, or believe it disqualifies you from helping. The opposite is true \u2014 the people you're here to help need to know you've been there.`,
    takeaway: `Don't wait until you're fully healed to help someone \u2014 your story is the medicine.`,
  };
}

function lilithInSign(s: SignId): { short: string; positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[s];
  const map: Record<SignId, string> = {
    aries: "raw independence and a refusal to ask permission",
    taurus: "stubborn sensuality and possessiveness",
    gemini: "untamed curiosity and words that cut",
    cancer: "fierce protectiveness and emotional truth",
    leo: "unapologetic self-expression",
    virgo: "refusal to be diminished or useful-only",
    libra: "refusal to compromise the self for peace",
    scorpio: "raw desire and intensity",
    sagittarius: "untamed freedom and truth-telling",
    capricorn: "ambition that obeys no one",
    aquarius: "principled rebellion and refusal to conform",
    pisces: "vast, formless feeling and a hunger to merge",
  };
  const short = `Lilith in ${m.name} is your untamed, instinctive self \u2014 ${map[s]}.`;
  return {
    short,
    positive: `Lilith in ${m.name} is the part of you that refuses to be tamed. ${map[s].charAt(0).toUpperCase() + map[s].slice(1)} shows up when you stop performing and start being real. This is raw instinct and knowing that doesn't ask permission.`,
    shadow: `In shadow, Lilith gets repressed and shows up as sudden outbursts, projection, or relationships charged with energy you won't own in yourself. Bringing her into conscious expression takes away her sting and gives you back your power.`,
    takeaway: `Make room for your untamed self on purpose \u2014 she's most destructive when ignored.`,
  };
}

const PLANET_DISPATCH: Record<PlanetId, (s: SignId) => { short: string; positive: string; shadow: string; takeaway: string }> = {
  sun: sunInSign,
  moon: moonInSign,
  mercury: mercuryInSign,
  venus: venusInSign,
  mars: marsInSign,
  jupiter: jupiterInSign,
  saturn: saturnInSign,
  uranus: uranusInSign,
  neptune: neptuneInSign,
  pluto: plutoInSign,
  north_node: northNodeInSign,
  chiron: chironInSign,
  lilith: lilithInSign,
};

export function interpretPlanetInSign(
  planet: PlanetId,
  sign: SignId
): PlanetSignInterp {
  const fn = PLANET_DISPATCH[planet];
  const result = fn(sign);
  return {
    headline: planetHeadline(planet, sign),
    short: result.short,
    traits: planetTraits(planet, sign),
    long: {
      positive: result.positive,
      shadow: result.shadow,
      takeaway: result.takeaway,
    },
  };
}

// Punchy one-liner for each planet-in-sign combo. Shown at the top of each
// planet card as the headline takeaway. Specific to the real placement.
function planetHeadline(planet: PlanetId, sign: SignId): string {
  const m = SIGN_META[sign];
  const headlines: Record<PlanetId, Record<SignId, string>> = {
    sun: {
      aries: "You go first, and you don't wait for permission.",
      taurus: "You build slow, and what you build lasts.",
      gemini: "You're always three ideas ahead of the room.",
      cancer: "You feel everything, and you take care of your people.",
      leo: "You light up whatever room you walk into.",
      virgo: "You notice what everyone else misses, and you fix it.",
      libra: "You want things fair, pretty, and peaceful.",
      scorpio: "You go deep, and you don't do surface.",
      sagittarius: "You chase the next horizon and the next big idea.",
      capricorn: "You play the long game, and you're playing to win.",
      aquarius: "You see how things could be, not how they are.",
      pisces: "You feel what others can't put into words.",
    },
    moon: {
      aries: "Your feelings come on fast and burn out fast.",
      taurus: "You need calm and comfort to feel okay inside.",
      gemini: "You process feelings through your head, not your gut.",
      cancer: "You feel everything and you remember everything.",
      leo: "You need to feel seen and appreciated.",
      virgo: "You handle feelings by fixing things.",
      libra: "You feel best when things are peaceful.",
      scorpio: "You feel deep and you don't trust easily.",
      sagittarius: "You process feelings through meaning.",
      capricorn: "You keep your feelings under tight control.",
      aquarius: "You feel things but you watch yourself feeling them.",
      pisces: "You absorb other people's moods like a sponge.",
    },
    mercury: {
      aries: "You think fast and you talk blunt.",
      taurus: "You think deliberately and you don't change your mind.",
      gemini: "You think in webs and you can talk to anyone.",
      cancer: "You think with your feelings, not just logic.",
      leo: "You talk with warmth and a little flair.",
      virgo: "You think in details and you catch what others miss.",
      libra: "You communicate with charm and you see every side.",
      scorpio: "You think deeply and you read people well.",
      sagittarius: "You think in big pictures and you talk straight.",
      capricorn: "You communicate carefully and with purpose.",
      aquarius: "You think originally and you see what others miss.",
      pisces: "You think in images and feelings, not straight lines.",
    },
    venus: {
      aries: "You fall fast and you love the chase.",
      taurus: "You love through the body, through touch and presence.",
      gemini: "You fall in love through conversation.",
      cancer: "You love through care and protection.",
      leo: "You love big and you want to be adored back.",
      virgo: "You love through small acts of service.",
      libra: "You love through partnership and beauty.",
      scorpio: "You love intense and you want to merge.",
      sagittarius: "You love through shared adventure and freedom.",
      capricorn: "You love through commitment over time.",
      aquarius: "You love unconventionally, through friendship.",
      pisces: "You love romantically, deeply, without limits.",
    },
    mars: {
      aries: "You go after what you want, loudly and fast.",
      taurus: "You're slow to start but impossible to stop.",
      gemini: "You chase through words and ideas.",
      cancer: "Your drive goes into protecting your people.",
      leo: "You chase with warmth and you play to win.",
      virgo: "Your drive goes into getting things right.",
      libra: "You'd rather persuade than push.",
      scorpio: "Your drive is intense, focused, and relentless.",
      sagittarius: "You chase big things and you hate being fenced in.",
      capricorn: "You chase strategically, with patience.",
      aquarius: "You fight for your ideals and your causes.",
      pisces: "You chase through feel and intuition, not logic.",
    },
    jupiter: {
      aries: "You grow through bold first moves.",
      taurus: "You grow through patient building.",
      gemini: "You grow through curiosity and learning.",
      cancer: "You grow through family and emotional depth.",
      leo: "You grow through creative expression.",
      virgo: "You grow through mastery and skill.",
      libra: "You grow through partnership and beauty.",
      scorpio: "You grow through deep transformation.",
      sagittarius: "You grow through travel, truth, and big questions.",
      capricorn: "You grow through long-term ambition.",
      aquarius: "You grow through community and your own weird path.",
      pisces: "You grow through compassion and intuition.",
    },
    saturn: {
      aries: "You're learning patience with your own impulses.",
      taurus: "You're building material security, slowly.",
      gemini: "You're disciplining a scattered mind.",
      cancer: "You're taking responsibility for emotional security.",
      leo: "You're earning your sense of self without applause.",
      virgo: "You're doing the unglamorous detail work.",
      libra: "You're doing the real work of partnership.",
      scorpio: "You're facing power and intimacy honestly.",
      sagittarius: "You're turning belief into lived discipline.",
      capricorn: "You're carrying real authority and weight.",
      aquarius: "You're building structures that serve everyone.",
      pisces: "You're giving form to your compassion.",
    },
    uranus: {
      aries: "You reinvent yourself, suddenly and boldly.",
      taurus: "You break old patterns around money and security.",
      gemini: "You have restless ideas and paradigm shifts.",
      cancer: "Your family and home life don't look like everyone else's.",
      leo: "You surprise people with how you express yourself.",
      virgo: "You take inventive approaches to work and health.",
      libra: "Your relationships don't follow the usual rules.",
      scorpio: "You go through sudden, deep transformations.",
      sagittarius: "Your beliefs get shaken up and rewritten.",
      capricorn: "You restructure ambition and authority.",
      aquarius: "You change communities and causes, not just yourself.",
      pisces: "You have mystical or artistic breakthroughs.",
    },
    neptune: {
      aries: "You dream in visionary action.",
      taurus: "You idealize beauty and the senses.",
      gemini: "You have inspired words and ideas.",
      cancer: "You idealize home and belonging.",
      leo: "You dream through creative self-expression.",
      virgo: "You idealize work and service.",
      libra: "You idealize love and partnership.",
      scorpio: "You dream deep, psychic, and intense.",
      sagittarius: "You dream through mystical beliefs.",
      capricorn: "You idealize ambition and calling.",
      aquarius: "You dream of a better world for everyone.",
      pisces: "You dream completely — boundaries dissolve.",
    },
    pluto: {
      aries: "You transform through bold reinvention.",
      taurus: "You transform what you value and own.",
      gemini: "You transform how you think and communicate.",
      cancer: "You transform family patterns.",
      leo: "You transform how you express yourself.",
      virgo: "You transform your work and daily craft.",
      libra: "You transform how you do partnership.",
      scorpio: "You go to total depth — Pluto's home sign.",
      sagittarius: "You transform your beliefs.",
      capricorn: "You transform structures and authority.",
      aquarius: "You transform communities and ideals.",
      pisces: "You transform through spiritual death and rebirth.",
    },
    north_node: {
      aries: "You're growing toward independence and bold action.",
      taurus: "You're growing toward building real security.",
      gemini: "You're growing toward curiosity and honest communication.",
      cancer: "You're growing toward emotional depth and home.",
      leo: "You're growing toward creative self-expression.",
      virgo: "You're growing toward skill and service.",
      libra: "You're growing toward partnership and balance.",
      scorpio: "You're growing toward depth and surrender.",
      sagittarius: "You're growing toward meaning and truth.",
      capricorn: "You're growing toward authority and the long game.",
      aquarius: "You're growing toward community and your own path.",
      pisces: "You're growing toward compassion and letting go.",
    },
    chiron: {
      aries: "Your wound is self-worth; your gift is helping others feel enough.",
      taurus: "Your wound is having enough; your gift is helping others feel provided for.",
      gemini: "Your wound is being heard; your gift is helping others find their voice.",
      cancer: "Your wound is belonging; your gift is helping others feel at home.",
      leo: "Your wound is being seen; your gift is helping others shine.",
      virgo: "Your wound is being good enough; your gift is helping others improve.",
      libra: "Your wound is relationship; your gift is helping others connect.",
      scorpio: "Your wound is trust; your gift is helping others go deep.",
      sagittarius: "Your wound is meaning; your gift is helping others find it.",
      capricorn: "Your wound is recognition; your gift is helping others earn it.",
      aquarius: "Your wound is belonging to a group; your gift is helping others fit.",
      pisces: "Your wound is carrying everyone's pain; your gift is helping others heal.",
    },
    lilith: {
      aries: "Your untamed self is raw independence.",
      taurus: "Your untamed self is stubborn sensuality.",
      gemini: "Your untamed self is untamed curiosity.",
      cancer: "Your untamed self is fierce protectiveness.",
      leo: "Your untamed self is unapologetic self-expression.",
      virgo: "Your untamed self refuses to be diminished.",
      libra: "Your untamed self refuses to compromise for peace.",
      scorpio: "Your untamed self is raw desire and intensity.",
      sagittarius: "Your untamed self is untamed freedom.",
      capricorn: "Your untamed self is ambition that obeys no one.",
      aquarius: "Your untamed self is principled rebellion.",
      pisces: "Your untamed self is vast, formless feeling.",
    },
  };
  return headlines[planet]?.[sign] || `${m.name} ${planet}.`;
}

// YOU-form trait points for each planet-in-sign combo.
// Each point uses a label like "YOU ARE", "YOU DON'T", "YOU MOVE" etc.
// followed by a short, specific trait description. Covers both bright side
// and shadow. These are the main content shown on each planet card.
function planetTraits(planet: PlanetId, sign: SignId): TraitPoint[] {
  const m = SIGN_META[sign];
  const traits: Record<PlanetId, Partial<Record<SignId, TraitPoint[]>>> = {
    sun: {
      aries: [
        { label: "YOU ARE", text: "brave, direct, and first to act" },
        { label: "YOU DON'T", text: "wait for permission or overthink it" },
        { label: "YOU MOVE", text: "fast — people follow because you went first" },
        { label: "YOU RECOVER", text: "quickly from setbacks, already onto the next thing" },
        { label: "YOU STRUGGLE", text: "with patience and can steamroll slower people" },
        { label: "YOUR BLIND SPOT", text: "starting things you don't finish" },
      ],
      taurus: [
        { label: "YOU ARE", text: "steady, sensual, and built to last" },
        { label: "YOU DON'T", text: "change with the wind or pretend to like things you don't" },
        { label: "YOU BUILD", text: "slowly — once you commit, you don't flinch" },
        { label: "YOU NEED", text: "good food, good people, a life you can touch" },
        { label: "YOU STRUGGLE", text: "to move when moving is the right call — stubbornness" },
        { label: "YOUR BLIND SPOT", text: "comforting yourself with stuff when something's off" },
      ],
      gemini: [
        { label: "YOU ARE", text: "quick, funny, and always three ideas ahead" },
        { label: "YOU DON'T", text: "do boring or repetitive — you need novelty" },
        { label: "YOU CONNECT", text: "ideas and people in ways others miss" },
        { label: "YOU LEARN", text: "fast — you'd rather know a little about a lot" },
        { label: "YOU STRUGGLE", text: "to go deep — you skim the surface and miss it" },
        { label: "YOUR BLIND SPOT", text: "starting ten books and finishing two" },
      ],
      cancer: [
        { label: "YOU ARE", text: "nurturing, intuitive, and loyal past reason" },
        { label: "YOU DON'T", text: "let go of people or memories easily" },
        { label: "YOU FEEL", text: "the room before anyone speaks" },
        { label: "YOU REMEMBER", text: "birthdays, coffee orders, what they said months ago" },
        { label: "YOU STRUGGLE", text: "taking things personally that weren't meant that way" },
        { label: "YOUR BLIND SPOT", text: "expecting people to just know what's wrong" },
      ],
      leo: [
        { label: "YOU ARE", text: "generous, expressive, and you light up a room" },
        { label: "YOU DON'T", text: "hide your light or pretend to be small" },
        { label: "YOU SHINE", text: "when you're seen and recognized for real effort" },
        { label: "YOU GIVE", text: "big warmth and you make people feel special" },
        { label: "YOU STRUGGLE", text: "with needing attention more than you admit" },
        { label: "YOUR BLIND SPOT", text: "making everything about you without realizing it" },
      ],
      virgo: [
        { label: "YOU ARE", text: "sharp, helpful, and you notice what others miss" },
        { label: "YOU DON'T", text: "let details slide or cut corners" },
        { label: "YOU FIX", text: "things — helping is how you show love" },
        { label: "YOU CARE", text: "about getting it right, not just getting it done" },
        { label: "YOU STRUGGLE", text: "with the inner critic that never shuts up" },
        { label: "YOUR BLIND SPOT", text: "nitpicking until people feel nothing's ever enough" },
      ],
      libra: [
        { label: "YOU ARE", text: "charming, fair, and genuinely good at seeing all sides" },
        { label: "YOU DON'T", text: "like conflict or unfairness" },
        { label: "YOU SEEK", text: "balance, beauty, and real partnership" },
        { label: "YOU MAKE", text: "people feel comfortable and seen" },
        { label: "YOU STRUGGLE", text: "to pick a side — you can see every option" },
        { label: "YOUR BLIND SPOT", text: "swallowing your opinion to keep the peace" },
      ],
      scorpio: [
        { label: "YOU ARE", text: "intense, loyal, and you read people like a book" },
        { label: "YOU DON'T", text: "do surface — you want the truth, even when it's ugly" },
        { label: "YOU GO", text: "where others won't — deep, dark, and real" },
        { label: "YOU PROTECT", text: "the people you let in with everything you have" },
        { label: "YOU STRUGGLE", text: "with grudges — you don't forget, don't forgive" },
        { label: "YOUR BLIND SPOT", text: "testing people in ways they don't know about" },
      ],
      sagittarius: [
        { label: "YOU ARE", text: "honest, optimistic, and you hate being fenced in" },
        { label: "YOU DON'T", text: "do small talk or stay in one place too long" },
        { label: "YOU CHASE", text: "the next horizon, the next big idea, the next truth" },
        { label: "YOU TEACH", text: "big ideas in a way that makes people excited" },
        { label: "YOU STRUGGLE", text: "with tact — blunt to the point of careless" },
        { label: "YOUR BLIND SPOT", text: "over-promising because the future always sounds better" },
      ],
      capricorn: [
        { label: "YOU ARE", text: "disciplined, responsible, and you play the long game" },
        { label: "YOU DON'T", text: "complain or wait for things to be handed to you" },
        { label: "YOU BUILD", text: "something that lasts — career, home, reputation" },
        { label: "YOU HANDLE", text: "it — you're the adult in the room" },
        { label: "YOU STRUGGLE", text: "to let yourself rest or show vulnerability" },
        { label: "YOUR BLIND SPOT", text: "prioritizing work over people without noticing" },
      ],
      aquarius: [
        { label: "YOU ARE", text: "original, idealistic, and you think for yourself" },
        { label: "YOU DON'T", text: "follow the crowd just because it's moving" },
        { label: "YOU SEE", text: "how things could be, not how they are" },
        { label: "YOU CARE", text: "about the big picture — society, the future, what's fair" },
        { label: "YOU STRUGGLE", text: "with emotional closeness — you feel far away even to people you love" },
        { label: "YOUR BLIND SPOT", text: "being more committed to ideas than to people" },
      ],
      pisces: [
        { label: "YOU ARE", text: "empathetic, creative, and you feel what others can't say" },
        { label: "YOU DON'T", text: "do boundaries well — you absorb everything" },
        { label: "YOU DREAM", text: "big and your intuition is actually right" },
        { label: "YOU CREATE", text: "from a place most people can't reach" },
        { label: "YOU STRUGGLE", text: "with escapism when life gets heavy" },
        { label: "YOUR BLIND SPOT", text: "letting things slide because confronting them feels too harsh" },
      ],
    },
    moon: {
      aries: [
        { label: "YOU FEEL", text: "fast and hot — emotions come on instantly" },
        { label: "YOU REACT", text: "before you think, then cool down just as quick" },
        { label: "YOU DON'T", text: "sit on feelings — you process them in real time" },
        { label: "YOU NEED", text: "emotional honesty, even when it's loud" },
        { label: "YOU STRUGGLE", text: "with your temper going off before your brain catches up" },
        { label: "YOUR BLIND SPOT", text: "saying things in the heat of the moment you can't take back" },
      ],
      taurus: [
        { label: "YOU NEED", text: "calm, comfort, and stability to feel okay inside" },
        { label: "YOU FEEL", text: "steady — people lean on your emotional ground" },
        { label: "YOU DON'T", text: "like being rushed or pushed emotionally" },
        { label: "YOU RECHARGE", text: "through the senses — good food, soft textures, a comfortable home" },
        { label: "YOU STRUGGLE", text: "to shut down and talk when you're stressed" },
        { label: "YOUR BLIND SPOT", text: "resisting change even when it's what you need" },
      ],
      gemini: [
        { label: "YOU PROCESS", text: "feelings through your head, not your gut" },
        { label: "YOU TALK", text: "it out — finding words helps you feel better" },
        { label: "YOU DON'T", text: "sit with heavy feelings silently" },
        { label: "YOU NEED", text: "mental stimulation to feel emotionally alive" },
        { label: "YOU STRUGGLE", text: "to actually feel things — you intellectualize instead" },
        { label: "YOUR BLIND SPOT", text: "talking around a feeling without ever landing on it" },
      ],
      cancer: [
        { label: "YOU FEEL", text: "everything — your emotional radar is unmatched" },
        { label: "YOU NEED", text: "a safe home base to come back to" },
        { label: "YOU REMEMBER", text: "every emotional detail, good and bad" },
        { label: "YOU NURTURE", text: "the people you love — care is your language" },
        { label: "YOU STRUGGLE", text: "with mood swings and retreating into your shell" },
        { label: "YOUR BLIND SPOT", text: "expecting people to chase you when you pull away" },
      ],
      leo: [
        { label: "YOU NEED", text: "to feel seen and appreciated — not for show, but to feel you matter" },
        { label: "YOU FEEL", text: "big — warmth, pride, hurt, all of it turned up" },
        { label: "YOU CELEBRATE", text: "your people hard — birthdays, wins, you go all in" },
        { label: "YOU SHOW", text: "love through generosity and playfulness" },
        { label: "YOU STRUGGLE", text: "with sulking when you feel ignored or unappreciated" },
        { label: "YOUR BLIND SPOT", text: "pride stopping you from admitting you're hurt" },
      ],
      virgo: [
        { label: "YOU HANDLE", text: "feelings by doing something about them — fixing, organizing, helping" },
        { label: "YOU SHOW", text: "love through small acts of service" },
        { label: "YOU NOTICE", text: "what people need before they ask" },
        { label: "YOU PROCESS", text: "best when your hands are busy" },
        { label: "YOU STRUGGLE", text: "with the inner critic running you into the ground" },
        { label: "YOUR BLIND SPOT", text: "criticizing instead of comforting when people are hurting" },
      ],
      libra: [
        { label: "YOU FEEL", text: "best when things are peaceful and balanced" },
        { label: "YOU READ", text: "the emotional temperature of a room instantly" },
        { label: "YOU WANT", text: "everyone to be okay — genuinely" },
        { label: "YOU PROCESS", text: "feelings best in conversation with someone you trust" },
        { label: "YOU STRUGGLE", text: "to swallow your own feelings to keep the peace" },
        { label: "YOUR BLIND SPOT", text: "building up resentment while smiling on the outside" },
      ],
      scorpio: [
        { label: "YOU FEEL", text: "deep and private — your inner world is intense" },
        { label: "YOU DON'T", text: "trust easily, but once you do, you're all in" },
        { label: "YOU SENSE", text: "when something's off, when someone's lying, when there's a secret" },
        { label: "YOU SIT", text: "with heavy emotions without flinching" },
        { label: "YOU STRUGGLE", text: "with jealousy and holding onto emotional wounds" },
        { label: "YOUR BLIND SPOT", text: "testing people without telling them you're testing them" },
      ],
      sagittarius: [
        { label: "YOU PROCESS", text: "feelings through meaning — you need to understand why" },
        { label: "YOU BOUNCE", text: "back fast because you find the bigger picture" },
        { label: "YOU NEED", text: "emotional freedom — being hemmed in feels suffocating" },
        { label: "YOU'RE HONEST", text: "about what you're feeling, to a fault" },
        { label: "YOU STRUGGLE", text: "to stay in emotionally heavy situations" },
        { label: "YOUR BLIND SPOT", text: "fleeing when things get deep instead of staying" },
      ],
      capricorn: [
        { label: "YOU KEEP", text: "your feelings under control — more than is good for you" },
        { label: "YOU DON'T", text: "dump your stuff on other people" },
        { label: "YOU HOLD", text: "it together when others fall apart" },
        { label: "YOU PROCESS", text: "feelings privately and on your own schedule" },
        { label: "YOU STRUGGLE", text: "with feelings coming out sideways — headaches, snappy comments" },
        { label: "YOUR BLIND SPOT", text: "equating having needs with being weak" },
      ],
      aquarius: [
        { label: "YOU FEEL", text: "things but you watch yourself feeling them, from a slight distance" },
        { label: "YOU STAY", text: "objective in emotional situations where others lose it" },
        { label: "YOU CARE", text: "about people in the big-picture sense" },
        { label: "YOU PROCESS", text: "feelings through understanding, not through having them" },
        { label: "YOU STRUGGLE", text: "to feel emotionally reachable even to people you love" },
        { label: "YOUR BLIND SPOT", text: "dropping the observer act when intimacy requires it" },
      ],
      pisces: [
        { label: "YOU ABSORB", text: "other people's moods like a sponge" },
        { label: "YOU FEEL", text: "what others can't put into words" },
        { label: "YOU NEED", text: "alone time to untangle what's yours from what's everyone else's" },
        { label: "YOU RECHARGE", text: "through music, art, water, and quiet" },
        { label: "YOU STRUGGLE", text: "with boundaries — where you end and others begin" },
        { label: "YOUR BLIND SPOT", text: "escaping into screens, substances, or daydreams when it's too much" },
      ],
    },
    mercury: {
      aries: [
        { label: "YOU THINK", text: "fast and you talk blunt" },
        { label: "YOU DECIDE", text: "without agonizing — you trust your first instinct" },
        { label: "YOU ARGUE", text: "sharp and you don't back down" },
        { label: "YOU DON'T", text: "dress things up or sugarcoat" },
        { label: "YOU STRUGGLE", text: "with cutting people off without realizing it" },
        { label: "YOUR BLIND SPOT", text: "your mouth running ahead of your brain" },
      ],
      taurus: [
        { label: "YOU THINK", text: "deliberately and you don't change your mind easily" },
        { label: "YOU EXPLAIN", text: "in plain, practical language" },
        { label: "YOU DON'T", text: "waste words — people trust what you say" },
        { label: "YOU DECIDE", text: "by weighing things carefully, then committing" },
        { label: "YOU STRUGGLE", text: "to move on a position even when new info shows up" },
        { label: "YOUR BLIND SPOT", text: "tuning out people who talk too fast" },
      ],
      gemini: [
        { label: "YOU THINK", text: "in webs — one idea leads to ten more" },
        { label: "YOU TALK", text: "to anyone about anything" },
        { label: "YOU CONNECT", text: "ideas and people in ways others miss" },
        { label: "YOU LEARN", text: "fast and you love it" },
        { label: "YOU STRUGGLE", text: "to go deep — you skim and move on" },
        { label: "YOUR BLIND SPOT", text: "coming across as scattered even when you're tracking" },
      ],
      cancer: [
        { label: "YOU THINK", text: "with your feelings — how it feels matters as much as the facts" },
        { label: "YOU READ", text: "between the lines of what people say" },
        { label: "YOU REMEMBER", text: "emotional details, not just facts" },
        { label: "YOU COMMUNICATE", text: "carefully because you know words can hurt" },
        { label: "YOU STRUGGLE", text: "to take things objectively instead of personally" },
        { label: "YOUR BLIND SPOT", text: "holding onto an offhand comment for years" },
      ],
      leo: [
        { label: "YOU TALK", text: "with warmth and a little flair" },
        { label: "YOU TELL", text: "stories that make people laugh and care" },
        { label: "YOU ENCOURAGE", text: "people with your words — you're genuinely good at it" },
        { label: "YOU EXPRESS", text: "yourself with presence and confidence" },
        { label: "YOU STRUGGLE", text: "to dominate conversations without realizing it" },
        { label: "YOUR BLIND SPOT", text: "talking in declarations when a question would serve better" },
      ],
      virgo: [
        { label: "YOU THINK", text: "in details — you catch what others miss" },
        { label: "YOU ANALYZE", text: "and break complicated things into steps" },
        { label: "YOU GIVE", text: "useful feedback because you actually noticed the thing" },
        { label: "YOU REMEMBER", text: "specifics — names, numbers, what was said" },
        { label: "YOU STRUGGLE", text: "to nitpick without realizing you're doing it" },
        { label: "YOUR BLIND SPOT", text: "getting so caught up in details you miss the big picture" },
      ],
      libra: [
        { label: "YOU COMMUNICATE", text: "with charm and you can see every side" },
        { label: "YOU FRAME", text: "things so people don't get defensive" },
        { label: "YOU MEDIATE", text: "well — you find the version of truth both sides can accept" },
        { label: "YOU LISTEN", text: "actually, not just waiting to talk" },
        { label: "YOU STRUGGLE", text: "to soften your message so much the point gets lost" },
        { label: "YOUR BLIND SPOT", text: "taking so long to decide the moment passes" },
      ],
      scorpio: [
        { label: "YOU THINK", text: "deeply and you read people well" },
        { label: "YOU ASK", text: "the questions other people are too polite to ask" },
        { label: "YOU SEE", text: "what's underneath a conversation — what's not being said" },
        { label: "YOU DON'T", text: "waste words — they carry weight" },
        { label: "YOU STRUGGLE", text: "to be too blunt in a cutting way" },
        { label: "YOUR BLIND SPOT", text: "holding onto things people said in arguments" },
      ],
      sagittarius: [
        { label: "YOU THINK", text: "in big pictures and you talk straight" },
        { label: "YOU EXPLAIN", text: "big ideas in a way that makes people excited" },
        { label: "YOU TEACH", text: "naturally — you make things feel doable" },
        { label: "YOU KEEP", text: "conversations moving forward" },
        { label: "YOU STRUGGLE", text: "with being blunt to the point of careless" },
        { label: "YOUR BLIND SPOT", text: "missing details because you're already three steps ahead" },
      ],
      capricorn: [
        { label: "YOU COMMUNICATE", text: "carefully and with purpose" },
        { label: "YOU DON'T", text: "waste words — you say what needs to be said" },
        { label: "YOU STRUCTURE", text: "complicated ideas so people can follow" },
        { label: "YOU DELIVER", text: "hard news without flinching" },
        { label: "YOU STRUGGLE", text: "to come across as warm — you can feel cold or dry" },
        { label: "YOUR BLIND SPOT", text: "skipping the small talk that builds rapport" },
      ],
      aquarius: [
        { label: "YOU THINK", text: "originally and you see what others miss" },
        { label: "YOU BRAINSTORM", text: "well and you enjoy other people's weird ideas" },
        { label: "YOU CHALLENGE", text: "consensus — you're not afraid to disagree" },
        { label: "YOU CONNECT", text: "patterns and possibilities others don't see" },
        { label: "YOU STRUGGLE", text: "to explain things in a way that doesn't lose people" },
        { label: "YOUR BLIND SPOT", text: "disagreeing just to disagree" },
      ],
      pisces: [
        { label: "YOU THINK", text: "in images and feelings, not straight lines" },
        { label: "YOU PICK UP", text: "the emotional subtext of conversations" },
        { label: "YOU COMMUNICATE", text: "through metaphor, story, and feel" },
        { label: "YOU SIT", text: "with someone's pain without trying to fix it" },
        { label: "YOU STRUGGLE", text: "to be vague when you need to be specific" },
        { label: "YOUR BLIND SPOT", text: "absorbing other people's opinions without noticing" },
      ],
    },
    venus: {
      aries: [
        { label: "YOU FALL", text: "fast and you love the chase" },
        { label: "YOU GO", text: "after who you want directly" },
        { label: "YOU BRING", text: "passion and freshness into relationships" },
        { label: "YOU DON'T", text: "play games or wait to be chosen" },
        { label: "YOU STRUGGLE", text: "to lose interest once the chase is over" },
        { label: "YOUR BLIND SPOT", text: "rushing into things before you know the person" },
      ],
      taurus: [
        { label: "YOU LOVE", text: "through the body — touch, food, presence" },
        { label: "YOU SHOW", text: "up consistently and you're loyal" },
        { label: "YOU WANT", text: "a love that's built to last" },
        { label: "YOU HAVE", text: "good taste and you make shared spaces beautiful" },
        { label: "YOU STRUGGLE", text: "to hold onto relationships past their expiration date" },
        { label: "YOUR BLIND SPOT", text: "possessiveness — love can feel like ownership" },
      ],
      gemini: [
        { label: "YOU FALL", text: "in love through conversation" },
        { label: "YOU NEED", text: "mental stimulation — if the talk dies, so does your interest" },
        { label: "YOU FLIRT", text: "naturally because you actually listen" },
        { label: "YOU KEEP", text: "things light and playful in love" },
        { label: "YOU STRUGGLE", text: "to get bored once the talking becomes routine" },
        { label: "YOUR BLIND SPOT", text: "sending mixed signals because you're tracking options" },
      ],
      cancer: [
        { label: "YOU LOVE", text: "through care — feeding, nurturing, protecting" },
        { label: "YOU WANT", text: "to build a home with someone, not just a fling" },
        { label: "YOU'RE DEVOTED", text: "and consistent in love" },
        { label: "YOU REMEMBER", text: "what your person needs" },
        { label: "YOU STRUGGLE", text: "to smother without realizing it" },
        { label: "YOUR BLIND SPOT", text: "taking care of people so hard they can't do anything themselves" },
      ],
      leo: [
        { label: "YOU LOVE", text: "big and you want to be adored back" },
        { label: "YOU GIVE", text: "grand gestures and you remember anniversaries" },
        { label: "YOU WANT", text: "a love you can be proud of" },
        { label: "YOU'RE GENEROUS", text: "with affection when you're into someone" },
        { label: "YOU STRUGGLE", text: "to need a lot of reassurance" },
        { label: "YOUR BLIND SPOT", text: "competing with your partner for the spotlight" },
      ],
      virgo: [
        { label: "YOU LOVE", text: "through small acts of service" },
        { label: "YOU NOTICE", text: "what your person actually needs" },
        { label: "YOU SHOW", text: "up — you'll fix the thing, plan the trip, remember the allergies" },
        { label: "YOU'RE RELIABLE", text: "and thoughtful in love" },
        { label: "YOU STRUGGLE", text: "to criticize in the name of helping" },
        { label: "YOUR BLIND SPOT", text: "giving so much you forget to receive" },
      ],
      libra: [
        { label: "YOU LOVE", text: "through partnership and beauty" },
        { label: "YOU WANT", text: "a relationship that feels fair and equal" },
        { label: "YOU'RE CHARMING", text: "and you make your person feel special" },
        { label: "YOU COMPROMISE", text: "well — you put real work into relationships" },
        { label: "YOU STRUGGLE", text: "to avoid conflict so hard issues pile up" },
        { label: "YOUR BLIND SPOT", text: "staying in a bad situation hoping it'll smooth itself out" },
      ],
      scorpio: [
        { label: "YOU LOVE", text: "intense and deep — you want to merge" },
        { label: "YOU'RE DEVOTED", text: "once you're in, you're all in" },
        { label: "YOU WANT", text: "to know your person at a level most people don't reach" },
        { label: "YOU PROTECT", text: "your relationship fiercely" },
        { label: "YOU STRUGGLE", text: "with jealousy and possessiveness" },
        { label: "YOUR BLIND SPOT", text: "holding onto relationships that have died" },
      ],
      sagittarius: [
        { label: "YOU LOVE", text: "with freedom — you want a partner in adventure" },
        { label: "YOU'RE HONEST", text: "and optimistic in relationships" },
        { label: "YOU DON'T", text: "do jealousy well — it feels like a cage" },
        { label: "YOU WANT", text: "someone who's also your friend and adventure buddy" },
        { label: "YOU STRUGGLE", text: "to flee when things get heavy" },
        { label: "YOUR BLIND SPOT", text: "commitment feeling like a cage even when it isn't" },
      ],
      capricorn: [
        { label: "YOU LOVE", text: "seriously — you're in it for real" },
        { label: "YOU'RE LOYAL", text: "and you show up" },
        { label: "YOU DON'T", text: "do flings lightly — you want a partnership that's a team" },
        { label: "YOU BUILD", text: "a relationship that lasts through effort" },
        { label: "YOU STRUGGLE", text: "to come across as emotionally reserved" },
        { label: "YOUR BLIND SPOT", text: "prioritizing stability over warmth" },
      ],
      aquarius: [
        { label: "YOU LOVE", text: "unconventionally — you want a partner who's also a friend" },
        { label: "YOU'RE OPEN-MINDED", text: "and you don't do jealousy" },
        { label: "YOU WANT", text: "a relationship that respects both people's independence" },
        { label: "YOU'RE ATTRACTED", text: "to people who are a little different" },
        { label: "YOU STRUGGLE", text: "to feel emotionally distant even to people you love" },
        { label: "YOUR BLIND SPOT", text: "prioritizing friendship over romance" },
      ],
      pisces: [
        { label: "YOU LOVE", text: "romantically, deeply, and a little spiritually" },
        { label: "YOU WANT", text: "a soulmate, not just a partner" },
        { label: "YOU'RE TENDER", text: "and devoted in love" },
        { label: "YOU FEEL", text: "your person's mood shift before they say anything" },
        { label: "YOU STRUGGLE", text: "to idealize people and miss red flags" },
        { label: "YOUR BLIND SPOT", text: "losing yourself in someone else" },
      ],
    },
    mars: {
      aries: [
        { label: "YOU GO", text: "after what you want, fast and direct" },
        { label: "YOU ACT", text: "on instinct — hesitation isn't your style" },
        { label: "YOU RECOVER", text: "from setbacks fast" },
        { label: "YOU DON'T", text: "wait around for permission" },
        { label: "YOU STRUGGLE", text: "with being impulsive and impatient" },
        { label: "YOUR BLIND SPOT", text: "starting things and not finishing them" },
      ],
      taurus: [
        { label: "YOU MOVE", text: "slow but once you're going, you're unstoppable" },
        { label: "YOU DON'T", text: "waste energy on shiny distractions" },
        { label: "YOU COMMIT", text: "to a direction and keep going" },
        { label: "YOU FINISH", text: "what you start" },
        { label: "YOU STRUGGLE", text: "to dig in and refuse to move when you should" },
        { label: "YOUR BLIND SPOT", text: "being too slow to act when speed matters" },
      ],
      gemini: [
        { label: "YOU CHASE", text: "through words and ideas" },
        { label: "YOU JUGGLE", text: "multiple projects at once" },
        { label: "YOU HANDLE", text: "conflict through conversation" },
        { label: "YOU ADAPT", text: "fast to new situations" },
        { label: "YOU STRUGGLE", text: "to scatter your energy across too many things" },
        { label: "YOUR BLIND SPOT", text: "talking about doing instead of doing" },
      ],
      cancer: [
        { label: "YOU FIGHT", text: "for the people you love" },
        { label: "YOU'RE DRIVEN", text: "by emotional needs, not just ambition" },
        { label: "YOU PROTECT", text: "what's yours with everything you have" },
        { label: "YOU ACT", text: "when something you care about is on the line" },
        { label: "YOU STRUGGLE", text: "with passive-aggressive anger instead of direct" },
        { label: "YOUR BLIND SPOT", text: "mood affecting your drive more than you'd like" },
      ],
      leo: [
        { label: "YOU CHASE", text: "with warmth and you play to win" },
        { label: "YOU PUT", text: "your heart into what you do" },
        { label: "YOU LEAD", text: "generously — you bring people along" },
        { label: "YOU WANT", text: "your work to mean something and be seen" },
        { label: "YOU STRUGGLE", text: "with pride stopping you from unglamorous work" },
        { label: "YOUR BLIND SPOT", text: "sulking when you don't get recognition" },
      ],
      virgo: [
        { label: "YOU CHANNEL", text: "energy into useful action" },
        { label: "YOU DON'T", text: "waste motion — you're precise" },
        { label: "YOU FIX", text: "things and you actually finish what you start" },
        { label: "YOU HAVE", text: "high standards and you meet them" },
        { label: "YOU STRUGGLE", text: "to criticize instead of motivate" },
        { label: "YOUR BLIND SPOT", text: "getting so caught up in perfection you never ship" },
      ],
      libra: [
        { label: "YOU'D RATHER", text: "persuade than push" },
        { label: "YOU FIGHT", text: "for fairness, not for dominance" },
        { label: "YOU'RE STRATEGIC", text: "and diplomatic in how you go after things" },
        { label: "YOU MEDIATE", text: "conflicts well" },
        { label: "YOU STRUGGLE", text: "to avoid conflict that needs to happen" },
        { label: "YOUR BLIND SPOT", text: "being indirect about what you want" },
      ],
      scorpio: [
        { label: "YOU HAVE", text: "stamina other people don't" },
        { label: "YOU POUR", text: "yourself into one thing for years" },
        { label: "YOU'RE STRATEGIC", text: "and you don't telegraph your moves" },
        { label: "YOU PROTECT", text: "what's yours with everything you have" },
        { label: "YOU STRUGGLE", text: "with grudges and pursuing revenge" },
        { label: "YOUR BLIND SPOT", text: "burning yourself out because you don't half-do things" },
      ],
      sagittarius: [
        { label: "YOU CHASE", text: "big goals and you hate being fenced in" },
        { label: "YOU'D RATHER", text: "try and fail than not try at all" },
        { label: "YOU'RE HONEST", text: "about what you want" },
        { label: "YOU HAVE", text: "real stamina for new things" },
        { label: "YOU STRUGGLE", text: "to over-promise and under-deliver" },
        { label: "YOUR BLIND SPOT", text: "bailing when things get boring" },
      ],
      capricorn: [
        { label: "YOU CHASE", text: "strategically, with patience" },
        { label: "YOU'RE DISCIPLINED", text: "and you actually finish what you start" },
        { label: "YOU DO", text: "the unglamorous work because you see where it leads" },
        { label: "YOU'RE RELIABLE", text: "under pressure" },
        { label: "YOU STRUGGLE", text: "to be cold when you're focused" },
        { label: "YOUR BLIND SPOT", text: "prioritizing the goal over the people" },
      ],
      aquarius: [
        { label: "YOU FIGHT", text: "for your ideals and your causes" },
        { label: "YOU WORK", text: "well in groups and you rally people" },
        { label: "YOU DON'T", text: "care about doing things the way they've always been done" },
        { label: "YOU'RE WILLING", text: "to fight for what you believe in" },
        { label: "YOU STRUGGLE", text: "to be more committed to ideas than to people" },
        { label: "YOUR BLIND SPOT", text: "coming across as detached when you're fired up" },
      ],
      pisces: [
        { label: "YOU'RE DRIVEN", text: "by emotional and intuitive pulls" },
        { label: "YOU GO", text: "after what you feel called to" },
        { label: "YOU ADAPT", text: "and you go with the flow" },
        { label: "YOU POUR", text: "yourself into creative or spiritual work" },
        { label: "YOU STRUGGLE", text: "to drift instead of drive" },
        { label: "YOUR BLIND SPOT", text: "avoiding conflict by disappearing" },
      ],
    },
    jupiter: {
      aries: [
        { label: "YOU GROW", text: "through bold first moves and trusting your instincts" },
        { label: "YOU FIND", text: "opportunities by leaning into action" },
        { label: "YOU'RE GENEROUS", text: "with your courage — you encourage others to go" },
        { label: "YOU EXPAND", text: "when you take the lead" },
        { label: "YOU STRUGGLE", text: "with overdoing it — same sign means no natural brake" },
        { label: "YOUR BLIND SPOT", text: "burnout or overreach" },
      ],
      taurus: [
        { label: "YOU GROW", text: "through patient building and committing to what lasts" },
        { label: "YOU FIND", text: "opportunities through consistency, not luck" },
        { label: "YOU EXPAND", text: "slowly but surely" },
        { label: "YOU'RE GENEROUS", text: "with comfort and stability" },
        { label: "YOU STRUGGLE", text: "with resisting change even when it brings growth" },
        { label: "YOUR BLIND SPOT", text: "confusing steady with stuck" },
      ],
      gemini: [
        { label: "YOU GROW", text: "through curiosity, learning, and connecting with new people" },
        { label: "YOU FIND", text: "opportunities through conversation and ideas" },
        { label: "YOU EXPAND", text: "by knowing a little about a lot" },
        { label: "YOU TEACH", text: "what you learn — you're a natural connector" },
        { label: "YOU STRUGGLE", text: "to go deep on one thing" },
        { label: "YOUR BLIND SPOT", text: "skimming instead of mastering" },
      ],
      cancer: [
        { label: "YOU GROW", text: "through family, home, and emotional depth" },
        { label: "YOU FIND", text: "opportunities through your network of trusted people" },
        { label: "YOU EXPAND", text: "by creating a safe base for yourself and others" },
        { label: "YOU'RE GENEROUS", text: "with care and nurturing" },
        { label: "YOU STRUGGLE", text: "to hold onto family patterns that don't serve you" },
        { label: "YOUR BLIND SPOT", text: "staying in the comfort zone too long" },
      ],
      leo: [
        { label: "YOU GROW", text: "through creative expression and being seen" },
        { label: "YOU FIND", text: "opportunities when you shine and share your gifts" },
        { label: "YOU EXPAND", text: "by putting yourself out there" },
        { label: "YOU'RE GENEROUS", text: "with warmth and encouragement" },
        { label: "YOU STRUGGLE", text: "with pride getting in the way of growth" },
        { label: "YOUR BLIND SPOT", text: "needing applause to feel you're on the right path" },
      ],
      virgo: [
        { label: "YOU GROW", text: "through mastery, skill, and being of real service" },
        { label: "YOU FIND", text: "opportunities through competence and attention to detail" },
        { label: "YOU EXPAND", text: "by getting really good at something specific" },
        { label: "YOU'RE GENEROUS", text: "with your expertise and help" },
        { label: "YOU STRUGGLE", text: "with the inner critic blocking your growth" },
        { label: "YOUR BLIND SPOT", text: "undervaluing your own skills" },
      ],
      libra: [
        { label: "YOU GROW", text: "through partnership, beauty, and fair deals" },
        { label: "YOU FIND", text: "opportunities through relationships and collaboration" },
        { label: "YOU EXPAND", text: "by working with others, not alone" },
        { label: "YOU'RE GENEROUS", text: "with charm and you make things beautiful" },
        { label: "YOU STRUGGLE", text: "to grow without a partner" },
        { label: "YOUR BLIND SPOT", text: "depending on others for your growth" },
      ],
      scorpio: [
        { label: "YOU GROW", text: "through deep transformation and trusting people fully" },
        { label: "YOU FIND", text: "opportunities through intensity and going deep" },
        { label: "YOU EXPAND", text: "by letting go of what no longer serves you" },
        { label: "YOU'RE GENEROUS", text: "with your depth and loyalty" },
        { label: "YOU STRUGGLE", text: "with control blocking your growth" },
        { label: "YOUR BLIND SPOT", text: "trusting the wrong people with too much" },
      ],
      sagittarius: [
        { label: "YOU GROW", text: "through travel, big questions, and following your truth" },
        { label: "YOU FIND", text: "opportunities by being in motion and seeking" },
        { label: "YOU EXPAND", text: "through new experiences and perspectives" },
        { label: "YOU'RE GENEROUS", text: "with your optimism and wisdom" },
        { label: "YOU STRUGGLE", text: "to commit to one path when there's so much to explore" },
        { label: "YOUR BLIND SPOT", text: "over-promising because the future sounds better than now" },
      ],
      capricorn: [
        { label: "YOU GROW", text: "through long-term ambition and patient climbing" },
        { label: "YOU FIND", text: "opportunities through discipline and strategy" },
        { label: "YOU EXPAND", text: "by building something that lasts" },
        { label: "YOU'RE GENEROUS", text: "with your time and responsibility" },
        { label: "YOU STRUGGLE", text: "to enjoy the journey, not just the destination" },
        { label: "YOUR BLIND SPOT", text: "sacrificing relationships for achievement" },
      ],
      aquarius: [
        { label: "YOU GROW", text: "through community, causes, and following your own weird path" },
        { label: "YOU FIND", text: "opportunities through networks and groups" },
        { label: "YOU EXPAND", text: "by connecting with like-minded people" },
        { label: "YOU'RE GENEROUS", text: "with your vision and ideals" },
        { label: "YOU STRUGGLE", text: "to stay committed to one community" },
        { label: "YOUR BLIND SPOT", text: "being too far ahead for people to follow" },
      ],
      pisces: [
        { label: "YOU GROW", text: "through compassion, creativity, and trusting your intuition" },
        { label: "YOU FIND", text: "opportunities through feeling, not logic" },
        { label: "YOU EXPAND", text: "through spiritual or artistic practice" },
        { label: "YOU'RE GENEROUS", text: "with your empathy and imagination" },
        { label: "YOU STRUGGLE", text: "with boundaries blurring your growth" },
        { label: "YOUR BLIND SPOT", text: "escaping instead of growing" },
      ],
    },
    saturn: {
      aries: [
        { label: "YOU'RE LEARNING", text: "patience with your own impulses" },
        { label: "YOU MEET", text: "limits when you charge ahead without a plan" },
        { label: "YOU GROW", text: "by finishing what you start" },
        { label: "YOU EARN", text: "authority through discipline, not just boldness" },
        { label: "YOU STRUGGLE", text: "with frustration when things don't move fast enough" },
        { label: "YOUR BLIND SPOT", text: "confusing patience with suppression" },
      ],
      taurus: [
        { label: "YOU'RE BUILDING", text: "material security, slowly and deliberately" },
        { label: "YOU MEET", text: "limits around money and resources" },
        { label: "YOU GROW", text: "by committing to what's worth keeping" },
        { label: "YOU EARN", text: "stability through patience" },
        { label: "YOU STRUGGLE", text: "with holding onto things past their usefulness" },
        { label: "YOUR BLIND SPOT", text: "confusing security with stuckness" },
      ],
      gemini: [
        { label: "YOU'RE LEARNING", text: "to discipline a scattered mind" },
        { label: "YOU MEET", text: "limits when you spread yourself too thin" },
        { label: "YOU GROW", text: "by following through on what you learn" },
        { label: "YOU EARN", text: "authority through depth, not breadth" },
        { label: "YOU STRUGGLE", text: "with committing to one thing" },
        { label: "YOUR BLIND SPOT", text: "skimming instead of mastering" },
      ],
      cancer: [
        { label: "YOU'RE TAKING", text: "responsibility for emotional security" },
        { label: "YOU MEET", text: "limits around family patterns and the past" },
        { label: "YOU GROW", text: "by building a real home, inside and out" },
        { label: "YOU EARN", text: "emotional maturity through facing your feelings" },
        { label: "YOU STRUGGLE", text: "with carrying weight that isn't yours" },
        { label: "YOUR BLIND SPOT", text: "holding onto family patterns that hurt you" },
      ],
      leo: [
        { label: "YOU'RE EARNING", text: "your sense of self without applause" },
        { label: "YOU MEET", text: "limits around pride and recognition" },
        { label: "YOU GROW", text: "by doing the work for its own sake, not for show" },
        { label: "YOU EARN", text: "real authority through humility" },
        { label: "YOU STRUGGLE", text: "with feeling unappreciated" },
        { label: "YOUR BLIND SPOT", text: "pride stopping you from growing" },
      ],
      virgo: [
        { label: "YOU'RE DOING", text: "the unglamorous detail work that mastery requires" },
        { label: "YOU MEET", text: "limits around perfectionism" },
        { label: "YOU GROW", text: "by shipping, not just perfecting" },
        { label: "YOU EARN", text: "authority through competence" },
        { label: "YOU STRUGGLE", text: "with the inner critic running the show" },
        { label: "YOUR BLIND SPOT", text: "never feeling like it's good enough" },
      ],
      libra: [
        { label: "YOU'RE DOING", text: "the real work of partnership, not just the romance" },
        { label: "YOU MEET", text: "limits around commitment and boundaries" },
        { label: "YOU GROW", text: "by staying when things get hard" },
        { label: "YOU EARN", text: "lasting relationships through effort" },
        { label: "YOU STRUGGLE", text: "with avoiding the hard conversations" },
        { label: "YOUR BLIND SPOT", text: "staying in a bad relationship too long" },
      ],
      scorpio: [
        { label: "YOU'RE FACING", text: "power, fear, and intimacy honestly" },
        { label: "YOU MEET", text: "limits around control and trust" },
        { label: "YOU GROW", text: "by letting go of what you can't control" },
        { label: "YOU EARN", text: "real depth through vulnerability" },
        { label: "YOU STRUGGLE", text: "with holding onto power past its usefulness" },
        { label: "YOUR BLIND SPOT", text: "confusing control with strength" },
      ],
      sagittarius: [
        { label: "YOU'RE TURNING", text: "your beliefs into actual lived discipline" },
        { label: "YOU MEET", text: "limits around commitment and follow-through" },
        { label: "YOU GROW", text: "by staying with one truth long enough to live it" },
        { label: "YOU EARN", text: "wisdom through practice, not just seeking" },
        { label: "YOU STRUGGLE", text: "with fleeing when things require commitment" },
        { label: "YOUR BLIND SPOT", text: "confusing freedom with avoidance" },
      ],
      capricorn: [
        { label: "YOU'RE CARRYING", text: "real authority and the weight that comes with it" },
        { label: "YOU MEET", text: "limits around work and responsibility" },
        { label: "YOU GROW", text: "by taking on more, wisely" },
        { label: "YOU EARN", text: "respect through competence and consistency" },
        { label: "YOU STRUGGLE", text: "with carrying too much alone" },
        { label: "YOUR BLIND SPOT", text: "sacrificing your life for your work" },
      ],
      aquarius: [
        { label: "YOU'RE BUILDING", text: "structures that serve everyone, not just you" },
        { label: "YOU MEET", text: "limits around belonging and rebellion" },
        { label: "YOU GROW", text: "by working within systems to change them" },
        { label: "YOU EARN", text: "authority through contribution to the group" },
        { label: "YOU STRUGGLE", text: "with being too detached to lead" },
        { label: "YOUR BLIND SPOT", text: "rebelling against structure you need" },
      ],
      pisces: [
        { label: "YOU'RE GIVING", text: "form to your compassion so it actually helps" },
        { label: "YOU MEET", text: "limits around boundaries and escapism" },
        { label: "YOU GROW", text: "by grounding your dreams in real practice" },
        { label: "YOU EARN", text: "the right to help others by doing your own work" },
        { label: "YOU STRUGGLE", text: "with letting the dream stay a dream" },
        { label: "YOUR BLIND SPOT", text: "escaping instead of structuring" },
      ],
    },
    uranus: {
      aries: [
        { label: "YOU REINVENT", text: "yourself suddenly and boldly" },
        { label: "YOU BREAK", text: "old patterns around identity and action" },
        { label: "YOU CHANGE", text: "direction fast when you feel the spark" },
        { label: "YOU DON'T", text: "stay the same for long" },
        { label: "YOU STRUGGLE", text: "with restlessness for its own sake" },
        { label: "YOUR BLIND SPOT", text: "breaking things that didn't need breaking" },
      ],
      taurus: [
        { label: "YOU BREAK", text: "old patterns around money, comfort, and values" },
        { label: "YOU REINVENT", text: "your relationship to security" },
        { label: "YOU CHANGE", text: "how you earn, spend, and value things" },
        { label: "YOU DON'T", text: "accept the default when it comes to resources" },
        { label: "YOU STRUGGLE", text: "with instability that comes from too much change" },
        { label: "YOUR BLIND SPOT", text: "disrupting stability you actually need" },
      ],
      gemini: [
        { label: "YOU HAVE", text: "restless ideas and paradigm shifts" },
        { label: "YOU CHANGE", text: "how you think and communicate" },
        { label: "YOU BREAK", text: "old mental patterns and beliefs" },
        { label: "YOU DON'T", text: "think the way you used to" },
        { label: "YOU STRUGGLE", text: "with mental restlessness that won't settle" },
        { label: "YOUR BLIND SPOT", text: "changing your mind so often no one keeps up" },
      ],
      cancer: [
        { label: "YOU HAVE", text: "an unconventional family and home life" },
        { label: "YOU BREAK", text: "old family patterns and traditions" },
        { label: "YOU CHANGE", text: "what 'home' means to you" },
        { label: "YOU DON'T", text: "do family the way everyone else does" },
        { label: "YOU STRUGGLE", text: "with emotional instability from too much change" },
        { label: "YOUR BLIND SPOT", text: "disrupting the very roots you need" },
      ],
      leo: [
        { label: "YOU SURPRISE", text: "people with how you express yourself" },
        { label: "YOU BREAK", text: "old patterns around being seen and recognized" },
        { label: "YOU CHANGE", text: "your creative direction suddenly" },
        { label: "YOU DON'T", text: "shine the same way for long" },
        { label: "YOU STRUGGLE", text: "with drama that comes from sudden shifts" },
        { label: "YOUR BLIND SPOT", text: "reinventing yourself when stability would serve" },
      ],
      virgo: [
        { label: "YOU TAKE", text: "inventive approaches to work and health" },
        { label: "YOU BREAK", text: "old patterns around routine and service" },
        { label: "YOU CHANGE", text: "how you work and take care of yourself" },
        { label: "YOU DON'T", text: "do things the conventional way" },
        { label: "YOU STRUGGLE", text: "with inconsistency in your routines" },
        { label: "YOUR BLIND SPOT", text: "disrupting systems that actually work" },
      ],
      libra: [
        { label: "YOU HAVE", text: "unconventional relationships" },
        { label: "YOU BREAK", text: "old patterns around partnership and love" },
        { label: "YOU CHANGE", text: "what you need from relationships" },
        { label: "YOU DON'T", text: "follow the usual rules of love" },
        { label: "YOU STRUGGLE", text: "with instability in your relationships" },
        { label: "YOUR BLIND SPOT", text: "disrupting a good thing out of boredom" },
      ],
      scorpio: [
        { label: "YOU GO", text: "through sudden, deep transformations" },
        { label: "YOU BREAK", text: "old patterns around power and intimacy" },
        { label: "YOU CHANGE", text: "at a core level, not just on the surface" },
        { label: "YOU DON'T", text: "stay the same after a real shift" },
        { label: "YOU STRUGGLE", text: "with intensity that comes from sudden change" },
        { label: "YOUR BLIND SPOT", text: "forcing transformation that isn't ready" },
      ],
      sagittarius: [
        { label: "YOUR BELIEFS", text: "get shaken up and rewritten" },
        { label: "YOU BREAK", text: "old patterns around meaning and truth" },
        { label: "YOU CHANGE", text: "what you believe in suddenly" },
        { label: "YOU DON'T", text: "hold one truth forever" },
        { label: "YOU STRUGGLE", text: "with restlessness in your search for meaning" },
        { label: "YOUR BLIND SPOT", text: "abandoning beliefs before integrating them" },
      ],
      capricorn: [
        { label: "YOU RESTRUCTURE", text: "your ambition and approach to authority" },
        { label: "YOU BREAK", text: "old patterns around career and status" },
        { label: "YOU CHANGE", text: "your relationship to achievement" },
        { label: "YOU DON'T", text: "climb the ladder the conventional way" },
        { label: "YOU STRUGGLE", text: "with sudden career changes" },
        { label: "YOUR BLIND SPOT", text: "disrupting your own progress" },
      ],
      aquarius: [
        { label: "YOU CHANGE", text: "communities and causes, not just yourself" },
        { label: "YOU BREAK", text: "old patterns around belonging and rebellion" },
        { label: "YOU LEAD", text: "groups toward a different future" },
        { label: "YOU DON'T", text: "fit in — you're here to change the system" },
        { label: "YOU STRUGGLE", text: "with being too far ahead for people to follow" },
        { label: "YOUR BLIND SPOT", text: "rebelling against structure you could use" },
      ],
      pisces: [
        { label: "YOU HAVE", text: "mystical or artistic breakthroughs" },
        { label: "YOU BREAK", text: "old patterns around dreams and spirituality" },
        { label: "YOU CHANGE", text: "your inner life suddenly and deeply" },
        { label: "YOU DON'T", text: "stay in one spiritual frame for long" },
        { label: "YOU STRUGGLE", text: "with instability in your inner world" },
        { label: "YOUR BLIND SPOT", text: "escaping instead of breaking through" },
      ],
    },
    neptune: {
      aries: [
        { label: "YOU DREAM", text: "in visionary action — dreams that want to become real" },
        { label: "YOU IDEALIZE", text: "courage and boldness" },
        { label: "YOU IMAGINE", text: "a braver version of yourself" },
        { label: "YOU STRUGGLE", text: "with acting on dreams without grounding them" },
        { label: "YOUR BLIND SPOT", text: "confusing the dream with the reality" },
      ],
      taurus: [
        { label: "YOU IDEALIZE", text: "beauty, comfort, and the senses" },
        { label: "YOU DREAM", text: "of a perfect, beautiful life" },
        { label: "YOU IMAGINE", text: "a world of sensory pleasure" },
        { label: "YOU STRUGGLE", text: "with idealizing material things" },
        { label: "YOUR BLIND SPOT", text: "confusing the ideal with the real" },
      ],
      gemini: [
        { label: "YOU HAVE", text: "inspired words and ideas" },
        { label: "YOU DREAM", text: "through language and communication" },
        { label: "YOU IMAGINE", text: "new ways to connect and share ideas" },
        { label: "YOU STRUGGLE", text: "with ideas that never land in reality" },
        { label: "YOUR BLIND SPOT", text: "getting lost in the idea, not the execution" },
      ],
      cancer: [
        { label: "YOU IDEALIZE", text: "home, family, and belonging" },
        { label: "YOU DREAM", text: "of the perfect safe haven" },
        { label: "YOU IMAGINE", text: "an idealized version of your roots" },
        { label: "YOU STRUGGLE", text: "with idealizing your family or childhood" },
        { label: "YOUR BLIND SPOT", text: "seeing the ideal family, not the real one" },
      ],
      leo: [
        { label: "YOU DREAM", text: "through creative self-expression" },
        { label: "YOU IDEALIZE", text: "being seen and adored" },
        { label: "YOU IMAGINE", text: "a glamorous, creative life" },
        { label: "YOU STRUGGLE", text: "with idealizing fame and recognition" },
        { label: "YOUR BLIND SPOT", text: "chasing the spotlight instead of the art" },
      ],
      virgo: [
        { label: "YOU IDEALIZE", text: "work, service, and perfection" },
        { label: "YOU DREAM", text: "of being perfectly useful and helpful" },
        { label: "YOU IMAGINE", text: "an ideal version of your work and health" },
        { label: "YOU STRUGGLE", text: "with idealizing yourself out of doing the work" },
        { label: "YOUR BLIND SPOT", text: "the ideal versus the real in daily life" },
      ],
      libra: [
        { label: "YOU IDEALIZE", text: "love, partnership, and beauty" },
        { label: "YOU DREAM", text: "of the perfect relationship" },
        { label: "YOU IMAGINE", text: "an idealized version of your partner" },
        { label: "YOU STRUGGLE", text: "with idealizing people you love" },
        { label: "YOUR BLIND SPOT", text: "seeing the ideal partner, not the real person" },
      ],
      scorpio: [
        { label: "YOU DREAM", text: "deep, psychic, and intense dreams" },
        { label: "YOU IDEALIZE", text: "depth, intimacy, and transformation" },
        { label: "YOU IMAGINE", text: "a perfect merging with another" },
        { label: "YOU STRUGGLE", text: "with idealizing intensity and darkness" },
        { label: "YOUR BLIND SPOT", text: "confusing the ideal bond with the real one" },
      ],
      sagittarius: [
        { label: "YOU DREAM", text: "through mystical beliefs and big questions" },
        { label: "YOU IDEALIZE", text: "truth, meaning, and freedom" },
        { label: "YOU IMAGINE", text: "an idealized version of your beliefs" },
        { label: "YOU STRUGGLE", text: "with idealizing your own philosophy" },
        { label: "YOUR BLIND SPOT", text: "confusing the ideal truth with the real one" },
      ],
      capricorn: [
        { label: "YOU IDEALIZE", text: "ambition, calling, and achievement" },
        { label: "YOU DREAM", text: "of work that actually matters" },
        { label: "YOU IMAGINE", text: "an idealized version of your career" },
        { label: "YOU STRUGGLE", text: "with idealizing success" },
        { label: "YOUR BLIND SPOT", text: "seeing the ideal career, not the real path" },
      ],
      aquarius: [
        { label: "YOU DREAM", text: "of a better world for everyone" },
        { label: "YOU IDEALIZE", text: "community, causes, and the future" },
        { label: "YOU IMAGINE", text: "a utopian version of society" },
        { label: "YOU STRUGGLE", text: "with idealizing your own ideals" },
        { label: "YOUR BLIND SPOT", text: "the ideal community versus the real one" },
      ],
      pisces: [
        { label: "YOU DREAM", text: "completely — boundaries dissolve" },
        { label: "YOU IDEALIZE", text: "everything — love, art, spirituality" },
        { label: "YOU IMAGINE", text: "a world without limits" },
        { label: "YOU STRUGGLE", text: "with losing yourself in the dream" },
        { label: "YOUR BLIND SPOT", text: "not being able to tell dream from reality" },
      ],
    },
    pluto: {
      aries: [
        { label: "YOU TRANSFORM", text: "through bold reinvention of yourself" },
        { label: "YOU DIE AND REBIRTH", text: "your identity, over and over" },
        { label: "YOU CHANGE", text: "by destroying the old you" },
        { label: "YOU STRUGGLE", text: "with forcing change before it's time" },
        { label: "YOUR BLIND SPOT", text: "burning bridges you'll need later" },
      ],
      taurus: [
        { label: "YOU TRANSFORM", text: "what you value and own" },
        { label: "YOU DIE AND REBIRTH", text: "your relationship to money and security" },
        { label: "YOU CHANGE", text: "by letting go of what you thought you needed" },
        { label: "YOU STRUGGLE", text: "with holding onto things through transformation" },
        { label: "YOUR BLIND SPOT", text: "clinging to security that's already gone" },
      ],
      gemini: [
        { label: "YOU TRANSFORM", text: "how you think and communicate" },
        { label: "YOU DIE AND REBIRTH", text: "your ideas and mental patterns" },
        { label: "YOU CHANGE", text: "by letting go of old ways of thinking" },
        { label: "YOU STRUGGLE", text: "with holding onto beliefs past their time" },
        { label: "YOUR BLIND SPOT", text: "transforming your mind but not your life" },
      ],
      cancer: [
        { label: "YOU TRANSFORM", text: "family patterns and what home means" },
        { label: "YOU DIE AND REBIRTH", text: "your emotional foundations" },
        { label: "YOU CHANGE", text: "by facing your deepest emotional patterns" },
        { label: "YOU STRUGGLE", text: "with holding onto the past through transformation" },
        { label: "YOUR BLIND SPOT", text: "transforming the family but not yourself" },
      ],
      leo: [
        { label: "YOU TRANSFORM", text: "how you express yourself" },
        { label: "YOU DIE AND REBIRTH", text: "your creative identity" },
        { label: "YOU CHANGE", text: "by letting go of who you thought you were" },
        { label: "YOU STRUGGLE", text: "with pride blocking transformation" },
        { label: "YOUR BLIND SPOT", text: "transforming the image but not the self" },
      ],
      virgo: [
        { label: "YOU TRANSFORM", text: "your work and daily craft" },
        { label: "YOU DIE AND REBIRTH", text: "your relationship to service and health" },
        { label: "YOU CHANGE", text: "by letting go of perfectionism" },
        { label: "YOU STRUGGLE", text: "with the inner critic through transformation" },
        { label: "YOUR BLIND SPOT", text: "transforming the work but not the worker" },
      ],
      libra: [
        { label: "YOU TRANSFORM", text: "how you do partnership" },
        { label: "YOU DIE AND REBIRTH", text: "your relationship patterns" },
        { label: "YOU CHANGE", text: "by letting go of old relationship dynamics" },
        { label: "YOU STRUGGLE", text: "with holding onto a relationship through transformation" },
        { label: "YOUR BLIND SPOT", text: "transforming the partner but not yourself" },
      ],
      scorpio: [
        { label: "YOU GO", text: "to total depth — Pluto's home sign" },
        { label: "YOU TRANSFORM", text: "everything about yourself, repeatedly" },
        { label: "YOU CHANGE", text: "by going through real death and rebirth" },
        { label: "YOU STRUGGLE", text: "with control and power through transformation" },
        { label: "YOUR BLIND SPOT", text: "burning everything down when less would do" },
      ],
      sagittarius: [
        { label: "YOU TRANSFORM", text: "your beliefs and what you consider true" },
        { label: "YOU DIE AND REBIRTH", text: "your philosophy of life" },
        { label: "YOU CHANGE", text: "by letting go of old belief systems" },
        { label: "YOU STRUGGLE", text: "with holding onto beliefs through transformation" },
        { label: "YOUR BLIND SPOT", text: "transforming the belief but not the life" },
      ],
      capricorn: [
        { label: "YOU TRANSFORM", text: "structures, ambition, and authority" },
        { label: "YOU DIE AND REBIRTH", text: "your career and public role" },
        { label: "YOU CHANGE", text: "by letting go of old structures" },
        { label: "YOU STRUGGLE", text: "with holding onto power through transformation" },
        { label: "YOUR BLIND SPOT", text: "transforming the structure but not the person" },
      ],
      aquarius: [
        { label: "YOU TRANSFORM", text: "communities and ideals" },
        { label: "YOU DIE AND REBIRTH", text: "your role in groups and causes" },
        { label: "YOU CHANGE", text: "by letting go of old ideals" },
        { label: "YOU STRUGGLE", text: "with holding onto the rebel identity" },
        { label: "YOUR BLIND SPOT", text: "transforming the cause but not yourself" },
      ],
      pisces: [
        { label: "YOU TRANSFORM", text: "through spiritual death and rebirth" },
        { label: "YOU DIE AND REBIRTH", text: "your relationship to the divine" },
        { label: "YOU CHANGE", text: "by letting go of the old self entirely" },
        { label: "YOU STRUGGLE", text: "with escapism through transformation" },
        { label: "YOUR BLIND SPOT", text: "dissolving when you should be transforming" },
      ],
    },
    north_node: {
      aries: [
        { label: "YOU'RE GROWING", text: "toward independence and bold action" },
        { label: "YOU'RE LEARNING", text: "to go first and trust yourself" },
        { label: "YOU'RE MOVING", text: "away from dependence on others" },
        { label: "YOU STRUGGLE", text: "with the discomfort of putting yourself first" },
        { label: "YOUR PATH", text: "is through courage, not compromise" },
      ],
      taurus: [
        { label: "YOU'RE GROWING", text: "toward building real security" },
        { label: "YOU'RE LEARNING", text: "to value the material world without being owned by it" },
        { label: "YOU'RE MOVING", text: "away from self-denial" },
        { label: "YOU STRUGGLE", text: "with feeling you don't deserve stability" },
        { label: "YOUR PATH", text: "is through patience, not crisis" },
      ],
      gemini: [
        { label: "YOU'RE GROWING", text: "toward curiosity and honest communication" },
        { label: "YOU'RE LEARNING", text: "to speak your truth and listen" },
        { label: "YOU'RE MOVING", text: "away from rigid beliefs" },
        { label: "YOU STRUGGLE", text: "with commitment when there's so much to explore" },
        { label: "YOUR PATH", text: "is through learning, not knowing" },
      ],
      cancer: [
        { label: "YOU'RE GROWING", text: "toward emotional depth and home" },
        { label: "YOU'RE LEARNING", text: "to feel and to nurture" },
        { label: "YOU'RE MOVING", text: "away from emotional control" },
        { label: "YOU STRUGGLE", text: "with vulnerability feeling like weakness" },
        { label: "YOUR PATH", text: "is through the heart, not the head" },
      ],
      leo: [
        { label: "YOU'RE GROWING", text: "toward creative self-expression" },
        { label: "YOU'RE LEARNING", text: "to shine and be seen" },
        { label: "YOU'RE MOVING", text: "away from hiding in the group" },
        { label: "YOU STRUGGLE", text: "with feeling like you're too much" },
        { label: "YOUR PATH", text: "is through the heart, not the mind" },
      ],
      virgo: [
        { label: "YOU'RE GROWING", text: "toward skill and service" },
        { label: "YOU'RE LEARNING", text: "to be useful and to master the details" },
        { label: "YOU'RE MOVING", text: "away from vague spiritual ideals" },
        { label: "YOU STRUGGLE", text: "with perfectionism blocking action" },
        { label: "YOUR PATH", text: "is through the hands, not just the heart" },
      ],
      libra: [
        { label: "YOU'RE GROWING", text: "toward partnership and balance" },
        { label: "YOU'RE LEARNING", text: "to share and to compromise" },
        { label: "YOU'RE MOVING", text: "away from going it alone" },
        { label: "YOU STRUGGLE", text: "with losing yourself in the relationship" },
        { label: "YOUR PATH", text: "is through the other, not just the self" },
      ],
      scorpio: [
        { label: "YOU'RE GROWING", text: "toward depth and surrender" },
        { label: "YOU'RE LEARNING", text: "to let go of control and trust" },
        { label: "YOU'RE MOVING", text: "away from holding onto things" },
        { label: "YOU STRUGGLE", text: "with vulnerability feeling like a threat" },
        { label: "YOUR PATH", text: "is through transformation, not stability" },
      ],
      sagittarius: [
        { label: "YOU'RE GROWING", text: "toward meaning and truth" },
        { label: "YOU'RE LEARNING", text: "to seek and to trust your intuition" },
        { label: "YOU'RE MOVING", text: "away from the details and into the big picture" },
        { label: "YOU STRUGGLE", text: "with commitment when there's so much to explore" },
        { label: "YOUR PATH", text: "is through the journey, not the destination" },
      ],
      capricorn: [
        { label: "YOU'RE GROWING", text: "toward authority and the long game" },
        { label: "YOU'RE LEARNING", text: "to take responsibility and build" },
        { label: "YOU'RE MOVING", text: "away from dependency" },
        { label: "YOU STRUGGLE", text: "with feeling like you're not enough yet" },
        { label: "YOUR PATH", text: "is through mastery, not luck" },
      ],
      aquarius: [
        { label: "YOU'RE GROWING", text: "toward community and your own path" },
        { label: "YOU'RE LEARNING", text: "to belong without conforming" },
        { label: "YOU'RE MOVING", text: "away from approval-seeking" },
        { label: "YOU STRUGGLE", text: "with feeling like you don't fit anywhere" },
        { label: "YOUR PATH", text: "is through the group, but on your terms" },
      ],
      pisces: [
        { label: "YOU'RE GROWING", text: "toward compassion and letting go" },
        { label: "YOU'RE LEARNING", text: "to surrender and to feel" },
        { label: "YOU'RE MOVING", text: "away from control and criticism" },
        { label: "YOU STRUGGLE", text: "with boundaries feeling like walls" },
        { label: "YOUR PATH", text: "is through the soul, not the schedule" },
      ],
    },
    chiron: {
      aries: [
        { label: "YOUR WOUND", text: "is self-worth — feeling like you're not enough as you are" },
        { label: "YOUR HEALING", text: "comes from helping others feel enough" },
        { label: "YOU TEACH", text: "others to be brave by being brave yourself" },
        { label: "YOU STRUGGLE", text: "with acting before you feel ready" },
        { label: "YOUR GIFT", text: "is showing people they don't need permission to exist" },
      ],
      taurus: [
        { label: "YOUR WOUND", text: "is having enough — feeling like you'll never be provided for" },
        { label: "YOUR HEALING", text: "comes from helping others feel secure" },
        { label: "YOU TEACH", text: "others to value themselves" },
        { label: "YOU STRUGGLE", text: "with feeling like you don't deserve comfort" },
        { label: "YOUR GIFT", text: "is showing people they're worth the effort" },
      ],
      gemini: [
        { label: "YOUR WOUND", text: "is being heard — feeling like your voice doesn't matter" },
        { label: "YOUR HEALING", text: "comes from helping others find their voice" },
        { label: "YOU TEACH", text: "others to communicate honestly" },
        { label: "YOU STRUGGLE", text: "with feeling misunderstood" },
        { label: "YOUR GIFT", text: "is showing people their words have power" },
      ],
      cancer: [
        { label: "YOUR WOUND", text: "is belonging — feeling like you don't have a home" },
        { label: "YOUR HEALING", text: "comes from helping others feel at home" },
        { label: "YOU TEACH", text: "others to nurture and be nurtured" },
        { label: "YOU STRUGGLE", text: "with feeling like you don't belong anywhere" },
        { label: "YOUR GIFT", text: "is showing people they're family" },
      ],
      leo: [
        { label: "YOUR WOUND", text: "is being seen — feeling like you're not special enough" },
        { label: "YOUR HEALING", text: "comes from helping others shine" },
        { label: "YOU TEACH", text: "others to express themselves" },
        { label: "YOU STRUGGLE", text: "with feeling invisible" },
        { label: "YOUR GIFT", text: "is showing people they're worth watching" },
      ],
      virgo: [
        { label: "YOUR WOUND", text: "is being good enough — feeling like nothing you do is right" },
        { label: "YOUR HEALING", text: "comes from helping others improve" },
        { label: "YOU TEACH", text: "others to be of service" },
        { label: "YOU STRUGGLE", text: "with feeling like you're never enough" },
        { label: "YOUR GIFT", text: "is showing people their work matters" },
      ],
      libra: [
        { label: "YOUR WOUND", text: "is relationship — feeling like you can't connect" },
        { label: "YOUR HEALING", text: "comes from helping others connect" },
        { label: "YOU TEACH", text: "others to build real partnerships" },
        { label: "YOU STRUGGLE", text: "with feeling unlovable" },
        { label: "YOUR GIFT", text: "is showing people they're worth loving" },
      ],
      scorpio: [
        { label: "YOUR WOUND", text: "is trust — feeling like you can't let anyone in" },
        { label: "YOUR HEALING", text: "comes from helping others go deep" },
        { label: "YOU TEACH", text: "others to trust and be trusted" },
        { label: "YOU STRUGGLE", text: "with feeling betrayed" },
        { label: "YOUR GIFT", text: "is showing people depth is safe" },
      ],
      sagittarius: [
        { label: "YOUR WOUND", text: "is meaning — feeling like your life doesn't matter" },
        { label: "YOUR HEALING", text: "comes from helping others find meaning" },
        { label: "YOU TEACH", text: "others to seek truth" },
        { label: "YOU STRUGGLE", text: "with feeling lost" },
        { label: "YOUR GIFT", text: "is showing people the search is worth it" },
      ],
      capricorn: [
        { label: "YOUR WOUND", text: "is recognition — feeling like you'll never be respected" },
        { label: "YOUR HEALING", text: "comes from helping others earn recognition" },
        { label: "YOU TEACH", text: "others to take responsibility" },
        { label: "YOU STRUGGLE", text: "with feeling like you haven't earned your place" },
        { label: "YOUR GIFT", text: "is showing people they're capable" },
      ],
      aquarius: [
        { label: "YOUR WOUND", text: "is belonging to a group — feeling like you don't fit" },
        { label: "YOUR HEALING", text: "comes from helping others find their people" },
        { label: "YOU TEACH", text: "others to be themselves" },
        { label: "YOU STRUGGLE", text: "with feeling like an outsider" },
        { label: "YOUR GIFT", text: "is showing people different is good" },
      ],
      pisces: [
        { label: "YOUR WOUND", text: "is carrying everyone's pain — feeling it all" },
        { label: "YOUR HEALING", text: "comes from helping others heal" },
        { label: "YOU TEACH", text: "others to have compassion" },
        { label: "YOU STRUGGLE", text: "with feeling overwhelmed by the world's pain" },
        { label: "YOUR GIFT", text: "is showing people suffering can be transformed" },
      ],
    },
    lilith: {
      aries: [
        { label: "YOUR WILD SELF", text: "is raw independence and refusal to ask permission" },
        { label: "YOU WON'T", text: "be told who you are" },
        { label: "YOU HIDE", text: "your aggression until it erupts" },
        { label: "YOU STRUGGLE", text: "with owning your anger" },
        { label: "YOUR POWER", text: "is in being unapologetically yourself" },
      ],
      taurus: [
        { label: "YOUR WILD SELF", text: "is stubborn sensuality and possessiveness" },
        { label: "YOU WON'T", text: "let go of what's yours" },
        { label: "YOU HIDE", text: "your desire for comfort and control" },
        { label: "YOU STRUGGLE", text: "with owning your hunger" },
        { label: "YOUR POWER", text: "is in knowing your worth" },
      ],
      gemini: [
        { label: "YOUR WILD SELF", text: "is untamed curiosity and sharp words" },
        { label: "YOU WON'T", text: "be silenced or told what to think" },
        { label: "YOU HIDE", text: "your need to know everything" },
        { label: "YOU STRUGGLE", text: "with owning your intellect" },
        { label: "YOUR POWER", text: "is in your voice" },
      ],
      cancer: [
        { label: "YOUR WILD SELF", text: "is fierce protectiveness and emotional truth" },
        { label: "YOU WON'T", text: "let anyone hurt your people" },
        { label: "YOU HIDE", text: "your need to nurture on your terms" },
        { label: "YOU STRUGGLE", text: "with owning your emotional power" },
        { label: "YOUR POWER", text: "is in your devotion" },
      ],
      leo: [
        { label: "YOUR WILD SELF", text: "is unapologetic self-expression" },
        { label: "YOU WON'T", text: "be made small or hidden" },
        { label: "YOU HIDE", text: "your need to be adored" },
        { label: "YOU STRUGGLE", text: "with owning your radiance" },
        { label: "YOUR POWER", text: "is in your presence" },
      ],
      virgo: [
        { label: "YOUR WILD SELF", text: "refuses to be diminished or useful-only" },
        { label: "YOU WON'T", text: "be defined by your usefulness" },
        { label: "YOU HIDE", text: "your need for perfection" },
        { label: "YOU STRUGGLE", text: "with owning your standards" },
        { label: "YOUR POWER", text: "is in your discernment" },
      ],
      libra: [
        { label: "YOUR WILD SELF", text: "refuses to compromise for peace" },
        { label: "YOU WON'T", text: "be made to choose between yourself and harmony" },
        { label: "YOU HIDE", text: "your need for beauty and fairness" },
        { label: "YOU STRUGGLE", text: "with owning your preferences" },
        { label: "YOUR POWER", text: "is in your sense of justice" },
      ],
      scorpio: [
        { label: "YOUR WILD SELF", text: "is raw desire and intensity" },
        { label: "YOU WON'T", text: "be controlled or half-known" },
        { label: "YOU HIDE", text: "your need for total intimacy" },
        { label: "YOU STRUGGLE", text: "with owning your power" },
        { label: "YOUR POWER", text: "is in your depth" },
      ],
      sagittarius: [
        { label: "YOUR WILD SELF", text: "is untamed freedom and truth-telling" },
        { label: "YOU WON'T", text: "be fenced in or told what to believe" },
        { label: "YOU HIDE", text: "your need for meaning" },
        { label: "YOU STRUGGLE", text: "with owning your restlessness" },
        { label: "YOUR POWER", text: "is in your honesty" },
      ],
      capricorn: [
        { label: "YOUR WILD SELF", text: "is ambition that obeys no one" },
        { label: "YOU WON'T", text: "be told what you can achieve" },
        { label: "YOU HIDE", text: "your need for authority" },
        { label: "YOU STRUGGLE", text: "with owning your ambition" },
        { label: "YOUR POWER", text: "is in your discipline" },
      ],
      aquarius: [
        { label: "YOUR WILD SELF", text: "is principled rebellion" },
        { label: "YOU WON'T", text: "conform or follow the crowd" },
        { label: "YOU HIDE", text: "your need to be different" },
        { label: "YOU STRUGGLE", text: "with owning your uniqueness" },
        { label: "YOUR POWER", text: "is in your vision" },
      ],
      pisces: [
        { label: "YOUR WILD SELF", text: "is vast, formless feeling" },
        { label: "YOU WON'T", text: "be contained or defined" },
        { label: "YOU HIDE", text: "your need to merge and dissolve" },
        { label: "YOU STRUGGLE", text: "with owning your sensitivity" },
        { label: "YOUR POWER", text: "is in your compassion" },
      ],
    },
  };

  // Fallback: generate generic traits from the sign's element + modality
  const fallback: TraitPoint[] = [
    { label: "YOU ARE", text: `${m.name} energy — ${m.short.toLowerCase()}` },
    { label: "YOU BRING", text: `${m.element} and ${m.modality} energy to this part of life` },
    { label: "YOU STRUGGLE", text: `with the shadow side of ${m.name}` },
  ];
  return traits[planet]?.[sign] || fallback;
}

// --- House meanings ---

export interface HouseMeaning {
  number: number;
  name: string;
  domain: string;     // short tag-line
  long: string;       // casual, specific explanation
}

export const HOUSE_MEANINGS: HouseMeaning[] = [
  { number: 1, name: "Self & Appearance", domain: "who you are and how you come across",
    long: "The 1st house is the front door of your chart. It rules your body, your natural style, your energy, and the first impression people get from you before you say a word. Any planet here is woven right into your identity \u2014 it's something people sense about you instantly." },
  { number: 2, name: "Money & Values", domain: "what you own, earn, and care about",
    long: "The 2nd house is your resources \u2014 the money you make, the stuff you own, and underneath all that, what you actually value. Planets here show how you earn, save, spend, and what you consider worth having. This isn't just about cash \u2014 it's about what you'd trade your time for." },
  { number: 3, name: "Mind & Communication", domain: "thinking, talking, siblings, short trips",
    long: "The 3rd house is everyday thinking and talking. How you learn, how you write, how you text, your relationship with siblings and neighbors, the small comings and goings of your daily life. Planets here describe the texture of your ordinary mind." },
  { number: 4, name: "Home & Roots", domain: "family, home, ancestry, your inner base",
    long: "The 4th house is your foundation. It rules home, family, parents (often the one who shaped you most), ancestry, and the private base you return to when the world is too much. Planets here show what 'home' means to you and what you need to feel rooted." },
  { number: 5, name: "Creativity & Joy", domain: "play, art, romance, kids, fun",
    long: "The 5th house is where you play. Creativity, romance, kids, hobbies, and the things you do just because they're fun. Planets here show how you express yourself when no one is grading you. This is the house of joy \u2014 don't skip it." },
  { number: 6, name: "Work & Health", domain: "daily routine, work, health, service",
    long: "The 6th house is the everyday grind \u2014 your routines, your work habits, your health, and the small acts of service that hold life together. Planets here describe how you take care of your body and your to-do list. Boring on paper, crucial in practice." },
  { number: 7, name: "Partnership", domain: "committed relationships, marriage, contracts",
    long: "The 7th house is the house of partnership. Marriage, committed business relationships, and the kind of person you attract (and are attracted to). Planets here show what you actually need from a one-to-one bond \u2014 not what you think you need." },
  { number: 8, name: "Intimacy & Transformation", domain: "deep bonding, shared money, sex, endings",
    long: "The 8th house is where you go deep. Intimacy, shared money, sex as bonding, psychological transformation, loss, and rebirth. Planets here mark the places where life asks you to merge with another person, or to let something die so something else can be born." },
  { number: 9, name: "Meaning & Travel", domain: "beliefs, higher education, travel, philosophy",
    long: "The 9th house is the search for meaning. Beliefs, philosophy, higher education, long-distance travel, and the big questions you keep coming back to. Planets here show what you're really looking for when you go looking for truth." },
  { number: 10, name: "Career & Calling", domain: "public role, reputation, vocation",
    long: "The 10th house is your public self \u2014 your career, your reputation, your vocation, and the mark you want to leave. Planets here describe what you're building toward in the world and what people will remember you for." },
  { number: 11, name: "Community & Dreams", domain: "friends, groups, causes, hopes",
    long: "The 11th house is your wider circle \u2014 friends, groups, communities, causes, and the future you're working toward. Planets here describe the kind of people who feel like your tribe and the dreams that pull you forward." },
  { number: 12, name: "Solitude & Soul", domain: "retreat, dreams, the unconscious, endings",
    long: "The 12th house is the most private. Solitude, dreams, the unconscious, retreat, and the things you do alone that no one else sees. Planets here show where you need to withdraw to recharge, and where you might be carrying more than you realize." },
];

export function houseMeaning(n: number): HouseMeaning {
  return HOUSE_MEANINGS.find((h) => h.number === n) || HOUSE_MEANINGS[0];
}

// Punchy one-liner for each house-in-sign combo. Shown at the top of each
// house card. Specific to the house + sign combination.
export function houseHeadline(houseNum: number, signId: SignId): string {
  const h = houseMeaning(houseNum);
  const s = SIGN_META[signId];
  const domain = h.name.toLowerCase();
  // Build a specific behavior line from the sign's element + modality
  // applied to this house's domain.
  const el = s.element;
  const mod = s.modality;
  const elVerb: Record<string, string> = {
    fire: `${domain} is where you bring energy and initiative`,
    earth: `${domain} is where you build slowly and practically`,
    air: `${domain} is where you think and connect`,
    water: `${domain} is where you feel deeply`,
  };
  const modFlavor: Record<string, string> = {
    cardinal: ` — and you tend to start things here`,
    fixed: ` — and once you commit, you don't budge`,
    mutable: ` — and you adapt as you go`,
  };
  return `${s.name} on your ${houseNum}${ordinal(houseNum)} house: ${elVerb[el]}${modFlavor[mod]}.`;
}

export function houseInSignShort(houseNum: number, signId: SignId): string {
  const h = houseMeaning(houseNum);
  const s = SIGN_META[signId];
  // 1-2 sentences of NEW info — what the sign's energy actually looks like
  // in this specific house. Don't repeat the sign's generic description.
  const el = s.element;
  const houseDomain = h.name.toLowerCase();
  const behaviorByElement: Record<string, string> = {
    fire: `You bring real spark to ${houseDomain} — things tend to move fast when you're involved.`,
    earth: `You handle ${houseDomain} with patience and you don't cut corners.`,
    air: `You approach ${houseDomain} through ideas and communication.`,
    water: `You experience ${houseDomain} through feeling, not logic.`,
  };
  return behaviorByElement[el];
}

export function houseInSignLong(houseNum: number, signId: SignId): { positive: string; shadow: string; takeaway: string } {
  const h = houseMeaning(houseNum);
  const s = SIGN_META[signId];
  const houseDomain = h.name.toLowerCase();
  return {
    positive: `With ${s.name} on your ${houseNum}${ordinal(houseNum)} house, ${houseDomain} runs on ${ELEMENT_VIBE[s.element]}. ${s.vibe} This shows up specifically in ${h.domain}.`,
    shadow: `The shadow: ${s.name}'s ${s.modality} nature can become rigid here. You might ${modalityShadow(s.modality)} in matters of ${houseDomain}.`,
    takeaway: `Lean into ${s.name}'s strengths here, and notice when the same energy turns up too loud.`,
  };
}

function modalityShadow(m: string): string {
  return m === "cardinal"
    ? "start things you don't finish, or push too hard to initiate when patience would serve"
    : m === "fixed"
    ? "dig in and refuse to move, even when change is the right call"
    : "drift and adapt so much that nothing ever gets committed to";
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Ascendant headline — punchy one-liner for the card.
export function ascendantHeadline(signId: SignId): string {
  const m = SIGN_META[signId];
  const map: Record<SignId, string> = {
    aries: "People meet your energy before they meet you.",
    taurus: "People relax around you without knowing why.",
    gemini: "People meet you and want to talk.",
    cancer: "People feel like they can open up to you.",
    leo: "People notice you when you walk in.",
    virgo: "You seem put-together and observant.",
    libra: "You make people comfortable right away.",
    scorpio: "People feel like you're really looking at them.",
    sagittarius: "You seem up for anything.",
    capricorn: "You seem like you've got your life together.",
    aquarius: "People can't quite place you.",
    pisces: "You feel approachable, almost dreamy.",
  };
  return map[signId] || m.short;
}

// Ascendant interpretation.
export function ascendantLong(signId: SignId): { positive: string; shadow: string; takeaway: string } {
  const m = SIGN_META[signId];
  return {
    positive: `Your Ascendant is ${m.name} — the mask you wear most naturally, the energy people pick up before they know you. ${m.vibe} It's the door to your chart; everything else expresses through it. In daily life, this shapes how you walk into a room, how you make small talk, and the first impression people walk away with — even when they can't quite put their finger on why. At work, it's the professional style you default to under pressure. In relationships, it's the version of you that shows up on a first date before the real you comes out.`,
    shadow: `In shadow, the rising sign can become a costume you forget you're wearing. You might perform a version of yourself that protects you but keeps people at arm's length — they see the mask, not the person behind it. Under stress, you may retreat further into the persona, becoming more ${m.name} than usual in a way that feels automatic rather than chosen. The door isn't the whole house — people who only see it don't really know you yet, and sometimes you forget that too.`,
    takeaway: `Let your rising sign be a welcoming doorway, not a wall. Notice when you're performing versus being real — the people worth keeping around can tell the difference.`,
  };
}

// Ascendant traits — same YOU-form format as planets.
export function ascendantTraits(signId: SignId): TraitPoint[] {
  const m = SIGN_META[signId];
  const map: Record<SignId, TraitPoint[]> = {
    aries: [
      { label: "you appear", text: "energetic, direct, and ready to go — people feel your momentum before you speak" },
      { label: "you walk", text: "into rooms like you belong there, because you do" },
      { label: "you seem", text: "confident even when you're not — the mask is boldness" },
      { label: "you struggle", text: "with coming on too strong before people get to know the real you" },
    ],
    taurus: [
      { label: "you appear", text: "calm, grounded, and unhurried — people relax around you" },
      { label: "you move", text: "at your own pace and don't let anyone rush you" },
      { label: "you seem", text: "stable and reliable, like someone who has their life together" },
      { label: "you struggle", text: "with seeming unapproachable or stubborn before people get past the surface" },
    ],
    gemini: [
      { label: "you appear", text: "curious, talkative, and quick — people want to talk to you immediately" },
      { label: "you seem", text: "smart and funny, the kind of person who makes any gathering more fun" },
      { label: "you adapt", text: "to any social situation with ease — you mirror the room" },
      { label: "you struggle", text: "with seeming scattered or superficial before people see your depth" },
    ],
    cancer: [
      { label: "you appear", text: "warm, approachable, and safe — people feel they can open up to you" },
      { label: "you seem", text: "nurturing and caring, like someone who remembers everyone's birthday" },
      { label: "you give", text: "off a 'home' energy that makes others feel comfortable" },
      { label: "you struggle", text: "with seeming moody or guarded when you're protecting yourself" },
    ],
    leo: [
      { label: "you appear", text: "warm, confident, and magnetic — people notice you when you enter" },
      { label: "you seem", text: "like someone who belongs in the spotlight, even if you don't want it" },
      { label: "you radiate", text: "a natural warmth that draws people in" },
      { label: "you struggle", text: "with seeming like you need attention when really you just have presence" },
    ],
    virgo: [
      { label: "you appear", text: "put-together, observant, and detail-oriented" },
      { label: "you seem", text: "competent and helpful — the person who always knows what to do" },
      { label: "you notice", text: "everything, which makes people feel seen (or slightly watched)" },
      { label: "you struggle", text: "with seeming critical or hard to please before people earn your warmth" },
    ],
    libra: [
      { label: "you appear", text: "charming, graceful, and easy to be around" },
      { label: "you make", text: "people feel comfortable within seconds of meeting you" },
      { label: "you seem", text: "fair, pleasant, and socially skilled — the diplomat" },
      { label: "you struggle", text: "with seeming like you're avoiding depth by keeping everything pleasant" },
    ],
    scorpio: [
      { label: "you appear", text: "intense, private, and magnetic — people feel like you're really looking at them" },
      { label: "you seem", text: "mysterious, like there's a lot going on behind your eyes" },
      { label: "you give", text: "off an energy that makes people either lean in or step back" },
      { label: "you struggle", text: "with seeming unapproachable or intimidating before people earn your trust" },
    ],
    sagittarius: [
      { label: "you appear", text: "upbeat, adventurous, and easygoing — you seem up for anything" },
      { label: "you seem", text: "free-spirited and fun, the person who's always got a story" },
      { label: "you radiate", text: "optimism that makes people feel like things will work out" },
      { label: "you struggle", text: "with seeming unreliable or restless before people see your loyalty" },
    ],
    capricorn: [
      { label: "you appear", text: "serious, composed, and capable — you seem like you've got your life together" },
      { label: "you seem", text: "mature beyond your years, the adult in the room" },
      { label: "you carry", text: "yourself with a quiet authority that people respect" },
      { label: "you struggle", text: "with seeming cold or unapproachable before people see your dry humor" },
    ],
    aquarius: [
      { label: "you appear", text: "unique, interesting, and slightly different — people can't quite place you" },
      { label: "you seem", text: "independent and original, like you're from somewhere else" },
      { label: "you give", text: "off an energy that's friendly but slightly detached" },
      { label: "you struggle", text: "with seeming emotionally distant before people get to know your warmth" },
    ],
    pisces: [
      { label: "you appear", text: "soft, dreamy, and approachable — people feel they can be themselves around you" },
      { label: "you seem", text: "gentle and artistic, like someone who sees the world differently" },
      { label: "you absorb", text: "the energy of whatever room you walk into" },
      { label: "you struggle", text: "with seeming vague or hard to read before people understand your depth" },
    ],
  };
  return map[signId] || [
    { label: "you appear", text: `${m.name} — ${m.short.toLowerCase()}` },
    { label: "you seem", text: "approachable and real" },
    { label: "you give", text: "off a distinct energy that's all your own" },
  ];
}

// ---- Combined-placement narrative engine ----
// Instead of explaining each planet in isolation, this reads the chart the
// way a real astrologer would: flowing, combined, with scenarios and
// cause-and-effect. Each function takes the full set of placements and
// returns a single flowing paragraph (or a few) that ties them together.

import type { PlanetSummary, NatalProfile } from "./types";

function findPlanet(planets: PlanetSummary[], id: string): PlanetSummary | undefined {
  return planets.find((p) => p.id === id);
}

// A short, punchy personality tag (3-6 words) based on Sun + Moon + Rising.
// Casual, fun, shareable. Honest about both the good and the tricky.
export function personalityTag(sun: SignId, moon: SignId, asc: SignId): string {
  const sunEl = SIGN_META[sun].element;
  const moonEl = SIGN_META[moon].element;
  const ascEl = SIGN_META[asc].element;

  // Same sign everywhere
  if (sun === moon && moon === asc) {
    const map: Record<SignId, string> = {
      aries: "full throttle, all day",
      taurus: "slow burn, deep roots",
      gemini: "ten tabs open, always",
      cancer: "soft heart, long memory",
      leo: "main character energy",
      virgo: "notices everything, fixes it",
      libra: "charm first, decide later",
      scorpio: "quiet outside, storm inside",
      sagittarius: "half-packed, already gone",
      capricorn: "built different, busy doing it",
      aquarius: "friendly but unreachable",
      pisces: "dreamy eyes, deep feelings",
    };
    return map[sun];
  }

  // Sun === Moon (same core + emotional self)
  if (sun === moon) {
    const map: Record<SignId, string> = {
      aries: "fast spark, short fuse",
      taurus: "steady heart, stubborn mind",
      gemini: "talks to think, thinks to talk",
      cancer: "feels it all, remembers everything",
      leo: "warm blood, big presence",
      virgo: "sharp eye, harder on self",
      libra: "wants peace, weighs forever",
      scorpio: "all in or all out",
      sagittarius: "truth first, comfort later",
      capricorn: "serious face, long game",
      aquarius: "one step sideways, always",
      pisces: "porous skin, soft edges",
    };
    return map[sun] + `, ${ascEl} mask`;
  }

  // Sun === Rising (the mask matches the core)
  if (sun === asc) {
    const map: Record<SignId, string> = {
      aries: "what you see is what you get",
      taurus: "calm outside, calm inside",
      gemini: "quick mouth, quick mind",
      cancer: "warm front, deep underneath",
      leo: "shines loud, means it",
      virgo: "put-together, actually stressing",
      libra: "easy on the outside",
      scorpio: "magnetic, doesn't explain",
      sagittarius: "says it, means it, moves on",
      capricorn: "looks serious, is serious",
      aquarius: "friendly, slightly elsewhere",
      pisces: "soft to meet, deep to know",
    };
    return map[sun] + `, ${moonEl} moon`;
  }

  // Moon === Rising (the inner self matches the mask)
  if (moon === asc) {
    const map: Record<SignId, string> = {
      aries: "reacts fast, shows it",
      taurus: "steady face, steady heart",
      gemini: "quick to laugh, quick to talk",
      cancer: "warm eyes, soft center",
      leo: "big reactions, bigger heart",
      virgo: "calm face, busy mind",
      libra: "graceful outside, weighing inside",
      scorpio: "intense eyes, private inside",
      sagittarius: "easy smile, itchy feet",
      capricorn: "composed face, controlled inside",
      aquarius: "cool outside, observing inside",
      pisces: "dreamy eyes, sponge heart",
    };
    return map[moon] + `, ${sunEl} sun`;
  }

  // All three different elements \u2014 the most common case
  // Build the tag from the most striking combo.
  const sunMoon = comboTag(sun, moon);
  if (sunMoon) return sunMoon + `, ${ascEl} rising`;

  // Fallback: element-based vibe
  const sunVibe: Record<string, string> = {
    fire: "spark first",
    earth: "builds slow",
    air: "thinks out loud",
    water: "feels first",
  };
  const moonVibe: Record<string, string> = {
    fire: "burns hot",
    earth: "steady inside",
    air: "talks it out",
    water: "deep inside",
  };
  return `${sunVibe[sunEl]}, ${moonVibe[moonEl]}, ${ascEl} rising`;
}

// One punchy sentence for the Quick View, written like a friend summing
// someone up in one line. Specific to the person's real Sun/Moon/Rising
// combo — not generic. This sits under the personality tag.
export function quickLine(profile: NatalProfile): string {
  const sun = profile.sun.signId;
  const moon = profile.moon.signId;
  const asc = profile.ascendant.signId;
  const sunEl = SIGN_META[sun].element;
  const moonEl = SIGN_META[moon].element;

  // Build from the most distinctive combo. Prioritize specific Sun+Moon
  // pairs, then element dynamics, then fallback.
  const pair = quickLineForPair(sun, moon);
  if (pair) return pair;

  // Element-based one-liners
  if (sunEl === moonEl) {
    const map: Record<string, string> = {
      fire: "You move on things while other people are still thinking about them.",
      earth: "You take your time, and once you decide, you don't budge.",
      air: "Your head runs the show — you think through everything before you act.",
      water: "You feel the room before anyone says a word.",
    };
    return map[sunEl];
  }
  if ((sunEl === "fire" && moonEl === "water") || (sunEl === "water" && moonEl === "fire")) {
    return "Deep feelings and fast reactions — the pause between them is your whole life's work.";
  }
  if ((sunEl === "earth" && moonEl === "air") || (sunEl === "air" && moonEl === "earth")) {
    return "Your head and your hands work at different speeds, and both get things done.";
  }
  if ((sunEl === "fire" && moonEl === "earth") || (sunEl === "earth" && moonEl === "fire")) {
    return "You charge hard, then need to sit with it — that rhythm is just how you're built.";
  }
  if ((sunEl === "fire" && moonEl === "air") || (sunEl === "air" && moonEl === "fire")) {
    return "Quick, fun, and always three ideas ahead of the room.";
  }
  if ((sunEl === "water" && moonEl === "air") || (sunEl === "air" && moonEl === "water")) {
    return "You feel things big but explain them clean — the gap between the two is where you live.";
  }
  if ((sunEl === "water" && moonEl === "earth") || (sunEl === "earth" && moonEl === "water")) {
    return "Grounded and deep — people feel safe with you because you actually get it.";
  }

  return `Your ${SIGN_META[sun].name} Sun and ${SIGN_META[moon].name} Moon make a combo that's all your own.`;
}

// Specific Sun+Moon pair one-liners. Returns null if no specific line.
function quickLineForPair(sun: SignId, moon: SignId): string | null {
  const key = [sun, moon].sort().join("-");
  const map: Record<string, string> = {
    "aries-cancer": "You charge hard, then need to retreat and feel it all.",
    "aries-capricorn": "You go after what you want like it's a job, and you don't quit.",
    "aries-libra": "Bold moves, then you second-guess who you stepped on.",
    "aries-pisces": "Fast on the outside, dreamy underneath — nobody quite figures you out.",
    "aries-scorpio": "You go from zero to all-in faster than anyone, and you don't come back halfway.",
    "aries-taurus": "Quick spark, slow burn — once you commit, you're a wall.",
    "aquarius-cancer": "Cool head, warm heart — people misread you both ways.",
    "aquarius-capricorn": "Free spirit with a five-year plan.",
    "aquarius-leo": "You want to be seen and left alone at the same time.",
    "aquarius-pisces": "Dreamy but unreachable — you're somewhere else even when you're here.",
    "aquarius-scorpio": "Detached on top, intense underneath — the combo surprises people.",
    "aquarius-taurus": "You want freedom and stability at the same time, and you'll fight for both.",
    "cancer-capricorn": "Soft heart, hard shell — you protect what's yours.",
    "cancer-gemini": "You feel everything, then talk it through until it makes sense.",
    "cancer-leo": "Warm and proud — you love big and you want it noticed.",
    "cancer-libra": "You smooth things over and carry the weight at home.",
    "cancer-pisces": "Two water signs — you absorb everything and need quiet to recover.",
    "cancer-sagittarius": "Homebody with itchy feet — you always come back, then need to leave again.",
    "cancer-scorpio": "Deep, private, and loyal past reason — you don't let just anyone in.",
    "cancer-virgo": "You care hard and you show it by fixing things.",
    "capricorn-gemini": "Serious on the outside, quick mind underneath.",
    "capricorn-leo": "You want to be respected and adored, and you'll work for both.",
    "capricorn-libra": "Charming and ambitious — you make it look easy while you grind.",
    "capricorn-pisces": "Practical on top, dreamy underneath — you build the dream slowly.",
    "capricorn-sagittarius": "You play the long game but you hate being fenced in.",
    "capricorn-scorpio": "Quiet outside, intense drive underneath — you don't telegraph your moves.",
    "capricorn-virgo": "You handle your business and you don't complain about it.",
    "gemini-leo": "Quick mouth, big presence — you're fun to watch.",
    "gemini-libra": "Charm and brains — you talk your way into and out of everything.",
    "gemini-pisces": "Quick mind, deep heart — you think fast and feel deeper.",
    "gemini-sagittarius": "Restless and curious — you're always halfway to the next thing.",
    "gemini-scorpio": "Light on top, heavy underneath — people underestimate you.",
    "gemini-virgo": "Quick mind, sharp eye — you notice everything and you say it.",
    "leo-libra": "Big warmth, easy charm — people like being around you.",
    "leo-pisces": "Big presence, soft center — you feel more than you let on.",
    "leo-sagittarius": "Big energy, big horizons — you don't do small.",
    "leo-scorpio": "Proud and intense — you love hard and you don't forget.",
    "leo-virgo": "You shine loud and you stress about the details privately.",
    "libra-pisces": "Charming and dreamy — you want beauty and you feel everything.",
    "libra-sagittarius": "Easy charm, itchy feet — you want partnership and freedom.",
    "libra-scorpio": "Graceful outside, intense inside — you feel more than you show.",
    "libra-virgo": "Charming outside, sharp inside — you notice what's off.",
    "pisces-sagittarius": "Dreamy and restless — you want meaning and you want it now.",
    "pisces-scorpio": "Deep and deeper — you go where others won't.",
    "pisces-virgo": "Dreamy and precise — you feel things and then organize them.",
    "sagittarius-scorpio": "Restless and intense — you want truth and you want it deep.",
    "sagittarius-virgo": "Big horizons, sharp eye — you see the pattern and the detail.",
    "scorpio-virgo": "Intense and precise — you don't miss anything and you don't forget.",
  };
  return map[key] || null;
}

// Two-sign combo tags for Sun + Moon. Returns null if no specific tag.
function comboTag(sun: SignId, moon: SignId): string | null {
  // Key is the sorted pair of sign ids, e.g. "aries-taurus".
  const key = [sun, moon].sort().join("-");
  const map: Record<string, string> = {
    "aries-cancer": "bold outside, soft inside",
    "aries-capricorn": "fast outside, controlled inside",
    "aries-libra": "bold outside, harmonious inside",
    "aries-pisces": "bold outside, dreamy inside",
    "aries-scorpio": "bold outside, intense inside",
    "aries-taurus": "fast outside, steady inside",
    "aquarius-cancer": "cool head, soft heart",
    "aquarius-capricorn": "free spirit, long game",
    "aquarius-leo": "friendly outside, proud inside",
    "aquarius-pisces": "cool head, deep heart",
    "aquarius-scorpio": "cool head, intense heart",
    "aquarius-taurus": "free outside, steady inside",
    "cancer-capricorn": "soft heart, hard shell",
    "cancer-gemini": "soft heart, busy mind",
    "cancer-leo": "soft heart, big presence",
    "cancer-libra": "soft heart, charming outside",
    "cancer-pisces": "soft heart, dreamy inside",
    "cancer-sagittarius": "soft heart, restless feet",
    "cancer-scorpio": "soft heart, intense inside",
    "cancer-virgo": "soft heart, sharp eye",
    "capricorn-gemini": "serious outside, quick mind",
    "capricorn-leo": "serious outside, shines loud",
    "capricorn-libra": "serious outside, charming inside",
    "capricorn-pisces": "serious outside, dreamy inside",
    "capricorn-sagittarius": "serious outside, itchy feet",
    "capricorn-scorpio": "serious outside, intense inside",
    "capricorn-virgo": "serious outside, sharp inside",
    "gemini-leo": "quick mind, big presence",
    "gemini-libra": "quick mind, charming heart",
    "gemini-pisces": "quick mind, dreamy heart",
    "gemini-sagittarius": "quick mind, big horizons",
    "gemini-scorpio": "quick mind, deep heart",
    "gemini-virgo": "quick mind, sharp eye",
    "leo-libra": "big presence, charming heart",
    "leo-pisces": "big presence, dreamy heart",
    "leo-sagittarius": "big presence, restless feet",
    "leo-scorpio": "big presence, intense heart",
    "leo-virgo": "big presence, sharp eye",
    "libra-pisces": "charming outside, dreamy inside",
    "libra-sagittarius": "charming outside, restless feet",
    "libra-scorpio": "charming outside, intense inside",
    "libra-virgo": "charming outside, sharp inside",
    "pisces-sagittarius": "dreamy inside, restless feet",
    "pisces-scorpio": "dreamy outside, intense inside",
    "pisces-virgo": "dreamy outside, sharp inside",
    "sagittarius-scorpio": "restless feet, intense heart",
    "sagittarius-virgo": "restless feet, sharp eye",
    "scorpio-virgo": "intense heart, sharp eye",
  };
  return map[key] || null;
}

// Big combined narrative for the Quick View. Reads Sun + Moon + Rising
// together, with scenarios and cause-and-effect. This replaces the old
// isolated 3-sentence summary with a real astrologer-style reading.
export function combinedSummary(profile: NatalProfile): string {
  const sun = profile.sun;
  const moon = profile.moon;
  const asc = profile.ascendant;
  const sunMeta = SIGN_META[sun.signId];
  const moonMeta = SIGN_META[moon.signId];
  const ascMeta = SIGN_META[asc.signId];

  // Pull in Venus and Mars for the romance angle, Mercury for communication,
  // because those shape how the Sun/Moon/Rising actually plays out in life.
  const venus = findPlanet(profile.planets, "venus");
  const mars = findPlanet(profile.planets, "mars");
  const mercury = findPlanet(profile.planets, "mercury");

  const parts: string[] = [];

  // Opening: the headline combo. Use just the first sentence of the Sun's
  // `short` to avoid mid-sentence capitalization issues with the sign name.
  const sunShortFirst = sunMeta.short.split(".")[0].toLowerCase();
  parts.push(
    `Your Sun with a ${moonMeta.name} Moon and ${ascMeta.name} rising is the combo that runs the whole show. The Sun is who you are at your center \u2014 ${sunShortFirst}. The Moon is who you are when no one's watching \u2014 ${moonLineInner(moon.signId)}. The rising sign is the front door: ${ascMeta.name} means ${ascLineInner(asc)}.`
  );

  // How Sun + Moon play together (the core tension or harmony).
  parts.push(sunMoonDynamic(sun.signId, moon.signId));

  // Add the rising sign's effect on the combo.
  parts.push(
    `Then ${ascMeta.name} rising sits on top of all that. ${ascEffectOnCombo(asc.signId, sun.signId, moon.signId)}`
  );

  // Bring in Venus + Mars if available, since they shape love and drive.
  if (venus && mars) {
    parts.push(venusMarsDynamic(venus.signId, mars.signId, sun.signId));
  } else if (venus) {
    parts.push(
      `Your Venus in ${SIGN_META[venus.signId].name} shapes how you love: ${venusInner(venus.signId)}. That sits next to your Sun, so the way you chase what you want (Sun) and the way you open up to someone (Venus) can pull in slightly different directions \u2014 which is completely normal, and actually makes you more interesting than someone whose chart all says the same thing.`
    );
  }

  // Mercury shapes communication.
  if (mercury) {
    parts.push(
      `When you talk, your Mercury in ${SIGN_META[mercury.signId].name} takes over: ${mercuryInner(mercury.signId)}. Combined with your Sun, this means the way you think and the way you actually are line up ${mercurySunAlignment(mercury.signId, sun.signId)} \u2014 so when people know you for a while, they notice your words and your vibe match.`
    );
  }

  // A real scenario showing what this combo looks like in a moment.
  parts.push(scenarioForCombo(sun.signId, moon.signId, asc.signId));

  // The honest closer: the good and the tricky, named together.
  parts.push(
    `The good: ${goodOfCombo(sun.signId, moon.signId)}. The tricky part: ${trickyOfCombo(sun.signId, moon.signId)}. Neither cancels the other out \u2014 you're both, depending on the day.`
  );

  return parts.join(" ");
}

function moonLineInner(id: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you react fast and you cool down fast",
    taurus: "you need calm and you don't like being pushed",
    gemini: "you process feelings through your head",
    cancer: "you feel everything and remember everything",
    leo: "you need to feel seen and appreciated",
    virgo: "you handle feelings by fixing things",
    libra: "you feel best when things are peaceful",
    scorpio: "you feel deep and you don't trust easily",
    sagittarius: "you process feelings through meaning",
    capricorn: "you keep feelings under control",
    aquarius: "you feel things but you watch yourself feeling them",
    pisces: "you absorb other people's moods",
  };
  return map[id];
}

function ascLineInner(id: SignId): string {
  const map: Record<SignId, string> = {
    aries: "people meet you and feel your energy first",
    taurus: "people relax around you without knowing why",
    gemini: "people meet you and want to talk",
    cancer: "people feel like they can open up to you",
    leo: "people notice you when you walk in",
    virgo: "you seem put-together and observant",
    libra: "you make people comfortable right away",
    scorpio: "people feel like you're really looking at them",
    sagittarius: "you seem up for anything",
    capricorn: "you seem like you've got your life together",
    aquarius: "people can't quite place you",
    pisces: "you feel approachable, almost dreamy",
  };
  return map[id];
}

// How the Sun and Moon interact \u2014 the core inner dynamic.
function sunMoonDynamic(sun: SignId, moon: SignId): string {
  if (sun === moon) {
    return `Having your Sun and Moon both in ${SIGN_META[sun].name} is a big deal \u2014 your outer self and your inner self want the same things. You don't have the inner argument that a lot of people have between what they want and what they need. The downside is you can be a little too consistent: your blind spots are the same on the inside and the outside, so there's no internal counterweight to catch what you miss.`;
  }

  const sunEl = SIGN_META[sun].element;
  const moonEl = SIGN_META[moon].element;

  if (sunEl === moonEl) {
    return `Your Sun and Moon are both ${sunEl} \u2014 same element, different signs. That means your core self and your emotional self speak the same language. You don't have to translate between what you want and what you feel. People experience you as congruent \u2014 what they see is what's actually going on inside. The risk is you can get stuck in one mode (${sunEl === "fire" ? "action without enough reflection" : sunEl === "earth" ? "practicality without enough dreaming" : sunEl === "air" ? "thinking without enough feeling" : "feeling without enough perspective"}) and need other people to balance you out.`;
  }

  // Compatible elements (fire+air, earth+water)
  const compatible =
    (sunEl === "fire" && moonEl === "air") || (sunEl === "air" && moonEl === "fire") ||
    (sunEl === "earth" && moonEl === "water") || (sunEl === "water" && moonEl === "earth");
  if (compatible) {
    return `Your ${SIGN_META[sun].name} Sun and ${SIGN_META[moon].name} Moon are different elements (${sunEl} + ${moonEl}) but they fuel each other. Your head wants one thing, your heart wants something compatible, and they actually work together. You'll notice this most when you're in a flow state \u2014 things feel easy because your inside and your outside are pulling the same direction, just with different tools.`;
  }

  // Clashing elements (fire+water, fire+earth, air+water, air+earth)
  return `Your ${SIGN_META[sun].name} Sun (${sunEl}) and ${SIGN_META[moon].name} Moon (${moonEl}) are different elements, and that's the interesting tension in you. Your conscious self wants ${sunEl === "fire" ? "action and momentum" : sunEl === "earth" ? "stability and results" : sunEl === "air" ? "ideas and freedom" : "depth and connection"}, but your emotional self needs ${moonEl === "fire" ? "to feel alive and moving" : moonEl === "earth" ? "to feel safe and steady" : moonEl === "air" ? "to understand and talk" : "to feel and merge"}. Sometimes they line up. Sometimes you feel like two different people on a bad day. That's not a flaw \u2014 it's the work of your life to integrate them, and most people never bother.`;
}

// How the rising sign shapes the Sun+Moon combo.
function ascEffectOnCombo(asc: SignId, sun: SignId, moon: SignId): string {
  const ascEl = SIGN_META[asc].element;
  const sunEl = SIGN_META[sun].element;
  const moonEl = SIGN_META[moon].element;

  if (ascEl === sunEl && ascEl === moonEl) {
    return `Since your rising is also ${ascEl}, the whole chart points the same direction. You come across as fully ${SIGN_META[asc].name}, and that's actually who you are. Consistent, recognizable, easy to read \u2014 sometimes too easy.`;
  }

  const ascMeta = SIGN_META[asc];
  if (ascEl === sunEl) {
    return `Your rising is ${ascEl} (same as your Sun), so the first impression people get is actually who you are at your core \u2014 ${ascMeta.short.split(".")[0].toLowerCase()} But your ${moonEl} Moon is the part that surprises people once they get close: there's a whole different emotional layer underneath that doesn't match the front door.`;
  }

  if (ascEl === moonEl) {
    return `Your rising is ${ascEl} (same as your Moon), so people meet your emotional self first. They sense ${ascMeta.short.split(".")[0].toLowerCase()} before you say a word. Your ${sunEl} Sun is the part that takes a little longer to show \u2014 the conscious, identity-level you that comes out once you trust someone.`;
  }

  return `Your rising is a third element (${ascEl}), so it adds a different flavor to the whole mix. People meet ${ascMeta.short.split(".")[0].toLowerCase()} and that's the door. Once they're through the door, they find your ${sunEl} Sun and ${moonEl} Moon running the actual show. You're more layered than you look at first glance \u2014 which is part of why people who think they've figured you out in five minutes are usually wrong.`;
}

// How Venus + Mars interact in love and drive.
function venusMarsDynamic(venus: SignId, mars: SignId, sun: SignId): string {
  const venusMeta = SIGN_META[venus];
  const marsMeta = SIGN_META[mars];
  const sunMeta = SIGN_META[sun];

  if (venus === mars) {
    return `Your Venus and Mars are both in ${venusMeta.name} \u2014 same sign for love and for drive. That means what you want (Venus) and how you go after it (Mars) are singing the same song. In dating, you're not split between chasing one kind of person and being attracted to another. You're consistent, which makes you easier to read than most. The risk is you can get stuck in a pattern: the same type of person, the same approach, over and over.`;
  }

  const venusEl = venusMeta.element;
  const marsEl = marsMeta.element;
  if (venusEl === marsEl) {
    return `Your Venus in ${venusMeta.name} and Mars in ${marsMeta.name} are different signs but the same element (${venusEl}). So the way you love and the way you chase both run on the same fuel. When you want someone, your Venus draws them in and your Mars goes after them with the same energy \u2014 no mixed signals. That's a smooth combination, but it can also mean you don't have a natural brake: when you want, you want, and pulling back doesn't come as easily.`;
  }

  return `Your Venus in ${venusMeta.name} (${venusEl}) and Mars in ${marsMeta.name} (${marsEl}) are different elements \u2014 and this is where you get interesting. The kind of person you're attracted to (Venus) and the way you actually go after them (Mars) pull in different directions. You might be drawn to ${venusInner(venus).split(",")[0]} people, but you pursue them by ${marsInner(mars).split(",")[0]}. That mismatch can be confusing for everyone involved \u2014 including you \u2014 but it also means you have range. Different sides of you come out with different people.`;
}

// How Mercury lines up with the Sun.
function mercurySunAlignment(mercury: SignId, sun: SignId): string {
  if (mercury === sun) return "perfectly";
  const mEl = SIGN_META[mercury].element;
  const sEl = SIGN_META[sun].element;
  if (mEl === sEl) return "well";
  return "in a way that's a little surprising \u2014 your words don't always match the vibe people get from you";
}

// A real scenario showing the combo in action.
function scenarioForCombo(sun: SignId, moon: SignId, asc: SignId): string {
  const sunEl = SIGN_META[sun].element;
  const moonEl = SIGN_META[moon].element;

  // A few archetype scenarios based on element combos.
  if (sunEl === "fire" && moonEl === "earth") {
    return `Picture this: someone criticizes a thing you made. Your fire Sun wants to defend it out loud, right now. Your earth Moon wants to retreat, sit with it, decide if they're right. The version of you other people see in that moment depends on which one wins \u2014 and it's not always the same one. That inner push-pull is part of why you're more thoughtful than people expect from a ${SIGN_META[sun].name} Sun.`;
  }
  if (sunEl === "fire" && moonEl === "water") {
    return `Picture this: a friend is going through a hard time. Your fire Sun wants to fix it, do something, take action. Your water Moon wants to sit with them and feel it with them. You end up doing both \u2014 showing up hard, then realizing they just needed you to be there, not to solve it. That combo makes you a better friend than someone who only knows one mode.`;
  }
  if (sunEl === "earth" && moonEl === "fire") {
    return `Picture this: you're at a party and someone's being a little too much. Your earth Sun wants to roll its eyes and find the exit. Your fire Moon is actually kind of entertained. You'll probably stay longer than you thought you would \u2014 the inner fire gets bored of being sensible. Then tomorrow you'll need quiet to recover. That rhythm (out, then in) is just how you're built.`;
  }
  if (sunEl === "earth" && moonEl === "water") {
    return `Picture this: someone you love is hurting. Your earth Sun wants to do something practical \u2014 bring food, fix the thing, handle the logistics. Your water Moon is absorbing their sadness like a sponge. You end up doing both: you're the person who shows up with a casserole AND cries with them. That's not a contradiction, that's the whole you.`;
  }
  if (sunEl === "air" && moonEl === "water") {
    return `Picture this: you're in an argument. Your air Sun wants to talk it through logically, find the words, make the point. Your water Moon is feeling it under the table and might not have words for why. You'll sometimes win the argument on paper and lose it inside, because the logical win doesn't actually resolve the feeling. Learning to say 'I know it doesn't make sense, but I feel it anyway' is one of your life skills.`;
  }
  if (sunEl === "air" && moonEl === "earth") {
    return `Picture this: you're planning a trip with friends. Your air Sun has seventeen ideas and wants to talk through all of them. Your earth Moon has already figured out the budget and the dates that actually work. You're the friend who can both brainstorm and execute \u2014 which is why people end up asking you to organize things. Just don't let the earth side silently resent doing all the actual work while the air side gets credit for the ideas.`;
  }
  if (sunEl === "water" && moonEl === "air") {
    return `Picture this: you're upset about something and someone asks why. Your water Sun feels it deep, but your air Moon wants to explain it in clean sentences. You end up either over-explaining (because the feeling is bigger than the words) or going quiet (because you can't find words that feel honest). Both are fine. The trick is not to fake a tidy explanation when the truth is messy.`;
  }
  if (sunEl === "water" && moonEl === "fire") {
    return `Picture this: someone crosses a line with you. Your water Sun feels it immediately, deep. Your fire Moon wants to react, out loud, now. You'll feel the hurt and the anger at the same time, and they'll feed each other. That's real power when you learn to use it \u2014 and a real mess when you don't. The pause between feeling and reacting is your whole life's work.`;
  }

  // Same element Sun + Moon
  if (sunEl === moonEl) {
    return `Picture this: a decision needs to be made and you're the one making it. Your ${sunEl} Sun and ${moonEl} Moon agree on the approach \u2014 ${sunEl === "fire" ? "move on it" : sunEl === "earth" ? "take your time, get it right" : sunEl === "air" ? "talk it through first" : "feel it out first"}. You don't have the inner argument a lot of people have. That makes you decisive, but it also means you can lean too hard in one direction without an internal counterweight. Other people are that counterweight for you \u2014 listen to them.`;
  }

  // Fallback
  return `Picture this: you're in a new situation and you don't know anyone there. Your rising sign handles the first ten minutes \u2014 ${ascLineInner(asc)}. Once you're settled, your Sun takes over and your Moon is doing its own thing underneath the whole time. The you that walks in and the you that's comfortable after an hour are both real, they're just different layers.`;
}

function goodOfCombo(sun: SignId, moon: SignId): string {
  const sunEl = SIGN_META[sun].element;
  const moonEl = SIGN_META[moon].element;
  if (sunEl === moonEl) {
    return `you're consistent, easy to read, and your inside matches your outside`;
  }
  if ((sunEl === "fire" && moonEl === "air") || (sunEl === "air" && moonEl === "fire")) {
    return `you're quick, fun, and you can think on your feet \u2014 people like having you around`;
  }
  if ((sunEl === "earth" && moonEl === "water") || (sunEl === "water" && moonEl === "earth")) {
    return `you're grounded and deep \u2014 people feel safe with you and you actually understand them`;
  }
  return `you have range \u2014 you can be different things in different situations, and that's a real strength`;
}

function trickyOfCombo(sun: SignId, moon: SignId): string {
  const sunEl = SIGN_META[sun].element;
  const moonEl = SIGN_META[moon].element;
  if (sunEl === moonEl) {
    return `you can get stuck in one mode and not notice it \u2014 your blind spots are the same inside and out`;
  }
  if ((sunEl === "fire" && moonEl === "water") || (sunEl === "water" && moonEl === "fire")) {
    return `your feelings and your reactions can amplify each other fast \u2014 the pause between feeling and doing is where you either stay in control or lose it`;
  }
  if ((sunEl === "earth" && moonEl === "air") || (sunEl === "air" && moonEl === "earth")) {
    return `your head and your body sometimes want different things, and you can talk yourself out of what you actually need`;
  }
  return `you can feel like two different people depending on the day, and that confuses the people around you`;
}

// Helper exports used by combinedSummary above (re-exported from the
// per-planet functions so we don't duplicate the content).
function venusInner(s: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you love the chase, fast, direct, you fall hard",
    taurus: "sensual, loyal, you love through the body and presence",
    gemini: "playful, witty, you fall in love through conversation",
    cancer: "tender, devoted, you love through care and protection",
    leo: "warm, generous, you love big and want to be adored back",
    virgo: "thoughtful, reliable, you love through small acts of service",
    libra: "charming, fair, you love through partnership and beauty",
    scorpio: "intense, devoted, you love deep and you want to merge",
    sagittarius: "free, honest, you love through shared adventure",
    capricorn: "serious, loyal, you love through commitment over time",
    aquarius: "unconventional, fair, you love through friendship and ideals",
    pisces: "romantic, deep, you love without limits",
  };
  return map[s];
}

function marsInner(s: SignId): string {
  const map: Record<SignId, string> = {
    aries: "fast, direct, first to act",
    taurus: "slow to start, impossible to stop",
    gemini: "scattered, fast, verbal in conflict",
    cancer: "indirect, protective, emotionally charged",
    leo: "warm-blooded, proud, playful",
    virgo: "precise, skilled, service-driven",
    libra: "strategic, indirect, conflict-averse",
    scorpio: "strategic, intense, relentless",
    sagittarius: "adventurous, blunt, optimistic",
    capricorn: "ambitious, controlled, patient",
    aquarius: "principled, eccentric, idealistic",
    pisces: "intuitive, fluid, emotionally driven",
  };
  return map[s];
}

function mercuryInner(s: SignId): string {
  const map: Record<SignId, string> = {
    aries: "you think fast and you talk blunt",
    taurus: "you think deliberately and you don't change your mind easily",
    gemini: "you think in webs and you can talk to anyone about anything",
    cancer: "you think with your feelings, how it feels matters as much as the facts",
    leo: "you talk with warmth and a little flair, you're good at stories",
    virgo: "you think in details, you catch what other people miss",
    libra: "you communicate with charm and you can see every side",
    scorpio: "you think deeply and you read people well",
    sagittarius: "you think in big pictures and you talk straight",
    capricorn: "you communicate carefully and with purpose",
    aquarius: "you think originally and you see things other people miss",
    pisces: "you think in images and feelings more than straight lines",
  };
  return map[s];
}

// ---- Combined planet-pair narratives for the Detailed View ----
// Instead of explaining Mars alone and Jupiter alone, these read pairs
// together. Each returns a flowing paragraph with scenarios.

export interface PlanetPairNarrative {
  title: string;
  teaser: string;   // 1-2 sentence hook shown by default
  body: string;      // full story shown on expand
}

// Returns combined narratives for the most important planet pairs in the
// chart. The Detailed View can render these as a "How your chart works
// together" section, in addition to (not instead of) the per-planet cards.
export function combinedPlanetNarratives(profile: NatalProfile): PlanetPairNarrative[] {
  const out: PlanetPairNarrative[] = [];
  const sun = profile.sun;
  const moon = profile.moon;
  const venus = findPlanet(profile.planets, "venus");
  const mars = findPlanet(profile.planets, "mars");
  const mercury = findPlanet(profile.planets, "mercury");
  const jupiter = findPlanet(profile.planets, "jupiter");
  const saturn = findPlanet(profile.planets, "saturn");

  // Mars + Jupiter: how drive and growth work together.
  if (mars && jupiter) {
    const marsMeta = SIGN_META[mars.signId];
    const jupiterMeta = SIGN_META[jupiter.signId];
    out.push({
      title: "How your drive and your growth work together",
      teaser: `How you go after things and where life opens doors for you — these two are connected. ${marsMeta.name === jupiterMeta.name ? "Same sign means no natural brake — you can overdo it." : "They pull in different directions, and that's where you get range."}`,
      body: marsJupiterNarrative(mars.signId, jupiter.signId, mars.house, jupiter.house),
    });
  }

  // Moon + its house: the inner emotional world, with the house showing
  // where it actually plays out.
  const moonMeta = SIGN_META[moon.signId];
  const moonHouseName = houseMeaning(moon.house).name.toLowerCase();
  out.push({
    title: "Your emotional world, in real life",
    teaser: `Your ${moonMeta.name} Moon lives in your ${moon.house}${ordinal(moon.house)} house of ${moonHouseName}. ${moon.house === 12 ? "Delayed reactions and spongy boundaries — you feel things hours after they happen." : moon.house === 4 ? "Home is wired straight into your emotional system." : moon.house === 7 ? "Your feelings run through your relationships." : moon.house === 10 ? "Your moods are more visible than you think." : "When this area of life is off, your whole system feels it."}`,
    body: moonHouseNarrative(moon.signId, moon.house),
  });

  // Venus + Mars: love and attraction combined.
  if (venus && mars) {
    const venusMeta = SIGN_META[venus.signId];
    const marsMeta = SIGN_META[mars.signId];
    out.push({
      title: "How you love and how you chase",
      teaser: `Venus in ${venusMeta.name} is what you're drawn to. Mars in ${marsMeta.name} is how you go after it. ${venusMeta.name === marsMeta.name ? "Same sign — you're consistent, which makes you easy to read." : "Different signs — you have range, and different sides of you come out with different people."}`,
      body: venusMarsNarrative(venus.signId, mars.signId, venus.house, mars.house),
    });
  }

  // Mercury + Sun: how your words and your identity line up.
  if (mercury) {
    const mercuryMeta = SIGN_META[mercury.signId];
    const sunMeta = SIGN_META[sun.signId];
    out.push({
      title: "How your words and who you are line up",
      teaser: `How you talk and who you are — these two are connected. ${mercuryMeta.name === sunMeta.name ? "They match — what you say is who you are." : "They don't perfectly match — your words and your vibe can feel like two different people."}`,
      body: mercurySunNarrative(mercury.signId, sun.signId, mercury.house),
    });
  }

  // Saturn + Sun: where you meet your limits.
  if (saturn) {
    const saturnMeta = SIGN_META[saturn.signId];
    const sunMeta = SIGN_META[sun.signId];
    const saturnHouseName = houseMeaning(saturn.house).name.toLowerCase();
    out.push({
      title: "Where you'll work the hardest (and grow the most)",
      teaser: `Saturn in ${saturnMeta.name} sits in your ${saturn.house}${ordinal(saturn.house)} house of ${saturnHouseName}. This is your long apprenticeship — the area where you'll outwork everyone and earn real authority by midlife.`,
      body: saturnSunNarrative(saturn.signId, sun.signId, saturn.house),
    });
  }

  return out;
}

function marsJupiterNarrative(marsSign: SignId, jupiterSign: SignId, marsHouse: number, jupiterHouse: number): string {
  const marsMeta = SIGN_META[marsSign];
  const jupiterMeta = SIGN_META[jupiterSign];
  const marsHouseName = houseMeaning(marsHouse).name.toLowerCase();
  const jupiterHouseName = houseMeaning(jupiterHouse).name.toLowerCase();

  if (marsSign === jupiterSign) {
    return `Mars and Jupiter are both in ${marsMeta.name}, which is a strong combination. Mars is your drive \u2014 how you go after things. Jupiter is your growth \u2014 where life feels generous when you lean in. Having them in the same sign means your energy and your luck point the same direction. When you want something, you tend to get it, because you're putting real fire behind something the universe is already opening doors for. The catch: you can overdo it. Same sign means no natural brake. You'll burn out or overreach if you don't learn to pace yourself. Your Mars lives in your ${marsHouse}th house of ${marsHouseName}, so this drive shows up most in that area of life. Your Jupiter lives in your ${jupiterHouse}th house of ${jupiterHouseName}, so that's where the growth actually happens.`;
  }

  const marsEl = marsMeta.element;
  const jupiterEl = jupiterMeta.element;
  const sameEl = marsEl === jupiterEl;

  return `Mars in ${marsMeta.name} and Jupiter in ${jupiterMeta.name} are ${sameEl ? "the same element" : "different elements"}, and that shapes how your drive (Mars) and your growth (Jupiter) work together. Your Mars is ${marsInner(marsSign)} \u2014 that's how you actually go after what you want. Your Jupiter is in ${jupiterMeta.name}, which means life tends to expand you through ${jupiterSignLine(jupiterSign)}.

Here's what that looks like together: when you chase something, your Mars does it ${marsInner(marsSign).split(",")[0]}. But your Jupiter is quietly opening different doors \u2014 the ${jupiterHouseName} area of your life is where opportunities tend to show up. If your Mars is pointed at the same area as your Jupiter (the ${marsHouseName} vs the ${jupiterHouseName}), you'll feel like things come easy. If they're in different areas, you'll work hard in one place and find luck in another, and the trick is not to resent that \u2014 it's actually how you end up with range.

Real moment: say you decide you want to start a thing. Your ${marsMeta.name} Mars wants to ${marsAction(marsSign)}. Your ${jupiterMeta.name} Jupiter quietly lines up opportunities in the background. The version of you that succeeds is the one that does the Mars work (the actual going-after-it) and stays open to the Jupiter opportunities (the ones that don't look like what you expected). Don't get so fixed on the Mars version of the goal that you miss the Jupiter version of the door.`;
}

function marsAction(s: SignId): string {
  const map: Record<SignId, string> = {
    aries: "just start, today, right now",
    taurus: "build it slowly and patiently",
    gemini: "talk to a hundred people about it first",
    cancer: "make sure the people you love are on board first",
    leo: "make it look good and get people excited",
    virgo: "plan the details before doing anything",
    libra: "find a partner and do it together",
    scorpio: "go all in and don't tell anyone until it's done",
    sagittarius: "start, then figure out the plan on the way",
    capricorn: "set a five-year plan and execute",
    aquarius: "find a community to do it with",
    pisces: "feel out the right direction first, then go",
  };
  return map[s];
}

function jupiterSignLine(s: SignId): string {
  const map: Record<SignId, string> = {
    aries: "bold first moves and trusting your instincts",
    taurus: "patient building and committing to what lasts",
    gemini: "curiosity, learning, and connecting with new people",
    cancer: "family, home, and emotional depth",
    leo: "creative expression and being seen for who you are",
    virgo: "mastery, skill, and being of real service",
    libra: "partnership, beauty, and fair deals",
    scorpio: "deep transformation and trusting people fully",
    sagittarius: "travel, big questions, and following your truth",
    capricorn: "long-term ambition and patient climbing",
    aquarius: "community, causes, and following your own weird path",
    pisces: "compassion, creativity, and trusting your intuition",
  };
  return map[s];
}

function moonHouseNarrative(moonSign: SignId, moonHouse: number): string {
  const moonMeta = SIGN_META[moonSign];
  const house = houseMeaning(moonHouse);
  const houseName = house.name.toLowerCase();

  // Special-case the most emotionally loaded houses.
  if (moonHouse === 12) {
    return `Your Moon sits in the 12th house \u2014 the house of solitude, dreams, and the unconscious. Here's what that actually looks like: you absorb other people's moods without realizing it. You walk into a room and your nervous system reads it before your brain does. Then hours later (sometimes days), you feel off and you can't always trace why. Something hurt you on Tuesday and you don't notice it until Thursday.

This is the delayed-reaction Moon. Don't expect yourself to know how you feel in the moment \u2014 you often don't, and that's not a flaw, it's how this placement works. You need alone time to actually feel your own feelings, because in company they get tangled up with everyone else's. If you don't get that alone time, you'll start to feel like you're carrying weight that isn't yours.

The good: you have real intuition. You know things about people before they say them. You're kind in a way that's not performed \u2014 you actually feel what they feel. The tricky part: boundaries are hard, and you can drown in someone else's emotional stuff and forget what's yours. Have a daily ritual that's just yours \u2014 a walk, a journal, ten minutes of nothing \u2014 so your sponge-self has somewhere to wring out.

Your Moon adds its own flavor: ${moonLineInner(moonSign)}. So your emotional base is ${moonMeta.name}-flavored, but it's playing out in the 12th house's private, spongy, delayed way. That combo makes you deeper than you look on the outside \u2014 most people have no idea how much is going on in there.`;
  }

  if (moonHouse === 4) {
    return `Your Moon sits in the 4th house \u2014 the house of home, family, and roots. Your emotional life is wired directly into where you live and who you call your own. You can't feel okay inside if your home isn't okay. A messy house, a tense family situation, an unstable living situation \u2014 those hit you harder than they hit other people, because your Moon lives there.

This also means: your family shaped you more than most. Whatever happened in your childhood home is still running your emotional system today, in ways you probably haven't fully mapped yet. The good: you have deep roots, you're loyal to your people, and you can build a home that actually feels like one. The tricky part: you can hold onto family patterns (good and bad) longer than serves you, and moving or changing your living situation can hit you emotionally in ways that don't make logical sense.

Your inner self is ${moonLineInner(moonSign)}. Combined with the 4th house, that emotional nature plays out most at home, with family, and in your private base. The version of you that exists in public is not the whole story \u2014 the real you comes out at home.`;
  }

  if (moonHouse === 7) {
    return `Your Moon sits in the 7th house \u2014 the house of partnership. Your emotional life is wired directly into your relationships. You feel things through other people. Single, you might feel a little unmoored. Paired up (with the right person), you feel grounded. The catch: you can absorb your partner's emotional state and forget what's yours. And you might stay in a relationship past its expiration date because the idea of not being in one feels worse than being in a mediocre one.

Your inner self is ${moonLineInner(moonSign)}. In the 7th house, that emotional nature shows up most in one-to-one bonds. The right partner gets all of it \u2014 the deep ${moonMeta.name} feelings, the loyalty, the real you. The wrong partner gets a version of you that's slowly exhausting itself trying to make it work.`;
  }

  if (moonHouse === 10) {
    return `Your Moon sits in the 10th house \u2014 the house of career and public life. Your emotional life is wired into your work and your reputation. You can't feel okay inside if your work isn't okay. A bad job doesn't just stress you out \u2014 it messes with your whole emotional system. And your feelings are more visible to the public than you might realize.

Your inner self is ${moonLineInner(moonSign)}. In the 10th house, that shows up in your work. You'll be drawn to careers that let you bring your real emotional self, not just a professional mask. The good: people feel something real from you, and that's magnetic. The tricky part: it's hard to leave work at work, and your mood affects your public image more than for most people.`;
  }

  // Generic moon + house narrative for the other houses.
  return `Your Moon sits in your ${moonHouse}th house \u2014 the house of ${houseName}. Your emotional life (${moonLineInner(moonSign)}) shows up most in this area: ${houseName}.

Here's how that plays out: when something's off in the ${houseName} part of your life, your emotional system feels it first and hardest. When it's going well, you feel grounded. The feeling is ${moonMeta.short.split(".")[0].toLowerCase()} So you bring that ${moonMeta.name} flavor to ${houseName} \u2014 the way you experience this area is colored by your ${moonMeta.name} emotional nature, not just by what's happening on the surface.

Real moment: say something goes wrong in ${houseName}. Your Your Moon doesn't just think 'that's annoying' \u2014 it feels it. ${moonReactionLine(moonSign)} That's not overreacting. That's your Moon doing its job, in the house where it lives.`;
}

function moonReactionLine(s: SignId): string {
  const map: Record<SignId, string> = {
    aries: "You feel a flash of anger and want to do something about it now.",
    taurus: "You go quiet, dig in, and need time to feel safe again.",
    gemini: "You want to talk it out, find the words, maybe text three friends about it.",
    cancer: "You retreat into your shell and need comfort before you can engage.",
    leo: "You feel it big, and you want someone to notice and care.",
    virgo: "You start trying to fix it, even if no one asked you to.",
    libra: "You feel the imbalance and want to restore harmony before anything else.",
    scorpio: "You go private, intense, and you don't let it go until you understand it.",
    sagittarius: "You want to find the meaning in it, the lesson, the bigger picture.",
    capricorn: "You keep a lid on it and handle the situation, then feel it later alone.",
    aquarius: "You step back and observe yourself feeling it, a little from the outside.",
    pisces: "You absorb the whole emotional atmosphere and might not be able to tell what's yours.",
  };
  return map[s];
}

function venusMarsNarrative(venusSign: SignId, marsSign: SignId, venusHouse: number, marsHouse: number): string {
  const venusMeta = SIGN_META[venusSign];
  const marsMeta = SIGN_META[marsSign];
  const venusHouseName = houseMeaning(venusHouse).name.toLowerCase();
  const marsHouseName = houseMeaning(marsHouse).name.toLowerCase();

  if (venusSign === marsSign) {
    return `Venus and Mars are both in ${venusMeta.name}. What you want (Venus) and how you go after it (Mars) are the same energy. In love, that means you're not split \u2014 you don't chase one kind of person and be attracted to another. You're consistent, which makes you easier to read than most. The risk: you can get stuck in a pattern, always going for the same type, always approaching the same way.

Your Venus lives in your ${venusHouse}th house of ${venusHouseName} \u2014 that's where love and attraction show up in your life. Your Mars lives in your ${marsHouse}th house of ${marsHouseName} \u2014 that's where you actually take action. When these two houses are talking to each other (and they often are), you'll find that the things you want and the things you do about them line up. When they're not, you might find yourself attracted to people who don't fit into the area of life where you actually take action \u2014 which is confusing but not unusual.`;
  }

  return `Venus in ${venusMeta.name} and Mars in ${marsMeta.name} are different signs \u2014 and this is where your love life gets interesting. Venus is what you're drawn to: ${venusInner(venusSign)}. Mars is how you go after it: ${marsInner(marsSign)}.

Notice they're not the same. The kind of person you're attracted to and the way you actually pursue them can pull in different directions. You might be drawn to someone ${venusInner(venusSign).split(",")[0]}, but when you go after them, you do it ${marsInner(marsSign).split(",")[0]}. That mismatch isn't a bug \u2014 it's actually why you have range. Different sides of you come out with different people.

Real moment: say you're into someone. Your ${venusMeta.name} Venus is doing the wanting \u2014 you notice them, you feel the pull, you imagine what it would be like. Your ${marsMeta.name} Mars is doing the chasing \u2014 the actual texting, the asking out, the making it happen. If those two energies are out of sync (say, Venus wants深度连接 but Mars wants the thrill of the chase), you'll feel torn in two directions inside the same situation. The trick is naming both: 'I'm drawn to this person because [Venus reason], and I'm approaching it this way because [Mars reason].' Once you can see both, you can choose.

Your Venus lives in your ${venusHouse}th house of ${venusHouseName}, so love tends to find you in that area of life. Your Mars lives in your ${marsHouse}th house of ${marsHouseName}, so that's where you actually take action. If those two areas are the same, things flow. If they're different, you'll find love in one place and have to go after it in another.`;
}

function mercurySunNarrative(mercurySign: SignId, sunSign: SignId, mercuryHouse: number): string {
  const mercuryMeta = SIGN_META[mercurySign];
  const sunMeta = SIGN_META[sunSign];
  const houseName = houseMeaning(mercuryHouse).name.toLowerCase();

  if (mercurySign === sunSign) {
    return `Mercury and the Sun are both in ${sunMeta.name} \u2014 your words and your identity are singing the same song. What you say is who you are. People experience you as congruent: the way you talk matches the vibe they get from you. That makes you easy to trust. The risk: you can be a little too consistent \u2014 no gap between feeling and speaking, which means you sometimes say things before you've had a chance to think them through.

Mercury lives in your ${mercuryHouse}th house of ${houseName}, so your communication shows up most in that area. That's where your ${mercuryMeta.name} mind does its best work.`;
  }

  const mercuryEl = mercuryMeta.element;
  const sunEl = sunMeta.element;
  const sameEl = mercuryEl === sunEl;

  return `How your words and your identity line up: ${sunMeta.short.split(".")[0].toLowerCase()} ${mercuryInner(mercurySign)}

${sameEl
  ? "Same element means your words and your vibe match. People feel like what you say is who you are. That makes you easy to read and easy to trust."
  : "Different elements means there's a gap between your vibe and your words. People sometimes feel like the you they meet and the you in your sentences are slightly different people. That's not fake \u2014 it's just that your communication style doesn't perfectly match your presence. Once people know you, they get it. But in the first impression, you can be misread."}

Mercury lives in your ${mercuryHouse}th house of ${houseName}, so your ${mercuryMeta.name} mind shows up most in that area. That's where you do your best thinking, talking, and writing.

Real moment: say someone asks you a question that matters. You have a real answer (who you are, what you actually think), and you have to find the words. ${sameEl ? "Those two line up cleanly \u2014 you say what you mean." : "Sometimes the words come out sideways, because your Mercury is processing in a different mode than your Sun is feeling. Give yourself a beat to translate before answering."}`;
}

function saturnSunNarrative(saturnSign: SignId, sunSign: SignId, saturnHouse: number): string {
  const saturnMeta = SIGN_META[saturnSign];
  const sunMeta = SIGN_META[sunSign];
  const houseName = houseMeaning(saturnHouse).name.toLowerCase();

  return `Saturn sits in your ${saturnHouse}th house of ${houseName}. This is where you'll work the hardest, and where you'll grow the most. It's not a punishment \u2014 it's the long apprenticeship. The area of ${houseName} is where life asks you to step up, be responsible, and put in the years.

Your Sun is who you are at your core. Saturn is asking you to grow up specifically in the ${houseName} area, which might or might not be where your Sun naturally lives. If they're aligned, you'll feel like this area is a calling. If they're not, you'll feel like this area is a heavy lift \u2014 something you have to do even though it doesn't come naturally.

Real moment: say you hit a wall in ${houseName}. You want to ${sunReactionLine(sunSign)}. Saturn says: not yet. Do the work, put in the time, earn it. That tension is the whole game. Saturn rewards patience \u2014 the people who skip the apprenticeship don't get the authority at the end. You will, if you stay.

The good: by midlife, this area of your life will be a real source of strength and authority for you. The tricky part: your twenties and thirties can feel like a long lesson in this area. Don't confuse 'hard' with 'wrong.' Hard is the point.`;
}

function sunReactionLine(s: SignId): string {
  const map: Record<SignId, string> = {
    aries: "push through, fix it now, charge",
    taurus: "step back, take time, get steady",
    gemini: "talk it out, find another angle",
    cancer: "retreat, feel it, handle it privately",
    leo: "be seen dealing with it, make it count",
    virgo: "analyze it, find the fix, do the work",
    libra: "find balance, get input, decide together",
    scorpio: "go private, get to the bottom of it",
    sagittarius: "find the meaning, then move on",
    capricorn: "handle it like an adult, no drama",
    aquarius: "step back, see the system, fix the system",
    pisces: "feel it out, find the right flow",
  };
  return map[s];
}

// ===========================================================================
// PLANET + HOUSE COMBINED NARRATIVE
// ---------------------------------------------------------------------------
// For every planet, the house it sits in redirects and intensifies the sign
// meaning. This function generates that second layer — it's appended after
// the sign-only text, not a replacement. The text explains HOW the house
// changes the sign meaning, not just WHAT the house means.
// ===========================================================================

// House domain keywords — what each house is "about"
const HOUSE_DOMAINS: Record<number, { name: string; redirect: string }> = {
  1:  { name: "self, body, first impressions", redirect: "pulled outward — your energy is visible and people react to it before you say a word" },
  2:  { name: "money, values, what you own", redirect: "pulled toward the material — your energy expresses through what you value, earn, and hold onto" },
  3:  { name: "communication, siblings, short trips", redirect: "pulled toward the everyday — your energy expresses through talking, writing, and moving around your immediate world" },
  4:  { name: "home, family, roots", redirect: "pulled inward and downward — your energy expresses through your home, your family dynamics, and your emotional foundation" },
  5:  { name: "creativity, romance, self-expression", redirect: "pulled toward play — your energy expresses through what you create, who you flirt with, and how you have fun" },
  6:  { name: "work, health, daily routine", redirect: "pulled toward the practical — your energy expresses through your habits, your work ethic, and how you take care of your body" },
  7:  { name: "partnership, marriage, open enemies", redirect: "pulled toward others — your energy expresses through one-to-one relationships and the mirror they hold up to you" },
  8:  { name: "transformation, intimacy, shared resources", redirect: "pulled toward depth — your energy expresses through intensity, vulnerability, and the stuff that's hidden or shared" },
  9:  { name: "travel, higher education, meaning", redirect: "pulled outward and upward — your energy expresses through big questions, far places, and the search for meaning" },
  10: { name: "career, public role, reputation", redirect: "pulled toward the world — your energy expresses through your vocation, your public image, and what you're known for" },
  11: { name: "community, friends, hopes", redirect: "pulled toward the collective — your energy expresses through your social networks, your ideals, and your place in a group" },
  12: { name: "solitude, the unconscious, hidden things", redirect: "pulled inward and behind the scenes — your energy expresses privately, often unconsciously, and sometimes through things you can't quite see about yourself" },
};

// How each planet's energy gets redirected by a house
const PLANET_HOUSE_REDIRECT: Record<string, (houseName: string) => string> = {
  sun: (h) => `In the ${h}, your core identity gets ${HOUSE_DOMAINS[Object.keys(HOUSE_DOMAINS).find(k => HOUSE_DOMAINS[Number(k)].name === h)?.length ? "" : ""] || ""}redirected. But the real shift is: instead of your identity being about who you are in general, it's specifically about who you are in the realm of ${h}.`,
  moon: (h) => `Your Moon in the house of ${h} means your emotional needs are specifically shaped by this area. You'll feel things here that you don't feel elsewhere — this is where your feelings get the most real and the most complicated.`,
  mercury: (h) => `Your mind in the house of ${h} means your thinking is channeled here. This is where you're most verbal, most curious, most likely to be reading, writing, or talking. Your mental energy concentrates in this life area.`,
  venus: (h) => `Your love nature in the house of ${h} means your attraction, your values, and your aesthetic sense are channeled here. This is where you find beauty, where you give and receive affection, and where "love" most concretely lives.`,
  mars: (h) => `Your drive in the house of ${h} means your energy, your ambition, and your temper are channeled here. This is where you push hardest, where you're most likely to start things, and where conflict is most likely to flare.`,
  jupiter: (h) => `Your growth in the house of ${h} means your expansion, your optimism, and your belief system are channeled here. Life tends to open doors for you in this area — but you also risk overdoing it here.`,
  saturn: (h) => `Your Saturn in the house of ${h} means your heaviest lessons, your deepest fears, and your greatest mastery are in this area. This is where you'll work the hardest and grow the most. It's not punishment — it's the long apprenticeship.`,
  uranus: (h) => `Your Uranus in the house of ${h} means your need for change, your rebellion, and your sudden insights are channeled here. This is where you break patterns, where you're most unconventional, and where life tends to surprise you.`,
  neptune: (h) => `Your Neptune in the house of ${h} means your dreams, your spirituality, and your idealism are channeled here. This is where you're most inspired — and most prone to illusion. The boundary between real and imagined is thinnest in this life area.`,
  pluto: (h) => `Your Pluto in the house of ${h} means your intensity, your power, and your capacity for transformation are channeled here. This is where you go deepest, where you're most obsessive, and where you'll die and be reborn (metaphorically) more than once.`,
};

// Main entry point: given a planet id + its sign + its house, return a paragraph
// explaining how the house redirects the sign meaning.
export function planetHouseNarrative(planetId: string, signId: SignId, houseNum: number): string {
  const houseData = HOUSE_DOMAINS[houseNum];
  if (!houseData) return "";

  const planetName = pointDisplayName(planetId);
  const signName = SIGN_META[signId].name;
  const element = SIGN_META[signId].element;
  const modality = SIGN_META[signId].modality;

  // The redirect function for this planet
  const redirectFn = PLANET_HOUSE_REDIRECT[planetId.toLowerCase()];
  const redirectText = redirectFn ? redirectFn(houseData.name) : "";

  // Element × house interaction: how does the element change in this house?
  const elementHouseEffect: Record<string, string> = {
    fire: `Fire energy in the house of ${houseData.name} means the spark, the passion, and the impulse to act are all channeled here. ${houseData.redirect}. This isn't generic fire — it's fire pointed at a specific target.`,
    earth: `Earth energy in the house of ${houseData.name} means the patience, the practicality, and the desire for real results are all channeled here. ${houseData.redirect}. This isn't generic earth — it's earth building in a specific place.`,
    air: `Air energy in the house of ${houseData.name} means the curiosity, the communication, and the need for connection are all channeled here. ${houseData.redirect}. This isn't generic air — it's air circulating in a specific room.`,
    water: `Water energy in the house of ${houseData.name} means the sensitivity, the depth, and the emotional intuition are all channeled here. ${houseData.redirect}. This isn't generic water — it's water flowing into a specific channel.`,
  };

  const elementText = elementHouseEffect[element] || "";

  // Modality × house: how does the modality shape the expression?
  const modalityEffect: Record<string, string> = {
    cardinal: `As a cardinal sign, the energy here is initiatory — you'll start things in this area, sometimes before you're ready. The house gives your natural drive to begin a specific direction.`,
    fixed: `As a fixed sign, the energy here is persistent — once you commit to something in this area, you're in it for the long haul. The house gives your natural endurance a specific arena.`,
    mutable: `As a mutable sign, the energy here is adaptable — you'll shift, adjust, and evolve in this area more than most. The house gives your natural flexibility a specific playground.`,
  };

  const modalityText = modalityEffect[modality] || "";

  // Special house intensifications
  let specialEffect = "";
  if (houseNum === 8) {
    specialEffect = ` The 8th house intensifies everything — whatever this planet normally does, here it does it deeper, darker, and more obsessively. This isn't surface-level expression; it's the version that goes through transformation.`;
  } else if (houseNum === 12) {
    specialEffect = ` The 12th house hides things — whatever this planet normally does, here it does it privately, unconsciously, or behind the scenes. You might not even recognize this energy in yourself until someone points it out, or until you spend time alone and notice what surfaces.`;
  } else if (houseNum === 10) {
    specialEffect = ` The 10th house makes things public — whatever this planet normally does, here it does it visibly. This energy will be part of your reputation, your career, and what people know you for.`;
  } else if (houseNum === 4) {
    specialEffect = ` The 4th house roots things — whatever this planet normally does, here it does it at home. This energy is foundational: it shapes your sense of safety, your relationship to family, and the kind of space you need to feel grounded.`;
  } else if (houseNum === 1) {
    specialEffect = ` The 1st house makes things personal — whatever this planet normally does, here it does it on your face, in your body, in your first impression. People see this energy before you say a word.`;
  }

  return `${redirectText} ${elementText} ${modalityText}${specialEffect}`.trim();
}

// ===========================================================================
// PATTERN DETECTION — "How it all connects"
// ---------------------------------------------------------------------------
// Detects real patterns in the chart and explains them. These are appended
// to combinedPlanetNarratives as additional PlanetPairNarrative entries.
// ===========================================================================

export function detectChartPatterns(profile: NatalProfile): { title: string; teaser: string; body: string }[] {
  const patterns: { title: string; teaser: string; body: string }[] = [];
  const sun = profile.sun;
  const moon = profile.moon;
  const asc = profile.ascendant;
  const sunEl = SIGN_META[sun.signId].element;
  const moonEl = SIGN_META[moon.signId].element;
  const ascEl = SIGN_META[asc.signId].element;
  const sunMod = SIGN_META[sun.signId].modality;
  const ascMod = SIGN_META[asc.signId].modality;

  // 1. MASK EFFECT — Ascendant different element/modality from Sun
  if (sunEl !== ascEl) {
    const maskEffect: Record<string, string> = {
      "fire-earth": "People see you as grounded and steady when you're actually wired to move fast and take risks. There's a real gap between your first impression and who you actually are.",
      "fire-water": "People see you as sensitive and private when you're actually wired to act and express. Your warmth comes through, but your fire doesn't — not until people know you well.",
      "fire-air": "People see you as intellectual and cool when you're actually passionate and direct. They think you're thinking; you're actually feeling.",
      "earth-fire": "People see you as bold and impulsive when you're actually patient and strategic. Your steady energy is hidden behind a flashier exterior.",
      "earth-air": "People see you as chatty and light when you're actually solid and deliberate. The real you is deeper than the first impression suggests.",
      "earth-water": "People see you as soft and emotional when you're actually practical and grounded. Your stability is the real story; your sensitivity is the mask.",
      "air-fire": "People see you as intense and driven when you're actually curious and detached. They think you're passionate; you're actually thinking.",
      "air-earth": "People see you as serious and structured when you're actually flexible and conceptual. Your mind is lighter than people expect.",
      "air-water": "People see you as deep and private when you're actually social and communicative. Your real energy is lighter than the first impression.",
      "water-fire": "People see you as bold and outgoing when you're actually sensitive and deep. Your intensity is emotional, not just energetic.",
      "water-earth": "People see you as practical and composed when you're actually feeling everything. Your real self is much softer than the exterior.",
      "water-air": "People see you as cool and intellectual when you're actually deeply feeling. Your sensitivity is hidden behind a mental exterior.",
    };
    const key = `${sunEl}-${ascEl}`;
    const maskText = maskEffect[key];
    if (maskText) {
      patterns.push({
        title: "The Mask Effect",
        teaser: "What people see first isn't what's underneath.",
        body: `Your Sun is in ${sun.name} (${sunEl}) but your Rising is in ${SIGN_META[asc.signId].name} (${ascEl}). ${maskText} This isn't a problem — it's a tool. The mask protects the real you until you decide who gets to see it. But know that people's first impression of you is NOT who you actually are, and that gap can create misunderstandings until they get to know you.`,
      });
    }
  }

  // 2. HOUSE CONTRADICTIONS — two planets in the same house pulling different directions
  const housePlanets: Record<number, { id: string; name: string; signId: SignId; element: string }[]> = {};
  for (const p of profile.planets) {
    if (p.house) {
      if (!housePlanets[p.house]) housePlanets[p.house] = [];
      housePlanets[p.house].push({ id: p.id, name: p.name, signId: p.signId, element: SIGN_META[p.signId].element });
    }
  }
  for (const [houseNum, planets] of Object.entries(housePlanets)) {
    if (planets.length < 2) continue;
    // Check if any two planets in this house have different elements
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        if (planets[i].element !== planets[j].element) {
          const houseData = HOUSE_DOMAINS[Number(houseNum)];
          if (!houseData) continue;
          patterns.push({
            title: `Contradiction in the ${ordinal(Number(houseNum))} House`,
            teaser: `Two different energies are pulling in the same life area.`,
            body: `Your ${planets[i].name} in ${SIGN_META[planets[i].signId].name} (${planets[i].element}) and your ${planets[j].name} in ${SIGN_META[planets[j].signId].name} (${planets[j].element}) are both in the house of ${houseData.name}. These are ${planets[i].element} and ${planets[j].element} energies — they process the world differently. In this life area, you'll feel both pulling: one part of you wants to approach ${houseData.name} one way, the other part wants a completely different approach. The tension is real, but so is the range — you can access two modes of being in this area, which most people can't.`,
          });
          break; // One contradiction per house is enough
        }
      }
    }
  }

  // 3. SATURN AS CHANNEL — Saturn's house explains why another placement channels into a specific area
  const saturn = profile.planets.find(p => p.id === "saturn");
  if (saturn && saturn.house) {
    const saturnHouseData = HOUSE_DOMAINS[saturn.house];
    if (saturnHouseData) {
      // Find another planet in a compatible house
      const sunHouse = profile.planets.find(p => p.id === "sun")?.house;
      if (sunHouse && sunHouse !== saturn.house) {
        const sunHouseData = HOUSE_DOMAINS[sunHouse];
        if (sunHouseData) {
          patterns.push({
            title: "Saturn Channels Your Energy",
            teaser: "Where you work hardest explains where your core energy ends up.",
            body: `Your Sun is in the house of ${sunHouseData.name} — that's where your core identity naturally expresses. But your Saturn is in the house of ${saturnHouseData.name} — that's where you'll face your heaviest lessons and build your deepest mastery. The connection: the work you do in the ${saturnHouseData.name} area is what earns you the right to shine in the ${sunHouseData.name} area. Saturn isn't blocking your Sun — it's building the foundation your Sun stands on. The more you do the Saturn work, the more your Sun energy flows.`,
          });
        }
      }
    }
  }

  // 4. SUN-MOON ELEMENT MISMATCH — internal tension
  if (sunEl !== moonEl) {
    const tensionMap: Record<string, string> = {
      "fire-earth": "Your identity wants action and risk; your emotional world wants stability and comfort. You'll oscillate between 'let's go' and 'let's stay.'",
      "fire-water": "Your identity wants to express and act; your emotional world wants to feel and process. You'll oscillate between doing and being.",
      "fire-air": "Your identity wants passion and directness; your emotional world wants understanding and distance. You'll oscillate between heart and head.",
      "earth-air": "Your identity wants tangible results; your emotional world wants ideas and connection. You'll oscillate between building and thinking.",
      "earth-water": "Your identity wants structure and practicality; your emotional world wants depth and feeling. You'll oscillate between holding and flowing.",
      "air-water": "Your identity wants to understand and communicate; your emotional world wants to feel and merge. You'll oscillate between thinking and feeling.",
    };
    const key = [sunEl, moonEl].sort().join("-");
    // Try both orderings
    const tension = tensionMap[`${sunEl}-${moonEl}`] || tensionMap[`${moonEl}-${sunEl}`] || tensionMap[key];
    if (tension) {
      patterns.push({
        title: "Internal Tension: Sun vs Moon",
        teaser: "What you want and what you need aren't the same thing.",
        body: `Your Sun is in ${sun.name} (${sunEl}) and your Moon is in ${SIGN_META[moon.signId].name} (${moonEl}). ${tension} This isn't a problem — it's depth. People with matching Sun/Moon elements are simpler, but they're also less complex. The internal tension you carry is what makes you interesting, adaptable, and real. The skill is learning to honor both, not just the louder one.`,
      });
    }
  }

  // 5. DOMINANT MODALITY — how you approach life
  const modalityCounts: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const p of [sun, moon, asc, ...profile.planets]) {
    modalityCounts[SIGN_META[p.signId].modality]++;
  }
  const dominantMod = Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominantMod && dominantMod[1] >= 4) {
    const modalityDesc: Record<string, string> = {
      cardinal: "You're wired to start things. New projects, new relationships, new directions — you're the one who says 'let's go' first. The challenge is follow-through: starting is your comfort zone, finishing is the growth edge.",
      fixed: "You're wired to hold things. Once you commit, you're in it — stubborn, loyal, and persistent. The challenge is letting go: when something isn't working, you'll hold on longer than most because giving up feels like failure.",
      mutable: "You're wired to adapt. You shift, adjust, and flow with what's happening. You're the most flexible person in most rooms. The challenge is consistency: because you can adapt to anything, you sometimes forget to check what YOU actually want.",
    };
    const desc = modalityDesc[dominantMod[0]];
    if (desc) {
      patterns.push({
        title: `${dominantMod[0].charAt(0).toUpperCase() + dominantMod[0].slice(1)}-Dominant Approach`,
        teaser: "How you approach everything in life.",
        body: `${dominantMod[1]} of your key placements are in ${dominantMod[0]} signs. ${desc}`,
      });
    }
  }

  return patterns;
}
