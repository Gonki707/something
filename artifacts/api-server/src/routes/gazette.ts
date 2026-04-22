import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, gazetteTable } from "@workspace/db";
import {
  ListGazetteQueryParams,
  GetGazetteParams,
  ListGazetteResponse,
  GetGazetteResponse,
} from "@workspace/api-zod";
import {
  makePageMeta,
  buildSearchCondition,
  combine,
  countSql,
} from "./lib/pagination";

const router: IRouter = Router();

router.get("/gazette", async (req, res): Promise<void> => {
  const parsed = ListGazetteQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, year, page = 1, pageSize = 12 } = parsed.data;
  const where = combine(
    buildSearchCondition(q, [gazetteTable.title, gazetteTable.summary, gazetteTable.issueNumber]),
    year ? eq(gazetteTable.year, year) : undefined,
  );
  const items = await db
    .select()
    .from(gazetteTable)
    .where(where)
    .orderBy(desc(gazetteTable.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [{ total } = { total: 0 }] = await db
    .select({ total: countSql })
    .from(gazetteTable)
    .where(where);
  const yearsRows = await db
    .select({ year: gazetteTable.year, count: countSql })
    .from(gazetteTable)
    .groupBy(gazetteTable.year)
    .orderBy(desc(gazetteTable.year));
  res.json(
    ListGazetteResponse.parse({
      items,
      pagination: makePageMeta(page, pageSize, Number(total)),
      availableYears: yearsRows.map((r) => ({ year: r.year, count: Number(r.count) })),
    }),
  );
});

router.get("/gazette/:id", async (req, res): Promise<void> => {
  const params = GetGazetteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(gazetteTable).where(eq(gazetteTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetGazetteResponse.parse(row));
});

export default router;
