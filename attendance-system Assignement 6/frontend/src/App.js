import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import Users from './pages/Users';
import QueueMonitor from './pages/QueueMonitor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'sans-serif', color: '#7a8aa0' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowX: 'auto' }}>{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: "'DM Sans', sans-serif", fontSize: '13px', borderRadius: '8px' },
              success: { iconTheme: { primary: '#1a6b3c', secondary: '#fff' } },
              error: { iconTheme: { primary: '#c0392b', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute><AppLayout><Upload /></AppLayout></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>
            } />
            <Route path="/reports/:id" element={
              <ProtectedRoute><AppLayout><ReportDetail /></AppLayout></ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute adminOnly><AppLayout><Users /></AppLayout></ProtectedRoute>
            } />
            <Route path="/queue" element={
              <ProtectedRoute adminOnly><AppLayout><QueueMonitor /></AppLayout></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
