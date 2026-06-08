import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Bell, Calendar, MessageSquare, X, Trash2, CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Notifications() {
  const { user, userType } = useAuth();
  const { notifications, markNotificationsAsRead, clearNotifications } = useData();
  const navigate = useNavigate();

  // Mark notifications as read when opening the page
  useEffect(() => {
    if (notifications.some(n => !n.read)) {
      markNotificationsAsRead();
    }
  }, [notifications, markNotificationsAsRead]);

  const handleNotificationClick = (notif) => {
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

  const getIcon = (type) => {
    switch (type) {
      case 'new_appointment':
        return <Calendar size={20} />;
      case 'message':
        return <MessageSquare size={20} />;
      case 'cancelled':
        return <X size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const formatTimeAgo = (ts) => {
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <div className="page-enter" style={{ padding: 'var(--space-lg) 0', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={28} className="text-accent" />
            Notificações
          </h1>
          <p className="text-body text-muted">Histórico completo de alertas e mensagens recebidas</p>
        </div>
        {notifications.length > 0 && (
          <button 
            className="btn btn-secondary" 
            onClick={clearNotifications}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)' }}
          >
            <Trash2 size={16} />
            Limpar Histórico
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {notifications.length > 0 ? (
          [...notifications]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`card clickable-card ${!notif.read ? 'unread-card' : ''}`}
                style={{
                  display: 'flex',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  alignItems: 'flex-start',
                  position: 'relative',
                  borderLeft: !notif.read ? '4px solid var(--accent-primary)' : '1px solid var(--border)',
                  background: !notif.read ? 'rgba(var(--accent-primary-rgb), 0.03)' : 'var(--bg-card)'
                }}
              >
                {/* Icon wrapper */}
                <div
                  className={`notification-icon-bg ${notif.type}`}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: notif.type === 'new_appointment' ? 'rgba(16, 185, 129, 0.15)' :
                                notif.type === 'message' ? 'rgba(59, 130, 246, 0.15)' :
                                'rgba(239, 68, 68, 0.15)',
                    color: notif.type === 'new_appointment' ? '#10b981' :
                           notif.type === 'message' ? '#3b82f6' :
                           '#ef4444'
                  }}
                >
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {notif.title}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <Clock size={12} />
                    <span>{formatTimeAgo(notif.timestamp)}</span>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notif.read && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--accent-primary)',
                      position: 'absolute',
                      top: '20px',
                      right: '20px'
                    }}
                  />
                )}
              </div>
            ))
        ) : (
          <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <CheckCheck size={48} style={{ opacity: 0.3, marginBottom: '16px', color: '#10b981', margin: '0 auto' }} />
            <h3 className="heading-md">Nenhuma notificação</h3>
            <p className="text-body text-muted" style={{ maxWidth: '400px', margin: '8px auto 0' }}>
              Tudo limpo por aqui! Você receberá atualizações quando novos agendamentos forem solicitados ou novas mensagens chegarem no chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
