import { Router, type Request, type Response, type NextFunction } from 'express';
import { eq, desc, asc, type SQL } from 'drizzle-orm';
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { z } from 'zod';
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

type WithId<T extends PgTable> = T & { id: PgColumn };
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

interface Handlers {
  list: AsyncHandler;
  getOne: AsyncHandler;
  create?: AsyncHandler;
  update: AsyncHandler;
  remove: AsyncHandler;
}

// ---------- Shared helpers ----------
const trimmed = z.string().trim();
const optStr = trimmed.min(1).optional().nullable();
const optText = z.string().optional().nullable();
const optInt = z.coerce.number().int().optional().nullable();
const optDate = z.coerce.date().optional().nullable();
const optUrl = z
  .union([z.literal(''), z.string().url()])
  .optional()
  .nullable()
  .transform((v) => (v ? v : v === null ? null : undefined));
const optEmail = z
  .union([z.literal(''), z.string().email()])
  .optional()
  .nullable()
  .transform((v) => (v ? v : v === null ? null : undefined));
const optDocs = z.array(z.string()).optional().nullable();

const passwordPolicy = z
  .string()
  .min(8, 'Лозинката мора да има најмалку 8 знаци')
  .max(128);

function dateOnly(d: Date | null | undefined): string | null | undefined {
  if (d === null) return null;
  if (d === undefined) return undefined;
  return d.toISOString().slice(0, 10);
}

function badId(res: Response): void {
  res.status(400).json({ error: 'Невалиден ID' });
}

function notFound(res: Response): void {
  res.status(404).json({ error: 'Не е најдено' });
}

function zodFail(res: Response, err: z.ZodError): void {
  res.status(400).json({ error: 'Невалидни податоци', details: err.flatten() });
}

// Read + delete are fully generic over WithId<T>: no insert-shape coercion needed.
function readDeleteHandlers<T extends PgTable & { id: PgColumn }>(
  table: WithId<T>,
  order?: SQL,
) {
  const ord = order ?? asc(table.id);
  const list: AsyncHandler = async (_req, res, next) => {
    try { res.json(await db.select().from(table).orderBy(ord)); }
    catch (e) { next(e); }
  };
  const getOne: AsyncHandler = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return badId(res);
      const [row] = await db.select().from(table).where(eq(table.id, id));
      if (!row) return notFound(res);
      res.json(row);
    } catch (e) { next(e); }
  };
  const remove: AsyncHandler = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return badId(res);
      const [row] = await db.delete(table).where(eq(table.id, id)).returning();
      if (!row) return notFound(res);
      res.json({ ok: true });
    } catch (e) { next(e); }
  };
  return { list, getOne, remove };
}

// Wraps a create/update body with parse + DB call. The body receives the
// validated input and returns either the inserted/updated row or null/undefined
// for not-found on update.
function makeCreate<S extends z.ZodTypeAny>(
  schema: S,
  body: (data: z.output<S>) => Promise<Record<string, unknown> | null>,
): AsyncHandler {
  return async (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return zodFail(res, parsed.error);
    try {
      const row = await body(parsed.data);
      if (!row) return notFound(res);
      res.status(201).json(row);
    } catch (e) { next(e); }
  };
}

function makeUpdate<S extends z.ZodTypeAny>(
  schema: S,
  body: (id: number, data: z.output<S>) => Promise<Record<string, unknown> | null | undefined>,
): AsyncHandler {
  return async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return badId(res);
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return zodFail(res, parsed.error);
    try {
      const row = await body(id, parsed.data);
      if (!row) return notFound(res);
      res.json(row);
    } catch (e) { next(e); }
  };
}

// ---------- Lookup tables (id + title only) ----------
const lookupCreate = z.object({ title: trimmed.min(1).max(255) });
const lookupUpdate = lookupCreate.partial();

type LookupTable =
  | typeof typeObjava
  | typeof typeLegislativa
  | typeof typeOfProblems
  | typeof naseleniMesta;

function lookupHandlers(table: LookupTable): Handlers {
  const rd = readDeleteHandlers(table);
  return {
    ...rd,
    create: makeCreate(lookupCreate, async ({ title }) => {
      const [row] = await db.insert(table).values({ title }).returning();
      return row;
    }),
    update: makeUpdate(lookupUpdate, async (id, data) => {
      if (data.title === undefined) return undefined;
      const [row] = await db.update(table).set({ title: data.title }).where(eq(table.id, id)).returning();
      return row;
    }),
  };
}

