import { useState, useMemo } from 'react';
import { MOCK_CLIENTS, MOCK_APPOINTMENTS, getInitials, formatPrice } from '../../utils/mockData';
import { formatDateShort } from '../../utils/helpers';
import Navbar from '../../components/Navbar';
import WhatsAppButton from '../../components/WhatsAppButton';
import { Search, User, Phone, Mail, Calendar, Star, StickyNote, X } from 'lucide-react';
import './ClientDetails.css';

export default function ClientDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientNotes, setClientNotes] = useState(() => {
    const notes = {};
    MOCK_CLIENTS.forEach((c) => {
      notes[c.id] = c.notes;
    });
    return notes;
  });
  const [savedFeedback, setSavedFeedback] = useState(null);

  const filteredClients = useMemo(
    () =>
      MOCK_CLIENTS.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  const selectedClient = useMemo(
    () => MOCK_CLIENTS.find((c) => c.id === selectedClientId),
    [selectedClientId]
  );

  const clientAppointments = useMemo(
    () =>
      selectedClientId
        ? MOCK_APPOINTMENTS.filter((a) => a.clientId === selectedClientId).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )
        : [],
    [selectedClientId]
  );

  const handleSelectClient = (id) => {
    setSelectedClientId((prev) => (prev === id ? null : id));
    setSavedFeedback(null);
  };

  const handleSaveNotes = () => {
    setSavedFeedback(selectedClientId);
    setTimeout(() => setSavedFeedback(null), 2000);
  };

  return (
    <>
      <Navbar title="Clientes" />
      <div className="page-enter client-details-page">
        {/* Search */}
        <div className="client-search-bar animate-fade-in-down">
          <div className="input-with-icon">
            <Search size={18} className="input-icon" />
            <input
              className="input"
              type="text"
              placeholder="Buscar cliente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="client-layout">
          {/* Client List */}
          <div className="client-list stagger-children">
            {filteredClients.length === 0 ? (
              <div className="empty-state">
                <User size={48} />
                <h3>Nenhum cliente encontrado</h3>
                <p>Tente buscar por outro nome.</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`client-card card ${selectedClientId === client.id ? 'client-card-selected' : ''}`}
                  onClick={() => handleSelectClient(client.id)}
                >
                  <div className="client-card-avatar avatar avatar-placeholder avatar-lg">
                    {getInitials(client.name)}
                  </div>
                  <div className="client-card-info">
                    <h3 className="client-card-name">{client.name}</h3>
                    <div className="client-card-meta">
                      <span><Phone size={13} /> {client.phone}</span>
                    </div>
                    <div className="client-card-stats">
                      <span className="badge badge-accent">
                        <Calendar size={12} />
                        {client.totalVisits} visitas
                      </span>
                      <span className="badge badge-info">
                        <Star size={12} />
                        {client.favoriteService}
                      </span>
                    </div>
                  </div>
                  <div className="client-card-last-visit">
                    <span className="text-small">Última visita</span>
                    <span className="client-card-date">{formatDateShort(client.lastVisit)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Client Details Panel */}
          {selectedClient && (
            <div className="client-detail-panel animate-slide-in-right">
              <div className="client-detail-header">
                <div className="client-detail-avatar avatar avatar-placeholder avatar-xl">
                  {getInitials(selectedClient.name)}
                </div>
                <div>
                  <h2 className="heading-md">{selectedClient.name}</h2>
                  <div className="client-detail-contacts">
                    <span><Phone size={14} /> {selectedClient.phone}</span>
                    <span><Mail size={14} /> {selectedClient.email}</span>
                    {selectedClient.whatsapp && (
                      <div className="client-detail-whatsapp" style={{ marginTop: '8px' }}>
                        <WhatsAppButton
                          phone={selectedClient.whatsapp}
                          message={`Olá ${selectedClient.name}! Aqui é da Barbearia do João. Tudo bem?`}
                          label="Enviar WhatsApp"
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-icon btn-ghost client-detail-close"
                  onClick={() => setSelectedClientId(null)}
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Notes */}
              <div className="client-detail-section">
                <h3 className="heading-sm">
                  <StickyNote size={16} className="text-accent" />
                  Observações
                </h3>
                <textarea
                  className="input client-notes-textarea"
                  value={clientNotes[selectedClient.id] || ''}
                  onChange={(e) =>
                    setClientNotes((prev) => ({
                      ...prev,
                      [selectedClient.id]: e.target.value,
                    }))
                  }
                  placeholder="Adicionar observações sobre o cliente..."
                  rows={3}
                />
                <button
                  className={`btn btn-sm ${savedFeedback === selectedClient.id ? 'btn-success-feedback' : 'btn-primary'}`}
                  onClick={handleSaveNotes}
                >
                  {savedFeedback === selectedClient.id ? '✓ Salvo!' : 'Salvar Notas'}
                </button>
              </div>

              {/* Appointment History */}
              <div className="client-detail-section">
                <h3 className="heading-sm">
                  <Calendar size={16} className="text-accent" />
                  Histórico de Agendamentos
                </h3>
                {clientAppointments.length === 0 ? (
                  <p className="text-small">Nenhum agendamento registrado.</p>
                ) : (
                  <div className="client-history-list">
                    {clientAppointments.map((apt) => (
                      <div className="client-history-item" key={apt.id}>
                        <div className="client-history-date">
                          {formatDateShort(apt.date)}
                        </div>
                        <div className="client-history-info">
                          <span className="client-history-service">{apt.service}</span>
                          <span className="client-history-time">{apt.time}</span>
                        </div>
                        <span className="client-history-price">{formatPrice(apt.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
