
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';
import AdminModal from '../components/AdminModal';
import AdminConfirmDialog from '../components/AdminConfirmDialog';

const AdminDevices: React.FC = () => {
  const { token } = useApp();
  const [devices, setDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Custom Confirm State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; deviceName: string }>({ 
    isOpen: false, 
    deviceName: '' 
  });

  const fetchDevices = () => {
    fetch(`${API_BASE_URL}/api/devices`)
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setDevices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Devices Load Failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    fetch(`${API_BASE_URL}/api/devices`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName })
    }).then(() => {
      fetchDevices();
      setShowModal(false);
      setNewName('');
    });
  };

  const handleDelete = (name: string) => {
    fetch(`${API_BASE_URL}/api/devices/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => fetchDevices());
  };

  return (
    <div className="space-y-10">
      <div className="bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Hardware Compatibility Registry</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Cross-Platform Device Mapping</p>
         </div>
         <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Register Spec</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {devices.map(device => (
          <div key={device} className="bg-[#161920] border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16z"/></svg>
             </div>
             <div className="flex justify-between items-start mb-6 relative z-10">
                <h4 className="text-xl font-black text-white">{device}</h4>
                <button 
                  onClick={() => setConfirmDelete({ isOpen: true, deviceName: device })} 
                  className="p-2 hover:bg-red-500/20 text-slate-600 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-auto relative z-10">Active Identifier</p>
             <div className="mt-4 flex items-center gap-2 relative z-10">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Nominal</span>
             </div>
          </div>
        ))}
      </div>

      {/* Register Modal */}
      <AdminModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Register Hardware Unit"
        subtitle="Initialize New Compatibility Profile"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Device Name / Model</label>
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-indigo-500 transition-all font-bold" 
              placeholder="e.g. iPhone 16 Pro Max" 
              required 
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl">Abort</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Initialize</button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={() => handleDelete(confirmDelete.deviceName)}
        title="Purge Hardware Spec"
        message={`Are you sure you want to permanently remove the "${confirmDelete.deviceName}" specification from the registry?`}
        confirmText="Confirm Purge"
      />
    </div>
  );
};

export default AdminDevices;
