import { Link } from 'react-router-dom';
import { ADMIN_ENTITIES } from './entitiesConfig';

export default function Dashboard() {
  return (
    <div>
      <h1>Контролна табла</h1>
      <p style={{ color: 'var(--muted)' }}>Изберете категорија за да управувате со записите.</p>
      <div className="quick-grid">
        {Object.entries(ADMIN_ENTITIES).map(([key, ent]) => (
          <Link key={key} to={`/admin/${key}`} className="quick">
            <strong>{ent.label}</strong>
            <small>{ent.description || 'CRUD операции'}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
