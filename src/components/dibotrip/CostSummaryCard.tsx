import type { Booking, Expense } from "@/lib/dibotrip/db/types";

interface Props {
  bookings: Booking[];
  expenses: Expense[];
}

export default function CostSummaryCard({ bookings, expenses }: Props) {
  const bookingTotal = bookings.reduce((s, b) => s + (b.cost ?? 0), 0);
  const expenseTotal = expenses.reduce((s, e) => s + e.cost, 0);
  const grandTotal = bookingTotal + expenseTotal;

  const bookingsWithCost = bookings.filter((b) => b.cost != null && b.cost > 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4">
      {/* Grand total */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs text-stone-400 mb-0.5">Total trip cost</p>
          <p className="text-3xl font-bold text-stone-900">
            ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="text-right text-xs text-stone-400">
          <p>{bookingsWithCost.length} pre-booked</p>
          <p>{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Breakdown bar */}
      {grandTotal > 0 && (
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden flex mb-3">
          {bookingTotal > 0 && (
            <div
              className="bg-amber-400 h-full transition-all"
              style={{ width: `${(bookingTotal / grandTotal) * 100}%` }}
            />
          )}
          {expenseTotal > 0 && (
            <div
              className="bg-rose-400 h-full transition-all"
              style={{ width: `${(expenseTotal / grandTotal) * 100}%` }}
            />
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-stone-400">Pre-booked</p>
            <p className="text-sm font-semibold text-stone-700">
              ${bookingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-stone-400">Expenses</p>
            <p className="text-sm font-semibold text-stone-700">
              ${expenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
