import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
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
