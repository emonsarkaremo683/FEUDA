
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  account_number: string;
  is_active: boolean;
  instructions: string;
}

const AdminPayments: React.FC = () => {
  const { token } = useApp();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const initialMethod = { name: '', type: 'Mobile Bank', account_number: '', instructions: '', is_active: true };
  const [form, setForm] = useState(initialMethod);

  const fetchPayments = () => {
    fetch(`${API_BASE_URL}/api/payments`)
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => setMethods(Array.isArray(data) ? data : []))
      .catch(err => console.error('Payments Load Failed:', err));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleEdit = (m: PaymentMethod) => {
    setForm({
      name: m.name,
      type: m.type,
      account_number: m.account_number,
      instructions: m.instructions,
      is_active: !!m.is_active
    });
    setCurrentId(m.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `${API_BASE_URL}/api/payments/${currentId}` : `${API_BASE_URL}/api/payments`;
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    }).then(() => {
      fetchPayments();
      setShowModal(false);
      setForm(initialMethod);
      setIsEditing(false);
      setCurrentId(null);
    });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this payment gateway?')) return;
    fetch(`${API_BASE_URL}/api/payments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => fetchPayments());
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-black text-white tracking-tight uppercase">Merchant Ledger</h2>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Payment Gateway Configuration</p>
        </div>
        <button onClick={() => { setIsEditing(false); setForm(initialMethod); setShowModal(true); }} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Enable Method</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map(m => (
          <div key={m.id} className="bg-[#161920] border border-white/5 rounded-3xl p-8 hover:border-orange-500/30 transition-all group flex flex-col">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                   <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(m)} className="p-2 bg-white/5 hover:bg-orange-500 rounded-xl text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 bg-white/5 hover:bg-red-500 rounded-xl text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
             </div>
             <h4 className="text-lg font-black text-white uppercase tracking-tight">{m.name}</h4>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 mb-4">{m.type}</p>
             <div className="bg-white/2 rounded-xl p-4 border border-white/5 mb-4">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Account Num</p>
                <p className="text-white font-mono font-bold">{m.account_number}</p>
             </div>
             <div className="mt-auto">
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${m.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                   {m.is_active ? 'Active Gateway' : 'Gateway Offline'}
                </span>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f1115]/90 backdrop-blur-md">
           <div className="bg-[#161920] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-10 border-b border-white/5 text-center">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">{isEditing ? 'Configure' : 'Register'} Merchant Method</h3>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Provider Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500 transition-all font-bold" placeholder="e.g. bKash Merchant" required />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Type</label>
                       <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none font-bold">
                          <option>Mobile Bank</option>
                          <option>Bank Transfer</option>
                          <option>Credit Card</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Account #</label>
                       <input type="text" value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500 transition-all font-bold" required />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Visibility Status</label>
                    <div className="flex gap-4">
                       <button type="button" onClick={() => setForm({...form, is_active: true})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${form.is_active ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>Online</button>
                       <button type="button" onClick={() => setForm({...form, is_active: false})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!form.is_active ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-500'}`}>Offline</button>
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl">Abort</button>
                    <button type="submit" className="flex-1 py-4 bg-orange-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-orange-500/20">{isEditing ? 'Commit' : 'Initialize'}</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
AdminPayments;
