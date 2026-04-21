import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { publicGet, submitProblem } from '../api/entities';
import { uploadFiles } from '../api/client';

export default function ReportProblem() {
  const { data: types } = useFetch<any[]>(() => publicGet('type-of-problems'));
  const { data: mesta } = useFetch<any[]>(() => publicGet('naseleni-mesta'));
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '',
    typeOfProblemId: '', naselenoMestoId: '', description: '',
  });
  const [picture, setPicture] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = async (file: File | null) => {
    if (!file) { setPicture(null); return; }
    setUploading(true);
    try {
      const r = await uploadFiles([file], false);
      setPicture(r[0].path);
    } catch (e: any) {
      setError(e.message || 'Грешка при прикачување');
    } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending'); setError(null);
    try {
      await submitProblem({
        fullName: form.fullName,
        email: form.email || undefined,
        phoneNumber: form.phoneNumber || undefined,
        typeOfProblemId: form.typeOfProblemId ? Number(form.typeOfProblemId) : null,
        naselenoMestoId: form.naselenoMestoId ? Number(form.naselenoMestoId) : null,
        description: form.description,
        picture,
      });
      setStatus('sent');
      setForm({ fullName: '', email: '', phoneNumber: '', typeOfProblemId: '', naselenoMestoId: '', description: '' });
      setPicture(null);
    } catch (e: any) {
      setError(e.message || 'Грешка');
      setStatus('error');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div className="crumb">Граѓани</div>
          <h1>Пријави проблем</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 720 }}>
            Известете ја општината за било кој проблем во вашата средина — комунален, патна инфраструктура,
            водовод, осветлување или друго. Вашата пријава ќе биде испратена и по е-пошта до надлежната служба.
          </p>
        </div>

        {status === 'sent' && <div className="alert success">Ви благодариме! Вашата пријава е успешно испратена.</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={submit} className="form-grid">
          <div className="row2">
            <div className="field"><label>Име и презиме *</label>
              <input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} /></div>
            <div className="field"><label>Е-маил</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
          </div>
          <div className="row2">
            <div className="field"><label>Телефон</label>
              <input value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} /></div>
            <div className="field"><label>Населено место</label>
              <select value={form.naselenoMestoId} onChange={(e) => update('naselenoMestoId', e.target.value)}>
                <option value="">— Избери —</option>
                {(mesta || []).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Тип на проблем *</label>
            <select required value={form.typeOfProblemId} onChange={(e) => update('typeOfProblemId', e.target.value)}>
              <option value="">— Избери —</option>
              {(types || []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="field"><label>Опис на проблемот *</label>
            <textarea required value={form.description} onChange={(e) => update('description', e.target.value)} /></div>
          <div className="field"><label>Слика (опционо)</label>
            <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || null)} />
            {uploading && <small>Прикачување…</small>}
            {picture && <small style={{ color: 'var(--success)' }}>✓ Прикачено</small>}
          </div>
          <div>
            <button type="submit" className="btn primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Праќање…' : 'Испрати пријава'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
