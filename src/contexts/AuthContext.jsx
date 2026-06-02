import { createContext, useContext, useState, useCallback } from 'react';

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
  const [loading, setLoading] = useState(false);

  const loginAsClient = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setUser(MOCK_USERS.client);
      setUserType('client');
      setLoading(false);
    }, 500);
  }, []);

  const loginAsBarber = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setUser(MOCK_USERS.barber);
      setUserType('barber');
      setLoading(false);
    }, 500);
  }, []);

  const loginWithEmail = useCallback((email, password, type) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = MOCK_USERS[type] || MOCK_USERS.client;
        setUser({ ...mockUser, email });
        setUserType(type);
        setLoading(false);
        resolve();
      }, 800);
    });
  }, []);

  const loginWithGoogle = useCallback((type) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = MOCK_USERS[type] || MOCK_USERS.client;
        setUser(mockUser);
        setUserType(type);
        setLoading(false);
        resolve();
      }, 800);
    });
  }, []);

  const register = useCallback((name, email, password, type) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const base = MOCK_USERS[type] || MOCK_USERS.client;
        setUser({ ...base, uid: 'new-user', name, email });
        setUserType(type);
        setLoading(false);
        resolve();
      }, 800);
    });
  }, []);

  const updateProfile = useCallback((data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser((prev) => ({ ...prev, ...data }));
        resolve();
      }, 500);
    });
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

  const logout = useCallback(() => {
    setUser(null);
    setUserType(null);
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
