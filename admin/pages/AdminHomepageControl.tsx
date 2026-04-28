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
  const { token, categories, refreshCategories } = useApp();

  const [layout, setLayout] = useState<LayoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
        let res = await fetch('/api/cms/homepage-layout-draft');
        let data = await res.json();
        
        if (!data || data.title === 'Page Missing') {
          res = await fetch('/api/cms/homepage-layout');
          data = await res.json();
        }

        if (data?.content) {
          try {
            const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
            if (Array.isArray(parsed)) {
              setLayout(parsed);
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

    fetchLayout();
  }, []);

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
    fetch('/api/cms/homepage-layout-draft', {
      method: 'PUT', // Using PUT since we have an endpoint for that
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        title: 'Homepage Layout Configuration (Draft)',
        content: JSON.stringify(updatedLayout)
      })
    });
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
        content: JSON.stringify(layout)
      })
    }).then(res => {
      if (res.ok) {
        alert('🚀 Homepage Published Successfully! It is now live for all users.');
      } else {
        alert('❌ Publication Failed. Please check server logs.');
      }
    });
  };

  /* ================= DRAG ================= */
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layout.findIndex(i => i.id === active.id);
    const newIndex = layout.findIndex(i => i.id === over.id);

    const newLayout = arrayMove(layout, oldIndex, newIndex).map((item, i) => ({
      ...item,
      order: i + 1
    }));

    setLayout(newLayout);
    saveDraft(newLayout);
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
      <div className="flex justify-between items-center bg-[#161920] p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Homepage Orchestrator</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Drafting & Deployment Core</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowPreview(true)}
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold uppercase text-xs transition-all"
          >
            Live Preview
          </button>
          <button
            onClick={publishLayout}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold uppercase text-xs shadow-lg shadow-green-900/20 transition-all"
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
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold uppercase text-xs shadow-lg shadow-purple-900/20 transition-all"
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
            {[...layout]
              .sort((a, b) => a.order - b.order)
              .map(section => (
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={addOrUpdateSection}
            className="bg-[#161920] p-8 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-white/5"
          >
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                {isEditing ? 'Configure Section' : 'Add New Section'}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Homepage Architecture Node</p>
            </div>

            <input
              value={form.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  label: e.target.value,
                  id: isEditing
                    ? form.id
                    : e.target.value.replace(/\s+/g, '')
                })
              }
              placeholder="Section Label (e.g. Summer Sale)"
              className="w-full p-3 bg-black text-white rounded-xl border border-white/10 focus:border-purple-500 outline-none transition-all"
              required
            />

            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as any, data: e.target.value === 'video' ? { sectionTitle: '', autoPlayEnabled: true, videos: [] } : {} })
              }
              className="w-full p-2 bg-black text-white rounded-lg border border-white/10"
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

            {form.type === 'component' && (
              <div className="space-y-4">
                <select 
                  value={form.id} 
                  onChange={e => {
                    const val = e.target.value;
                    const label = e.target.options[e.target.selectedIndex].text;
                    const newData = val === 'Hero' ? { slides: [] } : {};
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

                {/* Auto Play Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Auto Play on Hover</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={form.data?.autoPlayEnabled ?? true} 
                      onChange={e => setForm({...form, data: { ...form.data, autoPlayEnabled: e.target.checked }})} 
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-checked:bg-orange-500 rounded-full transition-colors duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
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

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={form.visible} 
                onChange={e => setForm({...form, visible: e.target.checked})} 
                id="visible"
              />
              <label htmlFor="visible">Visible on Site</label>
            </div>

            <div className="flex gap-2 pt-4">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-white/5 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 bg-purple-600 rounded-lg font-bold"
              >
                {isEditing ? 'Save Changes' : 'Create Section'}
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