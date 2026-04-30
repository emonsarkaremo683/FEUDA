
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface Stats {
  revenue: number;
  orders: number;
  products: number;
  users: number;
  recentOrders: any[];
}

const AdminDashboard: React.FC = () => {
  const { token } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard Load Failed:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
    </div>
  );

  const statCards = [
    { label: 'Total Revenue', value: `৳${(stats?.revenue || 0).toLocaleString()}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-blue-600 to-cyan-500' },
    { label: 'Orders Processed', value: stats?.orders || 0, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'from-purple-600 to-indigo-500' },
    { label: 'Avg Order Value', value: `৳${stats?.orders ? Math.round(stats.revenue / stats.orders).toLocaleString() : 0}`, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'from-emerald-600 to-teal-500' },
    { label: 'Active Users', value: stats?.users || 0, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'from-orange-600 to-pink-500' },
  ];

  return (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-500`}></div>
            <div className="relative bg-[#161920] border border-white/5 p-8 rounded-3xl shadow-xl hover:translate-y-[-4px] transition-all duration-300">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-black/20`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} /></svg>
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-white">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-black text-xl text-white tracking-tight uppercase">Recent Orders</h3>
            <button className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest">View All Analytics</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/2">
                <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(stats?.recentOrders || []).map((order: any) => (
                  <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-8 py-5 font-mono text-xs text-purple-400 font-bold">{order.id}</td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-white leading-none">{order.full_name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{order.email}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                        order.status === 'Processing' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-white">৳{order.total}</td>
                    <td className="px-8 py-5 text-xs text-slate-400">{order.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="text-lg font-black mb-2 uppercase tracking-tight">Nexus Core v3.1</h4>
            <p className="text-white/70 text-xs mb-6 leading-relaxed font-medium">All systems operational. Advanced encryption active. Automated inventory sync in progress.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Live Status: Stable</span>
            </div>
          </div>

          <div className="bg-[#161920] border border-white/5 rounded-3xl p-8 shadow-xl">
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Quick Inventory Action</h4>
            <div className="space-y-4">
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Restock Rapid Fire
              </button>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                Generate POS Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
