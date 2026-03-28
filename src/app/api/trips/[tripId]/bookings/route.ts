import { NextResponse } from "next/server";
import { getBookingsForTrip, createBooking } from "@/lib/dibotrip/db/bookings";

interface Params {
  params: Promise<{ tripId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const bookings = await getBookingsForTrip(tripId);
    return NextResponse.json({ data: bookings });
  } catch (err) {
    console.error("GET /api/trips/[tripId]/bookings", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    if (!body.type || !body.provider || !body.confirmation_number) {
      return NextResponse.json(
        { error: "type, provider, and confirmation_number are required" },
        { status: 400 }
      );
    }
    const booking = await createBooking({ ...body, trip_id: tripId });
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips/[tripId]/bookings", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
