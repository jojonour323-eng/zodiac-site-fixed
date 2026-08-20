import type { NatalProfile, SignId, PlanetId } from "./types";
import { SIGN_META } from "./signs";

// ===========================================================================
// RED FLAGS — full chart, 4 categories, brutally honest
// ---------------------------------------------------------------------------
// Each flag cites the placement(s) in the `sources` array (shown as a chip
// beside the text), but the detail text itself never says "Planet in Sign
// means..." — it just says the trait directly, like a person describing
// another person. No sugarcoating: if it's bad, we say it's bad.
// ===========================================================================

export interface Flag {
  title: string;
  detail: string;
  sources: string[];
}

export interface FlagResult {
  redFlags: {
    relationship: Flag[];
    communication: Flag[];
    emotional: Flag[];
    behavioral: Flag[];
  };
  growthAreas: {
    relationship: Flag[];
    communication: Flag[];
    emotional: Flag[];
    behavioral: Flag[];
  };
  quirks: {
    relationship: Flag[];
    communication: Flag[];
    emotional: Flag[];
    behavioral: Flag[];
  };
  greenFlags: Flag[];
}

function planetSign(profile: NatalProfile, id: string): SignId | undefined {
  return profile.planets.find((p) => p.id === id)?.signId;
}

function planetHouse(profile: NatalProfile, id: string): number | undefined {
  return profile.planets.find((p) => p.id === id)?.house;
}

function isRetro(profile: NatalProfile, id: string): boolean {
  return profile.planets.find((p) => p.id === id)?.retrograde ?? false;
}

const FIRE = ["aries", "leo", "sagittarius"];
const EARTH = ["taurus", "virgo", "capricorn"];
const AIR = ["gemini", "libra", "aquarius"];
const WATER = ["cancer", "scorpio", "pisces"];

const isFire = (s?: SignId) => s && FIRE.includes(s);
const isEarth = (s?: SignId) => s && EARTH.includes(s);
const isAir = (s?: SignId) => s && AIR.includes(s);
const isWater = (s?: SignId) => s && WATER.includes(s);

const signName = (s?: SignId) => (s ? SIGN_META[s].name : "");

