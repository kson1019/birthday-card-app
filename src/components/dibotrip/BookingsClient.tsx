"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Booking, TripWithDays } from "@/lib/dibotrip/db/types";
import BookingSummaryBar from "./BookingSummaryBar";
import BookingsList from "./BookingsList";
import AddBookingSheet from "./AddBookingSheet";
import EditBookingSheet from "./EditBookingSheet";

interface Props {
  trip: TripWithDays;
  initialBookings: Booking[];
}

export default function BookingsClient({ trip, initialBookings }: Props) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  return (
    <>
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Back nav */}
          <div className="flex items-center justify-between mb-5">
            <Link
              href={`/dibotrip/${trip.id}`}
              className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {trip.name}
            </Link>
            <button
              onClick={() => setShowAddBooking(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Booking
            </button>
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-4">🎫 Bookings</h1>

          <BookingSummaryBar bookings={bookings} />
          <BookingsList
            bookings={bookings}
            days={trip.days}
            onEdit={setEditingBooking}
          />

          <div className="h-10" />
        </div>
      </main>

      {showAddBooking && (
        <AddBookingSheet
          tripId={trip.id}
          days={trip.days}
          onClose={() => setShowAddBooking(false)}
          onSaved={() => {
            setShowAddBooking(false);
            router.refresh();
          }}
        />
      )}

      {editingBooking && (
        <EditBookingSheet
          booking={editingBooking}
          days={trip.days}
          onClose={() => setEditingBooking(null)}
          onSaved={(updated) => {
            setBookings((prev) =>
              prev.map((b) => (b.id === updated.id ? updated : b))
            );
            setEditingBooking(null);
          }}
          onDeleted={(id) => {
            setBookings((prev) => prev.filter((b) => b.id !== id));
            setEditingBooking(null);
          }}
        />
      )}
    </>
  );
}
