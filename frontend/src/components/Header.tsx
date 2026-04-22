import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';
import MayorMeetingButton from './MayorMeetingButton';

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
          <span>Општина Маврово и Ростуше · info@mavrovo.gov.mk · +389 42 478 814</span>
          <MayorMeetingButton />
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
              <span>Запознај ја општината</span>
              <span className="chev">▾</span>
            </button>
            {open === 'zapoznaj' && (
              <div className="dropdown">
                <div className="dropdown-section">
                  <Link to="/mestopolozba" onClick={close}>Местоположба</Link>
                  <Link to="/naseleni-mesta" onClick={close}>Населени места</Link>
                  <Link to="/prirodni-bogatstva" onClick={close}>Природни богатства</Link>
                </div>
              </div>
            )}
          </div>

          <div className="nav-item">
            <button className={`nav-link ${open === 'meni' ? 'is-open' : ''}`} onClick={() => toggle('meni')}>
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
