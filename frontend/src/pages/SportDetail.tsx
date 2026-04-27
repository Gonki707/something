import { useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGetOne } from '../api/entities';
import type { SportRow } from '../types/entities';

const fmtDate = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString('mk-MK') : '';

export default function SportDetail() {
  const { id } = useParams();
  const { data, loading } = useFetch<SportRow | null>(
    () => publicGetOne<SportRow>('sport', id!).catch(() => null),
    [id],
  );

  return (
    <div className="page">
      <div className="container">
        {loading ? <span className="spinner" /> : data ? (
          <>
            <div className="page-header">
              <div className="crumb">Запознај ја општината · Спорт</div>
              <h1>{data.title}</h1>
              {data.date && <div style={{ color: 'var(--muted)' }}>{fmtDate(data.date)}</div>}
            </div>
            {data.picture && (
              <img
                src={data.picture}
                alt={data.title}
                style={{ borderRadius: 'var(--radius)', maxHeight: 420, objectFit: 'cover', width: '100%' }}
              />
            )}
            {data.description && (
              <div style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap' }}>{data.description}</div>
            )}
            {data.images && data.images.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3>Галерија</h3>
                <div className="image-gallery">
                  {data.images.map((img, i) => (
                    <div key={i} className="gallery-item">
                      <img src={img} alt={`${data.title} ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : <div className="empty">Не е најдено.</div>}
      </div>
    </div>
  );
}
