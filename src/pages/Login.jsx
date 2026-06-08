import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { loginWithEmail, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isAdminRoute = window.location.pathname.endsWith('/admin');
  const [userType, setUserType] = useState(isAdminRoute ? 'admin' : 'client');
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }
    try {
      await loginWithEmail(email, password, userType);
      let redirect = '/cliente';
      if (userType === 'barber') redirect = '/barbeiro';
      if (userType === 'admin') redirect = '/admin';
      navigate(redirect);
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    try {
      await loginWithGoogle(userType);
      let redirect = '/cliente';
      if (userType === 'barber') redirect = '/barbeiro';
      if (userType === 'admin') redirect = '/admin';
      navigate(redirect);
    } catch (err) {
      setError('Erro ao fazer login com o Google.');
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

        <h1 className="heading-lg">Bem-vindo de volta</h1>
        <p className="text-body">Entre na sua conta para continuar</p>

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
            <label className="input-label" htmlFor="email">E-mail</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
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
            <label className="input-label" htmlFor="password">Senha</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? (
              <span className="auth-loading">Entrando...</span>
            ) : (
              <>
                <LogIn size={18} />
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="divider-text">ou</div>

        <button type="button" className="btn btn-secondary btn-full google-btn" onClick={handleGoogleClick} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </button>

        <p className="auth-footer-text">
          Não tem uma conta? <Link to={isAdminRoute ? "/registro/admin" : "/registro"} className="auth-link">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
