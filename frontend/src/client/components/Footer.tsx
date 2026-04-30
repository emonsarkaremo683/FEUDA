import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const Footer: React.FC = () => {
  const { menus, socialLinks, cmsPages } = useApp();

  const footerGroups = useMemo(() => {
    const footerLinks = menus.filter(m => m.location === 'footer' && m.is_active);
    const groups: { [key: string]: any[] } = {};
    
    footerLinks.forEach(link => {
      const category = link.layout_style || 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push({
        id: link.id,
        label: link.label,
        url: link.url,
        position: link.position
      });
    });

    // Add CMS pages if not already present in menus and footer is otherwise empty or requested
    if (cmsPages.length > 0) {
      const companyGroup = 'Support';
      if (!groups[companyGroup]) groups[companyGroup] = [];
      
      cmsPages.forEach(page => {
        // FILTER: Do not show layout/config pages in public footer
        if (page.slug.includes('layout') || page.slug.includes('config') || page.slug.includes('draft')) return;

        // Only add if not already in footerLinks by URL
        const exists = footerLinks.some(link => link.url === `/cms/${page.slug}`);
        if (!exists) {
          groups[companyGroup].push({
            id: `cms-${page.id}`,
            label: page.title,
            url: `/cms/${page.slug}`,
            position: 99
          });
        }
      });
    }

    // Add User Links Group
    const userGroup = 'Account';
    groups[userGroup] = [
      { id: 'u-1', label: 'My Profile', url: '/dashboard', position: 1 },
      { id: 'u-2', label: 'Order Tracking', url: '/track-order', position: 2 },
      { id: 'u-3', label: 'My Favorites', url: '/favorites', position: 3 },
      { id: 'u-4', label: 'Cart', url: '/cart', position: 4 }
    ];
    
    return groups;
  }, [menus, cmsPages]);

  return (
    <footer className="bg-[#050A30] text-slate-400 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <div className="flex items-center">
              <img src="/logo.png" alt="FEUDA" className="h-10 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="max-w-sm text-slate-300 text-sm md:text-base leading-relaxed">
              We create premium mobile protection solutions for the modern explorer. Quality and durability in every fiber.
            </p>
            <div className="flex gap-3 md:gap-4">
              {socialLinks.length > 0 ? (
                socialLinks.sort((a,b) => a.position - b.position).map(link => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title={link.platform} 
                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-600 hover:text-white transition-all duration-300 cursor-pointer group border border-white/5"
                  >
                    {/* Dynamic Icon Rendering */}
                    {link.platform.toLowerCase() === 'facebook' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.14h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>
                    )}
                    {link.platform.toLowerCase() === 'instagram' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    )}
                    {link.platform.toLowerCase() === 'twitter' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    )}
                    {link.platform.toLowerCase() === 'youtube' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    )}
                    {!['facebook', 'instagram', 'twitter', 'youtube'].includes(link.platform.toLowerCase()) && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    )}
                  </a>
                ))
              ) : (
                ['Twitter', 'Instagram', 'Facebook', 'YouTube'].map(platform => (
                  <div key={platform} title={platform} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-600 hover:text-white transition-all cursor-pointer border border-white/5">
                    {platform === 'Facebook' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.14h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>}
                    {platform === 'Instagram' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>}
                    {platform === 'Twitter' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>}
                    {platform === 'YouTube' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Footer Groups */}
          {Object.entries(footerGroups).map(([category, groupLinks]) => (
            <div key={category}>
              <h5 className="text-white font-bold mb-6 uppercase tracking-[0.2em] text-[10px] opacity-50">{category}</h5>
              <ul className="space-y-4 text-sm">
                {(groupLinks as any[]).sort((a,b) => a.position - b.position).map(link => (
                  <li key={link.id}>
                    <Link to={link.url || '#'} className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 text-[10px] md:text-xs">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-slate-500 font-medium">© 2026 FEUDA Premium Accessories. All rights reserved.</p>
            <p className="text-slate-600 flex items-center justify-center md:justify-start gap-1.5">
              Developed By <span className="text-blue-500/80 font-black hover:text-blue-400 transition-colors cursor-pointer uppercase tracking-widest">Elite Tech</span>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-slate-500 font-bold uppercase tracking-tighter">Nexus v3.1 Online</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            <Link to="/cms/privacy-policy" className="text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-widest">Privacy</Link>
            <Link to="/cms/terms-service" className="text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-widest">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
