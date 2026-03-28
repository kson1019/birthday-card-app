import { notFound } from "next/navigation";
import { getTripWithDays } from "@/lib/dibotrip/db/trips";
import TripDetailClient from "@/components/dibotrip/TripDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tripId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { tripId } = await params;
  const trip = await getTripWithDays(tripId);
  return { title: trip ? `${trip.name} — DiboTrip` : "Trip not found" };
}

export default async function TripDetailPage({ params }: Props) {
  const { tripId } = await params;
  const trip = await getTripWithDays(tripId);
  if (!trip) notFound();
  return <TripDetailClient initialTrip={trip} />;
}
