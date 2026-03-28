"use client";

import { useEditMode } from "./EditModeContext";

export default function EditModeBanner() {
  const ctx = useEditMode();
  if (!ctx) return null;

  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-sm text-amber-800 leading-snug">
        <span className="font-semibold">Editing mode</span>
        <span className="text-amber-600 ml-2 hidden sm:inline">
          Drag ⠿ to reorder · Click ✏ to edit · Tap ✕ to remove
        </span>
      </p>
      <button
        onClick={ctx.stopEditing}
        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Done Editing
      </button>
    </div>
  );
}
