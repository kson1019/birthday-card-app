import { db } from "@/lib/db";
import { goals, goalTasks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const goalId = parseInt(id);

  const goalRows = await db
    .select()
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1);

  if (!goalRows.length) {
    return Response.json({ error: "Goal not found" }, { status: 404 });
  }

  const tasks = await db
    .select()
    .from(goalTasks)
    .where(eq(goalTasks.goalId, goalId))
    .orderBy(asc(goalTasks.weekNumber), asc(goalTasks.sortOrder));

  return Response.json({ data: { ...goalRows[0], tasks } });
}
