import 'dotenv/config';
import postgres from 'postgres';
const url = process.env.DATABASE_URL;
if (!url) {
    console.error('DATABASE_URL не е поставен во .env');
    process.exit(1);
}
const client = postgres(url, { max: 1 });
async function markMigration() {
    console.log('Поврзување со базата...');
    await client `SELECT 1`;
    console.log('✓ Успешно поврзано.');
    await client.end();
}
markMigration().catch((err) => {
    console.error('Грешка:', err);
    process.exit(1);
});
