/**
 * Turso (libSQL/SQLite) schema for DiboTrip.
 * Run via: npx tsx lib/db/migrate.ts
 */
export const SCHEMA_SQL = `
-- Trips: the parent object for all trip data
CREATE TABLE IF NOT EXISTS trips (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date  TEXT NOT NULL,
  end_date    TEXT NOT NULL,
  cover_image_url TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- Itinerary days: one row per calendar day of the trip
CREATE TABLE IF NOT EXISTS itinerary_days (
  id          TEXT PRIMARY KEY,
  trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  day_number  INTEGER NOT NULL,
  title       TEXT,
  subtitle    TEXT,
  tags        TEXT,   -- JSON array of category label strings
  tip         TEXT,
  skipped     INTEGER NOT NULL DEFAULT 0,
  notes       TEXT
);

-- Activities: individual events within a day
CREATE TABLE IF NOT EXISTS activities (
  id          TEXT PRIMARY KEY,
  day_id      TEXT NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  time_start  TEXT,
  time_end    TEXT,
  location    TEXT,
  latitude    REAL,
  longitude   REAL,
  place_id    TEXT,
  category    TEXT,   -- hike | meal | drive | sightseeing | rest | explore | gear | flight | other
  notes       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Bookings: reservations linked to a trip and optionally an activity
CREATE TABLE IF NOT EXISTS bookings (
  id                  TEXT PRIMARY KEY,
  trip_id             TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  activity_id         TEXT REFERENCES activities(id) ON DELETE SET NULL,
  type                TEXT NOT NULL,  -- flight | hotel | car_rental | activity | other
  provider            TEXT NOT NULL,
  confirmation_number TEXT NOT NULL,
  check_in            TEXT,
  check_out           TEXT,
  details             TEXT,  -- JSON blob for flexible extra fields
  cost                REAL,
  notes               TEXT
);

-- Packing items: checklist per trip (UI in V1.5 but data stored from import)
CREATE TABLE IF NOT EXISTS packing_items (
  id          TEXT PRIMARY KEY,
  trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item        TEXT NOT NULL,
  category    TEXT,   -- clothing | toiletries | gear | documents | kids | electronics | other
  packed      INTEGER NOT NULL DEFAULT 0,
  assigned_to TEXT,
  quantity    INTEGER NOT NULL DEFAULT 1
);

-- Expenses: on-trip spending tracked separately from pre-booked costs
CREATE TABLE IF NOT EXISTS expenses (
  id          TEXT PRIMARY KEY,
  trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  activity_id TEXT REFERENCES activities(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  cost        REAL NOT NULL,
  category    TEXT NOT NULL,  -- meal | gas | groceries | park_fee | shopping | transport | tips | other
  day_number  INTEGER,
  date        TEXT,
  note        TEXT,
  created_at  TEXT NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_days_trip_date ON itinerary_days(trip_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_day_id ON activities(day_id);
CREATE INDEX IF NOT EXISTS idx_activities_sort ON activities(day_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_activity_id ON bookings(activity_id);
CREATE INDEX IF NOT EXISTS idx_packing_trip_id ON packing_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
`;
