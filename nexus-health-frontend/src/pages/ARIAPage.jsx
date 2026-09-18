import { useState } from 'react';
import { aiAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Brain, Zap, AlertTriangle, CheckCircle, ChevronRight, Clock, Stethoscope } from 'lucide-react';

const SEVERITY_OPTIONS = ['mild', 'moderate', 'severe'];
const DURATION_OPTIONS = [
  { value: 'today', label: 'Started today' },
  { value: '2-3-days', label: '2–3 days' },
  { value: 'week', label: 'About a week' },
  { value: 'more-than-week', label: 'More than a week' },
];

const CPSGauge = ({ score }) => {
  const color = score >= 75 ? '#ef4444' : score >= 50 ? '#FFB700' : '#00FF94';
  const label = score >= 75 ? 'Emergency' : score >= 50 ? 'Urgent' : score >= 30 ? 'Semi-Urgent' : 'Routine';
  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle cx="70" cy="70" r="58" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 58}`}
            strokeDashoffset={`${2 * Math.PI * 58 * (1 - score / 100)}`}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-display font-bold text-white">{score}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">CPS</div>
        </div>
      </div>
      <div className="mt-3 text-sm font-semibold" style={{ color }}>{label}</div>
      <div className="text-xs text-white/35 mt-1">Clinical Priority Score</div>
    </div>
  );
};

export default function ARIAPage() {
  const [step, setStep] = useState('input');
  const [form, setForm] = useState({ symptoms: '', duration: 'today', severity: 'moderate', age: '', existingConditions: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAssess = async () => {
    if (!form.symptoms.trim()) { toast.error('Please describe your symptoms'); return; }
    setLoading(true);
    try {
      const { data } = await aiAPI.ariaAssess({
        ...form,
        age: parseInt(form.age) || 30,
        existingConditions: form.existingConditions ? form.existingConditions.split(',').map(s => s.trim()) : [],
      });
      setResult(data.data);
      setStep('result');
    } catch (err) {
      toast.error('Assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationConfig = (rec) => ({
    'emergency': { color: 'red', label: 'Go to Emergency', icon: AlertTriangle, desc: 'Seek immediate emergency care' },
    'specialist': { color: 'amber', label: 'See a Specialist', icon: Stethoscope, desc: 'Book an urgent specialist appointment' },
    'gp': { color: 'cyan', label: 'See a GP', icon: Stethoscope, desc: 'Schedule a general practitioner visit' },
    'self-care': { color: 'emerald', label: 'Self-Care Advised', icon: CheckCircle, desc: 'Monitor at home with these tips' },
  }[rec] || { color: 'cyan', label: 'Consult a Doctor', icon: Stethoscope, desc: 'Schedule an appointment' });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 flex items-center justify-center border border-emerald-400/25">
          <Brain size={22} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">ARIA</h1>
          <p className="text-white/40 text-sm">Adaptive Reasoning for Illness Assessment</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">AI Online</span>
        </div>
      </div>

      {step === 'input' && (
        <div className="glass-card p-6 space-y-5">
          <p className="text-white/60 text-sm leading-relaxed">
            Describe what you're experiencing and ARIA will assess your symptoms, generate a Clinical Priority Score, and recommend appropriate care — with full reasoning transparency.
          </p>

          <div>
            <label className="label mb-2 block">Describe your symptoms *</label>
            <textarea
              value={form.symptoms}
              onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
              className="input-field min-h-[110px] resize-none"
              placeholder="e.g. I have had a persistent headache for 3 days, mild fever around 100°F, and feel tired..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-2 block">Duration</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="input-field">
                {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-2 block">Your Age</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="input-field" placeholder="30" min="1" max="120" />
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Severity</label>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, severity: s }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize border transition-all duration-200 ${
                    form.severity === s ? s === 'mild' ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/40' : s === 'moderate' ? 'bg-amber-400/15 text-amber-400 border-amber-400/40' : 'bg-red-400/15 text-red-400 border-red-400/40' : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Existing Conditions (optional)</label>
            <input type="text" value={form.existingConditions} onChange={e => setForm(f => ({ ...f, existingConditions: e.target.value }))} className="input-field" placeholder="e.g. diabetes, hypertension, asthma" />
          </div>

          <button onClick={handleAssess} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" /> Analyzing symptoms...</> : <><Zap size={16} strokeWidth={2.5} /> Start ARIA Assessment</>}
          </button>

          <p className="text-center text-[11px] text-white/25">AI assessment only. Does not replace professional medical advice.</p>
        </div>
      )}

      {step === 'result' && result && (() => {
        const rec = getRecommendationConfig(result.recommendation);
        return (
          <div className="space-y-4 animate-slide-up">
            {/* CPS Gauge */}
            <div className="glass-card p-6 text-center">
              <CPSGauge score={result.cps} />
              <div className="mt-4 flex justify-center gap-4 text-xs text-white/35">
                <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                <span>·</span>
                <span>Assessed at {new Date(result.assessedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`glass-card p-5 border-l-2 ${rec.color === 'red' ? 'border-l-red-400' : rec.color === 'amber' ? 'border-l-amber-400' : rec.color === 'emerald' ? 'border-l-emerald-400' : 'border-l-cyan-400'}`}>
              <div className="flex items-center gap-3">
                <rec.icon size={20} className={rec.color === 'red' ? 'text-red-400' : rec.color === 'amber' ? 'text-amber-400' : rec.color === 'emerald' ? 'text-emerald-400' : 'text-cyan-400'} />
                <div>
                  <div className="font-semibold text-white">{rec.label}</div>
                  <div className="text-sm text-white/50">{rec.desc}</div>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Brain size={14} className="text-emerald-400" /> ARIA's Reasoning Chain
              </h3>
              <div className="space-y-2">
                {result.reasoning?.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                    <div className="w-5 h-5 rounded-full bg-emerald-400/15 text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Possible causes */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Possible Causes</h3>
              <div className="flex flex-wrap gap-2">
                {result.possibleCauses?.map(c => <span key={c} className="badge-info">{c}</span>)}
              </div>
            </div>

            {/* Self care */}
            {result.selfCareAdvice && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Self-Care Recommendations</h3>
                <div className="space-y-2">
                  {result.selfCareAdvice.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-white/60">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" /> {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up questions */}
            {result.followUpQuestions?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Follow-up Questions</h3>
                <div className="space-y-2">
                  {result.followUpQuestions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/60 py-2 border-b border-white/6 last:border-0">
                      <ChevronRight size={14} className="text-white/25" /> {q}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setStep('input'); setResult(null); }} className="btn-secondary flex-1">New Assessment</button>
              <button className="btn-primary flex-1">Book Appointment</button>
            </div>

            <p className="text-center text-[11px] text-white/25">{result.disclaimer}</p>
          </div>
        );
      })()}
    </div>
  );
}
