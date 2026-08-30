// ===========================================================================
// NODES — North Node growth themes by sign (+ optional house accent)
// ---------------------------------------------------------------------------
// Written as direction-of-growth, never fate. Authored neutral plural.
// ===========================================================================

const NODE_LESSONS: Record<string, { theme: string; body: string[] }> = {
  aries: {
    theme: "choosing themselves first",
    body: [
      "The long arc of this chart bends toward self-assertion: deciding without committee approval, wanting things OUT LOUD, risking the disapproval that people-pleasing was built to avoid. Growth lives on the other side of 'I might be letting someone down' — specifically in acting anyway.",
      "Old habits pull toward merging, waiting, keeping peace at any price. The new skill is healthy selfishness: treating own desires as legitimate data rather than guilty secrets.",
    ],
  },
  taurus: {
    theme: "building actual stability instead of surviving chaos",
    body: [
      "This chart is learning slowness on purpose: savoring instead of scanning, staying instead of fleeing, building material security brick by patient brick. Values get defined from inside — what IS worth money, time, loyalty — rather than adopted from whatever crisis is loudest.",
      "The old strategy ran on urgency and reinvention. The new one trusts accumulation: small consistent deposits of skill, savings, and calm compounding into a life that doesn't need rescuing.",
    ],
  },
  gemini: {
    theme: "staying curious instead of certain",
    body: [
      "Development runs through listening: asking real questions, updating opinions in public, tolerating the humility of not-knowing. Truth here gets discovered through conversation and contrast — tested against other people's viewpoints rather than defended like territory.",
      "The pull is toward rigid correctness — one philosophy, final answers, settled debates. Growth means treating every conclusion as a draft: worth revising when reality disagrees.",
    ],
  },
  cancer: {
    theme: "learning to need people out loud",
    body: [
      "Emotional development moves toward domestic courage: expressing feelings before they're fully processed, asking for comfort without earning it first, building chosen family with deliberate tenderness. Vulnerability stops being classified information.",
      "The old reflex treats emotion as an inefficiency to be managed out of the way. The new skill understands that warmth given AND received isn't weakness — it's the foundation everything else gets built on.",
    ],
  },
  leo: {
    theme: "taking up visible space on purpose",
    body: [
      "Growth requires an audience relationship with life: creating things signed with their own name, leading even when nobody assigned them leadership, and risking embarrassment instead of staying invisible. Creative self-expression stops being a hobby and becomes a need.",
      "The avoidance pattern favors anonymity: group-consensus safety, behind-the-scenes competence, praise accepted quietly. The lesson this life keeps assigning: stand center-stage sometimes WITHOUT apologizing for wanting to be seen.",
    ],
  },
  virgo: {
    theme: "trusting order without demanding perfection",
    body: [
      "Growth keeps coming through craft: skills sharpened for real, health maintained in practice, chaos converted into working systems. At the same time they're unlearning the tyranny of perfection — mistakes allowed as tuition, not prosecuted as verdicts on their character.",
      "The analytical gifts stay; the perfectionist cruelty gets retired. The new standard: good enough to ship, humble enough to improve, kind enough to survive both.",
    ],
  },
  libra: {
    theme: "negotiating life as an equal partner",
    body: [
      "Relational maturity develops through real diplomacy: engaging conflict honestly instead of avoiding it politely, compromising WITH a backbone, and building partnership between two complete people rather than two halves looking for a loan of completion.",
      "The old programming swings between fight-mode and doormat-mode. The sophisticated middle: caring intensely about fairness while accepting that some battles end with both sides a little unhappy — which adults call Tuesday.",
    ],
  },
  scorpio: {
    theme: "letting transformation actually finish",
    body: [
      "The deep education here happens through surrender: trusting gradually then completely, sharing power without planning exits, letting endings bury what endings should bury. Control loosens not through defeat but through earned confidence that they can regenerate.",
      "Skimming surfaces satisfies less each year, while a life lived only at the surface quietly goes bankrupt. The curriculum demands real descents sometimes — emotional, financial, relational bottoms visited on purpose, where their reserves prove themselves under load.",
    ],
  },
  sagittarius: {
    theme: "trusting life enough to wander",
    body: [
      "Faith develops through experiments: bigger questions asked seriously, unfamiliar territory entered literally and figuratively, meaning built from direct experience instead of inherited certainty. Adventure becomes a method, not a distraction.",
      "Comfort-zone gravity pulls toward control-through-accumulation — more evidence, more preparation, more guarantees before any movement. The antidote comes in regular small doses: planned spontaneity, teachable uncertainty, boots bought before the route is fully certain.",
    ],
  },
  capricorn: {
    theme: "building something that outlasts moods",
    body: [
      "Growth runs through authorship: goals set independently, structures designed to last, authority claimed instead of awaited. Emotional weather gradually loses its veto power over commitments as discipline matures past rebellion into real self-respect.",
      "The temptation to retreat into consumed dreams instead of built ones never fully leaves. The counter-practice is shamelessly small completions: start a project and finish it in public, make a promise and keep it where people can see, show competence so reliably that confidence eventually shows up after the fact.",
    ],
  },
  aquarius: {
    theme: "belonging somewhere without disappearing into it",
    body: [
      "Growth proceeds through contribution: causes joined with actual effort, friendships initiated on purpose, individuality expressed inside groups instead of defended against them. Groups become practice grounds for an authentic self — not the identity-suppression hazard this chart assumes by default.",
      "The detached-observer position always feels safest. Development pushes outward from it: opinions voiced where real disagreement exists, needs stated inside relationships despite a low tolerance for mess, presence offered imperfectly-real instead of perfectly-absent.",
    ],
  },
  pisces: {
    theme: "feeling everything while staying here",
    body: [
      "Growth advances through practice in the body: empathy boundaries maintained on purpose, artistry disciplined until work actually gets finished, transcendence accessed without chemicals or fantasy as the only route. Sensitivity graduates from vulnerability into recognized strength.",
      "The temptation to isolate returns whenever overwhelm peaks — predictably. The working routine is unglamorous on purpose: grounding habits kept religiously, creative output produced regardless of mood, help offered somewhere local and specific where the results stay visible against despair's arguments.",
    ],
  },
};

export interface NodeLesson {
  signName: string;
  theme: string;
  blocks: string[];
}

export function buildNodeChapter(
  nodeSign: string | undefined,
  house: number | undefined,
  areaName?: string
): NodeLesson | null {
  if (!nodeSign) return null;
  const lesson = NODE_LESSONS[nodeSign];
  if (!lesson) return null;
  const blocks = [...lesson.body];
  if (house && areaName) {
    blocks.push(`With the North Node placed in house ${house}, the curriculum concentrates around ${areaName} — that's where these lessons keep scheduling their exams.`);
  }
  return { signName: capitalize(nodeSign), theme: lesson.theme, blocks };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