export function getFullChartFlags(profile: NatalProfile): FlagResult {
  const sun = profile.sun.signId;
  const moon = profile.moon.signId;
  const rising = profile.ascendant.signId;
  const mercury = planetSign(profile, "mercury");
  const venus = planetSign(profile, "venus");
  const mars = planetSign(profile, "mars");
  const saturn = planetSign(profile, "saturn");
  const jupiter = planetSign(profile, "jupiter");
  const uranus = planetSign(profile, "uranus");
  const neptune = planetSign(profile, "neptune");
  const pluto = planetSign(profile, "pluto");

  // Houses — actually read them (previously dead code)
  const sunHouse = planetHouse(profile, "sun");
  const moonHouse = planetHouse(profile, "moon");
  const venusHouse = planetHouse(profile, "venus");
  const marsHouse = planetHouse(profile, "mars");
  const mercuryHouse = planetHouse(profile, "mercury");
  const saturnHouse = planetHouse(profile, "saturn");
  const jupiterHouse = planetHouse(profile, "jupiter");
  const plutoHouse = planetHouse(profile, "pluto");

  // Retrogrades — widen beyond just Merc/Ven/Mars
  const saturnRetro = isRetro(profile, "saturn");
  const jupiterRetro = isRetro(profile, "jupiter");

  const sunName = SIGN_META[sun].name;
  const moonName = SIGN_META[moon].name;
  const venusName = signName(venus);
  const marsName = signName(mars);
  const mercuryName = signName(mercury);
  const saturnName = signName(saturn);
  const jupiterName = signName(jupiter);
  const uranusName = signName(uranus);
  const neptuneName = signName(neptune);
  const plutoName = signName(pluto);

  const result: FlagResult = {
    redFlags: { relationship: [], communication: [], emotional: [], behavioral: [] },
    growthAreas: { relationship: [], communication: [], emotional: [], behavioral: [] },
    quirks: { relationship: [], communication: [], emotional: [], behavioral: [] },
    greenFlags: [],
  };

  // ============ RELATIONSHIP RED FLAGS ============

  if (venus === "gemini" || venus === "sagittarius") {
    result.redFlags.relationship.push({
      title: "Situationship Energy",
      detail: `They'll keep you in a "we're just seeing where this goes" zone for months and genuinely not understand why you're frustrated. They crave variety in love more than they crave commitment, and they hate labels more than they love you. Not malicious — just genuinely not built for monogamy out of the box.`,
      sources: [`Venus in ${venusName}`],
    });
  }

  if (isRetro(profile, "venus")) {
    result.redFlags.relationship.push({
      title: "Guarded Lover",
      detail: `Their love style runs private and slow-burn. They'll test you for months before they let you in, and they have a pattern of falling for people who are unavailable. The love is real when it arrives — it just arrives on a delay, and you'll wonder if they're actually into you for the first 3 months.`,
      sources: ["Venus retrograde"],
    });
  }

  if (mars === "aries" || mars === "scorpio") {
    result.redFlags.relationship.push({
      title: "Fight-or-Flip Energy",
      detail: `Conflict hits different for them. They'll either go from 0 to 100 in an argument and say something they can't take back, or they'll flip the table and walk out. There's no "let's talk about this calmly" setting — at least not without a lot of self-awareness work they probably haven't done yet.`,
      sources: [`Mars in ${marsName}`],
    });
  }

  if (sun === "libra" && venus === "libra") {
    result.redFlags.relationship.push({
      title: "People-Pleaser AF",
      detail: `They'd rather agree than be honest. They'll say "whatever you want" and quietly resent you for it. By the time they finally snap, you'll have no idea what went wrong — they've been keeping score for months without telling you, and the explosion will come out of nowhere.`,
      sources: ["Sun in Libra", "Venus in Libra"],
    });
  }

  if (moon === "capricorn") {
    result.redFlags.relationship.push({
      title: "Emotionally Walled Off",
      detail: `They process feelings through control, not expression. They'll handle your meltdown like a project manager and have zero idea why that feels cold. To them, "being strong" means not showing weakness; to you, it looks like they don't care. They do care — they just have no idea how to show it without feeling exposed.`,
      sources: ["Moon in Capricorn"],
    });
  }

  if (mars === "taurus") {
    result.redFlags.relationship.push({
      title: "Stubborn AF In Fights",
      detail: `Once they've decided they're right, no argument, evidence, or tears will move them. They'll also hold a grudge from 2019 and bring it up at dinner. The good news: they don't start fights. The bad news: they don't end them either, and they will out-stubborn you every single time.`,
      sources: ["Mars in Taurus"],
    });
  }

  if (venus === "scorpio") {
    result.redFlags.relationship.push({
      title: "All-Or-Nothing Lover",
      detail: `They don't do casual. You're either their entire world or you don't exist. They'll want to merge souls on date two, and if you don't match that intensity, they'll take it personally and spiral. Also: they will find out everything about you before the first date ends — and they're good at hiding that they know.`,
      sources: ["Venus in Scorpio"],
    });
  }

  if (sun === "sagittarius" || (mars === "sagittarius" && venus === "sagittarius")) {
    result.redFlags.relationship.push({
      title: "Flight Risk",
      detail: `The moment someone makes them feel trapped, they're already mentally on a plane. They'll fall in love fast and disappear faster. "Catch me if you can" isn't a joke — it's a relationship strategy. If they feel suffocated, they won't communicate it; they'll just leave.`,
      sources: [sun === "sagittarius" ? "Sun in Sagittarius" : "", mars === "sagittarius" ? "Mars in Sagittarius" : "", venus === "sagittarius" ? "Venus in Sagittarius" : ""].filter(Boolean),
    });
  }

  // ============ COMMUNICATION RED FLAGS ============

  if (mercury === "aries") {
    result.redFlags.communication.push({
      title: "Says The First Thing",
      detail: `They say whatever's in their head the second it arrives. It's refreshing and occasionally a disaster. They'll text you the unfiltered truth at 11pm, then wake up at 7am and wish they hadn't. Apologies will be frequent and sincere, and the cycle will repeat forever.`,
      sources: ["Mercury in Aries"],
    });
  }

  if (mercury === "scorpio") {
    result.redFlags.communication.push({
      title: "The Interrogator",
      detail: `They ask one question and suddenly you've told them your entire childhood. They don't do small talk — they go straight for the deep cuts, and they remember everything you say. They'll bring up something you mentioned in passing 6 months later like it's nothing, and you'll wonder how they even remembered that.`,
      sources: ["Mercury in Scorpio"],
    });
  }

  if (mercury === "gemini" && isRetro(profile, "mercury")) {
    result.redFlags.communication.push({
      title: "Misunderstood Communicator",
      detail: `Their texts are 12-paragraph essays that they then unsend. Their brain runs faster than their typing, and they'll say a thing, mean a different thing, and get frustrated when you took the first one. "You know what I meant!" — no, you didn't. Clarity is not their strong suit.`,
      sources: ["Mercury in Gemini", "Mercury retrograde"],
    });
  }

  if (mercury === "virgo") {
    result.redFlags.communication.push({
      title: "Picks Everything Apart",
      detail: `They'll mentally correct your grammar and also your life choices. They notice every detail — including the ones you didn't want them to. They think they're helping; you feel like you're being audited. Their feedback is always technically right, which makes it worse, because you can't even argue with it.`,
      sources: ["Mercury in Virgo"],
    });
  }

  if (isRetro(profile, "mercury") && mercury !== "gemini") {
    result.redFlags.communication.push({
      title: "Tangled Words",
      detail: `They often say the wrong thing first. Not lies — just imprecise. They'll text "I'm 5 min away" from their couch. They genuinely meant to be 5 minutes away; they just didn't translate that into action. Clarification is part of every conversation, and it gets old.`,
      sources: [`Mercury in ${mercuryName} (retrograde)`],
    });
  }

  if ((sun === "scorpio" || moon === "scorpio") && mercury === "scorpio") {
    result.redFlags.communication.push({
      title: "Reads Into Everything",
      detail: `They take everything personally. A 3-word text becomes a 40-minute analysis of what you "really meant." They assume subtext even when there isn't any, and they'll test you by saying less than they mean. Good luck getting a straight answer from them when they're upset.`,
      sources: ["Scorpio placement", "Mercury in Scorpio"],
    });
  }

  // ============ EMOTIONAL RED FLAGS ============

  if (moon === "aries") {
    result.redFlags.emotional.push({
      title: "Emotional Whiplash",
      detail: `Feelings go from 0 to 100 in 0.3 seconds. They'll scream, cry, or rage, and 20 minutes later they're completely fine and wondering why you're still upset. The intensity is real — but so is the cooldown. They genuinely don't understand why you can't reset just as fast, and they'll get impatient with you for being "stuck."`,
      sources: ["Moon in Aries"],
    });
  }

  if (moon === "aquarius") {
    result.redFlags.emotional.push({
      title: "Emotionally Detached",
      detail: `They process feelings like a nature documentary — fascinating, but from a safe distance. They'll watch themselves having emotions instead of actually having them. People call them cold; they call it "objective." They need space, and they need a lot of it, and they'll take it without warning.`,
      sources: ["Moon in Aquarius"],
    });
  }

  if (moon === "pisces") {
    result.redFlags.emotional.push({
      title: "Mood Sponge",
      detail: `They absorb everyone else's feelings and forget which ones are theirs. They'll need a 3-hour nap after a 30-minute conversation because someone was sad. They can't watch the news without spiraling. Their empathy is a superpower and a vulnerability, and they have no boundaries around it.`,
      sources: ["Moon in Pisces"],
    });
  }

  if (moon === "gemini") {
    result.redFlags.emotional.push({
      title: "Feels Through Thoughts",
      detail: `They process feelings through their head, not their body. They'll have the same conversation 14 times in their mind and change their mind 9 of those times. They'll text you a 6-paragraph feelings essay at 2am and then delete it. Actually feeling the feeling? That's the hard part — they'd rather think about it.`,
      sources: ["Moon in Gemini"],
    });
  }

  if (sun === "cancer" && isWater(moon)) {
    result.redFlags.emotional.push({
      title: "Takes Everything Personally",
      detail: `They'll bring up something you said in 2017 as evidence in a current argument. Emotional memory is long, and they remember every tone, every pause, every "k." They don't hold grudges — they curate them, and they will deploy them at the worst possible moment.`,
      sources: ["Sun in Cancer", `Moon in ${moonName}`],
    });
  }

  if (saturn === sun || saturn === moon) {
    result.redFlags.emotional.push({
      title: "Emotionally Controlled",
      detail: `They treat emotions like a performance review. They'll suppress what they're feeling because "showing weakness isn't productive." They're not cold — they're bracing. It takes years for them to actually let you in, and most people give up before they get there.`,
      sources: [`Saturn in ${saturn === sun ? sunName : moonName}`],
    });
  }

  // ============ GROWTH AREA FLAGS (from Jupiter + outer planets) ============

  // Jupiter expansion issues — over-promiser, over-extender
  if (jupiter && ["sagittarius", "pisces", "cancer", "leo"].includes(jupiter)) {
    result.redFlags.behavioral.push({
      title: "Over-Promiser",
      detail: `They'll say yes to everything — every project, every plan, every favor — and genuinely mean it at the time. Then reality hits and they can't deliver on half of it. It's not malice — they just see the best-case scenario and commit to it before checking if the math works.`,
      sources: [`Jupiter in ${jupiterName}`],
    });
  }

  // Jupiter retrograde — growth runs inward, not outward
  if (jupiterRetro) {
    result.redFlags.behavioral.push({
      title: "Growth Runs Inward",
      detail: `Their growth happens privately, not publicly. They'll be working on themselves for months and you won't see any of it until it shows up as a sudden shift. They don't broadcast their evolution — they just show up different one day.`,
      sources: ["Jupiter retrograde"],
    });
  }

  // Uranus strong — disruption for disruption's sake
  if (uranus && ["aquarius", "aries", "gemini"].includes(uranus)) {
    result.redFlags.behavioral.push({
      title: "Disruption For Disruption's Sake",
      detail: `They'll change things just to change them — rearrange the furniture, switch jobs, start a new hobby, end a friendship — and call it "growth" even when it's just restlessness. They get bored with stability and sabotage it on purpose.`,
      sources: [`Uranus in ${uranusName}`],
    });
  }

  // Neptune strong — delusional idealist / boundary blurrer
  if (neptune && ["pisces", "cancer", "libra"].includes(neptune)) {
    result.redFlags.emotional.push({
      title: "Reality Is Optional",
      detail: `They'll see what they want to see, not what's there. They fall in love with potential, not the person. They'll stay in bad situations way too long because they're convinced the "real" version of the person is just around the corner. Reality checks bounce off them.`,
      sources: [`Neptune in ${neptuneName}`],
    });
  }

  // Pluto strong — control / power issues
  if (pluto && ["scorpio", "capricorn", "aries"].includes(pluto)) {
    result.redFlags.relationship.push({
      title: "Control Issues",
      detail: `They need to feel like they have the upper hand — in relationships, in arguments, in the dynamic. They'll frame it as "protecting themselves" but it's really about not being the one who gets hurt. Vulnerability feels like losing. They'd rather be in control than be close.`,
      sources: [`Pluto in ${plutoName}`],
    });
  }

  // Pluto in 8th house — deep attachment issues
  if (plutoHouse === 8) {
    result.redFlags.emotional.push({
      title: "All-Or-Nothing Attachment",
      detail: `They attach with their whole soul — when they let someone in, it's total. The flip side: they also detach with their whole soul, and once they're done, there's no going back. The middle ground (casual, light, gradual) is genuinely hard for them.`,
      sources: ["Pluto in 8th house"],
    });
  }

  // Saturn in 7th — relationship delay / fear of commitment
  if (saturnHouse === 7) {
    result.redFlags.relationship.push({
      title: "Commitment Delay",
      detail: `They take forever to commit — not because they don't want to, but because they need to be 100% sure, and 100% sure doesn't exist. They'll find reasons to delay, pick apart the relationship, and convince themselves they need more time. They're not playing games — they're genuinely scared of getting it wrong.`,
      sources: ["Saturn in 7th house"],
    });
  }

  // Saturn in 4th — family/home issues
  if (saturnHouse === 4) {
    result.redFlags.emotional.push({
      title: "Home Is Complicated",
      detail: `Their relationship with home, family, and roots is heavy. They may have grown up fast, or taken on responsibility too young, or felt like they had to earn their place in the family. They carry that weight into every home they build as an adult — it's hard for them to just relax at home.`,
      sources: ["Saturn in 4th house"],
    });
  }

  // Jupiter in 9th — wanderer / can't settle
  if (jupiterHouse === 9) {
    result.redFlags.behavioral.push({
      title: "Can't Settle Down",
      detail: `They're always looking for the next horizon — the next country, the next degree, the next big idea. Settling feels like dying to them. They'll commit to a plan and be mentally on the next one before the first one starts.`,
      sources: ["Jupiter in 9th house"],
    });
  }

  // Sun in 10th — workaholic / identity tied to career
  if (sunHouse === 10) {
    result.redFlags.behavioral.push({
      title: "Workaholic Identity",
      detail: `Their identity is tied to their career. Ask "who are you?" and they'll tell you what they do. They'll skip family events for work, judge others for not grinding, and treat burnout like a badge of honor. Rest feels like laziness to them.`,
      sources: ["Sun in 10th house"],
    });
  }

  // Moon in 12th — emotional isolation
  if (moonHouse === 12) {
    result.redFlags.emotional.push({
      title: "Emotionally Isolated",
      detail: `They process feelings alone, always. Even when they're surrounded by people, they go inside themselves to deal with emotions — and they often don't know what they're feeling until long after the moment has passed. They need serious alone time to recharge, and they won't ask for it.`,
      sources: ["Moon in 12th house"],
    });
  }

  // Venus in 12th — secret love life / hidden relationships
  if (venusHouse === 12) {
    result.redFlags.relationship.push({
      title: "Secret Love Life",
      detail: `Their love life is private to the point of being secret. They'll date someone for months and not tell their friends. They fall for unavailable people — married, distant, emotionally closed off — because the distance feels safe. Public relationships feel exposing.`,
      sources: ["Venus in 12th house"],
    });
  }

  // ============ GROWTH AREAS (things to work on — not red flags, but not green either) ============

  // Mercury in Libra — can't pick a side
  if (mercury === "libra") {
    result.growthAreas.communication.push({
      title: "Can't Pick A Side",
      detail: `They'll weigh every option so long that decisions paralyze them. They see all perspectives, which is a gift — but it also means they can't commit to one. They'll need someone who makes decisions for them, or they'll spend 45 minutes choosing where to eat.`,
      sources: ["Mercury in Libra"],
    });
  }

  // Sun in Pisces — boundary issues
  if (sun === "pisces") {
    result.growthAreas.emotional.push({
      title: "Boundary Issues",
      detail: `They absorb everyone's stuff and forget where they end and others begin. Setting a boundary feels mean to them, so they don't. The growth edge: learning that "no" is a complete sentence and that protecting their energy isn't selfish.`,
      sources: ["Sun in Pisces"],
    });
  }

  // Mars in Libra — passive-aggressive conflict
  if (mars === "libra") {
    result.growthAreas.relationship.push({
      title: "Passive-Aggressive Conflict",
      detail: `They won't fight directly — they'll hint, sigh, withdraw, and hope you figure it out. Their conflict style is "if you loved me you'd know." The growth edge: saying the thing out loud instead of waiting for mind-reading.`,
      sources: ["Mars in Libra"],
    });
  }

  // Moon in Virgo — anxiety spiral
  if (moon === "virgo") {
    result.growthAreas.emotional.push({
      title: "Anxiety Spiral",
      detail: `Their default setting is "what if it goes wrong" and they'll rehearse every possible failure scenario. The growth edge: learning that most of what they worry about never happens, and that the worry itself is more exhausting than the actual problem.`,
      sources: ["Moon in Virgo"],
    });
  }

  // ============ BEHAVIORAL RED FLAGS ============

  if (sun === "gemini" || sun === "sagittarius") {
    result.redFlags.behavioral.push({
      title: "Chronic Flake",
      detail: `They'll say yes to plans they have no intention of attending. They genuinely meant it at the time — they just forgot, double-booked, or got a better offer. They'll text "so sorry, can we reschedule??" 2 hours after they were supposed to be there. They feel bad about it. Briefly. Then they do it again next week.`,
      sources: [`Sun in ${sunName}`],
    });
  }

  if (sun === "taurus") {
    result.redFlags.behavioral.push({
      title: "Refuses To Try New Things",
      detail: `They'll refuse to try the new restaurant because the old one is "fine." They take 3 business days to reply to a text and act like it's normal. They have strong opinions about how the dishwasher should be loaded, and they are correct. Good luck moving them off any position they've taken.`,
      sources: ["Sun in Taurus"],
    });
  }

  if (sun === "leo") {
    result.redFlags.behavioral.push({
      title: "Makes Everything About Themselves",
      detail: `They'll make your breakup about how it affects them. They genuinely don't realize they're doing it — they just assume the spotlight is shared. They'll also post the story before checking if you're okay with it. It's not narcissism, it's just how they're wired — but it's exhausting to be around.`,
      sources: ["Sun in Leo"],
    });
  }

  if (sun === "virgo") {
    result.redFlags.behavioral.push({
      title: "Silently Judges Your Life",
      detail: `They're mentally noting every life choice you make and "helpfully" pointing out the ones that could be improved. They'll send you a 4-paragraph text about why your morning routine is suboptimal. They think they're being supportive; you feel like you're being audited. They mean well. It still sucks.`,
      sources: ["Sun in Virgo"],
    });
  }

  if (sun === "capricorn") {
    result.redFlags.behavioral.push({
      title: "Responds To Feelings With A Status Update",
      detail: `When you ask "how are you feeling?" they'll tell you about their career. They have never spontaneously done anything in their life. They'll judge you for taking a day off and call it "concern." Vulnerability is not in their vocabulary — productivity is.`,
      sources: ["Sun in Capricorn"],
    });
  }

  if (sun === "aquarius") {
    result.redFlags.behavioral.push({
      title: "Disappears Into New Interest",
      detail: `They'll vanish into a new hyperfixation for 2 weeks and forget you exist. They have strong opinions about things they learned 10 minutes ago. They're emotionally available in theory, less so in practice. When they finally come back up for air, they'll act like nothing happened.`,
      sources: ["Sun in Aquarius"],
    });
  }

  if (sun === "pisces") {
    result.redFlags.behavioral.push({
      title: "Yes-To-Everything Flake",
      detail: `They'll say yes to plans they have no intention of attending, then disappear into their room for 3 days and call it "recharging." They absorb your bad mood and then blame you for ruining theirs. They genuinely meant to show up — they just couldn't, and they feel terrible about it, and they'll do it again.`,
      sources: ["Sun in Pisces"],
    });
  }

  if (isRetro(profile, "mars")) {
    result.redFlags.behavioral.push({
      title: "Drive Runs Quiet",
      detail: `Their ambition is real but invisible. They'll be working on something huge for 6 months and not mention it once. People underestimate them for a year, then wonder how they lapped everyone. They don't need the spotlight — they need to be left alone, and they'll get there eventually.`,
      sources: ["Mars retrograde"],
    });
  }

  const elementCounts: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  // Count ALL 10 planets + Rising for dominant element — not just 6.
  for (const s of [sun, moon, rising, mercury, venus, mars, saturn, jupiter, uranus, neptune, pluto].filter(Boolean) as SignId[]) {
    elementCounts[SIGN_META[s].element]++;
  }
  const dominantEl = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (dominantEl === "earth" && elementCounts.earth >= 3) {
    result.redFlags.behavioral.push({
      title: "Comfort Zone CEO",
      detail: `They treat their routine like a religion. They'll resist any plan that disrupts their schedule, and "spontaneous" is not in their vocabulary. The upside: they're reliable. The downside: they're predictable, and they will judge you for being less organized than them.`,
      sources: [`${elementCounts.earth} earth placements`],
    });
  }
  if (dominantEl === "fire" && elementCounts.fire >= 3) {
    result.redFlags.behavioral.push({
      title: "Impulse Buyer, Impulse Liver",
      detail: `They make every decision in 0.5 seconds and reverse half of them by morning. They'll book a flight to another continent on a Tuesday. Their credit card statement is a personality trait, and their impulse control is genuinely concerning.`,
      sources: [`${elementCounts.fire} fire placements`],
    });
  }
  if (dominantEl === "water" && elementCounts.water >= 3) {
    result.redFlags.behavioral.push({
      title: "Can't Watch The News Without Spiraling",
      detail: `They can't watch the news without spiraling, and a sad look from a stranger can ruin their afternoon. They need decompression time after parties. Their sensitivity is real and not optional — they can't "just not let it get to them," and telling them to toughen up will backfire.`,
      sources: [`${elementCounts.water} water placements`],
    });
  }
  if (dominantEl === "air" && elementCounts.air >= 3) {
    result.redFlags.behavioral.push({
      title: "Brain Never Closes",
      detail: `Their brain runs 6 tabs at all times. They'll fall down a Wikipedia rabbit hole at 3am and wonder where the night went. They're great in conversation but bad at feeling their feelings — they think them instead, which means they take twice as long to actually process anything emotional.`,
      sources: [`${elementCounts.air} air placements`],
    });
  }

  const totalFlags = result.redFlags.relationship.length + result.redFlags.communication.length + result.redFlags.emotional.length + result.redFlags.behavioral.length;
  if (totalFlags === 0) {
    result.redFlags.behavioral.push({
      title: "Suspiciously Well-Adjusted",
      detail: `Your chart doesn't trigger any of our usual red flags. Either you're genuinely balanced, or you're so chaotic that the algorithm gave up. We're watching you. (Lovingly.)`,
      sources: ["no major triggers found"],
    });
  }

  result.greenFlags = result.greenFlags.slice(0, 4);
  return result;
}

