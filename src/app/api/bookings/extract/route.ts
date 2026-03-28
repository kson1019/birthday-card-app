import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BOOKING_EXTRACTION_SYSTEM_PROMPT } from "@/lib/dibotrip/ai/prompts";
import { getTripWithDays } from "@/lib/dibotrip/db/trips";
import type { ImportBooking } from "@/lib/dibotrip/db/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/bookings/extract
 * Body: { text: string, tripId: string }
 * Returns: { data: ImportBooking } — extracted booking for preview
 */
export async function POST(request: Request) {
  try {
    const { text, tripId } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }
    if (!tripId) {
      return NextResponse.json({ error: "tripId is required" }, { status: 400 });
    }

    // Build trip context so the model can link the booking to an activity
    const trip = await getTripWithDays(tripId);
    const tripContext = trip
      ? buildTripContext(trip)
      : "No itinerary available yet.";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      system: BOOKING_EXTRACTION_SYSTEM_PROMPT(tripContext),
      messages: [
        {
          role: "user",
          content: `Extract booking information from the following text:\n\n${text}`,
        },
      ],
    });

    const rawContent = message.content[0];
    if (rawContent.type !== "text") {
      throw new Error("Unexpected response type from Anthropic API");
    }

    const jsonText = rawContent.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let booking: ImportBooking;
    try {
      booking = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse booking JSON:", jsonText.substring(0, 500));
      return NextResponse.json(
        {
          error: "AI extraction returned invalid JSON. Try pasting the confirmation email text directly.",
          details: jsonText.substring(0, 300),
        },
        { status: 422 }
      );
    }

    // Always return whatever the AI extracted — the client preview lets users fill in gaps
    return NextResponse.json({ data: booking });
  } catch (err) {
    console.error("POST /api/bookings/extract", err);
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildTripContext(trip: Awaited<ReturnType<typeof getTripWithDays>>): string {
  if (!trip) return "";
  const lines: string[] = [
    `Trip: ${trip.name} (${trip.start_date} to ${trip.end_date})`,
    "",
    "Itinerary:",
  ];
  for (const day of trip.days) {
    lines.push(`  Day ${day.day_number} (${day.date}): ${day.title ?? "Untitled"}`);
    for (const activity of day.activities) {
      lines.push(`    - ${activity.title}${activity.location ? ` at ${activity.location}` : ""}`);
    }
  }
  return lines.join("\n");
}
