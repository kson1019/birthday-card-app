"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Reading your trip plan…",
  "Finding destinations…",
  "Extracting activities…",
  "Organizing your itinerary…",
  "Picking up bookings…",
  "Almost there…",
];

export default function ImportLoading() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      {/* Spinner */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
        <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>

      {/* Rotating message */}
      <p
        className={`text-stone-600 text-sm font-medium transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {MESSAGES[index]}
      </p>

      <p className="text-stone-400 text-xs">This usually takes 10–20 seconds</p>
    </div>
  );
}
