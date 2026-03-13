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

    const cardRows = await db
      .select()
      .from(cards)
      .where(eq(cards.id, cardId));

    const card = cardRows[0];

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const cardRecipients = await db
      .select()
      .from(recipients)
      .where(eq(recipients.cardId, cardId));

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    let currentRecipient = null;

    if (token) {
      currentRecipient =
        cardRecipients.find((r: typeof recipients.$inferSelect) => r.token === token) || null;
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

    const deleted = await db
      .delete(cards)
      .where(eq(cards.id, cardId))
      .returning();

    if (deleted.length === 0) {
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
