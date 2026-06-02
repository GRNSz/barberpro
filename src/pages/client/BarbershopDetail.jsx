import { useParams, useNavigate } from 'react-router-dom';
import { getBarbershopById, MOCK_SERVICES, WHATSAPP_TEMPLATES, getInitials, formatPrice } from '../../utils/mockData';
import MapView from '../../components/MapView';
import WhatsAppButton from '../../components/WhatsAppButton';
import { Star, MapPin, Phone, Clock, ArrowLeft, Calendar, Heart } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './BarbershopDetail.css';

export default function BarbershopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const shop = getBarbershopById(id);
  const { favorites, toggleFavorite } = useData();
  const isFav = favorites.includes(id);

  if (!shop) {
    return (
      <div className="page-enter barbershop-detail-error">
        <button className="btn-icon btn-ghost back-btn" onClick={() => navigate('/cliente/explorar')}>
          <ArrowLeft size={20} />
        </button>
        <div className="empty-state">
          <h2>Barbearia não encontrada</h2>
          <p>A barbearia que você procura não está disponível no momento.</p>
          <button className="btn btn-primary" onClick={() => navigate('/cliente/explorar')}>
            Voltar para Explorar
          </button>
        </div>
      </div>
    );
  }

  // Filter services offered by this shop
  const shopServices = MOCK_SERVICES.filter((svc) => shop.services.includes(svc.id) && svc.active);

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<Star key={i} size={16} className="star-filled" fill="#C8A96E" color="#C8A96E" />);
      } else if (i === full && hasHalf) {
        stars.push(<Star key={i} size={16} className="star-half" fill="#C8A96E" color="#C8A96E" />);
      } else {
        stars.push(<Star key={i} size={16} className="star-empty" color="#A0A0A0" />);
      }
    }
    return stars;
  };

  const translateDay = (dayKey) => {
    const days = {
      seg: 'Segunda-feira',
      ter: 'Terça-feira',
      qua: 'Quarta-feira',
      qui: 'Quinta-feira',
      sex: 'Sexta-feira',
      sab: 'Sábado',
      dom: 'Domingo',
    };
    return days[dayKey] || dayKey;
  };

  const whatsappMessage = WHATSAPP_TEMPLATES.contact(shop.name);

  return (
    <div className="page-enter barbershop-detail">
      {/* Top Navigation */}
      <div className="detail-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-icon btn-ghost back-btn" onClick={() => navigate('/cliente/explorar')} aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
          <span className="detail-nav-title">Detalhes da Barbearia</span>
        </div>
        <button
          className="btn-icon btn-ghost"
          onClick={() => toggleFavorite(shop.id)}
          aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          style={{ color: isFav ? 'var(--danger)' : 'var(--text-muted)' }}
        >
          <Heart size={22} fill={isFav ? 'var(--danger)' : 'none'} />
        </button>
      </div>

      {/* Header Info */}
      <section className="detail-header card animate-fade-in-up">
        <div className="detail-header-main">
          <div className="detail-avatar avatar avatar-xl avatar-placeholder">
            {getInitials(shop.name)}
          </div>
          <div className="detail-info">
            <h1 className="detail-name">{shop.name}</h1>
            <div className="detail-rating-row">
              <div className="stars-row">{renderStars(shop.rating)}</div>
              <span className="rating-value">{shop.rating}</span>
              <span className="rating-count">({shop.totalReviews} avaliações)</span>
            </div>
            <p className="detail-desc">{shop.description}</p>
          </div>
        </div>
      </section>

      {/* Map View */}
      <section className="detail-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="detail-section-title">Localização</h2>
        <div className="detail-map-wrapper">
          <MapView barbershops={[shop]} center={[shop.lat, shop.lng]} zoom={16} height="200px" />
        </div>
        <div className="detail-address-row">
          <MapPin size={18} className="detail-icon" />
          <span>{shop.address}</span>
        </div>
      </section>

      {/* Services List */}
      <section className="detail-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="detail-section-title">Serviços Disponíveis</h2>
        <div className="detail-services stagger-children">
          {shopServices.map((svc) => (
            <div key={svc.id} className="detail-service-card card">
              <div className="service-icon">{svc.icon}</div>
              <div className="service-info">
                <h3 className="service-name">{svc.name}</h3>
                <span className="service-desc">{svc.description}</span>
                <div className="service-meta">
                  <span className="service-price">{formatPrice(svc.price)}</span>
                  <span className="service-duration">
                    <Clock size={12} /> {svc.duration} min
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Working Hours & Contact */}
      <div className="detail-two-col animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <section className="detail-section">
          <h2 className="detail-section-title">Horário de Funcionamento</h2>
          <div className="working-hours-card card">
            {Object.entries(shop.workingHours).map(([day, hours]) => (
              <div key={day} className="hours-row">
                <span className="hours-day">{translateDay(day)}</span>
                <span className={`hours-time ${!hours ? 'closed' : ''}`}>
                  {hours ? `${hours.open} – ${hours.close}` : 'Fechado'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <h2 className="detail-section-title">Contato</h2>
          <div className="contact-card card">
            <div className="contact-item">
              <Phone size={18} className="detail-icon" />
              <div>
                <span className="contact-label">Telefone</span>
                <span className="contact-value">{shop.phone}</span>
              </div>
            </div>
            <div className="contact-item">
              <Clock size={18} className="detail-icon" />
              <div>
                <span className="contact-label">PWA Oficial</span>
                <span className="contact-value">Funcionando 24h</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="detail-action-bar">
        <WhatsAppButton
          phone={shop.whatsapp}
          message={whatsappMessage}
          label="Enviar Mensagem"
          variant="outline"
          fullWidth={true}
        />
        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={() => navigate(`/cliente/agendar?barbershopId=${shop.id}`)}
        >
          <Calendar size={18} />
          Agendar Aqui
        </button>
      </div>
    </div>
  );
}
