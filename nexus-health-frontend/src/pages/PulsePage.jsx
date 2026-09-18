import { useState, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import { Globe, TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, RefreshCw } from 'lucide-react';

const SEVERITY_COLORS = { low: 'emerald', moderate: 'amber', high: 'red' };

export default function PulsePage() {
  const [heatmap, setHeatmap] = useState(null);
  const [surge, setSurge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const load = async () => {
    try {
      const [h, s] = await Promise.allSettled([aiAPI.pulseHeatmap(), aiAPI.pulseSurge()]);
      if (h.status === 'fulfilled') setHeatmap(h.value.data.data);
      if (s.status === 'fulfilled') setSurge(s.value.data.data);
      setLastUpdated(new Date());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const interval = setInterval(load, 60000); return () => clearInterval(interval); }, []);

  const TrendIcon = ({ trend }) => trend === 'rising' ? <TrendingUp size={14} className="text-red-400" /> : trend === 'declining' ? <TrendingDown size={14} className="text-emerald-400" /> : <Minus size={14} className="text-amber-400" />;

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            PULSE
          </h1>
          <p className="text-white/40 text-sm mt-1">Population Intelligence & Outbreak Surveillance</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-white/8 text-white/40 hover:text-white/70 transition-all duration-200">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Alert banner */}
      {heatmap?.alertLevel !== 'low' && (
        <div className={`glass-card p-4 flex items-center gap-3 border-l-2 ${heatmap?.alertLevel === 'high' ? 'border-l-red-400 bg-red-400/5' : 'border-l-amber-400 bg-amber-400/5'}`}>
          <AlertTriangle size={18} className={heatmap?.alertLevel === 'high' ? 'text-red-400' : 'text-amber-400'} />
          <div>
            <div className="font-semibold text-white text-sm">Active Disease Surveillance Alert</div>
            <div className="text-xs text-white/50 mt-0.5">{heatmap?.affectedAreas} areas with elevated disease activity · Updated {lastUpdated.toLocaleTimeString()}</div>
          </div>
        </div>
      )}

      {/* Outbreak map placeholder */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-white mb-4">Outbreak Heatmap — Hyderabad Region</h2>
        <div className="relative h-48 bg-navy-950/60 rounded-xl overflow-hidden border border-white/8">
          {/* Mock map with outbreak indicators */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/20 text-sm">Geographic heatmap visualization</div>
          </div>
          {heatmap?.outbreaks?.map((ob, i) => {
            const positions = [{ top: '30%', left: '45%' }, { top: '55%', left: '65%' }, { top: '40%', left: '30%' }];
            const pos = positions[i] || positions[0];
            return (
              <div key={ob.id} className="absolute" style={pos}>
                <div className={`w-8 h-8 rounded-full opacity-60 animate-pulse-slow ${ob.severity === 'high' ? 'bg-red-500' : ob.severity === 'moderate' ? 'bg-amber-400' : 'bg-yellow-300'}`} />
                <div className={`absolute inset-0 w-8 h-8 rounded-full scale-150 opacity-20 ${ob.severity === 'high' ? 'bg-red-500' : 'bg-amber-400'} animate-ping`} />
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-white/35">
          {[['high', 'red'], ['moderate', 'amber'], ['low', 'yellow']].map(([sev, col]) => (
            <div key={sev} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full bg-${col}-${col === 'yellow' ? '300' : '400'}`} />
              <span className="capitalize">{sev} activity</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active outbreaks */}
      <div>
        <h2 className="section-title mb-4">Active Disease Tracking</h2>
        <div className="space-y-3">
          {heatmap?.outbreaks?.map(ob => {
            const color = SEVERITY_COLORS[ob.severity] || 'amber';
            return (
              <div key={ob.id} className="glass-card-hover p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{ob.disease}</h3>
                      <span className={`badge-${color === 'red' ? 'danger' : color === 'amber' ? 'warning' : 'success'}`}>{ob.severity}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                      <span>{ob.cases} reported cases</span>
                      <span className="flex items-center gap-1"><TrendIcon trend={ob.trend} /> {ob.trend}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'red' ? 'bg-red-400/12 text-red-400' : color === 'amber' ? 'bg-amber-400/12 text-amber-400' : 'bg-emerald-400/12 text-emerald-400'}`}>
                    <Activity size={20} strokeWidth={1.8} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/30 mb-1"><span>Case intensity</span><span>{ob.cases}/1000 pop</span></div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full cps-fill ${color === 'red' ? 'bg-red-400' : color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(ob.cases / 3, 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospital surge */}
      <div>
        <h2 className="section-title mb-4">Hospital Surge Prediction</h2>
        <div className="space-y-3">
          {surge.map(hosp => (
            <div key={hosp.hospitalId} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{hosp.hospitalName}</h3>
                  {hosp.alert && <span className="badge-danger text-[10px] mt-1 inline-block">Surge Alert</span>}
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/35">Current</div>
                  <div className={`text-xl font-display font-bold ${hosp.currentLoad > 85 ? 'text-red-400' : hosp.currentLoad > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>{hosp.currentLoad}%</div>
                </div>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full cps-fill ${hosp.currentLoad > 85 ? 'bg-red-400' : hosp.currentLoad > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${hosp.currentLoad}%` }} />
              </div>
              <div className="flex justify-between text-xs text-white/30">
                <span>4h forecast: <span className={hosp.predicted4h > hosp.currentLoad ? 'text-amber-400' : 'text-emerald-400'}>{hosp.predicted4h}%</span></span>
                <span>24h forecast: <span className="text-white/50">{hosp.predicted24h}%</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
