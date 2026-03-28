import { NextResponse } from "next/server";
import { getActivitiesForDay, createActivity } from "@/lib/dibotrip/db/activities";

interface Params {
  params: Promise<{ dayId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { dayId } = await params;
    const activities = await getActivitiesForDay(dayId);
    return NextResponse.json({ data: activities });
  } catch (err) {
    console.error("GET /api/days/[dayId]/activities", err);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { dayId } = await params;
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    const activity = await createActivity({ ...body, day_id: dayId });
    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (err) {
    console.error("POST /api/days/[dayId]/activities", err);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
