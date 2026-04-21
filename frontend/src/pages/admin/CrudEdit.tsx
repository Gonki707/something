import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ADMIN_ENTITIES, Field } from './entitiesConfig';
import { adminGet, adminCreate, adminUpdate, publicGet } from '../../api/entities';
import { uploadFiles } from '../../api/client';

export default function CrudEdit() {
  const { entity, id } = useParams<{ entity: string; id: string }>();
  const cfg = entity ? ADMIN_ENTITIES[entity] : null;
  const isNew = id === 'new';
  const nav = useNavigate();

  const [form, setForm] = useState<Record<string, any>>({});
  const [lookups, setLookups] = useState<Record<string, { id: number; title: string }[]>>({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cfg || !entity) return;
    const lookupKeys = cfg.fields.filter((f) => f.type === 'select' && f.lookup).map((f) => f.lookup!);
    Promise.all(lookupKeys.map((k) => publicGet<any>(k).then((items) => [k, items] as const)))
      .then((entries) => setLookups(Object.fromEntries(entries)));

    if (!isNew && id) {
      adminGet(entity, id).then((data) => setForm(data || {})).finally(() => setLoading(false));
    } else {
      // initialize empty
      const init: Record<string, any> = {};
      cfg.fields.forEach((f) => { init[f.key] = f.type === 'documents' ? [] : ''; });
      setForm(init);
    }
  }, [entity, id]);

  if (!cfg || !entity) return <div>Непозната категорија.</div>;

  const setField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onUploadImage = async (k: string, file: File | null) => {
    if (!file) return;
    const r = await uploadFiles([file], true);
    setField(k, r[0].path);
  };
  const onUploadDocs = async (k: string, files: FileList | null) => {
    if (!files || !files.length) return;
    const r = await uploadFiles(Array.from(files), true);
    setField(k, [...(form[k] || []), ...r.map((f) => f.path)]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      // coerce numeric fields
      const payload: Record<string, any> = { ...form };
      cfg.fields.forEach((f) => {
        if (f.type === 'number' && payload[f.key] !== '') payload[f.key] = Number(payload[f.key]);
        if (f.type === 'select' && payload[f.key] !== '' && payload[f.key] != null) payload[f.key] = Number(payload[f.key]);
        if (payload[f.key] === '') payload[f.key] = null;
      });
      if (isNew) await adminCreate(entity, payload);
      else await adminUpdate(entity, id!, payload);
      nav(`/admin/${entity}`);
    } catch (e: any) {
      setError(e.message || 'Грешка при зачувување');
    } finally { setSaving(false); }
  };

  if (loading) return <span className="spinner" />;

  const renderField = (f: Field) => {
    const val = form[f.key] ?? '';
    switch (f.type) {
      case 'textarea':
        return <textarea value={val ?? ''} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'number':
        return <input type="number" value={val ?? ''} required={f.required} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'date':
        return <input type="date" value={(val ?? '').toString().slice(0, 10)} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'datetime':
        return <input type="datetime-local" value={val ? new Date(val).toISOString().slice(0, 16) : ''} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'email':
        return <input type="email" value={val ?? ''} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'url':
        return <input type="url" value={val ?? ''} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'password':
        return <input type="password" value={val ?? ''} placeholder={isNew ? '' : 'Остави празно за непроменета'} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'select': {
        const opts = lookups[f.lookup!] || [];
        return (
          <select value={val ?? ''} required={f.required} onChange={(e) => setField(f.key, e.target.value)}>
            <option value="">— Избери —</option>
            {opts.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        );
      }
      case 'image':
        return (
          <div>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => onUploadImage(f.key, e.target.files?.[0] || null)} />
            {val && <div style={{ marginTop: 6 }}><a href={val} target="_blank" rel="noreferrer">📄 Тековна датотека</a> · <button type="button" className="btn sm" onClick={() => setField(f.key, null)}>Отстрани</button></div>}
          </div>
        );
      case 'documents':
        return (
          <div>
            <input type="file" multiple onChange={(e) => onUploadDocs(f.key, e.target.files)} />
            <div className="doc-list" style={{ marginTop: 6 }}>
              {(val || []).map((d: string, i: number) => (
                <div key={i}>
                  <a href={d} target="_blank" rel="noreferrer">📄 {d.split('/').pop()}</a>{' '}
                  <button type="button" className="btn sm" onClick={() => setField(f.key, val.filter((_: any, idx: number) => idx !== i))}>×</button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <input type="text" value={val ?? ''} required={f.required} onChange={(e) => setField(f.key, e.target.value)} />;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem', color: 'var(--muted)', fontSize: '.85rem' }}>
        <Link to={`/admin/${entity}`}>← {cfg.label}</Link>
      </div>
      <h1>{isNew ? `Нов запис` : `Уреди запис #${id}`}</h1>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit} className="form-grid">
        {cfg.fields.map((f) => (
          <div className="field" key={f.key}>
            <label>{f.label}{f.required && ' *'}</label>
            {renderField(f)}
          </div>
        ))}
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Зачувување…' : 'Зачувај'}</button>
          <Link to={`/admin/${entity}`} className="btn">Откажи</Link>
        </div>
      </form>
    </div>
  );
}
