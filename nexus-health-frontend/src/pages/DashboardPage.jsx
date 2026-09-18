import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { analyticsAPI, patientAPI, aiAPI } from '../utils/api';
import { Activity, Calendar, FileText, AlertTriangle, Brain, TrendingUp, Users, Clock, Zap, ChevronRight, Shield } from 'lucide-react';

const StatCard = ({ label, value, sub, color = 'cyan', icon: Icon, trend }) => (
  <div className="stat-card hover:border-white/15 transition-all duration-300 cursor-default group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color === 'cyan' ? 'bg-cyan-400/12 text-cyan-400' : color === 'emerald' ? 'bg-emerald-400/12 text-emerald-400' : color === 'amber' ? 'bg-amber-400/12 text-amber-400' : 'bg-red-400/12 text-red-400'}`}>
        <Icon size={16} strokeWidth={1.8} />
      </div>
      {trend && <span className="text-xs text-emerald-400 font-medium">{trend}</span>}
    </div>
    <div className="text-2xl font-display font-bold text-white">{value}</div>
    <div className="text-xs text-white/40 mt-0.5">{label}</div>
    {sub && <div className="text-[11px] text-white/25 mt-1">{sub}</div>}
  </div>
);

const ImpactCounter = ({ label, value, prefix = '', suffix = '' }) => (
  <div className="text-center">
    <div className="text-3xl font-display font-bold text-gradient">{prefix}{value?.toLocaleString()}{suffix}</div>
    <div className="text-xs text-white/40 mt-1">{label}</div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [impact, setImpact] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, imp, score, risk] = await Promise.allSettled([
          analyticsAPI.getDashboard(),
          analyticsAPI.getImpact(),
          patientAPI.getHealthScore(),
          aiAPI.sentinelRisk(),
        ]);
        if (dash.status === 'fulfilled') setDashboard(dash.value.data.data);
        if (imp.status === 'fulfilled') setImpact(imp.value.data.data);
        if (score.status === 'fulfilled') setHealthScore(score.value.data.data);
        if (risk.status === 'fulfilled') setRisks(risk.value.data.data.risks || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const quickActions = [
    { label: 'ARIA Assessment', desc: 'AI symptom check', icon: Brain, path: '/aria', color: 'emerald' },
    { label: 'Book Appointment', desc: 'Find doctors', icon: Calendar, path: '/book', color: 'cyan' },
    { label: 'Emergency SOS', desc: 'Instant response', icon: AlertTriangle, path: '/emergency', color: 'red' },
    { label: 'Health Records', desc: 'View timeline', icon: FileText, path: '/records', color: 'cyan' },
  ];

  const getScoreColor = (score) => score >= 80 ? 'emerald' : score >= 60 ? 'amber' : 'red';
  const scoreColor = getScoreColor(healthScore?.score || 75);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-white/40 mt-1 text-sm">Your health overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">All Systems Online</span>
        </div>
      </div>

      {/* Health score hero */}
      <div className="gradient-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent pointer-events-none rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={scoreColor === 'emerald' ? '#00FF94' : scoreColor === 'amber' ? '#FFB700' : '#ef4444'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - (healthScore?.score || 75) / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl font-bold text-white">{healthScore?.score || 75}</span>
              </div>
            </div>
            <div>
              <div className="label mb-1">Health Score</div>
              <div className="text-lg font-semibold text-white capitalize">{dashboard?.riskLevel || 'Moderate'} Risk</div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs mt-1">
                <TrendingUp size={12} />
                <span>Improving</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 col-span-2">
            {healthScore?.factors?.map(f => (
              <div key={f.factor} className="bg-white/5 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/50">{f.factor}</span>
                  <span className="text-xs font-semibold text-white">{f.score}%</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 cps-fill" style={{ width: `${f.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Upcoming Appointments" value={dashboard?.appointments?.upcoming || 0} sub="Next: Soon" icon={Calendar} color="cyan" />
        <StatCard label="Active Medications" value={dashboard?.medicationCount || 0} sub="On schedule" icon={Activity} color="emerald" trend="+85%" />
        <StatCard label="Medical Records" value={dashboard?.recentRecords?.length || 0} sub="Recent entries" icon={FileText} color="cyan" />
        <StatCard label="Health Alerts" value={risks.length} sub={risks.length ? 'Needs attention' : 'All clear'} icon={Shield} color={risks.length ? 'amber' : 'emerald'} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, desc, icon: Icon, path, color }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`glass-card-hover p-4 text-left group flex flex-col gap-3 ${color === 'red' ? 'hover:border-red-500/30' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                color === 'red' ? 'bg-red-400/12 text-red-400' : color === 'emerald' ? 'bg-emerald-400/12 text-emerald-400' : 'bg-cyan-400/12 text-cyan-400'
              }`}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{label}</div>
                <div className="text-xs text-white/40 mt-0.5">{desc}</div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* SENTINEL Alerts */}
      {risks.length > 0 && (
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            SENTINEL Alerts
          </h2>
          <div className="space-y-3">
            {risks.map((risk, i) => (
              <div key={i} className={`glass-card p-4 flex items-start gap-4 border-l-2 ${risk.severity === 'high' ? 'border-l-red-400' : 'border-l-amber-400'}`}>
                <AlertTriangle size={18} className={risk.severity === 'high' ? 'text-red-400 mt-0.5' : 'text-amber-400 mt-0.5'} />
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{risk.type}</div>
                  <div className="text-xs text-white/50 mt-1">{risk.message}</div>
                </div>
                <span className={`badge-${risk.severity === 'high' ? 'danger' : 'warning'}`}>{risk.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next appointment */}
      {dashboard?.nextAppointment && (
        <div>
          <h2 className="section-title mb-4">Next Appointment</h2>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-400/12 flex items-center justify-center text-cyan-400">
              <Calendar size={20} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{dashboard.nextAppointment.doctorName}</div>
              <div className="text-sm text-white/50 mt-0.5">{dashboard.nextAppointment.specialization}</div>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/35">
                <span className="flex items-center gap-1"><Clock size={11} />{dashboard.nextAppointment.date}</span>
                <span>{dashboard.nextAppointment.time}</span>
              </div>
            </div>
            <span className="badge-info">{dashboard.nextAppointment.status}</span>
          </div>
        </div>
      )}

      {/* Platform Impact */}
      {impact && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={16} className="text-cyan-400" />
            <h2 className="section-title">Platform Impact</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ImpactCounter label="Patients Helped" value={impact.patientsHelped} />
            <ImpactCounter label="Wait Time Reduced" value={impact.waitTimeReduced} suffix="%" />
            <ImpactCounter label="Rural Users Reached" value={impact.ruralUsersReached} />
            <ImpactCounter label="Lives Saved" value={impact.livesSaved} />
          </div>
        </div>
      )}
    </div>
  );
}
