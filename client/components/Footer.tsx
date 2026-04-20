
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const Footer: React.FC = () => {
  const { menus } = useApp();

  const footerGroups = useMemo(() => {
    const footerLinks = menus.filter(m => m.location === 'footer');
    const groups: { [key: string]: typeof footerLinks } = {};
    
    footerLinks.forEach(link => {
      const category = link.layout_style || 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push(link);
    });
    
    return groups;
  }, [menus]);

  return (
    <footer className="bg-[#050A30] text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <div className="flex items-center">
              <img src="/logo.png" alt="FEUDA" className="h-10 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="max-w-sm text-gray-300">
              We create premium mobile protection solutions for the modern explorer. Quality and durability in every fiber.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'Facebook', 'YouTube'].map(platform => (
                <div key={platform} title={platform} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-600 hover:text-white transition-all cursor-pointer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Footer Groups */}
          {Object.entries(footerGroups).map(([category, links]) => (
            <div key={category}>
              <h5 className="text-white font-bold mb-6 uppercase tracking-widest text-[10px] opacity-60">{category}</h5>
              <ul className="space-y-4 text-sm">
                {links.sort((a,b) => a.position - b.position).map(link => (
                  <li key={link.id}>
                    <Link to={link.url} className="hover:text-blue-500 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Fallback if no links exist in database */}
          {Object.keys(footerGroups).length === 0 && (
            <>
              <div>
                <h5 className="text-white font-bold mb-6">Shop</h5>
                <ul className="space-y-4 text-sm">
                  <li><Link to="/category/all" className="hover:text-blue-500 transition-colors">All Products</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-bold mb-6">Support</h5>
                <ul className="space-y-4 text-sm">
                  <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 FEUDA Premium Accessories. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Dynamic Footer Engine Active</span>
            <span className="opacity-40">Nexus v3.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