// ---------- odnosiSoJavnost ----------
type ObjavaInsert = typeof odnosiSoJavnost.$inferInsert;
const objavaCreate = z.object({
  typeId: z.coerce.number().int().optional().nullable(),
  title: trimmed.min(1).max(500),
  picture: optText,
  description: optText,
  documents: optDocs,
  dateValidTo: optDate,
  madeBy: optStr.transform((v) => v ?? undefined),
});
const objavaUpdate = objavaCreate.partial();

function toObjavaInsert(input: z.output<typeof objavaCreate>): ObjavaInsert {
  return {
    typeId: input.typeId ?? null,
    title: input.title,
    picture: input.picture ?? null,
    description: input.description ?? null,
    documents: input.documents ?? [],
    dateValidTo: dateOnly(input.dateValidTo) ?? null,
    madeBy: input.madeBy ?? null,
  };
}
function toObjavaUpdate(input: z.output<typeof objavaUpdate>): Partial<ObjavaInsert> {
  const out: Partial<ObjavaInsert> = {};
  if (input.typeId !== undefined) out.typeId = input.typeId;
  if (input.title !== undefined) out.title = input.title;
  if (input.picture !== undefined) out.picture = input.picture;
  if (input.description !== undefined) out.description = input.description;
  if (input.documents !== undefined) out.documents = input.documents;
  if (input.dateValidTo !== undefined) out.dateValidTo = dateOnly(input.dateValidTo);
  if (input.madeBy !== undefined) out.madeBy = input.madeBy;
  return out;
}

// ---------- sluzbenGlasnik ----------
type GlasnikInsert = typeof sluzbenGlasnik.$inferInsert;
const glasnikCreate = z.object({
  broj: trimmed.min(1).max(64),
  date: optDate,
  document: optText,
});
const glasnikUpdate = glasnikCreate.partial();

function toGlasnikInsert(i: z.output<typeof glasnikCreate>): GlasnikInsert {
  return { broj: i.broj, date: dateOnly(i.date) ?? null, document: i.document ?? null };
}
function toGlasnikUpdate(i: z.output<typeof glasnikUpdate>): Partial<GlasnikInsert> {
  const out: Partial<GlasnikInsert> = {};
  if (i.broj !== undefined) out.broj = i.broj;
  if (i.date !== undefined) out.date = dateOnly(i.date);
  if (i.document !== undefined) out.document = i.document;
  return out;
}

// ---------- vraboteni ----------
type VrabotenInsert = typeof vraboteni.$inferInsert;
const vrabotenCreate = z.object({
  firstName: trimmed.min(1).max(128),
  lastName: trimmed.min(1).max(128),
  email: optEmail,
  oddel: optStr,
  function: optStr,
});
const vrabotenUpdate = vrabotenCreate.partial();

function toVrabotenInsert(i: z.output<typeof vrabotenCreate>): VrabotenInsert {
  return {
    firstName: i.firstName,
    lastName: i.lastName,
    email: i.email ?? null,
    oddel: i.oddel ?? null,
    function: i.function ?? null,
  };
}
function toVrabotenUpdate(i: z.output<typeof vrabotenUpdate>): Partial<VrabotenInsert> {
  const out: Partial<VrabotenInsert> = {};
  if (i.firstName !== undefined) out.firstName = i.firstName;
  if (i.lastName !== undefined) out.lastName = i.lastName;
  if (i.email !== undefined) out.email = i.email;
  if (i.oddel !== undefined) out.oddel = i.oddel;
  if (i.function !== undefined) out.function = i.function;
  return out;
}

// ---------- prijaveniProblemi (admin update only) ----------
type ProblemInsert = typeof prijaveniProblemi.$inferInsert;
const problemUpdate = z.object({
  fullName: optStr,
  typeOfProblemId: optInt,
  description: optText,
  picture: optText,
  naselenoMestoId: optInt,
  phoneNumber: optStr,
  email: optEmail,
}).partial();

function toProblemUpdate(i: z.output<typeof problemUpdate>): Partial<ProblemInsert> {
  const out: Partial<ProblemInsert> = {};
  if (i.fullName !== undefined && i.fullName !== null) out.fullName = i.fullName;
  if (i.typeOfProblemId !== undefined) out.typeOfProblemId = i.typeOfProblemId;
  if (i.description !== undefined && i.description !== null) out.description = i.description;
  if (i.picture !== undefined) out.picture = i.picture;
  if (i.naselenoMestoId !== undefined) out.naselenoMestoId = i.naselenoMestoId;
  if (i.phoneNumber !== undefined) out.phoneNumber = i.phoneNumber;
  if (i.email !== undefined) out.email = i.email;
  return out;
}

