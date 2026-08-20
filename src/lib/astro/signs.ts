import type { SignId, Element, Modality } from "./types";

export interface SignMeta {
  id: SignId;
  name: string;
  abbr: string;
  glyph: string;
  element: Element;
  modality: Modality;
  ruler: string;
  dates: string;
  // 0-100 scores per trait. Numbers reflect standard Western astrology:
  // element (fire=action, earth=practical, air=mental, water=feeling),
  // modality (cardinal=starts, fixed=holds, mutable=adapts), and ruler.
  traits: {
    social: number;
    emotional: number;
    creativity: number;
    communication: number;
    confidence: number;
    discipline: number;
    energy: number;
    romance: number;
  };
  short: string;        // one-line essence, casual
  vibe: string;         // two-line "what this sign feels like to be around"
}

export const SIGN_META: Record<SignId, SignMeta> = {
  aries: {
    id: "aries", name: "Aries", abbr: "Ari", glyph: "\u2648",
    element: "fire", modality: "cardinal", ruler: "Mars",
    dates: "Mar 21 \u2013 Apr 19",
    traits: { social: 60, emotional: 35, creativity: 65, communication: 55, confidence: 95, discipline: 45, energy: 95, romance: 75 },
    short: "First to jump, last to ask permission. Aries moves on instinct.",
    vibe: "You walk into a room and the energy picks up. People either want to follow you or get out of your way \u2014 either is fine by you.",
  },
  taurus: {
    id: "taurus", name: "Taurus", abbr: "Tau", glyph: "\u2649",
    element: "earth", modality: "fixed", ruler: "Venus",
    dates: "Apr 20 \u2013 May 20",
    traits: { social: 55, emotional: 65, creativity: 70, communication: 50, confidence: 70, discipline: 85, energy: 55, romance: 95 },
    short: "Slow to start, impossible to push off course. Taurus wants the good stuff to last.",
    vibe: "You take your time with everything \u2014 food, decisions, people. Once you commit to something (or someone), you're in it for the long haul.",
  },
  gemini: {
    id: "gemini", name: "Gemini", abbr: "Gem", glyph: "\u264A",
    element: "air", modality: "mutable", ruler: "Mercury",
    dates: "May 21 \u2013 Jun 20",
    traits: { social: 90, emotional: 45, creativity: 75, communication: 95, confidence: 65, discipline: 40, energy: 75, romance: 65 },
    short: "Always three ideas ahead. Gemini connects things other people miss.",
    vibe: "You've usually got a tab open in your head for five different things. Boring is your enemy. You'd rather be tired than bored.",
  },
  cancer: {
    id: "cancer", name: "Cancer", abbr: "Can", glyph: "\u264B",
    element: "water", modality: "cardinal", ruler: "Moon",
    dates: "Jun 21 \u2013 Jul 22",
    traits: { social: 65, emotional: 95, creativity: 75, communication: 65, confidence: 55, discipline: 60, energy: 55, romance: 85 },
    short: "Feels everything, remembers everything. Cancer takes care of its people.",
    vibe: "You can tell when someone's upset before they say a word. Your home is your castle, and the people you love live inside your ribs.",
  },
  leo: {
    id: "leo", name: "Leo", abbr: "Leo", glyph: "\u264C",
    element: "fire", modality: "fixed", ruler: "Sun",
    dates: "Jul 23 \u2013 Aug 22",
    traits: { social: 85, emotional: 70, creativity: 95, communication: 75, confidence: 95, discipline: 55, energy: 85, romance: 80 },
    short: "Big heart, big presence, big plans. Leo lights up whatever room it walks into.",
    vibe: "You want to be seen, and you want to share what you've got. Generous to a fault, but you do notice when people forget to say thanks.",
  },
  virgo: {
    id: "virgo", name: "Virgo", abbr: "Vir", glyph: "\u264D",
    element: "earth", modality: "mutable", ruler: "Mercury",
    dates: "Aug 23 \u2013 Sep 22",
    traits: { social: 55, emotional: 60, creativity: 60, communication: 85, confidence: 60, discipline: 95, energy: 60, romance: 60 },
    short: "Notices the details everyone else misses. Virgo fixes things, quietly.",
    vibe: "You see the one thing that's out of place and you can't unsee it. Helping is your love language \u2014 but you're harder on yourself than anyone knows.",
  },
  libra: {
    id: "libra", name: "Libra", abbr: "Lib", glyph: "\u264E",
    element: "air", modality: "cardinal", ruler: "Venus",
    dates: "Sep 23 \u2013 Oct 22",
    traits: { social: 95, emotional: 65, creativity: 80, communication: 85, confidence: 60, discipline: 55, energy: 55, romance: 95 },
    short: "Wants everyone to get along and look good doing it. Libra is the diplomat.",
    vibe: "You'd rather find the middle than win the fight. Beauty, fairness, and good company matter to you more than people realize.",
  },
  scorpio: {
    id: "scorpio", name: "Scorpio", abbr: "Sco", glyph: "\u264F",
    element: "water", modality: "fixed", ruler: "Pluto",
    dates: "Oct 23 \u2013 Nov 21",
    traits: { social: 50, emotional: 95, creativity: 80, communication: 55, confidence: 80, discipline: 80, energy: 80, romance: 90 },
    short: "Goes where it's dark and brings back the truth. Scorpio doesn't do surface.",
    vibe: "You can spot a lie from across the room. You don't trust easily, but once you do, you're all in \u2014 and you expect the same back.",
  },
  sagittarius: {
    id: "sagittarius", name: "Sagittarius", abbr: "Sag", glyph: "\u2650",
    element: "fire", modality: "mutable", ruler: "Jupiter",
    dates: "Nov 22 \u2013 Dec 21",
    traits: { social: 85, emotional: 55, creativity: 80, communication: 80, confidence: 85, discipline: 40, energy: 90, romance: 55 },
    short: "Chases the next horizon and the next big idea. Sagittarius hates being fenced in.",
    vibe: "You'd rather be on a plane than at a desk. Honesty is your default \u2014 sometimes too much so. Rules feel like suggestions to you.",
  },
  capricorn: {
    id: "capricorn", name: "Capricorn", abbr: "Cap", glyph: "\u2651",
    element: "earth", modality: "cardinal", ruler: "Saturn",
    dates: "Dec 22 \u2013 Jan 19",
    traits: { social: 50, emotional: 50, creativity: 55, communication: 60, confidence: 80, discipline: 95, energy: 70, romance: 55 },
    short: "Plays the long game. Capricorn builds something that lasts.",
    vibe: "You knew what you wanted before most people figured out what to wear. You take yourself seriously \u2014 maybe a little too seriously sometimes.",
  },
  aquarius: {
    id: "aquarius", name: "Aquarius", abbr: "Aqu", glyph: "\u2652",
    element: "air", modality: "fixed", ruler: "Uranus",
    dates: "Jan 20 \u2013 Feb 18",
    traits: { social: 80, emotional: 50, creativity: 85, communication: 90, confidence: 75, discipline: 60, energy: 65, romance: 50 },
    short: "Sees how things could be, not how they are. Aquarius doesn't follow the crowd.",
    vibe: "You've got one foot in the future. You care about people in the abstract, but one-on-one you can feel a little far away.",
  },
  pisces: {
    id: "pisces", name: "Pisces", abbr: "Pis", glyph: "\u2653",
    element: "water", modality: "mutable", ruler: "Neptune",
    dates: "Feb 19 \u2013 Mar 20",
    traits: { social: 70, emotional: 95, creativity: 95, communication: 70, confidence: 45, discipline: 35, energy: 50, romance: 90 },
    short: "Feels what others can't say. Pisces lives halfway in a dream.",
    vibe: "You pick up moods like a sponge. Music, art, and quiet hit you harder than they hit most people. You'd rather merge than perform.",
  },
};

export const SIGN_BY_ABBR: Record<string, SignId> = Object.values(SIGN_META).reduce(
  (acc, s) => {
    acc[s.abbr] = s.id;
    return acc;
  },
  {} as Record<string, SignId>
);

// Map absolute longitude (0-360) -> sign id
export function signIdFromAbsPos(absPos: number): SignId {
  const idx = Math.floor(((absPos % 360) + 360) % 360 / 30);
  const order: SignId[] = [
    "aries", "taurus", "gemini", "cancer",
    "leo", "virgo", "libra", "scorpio",
    "sagittarius", "capricorn", "aquarius", "pisces",
  ];
  return order[idx];
}

export const ELEMENT_COLORS: Record<Element, string> = {
  fire: "#f59e0b",
  earth: "#10b981",
  air: "#38bdf8",
  water: "#818cf8",
};

export const ELEMENT_LABELS: Record<Element, string> = {
  fire: "Fire",
  earth: "Earth",
  air: "Air",
  water: "Water",
};

export const ELEMENT_VIBE: Record<Element, string> = {
  fire: "action, courage, and a quick spark",
  earth: "practicality, patience, and the real world",
  air: "ideas, words, and connection",
  water: "feeling, intuition, and depth",
};
