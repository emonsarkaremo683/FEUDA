
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

interface ThemeSettings {
  primary: string;
  accent: string;
  background: string;
  text: string;
  card: string;
  border: string;
  primaryGradient: string;
  heroGradient: string;
}

const AdminThemeControl: React.FC = () => {
  const { token, showToast, refreshTheme } = useApp();
  const [theme, setTheme] = useState<ThemeSettings>({
    primary: '#9333ea',
    accent: '#2563eb',
    background: '#0f172a',
    text: '#f8fafc',
    card: '#1e293b',
    border: '#334155',
    primaryGradient: 'linear-gradient(to right, #9333ea, #db2777)',
    heroGradient: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await fetch('/api/cms/theme-settings');
        const data = await res.json();
        if (data?.content) {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          setTheme(prev => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error('Failed to fetch theme:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/theme-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Theme Customization',
          content: JSON.stringify(theme),
          slug: 'theme-settings'
        }),
      });

      if (res.ok) {
        await refreshTheme();
        showToast('🎨 Visual Identity Matrix Synchronized');
      } else {
        showToast('❌ Failed to update theme architecture.');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('❌ Network fault during theme sync.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-purple-500 font-black">Loading Identity Core...</div>;

  const colorFields = [
    { label: 'Primary Brand Color', key: 'primary' as keyof ThemeSettings, desc: 'Used for main buttons, highlights, and primary gradients.' },
    { label: 'Accent Color', key: 'accent' as keyof ThemeSettings, desc: 'Used for links, secondary highlights, and hover states.' },
    { label: 'System Background', key: 'background' as keyof ThemeSettings, desc: 'The main background color for the entire application.' },
    { label: 'Primary Text', key: 'text' as keyof ThemeSettings, desc: 'Color for headings and main body text.' },
    { label: 'Surface/Card Background', key: 'card' as keyof ThemeSettings, desc: 'Background color for product cards, modals, and sections.' },
    { label: 'Border & Divider', key: 'border' as keyof ThemeSettings, desc: 'Color for borders, lines, and subtle separators.' },
  ];

  const gradientFields = [
    { label: 'Primary Brand Gradient', key: 'primaryGradient' as keyof ThemeSettings, desc: 'Used for large buttons and branding elements.' },
    { label: 'Hero Section Gradient', key: 'heroGradient' as keyof ThemeSettings, desc: 'Background gradient for the main hero banners.' },
  ];

  return (
    <div className="space-y-10 pb-20 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#161920] p-6 rounded-3xl shadow-xl gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Visual Identity Core</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Color Schema & Branding</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold uppercase text-xs shadow-lg shadow-purple-900/20 transition-all ${saving ? 'opacity-50 cursor-wait' : ''}`}
        >
          {saving ? 'Saving...' : 'Save Theme Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#161920] p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="space-y-6">
            {colorFields.map((field) => (
              <div key={field.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                <div className="space-y-1">
                  <label className="text-sm font-black uppercase tracking-tight text-white group-hover:text-purple-400 transition-colors">{field.label}</label>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{field.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={theme[field.key]}
                    onChange={(e) => setTheme({ ...theme, [field.key]: e.target.value })}
                    className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-purple-500 outline-none w-24"
                  />
                  <input
                    type="color"
                    value={theme[field.key]}
                    onChange={(e) => setTheme({ ...theme, [field.key]: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                  />
                </div>
              </div>
            ))}

            <div className="h-px bg-white/5 my-8" />

            {gradientFields.map((field) => (
              <div key={field.key} className="space-y-4 p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                <div className="space-y-1">
                  <label className="text-sm font-black uppercase tracking-tight text-white group-hover:text-purple-400 transition-colors">{field.label}</label>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{field.desc}</p>
                </div>
                <textarea
                  value={theme[field.key]}
                  onChange={(e) => setTheme({ ...theme, [field.key]: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-purple-500 outline-none h-20"
                  placeholder="e.g. linear-gradient(...)"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-6">
          <div className="bg-[#161920] p-8 rounded-[2.5rem] border border-white/5 h-full flex flex-col">
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-6">Live Preview Simulation</h3>
            <div 
              className="flex-grow rounded-3xl p-8 space-y-6 border transition-all duration-500"
              style={{ 
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text
              }}
            >
              <div className="flex justify-between items-center">
                <div className="text-xl font-black italic tracking-tighter" style={{ color: theme.primary }}>FAUDA</div>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest opacity-70">
                  <span style={{ color: theme.accent }}>Home</span>
                  <span>Shop</span>
                  <span>Contact</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-3xl font-extrabold leading-none">The Future of <br/><span style={{ color: theme.accent }}>Protection.</span></h4>
                <p className="text-sm opacity-70 max-w-xs">Premium components for your digital fleet. Engineered for absolute precision.</p>
                
                <div className="flex gap-3">
                  <button 
                    className="px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl"
                    style={{ backgroundColor: theme.primary, color: '#fff' }}
                  >
                    Action Button
                  </button>
                  <button 
                    className="px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                    style={{ borderColor: theme.border, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    Secondary
                  </button>
                </div>
              </div>

              <div 
                className="mt-8 p-6 rounded-2xl border transition-all"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="w-full aspect-video bg-black/20 rounded-xl mb-4" />
                <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminThemeControl;
