import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';
import Calendar from '../components/Calendar';
import Icon from '../components/Icon';

interface Objava { id: number; typeId: number; title: string; description: string | null; picture: string | null; createdAt: string; }
interface Agenda { id: number; dateTime: string; title: string; description: string | null; }

export default function Home() {
  const { data: objavi } = useFetch<Objava[]>(() => publicGet<Objava>('odnosi-so-javnost'));
  const { data: agenda } = useFetch<Agenda[]>(() => publicGet<Agenda>('agenda'));
  const upcoming = (agenda || []).filter((a) => new Date(a.dateTime) >= new Date()).slice(0, 5);
  // typeId 1 = Новости, 2 = Соопштенија (per /api/public/type-objava)
  const news = (objavi || []).filter((o) => o.typeId === 1).slice(0, 3);
  const announcements = (objavi || []).filter((o) => o.typeId === 2).slice(0, 3);

  const quickLinks: Array<{ to: string; icon: Parameters<typeof Icon>[0]['name']; title: string; sub: string }> = [
    { to: '/budzet', icon: 'wallet', title: 'Буџет', sub: 'Финансиска транспарентност' },
    { to: '/sluzben-glasnik', icon: 'newspaper', title: 'Службен гласник', sub: 'Сите броеви' },
    { to: '/proekti', icon: 'project', title: 'Проекти', sub: 'Тековни и завршени' },
    { to: '/objavi/Конкурси', icon: 'briefcase', title: 'Конкурси', sub: 'Активни огласи' },
  ];

  const renderObjavaCards = (items: Objava[], emptyText: string) => (
    <div className="cards cards-3">
      {items.map((n) => (
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
            <span className="card-cta">Прочитај повеќе <Icon name="arrow-right" size={14} /></span>
          </div>
        </Link>
      ))}
      {!items.length && <div className="empty">{emptyText}</div>}
    </div>
  );

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
            <Link to="/gradonacalnik" className="btn ghost">
              <Icon name="briefcase" size={18} />
              <span>Градоначалник</span>
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
            <h2>Најнови вести</h2>
            <Link to="/objavi/Новости" className="link-with-icon">
              <span>Сите вести</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          {renderObjavaCards(news, 'Сè уште нема вести.')}
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-title">
            <h2>Градоначалник</h2>
            <Link to="/gradonacalnik" className="link-with-icon">
              <span>Целосна биографија</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="mayor-card">
            <div className="mayor-photo">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80" alt="Портрет на градоначалникот" loading="lazy" />
            </div>
            <div className="mayor-body">
              <span className="tag">Кабинет на градоначалник</span>
              <h3 className="mayor-name">Медат Куртоски</h3>
              <p className="mayor-role">Градоначалник на Општина Маврово и Ростуше</p>
              <p className="mayor-bio">Медат Куртоски е роден во селото Жировница. Завршил високо образование на Економскиот факултет при Универзитетот „Св. Кирил и Методиј“ во Скопје. Пред да биде избран за градоначалник, работел како раководител во областа на локалниот економски развој и бил активен во невладиниот сектор за заштита на природното наследство на Мавровскиот регион.</p>
              <div className="mayor-meta">
                <div className="mayor-meta-item">
                  <span className="mayor-meta-icon"><Icon name="mail" size={16} /></span>
                  <div>
                    <small>Е-пошта</small>
                    <strong>gradonacalnik@mavrovoirostuse.gov.mk</strong>
                  </div>
                </div>
                <div className="mayor-meta-item">
                  <span className="mayor-meta-icon"><Icon name="phone" size={16} /></span>
                  <div>
                    <small>Телефон</small>
                    <strong>+389 (0)42 478 814</strong>
                  </div>
                </div>
                <div className="mayor-meta-item">
                  <span className="mayor-meta-icon"><Icon name="calendar" size={16} /></span>
                  <div>
                    <small>Прием на граѓани</small>
                    <strong>секој вторник 10:00 – 13:00 ч.</strong>
                  </div>
                </div>
              </div>
              <div className="mayor-actions">
                <Link to="/gradonacalnik" className="btn primary">
                  <Icon name="briefcase" size={16} />
                  <span>Биографија и надлежности</span>
                </Link>
                <Link to="/sovet-na-opstinata" className="btn outline">
                  <Icon name="users" size={16} />
                  <span>Совет на општината</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-title">
            <h2>Соопштенија</h2>
            <Link to="/objavi/Соопштенија" className="link-with-icon">
              <span>Сите соопштенија</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          {renderObjavaCards(announcements, 'Сè уште нема соопштенија.')}
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
