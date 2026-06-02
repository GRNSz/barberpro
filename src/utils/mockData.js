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

// ==================== APPOINTMENTS ====================
export const MOCK_APPOINTMENTS = [
  { id: 'apt-001', clientId: 'client-001', clientName: 'Carlos Silva', clientAvatar: null, service: 'Corte + Barba', serviceId: 'svc-003', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-06-02', time: '09:00', status: 'confirmado', price: 70.00, notes: '' },
  { id: 'apt-002', clientId: 'client-002', clientName: 'Pedro Santos', clientAvatar: null, service: 'Corte Masculino', serviceId: 'svc-001', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-06-02', time: '10:00', status: 'confirmado', price: 45.00, notes: 'Preferência: degradê baixo' },
  { id: 'apt-003', clientId: 'client-003', clientName: 'Lucas Oliveira', clientAvatar: null, service: 'Barba', serviceId: 'svc-002', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-06-02', time: '11:00', status: 'pendente', price: 35.00, notes: '' },
  { id: 'apt-004', clientId: 'client-004', clientName: 'Rafael Costa', clientAvatar: null, service: 'Corte Masculino', serviceId: 'svc-001', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-06-02', time: '14:00', status: 'confirmado', price: 45.00, notes: '' },
  { id: 'apt-005', clientId: 'client-001', clientName: 'Carlos Silva', clientAvatar: null, service: 'Corte Masculino', serviceId: 'svc-001', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-06-03', time: '09:30', status: 'pendente', price: 45.00, notes: '' },
  { id: 'apt-006', clientId: 'client-005', clientName: 'Bruno Almeida', clientAvatar: null, service: 'Pigmentação', serviceId: 'svc-004', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-06-03', time: '15:00', status: 'confirmado', price: 60.00, notes: 'Primeira vez — verificar alergia' },
  { id: 'apt-007', clientId: 'client-002', clientName: 'Pedro Santos', clientAvatar: null, service: 'Corte + Barba', serviceId: 'svc-003', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-05-28', time: '10:00', status: 'concluído', price: 70.00, notes: '' },
  { id: 'apt-008', clientId: 'client-003', clientName: 'Lucas Oliveira', clientAvatar: null, service: 'Corte Masculino', serviceId: 'svc-001', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-05-27', time: '16:00', status: 'concluído', price: 45.00, notes: '' },
  { id: 'apt-009', clientId: 'client-004', clientName: 'Rafael Costa', clientAvatar: null, service: 'Corte Masculino', serviceId: 'svc-001', barbershopId: 'barber-001', barbershopName: 'Barbearia do João', date: '2026-05-26', time: '09:00', status: 'cancelado', price: 45.00, notes: 'Cancelou por motivo pessoal' },
];

// ==================== CLIENTS ====================
export const MOCK_CLIENTS = [
  { id: 'client-001', name: 'Carlos Silva', phone: '(11) 98765-4321', whatsapp: '5511987654321', email: 'carlos@email.com', avatar: null, notes: 'Prefere corte degradê. Cliente desde 2024.', totalVisits: 12, lastVisit: '2026-05-30', favoriteService: 'Corte + Barba' },
  { id: 'client-002', name: 'Pedro Santos', phone: '(11) 97654-3210', whatsapp: '5511976543210', email: 'pedro@email.com', avatar: null, notes: 'Pede sempre corte social.', totalVisits: 8, lastVisit: '2026-05-28', favoriteService: 'Corte Masculino' },
  { id: 'client-003', name: 'Lucas Oliveira', phone: '(11) 96543-2109', whatsapp: '5511965432109', email: 'lucas@email.com', avatar: null, notes: '', totalVisits: 5, lastVisit: '2026-05-27', favoriteService: 'Barba' },
  { id: 'client-004', name: 'Rafael Costa', phone: '(11) 95432-1098', whatsapp: '5511954321098', email: 'rafael@email.com', avatar: null, notes: 'Chega sempre 10 min atrasado.', totalVisits: 3, lastVisit: '2026-05-20', favoriteService: 'Corte Masculino' },
  { id: 'client-005', name: 'Bruno Almeida', phone: '(11) 94321-0987', whatsapp: '5511943210987', email: 'bruno@email.com', avatar: null, notes: 'Cliente novo. Verificar alergia para pigmentação.', totalVisits: 1, lastVisit: '2026-05-15', favoriteService: 'Pigmentação' },
];

// ==================== CONVERSATIONS ====================
export const MOCK_CONVERSATIONS = [
  { id: 'conv-001', clientId: 'client-001', clientName: 'Carlos Silva', clientAvatar: null, lastMessage: 'Blz, tô confirmado pra segunda!', lastMessageTime: '2026-05-30T18:30:00', unreadCount: 1 },
  { id: 'conv-002', clientId: 'client-002', clientName: 'Pedro Santos', clientAvatar: null, lastMessage: 'Valeu João, ficou top o corte!', lastMessageTime: '2026-05-28T15:20:00', unreadCount: 0 },
  { id: 'conv-003', clientId: 'client-003', clientName: 'Lucas Oliveira', clientAvatar: null, lastMessage: 'Consegue encaixar uma barba amanhã?', lastMessageTime: '2026-05-30T14:10:00', unreadCount: 2 },
];

export const MOCK_MESSAGES = {
  'conv-001': [
    { id: 'msg-001', senderId: 'client-001', senderName: 'Carlos Silva', text: 'Opa João, tudo bem?', timestamp: '2026-05-30T18:00:00', read: true },
    { id: 'msg-002', senderId: 'barber-001', senderName: 'Barbearia do João', text: 'E aí Carlos! Tudo certo, e você?', timestamp: '2026-05-30T18:05:00', read: true },
    { id: 'msg-003', senderId: 'client-001', senderName: 'Carlos Silva', text: 'De boa! Queria confirmar meu horário de segunda, 9h, corte + barba', timestamp: '2026-05-30T18:10:00', read: true },
    { id: 'msg-004', senderId: 'barber-001', senderName: 'Barbearia do João', text: 'Confirmado! Te espero segunda às 9h 👊', timestamp: '2026-05-30T18:15:00', read: true },
    { id: 'msg-005', senderId: 'client-001', senderName: 'Carlos Silva', text: 'Blz, tô confirmado pra segunda!', timestamp: '2026-05-30T18:30:00', read: false },
  ],
  'conv-002': [
    { id: 'msg-010', senderId: 'client-002', senderName: 'Pedro Santos', text: 'João, o corte ficou muito bom!', timestamp: '2026-05-28T15:15:00', read: true },
    { id: 'msg-011', senderId: 'barber-001', senderName: 'Barbearia do João', text: 'Valeu Pedro! Sempre bom te atender 😄', timestamp: '2026-05-28T15:18:00', read: true },
    { id: 'msg-012', senderId: 'client-002', senderName: 'Pedro Santos', text: 'Valeu João, ficou top o corte!', timestamp: '2026-05-28T15:20:00', read: true },
  ],
  'conv-003': [
    { id: 'msg-020', senderId: 'client-003', senderName: 'Lucas Oliveira', text: 'Fala João!', timestamp: '2026-05-30T14:00:00', read: true },
    { id: 'msg-021', senderId: 'client-003', senderName: 'Lucas Oliveira', text: 'Consegue encaixar uma barba amanhã?', timestamp: '2026-05-30T14:10:00', read: false },
  ],
};

// ==================== NOTIFICATIONS ====================
export const MOCK_NOTIFICATIONS = [
  { id: 'notif-001', type: 'new_appointment', title: 'Novo Agendamento', message: 'Carlos Silva agendou Corte + Barba para 02/06 às 09:00', timestamp: '2026-05-30T16:00:00', read: false },
  { id: 'notif-002', type: 'new_appointment', title: 'Novo Agendamento', message: 'Lucas Oliveira agendou Barba para 02/06 às 11:00', timestamp: '2026-05-30T15:30:00', read: false },
  { id: 'notif-003', type: 'cancelled', title: 'Agendamento Cancelado', message: 'Rafael Costa cancelou o horário de 26/05 às 09:00', timestamp: '2026-05-26T08:00:00', read: true },
  { id: 'notif-004', type: 'message', title: 'Nova Mensagem', message: 'Carlos Silva enviou uma mensagem', timestamp: '2026-05-30T18:30:00', read: false },
  { id: 'notif-005', type: 'new_appointment', title: 'Novo Agendamento', message: 'Bruno Almeida agendou Pigmentação para 03/06 às 15:00', timestamp: '2026-05-29T12:00:00', read: true },
];

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
