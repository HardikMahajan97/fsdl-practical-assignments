import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/upload', label: 'Upload Report', icon: '⬆' },
  { to: '/reports', label: 'All Reports', icon: '📋' },
  { to: '/logs', label: 'Email Logs', icon: '📧', adminOnly: false },
];

const ADMIN_ITEMS = [
  { to: '/users', label: 'Manage Users', icon: '👥' },
  { to: '/queue', label: 'Queue Monitor', icon: '⚙' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandMark}>A</div>
        <div>
          <div style={styles.brandName}>AttendTrack</div>
          <div style={styles.brandSub}>Management System</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>NAVIGATION</div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div style={{ ...styles.navSection, marginTop: '20px' }}>ADMIN</div>
            {ADMIN_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                })}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div style={styles.userBox}>
        <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">↩</button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#0f1f45',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  brandMark: {
    width: '38px', height: '38px',
    background: 'linear-gradient(135deg, #2a5bd7, #4a7ff5)',
    borderRadius: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '800', color: '#fff',
    fontFamily: 'Georgia, serif', flexShrink: 0,
  },
  brandName: { fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: 'Georgia, serif' },
  brandSub: { fontSize: '10px', color: '#5a7aa8', letterSpacing: '0.08em', textTransform: 'uppercase' },
  nav: { flex: 1, padding: '20px 12px', overflowY: 'auto' },
  navSection: {
    fontSize: '10px', color: '#3a5a88',
    letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '0 8px', marginBottom: '8px', fontWeight: '600',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '8px',
    color: '#8aabcc', fontSize: '13px', fontWeight: '500',
    textDecoration: 'none', marginBottom: '2px',
    transition: 'all .15s',
  },
  navItemActive: {
    background: 'rgba(42,91,215,0.25)',
    color: '#7ab8ff',
    borderLeft: '3px solid #4a7ff5',
    paddingLeft: '9px',
  },
  navIcon: { fontSize: '14px', width: '18px', textAlign: 'center' },
  userBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '16px 16px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    marginTop: 'auto',
  },
  avatar: {
    width: '34px', height: '34px',
    background: 'linear-gradient(135deg, #2a5bd7, #4a7ff5)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: '12px', fontWeight: '600', color: '#c8daf0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: '10px', color: '#4a6a90', textTransform: 'uppercase', letterSpacing: '0.06em' },
  logoutBtn: {
    background: 'none', border: 'none', color: '#4a6a90',
    fontSize: '16px', cursor: 'pointer', padding: '4px',
    borderRadius: '4px', transition: 'color .15s',
  },
};
