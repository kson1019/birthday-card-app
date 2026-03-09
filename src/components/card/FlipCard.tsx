"use client";

import { useState } from "react";
import CardFront from "./CardFront";
import CardBack from "./CardBack";
import { playFlipSound } from "@/lib/sounds";

interface FlipCardProps {
  imagePath: string;
  headline: string;
  title: string;
  hostedBy?: string;
  location: string;
  datetime: string;
  message: string;
  showCalendarButton?: boolean;
}

export default function FlipCard({
  imagePath,
  headline,
  title,
  hostedBy,
  location,
  datetime,
  message,
  showCalendarButton = false,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full max-w-md mx-auto cursor-pointer select-none"
      style={{ perspective: "1000px" }}
      onClick={() => { setIsFlipped(!isFlipped); playFlipSound(); }}
    >
      <div
        className="relative w-full transition-transform duration-700 ease-in-out"
        style={{
          aspectRatio: "3 / 4",
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardFront imagePath={imagePath} headline={headline} />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardBack
            title={title}
            hostedBy={hostedBy}
            location={location}
            datetime={datetime}
            message={message}
            showCalendarButton={showCalendarButton}
          />
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-4">
        {isFlipped ? "Tap to flip back" : "Tap to see party details"}
      </p>
    </div>
  );
}
