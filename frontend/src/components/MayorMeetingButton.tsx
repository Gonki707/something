import { useEffect, useState } from 'react';
import Icon from './Icon';

const MAYOR_PHONE = '+389 (0)42 478 814';

export default function MayorMeetingButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button type="button" className="meeting-trigger" onClick={() => setOpen(true)}>
        Средба со градоначалник
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="meeting-title">
            <button type="button" className="modal-close" onClick={() => setOpen(false)} aria-label="Затвори">
              <Icon name="close" size={18} />
            </button>
            <div className="modal-icon"><Icon name="phone" size={28} /></div>
            <h3 id="meeting-title" className="modal-title">Средба со градоначалникот</h3>
            <p className="modal-text">За средба со градоначалникот јавете се на бројот:</p>
            <a href={`tel:${MAYOR_PHONE.replace(/[^+0-9]/g, '')}`} className="modal-phone">
              <Icon name="phone" size={20} />
              <span>{MAYOR_PHONE}</span>
            </a>
            <p className="modal-hint">Прием на граѓани: секој вторник 10:00 – 13:00 ч.</p>
          </div>
        </div>
      )}
    </>
  );
}
