// ===========================================================================
// SAY LINES (part 1: Aries–Virgo) — "what to say / what not to say"
// ---------------------------------------------------------------------------
// One contrasting pair per sign per placement (Moon/Mercury/Venus/Mars),
// added only where the placement supports a communication-relevant insight.
//   works/avoid  → direct quotes addressed TO the person (second person,
//                  never gv-transformed, like monologues)
//   worksWhy/avoidWhy → neutral plural voice ("they/their/them"),
//                  voice.t() at render time
// ===========================================================================

import type { SayPair } from "./sayLines";

export const SAY_LINES_1: Record<string, { moon: SayPair; mercury: SayPair; venus: SayPair; mars: SayPair }> = {
  aries: {
    moon: {
      works: "You were right, and I should have said so sooner.",
      worksWhy: "Respect arrives first and the argument is already over — an Aries Moon forgives almost anything once being right is acknowledged.",
      avoid: "Calm down.",
      avoidWhy: "Nothing inflames this Moon faster. It turns a spark into a referendum on who gets to set the temperature, and they never lose that vote in their own head.",
    },
    mercury: {
      works: "Here's the headline — ask me if you want the details.",
      worksWhy: "Conclusion first matches the sprinter mind; they'll ask when they want more, and being trusted to ask builds the habit of listening.",
      avoid: "Let me explain the background first—",
      avoidWhy: "Long warm-ups read as stalling. They've stopped listening before the point arrives, and the explanation that follows lands on a closed door.",
    },
    venus: {
      works: "I planned this. Be ready at eight.",
      worksWhy: "A decided plan reads as desire. Aries Venus falls for people who make moves, not suggestions — the decisiveness IS the flirting.",
      avoid: "Whatever you want to do is fine.",
      avoidWhy: "Handing over the whole decision feels like indifference wearing a smile. Flexibility reads as absence of appetite, and appetite is the entire audition.",
    },
    mars: {
      works: "I disagree with you, and I still want you on my side.",
      worksWhy: "It separates the fight from the loyalty — Aries Mars can battle hard for hours as long as the bond itself is never the thing being contested.",
      avoid: "You always do this.",
      avoidWhy: "Always and never turn a round into a war. They'll litigate the total instead of the moment, and they keep better receipts than you expect.",
    },
  },

  taurus: {
    moon: {
      works: "Nothing's wrong. Sit, eat — I'll tell you after.",
      worksWhy: "Safety comes before content. Feed the body first and the feeling loses most of its teeth; they can hear anything once settled.",
      avoid: "We need to talk. Right now.",
      avoidWhy: "Ambush conversations read as threat. They shut the door and stand behind it, and every minute of the silence that follows gets billed to you.",
    },
    mercury: {
      works: "Take your time — I'm not going anywhere.",
      worksWhy: "It removes the clock, the one thing that turns deliberateness into stubbornness. Given room, they usually arrive somewhere sensible.",
      avoid: "Just decide already.",
      avoidWhy: "Pressure converts caution into a wall. They will stall purely to prove they can't be rushed, and they'll feel justified doing it.",
    },
    venus: {
      works: "I already booked the same place as last time.",
      worksWhy: "A repeated pleasure beats a novel gamble. For Taurus Venus, reliability is not the opposite of romance — it IS the romance.",
      avoid: "I know we had plans, but something came up.",
      avoidWhy: "Last-minute swings hit the stability wiring directly. One is an exception; enough of them and they quietly stop investing.",
    },
    mars: {
      works: "You're not wrong to be angry. I'm not leaving.",
      worksWhy: "Steady presence while the storm passes. They need to know the fight doesn't cost the relationship before they can hear a single word of it.",
      avoid: "Fine. Have it your way.",
      avoidWhy: "Sarcastic surrender is contempt in costume. They would rather lose the argument honestly than be patronized into winning one.",
    },
  },

  gemini: {
    moon: {
      works: "Talk me through it — I actually want the play-by-play.",
      worksWhy: "Narrating IS the processing. Given a genuine audience, the spiral short-circuits; the feeling gets found by the third retelling.",
      avoid: "You're overthinking it.",
      avoidWhy: "It confirms the private fear that their mind is the problem. They'll stop sharing the thinking — and an unshared Gemini Moon mood goes fully dark.",
    },
    mercury: {
      works: "New theory — hear me out, then tear it apart.",
      worksWhy: "Playful framing invites their favorite sport. Debate is how a Gemini Mercury shows trust; being asked to spar is being asked to be close.",
      avoid: "Can't you just pick one and stick with it?",
      avoidWhy: "Shaming the multi-track mind gets you a fake decision they'll quietly reverse. You didn't win; you taught them to stop showing you the draft.",
    },
    venus: {
      works: "You said that thing three weeks ago and I haven't stopped thinking about it.",
      worksWhy: "Proven listening. Gemini Venus falls for minds that catch theirs — evidence you were paying attention outweighs every compliment.",
      avoid: "Why haven't you texted back?",
      avoidWhy: "Surveillance reads as cage. Curiosity dies where obligation starts, and their interest was mostly curiosity.",
    },
    mars: {
      works: "Okay — make your best case. Then I'll make mine.",
      worksWhy: "It turns the fight into structure. Argument is home turf; conducted with respect, it's practically recreation for them.",
      avoid: "Whatever. I'm done talking.",
      avoidWhy: "Exiting mid-debate refuses them the one process that could actually resolve it. Being shut out of the conversation stings worse than losing it.",
    },
  },

  cancer: {
    moon: {
      works: "You don't have to explain why it hurt. It counts.",
      worksWhy: "Validation without cross-examination. A Cancer Moon keeps a private record of who let them feel what they felt — this deposits heavily.",
      avoid: "You're too sensitive about this.",
      avoidWhy: "A verdict instead of a comfort. It gets logged, and the log quietly re-ranks you; the warmth won't be withdrawn, it will be redirected.",
    },
    mercury: {
      works: "I noticed you've been quiet since Tuesday. What's going on?",
      worksWhy: "It shows you track them. Cancer Mercury opens when the noticing has been done for them — being observed carefully feels like being loved.",
      avoid: "Just say what you mean.",
      avoidWhy: "They thought they had. Demands for directness land as accusations, and accusations trigger the shell instead of the conversation.",
    },
    venus: {
      works: "I told my mom about you.",
      worksWhy: "Family-grade inclusion signals permanence — the only thing Cancer Venus is actually buying. Everything else is decoration on that.",
      avoid: "Let's keep this casual for now.",
      avoidWhy: "Indefinite limbo starves the security need. They'll comply politely and start reading every silence as the beginning of the end.",
    },
    mars: {
      works: "I'd rather fix this than win it.",
      worksWhy: "It disarms the shell directly — for them the fight was never about the topic; it was about whether the bond would hold under pressure.",
      avoid: "You're being irrational.",
      avoidWhy: "Emotion dismissed means person dismissed. The shell goes on, and it stays on for months; you'll be dealing with politeness instead of a partner.",
    },
  },

  leo: {
    moon: {
      works: "I was telling everyone about you earlier.",
      worksWhy: "Being someone's good news is oxygen. Pride is the door, not the obstacle — go through it and the loyalty behind it is absolute.",
      avoid: "Not everything is about you.",
      avoidWhy: "It lands as exile from the stage. They'll perform fine afterward while quietly grieving, and you won't be told which room the grief lives in.",
    },
    mercury: {
      works: "That was a good idea. Mine was worse.",
      worksWhy: "Public credit costs nothing and buys devotion. Leo Mercury keeps exact accounts of who shared the spotlight and who took it.",
      avoid: "Anyone could have done that.",
      avoidWhy: "Erasing the specialness hits the load-bearing wall. Expect sudden frost with no explanation — the explanation was the sentence you just said.",
    },
    venus: {
      works: "Save me a seat next to you.",
      worksWhy: "Being visibly chosen is the romance itself. Leo Venus wants witnesses; love that happens entirely in private barely registers as love.",
      avoid: "I don't really like attention, so…",
      avoidWhy: "It reads as a refusal to be claimed. They interpret it as being hidden, and being hidden is the opposite of everything they're offering.",
    },
    mars: {
      works: "You're too important to me to fight dirty.",
      worksWhy: "It gives them a noble reason to lower their voice. Pride flips instantly from defending the ego to protecting the relationship.",
      avoid: "Ha — you're ridiculous.",
      avoidWhy: "Mockery converts anger into humiliation, and humiliation is the one injury a Leo Mars does not forgive quietly or quickly.",
    },
  },

  virgo: {
    moon: {
      works: "You don't have to fix this tonight. I just need you here.",
      worksWhy: "It releases the duty engine. Being needed as a person instead of a repair service is the rarest gift this Moon can receive.",
      avoid: "Relax, it's fine.",
      avoidWhy: "It dismisses the problem and the noticing in one stroke — and they can't relax on command anyway, so now they're anxious AND insulted.",
    },
    mercury: {
      works: "I checked it twice already, but your eyes are better.",
      worksWhy: "An audit request. Virgo Mercury relaxes into usefulness; being trusted with the details is being trusted with the relationship.",
      avoid: "Stop nitpicking.",
      avoidWhy: "The nitpicking IS the love. Calling it a flaw teaches them to withhold care — and withholding is a skill they learn catastrophically well.",
    },
    venus: {
      works: "You seemed low today, so I handled dinner.",
      worksWhy: "Acts of service spoken in their native dialect. Virgo Venus notices effort aimed at them with terrifying precision — and reciprocates in kind.",
      avoid: "It's the thought that counts.",
      avoidWhy: "An excuse for sloppiness. To them the execution IS the thought; a sloppy gesture says you thought about them sloppily.",
    },
    mars: {
      works: "Tell me exactly what I did wrong — I want the specific version.",
      worksWhy: "It invites the critique instead of bracing against it. Specificity calms the alarm system; vagueness is what keeps it armed.",
      avoid: "Why are you making this so complicated?",
      avoidWhy: "The precision isn't complication, it's care. This insult doubles the case file and adds you to it.",
    },
  },
};
