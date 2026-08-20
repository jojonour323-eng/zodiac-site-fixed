import type { PlanetId, SignId, NatalProfile } from "./types";
import { SIGN_META } from "./signs";

// ===========================================================================
// ASPECTS ENGINE — written explanations for every natal aspect
// ---------------------------------------------------------------------------
// Takes the aspect list already computed by local.ts (computeAspects) and
// returns a paragraph explaining what each aspect does to the person.
// Uses the aspect's polarity (harmonious/tense/neutral) and strength (0-1)
// to decide tone — supportive aspects get "this helps you", challenging ones
// get "this is where the work is".
//
// Every aspect in the person's chart gets a paragraph, not just the top 2-3.
// ===========================================================================

export interface AspectInterpretation {
  id: string;           // unique id for the aspect
  title: string;        // e.g. "Sun trine Moon"
  aspect: string;       // "Trine", "Square", etc.
  planets: string;      // "Sun + Moon"
  polarity: string;     // "harmonious" | "tense" | "neutral"
  strength: number;     // 0-1
  strengthLabel: string; // "very strong", "strong", "moderate", "weak"
  explanation: string;  // 2-4 sentence paragraph, plain English, no jargon
  vibeTag: string;      // one-word: "Ease", "Friction", "Intensity", "Flow"
}

// ---- Aspect type definitions (mirrors local.ts ASPECT_DEFS) ----

const ASPECT_ANGLES: { name: string; angle: number; orb: number }[] = [
  { name: "Conjunction", angle: 0, orb: 8 },
  { name: "Opposition", angle: 180, orb: 8 },
  { name: "Trine", angle: 120, orb: 7 },
  { name: "Square", angle: 90, orb: 7 },
  { name: "Sextile", angle: 60, orb: 6 },
  { name: "Quincunx", angle: 150, orb: 4 },
  { name: "Semisextile", angle: 30, orb: 3 },
  { name: "Semisquare", angle: 45, orb: 3 },
  { name: "Sesquisquare", angle: 135, orb: 3 },
];

function aspectPolarity(name: string): "harmonious" | "tense" | "neutral" {
  const lower = name.toLowerCase();
  if (["trine", "sextile", "semisextile"].includes(lower)) return "harmonious";
  if (["opposition", "square", "semisquare", "sesquisquare", "quincunx"].includes(lower)) return "tense";
  return "neutral";
}

function strengthLabel(s: number): string {
  if (s >= 0.9) return "very strong";
  if (s >= 0.7) return "strong";
  if (s >= 0.5) return "moderate";
  if (s >= 0.3) return "weak";
  return "very weak";
}

function vibeTagFor(polarity: string, aspectName: string): string {
  if (polarity === "harmonious") return aspectName === "Sextile" ? "Opportunity" : "Flow";
  if (polarity === "tense") return aspectName === "Square" ? "Friction" : aspectName === "Opposition" ? "Tension" : "Adjustment";
  return "Intensity";
}

// ---- The big per-pair + per-aspect text generator ----

interface PlanetPairAspect {
  a: string; b: string; aspect: string;
  polarity: "harmonious" | "tense" | "neutral";
  orb: number; strength: number;
}

