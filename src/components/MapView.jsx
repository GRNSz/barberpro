import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const goldIcon = new Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" fill="none">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#C8A96E"/>
      <circle cx="16" cy="15" r="7" fill="#1A1A2E"/>
      <text x="16" y="19" text-anchor="middle" fill="#C8A96E" font-size="12" font-weight="bold">✂</text>
    </svg>
  `),
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
});

const userIcon = new Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" fill="#3b82f6" fill-opacity="0.3" stroke="#3b82f6" stroke-width="2"/>
      <circle cx="16" cy="16" r="5" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});


export default function MapView({ barbershops, center, userLocation, zoom = 14, height = '400px' }) {
  const navigate = useNavigate();
  const mapCenter = userLocation || center || [-23.5505, -46.6333];

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        key={mapCenter.join(',')}
        center={mapCenter}
        zoom={zoom}
        className="leaflet-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <strong>Você está aqui</strong>
            </Popup>
          </Marker>
        )}
        {barbershops.map((shop) => (
          <Marker key={shop.id} position={[shop.lat, shop.lng]} icon={goldIcon}>
            <Popup className="map-popup">
              <div className="map-popup-content">
                <h3 className="map-popup-name">{shop.name}</h3>
                <div className="map-popup-rating">
                  <Star size={14} fill="#C8A96E" color="#C8A96E" />
                  <span>{shop.rating}</span>
                  <span className="map-popup-reviews">({shop.totalReviews || shop.total_reviews || 0})</span>
                </div>
                <div className="map-popup-address">
                  <MapPin size={12} />
                  <span>{shop.address}</span>
                </div>
                <button
                  className="map-popup-btn"
                  onClick={() => navigate(`/cliente/barbearia/${shop.id}`)}
                >
                  Ver detalhes <ChevronRight size={14} />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
