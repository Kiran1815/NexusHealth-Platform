import { useState } from 'react';
import { aiAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Brain, Heart, CheckCircle, Phone, BookOpen, Wind } from 'lucide-react';

const PHQ_QUESTIONS = [
  { id: 'q1', text: 'Little interest or pleasure in doing things', shortLabel: 'Low interest' },
  { id: 'q2', text: 'Feeling down, depressed, or hopeless', shortLabel: 'Low mood' },
  { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much', shortLabel: 'Sleep issues' },
  { id: 'q4', text: 'Feeling tired or having little energy', shortLabel: 'Low energy' },
];

const SCORE_LABELS = ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'];

export default function EchoPage() {
  const [step, setStep] = useState('intro');
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (Object.keys(responses).length < PHQ_QUESTIONS.length) { toast.error('Please answer all questions'); return; }
    setLoading(true);
    try {
      const responseArr = PHQ_QUESTIONS.map(q => ({ question: q.shortLabel, score: responses[q.id] || 0 }));
      const { data } = await aiAPI.echoCheckin({ responses: responseArr });
      setResult(data.data);
      setStep('result');
    } catch { toast.error('Check-in failed'); }
    finally { setLoading(false); }
  };

  const getAssessmentColor = (a) => a === 'minimal' ? 'emerald' : a === 'mild' ? 'cyan' : a === 'moderate' ? 'amber' : 'red';

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 border border-emerald-400/25 flex items-center justify-center">
          <Heart size={20} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">ECHO</h1>
          <p className="text-white/40 text-sm">Mental Health Companion</p>
        </div>
      </div>

      {step === 'intro' && (
        <div className="glass-card p-6 space-y-5">
          <p className="text-white/60 text-sm leading-relaxed">
            ECHO is your daily mental wellness check-in. It takes under 2 minutes and uses validated PHQ-4 screening to understand how you're feeling — not to judge, but to support.
          </p>
          <div className="space-y-3">
            {[
              { icon: Brain, text: 'Evidence-based PHQ-4 screening' },
              { icon: Heart, text: 'Personalized resources and exercises' },
              { icon: CheckCircle, text: 'Crisis support with immediate counselor connection' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/60">
                <Icon size={15} className="text-emerald-400 flex-shrink-0" /> {text}
              </div>
            ))}
          </div>
          <button onClick={() => setStep('checkin')} className="btn-primary w-full">Start Mental Health Check-in</button>
          <p className="text-center text-[11px] text-white/25">Your responses are private and encrypted.</p>
        </div>
      )}

      {step === 'checkin' && (
        <div className="space-y-4 animate-slide-up">
          <p className="text-sm text-white/50">Over the last 2 weeks, how often have you been bothered by:</p>
          {PHQ_QUESTIONS.map((q, i) => (
            <div key={q.id} className="glass-card p-5">
              <p className="text-sm font-medium text-white mb-4">{i + 1}. {q.text}</p>
              <div className="grid grid-cols-2 gap-2">
                {SCORE_LABELS.map((label, score) => (
                  <button key={score} onClick={() => setResponses(r => ({ ...r, [q.id]: score }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left transition-all duration-200 ${
                      responses[q.id] === score ? score === 0 ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40' : score <= 1 ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/40' : score === 2 ? 'bg-amber-400/20 text-amber-400 border-amber-400/40' : 'bg-red-400/20 text-red-400 border-red-400/40'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" /> Processing...</> : 'Complete Check-in'}
          </button>
        </div>
      )}

      {step === 'result' && result && (() => {
        const color = getAssessmentColor(result.assessment);
        return (
          <div className="space-y-4 animate-slide-up">
            <div className="glass-card p-6 text-center">
              <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${color === 'emerald' ? 'bg-emerald-400/15' : color === 'amber' ? 'bg-amber-400/15' : color === 'red' ? 'bg-red-400/15' : 'bg-cyan-400/15'}`}>
                <Heart size={28} className={color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : color === 'red' ? 'text-red-400' : 'text-cyan-400'} />
              </div>
              <div className="text-4xl font-display font-bold text-white mb-1">{result.score}<span className="text-lg text-white/30">/12</span></div>
              <div className={`text-sm font-semibold capitalize mb-3 ${color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : color === 'red' ? 'text-red-400' : 'text-cyan-400'}`}>{result.assessment?.replace('-', ' ')} symptoms</div>
              <p className="text-sm text-white/60">{result.message}</p>
            </div>

            {result.resources?.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4">Resources for You</h3>
                <div className="space-y-3">
                  {result.resources.map((r, i) => (
                    <div key={i} className={`p-3 rounded-xl flex items-start gap-3 border ${r.type === 'crisis' ? 'bg-red-400/8 border-red-400/20' : 'bg-emerald-400/8 border-emerald-400/15'}`}>
                      {r.type === 'crisis' ? <Phone size={16} className="text-red-400 mt-0.5 flex-shrink-0" /> : r.type === 'exercise' ? <Wind size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <BookOpen size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />}
                      <div>
                        <div className="text-sm font-medium text-white">{r.name || r.title}</div>
                        <div className="text-xs text-white/50 mt-0.5">{r.contact || r.description || r.readTime}</div>
                        {r.available && <div className="text-[10px] text-white/30 mt-0.5">{r.available}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setStep('intro'); setResponses({}); setResult(null); }} className="btn-secondary flex-1">Start Over</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
