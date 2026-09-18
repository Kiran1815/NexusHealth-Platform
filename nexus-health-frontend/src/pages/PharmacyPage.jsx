import { useState, useEffect } from 'react';
import { pharmacyAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Pill, MapPin, Phone, Clock, Search, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PharmacyPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [searchDrug, setSearchDrug] = useState('');
  const [interactionDrugs, setInteractionDrugs] = useState('');
  const [interactions, setInteractions] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pharmacyAPI.getNearby().then(({ data }) => setPharmacies(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCheckAvailability = async () => {
    if (!searchDrug.trim()) return;
    try {
      const { data } = await pharmacyAPI.checkAvailability({ medicines: searchDrug.split(',').map(s => s.trim()) });
      setAvailability(data.data);
    } catch { toast.error('Failed to check availability'); }
  };

  const handleCheckInteractions = async () => {
    if (!interactionDrugs.trim()) return;
    try {
      const { data } = await pharmacyAPI.checkInteractions({ drugs: interactionDrugs.split(',').map(s => s.trim()) });
      setInteractions(data.data);
      if (data.data.safe) toast.success('No dangerous interactions found');
      else toast.error(`${data.data.interactions.length} interaction(s) detected!`);
    } catch { toast.error('Failed to check interactions'); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Pharmacy</h1>
        <p className="text-white/40 text-sm mt-1">Medicine availability, interactions, and nearby pharmacies</p>
      </div>

      {/* Drug interaction checker */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" /> Drug Interaction Checker
        </h2>
        <div className="flex gap-3">
          <input value={interactionDrugs} onChange={e => setInteractionDrugs(e.target.value)} className="input-field flex-1" placeholder="e.g. Aspirin, Warfarin, Metoprolol" />
          <button onClick={handleCheckInteractions} className="btn-primary whitespace-nowrap">Check</button>
        </div>
        {interactions && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {interactions.safe ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm p-3 rounded-xl bg-emerald-400/8 border border-emerald-400/15">
                <CheckCircle size={15} /> No dangerous interactions found between these medications.
              </div>
            ) : interactions.interactions.map((inter, i) => (
              <div key={i} className="p-3 rounded-xl bg-red-400/8 border border-red-400/20">
                <div className="flex items-center gap-2 text-red-400 font-medium text-sm mb-1">
                  <AlertTriangle size={14} /> {inter.drugs.join(' + ')} — {inter.severity} interaction
                </div>
                <p className="text-xs text-white/50">{inter.warning}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medicine availability search */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Search size={16} className="text-cyan-400" /> Check Nearby Availability
        </h2>
        <div className="flex gap-3">
          <input value={searchDrug} onChange={e => setSearchDrug(e.target.value)} className="input-field flex-1" placeholder="e.g. Amlodipine, Paracetamol" />
          <button onClick={handleCheckAvailability} className="btn-primary whitespace-nowrap">Search</button>
        </div>
        {availability && (
          <div className="mt-4 space-y-3 animate-slide-up">
            {availability.map(ph => (
              <div key={ph.id} className="bg-white/4 rounded-xl p-4 border border-white/8">
                <div className="font-medium text-white text-sm mb-2">{ph.name}</div>
                <div className="space-y-1.5">
                  {ph.availability?.map(med => (
                    <div key={med.medicine} className="flex items-center justify-between text-xs">
                      <span className="text-white/60">{med.medicine}</span>
                      <div className="flex items-center gap-2">
                        {med.available ? <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={11} /> ₹{med.price}</span> : <span className="text-red-400">Not available</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearby pharmacies */}
      <div>
        <h2 className="section-title mb-4">Nearby Pharmacies</h2>
        <div className="space-y-3">
          {pharmacies.map(ph => (
            <div key={ph.id} className="glass-card-hover p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/12 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <Pill size={18} strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{ph.name}</h3>
                    {ph.open ? <span className="badge-success text-[10px]">Open</span> : <span className="badge-danger text-[10px]">Closed</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/40 mt-1"><MapPin size={11} />{ph.address}</div>
                  <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5"><Phone size={11} />{ph.phone}</div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {ph.medicines?.slice(0, 4).map(m => <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/15">{m}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
