import { useState, useEffect } from 'react';
import { doctorAPI, appointmentAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Star, MapPin, Clock, Check, ChevronRight, User, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SPECIALIZATIONS = ['All', 'General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Psychiatry'];

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState('');
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (spec !== 'All') params.specialization = spec;
        const { data } = await doctorAPI.getAll(params);
        setDoctors(data.data);
      } catch { toast.error('Failed to load doctors'); }
      finally { setLoading(false); }
    };
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search, spec]);

  const handleSelectDoctor = async (doc) => {
    setSelected(doc);
    setSelectedSlot('');
    try {
      const { data } = await doctorAPI.getSlots(doc.id, date);
      setSlots(data.data);
    } catch { toast.error('Failed to load slots'); }
  };

  const handleDateChange = async (newDate) => {
    setDate(newDate);
    if (selected) {
      try {
        const { data } = await doctorAPI.getSlots(selected.id, newDate);
        setSlots(data.data);
      } catch {}
    }
  };

  const handleBook = async () => {
    if (!selected || !selectedSlot) { toast.error('Select a time slot'); return; }
    setBooking(true);
    try {
      await appointmentAPI.book({ doctorId: selected.id, date, time: selectedSlot, symptoms, type: 'consultation' });
      toast.success('Appointment confirmed!');
      navigate('/appointments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally { setBooking(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Find a Doctor</h1>
        <p className="text-white/40 text-sm mt-1">AI-powered doctor matching and smart slot booking</p>
      </div>

      {!selected ? (
        <>
          {/* Search + filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-11" placeholder="Search doctors or specializations..." />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {SPECIALIZATIONS.map(s => (
                <button key={s} onClick={() => setSpec(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all duration-200 ${spec === s ? 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-36 rounded-2xl skeleton" />)}</div>
          ) : (
            <div className="grid gap-4">
              {doctors.map(doc => (
                <button key={doc.id} onClick={() => handleSelectDoctor(doc)} className="glass-card-hover p-5 text-left w-full group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/15 to-emerald-400/10 border border-white/10 flex items-center justify-center text-white font-display font-bold text-xl flex-shrink-0">
                      {doc.name?.charAt(3).toUpperCase() || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{doc.name}</h3>
                        {doc.available ? <span className="badge-success text-[10px]">Available</span> : <span className="badge-danger text-[10px]">Busy</span>}
                      </div>
                      <p className="text-sm text-white/50 mt-0.5">{doc.specialization}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/35">
                        <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" /> {doc.rating}</span>
                        <span>{doc.experience} yrs exp</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {doc.location?.city}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-semibold">₹{doc.consultationFee}</div>
                      <div className="text-xs text-white/35 mt-0.5">per visit</div>
                      <ChevronRight size={16} className="text-white/20 group-hover:text-cyan-400 transition-colors ml-auto mt-2" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-5 animate-slide-up">
          <button onClick={() => setSelected(null)} className="text-sm text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
            ← Back to doctors
          </button>

          {/* Doctor summary */}
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/15 to-emerald-400/10 border border-white/10 flex items-center justify-center text-white font-display font-bold text-xl">
              {selected.name?.charAt(3).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-white">{selected.name}</h3>
              <p className="text-sm text-white/50">{selected.specialization}</p>
              <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                <Star size={11} /> {selected.rating} · ₹{selected.consultationFee}
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="label mb-2 block">Select Date</label>
            <input type="date" value={date} onChange={e => handleDateChange(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input-field" />
          </div>

          {/* Slots */}
          <div>
            <label className="label mb-3 block">Available Time Slots</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {slots.map(slot => (
                <button key={slot.time} disabled={!slot.available} onClick={() => setSelectedSlot(slot.time)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all duration-200 relative ${
                    !slot.available ? 'opacity-30 cursor-not-allowed bg-white/3 text-white/30 border-white/8'
                    : selectedSlot === slot.time ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/50 shadow-glow-cyan'
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/25 hover:text-white'
                  }`}>
                  {selectedSlot === slot.time && <Check size={10} className="absolute top-1 right-1" />}
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="label mb-2 block">Reason for Visit</label>
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="Briefly describe your symptoms or reason for appointment..." />
          </div>

          <button onClick={handleBook} disabled={!selectedSlot || booking} className="btn-primary w-full flex items-center justify-center gap-2">
            {booking ? <><div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" /> Confirming...</> : <><Zap size={16} strokeWidth={2.5} /> Confirm Appointment</>}
          </button>
        </div>
      )}
    </div>
  );
}