function getAspectExplanation(pair: PlanetPairAspect): string {
  const { a, b, aspect, polarity } = pair;
  const aspectLower = aspect.toLowerCase();
  const [first, second] = [a, b].sort();
  const pairKey = `${first}-${second}`;

  if (aspectLower === "conjunction") {
    const conjunctionTexts: Record<string, string> = {
      "moon-sun": `Your core identity and your emotional world run on the same fuel. What you want and what you need aren't fighting — they're pointing the same direction. You don't have to translate between who you are and how you feel. The risk is you'll reinforce each other's blind spots, because they're the same blind spots.`,
      "mercury-sun": `Your mind and your identity are fused. You think the way you are, and you are the way you think. People take you at face value because what they hear matches what they see. The downside: you can't easily step back and question your own assumptions.`,
      "venus-sun": `Your love nature and your core identity are one and the same. The way you love IS who you are — it's not a separate thing you do, it's woven into everything. You attract naturally. The risk: you'll define yourself through relationships.`,
      "mars-sun": `Your drive and your identity are fused — you ARE your ambition, your energy, your temper. When you want something, it's not a decision, it's who you are. You move fast and people follow. The risk: you can't separate 'I want this' from 'this is who I am', which makes setbacks feel personal.`,
      "mars-venus": `Your love nature and your drive are perfectly aligned — what you're attracted to and how you pursue it are cut from the same cloth. This is one of the strongest attraction aspects in a chart. The chemistry is real, not forced. The risk: when desire takes over, reason leaves the building.`,
      "jupiter-sun": `Your identity and your growth potential are fused — you're wired to expand, to believe, to go big. Life tends to open doors for you. Optimism is your default, not a choice. The risk: you'll over-reach and over-promise.`,
      "saturn-sun": `Your identity and your sense of limits/responsibility are fused. You carry weight that others don't see. You take yourself seriously from a young age. The reward: you'll build something real. The cost: you'll skip the lightness that makes life worth living.`,
      "saturn-moon": `Your emotional world and your sense of responsibility are fused. You handle feelings the way you handle work — methodically, privately. This makes you incredibly reliable under pressure but emotionally walled off. You'll process emotions on a delay, sometimes years.`,
      "moon-venus": `Your emotional needs and your love nature are aligned — what you need to feel safe and what you're attracted to are the same thing. This is deeply romantic — you love from the inside out. The risk: you'll merge so completely that you lose track of where you end and they begin.`,
      "mercury-venus": `Your communication style and your love nature are fused — you express affection through words, and you're genuinely good at it. You can talk your way into anyone's heart. The charm is real, not manufactured. The risk: you'll substitute talking for feeling.`,
      "mercury-mars": `Your mind and your drive are fused — you think fast, you act fast, and your words carry force. You argue to win, and you usually do. The speed is a gift; the blurting is the cost.`,
    };
    const text = conjunctionTexts[pairKey];
    if (text) return text;
    return `These two parts of you run on the same fuel — they amplify each other. The energy of both is concentrated, not split. When they're both activated at the same time (which is often), the effect is doubled. This is a real strength, but it also means you can't use one to balance the other — they're pulling the same direction.`;
  }

  if (aspectLower === "opposition") {
    const oppositionTexts: Record<string, string> = {
      "moon-sun": `Your core identity and your emotional needs are pulling in opposite directions. What you want and what you need don't naturally align — you'll feel this tension every day. This isn't broken — it's the classic "I am one thing but I need another" dynamic. The work is learning that both are real, both are you.`,
      "mars-venus": `Classic tension between what you're attracted to and how you pursue it. You want one thing and you chase another — or you're drawn to people who want to be pursued differently than you naturally pursue. This is frustrating but it's also what makes your love life interesting, not predictable.`,
      "moon-saturn": `Your emotional needs and your sense of responsibility are at odds. The part of you that needs comfort and the part that says "buck up" are in constant negotiation. You'll oscillate between "I need to feel this" and "I need to control this."`,
      "jupiter-saturn": `Your growth impulse and your sense of limits are in tension. Part of you wants to expand, go big — and part says "not so fast, be realistic, earn it." This push-pull is the engine of your ambition: you dream big but you don't just dream — you actually build.`,
      "sun-saturn": `Your identity and your sense of responsibility are in tension. You want to be free and expressive, but you feel the weight of duty pressing back. The gift: it gives you depth and endurance. The cost: you'll always feel like you're not quite free.`,
    };
    const text = oppositionTexts[pairKey];
    if (text) return text;
    return `These two parts of you are pulling in opposite directions — a tug-of-war that shows up daily. Both are real, both are you, and neither can be ignored. The skill this aspect teaches is integration: learning to hold two truths at once without collapsing one into the other.`;
  }

  if (aspectLower === "square") {
    const squareTexts: Record<string, string> = {
      "moon-sun": `Your core identity and your emotional needs create friction — they want different things at the same time. It's not broken — it's a growth engine. The friction forces you to develop self-awareness that people with easier alignments never need.`,
      "mars-sun": `Your drive and your identity create friction — you want to go after things in a way that doesn't always match who you are. You'll push when you should wait, or act when you should reflect. The energy is real — the challenge is channeling it.`,
      "mars-venus": `Your love nature and your drive create friction — what you're attracted to and how you pursue it clash. The chemistry is intense; the follow-through is the hard part.`,
      "moon-saturn": `Your emotional needs and your sense of responsibility clash hard. You'll feel emotionally controlled even when no one's controlling you — the control is internal. The growth edge: learning that vulnerability isn't weakness.`,
      "jupiter-saturn": `Your growth impulse and your sense of limits clash — you want to expand but reality keeps pulling you back. This is the "dreams vs. budget" aspect. The friction is productive: it means you won't just dream, you'll build.`,
      "moon-venus": `Your emotional needs and your love nature clash — what makes you feel safe isn't always what you're attracted to. You might fall for people who don't make you feel comfortable. The work: finding someone who offers both, or learning to make peace with the gap.`,
    };
    const text = squareTexts[pairKey];
    if (text) return text;
    return `These two parts of you create friction — they want different things and neither will quietly step aside. This isn't a flaw — it's a growth engine. The tension forces you to develop skills that people with easier charts never need. The cost is that it feels harder. The payoff is depth.`;
  }

  if (aspectLower === "trine") {
    const trineTexts: Record<string, string> = {
      "mars-sun": `Your drive and your identity flow together naturally — you don't have to force action, it just happens. People with this aspect often seem effortlessly confident. The risk: because it's so easy, you might not develop the discipline that comes from having to push through resistance.`,
      "moon-sun": `Your core identity and your emotional world are in natural harmony — your inner self and outer self are on the same page. The risk: you might avoid situations that would force you to grow, because the easy path is so available.`,
      "moon-venus": `Your emotional needs and your love nature flow together — what makes you feel safe is also what you're attracted to. This is deeply romantic and deeply comfortable. The risk: you'll stay in comfortable dynamics longer than you should.`,
      "mercury-sun": `Your mind and your identity flow together — you think clearly about who you are. Communication is a strength, not a struggle. You can articulate your thoughts with ease others envy.`,
      "mars-venus": `Your love nature and your drive flow together — the way you want to be loved and the way you pursue are naturally aligned. This is one of the strongest attraction aspects: the chemistry is real, effortless, and mutual.`,
      "jupiter-sun": `Your identity and your growth flow together — you expand naturally, without forcing it. Life opens doors and you walk through. Optimism isn't a choice, it's your default setting.`,
      "saturn-sun": `Your identity and your sense of structure support each other — you take yourself seriously and it pays off. Discipline feels natural, not forced. You'll build something that lasts.`,
    };
    const text = trineTexts[pairKey];
    if (text) return text;
    return `These two parts of you flow together naturally — they support each other without friction. This is a gift: the energy of both is available to you without having to push through resistance. The risk is complacency: because it's easy, you might not develop the depth that comes from having to work for it.`;
  }

  if (aspectLower === "sextile") {
    return `These two parts of you have natural potential together — they're compatible and could support each other well. But unlike a trine (which flows automatically), a sextile requires you to actively use it. If you don't engage, it stays dormant. If you do, it becomes a real strength.`;
  }

  if (aspectLower === "quincunx") {
    return `These two parts of you don't fight and they don't flow — they're on different wavelengths entirely. They share neither element nor modality, so there's no natural bridge. You'll oscillate between living one way and the other. The adjustment is lifelong, but it also gives you range: you can access two completely different modes of being.`;
  }

  if (aspectLower === "semisquare" || aspectLower === "sesquisquare") {
    return `There's a low-level friction here between these two parts of you. It's not dramatic — it's a constant background hum of tension. You might not even notice it. But it shapes your habits: small adjustments you make automatically to keep these two energies from colliding. Over a lifetime, these small adjustments add up to a specific style of being.`;
  }

  if (aspectLower === "semisextile") {
    return `These two parts of you are subtly aligned — not in a big obvious way, but in a quiet, supportive way. There's a gentle compatibility that shows up in small moments. Nothing dramatic, but real.`;
  }

  return `These two parts of you interact with ${polarity} energy. ${polarity === "harmonious" ? "This is a supportive connection." : polarity === "tense" ? "This is a challenging connection that creates growth through friction." : "This is an intense connection that amplifies both energies."}`;
}

