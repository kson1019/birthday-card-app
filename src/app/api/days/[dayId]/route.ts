import { NextResponse } from "next/server";
import { getDay, updateDay, deleteDay } from "@/lib/dibotrip/db/itinerary";

interface Params {
  params: Promise<{ dayId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { dayId } = await params;
    const day = await getDay(dayId);
    if (!day) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    return NextResponse.json({ data: day });
  } catch (err) {
    console.error("GET /api/days/[dayId]", err);
    return NextResponse.json({ error: "Failed to fetch day" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { dayId } = await params;
    const body = await request.json();
    const day = await updateDay(dayId, body);
    if (!day) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    return NextResponse.json({ data: day });
  } catch (err) {
    console.error("PUT /api/days/[dayId]", err);
    return NextResponse.json({ error: "Failed to update day" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { dayId } = await params;
    const existing = await getDay(dayId);
    if (!existing) return NextResponse.json({ error: "Day not found" }, { status: 404 });
    await deleteDay(dayId);
    return NextResponse.json({ data: { id: dayId } });
  } catch (err) {
    console.error("DELETE /api/days/[dayId]", err);
    return NextResponse.json({ error: "Failed to delete day" }, { status: 500 });
  }
}
