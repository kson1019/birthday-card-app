import { db } from "@/lib/db";
import { cards, recipients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Confetti from "@/components/card/Confetti";
import CalendarButton from "@/components/card/CalendarButton";
import RsvpForm from "@/components/forms/RsvpForm";
import { formatDateTime, getMapSearchUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function CardPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  const cardId = parseInt(id, 10);
  if (isNaN(cardId)) notFound();

  const card = db.select().from(cards).where(eq(cards.id, cardId)).get();
  if (!card) notFound();

  let currentRecipient = null;
  if (token) {
    currentRecipient = db
      .select()
      .from(recipients)
      .where(eq(recipients.token, token))
      .get() ?? null;
  }

  const mapUrl = getMapSearchUrl(card.location);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Confetti />

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative aspect-[3/4] bg-gray-100">
            <img
              src={card.imagePath}
              alt={card.headline}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white text-center drop-shadow-lg">
                {card.headline}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
              {card.title}
            </h2>

            {card.hostedBy && (
              <div>
                <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold">
                  Hosted by
                </p>
                <p className="text-lg text-gray-800">{card.hostedBy}</p>
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold">
                Where
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-purple-700 underline decoration-purple-300 underline-offset-2 hover:decoration-purple-600"
              >
                {card.location}
              </a>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold">
                When
              </p>
              <p className="text-lg text-gray-800">{formatDateTime(card.datetime)}</p>
            </div>

            {card.message && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-center italic text-gray-600">{card.message}</p>
              </div>
            )}

            {token && (
              <div className="pt-4 border-t border-gray-200 flex justify-center">
                <CalendarButton
                  title={card.title}
                  location={card.location}
                  datetime={card.datetime}
                  description={card.message}
                />
              </div>
            )}
          </div>
        </div>

        {token && (
          <div className="mt-8">
            <RsvpForm token={token} currentResponse={currentRecipient} />
          </div>
        )}
      </div>
    </main>
  );
}