// ---- Main entry point ----

export function interpretNatalAspects(profile: NatalProfile): AspectInterpretation[] {
  const planets = profile.planets;
  const angles = profile.angles;
  const results: AspectInterpretation[] = [];

  const points: { id: string; name: string; absPos: number }[] = planets.map(p => ({
    id: p.id, name: p.name, absPos: p.absPos,
  }));
  if (angles) {
    points.push({ id: "asc", name: "Ascendant", absPos: angles.asc });
    points.push({ id: "mc", name: "Midheaven", absPos: angles.mc });
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i], b = points[j];
      let diff = Math.abs(a.absPos - b.absPos);
      if (diff > 180) diff = 360 - diff;

      for (const def of ASPECT_ANGLES) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          const strength = Math.max(0, Math.min(1, 1 - orb / def.orb));
          if (strength < 0.3) continue;
          const polarity = aspectPolarity(def.name);
          const pair: PlanetPairAspect = { a: a.id, b: b.id, aspect: def.name, polarity, orb, strength };
          results.push({
            id: `aspect_${a.id}_${def.name}_${b.id}`.toLowerCase(),
            title: `${a.name} ${def.name} ${b.name}`,
            aspect: def.name,
            planets: `${a.name} + ${b.name}`,
            polarity,
            strength,
            strengthLabel: strengthLabel(strength),
            explanation: getAspectExplanation(pair),
            vibeTag: vibeTagFor(polarity, def.name),
          });
          break;
        }
      }
    }
  }

  return results.sort((a, b) => b.strength - a.strength);
}

