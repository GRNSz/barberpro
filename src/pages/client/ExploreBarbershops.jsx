import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials, formatPrice } from '../../utils/mockData';
import MapView from '../../components/MapView';
import { Search, MapPin, Star, List, Map, Heart, Store } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './ExploreBarbershops.css';

// Haversine Distance Formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export default function ExploreBarbershops() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(false);
  const { favorites, toggleFavorite, barbershops, fetchBarbershops } = useData();

  // Location States
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  // Refresh barbershops when page is mounted
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchBarbershops();
      setLoading(false);
    };
    load();
  }, [fetchBarbershops]);

  // Request Location permission
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus('success');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Request automatically on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const filteredShops = useMemo(() => {
    let result = barbershops;
    if (onlyFavorites) {
      result = result.filter((shop) => favorites.includes(shop.id));
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((shop) =>
        shop.name.toLowerCase().includes(term) ||
        shop.address?.toLowerCase().includes(term)
      );
    }

    // Map distances if coordinates are available
    let mapped = result.map(shop => {
      if (userCoords && shop.lat && shop.lng) {
        const dist = getDistance(userCoords.lat, userCoords.lng, parseFloat(shop.lat), parseFloat(shop.lng));
        return { ...shop, distance: dist };
      }
      return { ...shop, distance: null };
    });

    // If location is successful, sort by distance ascending
    if (locationStatus === 'success' && userCoords) {
      mapped.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return 0;
      });
    }

    return mapped;
  }, [search, onlyFavorites, favorites, barbershops, userCoords, locationStatus]);

  const getCheapestPrice = (shop) => {
    if (!shop.services || shop.services.length === 0) return null;
    const min = Math.min(...shop.services.map(s => parseFloat(s.price)));
    return isFinite(min) ? min : null;
  };

  return (
    <div className="page-enter explore-barbershops">
      {/* Search Bar */}
      <div className="explore-search-wrapper animate-fade-in-up">
        <div className="explore-search">
          <Search size={20} className="explore-search-icon" />
          <input
            type="text"
            placeholder="Buscar barbearia ou endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="explore-search-input"
          />
        </div>
      </div>

      {/* Geolocation Banner */}
      <div className="location-permission-banner animate-fade-in-up" style={{ marginBottom: '16px', padding: '0 4px' }}>
        {locationStatus === 'idle' && (
          <button className="btn btn-secondary btn-full" onClick={requestLocation} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--border)' }}>
            <MapPin size={18} />
            Usar minha localização para encontrar barbearias próximas
          </button>
        )}
        {locationStatus === 'loading' && (
          <div className="text-muted text-small text-center" style={{ padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            Obtendo localização atual...
          </div>
        )}
        {locationStatus === 'denied' && (
          <div className="text-small text-center" style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ Permissão de localização negada. Exibindo barbearias sem ordenação por distância.</span>
            <button className="btn btn-sm btn-ghost" onClick={requestLocation} style={{ color: '#ef4444', padding: '2px 8px', minHeight: 'auto' }}>Tentar novamente</button>
          </div>
        )}
        {locationStatus === 'success' && (
          <div className="text-small" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px 12px', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📍 Localização ativada. Exibindo barbearias mais próximas primeiro!</span>
            <button className="btn btn-sm btn-ghost" onClick={() => { setLocationStatus('idle'); setUserCoords(null); }} style={{ color: '#10b981', minHeight: 'auto', padding: '2px 8px' }}>Desativar</button>
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="explore-toggle-row animate-fade-in-up">
        <div className="explore-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
            Lista
          </button>
          <button
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <Map size={18} />
            Mapa
          </button>
          <button
            className={`toggle-btn ${onlyFavorites ? 'active' : ''}`}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            style={onlyFavorites ? { background: 'var(--danger)', color: '#fff' } : {}}
          >
            <Heart size={18} fill={onlyFavorites ? '#fff' : 'none'} color={onlyFavorites ? '#fff' : 'currentColor'} />
            Favoritos
          </button>
        </div>
        <span className="explore-results-count">
          {filteredShops.length} {filteredShops.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="explore-list stagger-children">
          {loading ? (
            <div className="empty-state-mini">
              <div className="loading-spinner" style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              <p style={{ marginTop: '1rem' }}>Buscando barbearias...</p>
            </div>
          ) : filteredShops.length > 0 ? (
            filteredShops.map((shop) => {
              const cheapest = getCheapestPrice(shop);
              const isFav = favorites.includes(shop.id);
              return (
                <div
                  key={shop.id}
                  className="explore-card card clickable-card"
                  onClick={() => navigate(`/cliente/barbearia/${shop.id}`)}
                  style={{ position: 'relative' }}
                >
                  <div className="explore-card-avatar avatar avatar-lg avatar-placeholder">
                    {getInitials(shop.name)}
                  </div>
                  <div className="explore-card-body">
                    <h3 className="explore-card-name">{shop.name}</h3>
                    <div className="explore-card-rating">
                      <Star size={14} className="star-filled" />
                      <span className="rating-value">{shop.rating || '5.0'}</span>
                      <span className="rating-count">({shop.total_reviews || 0} avaliações)</span>
                    </div>
                    <div className="explore-card-address">
                      <MapPin size={14} />
                      <span>{shop.address}</span>
                    </div>
                    {shop.distance !== null && (
                      <div className="explore-card-distance" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginTop: '4px' }}>
                        <MapPin size={12} fill="var(--accent-primary)" style={{ opacity: 0.8 }} />
                        <span>
                          {shop.distance < 1
                            ? `${Math.round(shop.distance * 1000)}m de distância`
                            : `${shop.distance.toFixed(1)} km de distância`}
                        </span>
                      </div>
                    )}
                    <div className="explore-card-footer">
                      {cheapest && (
                        <span className="explore-price-hint">
                          A partir de {formatPrice(cheapest)}
                        </span>
                      )}
                      {shop.services?.length > 0 && (
                        <span className="explore-distance-badge">
                          {shop.services.length} serviço{shop.services.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn-icon btn-ghost favorite-card-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(shop.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      color: isFav ? 'var(--danger)' : 'var(--text-muted)',
                      background: 'rgba(var(--bg-card-rgb), 0.8)',
                      borderRadius: '50%',
                      padding: '8px',
                      zIndex: 2,
                    }}
                    aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Heart size={18} fill={isFav ? 'var(--danger)' : 'none'} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty-state-mini">
              <Store size={48} style={{ opacity: 0.3 }} />
              <h3 style={{ marginTop: '1rem' }}>Nenhuma barbearia encontrada</h3>
              <p className="text-small text-muted" style={{ marginTop: '0.5rem' }}>
                {barbershops.length === 0
                  ? 'Nenhuma barbearia cadastrada ainda. Aguarde os barbeiros se registrarem!'
                  : 'Tente outro termo de busca.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="explore-map-wrapper animate-fade-in">
          <MapView 
            barbershops={filteredShops.filter(s => s.lat && s.lng).map(s => ({
              ...s,
              lat: parseFloat(s.lat),
              lng: parseFloat(s.lng),
            }))} 
            userLocation={userCoords ? [userCoords.lat, userCoords.lng] : null}
            height="calc(100dvh - 200px)" 
          />
        </div>
      )}
    </div>
  );
}
