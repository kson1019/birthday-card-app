import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { TRIP_EXTRACTION_SYSTEM_PROMPT } from "@/lib/dibotrip/ai/prompts";
import type { ImportPayload } from "@/lib/dibotrip/db/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/trips/extract
 * Body: { text: string }
 * Returns: { data: ImportPayload } — extracted trip structure for preview
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json(
        { error: "text must be at least 20 characters" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: TRIP_EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extract structured trip data from the following text:\n\n${text}`,
        },
      ],
    });

    const rawContent = message.content[0];
    if (rawContent.type !== "text") {
      throw new Error("Unexpected response type from Anthropic API");
    }

    // Strip any accidental markdown fencing before parsing
    const jsonText = rawContent.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let payload: ImportPayload;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse Anthropic response as JSON:", jsonText.substring(0, 500));
      return NextResponse.json(
        {
          error: "AI extraction returned invalid JSON. Try rephrasing your trip plan.",
          details: jsonText.substring(0, 300),
        },
        { status: 422 }
      );
    }

    // Basic validation
    if (!payload.trip?.name || !payload.trip?.start_date || !payload.trip?.end_date) {
      return NextResponse.json(
        {
          error: "Could not extract trip dates or name. Make sure your text includes the trip name and travel dates.",
          details: JSON.stringify(payload.trip),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ data: payload });
  } catch (err) {
    console.error("POST /api/trips/extract", err);
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
