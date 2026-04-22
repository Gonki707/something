import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';
import Calendar from '../components/Calendar';
import Icon from '../components/Icon';

interface Objava { id: number; title: string; description: string | null; picture: string | null; createdAt: string; }
interface Agenda { id: number; dateTime: string; title: string; description: string | null; }

export default function Home() {
  const { data: news } = useFetch<Objava[]>(() => publicGet<Objava>('odnosi-so-javnost'));
  const { data: agenda } = useFetch<Agenda[]>(() => publicGet<Agenda>('agenda'));
  const upcoming = (agenda || []).filter((a) => new Date(a.dateTime) >= new Date()).slice(0, 5);

  const quickLinks: Array<{ to: string; icon: Parameters<typeof Icon>[0]['name']; title: string; sub: string }> = [
    { to: '/budzet', icon: 'wallet', title: 'Буџет', sub: 'Финансиска транспарентност' },
    { to: '/sluzben-glasnik', icon: 'newspaper', title: 'Службен гласник', sub: 'Сите броеви' },
    { to: '/proekti', icon: 'project', title: 'Проекти', sub: 'Тековни и завршени' },
    { to: '/vraboteni', icon: 'users', title: 'Вработени', sub: 'Контакти и оддели' },
    { to: '/objavi/Конкурси', icon: 'briefcase', title: 'Конкурси', sub: 'Активни огласи' },
    { to: '/uplatnici', icon: 'document', title: 'Уплатници', sub: 'Примери и обрасци' },
  ];

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="tag" style={{ background: 'rgba(200,162,74,.2)', color: '#fff' }}>Добредојдовте</span>
          <h1>Општина Маврово и Ростуше</h1>
          <p>Срцето на Националниот парк Маврово — место каде традицијата, природата и развојот се среќаваат. Информирајте се за најновите вести, проекти и услуги на општината.</p>
          <div className="hero-cta">
            <Link to="/objavi/Новости" className="btn">
              <Icon name="newspaper" size={18} />
              <span>Најнови вести</span>
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link to="/prijavi-problem" className="btn ghost">
              <Icon name="alert" size={18} />
              <span>Пријави проблем</span>
            </Link>
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
            {quickLinks.map((q) => (
              <Link key={q.to} to={q.to} className="quick">
                <span className="quick-icon"><Icon name={q.icon} size={22} /></span>
                <div className="quick-text">
                  <strong>{q.title}</strong>
                  <small>{q.sub}</small>
                </div>
                <span className="quick-arrow"><Icon name="arrow-right" size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="block" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-title">
            <h2>Најнови објави</h2>
            <Link to="/objavi/Новости" className="link-with-icon">
              <span>Сите новости</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="cards">
            {(news || []).slice(0, 6).map((n) => (
              <Link key={n.id} to={`/objavi-detalji/${n.id}`} className="card" style={{ color: 'inherit' }}>
                <div className="card-cover" style={{ background: n.picture ? `url(${n.picture}) center/cover` : 'linear-gradient(135deg,#1f7a8c,#0c3b5c)' }}>
                  {!n.picture && <Icon name="newspaper" size={48} />}
                </div>
                <div className="card-body">
                  <span className="meta">
                    <Icon name="calendar" size={14} />
                    {new Date(n.createdAt).toLocaleDateString('mk-MK')}
                  </span>
                  <h3>{n.title}</h3>
                  <p>{(n.description || '').slice(0, 140)}{(n.description?.length || 0) > 140 ? '…' : ''}</p>
                  <span className="card-cta">
                    Прочитај повеќе <Icon name="arrow-right" size={14} />
                  </span>
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
              <h3 className="agenda-heading">
                <Icon name="calendar" size={14} />
                <span>Следни настани</span>
              </h3>
              {upcoming.length === 0 && <div style={{ color: 'var(--muted)' }}>Нема закажани настани.</div>}
              {upcoming.map((a) => (
                <div key={a.id} className="item agenda-item">
                  <div className="agenda-date">
                    <Icon name="calendar" size={16} />
                    <span className="when">{new Date(a.dateTime).toLocaleString('mk-MK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
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
