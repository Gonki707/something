import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import ReportProblem from './pages/ReportProblem';
import GradonacalnikPage from './pages/GradonacalnikPage';
import CulturePage from './pages/CulturePage';
import CultureDetail from './pages/CultureDetail';
import SportPage from './pages/SportPage';
import SportDetail from './pages/SportDetail';
import {
  ObjaviList, ObjavaDetail, SluzbenGlasnikPage, GlasnikDetail,
  VraboteniPage, VrabotenDetail,
  BudzetPage, BudzetDetail, ProektiPage, ProektDetail,
  LegislativaPage, LegislativaDetail, InstitucionDetail,
  NaseleniMestaPage, StaticPage,
} from './pages/ListPage';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CrudList from './pages/admin/CrudList';
import CrudEdit from './pages/admin/CrudEdit';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="objavi/:type" element={<ObjaviList />} />
        <Route path="objavi-detalji/:id" element={<ObjavaDetail />} />
        <Route path="sluzben-glasnik" element={<SluzbenGlasnikPage />} />
        <Route path="sluzben-glasnik/:id" element={<GlasnikDetail />} />
        <Route path="vraboteni" element={<VraboteniPage />} />
        <Route path="vraboteni/:id" element={<VrabotenDetail />} />
        <Route path="budzet" element={<BudzetPage />} />
        <Route path="budzet/:id" element={<BudzetDetail />} />
        <Route path="proekti" element={<ProektiPage />} />
        <Route path="proekti/:id" element={<ProektDetail />} />
        <Route path="legislativa/:type" element={<LegislativaPage />} />
        <Route path="legislativa-detalji/:id" element={<LegislativaDetail />} />
        <Route path="institucii/:id" element={<InstitucionDetail />} />
        <Route path="naseleni-mesta" element={<NaseleniMestaPage />} />
        <Route path="prijavi-problem" element={<ReportProblem />} />

        <Route path="mestopolozba" element={
          <StaticPage title="Местоположба" crumb="Запознај ја општината">
            <figure>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Mavrovo_Lake_panorama.jpg/1920px-Mavrovo_Lake_panorama.jpg" alt="Панорама на Мавровското Езеро" loading="lazy" />
              <figcaption>Панорама на Мавровското Езеро во срцето на Националниот парк Маврово</figcaption>
            </figure>
            <p>Општина Маврово и Ростуше се наоѓа во крајниот северозападен дел на Република Северна Македонија, во подножјето на планините Шар Планина, Бистра, Кораб и Дешат. Општината се простира на површина од приближно <strong>663 km²</strong>, што ја прави една од најголемите по територија во државата, додека целата нејзина површина се наоѓа во рамките на Националниот парк Маврово.</p>
            <p>Седиштето на општината е во селото <strong>Ростуше</strong>, додека Маврови Анови претставуваат најголем туристички центар. Општината граничи со општините Гостивар, Кичево, Дебар и Желино, како и со Република Косово и Република Албанија.</p>
            <div className="info-grid">
              <div className="info-card"><strong>Површина</strong><span>663 km²</span></div>
              <div className="info-card"><strong>Населени места</strong><span>над 30 села</span></div>
              <div className="info-card"><strong>Жители (2021)</strong><span>околу 5.700</span></div>
              <div className="info-card"><strong>Надморска височина</strong><span>од 600 до 2.764 m</span></div>
              <div className="info-card"><strong>Седиште</strong><span>Ростуше</span></div>
              <div className="info-card"><strong>Пошт. бр.</strong><span>1254</span></div>
            </div>
            <h2>Како да стигнете</h2>
            <p>Општината е поврзана со регионалниот пат <strong>Р1202</strong> (Гостивар – Дебар), кој минува долж кањонот на реката Радика. Најблискиот аеродром е „Меѓународен аеродром Скопје“, оддалечен околу 130 km од Маврови Анови.</p>
          </StaticPage>
        } />
        <Route path="kultura" element={<CulturePage />} />
        <Route path="kultura/:id" element={<CultureDetail />} />
        <Route path="sport" element={<SportPage />} />
        <Route path="sport/:id" element={<SportDetail />} />

        <Route path="prirodni-bogatstva" element={
          <StaticPage title="Природни богатства" crumb="Запознај ја општината">
            <figure>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Bigorski_Monastery%2C_North_Macedonia.jpg/1920px-Bigorski_Monastery%2C_North_Macedonia.jpg" alt="Манастир Свети Јован Бигорски" loading="lazy" />
              <figcaption>Манастирот „Свети Јован Бигорски“ — културно наследство од 11. век</figcaption>
            </figure>
            <p>Целата територија на општината се наоѓа во рамки на <strong>Националниот парк Маврово</strong> — најстариот и најголем национален парк во Северна Македонија, основан во 1949 година, со површина од над 73.000 хектари. Паркот е дом на ретки и заштитени видови како балкански рис, кафеава мечка, дивокоза, златен орел и над 1.000 видови растенија.</p>
            <h2>Природни знаменитости</h2>
            <ul>
              <li><strong>Мавровско Езеро</strong> — вештачко езеро на надморска височина од 1.233 m, познато по полупотопената црква „Свети Никола“.</li>
              <li><strong>Кањон на Радика</strong> — длабок речен кањон со кристално чиста вода и Дувло-водопад.</li>
              <li><strong>Врв Голем Кораб (2.764 m)</strong> — највисокиот врв во Северна Македонија и Албанија.</li>
              <li><strong>Бистра планина</strong> — позната по пасиштата, шумите и галичкиот сточарски крај.</li>
              <li><strong>Дувло и Корапска Врата</strong> — водопади и единствени геолошки формации.</li>
            </ul>
            <h2>Културно-историско наследство</h2>
            <ul>
              <li>Манастир „Свети Јован Бигорски“ кај село Ростуше — со едно од најубавите резбани иконостаси на Балканот.</li>
              <li>Црква „Свети Никола“ во Маврови Анови — потопен симбол на езерото.</li>
              <li>Мијачки села: Галичник, Лазарополе, Тресонче и Гари — со зачувана архитектура и обичаи.</li>
              <li>Галичка свадба — традиционална манифестација која се одржува секоја година на Петровден.</li>
            </ul>
          </StaticPage>
        } />
        <Route path="gradonacalnik" element={<GradonacalnikPage />} />
        <Route path="sovet-na-opstinata" element={
          <StaticPage title="Совет на општината" crumb="Локална самоуправа">
            <p>Советот на општината е претставнички орган на граѓаните и одлучува во рамките на надлежностите утврдени со закон. Согласно Законот за локалната самоуправа, Советот на Општина Маврово и Ростуше брои <strong>11 советници</strong>, избрани на општи избори со мандат од 4 години.</p>
            <h2>Состав на Советот</h2>
            <div className="council-grid">
              <div className="council-item"><div className="name">Бесник Положани</div><div className="party">Претседател на Советот</div></div>
              <div className="council-item"><div className="name">Алмедина Бакиу</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Бекир Шеху</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Лирим Куртиши</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Замира Алили</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Никола Андоновски</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Сашо Митревски</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Маја Стојаноска</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Африм Селмани</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Илчо Спасески</div><div className="party">Советник</div></div>
              <div className="council-item"><div className="name">Фатмир Дурмиши</div><div className="party">Советник</div></div>
            </div>
            <h2>Седници</h2>
            <p>Седниците на Советот се одржуваат најмалку еднаш месечно, по правило во просториите на општината во Ростуше, и се отворени за јавноста. Дневниот ред и записниците од одржаните седници редовно се објавуваат на оваа веб-страница и во Службениот гласник на општината.</p>
          </StaticPage>
        } />
        <Route path="organogram" element={
          <StaticPage title="Органограм" crumb="Локална самоуправа">
            <p>Општинската администрација е организирана во шест организациски единици кои директно одговараат пред Градоначалникот, со поддршка на Секретарот на општината.</p>
            <div className="org-tree">
              <div className="org-node root">Градоначалник</div>
              <div className="org-connector" />
              <div className="org-node">Секретар на општината</div>
              <div className="org-connector" />
              <div className="org-row">
                <div className="org-node">Сектор за правни и општи работи</div>
                <div className="org-node">Сектор за финансиски прашања</div>
                <div className="org-node">Сектор за урбанизам и животна средина</div>
              </div>
              <div className="org-row">
                <div className="org-node">Сектор за комунални дејности</div>
                <div className="org-node">Сектор за локален економски развој</div>
                <div className="org-node">Сектор за инспекциски надзор</div>
              </div>
            </div>
            <h2>Број на вработени</h2>
            <p>Општинската администрација вкупно брои околу <strong>32 вработени</strong>, распоредени според Правилникот за систематизација на работните места.</p>
            <p>Целосниот текст на Правилникот за внатрешна организација и Правилникот за систематизација на работните места се достапни во делот <em>Легислатива → Обрасци</em>.</p>
          </StaticPage>
        } />
        <Route path="finansiska-transparentnost" element={
          <StaticPage title="Финансиска транспарентност" crumb="Финансии">
            <p>Документите поврзани со годишните завршни сметки, кварталните извештаи и тековните трошоци се објавуваат редовно.</p>
          </StaticPage>
        } />
        <Route path="danoci" element={
          <StaticPage title="Даноци" crumb="Финансии">
            <p>Информации за локалните даноци, такси и надоместоци кои се плаќаат во општината.</p>
          </StaticPage>
        } />
        <Route path="uplatnici" element={
          <StaticPage title="Примери уплатници" crumb="Финансии">
            <p>Овде ќе бидат прикачени примероци на уплатници за најчести услуги и обврски кон општината.</p>
          </StaticPage>
        } />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path=":entity" element={<CrudList />} />
        <Route path=":entity/:id" element={<CrudEdit />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
