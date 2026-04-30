
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface Order {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
}

const AdminOrders: React.FC = () => {
  const { token } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = () => {
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Orders Load Failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const updateStatus = (orderId: string, status: string) => {
    fetch(`/api/orders/${orderId}/tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, location: 'Warehouse', notes: 'Status updated via admin panel' })
    })
      .then(() => fetchOrders());
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Order Logistics</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Global Fulfillment Pipeline</p>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1">
          {['all', 'processing', 'shipped', 'delivered'].map(tab => (
            <button key={tab} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all hover:bg-white/5">
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div key={order.id} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${
              order.status === 'Processing' ? 'from-amber-600/10' :
              order.status === 'Shipped' ? 'from-blue-600/10' :
              'from-emerald-600/10'
            } to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
            
            <div className="relative bg-[#161920] border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:translate-x-1 transition-all">
              <div className="flex gap-8 items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                  order.status === 'Processing' ? 'bg-amber-500/10 text-amber-500' :
                  order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {order.full_name?.[0] || '?'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{order.full_name || 'Anonymous'}</h4>
                  <p className="text-xs text-slate-500 font-mono font-bold mt-1 text-purple-400 uppercase tracking-tighter">{order.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 flex-grow">
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={`bg-transparent font-black text-xs uppercase tracking-tighter outline-none cursor-pointer ${
                      order.status === 'Processing' ? 'text-amber-500' :
                      order.status === 'Shipped' ? 'text-blue-500' :
                      'text-emerald-500'
                    }`}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-white font-black">৳{order.total}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-slate-400 text-xs font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <button className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all">Details</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
