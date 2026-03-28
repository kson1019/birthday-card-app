// ─── Core entity types (mirror Turso columns 1:1) ─────────────────────────────

export type TripStatus = "draft" | "upcoming" | "active" | "completed";

export type ActivityCategory =
  | "hike"
  | "meal"
  | "drive"
  | "sightseeing"
  | "rest"
  | "explore"
  | "gear"
  | "flight"
  | "other";

export type BookingType =
  | "flight"
  | "hotel"
  | "car_rental"
  | "activity"
  | "other";

export type PackingCategory =
  | "clothing"
  | "toiletries"
  | "gear"
  | "documents"
  | "kids"
  | "electronics"
  | "other";

export type ExpenseCategory =
  | "meal"
  | "gas"
  | "groceries"
  | "park_fee"
  | "shopping"
  | "transport"
  | "tips"
  | "other";

// ─── Database row types ────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string; // ISO date string "YYYY-MM-DD"
  end_date: string;
  cover_image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed in application layer, not stored
  status?: TripStatus;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  date: string; // ISO date string
  day_number: number;
  title: string | null;
  subtitle: string | null;
  tags: string[] | null; // Parsed from JSON column
  tip: string | null;
  skipped: number; // 0 | 1
  notes: string | null;
}

export interface Activity {
  id: string;
  day_id: string;
  title: string;
  time_start: string | null;
  time_end: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
  category: ActivityCategory | null;
  notes: string | null;
  sort_order: number;
}

export interface Booking {
  id: string;
  trip_id: string;
  activity_id: string | null;
  type: BookingType;
  provider: string;
  confirmation_number: string;
  check_in: string | null;
  check_out: string | null;
  details: Record<string, unknown> | null; // Parsed from JSON column
  cost: number | null;
  notes: string | null;
}

export interface PackingItem {
  id: string;
  trip_id: string;
  item: string;
  category: PackingCategory | null;
  packed: number; // 0 | 1
  assigned_to: string | null;
  quantity: number;
}

export interface Expense {
  id: string;
  trip_id: string;
  activity_id: string | null;
  title: string;
  cost: number;
  category: ExpenseCategory;
  day_number: number | null;
  date: string | null;
  note: string | null;
  created_at: string;
}

// ─── Composed / view types ────────────────────────────────────────────────────

export interface ActivityWithBookings extends Activity {
  bookings: Booking[];
}

export interface DayWithActivities extends ItineraryDay {
  activities: ActivityWithBookings[];
}

export interface TripWithDays extends Trip {
  days: DayWithActivities[];
  bookings: Booking[];
}

// ─── AI import payload types ──────────────────────────────────────────────────

export interface ImportActivity {
  title: string;
  time_start?: string | null;
  time_end?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category?: ActivityCategory | null;
  notes?: string | null;
  sort_order?: number;
}

export interface ImportDay {
  date?: string | null;
  day_number?: number;
  title?: string | null;
  subtitle?: string | null;
  tags?: string[] | null;
  tip?: string | null;
  activities: ImportActivity[];
}

export interface ImportBooking {
  type: BookingType;
  provider: string;
  confirmation_number: string;
  check_in?: string | null;
  check_out?: string | null;
  cost?: number | null;
  notes?: string | null;
  details?: Record<string, unknown> | null;
  /** Natural language description of which activity this links to */
  linked_activity_hint?: string | null;
}

export interface ImportPackingItem {
  item: string;
  category?: PackingCategory | null;
  assigned_to?: string | null;
  quantity?: number;
}

export interface ImportPayload {
  trip: {
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
    notes?: string | null;
    cover_image_url?: string | null;
  };
  itinerary: ImportDay[];
  bookings: ImportBooking[];
  packing: ImportPackingItem[];
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  details?: string;
}