// ---- Green flags (positives) ----

export interface GreenFlag {
  title: string;
  detail: string;
  sources: string[];
}

export function getFullChartGreenFlags(profile: NatalProfile): GreenFlag[] {
  const sun = profile.sun.signId;
  const moon = profile.moon.signId;
  const venus = planetSign(profile, "venus");
  const mars = planetSign(profile, "mars");
  const saturn = planetSign(profile, "saturn");

  const flags: GreenFlag[] = [];
  // Note: greenFlags now lives at result.greenFlags (flat array, not categorized)

  if (moon === "taurus" || moon === "cancer") {
    flags.push({
      title: "Emotionally Safe",
      detail: `They actually know what they're feeling and can tell you about it. They make people feel comfortable without trying, and their home is genuinely a sanctuary. When the world is on fire, you go to them — they'll have snacks and a plan.`,
      sources: [`Moon in ${SIGN_META[moon].name}`],
    });
  }

  if (venus && ["taurus", "cancer", "libra"].includes(venus)) {
    flags.push({
      title: "Loyal Lover",
      detail: `When they're in, they're in. They'll remember your favorite snack, your mom's birthday, and the song that was playing the first time you held hands. They show up consistently, not just when it's convenient — and that consistency is rarer than it sounds.`,
      sources: [`Venus in ${SIGN_META[venus].name}`],
    });
  }

  if (SIGN_META[sun].element === SIGN_META[moon].element) {
    flags.push({
      title: "Internally Consistent",
      detail: `Their inner self and outer self actually match. What you see is what you get. No constant inner tension between who they are and who they want to be — they're aligned, and it makes them stable in a way that's hard to fake.`,
      sources: ["Sun + Moon same element"],
    });
  }

  if (saturn === "capricorn" || saturn === "aquarius") {
    flags.push({
      title: "Reliable AF",
      detail: `When they say they'll do something, they do it. They show up on time, they follow through, and they don't flake. In a world full of "sorry I forgot" texts, they're the one who actually remembered — and that's worth more than people give it credit for.`,
      sources: [`Saturn in ${SIGN_META[saturn].name}`],
    });
  }

  if (mars === "capricorn" || mars === "virgo") {
    flags.push({
      title: "Disciplined Drive",
      detail: `Their ambition is real, focused, and patient. They don't burn out — they outlast. They'll quietly work on something for 5 years and then suddenly everyone knows their name. The patience is genuinely intimidating.`,
      sources: [`Mars in ${SIGN_META[mars].name}`],
    });
  }

  return flags.slice(0, 3);
}

