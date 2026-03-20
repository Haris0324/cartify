import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const isAdminMode = redirectTo === 'admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'admin' || isAdminMode) {
        navigate('/admin');
      } else {
        navigate(redirectTo || '/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    const API = import.meta.env.VITE_API_URL || '';
    window.location.href = `${API}/api/auth/${provider}`;
  };

  useEffect(() => {
    const err = searchParams.get('error');
    const expired = searchParams.get('expired');

    if (err === 'oauth_failed') {
      setError('OAuth login failed. Ensure Google/GitHub OAuth is configured in .env');
    } else if (expired === 'true') {
      setError('You have been logged out due to inactivity.');
    }
  }, [searchParams]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>Sign In</h1>
        <p>Welcome back to Cartify</p>

        <div className={styles.loginOptions}>
          <Link to="/login" className={`${styles.optionBtn} ${!isAdminMode ? styles.optionActive : ''}`}>
            Sign in as User
          </Link>
          <Link to="/login?redirect=admin" className={`${styles.optionBtn} ${isAdminMode ? styles.optionActive : ''}`}>
            Sign in as Admin
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            required
          />
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In with Email'}
          </button>
        </form>

        {!isAdminMode && (
          <>
            <div className={styles.divider}>or continue with</div>
            <div className={styles.oauth}>
              <button type="button" className={styles.oauthBtn} onClick={() => handleOAuth('google')}>
                <img src="https://www.google.com/favicon.ico" alt="" /> Google
              </button>
              <button type="button" className={styles.oauthBtn} onClick={() => handleOAuth('github')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </button>
            </div>
          </>
        )}

        <p className={styles.footer}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
