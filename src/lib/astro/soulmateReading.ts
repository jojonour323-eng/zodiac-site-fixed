// ===========================================================================
// SOULMATE READING ENGINE — fresh per-pair, no templates
// ---------------------------------------------------------------------------
// Every sentence is generated from the actual two sign placements.
// No reused template strings. Rule 0/0.5/0.6 applied throughout.
// ===========================================================================

import type { NatalProfile, SignId } from "./types";
import { SIGN_META } from "./signs";
import type { SoulmatePersona } from "./matches";
import { signBehaviorVerb, signNeedVerb, signLoveVerb, signDriveVerb, signPairDynamic, placementTag } from "./readingHelpers";
import type { ExplanationSection } from "./deepReading";

export interface SoulmateReading {
  headline: string;
  summary: string;
  sections: ExplanationSection[];
  placementTags: { icon: string; label: string }[];
}

export function generateSoulmateReading(profile: NatalProfile, persona: SoulmatePersona): SoulmateReading {
  const userSun = profile.sun.signId;
  const userMoon = profile.moon.signId;
  const userVenus = profile.planets.find((p) => p.id === "venus")?.signId;
  const userMars = profile.planets.find((p) => p.id === "mars")?.signId;

  const pSun = persona.placements.sun;
  const pMoon = persona.placements.moon;
  const pVenus = persona.placements.venus;
  const pMars = persona.placements.mars;

  const headline = `${persona.vibe} — ${persona.score}/100 match`;

  const summary = `This person's core self is shaped by ${SIGN_META[pSun].name} energy — they ${signBehaviorVerb(pSun)}. Here's why that specifically complements your chart, and what being with them would actually feel like.`;

  const sections: ExplanationSection[] = [];
  const tags: { icon: string; label: string }[] = [];

  // Section 1: Why their core matches yours
  const sunTags = [placementTag("sun", userSun), placementTag("sun", pSun)];
  tags.push(...sunTags);
  const sunBullets = generateSunMatchBullets(userSun, pSun);
  sections.push({
    heading: "Why their core matches yours",
    body: `Their Sun is in ${SIGN_META[pSun].name}. Your Sun is in ${SIGN_META[userSun].name}. Here's what those two energies do together:`,
    bullets: sunBullets,
  });

  // Section 2: Why their feelings match yours
  tags.push(placementTag("moon", userMoon), placementTag("moon", pMoon));
  const moonBullets = generateMoonMatchBullets(userMoon, pMoon);
  sections.push({
    heading: "Why their feelings match yours",
    body: `Their Moon is in ${SIGN_META[pMoon].name}. Your Moon is in ${SIGN_META[userMoon].name}. This is the part that decides whether living together feels like home or like work:`,
    bullets: moonBullets,
  });

  // Section 3: Why their love nature matches yours
  if (userVenus && pVenus) {
    tags.push(placementTag("venus", userVenus), placementTag("venus", pVenus));
    const venusBullets = generateVenusMatchBullets(userVenus, pVenus);
    sections.push({
      heading: "Why their love nature matches yours",
      body: `Their Venus is in ${SIGN_META[pVenus].name}. Your Venus is in ${SIGN_META[userVenus].name}. This is the chemistry layer — whether there's real attraction or just friendship:`,
      bullets: venusBullets,
    });
  }

  // Section 4: Why their drive matches yours
  if (userMars && pMars) {
    tags.push(placementTag("mars", userMars), placementTag("mars", pMars));
    const marsBullets = generateMarsMatchBullets(userMars, pMars);
    sections.push({
      heading: "Why their drive matches yours",
      body: `Their Mars is in ${SIGN_META[pMars].name}. Your Mars is in ${SIGN_META[userMars].name}. This is the spark layer — physical chemistry, how you fight, how you chase what you want together:`,
      bullets: marsBullets,
    });
  }

  // Section 5: What this would actually feel like
  const feelBullets = generateFeelBullets(userSun, pSun, userMoon, pMoon, userMars, pMars);
  sections.push({
    heading: "What this would actually feel like",
    body: `Picture a normal week with this person. Here's what the rhythm would actually be:`,
    bullets: feelBullets,
  });

  // Section 6: The growth edge
  const growthBullets = generateGrowthEdgeBullets(userSun, pSun, userMoon, pMoon);
  sections.push({
    heading: "The growth edge",
    body: `No match is perfect. With this persona, here's the area where you'll do real work:`,
    bullets: growthBullets,
  });

  // Section 7: Takeaway
  const takeawayBullets = generateTakeawayBullets(persona.rank);
  sections.push({
    heading: "Takeaway",
    body: persona.rank === 1 ? `This is your top match — here's what to do with it:` : `This is a strong match — ranked #${persona.rank}. Here's what to keep in mind:`,
    bullets: takeawayBullets,
  });

  return { headline, summary, sections, placementTags: tags };
}

