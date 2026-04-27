import { pgTable, serial, text, integer, timestamp, varchar, date, jsonb, } from 'drizzle-orm/pg-core';
export const adminUsers = pgTable('admin_users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 32 }).notNull().default('admin'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
// Lookup tables
export const typeObjava = pgTable('type_objava', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
});
export const typeLegislativa = pgTable('type_legislativa', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
});
export const typeOfProblems = pgTable('type_of_problems', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
});
export const naseleniMesta = pgTable('naseleni_mesta', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
});
// Content tables
export const odnosiSoJavnost = pgTable('odnosi_so_javnost', {
    id: serial('id').primaryKey(),
    typeId: integer('type_id').references(() => typeObjava.id),
    title: varchar('title', { length: 500 }).notNull(),
    picture: text('picture'),
    description: text('description'),
    documents: jsonb('documents').$type().default([]),
    dateValidTo: date('date_valid_to'),
    madeBy: varchar('made_by', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const sluzbenGlasnik = pgTable('sluzben_glasnik', {
    id: serial('id').primaryKey(),
    broj: varchar('broj', { length: 64 }).notNull(),
    date: date('date'),
    document: text('document'),
});
export const vraboteni = pgTable('vraboteni', {
    id: serial('id').primaryKey(),
    firstName: varchar('first_name', { length: 128 }).notNull(),
    lastName: varchar('last_name', { length: 128 }).notNull(),
    email: varchar('email', { length: 255 }),
    oddel: varchar('oddel', { length: 255 }),
    function: varchar('function', { length: 255 }),
});
export const prijaveniProblemi = pgTable('prijaveni_problemi', {
    id: serial('id').primaryKey(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    typeOfProblemId: integer('type_of_problem_id').references(() => typeOfProblems.id),
    description: text('description').notNull(),
    picture: text('picture'),
    naselenoMestoId: integer('naseleno_mesto_id').references(() => naseleniMesta.id),
    date: timestamp('date').defaultNow().notNull(),
    phoneNumber: varchar('phone_number', { length: 64 }),
    email: varchar('email', { length: 255 }),
});
export const budzet = pgTable('budzet', {
    id: serial('id').primaryKey(),
    date: date('date'),
    forYear: integer('for_year'),
    documents: jsonb('documents').$type().default([]),
});
export const legislativa = pgTable('legislativa', {
    id: serial('id').primaryKey(),
    typeId: integer('type_id').references(() => typeLegislativa.id),
    title: varchar('title', { length: 500 }),
    document: text('document'),
});
export const proekti = pgTable('proekti', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    picture: text('picture'),
    documents: jsonb('documents').$type().default([]),
});
export const agenda = pgTable('agenda', {
    id: serial('id').primaryKey(),
    dateTime: timestamp('date_time').notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
});
export const institucii = pgTable('institucii', {
    id: serial('id').primaryKey(),
    nameOfInstitution: varchar('name_of_institution', { length: 500 }).notNull(),
    mestoNaseleno: varchar('mesto_naseleno', { length: 255 }),
    directorFullName: varchar('director_full_name', { length: 255 }),
    directorPicture: varchar('director_picture', { length: 500 }),
    directorBiography: text('director_biography'),
    email: varchar('email', { length: 255 }),
    website: varchar('website', { length: 500 }),
    facebook: varchar('facebook', { length: 500 }),
    instagram: varchar('instagram', { length: 500 }),
});
export const kultura = pgTable('kultura', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    picture: text('picture'),
    description: text('description'),
    date: date('date'),
    images: jsonb('images').$type().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const sport = pgTable('sport', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    picture: text('picture'),
    description: text('description'),
    date: date('date'),
    images: jsonb('images').$type().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const allTables = {
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
    kultura,
    sport,
};
