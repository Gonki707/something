import {
  db,
  newsTable,
  announcementsTable,
  tendersTable,
  competitionsTable,
  gazetteTable,
  projectsTable,
  legislationTable,
} from "@workspace/db";

function dt(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 9, 0, 0));
}

async function main() {
  await db.delete(newsTable);
  await db.delete(announcementsTable);
  await db.delete(tendersTable);
  await db.delete(competitionsTable);
  await db.delete(gazetteTable);
  await db.delete(projectsTable);
  await db.delete(legislationTable);

  const newsCategories = ["Општина", "Култура", "Образование", "Спорт", "Инфраструктура", "Здравство"];
  const newsTitles = [
    "Свечено отворање на новиот градски парк",
    "Започнува реконструкција на улицата Маршал Тито",
    "Општината обезбеди нови училишни автобуси",
    "Одржана седница на Советот",
    "Нови контејнери за селективен отпад",
    "Гратис прегледи за пензионерите",
    "Завршена обнова на градскиот плоштад",
    "Нова детска градинка во населбата Карпош",
    "Започнува сезоната на културни манифестации",
    "Пуштена во употреба нова велосипедска патека",
    "Одбележан Денот на ослободувањето на градот",
    "Општината потпиша договор со ЕБОР",
    "Изградба на нова спортска сала во тек",
    "Реконструкција на општинската зграда",
    "Нови работни места во индустриската зона",
    "Општината доделија стипендии на најдобрите студенти",
    "Поставени нови улични светилки во центарот",
    "Реализиран проект за асфалтирање на 12 улици",
    "Општината обезбеди дрва за огрев за социјално загрозени",
    "Градскиот хор го прослави својот јубилеј",
  ];
  const newsRows = newsTitles.map((title, i) => {
    const year = 2024 + (i % 3);
    return {
      title,
      summary: `Сумарен преглед: ${title.toLowerCase()}.`,
      body: `Денес во општината се случи значаен настан. ${title}. Ова е важен чекор за нашите граѓани и претставува дел од стратешкиот план за развој. Општината ќе продолжи да работи на унапредување на квалитетот на живот во заедницата.`,
      category: newsCategories[i % newsCategories.length]!,
      coverImageUrl: null,
      publishedAt: dt(year, ((i % 12) + 1), ((i % 28) + 1)),
      year,
    };
  });
  await db.insert(newsTable).values(newsRows);

  const annCategories = ["Соопштение", "Известување", "Покана", "Јавна расправа"];
  const annRows = Array.from({ length: 18 }, (_, i) => {
    const year = 2023 + (i % 4);
    return {
      title: `Соопштение бр. ${i + 1}/${year} до граѓаните`,
      summary: `Општината ги известува сите заинтересирани граѓани за ${i % 2 === 0 ? "промените во распоредот" : "новите процедури"}.`,
      body: `Се известуваат сите граѓани на општината дека во периодот кој следи ќе се спроведат активности кои може да влијаат на дневните рутини. Молиме за разбирање и соработка.`,
      category: annCategories[i % annCategories.length]!,
      publishedAt: dt(year, ((i % 12) + 1), ((i % 28) + 1)),
      year,
    };
  });
  await db.insert(announcementsTable).values(annRows);

  const tenderRows = Array.from({ length: 16 }, (_, i) => {
    const year = 2024 + (i % 3);
    const status = i % 3 === 0 ? "closed" : "open";
    return {
      title: `Јавен оглас за набавка на ${["канцелариски материјал", "ИТ опрема", "услуги за одржување", "градежни материјали", "горива и мазива"][i % 5]} бр. ${i + 1}/${year}`,
      summary: `Општината објавува јавен оглас согласно Законот за јавни набавки.`,
      body: `Предмет на набавката се стоки и услуги опишани во тендерската документација. Заинтересираните понудувачи можат да ја преземат документацијата на следната адреса. Понудите се отвораат пред Комисијата за јавни набавки.`,
      status,
      publishedAt: dt(year, ((i % 12) + 1), ((i % 28) + 1)),
      deadline: dt(year, ((i % 12) + 1), Math.min(28, ((i % 28) + 14))),
      year,
    };
  });
  await db.insert(tendersTable).values(tenderRows);

  const compRows = Array.from({ length: 14 }, (_, i) => {
    const year = 2023 + (i % 4);
    const status = i % 4 === 0 ? "closed" : "open";
    return {
      title: `Конкурс за вработување на ${["советник", "референт", "виш соработник", "ИТ администратор", "правник"][i % 5]} бр. ${i + 1}/${year}`,
      summary: `Општината распишува јавен конкурс за пополнување на работно место.`,
      body: `Се распишува јавен конкурс согласно Законот за административни службеници. Заинтересираните кандидати треба да ги исполнуваат општите и посебните услови наведени во конкурсот. Документите се поднесуваат во архивата на општината.`,
      status,
      publishedAt: dt(year, ((i % 12) + 1), ((i % 28) + 1)),
      deadline: dt(year, ((i % 12) + 1), Math.min(28, ((i % 28) + 21))),
      year,
    };
  });
  await db.insert(competitionsTable).values(compRows);

  const gazRows = Array.from({ length: 24 }, (_, i) => {
    const year = 2022 + (i % 4);
    const issueNum = (i % 12) + 1;
    return {
      issueNumber: `${issueNum}/${year}`,
      title: `Службен гласник на општината бр. ${issueNum}/${year}`,
      summary: `Издание ${issueNum} за ${year} година со одлуки, решенија и заклучоци на Советот и Градоначалникот.`,
      publishedAt: dt(year, issueNum, 15),
      year,
      fileUrl: `/files/sluzben-glasnik-${year}-${issueNum}.pdf`,
    };
  });
  await db.insert(gazetteTable).values(gazRows);

  const projCategories = ["Инфраструктура", "Образование", "Култура", "Заштита на животна средина", "Социјална заштита"];
  const projStatuses = ["completed", "ongoing", "planned"];
  const projRows = Array.from({ length: 18 }, (_, i) => {
    const year = 2023 + (i % 4);
    return {
      title: `Проект ${i + 1}: ${["Реконструкција на улици", "Опремување на училишта", "Изградба на парк", "Поставување на сончеви панели", "Социјален центар"][i % 5]}`,
      summary: `Капитален проект на општината со значајно влијание врз заедницата.`,
      body: `Овој проект се финансира од буџетот на општината и е дел од стратешкиот план за развој. Активностите вклучуваат планирање, набавка на материјали, изведба и финална контрола на квалитетот.`,
      category: projCategories[i % projCategories.length]!,
      status: projStatuses[i % projStatuses.length]!,
      coverImageUrl: null,
      publishedAt: dt(year, ((i % 12) + 1), ((i % 28) + 1)),
      year,
      budget: `${(150 + i * 35) * 1000} МКД`,
    };
  });
  await db.insert(projectsTable).values(projRows);

  const legCategories = ["Одлуки", "Правилници", "Програми", "Стратегии", "Статут"];
  const legRows = Array.from({ length: 20 }, (_, i) => {
    const year = 2021 + (i % 5);
    return {
      title: `${legCategories[i % legCategories.length]} за ${["буџетот", "комуналните такси", "урбанистичкото планирање", "социјалната заштита", "образованието"][i % 5]} бр. ${i + 1}/${year}`,
      summary: `Документ донесен од Советот на општината.`,
      body: `Овој акт е донесен врз основа на овластувањата на Советот на општината согласно Законот за локална самоуправа. Стапува на сила осум дена по објавувањето во Службен гласник.`,
      category: legCategories[i % legCategories.length]!,
      publishedAt: dt(year, ((i % 12) + 1), ((i % 28) + 1)),
      year,
      fileUrl: `/files/legislativa-${year}-${i + 1}.pdf`,
    };
  });
  await db.insert(legislationTable).values(legRows);

  console.log("Seed complete:", {
    news: newsRows.length,
    announcements: annRows.length,
    tenders: tenderRows.length,
    competitions: compRows.length,
    gazette: gazRows.length,
    projects: projRows.length,
    legislation: legRows.length,
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
