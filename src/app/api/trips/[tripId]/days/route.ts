import { NextResponse } from "next/server";
import { getDaysForTrip, createDay } from "@/lib/dibotrip/db/itinerary";

interface Params {
  params: Promise<{ tripId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const days = await getDaysForTrip(tripId);
    return NextResponse.json({ data: days });
  } catch (err) {
    console.error("GET /api/trips/[tripId]/days", err);
    return NextResponse.json({ error: "Failed to fetch days" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const day = await createDay({ ...body, trip_id: tripId });
    return NextResponse.json({ data: day }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips/[tripId]/days", err);
    return NextResponse.json({ error: "Failed to create day" }, { status: 500 });
  }
}
