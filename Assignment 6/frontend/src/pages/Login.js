import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>A</div>
          <div>
            <div style={styles.logoTitle}>AttendTrack</div>
            <div style={styles.logoSub}>Management System</div>
          </div>
        </div>

        <h2 style={styles.heading}>Sign in to your account</h2>
        <p style={styles.subheading}>Admin and Teachers only</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@school.edu"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={styles.note}>
          🔒 Students are not permitted to access this system.
        </div>
      </div>

      {/* Background decoration */}
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f1f45 0%, #1a3a78 50%, #0d2b6b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecor1: {
    position: 'absolute', top: '-120px', right: '-120px',
    width: '420px', height: '420px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    pointerEvents: 'none',
  },
  bgDecor2: {
    position: 'absolute', bottom: '-80px', left: '-80px',
    width: '300px', height: '300px',
    borderRadius: '50%',
    background: 'rgba(255,200,50,0.05)',
    pointerEvents: 'none',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px 44px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    position: 'relative',
    zIndex: 1,
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '14px',
    marginBottom: '32px',
  },
  logoMark: {
    width: '48px', height: '48px',
    background: 'linear-gradient(135deg, #1a3a78, #2a5bd7)',
    borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', fontWeight: '800', color: '#fff',
    fontFamily: 'Georgia, serif',
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: '18px', fontWeight: '700', color: '#0f1f45',
    fontFamily: 'Georgia, serif',
  },
  logoSub: { fontSize: '11px', color: '#7a8aa0', letterSpacing: '0.08em', textTransform: 'uppercase' },
  heading: {
    fontSize: '22px', fontWeight: '700', color: '#0f1f45',
    marginBottom: '4px', fontFamily: 'Georgia, serif',
  },
  subheading: { fontSize: '13px', color: '#7a8aa0', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
  fieldGroup: { marginBottom: '18px' },
  label: {
    display: 'block', fontSize: '11px', fontWeight: '600',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#5a6a7a', marginBottom: '6px',
  },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #dde3ec', borderRadius: '8px',
    fontSize: '14px', color: '#0f1f45',
    outline: 'none', transition: 'border-color .2s',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #1a3a78, #2a5bd7)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', letterSpacing: '0.02em',
    marginTop: '8px', transition: 'opacity .2s',
  },
  note: {
    marginTop: '24px', fontSize: '12px', color: '#9aabb8',
    textAlign: 'center', lineHeight: '1.5',
  },
};
