import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  newsTable,
  announcementsTable,
  tendersTable,
  competitionsTable,
  gazetteTable,
  projectsTable,
  legislationTable,
} from "@workspace/db";
import { GetSiteSummaryResponse } from "@workspace/api-zod";
import { countSql } from "./lib/pagination";

const router: IRouter = Router();

router.get("/site/summary", async (_req, res): Promise<void> => {
  const [
    [{ total: newsCount } = { total: 0 }],
    [{ total: announcementsCount } = { total: 0 }],
    [{ total: tendersCount } = { total: 0 }],
    [{ total: competitionsCount } = { total: 0 }],
    [{ total: gazetteCount } = { total: 0 }],
    [{ total: projectsCount } = { total: 0 }],
    [{ total: legislationCount } = { total: 0 }],
    latestNews,
    latestAnnouncements,
    openTenders,
    openCompetitions,
    latestGazette,
    latestProjects,
  ] = await Promise.all([
    db.select({ total: countSql }).from(newsTable),
    db.select({ total: countSql }).from(announcementsTable),
    db.select({ total: countSql }).from(tendersTable),
    db.select({ total: countSql }).from(competitionsTable),
    db.select({ total: countSql }).from(gazetteTable),
    db.select({ total: countSql }).from(projectsTable),
    db.select({ total: countSql }).from(legislationTable),
    db.select().from(newsTable).orderBy(desc(newsTable.publishedAt)).limit(4),
    db.select().from(announcementsTable).orderBy(desc(announcementsTable.publishedAt)).limit(4),
    db.select().from(tendersTable).where(eq(tendersTable.status, "open")).orderBy(desc(tendersTable.publishedAt)).limit(4),
    db.select().from(competitionsTable).where(eq(competitionsTable.status, "open")).orderBy(desc(competitionsTable.publishedAt)).limit(4),
    db.select().from(gazetteTable).orderBy(desc(gazetteTable.publishedAt)).limit(4),
    db.select().from(projectsTable).orderBy(desc(projectsTable.publishedAt)).limit(4),
  ]);

  res.json(
    GetSiteSummaryResponse.parse({
      counts: [
        { section: "news", count: Number(newsCount) },
        { section: "announcements", count: Number(announcementsCount) },
        { section: "tenders", count: Number(tendersCount) },
        { section: "competitions", count: Number(competitionsCount) },
        { section: "gazette", count: Number(gazetteCount) },
        { section: "projects", count: Number(projectsCount) },
        { section: "legislation", count: Number(legislationCount) },
      ],
      latestNews,
      latestAnnouncements,
      openTenders,
      openCompetitions,
      latestGazette,
      latestProjects,
    }),
  );
});

export default router;
