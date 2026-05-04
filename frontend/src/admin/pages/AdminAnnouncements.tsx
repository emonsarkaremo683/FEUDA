import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const AdminAnnouncements: React.FC = () => {
  const { token, refreshAnnouncements } = useApp();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    message: '',
    url: '',
    position: 0,
    is_active: true
  });

  const fetchAnnouncements = () => {
    fetch('/api/announcements/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setAnnouncements(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save announcement');
        fetchAnnouncements();
        refreshAnnouncements();
        resetForm();
      })
      .catch(err => alert(err.message));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => {
        fetchAnnouncements();
        refreshAnnouncements();
      });
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm({ message: '', url: '', position: 0, is_active: true });
  };

  const editAnnouncement = (a: any) => {
    setForm({ message: a.message, url: a.url || '', position: a.position, is_active: Boolean(a.is_active) });
    setEditingId(a.id);
    setIsCreating(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Announcement Bar</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Manage Top Notice Bar</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg shadow-purple-900/20"
          >
            + Add Notice
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-[#161920] border border-white/5 rounded-3xl p-8 shadow-2xl animate-fade-in">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">
            {editingId ? 'Edit Notice' : 'New Notice'}
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Message</label>
              <input 
                type="text" 
                value={form.message} 
                onChange={e => setForm({...form, message: e.target.value})}
                className="w-full bg-[#0f1115] border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-purple-500 transition-all"
                placeholder="e.g. 20% OFF YOUR FIRST ORDER"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Link URL (Optional)</label>
                <input 
                  type="text" 
                  value={form.url} 
                  onChange={e => setForm({...form, url: e.target.value})}
                  className="w-full bg-[#0f1115] border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-purple-500 transition-all"
                  placeholder="e.g. /category/sale"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Display Order</label>
                <input 
                  type="number" 
                  value={form.position} 
                  onChange={e => setForm({...form, position: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#0f1115] border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-2">
              <input 
                type="checkbox" 
                id="isActive"
                checked={form.is_active}
                onChange={e => setForm({...form, is_active: e.target.checked})}
                className="w-4 h-4 accent-purple-500"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-slate-300 cursor-pointer">Active</label>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">
                {editingId ? 'Update Notice' : 'Create Notice'}
              </button>
              <button type="button" onClick={resetForm} className="px-8 bg-white/5 text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="p-4 pl-8">Order</th>
                <th className="p-4">Message</th>
                <th className="p-4">Link URL</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {announcements.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 pl-8 font-mono text-purple-400">{a.position}</td>
                  <td className="p-4 text-white font-bold">{a.message}</td>
                  <td className="p-4 text-slate-400 font-mono text-xs">{a.url || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${a.is_active ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {a.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 pr-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editAnnouncement(a)} className="text-blue-400 hover:text-blue-300 font-bold uppercase text-[10px] tracking-wider">Edit</button>
                      <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-300 font-bold uppercase text-[10px] tracking-wider">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm font-bold">No announcements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
