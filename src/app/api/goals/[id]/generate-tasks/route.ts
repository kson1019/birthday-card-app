import { db } from "@/lib/db";
import { goals, goalTasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

interface TaskInput {
  title: string;
  description?: string;
}

interface WeekPlan {
  weekNumber: number;
  theme: string;
  tasks: TaskInput[];
}

interface Plan {
  weeks: WeekPlan[];
}

export async function POST(
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

  const goal = goalRows[0];

  const client = new Anthropic();

  const stream = client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 4000,
    system:
      "You are a productivity coach specializing in career development and personal projects. Return only valid JSON with no markdown formatting or code blocks.",
    messages: [
      {
        role: "user",
        content: `Create an 8-week action plan for this goal.

Goal: "${goal.title}"${goal.description ? `\nContext: ${goal.description}` : ""}

Return a JSON object with this exact structure:
{
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Short theme (3-5 words)",
      "tasks": [
        {
          "title": "Specific actionable task",
          "description": "How to do it in 1-2 sentences"
        }
      ]
    }
  ]
}

Requirements:
- Exactly 8 weeks
- Each week has 3-5 specific, concrete tasks
- Tasks must be completable within one week
- Build progressively from foundation to advanced
- Focus on measurable, real-world actions`,
      },
    ],
  });

  const message = await stream.finalMessage();

  const textBlock = message.content.find((b) => b.type === "text");
  const text = textBlock?.type === "text" ? textBlock.text : "";

  let plan: Plan;
  try {
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    plan = JSON.parse(clean);
  } catch {
    return Response.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }

  await db.delete(goalTasks).where(eq(goalTasks.goalId, goalId));

  const tasksToInsert = [];
  for (const week of plan.weeks) {
    for (let i = 0; i < week.tasks.length; i++) {
      tasksToInsert.push({
        goalId,
        weekNumber: week.weekNumber,
        weekTheme: week.theme,
        title: week.tasks[i].title,
        description: week.tasks[i].description || null,
        isCompleted: 0,
        sortOrder: i,
      });
    }
  }

  const inserted = await db.insert(goalTasks).values(tasksToInsert).returning();

  return Response.json({ data: inserted });
}
