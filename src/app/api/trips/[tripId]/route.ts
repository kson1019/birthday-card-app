import { NextResponse } from "next/server";
import { getTrip, getTripWithDays, updateTrip, deleteTrip } from "@/lib/dibotrip/db/trips";

interface Params {
  params: Promise<{ tripId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const trip = await getTripWithDays(tripId);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json({ data: trip });
  } catch (err) {
    console.error("GET /api/trips/[tripId]", err);
    return NextResponse.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const trip = await updateTrip(tripId, body);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json({ data: trip });
  } catch (err) {
    console.error("PUT /api/trips/[tripId]", err);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const existing = await getTrip(tripId);
    if (!existing) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    await deleteTrip(tripId);
    return NextResponse.json({ data: { id: tripId } });
  } catch (err) {
    console.error("DELETE /api/trips/[tripId]", err);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
