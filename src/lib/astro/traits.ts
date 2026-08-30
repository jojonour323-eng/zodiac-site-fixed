import type { PlanetSummary, SignId, TraitScore } from "./types";
import { SIGN_META } from "./signs";

// Each trait is driven by specific planets. Weights are tuned so that
// Sun + Moon + Ascendant dominate the persona, while Mercury / Venus / Mars /
// Saturn / Jupiter adjust the score toward or away from the trait.
const TRAIT_PLANET_WEIGHTS: Record<
  keyof typeof SIGN_META.aries.traits,
  { planet: PlanetSummary["id"] | "ascendant"; weight: number }[]
> = {
  social: [
    { planet: "sun", weight: 0.25 },
    { planet: "moon", weight: 0.2 },
    { planet: "venus", weight: 0.3 },
    { planet: "mercury", weight: 0.15 },
    { planet: "jupiter", weight: 0.1 },
  ],
  emotional: [
    { planet: "moon", weight: 0.45 },
    { planet: "sun", weight: 0.2 },
    { planet: "venus", weight: 0.1 },
    { planet: "saturn", weight: 0.1 },
    { planet: "neptune", weight: 0.1 },
    { planet: "pluto", weight: 0.05 },  // Pluto = emotional intensity, depth
  ],
  creativity: [
    { planet: "sun", weight: 0.25 },
    { planet: "venus", weight: 0.25 },
    { planet: "neptune", weight: 0.2 },
    { planet: "uranus", weight: 0.15 },  // Uranus = original creative spark
    { planet: "moon", weight: 0.1 },
    { planet: "mercury", weight: 0.05 },
  ],
  communication: [
    { planet: "mercury", weight: 0.5 },
    { planet: "sun", weight: 0.2 },
    { planet: "moon", weight: 0.15 },
    { planet: "jupiter", weight: 0.15 },
  ],
  confidence: [
    { planet: "sun", weight: 0.45 },
    { planet: "mars", weight: 0.3 },
    { planet: "jupiter", weight: 0.15 },
    { planet: "saturn", weight: 0.1 },
  ],
  discipline: [
    { planet: "saturn", weight: 0.45 },
    { planet: "sun", weight: 0.2 },
    { planet: "mars", weight: 0.15 },
    { planet: "moon", weight: 0.1 },
    { planet: "mercury", weight: 0.1 },
  ],
  energy: [
    { planet: "mars", weight: 0.45 },
    { planet: "sun", weight: 0.2 },
    { planet: "jupiter", weight: 0.15 },
    { planet: "uranus", weight: 0.1 },  // Uranus = nervous energy, electrical drive
    { planet: "moon", weight: 0.1 },
  ],
  // Romance is the love-and-attraction score. Venus is the main driver
  // (she rules love, beauty, values). Mars adds the spark / desire / chase.
  // Moon matters because real love lives in your emotional needs. Sun
  // matters because how you love is part of who you are. Ascendant matters
  // because it's the first thing a partner sees.
  romance: [
    { planet: "venus", weight: 0.35 },
    { planet: "moon", weight: 0.2 },
    { planet: "mars", weight: 0.2 },
    { planet: "sun", weight: 0.1 },
    { planet: "ascendant", weight: 0.05 },
    { planet: "pluto", weight: 0.05 },  // Pluto = sexual intensity, obsession
    { planet: "neptune", weight: 0.05 },  // Neptune = romantic idealism
  ],
};

const TRAIT_LABELS: Record<keyof typeof SIGN_META.aries.traits, string> = {
  social: "Social",
  emotional: "Emotional",
  creativity: "Creativity",
  communication: "Communication",
  confidence: "Confidence",
  discipline: "Discipline",
  energy: "Energy",
  romance: "Romance",
};

// Order on screen. Romance gets its own slot near the end so it reads as
// "and here's how you love."
const TRAIT_ORDER: (keyof typeof SIGN_META.aries.traits)[] = [
  "social", "emotional", "creativity", "communication",
  "confidence", "discipline", "energy", "romance",
];

export function computeTraits(
  planets: PlanetSummary[],
  ascendantSignId: SignId
): TraitScore[] {
  const lookup = new Map<PlanetSummary["id"] | "ascendant", SignId>();
  for (const p of planets) lookup.set(p.id, p.signId);
  lookup.set("ascendant", ascendantSignId);

  const getSign = (id: PlanetSummary["id"] | "ascendant"): SignId => {
    const s = lookup.get(id);
    if (s) return s;
    return lookup.get("sun") || "aries";
  };

  return TRAIT_ORDER.map((trait) => {
    const weights = TRAIT_PLANET_WEIGHTS[trait];
    let acc = 0;
    let totalW = 0;
    for (const { planet, weight } of weights) {
      const signId = getSign(planet);
      const value = SIGN_META[signId].traits[trait];
      // Retrograde inner planets turn the energy inward, so the trait
      // shows up a little less obviously on the outside.
      const planetInfo = planets.find((p) => p.id === planet);
      const retroDim =
        planetInfo?.retrograde && (planet === "mercury" || planet === "venus" || planet === "mars")
          ? 0.85
          : 1.0;
      acc += value * weight * retroDim;
      totalW += weight;
    }
    const raw = totalW > 0 ? acc / totalW : 50;
  // No safe-middle clamping — let scores hit true red (0-39) or true green (70-100)
  // when the chart points to real weakness or real strength.
  const clamped = Math.max(0, Math.min(100, Math.round(raw)));
    return { key: trait, label: TRAIT_LABELS[trait], value: clamped };
  });
}

