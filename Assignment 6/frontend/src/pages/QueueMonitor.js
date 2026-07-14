import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export default function QueueMonitor() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['queue-stats'],
    queryFn: () => api.get('/reports/queue/stats').then(r => r.data),
    refetchInterval: 5000,
  });

  const stats = data?.queue || {};

  const queueItems = [
    { label: 'Waiting', value: stats.waiting ?? '—', color: '#c67b00', bg: '#fff8e6', icon: '⏳' },
    { label: 'Active', value: stats.active ?? '—', color: '#2a5bd7', bg: '#eef2ff', icon: '⚙' },
    { label: 'Completed', value: stats.completed ?? '—', color: '#1a6b3c', bg: '#e6f4ed', icon: '✓' },
    { label: 'Failed', value: stats.failed ?? '—', color: '#c0392b', bg: '#fdecea', icon: '✕' },
    { label: 'Delayed', value: stats.delayed ?? '—', color: '#7a8aa0', bg: '#f0f4f8', icon: '⏱' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Queue Monitor</h1>
          <p style={styles.subtitle}>Real-time letter generation queue · Auto-refreshes every 5s</p>
        </div>
        <button style={styles.refreshBtn} onClick={() => refetch()}>↻ Refresh</button>
      </div>

      <div style={styles.statsGrid}>
        {queueItems.map(s => (
          <div key={s.label} style={{ ...styles.statCard, background: s.bg, border: `1.5px solid ${s.color}22` }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ ...styles.statValue, color: s.color }}>{isLoading ? '…' : s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Queue Architecture</h3>
        <div style={styles.archGrid}>
          {[
            ['📂', 'File Upload', 'CSV/Excel parsed in memory', '#eef2ff', '#2a5bd7'],
            ['🔍', 'Filter', 'Students below threshold identified', '#f0faf5', '#1a6b3c'],
            ['📋', 'Enqueue', 'Bull jobs created per student', '#fff8e6', '#c67b00'],
            ['📝', 'LaTeX', 'PDF letter compiled via pdflatex', '#f5f0ff', '#6a2bd7'],
            ['✉', 'Email', 'Sent to parent + CC teacher', '#fef0f0', '#c0392b'],
            ['📊', 'Log', 'Audit trail stored in MongoDB', '#f0f4f8', '#5a6a7a'],
          ].map(([icon, title, desc, bg, color]) => (
            <div key={title} style={{ ...styles.archCard, background: bg, borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f1f45', marginBottom: '3px' }}>{title}</div>
              <div style={{ fontSize: '12px', color: '#7a8aa0' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: '20px' }}>
        <h3 style={styles.cardTitle}>Job Retry Policy</h3>
        <div style={styles.policyGrid}>
          {[
            ['Max Attempts', '3 retries per job'],
            ['Backoff Strategy', 'Exponential: 5s → 10s → 20s'],
            ['Concurrency', '3 jobs processed simultaneously'],
            ['Stalled Job Recovery', 'Auto-retry on stall detection'],
            ['Completed Jobs Kept', 'Last 50 for audit'],
            ['Failed Jobs Kept', 'Last 100 for debugging'],
          ].map(([k, v]) => (
            <div key={k} style={styles.policyRow}>
              <span style={styles.policyKey}>{k}</span>
              <span style={styles.policyVal}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', fontFamily: "'DM Sans', sans-serif", background: '#f6f8fc', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#0f1f45', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  subtitle: { fontSize: '13px', color: '#7a8aa0' },
  refreshBtn: { padding: '10px 18px', background: '#f0f4f8', color: '#2a5bd7', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' },
  statCard: { borderRadius: '10px', padding: '20px', textAlign: 'center' },
  statValue: { fontSize: '2rem', fontWeight: '700', fontFamily: 'Georgia, serif' },
  statLabel: { fontSize: '11px', color: '#7a8aa0', marginTop: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#0f1f45', fontFamily: 'Georgia, serif', margin: '0 0 18px' },
  archGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  archCard: { borderRadius: '8px', padding: '16px' },
  policyGrid: { display: 'flex', flexDirection: 'column', gap: '0' },
  policyRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f4f8', fontSize: '13px' },
  policyKey: { fontWeight: '600', color: '#2d3748' },
  policyVal: { color: '#7a8aa0', fontFamily: 'monospace', fontSize: '12px' },
};
