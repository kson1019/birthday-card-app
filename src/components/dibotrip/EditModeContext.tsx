"use client";

import { createContext, useContext } from "react";
import type { ActivityCategory } from "@/lib/dibotrip/db/types";

export interface ActivityUpdate {
  title?: string;
  time_start?: string | null;
  notes?: string | null;
  location?: string | null;
  category?: ActivityCategory | null;
}

export interface DayUpdate {
  title?: string | null;
  tip?: string | null;
}

export interface EditModeContextValue {
  isEditing: boolean;
  startEditing: () => void;
  stopEditing: () => void;
  /** All days in the trip — used for "move to day" dropdowns */
  allDays: Array<{ id: string; day_number: number; title: string | null }>;
  tripId: string;
  // Activity mutations
  onUpdateActivity: (id: string, updates: ActivityUpdate) => Promise<void>;
  onDeleteActivity: (id: string, dayId: string) => Promise<void>;
  onAddActivity: (dayId: string) => Promise<string | null>;
  onReorderActivities: (dayId: string, orderedIds: string[]) => Promise<void>;
  onMoveActivity: (id: string, targetDayId: string) => Promise<void>;
  // Day mutations
  onUpdateDay: (dayId: string, updates: DayUpdate) => Promise<void>;
  onDeleteDay: (dayId: string) => Promise<void>;
  onToggleSkipDay: (dayId: string, currentSkipped: number) => Promise<void>;
  onAddDay: () => Promise<void>;
  onReorderDays: (orderedIds: string[]) => Promise<void>;
}

export const EditModeContext = createContext<EditModeContextValue | null>(null);

export function useEditMode(): EditModeContextValue | null {
  return useContext(EditModeContext);
}
