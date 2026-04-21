import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';
import Calendar from '../components/Calendar';

interface Objava { id: number; title: string; description: string | null; picture: string | null; createdAt: string; }
interface Agenda { id: number; dateTime: string; title: string; description: string | null; }

export default function Home() {
  const { data: news } = useFetch<Objava[]>(() => publicGet<Objava>('odnosi-so-javnost'));
  const { data: agenda } = useFetch<Agenda[]>(() => publicGet<Agenda>('agenda'));
  const upcoming = (agenda || []).filter((a) => new Date(a.dateTime) >= new Date()).slice(0, 5);

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="tag" style={{ background: 'rgba(200,162,74,.2)', color: '#fff' }}>Добредојдовте</span>
          <h1>Општина Маврово и Ростуше</h1>
          <p>Срцето на Националниот парк Маврово — место каде традицијата, природата и развојот се среќаваат. Информирајте се за најновите вести, проекти и услуги на општината.</p>
          <div className="hero-cta">
            <Link to="/objavi/Новости" className="btn">Најнови вести</Link>
            <Link to="/prijavi-problem" className="btn ghost">Пријави проблем</Link>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-title">
            <h2>Брзи врски</h2>
            <small>Најпосетувани делови</small>
          </div>
          <div className="quick-grid">
            <Link to="/budzet" className="quick"><strong>Буџет</strong><small>Финансиска транспарентност</small></Link>
            <Link to="/sluzben-glasnik" className="quick"><strong>Службен гласник</strong><small>Сите броеви</small></Link>
            <Link to="/proekti" className="quick"><strong>Проекти</strong><small>Тековни и завршени</small></Link>
            <Link to="/vraboteni" className="quick"><strong>Вработени</strong><small>Контакти и оддели</small></Link>
            <Link to="/objavi/Конкурси" className="quick"><strong>Конкурси</strong><small>Активни</small></Link>
            <Link to="/uplatnici" className="quick"><strong>Уплатници</strong><small>Примери</small></Link>
          </div>
        </div>
      </section>

      <section className="block" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-title">
            <h2>Најнови објави</h2>
            <Link to="/objavi/Новости">Сите новости →</Link>
          </div>
          <div className="cards">
            {(news || []).slice(0, 6).map((n) => (
              <Link key={n.id} to={`/objavi-detalji/${n.id}`} className="card" style={{ color: 'inherit' }}>
                <div style={{ height: 180, background: n.picture ? `url(${n.picture}) center/cover` : 'linear-gradient(135deg,#1f7a8c,#0c3b5c)' }} />
                <div className="card-body">
                  <span className="meta">{new Date(n.createdAt).toLocaleDateString('mk-MK')}</span>
                  <h3>{n.title}</h3>
                  <p>{(n.description || '').slice(0, 140)}{(n.description?.length || 0) > 140 ? '…' : ''}</p>
                </div>
              </Link>
            ))}
            {!news?.length && <div className="empty">Сè уште нема објави.</div>}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-title">
            <h2>Агенда на општината</h2>
            <small>Претстојни настани</small>
          </div>
          <div className="agenda-layout">
            <Calendar events={agenda || []} />
            <div className="agenda-list">
              <h3 style={{ fontFamily: 'Manrope', fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--accent-2)' }}>Следни настани</h3>
              {upcoming.length === 0 && <div style={{ color: 'var(--muted)' }}>Нема закажани настани.</div>}
              {upcoming.map((a) => (
                <div key={a.id} className="item">
                  <div className="when">{new Date(a.dateTime).toLocaleString('mk-MK', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  <div className="title">{a.title}</div>
                  {a.description && <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{a.description}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