// Casual 2-3 sentence quick view. Talks like a person, not a textbook.
// Never says "your Sun in X" or "with Y rising" — just describes the person.
export function buildQuickSummary(
  sun: PlanetSummary,
  moon: PlanetSummary,
  asc: { signId: SignId }
): string {
  return `${sunShort(sun.signId)} ${moonInner(moon.signId)} ${ascVibe(asc.signId)}`;
}

function sunShort(id: SignId): string {
  const map: Record<SignId, string> = {
    aries: "You're wired to start things — fast, direct, and a little reckless. You don't wait for permission.",
    taurus: "You're here for the real, lasting stuff. Slow to start, impossible to push off course once you're moving.",
    gemini: "You live in your head and your group chat. Boring is your enemy — you'd rather be tired than unstimulated.",
    cancer: "You feel everything and remember everything. Your home is your castle, and the people you love live inside your ribs.",
    leo: "You walk in and the room picks up. Big heart, big presence, and you know your worth without apologizing for it.",
    virgo: "You notice what's off and you fix it. Helping is your love language — but you're harder on yourself than anyone knows.",
    libra: "You'd rather find the middle than win the fight. Beauty, fairness, and good company matter to you more than people realize.",
    scorpio: "You go where it's dark and bring back the truth. You don't trust easily, but once you do, you're all in — and you expect the same back.",
    sagittarius: "You'd rather be on a plane than at a desk. Honesty is your default — sometimes too much so. Rules feel like suggestions to you.",
    capricorn: "You play the long game. You knew what you wanted before most people figured out what to wear, and you take yourself seriously.",
    aquarius: "You see how things could be, not how they are. You care about people in the abstract, but one-on-one you can feel a little far away.",
    pisces: "You feel what others can't say. Music, art, and quiet hit you harder than they hit most people, and you'd rather merge than perform.",
  };
  return map[id];
}

function moonInner(id: SignId): string {
  const map: Record<SignId, string> = {
    aries: "Your feelings come on fast and hot — you react before you think, and you cool down just as quick.",
    taurus: "You need calm and comfort to feel safe. You don't like being rushed, and you'll dig in when pushed.",
    gemini: "You process feelings through your head — you talk them out, think them through, joke them away.",
    cancer: "You feel things deeply and you remember every little thing — especially the ones that hurt.",
    leo: "You need to feel seen and appreciated. You get hurt when you're ignored, and you don't hide it well.",
    virgo: "You handle feelings by fixing things — even when no one asked you to. It's how you process.",
    libra: "You feel best when things are harmonious. Conflict throws you off, and you'll bend to avoid it.",
    scorpio: "Your feelings don't do shallow. It's either 'I'd die for you' or 'I never want to see you again.'",
    sagittarius: "You process feelings through meaning — you need to know why, or you can't let it go.",
    capricorn: "You keep feelings under control — more than is good for you. You haven't cried in front of anyone in years.",
    aquarius: "You feel things but you watch yourself feeling them, from a slight distance. It's weird, but it's how you cope.",
    pisces: "You absorb other people's moods and can't always tell what's yours. You need a nap after parties.",
  };
  return map[id];
}

function ascVibe(id: SignId): string {
  const map: Record<SignId, string> = {
    aries: "People pick up energy from you — you walk in like you've got somewhere to be.",
    taurus: "People relax around you without knowing why. You give off calm.",
    gemini: "You come across quick — you talk, you move, you make people laugh in the first 5 minutes.",
    cancer: "You feel like a safe person to open up to. People tell you things they haven't told anyone.",
    leo: "You walk in and the room notices. Presence is your default setting.",
    virgo: "You seem put-together and observant. People assume you have your shit together, and they're usually right.",
    libra: "You make people feel comfortable right away. Charm is your first impression.",
    scorpio: "People feel like you're really looking at them. It's intense, and they either love it or back up.",
    sagittarius: "You seem up for anything. People invite you to things because they know you'll say yes.",
    capricorn: "You seem serious — like you've got your life together. It can read as intimidating.",
    aquarius: "People can't quite place you — you give off something a little different, and they notice.",
    pisces: "You feel approachable, almost dreamy. People feel like they've met you before, even when they haven't.",
  };
  return map[id];
}
