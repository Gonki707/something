import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, isLoggedIn } from '../../api/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  if (isLoggedIn()) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await login(email, password);
      nav('/admin');
    } catch (e: any) {
      setError(e.message || 'Грешка при најава');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand" style={{ marginBottom: '1.5rem' }}>
          <div className="brand-mark">МР</div>
          <div className="brand-text">
            <strong>Админ панел</strong>
            <small>Општина Маврово и Ростуше</small>
          </div>
        </div>
        <h1>Најава</h1>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="form-grid">
          <div className="field"><label>Е-маил</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label>Лозинка</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Најавување…' : 'Најави се'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '.85rem' }}>
          Стандардни податоци за прв пристап: <code>admin@mavrovo.gov.mk</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  );
}
