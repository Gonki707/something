import { Router } from 'express';
import { eq, desc, asc } from 'drizzle-orm';
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { z, ZodTypeAny } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  adminUsers,
  typeObjava,
  typeLegislativa,
  typeOfProblems,
  naseleniMesta,
  odnosiSoJavnost,
  sluzbenGlasnik,
  vraboteni,
  prijaveniProblemi,
  budzet,
  legislativa,
  proekti,
  agenda,
  institucii,
} from '../db/schema.js';

// Strongly-typed table with the `id` column we depend on.
type TableWithId = PgTable & { id: PgColumn };
// Helper for safe column access by string key.
const col = (t: TableWithId, k: string): PgColumn => (t as unknown as Record<string, PgColumn>)[k];

interface EntityConfig<TIn extends Record<string, unknown>, TOut extends Record<string, unknown>> {
  table: TableWithId;
  orderBy?: { col: string; dir: 'asc' | 'desc' };
  /** Schema for POST (create). */
  createSchema: z.ZodType<TIn>;
  /** Schema for PUT (update — usually all fields optional). */
  updateSchema: z.ZodType<Partial<TIn>>;
  /** Map validated input to a row insert/update payload (e.g. hash password). */
  toRow?: (input: Partial<TIn>) => Promise<Record<string, unknown>> | Record<string, unknown>;
  /** Strip secrets from outgoing rows. */
  toClient?: (row: Record<string, unknown>) => TOut;
}

function makeEntity<TIn extends Record<string, unknown>, TOut extends Record<string, unknown>>(
  cfg: EntityConfig<TIn, TOut>,
): EntityConfig<TIn, TOut> {
  return cfg;
}

// ---------- Reusable Zod helpers ----------
const optionalString = z.string().trim().min(1).optional().nullable();
const optionalText = z.string().optional().nullable();
const optionalInt = z.coerce.number().int().optional().nullable();
const optionalDate = z.coerce.date().optional().nullable();
const optionalUrl = z.string().url().optional().nullable().or(z.literal('').transform(() => null));
const optionalEmail = z.string().email().optional().nullable().or(z.literal('').transform(() => null));
const docArray = z.array(z.string()).optional().nullable();

// ---------- Per-entity schemas ----------
const lookupCreate = z.object({ title: z.string().trim().min(1) });
const lookupUpdate = lookupCreate.partial();

const objavaCreate = z.object({
  typeId: z.coerce.number().int(),
  title: z.string().trim().min(1).max(500),
  picture: optionalText,
  description: optionalText,
  documents: docArray,
  dateValidTo: optionalDate,
  madeBy: optionalString,
});
const objavaUpdate = objavaCreate.partial();

const glasnikCreate = z.object({
  broj: z.string().trim().min(1).max(64),
  date: optionalDate,
  document: optionalText,
});
const glasnikUpdate = glasnikCreate.partial();

const vrabotenCreate = z.object({
  firstName: z.string().trim().min(1).max(128),
  lastName: z.string().trim().min(1).max(128),
  email: optionalEmail,
  oddel: optionalString,
  function: optionalString,
});
const vrabotenUpdate = vrabotenCreate.partial();

const problemUpdate = z.object({
  fullName: optionalString,
  typeOfProblemId: optionalInt,
  description: optionalText,
  picture: optionalText,
  naselenoMestoId: optionalInt,
  phoneNumber: optionalString,
  email: optionalEmail,
}).partial();

const budzetCreate = z.object({
  forYear: z.coerce.number().int().min(1900).max(3000),
  date: optionalDate,
  documents: docArray,
});
const budzetUpdate = budzetCreate.partial();

const legislativaCreate = z.object({
  typeId: z.coerce.number().int(),
  title: optionalString,
  document: optionalText,
});
const legislativaUpdate = legislativaCreate.partial();

const proektCreate = z.object({
  title: z.string().trim().min(1).max(500),
  description: optionalText,
  picture: optionalText,
  documents: docArray,
});
const proektUpdate = proektCreate.partial();

const agendaCreate = z.object({
  dateTime: z.coerce.date(),
  title: z.string().trim().min(1).max(500),
  description: optionalText,
});
const agendaUpdate = agendaCreate.partial();

const institucijaCreate = z.object({
  nameOfInstitution: z.string().trim().min(1).max(500),
  mestoNaseleno: optionalString,
  directorFullName: optionalString,
  directorBiography: optionalText,
  email: optionalEmail,
  website: optionalUrl,
  facebook: optionalUrl,
  instagram: optionalUrl,
});
const institucijaUpdate = institucijaCreate.partial();

