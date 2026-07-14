import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function AttBar({ pct, threshold }) {
  const color = pct >= threshold ? '#1a6b3c' : pct >= (threshold - 10) ? '#e67e22' : '#c0392b';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '7px', background: '#f0f4f8', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: '600', color, minWidth: '38px', textAlign: 'right' }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

function LetterStatusBadge({ status }) {
  const map = {
    pending: { bg: '#f0f4f8', color: '#7a8aa0', label: '— Pending' },
    generating: { bg: '#fff8e6', color: '#c67b00', label: '⏳ Generating' },
    generated: { bg: '#eef2ff', color: '#3a5bd7', label: '📄 Generated' },
    sent: { bg: '#e6f4ed', color: '#1a6b3c', label: '✉ Sent' },
    failed: { bg: '#fdecea', color: '#c0392b', label: '✕ Failed' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [teacherEmail, setTeacherEmail] = useState(user?.email || '');
  const [showDispatch, setShowDispatch] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api.get(`/reports/${id}`).then(r => r.data.report),
    refetchInterval: (data) => ['letters_queued', 'processing'].includes(data?.status) ? 5000 : false,
  });

  const { data: logsData } = useQuery({
    queryKey: ['report-logs', id],
    queryFn: () => api.get(`/reports/${id}/logs`).then(r => r.data),
  });

  const dispatch = useMutation({
    mutationFn: () => api.post(`/reports/${id}/dispatch`, { teacherEmail }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setShowDispatch(false);
      qc.invalidateQueries(['report', id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Dispatch failed'),
  });

  const deleteReport = useMutation({
    mutationFn: () => api.delete(`/reports/${id}`),
    onSuccess: () => { toast.success('Report deleted'); navigate('/reports'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  if (isLoading) return <div style={styles.loading}>Loading report…</div>;
  if (!data) return <div style={styles.loading}>Report not found.</div>;

  const report = data;
  const threshold = report.threshold || 75;
  const students = report.students || [];
  const filtered = filter === 'below'
    ? students.filter(s => s.isBelowThreshold)
    : filter === 'ok'
    ? students.filter(s => !s.isBelowThreshold)
    : students;

  const canDispatch = ['processed', 'failed'].includes(report.status);
  const belowCount = students.filter(s => s.isBelowThreshold).length;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate('/reports')}>← Reports</button>
          <h1 style={styles.title}>{report.originalFileName || 'Attendance Report'}</h1>
          <div style={styles.meta}>
            {report.className && <span style={styles.metaChip}>Class {report.className} {report.section || ''}</span>}
            {report.academicYear && <span style={styles.metaChip}>{report.academicYear} {report.semester && `· ${report.semester}`}</span>}
            <span style={styles.metaChip}>Threshold: {threshold}%</span>
            <span style={styles.metaChip}>Uploaded: {new Date(report.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={styles.refreshBtn} onClick={() => refetch()}>↻ Refresh</button>
          {canDispatch && (
            <button style={styles.dispatchBtn} onClick={() => setShowDispatch(true)}>
              ✉ Dispatch Letters ({belowCount})
            </button>
          )}
          <button style={styles.deleteBtn} onClick={() => { if (window.confirm('Delete this report?')) deleteReport.mutate(); }}>
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showDispatch && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Dispatch {belowCount} Parent Letters</h3>
            <p style={styles.modalSub}>Letters will be generated as PDFs via LaTeX and emailed to parents asynchronously. A copy will be CC'd to the teacher.</p>
            <label style={styles.label}>Teacher Email (CC)</label>
            <input style={styles.input} type="email" value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} placeholder="teacher@school.edu" />
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button style={styles.modalConfirm} onClick={() => dispatch.mutate()} disabled={dispatch.isPending}>
                {dispatch.isPending ? 'Queuing…' : '✉ Confirm & Send'}
              </button>
              <button style={styles.modalCancel} onClick={() => setShowDispatch(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Students', value: report.totalStudents, color: '#1a3a78', icon: '👥' },
          { label: `Above ${threshold}%`, value: report.totalStudents - belowCount, color: '#1a6b3c', icon: '✓' },
          { label: `Below ${threshold}%`, value: belowCount, color: '#c0392b', icon: '⚠' },
          { label: 'Emails Sent', value: logsData?.logs?.filter(l => l.status === 'sent').length || 0, color: '#2a5bd7', icon: '✉' },
        ].map(s => (
          <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Student Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Student Attendance</h3>
          <div style={styles.filterRow}>
            {[['all', 'All'], ['below', `Below ${threshold}%`], ['ok', 'Regular']].map(([val, lbl]) => (
              <button
                key={val}
                style={{ ...styles.filterBtn, ...(filter === val ? styles.filterBtnActive : {}) }}
                onClick={() => setFilter(val)}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Roll', 'Student Name', 'Parent Name', 'Parent Email', 'Overall Att.', 'Subjects', 'Letter Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} style={{ ...styles.tr, background: s.isBelowThreshold ? '#fffaf9' : '#fff' }}>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px', color: '#5a6a7a' }}>{s.rollNumber}</td>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#0f1f45' }}>
                    {s.name}
                    {s.isBelowThreshold && <span style={styles.alertDot}>!</span>}
                  </td>
                  <td style={styles.td}>{s.parentName || '—'}</td>
                  <td style={{ ...styles.td, fontSize: '12px', color: '#5a6a7a', fontFamily: 'monospace' }}>{s.parentEmail}</td>
                  <td style={{ ...styles.td, minWidth: '160px' }}>
                    <AttBar pct={s.overallAttendance} threshold={threshold} />
                  </td>
                  <td style={styles.td}>
                    {s.subjects?.length > 0 ? (
                      <div style={styles.subjectPills}>
                        {s.subjects.map((sub, j) => (
                          <span key={j} style={{ ...styles.subjectPill, background: sub.percentage < threshold ? '#fdecea' : '#e6f4ed', color: sub.percentage < threshold ? '#c0392b' : '#1a6b3c' }}>
                            {sub.name}: {sub.percentage?.toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    ) : <span style={{ color: '#a0aec0', fontSize: '12px' }}>—</span>}
                  </td>
                  <td style={styles.td}>
                    {s.isBelowThreshold
                      ? <LetterStatusBadge status={s.letterStatus} />
                      : <span style={{ color: '#a0aec0', fontSize: '12px' }}>N/A</span>
                    }
                    {s.emailError && <div style={{ fontSize: '10px', color: '#c0392b', marginTop: '2px' }}>{s.emailError.slice(0, 40)}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Logs */}
      {logsData?.logs?.length > 0 && (
        <div style={{ ...styles.card, marginTop: '20px' }}>
          <h3 style={{ ...styles.cardTitle, marginBottom: '16px' }}>📧 Email Audit Logs</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Student', 'Recipient Type', 'Email', 'Status', 'Message ID', 'Sent At'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logsData.logs.map(log => (
                <tr key={log._id} style={styles.tr}>
                  <td style={styles.td}>{log.studentName} <span style={{ color: '#a0aec0', fontSize: '11px' }}>({log.studentRoll})</span></td>
                  <td style={styles.td}>
                    <span style={{ background: log.recipientType === 'parent' ? '#f0f5ff' : '#f5f0ff', color: log.recipientType === 'parent' ? '#2a5bd7' : '#6a2bd7', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                      {log.recipientType}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '11px' }}>{log.recipientEmail}</td>
                  <td style={styles.td}>
                    <span style={{ color: log.status === 'sent' ? '#1a6b3c' : '#c0392b', fontWeight: '600', fontSize: '12px' }}>
                      {log.status === 'sent' ? '✓ Sent' : '✕ Failed'}
                    </span>
                    {log.errorMessage && <div style={{ fontSize: '10px', color: '#c0392b' }}>{log.errorMessage.slice(0, 50)}</div>}
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '10px', color: '#a0aec0' }}>{log.messageId?.slice(0, 20) || '—'}</td>
                  <td style={{ ...styles.td, fontSize: '11px', color: '#7a8aa0' }}>
                    {log.sentAt ? new Date(log.sentAt).toLocaleString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', fontFamily: "'DM Sans', sans-serif", background: '#f6f8fc', minHeight: '100vh' },
  loading: { padding: '60px', textAlign: 'center', color: '#7a8aa0', fontFamily: "'DM Sans', sans-serif" },
  backBtn: { background: 'none', border: 'none', color: '#2a5bd7', fontSize: '13px', cursor: 'pointer', padding: '0', marginBottom: '6px', fontWeight: '500' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#0f1f45', fontFamily: 'Georgia, serif', margin: '0 0 8px' },
  meta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaChip: { background: '#f0f4f8', color: '#5a6a7a', fontSize: '11px', padding: '3px 9px', borderRadius: '5px', fontWeight: '500' },
  refreshBtn: { padding: '9px 16px', background: '#f0f4f8', color: '#2a5bd7', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  dispatchBtn: { padding: '9px 18px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  deleteBtn: { padding: '9px 16px', background: '#fdecea', color: '#c0392b', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  statCard: { background: '#fff', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  statIcon: { fontSize: '18px', marginBottom: '6px' },
  statValue: { fontSize: '1.8rem', fontWeight: '700', fontFamily: 'Georgia, serif' },
  statLabel: { fontSize: '12px', color: '#7a8aa0', marginTop: '4px' },
  card: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f0f4f8' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#0f1f45', margin: 0, fontFamily: 'Georgia, serif' },
  filterRow: { display: 'flex', gap: '6px' },
  filterBtn: { padding: '5px 14px', fontSize: '12px', background: '#f0f4f8', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#5a6a7a', fontWeight: '500' },
  filterBtnActive: { background: '#1a3a78', color: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 14px', fontSize: '10px', color: '#7a8aa0', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '2px solid #f0f4f8', background: '#f9fafb', fontWeight: '600', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f0f4f8' },
  td: { padding: '11px 14px', fontSize: '13px', color: '#2d3748', verticalAlign: 'middle' },
  alertDot: { display: 'inline-block', width: '16px', height: '16px', background: '#c0392b', color: '#fff', borderRadius: '50%', fontSize: '10px', fontWeight: '700', textAlign: 'center', lineHeight: '16px', marginLeft: '6px', verticalAlign: 'middle' },
  subjectPills: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  subjectPill: { fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', whiteSpace: 'nowrap' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,31,69,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
  modal: { background: '#fff', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,.3)' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#0f1f45', fontFamily: 'Georgia, serif', margin: '0 0 8px' },
  modalSub: { fontSize: '13px', color: '#7a8aa0', marginBottom: '20px', lineHeight: '1.6' },
  label: { display: 'block', fontSize: '11px', color: '#5a6a7a', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #dde3ec', borderRadius: '7px', fontSize: '13px', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
  modalConfirm: { flex: 1, padding: '11px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  modalCancel: { flex: 1, padding: '11px', background: '#f0f4f8', color: '#5a6a7a', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};
