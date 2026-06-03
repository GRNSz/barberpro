import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

const MOCK_USERS = {
  client: {
    uid: 'client-001',
    name: 'Carlos Silva',
    email: 'carlos@email.com',
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    address: 'Rua dos Clientes, 456 — Vila Madalena',
    avatar: null,
  },
  barber: {
    uid: 'barber-001',
    name: 'João Barbeiro',
    email: 'joao@barbearia.com',
    phone: '(11) 99999-8888',
    whatsapp: '5511999998888',
    address: 'Rua das Flores, 123 — Centro',
    avatar: null,
    barbershopName: 'Barbearia do João',
    barbershopDescription: 'A melhor barbearia da cidade. Atendimento premium com o melhor custo-benefício.',
  },
  admin: {
    uid: 'admin-001',
    name: 'Admin Master',
    email: 'admin@barberpro.com',
    phone: '(11) 90000-0000',
    whatsapp: '5511900000000',
    address: 'Sede BarberPro, 999 — Alphaville',
    avatar: null,
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true); // Default to loading while checking session

  // Check active session on mount (cookie verification)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setUserType(data.userType);
        }
      } catch (err) {
        console.warn("Nenhuma sessão ativa encontrada.");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const loginAsClient = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'carlos@email.com', role: 'client' })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserType(data.userType);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsBarber = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'joao@barbearia.com', role: 'barber' })
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserType(data.userType);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email, password, type) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: type })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao realizar login');
      }
      const data = await response.json();
      setUser(data.user);
      setUserType(data.userType);
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback((type) => {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

      // Check BEFORE touching the Google SDK — prevents the 401 invalid_client popup
      const isDummy = !clientId 
        || clientId.includes('dummy') 
        || clientId.includes('YOUR_GOOGLE_CLIENT_ID')
        || clientId.length < 20;

      if (isDummy || !window.google) {
        if (!isDummy) {
          console.warn("Google SDK not loaded. Falling back to mock login.");
        } else {
          console.warn("Google Client ID not configured. Using simulated login.");
        }
        loginWithEmail(
          type === 'barber' ? 'joao@barbearia.com' : type === 'admin' ? 'admin@barberpro.com' : 'carlos@email.com',
          'dummy',
          type
        ).then(resolve).catch(reject);
        return;
      }

      setLoading(true);

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                localStorage.setItem('barberpro_google_access_token', tokenResponse.access_token);
                localStorage.setItem('barberpro_google_calendar_synced', 'true');
                
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                
                if (!res.ok) throw new Error("Falha ao obter perfil do Google");
                const profile = await res.json();
                
                // Login at backend to set secure cookie session
                const backendRes = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: profile.email, role: type })
                });

                if (!backendRes.ok) throw new Error("Falha ao registrar sessão no backend");
                const backendData = await backendRes.json();
                
                setUser(backendData.user);
                setUserType(backendData.userType);
                setLoading(false);
                resolve();
              } catch (err) {
                console.error("Google login error, falling back to mock:", err);
                loginWithEmail(
                  type === 'barber' ? 'joao@barbearia.com' : type === 'admin' ? 'admin@barberpro.com' : 'carlos@email.com',
                  'dummy',
                  type
                ).then(resolve).catch(reject);
              }
            } else {
              setLoading(false);
              reject(new Error("Token de acesso inválido"));
            }
          },
          error_callback: (err) => {
            setLoading(false);
            reject(err);
          }
        });
        
        client.requestAccessToken();
      } catch (err) {
        console.error("GIS init error:", err);
        loginWithEmail(
          type === 'barber' ? 'joao@barbearia.com' : type === 'admin' ? 'admin@barberpro.com' : 'carlos@email.com',
          'dummy',
          type
        ).then(resolve).catch(reject);
      }
    });
  }, [loginWithEmail]);

  const register = useCallback(async (name, email, password, type) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: type })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao registrar usuário');
      }
      const data = await response.json();
      setUser(data.user);
      setUserType(data.userType);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao atualizar perfil no servidor');
      }

      const resData = await response.json();
      setUser(resData.user);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      // Fallback local caso esteja sem rede
      setUser((prev) => ({ ...prev, ...data }));
      throw err;
    }
  }, []);

  const updatePassword = useCallback((oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (oldPassword.length < 3) {
          reject(new Error('Senha atual incorreta'));
        } else {
          resolve();
        }
      }, 500);
    });
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error on server:', err);
    }
    setUser(null);
    setUserType(null);
    localStorage.removeItem('barberpro_google_access_token');
    localStorage.removeItem('barberpro_google_calendar_synced');
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        isAuthenticated: !!user,
        loginAsClient,
        loginAsBarber,
        loginWithEmail,
        loginWithGoogle,
        register,
        updateProfile,
        updatePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
