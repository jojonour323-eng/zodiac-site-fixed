// Curated legendary quotes from real, named historical figures.
// Used on the intro screen — auto-rotates so the user sees multiple quotes
// during a single visit, not just one stuck on screen.
// Criteria: actually attributed, genuinely motivating (not corny), and short
// enough to fit on mobile.

export interface LegendaryQuote {
  text: string;
  author: string;
}

export const LEGENDARY_QUOTES: LegendaryQuote[] = [
  { text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius" },
  { text: "We must be willing to let go of the life we planned so as to have the life that is waiting for us.",
    author: "Joseph Campbell" },
  { text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    author: "Marie Curie" },
  { text: "It is never too late to be what you might have been.",
    author: "George Eliot" },
  { text: "You are not obligated to become the person you were five years ago.",
    author: "Naval Ravikant" },
  { text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche" },
  { text: "The wound is the place where the Light enters you.",
    author: "Rumi" },
  { text: "What you seek is seeking you.",
    author: "Rumi" },
  { text: "And still, I rise.",
    author: "Maya Angelou" },
  { text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs" },
  { text: "It always seems impossible until it's done.",
    author: "Nelson Mandela" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison" },
  { text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs" },
  { text: "What we think, we become.",
    author: "Buddha" },
  { text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky" },
  { text: "Whether you think you can, or you think you can't — you're right.",
    author: "Henry Ford" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb" },
  { text: "Stars can't shine without darkness.",
    author: "D.H. Sidebottom" },
  { text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson" },
  { text: "Fall seven times, stand up eight.",
    author: "Japanese Proverb" },
  { text: "The man who moves a mountain begins by carrying away small stones.",
    author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair" },
  { text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.",
    author: "C.S. Lewis" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.",
    author: "Mark Twain" },
  { text: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
    author: "Mary Anne Radmacher" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
    author: "Henry David Thoreau" },
  { text: "Rock bottom became the solid foundation on which I rebuilt my life.",
    author: "J.K. Rowling" },
  { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.",
    author: "Vince Lombardi" },
  { text: "Tough times never last, but tough people do.",
    author: "Robert H. Schuller" },
  { text: "A year from now you may wish you had started today.",
    author: "Karen Lamb" },
  { text: "Life isn't about waiting for the storm to pass; it's about learning to dance in the rain.",
    author: "Vivian Greene" },
  { text: "Even the darkest night will end and the sun will rise.",
    author: "Victor Hugo" },
  { text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson" },
  { text: "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it.",
    author: "Henry Ford" },
];

// Pick a random quote, avoiding the given previous index so we never show
// the same quote twice in a row.
export function pickQuote(excludeIdx: number = -1): LegendaryQuote {
  if (LEGENDARY_QUOTES.length <= 1) return LEGENDARY_QUOTES[0];
  let idx: number;
  do {
    idx = Math.floor(Math.random() * LEGENDARY_QUOTES.length);
  } while (idx === excludeIdx);
  return LEGENDARY_QUOTES[idx];
}
