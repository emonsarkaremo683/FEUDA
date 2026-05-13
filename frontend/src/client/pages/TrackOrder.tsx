
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../../config';

interface TrackingUpdate {
  id: number;
  status: string;
  location: string;
  notes: string;
  created_at: string;
}

interface CarrierInfo {
  id: number;
  name: string;
  tracking_url_template: string;
}

const TrackOrder: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingUpdate[]>([]);
  const [carrier, setCarrier] = useState<CarrierInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    setCarrier(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/tracking`);
      if (res.ok) {
        const data = await res.json();
        // Expecting { updates: [...], carrier: {...} }
        setTrackingData(data.updates || data || []); 
        if (data.carrier) setCarrier(data.carrier);
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

  const getCarrierTrackingLink = () => {
    if (!carrier?.tracking_url_template) return null;
    return carrier.tracking_url_template.replace('{id}', orderId);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 lg:py-32">
        <div className="text-center mb-16">
           <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">Track Your <span className="text-indigo-600">Assets</span></h1>
           <p className="text-slate-500 font-medium text-lg lg:text-xl">Locate your FEUDA packages across the global grid.</p>
        </div>

        <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-2xl shadow-indigo-100/20 border border-slate-100 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-10 -mt-10"></div>
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 relative z-10">
               <input 
                 type="text" 
                 placeholder="Enter Tracking ID / Order ID"
                 className="flex-1 bg-slate-50 border border-slate-100 rounded-3xl px-8 py-5 text-lg font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300"
                 value={orderId}
                 onChange={e => setOrderId(e.target.value)}
                 required
               />
               <button 
                 type="submit" 
                 className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black uppercase text-sm tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
               >
                 Ping Satellite
               </button>
            </form>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 p-20">
             <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Establishing Secure Link...</span>
          </div>
        ) : searched && (
          <div className="space-y-12 animate-fade-in">
             {trackingData.length === 0 ? (
               <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </div>
                  <p className="text-slate-900 font-black text-xl mb-2">IDENTIFIER NOT FOUND</p>
                  <p className="text-slate-500 font-medium">Verify your order ID and try again.</p>
               </div>
             ) : (
               <div className="space-y-10">
                  {carrier && (
                    <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-indigo-600/30">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Carrier Partner</p>
                          <h2 className="text-3xl font-black italic tracking-tighter uppercase">{carrier.name}</h2>
                       </div>
                       {getCarrierTrackingLink() && (
                         <a 
                           href={getCarrierTrackingLink()!} 
                           target="_blank" 
                           rel="noreferrer"
                           className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
                         >
                            Official Tracking Portal
                         </a>
                       )}
                    </div>
                  )}

                  <div className="relative pl-12 lg:pl-16">
                     {/* Timeline Line */}
                     <div className="absolute left-[39px] lg:left-[47px] top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-500 via-slate-200 to-slate-100 rounded-full"></div>
                     
                     <div className="space-y-16">
                        {trackingData.map((update, idx) => (
                           <div key={update.id} className="relative flex gap-10 items-start group">
                              {/* Node */}
                              <div className={`w-20 lg:w-24 h-20 lg:h-24 rounded-[2rem] flex items-center justify-center shrink-0 z-10 border-8 border-slate-50 shadow-2xl transition-all ${idx === 0 ? 'bg-indigo-600 text-white scale-110 shadow-indigo-500/20' : 'bg-white text-slate-300'}`}>
                                 {idx === 0 ? (
                                   <svg className="w-8 h-8 lg:w-10 lg:h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                 ) : (
                                   <div className="w-5 h-5 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors"></div>
                                 )}
                              </div>
                              
                              <div className="pt-2 lg:pt-4">
                                 <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h3 className={`text-2xl lg:text-3xl font-black tracking-tighter uppercase italic ${idx === 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                       {update.status}
                                    </h3>
                                    {idx === 0 && <span className="px-3 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase rounded-lg tracking-widest animate-bounce">Live Update</span>}
                                 </div>
                                 <p className="text-sm lg:text-base font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">
                                    {update.location}
                                 </p>
                                 <p className="text-slate-500 font-bold max-w-lg mb-6 leading-relaxed">
                                    {update.notes}
                                 </p>
                                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                       {new Date(update.created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
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
