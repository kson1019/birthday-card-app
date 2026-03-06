import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, recipients } from "@/lib/db/schema";
import { generateToken } from "@/lib/server-utils";
import { desc, eq, sql } from "drizzle-orm";
import type { CreateCardRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body: CreateCardRequest = await request.json();

    if (
      !body.imagePath ||
      !body.headline ||
      !body.title ||
      !body.location ||
      !body.datetime ||
      !body.message
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!body.recipients || body.recipients.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient is required" },
        { status: 400 }
      );
    }

    const result = db.transaction((tx) => {
      const cardRows = tx
        .insert(cards)
        .values({
          imagePath: body.imagePath,
          headline: body.headline,
          title: body.title,
          hostedBy: body.hostedBy?.trim() || null,
          location: body.location,
          datetime: body.datetime,
          message: body.message,
        })
        .returning()
        .all();

      const card = cardRows[0];

      const recipientRows = body.recipients.map((r) => ({
        cardId: card.id,
        email: r.email,
        name: r.name || null,
        token: generateToken(),
      }));

      const insertedRecipients = tx
        .insert(recipients)
        .values(recipientRows)
        .returning()
        .all();

      return { ...card, recipients: insertedRecipients };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create card error:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allCards = db.select().from(cards).orderBy(desc(cards.createdAt)).all();

    const cardsWithCounts = allCards.map((card) => {
      const counts = db
        .select({
          total: sql<number>`count(*)`,
          accepted: sql<number>`sum(case when ${recipients.status} = 'accepted' then 1 else 0 end)`,
          declined: sql<number>`sum(case when ${recipients.status} = 'declined' then 1 else 0 end)`,
          pending: sql<number>`sum(case when ${recipients.status} = 'pending' then 1 else 0 end)`,
        })
        .from(recipients)
        .where(eq(recipients.cardId, card.id))
        .get();

      return {
        ...card,
        totalCount: counts?.total ?? 0,
        acceptedCount: counts?.accepted ?? 0,
        declinedCount: counts?.declined ?? 0,
        pendingCount: counts?.pending ?? 0,
      };
    });

    return NextResponse.json(cardsWithCounts);
  } catch (error) {
    console.error("List cards error:", error);
    return NextResponse.json(
      { error: "Failed to list cards" },
      { status: 500 }
    );
  }
}
