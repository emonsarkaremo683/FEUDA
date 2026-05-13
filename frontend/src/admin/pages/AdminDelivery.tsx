
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';
import AdminModal from '../components/AdminModal';
import AdminConfirmDialog from '../components/AdminConfirmDialog';

interface DeliveryMethod {
  id: number;
  name: string;
  is_active: boolean;
  base_cost: number;
  estimated_days: string;
  tracking_url_template: string;
}

const AdminDelivery: React.FC = () => {
  const { token, showToast } = useApp();
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const initialForm = { 
    name: '', 
    is_active: true, 
    base_cost: 0, 
    estimated_days: '2-3 Business Days',
    tracking_url_template: '' 
  };
  const [form, setForm] = useState(initialForm);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null; name: string }>({
    isOpen: false, id: null, name: ''
  });

  const fetchMethods = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/delivery-methods`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setMethods(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Delivery Load Failed:', err);
        setLoading(false);
        // Fallback for UI demo if API doesn't exist yet
        setMethods([
          { id: 1, name: 'RedX Delivery', is_active: true, base_cost: 60, estimated_days: '2-4 Days', tracking_url_template: 'https://redx.com.bd/track/{id}' },
          { id: 2, name: 'Sundarban Courier', is_active: true, base_cost: 100, estimated_days: '1-3 Days', tracking_url_template: 'https://sundarbancourier.com.bd/track/{id}' },
          { id: 3, name: 'Pathao Courier', is_active: false, base_cost: 70, estimated_days: '2-3 Days', tracking_url_template: 'https://pathao.com/track/{id}' }
        ]);
      });
  };

  useEffect(() => {
    fetchMethods();
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `${API_BASE_URL}/api/delivery-methods/${currentId}` : `${API_BASE_URL}/api/delivery-methods`;
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    }).then(res => {
      if (res.ok) {
        showToast(isEditing ? 'Delivery matrix updated' : 'New carrier initialized');
        fetchMethods();
        setShowModal(false);
        setForm(initialForm);
        setIsEditing(false);
      }
    });
  };

  const handleEdit = (m: DeliveryMethod) => {
    setForm({ 
      name: m.name, 
      is_active: !!m.is_active, 
      base_cost: m.base_cost, 
      estimated_days: m.estimated_days,
      tracking_url_template: m.tracking_url_template || ''
    });
    setCurrentId(m.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    fetch(`${API_BASE_URL}/api/delivery-methods/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (res.ok) {
        showToast('Carrier purged from registry');
        fetchMethods();
      }
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Logistics Engine</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Delivery & Courier Configuration</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setForm(initialForm); setShowModal(true); }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          Initialize Carrier
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map(m => (
          <div key={m.id} className="bg-[#161920] border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-all group flex flex-col">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                   <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(m)} className="p-2 bg-white/5 hover:bg-blue-500 rounded-xl text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => setConfirmDelete({ isOpen: true, id: m.id, name: m.name })} className="p-2 bg-white/5 hover:bg-red-500 rounded-xl text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
             </div>
             <h4 className="text-lg font-black text-white uppercase tracking-tight">{m.name}</h4>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 mb-6">Base Cost: ৳{m.base_cost}</p>
             
             <div className="space-y-4 mb-6">
                <div className="bg-white/2 rounded-xl p-4 border border-white/5">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Estimated Timeline</p>
                   <p className="text-white text-xs font-bold">{m.estimated_days}</p>
                </div>
                {m.tracking_url_template && (
                  <div className="bg-white/2 rounded-xl p-4 border border-white/5">
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Tracking Format</p>
                     <p className="text-blue-400 text-[10px] font-mono truncate">{m.tracking_url_template}</p>
                  </div>
                )}
             </div>

             <div className="mt-auto">
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${m.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                   {m.is_active ? 'Operational' : 'Suspended'}
                </span>
             </div>
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Configure Logistics' : 'Initialize Carrier'}
        subtitle="Manage Delivery Network Infrastructure"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Carrier Name</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold" placeholder="e.g. RedX Courier" required />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Base Fee (৳)</label>
              <input type="number" value={form.base_cost} onChange={e => setForm({...form, base_cost: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Timeline</label>
              <input type="text" value={form.estimated_days} onChange={e => setForm({...form, estimated_days: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all font-bold" placeholder="e.g. 2-3 Days" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Tracking URL Template</label>
            <input type="text" value={form.tracking_url_template} onChange={e => setForm({...form, tracking_url_template: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all font-mono text-xs" placeholder="https://carrier.com/track/{id}" />
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter ml-2">Use {'{id}'} as a placeholder for the tracking number</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Network Status</label>
            <div className="flex gap-4">
              <button type="button" onClick={() => setForm({...form, is_active: true})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${form.is_active ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>Operational</button>
              <button type="button" onClick={() => setForm({...form, is_active: false})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!form.is_active ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-500'}`}>Suspended</button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl">Abort</button>
            <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">{isEditing ? 'Commit Changes' : 'Initialize'}</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
        title="Purge Logistics Identity"
        message={`Are you sure you want to permanently remove "${confirmDelete.name}" from the delivery matrix? This will disable this carrier for all future orders.`}
        confirmText="Confirm Purge"
      />
    </div>
  );
};

export default AdminDelivery;
