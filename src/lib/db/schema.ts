import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imagePath: text("image_path").notNull(),
  headline: text("headline").notNull(),
  title: text("title").notNull(),
  hostedBy: text("hosted_by"),
  location: text("location").notNull(),
  datetime: text("datetime").notNull(),
  message: text("message").notNull(),
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
