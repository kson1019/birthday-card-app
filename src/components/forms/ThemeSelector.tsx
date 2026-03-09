"use client";

import { THEMES } from "@/lib/themes";

interface ThemeSelectorProps {
  value: string;
  onChange: (themeId: string) => void;
}

export default function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Party Theme
      </label>
      <div className="grid grid-cols-5 gap-2">
        {THEMES.map((theme) => {
          const isSelected = value === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-purple-500 bg-purple-50 shadow-md scale-105"
                  : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <span className="text-2xl">{theme.emoji}</span>
              <span
                className={`text-xs font-medium leading-tight text-center ${
                  isSelected ? "text-purple-700" : "text-gray-600"
                }`}
              >
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
