import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_BARBERSHOPS, MOCK_SERVICES, getInitials, formatPrice } from '../../utils/mockData';
import MapView from '../../components/MapView';
import { Search, MapPin, Star, List, Map, Heart } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './ExploreBarbershops.css';

export default function ExploreBarbershops() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const { favorites, toggleFavorite } = useData();

  const filteredShops = useMemo(() => {
    let result = MOCK_BARBERSHOPS;
    if (onlyFavorites) {
      result = result.filter((shop) => favorites.includes(shop.id));
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((shop) =>
        shop.name.toLowerCase().includes(term)
      );
    }
    return result;
  }, [search, onlyFavorites, favorites]);

  const getCheapestPrice = (shop) => {
    const shopServices = MOCK_SERVICES.filter((s) => shop.services.includes(s.id));
    if (shopServices.length === 0) return null;
    const min = Math.min(...shopServices.map((s) => s.price));
    return min;
  };

  return (
    <div className="page-enter explore-barbershops">
      {/* Search Bar */}
      <div className="explore-search-wrapper animate-fade-in-up">
        <div className="explore-search">
          <Search size={20} className="explore-search-icon" />
          <input
            type="text"
            placeholder="Buscar barbearia..."
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
          {filteredShops.length > 0 ? (
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
                      <span className="rating-value">{shop.rating}</span>
                      <span className="rating-count">({shop.totalReviews} avaliações)</span>
                    </div>
                    <div className="explore-card-address">
                      <MapPin size={14} />
                      <span>{shop.address}</span>
                    </div>
                    <div className="explore-card-footer">
                      <span className="explore-distance-badge">{shop.distance} km</span>
                      {cheapest && (
                        <span className="explore-price-hint">
                          A partir de {formatPrice(cheapest)}
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
              <Search size={32} />
              <p>Nenhuma barbearia encontrada</p>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="explore-map-wrapper animate-fade-in">
          <MapView barbershops={filteredShops} height="calc(100dvh - 200px)" />
        </div>
      )}
    </div>
  );
}
