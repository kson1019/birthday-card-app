import { ulid } from "ulid";
import { db } from "./client";
import type { PackingItem } from "./types";

function rowToPackingItem(row: Record<string, unknown>): PackingItem {
  return {
    id: row.id as string,
    trip_id: row.trip_id as string,
    item: row.item as string,
    category: (row.category as PackingItem["category"]) ?? null,
    packed: row.packed as number,
    assigned_to: (row.assigned_to as string) ?? null,
    quantity: row.quantity as number,
  };
}

export async function getPackingForTrip(tripId: string): Promise<PackingItem[]> {
  const result = await db.execute({
    sql: "SELECT * FROM packing_items WHERE trip_id = ? ORDER BY category ASC, item ASC",
    args: [tripId],
  });
  return result.rows.map((r) => rowToPackingItem(r as Record<string, unknown>));
}

export async function getPackingItem(id: string): Promise<PackingItem | null> {
  const result = await db.execute({
    sql: "SELECT * FROM packing_items WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToPackingItem(result.rows[0] as Record<string, unknown>);
}

export interface CreatePackingItemInput {
  trip_id: string;
  item: string;
  category?: PackingItem["category"];
  assigned_to?: string | null;
  quantity?: number;
}

export async function createPackingItem(
  input: CreatePackingItemInput
): Promise<PackingItem> {
  const id = ulid();
  await db.execute({
    sql: `INSERT INTO packing_items (id, trip_id, item, category, packed, assigned_to, quantity)
          VALUES (?, ?, ?, ?, 0, ?, ?)`,
    args: [
      id,
      input.trip_id,
      input.item,
      input.category ?? null,
      input.assigned_to ?? null,
      input.quantity ?? 1,
    ],
  });
  return (await getPackingItem(id))!;
}

export async function togglePacked(
  id: string,
  packed: boolean
): Promise<PackingItem | null> {
  await db.execute({
    sql: "UPDATE packing_items SET packed = ? WHERE id = ?",
    args: [packed ? 1 : 0, id],
  });
  return getPackingItem(id);
}

export async function deletePackingItem(id: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM packing_items WHERE id = ?",
    args: [id],
  });
}
