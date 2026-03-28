import { ulid } from "ulid";
import { db } from "./client";
import type { Expense } from "./types";

function rowToExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    trip_id: row.trip_id as string,
    activity_id: (row.activity_id as string) ?? null,
    title: row.title as string,
    cost: row.cost as number,
    category: row.category as Expense["category"],
    day_number: (row.day_number as number) ?? null,
    date: (row.date as string) ?? null,
    note: (row.note as string) ?? null,
    created_at: row.created_at as string,
  };
}

export async function getExpensesForTrip(tripId: string): Promise<Expense[]> {
  const result = await db.execute({
    sql: "SELECT * FROM expenses WHERE trip_id = ? ORDER BY day_number ASC, created_at ASC",
    args: [tripId],
  });
  return result.rows.map((r) => rowToExpense(r as Record<string, unknown>));
}

export async function getExpense(id: string): Promise<Expense | null> {
  const result = await db.execute({
    sql: "SELECT * FROM expenses WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToExpense(result.rows[0] as Record<string, unknown>);
}

export interface CreateExpenseInput {
  trip_id: string;
  activity_id?: string | null;
  title: string;
  cost: number;
  category: Expense["category"];
  day_number?: number | null;
  date?: string | null;
  note?: string | null;
}

export async function createExpense(
  input: CreateExpenseInput
): Promise<Expense> {
  const id = ulid();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO expenses
          (id, trip_id, activity_id, title, cost, category, day_number, date, note, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.trip_id,
      input.activity_id ?? null,
      input.title,
      input.cost,
      input.category,
      input.day_number ?? null,
      input.date ?? null,
      input.note ?? null,
      now,
    ],
  });
  return (await getExpense(id))!;
}

export interface UpdateExpenseInput {
  title?: string;
  cost?: number;
  category?: Expense["category"];
  activity_id?: string | null;
  day_number?: number | null;
  date?: string | null;
  note?: string | null;
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<Expense | null> {
  const fields: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.title !== undefined) { fields.push("title = ?"); args.push(input.title); }
  if (input.cost !== undefined) { fields.push("cost = ?"); args.push(input.cost); }
  if (input.category !== undefined) { fields.push("category = ?"); args.push(input.category); }
  if (input.activity_id !== undefined) { fields.push("activity_id = ?"); args.push(input.activity_id ?? null); }
  if (input.day_number !== undefined) { fields.push("day_number = ?"); args.push(input.day_number ?? null); }
  if (input.date !== undefined) { fields.push("date = ?"); args.push(input.date ?? null); }
  if (input.note !== undefined) { fields.push("note = ?"); args.push(input.note ?? null); }

  if (fields.length === 0) return getExpense(id);

  args.push(id);
  await db.execute({
    sql: `UPDATE expenses SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  return getExpense(id);
}

export async function deleteExpense(id: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM expenses WHERE id = ?",
    args: [id],
  });
}
