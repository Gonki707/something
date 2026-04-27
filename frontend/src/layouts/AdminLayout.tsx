import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { logout } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { ADMIN_ENTITIES } from '../pages/admin/entitiesConfig';

export default function AdminLayout() {
  const { user, loading, setUser } = useAuth();
  const nav = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div style={{ padding: '2rem' }}><span className="spinner" /> Се вчитува…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="alert error">Немате администраторски пристап.</div>
        <button className="btn" onClick={async () => { await logout(); setUser(null); nav('/admin/login'); }}>
          Одјави се
        </button>
      </div>
    );
  }

  const onLogout = async () => {
    await logout();
    setUser(null);
    nav('/admin/login');
  };

  const grouped: Record<string, string[]> = {
    Содржина: ['odnosi-so-javnost', 'sluzben-glasnik', 'agenda', 'proekti', 'budzet', 'legislativa'],
    Општина: ['vraboteni', 'institucii'],
    Граѓани: ['prijaveni-problemi'],
    Систем: ['admin-users'],
  };

  return (
    <div className="admin-shell">
      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">МР</div>
          <div className="brand-text"><strong>Админ панел</strong><small style={{ color: '#cfd8df' }}>Општина</small></div>
        </div>
        <nav>
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>Контролна табла</NavLink>
          {Object.entries(grouped).map(([group, keys]) => (
            <div key={group}>
              <div className="group-label">{group}</div>
              {keys.map((k) => {
                const ent = ADMIN_ENTITIES[k];
                return (
                  <NavLink key={k} to={`/admin/${k}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                    {ent.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button
              className="mobile-menu-btn"
              style={{ display: 'none' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Мени"
            >
              <span />
              <span />
              <span />
            </button>
            <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
              Најавени како <strong>{user.name}</strong> ({user.email})
            </div>
          </div>
          <button className="btn sm primary" onClick={onLogout}>Одјави се</button>
        </div>
        <Outlet />
      </main>
      {/* Inline style for admin mobile menu button since it needs to show only on mobile */}
      <style>{`
        @media (max-width: 800px) {
          .admin-header .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
