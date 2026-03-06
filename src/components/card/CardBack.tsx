import { formatDateTime, getMapSearchUrl } from "@/lib/utils";
import CalendarButton from "./CalendarButton";

interface CardBackProps {
  title: string;
  hostedBy?: string;
  location: string;
  datetime: string;
  message: string;
  showCalendarButton?: boolean;
}

export default function CardBack({
  title,
  hostedBy,
  location,
  datetime,
  message,
  showCalendarButton = false,
}: CardBackProps) {
  const mapUrl = getMapSearchUrl(location);

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex flex-col items-center justify-center p-8 text-white">
      {/* Decorative top */}
      <div className="text-4xl mb-4">&#127874;</div>

      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
        {title}
      </h2>

      <div className="w-full max-w-xs space-y-4">
        {/* Host */}
        {hostedBy && (
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">&#127881;</span>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
                Hosted by
              </p>
              <p className="text-lg">{hostedBy}</p>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">&#128205;</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
              Where
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="text-lg underline decoration-white/40 underline-offset-2 hover:decoration-white"
            >
              {location}
            </a>
          </div>
        </div>

        {/* Date/Time */}
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">&#128197;</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
              When
            </p>
            <p className="text-lg">{formatDateTime(datetime)}</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-center italic text-white/90">{message}</p>
          </div>
        )}

        {/* Add to Calendar */}
        {showCalendarButton && (
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-center">
            <CalendarButton
              title={title}
              location={location}
              datetime={datetime}
              description={message}
            />
          </div>
        )}
      </div>

      <p className="text-white/50 text-sm mt-6">&#8592; Tap to flip back</p>
    </div>
  );
}
