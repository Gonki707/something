import { useState } from 'react';

interface Event { id: number; dateTime: string; title: string; }

const DOW = ['Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб', 'Нед'];
const MONTHS = ['Јануари','Февруари','Март','Април','Мај','Јуни','Јули','Август','Септември','Октомври','Ноември','Декември'];

export default function Calendar({ events }: { events: Event[] }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const eventsByDay: Record<number, Event[]> = {};
  events.forEach((e) => {
    const d = new Date(e.dateTime);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      (eventsByDay[day] ||= []).push(e);
    }
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
        <button className="btn sm primary" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
        <strong style={{ color: 'var(--primary-dark)' }}>{MONTHS[month]} {year}</strong>
        <button className="btn sm primary" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="calendar">
        {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`day ${d === null ? 'empty' : ''} ${d && isToday(d) ? 'today' : ''}`}>
            {d && <>
              <div className="num">{d}</div>
              {(eventsByDay[d] || []).slice(0, 2).map((e) => (
                <span key={e.id} className="ev" title={e.title}>{e.title}</span>
              ))}
              {(eventsByDay[d]?.length || 0) > 2 && <span className="ev" style={{ background: 'var(--accent)' , color: 'var(--primary-dark)' }}>+{eventsByDay[d].length - 2}</span>}
            </>}
          </div>
        ))}
      </div>
    </div>
  );
}
