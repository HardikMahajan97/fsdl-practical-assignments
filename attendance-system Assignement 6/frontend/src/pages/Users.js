import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Users() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher', department: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/auth/users').then(r => r.data),
  });

  const createUser = useMutation({
    mutationFn: (d) => api.post('/auth/register', d),
    onSuccess: () => {
      toast.success('User created successfully');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'teacher', department: '' });
      qc.invalidateQueries(['users']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create user'),
  });

  const deactivateUser = useMutation({
    mutationFn: (id) => api.patch(`/auth/users/${id}/deactivate`),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries(['users']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const users = data?.users || [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Users</h1>
          <p style={styles.subtitle}>Admin panel — Manage teacher and admin accounts</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>+ Add User</button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New User</h3>
          <div style={styles.formGrid}>
            {[['name', 'Full Name', 'text', 'Dr. Jane Smith'],
              ['email', 'Email', 'email', 'jane@school.edu'],
              ['password', 'Password', 'password', 'Min 8 characters'],
              ['department', 'Department', 'text', 'Science']].map(([id, label, type, placeholder]) => (
              <div key={id} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <input style={styles.input} type={type} placeholder={placeholder}
                  value={form[id]} onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))} />
              </div>
            ))}
            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <select style={styles.input} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <button style={styles.saveBtn} onClick={() => createUser.mutate(form)} disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating…' : 'Create User'}
            </button>
            <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {isLoading ? (
          <div style={styles.loading}>Loading users…</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Department', 'Last Login', 'Created', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={{ ...styles.avatar, background: u.role === 'admin' ? '#fef3e6' : '#eef2ff' }}>
                        <span style={{ color: u.role === 'admin' ? '#c67b00' : '#2a5bd7', fontWeight: '700', fontSize: '13px' }}>
                          {u.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f1f45' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px', color: '#5a6a7a' }}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={{ background: u.role === 'admin' ? '#fef3e6' : '#eef2ff', color: u.role === 'admin' ? '#c67b00' : '#2a5bd7', padding: '2px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: '#7a8aa0', fontSize: '12px' }}>{u.department || '—'}</td>
                  <td style={{ ...styles.td, fontSize: '12px', color: '#7a8aa0' }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td style={{ ...styles.td, fontSize: '12px', color: '#7a8aa0' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.deactivateBtn}
                      onClick={() => { if (window.confirm(`Deactivate ${u.name}?`)) deactivateUser.mutate(u._id); }}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', fontFamily: "'DM Sans', sans-serif", background: '#f6f8fc', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#0f1f45', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  subtitle: { fontSize: '13px', color: '#7a8aa0' },
  addBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a3a78, #2a5bd7)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,.07)', marginBottom: '20px', border: '1px solid #dde8f8' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#0f1f45', fontFamily: 'Georgia, serif', margin: '0 0 18px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  field: {},
  label: { display: 'block', fontSize: '11px', color: '#5a6a7a', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #dde3ec', borderRadius: '7px', fontSize: '13px', color: '#0f1f45', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
  saveBtn: { padding: '10px 22px', background: '#1a3a78', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '10px 22px', background: '#f0f4f8', color: '#5a6a7a', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  card: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 14px', fontSize: '10px', color: '#7a8aa0', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '2px solid #f0f4f8', background: '#f9fafb', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f0f4f8' },
  td: { padding: '12px 14px', fontSize: '13px', color: '#2d3748', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deactivateBtn: { padding: '5px 12px', fontSize: '11px', background: '#fdecea', border: 'none', borderRadius: '5px', cursor: 'pointer', color: '#c0392b', fontWeight: '600' },
  loading: { padding: '60px', textAlign: 'center', color: '#7a8aa0' },
};
