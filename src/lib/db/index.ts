import * as schema from "./schema";

// Use Turso (libsql) in production, local SQLite in development
function createDb() {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const { drizzle } = require("drizzle-orm/libsql");
    const { createClient } = require("@libsql/client");
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return drizzle(client, { schema });
  }

  // Local development: use better-sqlite3
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const Database = require("better-sqlite3");
  const path = require("path");
  const dbPath = path.join(process.cwd(), "sqlite.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = createDb();
