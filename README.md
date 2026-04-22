# Општина Маврово и Ростуше — Официјален веб-портал

Official municipal website for the **Municipality of Mavrovo and Rostuše** (North Macedonia).  
Built with React + Node.js + PostgreSQL — two separate `npm run dev` commands and you are live.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript · Vite |
| Backend | Node.js · Express · TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL 14+ |
| Auth | JWT stored in HTTP-only cookies |
| File uploads | Multer → local `/backend/uploads/` directory |

---

## Project Structure

```
mavrovo/
├── backend/                  # Express API server (port 8000)
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts     # All 14 Drizzle table definitions
│   │   │   ├── migrate.ts    # Migration runner
│   │   │   └── seed.ts       # Initial seed data (admin user + demo content)
│   │   ├── routes/
│   │   │   ├── auth.ts       # Login / logout / session check
│   │   │   ├── crud.ts       # Generic CRUD for all 14 content tables
│   │   │   └── upload.ts     # Image & document upload handler
│   │   └── index.ts          # Express entry point
│   ├── uploads/              # Uploaded files served at /uploads/*
│   ├── drizzle.config.ts
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # React + Vite SPA (port 5173)
    ├── src/
    │   ├── api/              # Typed fetch helpers (publicGet, adminPost …)
    │   ├── components/       # Header, Footer, Icon, Calendar, FloatingReportButton …
    │   ├── layouts/          # PublicLayout, AdminLayout
    │   ├── lib/              # Shared helpers (default photo fallbacks)
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── ListPage.tsx  # Shared list + detail view for all public sections
    │   │   ├── ReportProblem.tsx
    │   │   └── admin/        # Admin panel pages + entity config
    │   ├── styles/           # index.css — design tokens + all styles
    │   ├── types/            # TypeScript interfaces for every entity
    │   ├── App.tsx
    │   └── main.tsx
    ├── vite.config.ts        # Proxies /api and /uploads to localhost:8000
    └── package.json
```

---

## Running Locally

### Prerequisites

- **Node.js** ≥ 18 (20 or 22 recommended)
- **PostgreSQL** ≥ 14 running on `localhost:5432`
- **npm**

### 1 — Clone and install

```bash
git clone <repo-url>
cd mavrovo

cd backend  && npm install
cd ../frontend && npm install
```

### 2 — Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Required
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mavrovo
JWT_SECRET=change_me_to_a_long_random_string
PORT=8000

# Optional — SMTP for "Пријави проблем" email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-account@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="Општина Маврово и Ростуше <noreply@mavrovo.gov.mk>"
MAIL_TO=info@mavrovo.gov.mk
```

> If SMTP is not configured the citizen report form still saves to the database — email is simply skipped.

### 3 — Create the database and sync the schema

```bash
# Create an empty database (or use pgAdmin / TablePlus)
psql -U postgres -c "CREATE DATABASE mavrovo;"

# Push the Drizzle schema (creates all tables)
cd backend
npm run db:push

# Seed initial data: admin account, lookup tables, demo content
npm run db:seed
```

### 4 — Start both servers (two terminals)

**Terminal 1 — Backend**
```bash
cd backend
npm run dev          # http://localhost:8000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev          # http://localhost:5173
```

Open `http://localhost:5173` in your browser.

Vite automatically proxies all `/api` and `/uploads` requests to `http://localhost:8000`, so no CORS setup is needed during development.

---

## Database Tables

Drizzle ORM manages all tables. Run `npm run db:push` after changing `schema.ts`.

| Table | Purpose |
|---|---|
| `admin_users` | Admin panel accounts (bcrypt-hashed passwords) |
| `odnosi_so_javnost` | News · Announcements · Ads · Tenders · FOI requests |
| `type_objava` | Lookup: news type labels |
| `legislativa` | Laws, decisions, rulebooks, statutes |
| `type_legislativa` | Lookup: legislation type labels |
| `budzet` | Annual budgets with attached PDF documents |
| `proekti` | Municipal projects (gallery + documents) |
| `agenda` | Council session agendas |
| `sluzben_glasnik` | Official gazette issues |
| `institucii` | Public institutions (schools, utilities …) with director photo |
| `vraboteni` | Municipal employees |
| `prijaveni_problemi` | Citizen-submitted problem reports |
| `type_of_problems` | Lookup: problem categories |
| `naseleni_mesta` | Lookup: populated places in the municipality |

---

## Admin Panel

Access: `http://localhost:5173/admin`

**Default credentials (from seed):**

| Field | Value |
|---|---|
| Email | `admin@mavrovo.gov.mk` |
| Password | `Admin123!` |

> Change the password immediately in production.

The admin panel provides full **Create / Read / Update / Delete** for every content table above, including image and document uploads.

---

## Public Site Features

- **Mega-menu** — 5-column dropdown: Локална самоуправа · Институции · Односи со јавност · Финансии · Легислатива и проекти
- **Home page** — Hero banner, quick-link tiles, latest news cards, mayor section with contact info, latest announcements
- **Вести / Соопштенија / Огласи / Конкурси** — Searchable, filterable paginated lists
- **Институции** — Institution cards with director photo, biography, and contact details
- **Проекти** — Project gallery with downloadable documents
- **Буџет** — Budget documents per year
- **Службен гласник** — Official gazette archive
- **Агенда** — Upcoming council sessions with calendar
- **Пријави проблем** — Floating button → citizen report form (category, location, optional photo)
- **Средба со градоначалник** — Top-bar button opens a modal with the mayor's phone number for scheduling meetings

---

## Available Scripts

### Backend (`cd backend`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with hot-reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run db:push` | Sync Drizzle schema to the database (fast, no migration files) |
| `npm run db:generate` | Generate SQL migration files (for versioned migrations) |
| `npm run db:migrate` | Apply pending SQL migrations |
| `npm run db:seed` | Insert demo / initial data |

### Frontend (`cd frontend`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Adding a New Content Table

1. Add a `pgTable` definition to `backend/src/db/schema.ts`.
2. Add the entity handlers to `backend/src/routes/crud.ts`.
3. Add a config entry to `frontend/src/pages/admin/entitiesConfig.ts` with field definitions (`text`, `select`, `image`, `textarea`, …).
4. Run `npm run db:push` in the `backend/` folder.

The generic CRUD pages pick it up automatically — no additional UI code needed.

---

## File Uploads

Uploaded images and documents are stored in `backend/uploads/` and served as static files at `/uploads/<filename>`.

In production, replace this with object storage (AWS S3, MinIO, Cloudflare R2, etc.) and update the upload route accordingly.

---

## Production Build

```bash
# Backend
cd backend
npm run build
NODE_ENV=production npm start

# Frontend — output goes to frontend/dist/
cd frontend
npm run build
# Serve dist/ with Nginx, Caddy, or any static host
```

Set the following environment variables in your production environment:

```env
DATABASE_URL=postgres://user:pass@host:5432/mavrovo
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
PORT=8000
```

---

## License

Општина Маврово и Ростуше — 2026
