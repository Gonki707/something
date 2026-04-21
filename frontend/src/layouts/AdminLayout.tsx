import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { getCurrentUser, isLoggedIn, logout } from '../api/auth';
import { ADMIN_ENTITIES } from '../pages/admin/entitiesConfig';

export default function AdminLayout() {
  const nav = useNavigate();
  if (!isLoggedIn()) return <Navigate to="/admin/login" replace />;
  const user = getCurrentUser();

  const onLogout = async () => {
    await logout();
    nav('/admin/login');
  };

  const grouped = {
    Содржина: ['odnosi-so-javnost', 'sluzben-glasnik', 'agenda', 'proekti', 'budzet', 'legislativa'],
    Општина: ['vraboteni', 'institucii'],
    Граѓани: ['prijaveni-problemi'],
    Шифрарници: ['type-objava', 'type-legislativa', 'type-of-problems', 'naseleni-mesta'],
    Систем: ['admin-users'],
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <div className="brand-mark">МР</div>
          <div className="brand-text"><strong>Админ панел</strong><small style={{ color: '#cfd8df' }}>Општина</small></div>
        </div>
        <nav>
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>Контролна табла</NavLink>
          {Object.entries(grouped).map(([group, keys]) => (
            <div key={group}>
              <div className="group-label">{group}</div>
              {keys.map((k) => {
                const ent = ADMIN_ENTITIES[k];
                return (
                  <NavLink key={k} to={`/admin/${k}`} className={({ isActive }) => isActive ? 'active' : ''}>
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
          <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Најавени како <strong>{user?.name}</strong> ({user?.email})</div>
          <button className="btn sm primary" onClick={onLogout}>Одјави се</button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
