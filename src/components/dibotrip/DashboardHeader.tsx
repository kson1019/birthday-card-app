import Link from "next/link";

export default function DashboardHeader({ tripCount }: { tripCount: number }) {
  return (
    <header className="flex items-center justify-between py-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
          DiboTrip
        </h1>
        <p className="text-sm text-stone-400 mt-0.5">
          {tripCount === 0
            ? "Family trips, organized."
            : `${tripCount} ${tripCount === 1 ? "trip" : "trips"}`}
        </p>
      </div>
      <Link
        href="/dibotrip/new"
        className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        New Trip
      </Link>
    </header>
  );
}