const passwordPolicy = z
  .string()
  .min(8, 'Лозинката мора да има најмалку 8 знаци')
  .max(128);

const adminUserCreate = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1).max(255),
  role: z.string().trim().max(32).optional(),
  password: passwordPolicy, // REQUIRED on create
});
const adminUserUpdate = z.object({
  email: z.string().trim().toLowerCase().email().optional(),
  name: z.string().trim().min(1).max(255).optional(),
  role: z.string().trim().max(32).optional(),
  password: passwordPolicy.optional(), // OPTIONAL on update
});

async function adminUserToRow(input: Partial<z.infer<typeof adminUserCreate>>): Promise<Record<string, unknown>> {
  const row: Record<string, unknown> = {};
  if (input.email !== undefined) row.email = input.email;
  if (input.name !== undefined) row.name = input.name;
  if (input.role !== undefined) row.role = input.role;
  if (input.password) row.passwordHash = await bcrypt.hash(input.password, 10);
  return row;
}

function stripPasswordHash(row: Record<string, unknown>): Record<string, unknown> {
  const { passwordHash: _ph, ...rest } = row as { passwordHash?: unknown } & Record<string, unknown>;
  return rest;
}

// Helper: drizzle's table types don't expose a generic index signature, so we
// narrow them through `unknown` once. The runtime shape always has `id`.
const t = (table: PgTable): TableWithId => table as unknown as TableWithId;

// ---------- Entity registry ----------
const entities = {
  'type-objava': makeEntity({ table: t(typeObjava), createSchema: lookupCreate, updateSchema: lookupUpdate }),
  'type-legislativa': makeEntity({ table: t(typeLegislativa), createSchema: lookupCreate, updateSchema: lookupUpdate }),
  'type-of-problems': makeEntity({ table: t(typeOfProblems), createSchema: lookupCreate, updateSchema: lookupUpdate }),
  'naseleni-mesta': makeEntity({ table: t(naseleniMesta), createSchema: lookupCreate, updateSchema: lookupUpdate }),

  'odnosi-so-javnost': makeEntity({
    table: t(odnosiSoJavnost),
    orderBy: { col: 'createdAt', dir: 'desc' },
    createSchema: objavaCreate,
    updateSchema: objavaUpdate,
  }),
  'sluzben-glasnik': makeEntity({
    table: t(sluzbenGlasnik),
    orderBy: { col: 'date', dir: 'desc' },
    createSchema: glasnikCreate,
    updateSchema: glasnikUpdate,
  }),
  'vraboteni': makeEntity({ table: t(vraboteni), createSchema: vrabotenCreate, updateSchema: vrabotenUpdate }),
  'prijaveni-problemi': makeEntity({
    table: t(prijaveniProblemi),
    orderBy: { col: 'date', dir: 'desc' },
    // No public-facing create here (problems come in via /api/problems).
    // Admin create is disabled at the router level for this entity.
    createSchema: problemUpdate as unknown as z.ZodType<Record<string, unknown>>,
    updateSchema: problemUpdate,
  }),
  'budzet': makeEntity({
    table: t(budzet),
    orderBy: { col: 'forYear', dir: 'desc' },
    createSchema: budzetCreate,
    updateSchema: budzetUpdate,
  }),
  'legislativa': makeEntity({ table: t(legislativa), createSchema: legislativaCreate, updateSchema: legislativaUpdate }),
  'proekti': makeEntity({ table: t(proekti), createSchema: proektCreate, updateSchema: proektUpdate }),
  'agenda': makeEntity({
    table: t(agenda),
    orderBy: { col: 'dateTime', dir: 'asc' },
    createSchema: agendaCreate,
    updateSchema: agendaUpdate,
  }),
  'institucii': makeEntity({ table: t(institucii), createSchema: institucijaCreate, updateSchema: institucijaUpdate }),
  'admin-users': makeEntity({
    table: t(adminUsers),
    createSchema: adminUserCreate,
    updateSchema: adminUserUpdate,
    toRow: adminUserToRow,
    toClient: stripPasswordHash,
  }),
} as const;

type EntityKey = keyof typeof entities;

