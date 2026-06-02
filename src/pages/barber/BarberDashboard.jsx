import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { MOCK_CLIENTS, formatPrice } from '../../utils/mockData';
import { formatTimeAgo } from '../../utils/helpers';
import AppointmentCard from '../../components/AppointmentCard';
import DailySummary from '../../components/DailySummary';
import Navbar from '../../components/Navbar';
import { CalendarDays, DollarSign, Users, Clock, CalendarPlus, XCircle, MessageSquare, Bell, Bot, Scissors, User } from 'lucide-react';
import './BarberDashboard.css';

const TODAY = '2026-06-02';

const NOTIFICATION_ICONS = {
  new_appointment: CalendarPlus,
  cancelled: XCircle,
  message: MessageSquare,
};

const NOTIFICATION_COLORS = {
  new_appointment: 'success',
  cancelled: 'danger',
  message: 'info',
};

export default function BarberDashboard() {
  const { user } = useAuth();
  const { appointments, notifications } = useData();
  const firstName = user?.name?.split(' ')[0] || 'João';
  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.date === TODAY),
    [appointments]
  );

  const revenueToday = useMemo(
    () =>
      todayAppointments
        .filter((a) => a.status !== 'cancelado')
        .reduce((sum, a) => sum + a.price, 0),
    [todayAppointments]
  );

  const pendingCount = useMemo(
    () => todayAppointments.filter((a) => a.status === 'pendente').length,
    [todayAppointments]
  );

  const recentNotifications = useMemo(
    () =>
      [...notifications]
        .filter((n) => !n.read)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3),
    [notifications]
  );

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: CalendarDays,
      color: 'var(--accent-primary)',
      bg: 'rgba(200, 169, 110, 0.15)',
    },
    {
      label: 'Receita do Dia',
      value: formatPrice(revenueToday),
      icon: DollarSign,
      color: 'var(--success)',
      bg: 'var(--success-bg)',
    },
    {
      label: 'Clientes Ativos',
      value: MOCK_CLIENTS.length,
      icon: Users,
      color: 'var(--info)',
      bg: 'var(--info-bg)',
    },
    {
      label: 'Pendentes',
      value: pendingCount,
      icon: Clock,
      color: 'var(--warning)',
      bg: 'var(--warning-bg)',
    },
  ];

  return (
    <>
      <Navbar title="Dashboard" />
      <div className="page-enter barber-dashboard">
        {/* Welcome */}
        <div className="dashboard-welcome animate-fade-in-up">
          <h1 className="heading-lg">Olá, {firstName}! 👋</h1>
          <p className="text-body">Gerenciamento da barbearia</p>
        </div>

        {/* Daily Summary */}
        <DailySummary />

        {/* Quick Actions */}
        <section className="dashboard-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="heading-md mb-md">Ações Rápidas</h2>
          <div className="quick-actions stagger-children">
            <Link to="/barbeiro/assistente" className="quick-action-card card">
              <div className="quick-action-icon">
                <Bot size={24} />
              </div>
              <div className="quick-action-info">
                <span className="quick-action-label">Assistente IA</span>
                <span className="quick-action-desc">Fale com o BarberBot</span>
              </div>
            </Link>
            <Link to="/barbeiro/agenda" className="quick-action-card card">
              <div className="quick-action-icon">
                <CalendarDays size={24} />
              </div>
              <div className="quick-action-info">
                <span className="quick-action-label">Minha Agenda</span>
                <span className="quick-action-desc">Gerencie seus horários</span>
              </div>
            </Link>
            <Link to="/barbeiro/servicos" className="quick-action-card card">
              <div className="quick-action-icon">
                <Scissors size={24} />
              </div>
              <div className="quick-action-info">
                <span className="quick-action-label">Serviços</span>
                <span className="quick-action-desc">Defina valores e cortes</span>
              </div>
            </Link>
            <Link to="/barbeiro/perfil" className="quick-action-card card">
              <div className="quick-action-icon">
                <User size={24} />
              </div>
              <div className="quick-action-info">
                <span className="quick-action-label">Meu Perfil</span>
                <span className="quick-action-desc">Configure seus dados</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Stats */}
        <div className="dashboard-stats stagger-children">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                  <Icon size={22} />
                </div>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Today's Appointments */}
        <section className="dashboard-section animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="section-header">
            <h2 className="heading-md">
              <CalendarDays size={20} className="section-icon" />
              Agendamentos de Hoje
            </h2>
            <span className="badge badge-accent">{todayAppointments.length}</span>
          </div>
          <div className="dashboard-appointments stagger-children">
            {todayAppointments.length === 0 ? (
              <div className="empty-state">
                <CalendarDays size={48} />
                <h3>Nenhum agendamento hoje</h3>
                <p>Você não possui agendamentos para hoje.</p>
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} showDate={false} />
              ))
            )}
          </div>
        </section>

        {/* Recent Notifications */}
        <section className="dashboard-section animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <div className="section-header">
            <h2 className="heading-md">
              <Bell size={20} className="section-icon" />
              Notificações Recentes
            </h2>
          </div>
          <div className="dashboard-notifications stagger-children">
            {recentNotifications.map((notif) => {
              const Icon = NOTIFICATION_ICONS[notif.type] || Bell;
              const colorClass = NOTIFICATION_COLORS[notif.type] || 'info';
              return (
                <div className="notification-card card" key={notif.id}>
                  <div className={`notification-card-icon notification-icon-${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="notification-card-content">
                    <span className="notification-card-title">{notif.title}</span>
                    <p className="notification-card-message">{notif.message}</p>
                    <span className="notification-card-time">{formatTimeAgo(notif.timestamp)}</span>
                  </div>
                  {!notif.read && <span className="notification-unread-dot" />}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
