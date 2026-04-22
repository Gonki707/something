import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import {
  ListProjectsQueryParams,
  GetProjectParams,
  ListProjectsResponse,
  GetProjectResponse,
} from "@workspace/api-zod";
import {
  makePageMeta,
  buildSearchCondition,
  combine,
  countSql,
} from "./lib/pagination";

const router: IRouter = Router();

router.get("/projects", async (req, res): Promise<void> => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, year, category, status, page = 1, pageSize = 12 } = parsed.data;
  const where = combine(
    buildSearchCondition(q, [projectsTable.title, projectsTable.summary, projectsTable.body]),
    year ? eq(projectsTable.year, year) : undefined,
    category ? eq(projectsTable.category, category) : undefined,
    status ? eq(projectsTable.status, status) : undefined,
  );
  const items = await db
    .select()
    .from(projectsTable)
    .where(where)
    .orderBy(desc(projectsTable.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [{ total } = { total: 0 }] = await db
    .select({ total: countSql })
    .from(projectsTable)
    .where(where);
  const yearsRows = await db
    .select({ year: projectsTable.year, count: countSql })
    .from(projectsTable)
    .groupBy(projectsTable.year)
    .orderBy(desc(projectsTable.year));
  const catsRows = await db.selectDistinct({ category: projectsTable.category }).from(projectsTable);
  const statusRows = await db.selectDistinct({ status: projectsTable.status }).from(projectsTable);
  res.json(
    ListProjectsResponse.parse({
      items,
      pagination: makePageMeta(page, pageSize, Number(total)),
      availableYears: yearsRows.map((r) => ({ year: r.year, count: Number(r.count) })),
      availableCategories: catsRows.map((r) => r.category),
      availableStatuses: statusRows.map((r) => r.status),
    }),
  );
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetProjectResponse.parse(row));
});

export default router;
