import { NextResponse } from "next/server";
import { reorderActivities } from "@/lib/dibotrip/db/activities";

interface Params {
  params: Promise<{ dayId: string }>;
}

/** PUT /api/days/[dayId]/activities/reorder — body: { activityIds: string[] } */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { dayId } = await params;
    const { activityIds } = await request.json();
    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      return NextResponse.json(
        { error: "activityIds must be a non-empty array" },
        { status: 400 }
      );
    }
    const activities = await reorderActivities(dayId, activityIds);
    return NextResponse.json({ data: activities });
  } catch (err) {
    console.error("PUT /api/days/[dayId]/activities/reorder", err);
    return NextResponse.json({ error: "Failed to reorder activities" }, { status: 500 });
  }
}
