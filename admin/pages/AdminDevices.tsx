
import React, { useState, useEffect } from 'react';

const AdminDevices: React.FC = () => {
  const [devices, setDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/devices')
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setDevices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Devices Load Failed:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-10">
      <div className="bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl">
         <h2 className="text-2xl font-black text-white tracking-tight uppercase">Hardware Compatibility Registry</h2>
         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Cross-Platform Device Mapping</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {devices.map(device => (
          <div key={device} className="bg-[#161920] border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16z"/></svg>
             </div>
             <h4 className="text-xl font-black text-white relative z-10">{device}</h4>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 relative z-10">Active Identifier</p>
             <div className="mt-6 flex items-center gap-2 relative z-10">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Linked Assets</span>
             </div>
          </div>
        ))}
        <div className="bg-white/2 border border-white/5 border-dashed p-8 rounded-3xl flex items-center justify-center text-center hover:bg-white/5 transition-all cursor-pointer">
           <div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Register New Spec</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDevices;
