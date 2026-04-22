import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const tendersTable = pgTable("tenders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  year: integer("year").notNull(),
});

export type Tender = typeof tendersTable.$inferSelect;
