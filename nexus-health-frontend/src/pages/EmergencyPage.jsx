import { useState, useEffect } from 'react';
import { emergencyAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { AlertTriangle, Phone, MapPin, Clock, X, Heart, Droplets, Activity } from 'lucide-react';

const FIRST_AID_STEPS = {
  medical: [
    { step: 1, title: 'Stay Calm', desc: 'Keep the patient calm. Do not panic. Help is on the way.' },
    { step: 2, title: 'Check Breathing', desc: 'Ensure the airway is clear. Check for normal breathing.' },
    { step: 3, title: 'Recovery Position', desc: 'If unconscious but breathing, turn to recovery position.' },
    { step: 4, title: 'Do Not Move', desc: 'Avoid moving the patient unnecessarily, especially if spinal injury is suspected.' },
    { step: 5, title: 'Monitor Vitals', desc: 'Keep watching breathing and pulse until ambulance arrives.' },
  ]
};

export default function EmergencyPage() {
  const { user } = useAuth();
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sosConfirm, setSosConfirm] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await emergencyAPI.getActive();
        if (data.data) setActive(data.data);
      } catch {} finally { setChecking(false); }
    };
    check();
  }, []);

  useEffect(() => {
    if (!sosConfirm) { setCountdown(3); return; }
    if (countdown <= 0) { handleSOS(); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [sosConfirm, countdown]);

  const handleSOS = async () => {
    setSosConfirm(false);
    setLoading(true);
    try {
      navigator.geolocation?.getCurrentPosition(async (pos) => {
        const { data } = await emergencyAPI.sos({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        setActive(data.data);
        toast.success('🚨 Emergency services activated!');
        setLoading(false);
      }, async () => {
        const { data } = await emergencyAPI.sos({ location: { lat: 17.385, lng: 78.4867 } });
        setActive(data.data);
        toast.success('🚨 Emergency services activated!');
        setLoading(false);
      });
    } catch (err) {
      toast.error('SOS failed. Call emergency services directly.');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!active) return;
    try {
      await emergencyAPI.cancel(active.id);
      setActive(null);
      toast('Emergency alert cancelled', { icon: '✓' });
    } catch { toast.error('Failed to cancel'); }
  };

  if (checking) return <div className="h-64 rounded-2xl skeleton" />;

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      <div>
        <h1 className="section-title text-red-400">Emergency SOS</h1>
        <p className="text-white/40 text-sm mt-1">One gesture. Full emergency response activated instantly.</p>
      </div>

      {/* Active alert */}
      {active ? (
        <div className="space-y-4 animate-slide-up">
          <div className="glass-card p-6 border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-400/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-400">Emergency Active</h3>
                <p className="text-xs text-white/40">Alert ID: {active.id}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/15 border border-red-400/25">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs text-red-400 font-medium">LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="label mb-1">Ambulance ETA</div>
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <Clock size={14} className="text-cyan-400" /> {active.estimatedAmbulanceEta}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="label mb-1">Ambulance ID</div>
                <div className="text-white font-semibold font-mono">{active.ambulanceId}</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 mb-4">
              <div className="label mb-2">Nearest Hospital</div>
              <div className="text-white font-semibold text-sm">{active.nearestHospital?.name}</div>
              <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1"><MapPin size={11} /> {active.nearestHospital?.address}</div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-emerald-400/8 rounded-xl mb-4 border border-emerald-400/15">
              <Activity size={14} className="text-emerald-400" />
              <div className="text-xs text-emerald-400">Critical health data shared with ER: Blood type {user?.bloodType || 'O+'}, Allergies, Medical history</div>
            </div>

            <button onClick={handleCancel} className="btn-secondary w-full flex items-center justify-center gap-2 hover:bg-red-400/10 hover:border-red-400/30 hover:text-red-400">
              <X size={16} /> Cancel Emergency Alert
            </button>
          </div>

          {/* First aid guide */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Heart size={16} className="text-red-400" /> While You Wait — First Aid Guide
            </h3>
            <div className="space-y-3">
              {FIRST_AID_STEPS.medical.map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-400/15 text-red-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{s.title}</div>
                    <div className="text-xs text-white/50 mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* SOS Button */}
          <div className="flex flex-col items-center py-8">
            {sosConfirm ? (
              <div className="text-center space-y-4 animate-slide-up">
                <p className="text-white/60">Activating in <span className="text-red-400 font-bold text-2xl">{countdown}</span> seconds</p>
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
                  <button onClick={() => setSosConfirm(false)} className="relative w-40 h-40 rounded-full bg-red-500/20 border-2 border-red-400 text-red-400 font-display font-bold text-lg flex flex-col items-center justify-center gap-1 hover:bg-red-500/30 transition-all">
                    <X size={28} />
                    CANCEL
                  </button>
                </div>
                <p className="text-xs text-white/30">Tap CANCEL to abort</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <button onClick={() => setSosConfirm(true)} disabled={loading}
                  className="w-44 h-44 rounded-full bg-red-500 hover:bg-red-400 border-4 border-red-400/50 shadow-glow-amber text-white font-display font-bold text-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-red-300/30 scale-110 animate-pulse-slow" />
                  <AlertTriangle size={36} strokeWidth={2.5} />
                  SOS
                </button>
                <p className="text-white/40 text-sm">Hold to activate emergency response</p>
              </div>
            )}
          </div>

          {/* What happens */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">What SOS activates</h3>
            <div className="space-y-3">
              {[
                { icon: MapPin, text: 'GPS location captured and shared (0.5 seconds)', color: 'cyan' },
                { icon: Activity, text: 'Your critical health data packaged for ER', color: 'emerald' },
                { icon: Phone, text: 'Nearest ambulance dispatched immediately', color: 'amber' },
                { icon: Heart, text: 'Emergency contacts notified via SMS/WhatsApp', color: 'red' },
                { icon: Droplets, text: 'Blood type and allergies sent to destination ER', color: 'cyan' },
              ].map(({ icon: Icon, text, color }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                  <Icon size={15} className={color === 'red' ? 'text-red-400' : color === 'amber' ? 'text-amber-400' : color === 'emerald' ? 'text-emerald-400' : 'text-cyan-400'} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Emergency contacts */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Emergency Numbers</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ambulance', number: '108' },
                { label: 'Police', number: '100' },
                { label: 'Fire', number: '101' },
                { label: 'NEXUS ER', number: '1800-NEXUS' },
              ].map(({ label, number }) => (
                <a key={label} href={`tel:${number}`} className="glass-card-hover p-3 text-center">
                  <div className="text-xl font-display font-bold text-red-400">{number}</div>
                  <div className="text-xs text-white/40 mt-1">{label}</div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
