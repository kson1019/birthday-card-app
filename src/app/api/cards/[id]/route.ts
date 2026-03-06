import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, recipients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cardId = parseInt(id, 10);

    if (isNaN(cardId)) {
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    const card = db
      .select()
      .from(cards)
      .where(eq(cards.id, cardId))
      .get();

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const cardRecipients = db
      .select()
      .from(recipients)
      .where(eq(recipients.cardId, cardId))
      .all();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    let currentRecipient = null;

    if (token) {
      currentRecipient =
        cardRecipients.find((r) => r.token === token) || null;
    }

    return NextResponse.json({
      ...card,
      recipients: cardRecipients,
      currentRecipient,
    });
  } catch (error) {
    console.error("Get card error:", error);
    return NextResponse.json(
      { error: "Failed to get card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cardId = parseInt(id, 10);

    if (isNaN(cardId)) {
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    const result = db.delete(cards).where(eq(cards.id, cardId)).run();

    if (result.changes === 0) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete card error:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
