import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';
import MayorMeetingButton from './MayorMeetingButton';

interface Institucija { id: number; nameOfInstitution: string; }

export default function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: institucii } = useFetch<Institucija[]>(() => publicGet<Institucija>('institucii'));

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggle = (name: string) => setOpen((o) => (o === name ? null : name));
  const close = () => { setOpen(null); setMobileOpen(false); };

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container">
          <span className="header-top-text">Општина Маврово и Ростуше · info@mavrovo.gov.mk · +389 42 478 814</span>
          <div className="header-top-right"><MayorMeetingButton /></div>
        </div>
      </div>
      {mobileOpen && (
        <div className="mobile-overlay" onClick={close} aria-hidden="true" />
      )}
      <div className="container header-main" ref={ref}>
        <Link to="/" className="brand" onClick={close}>
          <img src="/Logo/Logo.png" alt="Општина Маврово и Ростуше" className="brand-logo" />
          <div className="brand-text">
            <strong>Општина Маврово и Ростуше</strong>
            <small>Официјална веб страница</small>
          </div>
        </Link>

        <button
          type="button"
          className={`mobile-menu-btn ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Затвори мени' : 'Отвори мени'}
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${mobileOpen ? 'is-mobile-open' : ''}`}>
          <div className="nav-item">
            <button type="button" className={`nav-link ${open === 'zapoznaj' ? 'is-open' : ''}`} onClick={() => toggle('zapoznaj')}>
              <span>Запознај ја општината</span>
              <span className="chev">▾</span>
            </button>
            {open === 'zapoznaj' && (
              <div className="dropdown">
                <div className="dropdown-section">
                  <Link to="/mestopolozba" onClick={close}>Местоположба</Link>
                  <Link to="/naseleni-mesta" onClick={close}>Населени места</Link>
                  <Link to="/prirodni-bogatstva" onClick={close}>Природни богатства</Link>
                  <Link to="/kultura" onClick={close}>Култура</Link>
                  <Link to="/sport" onClick={close}>Спорт</Link>
                </div>
              </div>
            )}
          </div>

          <div className="nav-item">
            <button type="button" className={`nav-link ${open === 'meni' ? 'is-open' : ''}`} onClick={() => toggle('meni')}>
              <span>Мени</span>
              <span className="chev">▾</span>
            </button>
            {open === 'meni' && (
              <div className="dropdown wide" style={{ left: 'auto', right: 0 }}>
                <div className="mega-grid mega-5">
                  <div className="dropdown-section">
                    <h4>Локална самоуправа</h4>
                    <Link to="/gradonacalnik" onClick={close}>Градоначалник</Link>
                    <Link to="/vraboteni" onClick={close}>Вработени</Link>
                    <Link to="/sovet-na-opstinata" onClick={close}>Совет на општината</Link>
                    <Link to="/organogram" onClick={close}>Органограм</Link>
                  </div>

                  <div className="dropdown-section">
                    <h4>Институции</h4>
                    {institucii?.length ? institucii.map((i) => (
                      <Link key={i.id} to={`/institucii/${i.id}`} onClick={close}>{i.nameOfInstitution}</Link>
                    )) : <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Нема податоци</span>}
                  </div>

                  <div className="dropdown-section">
                    <h4>Односи со јавност</h4>
                    <Link to="/objavi/Новости" onClick={close}>Новости</Link>
                    <Link to="/objavi/Соопштенија" onClick={close}>Соопштенија</Link>
                    <Link to="/objavi/Огласи" onClick={close}>Огласи</Link>
                    <Link to="/objavi/Конкурси" onClick={close}>Конкурси</Link>
                    <Link to="/sluzben-glasnik" onClick={close}>Службен гласник</Link>
                    <Link to="/objavi/Пристап до информации" onClick={close}>Пристап до информации</Link>
                  </div>

                  <div className="dropdown-section">
                    <h4>Финансии</h4>
                    <Link to="/budzet" onClick={close}>Буџет на општината</Link>
                    <Link to="/finansiska-transparentnost" onClick={close}>Финансиска транспарентност</Link>
                    <Link to="/danoci" onClick={close}>Даноци</Link>
                    <Link to="/uplatnici" onClick={close}>Примери уплатници</Link>
                  </div>

                  <div className="dropdown-section">
                    <h4>Легислатива и проекти</h4>
                    <Link to="/legislativa/Обрасци" onClick={close}>Обрасци</Link>
                    <Link to="/legislativa/Закони" onClick={close}>Закони</Link>
                    <Link to="/legislativa/Статут и кодекс" onClick={close}>Статут и кодекс</Link>
                    <div className="dropdown-divider" />
                    <Link to="/proekti" onClick={close}>Проекти</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
