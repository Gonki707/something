import { Router, type Request, type Response, type NextFunction } from 'express';
import { eq, desc, asc, type SQL } from 'drizzle-orm';
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { z, type ZodTypeAny } from 'zod';
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

// Tables in this app are guaranteed to expose an `id: serial primary key`.
type WithId<T extends PgTable> = T & { id: PgColumn };

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
  password: passwordPolicy,
});
const adminUserUpdate = z.object({
  email: z.string().trim().toLowerCase().email().optional(),
  name: z.string().trim().min(1).max(255).optional(),
  role: z.string().trim().max(32).optional(),
  password: passwordPolicy.optional(),
});

async function adminUserToRow(input: Partial<z.infer<typeof adminUserCreate>>) {
  const row: Record<string, unknown> = {};
  if (input.email !== undefined) row.email = input.email;
  if (input.name !== undefined) row.name = input.name;
  if (input.role !== undefined) row.role = input.role;
  if (input.password) row.passwordHash = await bcrypt.hash(input.password, 10);
  return row;
}

function stripPasswordHash(row: Record<string, unknown>): Record<string, unknown> {
  const { passwordHash: _ph, ...rest } = row as Record<string, unknown> & { passwordHash?: unknown };
  return rest;
}

// ---------- Existential entity registration ----------
//
// Each entity captures its concrete table type T inside a closure that produces
// fully-typed handlers. The outer registry stores only the closure, not the
// generic type, so we never need broad `any`/`unknown` casts at the call sites.
//
// Drizzle's `db.insert(table).values(data)` requires `data` to satisfy the
// table's inferred insert shape. Each per-entity Zod schema is the contract for
// what the API accepts; the small `applyRow` helper inside `defineEntity` is
// the *single, documented* place where validated input is bridged into
// Drizzle's typed insert API.

interface Handlers {
  list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  getOne: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  create?: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  remove: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

interface EntityOptions<T extends PgTable, In, Out extends Record<string, unknown>> {
  table: WithId<T>;
  createSchema: z.ZodType<In>;
  updateSchema: z.ZodType<Partial<In>>;
  orderBy?: (table: WithId<T>) => SQL;
  /** Convert validated Zod input into the row shape Drizzle expects. */
  toRow?: (input: Partial<In>) => Promise<Record<string, unknown>> | Record<string, unknown>;
  /** Strip secrets / shape outgoing rows. */
  toClient?: (row: Record<string, unknown>) => Out;
  /** When false, no POST handler is registered (e.g. prijaveni-problemi). */
  allowCreate?: boolean;
}

function asValidationError(res: Response, err: z.ZodError) {
  res.status(400).json({ error: 'Невалидни податоци', details: err.flatten() });
}

function defineEntity<T extends PgTable, In, Out extends Record<string, unknown>>(
  opts: EntityOptions<T, In, Out>,
): Handlers {
  const { table, createSchema, updateSchema, orderBy, toRow, toClient, allowCreate = true } = opts;

  const transform = (row: Record<string, unknown>): Record<string, unknown> =>
    toClient ? toClient(row) : row;

  const order = orderBy ? orderBy(table) : asc(table.id);

  // The single, documented bridge between Zod-validated input and Drizzle's
  // generic table insert/update. We narrow `T` enough that this stays inside
  // this helper and never leaks to handler call sites.
  type InsertShape = T['$inferInsert'];
  const applyInsert = async (data: Record<string, unknown>) => {
    const [row] = await db
      .insert(table)
      .values(data as InsertShape)
      .returning();
    return row as Record<string, unknown>;
  };
  const applyUpdate = async (id: number, data: Record<string, unknown>) => {
    const [row] = await db
      .update(table)
      .set(data as Partial<InsertShape>)
      .where(eq(table.id, id))
      .returning();
    return row as Record<string, unknown> | undefined;
  };

  const list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await db.select().from(table).orderBy(order);
      res.json((rows as Record<string, unknown>[]).map(transform));
    } catch (e) { next(e); }
  };

  const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) { res.status(400).json({ error: 'Невалиден ID' }); return; }
      const [row] = await db.select().from(table).where(eq(table.id, id));
      if (!row) { res.status(404).json({ error: 'Не е најдено' }); return; }
      res.json(transform(row as Record<string, unknown>));
    } catch (e) { next(e); }
  };

  const create = allowCreate
    ? async (req: Request, res: Response, next: NextFunction) => {
        try {
          const parsed = createSchema.safeParse(req.body);
          if (!parsed.success) { asValidationError(res, parsed.error); return; }
          const data = toRow ? await toRow(parsed.data) : (parsed.data as Record<string, unknown>);
          const row = await applyInsert(data);
          res.status(201).json(transform(row));
        } catch (e) { next(e); }
      }
    : undefined;

  const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) { res.status(400).json({ error: 'Невалиден ID' }); return; }
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) { asValidationError(res, parsed.error); return; }
      const data = toRow ? await toRow(parsed.data) : (parsed.data as Record<string, unknown>);
      if (Object.keys(data).length === 0) {
        res.status(400).json({ error: 'Нема податоци за ажурирање' });
        return;
      }
      const row = await applyUpdate(id, data);
      if (!row) { res.status(404).json({ error: 'Не е најдено' }); return; }
      res.json(transform(row));
    } catch (e) { next(e); }
  };

  const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) { res.status(400).json({ error: 'Невалиден ID' }); return; }
      const [row] = await db.delete(table).where(eq(table.id, id)).returning();
      if (!row) { res.status(404).json({ error: 'Не е најдено' }); return; }
      res.json({ ok: true });
    } catch (e) { next(e); }
  };

  return create ? { list, getOne, create, update, remove } : { list, getOne, update, remove };
}

