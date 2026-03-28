"use client";

import { useState } from "react";
import type { Expense, Booking, ExpenseCategory } from "@/lib/dibotrip/db/types";

type Tab = "all" | "by-day" | "by-category";

const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  meal: "Meal",
  gas: "Gas",
  groceries: "Groceries",
  park_fee: "Park fee",
  shopping: "Shopping",
  transport: "Transport",
  tips: "Tips",
  other: "Other",
};

const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  meal: "🍽️",
  gas: "⛽",
  groceries: "🛒",
  park_fee: "🏕️",
  shopping: "🛍️",
  transport: "🚌",
  tips: "💵",
  other: "📌",
};

const BOOKING_TYPE_ICONS: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  car_rental: "🚗",
  activity: "🎟️",
  other: "📋",
};

interface DayMeta {
  day_number: number;
  title: string | null;
}

interface Props {
  expenses: Expense[];
  bookings: Booking[];
  days: DayMeta[];
  onDeleteExpense: (id: string) => void;
}

function ExpenseRow({
  title,
  amount,
  icon,
  sub,
  onDelete,
}: {
  title: string;
  amount: number;
  icon: string;
  sub?: string;
  onDelete?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-base w-6 flex-shrink-0 text-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-800 leading-snug truncate">{title}</p>
        {sub && <p className="text-xs text-stone-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm font-semibold text-stone-700">
          ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {onDelete &&
          (confirming ? (
            <>
              <button
                onClick={() => { onDelete(); setConfirming(false); }}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Remove
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-xs text-stone-400 hover:text-stone-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-stone-200 hover:text-red-400 transition-colors"
              title="Delete expense"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
      </div>
    </div>
  );
}

function Section({
  title,
  total,
  children,
}: {
  title: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-100">
        <p className="text-sm font-semibold text-stone-700">{title}</p>
        <p className="text-xs font-semibold text-stone-500">
          ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className="px-4 divide-y divide-stone-100">{children}</div>
    </div>
  );
}

export default function ExpenseList({ expenses, bookings, days, onDeleteExpense }: Props) {
  const [tab, setTab] = useState<Tab>("all");

  const bookingsWithCost = bookings.filter((b) => b.cost != null && b.cost > 0);
  const dayMap = new Map(days.map((d) => [d.day_number, d]));

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All Items" },
    { id: "by-day", label: "By Day" },
    { id: "by-category", label: "By Category" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex bg-stone-100 rounded-xl p-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tab === t.id
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── All Items ───────────────────────────────────────────────────── */}
      {tab === "all" && (
        <>
          {bookingsWithCost.length > 0 && (
            <Section
              title="Pre-Booked"
              total={bookingsWithCost.reduce((s, b) => s + (b.cost ?? 0), 0)}
            >
              {bookingsWithCost.map((b) => (
                <ExpenseRow
                  key={b.id}
                  title={b.provider}
                  amount={b.cost!}
                  icon={BOOKING_TYPE_ICONS[b.type] ?? "📋"}
                  sub={b.confirmation_number}
                />
              ))}
            </Section>
          )}

          {expenses.length > 0 ? (
            <Section
              title="On-Trip Expenses"
              total={expenses.reduce((s, e) => s + e.cost, 0)}
            >
              {expenses.map((e) => (
                <ExpenseRow
                  key={e.id}
                  title={e.title}
                  amount={e.cost}
                  icon={EXPENSE_CATEGORY_ICONS[e.category]}
                  sub={
                    e.day_number != null
                      ? `Day ${e.day_number}${dayMap.get(e.day_number)?.title ? ` — ${dayMap.get(e.day_number)!.title}` : ""}`
                      : e.note ?? undefined
                  }
                  onDelete={() => onDeleteExpense(e.id)}
                />
              ))}
            </Section>
          ) : (
            !bookingsWithCost.length && (
              <p className="text-sm text-stone-400 text-center py-8">
                No expenses yet. Tap + to add one.
              </p>
            )
          )}
        </>
      )}

      {/* ── By Day ──────────────────────────────────────────────────────── */}
      {tab === "by-day" && (() => {
        const byDay: Record<number | "trip", (Expense | Booking)[]> = { trip: [] };
        for (const e of expenses) {
          const key = e.day_number ?? "trip";
          if (!byDay[key]) byDay[key] = [];
          byDay[key].push(e);
        }
        for (const b of bookingsWithCost) {
          byDay.trip.push(b);
        }

        const dayGroups = days
          .map((d) => ({ key: d.day_number, label: `Day ${d.day_number}${d.title ? ` — ${d.title}` : ""}`, items: byDay[d.day_number] ?? [] }))
          .filter((g) => g.items.length > 0);

        const tripItems = byDay.trip ?? [];

        if (dayGroups.length === 0 && tripItems.length === 0) {
          return <p className="text-sm text-stone-400 text-center py-8">No expenses yet.</p>;
        }

        return (
          <>
            {dayGroups.map((g) => (
              <Section
                key={g.key}
                title={g.label}
                total={(g.items as Expense[]).reduce((s, e) => s + e.cost, 0)}
              >
                {(g.items as Expense[]).map((e) => (
                  <ExpenseRow
                    key={e.id}
                    title={e.title}
                    amount={e.cost}
                    icon={EXPENSE_CATEGORY_ICONS[e.category]}
                    sub={e.note ?? undefined}
                    onDelete={() => onDeleteExpense(e.id)}
                  />
                ))}
              </Section>
            ))}
            {tripItems.length > 0 && (
              <Section
                title="Trip-wide"
                total={tripItems.reduce((s, i) => s + ((i as Expense).cost ?? (i as Booking).cost ?? 0), 0)}
              >
                {tripItems.map((item) => {
                  const isBooking = "confirmation_number" in item;
                  return (
                    <ExpenseRow
                      key={item.id}
                      title={isBooking ? (item as Booking).provider : (item as Expense).title}
                      amount={isBooking ? (item as Booking).cost! : (item as Expense).cost}
                      icon={isBooking ? (BOOKING_TYPE_ICONS[(item as Booking).type] ?? "📋") : EXPENSE_CATEGORY_ICONS[(item as Expense).category]}
                      onDelete={!isBooking ? () => onDeleteExpense(item.id) : undefined}
                    />
                  );
                })}
              </Section>
            )}
          </>
        );
      })()}

      {/* ── By Category ─────────────────────────────────────────────────── */}
      {tab === "by-category" && (() => {
        const byCategory: Partial<Record<ExpenseCategory, Expense[]>> = {};
        for (const e of expenses) {
          if (!byCategory[e.category]) byCategory[e.category] = [];
          byCategory[e.category]!.push(e);
        }

        const catGroups = (Object.entries(byCategory) as [ExpenseCategory, Expense[]][])
          .sort((a, b) => b[1].reduce((s, e) => s + e.cost, 0) - a[1].reduce((s, e) => s + e.cost, 0));

        if (catGroups.length === 0) {
          return <p className="text-sm text-stone-400 text-center py-8">No expenses yet.</p>;
        }

        return catGroups.map(([cat, items]) => (
          <Section
            key={cat}
            title={`${EXPENSE_CATEGORY_ICONS[cat]} ${EXPENSE_CATEGORY_LABELS[cat]}`}
            total={items.reduce((s, e) => s + e.cost, 0)}
          >
            {items.map((e) => (
              <ExpenseRow
                key={e.id}
                title={e.title}
                amount={e.cost}
                icon={EXPENSE_CATEGORY_ICONS[e.category]}
                sub={
                  e.day_number != null
                    ? `Day ${e.day_number}${dayMap.get(e.day_number)?.title ? ` — ${dayMap.get(e.day_number)!.title}` : ""}`
                    : undefined
                }
                onDelete={() => onDeleteExpense(e.id)}
              />
            ))}
          </Section>
        ));
      })()}
    </div>
  );
}
