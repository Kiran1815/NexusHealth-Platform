import { useState, useEffect } from 'react';
import { patientAPI, aiAPI } from '../utils/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Pill } from 'lucide-react';

const mockTrendData = [
  { month: 'Sep', score: 68 }, { month: 'Oct', score: 71 }, { month: 'Nov', score: 69 },
  { month: 'Dec', score: 73 }, { month: 'Jan', score: 75 }, { month: 'Feb', score: 72 },
];

export default function HealthScorePage() {
  const [score, setScore] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [risks, setRisks] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, v, r, m] = await Promise.allSettled([
          patientAPI.getHealthScore(), patientAPI.getVitals(),
          aiAPI.sentinelRisk(), patientAPI.getMedications(),
        ]);
        if (s.status === 'fulfilled') setScore(s.value.data.data);
        if (v.status === 'fulfilled') setVitals(v.value.data.data);
        if (r.status === 'fulfilled') setRisks(r.value.data.data.risks || []);
        if (m.status === 'fulfilled') setMedications(m.value.data.data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const radarData = score?.factors?.map(f => ({ subject: f.factor.split(' ')[0], value: f.score, fullMark: 100 })) || [];
  const scoreColor = (score?.score || 75) >= 80 ? '#00FF94' : (score?.score || 75) >= 60 ? '#FFB700' : '#ef4444';

  const vitalsDisplay = vitals ? [
    { label: 'Blood Pressure', value: vitals.bloodPressure, unit: 'mmHg', status: vitals.bloodPressure?.split('/')[0] > 140 ? 'high' : 'normal' },
    { label: 'Heart Rate', value: vitals.heartRate, unit: 'bpm', status: vitals.heartRate > 100 || vitals.heartRate < 60 ? 'abnormal' : 'normal' },
    { label: 'SpO₂', value: vitals.oxygenSaturation, unit: '%', status: vitals.oxygenSaturation < 95 ? 'low' : 'normal' },
    { label: 'Blood Glucose', value: vitals.bloodGlucose, unit: 'mg/dL', status: vitals.bloodGlucose > 126 ? 'high' : 'normal' },
    { label: 'BMI', value: vitals.bmi, unit: 'kg/m²', status: vitals.bmi > 30 ? 'high' : vitals.bmi < 18.5 ? 'low' : 'normal' },
  ] : [];

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Health Score</h1>
        <p className="text-white/40 text-sm mt-1">Powered by SENTINEL — your personal health watchdog</p>
      </div>

      {/* Score hero */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
              <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle cx="80" cy="80" r="68" fill="none" stroke={scoreColor} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 68}`}
                strokeDashoffset={`${2 * Math.PI * 68 * (1 - (score?.score || 75) / 100)}`}
                style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 12px ${scoreColor}60)` }}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-5xl font-display font-bold text-white">{score?.score || 75}</div>
              <div className="text-xs text-white/35 uppercase tracking-widest mt-1">/ 100</div>
            </div>
          </div>
          <div className="mt-3 font-semibold capitalize" style={{ color: scoreColor }}>{score?.riskLevel || 'moderate'} risk</div>
          <div className="flex items-center justify-center gap-1 text-emerald-400 text-sm mt-1">
            <TrendingUp size={14} /> <span>{score?.trend || 'stable'}</span>
          </div>
        </div>

        <div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Radar name="Health" dataKey="value" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-white mb-4">6-Month Trend</h2>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={mockTrendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
            <Tooltip contentStyle={{ background: '#0f2040', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="#00D4FF" strokeWidth={2.5} dot={{ fill: '#00D4FF', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#00D4FF40', strokeWidth: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Vitals */}
      {vitalsDisplay.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Current Vitals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {vitalsDisplay.map(v => (
              <div key={v.label} className="glass-card p-4">
                <div className="label mb-2">{v.label}</div>
                <div className="text-xl font-display font-bold text-white">{v.value}</div>
                <div className="text-xs text-white/35 mt-0.5">{v.unit}</div>
                <div className={`mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${v.status === 'normal' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-amber-400/15 text-amber-400'}`}>{v.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SENTINEL alerts */}
      {risks.length > 0 && (
        <div>
          <h2 className="section-title mb-4">SENTINEL Alerts</h2>
          <div className="space-y-3">
            {risks.map((r, i) => (
              <div key={i} className="glass-card p-4 flex gap-3">
                <AlertTriangle size={18} className={r.severity === 'high' ? 'text-red-400 mt-0.5 flex-shrink-0' : 'text-amber-400 mt-0.5 flex-shrink-0'} />
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{r.type}</div>
                  <div className="text-xs text-white/50 mt-1">{r.message}</div>
                </div>
                <span className={`badge-${r.severity === 'high' ? 'danger' : 'warning'} self-start`}>{r.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      {medications.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Medication Adherence</h2>
          <div className="space-y-3">
            {medications.map(med => (
              <div key={med.id} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/12 flex items-center justify-center text-emerald-400">
                  <Pill size={16} strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{med.name} <span className="text-white/40 font-normal">{med.dose}</span></div>
                  <div className="text-xs text-white/40 mt-0.5">{med.frequency}</div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-white/35 mb-1">
                      <span>Adherence</span><span>{med.adherenceScore}%</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 cps-fill" style={{ width: `${med.adherenceScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