// ---------- Entity registry ----------
const entities: Record<string, Handlers> = {
  'type-objava': defineEntity({ table: typeObjava, createSchema: lookupCreate, updateSchema: lookupUpdate }),
  'type-legislativa': defineEntity({ table: typeLegislativa, createSchema: lookupCreate, updateSchema: lookupUpdate }),
  'type-of-problems': defineEntity({ table: typeOfProblems, createSchema: lookupCreate, updateSchema: lookupUpdate }),
  'naseleni-mesta': defineEntity({ table: naseleniMesta, createSchema: lookupCreate, updateSchema: lookupUpdate }),

  'odnosi-so-javnost': defineEntity({
    table: odnosiSoJavnost,
    orderBy: (t) => desc(t.createdAt),
    createSchema: objavaCreate,
    updateSchema: objavaUpdate,
  }),
  'sluzben-glasnik': defineEntity({
    table: sluzbenGlasnik,
    orderBy: (t) => desc(t.date),
    createSchema: glasnikCreate,
    updateSchema: glasnikUpdate,
  }),
  'vraboteni': defineEntity({ table: vraboteni, createSchema: vrabotenCreate, updateSchema: vrabotenUpdate }),
  'prijaveni-problemi': defineEntity({
    table: prijaveniProblemi,
    orderBy: (t) => desc(t.date),
    // Problems are only created via the public POST /api/problems endpoint.
    createSchema: problemUpdate as ZodTypeAny as z.ZodType<Record<string, unknown>>,
    updateSchema: problemUpdate,
    allowCreate: false,
  }),
  'budzet': defineEntity({
    table: budzet,
    orderBy: (t) => desc(t.forYear),
    createSchema: budzetCreate,
    updateSchema: budzetUpdate,
  }),
  'legislativa': defineEntity({ table: legislativa, createSchema: legislativaCreate, updateSchema: legislativaUpdate }),
  'proekti': defineEntity({ table: proekti, createSchema: proektCreate, updateSchema: proektUpdate }),
  'agenda': defineEntity({
    table: agenda,
    orderBy: (t) => asc(t.dateTime),
    createSchema: agendaCreate,
    updateSchema: agendaUpdate,
  }),
  'institucii': defineEntity({ table: institucii, createSchema: institucijaCreate, updateSchema: institucijaUpdate }),
  'admin-users': defineEntity({
    table: adminUsers,
    createSchema: adminUserCreate,
    updateSchema: adminUserUpdate,
    toRow: adminUserToRow,
    toClient: stripPasswordHash,
  }),
};

// Entities exposed on the public read API.
const PUBLIC_READ = [
  'type-objava', 'type-legislativa', 'type-of-problems', 'naseleni-mesta',
  'odnosi-so-javnost', 'sluzben-glasnik', 'vraboteni', 'budzet',
  'legislativa', 'proekti', 'agenda', 'institucii',
];

export const publicRouter: Router = Router();
for (const key of PUBLIC_READ) {
  const h = entities[key];
  publicRouter.get(`/${key}`, h.list);
  publicRouter.get(`/${key}/:id`, h.getOne);
}

export const adminRouter: Router = Router();
adminRouter.use(requireAdmin);
for (const [key, h] of Object.entries(entities)) {
  adminRouter.get(`/${key}`, h.list);
  adminRouter.get(`/${key}/:id`, h.getOne);
  if (h.create) adminRouter.post(`/${key}`, h.create);
  adminRouter.put(`/${key}/:id`, h.update);
  adminRouter.delete(`/${key}/:id`, h.remove);
}

export const entityNames = Object.keys(entities);