// ---------- budzet ----------
type BudzetInsert = typeof budzet.$inferInsert;
const budzetCreate = z.object({
  forYear: z.coerce.number().int().min(1900).max(3000),
  date: optDate,
  documents: optDocs,
});
const budzetUpdate = budzetCreate.partial();

function toBudzetInsert(i: z.output<typeof budzetCreate>): BudzetInsert {
  return { forYear: i.forYear, date: dateOnly(i.date) ?? null, documents: i.documents ?? [] };
}
function toBudzetUpdate(i: z.output<typeof budzetUpdate>): Partial<BudzetInsert> {
  const out: Partial<BudzetInsert> = {};
  if (i.forYear !== undefined) out.forYear = i.forYear;
  if (i.date !== undefined) out.date = dateOnly(i.date);
  if (i.documents !== undefined) out.documents = i.documents;
  return out;
}

// ---------- legislativa ----------
type LegislativaInsert = typeof legislativa.$inferInsert;
const legislativaCreate = z.object({
  typeId: z.coerce.number().int().optional().nullable(),
  title: optStr,
  document: optText,
});
const legislativaUpdate = legislativaCreate.partial();

function toLegislativaInsert(i: z.output<typeof legislativaCreate>): LegislativaInsert {
  return { typeId: i.typeId ?? null, title: i.title ?? null, document: i.document ?? null };
}
function toLegislativaUpdate(i: z.output<typeof legislativaUpdate>): Partial<LegislativaInsert> {
  const out: Partial<LegislativaInsert> = {};
  if (i.typeId !== undefined) out.typeId = i.typeId;
  if (i.title !== undefined) out.title = i.title;
  if (i.document !== undefined) out.document = i.document;
  return out;
}

// ---------- proekti ----------
type ProektInsert = typeof proekti.$inferInsert;
const proektCreate = z.object({
  title: trimmed.min(1).max(500),
  description: optText,
  picture: optText,
  documents: optDocs,
});
const proektUpdate = proektCreate.partial();

function toProektInsert(i: z.output<typeof proektCreate>): ProektInsert {
  return {
    title: i.title,
    description: i.description ?? null,
    picture: i.picture ?? null,
    documents: i.documents ?? [],
  };
}
function toProektUpdate(i: z.output<typeof proektUpdate>): Partial<ProektInsert> {
  const out: Partial<ProektInsert> = {};
  if (i.title !== undefined) out.title = i.title;
  if (i.description !== undefined) out.description = i.description;
  if (i.picture !== undefined) out.picture = i.picture;
  if (i.documents !== undefined) out.documents = i.documents;
  return out;
}

// ---------- agenda ----------
type AgendaInsert = typeof agenda.$inferInsert;
const agendaCreate = z.object({
  dateTime: z.coerce.date(),
  title: trimmed.min(1).max(500),
  description: optText,
});
const agendaUpdate = agendaCreate.partial();

function toAgendaInsert(i: z.output<typeof agendaCreate>): AgendaInsert {
  return { dateTime: i.dateTime, title: i.title, description: i.description ?? null };
}
function toAgendaUpdate(i: z.output<typeof agendaUpdate>): Partial<AgendaInsert> {
  const out: Partial<AgendaInsert> = {};
  if (i.dateTime !== undefined) out.dateTime = i.dateTime;
  if (i.title !== undefined) out.title = i.title;
  if (i.description !== undefined) out.description = i.description;
  return out;
}

// ---------- institucii ----------
type InstitucijaInsert = typeof institucii.$inferInsert;
const institucijaCreate = z.object({
  nameOfInstitution: trimmed.min(1).max(500),
  mestoNaseleno: optStr,
  directorFullName: optStr,
  directorBiography: optText,
  email: optEmail,
  website: optUrl,
  facebook: optUrl,
  instagram: optUrl,
});
const institucijaUpdate = institucijaCreate.partial();

