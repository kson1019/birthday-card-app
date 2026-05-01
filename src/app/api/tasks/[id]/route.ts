import { db } from "@/lib/db";
import { goalTasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseInt(id);

  const body = await request.json();
  const { isCompleted } = body;

  const rows = await db
    .update(goalTasks)
    .set({
      isCompleted: isCompleted ? 1 : 0,
      completedAt: isCompleted ? new Date().toISOString() : null,
    })
    .where(eq(goalTasks.id, taskId))
    .returning();

  if (!rows.length) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  return Response.json({ data: rows[0] });
}
