import { notFound } from "next/navigation";
import { getTripWithDays } from "@/lib/dibotrip/db/trips";
import { getBookingsForTrip } from "@/lib/dibotrip/db/bookings";
import { getExpensesForTrip } from "@/lib/dibotrip/db/expenses";
import ExpensesClient from "@/components/dibotrip/ExpensesClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tripId: string }>;
}

export default async function ExpensesPage({ params }: Props) {
  const { tripId } = await params;
  const [trip, bookings, expenses] = await Promise.all([
    getTripWithDays(tripId),
    getBookingsForTrip(tripId),
    getExpensesForTrip(tripId),
  ]);
  if (!trip) notFound();
  return (
    <ExpensesClient
      trip={trip}
      initialBookings={bookings}
      initialExpenses={expenses}
    />
  );
}
