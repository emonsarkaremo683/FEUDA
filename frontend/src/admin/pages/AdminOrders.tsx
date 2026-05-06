
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
  const { token, showToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');

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
        showToast('Failed to load orders pipeline');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const updateStatus = (orderId: string, status: string) => {
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (res.ok) {
          showToast(`Order ${orderId} updated to ${status}`);
          fetchOrders();
        } else {
          showToast('Failed to update status');
        }
      })
      .catch(() => showToast('Network failure during sync'));
  };

  const fetchOrderDetails = (orderId: string) => {
    fetch(`/api/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSelectedOrder(data))
      .catch(() => showToast('Failed to fetch node details'));
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());
  }, [orders, activeTab]);

  return (
    <div className="space-y-8">
      <div className="bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Order Logistics</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Global Fulfillment Pipeline</p>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1 overflow-x-auto max-w-full">
          {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${
              order.status === 'Processing' ? 'from-amber-600/10' :
              order.status === 'Shipped' ? 'from-blue-600/10' :
              order.status === 'Cancelled' ? 'from-red-600/10' :
              'from-emerald-600/10'
            } to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
            
            <div className="relative bg-[#161920] border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:translate-x-1 transition-all">
              <div className="flex gap-8 items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                  order.status === 'Processing' ? 'bg-amber-500/10 text-amber-500' :
                  order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-500' :
                  order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
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
                      order.status === 'Cancelled' ? 'text-red-500' :
                      'text-emerald-500'
                    }`}
                  >
                    <option value="Processing" className="bg-[#161920]">Processing</option>
                    <option value="Shipped" className="bg-[#161920]">Shipped</option>
                    <option value="Delivered" className="bg-[#161920]">Delivered</option>
                    <option value="Cancelled" className="bg-[#161920]">Cancelled</option>
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
                  <button 
                    onClick={() => fetchOrderDetails(order.id)}
                    className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && !loading && (
          <div className="bg-[#161920] border border-dashed border-white/10 rounded-3xl p-20 text-center">
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No Transmission Data Found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f1115]/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#161920] border border-white/10 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in my-auto">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Order Manifest</h3>
                <p className="text-purple-500 font-mono font-bold text-xs mt-1 tracking-tighter">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 grid md:grid-cols-2 gap-12 max-h-[70vh] overflow-y-auto">
              {/* Left Col: Customer & Shipping */}
              <div className="space-y-8">
                <section>
                  <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Customer Intelligence</h5>
                  <div className="bg-white/5 p-6 rounded-2xl space-y-3">
                    <p className="text-sm font-bold text-white flex justify-between"><span>Name:</span> <span className="text-slate-400">{selectedOrder.full_name}</span></p>
                    <p className="text-sm font-bold text-white flex justify-between"><span>Email:</span> <span className="text-slate-400">{selectedOrder.email}</span></p>
                    <p className="text-sm font-bold text-white flex justify-between"><span>Phone:</span> <span className="text-slate-400">{selectedOrder.phone}</span></p>
                  </div>
                </section>

                <section>
                  <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Destination Protocol</h5>
                  <div className="bg-white/5 p-6 rounded-2xl">
                    <p className="text-sm font-bold text-slate-400 leading-relaxed italic">
                      {selectedOrder.address}<br />
                      {selectedOrder.area}, {selectedOrder.city}<br />
                      Postal Code: {selectedOrder.postal_code}
                    </p>
                  </div>
                </section>

                <section>
                  <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Payment Matrix</h5>
                  <div className="bg-purple-600/10 border border-purple-500/20 p-6 rounded-2xl">
                    <p className="text-sm font-black text-purple-400 uppercase tracking-widest">{selectedOrder.payment_method}</p>
                    <p className="text-[10px] text-purple-500/60 font-bold uppercase mt-1">Transaction Source: {selectedOrder.source}</p>
                  </div>
                </section>
              </div>

              {/* Right Col: Items & Summary */}
              <div className="space-y-8">
                <section>
                  <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Payload Units</h5>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white/2 border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-black text-xs text-slate-500">{item.quantity}x</div>
                           <div>
                              <p className="text-sm font-bold text-white">{item.product_name}</p>
                              {item.selected_color && <p className="text-[10px] text-purple-500 font-bold uppercase tracking-tighter mt-1">{item.selected_color}</p>}
                           </div>
                        </div>
                        <p className="text-sm font-black text-white">৳{item.price}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white/5 p-8 rounded-3xl space-y-4">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Subtotal</span>
                    <span>৳{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Logistics Fee</span>
                    <span>৳{selectedOrder.shipping_fee}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Tax Surcharge</span>
                    <span>৳{selectedOrder.tax}</span>
                  </div>
                  <div className="h-px bg-white/10 my-4"></div>
                  <div className="flex justify-between text-lg font-black text-white uppercase tracking-tight">
                    <span>Total Cost</span>
                    <span className="text-purple-500">৳{selectedOrder.total}</span>
                  </div>
                </section>
              </div>
            </div>
            
            <div className="p-10 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
