import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { getInitials } from '../utils/mockData';
import {
  LayoutDashboard, CalendarDays, Scissors, Users, MessageSquare,
  Bell, LogOut, Menu, X, Clock, MapPin, UserCircle, Bot, BookOpen, Shield, TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const barberLinks = [
  { to: '/barbeiro', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/barbeiro/agenda', icon: CalendarDays, label: 'Agenda' },
  { to: '/barbeiro/servicos', icon: Scissors, label: 'Serviços' },
  { to: '/barbeiro/financeiro', icon: TrendingUp, label: 'Financeiro' },
  { to: '/barbeiro/clientes', icon: Users, label: 'Clientes' },
  { to: '/barbeiro/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/barbeiro/assistente', icon: Bot, label: 'Assistente IA' },
  { to: '/barbeiro/perfil', icon: UserCircle, label: 'Perfil' },
];

const clientLinks = [
  { to: '/cliente', icon: LayoutDashboard, label: 'Início', end: true },
  { to: '/cliente/explorar', icon: MapPin, label: 'Explorar' },
  { to: '/cliente/agendar', icon: CalendarDays, label: 'Agendar' },
  { to: '/cliente/agendamentos', icon: Clock, label: 'Meus Horários' },
  { to: '/cliente/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/cliente/blog', icon: BookOpen, label: 'Blog de Dicas' },
  { to: '/cliente/perfil', icon: UserCircle, label: 'Perfil' },
];

const adminLinks = [
  { to: '/admin', icon: Shield, label: 'Painel Master', end: true },
];

export default function Sidebar() {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links =
    userType === 'barber'
      ? barberLinks
      : userType === 'admin'
      ? adminLinks
      : clientLinks;
  // Bottom nav: show first 5 items for space
  const bottomLinks = links.slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sidebar-mobile-toggle btn-icon btn-ghost"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">💈</span>
          <h1>BarberPro</h1>
          <button
            className="sidebar-close btn-icon btn-ghost"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle />
          <div className="divider" />
          <div className="sidebar-user">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="avatar avatar-sm" />
            ) : (
              <div className="avatar avatar-sm avatar-placeholder">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-role">
                {userType === 'barber' ? 'Barbeiro' : userType === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </div>
          </div>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {bottomLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
