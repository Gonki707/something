import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const legislationTable = pgTable("legislation", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  year: integer("year").notNull(),
  fileUrl: text("file_url").notNull(),
});

export type Legislation = typeof legislationTable.$inferSelect;
