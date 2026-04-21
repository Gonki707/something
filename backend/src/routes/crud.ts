import { Router } from 'express';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
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

type AnyTable = any;

interface EntityConfig {
  name: string;
  table: AnyTable;
  orderBy?: { col: string; dir: 'asc' | 'desc' };
  beforeInsert?: (data: any) => Promise<any> | any;
  beforeUpdate?: (data: any, id: number) => Promise<any> | any;
  toClient?: (row: any) => any;
}

const entities: Record<string, EntityConfig> = {
  'type-objava': { name: 'type-objava', table: typeObjava },
  'type-legislativa': { name: 'type-legislativa', table: typeLegislativa },
  'type-of-problems': { name: 'type-of-problems', table: typeOfProblems },
  'naseleni-mesta': { name: 'naseleni-mesta', table: naseleniMesta },
  'odnosi-so-javnost': { name: 'odnosi-so-javnost', table: odnosiSoJavnost, orderBy: { col: 'createdAt', dir: 'desc' } },
  'sluzben-glasnik': { name: 'sluzben-glasnik', table: sluzbenGlasnik, orderBy: { col: 'date', dir: 'desc' } },
  'vraboteni': { name: 'vraboteni', table: vraboteni },
  'prijaveni-problemi': { name: 'prijaveni-problemi', table: prijaveniProblemi, orderBy: { col: 'date', dir: 'desc' } },
  'budzet': { name: 'budzet', table: budzet, orderBy: { col: 'forYear', dir: 'desc' } },
  'legislativa': { name: 'legislativa', table: legislativa },
  'proekti': { name: 'proekti', table: proekti },
  'agenda': { name: 'agenda', table: agenda, orderBy: { col: 'dateTime', dir: 'asc' } },
  'institucii': { name: 'institucii', table: institucii },
  'admin-users': {
    name: 'admin-users',
    table: adminUsers,
    beforeInsert: async (data: any) => {
      if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 10);
        delete data.password;
      }
      return data;
    },
    beforeUpdate: async (data: any) => {
      if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 10);
        delete data.password;
      }
      return data;
    },
    toClient: (row: any) => {
      const { passwordHash, ...rest } = row;
      return rest;
    },
  },
};

const PUBLIC_READ = new Set([
  'type-objava', 'type-legislativa', 'type-of-problems', 'naseleni-mesta',
  'odnosi-so-javnost', 'sluzben-glasnik', 'vraboteni', 'budzet',
  'legislativa', 'proekti', 'agenda', 'institucii',
]);

function transform(cfg: EntityConfig, row: any) {
  return cfg.toClient ? cfg.toClient(row) : row;
}

function mountReadOnlyPublic(router: Router) {
  for (const key of PUBLIC_READ) {
    const cfg = entities[key];
    router.get(`/${key}`, async (_req, res, next) => {
      try {
        const orderCol = cfg.orderBy ? cfg.table[cfg.orderBy.col] : cfg.table.id;
        const orderFn = cfg.orderBy?.dir === 'desc' ? desc : asc;
        const rows = await db.select().from(cfg.table).orderBy(orderFn(orderCol));
        res.json(rows.map((r) => transform(cfg, r)));
      } catch (e) { next(e); }
    });
    router.get(`/${key}/:id`, async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        const [row] = await db.select().from(cfg.table).where(eq(cfg.table.id, id));
        if (!row) return res.status(404).json({ error: 'Не е најдено' });
        res.json(transform(cfg, row));
      } catch (e) { next(e); }
    });
  }
}

function mountAdminCrud(router: Router) {
  router.use(requireAdmin);
  for (const key of Object.keys(entities)) {
    const cfg = entities[key];
    router.get(`/${key}`, async (_req, res, next) => {
      try {
        const orderCol = cfg.orderBy ? cfg.table[cfg.orderBy.col] : cfg.table.id;
        const orderFn = cfg.orderBy?.dir === 'desc' ? desc : asc;
        const rows = await db.select().from(cfg.table).orderBy(orderFn(orderCol));
        res.json(rows.map((r) => transform(cfg, r)));
      } catch (e) { next(e); }
    });
    router.get(`/${key}/:id`, async (req, res, next) => {
      try {
        const [row] = await db.select().from(cfg.table).where(eq(cfg.table.id, Number(req.params.id)));
        if (!row) return res.status(404).json({ error: 'Не е најдено' });
        res.json(transform(cfg, row));
      } catch (e) { next(e); }
    });
    router.post(`/${key}`, async (req, res, next) => {
      try {
        let data = { ...req.body };
        delete data.id;
        if (cfg.beforeInsert) data = await cfg.beforeInsert(data);
        const [row] = await db.insert(cfg.table).values(data).returning();
        res.status(201).json(transform(cfg, row));
      } catch (e) { next(e); }
    });
    router.put(`/${key}/:id`, async (req, res, next) => {
      try {
        const id = Number(req.params.id);
        let data = { ...req.body };
        delete data.id;
        if (cfg.beforeUpdate) data = await cfg.beforeUpdate(data, id);
        const [row] = await db.update(cfg.table).set(data).where(eq(cfg.table.id, id)).returning();
        if (!row) return res.status(404).json({ error: 'Не е најдено' });
        res.json(transform(cfg, row));
      } catch (e) { next(e); }
    });
    router.delete(`/${key}/:id`, async (req, res, next) => {
      try {
        const id = Number(req.params.id);
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
