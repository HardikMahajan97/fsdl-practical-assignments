import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parseResult, setParseResult] = useState(null);
  const [form, setForm] = useState({
    academicYear: '2024-25',
    semester: 'Odd',
    className: '',
    section: '',
    fromDate: '',
    toDate: '',
    threshold: '75',
    teacherEmail: user?.email || '',
  });

  const onDrop = useCallback((accepted) => {
    if (accepted.length) {
      setFile(accepted[0]);
      setParseResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0];
      toast.error(err?.code === 'file-too-large' ? 'File exceeds 10 MB limit' : err?.message || 'Invalid file');
    },
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });

    try {
      const res = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 70)),
      });
      setProgress(100);
      setParseResult(res.data);
      toast.success(`Parsed ${res.data.summary.totalStudents} students successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDispatch = async () => {
    if (!parseResult?.reportId) return;
    setUploading(true);
    try {
      const res = await api.post(`/reports/${parseResult.reportId}/dispatch`, {
        teacherEmail: form.teacherEmail,
      });
      toast.success(res.data.message);
      navigate(`/reports/${parseResult.reportId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dispatch failed');
    } finally {
      setUploading(false);
    }
  };

  const F = ({ label, id, type = 'text', ...props }) => (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        style={styles.input}
        value={form[id] || ''}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        {...props}
      />
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Upload Attendance Report</h1>
        <p style={styles.subtitle}>Upload a CSV or Excel file to process attendance and dispatch parent letters</p>
      </div>

      <div style={styles.layout}>
        {/* LEFT: File + Settings */}
        <div>
          {/* Drop Zone */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📂 Select File</h3>
            <div {...getRootProps()} style={{ ...styles.dropzone, ...(isDragActive ? styles.dropzoneActive : {}), ...(file ? styles.dropzoneFilled : {}) }}>
              <input {...getInputProps()} />
              {file ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
                    {file.name.endsWith('.csv') ? '📊' : '📗'}
                  </div>
                  <div style={styles.fileName}>{file.name}</div>
                  <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                  <button style={styles.removeBtn} onClick={e => { e.stopPropagation(); setFile(null); setParseResult(null); }}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>
                    {isDragActive ? '📥' : '📁'}
                  </div>
                  <div style={styles.dropText}>
                    {isDragActive ? 'Drop it here!' : 'Drag & drop your CSV or Excel file'}
                  </div>
                  <div style={styles.dropSub}>or click to browse · Max 10 MB</div>
                  <div style={styles.formatNote}>
                    Supported: .csv · .xlsx · .xls
                  </div>
                </div>
              )}
            </div>

            {/* Column Guide */}
            <div style={styles.colGuide}>
              <div style={styles.colGuideTitle}>Expected Columns</div>
              <div style={styles.colGrid}>
                {[
                  ['roll_number', 'Required'],
                  ['student_name', 'Required'],
                  ['parent_email', 'Required'],
                  ['overall_attendance', 'Required (%)'],
                  ['parent_name', 'Optional'],
                  ['class', 'Optional'],
                  ['section', 'Optional'],
                  ['Physics_total + Physics_attended', 'Subject pair'],
                ].map(([col, note]) => (
                  <div key={col} style={styles.colRow}>
                    <code style={styles.colName}>{col}</code>
                    <span style={{ ...styles.colNote, color: note === 'Required' ? '#c0392b' : note.includes('pair') ? '#2a5bd7' : '#7a8aa0' }}>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Config */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚙ Report Configuration</h3>
            <div style={styles.formGrid}>
              <F label="Academic Year" id="academicYear" placeholder="2024-25" />
              <div style={styles.field}>
                <label style={styles.label}>Semester</label>
                <select style={styles.input} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                  <option>Odd</option><option>Even</option>
                </select>
              </div>
              <F label="Class" id="className" placeholder="X" />
              <F label="Section" id="section" placeholder="A" />
              <F label="From Date" id="fromDate" type="date" />
              <F label="To Date" id="toDate" type="date" />
              <F label="Threshold (%)" id="threshold" type="number" min="1" max="100" />
              <F label="Teacher Email (CC)" id="teacherEmail" type="email" placeholder="teacher@school.edu" />
            </div>
          </div>
        </div>

        {/* RIGHT: Action + Result */}
        <div>
          {/* Upload Action */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🚀 Process</h3>

            {uploading && (
              <div style={styles.progressWrap}>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <div style={styles.progressLabel}>{progress}%</div>
              </div>
            )}

            <button
              style={{ ...styles.btn, opacity: !file || uploading ? 0.6 : 1 }}
              onClick={handleUpload}
              disabled={!file || uploading || !!parseResult}
            >
              {uploading && !parseResult ? '⏳ Parsing file…' : parseResult ? '✓ File Parsed' : '⬆ Parse & Upload'}
            </button>

            {parseResult && (
              <div style={styles.resultBox}>
                <div style={styles.resultTitle}>✅ Parse Complete</div>
                <div style={styles.resultGrid}>
                  <div style={styles.resultItem}>
                    <span style={styles.resultNum}>{parseResult.summary.totalStudents}</span>
                    <span style={styles.resultLbl}>Total Students</span>
                  </div>
                  <div style={styles.resultItem}>
                    <span style={{ ...styles.resultNum, color: '#c0392b' }}>{parseResult.summary.belowThreshold}</span>
                    <span style={styles.resultLbl}>Below {form.threshold}%</span>
                  </div>
                  {parseResult.summary.parseErrors > 0 && (
                    <div style={styles.resultItem}>
                      <span style={{ ...styles.resultNum, color: '#e67e22' }}>{parseResult.summary.parseErrors}</span>
                      <span style={styles.resultLbl}>Parse Errors</span>
                    </div>
                  )}
                </div>

                {parseResult.parseErrors?.length > 0 && (
                  <div style={styles.errorBox}>
                    <div style={styles.errorTitle}>⚠ Parse Warnings (rows skipped)</div>
                    {parseResult.parseErrors.map((e, i) => (
                      <div key={i} style={styles.errorRow}>Row {e.row} – {e.student}: {e.issues.join(', ')}</div>
                    ))}
                  </div>
                )}

                {parseResult.summary.belowThreshold > 0 ? (
                  <button style={styles.dispatchBtn} onClick={handleDispatch} disabled={uploading}>
                    {uploading ? '⏳ Queueing…' : `✉ Generate & Send ${parseResult.summary.belowThreshold} Letters`}
                  </button>
                ) : (
                  <div style={styles.allGood}>🎉 All students are above {form.threshold}% — no letters needed!</div>
                )}

                <button style={styles.viewReportBtn} onClick={() => navigate(`/reports/${parseResult.reportId}`)}>
                  View Full Report →
                </button>
              </div>
            )}
          </div>

          {/* How it works */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>ℹ How It Works</h3>
            <div style={styles.steps}>
              {[
                ['1', 'Upload CSV/Excel with student attendance data'],
                ['2', 'System parses and filters students below threshold'],
                ['3', 'LaTeX letter generated per student as PDF'],
                ['4', 'PDF emailed to parent with CC to teacher'],
                ['5', 'Audit logs maintained for all actions'],
              ].map(([n, text]) => (
                <div key={n} style={styles.step}>
                  <div style={styles.stepNum}>{n}</div>
                  <div style={styles.stepText}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', fontFamily: "'DM Sans', sans-serif", background: '#f6f8fc', minHeight: '100vh' },
  header: { marginBottom: '28px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#0f1f45', fontFamily: 'Georgia, serif', margin: '0 0 4px' },
  subtitle: { fontSize: '13px', color: '#7a8aa0' },
  layout: { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', alignItems: 'start' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,.07)', marginBottom: '20px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#0f1f45', margin: '0 0 18px', fontFamily: 'Georgia, serif' },
  dropzone: {
    border: '2px dashed #dde3ec', borderRadius: '10px', padding: '40px 20px',
    cursor: 'pointer', transition: 'all .2s', textAlign: 'center',
    background: '#fafbfd',
  },
  dropzoneActive: { borderColor: '#2a5bd7', background: '#f0f5ff' },
  dropzoneFilled: { borderColor: '#2a7d4f', background: '#f0faf5', borderStyle: 'solid' },
  dropText: { fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '4px' },
  dropSub: { fontSize: '12px', color: '#7a8aa0', marginBottom: '8px' },
  formatNote: { fontSize: '11px', color: '#a0aec0', fontFamily: 'monospace', background: '#f0f4f8', display: 'inline-block', padding: '3px 8px', borderRadius: '4px' },
  fileName: { fontSize: '13px', fontWeight: '600', color: '#0f1f45', marginBottom: '4px' },
  fileSize: { fontSize: '11px', color: '#7a8aa0', marginBottom: '10px' },
  removeBtn: { fontSize: '11px', color: '#c0392b', background: '#fdecea', border: 'none', borderRadius: '5px', padding: '4px 10px', cursor: 'pointer' },
  colGuide: { marginTop: '18px', borderTop: '1px solid #f0f4f8', paddingTop: '16px' },
  colGuideTitle: { fontSize: '11px', color: '#7a8aa0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '10px' },
  colGrid: { display: 'flex', flexDirection: 'column', gap: '5px' },
  colRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  colName: { fontSize: '11px', background: '#f0f4f8', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace', color: '#2d3748' },
  colNote: { fontSize: '11px', fontWeight: '500' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  field: {},
  label: { display: 'block', fontSize: '11px', color: '#5a6a7a', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '5px' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #dde3ec', borderRadius: '7px', fontSize: '13px', color: '#0f1f45', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1a3a78, #2a5bd7)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'opacity .2s' },
  progressWrap: { marginBottom: '14px' },
  progressBar: { height: '6px', background: '#f0f4f8', borderRadius: '99px', overflow: 'hidden', marginBottom: '4px' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #1a3a78, #2a5bd7)', borderRadius: '99px', transition: 'width .3s' },
  progressLabel: { fontSize: '11px', color: '#7a8aa0', textAlign: 'right' },
  resultBox: { marginTop: '18px', borderTop: '1px solid #f0f4f8', paddingTop: '18px' },
  resultTitle: { fontSize: '14px', fontWeight: '600', color: '#2a7d4f', marginBottom: '14px' },
  resultGrid: { display: 'flex', gap: '16px', marginBottom: '16px' },
  resultItem: { flex: 1, background: '#f6f8fc', borderRadius: '8px', padding: '12px', textAlign: 'center' },
  resultNum: { display: 'block', fontSize: '1.8rem', fontWeight: '700', fontFamily: 'Georgia, serif', color: '#0f1f45' },
  resultLbl: { display: 'block', fontSize: '11px', color: '#7a8aa0', marginTop: '3px' },
  errorBox: { background: '#fff8e1', borderRadius: '7px', padding: '12px', marginBottom: '14px' },
  errorTitle: { fontSize: '12px', fontWeight: '600', color: '#c67b00', marginBottom: '6px' },
  errorRow: { fontSize: '11px', color: '#856404', marginBottom: '3px', fontFamily: 'monospace' },
  dispatchBtn: { width: '100%', padding: '12px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' },
  allGood: { background: '#e6f4ed', color: '#1a6b3c', padding: '12px', borderRadius: '7px', fontSize: '13px', fontWeight: '500', marginBottom: '10px', textAlign: 'center' },
  viewReportBtn: { width: '100%', padding: '10px', background: '#f0f4f8', color: '#2a5bd7', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  steps: { display: 'flex', flexDirection: 'column', gap: '12px' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  stepNum: { width: '24px', height: '24px', background: '#1a3a78', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
  stepText: { fontSize: '13px', color: '#4a5568', lineHeight: '1.5', paddingTop: '3px' },
};
