import Link from "next/link";
import { getAllTrips } from "@/lib/dibotrip/db/trips";
import DashboardHeader from "@/components/dibotrip/DashboardHeader";
import TripCard from "@/components/dibotrip/TripCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "DiboTrip" };

export default async function DiboTripDashboard() {
  const trips = await getAllTrips();

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <DashboardHeader tripCount={trips.length} />

        {trips.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            className={`grid gap-4 pb-12 ${
              trips.length === 1
                ? "grid-cols-1"
                : trips.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {trips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-5 text-3xl">
        🗺️
      </div>
      <h2 className="text-xl font-semibold text-stone-800 mb-2">
        No trips yet
      </h2>
      <p className="text-stone-400 text-sm mb-8 max-w-xs leading-relaxed">
        Paste your trip plan from Claude, a travel email, or any text to import
        it in seconds.
      </p>
      <Link
        href="/dibotrip/new"
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors duration-150 shadow-sm"
      >
        Plan your first trip →
      </Link>
    </div>
  );
}
