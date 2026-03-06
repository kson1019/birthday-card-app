"use client";

import { useState, useEffect } from "react";
import type { CardWithCounts } from "@/types";
import CardSummaryCard from "./CardSummaryCard";

export default function CardList() {
  const [cards, setCards] = useState<CardWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCardDeleted = (cardId: number) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">Loading cards...</div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">&#127874;</div>
        <p className="text-gray-500 text-lg">No cards created yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Create your first birthday card to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {cards.map((card) => (
        <CardSummaryCard
          key={card.id}
          card={card}
          onDelete={handleCardDeleted}
        />
      ))}
    </div>
  );
}
