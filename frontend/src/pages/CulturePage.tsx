import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';
import type { KulturaRow } from '../types/entities';

const fmtDate = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString('mk-MK') : '';

export default function CulturePage() {
  const { data, loading } = useFetch<KulturaRow[]>(() => publicGet<KulturaRow>('kultura'));

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="crumb">Запознај ја општината</div>
          <h1>Култура</h1>
        </div>
        {loading ? <span className="spinner" /> : (
          <div className="vertical-list">
            {(data || []).map((item) => (
              <Link key={item.id} to={`/kultura/${item.id}`} className="vertical-list-item" style={{ color: 'inherit' }}>
                {item.picture && (
                  <div className="vertical-list-image">
                    <img src={item.picture} alt={item.title} loading="lazy" />
                  </div>
                )}
                <div className="vertical-list-body">
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description.slice(0, 220)}</p>}
                  {item.date && <small className="vertical-list-date">{fmtDate(item.date)}</small>}
                </div>
              </Link>
            ))}
            {!data?.length && <div className="empty">Нема внесени културни настани.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
