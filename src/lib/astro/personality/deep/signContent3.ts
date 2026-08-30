// ===========================================================================
// SIGN CONTENT — Sagittarius, Capricorn, Aquarius, Pisces
// Authored in neutral plural voice; gv() converts pronouns per person.
// ===========================================================================

import type { SignChapter } from "./signTypes";

export const SIGNS_3: Record<string, SignChapter> = {
  // ────────────────────────────────────────────────────────── SAGITTARIUS
  sagittarius: {
    sun: {
      core: [
        "They are built around expansion — more places, more ideas, more experiences, more honest conversation. A Sagittarius Sun feels most like themselves when life has forward motion: a trip planned, a subject being learned, a belief being tested against something real. Stagnation doesn't bore them so much as it suffocates them.",
        "Their trademark is blunt honesty, usually delivered with a grin. They say the thing everyone thinks and nobody says, and they mean it kindly even when it stings. What they can't tolerate is pretense — people performing sophistication, relationships maintained on polite lies, conversations that go in circles to avoid the obvious.",
        "Under the adventurer exterior lives a genuine philosopher: they actually need their life to MEAN something. Every few years they audit everything — job, city, relationship, worldview — and woe to whatever fails the 'is this still true for me?' inspection. People who love them learn that periodic reinvention isn't rejection; it's maintenance.",
      ],
      drive: [
        "What motivates them: freedom of movement, big questions, laughter that comes from the belly, truth told without flinching. What frightens them: cages — visible or invisible. A controlling partner, a micromanaging boss, or a life of small repeated days will have them planning an escape they may not even consciously know they're planning.",
      ],
      monologue: [
        "\"If I have to shrink to fit here, I'm in the wrong place.\"",
        "\"Tell me the truth — I promise I'll survive it faster than you think.\"",
      ],
    },
    moon: {
      core: [
        "Emotionally, they metabolize feelings through motion: sadness sends them outdoors, anxiety gets walked off literally, and sitting alone with a heavy feeling until it dissolves is exactly what they refuse to do. Perspective is their medicine — zoom out far enough and most pain becomes an anecdote.",
        "They need emotional room. When someone clings or monitors their moods, this Moon feels the walls closing in within days, even when they love the person. Closeness works best when it's chosen freely every day rather than enforced by expectation.",
      ],
      safe: [
        "partners who don't interrogate their need for space",
        "humor allowed inside serious moments — laughter is how they exhale",
        "friends who take their bluntness as affection instead of attack",
        "the open road, in some form, always available",
      ],
      hurt: [
        "When hurt, they make it funny first. The wound gets converted into material — self-deprecating stories, sharp one-liners — and anyone watching closely can measure the pain by the punchline rate. Serious conversation about the actual injury happens only after the jokes stop working.",
        "Rejection sends them packing physically or mentally: new plans, new distractions, sometimes genuinely new cities. Grief catches up with them eventually, usually somewhere with no signal.",
      ],
      talk: [
        "They'll discuss feelings enthusiastically once, philosophically, at arm's length — the analysis of the emotion substitutes for the emotion itself. Getting them to stay in the raw moment requires trust that staying won't become drowning.",
      ],
      monologue: ["\"Walk with me and I'll tell you what's wrong. Don't make it a meeting.\""],
    },
    rising: {
      core: [
        "First impressions run big and easy: loud laugh, casual confidence, zero frozen posture. They treat strangers like friends from an unfinished story, asking big questions early and meaning it. Some find them hilarious; everyone finds them impossible to ignore.",
      ],
      close: [
        "With close people, the philosophical side takes over — wild hypotheticals, debates about meaning, plans sketched on napkins at midnight. Loyalty is generous but loose: they show up enormously, then vanish into projects for weeks without guilt.",
      ],
    },
    mercury: {
      core: [
        "Thinking runs big-picture by instinct: patterns before particulars, destinations before directions. They connect distant ideas fast, defending conclusions with infectious conviction — occasionally outpacing their own evidence. Facts that complicate the story arrive late and get absorbed grudgingly.",
        "Learning excites them when it's alive: travel, debate, teachers who perform. Dense manuals kill their soul; good stories teach them anything.",
      ],
      angryComm: [
        "Anger speaks in blunt declarations aimed at the biggest available target, foot-in-mouth consequences processed later. Arguments with them feel like invasions — sudden, sweeping, briefly unfair, then completely over.",
      ],
      openUp: [
        "Pedantry, lectures, and bureaucratic hedging flip them offline instantly. They open up for honesty played straight and humor that keeps pace — earn laughs while making a point and they'll consider anything.",
      ],
      monologue: ["\"Long story short— okay, it was long. Ask anyway.\""],
    },
    venus: {
      core: [
        "They fall for aliveness: someone with stories, appetite, and irreverence, ideally laughing at their jokes within minutes. Courtship is playful and fast — inside jokes on day two, road trips proposed within weeks. Predictable suitors politely lose.",
        "Commitment confuses them initially because forever sounds like a fence. Reframed as ongoing adventure WITH a favorite person rather than INSTEAD of freedom, devotion arrives surprisingly wholehearted.",
      ],
      showLove: [
        "Languages include trips booked spontaneously, brilliant observations gifted daily, ferocious defense when outsiders criticize their person, and teaching partners everything fascinating they've just discovered.",
      ],
      pullAway: [
        "Interest dies under surveillance: phones checked, whereabouts demanded, independence punished. Guilt-tripping works inversely — pressure produces distance with almost mathematical reliability. Boredom and repetition finish what control starts.",
      ],
      attach: [
        "Attachment is a walking contradiction: deeply devoted yet fiercely free, committed yet allergic to any language that sounds like ownership. Their vulnerability shows in the constraints they volunteer that nobody asked for — checking in voluntarily is their version of a ring.",
      ],
      monologue: ["\"Stay because you want to. I refuse to be anybody's cage, including yours.\""],
    },
    mars: {
      core: [
        "Their ambition needs big horizons: small targets don't switch them on. They work in inspired bursts — leap first, figure out the logistics mid-air, and somehow land on their feet more often than seems possible. Competition electrifies them; grinding routine sedates them dangerously.",
      ],
      anger: [
        "Everyday anger erupts loud and brief: colorful complaints, theatrical gestures, doors closed with flair. Ten minutes later they're genuinely cheerful again, leaving everyone else still processing a storm that already left the building.",
      ],
      limit: [
        "At their absolute limit the exit happens instantly and optimistically — bags packed before the announcement finishes, new opportunities chased without knowing the address. Faith carries them where planning would only slow them down.",
      ],
      monologue: ["\"Everything valuable I own fit in this bag. Watch this.\""],
    },
  },

  // ────────────────────────────────────────────────────────── CAPRICORN
  capricorn: {
    sun: {
      core: [
        "They are adults ahead of schedule — responsible young, tired early, successful eventually. Capricorn Suns measure life in structures built: careers climbed, families provided for, debts annihilated, reputations defended brick by brick. Respect, to them, is earned currency — and they intend to retire wealthy in it.",
        "Beneath the competence lives bone-dry wit most people miss entirely — the timing is surgical, the delivery flat, the accuracy devastating. They hold high standards for others largely because their standard for themselves never stops climbing. Mercy toward themselves arrived decades late, if it has arrived at all.",
        "Control matters deeply: chaos triggers instant organizing instincts. They treat feelings like security risks — acknowledged privately, managed quietly, mentioned sideways if ever. Age reverses the pattern beautifully: the second half of life grows noticeably warmer, softer, and funnier as the pressure to prove everything finally lets go.",
      ],
      drive: [
        "What motivates them: building things that last, providing protection measured practically, mastery confirmed by results. Fears: public failure, dependency, wasted years, being seen struggling. They'd rather disappear financially underwater than borrow visibly.",
      ],
      monologue: [
        "\"Rest is scheduled for 2047. Check back then.\"",
        "\"I don't need applause. Results speak when I allow them.\"",
      ],
    },
    moon: {
      core: [
        "Feelings arrive pre-inspected: sadness gets examined for usefulness before it's allowed out. Need feels like weakness to them, so needs get converted into tasks instantly — loneliness becomes extra work, grief becomes productivity. Everyone sees the composure win awards; nobody sees the midnight debriefs it costs.",
        "Their care shows up as practical help: careers pushed forward FOR the family's security, problems solved before the person they love even knows they exist, steady presence delivered no matter what their inner weather looks like. Their emotional vocabulary is different from people who say 'I love you' — theirs says 'it's handled' instead.",
      ],
      safe: [
        "financial order surviving surprises",
        "competence respected rather than exploited",
        "partners protecting vulnerable moments from audiences",
        "traditions repeating predictably year over year",
      ],
      hurt: [
        "Hurt makes their spine stiffer, not softer: workload doubles, sentences shorten, and the vulnerable side locks down completely. Ask directly and you'll get 'fine' forever. Notice the behavior change instead — that buys more trust than words ever could.",
        "Rejection gets channeled into achievement: heartbreak converts into credentials earned, gym hours logged aggressively, and bank statements grown slowly as a weapon against grief.",
      ],
      talk: [
        "Emotion conversations run short and efficient: they give you the facts and the analysis, and the feelings stay implied. Sit beside them during an activity — shoulder-to-shoulder talking unlocks confessions that face-to-face conversations never will.",
      ],
      monologue: ["\"Feelings noted. Filed. Scheduled for later. Moving on.\""],
    },
    rising: {
      core: [
        "First impressions project calm authority: dressed on purpose, speaking economically, radiating responsibility without saying a word. Strangers hand them leadership roles by instinct — looking capable is very convincing.",
      ],
      close: [
        "Trusted circles get the sarcastic stand-up show nobody saw coming: humor that cuts clean, flawless impressions, and warmth that arrives dressed as logistics — repairs finished, rides arranged, emergencies funded anonymously.",
      ],
    },
    mercury: {
      core: [
        "They process information strategically: usefulness first. They calculate what a conversation is for before investing in it, and they enter arguments only when they expect to win. Their tolerance for small talk is strictly limited — purposeless chat visibly drains their patience.",
        "Planning is practically a religion for them: backups nested at least three layers deep, timelines padded realistically, optimism checked against past evidence before it's allowed in.",
      ],
      angryComm: [
        "Anger barely shows on the outside: displeasure comes through increased formality, sharper shortness, meetings cancelled coldly. Real fury stays nearly silent — which is what makes it dangerous. Their departures never come with an announcement.",
      ],
      openUp: [
        "Wasted hours, emotional ambushes, and disorganized pitches close them instantly. What opens them: come prepared. State the agenda up front, bring the evidence, respect their time. To them, efficiency IS courtesy.",
      ],
      monologue: ["\"Get to the point. Politely. Immediately.\""],
    },
    venus: {
      core: [
        "Love gets checked carefully before commitment: they verify stability, assess where your life is heading, and stress-test character across seasons only patience can provide. Casual romance wastes their time, and it shows. Their courtship runs so seriously it resembles an interview the other person rarely realizes is happening.",
        "Once committed, devotion runs on a lifetime scale: anniversaries remembered to the day, futures planned together, sacrifices made silently across decades. Their romance speaks in achievements — a home bought and named fondly, an education funded quietly, a retirement designed for two.",
      ],
      showLove: [
        "They show love by eliminating problems before you find them, keeping up standards in public and private, giving practical gifts chosen to last, and defending your reputation everywhere — even when you're not in the room.",
      ],
      pullAway: [
        "What kills it: ongoing money recklessness, ambition abandoned for good, manufactured drama that demands attention, and private disrespect. To them, chronic instability is a worse deal than cheating.",
      ],
      attach: [
        "Attachment verifies slowly, then holds forever: it takes about five years of proof before the full surrender. Once they trust completely, they admit a dependence privately that shocks even them — being that stable requires exactly one person who gets to see the unguarded version.",
      ],
      monologue: ["\"Love is a portfolio. I only invest long.\""],
    },
    mars: {
      core: [
        "Their drive runs like industry: goals broken into systems, progress compounding reliably and boringly, obstacles absorbed with the patience of a total war. Over a ten-year window, their persistence regularly beats rivals who are more brilliant.",
      ],
      anger: [
        "Daily irritation gets expressed economically: one raised eyebrow saying whole paragraphs, sighs deployed strategically, frustration converted into fuel instead of vented into the air.",
      ],
      limit: [
        "At their absolute limit they resign formally: grievances documented and dated, exits executed clean and complete, bridges preserved professionally even while leaving forever. The nuclear option almost never detonates — a strategic withdrawal does plenty of damage on its own.",
      ],
      monologue: ["\"Final notice delivered. References available upon request.\""],
    },
  },

  // ────────────────────────────────────────────────────────── AQUARIUS
  aquarius: {
    sun: {
      core: [
        "They watch humanity the way brilliant anthropologists do — participating warmly while keeping one mental step of observation that nobody quite closes. Feelings get acknowledged almost scientifically first ('interesting — anger again') and only reach the body later, if at all.",
        "Distinctiveness is non-negotiable. Systems demanding conformity meet creative resistance; rules get questioned philosophically as a default; authorities are audited for legitimacy before being respected. They'll join groups — but the group has to deserve membership, conceptually, or participation quietly ends.",
        "Warmth shows up unpredictably by normal standards: strangers receive radical acceptance instantly (their weirdness celebrated with genuine curiosity), while intimates discover affection expressed structurally — problems solved like an engineer, freedoms defended like a lawyer, loyalty proven over quiet decades rather than performed dramatically.",
      ],
      drive: [
        "What motivates them: causes they actually believe in, minds changed honestly rather than won rhetorically, futures made verifiably better. What irritates them into rebellion: mandatory small talk, performed emotion, punishment of originality. Conformity pressure doesn't frighten them — it activates them.",
      ],
      monologue: [
        "\"That feeling? Filed under 'data.' Fascinating species.\"",
        "\"'Normal' is historically the problem.\"",
      ],
    },
    moon: {
      core: [
        "Emotions arrive on a delay here: the mind registers the feeling first — sometimes hours or weeks before it shows up as an actual sensation, usually at an inconvenient moment. The detachment isn't coldness; it's how the system survives. And saying feelings out loud can feel almost physically awkward.",
        "Closeness gets negotiated to custom specs: they define intimacy on their own terms, renegotiating the traditional relationship script clause by clause. Partners who need conventional romance frustrate them forever; people willing to build a custom bond thrive remarkably.",
      ],
      safe: [
        "space that's preserved without having to be defended",
        "ideas entertained respectfully no matter how unconventional",
        "emotional demands issued rarely, explicitly, and kindly",
        "friendships that survive months of silence unbruised",
      ],
      hurt: [
        "Hurt gets processed logically before it gets processed at all: the injury gets taken apart to find how it happened, who caused it, and what to guard against next time. The feeling itself surfaces days later through broken sleep or unexplained irritation — and the connection between the two rarely gets said out loud.",
        "When overwhelmed, they retreat to process alone. Withdrawal means overload, not rejection — and pursuing them mid-retreat reliably extends the timeline instead of shortening it.",
      ],
      talk: [
        "Feeling-discussions run clinical: they describe symptoms like data, welcome analysis eagerly, and receive open comfort awkwardly. What works best is companionship for their mind with zero pressure to perform an emotion on schedule.",
      ],
      monologue: ["\"Processing delay is not absence. Receipts will come.\""],
    },
    rising: {
      core: [
        "First impressions land as interesting-fast: unusual style choices that look deliberate rather than accidental, unexpected conversation openers, and energy that isn't aggressive or eager — just tuned to a different frequency, and memorable because of it.",
      ],
      close: [
        "Inner circles get the full loyal-weirdness: conspiracy theories debated joyfully, human behavior narrated out loud like a nature documentary, and friendships that survive months of silence — conversations resume mid-sentence after six months apart.",
      ],
    },
    mercury: {
      core: [
        "Their mind runs pattern-recognition at speed: connections spotted across unrelated domains routinely, contrarian positions built from honest analysis rather than contrarianism, groupthink resisted reflexively even when the group happens to be right for once.",
        "Problem-solving starts by reframing: questions restructured sideways until solutions appear that were previously hidden-in-plain-sight. Progress matters absolutely; tradition justifies nothing by arguing its own duration.",
      ],
      angryComm: [
        "Anger delivers logical disembowelment: arguments dismantled point-by-point in a level voice, cruelty achievable accidentally through pure accuracy delivered at surgical timing. Voices never need raising here — correctness wounds deeper than volume.",
      ],
      openUp: [
        "Emotional flooding shuts their system down completely; novelty switches it back on instantly. Debate earnestly — evidence welcome, condescension banned — and their position can shift genuinely. Without respect shown first, pride defends even indefensible ground.",
      ],
      monologue: ["\"You're describing feelings. I'm hearing interesting hypotheses.\""],
    },
    venus: {
      core: [
        "Attraction routes through friendship almost every time: minds connect long before bodies notice each other, and the conversion catches everyone involved by surprise. Intellectual chemistry functions as the primary aphrodisiac; conventional beauty registers as pleasant bonus tier.",
        "Romance refuses default scripts: anniversaries improvised, relationships defined bilaterally from scratch, jealousy discussed philosophically and discouraged practically. Possessive partners exit quickly — surveillance-flavored love reads as a category error here.",
      ],
      showLove: [
        "Affection looks like introductions to entire universes — people, music, ideas treasured and shared immediately; freedoms championed specifically for the partner; quirks accommodated structurally rather than tolerated temporarily; being consulted on every decision, major or minor.",
      ],
      pullAway: [
        "Interest dies under demands for constant emotional performance, jealousy policing of friendships, and requirements to appear 'normal' publicly. They don't mind change — they mind unilateral change: consultation covers everything, mutuality defines everything.",
      ],
      attach: [
        "Attachment builds slowly and then holds for decades: trust stacks up through kept small promises, commitment hardens quietly until one day it's carrying real weight. Their love expressions get custom-built for one person — nobody outside can translate them, which is exactly the intended effect.",
      ],
      monologue: ["\"I showed affection my way. Decode whenever you manage it.\""],
    },
    mars: {
      core: [
        "Energy deploys toward causes: personal advancement interests moderately, but movements they believe in unlock maximum output. Innovation drives effort best when it involves officially sanctioned rule-breaking of some kind.",
      ],
      anger: [
        "Daily irritation stays civil and detached: disagreement gets voiced at the level of principle, provocateurs get studied with curiosity more than heat, and engagement is withheld on purpose until the stakes are actually worth it.",
      ],
      limit: [
        "At their absolute limit they walk out on principle: teams left with minimal announcement, causes switched overnight, bridges left standing but never used again. Revenge bores them; reinvention is the only thing that keeps their interest.",
      ],
      monologue: ["\"I disagreed since inception. Leaving now happened to be convenient.\""],
    },
  },

  // ────────────────────────────────────────────────────────── PISCES
  pisces: {
    sun: {
      core: [
        "They experience life without fully closed boundaries: atmospheres absorbed, other people's moods caught like weather, art capable of rearranging identity. Pisces Suns swim between worlds habitually — imagination often feels truer than spreadsheets, empathy extends to strangers on principle, and logic gets consulted last and politely.",
        "Compassion is operational, not decorative: suffering gets noticed everywhere and helped reflexively — financially, emotionally, impractically. Escapism shadows the same gift: overwhelm exits via sleep, daydreams, playlists, substances, anything that turns the volume down; boundaries dissolve approximately whenever someone asks nicely while hurting.",
        "Gentleness gets misread as weakness, at the observer's eventual cost: their resilience runs ocean-floor deep. Pressures survived invisibly, recoveries done silently, forgiveness granted on a scale nobody expects. Strength speaks softly and natively in this chart.",
      ],
      drive: [
        "What motivates them: meaning felt transcendentally, beauty created or witnessed, eased suffering wherever detected, love experienced as genuine dissolution of separateness. What breaks them: chronic harshness — cynical environments, confrontation demanded daily, empathy systematically exploited until reserves go visibly bankrupt.",
      ],
      monologue: [
        "\"I felt the room change before anyone said anything. That counts as knowing.\"",
        "\"One more hour of pretending the world is only hard edges and I'll need all evening to recover.\"",
      ],
    },
    moon: {
      core: [
        "They are emotional X-ray machines disguised as gentle company: hidden motives get detected instantly, sadness gets mapped across the whole room, lies get tasted immediately. The line between self and other blurs dangerously — they'll spend a weekend carrying their partner's work stress in their own body without ever finding out where it came from.",
        "Retreat is real medicine here, not flakiness: solitude restores an overloaded system, alone-time counts as preventive health, and making them justify needing it insults a system that genuinely requires zero justification.",
      ],
      safe: [
        "a home environment guaranteed soft",
        "creativity supported materially AND emotionally",
        "partners who handle the harsh negotiations externally",
        "feelings accepted without interrogation penalties",
      ],
      hurt: [
        "When wounded, they evaporate: they keep agreeing on the surface while the soul temporarily checks out, showing up in body only. The conflict-avoidance costs them honesty they never get back, and the debt eventually comes due all at once.",
        "Raised voices register disproportionately: one shouting match echoes in their head for weeks, sleep measurably suffers, and elaborate avoidance strategies get built — unless safety is restored quickly and visibly.",
      ],
      talk: [
        "Here's the paradox: they'll discuss feelings openly, fluently, and beautifully — the line between sharing and oversharing just never got installed. Direct questions work wonders suddenly. A little structure goes a shockingly long way with this fluid chart.",
      ],
      monologue: ["\"Ask me directly and I'll tell you everything. Vague vibes make me hide.\""],
    },
    rising: {
      core: [
        "First impressions arrive watercolor-soft: the gaze is gentle and slightly unfocused, the presence calming in a way you can feel, and strangers confess secrets unprompted with suspicious regularity. The mind-reader reputation is earned, not imagined.",
      ],
      close: [
        "Intimates meet the artist-genius revealed gradually: elaborate inner worlds built in private, empathy practiced seriously and daily, and mutual escape plans drafted once the relationship finally names what it really needs.",
      ],
    },
    mercury: {
      core: [
        "Their thinking swims intuitively: answers arrive already finished, and the explanation gets reconstructed afterward only if someone asks. Logic gets adopted only when it feels emotionally true — ideas enter through feeling-compatible doors first and through evidence second, curiously but consistently.",
        "Focus runs in two modes only: legendary artistic absorption OR fog so thick nothing gets done — and which mode depends entirely on how fascinating the topic is to them. There is no middle setting. Stop checking for one.",
      ],
      angryComm: [
        "Their anger follows a tsunami pattern: an endless quiet build-up, then one release wave wildly bigger than anyone expected. More often the hurt just evaporates sideways — conflict gets skipped at nearly all costs; it comes factory-installed in this chart.",
      ],
      openUp: [
        "Precision questioning paralyzes them completely; an invitation to tell it as a story unlocks extraordinary fluency. A warning for the listener, though: ears ready for that depth get rewarded with devotion that runs lifetime lengths.",
      ],
      monologue: ["\"I knew before you told me. But confirming counts differently.\""],
    },
    venus: {
      core: [
        "Love operates close to religion: they pursue merging with transcendent intent, and they idealize the beloved sincerely — right up until reality sends its editing invoice. Attraction centers on soul-recognition; love-at-first-sight gets genuinely, completely believed here.",
        "Sacrifice is their fluent love language: their own needs surrendered to their partner's over and over, rescue fantasies carried out at real cost, and romanticism kept alive defiantly against a cynical era. The healthy correction is remembering that they also exist:",
      ],
      showLove: [
        "Affection arrives as art: playlists sequenced like soul-maps, poems written on random occasions, dreams shared before dawn at maximum openness, and forgiveness extended far past a historically reasonable offense count.",
      ],
      pullAway: [
        "What kills it: mockery aimed at tenderness, faithfulness being checked under suspicion, creativity dismissed as a cute hobby. And idealization crashes hurt the hardest — the moment the beloved shows up real and crumbly, a grief phase begins that frequently ends the relationship, almost always preventably.",
      ],
      attach: [
        "Attachment merges past comfortable boundary lines: the separation anxiety is spiritually real here, and codependency risk has to be managed on purpose, out loud. They will believe redemption stories about the people they love — stubbornly, heartbreakingly, for years at a time.",
      ],
      monologue: ["\"Loving you feels like remembering a song I haven't heard yet.\""],
    },
    mars: {
      core: [
        "Their desire swims in indirect currents: wants sensed half-knowingly, pursuit done by shaping the atmosphere rather than by direct attack. Competition usually registers as distaste — given the choice, they always pick cooperation over contest.",
      ],
      anger: [
        "Everyday anger goes underground: resentments pile up silently for months, the body starts keeping score with headaches, and aggression leaks out passively — plans conveniently forgotten, lateness spread evenly and forever.",
      ],
      limit: [
        "At their absolute limit comes the vanishing act: contact stops clean, explanations get forfeited forever, and closure becomes your own homework. A door-slam would be too dramatic for this aesthetic — silence says finality better than any argument could.",
      ],
      monologue: ["\"Fighting your whole family stopped appealing ages ago. I'm sinking quieter now.\""],
    },
  },
};
