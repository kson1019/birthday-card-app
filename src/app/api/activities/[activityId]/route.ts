import { NextResponse } from "next/server";
import { getActivity, updateActivity, deleteActivity } from "@/lib/dibotrip/db/activities";

interface Params {
  params: Promise<{ activityId: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { activityId } = await params;
    const activity = await getActivity(activityId);
    if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    return NextResponse.json({ data: activity });
  } catch (err) {
    console.error("GET /api/activities/[activityId]", err);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { activityId } = await params;
    const body = await request.json();
    const activity = await updateActivity(activityId, body);
    if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    return NextResponse.json({ data: activity });
  } catch (err) {
    console.error("PUT /api/activities/[activityId]", err);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { activityId } = await params;
    const existing = await getActivity(activityId);
    if (!existing) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    await deleteActivity(activityId);
    return NextResponse.json({ data: { id: activityId } });
  } catch (err) {
    console.error("DELETE /api/activities/[activityId]", err);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
