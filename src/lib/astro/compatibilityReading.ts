// ===========================================================================
// COMPATIBILITY READING ENGINE
// ---------------------------------------------------------------------------
// Generates short, specific, placement-named explanations for each
// compatibility match. Replaces the bare percentage with a 3-5 line
// explanation that names which placements are driving the match.
// ===========================================================================

import type { NatalProfile, SignId, PlanetId } from "./types";
import { SIGN_META } from "./signs";
import { signPairScore } from "./matches";

export interface CompatibilityExplanation {
  loveScore: number;
  friendScore: number;
  loveLines: string[];   // 2-3 short lines explaining the Love score
  friendLines: string[]; // 2-3 short lines explaining the Friend score
  dailyLife: string;     // 1-2 lines on what it'd feel like day to day
  friction: string;      // 1 line on where it could get hard
}

// Plain-English behavior per sign — reused from readingEngine
function signBehavior(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "charging first and asking later",
    taurus: "moving slow and holding steady",
    gemini: "thinking fast and talking a lot",
    cancer: "feeling the room and protecting its people",
    leo: "wanting to be seen and appreciated",
    virgo: "noticing details and fixing things",
    libra: "finding the middle and keeping the peace",
    scorpio: "going deep and skipping the surface",
    sagittarius: "chasing freedom and meaning",
    capricorn: "playing the long game and building steadily",
    aquarius: "seeing things differently and valuing individuality",
    pisces: "feeling what others can't put into words",
  };
  return map[signId];
}

function signLoveBehavior(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "falling fast, loving the chase, losing interest when the spark fades",
    taurus: "loving through presence and touch, holding on tight",
    gemini: "falling in love through conversation, needing mental stimulation",
    cancer: "loving through care and protection, needing to feel safe",
    leo: "loving big and warm, needing to feel adored back",
    virgo: "loving through small acts of service, showing it by fixing things",
    libra: "loving through partnership and beauty, wanting a real teammate",
    scorpio: "loving intense and all-consuming, needing depth and trust",
    sagittarius: "loving through shared adventure, needing freedom inside it",
    capricorn: "loving through commitment over time, showing up consistently",
    aquarius: "loving unconventionally, wanting a best friend first",
    pisces: "loving romantically and deeply, wanting to merge souls",
  };
  return map[signId];
}

function signFriendBehavior(signId: SignId): string {
  const map: Record<SignId, string> = {
    aries: "the friend who says 'let's go' first, always up for something",
    taurus: "the steady, loyal friend who remembers what you like",
    gemini: "the group chat — knowing everyone, keeping everyone connected",
    cancer: "the heart of the group — feeling everyone's mood, taking care of people",
    leo: "the generous friend who plans the big nights out",
    virgo: "the friend who actually helps — remembering details, showing up",
    libra: "the peacemaker — keeping the group harmonious, mediating drama",
    scorpio: "the vault — people tell you secrets because you never repeat them",
    sagittarius: "the adventure friend — always suggesting trips, keeping it light",
    capricorn: "the reliable one — giving real advice, in it for the long haul",
    aquarius: "the weird one — bringing unusual perspectives, accepting everyone",
    pisces: "the empath — feeling what you feel, creative and understanding",
  };
  return map[signId];
}

// Element pair dynamic — written fresh, no jargon
function elementDynamic(userEl: string, partnerEl: string): string {
  if (userEl === partnerEl) {
    const sameMap: Record<string, string> = {
      fire: "you both run on action and instinct — you'll charge at the same things",
      earth: "you both want things you can touch and trust — you'll build steadily together",
      air: "you both live in your heads — you'll talk for hours",
      water: "you both feel everything — you'll understand each other without words",
    };
    return sameMap[userEl] || "you process life through the same basic flavor";
  }
  const pair = `${userEl}-${partnerEl}`;
  const map: Record<string, string> = {
    "fire-air": "you bring the spark, they bring the oxygen — you'll energize each other",
    "air-fire": "you bring ideas, they bring action — you'll inspire each other",
    "earth-water": "you bring structure, they bring feeling — you'll nurture each other",
    "water-earth": "you bring depth, they bring stability — you'll ground each other",
    "fire-water": "you act, they feel — passion is real but you'll trigger each other",
    "water-fire": "you feel, they act — chemistry is real but it's volatile",
    "earth-air": "you want results, they want ideas — you speak different languages",
    "air-earth": "you want concepts, they want tangibles — different speeds",
  };
  return map[pair] || "you bring different energies to the table";
}

function frictionPoint(userEl: string, partnerEl: string, userSign: SignId, partnerSign: SignId): string {
  if (userEl === partnerEl) {
    return `you share the same blind spots — where one of you is weak, the other is too, and neither will catch it`;
  }
  const pair = `${userEl}-${partnerEl}`;
  const map: Record<string, string> = {
    "fire-air": "you might burn through things too fast — neither of you naturally slows down to check in",
    "air-fire": "you might talk about everything but never actually land it — ideas without follow-through",
    "earth-water": "you might get stuck in the same emotional groove — neither of you naturally pushes for change",
    "water-earth": "feelings can harden into stubbornness — neither of you naturally shakes things up",
    "fire-water": "one of you will feel pushed while the other feels doused — the intensity cuts both ways",
    "water-fire": "sensitivity meets intensity — you'll trigger each other's wounds without meaning to",
    "earth-air": "you'll frustrate each other — one wants results, the other wants to keep exploring ideas",
    "air-earth": "you'll move at different speeds — one's already three steps ahead, the other's still deciding",
  };
  return map[pair] || "you'll need to consciously translate between your different styles";
}

