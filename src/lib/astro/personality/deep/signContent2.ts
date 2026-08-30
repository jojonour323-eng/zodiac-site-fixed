// ===========================================================================
// SIGN CONTENT — Leo, Virgo, Libra, Scorpio
// Authored in neutral plural voice; gv() converts pronouns per person.
// ===========================================================================

import type { SignChapter } from "./signTypes";

export const SIGNS_2: Record<string, SignChapter> = {
  // ────────────────────────────────────────────────────────── LEO
  leo: {
    sun: {
      core: [
        "They need to matter visibly — not in a shallow way, but the way a fire needs air. When people respond to them, they come fully alive: warmer, funnier, braver, more generous. When they're ignored or treated as furniture, something in them genuinely dims, and no amount of private success substitutes for being seen.",
        "There's real nobility underneath the shine. They protect people loudly and give without keeping ledgers. The mood of every room they're in becomes their personal responsibility. The shadow side of that same wiring is pride: criticism lands on them like a physical blow even when delivered gently, and they would rather disappear than be caught struggling.",
        "Their warmth is performance and truth at once. The version of themselves they show the world is polished, yes — but it's not fake. It's their best self, curated for an audience, and quietly they're always asking one question: do you see what I'm giving you?",
      ],
      drive: [
        "What motivates them: appreciation they can feel, loyalty they can trust, work they can put their name on proudly. What wounds deepest: being overlooked, upstaged, or made to beg for basic recognition. Attention isn't vanity for them — it's confirmation of existence.",
      ],
      monologue: [
        "\"Notice me. Not because I asked — because you wanted to.\"",
        "\"I'd rather burn bright than hide and be safe.\"",
      ],
    },
    moon: {
      core: [
        "Underneath, feelings run theatrical and huge: joys feel like festivals, hurts feel like operas, and neither registers honestly at half volume. Their emotional wellbeing is tied directly to feeling valued — a cold partner, a dismissive boss, a forgotten birthday can unravel them for days while they insist nothing's wrong.",
        "Pride manages the traffic: sadness gets dressed up as anger, need gets disguised as magnanimity ('fine, I'll just do it myself'), and tears are shed privately or never. The people closest to them learn to read the costume — when a Leo Moon suddenly goes quiet and gracious, that's usually when they're hurting most.",
      ],
      safe: [
        "public praise, not just private correction",
        "a partner who defends them in front of others, every time",
        "warmth on demand — affection withheld as punishment is devastating",
        "being someone's obvious first choice, out loud",
      ],
      hurt: [
        "When wounded, the mane comes out first: bigger presence, louder laughter, stories told at maximum volume — a one-person campaign to prove nothing can touch them. Meanwhile the actual injury heals slowly, because admitting it hurt feels like handing someone a weapon.",
        "Rejection by someone they loved genuinely destabilizes them. Expect late-night spirals of 'what's wrong with me' hidden behind flawless daytime composure.",
      ],
      talk: [
        "They talk about feelings easily once assured the listener won't use the material against them later. Vulnerability is expensive currency for this Moon; whoever receives it must handle it like something breakable and borrowed.",
      ],
      monologue: ["\"It didn't hurt. I just... have something in both eyes at once.\""],
    },
    rising: {
      core: [
        "First impressions arrive with good lighting: excellent posture, a genuine smile deployed easily, hair or presentation clearly considered. People instinctively look at them — there's a center-of-gravity quality that makes strangers assume leadership or at least assumes they know where the party is.",
      ],
      close: [
        "With trusted people, the audience requirement drops away: big kids at heart, generous to a fault, playful in ways strangers never get to see. Loyalty turns ceremonial — birthdays are events, victories are celebrated louder than the person's own.",
      ],
    },
    mercury: {
      core: [
        "Thinking runs warm and expressive: opinions arrive fully formed, stories improve slightly with each retelling, and ideas get pitched with natural showmanship. They think best out loud and with an audience — writing alone in silence produces maybe half of what talking does.",
        "Precision matters less than impact. They'll remember your point by its essence and miss your footnote numbers entirely — occasionally to their cost in arguments with detail people.",
      ],
      angryComm: [
        "Anger raises voice and stakes simultaneously: dramatic exits, grand pronouncements ('we're done here'), theatrical gestures. Twenty minutes later the storm has passed and they're confused why everyone else is still upset — the performance felt proportionate from inside.",
      ],
      openUp: [
        "Shut-down triggers: public correction, mockery of things they take seriously, eye-rolls. Open triggers: sincere compliments before disagreements, being taken seriously first and challenged second. Frame feedback inside loyalty — 'you're one of us, which is why I'm telling you' — and they can hear almost anything.",
      ],
      monologue: ["\"Amend that tone and we can keep talking.\""],
    },
    venus: {
      core: [
        "In love they bring cinema: bold courtship, planned surprises, public adoration, partners displayed proudly like trophies they intend to keep forever. Ordinary lukewarm connections don't hold them — they need a love story worth telling, and they need to be starring in it together.",
        "Under the glamour sits old-fashioned devotion. When genuinely committed, they are fiercely, publicly loyal — nobody flirts with their person twice without consequence — and they treat generosity as love's native tongue.",
      ],
      showLove: [
        "Affection shows through visibility: introductions made proudly, photos posted, achievements bragged about to anyone standing still. Also gifting — thoughtful, sometimes extravagant — and showing up looking immaculate because their partner deserves their best presentation.",
      ],
      pullAway: [
        "Interest dies when admiration stops flowing, when a partner competes instead of admires, or when love must be small and hidden. If they catch themselves shrinking to keep someone comfortable, resentment arrives fast and stays.",
      ],
      attach: [
        "Attachment forms through shared celebration — couples who hype each other become their religion. Vulnerability leaks around the edges of pride: they confess needs obliquely, dramatically, or at 2am, then pretend by morning it never happened.",
      ],
      monologue: ["\"Just tell me you're proud of me. That's all. That's the whole ask.\""],
    },
    mars: {
      core: [
        "Ambition wears a crown: they don't just want success, they want recognized success — the corner office with their name visible, applause included. Competition energizes; they perform best with an audience and a worthy rival.",
        "Persistence blends stubbornness with drama: they will not quit while anyone is watching, even when quitting is correct. Retreats happen only offstage.",
      ],
      anger: [
        "Everyday anger performs: raised voices, sweeping statements, doors closed at respectable volumes, brief sulks conducted visibly so observers ask what's wrong. Rarely dangerous, always memorable.",
      ],
      limit: [
        "At their absolute limit they exit with finality and theater: decisions announced like proclamations, grudges held with aristocratic patience, dignity preserved above reconciliation. The line they won't cross back over is humiliation — embarrass them publicly and forgiveness stops being available.",
      ],
      monologue: ["\"I can forgive almost anything except being made small.\""],
    },
  },

  // ────────────────────────────────────────────────────────── VIRGO
  virgo: {
    sun: {
      core: [
        "They see what's wrong immediately — the flaw in the plan, the typo in the report, the lie inside the compliment — and their first instinct is to fix it. This makes them indispensable and occasionally exhausting: care, for a Virgo Sun, sounds exactly like criticism, because improving things IS how they love them.",
        "Their identity runs on usefulness. Being needed, being relied upon, having concrete proof of competence — these feed something essential. Beneath it spins a relentless internal auditor comparing reality against how things should be, and they live at the center of that comparison, grading themselves hardest of all.",
        "Anxiety hides inside competence. What looks like calm organization is often active worry wearing a lanyard: if everything is managed perfectly, nothing bad happens. When something bad happens anyway, the system takes it personally.",
      ],
      drive: [
        "What motivates them: mastery, measurable progress, being the person whose work doesn't need checking. What breaks them: chaotic environments, unearned criticism, feeling replaceable, and praise so vague it means nothing ('great job!' — great how? which part?).",
      ],
      monologue: [
        "\"I noticed at 7am. I've been waiting all day to mention it politely.\"",
        "\"If I relax now, everything falls apart. Probably.\"",
      ],
    },
    moon: {
      core: [
        "Feelings get processed by analysis: emotions are named, examined, traced to sources, scheduled for resolution. Crying without understanding why feels intolerable — the feelings-first crowd mystifies them deeply. Useful heartbreak: give this Moon tasks during grief and watch relief spread.",
        "Worry operates as background process, never truly closing: health scares researched nightly, conversations replayed for errors, tomorrow's problems pre-lived today. Body keeps score regardless — jaw tension, upset stomachs, clenched sleep.",
      ],
      safe: [
        "clean, ordered environments — chaos literally elevates stress",
        "plans surviving longer than one week",
        "partners communicating changes BEFORE they happen",
        "reassurance with specifics rather than generic flourishes",
      ],
      hurt: [
        "Their hurt response is productive busy-ness: cleaning frantically, working late, organizing something irrelevant — avoidance dressed up as diligence. The emotion eventually surfaces through exhaustion, illness, or one sharp comment released months later.",
        "Criticism from people they admire bypasses every defense — they'll accept it completely, spiral overnight, then quietly change. Nobody realizes the feedback hit like surgery because the recovery happened alone.",
      ],
      talk: [
        "Emotions get discussed reluctantly, factually, and only after the situation is handled. Direct asks work wonders: 'How did that actually feel — not what happened, the feeling.' Given permission, they're honest to a degree that surprises even themselves.",
      ],
      monologue: ["\"I fine-tuned the plan at 3am. You're welcome in advance.\""],
    },
    rising: {
      core: [
        "First impressions read composed, observant, slightly reserved: clean presentation, measured speech, attention already scanning details. Strangers guess wrong consistently — mistaking carefulness for coldness while kindness loads beneath.",
      ],
      close: [
        "Inner circles discover the mischievous humor (unhinged about specifics) and caretaking done through logistics — medicine appears before it's requested, bags get repacked silently — plus worries spoken out loud only where they feel truly safe.",
      ],
    },
    mercury: {
      core: [
        "Precision is their native language: exact words matter, vagueness genuinely bothers them, and errors jump out at them from across the room. Their thinking works like a filter — information gets checked against standards, flaws get isolated, improvements get proposed. It looks like nitpicking from outside, but to them scrutiny is respect: they only examine carefully what they take seriously.",
        "They decide slowly and thoroughly, holding off on certainty until the evidence is complete. A fast, confident guess makes them quietly horrified.",
      ],
      angryComm: [
        "Anger comes out as escalating precision: colder sentences, sharper corrections, grievances itemized in chronological order. The volume never rises — the damage does. Sarcasm arrives only eventually, and it's rare enough to be alarming.",
      ],
      openUp: [
        "Sloppy thinking, emotional pressure instead of evidence, or being corrected mid-sentence seals the gate. What opens them: respecting their mind first — acknowledge the work they put in, give them time to reach conclusions, and disagree WITH reasons attached. Earn a real debate and honesty follows naturally.",
      ],
      monologue: ["\"Actually—\" starts ninety percent of personality."],
    },
    venus: {
      core: [
        "They love through improving life for their person: schedules optimized, meals upgraded, problems quietly solved before you even noticed them. Physical attraction grows out of respect for competence — watching someone do something masterfully is genuinely romantic to them.",
        "Their perfectionism sabotages the early stage: they're sizing candidates up while also wanting to surrender to them. People who need constant reassurance confuse them briefly; dependable people convince them permanently.",
      ],
      showLove: [
        "They show love by remembering your allergies without being told, reshaping whole evenings around your comfort, offering rides again and again without complaint, choosing practical gifts with exact precision, and keeping themselves attractive as a form of courtesy.",
      ],
      pullAway: [
        "What kills it: unreliability (a pattern of lateness), messes left behind on purpose, a mind that never changes over years, and criticism aimed at the effort behind their help. Carelessness toward things they built destroys the feeling fastest.",
      ],
      attach: [
        "Attachment deepens through accumulated small proofs: promises kept quietly, hard days remembered accurately. Trust starts provisional, gets tested constantly — and then gets granted shockingly completely. Once it's total, something flips: they can finally accept help, and vulnerability becomes a choice instead of a threat.",
      ],
      monologue: ["\"I made you a spreadsheet about our weekend. Romance IS logistics.\""],
    },
    mars: {
      core: [
        "Their work ethic is a metronome: steady output every single day, stamina that outlasts sprinters over a decade, standards they apply to themselves first and everyone else second. Their ambition builds systems rather than chasing spotlights.",
      ],
      anger: [
        "Irritation stays contained: a tightened jaw, noticeably sharper efficiency, sarcasm delivered bone-dry. They'd rather fix the thing that annoyed them than perform being angry about it — venting feels wasteful when solving is available.",
      ],
      limit: [
        "Their breaking point erupts as a three-word verdict after months of silent endurance: exits engineered cleanly, grievances documented thoroughly, relationships concluded like paperwork. The departure goes on the calendar; there's no audience.",
      ],
      monologue: ["\"I ran diagnostics all year. Results attached. Goodbye.\""],
    },
  },

  // ────────────────────────────────────────────────────────── LIBRA
  libra: {
    sun: {
      core: [
        "Their operating system is harmony: they read every room they enter, register tension before anyone names it, and quietly begin smoothing it. Libra Suns run a constant internal survey — is this fair? is everyone okay? does this feel balanced? — and the honest answer is that the survey never fully clocks out.",
        "Charm isn't a tactic for them; it's reflex. People confide in them, invite them, fall a little in love with them without trying. The hidden cost: they say yes to keep things pleasant while the real opinion waits unpaid backstage, and resentment builds politely until one day it doesn't.",
        "Deciding is genuinely hard — not indecisiveness as a joke, but an actual internal court that must weigh every option against fairness, other people's feelings, and aesthetics before ruling. Where others pick and move on, they convene panels.",
      ],
      drive: [
        "What motivates them: real partnership, peace that isn't fake, beauty in their surroundings, being genuinely liked rather than merely tolerated. What frightens them: being disliked specifically, having to own a conflict alone, and loneliness — which they experience more physically than most people realize.",
      ],
      monologue: [
        "\"Whatever works for you!\" (internally: nothing about this works for me)",
        "\"Why did choosing one thing cost me my whole evening?\"",
      ],
    },
    moon: {
      core: [
        "Emotionally, they regulate through other people. Company settles their nervous system; solitude drags. A bad mood heals faster with someone kind nearby, and good news only becomes real when there's someone to tell. This makes them wonderful company and secretly dependent — solo coping skills need deliberate training.",
        "Conflict physically affects them: stomach knots, lost sleep, hours replaying conversations at double speed. To prevent that feeling they will absorb unfair amounts, accommodate silently, and pay for peace with pieces of themselves until the math stops working.",
      ],
      safe: [
        "an atmosphere kept gentle even during disagreement",
        "decisions made WITH them, never around them",
        "affection that continues through fights — conflict plus loyalty",
        "someone noticing everything they swallowed to keep the peace",
      ],
      hurt: [
        "When hurt, they smile harder and function flawlessly while privately composing long arguments they'll never deliver. One cutting remark can occupy them for days, replayed in slow motion, scored for what it meant.",
        "The ending nobody sees coming: one day the mental ledger of imbalances finishes its audit, and they exit amicably, politely, completely. Partners report later that there was no warning — there were years of warnings, all delivered pleasantly.",
      ],
      talk: [
        "Feelings get discussed diplomatically: grievances softened into suggestions, truths edited for the listener's comfort. Learn their dialect — 'it's fine' usually means 'check on me today,' and 'no rush' means the clock already started.",
      ],
      monologue: ["\"Are we okay? Just say we're okay.\""],
    },
    rising: {
      core: [
        "First impressions charm immediately: an easy welcome, style that's considered but not loud, conversation started comfortably. Strangers read pleasantness as openness; in reality access costs extra — intimacy requires paperwork this exterior never mentions.",
      ],
      close: [
        "Trusted people discover the opinions hidden under diplomacy: surprisingly firm stances, joyful gossip sessions, preferences stated with almost aggressive decisiveness once safety is proven.",
      ],
    },
    mercury: {
      core: [
        "Their mind thinks relationally: every side gets heard before conclusions assemble, devil's advocacy included whether invited or not. Words come out well-built — persuasive, graceful, difficult messages pre-packaged to land soft.",
        "Deliberation can outlive usefulness. Sometimes weighing options IS avoidance — deciding gets deferred so long that deadlines decide instead, and they know exactly what they're doing while doing it.",
      ],
      angryComm: [
        "Anger stays grammatically impeccable: disappointment framed diplomatically, accusations structured reasonably, bridges burned behind flawless courtesy using passive voice exclusively. Nobody can quote anything weaponizable; everyone still ends up wounded.",
      ],
      openUp: [
        "Brutality closes them completely; genuine curiosity reopens the vault. Ask how they reached a conclusion — respectfully — and entire philosophies pour out. Directness lands fine AFTER courtesy has made introductions.",
      ],
      monologue: ["\"Both sides are valid. Both sides also can't have dinner together tonight.\""],
    },
    venus: {
      core: [
        "Romance is basically their religion: courtship savored properly, ambiance engineered deliberately, togetherness treated as art. Refinement attracts them — manners matter, effort shows, taste compatibility outweighs momentary sparks by wide margins.",
        "Relationships transform them visibly: partnered versions glow brighter than single ones, full stop. They believe in couplehood the way some people believe in careers, and being loved well organizes their whole life afterward.",
      ],
      showLove: [
        "Affection arrives curated: memorable date nights, apologies crafted beautifully, playlists sequenced like love letters, appearances upgraded for your benefit, conflicts resolved elegantly enough to preserve both people's dignity.",
      ],
      pullAway: [
        "Interest dies under sustained crudeness: chronic thoughtlessness, ugly public fights, contempt for the things they find beautiful. There's also a paradox trap — demand constant niceness while resolving nothing real, and eventually the politeness leaves with them.",
      ],
      attach: [
        "Attachment weaves partners directly into identity: breakups aren't endings here, they're existential revisions requiring complete self-rebranding afterward. Losing a relationship genuinely feels like losing a draft of themselves.",
      ],
      monologue: ["\"Just fight NICELY. That's the entire request, honestly.\""],
    },
    mars: {
      core: [
        "Strategy runs coalition-first: opponents persuaded individually before meetings, battles chosen carefully, victories arranged politically rather than seized violently. And there's an honest quirk — motivation requires decent conditions; squalor produces zero ambition whatsoever.",
      ],
      anger: [
        "Everyday irritation stays dressed: charming snark precisely deployed, tension dissolved through jokes, real fury compressed impressively behind diplomatic exteriors. Watch for sweetness suddenly becoming TOO smooth — pressure is building somewhere underneath.",
      ],
      limit: [
        "Ultimate limits produce the famous U-turn: the nicest person imaginable reversing position overnight, cleanly, permanently. Exits are polite, explanations brief, kindness intact — and finality absolute. Farewell notes read warmly; the decision inside them doesn't reopen.",
      ],
      monologue: ["\"I warned you nicely. Several times, actually.\""],
    },
  },

  // ────────────────────────────────────────────────────────── SCORPIO
  scorpio: {
    sun: {
      core: [
        "Intensity is their baseline setting. Casual doesn't compute; lukewarm physically bores them; anything they take seriously gets taken all the way or dropped completely. Scorpio Suns read underlayers by reflex — motives, loyalties, inconsistencies — and they track that information the way other people track finances.",
        "Privacy is sacred architecture: disclosure is controlled, access is rationed, and the same person who demands total honesty offers entry into themselves rarely and deliberately. People who earn their way in experience loyalty so absolute it's almost frightening — and people who betray that access are exiled without an appeals process.",
        "Their life story tends to contain a repeating motif: periodic death-and-rebirth. Identities get outgrown and rebuilt stronger, crises metabolize into armor and depth, and after enough cycles they stop fearing endings the way others do.",
      ],
      drive: [
        "What motivates them: truth found all the way to the bottom, bonds with no escape hatch, mysteries solved, power understood honestly rather than pretended away. What they fear most: betrayal from inside the walls, having vulnerability used as ammunition, and losing control of their own story.",
      ],
      monologue: [
        "\"I knew something was off. I always know eventually.\"",
        "\"All of me or nothing. The middle option doesn't survive here.\"",
      ],
    },
    moon: {
      core: [
        "Underneath, feelings run volcanic under arctic management: sensitivity measured on seismic scales, expression governed ruthlessly. Small slights register at full size — disrespect archives permanently, and resentment compounds quietly like interest nobody notices until the balance is huge.",
        "Trust operates like a checkpoint system: tests run unconsciously, loyalty gets verified repeatedly before belief stabilizes. And once someone has actually betrayed them, re-opening trust becomes archaeology — layers excavated carefully, innocence never fully restored.",
      ],
      safe: [
        "secrets that stay secret — one leak ends everything",
        "loyalty proven over and over through action",
        "a partner who defends the relationship unconditionally against outsiders",
        "honesty delivered straight, even when it's uncomfortable",
      ],
      hurt: [
        "When betrayed, they calculate exits strategically: evidence assembled patiently, punishments scaled precisely, doors sealed without warning announcements. The world sees performed indifference; privately the devastation runs far deeper and longer than anyone managing it will admit.",
        "Jealousy exists here and they know it: monitoring instincts activate under perceived threats while possessiveness disguises itself internally as protection. Naming it out loud to someone trustworthy is the only thing that keeps it from corroding the relationship from below.",
      ],
      talk: [
        "Their vulnerability only goes toward proven safe ears: they reveal the shallow layers first, watch the response closely, and price the deeper layers accordingly. Push them to open early and you guarantee they close instead.",
      ],
      monologue: ["\"Tell me again. Slower this time — details matter.\""],
    },
    rising: {
      core: [
        "First impressions land as intensity despite stillness: eye contact held seconds past comfortable, silences that communicate whole paragraphs, a presence that changes room chemistry noticeably. People react to them fast — drawn in or unsettled; indifference is rare.",
      ],
      close: [
        "Inner circles meet dry volcanic warmth: loyalty tattooed on permanently, humor pitched dark and surgical, protection extended with real teeth when anyone threatens their people.",
      ],
    },
    mercury: {
      core: [
        "Their thinking penetrates: statements get questioned beneath their surfaces, motives audited reflexively, patterns connected across years effortlessly. Small talk visibly drains them; exchange real secrets and connection establishes instantly.",
        "Suspicion isn't paranoia so much as a method — asking for proof calms them far more than casual reassurance does, which oddly makes them MORE suspicious. Transparency beats comforting words every time.",
      ],
      angryComm: [
        "Anger cools things down rather than heating them up: temperature drops, words selected surgically, silence stretches full of meaning. People around them fear explosions less than freezes — ice cuts cleaner than fire here.",
      ],
      openUp: [
        "Interrogation energy shuts their lips instantly; patient presence proves safety better than pressing questions. They open when the OTHER person volunteers something vulnerable first — disclosure here runs on trade: you go first, honestly, or it doesn't happen.",
      ],
      monologue: ["\"Your story changed twice since Tuesday. Run it again from the top.\""],
    },
    venus: {
      core: [
        "Love means fusion: half-measures genuinely offend them. Attraction locks onto people who carry mystery, emotional courage, and a willingness to go below the surface — people who stay at the shallow end quietly disqualify themselves.",
        "Passive partners baffle them completely; being desired half-heartedly frustrates them more than rejection would. Mutual obsession, fully returned, is the paradise condition this Venus was built for.",
      ],
      showLove: [
        "Their affection works like a contract signed in private: knowing glances only the two of you can read, secrets exchanged like vows, loyalty proven dramatically (problems mysteriously solved before you knew they existed), and physical intensity tuned to exactly one person.",
      ],
      pullAway: [
        "What kills it: careless public flirting, failing small loyalty tests, constant evasion, shallow answers repeated too many times. They're always estimating the odds of betrayal — too many failed readings and the whole thing ends abruptly, without a refund.",
      ],
      attach: [
        "Attachment merges souls and they know exactly how dangerous that is: possessive edges acknowledged honestly, jealousy monitored consciously, surrender negotiated inch by inch. Real love means exposure here — chosen vulnerability is their supreme act of courage.",
      ],
      monologue: ["\"You want all of me? Confirm you read the warning label first.\""],
    },
    mars: {
      core: [
        "Their willpower is geological: targets picked silently, campaigns planned as long games, resources gathered patiently until the position simply overwhelms resistance. 'Quit' left their vocabulary early in development.",
      ],
      anger: [
        "Daily irritation simmers instead of spilling: the intensity is contained at an industrial level, and expression gets rationed strategically. People who provoke them receive a stare that promises consequences — scheduled for later, detailed elsewhere.",
      ],
      limit: [
        "At their absolute limit comes the signature move: one precise strike aimed exactly where it hurts, then a calm departure with no second round offered. Their grudges mature like investments — over decades — and closure only arrives through time served.",
      ],
      monologue: ["\"Not today. But noted. Permanently.\""],
    },
  },
};
