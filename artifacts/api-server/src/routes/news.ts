import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, newsTable } from "@workspace/db";
import {
  ListNewsQueryParams,
  GetNewsParams,
  ListNewsResponse,
  GetNewsResponse,
} from "@workspace/api-zod";
import {
  makePageMeta,
  buildSearchCondition,
  combine,
  countSql,
} from "./lib/pagination";

const router: IRouter = Router();

router.get("/news", async (req, res): Promise<void> => {
  const parsed = ListNewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, year, category, page = 1, pageSize = 12 } = parsed.data;
  const where = combine(
    buildSearchCondition(q, [newsTable.title, newsTable.summary, newsTable.body]),
    year ? eq(newsTable.year, year) : undefined,
    category ? eq(newsTable.category, category) : undefined,
  );

  const items = await db
    .select()
    .from(newsTable)
    .where(where)
    .orderBy(desc(newsTable.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ total } = { total: 0 }] = await db
    .select({ total: countSql })
    .from(newsTable)
    .where(where);

  const yearsRows = await db
    .select({ year: newsTable.year, count: countSql })
    .from(newsTable)
    .groupBy(newsTable.year)
    .orderBy(desc(newsTable.year));
  const catsRows = await db
    .selectDistinct({ category: newsTable.category })
    .from(newsTable);

  res.json(
    ListNewsResponse.parse({
      items,
      pagination: makePageMeta(page, pageSize, Number(total)),
      availableYears: yearsRows.map((r) => ({ year: r.year, count: Number(r.count) })),
      availableCategories: catsRows.map((r) => r.category),
    }),
  );
});

router.get("/news/:id", async (req, res): Promise<void> => {
  const params = GetNewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(newsTable).where(eq(newsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetNewsResponse.parse(row));
});

export default router;
