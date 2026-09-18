import { useState, useEffect } from 'react';
import { recordsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FileText, Plus, Tag, Share2, Calendar, Filter, Stethoscope, Pill, TestTube, Scan, Syringe } from 'lucide-react';

const TYPE_CONFIG = {
  diagnosis: { icon: Stethoscope, color: 'cyan', label: 'Diagnosis' },
  prescription: { icon: Pill, color: 'emerald', label: 'Prescription' },
  lab: { icon: TestTube, color: 'amber', label: 'Lab Report' },
  scan: { icon: Scan, color: 'cyan', label: 'Scan/Imaging' },
  vaccination: { icon: Syringe, color: 'emerald', label: 'Vaccination' },
  note: { icon: FileText, color: 'cyan', label: 'Doctor Note' },
};

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: 'diagnosis', title: '', description: '', date: new Date().toISOString().split('T')[0], doctor: '', tags: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await recordsAPI.getTimeline();
        setRecords(data.data);
      } catch { toast.error('Failed to load records'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { data } = await recordsAPI.create({ ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] });
      setRecords(prev => [data.data, ...prev]);
      setAdding(false);
      setForm({ type: 'diagnosis', title: '', description: '', date: new Date().toISOString().split('T')[0], doctor: '', tags: '' });
      toast.success('Record added');
    } catch { toast.error('Failed to add record'); }
  };

  const handleShare = async (id) => {
    try {
      const { data } = await recordsAPI.getShare(id);
      toast.success(`Share token: ${data.data.shareToken.slice(0,20)}... (valid 1hr)`);
    } catch { toast.error('Failed to generate share link'); }
  };

  const filtered = filter === 'all' ? records : records.filter(r => r.type === filter);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Medical Records</h1>
          <p className="text-white/40 text-sm mt-1">FHIR R4 compliant · Blockchain anchored</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Record
        </button>
      </div>

      {/* Add record modal */}
      {adding && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg animate-slide-up">
            <h3 className="font-display font-bold text-white text-lg mb-5">Add Medical Record</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label mb-2 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label mb-2 block">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label mb-2 block">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Record title" required />
              </div>
              <div>
                <label className="label mb-2 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field min-h-[80px] resize-none" placeholder="Details..." />
              </div>
              <div>
                <label className="label mb-2 block">Doctor</label>
                <input value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} className="input-field" placeholder="Dr. Name" />
              </div>
              <div>
                <label className="label mb-2 block">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="e.g. cardiac, follow-up" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAdding(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all duration-200 ${filter === 'all' ? 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30' : 'bg-white/5 text-white/40 border-white/10'}`}>All</button>
        {Object.entries(TYPE_CONFIG).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all duration-200 ${filter === k ? 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/8" />
        <div className="space-y-4">
          {filtered.map((rec, i) => {
            const conf = TYPE_CONFIG[rec.type] || TYPE_CONFIG.note;
            const Icon = conf.icon;
            return (
              <div key={rec.id} className="flex gap-4 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 ${conf.color === 'amber' ? 'bg-amber-400/12 text-amber-400 border border-amber-400/20' : conf.color === 'emerald' ? 'bg-emerald-400/12 text-emerald-400 border border-emerald-400/20' : 'bg-cyan-400/12 text-cyan-400 border border-cyan-400/20'}`}>
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div className="glass-card-hover flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white text-sm">{rec.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${conf.color === 'amber' ? 'bg-amber-400/15 text-amber-400' : conf.color === 'emerald' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-cyan-400/15 text-cyan-400'}`}>{conf.label}</span>
                      </div>
                      <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{rec.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {rec.date}</span>
                        {rec.doctor && <span>{rec.doctor}</span>}
                      </div>
                      {rec.tags?.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {rec.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-white/35 border border-white/8">{t}</span>)}
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleShare(rec.id)} className="p-2 rounded-xl hover:bg-cyan-400/15 hover:text-cyan-400 text-white/20 transition-all duration-200 flex-shrink-0">
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FileText size={36} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No records found</p>
        </div>
      )}
    </div>
  );
}
