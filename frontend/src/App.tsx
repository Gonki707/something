import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import ReportProblem from './pages/ReportProblem';
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
            <p>Општина Маврово и Ростуше се наоѓа во северозападниот дел на Република Северна Македонија, опкружена со планините Шар Планина, Бистра и Кораб. Општината се протега на површина од над 660 km² и претставува срцето на Националниот парк Маврово.</p>
            <p>Седиштето на општината е во селото Маврови Анови, а вториот најголем населен центар е Ростуше.</p>
          </StaticPage>
        } />
        <Route path="prirodni-bogatstva" element={
          <StaticPage title="Природни богатства" crumb="Запознај ја општината">
            <p>Општината е дом на Националниот парк Маврово — еден од најголемите и најстарите паркови во земјата, познат по Мавровското Езеро, кањонот на Радика, врвовите на Кораб и богатата флора и фауна.</p>
          </StaticPage>
        } />
        <Route path="gradonacalnik" element={
          <StaticPage title="Градоначалник" crumb="Локална самоуправа">
            <p>Градоначалникот е извршен орган на општината, избран од граѓаните на општи и непосредни избори. Работата на градоначалникот опфаќа застапување, координација и спроведување на одлуките на Советот.</p>
          </StaticPage>
        } />
        <Route path="sovet-na-opstinata" element={
          <StaticPage title="Совет на општината" crumb="Локална самоуправа">
            <p>Советот на општината е претставнички орган на граѓаните и одлучува во рамките на надлежностите утврдени со закон.</p>
          </StaticPage>
        } />
        <Route path="organogram" element={
          <StaticPage title="Органограм" crumb="Локална самоуправа">
            <p>Општината е организирана во неколку сектори: Кабинет на градоначалник, Секретаријат, Сектор за финансии, Сектор за урбанизам, Сектор за комунални работи и Сектор за инспекциски надзор.</p>
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
  );
}