function toInstitucijaInsert(i: z.output<typeof institucijaCreate>): InstitucijaInsert {
  return {
    nameOfInstitution: i.nameOfInstitution,
    mestoNaseleno: i.mestoNaseleno ?? null,
    directorFullName: i.directorFullName ?? null,
    directorBiography: i.directorBiography ?? null,
    email: i.email ?? null,
    website: i.website ?? null,
    facebook: i.facebook ?? null,
    instagram: i.instagram ?? null,
  };
}
function toInstitucijaUpdate(i: z.output<typeof institucijaUpdate>): Partial<InstitucijaInsert> {
  const out: Partial<InstitucijaInsert> = {};
  if (i.nameOfInstitution !== undefined) out.nameOfInstitution = i.nameOfInstitution;
  if (i.mestoNaseleno !== undefined) out.mestoNaseleno = i.mestoNaseleno;
  if (i.directorFullName !== undefined) out.directorFullName = i.directorFullName;
  if (i.directorBiography !== undefined) out.directorBiography = i.directorBiography;
  if (i.email !== undefined) out.email = i.email;
  if (i.website !== undefined) out.website = i.website;
  if (i.facebook !== undefined) out.facebook = i.facebook;
  if (i.instagram !== undefined) out.instagram = i.instagram;
  return out;
}

// ---------- adminUsers ----------
type AdminUserInsert = typeof adminUsers.$inferInsert;
const adminUserCreate = z.object({
  email: trimmed.toLowerCase().email(),
  name: trimmed.min(1).max(255),
  role: trimmed.max(32).optional(),
  password: passwordPolicy,
});
const adminUserUpdate = z.object({
  email: trimmed.toLowerCase().email().optional(),
  name: trimmed.min(1).max(255).optional(),
  role: trimmed.max(32).optional(),
  password: passwordPolicy.optional(),
});

const adminUserPublicCols = {
  id: adminUsers.id,
  email: adminUsers.email,
  name: adminUsers.name,
  role: adminUsers.role,
  createdAt: adminUsers.createdAt,
};

async function toAdminUserInsert(i: z.output<typeof adminUserCreate>): Promise<AdminUserInsert> {
  return {
    email: i.email,
    name: i.name,
    role: i.role ?? 'admin',
    passwordHash: await bcrypt.hash(i.password, 10),
  };
}
async function toAdminUserUpdate(
  i: z.output<typeof adminUserUpdate>,
): Promise<Partial<AdminUserInsert>> {
  const out: Partial<AdminUserInsert> = {};
  if (i.email !== undefined) out.email = i.email;
  if (i.name !== undefined) out.name = i.name;
  if (i.role !== undefined) out.role = i.role;
  if (i.password !== undefined) out.passwordHash = await bcrypt.hash(i.password, 10);
  return out;
}

// ---------- Build the entity registry ----------
function entityHandlers<T extends WithId<PgTable>>(
  table: T,
  rd: ReturnType<typeof readDeleteHandlers>,
  create: AsyncHandler,
  update: AsyncHandler,
): Handlers {
  void table;
  return { ...rd, create, update };
}

const objavaRD = readDeleteHandlers(odnosiSoJavnost, desc(odnosiSoJavnost.createdAt));
const glasnikRD = readDeleteHandlers(sluzbenGlasnik, desc(sluzbenGlasnik.date));
const vrabotenRD = readDeleteHandlers(vraboteni);
const problemRD = readDeleteHandlers(prijaveniProblemi, desc(prijaveniProblemi.date));
const budzetRD = readDeleteHandlers(budzet, desc(budzet.forYear));
const legislativaRD = readDeleteHandlers(legislativa);
const proektiRD = readDeleteHandlers(proekti);
const agendaRD = readDeleteHandlers(agenda, asc(agenda.dateTime));
const institucijaRD = readDeleteHandlers(institucii);

// adminUsers — replace the generic read handlers with ones that strip passwordHash
// from responses by selecting a public-only column projection.
const adminUserRD = (() => {
  const baseRemove = readDeleteHandlers(adminUsers).remove;
  const list: AsyncHandler = async (_req, res, next) => {
    try { res.json(await db.select(adminUserPublicCols).from(adminUsers).orderBy(asc(adminUsers.id))); }
    catch (e) { next(e); }
  };
  const getOne: AsyncHandler = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return badId(res);
      const [row] = await db.select(adminUserPublicCols).from(adminUsers).where(eq(adminUsers.id, id));
      if (!row) return notFound(res);
      res.json(row);
    } catch (e) { next(e); }
  };
  return { list, getOne, remove: baseRemove };
})();

