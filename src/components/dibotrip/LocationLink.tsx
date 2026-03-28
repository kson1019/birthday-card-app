"use client";

interface Props {
  location: string;
  lat?: number | null;
  lng?: number | null;
}

/**
 * Renders a tappable location string that opens the native maps app.
 * - Apple Maps on iOS / macOS Safari
 * - Google Maps everywhere else
 *
 * When lat/lng are available the pin is exact; otherwise falls back to a
 * name search so the link always works.
 */
export default function LocationLink({ location, lat, lng }: Props) {
  function getUrl(): string {
    const hasCoords = lat != null && lng != null;

    // Detect Apple platforms at click time (avoids SSR mismatch)
    const isApple =
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);

    if (isApple) {
      // Apple Maps universal link — works in Safari and opens the Maps app
      return hasCoords
        ? `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(location)}`
        : `https://maps.apple.com/?q=${encodeURIComponent(location)}`;
    }

    // Google Maps — works on Android, Chrome, and all other browsers
    return hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }

  return (
    <a
      href={getUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        // Re-compute URL at click time so platform detection is accurate
        e.currentTarget.href = getUrl();
      }}
      className="text-xs text-stone-400 hover:text-amber-600 hover:underline transition-colors flex items-center gap-1 mt-0.5 w-fit"
    >
      <span>📍</span>
      <span className="truncate">{location}</span>
      <svg
        className="w-3 h-3 flex-shrink-0 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        />
      </svg>
    </a>
  );
}
