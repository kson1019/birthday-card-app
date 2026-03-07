"use client";

import { useState } from "react";
import type { Recipient } from "@/types";
import { getRandomRsvpMessage } from "@/lib/constants";
import CalendarButton from "@/components/card/CalendarButton";

interface RsvpFormProps {
  token: string;
  currentResponse?: Recipient | null;
  eventTitle?: string;
  eventLocation?: string;
  eventDatetime?: string;
  eventDescription?: string;
}

export default function RsvpForm({
  token,
  currentResponse,
  eventTitle,
  eventLocation,
  eventDatetime,
  eventDescription,
}: RsvpFormProps) {
  const [status, setStatus] = useState<"accepted" | "declined" | null>(
    currentResponse?.status === "pending" ? null : currentResponse?.status ?? null
  );
  const [message, setMessage] = useState(currentResponse?.responseMessage ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    currentResponse?.status !== "pending" && currentResponse?.status !== undefined
  );
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!status) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, status, message: message || undefined }),
      });

      if (res.ok) {
        setSuccessMessage(getRandomRsvpMessage(status));
        setIsSubmitted(true);
        setShowChangeForm(false);
      }
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted && !showChangeForm) {
    const showCalendar =
      status === "accepted" && eventTitle && eventLocation && eventDatetime;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center animate-fade-in">
        <div className="text-5xl mb-4 animate-bounce">
          {status === "accepted" ? "🎉" : "😢"}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {successMessage || (status === "accepted"
            ? "You're coming! See you there!"
            : "Sorry you can't make it!")}
        </h3>
        {message && (
          <p className="text-gray-500 italic mb-4">&ldquo;{message}&rdquo;</p>
        )}
        {showCalendar && (
          <div className="mb-5 flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">Add it to your calendar so you don&apos;t forget!</p>
            <CalendarButton
              title={eventTitle!}
              location={eventLocation!}
              datetime={eventDatetime!}
              description={eventDescription}
            />
          </div>
        )}
        <button
          onClick={() => setShowChangeForm(true)}
          className="text-sm text-purple-600 hover:text-purple-800 underline"
        >
          Change my response
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
        Can you make it?
      </h3>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setStatus("accepted")}
          className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
            status === "accepted"
              ? "bg-green-500 text-white shadow-lg scale-105"
              : "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
          }`}
        >
          &#127881; Yes!
        </button>

        <button
          type="button"
          onClick={() => setStatus("declined")}
          className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
            status === "declined"
              ? "bg-red-400 text-white shadow-lg scale-105"
              : "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100"
          }`}
        >
          &#128532; No
        </button>
      </div>

      {status && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Leave a message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                status === "accepted"
                  ? "Can't wait! Should I bring anything?"
                  : "Sorry I'll miss it! Have fun everyone!"
              }
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-purple-400 focus:outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Submit Response"}
          </button>
        </div>
      )}
    </div>
  );
}
