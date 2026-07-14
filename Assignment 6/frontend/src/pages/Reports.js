import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function StatusBadge({ status }) {
  const map = {
    uploaded: { bg: '#eef2ff', color: '#3a5bd7', label: 'Uploaded' },
    processing: { bg: '#fff8e6', color: '#c67b00', label: 'Processing' },
    processed: { bg: '#e8f5ff', color: '#1a5fa8', label: 'Processed' },
    letters_queued: { bg: '#fff3cd', color: '#856404', label: 'Queued' },
    completed: { bg: '#e6f4ed', color: '#1a6b3c', label: '✓ Completed' },
    failed: { bg: '#fdecea', color: '#c0392b', label: '✕ Failed' },
  };
  const s = map[status] || { bg: '#f0f0f0', color: '#666', label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600' }}>
      {s.label}
    </span>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reports', page],
    queryFn: () => api.get(`/reports?page=${page}&limit=15`).then(r => r.data),
    refetchInterval: 15000,
  });

  const reports = data?.reports || [];
  const pages = data?.pages || 1;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>All Reports</h1>
          <p style={styles.subtitle}>{data?.total || 0} total reports · Auto-refreshes every 15s</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={styles.refreshBtn} onClick={() => refetch()}>↻ Refresh</button>
          <button style={styles.uploadBtn} onClick={() => navigate('/upload')}>+ Upload New</button>
        </div>
      </div>

      <div style={styles.card}>
        {isLoading ? (
          <div style={styles.loading}>Loading reports…</div>
        ) : reports.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
            <p>No reports found. Upload your first attendance file.</p>
          </div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['File', 'Class / Section', 'Academic Year', 'Total', 'Below 75%', 'Status', 'Uploaded By', 'Date', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id} style={styles.tr} onClick={() => navigate(`/reports/${r._id}`)}>
                    <td style={styles.td}>
                      <span style={styles.fileChip}>{r.originalFileName || '—'}</span>
                    </td>
                    <td style={styles.td}>
                      {r.className ? <span style={styles.classBadge}>{r.className} {r.section || ''}</span> : <span style={{ color: '#a0aec0' }}>—</span>}
                    </td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px' }}>
                      {r.academicYear || '—'} {r.semester ? `/ ${r.semester}` : ''}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center', fontWeight: '600' }}>{r.totalStudents}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {r.belowThresholdCount > 0
                        ? <span style={styles.belowBadge}>{r.belowThresholdCount}</span>
                        : <span style={styles.okBadge}>0</span>
                      }
                    </td>
                    <td style={styles.td}><StatusBadge status={r.status} /></td>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.miniAvatar}>{r.uploadedBy?.name?.[0]}</div>
                        <span style={{ fontSize: '12px', color: '#4a5568' }}>{r.uploadedBy?.name}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, fontSize: '11px', color: '#7a8aa0', whiteSpace: 'nowrap' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={styles.td} onClick={e => e.stopPropagation()}>
                      <button style={styles.viewBtn} onClick={() => navigate(`/reports/${r._id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div style={styles.pagination}>
                <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={styles.pageInfo}>Page {page} of {pages}</span>
                <button style={styles.pageBtn} disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
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
  uploadBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a3a78, #2a5bd7)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  refreshBtn: { padding: '10px 16px', background: '#f0f4f8', color: '#2a5bd7', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  card: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 14px', fontSize: '10px', color: '#7a8aa0', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '2px solid #f0f4f8', fontWeight: '600', background: '#f9fafb', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f0f4f8', cursor: 'pointer', transition: 'background .12s' },
  td: { padding: '12px 14px', fontSize: '13px', color: '#2d3748', verticalAlign: 'middle' },
  fileChip: { fontFamily: 'monospace', fontSize: '11px', background: '#f0f4f8', padding: '2px 7px', borderRadius: '4px', maxWidth: '160px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  classBadge: { background: '#eef2ff', color: '#3a5bd7', padding: '2px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: '600' },
  belowBadge: { background: '#fdecea', color: '#c0392b', padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '700' },
  okBadge: { background: '#e6f4ed', color: '#1a6b3c', padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600' },
  userCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  miniAvatar: { width: '26px', height: '26px', background: '#dde8f8', color: '#1a3a78', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
  viewBtn: { padding: '5px 14px', fontSize: '11px', background: '#eef2ff', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#2a5bd7', fontWeight: '600' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '16px', borderTop: '1px solid #f0f4f8' },
  pageBtn: { padding: '7px 16px', background: '#f0f4f8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#2a5bd7' },
  pageInfo: { fontSize: '13px', color: '#7a8aa0' },
  loading: { padding: '60px', textAlign: 'center', color: '#7a8aa0' },
  empty: { padding: '60px', textAlign: 'center', color: '#7a8aa0', fontSize: '13px' },
};