// ---- Pattern detection ----

export function getAspectPatterns(profile: NatalProfile): { title: string; detail: string }[] {
  const aspects = interpretNatalAspects(profile);
  const patterns: { title: string; detail: string }[] = [];

  const harmonious = aspects.filter(a => a.polarity === "harmonious");
  const tense = aspects.filter(a => a.polarity === "tense");
  const ratio = tense.length / Math.max(1, harmonious.length);

  if (ratio > 1.5) {
    patterns.push({
      title: "Friction-Heavy Chart",
      detail: `${tense.length} tense aspects, ${harmonious.length} harmonious. Your chart is wired for growth through conflict — things don't come easy, but the friction is what makes you real. You're not built for coasting.`,
    });
  } else if (ratio < 0.5) {
    patterns.push({
      title: "Flow-Heavy Chart",
      detail: `${harmonious.length} harmonious aspects, ${tense.length} tense. Your chart is wired for ease. The risk is complacency: because the flow is so available, you might not develop the grit that comes from having to push.`,
    });
  } else {
    patterns.push({
      title: "Balanced Chart",
      detail: `Roughly even split: ${harmonious.length} harmonious, ${tense.length} tense. Some things flow, some take work, and you have to figure out which is which in each moment.`,
    });
  }

  // Dominant element
  const elementCounts: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const p of profile.planets) elementCounts[SIGN_META[p.signId].element]++;
  const dominantEl = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominantEl && dominantEl[1] >= 5) {
    patterns.push({
      title: `${dominantEl[0].charAt(0).toUpperCase() + dominantEl[0].slice(1)}-Dominant`,
      detail: `${dominantEl[1]} of your planets are in ${dominantEl[0]} signs. This element colors everything — your reactions, your instincts, your default mode.`,
    });
  }

  // Chart ruler
  const risingRuler = SIGN_META[profile.ascendant.signId].ruler.toLowerCase();
  const rulerPlanet = profile.planets.find(p => p.id === risingRuler);
  if (rulerPlanet) {
    patterns.push({
      title: "Chart Ruler Active",
      detail: `Your chart ruler (${rulerPlanet.name} in ${SIGN_META[rulerPlanet.signId].name}) is the planet that governs your rising sign. It's the captain of your chart — its sign and house tell you where your life energy is most concentrated.`,
    });
  }

  return patterns;
}
