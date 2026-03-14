import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import styles from './Account.module.css';

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', address: {}, phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.get('/users/profile').then(({ data }) => setProfile(data));
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', profile);
      toast.success('Profile updated');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleForgotPassword = async () => {
    try {
      await api.post('/auth/forgot-password', { email: user.email });
      toast.success('Check your email for the reset link');
    } catch { toast.error('Failed to send reset email'); }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <h1>Account Settings</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.group}>
          <label>Name</label>
          <input
            value={profile.name || ''}
            onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className={styles.group}>
          <label>Email</label>
          <input value={user.email} disabled />
        </div>
        <div className={styles.group}>
          <label>Phone</label>
          <input
            value={profile.phone || ''}
            onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <h3>Address</h3>
        <div className={styles.group}>
          <label>Street</label>
          <input
            value={profile.address?.street || ''}
            onChange={(e) => setProfile(p => ({
              ...p,
              address: { ...p.address, street: e.target.value }
            }))}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.group}>
            <label>City</label>
            <input
              value={profile.address?.city || ''}
              onChange={(e) => setProfile(p => ({
                ...p,
                address: { ...p.address, city: e.target.value }
              }))}
            />
          </div>
          <div className={styles.group}>
            <label>State</label>
            <input
              value={profile.address?.state || ''}
              onChange={(e) => setProfile(p => ({
                ...p,
                address: { ...p.address, state: e.target.value }
              }))}
            />
          </div>
          <div className={styles.group}>
            <label>ZIP</label>
            <input
              value={profile.address?.zip || ''}
              onChange={(e) => setProfile(p => ({
                ...p,
                address: { ...p.address, zip: e.target.value }
              }))}
            />
          </div>
        </div>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <p className={styles.resetWrap}>
          <button type="button" className={styles.resetLink} onClick={handleForgotPassword}>
            Send password reset email
          </button>
        </p>
      </form>
    </div>
  );
}
