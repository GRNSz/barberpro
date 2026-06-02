import { getInitials, STATUS_MAP, formatPrice, MOCK_CLIENTS } from '../utils/mockData';
import { formatDate } from '../utils/helpers';
import { Clock, User, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useState } from 'react';
import './AppointmentCard.css';

export default function AppointmentCard({ appointment, showDate = true, onClick }) {
  const status = STATUS_MAP[appointment.status] || { label: appointment.status, color: 'info' };
  const { userType } = useAuth();
  const { googleCalendarSynced, updateAppointmentNotes } = useData();
  const [expanded, setExpanded] = useState(false);

  const client = userType === 'barber' ? MOCK_CLIENTS.find((c) => c.id === appointment.clientId) : null;
  const whatsappNumber = client?.whatsapp;

  const [localNotes, setLocalNotes] = useState(
    userType === 'barber' ? (appointment.barberNotes || '') : (appointment.clientNotes || '')
  );

  const handleSaveNotes = (e) => {
    e.stopPropagation();
    updateAppointmentNotes(appointment.id, localNotes, userType);
    alert('Anotação salva com sucesso!');
  };

  const isGoogleSynced = appointment.googleSynced || googleCalendarSynced;

  return (
    <div className={`appointment-card-container ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="appointment-card-main">
        <div className="appointment-card-left">
          <div className="avatar avatar-placeholder appointment-avatar">
            {getInitials(appointment.clientName)}
          </div>
        </div>
        <div className="appointment-card-center">
          <div className="appointment-card-name" style={{ display: 'flex', alignItems: 'center' }}>
            {appointment.clientName}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="appointment-whatsapp-link"
                style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center', marginLeft: '8px' }}
                title="Contato WhatsApp"
                aria-label="Contato WhatsApp"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            )}
          </div>
          <div className="appointment-card-service">{appointment.service}</div>
          <div className="appointment-card-time">
            <Clock size={14} />
            <span>{appointment.time}</span>
            {showDate && (
              <>
                <span className="appointment-card-dot">·</span>
                <span>{formatDate(appointment.date)}</span>
              </>
            )}
          </div>
        </div>
        <div className="appointment-card-right">
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {isGoogleSynced && (
              <span className="badge badge-info" style={{ fontSize: '0.6875rem', background: 'rgba(66, 133, 244, 0.15)', color: '#4285F4', border: '1px solid rgba(66, 133, 244, 0.3)', display: 'inline-flex', padding: '2px 6px' }} title="Sincronizado com o Google Agenda">
                Google
              </span>
            )}
            <span className={`badge badge-${status.color}`}>{status.label}</span>
          </div>
          <span className="appointment-card-price">{formatPrice(appointment.price)}</span>
        </div>
      </div>

      {/* Expand/Collapse Toggle Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: '2px 8px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? '▲ Ocultar Anotações' : '▼ Ver Anotações'}
        </button>
      </div>

      {/* Expanded Notes Section */}
      {expanded && (
        <div className="appointment-card-expanded animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          <div className="notes-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              {userType === 'barber' ? 'Minhas Anotações do Barbeiro' : 'Minhas Anotações do Cliente'}
            </label>
            <textarea
              className="input"
              style={{ fontSize: '0.8125rem', padding: '8px', minHeight: '60px', width: '100%', resize: 'vertical' }}
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="Ex: Lateral na tesoura, degradê navalhado, hidratar..."
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {userType === 'barber' && appointment.clientNotes && (
                  <span>📝 Anotação do Cliente: <i>"{appointment.clientNotes}"</i></span>
                )}
                {userType === 'client' && appointment.barberNotes && (
                  <span>📝 Nota do Barbeiro: <i>"{appointment.barberNotes}"</i></span>
                )}
              </div>
              <button className="btn btn-sm btn-primary" onClick={handleSaveNotes} style={{ padding: '4px 12px' }}>
                Salvar Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
