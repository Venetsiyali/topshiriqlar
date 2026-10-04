export interface StickerDef {
  id: string;
  emoji: string;
  bg: string;
}

/** 40 ta stiker: hayvonlar, mevalar, kosmos. Emoji + rangli fon — alohida rasm yuklanmaydi. */
export const STICKERS: StickerDef[] = [
  // hayvonlar
  { id: "fox", emoji: "🦊", bg: "#7c2d12" },
  { id: "panda", emoji: "🐼", bg: "#334155" },
  { id: "lion", emoji: "🦁", bg: "#78350f" },
  { id: "tiger", emoji: "🐯", bg: "#9a3412" },
  { id: "cat", emoji: "🐱", bg: "#854d0e" },
  { id: "dog", emoji: "🐶", bg: "#713f12" },
  { id: "rabbit", emoji: "🐰", bg: "#831843" },
  { id: "bear", emoji: "🐻", bg: "#451a03" },
  { id: "koala", emoji: "🐨", bg: "#3f3f46" },
  { id: "frog", emoji: "🐸", bg: "#14532d" },
  { id: "monkey", emoji: "🐵", bg: "#78350f" },
  { id: "penguin", emoji: "🐧", bg: "#1e3a8a" },
  { id: "owl", emoji: "🦉", bg: "#44403c" },
  { id: "unicorn", emoji: "🦄", bg: "#6b21a8" },
  { id: "dragon", emoji: "🐲", bg: "#166534" },
  { id: "octopus", emoji: "🐙", bg: "#9d174d" },
  { id: "turtle", emoji: "🐢", bg: "#365314" },
  { id: "dolphin", emoji: "🐬", bg: "#0c4a6e" },
  { id: "eagle", emoji: "🦅", bg: "#57534e" },
  { id: "wolf", emoji: "🐺", bg: "#374151" },
  // mevalar
  { id: "apple", emoji: "🍎", bg: "#7f1d1d" },
  { id: "banana", emoji: "🍌", bg: "#713f12" },
  { id: "grapes", emoji: "🍇", bg: "#581c87" },
  { id: "watermelon", emoji: "🍉", bg: "#14532d" },
  { id: "cherry", emoji: "🍒", bg: "#881337" },
  { id: "peach", emoji: "🍑", bg: "#9a3412" },
  { id: "pineapple", emoji: "🍍", bg: "#854d0e" },
  { id: "strawberry", emoji: "🍓", bg: "#9f1239" },
  { id: "lemon", emoji: "🍋", bg: "#a16207" },
  { id: "kiwi", emoji: "🥝", bg: "#3f6212" },
  // kosmos
  { id: "rocket", emoji: "🚀", bg: "#1e1b4b" },
  { id: "planet", emoji: "🪐", bg: "#312e81" },
  { id: "star", emoji: "⭐", bg: "#422006" },
  { id: "moon", emoji: "🌙", bg: "#172554" },
  { id: "sun", emoji: "☀️", bg: "#7c2d12" },
  { id: "comet", emoji: "☄️", bg: "#4c1d95" },
  { id: "alien", emoji: "👽", bg: "#14532d" },
  { id: "ufo", emoji: "🛸", bg: "#1e3a8a" },
  { id: "astronaut", emoji: "🧑‍🚀", bg: "#0f172a" },
  { id: "earth", emoji: "🌍", bg: "#0c4a6e" },
];

const BY_ID = new Map(STICKERS.map((s) => [s.id, s]));

export function getSticker(id: string): StickerDef {
  return BY_ID.get(id) ?? STICKERS[0];
}

export function isStickerId(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}
