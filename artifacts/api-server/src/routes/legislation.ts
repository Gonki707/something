import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, legislationTable } from "@workspace/db";
import {
  ListLegislationQueryParams,
  GetLegislationParams,
  ListLegislationResponse,
  GetLegislationResponse,
} from "@workspace/api-zod";
import {
  makePageMeta,
  buildSearchCondition,
  combine,
  countSql,
} from "./lib/pagination";

const router: IRouter = Router();

router.get("/legislation", async (req, res): Promise<void> => {
  const parsed = ListLegislationQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, year, category, page = 1, pageSize = 12 } = parsed.data;
  const where = combine(
    buildSearchCondition(q, [legislationTable.title, legislationTable.summary, legislationTable.body]),
    year ? eq(legislationTable.year, year) : undefined,
    category ? eq(legislationTable.category, category) : undefined,
  );
  const items = await db
    .select()
    .from(legislationTable)
    .where(where)
    .orderBy(desc(legislationTable.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [{ total } = { total: 0 }] = await db
    .select({ total: countSql })
    .from(legislationTable)
    .where(where);
  const yearsRows = await db
    .select({ year: legislationTable.year, count: countSql })
    .from(legislationTable)
    .groupBy(legislationTable.year)
    .orderBy(desc(legislationTable.year));
  const catsRows = await db.selectDistinct({ category: legislationTable.category }).from(legislationTable);
  res.json(
    ListLegislationResponse.parse({
      items,
      pagination: makePageMeta(page, pageSize, Number(total)),
      availableYears: yearsRows.map((r) => ({ year: r.year, count: Number(r.count) })),
      availableCategories: catsRows.map((r) => r.category),
    }),
  );
});

router.get("/legislation/:id", async (req, res): Promise<void> => {
  const params = GetLegislationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(legislationTable).where(eq(legislationTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetLegislationResponse.parse(row));
});

export default router;
