// ===========================================================================
// SIGN CONTENT — Aries, Taurus, Gemini, Cancer
// Authored in neutral plural voice; gv() converts pronouns per person.
// ===========================================================================

import type { SignChapter } from "./signTypes";

export const SIGNS_1: Record<string, SignChapter> = {
  // ────────────────────────────────────────────────────────── ARIES
  aries: {
    sun: {
      core: [
        "They are wired to move first and think second — not because they're careless, but because for them, being alive feels like being in motion. The fastest way to depress them is a stretch of days where nothing is being started, nothing is being won, and no one needs them to be brave. Their identity gets built through doing: they find out who they are by watching what they do under pressure, not by reflecting on it.",
        "There's a real directness here that people either love or can't handle. When an Aries Sun walks into a situation, you don't have to guess where they stand — they'll tell you, usually before you ask. The downside is that this honesty arrives unfiltered. They can start fires with a sentence and then genuinely not understand why anyone is still smoking an hour later.",
        "Underneath the confidence is something most people miss: a childlike need for things to matter right now. They would rather fail spectacularly at something real than succeed quietly at something boring. When life goes stale, they create friction on purpose — a new fight, a new plan, a new mountain — just to feel their own pulse again.",
      ],
      drive: [
        "What motivates them is aliveness itself: the starting gun, the fresh challenge, someone telling them it can't be done. What terrifies them, more than failure, is being slowed down — micromanaged, made to wait, or asked to repeat themselves. Their patience is a finite resource and everyone around them learns exactly how big it is.",
      ],
      monologue: [
        "\"If I have to explain myself one more time, I'm leaving.\"",
        "\"Better to move fast and apologize later than sit here waiting for permission.\"",
      ],
    },
    moon: {
      core: [
        "Emotionally, they run hot and fast: feelings arrive at full volume the moment they're triggered, and they expect to deal with them immediately. Sitting with an emotion for three days feels wrong to their wiring — they'd rather name it, vent it, or act it out physically (gym, drive, cleaning furiously) than let it sit in their chest. Anger is usually just hurt wearing armor.",
        "Their emotional processing has almost no delay between input and expression. What others experience as 'blowing up' is usually them simply showing the feeling they assume everyone else is also having. Once discharged, it genuinely clears — which is why they're often baffled when other people hold grudges about things they consider finished.",
      ],
      safe: [
        "straight talk — hearing what's wrong now instead of in three weeks",
        "being allowed to burn off feelings through their body rather than conversation",
        "a partner or friend who doesn't flinch when their volume rises",
        "knowing the relationship survives a bad day intact",
      ],
      hurt: [
        "When they're actually wounded — not angry but hurt — they go strange: louder, busier, aggressively fine. They will pick fights about small things because the real thing feels too naked to say out loud. What reaches them is directness delivered without theatrics: 'You hurt me, here's where.' That lands in seconds.",
        "Rejection hits their pride first and their heart second. In public they brush it off instantly — 'good riddance' energy — while privately replaying it during every quiet moment for weeks.",
      ],
      talk: [
        "They talk about feelings only in motion: mid-walk, mid-drive, mid-task. Sit them down for a Formal Conversation About Feelings and they'll get restless within minutes — not because they don't care, but because stillness makes the emotion feel bigger than they want it to be.",
      ],
      monologue: ["\"Say it straight. I can take it. Vagueness is worse than bad news.\""],
    },
    rising: {
      core: [
        "The first impression is energy. They enter like they've been walking faster than everyone else in the hallway — direct eye contact, no small warm-up phase, handshake decisions. People read them as confident even when they're internally uncertain, which is one of the useful deceptions of this Rising: the body broadcasts readiness regardless of mood.",
      ],
      close: [
        "Close friends see the reverse of the sharp entrance: someone oddly generous who defends their people fast, forgets birthdays, apologizes bluntly ('I was out of line'), and moves on. Strangers get efficiency; friends get fierce loyalty delivered between interruptions.",
      ],
    },
    mercury: {
      core: [
        "Their mind is a sprinter: rapid conclusions, instinct-first judgments, and visible impatience with long explanations. They often know the answer before the question fully lands — and they're frequently right, which reinforces the habit of trusting reflex over analysis. Deliberate thinkers exhaust them; they interpret thoroughness as stalling.",
        "They decide by asking 'what's the play?' — options, action, consequences — rather than 'what does this mean?' This makes them excellent in emergencies and occasionally reckless with things that deserved ten more minutes of thought.",
      ],
      angryComm: [
        "When angry, words come out at full velocity and full voltage — sharper than intended, sometimes hitting below the belt. They rarely mean half of it, but the listener rarely knows that. Afterward they patch things fast ('ok that was harsh') while the other person is still bleeding a little.",
      ],
      openUp: [
        "They shut down around lecturing, condescending tones, and long warm-ups before the point. 'Before I tell you why you're wrong—' guarantees they've stopped listening already. What opens them: short and direct, respect for their point, and people who match their pace. If someone says the true thing plainly, they'll admit it honestly and adjust.",
      ],
      monologue: ["\"Just give me the headline. I'll ask if I want details.\""],
    },
    venus: {
      core: [
        "In love, they are the pursuer archetype — drawn to spark, challenge, and unmistakable mutual heat. Subtle courtship doesn't compute; if interest isn't obvious within a few interactions, their attention evaporates. Once fired, though, pursuit is bold, physical, and refreshingly unambiguous: they show up, they make plans, they say the thing.",
        "Attraction lives in aliveness. A partner who matches their tempo — quick banter, honest appetite, willingness to be a little reckless — holds them far better than a careful checklist person ever could.",
      ],
      showLove: [
        "Affection shows as protection and action: defending their partner in rooms they aren't in, arranging the adventure, handling the problem before being asked. Words of devotion arrive suddenly and sincerely — never poetic, always true.",
      ],
      pullAway: [
        "What kills their interest: hesitation dressed as mystery, games, emotional fog where nothing is ever decided. They also cool fast toward partners who need constant proof — reassurance loops read as quicksand. Boredom is fatal; predictable weekends breed wandering eyes.",
      ],
      attach: [
        "Attachment forms fast and hot — sometimes too fast. The vulnerable part they hide: once genuinely bonded, they fear rejection more than they'd ever admit, which is why breakups tend to become races to who-ends-it-first. Beneath the bravado, losing their person genuinely wrecks them, alone, where nobody sees.",
      ],
      monologue: ["\"If you want me, act like it.\""],
    },
    mars: {
      core: [
        "Desire runs through them like current: immediate appetite, competitive edge, zero comfort with waiting. When they want something — a job, a person, a win — they attack directly and visibly. They would rather lose publicly than win passively. Persistence isn't grinding endurance; it's repeated fresh attempts, each launched with the same ignition.",
        "Competition brings out their best manners and their worst ones simultaneously: strong rivals make them sharper; weak ones make them careless.",
      ],
      anger: [
        "Everyday anger expresses instantly and fades fast: raised voice, animated hands, blunt verdicts — then it's genuinely over, often within the hour, followed by hunger or laughter as if nothing happened. The people around them needed two hours to recover from what took them ten minutes.",
      ],
      limit: [
        "At their true limit, there's no slow build — just detonation, then departure. The scary version isn't volume, it's finality: doors closed cleanly, keys left behind, a decision announced mid-stride. Because they forgive themselves quickly, they expect the same grace after the blast; people who can't absorb that pace exit their life early.",
      ],
      monologue: ["\"I said what I said. Moving on.\""],
    },
  },

  // ────────────────────────────────────────────────────────── TAURUS
  taurus: {
    sun: {
      core: [
        "Their identity is built on stability they created — savings, skills, home, reliability, a body maintained like property. For a Taurus Sun, self-respect is extremely literal: Am I okay? Do my bills work? Is my space comfortable? Can I deliver what I promised? Internal answers come from those concrete checks, not from praise.",
        "Others experience them as calm and immovable. Usually that's accurate: they resist change until given real evidence and time to adjust. The pattern reads as stubbornness — fair critique — but it has a hidden logic. They commit deeply once convinced, so reversal carries real cost; choosing carefully is how they avoid future breakage.",
        "Comfort matters to them unapologetically: good food, soft textures, familiar routines, steady company. It looks simple, but it's how they regulate their nervous system — luxury tastes aside, routine is genuinely their medication.",
      ],
      drive: [
        "What motivates them: building tangible value that lasts — money saved, meals cooked, gardens planted, loyalty proven across years. What frightens them: sudden forced transitions — the layoff, the breakup text, the landlord selling. Even good surprises cost them sleep; their nervous system prizes predictability.",
      ],
      monologue: [
        "\"Don't rush me. Rushing breaks things.\"",
        "\"I worked hard for this peace. Nobody is taking it.\"",
      ],
    },
    moon: {
      core: [
        "Emotionally, they operate like heavy machinery: slow to accelerate, impossible to stop once moving. Feelings develop gradually, then root deep — including grievances. They process privately through the body: cooking, sleeping, gardening, touch, long baths. Talking an emotion to death sounds exhausting; feeding and resting it works better.",
        "Change is their trigger word. Even welcome change asks them to reorganize internal furniture, and that costs real energy. Give warning, steps, and time to sit with transitions, and they adapt eventually. Spring sudden transformation on them, and they dig in purely out of self-defense.",
      ],
      safe: [
        "routines that don't randomly disappear",
        "physical comfort — food, warmth, unhurried touch",
        "partners whose Tuesday behavior matches their Saturday promises",
        "notice before changes: days, not minutes",
      ],
      hurt: [
        "Hurt doesn't explode; it settles. First response is near-silence plus measured normalcy — dinner cooked, curtains closed, texts answered in shortest possible form. Beneath that stillness, hurt consolidates into a grudge with its own filing system. They may forgive formally; forgetting is different machinery.",
        "Rejection wounds slowly and deeply. Expect months of 'I'm fine' running beside real grief nobody gets to watch.",
      ],
      talk: [
        "About feelings generally: minimal until trust is absolute, and even then sparing and factual ('that bothered me'). Melodrama embarrasses them. What actually helps them open: shoulder-to-shoulder settings — car rides, walks, cooking together — where silence is allowed and talking optional.",
      ],
      monologue: ["\"I just need everything to stay normal for one minute.\""],
    },
    rising: {
      core: [
        "First impression: grounded and unhurried — relaxed posture, level voice, no nervous fidgeting. People approach them for stability the way strangers ask locals for directions: something about them signals they know where things are. They let rooms set the pace and never perform.",
      ],
      close: [
        "With close people, dry humor surfaces along with surprising sensuality — food rituals, curated playlists, comfortable silences treated as intimacy. New acquaintances find them reserved; old friends know the warmth takes longer to load but stays loaded permanently.",
      ],
    },
    mercury: {
      core: [
        "They think in steps: gather the facts, weigh them, check them, conclude. Their opinions form slowly and change even more slowly — you convince them by showing real results, not by talking. Big promises bounce off them; examples, receipts, and trial runs land.",
        "They learn best through repetition and practice, not inspiration. Where quick minds see slow typing, they see fewer errors and conclusions worth defending.",
      ],
      angryComm: [
        "Anger makes them terse: short sentences, flat tone, longer gaps. Loud confrontation embarrasses them — instead of fighting, they pull into fewer and fewer words each day until talking to them feels like talking to a customer service agent. Catch it early, because silence that lasts more than a few days means something serious broke.",
      ],
      openUp: [
        "Pressure closes the door — deadlines around emotional topics, ultimatums, debate-style arguing. What opens them: patience without a condescending tone, steady presence, and letting them reach conclusions out loud. Calm, logical delivery works even for tender subjects, because it matches how they think.",
      ],
      monologue: ["\"Let me think about it\" — and meaning it literally."],
    },
    venus: {
      core: [
        "Loving style: loyal, sensual, patient, possessive at the edges. Attraction builds through physical comfort — proximity, shared meals, unhurried touch — not dramatic gestures. Grand romantic theater embarrasses; someone reliable with excellent taste and decent manners captivates within months.",
        "Once committed, staying becomes identity: anniversaries kept, favorites memorized, steady presence year after year. There's real gravity in affection once attached — partners describe it as feeling chosen daily without announcements.",
      ],
      showLove: [
        "They show love by cooking your favorite meals, giving quality gifts (well chosen, never flashy), remembering things you mentioned months ago, building a home worth staying inside, and ordinary-evening physical closeness.",
      ],
      pullAway: [
        "Their interest dies around instability — mixed signals, hot-and-cold games, money chaos, endless drama. It also dies from being rushed: pushing for declarations too early, rushing physical pace, pressuring decisions before they're ready. Being hurried pushes them away exactly when someone is trying to charm them.",
      ],
      attach: [
        "Attachment builds slowly, then sets almost like concrete. Real vulnerability comes late but it's genuine — fears they've never said out loud, family stories, worries they don't share anywhere else. One honest warning: attachment comes with territorial instincts. They stake quiet claims and can resent rivals for their partner's attention. With real trust, that possessive edge softens into protective warmth.",
      ],
      monologue: ["\"We're not moving fast. We're moving properly.\""],
    },
    mars: {
      core: [
        "Their pursuit works like a marathon, not a sprint: pick the target, move steadily, refuse distraction. Repeated bursts of urgency don't impress them — steady consistency is what actually gets things done. Slow projects suit them perfectly: bodies built over years, businesses grown bit by bit, debts paid off for good. Their momentum is like a freight train: brutal to start, impossible to stop.",
      ],
      anger: [
        "Everyday irritation shows as a measurable slowdown — heavier footsteps, shorter answers, no jokes. Real explosions are rare but unforgettable: things might get thrown, walls might get hit, and the volume surprises everyone, including them. People who witness it know they've entered rare territory.",
      ],
      limit: [
        "When they hit their real limit, it ends things permanently. Their long patience finishes in a flat announcement, packed bags, and a bank account split overnight. The slowest person in the room makes the least reversible decisions. The warnings came for years; the exhaustion simply arrived last.",
      ],
      monologue: ["\"You had years. You got years.\""],
    },
  },

  // ────────────────────────────────────────────────────────── GEMINI
  gemini: {
    sun: {
      core: [
        "Their identity lives in their curiosity. A Gemini Sun understands themselves by collecting experiences, perspectives, jokes, facts, half-started hobbies — and remixing them constantly. Possibility interests them more than stability; a life stuck on repeat feels like slowly shutting down.",
        "Talking is how they process life. Conversations, texting, writing, arguing — saying thoughts out loud is how they understand what they feel. They fill silences by narrating whatever just happened. They run on new information and interesting people; boredom genuinely destabilizes them rather than just annoying them.",
        "They're comfortable holding contradictions: fiercely loyal yet flirtatious, present yet distracted, deep yet always ready with a joke. They do best when juggling several things at once. Sameness doesn't relax them — it slowly wears them down.",
      ],
      drive: [
        "What motivates them: new information, interesting people, unanswered questions, and permission to change direction. What frightens them: trapped routine, being reduced to one label ('you're just flighty'), and conversations that repeat instead of discovering anything. Their real fear isn't variety — it's being judged as shallow when their mind is actually deep.",
      ],
      monologue: [
        "\"Two more tabs open and then I'll focus. Probably.\"",
        "\"I'm not scattered. Everything just happens to be interesting.\"",
      ],
    },
    moon: {
      core: [
        "They process feelings by talking. An emotion becomes real to them once they've described it. Silence makes the spiral louder; saying it out loud reliably calms the anxiety. Speaking freely — about anything — is how they keep their emotional life running.",
        "When they're in pain, distance shows up automatically: more jokes, more analysis, narrating their own life from the third person. The cynicism is armor for raw nerves underneath. The comedy is bulletproofing.",
      ],
      safe: [
        "conversations flowing without judgment attached",
        "being allowed space to be weird without having to explain it",
        "partners who laugh easily but notice what the jokes are deflecting",
        "mental stimulation — dull relationships genuinely frighten them",
      ],
      hurt: [
        "They cover injuries with extra words: more jokes, changed subjects, suddenly busy schedules. Texts turn performative instead of genuine. Sharp listeners notice they've gotten louder — that's the tell that pain management is underway.",
        "They process sideways — circling the subject again and again instead of walking straight into it. Light, regular contact during those phases helps enormously; cornering them for a confession backfires completely.",
      ],
      talk: [
        "Will they talk about feelings? Absolutely — endlessly, fluently, and around the point. Saying lots of words isn't the same as being precise. But hand them the exact sentence that stung and the jokes suddenly stop being jokes.",
      ],
      monologue: ["\"Funny story about that— okay, fine, actual answer incoming.\""],
    },
    rising: {
      core: [
        "Their entrances carry electricity: ready smiles, rapid-fire questions, a youthful energy that ages well. Rooms genuinely feel livelier when they arrive — the curiosity is real, not a performance.",
      ],
      close: [
        "Strangers meet the charm; close people meet something stranger and better — obsessions they track nightly, seventeen group chats running at once, devastating impressions of people they know. Real closeness happens through shared references piling up until the two of you have a private language.",
      ],
    },
    mercury: {
      core: [
        "Their mind runs like a browser with twenty tabs open — several tracks at once, tangents followed productively, connections made fast. Quick thinking sometimes means shallow scanning; their shortcuts work brilliantly right up until they fail on one specific detail.",
        "They prefer decisions they can undo. Progress gives them momentum; certainty can wait. They tolerate open questions better than most people — being forced to settle on one answer too early bothers them more than leaving options open.",
      ],
      angryComm: [
        "Angry, their verbal sparring gets dangerous: sarcasm stacks up, exits get faster, and the argument turns into a performance they're secretly enjoying. They can land a checkmate line while the relationship bleeds out underneath. Winning the exchange often costs them the thing they actually wanted.",
      ],
      openUp: [
        "Condescending tones, lectures, and 'prove you're serious' posturing lock the gates immediately. What opens them: wit returned with wit, sincere questions, and conversations allowed to wander. They open up emotionally AFTER they feel intellectually matched, never before.",
      ],
      monologue: ["\"Technically correct counts, right? ...Right?\""],
    },
    venus: {
      core: [
        "They fall in love through the mind first: whoever fascinates them mentally wins automatically. Quick wit, unexpected points of view, and a willingness to share real things spark instant attraction. Physical chemistry follows conversation — it doesn't start it.",
        "Flirting is their native language, and they flirt playfully with everyone. Partners have to learn the difference between universal friendliness and special attention — and the tell is whose messages get actually thoughtful replies.",
      ],
      showLove: [
        "They show love by sending articles that made them think of you, hours-long conversations that wander everywhere, jokes custom-built for your sense of humor, endless curiosity about how your mind works, and immediately showing you every interesting thing they find.",
      ],
      pullAway: [
        "What kills it: boredom (the same weekends on repeat), a relationship that feels 'settled' in the boring sense, being monitored instead of trusted, being forbidden to have friends, or sulking over their reading habits. Suffocation kills their desire faster than any rival could.",
      ],
      attach: [
        "Attachment forms through accumulated reference points — private jokes a decade old, memories nobody else in the world understands. Their guarded sides come out carefully, wrapped in humor, with sincerity flashing through for a second. The testing never fully stops: people who only liked the surface version drift away on their own, and the ones who stay patient get access to something real.",
      ],
      monologue: ["\"God, nobody talks like you. Stay forever.\""],
    },
    mars: {
      core: [
        "Their drive works through the mind: they spot opportunities first, calculate angles fastest, and tilt negotiations through pure verbal skill. They win by out-thinking people rather than out-working them — cleverness beats brute force almost every time.",
        "Their energy arrives in bursts: sprints of brilliant productivity surrounded by stretches of apparent laziness that are actually recharging. It looks inconsistent by conventional standards. It works.",
      ],
      anger: [
        "Irritation shows up as sharpened commentary, suddenly faster speech, and mockery aimed with surgical precision. Direct confrontation gets redirected through irony — complaints delivered sideways, wrapped as observations rather than attacks.",
      ],
      limit: [
        "At their absolute limit they go surgical: a devastating truth assembled calmly in advance, delivered gently mid-laughter, and executed completely. People get confused because the voice never rose. Cruelty wasn't the goal — the ending was. Their mind checks out of the relationship long before their body leaves.",
      ],
      monologue: ["\"I already won. Everyone else just found out.\""],
    },
  },

  // ────────────────────────────────────────────────────────── CANCER
  cancer: {
    sun: {
      core: [
        "Their identity is anchored in belonging: family — blood or chosen — is not just important to them, it IS them. A Cancer Sun understands life relationally: who matters, who needs protecting, whose kitchen table hosts Sunday dinner. Careers matter mainly because the money funds and shelters the people who count.",
        "They live inside a shell with very soft walls. Strangers get politeness without revelation; trusted people discover an ocean of feeling underneath, plus a memory that never deletes anything relational. Kindness gets archived forever — and so does every injury, filed with dates.",
        "Their moods are weather systems that affect whole households. On good days they intuitively nurture everyone around them, turning ordinary rooms into sanctuaries. On bad days the weather turns and everyone feels it, even when nothing is said.",
      ],
      drive: [
        "What motivates them: protecting their people, building security they can touch — money saved, home owned, dinner guaranteed — and being genuinely needed. What frightens them most: discovering they're expendable to their own family, caring more than they're cared for, or being pushed out of the nest of people they spent years holding together.",
      ],
      monologue: [
        "\"I remember what you said that day. All of it.\"",
        "\"Fine.\" (It is not fine.)",
      ],
    },
    moon: {
      core: [
        "The Moon feels at home here, and it shows: their emotional life moves in tides. They absorb the atmosphere of every room they enter, pick up other people's tension in their own shoulders within minutes, and process feelings slowly, in waves, until each one dissolves on its own schedule.",
        "In public they are composed and dependable; in private, with the few people who feel safe, they finally let the tide show. Managing that composure costs real energy, and their chosen few see how much.",
      ],
      safe: [
        "proof of belonging — invitations repeated without having to ask",
        "a stable home base they control",
        "gentleness during conflict; even mid-argument, zero contempt",
        "people who check in first instead of waiting to be asked",
      ],
      hurt: [
        "When hurt, they retreat into the shell: shorter answers, canceled plans, a polite chill you could store food in. They won't say they're hurt — they wait to see if it matters enough for someone to notice and come looking. Chasing them when they go quiet isn't needy; it's literally the test.",
        "Emotional injuries get archived in unbelievable detail. Years later they can quote the sentence, the tone, and what they were cooking at the time — which shocks partners who assumed the incident had been resolved.",
      ],
      talk: [
        "They rarely name feelings directly at first — hints deploy instead: significant silences, pointed 'do whatever you want,' cooking for other people conspicuously. Asking straight out ('are we okay?') bypasses the whole decode ritual and secretly delights them.",
      ],
      monologue: ["\"Why do I have to ASK for basic care? It should just be obvious.\""],
    },
    rising: {
      core: [
        "The first impression is approachable-but-careful: warm eyes that are also assessing. In new environments they pause at thresholds — reading tones, alliances, exits — before committing to a room. People misread this as shyness when it's actually surveillance; they never stop scanning.",
      ],
      close: [
        "Inner circles meet the transformed version: absurdly funny, openly sentimental, protective to the point of ridiculousness. Their people's fights become their fights within minutes, whether or not anyone requested backup.",
      ],
    },
    mercury: {
      core: [
        "Their thinking runs through feeling first: they register moods before sentences, and memory keeps photographs of emotions — exactly how something was said, the light in the room, what year it was. Decisions weigh emotional certainty heavily; spreadsheets finish second.",
        "Communication comes indirect by default: asking permission doubles as expressing desire, checking convenience substitutes for stating needs. They hear implied meaning far more accurately than stated words.",
      ],
      angryComm: [
        "Anger travels sideways: doors closed slightly harder, sarcasm deployed thinly, martyrdom performed visibly — everything except the direct sentence 'I am angry.' Partners need translation training, or the silent treatment wins by forfeit.",
      ],
      openUp: [
        "Bluntness about their feelings, mockery of their sentimentality, or skipping pleasantries shuts them down instantly. What opens them: patience without an exasperated sigh, references to things they mentioned weeks ago ('you remembered that?!'), and soft entrances that acknowledge the subject is hard.",
      ],
      monologue: ["\"It's fine. Really. Keep eating.\" (None of that was true.)"],
    },
    venus: {
      core: [
        "Romance, for them, is domestic: love looks like soup made during your illness, your favorite snacks appearing in the cabinet unprompted, blankets retrieved before you finish asking. Tending IS their romantic language — food, shelter, remembered details.",
        "Courtship involves intense research phase one (mutual friends consulted, posts studied back three years), a cautious-warm testing phase two, and then astonishingly fast family integration: by month four, partners have met everyone and been assigned seating.",
      ],
      showLove: [
        "Affection shows through remembering: birthdays kept sacred, difficult anniversaries honored silently, comfort engineered invisibly, favorites stocked routinely. Devotion is declared through maintenance, not speeches.",
      ],
      pullAway: [
        "Interest dies in cold climates: partners emotionally unavailable, affection treated as weakness, tenderness answered with indifference. Repeatedly doing all the reaching also finishes it eventually — the resentment ledger closes at a precise, final total.",
      ],
      attach: [
        "Attachment is total — becoming someone's person means becoming their infrastructure. Even fiercely independent Cancers organize their inner world around belonging once bonded. Breakups aren't relationship endings; they're amputations, and everyone knows how those heal.",
      ],
      monologue: ["\"Come eat something. I already know what you like anyway.\""],
    },
    mars: {
      core: [
        "Their drive protects rather than conquers: ambition exists to secure the fortress. Competitive fire appears only when the territory — literal home, financial stability, their people's wellbeing — is threatened, and then the productivity becomes frightening.",
      ],
      anger: [
        "Everyday irritation leaks indirectly: atmosphere shifts, clipped greetings, dishes washed loudly enough to broadcast from another room. Confronted directly they either retreat sideways or snap with surprising force; both are signals the indirect route has failed.",
      ],
      limit: [
        "At their absolute limit the shell closes permanently: they leave quietly, often pre-planned for months, explaining nothing. There's no dramatic door-slam — just an empty space where caretaking used to be, which teaches everyone nearby exactly what they'd stopped valuing.",
      ],
      monologue: ["\"Protect first. Explain later. Maybe never.\""],
    },
  },
};
