
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';

interface InventoryLog {
  id: number;
  product_id: number;
  product_name: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  created_at: string;
}

const AdminInventory: React.FC = () => {
  const { token, products, refreshProducts } = useApp();
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [adjustment, setAdjustment] = useState({ productId: '', type: 'IN', quantity: 0, reason: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustment.productId || adjustment.quantity <= 0) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/logs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adjustment)
      });

      if (res.ok) {
        setAdjustment({ productId: '', type: 'IN', quantity: 0, reason: '' });
        setShowModal(false);
        fetchLogs();
        refreshProducts(); // Update the products list in context to reflect new stock
      }
    } catch (err) {
      console.error('Adjustment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Inventory Control</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time Asset Stock Monitoring</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 transition-all text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Adjust Stock
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stock List */}
        <div className="lg:col-span-2 bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/2">
             <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black bg-white/1">
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Current Stock</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                            <img src={product.image} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white leading-none">{product.name}</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">SKU: {product.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-white">{product.stock} Units</span>
                    </td>
                    <td className="px-8 py-5">
                       {product.stock && product.stock > 10 ? (
                         <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full">Optimal</span>
                       ) : product.stock && product.stock > 0 ? (
                         <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full">Low Stock</span>
                       ) : (
                         <span className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full">Critical</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-fit">
           <div className="p-8 border-b border-white/5 bg-white/2">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Audit Trail</h3>
           </div>
           <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {logs.map(log => (
                <div key={log.id} className="p-6 hover:bg-white/2 transition-all group">
                   <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${log.type === 'IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                         Stock {log.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">{new Date(log.created_at).toLocaleDateString()}</span>
                   </div>
                   <p className="text-xs font-bold text-white mb-1">{log.product_name}</p>
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{log.quantity} Units — {log.reason}</p>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p-20 text-center opacity-30">
                   <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No logs recorded</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f1115]/90 backdrop-blur-md">
          <div className="bg-[#161920] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-10 border-b border-white/5 text-center">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Modify Asset Inventory</h3>
            </div>
            <form onSubmit={handleAdjust} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Select Asset</label>
                <select 
                  value={adjustment.productId} 
                  onChange={e => setAdjustment({...adjustment, productId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all font-bold text-sm appearance-none"
                  required
                >
                  <option value="">Choose Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Movement Type</label>
                    <select 
                      value={adjustment.type} 
                      onChange={e => setAdjustment({...adjustment, type: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all font-bold text-sm appearance-none"
                    >
                      <option value="IN">Inward (Add)</option>
                      <option value="OUT">Outward (Remove)</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Quantity</label>
                    <input 
                      type="number" 
                      value={adjustment.quantity} 
                      onChange={e => setAdjustment({...adjustment, quantity: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all font-bold text-sm"
                      required
                      min="1"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Reason / Memo</label>
                <input 
                  type="text" 
                  value={adjustment.reason} 
                  onChange={e => setAdjustment({...adjustment, reason: e.target.value})}
                  placeholder="Restock, Damaged, Correction..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all font-bold text-sm"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl">Abort</button>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
