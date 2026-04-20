
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
  const { token } = useApp();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);

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
        alert('Content Repository Synchronized.');
      })
      .catch(err => alert('Sync Failure: ' + err));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl h-fit">
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-purple-600/5 to-transparent">
          <h3 className="font-black text-xl text-white tracking-tight uppercase">Content Map</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Managed Static Resources</p>
        </div>
        <div className="divide-y divide-white/5">
          {pages.map(page => (
            <button 
              key={page.id} 
              onClick={() => setSelectedPage(page)}
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
        {selectedPage ? (
          <div className="bg-[#161920] border border-white/5 rounded-3xl p-10 shadow-2xl flex flex-col h-full animate-fade-in">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Editor: {selectedPage.title}</h3>
                <button onClick={handleUpdate} className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/20 hover:scale-105 transition-all">Save Changes</button>
             </div>
             
             <div className="space-y-6 flex-grow flex flex-col">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Page Content (HTML/RichText)</label>
                   <textarea 
                     value={selectedPage.content} 
                     onChange={e => setSelectedPage({...selectedPage, content: e.target.value})}
                     className="w-full bg-[#0f1115] border border-white/10 rounded-2xl p-8 text-slate-300 font-mono text-sm leading-relaxed outline-none focus:border-purple-500 transition-all flex-grow min-h-[400px]"
                   />
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-[#161920]/40 border border-white/5 border-dashed rounded-[3rem] p-20 text-center">
            <svg className="w-16 h-16 text-slate-700 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 2v6h6"/></svg>
            <h4 className="text-slate-500 font-black uppercase tracking-widest text-sm">Select a resource to begin editing</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;
