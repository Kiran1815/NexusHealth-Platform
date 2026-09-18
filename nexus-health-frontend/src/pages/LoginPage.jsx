import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, Shield, Activity, Brain } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('patient@nexushealth.com');
  const [password, setPassword] = useState('password123');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to NEXUS HEALTH');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Patient', email: 'patient@nexushealth.com', color: 'cyan' },
    { label: 'Doctor', email: 'doctor@nexushealth.com', color: 'emerald' },
    { label: 'Admin', email: 'admin@nexushealth.com', color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating stats */}
      <div className="absolute top-8 right-8 hidden lg:flex flex-col gap-3">
        {[
          { icon: Activity, label: '124K+ Patients', color: 'cyan' },
          { icon: Brain, label: 'ARIA AI Active', color: 'emerald' },
          { icon: Shield, label: 'HIPAA Compliant', color: 'amber' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 glass-card animate-float" style={{ animationDelay: `${Math.random()}s` }}>
            <Icon size={14} className={color === 'cyan' ? 'text-cyan-400' : color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="text-xs text-white/60 font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-glow-cyan mb-5">
            <Zap size={28} className="text-navy-900" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">NEXUS HEALTH</h1>
          <p className="mt-2 text-white/40 text-sm">From symptom to solution in seconds</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-display font-semibold text-white mb-6">Sign In</h2>

          {/* Demo accounts */}
          <div className="mb-6">
            <p className="label mb-3">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(({ label, email: e, color }) => (
                <button key={label} onClick={() => { setEmail(e); setPassword('password123'); }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    email === e
                      ? color === 'cyan' ? 'bg-cyan-400/15 text-cyan-400 border-cyan-400/40' : color === 'emerald' ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/40' : 'bg-amber-400/15 text-amber-400 border-amber-400/40'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label mb-2 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="label mb-2 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><Zap size={16} strokeWidth={2.5} /> Access NEXUS HEALTH</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          Secured with AES-256 encryption · HIPAA & DPDP compliant
        </p>
      </div>
    </div>
  );
}
