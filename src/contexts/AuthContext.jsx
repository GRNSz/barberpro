import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auth as firebaseAuth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';

const AuthContext = createContext();

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

          // Authenticate to Firebase anonymously if not already logged in
          if (!firebaseAuth.currentUser) {
            await signInAnonymously(firebaseAuth).catch(err => 
              console.warn("Firebase Auth anonymous login failed:", err)
            );
          }
        }
      } catch (err) {
        console.warn("Nenhuma sessão ativa encontrada.");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
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

      // Authenticate to Firebase anonymously for DB writes
      if (!firebaseAuth.currentUser) {
        await signInAnonymously(firebaseAuth).catch(err => 
          console.warn("Firebase Auth anonymous login failed:", err)
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback((type) => {
    return new Promise(async (resolve, reject) => {
      setLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        // Force account selection screen
        provider.setCustomParameters({
          prompt: 'select_account'
        });

        const result = await signInWithPopup(firebaseAuth, provider);
        const fbUser = result.user;

        if (!fbUser || !fbUser.email) {
          throw new Error("Não foi possível obter o e-mail da conta Google.");
        }

        // Login at backend to set secure session cookie
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: fbUser.email,
            role: type,
            name: fbUser.displayName,
            avatar: fbUser.photoURL
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Falha ao autenticar no servidor');
        }

        const data = await response.json();
        setUser(data.user);
        setUserType(data.userType);
        resolve();
      } catch (err) {
        console.error('Google login error:', err);
        reject(err);
      } finally {
        setLoading(false);
      }
    });
  }, []);

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

      // Authenticate to Firebase anonymously for DB writes
      if (!firebaseAuth.currentUser) {
        await signInAnonymously(firebaseAuth).catch(err => 
          console.warn("Firebase Auth anonymous login failed:", err)
        );
      }
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

    // Sign out from Firebase Auth
    if (firebaseAuth.currentUser) {
      await firebaseAuth.signOut().catch(err => 
        console.warn("Firebase Auth signOut failed:", err)
      );
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        isAuthenticated: !!user,
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
