import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import HomePage from '../../client/pages/HomePage';
import FileUploader from '../components/FileUploader';

interface LayoutSection {
  id: string;
  label: string;
  type: 'component' | 'banner' | 'category' | 'html' | 'newsletter' | 'featured_products' | 'flash_sale' | 'video';
  visible: boolean;
  order: number;
  data?: any;
}

/* ================= SORTABLE ITEM ================= */
const SortableItem = ({ section, children }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-4">

        {/* DRAG HANDLE ONLY */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 text-slate-500"
        >
          ☰
        </div>

        {/* CONTENT */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

/* ================= MAIN ================= */
const AdminHomepageControl: React.FC = () => {
  const { token, categories, refreshCategories, showToast } = useApp();

  const [layout, setLayout] = useState<LayoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const initialSection: LayoutSection = {
    id: '',
    label: '',
    type: 'component',
    visible: true,
    order: 0,
    data: {}
  };

  const [form, setForm] = useState<LayoutSection>(initialSection);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        // Try fetching draft first, fallback to live
        let res = await fetch('/api/cms/homepage-layout-draft', {
          headers: { Authorization: `Bearer ${token}` }
        });
        let data = await res.json();
        
        if (!data || data.title === 'Page Missing') {
          res = await fetch('/api/cms/homepage-layout');
          data = await res.json();
        }

        if (data?.content) {
          try {
            const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
            if (Array.isArray(parsed)) {
              setLayout(parsed.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
            } else {
              setDefaultLayout();
            }
          } catch (e) {
            setDefaultLayout();
          }
        } else {
          setDefaultLayout();
        }
      } catch (err) {
        console.error('Failed to fetch layout:', err);
        setDefaultLayout();
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchLayout();
  }, [token]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  /* ================= DEFAULT ================= */
  const setDefaultLayout = () => {
    setLayout([
      { id: 'Hero', label: 'Hero Banner', type: 'component', visible: true, order: 1, data: {} },
      { id: 'TabbedProductShowcase', label: 'Tabbed Showcase', type: 'component', visible: true, order: 2, data: {} },
      { id: 'StorySection', label: 'Our Story', type: 'component', visible: true, order: 3, data: {} },
      { id: 'Categories', label: 'Shop By Category', type: 'component', visible: true, order: 4, data: {} },
      { id: 'TrustSection', label: 'Trust Badges', type: 'component', visible: true, order: 5, data: {} }
    ]);
  };

  /* ================= SAVE DRAFT ================= */
  const saveDraft = (updatedLayout = layout) => {
    if (saveTimeout) clearTimeout(saveTimeout);

    const timeout = setTimeout(() => {
      fetch('/api/cms/homepage-layout-draft', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: 'Homepage Layout Configuration (Draft)',
          content: JSON.stringify(updatedLayout),
          slug: 'homepage-layout-draft'
        })
      }).then(res => {
        if (res.ok) {
          showToast('Draft synchronized to cloud storage');
        }
      });
    }, 1500);

    setSaveTimeout(timeout);
  };

  /* ================= PUBLISH ================= */
  const publishLayout = () => {
    if (!window.confirm('Are you sure you want to publish these changes to the live site?')) return;
    
    fetch('/api/cms/homepage-layout', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        title: 'Homepage Layout Configuration',
        content: JSON.stringify(layout),
        slug: 'homepage-layout'
      })
    }).then(res => {
      if (res.ok) {
        showToast('🚀 Homepage Matrix Published Live');
      } else {
        showToast('❌ Publication Pipeline Error');
      }
    });
  };

  /* ================= DRAG ================= */
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Create a sorted copy to match visual order for index calculation
    const sortedLayout = [...layout].sort((a, b) => (a.order || 0) - (b.order || 0));

    const oldIndex = sortedLayout.findIndex(i => i.id === active.id);
    const newIndex = sortedLayout.findIndex(i => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newLayout = arrayMove(sortedLayout, oldIndex, newIndex).map((item, i) => ({
        ...item,
        order: i + 1
      }));

      setLayout(newLayout);
      saveDraft(newLayout);
    }
  };

  /* ================= CRUD ================= */
  const addOrUpdateSection = (e: React.FormEvent) => {
    e.preventDefault();

    let newLayout;

    if (isEditing) {
      newLayout = layout.map(s => (s.id === form.id ? form : s));
    } else {
      const finalId = form.id || `section_${Date.now()}`;
      newLayout = [...layout, { ...form, id: finalId, order: layout.length + 1 }];
    }

    setLayout(newLayout);
    saveDraft(newLayout);

    setShowModal(false);
    setForm(initialSection);
    setIsEditing(false);
  };

  const deleteSection = (id: string) => {
    if (!window.confirm('Delete this section?')) return;
    const filtered = layout
      .filter(s => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));

    setLayout(filtered);
    saveDraft(filtered);
  };

  const editSection = (section: LayoutSection) => {
    setForm(section);
    setIsEditing(true);
    setShowModal(true);
  };

  /* ================= UI ================= */
  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="space-y-10 pb-20 text-white">

      {/* HEADER ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#161920] p-6 rounded-3xl shadow-xl gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Homepage Orchestrator</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Drafting & Deployment Core</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold uppercase text-[10px] md:text-xs transition-all"
          >
            Live Preview
          </button>
          <button
            onClick={publishLayout}
            className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold uppercase text-[10px] md:text-xs shadow-lg shadow-green-900/20 transition-all"
          >
            Publish Live
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setForm(initialSection);
              setIsEditing(false);
              setShowModal(true);
            }}
            className="w-full md:w-auto px-4 md:px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold uppercase text-[10px] md:text-xs shadow-lg shadow-purple-900/20 transition-all"
          >
            + Add Section
          </button>
        </div>
      </div>

      {/* DRAG SYSTEM */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={layout.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {layout.map(section => (
                <SortableItem key={section.id} section={section}>
                  <div className="bg-[#161920] p-6 rounded-3xl flex justify-between items-center">

                    <div>
                      <h4 className="font-bold uppercase">
                        {section.label}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {section.type}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editSection(section);
                        }}
                        className="px-3 py-1 bg-white/10 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                        className="px-3 py-1 bg-red-500 rounded"
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                </SortableItem>
              ))}
          </div>
        </SortableContext>
      </DndContext>

      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 overflow-y-auto">
          <form
            onSubmit={addOrUpdateSection}
            className="bg-[#161920] p-6 md:p-8 rounded-[2rem] md:rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 md:space-y-6 shadow-2xl border border-white/5 my-auto"
          >
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                {isEditing ? 'Configure Section' : 'Add New Section'}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Homepage Architecture Node</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Section Identity</label>
                <input
                  value={form.label}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      label: e.target.value,
                      id: isEditing
                        ? form.id
                        : e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
                    })
                  }
                  placeholder="e.g. Summer Collection"
                  className="w-full p-4 bg-black text-white rounded-2xl border border-white/10 focus:border-purple-500 outline-none transition-all text-sm font-bold shadow-inner"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Node Type</label>
                <select
                  value={form.type}
                  onChange={(e) => {
                    const type = e.target.value as any;
                    let data = {};
                    if (type === 'video') data = { sectionTitle: '', videos: [] };
                    if (type === 'newsletter') data = { title: 'Join the Inner Circle', subtitle: 'Get early access to exclusive drops and obsidian-tier rewards.' };
                    if (type === 'featured_products') data = { title: 'Obsidian Selection', category: 'all', limit: 4 };
                    setForm({ ...form, type, data });
                  }}
                  className="w-full p-4 bg-black text-white rounded-2xl border border-white/10 focus:border-purple-500 outline-none transition-all text-sm font-bold appearance-none shadow-inner"
                >
                  <option value="component">System Component</option>
                  <option value="video">Video Section</option>
                  <option value="banner">Static Banner</option>
                  <option value="category">Category Highlight</option>
                  <option value="featured_products">Featured Products Grid</option>
                  <option value="flash_sale">Flash Sale Banner</option>
                  <option value="newsletter">Newsletter Signup</option>
                  <option value="html">Custom HTML</option>
                </select>
              </div>
            </div>

            {form.type === 'featured_products' && (
              <div className="space-y-4 border-t border-white/5 pt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Grid Title</label>
                     <input 
                       className="w-full p-3 bg-black text-white rounded-lg border border-white/10 text-xs font-bold"
                       value={form.data?.title || ''}
                       onChange={e => setForm({...form, data: { ...form.data, title: e.target.value }})}
                       placeholder="e.g. Best Sellers"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Source Category</label>
                     <select 
                       value={form.data?.category || 'all'} 
                       onChange={e => setForm({...form, data: { ...form.data, category: e.target.value }})}
                       className="w-full p-3 bg-black text-white rounded-lg border border-white/10 text-xs font-bold"
                     >
                       <option value="all">All Products</option>
                       {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                   </div>
                 </div>
              </div>
            )}

            {form.type === 'newsletter' && (
              <div className="space-y-4 border-t border-white/5 pt-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Hero Headline</label>
                   <input 
                     className="w-full p-3 bg-black text-white rounded-lg border border-white/10 text-xs font-bold"
                     value={form.data?.title || ''}
                     onChange={e => setForm({...form, data: { ...form.data, title: e.target.value }})}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Subtext Logic</label>
                   <textarea 
                     className="w-full p-3 bg-black text-white rounded-lg border border-white/10 text-xs font-bold h-20"
                     value={form.data?.subtitle || ''}
                     onChange={e => setForm({...form, data: { ...form.data, subtitle: e.target.value }})}
                   />
                 </div>
              </div>
            )}

            {form.type === 'component' && (
              <div className="space-y-4">
                <select 
                  value={form.id} 
                  onChange={e => {
                    const val = e.target.value;
                    const label = e.target.options[e.target.selectedIndex].text;
                    const newData = val === 'Hero' ? { slides: [] } : val === 'StorySection' ? { sectionTitle: 'We Are Committed To Creating <br /> A Better World', stories: [] } : {};
                    setForm({...form, id: val, label: label, data: newData});
                  }}
                  className="w-full p-2 bg-black text-white rounded-lg border border-white/10"
                >
                  <option value="">Select Component...</option>
                  <option value="Hero">Hero Banner (Slider)</option>
                  <option value="TabbedProductShowcase">Tabbed Showcase</option>
                  <option value="StorySection">Our Story</option>
                  <option value="Categories">Shop By Category</option>
                  <option value="TrustSection">Trust Badges</option>
                </select>

                {form.id === 'Hero' && (
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-black uppercase text-purple-400">Manage Slides</h5>
                      <button 
                        type="button"
                        onClick={() => {
                          const slides = form.data?.slides || [];
                          setForm({
                            ...form,
                            data: {
                              ...form.data,
                              slides: [...slides, { id: Date.now(), image: '', badge: '', title: '', subtitle: '', desc: '' }]
                            }
                          });
                        }}
                        className="text-[10px] bg-purple-600 px-2 py-1 rounded font-bold uppercase"
                      >
                        + Add Slide
                      </button>
                    </div>
                    
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {(form.data?.slides || []).map((slide: any, idx: number) => (
                        <div key={slide.id} className="p-4 bg-black/40 rounded-xl space-y-2 relative">
                          <button 
                            type="button"
                            onClick={() => {
                              const slides = [...form.data.slides];
                              slides.splice(idx, 1);
                              setForm({...form, data: { ...form.data, slides }});
                            }}
                            className="absolute top-2 right-2 text-red-500 font-bold"
                          >
                            ×
                          </button>
                          <div className="flex gap-2">
                            <input 
                              placeholder="Image URL" 
                              className="flex-1 p-1 bg-black text-xs border border-white/10 rounded" 
                              value={slide.image} 
                              onChange={e => {
                                const slides = [...form.data.slides];
                                slides[idx].image = e.target.value;
                                setForm({...form, data: { ...form.data, slides }});
                              }}
                            />
                            <FileUploader 
                              token={token} 
                              label="↑" 
                              onUploadSuccess={(url) => {
                                const slides = [...form.data.slides];
                                slides[idx].image = url;
                                setForm({...form, data: { ...form.data, slides }});
                              }} 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              placeholder="Badge" 
                              className="w-full p-1 bg-black text-xs border border-white/10 rounded" 
                              value={slide.badge} 
                              onChange={e => {
                                const slides = [...form.data.slides];
                                slides[idx].badge = e.target.value;
                                setForm({...form, data: { ...form.data, slides }});
                              }}
                            />
                            <input 
                              placeholder="Title" 
                              className="w-full p-1 bg-black text-xs border border-white/10 rounded" 
                              value={slide.title} 
                              onChange={e => {
                                const slides = [...form.data.slides];
                                slides[idx].title = e.target.value;
                                setForm({...form, data: { ...form.data, slides }});
                              }}
                            />
                          </div>
                          <input 
                            placeholder="Subtitle" 
                            className="w-full p-1 bg-black text-xs border border-white/10 rounded" 
                            value={slide.subtitle} 
                            onChange={e => {
                              const slides = [...form.data.slides];
                              slides[idx].subtitle = e.target.value;
                              setForm({...form, data: { ...form.data, slides }});
                            }}
                          />
                          <textarea 
                            placeholder="Description" 
                            className="w-full p-1 bg-black text-xs border border-white/10 rounded h-12" 
                            value={slide.desc} 
                            onChange={e => {
                              const slides = [...form.data.slides];
                              slides[idx].desc = e.target.value;
                              setForm({...form, data: { ...form.data, slides }});
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.id === 'StorySection' && (
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    <div className="border border-purple-500/30 rounded-xl p-4 space-y-3 bg-purple-500/5">
                      <h5 className="text-xs font-black uppercase text-purple-400 tracking-widest">Section Title</h5>
                      <input 
                        placeholder="Section Title (HTML allowed)" 
                        className="w-full p-3 bg-black text-white rounded-lg border border-white/10 text-sm font-bold"
                        value={form.data?.sectionTitle || ''}
                        onChange={e => setForm({...form, data: { ...form.data, sectionTitle: e.target.value }})}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-black uppercase text-purple-400">Manage Stories</h5>
                      <button 
                        type="button"
                        onClick={() => {
                          const stories = form.data?.stories || [];
                          setForm({
                            ...form,
                            data: {
                              ...form.data,
                              stories: [...stories, { id: Date.now(), video: '', poster: '', title: '' }]
                            }
                          });
                        }}
                        className="text-[10px] bg-purple-600 px-2 py-1 rounded font-bold uppercase"
                      >
                        + Add Story
                      </button>
                    </div>
                    
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {(form.data?.stories || []).map((story: any, idx: number) => (
                        <div key={story.id} className="p-4 bg-black/40 rounded-xl space-y-2 relative">
                          <button 
                            type="button"
                            onClick={() => {
                              const stories = [...form.data.stories];
                              stories.splice(idx, 1);
                              setForm({...form, data: { ...form.data, stories }});
                            }}
                            className="absolute top-2 right-2 text-red-500 font-bold"
                          >
                            ×
                          </button>
                          
                          <input 
                            placeholder="Title" 
                            className="w-full p-2 bg-black text-xs border border-white/10 rounded" 
                            value={story.title} 
                            onChange={e => {
                              const stories = [...form.data.stories];
                              stories[idx].title = e.target.value;
                              setForm({...form, data: { ...form.data, stories }});
                            }}
                          />
                          
                          <div className="flex gap-2">
                            <input 
                              placeholder="Video URL (.mp4)" 
                              className="flex-1 p-2 bg-black text-xs border border-white/10 rounded" 
                              value={story.video} 
                              onChange={e => {
                                const stories = [...form.data.stories];
                                stories[idx].video = e.target.value;
                                setForm({...form, data: { ...form.data, stories }});
                              }}
                            />
                            <FileUploader 
                              token={token} 
                              label="↑" 
                              onUploadSuccess={(url) => {
                                const stories = [...form.data.stories];
                                stories[idx].video = url;
                                setForm({...form, data: { ...form.data, stories }});
                              }} 
                            />
                          </div>

                          <div className="flex gap-2">
                            <input 
                              placeholder="Poster Image URL (Optional)" 
                              className="flex-1 p-2 bg-black text-xs border border-white/10 rounded" 
                              value={story.poster || ''} 
                              onChange={e => {
                                const stories = [...form.data.stories];
                                stories[idx].poster = e.target.value;
                                setForm({...form, data: { ...form.data, stories }});
                              }}
                            />
                            <FileUploader 
                              token={token} 
                              label="↑" 
                              onUploadSuccess={(url) => {
                                const stories = [...form.data.stories];
                                stories[idx].poster = url;
                                setForm({...form, data: { ...form.data, stories }});
                              }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {form.type === 'video' && (
              <div className="space-y-4">
                {/* Section Title (the big heading like "We Are Committed To Creating A Better World") */}
                <div className="border border-purple-500/30 rounded-xl p-4 space-y-3 bg-purple-500/5">
                  <h5 className="text-xs font-black uppercase text-purple-400 tracking-widest">Section Title</h5>
                  <input 
                    placeholder="Section Title (e.g. We Are Committed To Creating A Better World)" 
                    className="w-full p-3 bg-black text-white rounded-lg border border-white/10 text-sm font-bold"
                    value={form.data?.sectionTitle || ''}
                    onChange={e => setForm({...form, data: { ...form.data, sectionTitle: e.target.value }})}
                  />
                </div>



                {/* Video Items CRUD */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-black uppercase text-purple-400 tracking-widest">Video Items</h5>
                    <button 
                      type="button"
                      onClick={() => {
                        const videos = form.data?.videos || [];
                        setForm({
                          ...form,
                          data: {
                            ...form.data,
                            videos: [...videos, { id: Date.now(), videoUrl: '', thumbnail: '', title: '', description: '' }]
                          }
                        });
                      }}
                      className="text-[10px] bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg font-bold uppercase transition-colors"
                    >
                      + Add Video
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                    {(form.data?.videos || []).map((video: any, idx: number) => (
                      <div key={video.id} className="p-4 bg-black/40 rounded-xl space-y-3 relative border border-white/5">
                        {/* Delete Button */}
                        <button 
                          type="button"
                          onClick={() => {
                            const videos = [...(form.data?.videos || [])];
                            videos.splice(idx, 1);
                            setForm({...form, data: { ...form.data, videos }});
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-400 font-bold text-lg transition-colors"
                        >
                          ×
                        </button>

                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                          Video #{idx + 1}
                        </div>

                        {/* Video Title */}
                        <input 
                          placeholder="Video Title" 
                          className="w-full p-2 bg-black text-white text-xs rounded-lg border border-white/10 font-bold" 
                          value={video.title || ''} 
                          onChange={e => {
                            const videos = [...(form.data?.videos || [])];
                            videos[idx] = { ...videos[idx], title: e.target.value };
                            setForm({...form, data: { ...form.data, videos }});
                          }}
                          required
                        />

                        {/* Video Description */}
                        <input 
                          placeholder="Short Description (Optional)" 
                          className="w-full p-2 bg-black text-white text-xs rounded-lg border border-white/10" 
                          value={video.description || ''} 
                          onChange={e => {
                            const videos = [...(form.data?.videos || [])];
                            videos[idx] = { ...videos[idx], description: e.target.value };
                            setForm({...form, data: { ...form.data, videos }});
                          }}
                        />

                        {/* Video URL */}
                        <div className="flex gap-2">
                          <input 
                            placeholder="Video URL (.mp4)" 
                            className="flex-1 p-2 bg-black text-white text-xs rounded-lg border border-white/10" 
                            value={video.videoUrl || ''} 
                            onChange={e => {
                              const videos = [...(form.data?.videos || [])];
                              videos[idx] = { ...videos[idx], videoUrl: e.target.value };
                              setForm({...form, data: { ...form.data, videos }});
                            }}
                            required
                          />
                          <FileUploader 
                            token={token} 
                            label="↑" 
                            onUploadSuccess={(url) => {
                              const videos = [...(form.data?.videos || [])];
                              videos[idx] = { ...videos[idx], videoUrl: url };
                              setForm({...form, data: { ...form.data, videos }});
                            }} 
                          />
                        </div>

                        {/* Thumbnail URL */}
                        <div className="flex gap-2">
                          <input 
                            placeholder="Thumbnail Image URL (Optional)" 
                            className="flex-1 p-2 bg-black text-white text-xs rounded-lg border border-white/10" 
                            value={video.thumbnail || ''} 
                            onChange={e => {
                              const videos = [...(form.data?.videos || [])];
                              videos[idx] = { ...videos[idx], thumbnail: e.target.value };
                              setForm({...form, data: { ...form.data, videos }});
                            }}
                          />
                          <FileUploader 
                            token={token} 
                            label="↑" 
                            onUploadSuccess={(url) => {
                              const videos = [...(form.data?.videos || [])];
                              videos[idx] = { ...videos[idx], thumbnail: url };
                              setForm({...form, data: { ...form.data, videos }});
                            }} 
                          />
                        </div>
                      </div>
                    ))}

                    {(!form.data?.videos || form.data.videos.length === 0) && (
                      <div className="text-center py-8 text-slate-600 text-xs font-bold uppercase tracking-widest">
                        No videos added yet. Click "+ Add Video" to start.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {form.type === 'category' && (
              <select 
                value={form.data?.category || ''} 
                onChange={e => setForm({...form, data: { ...form.data, category: e.target.value }})}
                className="w-full p-2 bg-black text-white rounded-lg border border-white/10"
              >
                <option value="">Select Category...</option>
                {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}

            {form.type === 'banner' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Image URL" 
                    value={form.data?.imageUrl || ''} 
                    onChange={e => setForm({...form, data: { ...form.data, imageUrl: e.target.value }})}
                    className="flex-1 p-2 bg-black text-white rounded-lg border border-white/10"
                  />
                  <FileUploader 
                    token={token} 
                    label="Upload" 
                    onUploadSuccess={(url) => setForm({...form, data: { ...form.data, imageUrl: url }})} 
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Link (e.g. /category/chargers)" 
                  value={form.data?.link || ''} 
                  onChange={e => setForm({...form, data: { ...form.data, link: e.target.value }})}
                  className="w-full p-2 bg-black text-white rounded-lg border border-white/10"
                />
              </div>
            )}

            {form.type === 'flash_sale' && (
              <div className="space-y-4">
                <input 
                  type="datetime-local" 
                  value={form.data?.endDate || ''} 
                  onChange={e => setForm({...form, data: { ...form.data, endDate: e.target.value }})}
                  className="w-full p-2 bg-black text-white rounded-lg border border-white/10"
                />
                <input 
                  type="text" 
                  placeholder="Promo Text" 
                  value={form.data?.promoText || ''} 
                  onChange={e => setForm({...form, data: { ...form.data, promoText: e.target.value }})}
                  className="w-full p-2 bg-black text-white rounded-lg border border-white/10"
                />
              </div>
            )}

            {form.type === 'html' && (
              <textarea 
                placeholder="Raw HTML / Tailwind Classes Supported" 
                value={form.data?.html || ''} 
                onChange={e => setForm({...form, data: { ...form.data, html: e.target.value }})}
                className="w-full p-2 bg-black text-white rounded-lg border border-white/10 h-32"
              />
            )}

            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${form.visible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <label htmlFor="visible" className="text-xs font-black uppercase tracking-widest text-slate-400 cursor-pointer select-none">Live Visibility</label>
              </div>
              <button 
                type="button"
                onClick={() => setForm({...form, visible: !form.visible})}
                className={`relative w-12 h-6 rounded-full transition-all duration-500 ${form.visible ? 'bg-purple-600' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-md ${form.visible ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 bg-white/5 rounded-2xl font-black uppercase text-[10px] text-slate-400 order-2 md:order-1"
              >
                Abort Configuration
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-black uppercase text-[10px] text-white shadow-lg shadow-purple-900/20 order-1 md:order-2"
              >
                {isEditing ? 'Commit Changes' : 'Deploy Section'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          <div className="bg-[#161920] p-4 flex justify-between items-center text-white">
            <div>
              <span className="text-xs font-black uppercase bg-green-600 px-2 py-1 rounded mr-2">Preview Mode</span>
              <span className="text-sm opacity-70 italic">Simulating live storefront with current draft</span>
            </div>
            <button 
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 bg-red-600 rounded-lg font-bold text-xs uppercase"
            >
              Exit Preview
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <HomePage previewLayout={layout} />
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminHomepageControl;