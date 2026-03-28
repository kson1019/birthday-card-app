import { ulid } from "ulid";
import { db } from "./client";
import type { Trip, TripStatus, DayWithActivities, TripWithDays } from "./types";
import { getDaysWithActivities } from "./itinerary";
import { getBookingsForTrip } from "./bookings";

function computeStatus(startDate: string, endDate: string): TripStatus {
  // Use local date (not UTC) so the status matches the user's calendar day
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  if (today < startDate) return "upcoming";
  if (today > endDate) return "completed";
  return "active";
}

function rowToTrip(row: Record<string, unknown>): Trip {
  const trip: Trip = {
    id: row.id as string,
    name: row.name as string,
    destination: row.destination as string,
    start_date: row.start_date as string,
    end_date: row.end_date as string,
    cover_image_url: (row.cover_image_url as string) ?? null,
    notes: (row.notes as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
  trip.status = computeStatus(trip.start_date, trip.end_date);
  return trip;
}

export async function getAllTrips(): Promise<Trip[]> {
  const result = await db.execute("SELECT * FROM trips ORDER BY start_date ASC");
  const trips = result.rows.map((r) => rowToTrip(r as Record<string, unknown>));

  // Sort: active first, then upcoming, then completed
  const order: TripStatus[] = ["active", "upcoming", "completed", "draft"];
  return trips.sort(
    (a, b) => order.indexOf(a.status!) - order.indexOf(b.status!)
  );
}

export async function getTrip(id: string): Promise<Trip | null> {
  const result = await db.execute({
    sql: "SELECT * FROM trips WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToTrip(result.rows[0] as Record<string, unknown>);
}

export async function getTripWithDays(id: string): Promise<TripWithDays | null> {
  const trip = await getTrip(id);
  if (!trip) return null;

  const [days, bookings] = await Promise.all([
    getDaysWithActivities(id),
    getBookingsForTrip(id),
  ]);

  return { ...trip, days, bookings };
}

export interface CreateTripInput {
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image_url?: string | null;
  notes?: string | null;
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const id = ulid();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO trips (id, name, destination, start_date, end_date, cover_image_url, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.name,
      input.destination,
      input.start_date,
      input.end_date,
      input.cover_image_url ?? null,
      input.notes ?? null,
      now,
      now,
    ],
  });
  return (await getTrip(id))!;
}

export interface UpdateTripInput {
  name?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  cover_image_url?: string | null;
  notes?: string | null;
}

export async function updateTrip(
  id: string,
  input: UpdateTripInput
): Promise<Trip | null> {
  const fields: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.name !== undefined) { fields.push("name = ?"); args.push(input.name); }
  if (input.destination !== undefined) { fields.push("destination = ?"); args.push(input.destination); }
  if (input.start_date !== undefined) { fields.push("start_date = ?"); args.push(input.start_date); }
  if (input.end_date !== undefined) { fields.push("end_date = ?"); args.push(input.end_date); }
  if (input.cover_image_url !== undefined) { fields.push("cover_image_url = ?"); args.push(input.cover_image_url ?? null); }
  if (input.notes !== undefined) { fields.push("notes = ?"); args.push(input.notes ?? null); }

  if (fields.length === 0) return getTrip(id);

  fields.push("updated_at = ?");
  args.push(new Date().toISOString());
  args.push(id);

  await db.execute({
    sql: `UPDATE trips SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  return getTrip(id);
}

export async function deleteTrip(id: string): Promise<void> {
  await db.execute({ sql: "DELETE FROM trips WHERE id = ?", args: [id] });
}
