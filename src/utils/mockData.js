// Mock data for BarberPro V2 — Multi-barbershop
// All data in PT-BR

// ==================== BARBERSHOPS ====================
export const MOCK_BARBERSHOPS = [];

// Backward compat alias
export const MOCK_BARBER = null;

export const getBarbershopById = (id) => null;

// ==================== SERVICES ====================
export const MOCK_SERVICES = [];

export const getServiceById = (id) => null;

// No mock appointments — data comes from PostgreSQL via API
export const MOCK_APPOINTMENTS = [];


// ==================== CLIENTS ====================
// Mock clients removed — real clients come from agendamentos via PostgreSQL
export const MOCK_CLIENTS = [];


// ==================== CONVERSATIONS ====================
// No mock conversations — data comes from Firebase Realtime Database
export const MOCK_CONVERSATIONS = [];

export const MOCK_MESSAGES = {};

// ==================== NOTIFICATIONS ====================
// No mock notifications — data comes from Firebase Realtime Database
export const MOCK_NOTIFICATIONS = [];


// ==================== AVAILABLE SLOTS ====================
const generateAvailableSlots = () => {
  const slots = {};
  const baseDate = new Date('2026-06-02');
  const allSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  for (let i = 0; i < 14; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue;
    const dateStr = date.toISOString().split('T')[0];
    if (dayOfWeek === 6) {
      slots[dateStr] = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    } else {
      const available = allSlots.filter(() => Math.random() > 0.25);
      slots[dateStr] = available.length > 0 ? available : allSlots.slice(0, 5);
    }
  }
  return slots;
};

export const MOCK_AVAILABLE_SLOTS = generateAvailableSlots();

// ==================== HELPERS ====================
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export const formatPrice = (value) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const STATUS_MAP = {
  confirmado: { label: 'Confirmado', color: 'success' },
  pendente: { label: 'Pendente', color: 'warning' },
  cancelado: { label: 'Cancelado', color: 'danger' },
  concluído: { label: 'Concluído', color: 'info' },
};

// ==================== WHATSAPP HELPERS ====================
export const generateWhatsAppLink = (phone, message) => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
};

export const WHATSAPP_TEMPLATES = {
  clientReminder: (clientName, date, time, barbershopName) =>
    `🔔 Olá ${clientName}! Lembrete: seu corte de cabelo é dia ${date} às ${time} na ${barbershopName}. Confirme sua presença! — BarberPro`,
  barberReminder: (barberName, clientName, date, time, service) =>
    `🔔 ${barberName}, lembrete: você tem agendamento com ${clientName} dia ${date} às ${time} (${service}). — BarberPro`,
  postBooking: (clientName, service, date, time, barbershopName) =>
    `✅ ${clientName}, agendamento confirmado!\n\n📋 ${service}\n📅 ${date} às ${time}\n📍 ${barbershopName}\n\nAté lá! — BarberPro`,
  contact: (barbershopName) =>
    `Olá! Vim pelo BarberPro e gostaria de mais informações sobre a ${barbershopName}. 😊`,
};
