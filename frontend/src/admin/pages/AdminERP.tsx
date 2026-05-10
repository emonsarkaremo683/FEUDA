
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';

const AdminERP: React.FC = () => {
  const { token } = useApp();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/analytics/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => setStats(data))
      .catch(err => console.error('ERP Stats Load Failed:', err));
  }, [token]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-[#161920] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
           <h2 className="text-3xl font-black text-white tracking-tight uppercase">ERP Enterprise Core</h2>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Unified Resource Planning & Fiscal Strategy</p>
        </div>
        <div className="flex gap-6 relative z-10">
           <div className="text-center bg-white/5 px-8 py-4 rounded-3xl border border-white/5">
              <p className="text-white font-black text-xl tracking-tighter">৳{(stats?.revenue || 0).toLocaleString()}</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gross Asset Value</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#161920] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
               <h3 className="text-white font-black uppercase tracking-widest text-sm mb-10 pb-6 border-b border-white/5">System Operational Status</h3>
               <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Latency</span>
                        <span className="text-emerald-400 font-mono text-xs">14ms</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[15%]"></div>
                     </div>
                     
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memory Pressure</span>
                        <span className="text-amber-400 font-mono text-xs">42%</span>
                     </div>
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[42%]"></div>
                     </div>
                  </div>

                  <div className="bg-white/2 rounded-3xl p-8 border border-white/5 flex flex-col justify-center text-center">
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Nexus Core Uptime</p>
                     <p className="text-3xl font-black text-white tabular-nums tracking-tighter">99.98%</p>
                     <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Protocol Nominal</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-[#161920] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6">Strategic Expansion Protocol</h3>
               <p className="text-slate-400 text-sm leading-relaxed mb-8">Initiate multi-vendor fulfillment logic to expand the ecosystem beyond local warehouse constraints. (Requires Obsidian V4 Upgrade)</p>
               <button className="bg-white/5 text-slate-500 cursor-not-allowed px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5">Coming in Q4 2026</button>
            </div>
         </div>

         <div className="bg-gradient-to-b from-[#161920] to-[#0f1115] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">Fiscal Audit Trail</h3>
            <div className="space-y-8">
               {[1,2,3,4].map(i => (
                 <div key={i} className="flex items-center gap-6 border-b border-white/5 pb-6 last:border-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                       <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                       <p className="text-sm font-bold text-white uppercase tracking-tight">Ledger {1024 + i} Sync</p>
                       <p className="text-[10px] text-slate-500 font-bold mt-1">Today, 08:3{i} AM</p>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-10 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5">Download Fiscal Report</button>
         </div>
      </div>
    </div>
  );
};

export default AdminERP;
