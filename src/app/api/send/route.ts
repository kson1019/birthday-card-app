import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, recipients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/email/resend";
import InvitationEmail from "@/lib/email/templates/InvitationEmail";
import { getBaseUrl } from "@/lib/server-utils";

export async function POST(request: Request) {
  try {
    const { cardId } = await request.json();

    if (!cardId) {
      return NextResponse.json(
        { error: "cardId is required" },
        { status: 400 }
      );
    }

    const card = db.select().from(cards).where(eq(cards.id, cardId)).get();

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const cardRecipients = db
      .select()
      .from(recipients)
      .where(eq(recipients.cardId, cardId))
      .all();

    const baseUrl = getBaseUrl(request);

    const results = await Promise.allSettled(
      cardRecipients.map((recipient: typeof cardRecipients[number]) =>
        resend.emails.send({
          from: "Birthday Cards <invitations@familylaunchpad.com>",
          to: recipient.email,
          subject: `You're Invited! ${card.title}`,
          react: InvitationEmail({
            headline: card.headline,
            title: card.title,
            hostedBy: card.hostedBy ?? undefined,
            location: card.location,
            datetime: card.datetime,
            message: card.message,
            imagePath: `${baseUrl}${card.imagePath}`,
            cardUrl: `${baseUrl}/card/${card.id}?token=${recipient.token}`,
            recipientName: recipient.name ?? undefined,
          }),
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => r.reason?.message || "Unknown error");

    return NextResponse.json({ sent, failed, errors });
  } catch (error) {
    console.error("Send error:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
