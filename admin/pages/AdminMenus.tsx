
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';

interface MenuItem {
  id: number;
  label: string;
  url: string;
  location: string;
  position: number;
  parent_id: number | null;
  layout_style: string;
}

const AdminMenus: React.FC = () => {
  const { token, refreshMenus } = useApp();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const initialForm = { 
    label: '', 
    url: '', 
    location: 'header', 
    position: 0, 
    parent_id: null as number | null,
    layout_style: 'Default' 
  };
  const [form, setForm] = useState(initialForm);

  const fetchMenus = () => {
    fetch('/api/menus')
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(err => console.error('Menus Load Failed:', err));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `/api/menus/${currentId}` : '/api/menus';
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    }).then(() => {
      fetchMenus();
      refreshMenus();
      setShowModal(false);
      setForm(initialForm);
      setIsEditing(false);
    });
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      label: item.label,
      url: item.url,
      location: item.location,
      position: item.position,
      parent_id: item.parent_id,
      layout_style: item.layout_style || 'Default'
    });
    setCurrentId(item.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Purge this navigation node and its children?')) return;
    fetch(`/api/menus/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => {
        fetchMenus();
        refreshMenus();
    });
  };

  const buildTree = (location: string) => {
    const locItems = items.filter(i => i.location === location);
    const parents = locItems.filter(i => !i.parent_id).sort((a,b) => a.position - b.position);
    
    return parents.map(parent => {
        const children = locItems.filter(i => i.parent_id === parent.id).sort((a,b) => a.position - b.position);
        return { ...parent, children };
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Navigation Matrix</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Hierarchical Sub-Menu Engine</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setForm(initialForm); setShowModal(true); }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition-all text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          New Node
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
         {['header', 'footer'].map(loc => {
           const tree = buildTree(loc);
           return (
             <div key={loc} className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-fit">
                <div className="p-8 border-b border-white/5 bg-white/2">
                   <h3 className="text-lg font-black text-white uppercase tracking-tight">{loc.toUpperCase()} NAV TREE</h3>
                </div>
                <div className="p-6 space-y-4">
                   {tree.map(parent => (
                     <div key={parent.id} className="space-y-2">
                        {/* Parent Item */}
                        <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-[10px]">{parent.position}</div>
                              <div>
                                 <p className="text-sm font-bold text-white leading-none">{parent.label}</p>
                                 <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest">{parent.url} • <span className="text-purple-400">{parent.layout_style} Style</span></p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <button onClick={() => handleEdit(parent)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/5 text-slate-400 rounded-lg transition-all">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              </button>
                              <button onClick={() => handleDelete(parent.id)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-lg transition-all">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                           </div>
                        </div>

                        {/* Children Items */}
                        <div className="pl-12 space-y-2 border-l border-white/5 ml-4">
                           {parent.children.map(child => (
                             <div key={child.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-[8px]">{child.position}</div>
                                   <div>
                                      <p className="text-xs font-bold text-slate-300 leading-none">{child.label}</p>
                                      <p className="text-[8px] text-slate-600 mt-1 uppercase tracking-widest">{child.url}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <button onClick={() => handleEdit(child)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/5 text-slate-500 rounded-md transition-all">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                   </button>
                                   <button onClick={() => handleDelete(child.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-md transition-all">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                   </button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                   {tree.length === 0 && (
                     <div className="py-20 text-center opacity-20">
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No Nodes Synchronized</p>
                     </div>
                   )}
                </div>
             </div>
           );
         })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f1115]/90 backdrop-blur-md">
          <div className="bg-[#161920] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-10 border-b border-white/5 text-center">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{isEditing ? 'Update' : 'Initialize'} Nav Node</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Label</label>
                    <input 
                      type="text" 
                      value={form.label} 
                      onChange={e => {
                        const label = e.target.value;
                        const slug = label.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                        setForm({...form, label, url: `/${slug}`});
                      }} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold" 
                      required 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">URL / Path</label>
                    <input type="text" value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold" required />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Placement</label>
                  <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none">
                    <option value="header">Header Nav</option>
                    <option value="footer">Footer Nav</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Parent Node (Sub-menu)</label>
                  <select 
                    value={form.parent_id || ''} 
                    onChange={e => setForm({...form, parent_id: e.target.value ? Number(e.target.value) : null})} 
                    className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none"
                  >
                    <option value="">None (Top Level)</option>
                    {items.filter(i => !i.parent_id && i.id !== currentId && i.location === form.location).map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Style</label>
                    <select value={form.layout_style} onChange={e => setForm({...form, layout_style: e.target.value})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none">
                       <option value="Default">Standard List</option>
                       <option value="Mega">Mega Menu</option>
                       <option value="Grid">Grid Layout</option>
                       <option value="Dropdown">Simple Dropdown</option>
                       <option value="Featured">Featured with Icon</option>
                       <option value="Reference">Reference (PNG Style)</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Priority Index</label>
                    <input type="number" value={form.position} onChange={e => setForm({...form, position: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold" />
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-purple-500/20">{isEditing ? 'Commit Changes' : 'Initialize Node'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenus;
