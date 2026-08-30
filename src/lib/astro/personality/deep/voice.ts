// ===========================================================================
// VOICE — gender-aware pronoun + verb agreement transformer
// ---------------------------------------------------------------------------
// All interpretation copy is authored in neutral third-person PLURAL form
// ("they want", "their own", "them"). At render time it is transformed to
// she/her/hers or he/him/his with correct verb agreement. Nothing in the
// authored text needs to know the gender — the transform guarantees
// "watch out for the gender".
//
// Authoring rules (must be followed by all content libraries):
//   - subject  -> always "they"
//   - verbs    -> plural/base form  ("they are", "they have", "they want")
//   - object   -> "them"
//   - possess. -> "their" / "theirs"
//   - reflex.  -> "themselves"
// The transform handles contractions, capitalization, and common verbs.
// ===========================================================================

export type Gender = "male" | "female" | null | undefined;

const AUX_NO_CHANGE = new Set([
  "can", "cannot", "could", "will", "would", "shall", "should", "may",
  "might", "must", "not", "never", "also", "still", "just",
]);

/** Irregular / special-case verb conjugations (plural form -> singular). */
const IRREGULAR: Record<string, string> = {
  are: "is", am: "is", is: "is",
  were: "was", was: "was",
  have: "has", has: "has",
  do: "does", does: "does", did: "did",
  go: "goes", goes: "goes", went: "went",
  say: "says", says: "says", said: "said",
  try: "tries", tries: "tries",
  carry: "carries", carries: "carries",
  hurry: "hurries", hurries: "hurries",
  // verbs ending in s/x/z/ch/sh that the generic +s rule can't handle
  pass: "passes", push: "pushes", wish: "wishes", catch: "catches",
  reach: "reaches", touch: "touches", miss: "misses", fix: "fixes",
  watch: "watches", finish: "finishes", rush: "rushes", crush: "crushes",
  express: "expresses", address: "addresses", process: "processes",
  guess: "guesses", blush: "blushes", clash: "clashes", march: "marches",
  search: "searches", brush: "brushes", flash: "flashes", crash: "crashes",
  toss: "tosses", fuss: "fusses", release: "releases", chase: "chases",
  praise: "praises", choose: "chooses", chose: "chose", lose: "loses",
  rise: "rises", raise: "raises", close: "closes", pause: "pauses",
  use: "uses", excuse: "excuses", bruise: "bruises", tease: "teases",
  please: "pleases", ease: "eases", house: "houses", promise: "promises",
  // base forms that LOOK like participles (end in -ed) but must add -s
  need: "needs", feed: "feeds", breed: "breeds", speed: "speeds",
  heed: "heeds", exceed: "exceeds", succeed: "succeeds", proceed: "proceeds",
  embed: "embeds", weld: "welds", shield: "shields", yield: "yields",
  // base forms ending -ss / -x / -z / -ch / -sh beyond the map above
  stress: "stresses", dress: "dresses", press: "presses", impress: "impresses",
  assess: "assesses", bless: "blesses", cross: "crosses", possess: "possesses",
  discuss: "discusses", focus: "focuses", erase: "erases", cruise: "cruises",
  exercise: "exercises", advise: "advises", surprise: "surprises",
  mix: "mixes", tax: "taxes", box: "boxes", relax: "relaxes", perplex: "perplexes",
  buzz: "buzzes", quiz: "quizzes", fizz: "fizzes",
  teach: "teaches", match: "matches", fetch: "fetches", approach: "approaches",
  coach: "coaches", attach: "attaches", publish: "publishes", punish: "punishes",
  polish: "polishes", establish: "establishes", refresh: "refreshes",
  flourish: "flourishes", banish: "banishes", vanish: "vanishes",
  preach: "preaches", breach: "breaches", launch: "launches",
  punch: "punches", clutch: "clutches", stretch: "stretches", switch: "switches",
};

function singularize(verb: string): string {
  const lower = verb.toLowerCase();
  if (AUX_NO_CHANGE.has(lower)) return verb;
  if (IRREGULAR[lower]) return matchCase(verb, IRREGULAR[lower]);
  // already looks like 3rd-person singular or participle → leave untouched
  if (/(?:s|x|z|ch|sh|ing|ed|ss|us)$/.test(lower)) return verb;
  if (/[^aeiouy]y$/.test(lower)) return matchCase(verb, `${lower.slice(0, -1)}ies`);
  return matchCase(verb, `${lower}s`);
}

