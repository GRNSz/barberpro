// Mock data for BarberPro V2 — Multi-barbershop
// All data in PT-BR

// ==================== BARBERSHOPS ====================
export const MOCK_BARBERSHOPS = [
  {
    id: 'barber-001',
    name: 'Barbearia do João',
    address: 'Rua das Flores, 123 — Centro',
    phone: '(11) 99999-8888',
    whatsapp: '5511999998888',
    rating: 4.8,
    totalReviews: 127,
    avatar: null,
    description: 'A melhor barbearia da cidade. Atendimento premium com o melhor custo-benefício.',
    lat: -23.5505,
    lng: -46.6333,
    distance: 0.8,
    services: ['svc-001', 'svc-002', 'svc-003', 'svc-004', 'svc-005'],
    workingHours: {
      seg: { open: '09:00', close: '19:00' },
      ter: { open: '09:00', close: '19:00' },
      qua: { open: '09:00', close: '19:00' },
      qui: { open: '09:00', close: '19:00' },
      sex: { open: '09:00', close: '20:00' },
      sab: { open: '08:00', close: '17:00' },
      dom: null,
    },
  },
  {
    id: 'barber-002',
    name: 'Barba Negra Barbearia',
    address: 'Av. Paulista, 900 — Bela Vista',
    phone: '(11) 98888-7777',
    whatsapp: '5511988887777',
    rating: 4.6,
    totalReviews: 89,
    avatar: null,
    description: 'Estilo e tradição. Especialistas em barbas e cortes clássicos.',
    lat: -23.5629,
    lng: -46.6544,
    distance: 1.2,
    services: ['svc-001', 'svc-002', 'svc-003', 'svc-006'],
    workingHours: {
      seg: { open: '10:00', close: '20:00' },
      ter: { open: '10:00', close: '20:00' },
      qua: { open: '10:00', close: '20:00' },
      qui: { open: '10:00', close: '20:00' },
      sex: { open: '10:00', close: '21:00' },
      sab: { open: '09:00', close: '18:00' },
      dom: null,
    },
  },
  {
    id: 'barber-003',
    name: 'Corte & Cia',
    address: 'Rua Augusta, 450 — Consolação',
    phone: '(11) 97777-6666',
    whatsapp: '5511977776666',
    rating: 4.9,
    totalReviews: 203,
    avatar: null,
    description: 'Barbearia moderna com ambiente descontraído. Cerveja artesanal na faixa!',
    lat: -23.5537,
    lng: -46.6580,
    distance: 1.5,
    services: ['svc-001', 'svc-002', 'svc-003', 'svc-004', 'svc-005', 'svc-006'],
    workingHours: {
      seg: null,
      ter: { open: '09:00', close: '20:00' },
      qua: { open: '09:00', close: '20:00' },
      qui: { open: '09:00', close: '20:00' },
      sex: { open: '09:00', close: '21:00' },
      sab: { open: '08:00', close: '18:00' },
      dom: { open: '10:00', close: '15:00' },
    },
  },
  {
    id: 'barber-004',
    name: 'Old School Barber',
    address: 'Rua da Liberdade, 78 — Liberdade',
    phone: '(11) 96666-5555',
    whatsapp: '5511966665555',
    rating: 4.5,
    totalReviews: 65,
    avatar: null,
    description: 'Cortes clássicos com técnica old school. Navalha e toalha quente.',
    lat: -23.5580,
    lng: -46.6360,
    distance: 2.1,
    services: ['svc-001', 'svc-002', 'svc-003'],
    workingHours: {
      seg: { open: '08:00', close: '18:00' },
      ter: { open: '08:00', close: '18:00' },
      qua: { open: '08:00', close: '18:00' },
      qui: { open: '08:00', close: '18:00' },
      sex: { open: '08:00', close: '18:00' },
      sab: { open: '08:00', close: '14:00' },
      dom: null,
    },
  },
  {
    id: 'barber-005',
    name: 'Elite Barber Studio',
    address: 'Rua Oscar Freire, 320 — Jardins',
    phone: '(11) 95555-4444',
    whatsapp: '5511955554444',
    rating: 4.7,
    totalReviews: 156,
    avatar: null,
    description: 'Experiência premium. Ambiente sofisticado com atendimento exclusivo.',
    lat: -23.5620,
    lng: -46.6690,
    distance: 2.8,
    services: ['svc-001', 'svc-002', 'svc-003', 'svc-004', 'svc-005', 'svc-006'],
    workingHours: {
      seg: { open: '09:00', close: '20:00' },
      ter: { open: '09:00', close: '20:00' },
      qua: { open: '09:00', close: '20:00' },
      qui: { open: '09:00', close: '20:00' },
      sex: { open: '09:00', close: '21:00' },
      sab: { open: '09:00', close: '17:00' },
      dom: null,
    },
  },
  {
    id: 'barber-006',
    name: 'Navalha de Ouro',
    address: 'Rua Vergueiro, 1200 — Vila Mariana',
    phone: '(11) 94444-3333',
    whatsapp: '5511944443333',
    rating: 4.4,
    totalReviews: 42,
    avatar: null,
    description: 'Barbearia de bairro com atendimento familiar. Preços acessíveis.',
    lat: -23.5750,
    lng: -46.6380,
    distance: 3.5,
    services: ['svc-001', 'svc-002', 'svc-003', 'svc-005'],
    workingHours: {
      seg: { open: '08:00', close: '19:00' },
      ter: { open: '08:00', close: '19:00' },
      qua: { open: '08:00', close: '19:00' },
      qui: { open: '08:00', close: '19:00' },
      sex: { open: '08:00', close: '19:00' },
      sab: { open: '08:00', close: '16:00' },
      dom: null,
    },
  },
];

// Backward compat alias
export const MOCK_BARBER = MOCK_BARBERSHOPS[0];

export const getBarbershopById = (id) => MOCK_BARBERSHOPS.find((b) => b.id === id) || null;

// ==================== SERVICES ====================
export const MOCK_SERVICES = [
  { id: 'svc-001', name: 'Corte Masculino', price: 45.00, duration: 30, description: 'Corte na máquina e tesoura com acabamento', active: true, icon: '✂️' },
  { id: 'svc-002', name: 'Barba', price: 35.00, duration: 20, description: 'Barba completa com navalha e toalha quente', active: true, icon: '🪒' },
  { id: 'svc-003', name: 'Corte + Barba', price: 70.00, duration: 50, description: 'Combo completo com corte e barba', active: true, icon: '💈' },
  { id: 'svc-004', name: 'Pigmentação', price: 60.00, duration: 40, description: 'Pigmentação capilar para cobertura de fios brancos', active: true, icon: '🎨' },
  { id: 'svc-005', name: 'Sobrancelha', price: 20.00, duration: 10, description: 'Design de sobrancelha masculina', active: true, icon: '👁️' },
  { id: 'svc-006', name: 'Hidratação Capilar', price: 50.00, duration: 30, description: 'Tratamento de hidratação profunda', active: true, icon: '💧' },
];

export const getServiceById = (id) => MOCK_SERVICES.find((s) => s.id === id) || null;

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
