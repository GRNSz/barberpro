import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { formatPrice } from '../utils/mockData';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './DailySummary.css';

const TODAY = '2026-06-02';
const CACHE_KEY = 'barberpro_daily_summary';



function getFallbackSummary(todayAppts) {
  const total = todayAppts.length;
  const revenue = todayAppts
    .filter((a) => a.status !== 'cancelado')
    .reduce((sum, a) => sum + a.price, 0);
  const pending = todayAppts.filter((a) => a.status === 'pendente').length;
  const first = todayAppts.sort((a, b) => a.time.localeCompare(b.time))[0];

  let text = `Bom dia João! Hoje você tem ${total} agendamentos com receita estimada de ${formatPrice(revenue)}.`;
  if (first) {
    text += ` Primeiro cliente: ${first.clientName} às ${first.time}.`;
  }
  if (pending > 0) {
    text += ` Atenção: ${pending} pendente(s) aguardando confirmação.`;
  } else {
    text += ' Todos confirmados! ✅';
  }
  return text;
}

export default function DailySummary() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAI, setIsAI] = useState(false);
  const { appointments } = useData();

  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => a.date === TODAY);
  }, [appointments]);

  const generateSummary = useCallback(async (forceRefresh = false) => {
    setLoading(true);

    // Check cache first
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { text, ai, date, appointmentsHash } = JSON.parse(cached);
          const currentHash = JSON.stringify(todayAppointments);
          if (date === TODAY && appointmentsHash === currentHash) {
            setSummary(text);
            setIsAI(ai);
            setLoading(false);
            return;
          }
        } catch { /* ignore parse errors */ }
      }
    }

    // Try Gemini API
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Gere um resumo curto e amigável (2-3 frases) para o barbeiro João sobre seu dia de trabalho. Dados dos agendamentos de hoje: ${JSON.stringify(todayAppointments)}. Inclua: total de agendamentos, receita estimada, primeiro cliente e horário, e pendências. Responda de forma direta, casual e com 1-2 emojis.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        const text = response.text;
        setSummary(text);
        setIsAI(true);
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            text,
            ai: true,
            date: TODAY,
            appointmentsHash: JSON.stringify(todayAppointments),
          })
        );
        setLoading(false);
        return;
      } catch (err) {
        console.error('DailySummary: Gemini API error, using fallback', err);
      }
    }

    // Fallback
    const fallback = getFallbackSummary(todayAppointments);
    setSummary(fallback);
    setIsAI(false);
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        text: fallback,
        ai: false,
        date: TODAY,
        appointmentsHash: JSON.stringify(todayAppointments),
      })
    );
    setLoading(false);
  }, [todayAppointments]);

  useEffect(() => {
    generateSummary();
  }, [generateSummary]);

  return (

    <div className="daily-summary animate-fade-in-up">
      <div className="daily-summary-card">
        <div className="daily-summary-header">
          <div className="daily-summary-title-row">
            <Sparkles size={20} className="daily-summary-icon" />
            <h2 className="daily-summary-title">Resumo do Dia</h2>
            <span className={`daily-summary-badge ${isAI ? 'badge-ai' : 'badge-auto'}`}>
              {isAI ? 'Gerado por IA ✨' : 'Resumo automático'}
            </span>
          </div>
          <button
            className="btn-icon btn-ghost daily-summary-refresh"
            onClick={() => generateSummary(true)}
            disabled={loading}
            title="Atualizar resumo"
            aria-label="Atualizar resumo"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>

        <div className="daily-summary-body">
          {loading ? (
            <div className="daily-summary-skeleton">
              <div className="skeleton-line skeleton-line-long" />
              <div className="skeleton-line skeleton-line-medium" />
              <div className="skeleton-line skeleton-line-short" />
            </div>
          ) : (
            <p className="daily-summary-text">{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
}