// Entities with a public read endpoint (everything except admin-users and prijaveni-problemi).
const PUBLIC_READ: EntityKey[] = [
  'type-objava', 'type-legislativa', 'type-of-problems', 'naseleni-mesta',
  'odnosi-so-javnost', 'sluzben-glasnik', 'vraboteni', 'budzet',
  'legislativa', 'proekti', 'agenda', 'institucii',
];

// Entities where the admin cannot create new rows (problems are created publicly only).
const NO_ADMIN_CREATE: EntityKey[] = ['prijaveni-problemi'];

function transform(cfg: EntityConfig<any, any>, row: Record<string, unknown>): Record<string, unknown> {
  return cfg.toClient ? cfg.toClient(row) : row;
}

function orderClause(cfg: EntityConfig<any, any>) {
  const c = cfg.orderBy ? col(cfg.table, cfg.orderBy.col) : cfg.table.id;
  return cfg.orderBy?.dir === 'desc' ? desc(c) : asc(c);
}

function mountReadOnlyPublic(router: Router) {
  for (const key of PUBLIC_READ) {
    const cfg = entities[key];
    router.get(`/${key}`, async (_req, res, next) => {
      try {
        const rows = await db.select().from(cfg.table).orderBy(orderClause(cfg));
        res.json(rows.map((r) => transform(cfg, r as Record<string, unknown>)));
      } catch (e) { next(e); }
    });
    router.get(`/${key}/:id`, async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ error: 'Невалиден ID' });
        const [row] = await db.select().from(cfg.table).where(eq(cfg.table.id, id));
        if (!row) return res.status(404).json({ error: 'Не е најдено' });
        res.json(transform(cfg, row as Record<string, unknown>));
      } catch (e) { next(e); }
    });
  }
}

function asValidationError(res: any, err: z.ZodError) {
  return res.status(400).json({
    error: 'Невалидни податоци',
    details: err.flatten(),
  });
}

function mountAdminCrud(router: Router) {
  router.use(requireAdmin);
  for (const key of Object.keys(entities) as EntityKey[]) {
    const cfg = entities[key];

    router.get(`/${key}`, async (_req, res, next) => {
      try {
        const rows = await db.select().from(cfg.table).orderBy(orderClause(cfg));
        res.json(rows.map((r) => transform(cfg, r as Record<string, unknown>)));
      } catch (e) { next(e); }
    });

    router.get(`/${key}/:id`, async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ error: 'Невалиден ID' });
        const [row] = await db.select().from(cfg.table).where(eq(cfg.table.id, id));
        if (!row) return res.status(404).json({ error: 'Не е најдено' });
        res.json(transform(cfg, row as Record<string, unknown>));
      } catch (e) { next(e); }
    });

    if (!NO_ADMIN_CREATE.includes(key)) {
      router.post(`/${key}`, async (req, res, next) => {
        try {
          const parsed = (cfg.createSchema as ZodTypeAny).safeParse(req.body);
          if (!parsed.success) return asValidationError(res, parsed.error);
          const data = cfg.toRow ? await cfg.toRow(parsed.data) : (parsed.data as Record<string, unknown>);
          const [row] = await db.insert(cfg.table).values(data as any).returning();
          res.status(201).json(transform(cfg, row as Record<string, unknown>));
        } catch (e) { next(e); }
      });
    }

    router.put(`/${key}/:id`, async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ error: 'Невалиден ID' });
        const parsed = (cfg.updateSchema as ZodTypeAny).safeParse(req.body);
        if (!parsed.success) return asValidationError(res, parsed.error);
        const data = cfg.toRow ? await cfg.toRow(parsed.data) : (parsed.data as Record<string, unknown>);
        if (Object.keys(data).length === 0) {
          return res.status(400).json({ error: 'Нема податоци за ажурирање' });
        }
        const [row] = await db.update(cfg.table).set(data as any).where(eq(cfg.table.id, id)).returning();
        if (!row) return res.status(404).json({ error: 'Не е најдено' });
        res.json(transform(cfg, row as Record<string, unknown>));
      } catch (e) { next(e); }
    });

    router.delete(`/${key}/:id`, async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ error: 'Невалиден ID' });
        const [row] = await db.delete(cfg.table).where(eq(cfg.table.id, id)).returning();
        if (!row) return res.status(404).json({ error: 'Не е најдено' });
        res.json({ ok: true });
      } catch (e) { next(e); }
    });
  }
}

export const publicRouter: Router = Router();
mountReadOnlyPublic(publicRouter);

export const adminRouter: Router = Router();
mountAdminCrud(adminRouter);

export const entityNames = Object.keys(entities);
