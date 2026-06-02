import { useState, useMemo } from 'react';
import { STATUS_MAP } from '../../utils/mockData';
import AppointmentCard from '../../components/AppointmentCard';
import { CalendarX2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import './MyAppointments.css';

export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState('proximos');
  const { appointments } = useData();
  const { user } = useAuth();

  const clientAppointments = useMemo(() => {
    const clientId = user?.uid || 'client-001';
    return appointments.filter((apt) => apt.clientId === clientId);
  }, [appointments, user]);

  const upcoming = useMemo(
    () =>
      clientAppointments.filter(
        (apt) => apt.status === 'confirmado' || apt.status === 'pendente'
      ),
    [clientAppointments]
  );

  const history = useMemo(
    () =>
      clientAppointments.filter(
        (apt) => apt.status === 'concluído' || apt.status === 'cancelado'
      ),
    [clientAppointments]
  );

  const displayList = activeTab === 'proximos' ? upcoming : history;

  return (
    <div className="page-enter my-appointments">
      {/* Tabs */}
      <div className="tabs my-appointments-tabs">
        <button
          className={`tab ${activeTab === 'proximos' ? 'active' : ''}`}
          onClick={() => setActiveTab('proximos')}
        >
          Próximos
          {upcoming.length > 0 && (
            <span className="tab-count">{upcoming.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'historico' ? 'active' : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          Histórico
        </button>
      </div>

      {/* List */}
      {displayList.length > 0 ? (
        <div className="appointments-list stagger-children">
          {displayList.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <CalendarX2 size={56} />
          <h3>
            {activeTab === 'proximos'
              ? 'Nenhum agendamento futuro'
              : 'Nenhum histórico encontrado'}
          </h3>
          <p>
            {activeTab === 'proximos'
              ? 'Você ainda não possui agendamentos. Que tal marcar um horário?'
              : 'Seus agendamentos concluídos ou cancelados aparecerão aqui.'}
          </p>
        </div>
      )}
    </div>
  );
}
