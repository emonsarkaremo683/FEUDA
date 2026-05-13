
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';
import AdminModal from '../components/AdminModal';
import AdminConfirmDialog from '../components/AdminConfirmDialog';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

const AdminCategories: React.FC = () => {
  const { token, refreshCategories } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  // Custom Confirm State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null; name: string }>({ 
    isOpen: false, 
    id: null,
    name: '' 
  });

  const initialCatState = { name: '', slug: '', description: '', imageUrl: '' };
  const [form, setForm] = useState(initialCatState);

  const fetchCats = () => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Categories Load Failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleEdit = (cat: Category) => {
    setIsEditing(true);
    setCurrentId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.image_url
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `${API_BASE_URL}/api/categories/${currentId}` : `${API_BASE_URL}/api/categories`;
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    }).then(() => {
      fetchCats();
      refreshCategories();
      setShowModal(false);
      setForm(initialCatState);
      setIsEditing(false);
      setCurrentId(null);
    });
  };

  const handleFileUpload = (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setForm({ ...form, imageUrl: data.imageUrl });
      })
      .catch(err => console.error('Upload failed', err));
  };

  const handleDelete = (id: number) => {
    fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => {
        fetchCats();
        refreshCategories();
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Taxonomy Control</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Product Classification Hub</p>
        </div>
        <button onClick={() => { setIsEditing(false); setForm(initialCatState); setShowModal(true); }} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 transition-all text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Add Classifier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all flex flex-col">
            <div className="h-40 relative">
              <img src={cat.image_url || 'https://via.placeholder.com/400x200?text=Category'} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161920] to-transparent"></div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleEdit(cat)} className="p-2 bg-black/40 hover:bg-emerald-500 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button onClick={() => setConfirmDelete({ isOpen: true, id: cat.id, name: cat.name })} className="p-2 bg-black/40 hover:bg-red-500 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h4 className="text-xl font-black text-white mb-2">{cat.name}</h4>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Slug: {cat.slug}</p>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 flex-grow">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <AdminModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={isEditing ? 'Modify Classifier' : 'New Category Unit'}
        subtitle="Manage Product Classification Taxonomy"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Name</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={e => {
                const name = e.target.value;
                const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                setForm({...form, name, slug});
              }} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Slug (URL)</label>
            <input 
              type="text" 
              value={form.slug} 
              onChange={e => setForm({...form, slug: e.target.value})} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all h-24" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Category Visual Asset</label>
            <div className="relative group h-32">
              <input type="file" onChange={e => e.target.files && handleFileUpload(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="h-full bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center group-hover:border-emerald-500 transition-all overflow-hidden">
                {form.imageUrl ? (
                  <img src={form.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Image</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-2xl">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">{isEditing ? 'Commit' : 'Initialize'}</button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminConfirmDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
        title="Purge Category Node"
        message={`Are you sure you want to permanently remove the "${confirmDelete.name}" category? All product associations will be detached.`}
        confirmText="Confirm Purge"
      />
    </div>
  );
};

export default AdminCategories;
