import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const gazetteTable = pgTable("gazette", {
  id: serial("id").primaryKey(),
  issueNumber: text("issue_number").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  year: integer("year").notNull(),
  fileUrl: text("file_url").notNull(),
});

export type Gazette = typeof gazetteTable.$inferSelect;
