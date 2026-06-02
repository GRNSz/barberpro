import { useState, useRef, useEffect, useMemo } from 'react';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, getInitials } from '../../utils/mockData';
import { formatTimeAgo } from '../../utils/helpers';
import Navbar from '../../components/Navbar';
import { Send, ArrowLeft, Search, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './BarberChat.css';

const BARBER_ID = 'barber-001';

export default function BarberChat() {
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState(() => {
    // Deep-copy so we don't mutate the mock
    const copy = {};
    Object.keys(MOCK_MESSAGES).forEach((k) => {
      copy[k] = MOCK_MESSAGES[k].map((m) => ({ ...m }));
    });
    return copy;
  });
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const filteredConversations = useMemo(
    () =>
      MOCK_CONVERSATIONS.filter((c) =>
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  const selectedConv = useMemo(
    () => MOCK_CONVERSATIONS.find((c) => c.id === selectedConvId),
    [selectedConvId]
  );

  const currentMessages = selectedConvId ? messages[selectedConvId] || [] : [];

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, selectedConvId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId) return;

    const msg = {
      id: `msg-${Date.now()}`,
      senderId: BARBER_ID,
      senderName: 'Barbearia do João',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), msg],
    }));
    setNewMessage('');
  };

  const formatMsgTime = (ts) => {
    try {
      return format(parseISO(ts), 'HH:mm', { locale: ptBR });
    } catch {
      return format(new Date(ts), 'HH:mm', { locale: ptBR });
    }
  };

  return (
    <>
      <Navbar title="Mensagens" />
      <div className="page-enter barber-chat">
        {/* Conversations Panel */}
        <aside className={`chat-sidebar ${selectedConvId ? 'chat-sidebar-hidden-mobile' : ''}`}>
          <div className="chat-sidebar-header">
            <h2 className="heading-md">Conversas</h2>
          </div>

          <div className="chat-search">
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <input
                className="input"
                type="text"
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-conversation-list">
            {filteredConversations.length === 0 ? (
              <div className="chat-empty-conversations">
                <MessageSquare size={32} />
                <p className="text-small">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`chat-conversation-item ${selectedConvId === conv.id ? 'active' : ''}`}
                  onClick={() => setSelectedConvId(conv.id)}
                >
                  <div className="avatar avatar-placeholder chat-conv-avatar">
                    {getInitials(conv.clientName)}
                  </div>
                  <div className="chat-conv-info">
                    <div className="chat-conv-top">
                      <span className="chat-conv-name">{conv.clientName}</span>
                      <span className="chat-conv-time">{formatTimeAgo(conv.lastMessageTime)}</span>
                    </div>
                    <p className="chat-conv-preview">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="chat-unread-badge">{conv.unreadCount}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat Panel */}
        <div className={`chat-main ${selectedConvId ? 'chat-main-visible-mobile' : ''}`}>
          {!selectedConvId ? (
            <div className="chat-no-selection">
              <MessageSquare size={56} />
              <h3 className="heading-md">Selecione uma conversa</h3>
              <p className="text-body">Escolha uma conversa ao lado para visualizar as mensagens</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button
                  className="btn btn-icon btn-ghost chat-back-btn"
                  onClick={() => setSelectedConvId(null)}
                  aria-label="Voltar"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="avatar avatar-placeholder chat-header-avatar">
                  {getInitials(selectedConv?.clientName)}
                </div>
                <div className="chat-header-info">
                  <h3 className="chat-header-name">{selectedConv?.clientName}</h3>
                  <span className="chat-header-status">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {currentMessages.map((msg) => {
                  const isBarber = msg.senderId === BARBER_ID;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-message ${isBarber ? 'chat-message-sent' : 'chat-message-received'}`}
                    >
                      <div className="chat-bubble">
                        <p className="chat-bubble-text">{msg.text}</p>
                        <span className="chat-bubble-time">{formatMsgTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  className="input chat-input"
                  type="text"
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-icon chat-send-btn"
                  type="submit"
                  disabled={!newMessage.trim()}
                  aria-label="Enviar"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
