import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const goalTasks = sqliteTable(
  "goal_tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    goalId: integer("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    weekNumber: integer("week_number").notNull(),
    weekTheme: text("week_theme").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    isCompleted: integer("is_completed").notNull().default(0),
    completedAt: text("completed_at"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index("idx_goal_tasks_goal_id").on(table.goalId)]
);

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imagePath: text("image_path").notNull(),
  headline: text("headline").notNull(),
  title: text("title").notNull(),
  hostedBy: text("hosted_by"),
  location: text("location").notNull(),
  datetime: text("datetime").notNull(),
  message: text("message").notNull(),
  theme: text("theme").notNull().default("default"),
  durationMinutes: integer("duration_minutes").notNull().default(180),
  enableEmojis: integer("enable_emojis").notNull().default(1),
  enableSound: integer("enable_sound").notNull().default(1),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const recipients = sqliteTable(
  "recipients",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cardId: integer("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name"),
    token: text("token").notNull().unique(),
    status: text("status", {
      enum: ["pending", "accepted", "declined"],
    })
      .notNull()
      .default("pending"),
    responseMessage: text("response_message"),
    respondedAt: text("responded_at"),
  },
  (table) => [
    index("idx_recipients_card_id").on(table.cardId),
    index("idx_recipients_token").on(table.token),
  ]
);
