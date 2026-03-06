"use client";

import { Calendar } from "lucide-react";
import { generateIcsFile } from "@/lib/utils";

interface CalendarButtonProps {
  title: string;
  location: string;
  datetime: string;
  description?: string;
}

export default function CalendarButton({
  title,
  location,
  datetime,
  description,
}: CalendarButtonProps) {
  const handleAddToCalendar = () => {
    const icsContent = generateIcsFile({
      title,
      location,
      datetime,
      description,
    });

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleAddToCalendar();
      }}
      className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
    >
      <Calendar className="w-4 h-4" />
      Add to Calendar
    </button>
  );
}
