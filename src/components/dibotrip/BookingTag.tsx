"use client";

import { useState, useRef, useEffect } from "react";
import type { Booking } from "@/lib/dibotrip/db/types";

const ICONS: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  car_rental: "🚗",
  activity: "🎫",
  other: "📋",
};

const TAG_COLORS: Record<string, string> = {
  flight: "bg-sky-100 text-sky-700 border-sky-200",
  hotel: "bg-amber-100 text-amber-700 border-amber-200",
  car_rental: "bg-teal-100 text-teal-700 border-teal-200",
  activity: "bg-rose-100 text-rose-700 border-rose-200",
  other: "bg-stone-100 text-stone-600 border-stone-200",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingTag({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const icon = ICONS[booking.type] ?? "📋";
  const tagColor = TAG_COLORS[booking.type] ?? TAG_COLORS.other;

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(booking.confirmation_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / non-HTTPS
      const el = document.createElement("textarea");
      el.value = booking.confirmation_number;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      {/* Pill tag */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-opacity hover:opacity-75 ${tagColor}`}
      >
        <span>{icon}</span>
        <span className="truncate max-w-[120px]">{booking.provider}</span>
        <span className="font-mono opacity-60">
          · {booking.confirmation_number}
        </span>
        <span className="opacity-40 text-[10px]">ⓘ</span>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl border border-stone-200 shadow-xl p-4 w-72 max-w-[min(18rem,90vw)]">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-stone-900 text-sm leading-snug">
                  {booking.provider}
                </p>
                <p className="text-xs text-stone-400 capitalize">
                  {booking.type.replace("_", " ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-stone-300 hover:text-stone-500 transition-colors text-xl leading-none -mt-0.5"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Confirmation number — the star */}
          <div className="bg-stone-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-stone-400 mb-1.5">Confirmation</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono font-bold text-stone-900 text-xl tracking-wider leading-none">
                {booking.confirmation_number}
              </p>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  copied
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {booking.check_in && (
              <Row label="Check-in" value={formatDate(booking.check_in)} />
            )}
            {booking.check_out && (
              <Row label="Check-out" value={formatDate(booking.check_out)} />
            )}
            {booking.cost != null && (
              <Row
                label="Cost"
                value={`$${booking.cost.toLocaleString()}`}
                bold
              />
            )}
            {booking.notes && (
              <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">
                {booking.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-stone-400">{label}</span>
      <span className={bold ? "font-semibold text-stone-800" : "text-stone-700"}>
        {value}
      </span>
    </div>
  );
}
