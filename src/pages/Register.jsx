import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const { register, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isAdminRoute = window.location.pathname.endsWith('/admin');
  const [userType, setUserType] = useState(isAdminRoute ? 'admin' : 'client');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    try {
      await register(name, email, password, userType);
      navigate(userType === 'barber' ? '/barbeiro' : '/cliente');
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle(userType);
      navigate(userType === 'barber' ? '/barbeiro' : '/cliente');
    } catch {
      setError('Erro ao criar conta com Google.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <span>💈</span>
            <span className="text-gradient">BarberPro</span>
          </Link>
          <ThemeToggle />
        </div>

        <h1 className="heading-lg">Criar Conta</h1>
        <p className="text-body">Comece a usar o BarberPro agora mesmo</p>

        {/* User type toggle */}
        {isAdminRoute ? (
          <div className="badge badge-accent mt-md" style={{ alignSelf: 'center', width: 'fit-content', padding: '6px 12px', borderRadius: 'var(--radius)', fontWeight: 'bold' }}>
            Acesso Administrativo
          </div>
        ) : (
          <div className="tabs mt-lg">
            <button
              className={`tab ${userType === 'client' ? 'active' : ''}`}
              onClick={() => setUserType('client')}
            >
              Sou Cliente
            </button>
            <button
              className={`tab ${userType === 'barber' ? 'active' : ''}`}
              onClick={() => setUserType('barber')}
            >
              Sou Barbeiro
            </button>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="name">
              {userType === 'barber' ? 'Nome da Barbearia' : 'Seu Nome'}
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="name"
                type="text"
                className="input"
                placeholder={userType === 'barber' ? 'Ex: Barbearia do João' : 'Seu nome completo'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-email">E-mail</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-password">Senha</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="confirm-password">Confirmar Senha</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? (
              <span className="auth-loading">Criando conta...</span>
            ) : (
              <>
                <UserPlus size={18} />
                Criar Conta
              </>
            )}
          </button>
        </form>

        <div className="divider-text">ou</div>

        <button className="btn btn-secondary btn-full google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Cadastrar com Google
        </button>

        <p className="auth-footer-text">
          Já tem uma conta? <Link to={isAdminRoute ? "/login/admin" : "/login"} className="auth-link">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
