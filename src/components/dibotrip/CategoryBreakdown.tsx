import type { Expense, ExpenseCategory } from "@/lib/dibotrip/db/types";

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string }
> = {
  meal: { label: "Meals", icon: "🍽️", color: "bg-orange-400" },
  gas: { label: "Gas", icon: "⛽", color: "bg-yellow-400" },
  groceries: { label: "Groceries", icon: "🛒", color: "bg-lime-400" },
  park_fee: { label: "Park fees", icon: "🏕️", color: "bg-emerald-400" },
  shopping: { label: "Shopping", icon: "🛍️", color: "bg-sky-400" },
  transport: { label: "Transport", icon: "🚌", color: "bg-violet-400" },
  tips: { label: "Tips", icon: "💵", color: "bg-pink-400" },
  other: { label: "Other", icon: "📌", color: "bg-stone-400" },
};

interface Props {
  expenses: Expense[];
}

export default function CategoryBreakdown({ expenses }: Props) {
  if (expenses.length === 0) return null;

  // Aggregate by category
  const totals: Partial<Record<ExpenseCategory, number>> = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.cost;
  }

  const sorted = (Object.entries(totals) as [ExpenseCategory, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  const max = sorted[0]?.[1] ?? 1;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-4">
      <p className="text-sm font-semibold text-stone-700 mb-4">
        Spending by category
      </p>
      <div className="space-y-3">
        {sorted.map(([cat, total]) => {
          const meta = CATEGORY_META[cat];
          const pct = Math.round((total / max) * 100);
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-base w-6 flex-shrink-0">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-stone-600">
                    {meta.label}
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${meta.color} rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
