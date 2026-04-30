
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface CMSPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  last_updated: string;
}

const AdminCMS: React.FC = () => {
  const { token, refreshCmsPages } = useApp();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const fetchPages = () => {
    fetch('/api/cms')
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setPages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('CMS Load Failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleUpdate = () => {
    if (!selectedPage) return;
    fetch(`/api/cms/${selectedPage.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(selectedPage)
    })
      .then(res => res.ok ? res.json() : Promise.reject('Update failed'))
      .then(() => {
        fetchPages();
        refreshCmsPages();
        alert('Content Repository Synchronized.');
      })
      .catch(err => alert('Sync Failure: ' + err));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const slug = newTitle.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    
    fetch('/api/cms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle, slug, content: '<h1>New Page Content</h1>' })
    })
      .then(res => res.ok ? res.json() : Promise.reject('Creation failed'))
      .then(data => {
        fetchPages();
        refreshCmsPages();
        setIsCreating(false);
        setNewTitle('');
        setSelectedPage(data);
      })
      .catch(err => alert('Creation failed: ' + err));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this page?')) return;
    fetch(`/api/cms/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => {
        fetchPages();
        refreshCmsPages();
        setSelectedPage(null);
      })
      .catch(err => alert('Delete failed'));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-fit">
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-purple-600/5 to-transparent flex justify-between items-center">
          <div>
            <h3 className="font-black text-xl text-white tracking-tight uppercase">Content Map</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Managed Static Resources</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-purple-900/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {pages.map(page => (
            <button 
              key={page.id} 
              onClick={() => { setSelectedPage(page); setIsCreating(false); }}
              className={`w-full p-6 text-left hover:bg-white/5 transition-all flex items-center justify-between group ${selectedPage?.id === page.id ? 'bg-white/2' : ''}`}
            >
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-400">{page.title}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-1">/{page.slug}</p>
              </div>
              <svg className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-8">
        {isCreating ? (
           <div className="bg-[#161920] border border-white/5 rounded-3xl p-10 shadow-2xl animate-fade-in">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Initialize Resource</h3>
              <form onSubmit={handleCreate} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Resource Title</label>
                    <input 
                      type="text" 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full bg-[#0f1115] border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-purple-500 transition-all"
                      placeholder="e.g. Terms of Service"
                      required
                    />
                 </div>
                 <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">Create Resource</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="px-8 bg-white/5 text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancel</button>
                 </div>
              </form>
           </div>
        ) : selectedPage ? (
          <div className="bg-[#161920] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col h-full animate-fade-in">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Editor: {selectedPage.title}</h3>
                <div className="flex gap-3 w-full md:w-auto">
                   <button onClick={() => handleDelete(selectedPage.id)} className="bg-red-500/10 text-red-500 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all">Delete</button>
                   <button onClick={handleUpdate} className="flex-1 md:flex-none bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/20 hover:scale-105 transition-all">Save Changes</button>
                </div>
             </div>
             
             <div className="space-y-6 flex-grow flex flex-col">
                <div className="space-y-2 flex-grow flex flex-col">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Page Content (HTML/RichText)</label>
                   <textarea 
                     value={selectedPage.content} 
                     onChange={e => setSelectedPage({...selectedPage, content: e.target.value})}
                     className="w-full bg-[#0f1115] border border-white/10 rounded-2xl p-4 md:p-8 text-slate-300 font-mono text-sm leading-relaxed outline-none focus:border-purple-500 transition-all flex-grow min-h-[300px] md:min-h-[400px]"
                   />
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-[#161920]/40 border border-white/5 border-dashed rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 text-center">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-slate-700 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 2v6h6"/></svg>
            <h4 className="text-slate-500 font-black uppercase tracking-widest text-xs md:text-sm">Select a resource to begin editing</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;