function matchCase(original: string, replacement: string): string {
  const c = original.charAt(0);
  if (c && c === c.toUpperCase() && c !== c.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

interface PronounSet {
  subj: string; obj: string; poss: string; possPro: string; refl: string;
  contractionBe: string;
}

const SETS: Record<"f" | "m" | "n", PronounSet> = {
  f: { subj: "she", obj: "her", poss: "her", possPro: "hers", refl: "herself", contractionBe: "'s" },
  m: { subj: "he", obj: "him", poss: "his", possPro: "his", refl: "himself", contractionBe: "'s" },
  n: { subj: "they", obj: "them", poss: "their", possPro: "theirs", refl: "themselves", contractionBe: "'re" },
};

/**
 * Transform neutral-plural authored text to gendered text.
 * gender null/undefined keeps the neutral voice.
 */
export function gv(text: string, gender: Gender): string {
  if (!text) return text;
  const set = gender === "female" ? SETS.f : gender === "male" ? SETS.m : SETS.n;
  if (set === SETS.n) return text;

  let out = text;

  // contractions first
  out = replaceWord(out, "they're", `${set.subj}${set.contractionBe}`);
  out = replaceWord(out, "They're", cap(set.subj) + set.contractionBe);
  out = replaceWord(out, "they've", `${set.subj} have`);
  out = replaceWord(out, "They've", cap(set.subj) + " have");
  out = replaceWord(out, "they'll", `${set.subj}'ll`);
  out = replaceWord(out, "They'll", cap(set.subj) + "'ll");
  out = replaceWord(out, "they'd", `${set.subj}'d`);
  out = replaceWord(out, "They'd", cap(set.subj) + "'d");

  // core pronouns (both cases)
  out = replaceWord(out, "They", cap(set.subj));
  out = replaceWord(out, "they", set.subj);
  out = replaceWord(out, "Them", cap(set.obj));
  out = replaceWord(out, "them", set.obj);
  out = replaceWord(out, "Their", cap(set.poss));
  out = replaceWord(out, "their", set.poss);
  out = replaceWord(out, "Theirs", cap(set.possPro));
  out = replaceWord(out, "theirs", set.possPro);
  out = replaceWord(out, "Themselves", cap(set.refl));
  out = replaceWord(out, "themselves", set.refl);

  // verb agreement after subject pronoun
  out = fixVerbs(out);

  return out;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function replaceWord(text: string, word: string, replacement: string): string {
  const re = new RegExp(`\\b${word}\\b`, "g");
  return text.replace(re, replacement);
}

/** Add third-person singular inflection to base verbs that directly follow she/he. */
function fixVerbs(text: string): string {
  const ADV = "(?:just|still|also|never|often|always|really|simply|quietly|usually|occasionally|rarely|genuinely|finally|only|either|already|actually|suddenly|slowly|quickly|completely|totally|constantly|immediately|eventually|probably|certainly|definitely|mostly|deeply|openly|barely|nearly|almost|exactly|literally|happily|carefully|deliberately|silently|automatically|originally|generally)";
  const re = new RegExp(
    `\\b(she|he|She|He)((?:\\s+${ADV})?)\\s+([a-zA-Z]+(?:(?:'|\u2019)t)?)`,
    "g"
  );
  return text.replace(re, (full, pron: string, adv: string, verb: string) => {
    void full;
    // negative contractions need person-correct swaps; others stay
    if (/(?:'|\u2019)t$/i.test(verb)) {
      if (/^don'?t$/i.test(verb)) {
        const fixed = /^D/.test(verb) ? "Doesn't" : "doesn't";
        return `${pron}${adv} ${fixed}`;
      }
      return `${pron}${adv} ${verb}`; // can't, won't, ain't...
    }
    return `${pron}${adv} ${singularize(verb)}`;
  });
}

// ---------------------------------------------------------------------------
// Explicit pronoun helpers for places where code composes sentences directly.
// ---------------------------------------------------------------------------

export interface Voice {
  /** subject: she/he/they */
  s: string;
  /** object: her/him/them */
  o: string;
  /** possessive: her/his/their */
  p: string;
  /** reflexive: herself/himself/themselves */
  r: string;
  /** "is"/"are" */
  be: string;
  /** transform an authored-neutral snippet into this voice */
  t: (text: string) => string;
}

export function makeVoice(gender: Gender): Voice {
  const set = gender === "female" ? SETS.f : gender === "male" ? SETS.m : SETS.n;
  return {
    s: set.subj,
    o: set.obj,
    p: set.poss,
    r: set.refl,
    be: set.contractionBe.startsWith("'s") ? "is" : "are",
    t: (text: string) => gv(text, gender),
  };
}
