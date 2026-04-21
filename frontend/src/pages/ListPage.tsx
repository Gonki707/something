import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet } from '../api/entities';
import type {
  LookupRow, ObjavaRow, GlasnikRow, VrabotenRow,
  BudzetRow, LegislativaRow, ProektRow, InstitucijaRow,
} from '../types/entities';

function DocList({ docs }: { docs?: string[] | null }) {
  if (!docs || !docs.length) return null;
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3>Документи</h3>
      <div className="doc-list">
        {docs.map((d, i) => (
          <a key={i} href={d} target="_blank" rel="noreferrer">📄 {d.split('/').pop()}</a>
        ))}
      </div>
    </div>
  );
}

const fmtDate = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString('mk-MK') : '';

export function ObjaviList() {
  const { type } = useParams();
  const { data, loading } = useFetch<ObjavaRow[]>(() => publicGet<ObjavaRow>('odnosi-so-javnost'), [type]);
  const { data: types } = useFetch<LookupRow[]>(() => publicGet('type-objava'));
  const typeMap = Object.fromEntries((types || []).map((t) => [t.id, t.title]));
  const filtered = (data || []).filter((d) => !type || (d.typeId != null && typeMap[d.typeId] === type));

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="crumb">Односи со јавност</div>
          <h1>{type || 'Сите објави'}</h1>
        </div>
        {loading ? <span className="spinner" /> : (
          <div className="cards">
            {filtered.map((o) => (
              <Link key={o.id} to={`/objavi-detalji/${o.id}`} className="card" style={{ color: 'inherit' }}>
                {o.picture && <div style={{ height: 180, background: `url(${o.picture}) center/cover` }} />}
                <div className="card-body">
                  <span className="tag">{o.typeId != null ? typeMap[o.typeId] || 'Објава' : 'Објава'}</span>
                  <h3>{o.title}</h3>
                  <p>{(o.description || '').slice(0, 160)}</p>
                  <small>{fmtDate(o.createdAt)}</small>
                </div>
              </Link>
            ))}
            {!filtered.length && <div className="empty">Нема објави.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ObjavaDetail() {
  const { id } = useParams();
  const { data, loading } = useFetch<ObjavaRow | null>(
    () => publicGet<ObjavaRow>('odnosi-so-javnost').then((arr) => arr.find((x) => x.id === Number(id)) ?? null),
    [id],
  );
  return (
    <div className="page">
      <div className="container">
        {loading ? <span className="spinner" /> : data ? (
          <>
            <div className="page-header">
              <div className="crumb">Односи со јавност</div>
              <h1>{data.title}</h1>
              <div style={{ color: 'var(--muted)' }}>
                {fmtDate(data.createdAt)} {data.madeBy ? `· ${data.madeBy}` : ''}
              </div>
            </div>
            {data.picture && <img src={data.picture} alt={data.title} style={{ borderRadius: 'var(--radius)', maxHeight: 420, objectFit: 'cover', width: '100%' }} />}
            <div style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap' }}>{data.description}</div>
            <DocList docs={data.documents} />
          </>
        ) : <div className="empty">Не е најдено.</div>}
      </div>
    </div>
  );
}

export function SluzbenGlasnikPage() {
  const { data, loading } = useFetch<GlasnikRow[]>(() => publicGet('sluzben-glasnik'));
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
                    <td><Link to={`/sluzben-glasnik/${g.id}`}>{g.broj}</Link></td>
                    <td>{fmtDate(g.date) || '-'}</td>
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
  const { data, loading } = useFetch<VrabotenRow[]>(() => publicGet('vraboteni'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Локална самоуправа</div><h1>Вработени</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="cards">
            {(data || []).map((v) => (
              <Link key={v.id} to={`/vraboteni/${v.id}`} className="card" style={{ color: 'inherit' }}>
                <div className="card-body">
                  <span className="tag">{v.oddel || 'Општина'}</span>
                  <h3>{v.firstName} {v.lastName}</h3>
                  <p>{v.function}</p>
                  {v.email && <span>{v.email}</span>}
                </div>
              </Link>
            ))}
            {!data?.length && <div className="empty">Нема внесени вработени.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function VrabotenDetail() {
  const { id } = useParams();
  const { data } = useFetch<VrabotenRow[]>(() => publicGet('vraboteni'), [id]);
  const v = (data || []).find((x) => x.id === Number(id));
  return (
    <div className="page">
      <div className="container">
        {v ? (
          <>
            <div className="page-header">
              <div className="crumb">Локална самоуправа · Вработени</div>
              <h1>{v.firstName} {v.lastName}</h1>
              <div style={{ color: 'var(--muted)' }}>{v.function} · {v.oddel}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              {v.email && <p>📧 <a href={`mailto:${v.email}`}>{v.email}</a></p>}
            </div>
          </>
        ) : <span className="spinner" />}
      </div>
    </div>
  );
}

export function BudzetPage() {
  const { data, loading } = useFetch<BudzetRow[]>(() => publicGet('budzet'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Финансии</div><h1>Буџет на општината</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="cards">
            {(data || []).map((b) => (
              <Link key={b.id} to={`/budzet/${b.id}`} className="card" style={{ color: 'inherit' }}>
                <div className="card-body">
                  <span className="tag">Година {b.forYear}</span>
                  <h3>Буџет за {b.forYear}</h3>
                  <p>{fmtDate(b.date)}</p>
                  <small>{(b.documents?.length || 0)} документ(и)</small>
                </div>
              </Link>
            ))}
            {!data?.length && <div className="empty">Сè уште нема внесени буџети.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function BudzetDetail() {
  const { id } = useParams();
  const { data } = useFetch<BudzetRow[]>(() => publicGet('budzet'), [id]);
  const b = (data || []).find((x) => x.id === Number(id));
  return (
    <div className="page">
      <div className="container">
        {b ? (
          <>
            <div className="page-header">
              <div className="crumb">Финансии · Буџет</div>
              <h1>Буџет за {b.forYear}</h1>
              <div style={{ color: 'var(--muted)' }}>Објавено: {fmtDate(b.date) || '—'}</div>
            </div>
            <DocList docs={b.documents} />
          </>
        ) : <span className="spinner" />}
      </div>
    </div>
  );
}

export function ProektiPage() {
  const { data, loading } = useFetch<ProektRow[]>(() => publicGet('proekti'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Општина</div><h1>Проекти</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="cards">
            {(data || []).map((p) => (
              <Link key={p.id} to={`/proekti/${p.id}`} className="card" style={{ color: 'inherit' }}>
                <div style={{ height: 180, background: p.picture ? `url(${p.picture}) center/cover` : 'linear-gradient(135deg,#c8a24a,#0c3b5c)' }} />
                <div className="card-body">
                  <h3>{p.title}</h3>
                  <p>{(p.description || '').slice(0, 140)}</p>
                </div>
              </Link>
            ))}
            {!data?.length && <div className="empty">Нема внесени проекти.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProektDetail() {
  const { id } = useParams();
  const { data } = useFetch<ProektRow[]>(() => publicGet('proekti'), [id]);
  const p = (data || []).find((x) => x.id === Number(id));
  return (
    <div className="page">
      <div className="container">
        {p ? (
          <>
            <div className="page-header"><div className="crumb">Општина · Проекти</div><h1>{p.title}</h1></div>
            {p.picture && <img src={p.picture} alt={p.title} style={{ borderRadius: 'var(--radius)', maxHeight: 420, objectFit: 'cover', width: '100%' }} />}
            <div style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap' }}>{p.description}</div>
            <DocList docs={p.documents} />
          </>
        ) : <span className="spinner" />}
      </div>
    </div>
  );
}

export function LegislativaPage() {
  const { type } = useParams();
  const { data, loading } = useFetch<LegislativaRow[]>(() => publicGet('legislativa'), [type]);
  const { data: types } = useFetch<LookupRow[]>(() => publicGet('type-legislativa'));
  const typeMap = Object.fromEntries((types || []).map((t) => [t.id, t.title]));
  const filtered = (data || []).filter((l) => !type || (l.typeId != null && typeMap[l.typeId] === type));

  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Легислатива</div><h1>{type || 'Документи'}</h1></div>
        {loading ? <span className="spinner" /> : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Тип</th><th>Наслов</th><th>Документ</th></tr></thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td>{l.typeId != null ? typeMap[l.typeId] : ''}</td>
                    <td><Link to={`/legislativa-detalji/${l.id}`}>{l.title || 'Документ'}</Link></td>
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
  const { data } = useFetch<InstitucijaRow[]>(() => publicGet('institucii'));
  const inst = (data || []).find((i) => i.id === Number(id));
  return (
    <div className="page">
      <div className="container">
        {inst ? (
          <>
            <div className="page-header">
              <div className="crumb">Институции</div>
              <h1>{inst.nameOfInstitution}</h1>
              <div style={{ color: 'var(--muted)' }}>{inst.mestoNaseleno}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              {inst.directorFullName && <p><strong>Директор:</strong> {inst.directorFullName}</p>}
              {inst.directorBiography && <p>{inst.directorBiography}</p>}
              {inst.email && <p>📧 <a href={`mailto:${inst.email}`}>{inst.email}</a></p>}
              {inst.website && <p>🌐 <a href={inst.website} target="_blank" rel="noreferrer">{inst.website}</a></p>}
              {inst.facebook && <p>📘 <a href={inst.facebook} target="_blank" rel="noreferrer">Facebook</a></p>}
              {inst.instagram && <p>📷 <a href={inst.instagram} target="_blank" rel="noreferrer">Instagram</a></p>}
            </div>
          </>
        ) : <span className="spinner" />}
      </div>
    </div>
  );
}

export function NaseleniMestaPage() {
  const { data } = useFetch<LookupRow[]>(() => publicGet('naseleni-mesta'));
  return (
    <div className="page">
      <div className="container">
        <div className="page-header"><div className="crumb">Запознај ја општината</div><h1>Населени места</h1></div>
        <div className="cards">
          {(data || []).map((m) => (
            <div key={m.id} className="card">
              <div className="card-body"><h3>{m.title}</h3></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GlasnikDetail() {
  const { id } = useParams();
  const { data } = useFetch<GlasnikRow[]>(() => publicGet('sluzben-glasnik'), [id]);
  const g = (data || []).find((x) => x.id === Number(id));
  return (
    <div className="page">
      <div className="container">
        {g ? (
          <>
            <div className="page-header">
              <div className="crumb">Односи со јавност · Службен гласник</div>
              <h1>Број {g.broj}</h1>
              <div style={{ color: 'var(--muted)' }}>{fmtDate(g.date)}</div>
            </div>
            {g.document && <p><a href={g.document} target="_blank" rel="noreferrer" className="btn primary">📄 Преземи документ</a></p>}
          </>
        ) : <span className="spinner" />}
      </div>
    </div>
  );
}

export function LegislativaDetail() {
  const { id } = useParams();
  const { data } = useFetch<LegislativaRow[]>(() => publicGet('legislativa'), [id]);
  const { data: types } = useFetch<LookupRow[]>(() => publicGet('type-legislativa'));
  const l = (data || []).find((x) => x.id === Number(id));
  const typeName = l && l.typeId != null ? types?.find((t) => t.id === l.typeId)?.title : undefined;
  return (
    <div className="page">
      <div className="container">
        {l ? (
          <>
            <div className="page-header"><div className="crumb">Легислатива · {typeName || ''}</div><h1>{l.title || 'Документ'}</h1></div>
            {l.document && <p><a href={l.document} target="_blank" rel="noreferrer" className="btn primary">📄 Преземи документ</a></p>}
          </>
        ) : <span className="spinner" />}
      </div>
    </div>
  );
}

export function StaticPage({ title, crumb, children }: { title: string; crumb?: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">{crumb && <div className="crumb">{crumb}</div>}<h1>{title}</h1></div>
        <div className="prose">{children}</div>
      </div>
    </div>
  );
}
