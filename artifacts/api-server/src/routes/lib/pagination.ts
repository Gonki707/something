import { sql, type SQL, and, or, ilike } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function makePageMeta(page: number, pageSize: number, total: number): PageMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function buildSearchCondition(q: string | undefined, columns: PgColumn[]): SQL | undefined {
  if (!q) return undefined;
  const term = `%${q.trim()}%`;
  if (term.length <= 2) return undefined;
  const conds = columns.map((c) => ilike(c, term));
  return or(...conds);
}

export function combine(...conds: Array<SQL | undefined>): SQL | undefined {
  const filtered = conds.filter((c): c is SQL => c !== undefined);
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return and(...filtered);
}

export function yearCounts<T extends { year: number; count: number }>(rows: Array<{ year: number; count: number | string }>): T[] {
  return rows.map((r) => ({ year: r.year, count: Number(r.count) })) as T[];
}

export const countSql = sql<number>`count(*)::int`;
