// ===========================================================================
// SAY LINES (part 2: Libra–Pisces) — see sayLines1.ts for authoring rules.
// ===========================================================================

import type { SayPair } from "./sayLines";

export const SAY_LINES_2: Record<string, { moon: SayPair; mercury: SayPair; venus: SayPair; mars: SayPair }> = {
  libra: {
    moon: {
      works: "I don't need you to be okay with this right now.",
      worksWhy: "It removes the performance pressure. Libra Moon manages everyone's weather and almost never gets told the job can be put down.",
      avoid: "Stop being diplomatic and just pick a side.",
      avoidWhy: "It demands the exact trait they use to keep the peace be dropped in the exact moment the peace is failing. What comes out instead is a fake opinion.",
    },
    mercury: {
      works: "Let's look at both sides properly, then decide.",
      worksWhy: "It validates the weighing as method, not delay. They decide fast once the balance is real — and their balanced decisions hold up.",
      avoid: "Just rip the band-aid off.",
      avoidWhy: "Speed without fairness feels violent to them. They'll agree out loud, then quietly sabotage what was agreed to restore the fairness.",
    },
    venus: {
      works: "Dance with me.",
      worksWhy: "Romance staged as an art form. Libra Venus is moved by beauty arranged for two — the invitation matters more than the dancing.",
      avoid: "Do you have to make everything a whole production?",
      avoidWhy: "The production IS the love language. Calling it excess starves the exact romance they are trying to build for both of you.",
    },
    mars: {
      works: "I know you hate conflict. Stay in it with me anyway.",
      worksWhy: "It names the avoidance with love. Being asked to stay is being told the relationship outranks comfort — that's the only invitation that works.",
      avoid: "You never say what you actually feel.",
      avoidWhy: "Delivered as accusation, it produces more smoothing, not less. Directness has to feel safe before it appears; this makes it feel fatal.",
    },
  },

  scorpio: {
    moon: {
      works: "You were right to check. Here's everything, unedited.",
      worksWhy: "Pre-emptive transparency is the only proof this Moon trusts. Volunteered information buys years; information extracted under questioning costs them.",
      avoid: "I don't owe you an explanation.",
      avoidWhy: "Technically true, relationally catastrophic. Secrecy is read as betrayal-in-progress, and the investigation will outlast the relationship.",
    },
    mercury: {
      works: "I'm going to answer this honestly, even though it costs me.",
      worksWhy: "They measure depth by watching what people do when the truth is expensive. Announcing the cost and paying it anyway is the entire test passed.",
      avoid: "Why do you always assume the worst?",
      avoidWhy: "It names the defense like a defect. They won't argue — they'll simply stop running the tests where you can see them.",
    },
    venus: {
      works: "Tell me the thing you never tell anyone.",
      worksWhy: "An invitation to the vault. Scorpio Venus loves through total disclosure, given and received — partial access just means the affair hasn't started yet.",
      avoid: "I don't want things to get too intense.",
      avoidWhy: "Intensity is the only frequency they operate on. Asking for less reads as asking for someone else, and they'll remember it was asked.",
    },
    mars: {
      works: "I'm still here. Say the rest of it.",
      worksWhy: "Staying put through the deepest cut is what proves the bond is load-bearing. The storm is the test; weathering it is the answer.",
      avoid: "You're insane for being this upset.",
      avoidWhy: "Pathologizing the feeling confirms the abandonment fear under it. Expect a decade of receipts and a permanently downgraded trust score.",
    },
  },

  sagittarius: {
    moon: {
      works: "Go. I'll be fine — tell me everything when you're back.",
      worksWhy: "Freedom given without sulking is the rarest proof of love they know. The cheerful exit buys a more cheerful return, every time.",
      avoid: "If you loved me, you'd stay.",
      avoidWhy: "Love framed as a cage. Guilt is the single fastest way to make the door look good — and they are excellent at doors.",
    },
    mercury: {
      works: "Don't dumb it down — what's your actual take?",
      worksWhy: "Appetite for the whole idea. They speak in essays, not summaries; asking for the real version is asking for the person.",
      avoid: "That's too deep for this conversation.",
      avoidWhy: "Hollowness is their allergy. Being told to shallow out makes the whole relationship feel shallow — usually by the end of the week.",
    },
    venus: {
      works: "Let's book it now and figure the rest out later.",
      worksWhy: "Adventure proposed, not negotiated. Spontaneity reads as compatibility — the plan can be terrible and they'll still be in love by the exit.",
      avoid: "I already planned your weekends for the month.",
      avoidWhy: "A pre-lived life is a zoo. They need unscripted space to stay in love; the schedule itself is the thing they'll start escaping.",
    },
    mars: {
      works: "Say it straight — you won't scare me off.",
      worksWhy: "It invites the blunt truth instead of the sarcastic one. Honesty permitted is honesty delivered; the sharpness softens once it's allowed.",
      avoid: "You can't just say whatever you want.",
      avoidWhy: "Policing the mouth is policing the person. They will leave rather than self-edit forever, and they'll do it cheerfully.",
    },
  },

  capricorn: {
    moon: {
      works: "You don't have to carry this one. Give it to me.",
      worksWhy: "It names the weight they never put down. Being relieved of duty is intimacy in their language — competence-love flows both ways.",
      avoid: "You're so cold sometimes.",
      avoidWhy: "Competence is their feelings-management, not an absence of feeling. Calling it cold makes them colder, on purpose, as a lesson.",
    },
    mercury: {
      works: "What's your read? I want your take before anyone else's.",
      worksWhy: "Competence respected. Their mind runs on problems worth solving; being consulted first is being ranked first.",
      avoid: "You never open up to me.",
      avoidWhy: "Delivered as a complaint, it becomes another performance review. They open up when nothing is being graded — and this grades them.",
    },
    venus: {
      works: "I told them you're my person.",
      worksWhy: "Public commitment with a track record. Capricorn Venus invests where the future is auditable; declarations are checked against behavior.",
      avoid: "I don't know where this is going.",
      avoidWhy: "Indefinite futures get cut at budget review. Ambiguity isn't mysterious to them; it's scored as risk, and risk gets de-funded.",
    },
    mars: {
      works: "Let's solve this, not score it.",
      worksWhy: "It matches their actual win-condition: resolution. They'll drop the argument the second solving becomes the stated goal.",
      avoid: "Like last time, when you messed up the same way?",
      avoidWhy: "Fail archives are mutual-assured destruction. They keep a better file than you do, and they'll open it.",
    },
  },

  aquarius: {
    moon: {
      works: "You don't have to explain why you need space. It's yours.",
      worksWhy: "Autonomy honored without transaction. Space freely granted reads as security; space extracted through questions reads as surveillance.",
      avoid: "Why are you being so distant?",
      avoidWhy: "Distance is processing, not punishment. Interrogating it manufactures the coldness you were worried about, and then some.",
    },
    mercury: {
      works: "That's a weird take. I kind of love it.",
      worksWhy: "Delight at originality is the fastest route in. Their ideas are their handshake — meeting the idea IS meeting the person.",
      avoid: "Normal people don't think like that.",
      avoidWhy: "Conformity pressure reads as an insult to the only self they respect. They won't get normal; they'll just get gone.",
    },
    venus: {
      works: "You were right about that thing I argued for a week.",
      worksWhy: "Friendship plus respect is the actual romance. An Aquarius Venus loves a mind that can update — the concession is more intimate than any gift.",
      avoid: "I love you. Isn't that enough?",
      avoidWhy: "Said before the friendship has roots, intensity reads as noise. The words land only after the weirdness has been witnessed and kept.",
    },
    mars: {
      works: "Let's look at the actual problem, not at each other.",
      worksWhy: "It reframes to analysis, their home ground. Conflict handled as a puzzle gets solved; conflict handled as theater gets abandoned.",
      avoid: "Everyone agrees with me, not you.",
      avoidWhy: "Consensus as a weapon. They stopped taking votes on their own truth at age twelve, and the appeal to majority only hardens the position.",
    },
  },

  pisces: {
    moon: {
      works: "Come here. Nothing needs to make sense tonight.",
      worksWhy: "Shelter without analysis. Pisces Moon metabolizes feelings by drowning in them safely — company that doesn't demand shape is the rescue.",
      avoid: "You're too much right now.",
      avoidWhy: "Absorption is how they love. Being called too much teaches them to disappear, and disappearing is a skill with no undo button.",
    },
    mercury: {
      works: "You picked up on something there, didn't you?",
      worksWhy: "It credits the radar. Pisces Mercury knows things before reasons exist; validation keeps the channel open instead of driving it underground.",
      avoid: "That makes no logical sense.",
      avoidWhy: "Logic used as a gate dismisses their entire input channel. They'll stop offering the signal — and the signal was the intimacy.",
    },
    venus: {
      works: "I saved you the last one.",
      worksWhy: "Tiny proof of being held in mind. Pisces Venus reads devotion in small rituals, not declarations — the saved portion is a love letter.",
      avoid: "You're imagining things that aren't there.",
      avoidWhy: "Gaslight-flavored dismissal, even when unintentional. It severs the trust line completely, and that line does not regrow.",
    },
    mars: {
      works: "I'm not going anywhere, even when you're like this.",
      worksWhy: "Permanence during the storm is the only anchor. The feeling being too much for someone else is exactly what needs to be survivable for you.",
      avoid: "Fine — escape, then.",
      avoidWhy: "It confirms the exit fear they fight daily. They'll comply — and the compliance takes the relationship's trust with it.",
    },
  },
};
