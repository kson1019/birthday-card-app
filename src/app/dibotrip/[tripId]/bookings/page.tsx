import { notFound } from "next/navigation";
import { getTripWithDays } from "@/lib/dibotrip/db/trips";
import { getBookingsForTrip } from "@/lib/dibotrip/db/bookings";
import BookingsClient from "@/components/dibotrip/BookingsClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tripId: string }>;
}

export default async function BookingsPage({ params }: Props) {
  const { tripId } = await params;
  const [trip, bookings] = await Promise.all([
    getTripWithDays(tripId),
    getBookingsForTrip(tripId),
  ]);
  if (!trip) notFound();
  return <BookingsClient trip={trip} initialBookings={bookings} />;
}
