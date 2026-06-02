import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Bell } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../utils/mockData';
import './Navbar.css';

export default function Navbar({ title }) {
  const { userType } = useAuth();
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title || 'BarberPro'}</h1>
      <div className="navbar-actions">
        {userType === 'barber' && (
          <button className="btn-icon btn-ghost navbar-bell" aria-label="Notificações">
            <Bell size={20} />
            {unread > 0 && <span className="notification-dot" />}
          </button>
        )}
      </div>
    </header>
  );
}
