"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";
import RecipientInput from "./RecipientInput";
import FlipCard from "../card/FlipCard";

export default function CardCreatorForm() {
  const [imagePath, setImagePath] = useState("");
  const [headline, setHeadline] = useState("");
  const [title, setTitle] = useState("");
  const [hostedBy, setHostedBy] = useState("");
  const [location, setLocation] = useState("");
  const [datetime, setDatetime] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState<
    { email: string; name?: string }[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const isFormValid =
    imagePath &&
    headline &&
    title &&
    location &&
    datetime &&
    message &&
    recipients.length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      // Create the card
      const createRes = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePath,
          headline,
          title,
          hostedBy,
          location,
          datetime,
          message,
          recipients,
        }),
      });

      const card = await createRes.json();

      if (!createRes.ok) {
        setResult({ success: false, message: card.error || "Failed to create card" });
        return;
      }

      // Send emails
      const sendRes = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id }),
      });

      const sendResult = await sendRes.json();

      if (!sendRes.ok) {
        setResult({
          success: false,
          message: sendResult.error || "Card created but failed to send emails",
        });
        return;
      }

      setResult({
        success: true,
        message: `Card created and ${sendResult.sent} invitation${sendResult.sent !== 1 ? "s" : ""} sent!${sendResult.failed > 0 ? ` (${sendResult.failed} failed)` : ""}`,
      });

      // Reset form
      setImagePath("");
      setHeadline("");
      setTitle("");
      setHostedBy("");
      setLocation("");
      setDatetime("");
      setMessage("");
      setRecipients([]);
      setShowPreview(false);
    } catch {
      setResult({ success: false, message: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
        <ImageUploader value={imagePath} onChange={setImagePath} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Happy Birthday, Sarah!"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-purple-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Party Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sarah's Birthday Bash"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-purple-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hosted by
          </label>
          <input
            type="text"
            value={hostedBy}
            onChange={(e) => setHostedBy(e.target.value)}
            placeholder="Alyssa & Ben"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-purple-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="123 Party Lane, Fun City"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-purple-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-purple-400 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Come celebrate with us! There will be cake, music, and lots of fun."
            rows={3}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-purple-400 focus:outline-none transition-colors resize-none"
          />
        </div>

        <RecipientInput value={recipients} onChange={setRecipients} />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            disabled={!imagePath || !headline}
            className="flex-1 px-6 py-3 border-2 border-purple-500 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {showPreview ? "Hide Preview" : "Preview Card"}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Create & Send Invitations"}
          </button>
        </div>

        {/* Result message */}
        {result && (
          <div
            className={`p-4 rounded-xl text-center font-medium ${
              result.success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {result.message}
          </div>
        )}
      </div>

      {/* Preview */}
      {showPreview && imagePath && headline && (
        <div className="py-4">
          <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
            Card Preview
          </h3>
          <FlipCard
            imagePath={imagePath}
            headline={headline}
            title={title || "Party Title"}
            hostedBy={hostedBy || ""}
            location={location || "Location TBD"}
            datetime={datetime || new Date().toISOString()}
            message={message || "You're invited!"}
          />
        </div>
      )}
    </div>
  );
}
