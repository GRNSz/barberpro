import { useState, useMemo } from 'react';
import { MOCK_APPOINTMENTS, STATUS_MAP } from '../../utils/mockData';
import { formatDate, getDayOfWeekLabel } from '../../utils/helpers';
import AppointmentCard from '../../components/AppointmentCard';
import Navbar from '../../components/Navbar';
import { ChevronLeft, ChevronRight, Calendar, Check, X } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../../contexts/DataContext';
import './ManageSchedule.css';

const BASE_DATE = new Date().toISOString().split('T')[0];

function generateWeekDays(startDateStr) {
  const start = parseISO(startDateStr);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayNum: format(d, 'dd'),
      dayLabel: format(d, 'EEE', { locale: ptBR }),
    };
  });
}

export default function ManageSchedule() {
  const [selectedDate, setSelectedDate] = useState(BASE_DATE);
  const [weekStart, setWeekStart] = useState(BASE_DATE);
  const { appointments, confirmAppointment, cancelAppointment } = useData();

  const weekDays = useMemo(() => generateWeekDays(weekStart), [weekStart]);

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, selectedDate]
  );

  const countForDate = (dateStr) =>
    appointments.filter((a) => a.date === dateStr).length;

  const handlePrevWeek = () => {
    const prev = addDays(parseISO(weekStart), -7);
    const prevStr = format(prev, 'yyyy-MM-dd');
    setWeekStart(prevStr);
    setSelectedDate(prevStr);
  };

  const handleNextWeek = () => {
    const next = addDays(parseISO(weekStart), 7);
    const nextStr = format(next, 'yyyy-MM-dd');
    setWeekStart(nextStr);
    setSelectedDate(nextStr);
  };

  const handleConfirm = (id) => {
    confirmAppointment(id);
  };

  const handleCancel = (id) => {
    cancelAppointment(id, 'barber');
  };

  return (
    <>
      <Navbar title="Agenda" />
      <div className="page-enter manage-schedule">
        {/* Week Selector */}
        <div className="schedule-week-nav animate-fade-in-down">
          <button className="btn btn-icon btn-ghost" onClick={handlePrevWeek} aria-label="Semana anterior">
            <ChevronLeft size={20} />
          </button>

          <div className="schedule-week-days">
            {weekDays.map((day) => {
              const count = countForDate(day.dateStr);
              const isSelected = day.dateStr === selectedDate;
              return (
                <button
                  key={day.dateStr}
                  className={`schedule-day-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedDate(day.dateStr)}
                >
                  <span className="schedule-day-label">{day.dayLabel}</span>
                  <span className="schedule-day-num">{day.dayNum}</span>
                  {count > 0 && (
                    <span className="schedule-day-count">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <button className="btn btn-icon btn-ghost" onClick={handleNextWeek} aria-label="Próxima semana">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Selected Day Header */}
        <div className="schedule-day-header animate-fade-in-up">
          <Calendar size={20} className="text-accent" />
          <h2 className="heading-md">{getDayOfWeekLabel(selectedDate)}</h2>
          <span className="text-body">— {formatDate(selectedDate)}</span>
        </div>

        {/* Appointments for the day */}
        <div className="schedule-appointments stagger-children">
          {dayAppointments.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>Nenhum agendamento para este dia</h3>
              <p>Aproveite o tempo livre ou abra novos horários.</p>
            </div>
          ) : (
            dayAppointments.map((apt) => (
              <div className="schedule-appointment-row" key={apt.id}>
                <AppointmentCard appointment={apt} showDate={false} />
                <div className="schedule-actions">
                  {apt.status === 'pendente' && (
                    <button
                      className="btn btn-sm btn-primary schedule-btn-confirm"
                      onClick={() => handleConfirm(apt.id)}
                    >
                      <Check size={16} />
                      Confirmar
                    </button>
                  )}
                  {(apt.status === 'pendente' || apt.status === 'confirmado') && (
                    <button
                      className="btn btn-sm btn-danger schedule-btn-cancel"
                      onClick={() => handleCancel(apt.id)}
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
