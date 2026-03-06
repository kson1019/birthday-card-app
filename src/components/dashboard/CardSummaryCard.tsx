"use client";

import { useState } from "react";
import type { CardWithCounts, Recipient } from "@/types";
import RecipientList from "./RecipientList";

interface CardSummaryCardProps {
  card: CardWithCounts;
  onDelete: (cardId: number) => void;
}

export default function CardSummaryCard({ card, onDelete }: CardSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (!recipients) {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/cards/${card.id}`);
        const data = await res.json();
        setRecipients(data.recipients);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }

    setIsExpanded(true);
  };

  const handleSend = async () => {
    if (!confirm(`Send invitations to all ${card.totalCount} recipient(s)?`)) return;
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id }),
      });
      const data = await res.json();
      setSendResult({ sent: data.sent, failed: data.failed });
    } catch {
      setSendResult({ sent: 0, failed: card.totalCount });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this card and all RSVP data? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete card");
        return;
      }

      onDelete(card.id);
    } catch {
      setDeleteError("Failed to delete card");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={card.imagePath}
            alt={card.headline}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 truncate">{card.headline}</h3>
          <p className="text-sm text-gray-500 truncate">{card.title}</p>
          {card.hostedBy && (
            <p className="text-sm text-gray-500 truncate">Hosted by {card.hostedBy}</p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {card.totalCount} invited
            </span>
            {card.acceptedCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {card.acceptedCount} accepted
              </span>
            )}
            {card.declinedCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                {card.declinedCount} declined
              </span>
            )}
            {card.pendingCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                {card.pendingCount} pending
              </span>
            )}
          </div>

          {/* Send result */}
          {sendResult && (
            <p className={`text-xs mt-2 font-medium ${sendResult.failed > 0 ? "text-red-500" : "text-green-600"}`}>
              {sendResult.failed > 0
                ? `${sendResult.sent} sent, ${sendResult.failed} failed`
                : `Sent to ${sendResult.sent} recipient(s)!`}
            </p>
          )}
        </div>

        {/* Send button */}
        <div className="flex-shrink-0 self-start flex flex-col gap-2">
          <button
            onClick={handleSend}
            disabled={isSending || card.totalCount === 0}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {deleteError && (
        <p className="px-4 pb-2 text-xs font-medium text-red-500">{deleteError}</p>
      )}

      {/* Expand button */}
      <button
        onClick={handleExpand}
        className="w-full py-2 text-sm text-purple-600 hover:bg-purple-50 border-t border-gray-100 transition-colors"
      >
        {isLoading
          ? "Loading..."
          : isExpanded
            ? "Hide recipients"
            : "Show recipients"}
      </button>

      {/* Expanded recipient list */}
      {isExpanded && recipients && (
        <div className="border-t border-gray-100">
          <RecipientList recipients={recipients} />
        </div>
      )}
    </div>
  );
}
