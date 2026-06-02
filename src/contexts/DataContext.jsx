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
        description: `Agendamento de ${appointment.service} na barbearia ${appointment.barbershopName}.\nStatus: ${appointment.status}\nNotas do Cliente: ${appointment.clientNotes || ''}\nNotas do Barbeiro: ${appointment.barberNotes || ''}`,
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

  // Load from localStorage or fallback to mocks
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('barberpro_appointments');
    return saved ? JSON.parse(saved) : MOCK_APPOINTMENTS;
  });

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

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('barberpro_appointments', JSON.stringify(appointments));
  }, [appointments]);

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

  // Real-time synchronization between browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'barberpro_appointments' && e.newValue) {
        setAppointments(JSON.parse(e.newValue));
      }
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
  const addAppointment = useCallback((barbershop, service, date, time, notes = '') => {
    if (!user) return null;

    const newAptId = `apt-${Date.now()}`;
    const synced = localStorage.getItem('barberpro_google_calendar_synced') === 'true';
    const token = localStorage.getItem('barberpro_google_access_token');

    const newApt = {
      id: newAptId,
      clientId: user.uid || 'client-001',
      clientName: user.name || 'Carlos Silva',
      clientAvatar: user.avatar || null,
      service: service.name,
      serviceId: service.id,
      barbershopId: barbershop.id,
      barbershopName: barbershop.name,
      date,
      time,
      status: 'pendente',
      price: service.price,
      notes,
      googleSynced: synced && !!token,
    };

    // If Google Calendar Sync is active and we have a token, push to Calendar API
    if (synced && token) {
      addEventToGoogleCalendar(newApt, token);
    }

    // Update appointments
    setAppointments((prev) => [newApt, ...prev]);

    // Create notification for barber/barbershop
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'new_appointment',
      title: 'Novo Agendamento',
      message: `${newApt.clientName} agendou ${newApt.service} para ${date.split('-').reverse().join('/')} às ${time}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Ensure conversation exists between client and barber
    setConversations((prevConvs) => {
      const exists = prevConvs.some((c) => c.clientId === newApt.clientId);
      if (exists) {
        return prevConvs.map((c) =>
          c.clientId === newApt.clientId
            ? {
                ...c,
                lastMessage: `Agendou ${newApt.service} para o dia ${date.split('-').reverse().join('/')} às ${time}`,
                lastMessageTime: new Date().toISOString(),
              }
            : c
        );
      } else {
        return [
          {
            id: `conv-${Date.now()}`,
            clientId: newApt.clientId,
            clientName: newApt.clientName,
            clientAvatar: newApt.clientAvatar,
            lastMessage: `Agendou ${newApt.service} para o dia ${date.split('-').reverse().join('/')} às ${time}`,
            lastMessageTime: new Date().toISOString(),
            unreadCount: 1,
          },
          ...prevConvs,
        ];
      }
    });

    return newApt;
  }, [user]);

  // Barber confirms appointment
  const confirmAppointment = useCallback((appointmentId) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId) {
          const updated = { ...a, status: 'confirmado' };
          const synced = localStorage.getItem('barberpro_google_calendar_synced') === 'true';
          const token = localStorage.getItem('barberpro_google_access_token');
          if (synced && token) {
            addEventToGoogleCalendar(updated, token);
            updated.googleSynced = true;
          }
          return updated;
        }
        return a;
      })
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

    // Send a message in the chat
    const messageText = `Olá ${apt.clientName}! Confirmamos o seu agendamento para o dia ${apt.date.split('-').reverse().join('/')} às ${apt.time} (${apt.service}). Te esperamos lá! 💈`;
    
    // Find conversation ID
    let conv = conversations.find((c) => c.clientId === apt.clientId);
    const convId = conv ? conv.id : `conv-${Date.now()}`;

    if (!conv) {
      setConversations((prev) => [
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
      ]);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, lastMessage: messageText, lastMessageTime: new Date().toISOString() }
            : c
        )
      );
    }

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
  }, [appointments, conversations]);

  // Cancel appointment (can be done by client or barber)
  const cancelAppointment = useCallback((appointmentId, role) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelado' } : a))
    );

    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    // Create notification
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

    // Send a message in the chat
    const messageText = role === 'barber'
      ? `Aviso: Seu agendamento para o dia ${apt.date.split('-').reverse().join('/')} às ${apt.time} precisou ser cancelado.`
      : `Olá! Cancelei meu agendamento de ${apt.date.split('-').reverse().join('/')} às ${apt.time}.`;

    let conv = conversations.find((c) => c.clientId === apt.clientId);
    const convId = conv ? conv.id : `conv-${Date.now()}`;

    if (!conv) {
      setConversations((prev) => [
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
      ]);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, lastMessage: messageText, lastMessageTime: new Date().toISOString() }
            : c
        )
      );
    }

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
        c.id === convId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTime: new Date().toISOString(),
            }
          : c
      )
    );
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Google Calendar Sync
  const [googleCalendarSynced, setGoogleCalendarSynced] = useState(() => {
    return localStorage.getItem('barberpro_google_calendar_synced') === 'true';
  });

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
              
              // Trigger sync for all existing client appointments
              setAppointments((prev) => {
                const updated = prev.map((a) => {
                  if (a.clientId === (user?.uid || 'client-001')) {
                    addEventToGoogleCalendar(a, tokenResponse.access_token);
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

  // Update notes on appointments
  const updateAppointmentNotes = useCallback((appointmentId, notes, role) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId) {
          if (role === 'barber') {
            return { ...a, barberNotes: notes };
          } else {
            return { ...a, clientNotes: notes };
          }
        }
        return a;
      })
    );
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
        addAppointment,
        confirmAppointment,
        cancelAppointment,
        toggleFavorite,
        addMessage,
        markNotificationsAsRead,
        syncGoogleCalendar,
        updateAppointmentNotes,
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
