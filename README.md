# Општина Маврово и Ростуше — веб страница

Полна апликација со:

- **`/frontend`** — React + TypeScript + Vite (јавна веб страница на македонски кирилица + админ панел)
- **`/backend`** — Node.js + Express + TypeScript + PostgreSQL (Drizzle ORM)
- Чисто одвоени папки, лесно се клонира и вртат локално.

---

## Што може?

### Јавна веб страница
- Модерна почетна страна со херо, брзи врски, најнови вести и календар со настани.
- Сложено падачко мени (Запознај ја општината + Мени со секции за Локална самоуправа, Односи со јавност, Финансии, Легислатива, Проекти).
- Динамички страници: Новости, Соопштенија, Огласи, Конкурси, Службен гласник, Буџет, Проекти, Легислатива, Вработени, Институции, Населени места.
- Форма „Пријави проблем“ што зачувува во базата и (опционо) праќа е-маил до општината.

### Админ панел (`/admin`)
- Најава со е-маил и лозинка.
- CRUD за сите 14 табели: објави, службен гласник, вработени, пријавени проблеми, буџет, легислатива, проекти, агенда, институции, шифрарници (типови, населени места) и админ корисници.
- Прикачување слики и документи.
- Поле за избор (dropdown) кое ги вчитува шифрарниците автоматски.

---

## Барања
- **Node.js 18+** (препорачано 20 или 22)
- **PostgreSQL 14+** инсталиран и стартуван локално
- **npm** (или pnpm/yarn — командите подолу се за npm)

---

## 1) Подеси база на податоци

Креирај празна база:

```bash
psql -U postgres -c "CREATE DATABASE mavrovo;"
```

(Или користи pgAdmin / TablePlus за да ја креираш `mavrovo`.)

---

## 2) Стартувај го backend-от

```bash
cd backend
cp .env.example .env
# отвори .env и стави го точниот DATABASE_URL и JWT_SECRET
# ако сакаш и SMTP за е-маил пораки

npm install
npm run db:push      # креира ги сите табели
npm run db:seed      # внесува почетен админ + шифрарници + примери податоци
npm run dev          # стартува на http://localhost:4000
```

Стандардна најава за админ:
- е-маил: `admin@mavrovo.gov.mk`
- лозинка: `admin123`

(Може да го смениш во `.env` пред да го извршиш `db:seed`.)

---

## 3) Стартувај го frontend-от (во нов терминал)

```bash
cd frontend
npm install
npm run dev          # стартува на http://localhost:5173
```

Vite е конфигуриран со proxy кон `http://localhost:4000` за `/api` и `/uploads`, така што не треба ништо да менуваш.

Отвори:
- 🌐 Јавна страна: <http://localhost:5173>
- 🔐 Админ панел: <http://localhost:5173/admin>

---

## Структура на проектот

```
mavrovo-website/
├── backend/
│   ├── src/
│   │   ├── config/         (env, db, mailer)
│   │   ├── db/             (schema.ts, seed.ts)
│   │   ├── middleware/     (auth, error)
│   │   ├── routes/         (auth, upload, problems, crud)
│   │   ├── app.ts
│   │   └── index.ts
│   ├── uploads/            (прикачени фајлови — се сервираат на /uploads)
│   ├── drizzle.config.ts
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/            (типизиран клиент)
    │   ├── components/     (Header, Footer, Calendar)
    │   ├── layouts/        (PublicLayout, AdminLayout)
    │   ├── pages/          (јавни страници)
    │   ├── pages/admin/    (админ страници — CRUD за сите табели)
    │   ├── styles/
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## Како да додадам нова табела во админот?

1. Додај `pgTable` во `backend/src/db/schema.ts`.
2. Додај го во `entities` мапата во `backend/src/routes/crud.ts`.
3. Додај го во `ADMIN_ENTITIES` во `frontend/src/pages/admin/entitiesConfig.ts` со полиња и нивните типови (`text`, `select`, `image`, итн.).
4. Изврши `npm run db:push` во `backend/`.

Готово — генеричките CRUD страници автоматски ќе ја прикажат новата табела.

---

## Е-маил конфигурација (опционо)

Во `backend/.env` стави SMTP податоци:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-account@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="Општина Маврово и Ростуше <noreply@mavrovo.gov.mk>"
MAIL_TO=info@mavrovo.gov.mk
```

Ако SMTP не е конфигуриран, формата „Пријави проблем“ сепак ќе зачувува во базата (само е-маилот ќе биде прескокнат).

---

## Production билд

```bash
cd backend && npm run build && npm start
cd frontend && npm run build      # генерира /frontend/dist
```

---

## Лиценца
Општина Маврово и Ростуше — 2026.
