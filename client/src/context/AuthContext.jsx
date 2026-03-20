import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('user'));
    if (saved?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${saved.token}`;
    }
    return saved || null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      api.get('/auth/me').then(({ data }) => {
        setUser(prev => ({ ...prev, ...data }));
      }).catch(() => {
        setUser(null);
        localStorage.removeItem('user');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Absolute Session Timeout (3 Hours = 10800000 ms)
  useEffect(() => {
    if (!user) return; // Only track session when logged in

    const TIMEOUT_MS = 3 * 60 * 60 * 1000; 

    let sessionStart = parseInt(localStorage.getItem('cartify_session_start') || '0', 10);
    if (!sessionStart) {
      sessionStart = Date.now();
      localStorage.setItem('cartify_session_start', sessionStart.toString());
    }

    const handleLogout = () => {
      logout().finally(() => {
        localStorage.removeItem('cartify_session_start');
        window.location.href = '/login?expired=true';
      });
    };

    if (Date.now() - sessionStart > TIMEOUT_MS) {
      handleLogout();
      return;
    }

    // Check every minute in the background
    const checkSession = setInterval(() => {
      if (Date.now() - sessionStart > TIMEOUT_MS) {
        handleLogout();
      }
    }, 60000); 

    return () => clearInterval(checkSession);
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('user');
      localStorage.removeItem('cartify_session_start');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
