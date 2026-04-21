import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';

interface Common { id: number; title?: string; createdAt?: string; description?: string | null; picture?: string | null; }

export function ObjaviList() {
  const { type } = useParams();
  const { data, loading } = useFetch<any[]>(() => publicGet<any>('odnosi-so-javnost'), [type]);
  const { data: types } = useFetch<{ id: number; title: string }[]>(() => publicGet('type-objava'));
  const typeMap = Object.fromEntries((types || []).map((t) => [t.id, t.title]));
  const filtered = (data || []).filter((d) => !type || typeMap[d.typeId] === type);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="crumb">Односи со јавност</div>
          <h1>{type || 'Сите објави'}</h1>
        </div>
        {loading ? <span className="spinner" /> : (
          <div className="cards">
            {filtered.map((n) => (
              <Link key={n.id} to={`/objavi-detalji/${n.id}`} className="card" style={{ color: 'inherit' }}>
                <div style={{ height: 160, background: n.picture ? `url(${n.picture}) center/cover` : 'linear-gradient(135deg,#1f7a8c,#0c3b5c)' }} />
                <div className="card-body">
                  <span className="meta">{new Date(n.createdAt).toLocaleDateString('mk-MK')} · {typeMap[n.typeId] || ''}</span>
                  <h3>{n.title}</h3>
                  <p>{(n.description || '').slice(0, 140)}</p>
                </div>
              </Link>
            ))}
            {!filtered.length && <div className="empty">Нема објави во оваа категорија.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ObjavaDetail() {
  const { id } = useParams();
  const { data, loading } = useFetch<any>(() => publicGet<any>('odnosi-so-javnost').then((arr) => arr.find((x: any) => x.id === Number(id))), [id]);
  return (
    <div className="page">
      <div className="container">
        {loading && <span className="spinner" />}
        {data && (
          <>
            <div className="page-header">
              <div className="crumb">Односи со јавност</div>
              <h1>{data.title}</h1>
              <div style={{ color: 'var(--muted)' }}>{new Date(data.createdAt).toLocaleDateString('mk-MK')} · {data.madeBy}</div>
            </div>
            {data.picture && <img src={data.picture} alt={data.title} style={{ borderRadius: 'var(--radius)', maxHeight: 420, objectFit: 'cover', width: '100%' }} />}
            <div style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap' }}>{data.description}</div>
            {data.documents?.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Документи</h3>
                <div className="doc-list">
                  {data.documents.map((d: string, i: number) => (
                    <a key={i} href={d} target="_blank" rel="noreferrer">📄 {d.split('/').pop()}</a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function SluzbenGlasnikPage() {
  const { data, loading } = useFetch<any[]>(() => publicGet('sluzben-glasnik'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Односи со јавност</div><h1>Службен гласник</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Број</th><th>Датум</th><th>Документ</th></tr></thead>
              <tbody>
                {(data || []).map((g) => (
                  <tr key={g.id}>
                    <td>{g.broj}</td>
                    <td>{g.date ? new Date(g.date).toLocaleDateString('mk-MK') : '-'}</td>
                    <td>{g.document ? <a href={g.document} target="_blank" rel="noreferrer">📄 Преземи</a> : '-'}</td>
                  </tr>
                ))}
                {!data?.length && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>Нема внесени броеви.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function VraboteniPage() {
  const { data, loading } = useFetch<any[]>(() => publicGet('vraboteni'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Локална самоуправа</div><h1>Вработени</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="cards">
            {(data || []).map((v) => (
              <div key={v.id} className="card">
                <div className="card-body">
                  <span className="tag">{v.oddel || 'Општина'}</span>
                  <h3>{v.firstName} {v.lastName}</h3>
                  <p>{v.function}</p>
                  {v.email && <a href={`mailto:${v.email}`}>{v.email}</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BudzetPage() {
  const { data, loading } = useFetch<any[]>(() => publicGet('budzet'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Финансии</div><h1>Буџет на општината</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="cards">
            {(data || []).map((b) => (
              <div key={b.id} className="card">
                <div className="card-body">
                  <span className="tag">Година {b.forYear}</span>
                  <h3>Буџет за {b.forYear}</h3>
                  <p>{b.date ? new Date(b.date).toLocaleDateString('mk-MK') : ''}</p>
                  {b.documents?.map((d: string, i: number) => (
                    <a key={i} href={d} target="_blank" rel="noreferrer">📄 Документ {i + 1}</a>
                  ))}
                </div>
              </div>
            ))}
            {!data?.length && <div className="empty">Сè уште нема внесени буџети.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProektiPage() {
  const { data, loading } = useFetch<any[]>(() => publicGet('proekti'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Општина</div><h1>Проекти</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="cards">
            {(data || []).map((p) => (
              <div key={p.id} className="card">
                <div style={{ height: 180, background: p.picture ? `url(${p.picture}) center/cover` : 'linear-gradient(135deg,#c8a24a,#0c3b5c)' }} />
                <div className="card-body">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
              </div>
            ))}
            {!data?.length && <div className="empty">Нема внесени проекти.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function LegislativaPage() {
  const { type } = useParams();
  const { data, loading } = useFetch<any[]>(() => publicGet('legislativa'), [type]);
  const { data: types } = useFetch<any[]>(() => publicGet('type-legislativa'));
  const typeMap = Object.fromEntries((types || []).map((t) => [t.id, t.title]));
  const filtered = (data || []).filter((d) => !type || typeMap[d.typeId] === type);
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Легислатива</div><h1>{type || 'Легислатива'}</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Тип</th><th>Наслов</th><th>Документ</th></tr></thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td>{typeMap[l.typeId]}</td>
                    <td>{l.title || '-'}</td>
                    <td>{l.document ? <a href={l.document} target="_blank" rel="noreferrer">📄 Преземи</a> : '-'}</td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)' }}>Нема документи.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function InstitucionDetail() {
  const { id } = useParams();
  const { data } = useFetch<any[]>(() => publicGet('institucii'));
  const inst = (data || []).find((x) => x.id === Number(id));
  return (
    <div className="page">
      <div className="container">
        {inst ? (
          <>
            <div className="page-header"><div className="crumb">Институции</div><h1>{inst.nameOfInstitution}</h1></div>
            <p><strong>Место:</strong> {inst.mestoNaseleno}</p>
            <p><strong>Директор:</strong> {inst.directorFullName}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{inst.directorBiography}</p>
            <p>
              {inst.email && <>📧 <a href={`mailto:${inst.email}`}>{inst.email}</a><br /></>}
              {inst.website && <>🌐 <a href={inst.website} target="_blank" rel="noreferrer">{inst.website}</a><br /></>}
              {inst.facebook && <>Facebook: <a href={inst.facebook} target="_blank" rel="noreferrer">{inst.facebook}</a><br /></>}
              {inst.instagram && <>Instagram: <a href={inst.instagram} target="_blank" rel="noreferrer">{inst.instagram}</a></>}
            </p>
          </>
        ) : <span className="spinner" />}
      </div>
    </div>
  );
}

export function NaseleniMestaPage() {
  const { data } = useFetch<any[]>(() => publicGet('naseleni-mesta'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Запознај ја општината</div><h1>Населени места</h1></div>
        <p>Општина Маврово и Ростуше опфаќа повеќе села во подножјето на Шар Планина и Бистра, во рамките на Националниот парк Маврово.</p>
        <div className="cards">
          {(data || []).map((n) => (
            <div key={n.id} className="card"><div className="card-body"><h3>{n.title}</h3></div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StaticPage({ title, crumb, children }: { title: string; crumb?: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">{crumb && <div className="crumb">{crumb}</div>}<h1>{title}</h1></div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>{children}</div>
      </div>
    </div>
  );
}
