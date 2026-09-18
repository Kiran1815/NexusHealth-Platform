import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import ARIAPage from './pages/ARIAPage';
import RecordsPage from './pages/RecordsPage';
import EmergencyPage from './pages/EmergencyPage';
import PharmacyPage from './pages/PharmacyPage';
import HealthScorePage from './pages/HealthScorePage';
import PulsePage from './pages/PulsePage';
import EchoPage from './pages/EchoPage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full" />
          <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin" />
        </div>
        <span className="text-white/40 text-sm font-mono tracking-widest">INITIALIZING NEXUS</span>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#162a52', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Instrument Sans' },
          success: { iconTheme: { primary: '#00FF94', secondary: '#0A1628' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0A1628' } },
        }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="book" element={<BookAppointmentPage />} />
            <Route path="aria" element={<ARIAPage />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="emergency" element={<EmergencyPage />} />
            <Route path="pharmacy" element={<PharmacyPage />} />
            <Route path="health-score" element={<HealthScorePage />} />
            <Route path="pulse" element={<PulsePage />} />
            <Route path="echo" element={<EchoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
