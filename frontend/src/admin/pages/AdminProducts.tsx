
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ColorVariant } from '../../types';

const AdminProducts: React.FC = () => {
  const { token, refreshProducts, categories } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const initialProductState = {
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: '',
    imageUrl: '', // This will be the main thumbnail
    modelCompatibility: '',
    colors: [] as ColorVariant[],
    specifications: [] as string[]
  };

  const [form, setForm] = useState(initialProductState);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Products Load Failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (p: any) => {
    setIsEditing(true);
    setCurrentId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      price: Number(p.price),
      stock: p.stock,
      description: p.description,
      imageUrl: p.image_url,
      modelCompatibility: p.model_compatibility,
      colors: p.colors ? JSON.parse(p.colors) : [],
      specifications: p.specifications ? JSON.parse(p.specifications) : []
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing ? `/api/products/${currentId}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        fetchProducts();
        refreshProducts();
        setShowModal(false);
        setForm(initialProductState);
        setIsEditing(false);
        setCurrentId(null);
      });
  };

  const handleFileUpload = (file: File, colorIndex?: number) => {
    const formData = new FormData();
    formData.append('image', file);
    fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (colorIndex !== undefined) {
           const newColors = [...form.colors];
           newColors[colorIndex].images = [...(newColors[colorIndex].images || []), data.imageUrl];
           setForm({ ...form, colors: newColors });
        } else {
           setForm({ ...form, imageUrl: data.imageUrl });
        }
      });
  };

  const addColor = () => {
    setForm({
      ...form,
      colors: [...form.colors, { name: '', hex: '#000000', images: [] }]
    });
  };

  const removeColor = (index: number) => {
    setForm({
      ...form,
      colors: form.colors.filter((_, i) => i !== index)
    });
  };

  const updateColor = (index: number, field: keyof ColorVariant, value: any) => {
    const newColors = [...form.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setForm({ ...form, colors: newColors });
  };

  const removeColorImage = (colorIndex: number, imgIndex: number) => {
    const newColors = [...form.colors];
    newColors[colorIndex].images = newColors[colorIndex].images.filter((_, i) => i !== imgIndex);
    setForm({ ...form, colors: newColors });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => {
        fetchProducts();
        refreshProducts();
      });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-[#161920] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Product Control</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Multi-Variant Registry</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setForm(initialProductState); setShowModal(true); }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition-all text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Deploy Asset
        </button>
      </div>

      <div className="bg-[#161920] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-widest font-black bg-white/2">
                <th className="px-8 py-5">Preview</th>
                <th className="px-8 py-5">Product Identity</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Pricing</th>
                <th className="px-8 py-5">Variants</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-all">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white leading-none">{p.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">ID: PRC-{p.id}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-slate-400 bg-white/5 px-3 py-1 rounded-lg uppercase tracking-widest">{p.category}</span>
                  </td>
                  <td className="px-8 py-5 font-black text-white">৳{p.price}</td>
                  <td className="px-8 py-5">
                    <div className="flex -space-x-2">
                       {p.colors && JSON.parse(p.colors).map((c: any, i: number) => (
                         <div key={i} className="w-5 h-5 rounded-full border border-black shadow-sm" style={{ backgroundColor: c.hex }} title={c.name}></div>
                       ))}
                       {(!p.colors || JSON.parse(p.colors).length === 0) && <span className="text-[10px] text-slate-600">Standard</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 hover:bg-purple-500/10 text-slate-500 hover:text-purple-400 rounded-lg transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-[#0f1115]/90 backdrop-blur-md overflow-y-auto pt-20">
          <div className="bg-[#161920] border border-white/10 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in mb-20">
            <div className="p-10 border-b border-white/5 bg-gradient-to-r from-purple-600/5 to-transparent flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{isEditing ? 'Update' : 'Deploy'} Asset Unit</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configure full variant spectrum</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Name</label>
                     <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none" required />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Category</label>
                        <select 
                          value={form.category} 
                          onChange={e => setForm({...form, category: e.target.value})} 
                          className="w-full bg-[#161920] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none appearance-none" 
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Compatibility</label>
                        <input type="text" value={form.modelCompatibility} onChange={e => setForm({...form, modelCompatibility: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Price (৳)</label>
                        <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Stock</label>
                        <input type="number" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none" required />
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Description</label>
                     <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none h-[11.5rem]" required />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Main Asset Thumbnail</label>
                     <div className="relative group h-28">
                        <input type="file" onChange={e => e.target.files && handleFileUpload(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="h-full bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center group-hover:border-purple-500 transition-all overflow-hidden">
                           {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Thumb</span>}
                        </div>
                     </div>
                   </div>
                </div>
              </div>

              {/* COLORS & IMAGES SECTION */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h4 className="text-white font-black uppercase tracking-widest text-sm">Chromatic Variants</h4>
                    <button type="button" onClick={addColor} className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-all">+ Add Color Spec</button>
                 </div>

                 <div className="space-y-6">
                    {form.colors.map((color, cIdx) => (
                      <div key={cIdx} className="bg-white/2 border border-white/5 rounded-[2rem] p-8 space-y-6 relative group/card">
                         <button type="button" onClick={() => removeColor(cIdx)} className="absolute top-6 right-6 text-slate-600 hover:text-red-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>

                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-2">Color Name (e.g. Cobalt Blue)</label>
                               <input type="text" value={color.name} onChange={e => updateColor(cIdx, 'name', e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500/50 font-bold" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-2">Hex Code</label>
                               <div className="flex gap-3">
                                  <input type="color" value={color.hex} onChange={e => updateColor(cIdx, 'hex', e.target.value)} className="w-12 h-10 bg-transparent border-none outline-none cursor-pointer" />
                                  <input type="text" value={color.hex} onChange={e => updateColor(cIdx, 'hex', e.target.value)} className="flex-grow bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500/50 font-mono" />
                               </div>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-2">Variant-Specific Media Assets</label>
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                               {color.images?.map((img, iIdx) => (
                                 <div key={iIdx} className="aspect-square bg-black/40 rounded-xl relative group overflow-hidden border border-white/5">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeColorImage(cIdx, iIdx)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                 </div>
                               ))}
                               <div className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-xl relative flex items-center justify-center hover:border-purple-500/50 transition-all">
                                  <input type="file" onChange={e => e.target.files && handleFileUpload(e.target.files[0], cIdx)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                    {form.colors.length === 0 && <p className="text-center py-10 text-slate-600 text-xs font-bold uppercase tracking-widest bg-white/2 rounded-3xl border border-dashed border-white/10">No color variants defined</p>}
                 </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-2xl font-black bg-white/5 text-slate-500 hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px]">Terminate Session</button>
                <button type="submit" className="flex-1 py-5 rounded-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/20 text-white hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px]">{isEditing ? 'Commit Update' : 'Initialize Unit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
