import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    if (error) {
      toast.error('Login failed. Please try again.');
      navigate('/login');
      return;
    }
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me').then(({ data }) => {
        const user = { ...data, token };
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
        window.location.reload();
      }).catch(() => {
        toast.error('Login failed');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <div style={{ padding: '4rem', textAlign: 'center' }}>Completing sign in...</div>;
}
