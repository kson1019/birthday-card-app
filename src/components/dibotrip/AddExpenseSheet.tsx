"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Expense, ExpenseCategory } from "@/lib/dibotrip/db/types";

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "meal", label: "Meal", icon: "🍽️" },
  { value: "gas", label: "Gas", icon: "⛽" },
  { value: "groceries", label: "Groceries", icon: "🛒" },
  { value: "park_fee", label: "Park fee", icon: "🏕️" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "transport", label: "Transport", icon: "🚌" },
  { value: "tips", label: "Tips", icon: "💵" },
  { value: "other", label: "Other", icon: "📌" },
];

interface DayOption {
  day_number: number;
  title: string | null;
}

interface Props {
  tripId: string;
  days: DayOption[];
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}

export default function AddExpenseSheet({ tripId, days, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [dayNumber, setDayNumber] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const isValid = title.trim() && Number(amount) > 0;

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          cost: parseFloat(amount),
          category,
          day_number: dayNumber !== "" ? Number(dayNumber) : null,
          note: note.trim() || null,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to save expense");
        return;
      }
      const { data } = await res.json();
      toast.success("Expense added");
      onSaved(data);
      onClose();
    } catch {
      toast.error("Failed to save expense");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-900">Add Expense</h2>
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
        <div className="px-5 py-5 space-y-4">
          {/* Amount — big and prominent */}
          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 gap-1">
            <span className="text-2xl font-semibold text-stone-400">$</span>
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-3xl font-bold text-stone-900 bg-transparent focus:outline-none placeholder:text-stone-300 min-w-0"
            />
          </div>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What was it for?"
            className="w-full text-sm border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            onKeyDown={(e) => e.key === "Enter" && isValid && handleSave()}
          />

          {/* Category pills */}
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    category === c.value
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <span>{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day + Note row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-stone-500 mb-1.5">Day</p>
              <select
                value={dayNumber}
                onChange={(e) =>
                  setDayNumber(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Trip-wide</option>
                {days.map((d) => (
                  <option key={d.day_number} value={d.day_number}>
                    Day {d.day_number}{d.title ? ` — ${d.title}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 mb-1.5">Note</p>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional"
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {saving ? "Saving…" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
