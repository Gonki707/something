import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, competitionsTable } from "@workspace/db";
import {
  ListCompetitionsQueryParams,
  GetCompetitionParams,
  ListCompetitionsResponse,
  GetCompetitionResponse,
} from "@workspace/api-zod";
import {
  makePageMeta,
  buildSearchCondition,
  combine,
  countSql,
} from "./lib/pagination";

const router: IRouter = Router();

router.get("/competitions", async (req, res): Promise<void> => {
  const parsed = ListCompetitionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, year, status, page = 1, pageSize = 12 } = parsed.data;
  const where = combine(
    buildSearchCondition(q, [competitionsTable.title, competitionsTable.summary, competitionsTable.body]),
    year ? eq(competitionsTable.year, year) : undefined,
    status ? eq(competitionsTable.status, status) : undefined,
  );
  const items = await db
    .select()
    .from(competitionsTable)
    .where(where)
    .orderBy(desc(competitionsTable.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [{ total } = { total: 0 }] = await db
    .select({ total: countSql })
    .from(competitionsTable)
    .where(where);
  const yearsRows = await db
    .select({ year: competitionsTable.year, count: countSql })
    .from(competitionsTable)
    .groupBy(competitionsTable.year)
    .orderBy(desc(competitionsTable.year));
  const statusRows = await db.selectDistinct({ status: competitionsTable.status }).from(competitionsTable);
  res.json(
    ListCompetitionsResponse.parse({
      items,
      pagination: makePageMeta(page, pageSize, Number(total)),
      availableYears: yearsRows.map((r) => ({ year: r.year, count: Number(r.count) })),
      availableStatuses: statusRows.map((r) => r.status),
    }),
  );
});

router.get("/competitions/:id", async (req, res): Promise<void> => {
  const params = GetCompetitionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(competitionsTable).where(eq(competitionsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetCompetitionResponse.parse(row));
});

export default router;
