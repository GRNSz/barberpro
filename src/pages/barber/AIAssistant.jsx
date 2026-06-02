import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MOCK_CLIENTS, MOCK_SERVICES, formatPrice } from '../../utils/mockData';
import { Send, Sparkles, Bot, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './AIAssistant.css';

const TODAY = '2026-06-02';

const SUGGESTION_CHIPS = [
  'Resumo do dia',
  'Próximo cliente',
  'Horários livres',
  'Receita do dia',
  'Clientes pendentes',
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: 'Olá João! 👋 Sou o BarberBot, seu assistente IA. Posso te ajudar com a agenda, lembrar de clientes e muito mais. O que precisa?',
};

function formatBotMessage(text) {
  if (!text) return '';

  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Handle line breaks
    const lines = part.split('\n');
    return lines.map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { appointments, notifications } = useData();

  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.date === TODAY),
    [appointments]
  );

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications]
  );

  const systemPrompt = useMemo(() => {
    return `Você é o BarberBot, assistente IA da Barbearia do João no app BarberPro.
Você ajuda o barbeiro João com sua agenda diária, lembretes de clientes e sugestões.
Responda de forma casual e direta, como um parceiro de trabalho. Use emojis moderadamente.
Seja conciso nas respostas (máximo 3-4 parágrafos).

DADOS DA AGENDA DE HOJE (${TODAY}):
${JSON.stringify(todayAppointments, null, 2)}

TODOS OS CLIENTES:
${JSON.stringify(MOCK_CLIENTS.map(c => ({ id: c.id, name: c.name, phone: c.phone, notes: c.notes, totalVisits: c.totalVisits, lastVisit: c.lastVisit, favoriteService: c.favoriteService })), null, 2)}

SERVIÇOS DISPONÍVEIS:
${JSON.stringify(MOCK_SERVICES.map(s => ({ name: s.name, price: s.price, duration: s.duration })), null, 2)}

NOTIFICAÇÕES RECENTES:
${JSON.stringify(unreadNotifications, null, 2)}`;
  }, [todayAppointments, unreadNotifications]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: trimmed,
        config: { systemInstruction: systemPrompt },
      });
      const text = response.text;
      setMessages((prev) => [...prev, { role: 'assistant', text }]);
    } catch (error) {
      console.error('Erro ao chamar Gemini:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '⚠️ Ops, tive um problema ao processar sua mensagem. Verifique sua conexão ou a chave da API e tente novamente.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [systemPrompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChipClick = (chip) => {
    sendMessage(chip);
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showChips = !isTyping && (messages.length <= 1 || messages[messages.length - 1]?.role === 'assistant');

  return (
    <div className="page-enter ai-assistant">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            <span>🤖</span>
          </div>
          <div>
            <h1 className="chat-header-title">BarberBot</h1>
            <span className="chat-header-status">Assistente IA</span>
          </div>
          <span className="chat-ai-badge">
            <Sparkles size={12} />
            IA
          </span>
        </div>
        <button
          className="btn-icon btn-ghost chat-clear-btn"
          onClick={handleClearChat}
          title="Limpar conversa"
          aria-label="Limpar conversa"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble-row ${msg.role === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}
          >
            {msg.role === 'assistant' && (
              <div className="chat-avatar-bot">🤖</div>
            )}
            <div
              className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}
            >
              <p className="chat-bubble-text">{formatBotMessage(msg.text)}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="chat-bubble-row chat-row-bot">
            <div className="chat-avatar-bot">🤖</div>
            <div className="chat-bubble chat-bubble-bot chat-typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {showChips && (
        <div className="chat-chips-wrapper">
          <div className="chat-chips">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                className="chat-chip"
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Pergunte ao BarberBot..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          autoComplete="off"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!input.trim() || isTyping}
          aria-label="Enviar mensagem"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
