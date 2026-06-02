import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  MOCK_APPOINTMENTS,
  MOCK_NOTIFICATIONS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_BARBERSHOPS,
  MOCK_SERVICES,
} from '../utils/mockData';

const DataContext = createContext();

// Helper to push an appointment to Google Calendar API using REST
const addEventToGoogleCalendar = async (appointment, token) => {
  if (!token) return;

  const startDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
  if (isNaN(startDateTime.getTime())) return;

  const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000); // 45-minute duration

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: `💈 BarberPro — ${appointment.service}`,
        description: `Agendamento de ${appointment.service} na barbearia ${appointment.barbershopName || appointment.barbershop_name}.\nStatus: ${appointment.status}\nNotas do Cliente: ${appointment.clientNotes || appointment.client_notes || ''}\nNotas do Barbeiro: ${appointment.barberNotes || appointment.barber_notes || ''}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        }
      })
    });
    
    if (response.ok) {
      console.log('Event successfully created in Google Calendar!');
    } else {
      const err = await response.json();
      console.warn('Google Calendar API returned error:', err);
    }
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
  }
};

export function DataProvider({ children }) {
  const { user, userType } = useAuth();

  // Load from postgres API in full-stack mode, default to empty list while loading
  const [appointments, setAppointments] = useState([]);
  const [loyaltyCuts, setLoyaltyCuts] = useState(0);

  // Other components stay in localStorage for fast UX
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('barberpro_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('barberpro_conversations');
    return saved ? JSON.parse(saved) : MOCK_CONVERSATIONS;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('barberpro_messages');
    return saved ? JSON.parse(saved) : MOCK_MESSAGES;
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('barberpro_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [googleCalendarSynced, setGoogleCalendarSynced] = useState(() => {
    return localStorage.getItem('barberpro_google_calendar_synced') === 'true';
  });

  // Fetch appointments from PostgreSQL backend
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error loading appointments from server:", err);
    }
  }, []);

  // Fetch loyalty stamp count from PostgreSQL
  const fetchLoyaltyCuts = useCallback(async (clientId) => {
    if (!clientId) return;
    try {
      const res = await fetch(`/api/appointments/loyalty/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setLoyaltyCuts(data.cuts_count);
      }
    } catch (err) {
      console.error("Error fetching loyalty cuts count:", err);
    }
  }, []);

  // Fetch data on login/init
  useEffect(() => {
    if (user) {
      fetchAppointments();
      if (userType === 'client') {
        fetchLoyaltyCuts(user.uid);
      }
    }
  }, [user, userType, fetchAppointments, fetchLoyaltyCuts]);

  // Sync state to localStorage on changes (for chats / notifications / favorites)
  useEffect(() => {
    localStorage.setItem('barberpro_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('barberpro_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('barberpro_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('barberpro_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Real-time synchronization between browser tabs for local state
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'barberpro_notifications' && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
      if (e.key === 'barberpro_conversations' && e.newValue) {
        setConversations(JSON.parse(e.newValue));
      }
      if (e.key === 'barberpro_messages' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
      if (e.key === 'barberpro_favorites' && e.newValue) {
        setFavorites(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Client creates an appointment
  const addAppointment = useCallback(async (barbershop, service, date, time, notes = '') => {
    if (!user) return null;
    const googleToken = localStorage.getItem('barberpro_google_access_token');

    try {
      const response = await fetch('/api/appointments/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleToken ? { 'Google-Access-Token': googleToken } : {})
        },
        body: JSON.stringify({
          barbershopId: barbershop.id,
          barbershopName: barbershop.name,
          service: service.name,
          serviceId: service.id,
          date,
          time,
          price: service.price,
          notes,
          clientId: user.uid,
          clientName: user.name
        })
      });

      if (!response.ok) throw new Error("Falha ao agendar corte no servidor relacional");
      const data = await response.json();
      
      const formatted = {
        id: data.id,
        clientId: data.client_id,
        clientName: data.client_name,
        clientAvatar: data.client_avatar,
        service: data.service,
        serviceId: data.service_id,
        barbershopId: data.barbershop_id,
        barbershopName: data.barbershop_name,
        date: data.date.split('T')[0],
        time: data.time.slice(0, 5),
        status: data.status,
        price: parseFloat(data.price),
        clientNotes: data.client_notes,
        barberNotes: data.barber_notes,
        googleSynced: data.google_synced
      };

      setAppointments((prev) => [formatted, ...prev]);

      // Create notification for barber
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'new_appointment',
        title: 'Novo Agendamento',
        message: `${formatted.clientName} agendou ${formatted.service} para ${date.split('-').reverse().join('/')} às ${time}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Trigger chat message simulation
      setConversations((prevConvs) => {
        const exists = prevConvs.some((c) => c.clientId === formatted.clientId);
        const lastMsg = `Agendou ${formatted.service} para o dia ${date.split('-').reverse().join('/')} às ${time}`;
        if (exists) {
          return prevConvs.map((c) =>
            c.clientId === formatted.clientId
              ? { ...c, lastMessage: lastMsg, lastMessageTime: new Date().toISOString() }
              : c
          );
        } else {
          return [
            {
              id: `conv-${Date.now()}`,
              clientId: formatted.clientId,
              clientName: formatted.clientName,
              clientAvatar: formatted.clientAvatar,
              lastMessage: lastMsg,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 1,
            },
            ...prevConvs,
          ];
        }
      });

      return formatted;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [user]);

  // Barber confirms appointment
  const confirmAppointment = useCallback(async (appointmentId) => {
    const googleToken = localStorage.getItem('barberpro_google_access_token');
    
    try {
      const response = await fetch(`/api/appointments/confirm/${appointmentId}`, {
        method: 'POST',
        headers: {
          ...(googleToken ? { 'Google-Access-Token': googleToken } : {})
        }
      });

      if (!response.ok) throw new Error("Erro ao confirmar agendamento");
      
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'confirmado' } : a))
      );

      const apt = appointments.find((a) => a.id === appointmentId);
      if (!apt) return;

      // Create notification for client
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'message',
        title: 'Agendamento Confirmado',
        message: `Seu agendamento para ${apt.service} na ${apt.barbershopName} foi aceito!`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Send chat confirmation
      const messageText = `Olá ${apt.clientName}! Confirmamos o seu agendamento para o dia ${apt.date.split('-').reverse().join('/')} às ${apt.time} (${apt.service}). Te esperamos lá! 💈`;
      let conv = conversations.find((c) => c.clientId === apt.clientId);
      const convId = conv ? conv.id : `conv-${Date.now()}`;

      setConversations((prev) => {
        if (!conv) {
          return [
            {
              id: convId,
              clientId: apt.clientId,
              clientName: apt.clientName,
              clientAvatar: apt.clientAvatar,
              lastMessage: messageText,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 1,
            },
            ...prev,
          ];
        } else {
          return prev.map((c) =>
            c.id === convId ? { ...c, lastMessage: messageText, lastMessageTime: new Date().toISOString() } : c
          );
        }
      });

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: 'barber-001',
        senderName: apt.barbershopName,
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), newMsg],
      }));
    } catch (err) {
      console.error(err);
    }
  }, [appointments, conversations]);

  // Complete appointment (Triggers loyalty count refetch)
  const completeAppointment = useCallback(async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/complete/${appointmentId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error("Erro ao concluir agendamento");

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'concluído' } : a))
      );

      const apt = appointments.find((a) => a.id === appointmentId);
      if (apt) {
        fetchLoyaltyCuts(apt.clientId);
      }
    } catch (err) {
      console.error(err);
    }
  }, [appointments, fetchLoyaltyCuts]);

  // Cancel appointment (can be done by client or barber)
  const cancelAppointment = useCallback(async (appointmentId, role) => {
    try {
      const response = await fetch(`/api/appointments/cancel/${appointmentId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error("Erro ao cancelar agendamento");

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelado' } : a))
      );

      const apt = appointments.find((a) => a.id === appointmentId);
      if (!apt) return;

      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'cancelled',
        title: 'Agendamento Cancelado',
        message: role === 'barber'
          ? `O barbeiro cancelou o horário de ${apt.date.split('-').reverse().join('/')} às ${apt.time}`
          : `${apt.clientName} cancelou o horário de ${apt.date.split('-').reverse().join('/')} às ${apt.time}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Chat log
      const messageText = role === 'barber'
        ? `Aviso: Seu agendamento para o dia ${apt.date.split('-').reverse().join('/')} às ${apt.time} precisou ser cancelado.`
        : `Olá! Cancelei meu agendamento de ${apt.date.split('-').reverse().join('/')} às ${apt.time}.`;

      let conv = conversations.find((c) => c.clientId === apt.clientId);
      const convId = conv ? conv.id : `conv-${Date.now()}`;

      setConversations((prev) => {
        if (!conv) {
          return [
            {
              id: convId,
              clientId: apt.clientId,
              clientName: apt.clientName,
              clientAvatar: apt.clientAvatar,
              lastMessage: messageText,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 1,
            },
            ...prev,
          ];
        } else {
          return prev.map((c) =>
            c.id === convId ? { ...c, lastMessage: messageText, lastMessageTime: new Date().toISOString() } : c
          );
        }
      });

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: role === 'barber' ? 'barber-001' : apt.clientId,
        senderName: role === 'barber' ? apt.barbershopName : apt.clientName,
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), newMsg],
      }));
    } catch (err) {
      console.error(err);
    }
  }, [appointments, conversations]);

  // Toggle favorite barbershop
  const toggleFavorite = useCallback((barbershopId) => {
    setFavorites((prev) => {
      if (prev.includes(barbershopId)) {
        return prev.filter((id) => id !== barbershopId);
      } else {
        return [...prev, barbershopId];
      }
    });
  }, []);

  const addMessage = useCallback((convId, text, senderId, senderName) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() } : c
      )
    );
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Google Calendar Sync API Flow
  const syncGoogleCalendar = useCallback(() => {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1013727976868-dummyid.apps.googleusercontent.com';
      
      if (!window.google) {
        console.warn("Google SDK not loaded yet. Simulating sync.");
        setGoogleCalendarSynced(true);
        localStorage.setItem('barberpro_google_calendar_synced', 'true');
        setAppointments((prev) =>
          prev.map((a) => ({ ...a, googleSynced: true }))
        );
        resolve();
        return;
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/calendar.events',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              localStorage.setItem('barberpro_google_access_token', tokenResponse.access_token);
              setGoogleCalendarSynced(true);
              localStorage.setItem('barberpro_google_calendar_synced', 'true');
              
              // Push all existing unsynced appointments for this client in the DB
              setAppointments((prev) => {
                const updated = prev.map((a) => {
                  if (a.clientId === (user?.uid || 'client-001')) {
                    addEventToGoogleCalendar(a, tokenResponse.access_token);
                    // Update database synced status in background
                    fetch(`/api/appointments/confirm/${a.id}`, {
                      method: 'POST',
                      headers: { 'Google-Access-Token': tokenResponse.access_token }
                    });
                    return { ...a, googleSynced: true };
                  }
                  return a;
                });
                return updated;
              });
              resolve();
            } else {
              reject(new Error("Token de acesso inválido"));
            }
          },
          error_callback: (err) => {
            reject(err);
          }
        });
        
        client.requestAccessToken();
      } catch (err) {
        console.error("GIS init client sync error:", err);
        setGoogleCalendarSynced(true);
        localStorage.setItem('barberpro_google_calendar_synced', 'true');
        setAppointments((prev) =>
          prev.map((a) => ({ ...a, googleSynced: true }))
        );
        resolve();
      }
    });
  }, [user]);

  // Update notes on appointments (Backend persistent)
  const updateAppointmentNotes = useCallback(async (appointmentId, notes, role) => {
    try {
      const response = await fetch(`/api/appointments/notes/${appointmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, role })
      });
      if (response.ok) {
        setAppointments((prev) =>
          prev.map((a) => {
            if (a.id === appointmentId) {
              return role === 'barber'
                ? { ...a, barberNotes: notes }
                : { ...a, clientNotes: notes };
            }
            return a;
          })
        );
      }
    } catch (err) {
      console.error("Error saving notes on server:", err);
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        appointments,
        notifications,
        conversations,
        messages,
        favorites,
        googleCalendarSynced,
        loyaltyCuts,
        addAppointment,
        confirmAppointment,
        completeAppointment,
        cancelAppointment,
        toggleFavorite,
        addMessage,
        markNotificationsAsRead,
        syncGoogleCalendar,
        updateAppointmentNotes,
        fetchLoyaltyCuts
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};
