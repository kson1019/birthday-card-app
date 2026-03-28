"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ImportBooking, DayWithActivities } from "@/lib/dibotrip/db/types";
import BookingPreview, { type ActivityOption, type BookingDraft } from "./BookingPreview";

interface Props {
  tripId: string;
  days: DayWithActivities[];
  onClose: () => void;
  onSaved: () => void;
}

type Step = "paste" | "preview";

export default function AddBookingSheet({ tripId, days, onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>("paste");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<ImportBooking | null>(null);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [linkedActivityId, setLinkedActivityId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const allActivities: ActivityOption[] = days.flatMap((day) =>
    day.activities.map((a) => ({
      id: a.id,
      title: a.title,
      dayNumber: day.day_number,
      dayTitle: day.title,
    }))
  );

  async function handleExtract() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), tripId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Extraction failed");
        return;
      }
      const extracted: ImportBooking = json.data;
      setBooking(extracted);
      setDraft({
        type: extracted.type ?? "other",
        provider: extracted.provider ?? "",
        confirmation_number: extracted.confirmation_number ?? "",
        check_in: extracted.check_in,
        check_out: extracted.check_out,
        cost: extracted.cost,
        notes: extracted.notes,
        details: extracted.details,
        linked_activity_hint: extracted.linked_activity_hint,
      });

      // Auto-select the AI-suggested activity
      if (extracted.linked_activity_hint) {
        const hint = extracted.linked_activity_hint.toLowerCase();
        const match = allActivities.find(
          (a) =>
            a.title.toLowerCase().includes(hint) ||
            hint.includes(a.title.toLowerCase())
        );
        if (match) setLinkedActivityId(match.id);
      }

      setStep("preview");
    } catch {
      toast.error("Extraction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    if (!draft.provider.trim() || !draft.confirmation_number.trim()) {
      toast.error("Provider and confirmation number are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: draft.type,
          provider: draft.provider.trim(),
          confirmation_number: draft.confirmation_number.trim(),
          check_in: draft.check_in ?? null,
          check_out: draft.check_out ?? null,
          cost: draft.cost ?? null,
          notes: draft.notes ?? null,
          details: draft.details ?? null,
          activity_id: linkedActivityId,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to save booking");
        return;
      }
      toast.success("Booking saved!");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save booking");
    } finally {
      setSaving(false);
    }
  }

  const canSave = draft?.provider?.trim() && draft?.confirmation_number?.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            {step === "preview" && (
              <button
                onClick={() => setStep("paste")}
                className="w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            )}
            <h2 className="text-base font-semibold text-stone-900">
              {step === "paste" ? "Add Booking" : "Review Booking"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
          {step === "paste" ? (
            <>
              <p className="text-sm text-stone-500 mb-3 leading-relaxed">
                Paste a confirmation email, text message, or type booking
                details. Claude will extract the key information.
              </p>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste confirmation email or booking details…"
                rows={8}
                className="w-full text-sm border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
              <button
                onClick={handleExtract}
                disabled={!text.trim() || loading}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Extracting…
                  </>
                ) : (
                  "Extract Booking →"
                )}
              </button>
            </>
            ) : booking ? (
            <>
              <BookingPreview
                booking={booking}
                activities={allActivities}
                linkedActivityId={linkedActivityId}
                onLinkChange={setLinkedActivityId}
                onDraftChange={setDraft}
              />
              <button
                onClick={handleSave}
                disabled={saving || !canSave}
                className="mt-5 w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {saving ? "Saving…" : "Save Booking"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
