import bcrypt from 'bcryptjs';
import { db, pgClient } from '../config/db.js';
import { env } from '../config/env.js';
import { adminUsers, typeObjava, typeLegislativa, typeOfProblems, naseleniMesta, agenda, vraboteni, institucii, proekti, odnosiSoJavnost, } from './schema.js';
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
    const seedLookup = async (table, items, label) => {
        const exists = await db.select().from(table).limit(1);
        if (exists.length === 0) {
            await db.insert(table).values(items.map((title) => ({ title })));
            console.log(`  + ${label}: ${items.length} items`);
        }
    };
    await seedLookup(typeObjava, ['Новости', 'Соопштенија', 'Огласи', 'Конкурси', 'Пристап до информации'], 'TypeObjava');
    await seedLookup(typeLegislativa, ['Обрасци', 'Закони', 'Статут и кодекс'], 'TypeLegislativa');
    await seedLookup(typeOfProblems, ['Комунален проблем', 'Патишта', 'Осветлување', 'Водовод', 'Друго'], 'TypeOfProblems');
    await seedLookup(naseleniMesta, [
        'Ростуше', 'Маврови Анови', 'Маврово', 'Никифорово', 'Леуново', 'Жировница',
        'Велебрдо', 'Битуше', 'Скудриње', 'Болетин', 'Требиште', 'Видуше',
        'Аџиевци', 'Јанче', 'Галичник', 'Лазарополе', 'Тресонче', 'Гари',
        'Осој', 'Долно Косоврасти', 'Сретково', 'Сенце', 'Кичиница',
        'Нивиште', 'Нистрово', 'Бибање', 'Бродец', 'Тануше', 'Жужње',
        'Долно Мелничани', 'Горно Мелничани', 'Присојница',
    ], 'NaseleniMesta');
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
            { firstName: 'Медат', lastName: 'Куртоски', email: 'gradonacalnik@mavrovoirostuse.gov.mk', oddel: 'Кабинет на градоначалник', function: 'Градоначалник' },
            { firstName: 'Ана', lastName: 'Стојаноска', email: 'sekretar@mavrovoirostuse.gov.mk', oddel: 'Секретаријат', function: 'Секретар на општината' },
            { firstName: 'Драган', lastName: 'Ѓорѓиоски', email: 'finansii@mavrovoirostuse.gov.mk', oddel: 'Сектор за финансиски прашања', function: 'Раководител на сектор' },
            { firstName: 'Беким', lastName: 'Алили', email: 'urbanizam@mavrovoirostuse.gov.mk', oddel: 'Сектор за урбанизам и животна средина', function: 'Раководител на сектор' },
            { firstName: 'Сашо', lastName: 'Митрески', email: 'komunalni@mavrovoirostuse.gov.mk', oddel: 'Сектор за комунални дејности', function: 'Раководител на сектор' },
            { firstName: 'Емилија', lastName: 'Поповска', email: 'razvoj@mavrovoirostuse.gov.mk', oddel: 'Сектор за локален економски развој', function: 'Раководител на сектор' },
            { firstName: 'Африм', lastName: 'Селмани', email: 'inspekcija@mavrovoirostuse.gov.mk', oddel: 'Сектор за инспекциски надзор', function: 'Овластен инспектор' },
            { firstName: 'Маја', lastName: 'Андоноска', email: 'pravni@mavrovoirostuse.gov.mk', oddel: 'Сектор за правни и општи работи', function: 'Соработник' },
        ]);
    }
    const iCount = await db.select().from(institucii).limit(1);
    if (iCount.length === 0) {
        await db.insert(institucii).values([
            { nameOfInstitution: 'ООУ „Јосиф Јосифовски Свештарот“', mestoNaseleno: 'Ростуше', directorFullName: 'Љиљана Митреска', directorBiography: 'Долгогодишен просветен работник со над 20 години искуство во основното образование.', email: 'oou.rostuse@mavrovoirostuse.gov.mk', website: '', facebook: '', instagram: '' },
            { nameOfInstitution: 'ООУ „Блаже Конески“', mestoNaseleno: 'Маврови Анови', directorFullName: 'Игор Николовски', directorBiography: 'Раководи со училиштето кое опслужува околу 120 ученици од мавровскиот регион.', email: 'oou.mavrovi@mavrovoirostuse.gov.mk', website: '', facebook: '', instagram: '' },
            { nameOfInstitution: 'ЈПКД „Маврово – Ростуше“', mestoNaseleno: 'Ростуше', directorFullName: 'Стефан Илиевски', directorBiography: 'Јавно претпријатие за комунални дејности — водоснабдување, одржување јавна чистота и зеленило.', email: 'jpkd@mavrovoirostuse.gov.mk', website: '', facebook: '', instagram: '' },
            { nameOfInstitution: 'НУ Национален парк „Маврово“', mestoNaseleno: 'Маврови Анови', directorFullName: 'Самир Ајдини', directorBiography: 'Управува со најголемиот национален парк во земјата.', email: 'info@npmavrovo.gov.mk', website: 'https://npmavrovo.org.mk', facebook: '', instagram: '' },
            { nameOfInstitution: 'Здравствен дом „Ростуше“', mestoNaseleno: 'Ростуше', directorFullName: 'д-р Татјана Стојаноска', directorBiography: 'Примарна здравствена заштита за жителите на општината.', email: 'zd.rostuse@zdravstvo.gov.mk', website: '', facebook: '', instagram: '' },
        ]);
    }
    const pCount = await db.select().from(proekti).limit(1);
    if (pCount.length === 0) {
        await db.insert(proekti).values([
            {
                title: 'Реконструкција на локалниот пат Ростуше – Жировница',
                description: 'Проект за рехабилитација и асфалтирање на 12 километри локален пат, со нова сигнализација, банкини и одводнување. Финансирано преку Министерство за транспорт и врски и сопствени средства на општината. Проектот опфаќа и изградба на потпорни ѕидови во делот на кањонот.',
                picture: 'https://images.unsplash.com/photo-1518792528501-352f829886dc?auto=format&fit=crop&w=1200&q=80',
                documents: [],
            },
            {
                title: 'Изградба на детска градинка во Ростуше',
                description: 'Современа градинка со капацитет од 80 деца на возраст од 2 до 6 години, со сопствена кујна, игралиште и термоизолиран објект според најновите стандарди за енергетска ефикасност.',
                picture: 'https://images.unsplash.com/photo-1587653263995-422546a7a569?auto=format&fit=crop&w=1200&q=80',
                documents: [],
            },
            {
                title: 'Реставрација на старите мијачки куќи во Галичник',
                description: 'Заштита и обнова на објекти од традиционалната мијачка архитектура во селото Галичник, како дел од проектот за развој на културниот туризам. Соработка со УНЕСКО и Министерство за култура.',
                picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Galichnik_Macedonia.jpg/1280px-Galichnik_Macedonia.jpg',
                documents: [],
            },
            {
                title: 'Поставување јавно ЛЕД осветлување',
                description: 'Замена на старото улично осветлување со енергетски ефикасни ЛЕД светилки во 12 населени места. Очекувано намалување на потрошувачката за околу 60%.',
                picture: null,
                documents: [],
            },
            {
                title: 'Уредување на велосипедска патека околу Мавровското Езеро',
                description: 'Изградба на 18 километри велосипедска патека со одморалишта, информативни табли и места за изнајмување велосипеди — за развој на активниот туризам.',
                picture: 'https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=1200&q=80',
                documents: [],
            },
        ]);
    }
    const oCount = await db.select().from(odnosiSoJavnost).limit(1);
    if (oCount.length === 0) {
        const types = await db.select().from(typeObjava);
        const novostiId = types.find((t) => t.title === 'Новости')?.id;
        const soopstenijaId = types.find((t) => t.title === 'Соопштенија')?.id;
        const konkursiId = types.find((t) => t.title === 'Конкурси')?.id;
        await db.insert(odnosiSoJavnost).values([
            {
                typeId: novostiId,
                title: 'Започна реконструкцијата на патот Ростуше – Жировница',
                description: 'Општината денес официјално ги започна градежните работи на 12 километарската делница која го поврзува Ростуше со селото Жировница. Работите ќе траат осум месеци, а вредноста на проектот изнесува околу 95 милиони денари.',
                picture: 'https://images.unsplash.com/photo-1518792528501-352f829886dc?auto=format&fit=crop&w=1200&q=80',
                madeBy: 'Кабинет на градоначалник',
                documents: [],
            },
            {
                typeId: novostiId,
                title: 'Потпишан меморандум за развој на туризмот во Маврово',
                description: 'Општина Маврово и Ростуше потпиша меморандум за соработка со Агенцијата за промоција и поддршка на туризмот за заедничко учество на меѓународни туристички саеми и подобрување на сместувачките капацитети.',
                picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Mavrovo_Lake_panorama.jpg/1280px-Mavrovo_Lake_panorama.jpg',
                madeBy: 'Сектор за локален економски развој',
                documents: [],
            },
            {
                typeId: novostiId,
                title: 'Одржана 156. Галичка свадба',
                description: 'И оваа година, на Петровден, во планинското село Галичник свечено беше одржана традиционалната Галичка свадба — една од најпрепознатливите културни манифестации во земјата, со богата свадбарска програма во која учествуваа над 200 изведувачи.',
                picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Galichnik_Macedonia.jpg/1280px-Galichnik_Macedonia.jpg',
                madeBy: 'Сектор за локален економски развој',
                documents: [],
            },
            {
                typeId: soopstenijaId,
                title: 'Прекин на водоснабдувањето во Маврови Анови',
                description: 'Поради планирани работи на водоводната мрежа, во вторник од 09:00 до 14:00 часот ќе биде во прекин водоснабдувањето во делови од Маврови Анови. Се молат граѓаните однапред да обезбедат потребни количини вода.',
                picture: null,
                madeBy: 'ЈПКД „Маврово – Ростуше“',
                documents: [],
            },
            {
                typeId: konkursiId,
                title: 'Јавен оглас за вработување — соработник за финансиски прашања',
                description: 'Општина Маврово и Ростуше распишува јавен оглас за вработување на еден извршител на работно место „Соработник за буџет и буџетска контрола“ во Сектор за финансиски прашања. Рокот за пријавување е 15 дена од денот на објавувањето.',
                picture: null,
                madeBy: 'Сектор за правни и општи работи',
                documents: [],
            },
        ]);
    }
    console.log('Done.');
    await pgClient.end();
}
seed().catch((e) => {
    console.error(e);
    process.exit(1);
});
