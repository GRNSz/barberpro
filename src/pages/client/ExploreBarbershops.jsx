import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitials, formatPrice } from '../../utils/mockData';
import MapView from '../../components/MapView';
import { Search, MapPin, Star, List, Map, Heart, Store } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './ExploreBarbershops.css';

export default function ExploreBarbershops() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(false);
  const { favorites, toggleFavorite, barbershops, fetchBarbershops } = useData();

  // Refresh barbershops when page is mounted
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchBarbershops();
      setLoading(false);
    };
    load();
  }, [fetchBarbershops]);

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
    return result;
  }, [search, onlyFavorites, favorites, barbershops]);

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
          <MapView barbershops={filteredShops.filter(s => s.lat && s.lng).map(s => ({
            ...s,
            lat: parseFloat(s.lat),
            lng: parseFloat(s.lng),
          }))} height="calc(100dvh - 200px)" />
        </div>
      )}
    </div>
  );
}
