import { Link } from 'react-router-dom';

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Top accent bar */}
      <div className="footer-accent-bar" />

      <div className="container">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <img src="/Logo/Logo.png" alt="Општина Маврово и Ростуше" className="footer-logo" />
              <div>
                <h4>Општина Маврово и Ростуше</h4>
                <span className="footer-tagline">Официјална веб страница</span>
              </div>
            </div>
            <p className="footer-desc">
              Општина сместена во северо-западниот дел на Република Северна Македонија,
              во прегратките на Националниот парк Маврово.
            </p>

            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <MapPinIcon />
                <span>Маврови Анови, ул. „Маврово“ бб</span>
              </div>
              <div className="footer-contact-item">
                <PhoneIcon />
                <a href="tel:+38942488660">+389 (0) 42 488 660</a>
              </div>
              <div className="footer-contact-item">
                <MailIcon />
                <a href="mailto:info@mavrovo.gov.mk">info@mavrovo.gov.mk</a>
              </div>
              <div className="footer-contact-item">
                <ClockIcon />
                <span>Пон – Пет: 08:00 – 16:00</span>
              </div>
            </div>

            {/* Social media */}
            <div className="footer-social">
              <span>Следете не:</span>
              <a
                href="https://www.facebook.com/OpshtinaMavrovoRostushe/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link facebook"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div className="footer-links-col">
            <h4>Општина</h4>
            <ul>
              <li><Link to="/mestopolozba">Местоположба</Link></li>
              <li><Link to="/naseleni-mesta">Населени места</Link></li>
              <li><Link to="/gradonacalnik">Градоначалник</Link></li>
              <li><Link to="/sovet-na-opstinata">Совет на општината</Link></li>
              <li><Link to="/organogram">Органограм</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Информации</h4>
            <ul>
              <li><Link to="/objavi/Новости">Новости</Link></li>
              <li><Link to="/objavi/Соопштенија">Соопштенија</Link></li>
              <li><Link to="/sluzben-glasnik">Службен гласник</Link></li>
              <li><Link to="/proekti">Проекти</Link></li>
              <li><Link to="/vraboteni">Вработени</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Граѓани</h4>
            <ul>
              <li><Link to="/prijavi-problem">Пријави проблем</Link></li>
              <li><Link to="/danoci">Даноци</Link></li>
              <li><Link to="/uplatnici">Примери уплатници</Link></li>
              <li><Link to="/legislativa/Општински акти">Легислатива</Link></li>
              <li><Link to="/admin">Админ панел</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            © {currentYear} Општина Маврово и Ростуше. Сите права задржани.
          </div>
          <div className="footer-bottom-right">
            <Link to="/">Почетна</Link>
            <span className="footer-divider" />
            <Link to="/prirodni-bogatstva">Природни богатства</Link>
            <span className="footer-divider" />
            <Link to="/prijavi-problem">Контакт</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
