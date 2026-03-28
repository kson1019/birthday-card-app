"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Booking, Expense, TripWithDays } from "@/lib/dibotrip/db/types";
import CostSummaryCard from "./CostSummaryCard";
import CategoryBreakdown from "./CategoryBreakdown";
import ExpenseList from "./ExpenseList";
import AddExpenseSheet from "./AddExpenseSheet";

interface Props {
  trip: TripWithDays;
  initialBookings: Booking[];
  initialExpenses: Expense[];
}

export default function ExpensesClient({
  trip,
  initialBookings,
  initialExpenses,
}: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const days = trip.days.map((d) => ({
    day_number: d.day_number,
    title: d.title,
  }));

  async function handleDeleteExpense(expenseId: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete expense");
      setExpenses(initialExpenses);
    } else {
      toast.success("Expense removed");
    }
  }

  return (
    <>
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Back nav */}
          <Link
            href={`/dibotrip/${trip.id}`}
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors mb-5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {trip.name}
          </Link>

          <h1 className="text-2xl font-bold text-stone-900 mb-4">💰 Expenses</h1>

          <CostSummaryCard bookings={initialBookings} expenses={expenses} />
          <CategoryBreakdown expenses={expenses} />

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-stone-700">All entries</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Expense
            </button>
          </div>

          <ExpenseList
            expenses={expenses}
            bookings={initialBookings}
            days={days}
            onDeleteExpense={handleDeleteExpense}
          />

          <div className="h-10" />
        </div>
      </main>

      {/* Floating add button (mobile) */}
      <button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors sm:hidden"
        aria-label="Add expense"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {showAddExpense && (
        <AddExpenseSheet
          tripId={trip.id}
          days={days}
          onClose={() => setShowAddExpense(false)}
          onSaved={(newExpense) => setExpenses((prev) => [...prev, newExpense])}
        />
      )}
    </>
  );
}
