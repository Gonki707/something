import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, tendersTable } from "@workspace/db";
import {
  ListTendersQueryParams,
  GetTenderParams,
  ListTendersResponse,
  GetTenderResponse,
} from "@workspace/api-zod";
import {
  makePageMeta,
  buildSearchCondition,
  combine,
  countSql,
} from "./lib/pagination";

const router: IRouter = Router();

router.get("/tenders", async (req, res): Promise<void> => {
  const parsed = ListTendersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, year, status, page = 1, pageSize = 12 } = parsed.data;
  const where = combine(
    buildSearchCondition(q, [tendersTable.title, tendersTable.summary, tendersTable.body]),
    year ? eq(tendersTable.year, year) : undefined,
    status ? eq(tendersTable.status, status) : undefined,
  );
  const items = await db
    .select()
    .from(tendersTable)
    .where(where)
    .orderBy(desc(tendersTable.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [{ total } = { total: 0 }] = await db
    .select({ total: countSql })
    .from(tendersTable)
    .where(where);
  const yearsRows = await db
    .select({ year: tendersTable.year, count: countSql })
    .from(tendersTable)
    .groupBy(tendersTable.year)
    .orderBy(desc(tendersTable.year));
  const statusRows = await db.selectDistinct({ status: tendersTable.status }).from(tendersTable);
  res.json(
    ListTendersResponse.parse({
      items,
      pagination: makePageMeta(page, pageSize, Number(total)),
      availableYears: yearsRows.map((r) => ({ year: r.year, count: Number(r.count) })),
      availableStatuses: statusRows.map((r) => r.status),
    }),
  );
});

router.get("/tenders/:id", async (req, res): Promise<void> => {
  const params = GetTenderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(tendersTable).where(eq(tendersTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(GetTenderResponse.parse(row));
});

export default router;
