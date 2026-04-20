
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const AdminAnalytics: React.FC = () => {
  const { token } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics Load Failed:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div className="p-20 text-center animate-pulse text-purple-500 font-black">Decrypting Analytics Matrix...</div>;

  const totalRevenue = data?.revenue || 1; // Avoid division by zero

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tight">Nexus Analytics</h2>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Deep Intelligence Feed</p>
        </div>
        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
           Last Sync: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         {/* Rev by Source */}
         <div className="bg-[#161920] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">Revenue by Acquisition Source</h3>
            <div className="space-y-6">
               {(data?.segments?.bySource || []).map((s: any) => (
                 <div key={s.source} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-slate-400">{s.source}</span>
                       <span className="text-white">৳{(s.value || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-1000 shadow-lg shadow-purple-500/20" 
                         style={{ width: `${((s.value || 0) / totalRevenue) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Products by Category */}
         <div className="bg-[#161920] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">Product Distribution Taxonomy</h3>
            <div className="grid grid-cols-2 gap-4">
               {(data?.segments?.byCategory || []).map((c: any) => (
                 <div key={c.category} className="bg-white/2 border border-white/5 p-6 rounded-2xl hover:border-purple-500/30 transition-all group text-center">
                    <p className="text-3xl font-black text-white mb-1 group-hover:text-purple-400 transition-colors">{c.count}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{c.category}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Conversion / Growth Placeholder */}
      <div className="bg-[#161920] border border-white/5 rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 to-transparent"></div>
         <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Predictive Growth Matrix</h3>
         <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed mb-8 font-medium">Nexus Core is currently aggregating historical transaction data to initialize the trend prediction engine. Complete data maturity expected in 48 hours.</p>
         <div className="inline-flex items-center gap-3 bg-purple-500/10 text-purple-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
            Processing Historical Blobs
         </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
