import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MOCK_BARBERSHOPS, getInitials } from '../../utils/mockData';
import { formatDate } from '../../utils/helpers';
import AppointmentCard from '../../components/AppointmentCard';
import { useData } from '../../contexts/DataContext';
import { useState, useMemo } from 'react';
import { Calendar, Clock, MessageCircle, Star, MapPin, Scissors, Heart, Sparkles } from 'lucide-react';
import './ClientDashboard.css';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { appointments, favorites, googleCalendarSynced, syncGoogleCalendar, loyaltyCuts } = useData();
  const clientId = user?.uid || 'client-001';
 
  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (apt) =>
        apt.clientId === clientId &&
        (apt.status === 'confirmado' || apt.status === 'pendente') &&
        new Date(apt.date) >= new Date(new Date().toISOString().split('T')[0])
    );
  }, [appointments, clientId]);

  const favoriteBarbershops = useMemo(() => {
    return MOCK_BARBERSHOPS.filter((shop) => favorites.includes(shop.id));
  }, [favorites]);
 
  const firstName = user?.name?.split(' ')[0] || 'Cliente';

  const quickActions = [
    {
      label: 'Agendar Corte',
      icon: <Scissors size={24} />,
      to: '/cliente/agendar',
      description: 'Escolha serviço, data e horário',
    },
    {
      label: 'Explorar',
      icon: <MapPin size={24} />,
      to: '/cliente/explorar',
      description: 'Barbearias próximas',
    },
    {
      label: 'Meus Horários',
      icon: <Calendar size={24} />,
      to: '/cliente/agendamentos',
      description: 'Veja seus agendamentos',
    },
    {
      label: 'Chat',
      icon: <MessageCircle size={24} />,
      to: '/cliente/chat',
      description: 'Fale com a barbearia',
    },
  ];

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<Star key={i} size={16} className="star-filled" />);
      } else if (i === full && hasHalf) {
        stars.push(<Star key={i} size={16} className="star-half" />);
      } else {
        stars.push(<Star key={i} size={16} className="star-empty" />);
      }
    }
    return stars;
  };

  // Gamification: Loyalty Card Stamps Calculation
  const currentStamps = loyaltyCuts % 10;
  const isRewardReady = loyaltyCuts > 0 && currentStamps === 0;
  const stamps = [];
  for (let i = 1; i <= 10; i++) {
    const isStamped = i <= currentStamps || (isRewardReady && i === 10);
    stamps.push(
      <div key={i} className={`loyalty-stamp ${isStamped ? 'stamped' : ''}`}>
        {isStamped ? '💈' : i}
      </div>
    );
  }

  return (
    <div className="page-enter client-dashboard">
      {/* Welcome Section */}
      <section className="dashboard-welcome animate-fade-in-up">
        <div className="welcome-content">
          <span className="welcome-greeting">Olá,</span>
          <h2 className="welcome-name">{firstName} 👋</h2>
          <p className="welcome-subtitle">O que deseja fazer hoje?</p>
        </div>
        <div className="welcome-avatar avatar avatar-xl avatar-placeholder">
          {getInitials(user?.name || 'C')}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <div className="quick-actions stagger-children">
          {quickActions.map((action) => (
            <Link to={action.to} key={action.label} className="quick-action-card card">
              <div className="quick-action-icon">{action.icon}</div>
              <div className="quick-action-info">
                <span className="quick-action-label">{action.label}</span>
                <span className="quick-action-desc">{action.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo & Sync Section */}
      <section className="dashboard-section promo-grid-section">
        <div className="dashboard-promo-grid">
          {/* Google Calendar Sync */}
          <div className={`promo-card sync-card card ${googleCalendarSynced ? 'synced' : ''}`}>
            <div className="promo-card-badge">
              <Calendar size={12} />
              <span>Google Agenda</span>
            </div>
            <h3 className="promo-card-title">Sincronização Ativa</h3>
            <p className="promo-card-desc text-muted">
              {googleCalendarSynced
                ? 'Seus agendamentos do BarberPro são integrados automaticamente na sua conta do Google em tempo real.'
                : 'Mantenha seus agendamentos sincronizados com a agenda do seu celular para nunca perder um horário.'}
            </p>
            {!googleCalendarSynced ? (
              <button className="btn btn-primary btn-sm promo-btn" onClick={syncGoogleCalendar}>
                Sincronizar Conta
              </button>
            ) : (
              <span className="promo-status-badge synced">
                ✓ Sincronizado
              </span>
            )}
          </div>

          {/* Blog Promo */}
          <div className="promo-card blog-promo-card card">
            <div className="promo-card-badge">
              <Sparkles size={12} />
              <span>Blog BarberPro</span>
            </div>
            <h3 className="promo-card-title">Segredos do Cabelo</h3>
            <p className="promo-card-desc text-muted">
              Veja dicas exclusivas de lavagem para cabelos oleosos, combate à queda capilar e escolha do melhor finalizador.
            </p>
            <Link to="/cliente/blog" className="btn btn-secondary btn-sm promo-btn">
              Acessar Dicas
            </Link>
          </div>
        </div>
      </section>

      {/* Gamification - Loyalty Card */}
      <section className="dashboard-section loyalty-section animate-fade-in-up">
        <div className="loyalty-card card">
          <div className="loyalty-header">
            <div>
              <span className="loyalty-badge">
                ⭐ Cartão Fidelidade
              </span>
              <h3 className="loyalty-title">BarberClub Rewards</h3>
            </div>
            <div className="loyalty-progress-text">
              <span className="font-bold text-accent">{currentStamps === 0 && loyaltyCuts > 0 ? 10 : currentStamps}</span>/10 cortes
            </div>
          </div>
          
          <p className="loyalty-desc text-muted">
            Complete 10 cortes de cabelo ou barba e ganhe o próximo totalmente de graça!
          </p>
          
          <div className="loyalty-stamps-grid">
            {stamps}
          </div>

          {isRewardReady && (
            <div className="loyalty-reward-box animate-scale-in">
              <div className="reward-icon">🎁</div>
              <div className="reward-info">
                <span className="reward-congrats">Parabéns! Recompensa Liberada!</span>
                <span className="reward-coupon">Apresente o código: <strong className="text-gradient">CORTEGRATIS10</strong> no balcão.</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Appointments */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="heading-md">Próximos Agendamentos</h2>
          <Link to="/cliente/agendamentos" className="section-link">
            Ver todos
          </Link>
        </div>
        {upcomingAppointments.length > 0 ? (
          <div className="appointments-list stagger-children">
            {upcomingAppointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        ) : (
          <div className="empty-state-mini">
            <Calendar size={32} />
            <p>Nenhum agendamento próximo</p>
            <Link to="/cliente/agendar" className="btn btn-primary btn-sm">
              Agendar agora
            </Link>
          </div>
        )}
      </section>

      {/* Favorite Barbershops */}
      {favoriteBarbershops.length > 0 && (
        <section className="dashboard-section animate-fade-in-up">
          <div className="section-header">
            <h2 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={20} fill="var(--danger)" color="var(--danger)" />
              Minhas Favoritas
            </h2>
            <Link to="/cliente/explorar" className="section-link">
              Ver todas
            </Link>
          </div>
          <div className="barber-info-list stagger-children">
            {favoriteBarbershops.map((shop) => (
              <Link to={`/cliente/barbearia/${shop.id}`} key={shop.id} className="barber-info-card card clickable-card">
                <div className="barber-info-header">
                  <div className="barber-info-avatar avatar avatar-lg avatar-placeholder">
                    {getInitials(shop.name)}
                  </div>
                  <div className="barber-info-details">
                    <h3 className="barber-info-name">{shop.name}</h3>
                    <div className="barber-info-rating">
                      <Star size={14} className="star-filled" fill="#C8A96E" color="#C8A96E" />
                      <span className="rating-value">{shop.rating}</span>
                      <span className="rating-count">({shop.totalReviews})</span>
                    </div>
                  </div>
                  <span className="distance-badge">{shop.distance} km</span>
                </div>
                <div className="barber-info-address">
                  <MapPin size={14} />
                  <span>{shop.address}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Barbershop Info */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="heading-md">Barbearias Próximas</h2>
          <Link to="/cliente/explorar" className="section-link">
            Ver todas
          </Link>
        </div>
        <div className="barber-info-list stagger-children">
          {MOCK_BARBERSHOPS.slice(0, 3).map((shop) => (
            <Link to={`/cliente/barbearia/${shop.id}`} key={shop.id} className="barber-info-card card clickable-card">
              <div className="barber-info-header">
                <div className="barber-info-avatar avatar avatar-lg avatar-placeholder">
                  {getInitials(shop.name)}
                </div>
                <div className="barber-info-details">
                  <h3 className="barber-info-name">{shop.name}</h3>
                  <div className="barber-info-rating">
                    <Star size={14} className="star-filled" fill="#C8A96E" color="#C8A96E" />
                    <span className="rating-value">{shop.rating}</span>
                    <span className="rating-count">({shop.totalReviews})</span>
                  </div>
                </div>
                <span className="distance-badge">{shop.distance} km</span>
              </div>
              <div className="barber-info-address">
                <MapPin size={14} />
                <span>{shop.address}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
