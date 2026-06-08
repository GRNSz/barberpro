import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WHATSAPP_TEMPLATES, getInitials, formatPrice } from '../../utils/mockData';
import MapView from '../../components/MapView';
import WhatsAppButton from '../../components/WhatsAppButton';
import { Star, MapPin, Phone, Clock, ArrowLeft, Calendar, Heart, Loader } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './BarbershopDetail.css';

export default function BarbershopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useData();
  const isFav = favorites.includes(id);

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/barbershops/${id}`);
        if (!res.ok) throw new Error('Barbearia não encontrada');
        const data = await res.json();
        setShop(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  if (loading) {
    return (
      <div className="page-enter barbershop-detail-error">
        <div className="empty-state">
          <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Carregando barbearia...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
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

  const shopServices = shop.services || [];
  const whatsappMessage = WHATSAPP_TEMPLATES.contact(shop.name);
  const lat = parseFloat(shop.lat);
  const lng = parseFloat(shop.lng);
  const hasLocation = !isNaN(lat) && !isNaN(lng);

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<Star key={i} size={16} fill="#C8A96E" color="#C8A96E" />);
      else if (i === full && hasHalf) stars.push(<Star key={i} size={16} fill="#C8A96E" color="#C8A96E" />);
      else stars.push(<Star key={i} size={16} color="#A0A0A0" />);
    }
    return stars;
  };

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
              <div className="stars-row">{renderStars(shop.rating || 5)}</div>
              <span className="rating-value">{shop.rating || '5.0'}</span>
              <span className="rating-count">({shop.total_reviews || 0} avaliações)</span>
            </div>
            {shop.description && <p className="detail-desc">{shop.description}</p>}
          </div>
        </div>
      </section>

      {/* Map View */}
      {hasLocation && (
        <section className="detail-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="detail-section-title">Localização</h2>
          <div className="detail-map-wrapper">
            <MapView barbershops={[{ ...shop, lat, lng }]} center={[lat, lng]} zoom={16} height="200px" />
          </div>
          <div className="detail-address-row">
            <MapPin size={18} className="detail-icon" />
            <span>{shop.address}</span>
          </div>
        </section>
      )}

      {!hasLocation && shop.address && (
        <section className="detail-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="detail-section-title">Endereço</h2>
          <div className="detail-address-row" style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
            <MapPin size={18} className="detail-icon" />
            <span>{shop.address}</span>
          </div>
        </section>
      )}

      {/* Services List */}
      <section className="detail-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="detail-section-title">Serviços Disponíveis</h2>
        {shopServices.length === 0 ? (
          <div className="empty-state-mini">
            <p className="text-small text-muted">Nenhum serviço cadastrado ainda.</p>
          </div>
        ) : (
          <div className="detail-services stagger-children">
            {shopServices.map((svc) => (
              <div key={svc.id} className="detail-service-card card">
                <div className="service-icon">{svc.icon || '✂️'}</div>
                <div className="service-info">
                  <h3 className="service-name">{svc.name}</h3>
                  {svc.description && <span className="service-desc">{svc.description}</span>}
                  <div className="service-meta">
                    <span className="service-price">{formatPrice(parseFloat(svc.price))}</span>
                    {svc.duration && (
                      <span className="service-duration">
                        <Clock size={12} /> {svc.duration} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="detail-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="detail-section-title">Contato</h2>
        <div className="contact-card card">
          {shop.phone && (
            <div className="contact-item">
              <Phone size={18} className="detail-icon" />
              <div>
                <span className="contact-label">Telefone</span>
                <span className="contact-value">{shop.phone}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Sticky Action Bar */}
      <div className="detail-action-bar">
        {shop.whatsapp && (
          <WhatsAppButton
            phone={shop.whatsapp}
            message={whatsappMessage}
            label="Enviar Mensagem"
            variant="outline"
            fullWidth={true}
          />
        )}
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
