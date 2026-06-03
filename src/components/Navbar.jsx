import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import ThemeToggle from './ThemeToggle';
import { Bell, Calendar, MessageSquare, X, CheckCheck } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ title }) {
  const { userType } = useAuth();
  const { notifications, markNotificationsAsRead } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.read).length;

  const handleToggle = (e) => {
    e.stopPropagation();
    const next = !isOpen;
    setIsOpen(next);
    if (next && unread > 0) {
      markNotificationsAsRead();
    }
  };

  const handleNotificationClick = (e, notif) => {
    e.stopPropagation();
    setIsOpen(false);
    if (userType === 'barber') {
      if (notif.type === 'message') {
        navigate('/barbeiro/chat');
      } else if (notif.type === 'new_appointment') {
        navigate('/barbeiro/agenda');
      } else {
        navigate('/barbeiro');
      }
    } else if (userType === 'client') {
      if (notif.type === 'message') {
        navigate('/cliente/chat');
      } else if (notif.type === 'cancelled') {
        navigate('/cliente/agendamentos');
      } else {
        navigate('/cliente/agendamentos');
      }
    } else if (userType === 'admin') {
      navigate('/admin');
    }
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'new_appointment': return <Calendar size={16} />;
      case 'message': return <MessageSquare size={16} />;
      case 'cancelled': return <X size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title || 'BarberPro'}</h1>
      <div className="navbar-actions">
        <ThemeToggle />
        <div className="navbar-bell-wrapper" ref={dropdownRef}>
          <button
            className={`btn-icon btn-ghost navbar-bell ${isOpen ? 'active' : ''}`}
            onClick={handleToggle}
            aria-label="Notificações"
            aria-expanded={isOpen}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="notification-dot" aria-label={`${unread} notificações não lidas`} />
            )}
          </button>

          {isOpen && (
            <div
              className="notifications-dropdown animate-scale-in"
              onClick={handleDropdownClick}
              role="dialog"
              aria-label="Painel de notificações"
            >
              <div className="notifications-header">
                <h3>Notificações</h3>
                <div className="notifications-header-actions">
                  {unread > 0 && (
                    <span className="notifications-unread-count">{unread} nova{unread > 1 ? 's' : ''}</span>
                  )}
                  <button
                    className="btn-icon btn-ghost notif-close-btn"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    aria-label="Fechar notificações"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={(e) => handleNotificationClick(e, notif)}
                      type="button"
                    >
                      <div className={`notification-item-icon ${notif.type}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="notification-item-content">
                        <span className="notif-title">{notif.title}</span>
                        <p className="notif-message">{notif.message}</p>
                        <span className="notif-time">{formatTime(notif.timestamp)}</span>
                      </div>
                      {!notif.read && <span className="notif-unread-dot" />}
                    </button>
                  ))
                ) : (
                  <div className="notifications-empty">
                    <CheckCheck size={28} style={{ opacity: 0.3, marginBottom: '8px', color: 'var(--success)' }} />
                    <p>Tudo em dia! Sem notificações.</p>
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
