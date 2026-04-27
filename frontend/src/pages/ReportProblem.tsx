import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { publicGet, submitProblem } from '../api/entities';
import { uploadFiles } from '../api/client';
import Icon from '../components/Icon';

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function ReportProblem() {
  type LookupItem = { id: number; title: string };
  const { data: types } = useFetch<LookupItem[]>(() => publicGet('type-of-problems'));
  const { data: mesta } = useFetch<LookupItem[]>(() => publicGet('naseleni-mesta'));
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Грешка при прикачување');
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Грешка');
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
            водовод, осветлување или друго.
          </p>
        </div>

        {status === 'sent' && <div className="alert success">Ви благодариме! Вашата пријава е успешно испратена.</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="report-layout">
          {/* Left — Form */}
          <form onSubmit={submit} className="form-grid report-form">
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

          {/* Right — Info */}
          <aside className="report-info">
            <div className="report-info-card">
              <h3>Како функционира?</h3>
              <p className="report-info-intro">
                Откако ќе ја испратите пријавата, нашиот тим ја следи следната постапка:
              </p>

              <div className="report-steps">
                <div className="report-step">
                  <div className="report-step-num">1</div>
                  <div className="report-step-body">
                    <strong>Прием на пријавата</strong>
                    <span>Пријавата се евидентира во системот и се доделува уникатен број.</span>
                  </div>
                </div>
                <div className="report-step">
                  <div className="report-step-num">2</div>
                  <div className="report-step-body">
                    <strong>Преглед и категоризација</strong>
                    <span>Надлежниот сектор ја разгледува пријавата и ја категоризира според итноста.</span>
                  </div>
                </div>
                <div className="report-step">
                  <div className="report-step-num">3</div>
                  <div className="report-step-body">
                    <strong>Испраќање на терен</strong>
                    <span>Ако е потребно, се испраќа екипа за увид на теренот.</span>
                  </div>
                </div>
                <div className="report-step">
                  <div className="report-step-num">4</div>
                  <div className="report-step-body">
                    <strong>Решавање на проблемот</strong>
                    <span>Се преземаат соодветни мерки за отстранување на проблемот.</span>
                  </div>
                </div>
                <div className="report-step">
                  <div className="report-step-num">5</div>
                  <div className="report-step-body">
                    <strong>Известување</strong>
                    <span>Ќе бидете известени по е-пошта или телефон за завршената постапка.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-info-card report-highlight">
              <h4><CheckIcon /> Што може да пријавите?</h4>
              <ul>
                <li>Комунални проблеми (отпад, хигиена)</li>
                <li>Патна инфраструктура (шупли, оштетени патеки)</li>
                <li>Водовод и канализација</li>
                <li>Улично осветлување</li>
                <li>Незаконска градба</li>
                <li>Загадување на животната средина</li>
                <li>Оштетена општинска имот</li>
              </ul>
            </div>

           
          </aside>
        </div>
      </div>
    </div>
  );
}
