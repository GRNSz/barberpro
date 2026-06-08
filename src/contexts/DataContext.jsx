import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { database } from '../lib/firebase';
import { ref, onValue, push, set, serverTimestamp, off, update } from 'firebase/database';

const DataContext = createContext();

// Helper to push an appointment to Google Calendar API using REST
const addEventToGoogleCalendar = async (appointment, token) => {
  if (!token) return;
  const startDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
  if (isNaN(startDateTime.getTime())) return;
  const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000);
  try {
    await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: `💈 BarberPro — ${appointment.service}`,
        description: `Agendamento na ${appointment.barbershopName}`,
        start: { dateTime: startDateTime.toISOString(), timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endDateTime.toISOString(), timeZone: 'America/Sao_Paulo' }
      })
    });
  } catch (err) {
    console.warn('Google Calendar sync error:', err);
  }
};

export function DataProvider({ children }) {
  const { user, userType } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loyaltyCuts, setLoyaltyCuts] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [barbershops, setBarbershops] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('barberpro_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [googleCalendarSynced, setGoogleCalendarSynced] = useState(() =>
    localStorage.getItem('barberpro_google_calendar_synced') === 'true'
  );

  // Track Firebase listeners to unsubscribe on logout
  const listenersRef = useRef([]);
  const seenNotifIds = useRef(new Set());

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (time, freq, dur) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + dur);
      };
      const now = audioCtx.currentTime;
      playBeep(now, 587.33, 0.08); // D5
      playBeep(now + 0.1, 783.99, 0.12); // G5
    } catch (e) {
      console.warn('Could not play notification sound:', e);
    }
  };

  const showDesktopNotification = (title, body) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  // ─── FETCH BARBERSHOPS FROM API ───────────────────────────────────────────
  const fetchBarbershops = useCallback(async () => {
    try {
      const res = await fetch('/api/barbershops');
      if (res.ok) {
        const data = await res.json();
        setBarbershops(data);
      }
    } catch (err) {
      console.warn('Erro ao buscar barbearias:', err);
    }
  }, []);

  // ─── FETCH APPOINTMENTS FROM API ─────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
        localStorage.setItem('barberpro_appointments', JSON.stringify(data));
      }
    } catch (err) {
      const saved = localStorage.getItem('barberpro_appointments');
      if (saved) setAppointments(JSON.parse(saved));
    }
  }, []);

  const fetchLoyaltyCuts = useCallback(async (clientId) => {
    if (!clientId) return;
    try {
      const res = await fetch(`/api/appointments/loyalty/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setLoyaltyCuts(data.cuts_count);
        localStorage.setItem('barberpro_loyalty_cuts', String(data.cuts_count));
      }
    } catch (err) {
      const saved = localStorage.getItem('barberpro_loyalty_cuts');
      if (saved) setLoyaltyCuts(parseInt(saved, 10));
    }
  }, []);

  // Request desktop notification permissions on login
  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  // ─── FIREBASE REAL-TIME LISTENERS ────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      // Unsubscribe all listeners on logout
      listenersRef.current.forEach(unsubscribe => unsubscribe());
      listenersRef.current = [];
      setNotifications([]);
      setConversations([]);
      setMessages({});
      seenNotifIds.current.clear();
      return;
    }

    // Determine Firebase room — barbers own their shop channel, clients subscribe to it
    const shopChannel = userType === 'barber' ? `barbers/${user.uid}` : null;

    // ── Notifications listener ──
    const notifPath = userType === 'barber'
      ? `barbers/${user.uid}/notifications`
      : `clients/${user.uid}/notifications`;

    const notifRef = ref(database, notifPath);
    const notifListener = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([key, val]) => ({ firebaseKey: key, ...val }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        let hasNewUnread = false;
        list.forEach(n => {
          const id = n.firebaseKey;
          if (!seenNotifIds.current.has(id)) {
            if (!n.read) {
              hasNewUnread = true;
              showDesktopNotification(n.title || 'BarberPro', n.message || '');
            }
            seenNotifIds.current.add(id);
          }
        });

        if (hasNewUnread) {
          playNotificationSound();
        }

        setNotifications(list);
      } else {
        setNotifications([]);
      }
    });
    listenersRef.current.push(() => off(notifRef, 'value', notifListener));

    // ── Conversations listener ──
    const convsPath = userType === 'barber'
      ? `barbers/${user.uid}/conversations`
      : `clients/${user.uid}/conversations`;

    const convsRef = ref(database, convsPath);
    const convsListener = onValue(convsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([key, val]) => ({ id: key, ...val }))
          .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        setConversations(list);
      } else {
        setConversations([]);
      }
    });
    listenersRef.current.push(() => off(convsRef, 'value', convsListener));

    // ── Real-time appointments via Firebase ──
    const aptsPath = userType === 'barber'
      ? `barbers/${user.uid}/appointments`
      : `clients/${user.uid}/appointments`;

    const aptsRef = ref(database, aptsPath);
    const aptsListener = onValue(aptsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase signals an update — refetch from PostgreSQL for full data
        fetchAppointments();
        if (userType === 'client') fetchLoyaltyCuts(user.uid);
      }
    });
    listenersRef.current.push(() => off(aptsRef, 'value', aptsListener));

    // Initial load
    fetchAppointments();
    fetchBarbershops();
    if (userType === 'client') fetchLoyaltyCuts(user.uid);

    return () => {
      listenersRef.current.forEach(unsubscribe => unsubscribe());
      listenersRef.current = [];
    };
  }, [user, userType, fetchAppointments, fetchLoyaltyCuts, fetchBarbershops]);

  // ─── SAVE FAVORITES ──────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('barberpro_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // ─── ADD APPOINTMENT ─────────────────────────────────────────────────────
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
          barbershopId: barbershop.id || barbershop.owner_uid,
          barbershopName: barbershop.name,
          service: service.name,
          serviceId: service.id,
          date, time,
          price: service.price,
          notes,
          clientId: user.uid,
          clientName: user.name
        })
      });

      if (!response.ok) throw new Error('Falha ao agendar');
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

      setAppointments(prev => [formatted, ...prev]);

      // ── Firebase: notify barber in real-time ──
      // Find the shop owner_uid
      const shopOwnerId = barbershop.owner_uid || barbershop.id;
      if (shopOwnerId) {
        // Notify barber appointments node (triggers their listener)
        const barberAptsRef = ref(database, `barbers/${shopOwnerId}/appointments`);
        await set(barberAptsRef, { lastUpdate: Date.now(), trigger: formatted.id });

        // Create notification for barber
        const barberNotifRef = ref(database, `barbers/${shopOwnerId}/notifications`);
        await push(barberNotifRef, {
          type: 'new_appointment',
          title: 'Novo Agendamento',
          message: `${formatted.clientName} agendou ${formatted.service} para ${date.split('-').reverse().join('/')} às ${time}`,
          timestamp: new Date().toISOString(),
          read: false,
        });

        // Update barber conversation
        const barberConvRef = ref(database, `barbers/${shopOwnerId}/conversations/${user.uid}`);
        await set(barberConvRef, {
          id: user.uid,
          clientId: user.uid,
          clientName: user.name,
          lastMessage: `Agendou ${formatted.service} para ${date.split('-').reverse().join('/')} às ${time}`,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 1,
        });

        // Update client conversation
        const clientConvRef = ref(database, `clients/${user.uid}/conversations/${shopOwnerId}`);
        await set(clientConvRef, {
          id: shopOwnerId,
          barberId: shopOwnerId,
          clientName: barbershop.name,
          lastMessage: `Agendou ${formatted.service} para ${date.split('-').reverse().join('/')} às ${time}`,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        });
      }

      // Notify client's own appointments node (for their listener)
      const clientAptsRef = ref(database, `clients/${user.uid}/appointments`);
      await set(clientAptsRef, { lastUpdate: Date.now(), trigger: formatted.id });

      return formatted;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [user]);

  // ─── CONFIRM APPOINTMENT ──────────────────────────────────────────────────
  const confirmAppointment = useCallback(async (appointmentId) => {
    const googleToken = localStorage.getItem('barberpro_google_access_token');
    try {
      const response = await fetch(`/api/appointments/confirm/${appointmentId}`, {
        method: 'POST',
        headers: { ...(googleToken ? { 'Google-Access-Token': googleToken } : {}) }
      });
      if (!response.ok) throw new Error('Erro ao confirmar');

      setAppointments(prev =>
        prev.map(a => a.id === appointmentId ? { ...a, status: 'confirmado' } : a)
      );

      const apt = appointments.find(a => a.id === appointmentId);
      if (!apt) return;

      // Notify client via Firebase
      const clientNotifRef = ref(database, `clients/${apt.clientId}/notifications`);
      await push(clientNotifRef, {
        type: 'message',
        title: 'Agendamento Confirmado',
        message: `Seu agendamento para ${apt.service} na ${apt.barbershopName} foi confirmado!`,
        timestamp: new Date().toISOString(),
        read: false,
      });

      // Trigger client appointment update
      const clientAptsRef = ref(database, `clients/${apt.clientId}/appointments`);
      await set(clientAptsRef, { lastUpdate: Date.now(), trigger: appointmentId });

    } catch (err) {
      console.error(err);
    }
  }, [appointments]);

  // ─── COMPLETE APPOINTMENT ─────────────────────────────────────────────────
  const completeAppointment = useCallback(async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/complete/${appointmentId}`, { method: 'POST' });
      if (!response.ok) throw new Error('Erro ao concluir');

      setAppointments(prev =>
        prev.map(a => a.id === appointmentId ? { ...a, status: 'concluído' } : a)
      );

      const apt = appointments.find(a => a.id === appointmentId);
      if (apt) {
        fetchLoyaltyCuts(apt.clientId);
        // Notify client
        const clientNotifRef = ref(database, `clients/${apt.clientId}/notifications`);
        await push(clientNotifRef, {
          type: 'message',
          title: 'Corte Concluído!',
          message: `Seu ${apt.service} foi concluído. Obrigado pela visita! 💈`,
          timestamp: new Date().toISOString(),
          read: false,
        });
        const clientAptsRef = ref(database, `clients/${apt.clientId}/appointments`);
        await set(clientAptsRef, { lastUpdate: Date.now(), trigger: appointmentId });
      }
    } catch (err) {
      console.error(err);
    }
  }, [appointments, fetchLoyaltyCuts]);

  // ─── CANCEL APPOINTMENT ───────────────────────────────────────────────────
  const cancelAppointment = useCallback(async (appointmentId, role) => {
    try {
      const response = await fetch(`/api/appointments/cancel/${appointmentId}`, { method: 'POST' });
      if (!response.ok) throw new Error('Erro ao cancelar');

      setAppointments(prev =>
        prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelado' } : a)
      );

      const apt = appointments.find(a => a.id === appointmentId);
      if (!apt) return;

      // Notify the other side
      if (role === 'client' && apt.barbershopId) {
        // Try to find the shop owner to notify barber
        const barberNotifRef = ref(database, `barbers/${apt.barbershopId}/notifications`);
        await push(barberNotifRef, {
          type: 'cancelled',
          title: 'Agendamento Cancelado',
          message: `${apt.clientName} cancelou o horário de ${apt.date.split('-').reverse().join('/')} às ${apt.time}`,
          timestamp: new Date().toISOString(),
          read: false,
        });
        const barberAptsRef = ref(database, `barbers/${apt.barbershopId}/appointments`);
        await set(barberAptsRef, { lastUpdate: Date.now(), trigger: appointmentId });
      } else if (role === 'barber') {
        const clientNotifRef = ref(database, `clients/${apt.clientId}/notifications`);
        await push(clientNotifRef, {
          type: 'cancelled',
          title: 'Agendamento Cancelado',
          message: `O barbeiro cancelou o horário de ${apt.date.split('-').reverse().join('/')} às ${apt.time}`,
          timestamp: new Date().toISOString(),
          read: false,
        });
        const clientAptsRef = ref(database, `clients/${apt.clientId}/appointments`);
        await set(clientAptsRef, { lastUpdate: Date.now(), trigger: appointmentId });
      }
    } catch (err) {
      console.error(err);
    }
  }, [appointments]);

  // ─── CHAT: SEND MESSAGE ──────────────────────────────────────────────────
  const addMessage = useCallback(async (convId, text, senderId, senderName, recipientId, recipientType) => {
    const msgData = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const isSenderBarber = userType === 'barber';
    const clientId = isSenderBarber ? recipientId : senderId;
    const barberId = isSenderBarber ? senderId : recipientId;

    // Write to Firebase — client's chat node
    const clientMsgRef = ref(database, `clients/${clientId}/chats/${barberId}`);
    await push(clientMsgRef, msgData);

    // Write to Firebase — barber's chat node
    const barberMsgRef = ref(database, `barbers/${barberId}/chats/${clientId}`);
    await push(barberMsgRef, msgData);

    // Update conversations metadata for client
    const clientConvRef = ref(database, `clients/${clientId}/conversations/${barberId}`);
    await update(clientConvRef, {
      lastMessage: text,
      lastMessageTime: new Date().toISOString(),
      unreadCount: isSenderBarber ? 1 : 0
    });

    // Update conversations metadata for barber
    const barberConvRef = ref(database, `barbers/${barberId}/conversations/${clientId}`);
    await update(barberConvRef, {
      lastMessage: text,
      lastMessageTime: new Date().toISOString(),
      unreadCount: isSenderBarber ? 0 : 1
    });

    // Send visual notification to recipient's Firebase notifications node
    const notifPath = isSenderBarber
      ? `clients/${clientId}/notifications`
      : `barbers/${barberId}/notifications`;
    const notifRef = ref(database, notifPath);
    await push(notifRef, {
      type: 'message',
      title: isSenderBarber ? 'Nova mensagem do Barbeiro' : 'Nova mensagem do Cliente',
      message: `${senderName}: ${text}`,
      timestamp: new Date().toISOString(),
      read: false,
      convId: isSenderBarber ? barberId : clientId
    });

    // Update local state
    setMessages(prev => ({
      ...prev,
      [convId]: [...(prev[convId] || []), msgData]
    }));
    setConversations(prev =>
      prev.map(c => c.id === convId
        ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
        : c
      )
    );
  }, [userType]);

  // ─── LISTEN TO CHAT MESSAGES ──────────────────────────────────────────────
  const subscribeToChat = useCallback((convId, callback) => {
    if (!user) return () => {};
    const chatType = userType === 'barber' ? 'barbers' : 'clients';
    const chatRef = ref(database, `${chatType}/${user.uid}/chats/${convId}`);

    const listener = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data)
          .map(([key, val]) => ({ firebaseKey: key, ...val }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(prev => ({ ...prev, [convId]: msgs }));
        if (callback) callback(msgs);
      }
    });

    return () => off(chatRef, 'value', listener);
  }, [user, userType]);

  // ─── MARK NOTIFICATIONS AS READ ──────────────────────────────────────────
  const markNotificationsAsRead = useCallback(async () => {
    if (!user) return;
    const notifType = userType === 'barber' ? 'barbers' : 'clients';
    const notifRef = ref(database, `${notifType}/${user.uid}/notifications`);
    // Mark all as read locally
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Update in Firebase
    const updates = {};
    notifications.forEach(n => {
      if (n.firebaseKey && !n.read) {
        updates[`${notifType}/${user.uid}/notifications/${n.firebaseKey}/read`] = true;
      }
    });
    if (Object.keys(updates).length > 0) {
      try {
        await update(ref(database), updates);
      } catch (e) {
        console.warn('Could not mark notifications as read in Firebase:', e);
      }
    }
  }, [user, userType, notifications]);

  // ─── TOGGLE FAVORITE ─────────────────────────────────────────────────────
  const toggleFavorite = useCallback((barbershopId) => {
    setFavorites(prev =>
      prev.includes(barbershopId)
        ? prev.filter(id => id !== barbershopId)
        : [...prev, barbershopId]
    );
  }, []);

  // ─── UPDATE APPOINTMENT NOTES ─────────────────────────────────────────────
  const updateAppointmentNotes = useCallback(async (appointmentId, notes, role) => {
    try {
      const response = await fetch(`/api/appointments/notes/${appointmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, role })
      });
      if (response.ok) {
        setAppointments(prev =>
          prev.map(a => {
            if (a.id !== appointmentId) return a;
            return role === 'barber'
              ? { ...a, barberNotes: notes }
              : { ...a, clientNotes: notes };
          })
        );
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  }, []);

  // ─── GOOGLE CALENDAR SYNC ────────────────────────────────────────────────
  const syncGoogleCalendar = useCallback(() => {
    return new Promise((resolve) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      const isDummy = !clientId || clientId.includes('dummy') || clientId.length < 20;
      if (isDummy || !window.google) {
        setGoogleCalendarSynced(true);
        localStorage.setItem('barberpro_google_calendar_synced', 'true');
        resolve();
        return;
      }
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/calendar.events',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              localStorage.setItem('barberpro_google_access_token', tokenResponse.access_token);
              setGoogleCalendarSynced(true);
              localStorage.setItem('barberpro_google_calendar_synced', 'true');
              appointments.forEach(a => addEventToGoogleCalendar(a, tokenResponse.access_token));
              resolve();
            }
          },
          error_callback: () => { setGoogleCalendarSynced(true); resolve(); }
        });
        client.requestAccessToken();
      } catch {
        setGoogleCalendarSynced(true);
        resolve();
      }
    });
  }, [appointments]);

  return (
    <DataContext.Provider
      value={{
        appointments,
        notifications,
        conversations,
        messages,
        barbershops,
        favorites,
        googleCalendarSynced,
        loyaltyCuts,
        addAppointment,
        confirmAppointment,
        completeAppointment,
        cancelAppointment,
        toggleFavorite,
        addMessage,
        subscribeToChat,
        markNotificationsAsRead,
        syncGoogleCalendar,
        updateAppointmentNotes,
        fetchLoyaltyCuts,
        fetchBarbershops,
        fetchAppointments,
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
