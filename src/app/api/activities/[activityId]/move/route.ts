import { NextResponse } from "next/server";
import { moveActivity } from "@/lib/dibotrip/db/activities";

interface Params {
  params: Promise<{ activityId: string }>;
}

/**
 * PUT /api/activities/[activityId]/move
 * Body: { targetDayId: string, targetSortOrder: number }
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { activityId } = await params;
    const { targetDayId, targetSortOrder } = await request.json();
    if (!targetDayId) {
      return NextResponse.json({ error: "targetDayId is required" }, { status: 400 });
    }
    const activity = await moveActivity(
      activityId,
      targetDayId,
      targetSortOrder ?? 999
    );
    if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    return NextResponse.json({ data: activity });
  } catch (err) {
    console.error("PUT /api/activities/[activityId]/move", err);
    return NextResponse.json({ error: "Failed to move activity" }, { status: 500 });
  }
}