function generateSunMatchBullets(userSun: SignId, pSun: SignId): string[] {
  const bullets: string[] = [];
  bullets.push(`You ${signBehaviorVerb(userSun)}; they ${signBehaviorVerb(pSun)}`);
  bullets.push(signPairDynamic(userSun, pSun));

  if (userSun === pSun) {
    bullets.push(`Because you share the same core energy, you'll recognize each other immediately — there's a shorthand that takes most people years to build`);
    bullets.push(`Example: you'll both want to charge at the same thing at the same time, and you won't have to explain why — you just both feel it`);
  } else {
    const userEl = SIGN_META[userSun].element;
    const pEl = SIGN_META[pSun].element;
    bullets.push(`You bring different strengths: where one of you is weak, the other is strong — your ${SIGN_META[userSun].name} and their ${SIGN_META[pSun].name} cover ground the other can't`);
    if (userEl !== pEl) {
      bullets.push(`Example: say you both hit a wall — you'll ${signBehaviorVerb(userSun).split(" — ")[0]}, while they'll ${signBehaviorVerb(pSun).split(" — ")[0]}, and between the two approaches you'll probably find a way through`);
    }
  }
  return bullets;
}

function generateMoonMatchBullets(userMoon: SignId, pMoon: SignId): string[] {
  const bullets: string[] = [];
  bullets.push(`Your emotional self needs ${signNeedVerb(userMoon)}; theirs needs ${signNeedVerb(pMoon)}`);
  bullets.push(signPairDynamic(userMoon, pMoon));

  if (userMoon === pMoon) {
    bullets.push(`Your rhythms sync naturally — you'll have the same idea of what "home" feels like, and you won't have to explain your moods to each other`);
    bullets.push(`Example: when one of you comes home stressed, the other will know exactly whether to talk, to give space, or to just sit quietly — no instructions needed`);
  } else {
    bullets.push(`You'll need to learn each other's emotional rhythms — what comforts you might not comfort them, and vice versa`);
    bullets.push(`Example: when you're hurt, you might ${signBehaviorVerb(userMoon).split(" — ")[0]}, while they'd ${signBehaviorVerb(pMoon).split(" — ")[0]} — neither is wrong, but you'll have to learn to read each other instead of assuming`);
  }
  return bullets;
}

function generateVenusMatchBullets(userVenus: SignId, pVenus: SignId): string[] {
  const bullets: string[] = [];
  bullets.push(`You ${signLoveVerb(userVenus)}; they ${signLoveVerb(pVenus)}`);
  bullets.push(signPairDynamic(userVenus, pVenus));

  if (userVenus === pVenus) {
    bullets.push(`You love the same way — affection will feel effortless because you're speaking the same love language without trying`);
    bullets.push(`Example: you'll both reach for the same gesture at the same time — whether that's touch, words, acts of service, or adventure — and it'll feel like you're reading each other's minds`);
  } else {
    bullets.push(`You show love differently — one of you might need words while the other needs touch, and you'll have to learn each other's language instead of assuming your way is universal`);
    bullets.push(`Example: your love language — ${signLoveVerb(userVenus).split(" — ")[0]}. Theirs — ${signLoveVerb(pVenus).split(" — ")[0]}. The love is real; the delivery needs translation.`);
  }
  return bullets;
}

function generateMarsMatchBullets(userMars: SignId, pMars: SignId): string[] {
  const bullets: string[] = [];
  bullets.push(`You ${signDriveVerb(userMars)}; they ${signDriveVerb(pMars)}`);
  bullets.push(signPairDynamic(userMars, pMars));

  if (userMars === pMars) {
    bullets.push(`You'll move at the same pace — for better and worse. When you both want the same thing, you'll be unstoppable; when you both want different things, you'll clash at the same speed`);
    bullets.push(`Example: you'll both decide to start something at the same time, charge at it together, and either finish it together or both lose interest at the same moment`);
  } else {
    bullets.push(`You move at different speeds and in different ways — this takes patience, but it also means you won't get stuck in stalemate because one of you will always push when the other stalls`);
    bullets.push(`Example: when there's a decision to make, you'll ${signDriveVerb(userMars).split(" — ")[0]} while they ${signDriveVerb(pMars).split(" — ")[0]} — if you can name that out loud, the friction dissolves`);
  }
  return bullets;
}

function generateFeelBullets(userSun: SignId, pSun: SignId, userMoon: SignId, pMoon: SignId, userMars: SignId | undefined, pMars: SignId): string[] {
  const bullets: string[] = [];

  // Mornings — emotional rhythm
  if (userMoon === pMoon) {
    bullets.push(`Mornings: your ${SIGN_META[userMoon].name} feelings and their ${SIGN_META[pMoon].name} feelings are the same energy — you'll wake up in the same mood more often than not, and the house will feel harmonious without effort`);
  } else {
    bullets.push(`Mornings: your ${SIGN_META[userMoon].name} feelings and their ${SIGN_META[pMoon].name} feelings speak different languages — you might need quiet time while they want to talk, or vice versa, and you'll learn to give each other the right kind of space`);
  }

  // Evenings — core self
  if (userSun === pSun) {
    bullets.push(`Evenings: your ${SIGN_META[userSun].name} core and their ${SIGN_META[pSun].name} core are the same — being yourselves together will feel effortless, like you don't have to translate anything`);
  } else {
    bullets.push(`Evenings: your ${SIGN_META[userSun].name} core and their ${SIGN_META[pSun].name} core complement each other — you'll bring different energies to the evening, and the house will feel more interesting because of it`);
  }

  // When you disagree — drive
  if (userMars && userMars === pMars) {
    bullets.push(`When you disagree: your drive energies match — fights will be quick, direct, and over fast, because you both argue the same way`);
  } else if (userMars) {
    bullets.push(`When you disagree: your different drive energies mean you'll approach conflict differently — you'll ${signDriveVerb(userMars).split(" — ")[0]} while they ${signDriveVerb(pMars).split(" — ")[0]}, and the patience to name that difference is what prevents stalemate`);
  }

  bullets.push(`The overall vibe: ${SIGN_META[userSun].name} you + ${SIGN_META[pSun].name} them = a connection that feels specifically like this, not like anyone else's relationship`);

  return bullets;
}

function generateGrowthEdgeBullets(userSun: SignId, pSun: SignId, userMoon: SignId, pMoon: SignId): string[] {
  const bullets: string[] = [];
  const sunSameEl = SIGN_META[userSun].element === SIGN_META[pSun].element;

  if (userSun === pSun) {
    bullets.push(`You share the same core energy, which means you share the same blind spots — where ${SIGN_META[userSun].name} is weak, you're both weak, and neither will notice without outside perspective`);
    bullets.push(`The work: actively seek friends or mentors who see the world differently — they'll catch what both of you miss`);
  } else if (sunSameEl) {
    bullets.push(`Your Suns are different signs but the same element — you understand each other easily, but you won't challenge each other to grow because you're already speaking the same language`);
    bullets.push(`The work: seek experiences and people outside your shared element — they'll stretch you in ways this relationship won't`);
  } else if (userMoon === pMoon) {
    bullets.push(`Your emotional selves are the same energy — your patterns are identical, so you'll trigger each other the same way every time without realizing it`);
    bullets.push(`The work: develop emotional tools neither of you naturally has — when you both want to retreat, one of you has to stay and talk`);
  } else {
    bullets.push(`Your charts complement each other, which means you'll sometimes feel like you're speaking different languages — the growth is learning to translate without giving up your own way`);
    bullets.push(`The work: name the difference out loud when it happens — "I'm approaching this from ${SIGN_META[userSun].name}, you're approaching it from ${SIGN_META[pSun].name}" — and the friction usually dissolves`);
  }

  bullets.push(`This isn't a dealbreaker — it's just the area where you'll do real work. Every strong relationship has one`);
  return bullets;
}

function generateTakeawayBullets(rank: number): string[] {
  const bullets: string[] = [];
  if (rank === 1) {
    bullets.push(`This is your top match — if you meet someone whose chart looks like this, pay attention. The foundation is real, even if the spark isn't instant`);
    bullets.push(`This is the kind of connection that builds over time, not the kind that explodes on day one — don't let the slow burn make you think it's not there`);
  } else {
    bullets.push(`This is a strong match — ranked #${rank} in your top 5. The foundation is solid, even if it's not #1`);
    bullets.push(`Real people are more than their charts, but if you meet someone with these placements, they're worth your time`);
  }
  bullets.push(`Remember: a persona is a template, not a real person. Look for someone whose actual chart lands close to this, not someone who matches on paper but feels wrong in person`);
  return bullets;
}
