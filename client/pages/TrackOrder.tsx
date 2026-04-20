import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface TrackingUpdate {
  id: number;
  status: string;
  location: string;
  notes: string;
  created_at: string;
}

const TrackOrder: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`);
      if (res.ok) {
        setTrackingData(await res.json());
      } else {
        setTrackingData([]);
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 lg:py-32">
        <div className="text-center mb-16">
           <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4 italic">Track Your <span className="text-indigo-600">Package</span></h1>
           <p className="text-slate-500 font-medium text-lg lg:text-xl">Enter your order ID below to see the real-time status of your FEUDA assets.</p>
        </div>

        <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-indigo-100/20 border border-slate-100 mb-12">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
               <input 
                 type="text" 
                 placeholder="Order ID (ex: ORD-12345)"
                 className="flex-1 bg-slate-50 border border-slate-100 rounded-3xl px-8 py-5 text-lg font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                 value={orderId}
                 onChange={e => setOrderId(e.target.value)}
                 required
               />
               <button 
                 type="submit" 
                 className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-sm tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
               >
                 Locate Assets
               </button>
            </form>
        </div>

        {loading ? (
          <div className="flex justify-center p-20 text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Accessing Satellite Stream...</div>
        ) : searched && (
          <div className="space-y-8 animate-fade-in">
             {trackingData.length === 0 ? (
               <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
                  <p className="text-slate-400 font-bold text-lg">No tracking nodes found for this identifier.</p>
               </div>
             ) : (
               <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-10 lg:left-12 top-0 bottom-0 w-px bg-slate-200"></div>
                  
                  <div className="space-y-12">
                     {trackingData.map((update, idx) => (
                        <div key={update.id} className="relative flex gap-8 items-start">
                           <div className={`w-20 lg:w-24 h-20 lg:h-24 rounded-[2rem] flex items-center justify-center shrink-0 z-10 border-4 border-slate-50 shadow-lg ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300'}`}>
                              {idx === 0 ? (
                                <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                              ) : (
                                <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                              )}
                           </div>
                           
                           <div className="pt-4 lg:pt-6">
                              <h3 className={`text-xl lg:text-2xl font-black tracking-tight mb-1 ${idx === 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                 {update.status}
                              </h3>
                              <p className="text-sm lg:text-base font-black text-indigo-500 uppercase tracking-widest mb-2 italic">
                                 {update.location}
                              </p>
                              <p className="text-slate-500 font-medium max-w-lg mb-4 text-sm lg:text-base">
                                 {update.notes}
                              </p>
                              <span className="text-[10px] lg:text-xs font-black text-slate-300 uppercase tracking-[0.2em] block">
                                 {new Date(update.created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
