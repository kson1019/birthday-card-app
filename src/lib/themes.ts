export interface Theme {
  id: string;
  name: string;
  emoji: string;
  elements: string[];
  count: number;
  bgGradient: string;
}

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Confetti",
    emoji: "🎊",
    elements: ["🎊", "🎉", "✨", "⭐", "🌟", "🎈", "🎁"],
    count: 18,
    bgGradient: "from-purple-50 to-pink-50",
  },
  {
    id: "balloons",
    name: "Balloons",
    emoji: "🎈",
    elements: ["🎈", "🎀", "🎁", "💝", "🎊", "🎉", "💕"],
    count: 16,
    bgGradient: "from-blue-50 to-pink-50",
  },
  {
    id: "stars",
    name: "Stars",
    emoji: "⭐",
    elements: ["⭐", "🌟", "✨", "💫", "🌙", "☀️", "🌈"],
    count: 20,
    bgGradient: "from-yellow-50 to-indigo-50",
  },
  {
    id: "hearts",
    name: "Hearts",
    emoji: "❤️",
    elements: ["❤️", "💖", "💕", "💗", "🌸", "🌺", "💝"],
    count: 16,
    bgGradient: "from-pink-50 to-rose-50",
  },
  {
    id: "unicorn",
    name: "Unicorn",
    emoji: "🦄",
    elements: ["🦄", "🌈", "✨", "💎", "🌸", "💖", "⭐"],
    count: 18,
    bgGradient: "from-purple-50 to-pink-100",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
