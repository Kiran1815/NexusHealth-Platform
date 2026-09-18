import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Calendar, Stethoscope, FileText, AlertTriangle,
  Pill, Activity, Globe, Brain, LogOut, Menu, X, Zap, ChevronRight, Bell
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'cyan' },
  { path: '/aria', icon: Brain, label: 'ARIA Assistant', color: 'emerald', badge: 'AI' },
  { path: '/appointments', icon: Calendar, label: 'Appointments', color: 'cyan' },
  { path: '/book', icon: Stethoscope, label: 'Find Doctors', color: 'cyan' },
  { path: '/records', icon: FileText, label: 'Medical Records', color: 'cyan' },
  { path: '/health-score', icon: Activity, label: 'Health Score', color: 'emerald' },
  { path: '/pharmacy', icon: Pill, label: 'Pharmacy', color: 'cyan' },
  { path: '/echo', icon: Brain, label: 'ECHO Mental Health', color: 'emerald', badge: 'AI' },
  { path: '/pulse', icon: Globe, label: 'PULSE Outbreaks', color: 'amber', badge: 'LIVE' },
  { path: '/emergency', icon: AlertTriangle, label: 'Emergency SOS', color: 'red' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-glow-cyan">
            <Zap size={18} className="text-navy-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none tracking-tight">NEXUS</h1>
            <p className="text-[10px] text-white/35 uppercase tracking-widest mt-0.5">Health Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-white/5 border border-white/8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 flex items-center justify-center text-cyan-400 font-bold text-sm border border-cyan-400/20">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-[11px] text-white/35 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ path, icon: Icon, label, color, badge }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? color === 'red' ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                    : color === 'amber' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    : color === 'emerald' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                    : 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.8} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                badge === 'LIVE' ? 'bg-amber-400/20 text-amber-400' : 'bg-cyan-400/20 text-cyan-400'
              }`}>{badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/8">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200">
          <LogOut size={16} strokeWidth={1.8} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 bg-mesh flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar mobile */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-navy-950/95 backdrop-blur-xl border-r border-white/8 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/8 bg-navy-950/80 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white/8 text-white/60">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
              <Zap size={12} className="text-navy-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-white text-base">NEXUS</span>
          </div>
          <button className="p-2 rounded-xl hover:bg-white/8 text-white/60 relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
