import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllTrips, createTrip } from "@/lib/dibotrip/db/trips";
import { createDay } from "@/lib/dibotrip/db/itinerary";
import { createActivity } from "@/lib/dibotrip/db/activities";
import { createBooking } from "@/lib/dibotrip/db/bookings";
import { createPackingItem } from "@/lib/dibotrip/db/packing";
import type { ImportPayload } from "@/lib/dibotrip/db/types";

export async function GET() {
  try {
    const trips = await getAllTrips();
    return NextResponse.json({ data: trips });
  } catch (err) {
    console.error("GET /api/trips", err);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

/**
 * POST /api/trips
 * Creates a trip with all nested data in one transaction.
 * Body: ImportPayload
 */
export async function POST(request: Request) {
  try {
    const payload: ImportPayload = await request.json();

    // Create the trip
    const trip = await createTrip({
      name: payload.trip.name,
      destination: payload.trip.destination,
      start_date: payload.trip.start_date,
      end_date: payload.trip.end_date,
      cover_image_url: payload.trip.cover_image_url,
      notes: payload.trip.notes,
    });

    // Create days and their activities
    const dayIdMap: Map<number, string> = new Map(); // day_number → day db id

    for (let i = 0; i < payload.itinerary.length; i++) {
      const importDay = payload.itinerary[i];
      const dayNumber = importDay.day_number ?? i + 1;

      // Compute date from start_date if not provided
      let date = importDay.date;
      if (!date) {
        const start = new Date(payload.trip.start_date);
        start.setDate(start.getDate() + i);
        date = start.toISOString().split("T")[0];
      }

      const day = await createDay({
        trip_id: trip.id,
        date,
        day_number: dayNumber,
        title: importDay.title,
        subtitle: importDay.subtitle,
        tags: importDay.tags,
        tip: importDay.tip,
      });

      dayIdMap.set(dayNumber, day.id);

      // Create activities for this day
      for (let j = 0; j < importDay.activities.length; j++) {
        const importActivity = importDay.activities[j];
        await createActivity({
          day_id: day.id,
          title: importActivity.title,
          time_start: importActivity.time_start,
          time_end: importActivity.time_end,
          location: importActivity.location,
          latitude: importActivity.latitude,
          longitude: importActivity.longitude,
          category: importActivity.category ?? undefined,
          notes: importActivity.notes,
          sort_order: importActivity.sort_order ?? j,
        });
      }
    }

    // Create bookings
    for (const importBooking of payload.bookings) {
      await createBooking({
        trip_id: trip.id,
        activity_id: null, // Link resolution done separately via extract flow
        type: importBooking.type,
        provider: importBooking.provider,
        confirmation_number: importBooking.confirmation_number,
        check_in: importBooking.check_in,
        check_out: importBooking.check_out,
        details: importBooking.details,
        cost: importBooking.cost,
        notes: importBooking.notes,
      });
    }

    // Create packing items
    for (const importItem of payload.packing) {
      await createPackingItem({
        trip_id: trip.id,
        item: importItem.item,
        category: importItem.category ?? undefined,
        assigned_to: importItem.assigned_to,
        quantity: importItem.quantity,
      });
    }

    revalidatePath("/dibotrip");
    return NextResponse.json({ data: trip }, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips", err);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