const entities: Record<string, Handlers> = {
  'type-objava': lookupHandlers(typeObjava),
  'type-legislativa': lookupHandlers(typeLegislativa),
  'type-of-problems': lookupHandlers(typeOfProblems),
  'naseleni-mesta': lookupHandlers(naseleniMesta),

  'odnosi-so-javnost': entityHandlers(odnosiSoJavnost, objavaRD,
    makeCreate(objavaCreate, async (data) => {
      const [row] = await db.insert(odnosiSoJavnost).values(toObjavaInsert(data)).returning();
      return row;
    }),
    makeUpdate(objavaUpdate, async (id, data) => {
      const set = toObjavaUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(odnosiSoJavnost).set(set).where(eq(odnosiSoJavnost.id, id)).returning();
      return row;
    }),
  ),

  'sluzben-glasnik': entityHandlers(sluzbenGlasnik, glasnikRD,
    makeCreate(glasnikCreate, async (data) => {
      const [row] = await db.insert(sluzbenGlasnik).values(toGlasnikInsert(data)).returning();
      return row;
    }),
    makeUpdate(glasnikUpdate, async (id, data) => {
      const set = toGlasnikUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(sluzbenGlasnik).set(set).where(eq(sluzbenGlasnik.id, id)).returning();
      return row;
    }),
  ),

  'vraboteni': entityHandlers(vraboteni, vrabotenRD,
    makeCreate(vrabotenCreate, async (data) => {
      const [row] = await db.insert(vraboteni).values(toVrabotenInsert(data)).returning();
      return row;
    }),
    makeUpdate(vrabotenUpdate, async (id, data) => {
      const set = toVrabotenUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(vraboteni).set(set).where(eq(vraboteni.id, id)).returning();
      return row;
    }),
  ),

  // No create handler — problems are submitted via POST /api/problems only.
  'prijaveni-problemi': {
    ...problemRD,
    update: makeUpdate(problemUpdate, async (id, data) => {
      const set = toProblemUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(prijaveniProblemi).set(set).where(eq(prijaveniProblemi.id, id)).returning();
      return row;
    }),
  },

  'budzet': entityHandlers(budzet, budzetRD,
    makeCreate(budzetCreate, async (data) => {
      const [row] = await db.insert(budzet).values(toBudzetInsert(data)).returning();
      return row;
    }),
    makeUpdate(budzetUpdate, async (id, data) => {
      const set = toBudzetUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(budzet).set(set).where(eq(budzet.id, id)).returning();
      return row;
    }),
  ),

  'legislativa': entityHandlers(legislativa, legislativaRD,
    makeCreate(legislativaCreate, async (data) => {
      const [row] = await db.insert(legislativa).values(toLegislativaInsert(data)).returning();
      return row;
    }),
    makeUpdate(legislativaUpdate, async (id, data) => {
      const set = toLegislativaUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(legislativa).set(set).where(eq(legislativa.id, id)).returning();
      return row;
    }),
  ),

  'proekti': entityHandlers(proekti, proektiRD,
    makeCreate(proektCreate, async (data) => {
      const [row] = await db.insert(proekti).values(toProektInsert(data)).returning();
      return row;
    }),
    makeUpdate(proektUpdate, async (id, data) => {
      const set = toProektUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(proekti).set(set).where(eq(proekti.id, id)).returning();
      return row;
    }),
  ),

  'agenda': entityHandlers(agenda, agendaRD,
    makeCreate(agendaCreate, async (data) => {
      const [row] = await db.insert(agenda).values(toAgendaInsert(data)).returning();
      return row;
    }),
    makeUpdate(agendaUpdate, async (id, data) => {
      const set = toAgendaUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(agenda).set(set).where(eq(agenda.id, id)).returning();
      return row;
    }),
  ),

  'institucii': entityHandlers(institucii, institucijaRD,
    makeCreate(institucijaCreate, async (data) => {
      const [row] = await db.insert(institucii).values(toInstitucijaInsert(data)).returning();
      return row;
    }),
    makeUpdate(institucijaUpdate, async (id, data) => {
      const set = toInstitucijaUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(institucii).set(set).where(eq(institucii.id, id)).returning();
      return row;
    }),
  ),

  'admin-users': {
    ...adminUserRD,
    create: makeCreate(adminUserCreate, async (data) => {
      const values = await toAdminUserInsert(data);
      const [row] = await db.insert(adminUsers).values(values).returning(adminUserPublicCols);
      return row;
    }),
    update: makeUpdate(adminUserUpdate, async (id, data) => {
      const set = await toAdminUserUpdate(data);
      if (Object.keys(set).length === 0) return undefined;
      const [row] = await db.update(adminUsers).set(set).where(eq(adminUsers.id, id)).returning(adminUserPublicCols);
      return row;
    }),
  },
};

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
