import { useFetch } from '../hooks/useFetch';
import type { GradonacalnikData } from '../types/entities';

function StaticPage({ title, crumb, children }: { title: string; crumb?: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">{crumb && <div className="crumb">{crumb}</div>}<h1>{title}</h1></div>
        <div className="prose">{children}</div>
      </div>
    </div>
  );
}

export default function GradonacalnikPage() {
  const { data, loading, error } = useFetch<GradonacalnikData>(
    () => fetch('/data/gradonacalnik.json').then((r) => r.json()),
    []
  );

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <StaticPage title="Градоначалник" crumb="Локална самоуправа">
        <p style={{ color: 'var(--danger)' }}>Не можевме да ги вчитаме податоците. Обидете се повторно подоцна.</p>
      </StaticPage>
    );
  }

  return (
    <StaticPage title={data.name} crumb="Локална самоуправа">
      <div className="bio">
        <img src={data.image} alt={`Портрет на ${data.name}`} loading="lazy" />
        <div>
          <h2 style={{ marginTop: 0 }}>{data.name}</h2>
          <p style={{ color: 'var(--muted)', marginTop: 0 }}>{data.title}</p>
          {data.biography.map((section) => (
            <div key={section.heading} className="bio-section">
              <h3>{section.heading}</h3>
              <ul>
                {section.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <h2>{data.responsibilities.heading}</h2>
      <p>{data.responsibilities.text}</p>

      <h2>{data.contact.heading}</h2>
      <div className="info-grid">
        {data.contact.items.map((item) => (
          <div key={item.label} className="info-card">
            <strong>{item.label}</strong>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
