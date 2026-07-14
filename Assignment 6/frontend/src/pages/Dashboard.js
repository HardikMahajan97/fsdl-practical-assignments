import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={{ ...styles.statValue, color }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
    {sub && <div style={styles.statSub}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: () => api.get('/reports?limit=5').then(r => r.data),
    refetchInterval: 30000,
  });

  const reports = data?.reports || [];
  const total = data?.total || 0;

  const chartData = reports.map(r => ({
    name: r.className || r.originalFileName?.replace(/\.[^.]+$/, '').slice(0, 12) || 'Report',
    below: r.belowThresholdCount,
    total: r.totalStudents,
  }));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button style={styles.uploadBtn} onClick={() => navigate('/upload')}>
          + Upload Report
        </button>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Reports" value={total} icon="📋" color="#1a3a78" />
        <StatCard label="Recent Reports" value={reports.length} sub="Last 5 uploaded" icon="📁" color="#2a7d4f" />
        <StatCard
          label="Below Threshold"
          value={reports.reduce((a, r) => a + r.belowThresholdCount, 0)}
          sub="Across recent reports"
          icon="⚠"
          color="#c0392b"
        />
        <StatCard
          label="Completed"
          value={reports.filter(r => r.status === 'completed').length}
          sub="Letters sent"
          icon="✓"
          color="#d4a017"
        />
      </div>

      <div style={styles.grid2}>
        {/* Recent Reports Table */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Reports</h3>
            <button style={styles.linkBtn} onClick={() => navigate('/reports')}>View All →</button>
          </div>
          {isLoading ? (
            <div style={styles.loading}>Loading…</div>
          ) : reports.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
              <p>No reports yet. Upload your first attendance file.</p>
              <button style={styles.emptyBtn} onClick={() => navigate('/upload')}>Upload Now</button>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['File', 'Class', 'Students', 'Below 75%', 'Status', ''].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.fileName}>{r.originalFileName || '—'}</span>
                    </td>
                    <td style={styles.td}>{r.className || '—'} {r.section || ''}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>{r.totalStudents}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={{ color: r.belowThresholdCount > 0 ? '#c0392b' : '#2a7d4f', fontWeight: '600' }}>
                        {r.belowThresholdCount}
                      </span>
                    </td>
                    <td style={styles.td}><StatusBadge status={r.status} /></td>
                    <td style={styles.td}>
                      <button style={styles.viewBtn} onClick={() => navigate(`/reports/${r._id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Chart */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Attendance Overview</h3>
            <span style={styles.chartLegend}>
              <span style={{ color: '#c0392b' }}>■</span> Below 75%
              <span style={{ color: '#1a3a78', marginLeft: '10px' }}>■</span> Total
            </span>
          </div>
          {chartData.length === 0 ? (
            <div style={styles.empty}><p>No data to chart yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7a8aa0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#7a8aa0' }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
                <Bar dataKey="total" fill="#dde8f8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="below" fill="#e74c3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    uploaded: { bg: '#eef2ff', color: '#3a5bd7', label: 'Uploaded' },
    processing: { bg: '#fff8e6', color: '#c67b00', label: 'Processing' },
    processed: { bg: '#e8f5ff', color: '#1a5fa8', label: 'Processed' },
    letters_queued: { bg: '#fff3cd', color: '#856404', label: 'Queued' },
    completed: { bg: '#e6f4ed', color: '#1a6b3c', label: 'Completed' },
    failed: { bg: '#fdecea', color: '#c0392b', label: 'Failed' },
  };
  const s = map[status] || { bg: '#f0f0f0', color: '#666', label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

const styles = {
  page: { padding: '32px', fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f6f8fc' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#0f1f45', fontFamily: 'Georgia, serif', margin: 0 },
  subtitle: { fontSize: '13px', color: '#7a8aa0', marginTop: '4px' },
  uploadBtn: {
    padding: '10px 22px', background: 'linear-gradient(135deg, #1a3a78, #2a5bd7)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: {
    background: '#fff', borderRadius: '10px', padding: '20px',
    boxShadow: '0 1px 6px rgba(0,0,0,.07)',
  },
  statIcon: { fontSize: '22px', marginBottom: '8px' },
  statValue: { fontSize: '2rem', fontWeight: '700', fontFamily: 'Georgia, serif', lineHeight: 1 },
  statLabel: { fontSize: '12px', color: '#7a8aa0', marginTop: '6px', fontWeight: '500' },
  statSub: { fontSize: '11px', color: '#a0aec0', marginTop: '2px' },
  grid2: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#0f1f45', margin: 0, fontFamily: 'Georgia, serif' },
  linkBtn: { background: 'none', border: 'none', color: '#2a5bd7', fontSize: '12px', cursor: 'pointer', fontWeight: '500' },
  chartLegend: { fontSize: '11px', color: '#7a8aa0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '8px 10px', fontSize: '10px', color: '#7a8aa0', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '2px solid #f0f4f8', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f0f4f8', transition: 'background .15s', cursor: 'default' },
  td: { padding: '10px', fontSize: '12.5px', color: '#2d3748', verticalAlign: 'middle' },
  fileName: { fontFamily: 'monospace', fontSize: '11px', background: '#f0f4f8', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  viewBtn: { padding: '4px 12px', fontSize: '11px', background: '#f0f4f8', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#2a5bd7', fontWeight: '600' },
  loading: { padding: '40px', textAlign: 'center', color: '#7a8aa0', fontSize: '13px' },
  empty: { padding: '40px', textAlign: 'center', color: '#7a8aa0', fontSize: '13px' },
  emptyBtn: { marginTop: '12px', padding: '8px 18px', background: '#1a3a78', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '13px' },
};
