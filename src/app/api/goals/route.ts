import { db } from "@/lib/db";
import { goals, goalTasks } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const allGoals = await db
    .select()
    .from(goals)
    .orderBy(desc(goals.createdAt));

  const goalsWithProgress = await Promise.all(
    allGoals.map(async (goal: typeof goals.$inferSelect) => {
      const tasks = await db
        .select({ isCompleted: goalTasks.isCompleted })
        .from(goalTasks)
        .where(eq(goalTasks.goalId, goal.id));

      return {
        ...goal,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t: { isCompleted: number | null }) => t.isCompleted === 1).length,
      };
    })
  );

  return Response.json({ data: goalsWithProgress });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description } = body;

  if (!title?.trim()) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const rows = await db
    .insert(goals)
    .values({ title: title.trim(), description: description?.trim() || null })
    .returning();

  return Response.json({ data: rows[0] });
}
