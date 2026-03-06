import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recipients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { RsvpRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body: RsvpRequest = await request.json();

    if (!body.token || !body.status) {
      return NextResponse.json(
        { error: "Token and status are required" },
        { status: 400 }
      );
    }

    if (!["accepted", "declined"].includes(body.status)) {
      return NextResponse.json(
        { error: "Status must be 'accepted' or 'declined'" },
        { status: 400 }
      );
    }

    const recipient = db
      .select()
      .from(recipients)
      .where(eq(recipients.token, body.token))
      .get();

    if (!recipient) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    const updatedRows = db
      .update(recipients)
      .set({
        status: body.status,
        responseMessage: body.message || null,
        respondedAt: new Date().toISOString(),
      })
      .where(eq(recipients.token, body.token))
      .returning()
      .all();

    return NextResponse.json(updatedRows[0]);
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP" },
      { status: 500 }
    );
  }
}
