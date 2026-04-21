import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ADMIN_ENTITIES, type Field } from './entitiesConfig';
import { adminGet, adminCreate, adminUpdate, publicGet } from '../../api/entities';
import { uploadFiles } from '../../api/client';

type FormValue = string | number | string[] | null | undefined;
type FormState = Record<string, FormValue>;
type LookupItem = { id: number; title: string };

export default function CrudEdit() {
  const { entity, id } = useParams<{ entity: string; id: string }>();
  const cfg = entity ? ADMIN_ENTITIES[entity] : null;
  const isNew = id === 'new';
  const nav = useNavigate();

  const [form, setForm] = useState<FormState>({});
  const [lookups, setLookups] = useState<Record<string, LookupItem[]>>({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cfg || !entity) return;
    const lookupKeys = cfg.fields
      .filter((f) => f.type === 'select' && f.lookup)
      .map((f) => f.lookup as string);
    Promise.all(
      lookupKeys.map((k) => publicGet<LookupItem>(k).then((items) => [k, items] as const)),
    ).then((entries) => setLookups(Object.fromEntries(entries)));

    if (!isNew && id) {
      adminGet<Record<string, unknown>>(entity, id)
        .then((data) => setForm((data as FormState) || {}))
        .finally(() => setLoading(false));
    } else {
      const init: FormState = {};
      cfg.fields.forEach((f) => { init[f.key] = f.type === 'documents' ? [] : ''; });
      setForm(init);
    }
  }, [entity, id]);

  if (!cfg || !entity) return <div>Непозната категорија.</div>;

  const setField = (k: string, v: FormValue) => setForm((f) => ({ ...f, [k]: v }));

  const onUploadImage = async (k: string, file: File | null) => {
    if (!file) return;
    const r = await uploadFiles([file], true);
    setField(k, r[0].path);
  };
  const onUploadDocs = async (k: string, files: FileList | null) => {
    if (!files || !files.length) return;
    const r = await uploadFiles(Array.from(files), true);
    const current = form[k];
    const list = Array.isArray(current) ? current : [];
    setField(k, [...list, ...r.map((f) => f.path)]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload: Record<string, unknown> = { ...form };
      cfg.fields.forEach((f) => {
        const v = payload[f.key];
        if (f.type === 'number' && v !== '' && v != null) payload[f.key] = Number(v);
        else if (f.type === 'select' && v !== '' && v != null) payload[f.key] = Number(v);
        else if (v === '') payload[f.key] = null;
      });
      if (isNew) await adminCreate(entity, payload);
      else await adminUpdate(entity, id!, payload);
      nav(`/admin/${entity}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Грешка при зачувување');
    } finally { setSaving(false); }
  };

  if (loading) return <span className="spinner" />;

  const renderField = (f: Field) => {
    const raw = form[f.key];
    const valStr = raw == null ? '' : String(raw);
    switch (f.type) {
      case 'textarea':
        return <textarea value={valStr} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'number':
        return <input type="number" value={valStr} required={f.required} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'date':
        return <input type="date" value={valStr.slice(0, 10)} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'datetime': {
        const dt = raw ? new Date(String(raw)) : null;
        const v = dt && !Number.isNaN(dt.getTime()) ? dt.toISOString().slice(0, 16) : '';
        return <input type="datetime-local" value={v} onChange={(e) => setField(f.key, e.target.value)} />;
      }
      case 'email':
        return <input type="email" value={valStr} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'url':
        return <input type="url" value={valStr} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'password':
        return <input type="password" value={valStr} placeholder={isNew ? '' : 'Остави празно за непроменета'} onChange={(e) => setField(f.key, e.target.value)} />;
      case 'select': {
        const opts = (f.lookup && lookups[f.lookup]) || [];
        return (
          <select value={valStr} required={f.required} onChange={(e) => setField(f.key, e.target.value)}>
            <option value="">— Избери —</option>
            {opts.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        );
      }
      case 'image':
        return (
          <div>
            <input type="file" accept="image/*" onChange={(e) => onUploadImage(f.key, e.target.files?.[0] || null)} />
            {valStr && <div style={{ marginTop: 6 }}><a href={valStr} target="_blank" rel="noreferrer">🖼️ Тековна слика</a> · <button type="button" className="btn sm" onClick={() => setField(f.key, null)}>Отстрани</button></div>}
          </div>
        );
      case 'document':
        return (
          <div>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
              onChange={(e) => onUploadImage(f.key, e.target.files?.[0] || null)}
            />
            {valStr && <div style={{ marginTop: 6 }}><a href={valStr} target="_blank" rel="noreferrer">📄 Тековен документ</a> · <button type="button" className="btn sm" onClick={() => setField(f.key, null)}>Отстрани</button></div>}
          </div>
        );
      case 'documents': {
        const docs = Array.isArray(raw) ? raw : [];
        return (
          <div>
            <input type="file" multiple onChange={(e) => onUploadDocs(f.key, e.target.files)} />
            <div className="doc-list" style={{ marginTop: 6 }}>
              {docs.map((d, i) => (
                <div key={i}>
                  <a href={d} target="_blank" rel="noreferrer">📄 {d.split('/').pop()}</a>{' '}
                  <button type="button" className="btn sm" onClick={() => setField(f.key, docs.filter((_, idx) => idx !== i))}>×</button>
                </div>
              ))}
            </div>
          </div>
        );
      }
      default:
        return <input type="text" value={valStr} required={f.required} onChange={(e) => setField(f.key, e.target.value)} />;
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
