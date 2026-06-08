import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MOCK_AVAILABLE_SLOTS, formatPrice, getInitials } from '../../utils/mockData';
import { getDayOfWeekLabel, formatDayMonth } from '../../utils/helpers';
import { ChevronLeft, ChevronRight, Check, Clock, Calendar, ArrowLeft, MapPin, Star } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './BookAppointment.css';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBarbershopId = searchParams.get('barbershopId');
  const { addAppointment, barbershops } = useData();

  // Multi-barbershop states
  const [selectedBarbershop, setSelectedBarbershop] = useState(() => {
    if (!initialBarbershopId) return null;
    return null; // Will be set via useEffect once barbershops load
  });

  // Set pre-selected barbershop once list loads
  useEffect(() => {
    if (initialBarbershopId && barbershops.length > 0 && !selectedBarbershop) {
      const found = barbershops.find(b => b.id === initialBarbershopId);
      if (found) {
        setSelectedBarbershop(found);
        setStep(1);
      }
    }
  }, [initialBarbershopId, barbershops, selectedBarbershop]);

  const [step, setStep] = useState(initialBarbershopId && selectedBarbershop ? 1 : 0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter services offered by selected barbershop (real data)
  const activeServices = useMemo(() => {
    if (!selectedBarbershop) return [];
    return (selectedBarbershop.services || []).filter(s => s.active !== false);
  }, [selectedBarbershop]);

  const availableDates = useMemo(() => {
    return Object.keys(MOCK_AVAILABLE_SLOTS).sort();
  }, []);

  const availableSlots = selectedDate ? MOCK_AVAILABLE_SLOTS[selectedDate] || [] : [];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (initialBarbershopId && step === 1) {
      // If pre-selected via URL, go back to the previous page
      navigate(-1);
      return;
    }
    if (step > 0) {
      if (step === 3) setSelectedTime(null);
      if (step === 2) setSelectedDate(null);
      if (step === 1) setSelectedService(null);
      setStep(step - 1);
    }
  };

  const handleConfirm = () => {
    addAppointment(selectedBarbershop, selectedService, selectedDate, selectedTime);
    setShowSuccess(true);
  };

  const canProceed =
    (step === 0 && selectedBarbershop) ||
    (step === 1 && selectedService) ||
    (step === 2 && selectedDate) ||
    (step === 3 && selectedTime);

  const stepLabels = ['Barbearia', 'Serviço', 'Data', 'Horário'];

  const getDateLabel = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const d = new Date(dateStr + 'T00:00:00');
    if (d.getTime() === today.getTime()) return 'Hoje';
    if (d.getTime() === tomorrow.getTime()) return 'Amanhã';
    return getDayOfWeekLabel(dateStr);
  };

  const getDayNumber = (dateStr) => {
    return dateStr.split('-')[2];
  };

  return (
    <div className="page-enter book-appointment">
      {/* Step Indicator */}
      <div className="booking-steps">
        {(step > 0 || initialBarbershopId) && (
          <button className="booking-back-btn btn-icon btn-ghost" onClick={handleBack} aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="steps-track">
          {stepLabels.map((label, i) => (
            <div
              key={label}
              className={`step-item ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            >
              <div className="step-dot">
                {i < step ? <Check size={14} /> : <span>{i + 1}</span>}
              </div>
              <span className="step-label">{label}</span>
            </div>
          ))}
          <div className="steps-line">
            <div className="steps-line-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Step 0: Select Barbershop */}
      {step === 0 && (
        <div className="booking-step animate-fade-in-up">
          <h2 className="booking-step-title">Escolha a barbearia</h2>
          <p className="booking-step-desc">Selecione em qual barbearia quer ser atendido</p>
          <div className="services-grid stagger-children">
            {barbershops.length === 0 ? (
              <div className="empty-state-mini">
                <MapPin size={32} />
                <p>Nenhuma barbearia disponível ainda</p>
              </div>
            ) : (
              barbershops.map((shop) => (
              <button
                key={shop.id}
                className={`service-card card ${selectedBarbershop?.id === shop.id ? 'selected' : ''}`}
                onClick={() => setSelectedBarbershop(shop)}
              >
                <div className="service-card-avatar avatar avatar-md avatar-placeholder">
                  {getInitials(shop.name)}
                </div>
                <div className="service-card-info">
                  <span className="service-card-name">{shop.name}</span>
                  <span className="service-card-desc">{shop.address}</span>
                  <div className="service-card-meta">
                    <span className="service-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                      <Star size={14} fill="#C8A96E" color="#C8A96E" /> {shop.rating}
                    </span>
                    <span className="service-card-duration">
                      <MapPin size={12} /> {shop.distance} km
                    </span>
                  </div>
                </div>
                {selectedBarbershop?.id === shop.id && (
                  <div className="service-check">
                    <Check size={18} />
                  </div>
                )}
              </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="booking-step animate-fade-in-up">
          <h2 className="booking-step-title">Escolha o serviço</h2>
          <p className="booking-step-desc">Selecione o serviço que deseja agendar na {selectedBarbershop?.name}</p>
          {activeServices.length > 0 ? (
            <div className="services-grid stagger-children">
              {activeServices.map((service) => (
                <button
                  key={service.id}
                  className={`service-card card ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="service-card-icon">{service.icon}</div>
                  <div className="service-card-info">
                    <span className="service-card-name">{service.name}</span>
                    <span className="service-card-desc">{service.description}</span>
                    <div className="service-card-meta">
                      <span className="service-card-price">{formatPrice(service.price)}</span>
                      <span className="service-card-duration">
                        <Clock size={14} /> {service.duration} min
                      </span>
                    </div>
                  </div>
                  {selectedService?.id === service.id && (
                    <div className="service-check">
                      <Check size={18} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state-mini">
              <Clock size={32} />
              <p>Nenhum serviço disponível nesta barbearia</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Date */}
      {step === 2 && (
        <div className="booking-step animate-fade-in-up">
          <h2 className="booking-step-title">Escolha a data</h2>
          <p className="booking-step-desc">Selecione um dia disponível</p>
          <div className="date-chips-wrapper">
            <div className="date-chips-scroll">
              {availableDates.map((dateStr) => {
                const label = getDateLabel(dateStr);
                const isSpecial = label === 'Hoje' || label === 'Amanhã';
                return (
                  <button
                    key={dateStr}
                    className={`date-chip ${selectedDate === dateStr ? 'selected' : ''} ${isSpecial ? 'special' : ''}`}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedTime(null);
                    }}
                  >
                    <span className="date-chip-label">{label}</span>
                    <span className="date-chip-day">{getDayNumber(dateStr)}</span>
                    <span className="date-chip-month">{formatDayMonth(dateStr)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Select Time */}
      {step === 3 && (
        <div className="booking-step animate-fade-in-up">
          <h2 className="booking-step-title">Escolha o horário</h2>
          <p className="booking-step-desc">
            <Calendar size={16} /> {getDayOfWeekLabel(selectedDate)}, {formatDayMonth(selectedDate)}
          </p>
          {availableSlots.length > 0 ? (
            <div className="time-slots-grid">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  className={`time-slot-btn ${selectedTime === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(slot)}
                >
                  <Clock size={16} />
                  <span>{slot}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state-mini">
              <Clock size={32} />
              <p>Nenhum horário disponível nesta data</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Summary Bar */}
      {(selectedBarbershop || selectedService || selectedDate || selectedTime) && !showSuccess && (
        <div className="booking-summary-bar animate-fade-in">
          <div className="booking-summary-info">
            {selectedBarbershop && (
              <span className="summary-item">
                <MapPin size={14} /> {selectedBarbershop.name}
              </span>
            )}
            {selectedService && (
              <span className="summary-item">
                {selectedService.icon} {selectedService.name}
              </span>
            )}
            {selectedDate && (
              <span className="summary-item">
                <Calendar size={14} /> {formatDayMonth(selectedDate)}
              </span>
            )}
            {selectedTime && (
              <span className="summary-item">
                <Clock size={14} /> {selectedTime}
              </span>
            )}
            {selectedService && (
              <span className="summary-price">{formatPrice(selectedService.price)}</span>
            )}
          </div>
          {step < 3 ? (
            <button className="btn btn-primary" onClick={handleNext} disabled={!canProceed}>
              Próximo <ChevronRight size={18} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={!selectedTime}
            >
              Confirmar Agendamento <Check size={18} />
            </button>
          )}
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal booking-success-modal animate-scale-in">
            <div className="success-animation">
              <div className="success-circle">
                <Check size={48} className="success-check-icon" />
              </div>
            </div>
            <h2 className="success-title">Agendamento Confirmado!</h2>
            <div className="success-desc">
              <p className="success-shop-name">{selectedBarbershop?.name}</p>
              <p className="success-service-name">{selectedService?.name}</p>
              <p className="success-date-time">{formatDayMonth(selectedDate)} às {selectedTime}</p>
            </div>
            <p className="success-price">{selectedService && formatPrice(selectedService.price)}</p>
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate('/cliente/agendamentos')}
            >
              Ver Meus Agendamentos
            </button>
            <button
              className="btn btn-ghost btn-full"
              onClick={() => navigate('/cliente')}
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
