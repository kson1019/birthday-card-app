import { ulid } from "ulid";
import { db } from "./client";
import type { Activity, ActivityWithBookings } from "./types";
import { getBookingsForActivity } from "./bookings";

function rowToActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    day_id: row.day_id as string,
    title: row.title as string,
    time_start: (row.time_start as string) ?? null,
    time_end: (row.time_end as string) ?? null,
    location: (row.location as string) ?? null,
    latitude: (row.latitude as number) ?? null,
    longitude: (row.longitude as number) ?? null,
    place_id: (row.place_id as string) ?? null,
    category: (row.category as Activity["category"]) ?? null,
    notes: (row.notes as string) ?? null,
    sort_order: row.sort_order as number,
  };
}

export async function getActivitiesForDay(dayId: string): Promise<Activity[]> {
  const result = await db.execute({
    sql: "SELECT * FROM activities WHERE day_id = ? ORDER BY sort_order ASC",
    args: [dayId],
  });
  return result.rows.map((r) => rowToActivity(r as Record<string, unknown>));
}

export async function getActivitiesWithBookings(
  dayId: string
): Promise<ActivityWithBookings[]> {
  const activities = await getActivitiesForDay(dayId);
  return Promise.all(
    activities.map(async (activity) => ({
      ...activity,
      bookings: await getBookingsForActivity(activity.id),
    }))
  );
}

export async function getActivity(id: string): Promise<Activity | null> {
  const result = await db.execute({
    sql: "SELECT * FROM activities WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToActivity(result.rows[0] as Record<string, unknown>);
}

export interface CreateActivityInput {
  day_id: string;
  title: string;
  time_start?: string | null;
  time_end?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  place_id?: string | null;
  category?: Activity["category"];
  notes?: string | null;
  sort_order?: number;
}

export async function createActivity(
  input: CreateActivityInput
): Promise<Activity> {
  const id = ulid();

  // Auto-assign sort_order if not provided
  let sortOrder = input.sort_order ?? 0;
  if (input.sort_order === undefined) {
    const result = await db.execute({
      sql: "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM activities WHERE day_id = ?",
      args: [input.day_id],
    });
    sortOrder = (result.rows[0] as Record<string, unknown>).next as number;
  }

  await db.execute({
    sql: `INSERT INTO activities
          (id, day_id, title, time_start, time_end, location, latitude, longitude, place_id, category, notes, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.day_id,
      input.title,
      input.time_start ?? null,
      input.time_end ?? null,
      input.location ?? null,
      input.latitude ?? null,
      input.longitude ?? null,
      input.place_id ?? null,
      input.category ?? null,
      input.notes ?? null,
      sortOrder,
    ],
  });
  return (await getActivity(id))!;
}

export interface UpdateActivityInput {
  title?: string;
  time_start?: string | null;
  time_end?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  place_id?: string | null;
  category?: Activity["category"] | null;
  notes?: string | null;
  sort_order?: number;
  day_id?: string;
}

export async function updateActivity(
  id: string,
  input: UpdateActivityInput
): Promise<Activity | null> {
  const fields: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.title !== undefined) { fields.push("title = ?"); args.push(input.title); }
  if (input.time_start !== undefined) { fields.push("time_start = ?"); args.push(input.time_start ?? null); }
  if (input.time_end !== undefined) { fields.push("time_end = ?"); args.push(input.time_end ?? null); }
  if (input.location !== undefined) { fields.push("location = ?"); args.push(input.location ?? null); }
  if (input.latitude !== undefined) { fields.push("latitude = ?"); args.push(input.latitude ?? null); }
  if (input.longitude !== undefined) { fields.push("longitude = ?"); args.push(input.longitude ?? null); }
  if (input.place_id !== undefined) { fields.push("place_id = ?"); args.push(input.place_id ?? null); }
  if (input.category !== undefined) { fields.push("category = ?"); args.push(input.category ?? null); }
  if (input.notes !== undefined) { fields.push("notes = ?"); args.push(input.notes ?? null); }
  if (input.sort_order !== undefined) { fields.push("sort_order = ?"); args.push(input.sort_order); }
  if (input.day_id !== undefined) { fields.push("day_id = ?"); args.push(input.day_id); }

  if (fields.length === 0) return getActivity(id);

  args.push(id);
  await db.execute({
    sql: `UPDATE activities SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  return getActivity(id);
}

export async function deleteActivity(id: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM activities WHERE id = ?",
    args: [id],
  });
}

/**
 * Move an activity to a different day and insert at a given position.
 * Recalculates sort_order for both the source and target day.
 */
export async function moveActivity(
  activityId: string,
  targetDayId: string,
  targetSortOrder: number
): Promise<Activity | null> {
  // Make room in target day
  await db.execute({
    sql: "UPDATE activities SET sort_order = sort_order + 1 WHERE day_id = ? AND sort_order >= ?",
    args: [targetDayId, targetSortOrder],
  });

  // Move and place
  await db.execute({
    sql: "UPDATE activities SET day_id = ?, sort_order = ? WHERE id = ?",
    args: [targetDayId, targetSortOrder, activityId],
  });

  return getActivity(activityId);
}

/**
 * Reorder activities within a day: accepts ordered array of activity IDs
 * and reassigns sort_order (0-based).
 */
export async function reorderActivities(
  dayId: string,
  orderedActivityIds: string[]
): Promise<Activity[]> {
  for (let i = 0; i < orderedActivityIds.length; i++) {
    await db.execute({
      sql: "UPDATE activities SET sort_order = ? WHERE id = ? AND day_id = ?",
      args: [i, orderedActivityIds[i], dayId],
    });
  }
  return getActivitiesForDay(dayId);
}
