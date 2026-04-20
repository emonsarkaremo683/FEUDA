
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface LayoutSection {
  id: string;
  label: string;
  type: 'component' | 'banner' | 'category' | 'html';
  visible: boolean;
  order: number;
  data?: any;
}

const AdminHomepageControl: React.FC = () => {
  const { token, categories } = useApp();
  const [layout, setLayout] = useState<LayoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialSection: LayoutSection = { 
    id: '', 
    label: '', 
    type: 'component', 
    visible: true, 
    order: 0,
    data: {}
  };
  const [form, setForm] = useState<LayoutSection>(initialSection);

  useEffect(() => {
    fetch('/api/cms/homepage-layout')
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        if (data && data.content) {
          try {
            setLayout(JSON.parse(data.content));
          } catch (e) {
            setDefaultLayout();
          }
        } else {
          setDefaultLayout();
        }
        setLoading(false);
      })
      .catch(err => {
        setDefaultLayout();
        setLoading(false);
      });
  }, []);

  const setDefaultLayout = () => {
    setLayout([
      { id: 'Hero', label: 'Hero Banner', type: 'component', visible: true, order: 1 },
      { id: 'TabbedProductShowcase', label: 'Tabbed Showcase', type: 'component', visible: true, order: 2 },
      { id: 'StorySection', label: 'Our Story', type: 'component', visible: true, order: 3 },
      { id: 'Categories', label: 'Shop By Category', type: 'component', visible: true, order: 4 },
      { id: 'TrustSection', label: 'Trust Badges', type: 'component', visible: true, order: 5 },
    ]);
  };

  const saveLayout = (updatedLayout = layout) => {
    fetch('/api/cms/homepage-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ layout: updatedLayout })
    }).then(() => alert('Homepage Orchestration Updated Successfully.'));
  };

  const handleFileUpload = (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setForm({ ...form, data: { ...form.data, imageUrl: data.imageUrl } });
      });
  };

  const addOrUpdateSection = (e: React.FormEvent) => {
    e.preventDefault();
    let newLayout;
    if (isEditing) {
      newLayout = layout.map(s => s.id === form.id ? form : s);
    } else {
      // Auto-generate ID if not provided
      const finalId = form.id || `section_${Date.now()}`;
      newLayout = [...layout, { ...form, id: finalId, order: layout.length + 1 }];
    }
    setLayout(newLayout);
    setShowModal(false);
    setForm(initialSection);
    setIsEditing(false);
  };

  const editSection = (section: LayoutSection) => {
    setForm(section);
    setIsEditing(true);
    setShowModal(true);
  };

  const deleteSection = (id: string) => {
    if (!window.confirm('Remove this section?')) return;
    const filtered = layout.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
    setLayout(filtered);
  };

  const moveOrder = (id: string, delta: number) => {
    const idx = layout.findIndex(s => s.id === id);
    if (idx + delta < 0 || idx + delta >= layout.length) return;
    const newLayout = [...layout];
    const temp = newLayout[idx];
    newLayout[idx] = newLayout[idx + delta];
    newLayout[idx + delta] = temp;
    setLayout(newLayout.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Homepage Orchestrator</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time Visual Layout Control</p>
        </div>
        <div className="flex gap-4">
            <button onClick={() => { setIsEditing(false); setForm(initialSection); setShowModal(true); }} className="bg-white/5 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/10 transition-all">
                Add Section
            </button>
            <button onClick={() => saveLayout()} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 hover:scale-105 transition-all active:scale-95">
                Commit Orchestration
            </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {layout.sort((a,b) => a.order - b.order).map((section) => (
          <div key={section.id} className={`bg-[#161920] border border-white/5 p-6 rounded-3xl flex items-center justify-between transition-all ${section.visible ? 'opacity-100 shadow-xl' : 'opacity-40 grayscale'}`}>
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveOrder(section.id, -1)} className="p-1 hover:text-white text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"/></svg></button>
                <button onClick={() => moveOrder(section.id, 1)} className="p-1 hover:text-white text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg></button>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                 <span className="text-[10px] font-black text-purple-400 uppercase">{section.type[0]}</span>
              </div>
              <div>
                 <h4 className="font-black text-white text-lg tracking-tight uppercase">{section.label || section.id}</h4>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{section.type} • Order: {section.order}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button onClick={() => editSection(section)} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
               </button>
               <button onClick={() => deleteSection(section.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f1115]/90 backdrop-blur-md">
          <div className="bg-[#161920] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-10 border-b border-white/5 text-center">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{isEditing ? 'Configure' : 'Inject'} Section</h3>
            </div>
            <form onSubmit={addOrUpdateSection} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Section Label</label>
                <input type="text" value={form.label} onChange={e => setForm({...form, label: e.target.value, id: e.target.value.replace(/\s+/g, '')})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold" required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none">
                  <option value="component">System Component</option>
                  <option value="banner">Static Banner</option>
                  <option value="category">Category Highlight</option>
                  <option value="html">Custom HTML / Code</option>
                </select>
              </div>

              {form.type === 'component' && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Select Component</label>
                   <select value={form.id} onChange={e => setForm({...form, id: e.target.value})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none">
                      <option value="Hero">Hero Banner</option>
                      <option value="TabbedProductShowcase">Tabbed Showcase</option>
                      <option value="StorySection">Our Story</option>
                      <option value="Categories">Shop By Category</option>
                      <option value="TrustSection">Trust Badges</option>
                   </select>
                </div>
              )}

              {form.type === 'category' && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Target Category</label>
                   <select value={form.data?.category || ''} onChange={e => setForm({...form, data: { ...form.data, category: e.target.value }})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold appearance-none">
                      <option value="">Select Category...</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                </div>
              )}

              {form.type === 'banner' && (
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Banner Image</label>
                      <div className="relative group h-28">
                         <input type="file" onChange={e => e.target.files && handleFileUpload(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                         <div className="h-full bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center overflow-hidden">
                            {form.data?.imageUrl ? <img src={form.data.imageUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-slate-600 uppercase">Upload Media</span>}
                         </div>
                      </div>
                   </div>
                   <input type="text" placeholder="Call to Action Link (URL)" value={form.data?.link || ''} onChange={e => setForm({...form, data: { ...form.data, link: e.target.value }})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500 transition-all font-bold text-xs" />
                </div>
              )}

              {form.type === 'html' && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Raw HTML Content</label>
                   <textarea value={form.data?.html || ''} onChange={e => setForm({...form, data: { ...form.data, html: e.target.value }})} className="w-full bg-[#0f1115] border border-white/10 rounded-2xl p-6 text-slate-300 font-mono text-xs leading-relaxed outline-none focus:border-purple-500 transition-all h-32" placeholder="<div class='bg-red-500'>Custom Promo</div>" />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-purple-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-purple-500/20">{isEditing ? 'Update' : 'Initialize'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHomepageControl;
