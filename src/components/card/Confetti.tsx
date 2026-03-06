"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function Confetti() {
  useEffect(() => {
    // Initial center burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff6b9d", "#c44dff", "#ffb347", "#87ceeb", "#ff4500"],
    });

    // Side bursts after a short delay
    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ff6b9d", "#c44dff", "#ffb347"],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#87ceeb", "#ff4500", "#c44dff"],
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
