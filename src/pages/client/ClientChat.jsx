import { useState, useRef, useEffect } from 'react';
import { MOCK_MESSAGES, MOCK_BARBER, getInitials } from '../../utils/mockData';
import { Send, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './ClientChat.css';

const CLIENT_ID = 'client-001';
const CONVERSATION_ID = 'conv-001';

export default function ClientChat() {
  const initialMessages = MOCK_MESSAGES[CONVERSATION_ID] || [];
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text) return;

    const msg = {
      id: `msg-local-${Date.now()}`,
      senderId: CLIENT_ID,
      senderName: 'Carlos Silva',
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (timestamp) => {
    try {
      const date = parseISO(timestamp);
      return format(date, 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (timestamp) => {
    try {
      const date = parseISO(timestamp);
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return '';
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = msg.timestamp.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  return (
    <div className="page-enter client-chat">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="avatar avatar-placeholder chat-header-avatar">
            {getInitials(MOCK_BARBER.name)}
          </div>
          <div className="chat-header-details">
            <span className="chat-header-name">{MOCK_BARBER.name}</span>
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
              const isMe = msg.senderId === CLIENT_ID;
              return (
                <div
                  key={msg.id}
                  className={`chat-bubble-row ${isMe ? 'sent' : 'received'}`}
                >
                  {!isMe && (
                    <div className="avatar avatar-sm avatar-placeholder chat-bubble-avatar">
                      {getInitials(MOCK_BARBER.name)}
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
