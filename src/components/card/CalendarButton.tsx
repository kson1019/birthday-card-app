"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  generateIcsFile,
  generateGoogleCalendarUrl,
  generateOutlookWebUrl,
} from "@/lib/utils";

interface CalendarButtonProps {
  title: string;
  location: string;
  datetime: string;
  description?: string;
  durationMinutes?: number;
}

interface CalendarOption {
  label: string;
  icon: string;
  action: () => void;
}

export default function CalendarButton({
  title,
  location,
  datetime,
  description = "",
  durationMinutes = 180,
}: CalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const downloadIcs = () => {
    const icsContent = generateIcsFile({ title, location, datetime, description, durationMinutes });
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const options: CalendarOption[] = [
    {
      label: "Google Calendar",
      icon: "🗓️",
      action: () => {
        window.open(
          generateGoogleCalendarUrl({ title, location, datetime, description, durationMinutes }),
          "_blank"
        );
        setIsOpen(false);
      },
    },
    {
      label: "Apple Calendar",
      icon: "🍎",
      action: downloadIcs,
    },
    {
      label: "Outlook",
      icon: "📧",
      action: downloadIcs,
    },
    {
      label: "Outlook.com",
      icon: "🌐",
      action: () => {
        window.open(
          generateOutlookWebUrl({ title, location, datetime, description, durationMinutes }),
          "_blank"
        );
        setIsOpen(false);
      },
    },
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-full text-white text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
            >
              <span className="text-base">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
