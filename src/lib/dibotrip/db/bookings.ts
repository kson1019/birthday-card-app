import { ulid } from "ulid";
import { db } from "./client";
import type { Booking } from "./types";

function rowToBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    trip_id: row.trip_id as string,
    activity_id: (row.activity_id as string) ?? null,
    type: row.type as Booking["type"],
    provider: row.provider as string,
    confirmation_number: row.confirmation_number as string,
    check_in: (row.check_in as string) ?? null,
    check_out: (row.check_out as string) ?? null,
    details: row.details ? JSON.parse(row.details as string) : null,
    cost: (row.cost as number) ?? null,
    notes: (row.notes as string) ?? null,
  };
}

export async function getBookingsForTrip(tripId: string): Promise<Booking[]> {
  const result = await db.execute({
    sql: "SELECT * FROM bookings WHERE trip_id = ? ORDER BY check_in ASC",
    args: [tripId],
  });
  return result.rows.map((r) => rowToBooking(r as Record<string, unknown>));
}

export async function getBookingsForActivity(
  activityId: string
): Promise<Booking[]> {
  const result = await db.execute({
    sql: "SELECT * FROM bookings WHERE activity_id = ?",
    args: [activityId],
  });
  return result.rows.map((r) => rowToBooking(r as Record<string, unknown>));
}

export async function getBooking(id: string): Promise<Booking | null> {
  const result = await db.execute({
    sql: "SELECT * FROM bookings WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToBooking(result.rows[0] as Record<string, unknown>);
}

export interface CreateBookingInput {
  trip_id: string;
  activity_id?: string | null;
  type: Booking["type"];
  provider: string;
  confirmation_number: string;
  check_in?: string | null;
  check_out?: string | null;
  details?: Record<string, unknown> | null;
  cost?: number | null;
  notes?: string | null;
}

export async function createBooking(
  input: CreateBookingInput
): Promise<Booking> {
  const id = ulid();
  await db.execute({
    sql: `INSERT INTO bookings
          (id, trip_id, activity_id, type, provider, confirmation_number, check_in, check_out, details, cost, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.trip_id,
      input.activity_id ?? null,
      input.type,
      input.provider,
      input.confirmation_number,
      input.check_in ?? null,
      input.check_out ?? null,
      input.details ? JSON.stringify(input.details) : null,
      input.cost ?? null,
      input.notes ?? null,
    ],
  });
  return (await getBooking(id))!;
}

export interface UpdateBookingInput {
  activity_id?: string | null;
  type?: Booking["type"];
  provider?: string;
  confirmation_number?: string;
  check_in?: string | null;
  check_out?: string | null;
  details?: Record<string, unknown> | null;
  cost?: number | null;
  notes?: string | null;
}

export async function updateBooking(
  id: string,
  input: UpdateBookingInput
): Promise<Booking | null> {
  const fields: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.activity_id !== undefined) { fields.push("activity_id = ?"); args.push(input.activity_id ?? null); }
  if (input.type !== undefined) { fields.push("type = ?"); args.push(input.type); }
  if (input.provider !== undefined) { fields.push("provider = ?"); args.push(input.provider); }
  if (input.confirmation_number !== undefined) { fields.push("confirmation_number = ?"); args.push(input.confirmation_number); }
  if (input.check_in !== undefined) { fields.push("check_in = ?"); args.push(input.check_in ?? null); }
  if (input.check_out !== undefined) { fields.push("check_out = ?"); args.push(input.check_out ?? null); }
  if (input.details !== undefined) { fields.push("details = ?"); args.push(input.details ? JSON.stringify(input.details) : null); }
  if (input.cost !== undefined) { fields.push("cost = ?"); args.push(input.cost ?? null); }
  if (input.notes !== undefined) { fields.push("notes = ?"); args.push(input.notes ?? null); }

  if (fields.length === 0) return getBooking(id);

  args.push(id);
  await db.execute({
    sql: `UPDATE bookings SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  return getBooking(id);
}

export async function deleteBooking(id: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM bookings WHERE id = ?",
    args: [id],
  });
}
