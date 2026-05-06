
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

  const totalRevenueValue = data?.revenue || 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tight">Nexus Analytics</h2>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Deep Intelligence Feed</p>
        </div>
        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
           Last Sync: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `৳${totalRevenueValue.toLocaleString()}`, color: 'from-emerald-500 to-teal-600' },
          { label: 'Total Orders', value: data?.orders || 0, color: 'from-purple-500 to-indigo-600' },
          { label: 'Active Catalog', value: data?.products || 0, color: 'from-amber-500 to-orange-600' },
          { label: 'Registered Users', value: data?.users || 0, color: 'from-blue-500 to-cyan-600' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#161920] border border-white/5 p-8 rounded-3xl shadow-xl group hover:border-white/10 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{kpi.label}</p>
            <p className={`text-3xl font-black bg-gradient-to-br ${kpi.color} bg-clip-text text-transparent`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         {/* Rev by Source */}
         <div className="bg-[#161920] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">Acquisition Matrix</h3>
            <div className="space-y-6">
               {(data?.segments?.bySource || []).map((s: any) => (
                 <div key={s.source} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">{s.source}</span>
                       <span className="text-white">৳{(s.value || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-1000 shadow-lg shadow-purple-500/20" 
                         style={{ width: `${((s.value || 0) / (totalRevenueValue || 1)) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))}
               {(!data?.segments?.bySource || data.segments.bySource.length === 0) && (
                 <p className="text-center text-slate-600 text-xs font-bold uppercase py-10">No Source Data</p>
               )}
            </div>
         </div>

         {/* Products by Category */}
         <div className="bg-[#161920] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">Category Taxonomy</h3>
            <div className="grid grid-cols-2 gap-4">
               {(data?.segments?.byCategory || []).map((c: any) => (
                 <div key={c.category} className="bg-white/2 border border-white/5 p-6 rounded-2xl hover:border-purple-500/30 transition-all group text-center">
                    <p className="text-3xl font-black text-white mb-1 group-hover:text-purple-400 transition-colors">{c.count}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">{c.category}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Recent Orders Log */}
      <div className="bg-[#161920] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden">
         <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">Recent Transaction Stream</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                     <th className="pb-4">Order ID</th>
                     <th className="pb-4">Customer</th>
                     <th className="pb-4">Amount</th>
                     <th className="pb-4">Status</th>
                     <th className="pb-4 text-right">Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {(data?.recentOrders || []).map((order: any) => (
                    <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="py-4 font-mono text-[10px] text-purple-400 font-bold">{order.id}</td>
                       <td className="py-4 text-xs font-bold text-white">{order.full_name}</td>
                       <td className="py-4 text-xs font-black text-white">৳{parseFloat(order.total).toLocaleString()}</td>
                       <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                             order.status === 'Processing' ? 'bg-amber-500/10 text-amber-500' :
                             order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500' :
                             order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                             'bg-emerald-500/10 text-emerald-500'
                          }`}>
                             {order.status}
                          </span>
                       </td>
                       <td className="py-4 text-[10px] font-bold text-slate-500 text-right">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
