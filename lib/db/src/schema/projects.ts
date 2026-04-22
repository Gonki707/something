import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  coverImageUrl: text("cover_image_url"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  year: integer("year").notNull(),
  budget: text("budget"),
});

export type Project = typeof projectsTable.$inferSelect;
