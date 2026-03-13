"use client";

import { useMemo } from "react";

const ALL_EMOJIS = [
  "🎊", "🎉", "✨", "⭐", "🌟", "🎈", "🎁",
  "🎀", "💝", "💕", "❤️", "💖", "💗", "🌸",
  "🦄", "🌈", "💎", "🌺", "🌙", "☀️", "💫",
];

const ELEMENT_COUNT = 20;

interface FloatingElement {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
  drift: number;
  sway: number;
  swayDuration: number;
  spin: number;
}

export default function FloatingElements() {
  const elements = useMemo<FloatingElement[]>(() => {
    return Array.from({ length: ELEMENT_COUNT }, (_, i) => {
      const seed = i * 137.5;
      return {
        id: i,
        emoji: ALL_EMOJIS[i % ALL_EMOJIS.length],
        left: (seed % 95) + 2,
        duration: 7 + (i % 7),
        delay: -(i * 1.1),
        size: 2.4 + (i % 3) * 0.8,
        drift: -30 + (i % 5) * 15,
        sway: -15 + (i % 3) * 15,
        swayDuration: 2 + (i % 3),
        spin: (i % 2 === 0 ? 1 : -1) * (90 + (i % 4) * 45),
      };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[15]"
    >
      {elements.map((el) => (
        <span
          key={el.id}
          className="floating-element absolute select-none"
          style={{
            left: `${el.left}%`,
            top: "100%",
            fontSize: `var(--size)`,
            "--size": `${el.size}rem`,
            "--duration": `${el.duration}s`,
            "--drift": `${el.drift}px`,
            "--spin": `${el.spin}deg`,
            "--sway": `${el.sway}px`,
            "--sway-duration": `${el.swayDuration}s`,
            animationDelay: `${el.delay}s, ${el.delay * 0.5}s`,
          } as React.CSSProperties}
        >
          {el.emoji}
        </span>
      ))}
    </div>
  );
}
