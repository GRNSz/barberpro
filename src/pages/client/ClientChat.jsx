import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getInitials } from '../../utils/mockData';
import { Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './ClientChat.css';

export default function ClientChat() {
  const { user } = useAuth();
  const { conversations, messages, subscribeToChat, addMessage } = useData();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Client chats with the barbershop they last interacted with
  // Use the first (most recent) conversation
  const activeConv = conversations[0] || null;
  const convId = activeConv?.id;

  // The barber's uid is the conversation id when set up by addAppointment
  // convId = client's uid (set when barber opens) or barbershop owner uid
  const currentMessages = convId ? (messages[convId] || []) : [];

  // Subscribe to Firebase real-time chat
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (convId) {
      unsubscribeRef.current = subscribeToChat(convId);
    }
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [convId, subscribeToChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  const handleSend = useCallback(async () => {
    const text = newMessage.trim();
    if (!text || !user || !convId) return;

    // The recipient is the barber — get their uid from conversation clientId field
    // When barber creates conv for client, clientId = client uid, so barber uid = conv.id
    const recipientId = activeConv?.barberId || convId;
    const recipientType = 'barber';

    await addMessage(
      convId,
      text,
      user.uid,
      user.name,
      recipientId,
      recipientType
    );
    setNewMessage('');
    inputRef.current?.focus();
  }, [newMessage, user, convId, activeConv, addMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (timestamp) => {
    try {
      return format(parseISO(timestamp), 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (timestamp) => {
    try {
      return format(parseISO(timestamp), "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return '';
    }
  };

  // Group messages by date
  const groupedMessages = currentMessages.reduce((groups, msg) => {
    const dateKey = msg.timestamp?.split('T')[0] || 'hoje';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  const barberName = activeConv?.clientName || 'Barbearia';

  if (!activeConv) {
    return (
      <div className="page-enter client-chat">
        <div className="chat-no-conv">
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Send size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3 className="heading-md">Nenhuma conversa ainda</h3>
            <p className="text-body text-muted" style={{ marginTop: '0.5rem' }}>
              Faça um agendamento para iniciar uma conversa com a barbearia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter client-chat">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="avatar avatar-placeholder chat-header-avatar">
            {getInitials(barberName)}
          </div>
          <div className="chat-header-details">
            <span className="chat-header-name">{barberName}</span>
            <span className="chat-header-status">
              <span className="online-dot" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
          <div key={dateKey} className="chat-date-group">
            <div className="chat-date-divider">
              <span>{formatMessageDate(msgs[0].timestamp)}</span>
            </div>
            {msgs.map((msg) => {
              const isMe = msg.senderId === user?.uid;
              return (
                <div
                  key={msg.id || msg.firebaseKey}
                  className={`chat-bubble-row ${isMe ? 'sent' : 'received'}`}
                >
                  {!isMe && (
                    <div className="avatar avatar-sm avatar-placeholder chat-bubble-avatar">
                      {getInitials(barberName)}
                    </div>
                  )}
                  <div className={`chat-bubble ${isMe ? 'bubble-sent' : 'bubble-received'}`}>
                    <p className="chat-bubble-text">{msg.text}</p>
                    <span className="chat-bubble-time">{formatMessageTime(msg.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {currentMessages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
            <p className="text-small">Inicie a conversa!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="input chat-input"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`chat-send-btn ${newMessage.trim() ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            aria-label="Enviar mensagem"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
