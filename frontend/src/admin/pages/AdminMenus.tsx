
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface MenuItem {
  id: number;
  label: string;
  url: string;
  location: string;
  position: number;
  parent_id: number | null;
  layout_style: string;
  is_active: boolean;
}

const AdminMenus: React.FC = () => {
  const { token, refreshMenus, cmsPages, showToast } = useApp();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [socials, setSocials] = useState<any[]>([]);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialForm, setSocialForm] = useState({ platform: '', url: '', icon: '', position: 0, is_active: true });
  const [editingSocial, setEditingSocial] = useState<number | null>(null);
  
  const initialForm = { 
    label: '', 
    url: '', 
    location: 'header', 
    position: 0, 
    parent_id: null as number | null,
    layout_style: 'Default',
    is_active: true
  };
  const [form, setForm] = useState(initialForm);

  const fetchMenus = () => {
    fetch('/api/menus')
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Menus Load Failed:', err);
        showToast('Failed to synchronize navigation matrix');
      });
  };

  const fetchSocials = () => {
    fetch('/api/social-links/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSocials(data))
      .catch(err => {
        console.error('Socials Load Failed:', err);
        showToast('Social link synchronization failure');
      });
  };

  useEffect(() => {
    fetchMenus();
    fetchSocials();
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `/api/menus/${currentId}` : '/api/menus';
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    })
    .then(async res => {
      if (res.ok) {
        showToast(isEditing ? 'Navigation node updated' : 'New node initialized');
        fetchMenus();
        refreshMenus();
        setShowModal(false);
        setForm(initialForm);
        setIsEditing(false);
      } else {
        const err = await res.json();
        showToast(err.error || 'Mutation failed');
      }
    })
    .catch(() => showToast('Network sync failure'));
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      label: item.label,
      url: item.url || '',
      location: item.location,
      position: item.position,
      parent_id: item.parent_id,
      layout_style: item.layout_style || 'Default',
      is_active: item.is_active
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
    }).then(res => {
        if (res.ok) {
          showToast('Node purged from matrix');
          fetchMenus();
          refreshMenus();
        } else {
          showToast('Purge operation failed');
        }
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

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingSocial ? `/api/social-links/${editingSocial}` : '/api/social-links';
    const method = editingSocial ? 'PUT' : 'POST';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(socialForm)
    }).then(async res => {
      if (res.ok) {
        showToast('Social link synchronized');
        fetchSocials();
        setShowSocialModal(false);
        setSocialForm({ platform: '', url: '', icon: '', position: 0, is_active: true });
        setEditingSocial(null);
      } else {
        const err = await res.json();
        showToast(err.error || 'Social sync failed');
      }
    });
  };

  const handleSocialDelete = (id: number) => {
    if (!window.confirm('Delete this social link?')) return;
    fetch(`/api/social-links/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (res.ok) {
        showToast('Social link purged');
        fetchSocials();
      } else {
        showToast('Delete operation failed');
      }
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
                                 <p className={`text-sm font-bold leading-none ${parent.is_active ? 'text-white' : 'text-white/20'}`}>{parent.label} {!parent.is_active && '(Disabled)'}</p>
                                 <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest">{parent.url} • <span className="text-purple-400">{parent.layout_style} Style</span></p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              {parent.url?.startsWith('/cms/') && (
                                <Link 
                                  to="/admin/cms" 
                                  className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                  Edit Content
                                </Link>
                              )}
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
                                      <p className={`text-xs font-bold leading-none ${child.is_active ? 'text-slate-300' : 'text-slate-300/20'}`}>{child.label} {!child.is_active && '(Disabled)'}</p>
                                      <p className="text-[8px] text-slate-600 mt-1 uppercase tracking-widest">{child.url}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   {child.url?.startsWith('/cms/') && (
                                     <Link 
                                       to="/admin/cms" 
                                       className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                     >
                                       Edit Content
                                     </Link>
                                   )}
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

      {/* Social Links Section */}
      <div className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl mt-10">
        <div className="p-8 border-b border-white/5 bg-white/2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Social Media Connectors</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-Platform Link Matrix</p>
          </div>
          <button 
            onClick={() => { setEditingSocial(null); setSocialForm({ platform: '', url: '', icon: '', position: 0 }); setShowSocialModal(true); }}
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase transition-all shadow-lg shadow-purple-900/20"
          >
            + Add Social
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {socials.map(social => (
            <div key={social.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                  {social.platform.toLowerCase() === 'facebook' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.14h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>}
                  {social.platform.toLowerCase() === 'instagram' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>}
                  {social.platform.toLowerCase() === 'twitter' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>}
                  {social.platform.toLowerCase() === 'youtube' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>}
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">{social.platform}</p>
                  <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest truncate max-w-[100px]">{social.url}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setSocialForm(social); setEditingSocial(social.id); setShowSocialModal(true); }} className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={() => handleSocialDelete(social.id)} className="p-1.5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-lg transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          ))}
          {socials.length === 0 && (
            <div className="col-span-full py-16 text-center opacity-20 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No Social Nodes Linked</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-[#0f1115]/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#161920] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in my-auto">
            <div className="p-6 md:p-10 border-b border-white/5 text-center">
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{isEditing ? 'Update' : 'Initialize'} Nav Node</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-4 md:space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Label</label>
                    <input 
                      type="text" 
                      value={form.label} 
                      onChange={e => {
                        const label = e.target.value;
                        const slug = label.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                        if (!isEditing) setForm({...form, label, url: `/${slug}`});
                        else setForm({...form, label});
                      }} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold text-sm" 
                      required 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">URL / Path</label>
                    <input type="text" value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold text-sm" required />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Placement</label>
                  <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none text-sm">
                    <option value="header">Header Nav</option>
                    <option value="footer">Footer Nav</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Parent Node</label>
                  <select 
                    value={form.parent_id || ''} 
                    onChange={e => setForm({...form, parent_id: e.target.value ? Number(e.target.value) : null})} 
                    className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none text-sm"
                  >
                    <option value="">None (Top Level)</option>
                    {items.filter(i => !i.parent_id && i.id !== currentId && i.location === form.location).map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Style</label>
                    <select value={form.layout_style} onChange={e => setForm({...form, layout_style: e.target.value})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none text-sm">
                       <option value="Default">Standard List</option>
                       <option value="Mega">Mega Menu</option>
                       <option value="Grid">Grid Layout</option>
                       <option value="Dropdown">Simple Dropdown</option>
                       <option value="Featured">Featured with Icon</option>
                       <option value="Reference">Reference (PNG Style)</option>
                    </select>
                    {form.location === 'footer' && !form.parent_id && (
                       <p className="text-[9px] text-purple-400 font-bold uppercase tracking-tighter mt-2 ml-2">Top-level footer items act as column headers</p>
                    )}
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Priority Index</label>
                    <input type="number" value={form.position} onChange={e => setForm({...form, position: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold text-sm" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Link to CMS Page</label>
                  <select 
                    onChange={e => {
                      if (e.target.value) {
                        const page = cmsPages.find(p => p.slug === e.target.value);
                        if (page && !isEditing) {
                          setForm({...form, label: page.title, url: `/cms/${page.slug}`});
                        } else if (page && isEditing) {
                          setForm({...form, url: `/cms/${page.slug}`});
                        }
                      }
                    }}
                    className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none text-sm"
                  >
                    <option value="">-- Or Select CMS Page --</option>
                    {cmsPages.map(page => (
                      <option key={page.id} value={page.slug}>{page.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Status</label>
                    <button 
                      type="button"
                      onClick={() => setForm({...form, is_active: !form.is_active})}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${form.is_active ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{form.is_active ? 'Active' : 'Disabled'}</span>
                      <div className={`w-2 h-2 rounded-full ${form.is_active ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                    </button>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="py-4 px-6 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl order-2 md:order-1">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-purple-500/20 order-1 md:order-2">{isEditing ? 'Commit Changes' : 'Initialize Node'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSocialModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-[#0f1115]/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#161920] border border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in my-auto">
            <div className="p-8 border-b border-white/5 text-center">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{editingSocial ? 'Edit' : 'Add'} Social Link</h3>
            </div>
            <form onSubmit={handleSocialSubmit} className="p-6 md:p-8 space-y-4 max-h-[70vh] overflow-y-auto">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Platform Name</label>
                  <select value={socialForm.platform} onChange={e => setSocialForm({...socialForm, platform: e.target.value})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none text-sm">
                    <option value="">Select Platform...</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="YouTube">YouTube</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="TikTok">TikTok</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Full URL</label>
                  <input type="url" value={socialForm.url} onChange={e => setSocialForm({...socialForm, url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold text-sm" placeholder="https://..." required />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Order</label>
                  <input type="number" value={socialForm.position} onChange={e => setSocialForm({...socialForm, position: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold text-sm" />
               </div>
               <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowSocialModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-purple-500/20">Save Social</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenus;
