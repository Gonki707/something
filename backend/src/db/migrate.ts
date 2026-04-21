import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'node:path';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL не е поставен во .env');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client);

const folder = path.resolve(process.cwd(), 'drizzle');

console.log(`Извршување миграции од ${folder}…`);
await migrate(db, { migrationsFolder: folder });
console.log('✓ Миграциите се успешно извршени.');
await client.end();
