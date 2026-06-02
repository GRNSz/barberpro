import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { Calendar, MessageSquare, Bell, Shield, Star, ChevronRight, Scissors } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: Calendar, title: 'Agendamento Online', desc: 'Seus clientes agendam pelo app, a qualquer hora, sem precisar ligar.' },
  { icon: MessageSquare, title: 'Chat Integrado', desc: 'Converse com seus clientes direto pelo app, tire dúvidas e confirme horários.' },
  { icon: Bell, title: 'Notificações', desc: 'Receba alertas de novos agendamentos, cancelamentos e mensagens.' },
  { icon: Shield, title: 'Ficha do Cliente', desc: 'Anotações, preferências e histórico de cada cliente na palma da mão.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-navbar">
        <div className="landing-brand">
          <span className="landing-brand-icon">💈</span>
          <span className="landing-brand-name">BarberPro</span>
        </div>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
          <Link to="/registro" className="btn btn-primary btn-sm">Começar Grátis</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Star size={14} />
            <span>A plataforma #1 para barbearias</span>
          </div>
          <h1 className="heading-xl">
            Gerencie sua <span className="text-gradient">barbearia</span> como um profissional
          </h1>
          <p className="hero-subtitle">
            Agendamento online, gestão de clientes, chat integrado e muito mais. 
            Tudo o que você precisa para modernizar seu negócio.
          </p>
          <div className="hero-actions">
            <Link to="/registro" className="btn btn-primary btn-lg">
              <Scissors size={20} />
              Cadastrar Minha Barbearia
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sou Cliente
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">1.200+</span>
              <span className="hero-stat-label">Barbearias</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">50K+</span>
              <span className="hero-stat-label">Agendamentos/mês</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">4.9</span>
              <span className="hero-stat-label">Avaliação</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="hero-floating-card card-1">
              <div className="hfc-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✓</div>
              <div>
                <div className="hfc-title">Novo Agendamento</div>
                <div className="hfc-desc">Carlos Silva — Corte + Barba</div>
              </div>
            </div>
            <div className="hero-floating-card card-2">
              <div className="hfc-icon" style={{ background: 'rgba(200,169,110,0.15)', color: 'var(--accent-primary)' }}>💈</div>
              <div>
                <div className="hfc-title">Hoje — 5 clientes</div>
                <div className="hfc-desc">Receita estimada: R$ 280,00</div>
              </div>
            </div>
            <div className="hero-floating-card card-3">
              <div className="hfc-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>💬</div>
              <div>
                <div className="hfc-title">Nova mensagem</div>
                <div className="hfc-desc">Pedro: "Ficou top o corte!"</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="heading-lg">Tudo que sua barbearia precisa</h2>
          <p className="text-body">Ferramentas profissionais para gerenciar e crescer seu negócio.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card card">
              <div className="feature-icon">
                <f.icon size={24} />
              </div>
              <h3 className="heading-sm">{f.title}</h3>
              <p className="text-body">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card card-glass">
          <h2 className="heading-lg">Pronto para começar?</h2>
          <p className="text-body">Cadastre sua barbearia em menos de 2 minutos. É grátis!</p>
          <Link to="/registro" className="btn btn-primary btn-lg">
            Começar Agora
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© 2026 BarberPro — Feito com ❤️ para barbeiros.</span>
      </footer>
    </div>
  );
}
