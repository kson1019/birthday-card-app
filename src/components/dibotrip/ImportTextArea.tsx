"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  error?: string | null;
}

export default function ImportTextArea({
  value,
  onChange,
  onSubmit,
  error,
}: Props) {
  const canSubmit = value.trim().length >= 20;

  return (
    <div className="flex flex-col gap-4">
      {/* Instructions */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-stone-700">
        <p className="font-medium text-stone-800 mb-1">How to import a trip</p>
        <p className="text-stone-500">
          Paste your trip plan from Claude, a travel email, a Google Doc, or any
          text. The more detail you include, the better — dates, activity names,
          confirmation numbers, and locations all get extracted automatically.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          <p className="font-medium mb-0.5">Extraction failed</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Textarea */}
      <textarea
        className="w-full h-72 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-shadow"
        placeholder={`Paste your trip plan here…\n\nExample:\n"6-Day Southern Utah Road Trip, March 29–April 3. Day 1: Drive from Las Vegas to Springdale, check into Airbnb. Day 2: Angels Landing hike at 7am, Narrows walk after lunch…"`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        spellCheck={false}
      />

      {/* Character count + submit */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-400">
          {value.length > 0 ? `${value.length} characters` : ""}
        </span>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-stone-200 disabled:text-stone-400 text-white disabled:cursor-not-allowed text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
        >
          Extract Trip
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
