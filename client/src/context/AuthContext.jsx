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

  // Inactivity Timeout Logic (3 Hours = 10800000ms)
  useEffect(() => {
    if (!user) return; // Only track activity when logged in

    const TIMEOUT_MS = 3 * 60 * 60 * 1000;
    
    const updateActivity = () => {
      localStorage.setItem('cartify_last_activity', Date.now().toString());
    };

    // Initialize activity immediately
    updateActivity();

    // Debounce activity updates to save performance
    let debounceTimer;
    const handleActivity = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateActivity, 1000);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));

    const checkInactivity = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('cartify_last_activity') || '0', 10);
      if (Date.now() - lastActivity > TIMEOUT_MS) {
        logout().finally(() => {
          localStorage.removeItem('cartify_last_activity');
          window.location.href = '/login?expired=true';
        });
      }
    }, 60000); // Check every minute

    return () => {
      clearTimeout(debounceTimer);
      clearInterval(checkInactivity);
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
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
    await api.post('/auth/logout');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
