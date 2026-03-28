"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Booking, DayWithActivities } from "@/lib/dibotrip/db/types";

const TYPE_OPTIONS = [
  { value: "flight", label: "✈️ Flight" },
  { value: "hotel", label: "🏨 Hotel" },
  { value: "car_rental", label: "🚗 Car rental" },
  { value: "activity", label: "🎟️ Activity" },
  { value: "other", label: "📋 Other" },
] as const;

type BookingType = Booking["type"];

interface ActivityOption {
  id: string;
  title: string;
  dayNumber: number;
  dayTitle: string | null;
}

interface Props {
  booking: Booking;
  days: DayWithActivities[];
  onClose: () => void;
  onSaved: (updated: Booking) => void;
  onDeleted: (id: string) => void;
}

/** Strips the time portion from an ISO datetime so <input type="date"> is happy */
function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

export default function EditBookingSheet({
  booking,
  days,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const [type, setType] = useState<BookingType>(booking.type);
  const [provider, setProvider] = useState(booking.provider);
  const [confNum, setConfNum] = useState(booking.confirmation_number);
  const [checkIn, setCheckIn] = useState(toDateInputValue(booking.check_in));
  const [checkOut, setCheckOut] = useState(toDateInputValue(booking.check_out));
  const [cost, setCost] = useState(booking.cost != null ? String(booking.cost) : "");
  const [address, setAddress] = useState(
    (booking.details as Record<string, string> | null)?.address ??
    (booking.details as Record<string, string> | null)?.property_address ??
    (booking.details as Record<string, string> | null)?.pickup_location ??
    ""
  );
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [linkedActivityId, setLinkedActivityId] = useState<string | null>(
    booking.activity_id ?? null
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allActivities: ActivityOption[] = days.flatMap((day) =>
    day.activities.map((a) => ({
      id: a.id,
      title: a.title,
      dayNumber: day.day_number,
      dayTitle: day.title,
    }))
  );

  const canSave = provider.trim() && confNum.trim();

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          provider: provider.trim(),
          confirmation_number: confNum.trim(),
          check_in: checkIn || null,
          check_out: checkOut || null,
          cost: cost ? parseFloat(cost) : null,
          notes: notes.trim() || null,
          activity_id: linkedActivityId,
          details: {
            ...(booking.details as Record<string, unknown> | null ?? {}),
            address: address.trim() || undefined,
          },
        }),
      });
      if (!res.ok) {
        toast.error("Failed to save booking");
        return;
      }
      const { data } = await res.json();
      toast.success("Booking updated");
      onSaved(data);
      onClose();
    } catch {
      toast.error("Failed to save booking");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete booking");
        setDeleting(false);
        setConfirmDelete(false);
        return;
      }
      toast.success("Booking removed");
      onDeleted(booking.id);
      onClose();
    } catch {
      toast.error("Failed to delete booking");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-900">Edit Booking</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-5 max-h-[80vh] overflow-y-auto space-y-4">
          {/* Type pills */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-2">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    type === opt.value
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Provider */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">
              Provider / Company <span className="text-red-400">*</span>
            </label>
            <input
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. Southwest Airlines, Airbnb"
              className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Confirmation number */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">
              Confirmation / Reference # <span className="text-red-400">*</span>
            </label>
            <input
              value={confNum}
              onChange={(e) => setConfNum(e.target.value)}
              placeholder="e.g. ABCD1234"
              className="w-full font-mono text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-500 block mb-1.5">
                From / Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 block mb-1.5">
                To / Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">
              Cost (USD)
            </label>
            <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400">
              <span className="pl-3 text-stone-400 text-sm">$</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-sm px-2 py-2.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">
              Address / Location{" "}
              <span className="font-normal text-stone-400">(opens maps)</span>
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Las Vegas, NV 89101"
              className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cancellation policy, address, special requests…"
              rows={3}
              className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {/* Link to activity */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">
              Linked activity{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <select
              value={linkedActivityId ?? ""}
              onChange={(e) => setLinkedActivityId(e.target.value || null)}
              className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">No specific activity</option>
              {allActivities.map((a) => (
                <option key={a.id} value={a.id}>
                  D{a.dayNumber}
                  {a.dayTitle ? ` — ${a.dayTitle}` : ""} · {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* Delete zone */}
          <div className="border-t border-stone-100 pt-4">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-stone-500 flex-1">
                  Remove this booking?
                </p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deleting ? "Removing…" : "Yes, remove"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm text-stone-400 hover:text-stone-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-stone-300 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
