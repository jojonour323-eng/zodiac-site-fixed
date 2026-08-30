"""Replace the tensionFromAspect function in mappers.ts with a clean version.

The pair key is `[a, b].sort().join("-")`, so all map keys must be in
alphabetically-sorted form (e.g. "jupiter-mars", not "mars-jupiter").
"""
from pathlib import Path

path = Path("/home/z/my-project/src/lib/astro/mappers.ts")
lines = path.read_text().splitlines(keepends=True)

# Find function start and end
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if line.startswith("function tensionFromAspect"):
        start_idx = i
    if start_idx is not None and i > start_idx and line == "}\n":
        end_idx = i
        break

assert start_idx is not None and end_idx is not None, f"start={start_idx}, end={end_idx}"

# Build the clean function. All keys are in sorted form.
NEW = '''function tensionFromAspect(f: CompatibilityPairItem): TensionPoint | null {
  const a = f.aPoint.toLowerCase();
  const b = f.bPoint.toLowerCase();
  const pair = [a, b].sort().join("-");

  // Each (planet-pair, tense aspect) maps to a small, named everyday tension
  // with a real, doable tip. Keys are in alphabetically-sorted form to match
  // the `pair` computation above.
  const isHard = ["square", "opposition", "sesquisquare", "semisquare", "quincunx"].includes(f.aspect.toLowerCase());
  const frictionAspect = isHard || f.aspect.toLowerCase() === "conjunction";
  if (!frictionAspect) return null;

  const map: Record<string, { title: string; what: string; tip: string }> = {
    "asc-jupiter": {
      title: "Different scales",
      what: "One of you is big-picture, expansive, optimistic. The other is more contained, focused, realistic. You can each feel like the other is missing the point.",
      tip: "Hear each other out fully before responding. The big-picture person isn't being naive; the contained person isn't being negative. You need both.",
    },
    "asc-mars": {
      title: "Clashing first instincts",
      what: "When something happens, your first instincts are different. One of you charges in, the other hangs back. Neither is wrong, but you'll judge each other for it.",
      tip: "Name it out loud when it happens: 'I notice I want to ___ and you want to ___.' Just naming it usually dissolves the friction.",
    },
    "asc-moon": {
      title: "Inner self vs. outer persona",
      what: "What one of you feels inside and what the other projects outward don't match. You'll each misread the other's mood.",
      tip: "Don't assume you know what they're feeling from their face. Ask. They might be projecting calm while churning inside.",
    },
    "asc-saturn": {
      title: "Different energy around commitment",
      what: "One of you reads as more serious or reserved to the other, especially at first. The reserved one can come across as cold; the open one as flighty. Both are reading each other wrong.",
      tip: "Give each other time to warm up. Don't read the first few months as the whole story.",
    },
    "asc-sun": {
      title: "Self vs. persona",
      what: "Who one of you actually is and how the other comes across don't quite match. You'll each catch the other off-guard.",
      tip: "Don't assume the mask is the person. Ask who they actually are underneath \\u2014 and listen.",
    },
    "asc-venus": {
      title: "Persona vs. affection",
      what: "How one of you comes across and how the other shows affection don't quite match. Signals can get crossed early on.",
      tip: "Don't read too much into first impressions. Give it time to see how they actually show care.",
    },
    "jupiter-mars": {
      title: "Go big vs. go steady",
      what: "One of you wants to chase big things, the other wants steady wins. You'll judge each other's pace.",
      tip: "Take turns: one big swing per year, plus steady progress in between. Both scales matter.",
    },
    "jupiter-mercury": {
      title: "Detail vs. big picture",
      what: "One of you cares about specifics, the other about the big vision. You'll each feel like the other is missing the point.",
      tip: "Both views are needed. Let the detail person handle execution, the big-picture person handle direction. Trust each other's lane.",
    },
    "jupiter-moon": {
      title: "Different emotional scales",
      what: "One of you feels things big and loud, the other more contained. The big one can feel like the other doesn't care; the contained one can feel overwhelmed.",
      tip: "Neither way is wrong. Make space for both \\u2014 the loud one gets to feel out loud, the quiet one gets to feel in their own time.",
    },
    "jupiter-saturn": {
      title: "Expansion vs. contraction",
      what: "One of you wants to grow, spend, say yes. The other wants to consolidate, save, be careful. Both are right \\u2014 the trick is timing.",
      tip: "Take turns: a growth season, then a consolidation season. Don't try to do both at once.",
    },
    "jupiter-sun": {
      title: "Different scales of ambition",
      what: "One of you thinks bigger, the other more contained. The big one can feel held back; the contained one can feel swept up.",
      tip: "Find a shared vision that's big enough to excite you both but small enough to actually execute. Compromise on scale.",
    },
    "jupiter-venus": {
      title: "Different scales of affection",
      what: "One of you shows love big \\u2014 grand gestures, lots of it. The other is more understated. You can each feel under-loved by the other's metric.",
      tip: "Learn each other's scale. A small gesture from the understated one might be huge in their language.",
    },
    "mars-mc": {
      title: "Ambition clashes",
      what: "Your drives around career and public life point in different directions, or one of you is more ambitious than the other.",
      tip: "Talk about what success means to each of you. You might be using the same word for different things.",
    },
    "mars-mercury": {
      title: "Words can cut",
      what: "Arguments can get sharp fast. One of you says something blunt, the other takes it personally, and it escalates before either of you notices.",
      tip: "Agree on a pause word \\u2014 something you can both say when a conversation is heating up, no questions asked, and you take 10 minutes before continuing.",
    },
    "mars-moon": {
      title: "Feelings vs. action",
      what: "One of you processes things by feeling them, the other by doing something about them. The doer might rush to fix when the feeler just wants to be heard.",
      tip: "Ask: 'Do you want comfort or solutions right now?' before responding. It saves a lot of misfires.",
    },
    "mars-pluto": {
      title: "Willpower clashes",
      what: "When you both want your way, neither of you backs down easily. Power struggles can flare over things that don't really matter.",
      tip: "Ask: 'Is this worth fighting for, or just worth winning?' Most of the time, it's neither \\u2014 let it go.",
    },
    "mars-saturn": {
      title: "Go vs. slow down",
      what: "One of you wants to move, decide, act. The other wants to plan, consider, wait. Both have merit. The friction is when neither will yield.",
      tip: "For decisions that affect both of you, set a shared deadline. The mover agrees to wait, the slower one agrees to commit by a date. Both compromise.",
    },
    "mars-sun": {
      title: "Clashing styles of going after things",
      what: "You each have strong opinions about how to get stuff done, and your approaches don't match. One might be direct, the other strategic. This can become power struggles over small things.",
      tip: "Pick your battles. Not every disagreement about how to do something is worth winning \\u2014 sometimes just let them do it their way.",
    },
    "mars-uranus": {
      title: "Impulse vs. plan",
      what: "One of you acts on impulse, the other thinks it through. The impulsive one feels held back; the planner feels ambushed.",
      tip: "For big decisions, sleep on it. For small ones, let the impulsive one lead. Match the speed to the stakes.",
    },
    "mars-venus": {
      title: "Different rhythms of desire",
      what: "The chemistry is real, but your rhythms around affection, sex, and romance don't perfectly sync. One might want more intensity, the other more ease.",
      tip: "Talk about it like adults, not in the moment. What you each like, how often, what feels good \\u2014 outside the bedroom is the right place for that conversation.",
    },
    "mc-moon": {
      title: "Public life vs. home life",
      what: "One of you is oriented outward (career, public role), the other inward (home, family, emotional base). You'll need to consciously balance both.",
      tip: "Make sure both worlds get real attention. Schedule home time as seriously as you schedule work time.",
    },
    "mc-venus": {
      title: "Public life vs. private love",
      what: "One of you prioritizes career and public role, the other prioritizes the relationship. These can pull in different directions.",
      tip: "Get explicit about priorities. 'This month is career-heavy; next month is us-heavy.' Rotate intentionally.",
    },
    "mercury-mercury": {
      title: "Different communication styles",
      what: "You each talk and think in different ways. One might be direct, the other indirect. One wants the bottom line, the other wants context. Misunderstandings stack up fast.",
      tip: "When something feels off, slow down and check: 'I heard you say ___, is that what you meant?' Don't assume.",
    },
    "mercury-moon": {
      title: "Feelings vs. words",
      what: "One of you leads with emotion, the other with logic. You'll talk past each other when something's wrong.",
      tip: "Slow down: 'I'm not asking you to fix it, I just need to say it.' Or: 'Help me understand what you're feeling, not just what happened.'",
    },
    "mercury-saturn": {
      title: "Heavy conversations",
      what: "Talks can feel weighty. One of you might be more serious, the other lighter. Important conversations can get bogged down in obligation instead of flowing.",
      tip: "Mix it up: not every conversation needs to be a summit. Light small talk is also intimacy \\u2014 don't skip it.",
    },
    "mercury-sun": {
      title: "Identity vs. communication",
      what: "How one of you sees yourself and how the other communicates can clash. One might take things personally that were meant practically.",
      tip: "Don't assume every comment is about who you are. Ask: 'What did you actually mean by that?' before reacting.",
    },
    "mercury-venus": {
      title: "Head vs. heart in conversation",
      what: "One of you communicates to be understood, the other to connect. Same words, different goals.",
      tip: "Notice when you're talking past each other. 'Are we problem-solving or just connecting right now?' is a useful question.",
    },
    "moon-neptune": {
      title: "Boundaries blur",
      what: "One of you absorbs the other's moods. It's hard to tell whose feelings are whose. This can be beautiful and also exhausting.",
      tip: "Have a daily check-in: 'What's mine, what's yours?' Separating the two is a skill worth building.",
    },
    "moon-pluto": {
      title: "Emotional intensity",
      what: "Feelings between you run deep \\u2014 sometimes too deep. Jealousy, possessiveness, or all-or-nothing emotional swings can show up.",
      tip: "When things get intense, take a breath before reacting. Intensity isn't the same as truth.",
    },
    "moon-saturn": {
      title: "Emotional closeness takes work",
      what: "One of you might be more emotionally reserved than the other. The open one can feel shut out; the reserved one can feel pressured. Trust takes longer to build this way.",
      tip: "Don't push for emotional depth on a schedule. Build it through small, consistent moments \\u2014 not big talks.",
    },
    "moon-uranus": {
      title: "Mood swings vs. steadiness",
      what: "One of you has unpredictable emotional shifts, the other wants steadiness. The shifter can feel judged; the steady one can feel whiplashed.",
      tip: "Name it when it's happening: 'I'm having a mood swing, it's not about you.' Just naming it removes half the friction.",
    },
    "moon-venus": {
      title: "Emotional needs vs. affection style",
      what: "What one of you needs to feel emotionally safe and what the other naturally gives as affection don't quite match. One might crave deep talks, the other gives gifts or touch.",
      tip: "Try meeting in the middle: ask for the specific thing you need ('I'd love a hug right now') instead of waiting for them to figure it out.",
    },
    "neptune-sun": {
      title: "Reality vs. idealism",
      what: "One of you sees things as they are, the other as they could be. You'll each feel like the other is missing the point.",
      tip: "Honor both views: the realist keeps you grounded, the idealist keeps you growing. You need both, even when they clash.",
    },
    "neptune-venus": {
      title: "Real love vs. idealized love",
      what: "One of you loves the person in front of you, the other loves an idealized version. Reality vs. fantasy can become a real tension.",
      tip: "See each other clearly, flaws included. Love that includes the flaws is the kind that actually lasts.",
    },
    "pluto-sun": {
      title: "Power and identity",
      what: "Issues of control and identity can come up. One of you might inadvertently dominate, the other might resist being changed.",
      tip: "Name power dynamics out loud when you notice them. 'I feel like I'm losing myself here' is a sentence worth practicing.",
    },
    "pluto-venus": {
      title: "Love and control",
      what: "Love can tip into possession. One of you might want to merge completely, the other needs to keep some ground. Jealousy is a risk.",
      tip: "Trust until you have a reason not to. Possessiveness costs you the love you're trying to protect.",
    },
    "saturn-sun": {
      title: "Different ideas about responsibility",
      what: "One of you takes responsibility very seriously \\u2014 duty, commitments, the long game. The other takes it more lightly. This can show up as one feeling like the 'adult' in the relationship.",
      tip: "Get clear on what you each consider non-negotiable. The serious one might be carrying weight that should be shared; the lighter one might need to step up.",
    },
    "saturn-uranus": {
      title: "Tradition vs. change",
      what: "One of you values what's proven, the other what's new. You'll each feel like the other is being reckless or stuck.",
      tip: "Honor both. Tradition without change stagnates; change without tradition destabilizes. You need both.",
    },
    "saturn-venus": {
      title: "Heavy vs. light",
      what: "One of you brings seriousness to the relationship \\u2014 commitment, responsibility, the long view \\u2014 and the other wants things lighter, more playful, more spontaneous. Neither is wrong.",
      tip: "Schedule both: real date nights for fun, and real talks for the heavy stuff. Don't let one crowd out the other.",
    },
    "sun-uranus": {
      title: "Stability vs. disruption",
      what: "One of you wants things predictable, the other keeps shaking things up. Both have value \\u2014 the friction is when neither will yield.",
      tip: "Build in planned surprises. If change is scheduled, the stable one can relax; if stability is honored, the disruptor can wait.",
    },
    "uranus-venus": {
      title: "Stability vs. excitement",
      what: "One of you wants routine in love, the other wants surprise. Both have value \\u2014 the friction is when neither bends.",
      tip: "Plan surprise inside the routine. Predictable doesn't have to mean boring; exciting doesn't have to mean unstable.",
    },
  };

  const entry = map[pair];
  if (!entry) {
    // Generic fallback for pairs we haven't mapped yet.
    return {
      title: `${pretty(f.aPoint)} \\u00d7 ${pretty(f.bPoint)} tension`,
      what: f.summary,
      tip: f.advice[0] || "When this comes up, pause and ask what the other person is actually trying to say. Most friction here is misunderstanding, not malice.",
      source: `${f.aPoint} ${f.aspect} ${f.bPoint}`,
    };
  }

  return {
    title: entry.title,
    what: entry.what,
    tip: entry.tip,
    source: `${f.aPoint} ${f.aspect} ${f.bPoint}`,
  };
}
'''

new_lines = lines[:start_idx] + [NEW] + lines[end_idx + 1:]
path.write_text("".join(new_lines))
print(f"Replaced lines {start_idx+1}-{end_idx+1} with clean function.")
print(f"New file has {len(new_lines)} lines.")
