import { NextResponse } from "next/server";
import { reorderDays } from "@/lib/dibotrip/db/itinerary";

interface Params {
  params: Promise<{ tripId: string }>;
}

/** PUT /api/trips/[tripId]/days/reorder — body: { dayIds: string[] } */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const { dayIds } = await request.json();
    if (!Array.isArray(dayIds) || dayIds.length === 0) {
      return NextResponse.json(
        { error: "dayIds must be a non-empty array" },
        { status: 400 }
      );
    }
    const days = await reorderDays(tripId, dayIds);
    return NextResponse.json({ data: days });
  } catch (err) {
    console.error("PUT /api/trips/[tripId]/days/reorder", err);
    return NextResponse.json({ error: "Failed to reorder days" }, { status: 500 });
  }
}
