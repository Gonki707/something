import { useRef, useState, useCallback, useEffect } from 'react';

interface LinkItem {
  name: string;
  url: string;
  img: string;
}

const links: LinkItem[] = [
  { name: 'АВРМ', url: 'https://avrm.gov.mk/', img: 'https://av.gov.mk/content/images/logo-agencija-severna.png' },
  { name: 'Влада на РСМ', url: 'https://vlada.gov.mk/', img: 'https://vlada.mk/build/assets/vlada-logo-new-white-XmUW8AQw.svg' },
  { name: 'е-Услуги', url: 'https://e-uslugi.gov.mk/', img: 'https://mdt.gov.mk/build/assets/uslugi-logo-CAeFWK1T.svg' },
  { name: 'Маврово News', url: 'https://mavrovonews.mk/', img: 'https://mavrovonews.com/wp-content/uploads/2025/06/Transparent-e1750775770749.png' },
   { name: 'ЈУНП Маврово', url: 'https://npmavrovo.mk/', img: 'https://npmavrovo.org.mk/wp-content/themes/npmavrovo/images/logo.png' },
  { name: 'Министерство за транспорт и врски', url: 'https://mtc.gov.mk/', img: 'https://mtc.gov.mk/build/assets/logo-white-DLkR78ku.svg' },
  { name: 'Министерство за дигитална трансформација', url: 'https://mdt.gov.mk/', img: 'https://mdt.gov.mk/build/assets/logo-white-DLkR78ku.svg' },
  { name: 'Министерство за локална самоуправа', url: 'https://mls.gov.mk/', img: 'https://mls.gov.mk/build/assets/logo-white-DLkR78ku.svg' },
];

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

export default function UsefulLinksSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const getItemWidth = useCallback(() => {
    const firstItem = itemRefs.current[0];
    if (!firstItem) return 140;
    const style = window.getComputedStyle(firstItem);
    const marginRight = parseFloat(style.marginRight) || 0;
    return firstItem.offsetWidth + marginRight;
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = getItemWidth();
    el.scrollBy({
      left: direction === 'left' ? -itemWidth : itemWidth,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  }, [checkScroll, getItemWidth]);

  return (
    <section className="useful-links-section" aria-label="Корисни линкови">
      <div className="container">
        <h3 className="useful-links-title">Корисни линкови</h3>
      </div>
      <div className="slider-fullwidth">
        <button
          className="slider-arrow slider-arrow-left"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Помести лево"
        >
          <ArrowLeftIcon />
        </button>
        <div
          className="slider-scroll"
          ref={scrollRef}
          onScroll={checkScroll}
        >
          {links.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="slider-item"
              title={item.name}
              ref={(el) => { itemRefs.current[idx] = el; }}
            >
              <div className="slider-item-inner">
                <div className="slider-logo-wrap" style={{ backgroundColor: '#5a0d0d' }}>
                  <img
                    src={item.img}
                    alt={item.name}
                    className="slider-logo-img"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="slider-logo-fallback" style={{ display: 'none' }}>
                    {item.name.charAt(0)}
                  </div>
                </div>
                <span className="slider-item-name">{item.name}</span>
              </div>
            </a>
          ))}
        </div>
        <button
          className="slider-arrow slider-arrow-right"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Помести десно"
        >
          <ArrowRightIcon />
        </button>
      </div>
    </section>
  );
}
