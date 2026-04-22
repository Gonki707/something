import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function FloatingReportButton() {
  return (
    <Link to="/prijavi-problem" className="fab-report" aria-label="Пријави проблем">
      <Icon name="alert" size={20} />
      <span className="fab-label">Пријави проблем</span>
    </Link>
  );
}
