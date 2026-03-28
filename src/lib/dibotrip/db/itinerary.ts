import { ulid } from "ulid";
import { db } from "./client";
import type {
  ItineraryDay,
  DayWithActivities,
  ActivityWithBookings,
} from "./types";
import { getActivitiesWithBookings } from "./activities";

function rowToDay(row: Record<string, unknown>): ItineraryDay {
  return {
    id: row.id as string,
    trip_id: row.trip_id as string,
    date: row.date as string,
    day_number: row.day_number as number,
    title: (row.title as string) ?? null,
    subtitle: (row.subtitle as string) ?? null,
    tags: row.tags ? JSON.parse(row.tags as string) : null,
    tip: (row.tip as string) ?? null,
    skipped: row.skipped as number,
    notes: (row.notes as string) ?? null,
  };
}

export async function getDaysForTrip(tripId: string): Promise<ItineraryDay[]> {
  const result = await db.execute({
    sql: "SELECT * FROM itinerary_days WHERE trip_id = ? ORDER BY day_number ASC",
    args: [tripId],
  });
  return result.rows.map((r) => rowToDay(r as Record<string, unknown>));
}

export async function getDaysWithActivities(
  tripId: string
): Promise<DayWithActivities[]> {
  const days = await getDaysForTrip(tripId);
  const daysWithActivities = await Promise.all(
    days.map(async (day) => {
      const activities: ActivityWithBookings[] = await getActivitiesWithBookings(
        day.id
      );
      return { ...day, activities };
    })
  );
  return daysWithActivities;
}

export async function getDay(id: string): Promise<ItineraryDay | null> {
  const result = await db.execute({
    sql: "SELECT * FROM itinerary_days WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToDay(result.rows[0] as Record<string, unknown>);
}

export interface CreateDayInput {
  trip_id: string;
  date: string;
  day_number: number;
  title?: string | null;
  subtitle?: string | null;
  tags?: string[] | null;
  tip?: string | null;
  notes?: string | null;
}

export async function createDay(input: CreateDayInput): Promise<ItineraryDay> {
  const id = ulid();
  await db.execute({
    sql: `INSERT INTO itinerary_days (id, trip_id, date, day_number, title, subtitle, tags, tip, skipped, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    args: [
      id,
      input.trip_id,
      input.date,
      input.day_number,
      input.title ?? null,
      input.subtitle ?? null,
      input.tags ? JSON.stringify(input.tags) : null,
      input.tip ?? null,
      input.notes ?? null,
    ],
  });
  return (await getDay(id))!;
}

export interface UpdateDayInput {
  title?: string | null;
  subtitle?: string | null;
  tags?: string[] | null;
  tip?: string | null;
  notes?: string | null;
  skipped?: number;
  day_number?: number;
  date?: string;
}

export async function updateDay(
  id: string,
  input: UpdateDayInput
): Promise<ItineraryDay | null> {
  const fields: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.title !== undefined) { fields.push("title = ?"); args.push(input.title ?? null); }
  if (input.subtitle !== undefined) { fields.push("subtitle = ?"); args.push(input.subtitle ?? null); }
  if (input.tags !== undefined) { fields.push("tags = ?"); args.push(input.tags ? JSON.stringify(input.tags) : null); }
  if (input.tip !== undefined) { fields.push("tip = ?"); args.push(input.tip ?? null); }
  if (input.notes !== undefined) { fields.push("notes = ?"); args.push(input.notes ?? null); }
  if (input.skipped !== undefined) { fields.push("skipped = ?"); args.push(input.skipped); }
  if (input.day_number !== undefined) { fields.push("day_number = ?"); args.push(input.day_number); }
  if (input.date !== undefined) { fields.push("date = ?"); args.push(input.date); }

  if (fields.length === 0) return getDay(id);

  args.push(id);
  await db.execute({
    sql: `UPDATE itinerary_days SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  return getDay(id);
}

export async function deleteDay(id: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM itinerary_days WHERE id = ?",
    args: [id],
  });
}

/**
 * Reorder days for a trip: accepts an ordered array of day IDs and
 * reassigns day_number (1-based) and shifts dates accordingly.
 */
export async function reorderDays(
  tripId: string,
  orderedDayIds: string[]
): Promise<ItineraryDay[]> {
  // Get the trip start date to recompute day dates
  const firstDay = await getDay(orderedDayIds[0]);
  if (!firstDay) throw new Error("Day not found");

  const updates = orderedDayIds.map((id, index) => ({ id, day_number: index + 1 }));

  for (const update of updates) {
    await db.execute({
      sql: "UPDATE itinerary_days SET day_number = ? WHERE id = ? AND trip_id = ?",
      args: [update.day_number, update.id, tripId],
    });
  }

  return getDaysForTrip(tripId);
}