// an/a helper — "a Aries" reads wrong; "an Aries" doesn't
function anOrA(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

// The main generator — called for each candidate sign
export function generateCompatibilityExplanation(
  profile: NatalProfile,
  partnerSign: SignId
): CompatibilityExplanation {
  const userSun = profile.sun.signId;
  const userMoon = profile.moon.signId;
  const userVenus = profile.planets.find((p) => p.id === "venus")?.signId;
  const userMars = profile.planets.find((p) => p.id === "mars")?.signId;
  const userMercury = profile.planets.find((p) => p.id === "mercury")?.signId;

  const sunScore = signPairScore(userSun, partnerSign);
  const moonScore = signPairScore(userMoon, partnerSign);
  const venusScore = userVenus ? signPairScore(userVenus, partnerSign) : null;
  const marsScore = userMars ? signPairScore(userMars, partnerSign) : null;
  const mercScore = userMercury ? signPairScore(userMercury, partnerSign) : null;

  // Combined scores (mirrors the logic in CompatibilityTab)
  let loveSum = sunScore.love * 0.3 + moonScore.love * 0.25;
  let loveW = 0.55;
  if (venusScore) { loveSum += venusScore.love * 0.2; loveW += 0.2; }
  if (marsScore) { loveSum += marsScore.love * 0.15; loveW += 0.15; }
  const loveScore = Math.round(loveSum / loveW);

  let friendSum = sunScore.friend * 0.25 + moonScore.friend * 0.25;
  let friendW = 0.5;
  if (mercScore) { friendSum += mercScore.friend * 0.2; friendW += 0.2; }
  if (marsScore) { friendSum += marsScore.friend * 0.1; friendW += 0.1; }
  const friendScore = Math.round(friendSum / friendW);

  // Find the strongest driver for Love
  const loveDrivers = [
    { planet: "Sun", sign: userSun, score: sunScore.love, label: "your core self" },
    { planet: "Moon", sign: userMoon, score: moonScore.love, label: "your emotional self" },
    ...(userVenus ? [{ planet: "Venus", sign: userVenus, score: venusScore!.love, label: "your love nature" }] : []),
    ...(userMars ? [{ planet: "Mars", sign: userMars, score: marsScore!.love, label: "your drive" }] : []),
  ].sort((a, b) => b.score - a.score);

  const topLoveDriver = loveDrivers[0];
  const weakestLoveDriver = loveDrivers[loveDrivers.length - 1];

  // Find the strongest driver for Friend
  const friendDrivers = [
    { planet: "Sun", sign: userSun, score: sunScore.friend, label: "your core self" },
    { planet: "Moon", sign: userMoon, score: moonScore.friend, label: "your emotional self" },
    ...(userMercury ? [{ planet: "Mercury", sign: userMercury, score: mercScore!.friend, label: "your communication style" }] : []),
  ].sort((a, b) => b.score - a.score);

  const topFriendDriver = friendDrivers[0];

  // Build Love explanation lines
  const loveLines: string[] = [];
  loveLines.push(
    `Your ${topLoveDriver.planet} in ${SIGN_META[topLoveDriver.sign].name} (${topLoveDriver.label}) ${topLoveDriver.score >= 70 ? "clicks naturally with" : topLoveDriver.score >= 50 ? "gets along with" : "clashes with"} ${SIGN_META[partnerSign].name} energy — that's the biggest driver of the love score.`
  );
  loveLines.push(
    `In love, you're ${signLoveBehavior(userVenus || userSun)}, while ${anOrA(SIGN_META[partnerSign].name)} ${SIGN_META[partnerSign].name} partner is ${signLoveBehavior(partnerSign)}. ${elementDynamic(SIGN_META[userVenus || userSun].element, SIGN_META[partnerSign].element).replace(/^y/, "Y")}.`
  );
  if (loveScore >= 70) {
    loveLines.push(`The chemistry is real — you'll feel drawn to each other quickly.`);
  } else if (loveScore >= 50) {
    loveLines.push(`There's attraction, but it'll take effort to sustain — you approach love differently enough that you can't just coast.`);
  } else {
    loveLines.push(`Love here is a growth area — you'll be attracted to what you can't easily have, and the friction is the point.`);
  }

  // Build Friend explanation lines
  const friendLines: string[] = [];
  friendLines.push(
    `Your ${topFriendDriver.planet} in ${SIGN_META[topFriendDriver.sign].name} (${topFriendDriver.label}) drives the friendship score — it ${topFriendDriver.score >= 70 ? "lines up well with" : topFriendDriver.score >= 50 ? "works okay with" : "doesn't naturally mesh with"} ${SIGN_META[partnerSign].name}.`
  );
  friendLines.push(
    `As friends, you're ${signFriendBehavior(userMercury || userMoon)}, and they're ${signFriendBehavior(partnerSign)}. ${loveScore > friendScore + 10 ? "You'll connect more romantically than platonically — the spark is bigger than the friendship." : friendScore > loveScore + 10 ? "You'll actually be better as friends than as lovers — the platonic dynamic is stronger than the romantic one." : "Love and friendship are roughly balanced here — neither one dominates."}`
  );

  // Daily life
  const dailyLife = `Day to day, you're ${signBehavior(userSun)} while they're ${signBehavior(partnerSign)} — ${elementDynamic(SIGN_META[userSun].element, SIGN_META[partnerSign].element)}.`;

  // Friction
  const friction = `Where it gets hard: ${frictionPoint(SIGN_META[userSun].element, SIGN_META[partnerSign].element, userSun, partnerSign)}.`;

  return {
    loveScore,
    friendScore,
    loveLines,
    friendLines,
    dailyLife,
    friction,
  };
}
