import bcrypt from 'bcryptjs';
import { db, pgClient } from '../config/db.js';
import { env } from '../config/env.js';
import {
  adminUsers,
  typeObjava,
  typeLegislativa,
  typeOfProblems,
  naseleniMesta,
  agenda,
  vraboteni,
  institucii,
  proekti,
  odnosiSoJavnost,
} from './schema.js';

async function seed() {
  console.log('Seeding database...');

  // Default admin
  const existing = await db.select().from(adminUsers).limit(1);
  if (existing.length === 0) {
    const hash = await bcrypt.hash(env.DEFAULT_ADMIN_PASSWORD, 10);
    await db.insert(adminUsers).values({
      email: env.DEFAULT_ADMIN_EMAIL,
      passwordHash: hash,
      name: env.DEFAULT_ADMIN_NAME,
      role: 'admin',
    });
    console.log(`  + admin user: ${env.DEFAULT_ADMIN_EMAIL} / ${env.DEFAULT_ADMIN_PASSWORD}`);
  }

  type LookupTbl =
    | typeof typeObjava
    | typeof typeLegislativa
    | typeof typeOfProblems
    | typeof naseleniMesta;

  const seedLookup = async (table: LookupTbl, items: string[], label: string) => {
    const exists = await db.select().from(table).limit(1);
    if (exists.length === 0) {
      await db.insert(table).values(items.map((title) => ({ title })));
      console.log(`  + ${label}: ${items.length} items`);
    }
  };

  await seedLookup(typeObjava, ['Новости', 'Соопштенија', 'Огласи', 'Конкурси', 'Пристап до информации'], 'TypeObjava');
  await seedLookup(typeLegislativa, ['Обрасци', 'Закони', 'Статут и кодекс'], 'TypeLegislativa');
  await seedLookup(typeOfProblems, ['Комунален проблем', 'Патишта', 'Осветлување', 'Водовод', 'Друго'], 'TypeOfProblems');
  await seedLookup(
    naseleniMesta,
    [
      'Маврови Анови', 'Ростуше', 'Никифорово', 'Леуново', 'Жировница', 'Велебрдо',
      'Битуше', 'Ѓоновица', 'Скудриње', 'Болетин', 'Долно Косоврасти', 'Требиште',
    ],
    'NaseleniMesta'
  );

  const agendaCount = await db.select().from(agenda).limit(1);
  if (agendaCount.length === 0) {
    const now = new Date();
    await db.insert(agenda).values([
      { dateTime: new Date(now.getTime() + 2 * 86400000), title: 'Седница на Совет на општината', description: 'Редовна седница со разгледување на буџет.' },
      { dateTime: new Date(now.getTime() + 5 * 86400000), title: 'Јавна расправа за урбанистички план', description: 'Отворена за сите граѓани.' },
      { dateTime: new Date(now.getTime() + 12 * 86400000), title: 'Манифестација „Галички свадбен фестивал“', description: 'Традиционална културна манифестација.' },
    ]);
    console.log('  + 3 agenda items');
  }

  const vCount = await db.select().from(vraboteni).limit(1);
  if (vCount.length === 0) {
    await db.insert(vraboteni).values([
      { firstName: 'Медат', lastName: 'Куртовски', email: 'gradonacalnik@mavrovo.gov.mk', oddel: 'Кабинет', function: 'Градоначалник' },
      { firstName: 'Ана', lastName: 'Стојановска', email: 'sekretar@mavrovo.gov.mk', oddel: 'Секретаријат', function: 'Секретар' },
      { firstName: 'Драган', lastName: 'Ѓорѓиевски', email: 'finansii@mavrovo.gov.mk', oddel: 'Финансии', function: 'Раководител' },
    ]);
  }

  const iCount = await db.select().from(institucii).limit(1);
  if (iCount.length === 0) {
    await db.insert(institucii).values([
      { nameOfInstitution: 'ОУ „Јосиф Јосифовски“', mestoNaseleno: 'Ростуше', directorFullName: 'Љиљана Митреска', directorBiography: 'Долгогодишен просветен работник.', email: 'oujj@mavrovo.gov.mk', website: '', facebook: '', instagram: '' },
      { nameOfInstitution: 'ЈП „Маврово“', mestoNaseleno: 'Маврови Анови', directorFullName: 'Игор Николовски', directorBiography: '', email: 'jp@mavrovo.gov.mk', website: '', facebook: '', instagram: '' },
    ]);
  }

  const pCount = await db.select().from(proekti).limit(1);
  if (pCount.length === 0) {
    await db.insert(proekti).values([
      { title: 'Реконструкција на локални патишта', description: 'Проект за асфалтирање на 12 км локални патишта во рурални средини.', picture: null, documents: [] },
      { title: 'Изградба на детска градинка во Ростуше', description: 'Современа градинка со капацитет од 80 деца.', picture: null, documents: [] },
    ]);
  }

  const oCount = await db.select().from(odnosiSoJavnost).limit(1);
  if (oCount.length === 0) {
    const types = await db.select().from(typeObjava);
    const novostiId = types.find((t) => t.title === 'Новости')?.id;
    await db.insert(odnosiSoJavnost).values([
      { typeId: novostiId, title: 'Започна реконструкцијата на патот кон Маврово', description: 'Општината денеска ги започна работите...', madeBy: 'Кабинет на градоначалник', documents: [] },
      { typeId: novostiId, title: 'Нови инвестиции во туризмот', description: 'Потпишан меморандум за соработка...', madeBy: 'Сектор за развој', documents: [] },
    ]);
  }

  console.log('Done.');
  await pgClient.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
