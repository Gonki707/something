import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';
import Icon from './Icon';

interface Institucija { id: number; nameOfInstitution: string; }

export default function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { data: institucii } = useFetch<Institucija[]>(() => publicGet<Institucija>('institucii'));

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = (name: string) => setOpen((o) => (o === name ? null : name));
  const close = () => setOpen(null);

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container">
          <span className="ht-left">
            <Icon name="mail" size={14} /> info@mavrovo.gov.mk
            <span className="dot" />
            <Icon name="phone" size={14} /> +389 42 478 814
          </span>
          <span className="ht-right">
            <Link to="/prijavi-problem"><Icon name="alert" size={14} /> Пријави проблем</Link>
            <span className="dot" />
            <Link to="/admin"><Icon name="login" size={14} /> Админ</Link>
          </span>
        </div>
      </div>
      <div className="container header-main" ref={ref}>
        <Link to="/" className="brand" onClick={close}>
          <div className="brand-mark">МР</div>
          <div className="brand-text">
            <strong>Општина Маврово и Ростуше</strong>
            <small>Официјална веб страница</small>
          </div>
        </Link>

        <nav className="nav">
          <div className="nav-item">
            <button className={`nav-link ${open === 'zapoznaj' ? 'is-open' : ''}`} onClick={() => toggle('zapoznaj')}>
              <Icon name="compass" size={18} />
              <span>Запознај ја општината</span>
              <Icon name="chevron" size={14} className="chev" />
            </button>
            {open === 'zapoznaj' && (
              <div className="dropdown">
                <div className="dropdown-section">
                  <Link to="/mestopolozba" onClick={close}><Icon name="pin" size={16} /> Местоположба</Link>
                  <Link to="/naseleni-mesta" onClick={close}><Icon name="home" size={16} /> Населени места</Link>
                  <Link to="/prirodni-bogatstva" onClick={close}><Icon name="globe" size={16} /> Природни богатства</Link>
                </div>
              </div>
            )}
          </div>

          <div className="nav-item">
            <button className={`nav-link ${open === 'meni' ? 'is-open' : ''}`} onClick={() => toggle('meni')}>
              <Icon name="menu" size={18} />
              <span>Мени</span>
              <Icon name="chevron" size={14} className="chev" />
            </button>
            {open === 'meni' && (
              <div className="dropdown wide" style={{ left: 'auto', right: 0 }}>
                <div className="mega-grid">
                  <div className="dropdown-section">
                    <h4><Icon name="building" size={14} /> Локална самоуправа</h4>
                    <Link to="/gradonacalnik" onClick={close}><Icon name="briefcase" size={16} /> Градоначалник</Link>
                    <Link to="/vraboteni" onClick={close}><Icon name="users" size={16} /> Вработени</Link>
                    <Link to="/sovet-na-opstinata" onClick={close}><Icon name="users" size={16} /> Совет на општината</Link>
                    <Link to="/organogram" onClick={close}><Icon name="project" size={16} /> Органограм</Link>
                    <div className="dropdown-divider" />
                    <h4><Icon name="building" size={14} /> Институции</h4>
                    {institucii?.length ? institucii.map((i) => (
                      <Link key={i.id} to={`/institucii/${i.id}`} onClick={close}>
                        <Icon name="building" size={16} /> {i.nameOfInstitution}
                      </Link>
                    )) : <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Нема податоци</span>}
                  </div>

                  <div className="dropdown-section">
                    <h4><Icon name="megaphone" size={14} /> Односи со јавност</h4>
                    <Link to="/objavi/Новости" onClick={close}><Icon name="newspaper" size={16} /> Новости</Link>
                    <Link to="/objavi/Соопштенија" onClick={close}><Icon name="megaphone" size={16} /> Соопштенија</Link>
                    <Link to="/objavi/Огласи" onClick={close}><Icon name="document" size={16} /> Огласи</Link>
                    <Link to="/objavi/Конкурси" onClick={close}><Icon name="briefcase" size={16} /> Конкурси</Link>
                    <Link to="/sluzben-glasnik" onClick={close}><Icon name="newspaper" size={16} /> Службен гласник</Link>
                    <Link to="/objavi/Пристап до информации" onClick={close}><Icon name="folder" size={16} /> Пристап до информации</Link>
                  </div>

                  <div className="mega-stack">
                    <div className="dropdown-section">
                      <h4><Icon name="wallet" size={14} /> Финансии</h4>
                      <Link to="/budzet" onClick={close}><Icon name="wallet" size={16} /> Буџет на општината</Link>
                      <Link to="/finansiska-transparentnost" onClick={close}><Icon name="document" size={16} /> Финансиска транспарентност</Link>
                      <Link to="/danoci" onClick={close}><Icon name="document" size={16} /> Даноци</Link>
                      <Link to="/uplatnici" onClick={close}><Icon name="document" size={16} /> Примери уплатници</Link>
                    </div>

                    <div className="dropdown-section">
                      <h4><Icon name="gavel" size={14} /> Легислатива</h4>
                      <Link to="/legislativa/Обрасци" onClick={close}><Icon name="document" size={16} /> Обрасци</Link>
                      <Link to="/legislativa/Закони" onClick={close}><Icon name="gavel" size={16} /> Закони</Link>
                      <Link to="/legislativa/Статут и кодекс" onClick={close}><Icon name="folder" size={16} /> Статут и кодекс</Link>
                    </div>

                    <div className="dropdown-section">
                      <h4><Icon name="project" size={14} /> Проекти</h4>
                      <Link to="/proekti" onClick={close}><Icon name="project" size={16} /> Проекти</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <NavLink to="/prijavi-problem" className="nav-link cta-link" onClick={close}>
            <Icon name="alert" size={18} />
            <span>Пријави проблем</span>
          </NavLink>

          <div className="lang-wrap">
            <Icon name="globe" size={16} />
            <select className="lang-select" defaultValue="MK" aria-label="Јазик">
              <option value="MK">МК</option>
              <option value="SQ">SQ</option>
              <option value="EN">EN</option>
            </select>
          </div>
        </nav>
      </div>
    </header>
  );
}