// ---- Legacy compatibility ----
export function getFlags(sunSign: SignId, moonSign?: SignId, gender?: string): { redFlags: string[]; greenFlags: string[] } {
  const minimalProfile = {
    sun: { signId: sunSign },
    moon: { signId: moonSign || sunSign },
    ascendant: { signId: sunSign },
    planets: [],
  } as unknown as NatalProfile;

  const full = getFullChartFlags(minimalProfile);
  const green = getFullChartGreenFlags(minimalProfile);

  return {
    redFlags: full.relationship.slice(0, 3).map(f => `${f.title}: ${f.detail}`),
    greenFlags: green.slice(0, 2).map(f => `${f.title}: ${f.detail}`),
  };
}

// ===========================================================================
// ASPECT-AWARE FLAG MODIFIERS
// ---------------------------------------------------------------------------
// These functions read the natal aspects (computed by aspects.ts) and
// add/modify flags based on aspect patterns. This means two users with
// identical planets-in-signs but different aspects will get different
// red flags — because the aspects change HOW the sign energy expresses.
// ===========================================================================

import { interpretNatalAspects } from "./aspects";

// Modify the flag result based on natal aspects.
// This is called AFTER the sign-based flags are generated, and it adds
// aspect-specific flags + adjusts existing flag severity.
export function applyAspectFlags(result: FlagResult, profile: NatalProfile): FlagResult {
  const aspects = interpretNatalAspects(profile);

  // Find specific aspect patterns that add flags
  for (const aspect of aspects) {
    const pair = aspect.planets.toLowerCase();
    const aspectType = aspect.aspect.toLowerCase();

    // Sun-Saturn square/opposition → "Self-Critical" emotional flag
    if (pair.includes("sun") && pair.includes("saturn") && (aspectType === "square" || aspectType === "opposition")) {
      result.redFlags.emotional.push({
        title: "Self-Critical Loop",
        detail: `There's a real tension between your core identity and your sense of responsibility. You'll hold yourself to standards that aren't sustainable and then beat yourself up for not meeting them. The inner critic is loud and specific. The growth: learning that "good enough" is actually good enough.`,
        sources: [`Sun ${aspect.aspect} Saturn`],
      });
    }

    // Moon-Mars square/opposition → "Emotional Volatility" emotional flag
    if (pair.includes("moon") && pair.includes("mars") && (aspectType === "square" || aspectType === "opposition")) {
      result.redFlags.emotional.push({
        title: "Emotional Volatility",
        detail: `Your emotional world and your drive are in direct conflict — what you feel and what you want to do about it pull in different directions. You'll react before you process, and then have to deal with the aftermath. The anger is fast; the cooling down is slow. People will learn to give you space, not advice.`,
        sources: [`Moon ${aspect.aspect} Mars`],
      });
    }

    // Venus-Saturn square/opposition → "Relationship Anxiety" relationship flag
    if (pair.includes("venus") && pair.includes("saturn") && (aspectType === "square" || aspectType === "opposition")) {
      result.redFlags.relationship.push({
        title: "Relationship Anxiety",
        detail: `There's tension between your love nature and your sense of limits. You'll second-guess whether someone really likes you, test them without realizing it, and then feel vindicated when they "fail" the test. The anxiety is real — but it's also self-fulfilling. The growth: trusting that consistency exists, even if you can't see it yet.`,
        sources: [`Venus ${aspect.aspect} Saturn`],
      });
    }

    // Mercury-Saturn square → "Overthinks Everything" communication flag
    if (pair.includes("mercury") && pair.includes("saturn") && aspectType === "square") {
      result.redFlags.communication.push({
        title: "Overthinks Everything",
        detail: `Your mind and your sense of responsibility are fighting. You'll edit your thoughts before you express them, second-guess what you said after you say it, and rehearse conversations before they happen. The precision is real — but so is the exhaustion. You'd benefit from a "good enough" filter, not a "perfect" one.`,
        sources: [`Mercury ${aspect.aspect} Saturn`],
      });
    }

    // Sun-Neptune square/opposition → "Identity Blur" emotional flag
    if (pair.includes("sun") && pair.includes("neptune") && (aspectType === "square" || aspectType === "opposition")) {
      result.redFlags.emotional.push({
        title: "Identity Blur",
        detail: `There's tension between who you are and who you think you should be. You'll absorb other people's expectations and lose track of your own direction. Boundaries are hard — not because you can't set them, but because you genuinely can't tell where you end and others begin. The growth: learning to sit alone long enough to hear your own voice.`,
        sources: [`Sun ${aspect.aspect} Neptune`],
      });
    }

    // Mars-Pluto square/opposition → "Control Issues" relationship flag
    if (pair.includes("mars") && pair.includes("pluto") && (aspectType === "square" || aspectType === "opposition")) {
      result.redFlags.relationship.push({
        title: "Power Struggles",
        detail: `Your drive and your intensity are in tension — you'll pursue things with a force that can feel like compulsion to others. In relationships, this shows up as a need for control, or as attracting people who try to control you. The energy is real and magnetic, but it needs a healthy outlet or it'll find an unhealthy one.`,
        sources: [`Mars ${aspect.aspect} Pluto`],
      });
    }
  }

  // Count harmonious vs tense aspects for a chart-level note
  const harmonious = aspects.filter(a => a.polarity === "harmonious").length;
  const tense = aspects.filter(a => a.polarity === "tense").length;
  if (tense > harmonious * 2) {
    result.redFlags.behavioral.push({
      title: "Friction-Heavy Chart",
      detail: `Your chart has ${tense} tense aspects and only ${harmonious} harmonious ones. Things don't come easy — the friction is built in. This makes you real, gritty, and self-aware in ways that people with easy charts never need to be. It also means you'll work harder for the same results. Not broken — just wired for growth through conflict.`,
      sources: [`${tense} tense aspects`],
    });
  }

  return result;
}
