import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import ThemeToggle from './ThemeToggle';
import { Bell, Calendar, MessageSquare, Check, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ title }) {
  const { userType } = useAuth();
  const { notifications, markNotificationsAsRead } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unread > 0) {
      markNotificationsAsRead();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'new_appointment':
        return <Calendar size={16} />;
      case 'message':
        return <MessageSquare size={16} />;
      case 'cancelled':
        return <X size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title || 'BarberPro'}</h1>
      <div className="navbar-actions">
        <div className="navbar-bell-wrapper" ref={dropdownRef}>
          <button
            className={`btn-icon btn-ghost navbar-bell ${isOpen ? 'active' : ''}`}
            onClick={handleToggle}
            aria-label="Notificações"
          >
            <Bell size={20} />
            {unread > 0 && <span className="notification-dot" />}
          </button>

          {isOpen && (
            <div className="notifications-dropdown card animate-scale-in">
              <div className="notifications-header">
                <h3>Notificações</h3>
                <span className="notifications-unread-count">{unread} novas</span>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                      <div className={`notification-item-icon ${notif.type}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="notification-item-content">
                        <span className="notif-title">{notif.title}</span>
                        <p className="notif-message text-muted">{notif.message}</p>
                        <span className="notif-time text-small text-muted">
                          {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notifications-empty">
                    <Bell size={28} className="text-muted" style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p className="text-muted text-small">Nenhuma notificação por enquanto.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
