import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Plus, X, CheckCircle, RotateCcw } from 'lucide-react';

const STATUS_COLORS = {
  confirmed: 'info', completed: 'success', cancelled: 'danger', 'in-progress': 'warning'
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await appointmentAPI.getAll();
        setAppointments(data.data);
      } catch { toast.error('Failed to load appointments'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleCancel = async (id) => {
    try {
      await appointmentAPI.updateStatus(id, 'cancelled');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled');
    } catch { toast.error('Failed to cancel'); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Appointments</h1>
          <p className="text-white/40 text-sm mt-1">{appointments.length} total appointments</p>
        </div>
        <button onClick={() => navigate('/book')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Book New
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
              filter === f.key ? 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30' : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={36} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No appointments found</p>
          <button onClick={() => navigate('/book')} className="btn-primary mt-4">Book Your First Appointment</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <div key={apt.id} className="glass-card-hover p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-400/12 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <User size={18} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-white">{apt.doctorName}</h3>
                    <span className={`badge-${STATUS_COLORS[apt.status] || 'info'}`}>{apt.status}</span>
                  </div>
                  <p className="text-sm text-white/50 mt-0.5">{apt.specialization} · {apt.type}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/35">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {apt.date}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {apt.time}</span>
                    {apt.fee && <span>₹{apt.fee}</span>}
                  </div>
                  {apt.symptoms && <p className="text-xs text-white/30 mt-1.5 truncate">"{apt.symptoms}"</p>}
                </div>
                {apt.status === 'confirmed' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleCancel(apt.id)} className="p-2 rounded-xl hover:bg-red-400/15 hover:text-red-400 text-white/30 transition-all duration-200">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {apt.status === 'completed' && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-1" />}
              </div>
              {apt.priorityScore > 60 && (
                <div className="mt-3 pt-3 border-t border-white/6">
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Priority appointment — CPS: {apt.priorityScore}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
