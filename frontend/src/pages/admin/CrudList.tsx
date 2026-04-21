import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ADMIN_ENTITIES, type Field } from './entitiesConfig';
import { adminList, adminDelete, publicGet } from '../../api/entities';

type Row = Record<string, unknown> & { id: number };
type LookupItem = { id: number; title: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function CrudList() {
  const { entity } = useParams<{ entity: string }>();
  const cfg = entity ? ADMIN_ENTITIES[entity] : null;
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookups, setLookups] = useState<Record<string, Record<number, string>>>({});

  useEffect(() => {
    if (!entity || !cfg) return;
    setLoading(true);
    adminList<Row>(entity).then(setRows).finally(() => setLoading(false));

    const lookupKeys = cfg.fields
      .filter((f) => f.type === 'select' && f.lookup)
      .map((f) => f.lookup as string);
    Promise.all(
      lookupKeys.map((k) =>
        publicGet<LookupItem>(k).then(
          (items) => [k, Object.fromEntries(items.map((it) => [it.id, it.title]))] as const,
        ),
      ),
    ).then((entries) => setLookups(Object.fromEntries(entries)));
  }, [entity]);

  if (!cfg || !entity) return <div>Непозната категорија.</div>;

  const onDelete = async (id: number) => {
    if (!confirm('Дали сте сигурни дека сакате да го избришете записот?')) return;
    await adminDelete(entity, id);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const visibleFields = cfg.fields.filter((f) => f.showInList);

  const formatCell = (row: Row, f: Field): React.ReactNode => {
    const v = row[f.key];
    if (v == null || v === '') return '-';
    if (f.type === 'select' && f.lookup) {
      const id = typeof v === 'number' ? v : Number(v);
      return lookups[f.lookup]?.[id] ?? String(v);
    }
    if (f.type === 'date' || f.type === 'datetime') {
      const d = new Date(String(v));
      if (Number.isNaN(d.getTime())) return String(v);
      return f.type === 'date' ? d.toLocaleDateString('mk-MK') : d.toLocaleString('mk-MK');
    }
    if (f.type === 'image') {
      const s = String(v);
      return <a href={s} target="_blank" rel="noreferrer">🖼️</a>;
    }
    if (f.type === 'document') {
      const s = String(v);
      return <a href={s} target="_blank" rel="noreferrer">📄</a>;
    }
    if (Array.isArray(v)) return `${v.length} датотеки`;
    if (isRecord(v)) return JSON.stringify(v);
    const s = String(v);
    return s.length > 80 ? s.slice(0, 80) + '…' : s;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>{cfg.label}</h1>
        {cfg.canCreate !== false && (
          <Link to={`/admin/${entity}/new`} className="btn primary">+ Нов запис</Link>
        )}
      </div>

      {loading ? <span className="spinner" /> : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>ID</th>
                {visibleFields.map((f) => <th key={f.key}>{f.label}</th>)}
                <th className="actions">Акции</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  {visibleFields.map((f) => <td key={f.key}>{formatCell(row, f)}</td>)}
                  <td className="actions">
                    <button className="btn sm primary" onClick={() => nav(`/admin/${entity}/${row.id}`)}>Уреди</button>{' '}
                    <button className="btn sm danger" onClick={() => onDelete(row.id)}>Избриши</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={visibleFields.length + 2} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
                  Нема записи.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
