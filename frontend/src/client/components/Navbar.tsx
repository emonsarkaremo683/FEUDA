
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';



const Navbar: React.FC = () => {
  const { cartCount, user, menus } = useApp();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const headerMenus = (menus || []).filter(m => m.location === 'header' && m.is_active).sort((a,b) => a.position - b.position);
  const rootMenus = headerMenus.filter(m => !m.parent_id);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm font-sans border-b border-gray-100 transition-all duration-300">
      {/* Search Overlay */}
      {showSearch && (
        <div className="absolute inset-x-0 top-full bg-white border-b border-gray-100 p-4 shadow-xl z-50 animate-fade-in">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
             <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 pl-12 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              autoFocus
            />
            <svg className="w-5 h-5 absolute left-4 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <button type="button" onClick={() => setShowSearch(false)} className="absolute right-4 top-3 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </form>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/" className="flex items-center gap-2 group">
             <div className="flex items-center">
               <img src="/logo.png" alt="FEUDA" className="h-10 w-auto object-contain" />
             </div>
          </Link>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 font-medium text-slate-600 text-[15px] h-full">
           {rootMenus.map(root => {
             const subMenus = headerMenus.filter(m => m.parent_id === root.id);
             if (subMenus.length > 0) {
               return (
                 <div key={root.id} className="h-full flex items-center relative group px-1">
                   <button className="relative flex items-center gap-1 font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl transition-all duration-300">
                     <span className="relative z-10">{root.label}</span>
                     <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                     <div className="absolute inset-0 bg-slate-50 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 rounded-xl"></div>
                   </button>

                   {/* REFERENCE STYLE (PNG BASED) */}
                   {root.layout_style === 'Reference' && (
                     <div className="fixed left-0 right-0 top-[64px] bg-white border-t border-gray-100 shadow-2xl z-40 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                        <div className="max-w-[1440px] mx-auto flex">
                           {/* Text Links Side */}
                           <div className="flex-grow p-12 grid grid-cols-3 gap-12 bg-white relative z-10">
                              {subMenus.map(sub => {
                                const subSubs = headerMenus.filter(m => m.parent_id === sub.id);
                                return (
                                  <div key={sub.id} className="flex flex-col gap-4">
                                     <Link to={sub.url || '#'} className="text-xl font-black text-slate-900 tracking-tight hover:text-blue-600 transition-colors uppercase">{sub.label}</Link>
                                     <div className="flex flex-col gap-2.5">
                                        {subSubs.map(ssm => (
                                          <Link key={ssm.id} to={ssm.url || '#'} className="text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 group/link">
                                             <div className="w-1.5 h-1.5 bg-slate-200 rounded-full group-hover/link:bg-blue-600 group-hover/link:w-3 transition-all" />
                                             {ssm.label}
                                          </Link>
                                        ))}
                                     </div>
                                  </div>
                                );
                              })}
                           </div>
                           {/* Visual Reference Side */}
                           <div className="w-1/3 relative bg-[#f8f9fb]">
                              <img src="/sub-menu.png" className="w-full h-full object-cover opacity-90 mix-blend-multiply" alt="Submenu Style Reference" />
                              <div className="absolute inset-0 bg-gradient-to-r from-[#f8f9fb] to-transparent" />
                              <div className="absolute bottom-10 left-10 p-8 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/20 max-w-xs">
                                 <h5 className="font-black text-slate-900 text-lg uppercase leading-tight mb-2">Nexus Pro Series</h5>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Designed for Durability & Style</p>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* MEGA MENU STYLE */}
                   {root.layout_style === 'mega' && (
                     <div className="fixed left-0 right-0 top-[64px] bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl z-40 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                       <div className="max-w-[1440px] mx-auto p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                         {subMenus.map(sub => {
                           const subSubs = headerMenus.filter(m => m.parent_id === sub.id);
                           return (
                             <div key={sub.id} className="flex flex-col gap-3">
                                <Link to={sub.url || '#'} className="font-bold text-slate-900 border-b border-gray-100 pb-2 hover:text-[#ff5a1f] transition-colors">{sub.label}</Link>
                                <ul className="flex flex-col gap-2">
                                  {subSubs.map(ssm => (
                                    <li key={ssm.id}>
                                      <Link to={ssm.url || '#'} className="text-sm text-slate-500 hover:text-[#ff5a1f] transition-colors">{ssm.label}</Link>
                                    </li>
                                  ))}
                                </ul>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   )}

                   {/* GRID LAYOUT STYLE */}
                   {root.layout_style === 'grid' && (
                     <div className="absolute left-0 top-[50px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-[2rem] p-6 min-w-[500px] grid grid-cols-2 gap-6 invisible group-hover:visible opacity-0 group-hover:opacity-100 group-hover:top-[60px] transition-all duration-500 z-40">
                       {subMenus.map(sub => {
                         const subSubs = headerMenus.filter(m => m.parent_id === sub.id);
                         return (
                           <div key={sub.id} className="flex flex-col gap-2 bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                              <Link to={sub.url || '#'} className="font-bold text-slate-900 hover:text-[#ff5a1f] transition-colors">{sub.label}</Link>
                              <ul className="flex flex-col gap-1 pl-2 border-l-2 border-gray-200">
                                {subSubs.map(ssm => (
                                  <li key={ssm.id}>
                                    <Link to={ssm.url || '#'} className="text-[13px] text-slate-600 hover:text-blue-600">{ssm.label}</Link>
                                  </li>
                                ))}
                              </ul>
                           </div>
                         );
                       })}
                     </div>
                   )}

                   {/* DEFAULT LIST STYLE */}
                   {root.layout_style !== 'mega' && root.layout_style !== 'grid' && (
                     <div className="absolute left-0 top-[50px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl min-w-[220px] py-3 invisible group-hover:visible opacity-0 group-hover:opacity-100 group-hover:top-[60px] transition-all duration-500 z-40">
                       {subMenus.map(sub => {
                         const subSubs = headerMenus.filter(m => m.parent_id === sub.id);
                         return (
                           <div key={sub.id} className="relative group/sub">
                             <Link to={sub.url || '#'} className="flex items-center justify-between px-6 py-2.5 text-sm text-slate-700 hover:text-[#ff5a1f] hover:bg-slate-50 transition-colors">
                               {sub.label}
                               {subSubs.length > 0 && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>}
                             </Link>
                             {/* Level 3 flyout */}
                             {subSubs.length > 0 && (
                               <div className="absolute left-full top-0 ml-1 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-xl rounded-2xl min-w-[200px] py-2 invisible group-hover/sub:visible opacity-0 group-hover/sub:opacity-100 transition-all z-50">
                                 {subSubs.map(ssm => (
                                   <Link key={ssm.id} to={ssm.url || '#'} className="block px-6 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors">{ssm.label}</Link>
                                 ))}
                               </div>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </div>
               );
             }
             return (
               <Link key={root.id} to={root.url || '#'} className="relative group h-full flex items-center font-bold text-slate-700 hover:text-slate-900 px-4 transition-all duration-300">
                 <span className="relative z-10">{root.label}</span>
                 <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
               </Link>
             );
           })}
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => setShowSearch(!showSearch)} 
            className="text-slate-900 hover:text-blue-700 transition-colors p-1"
            aria-label="Search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </button>
          
          <Link 
            to={user ? "/dashboard" : "/login"} 
            className="text-slate-900 hover:text-blue-700 transition-colors p-1 hidden sm:block"
            aria-label="Profile"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </Link>

          <Link 
            to="/cart" 
            className="text-slate-900 hover:text-blue-700 transition-colors relative p-1"
            aria-label="Cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* Mobile Menu Button */}
           <button 
             className="lg:hidden text-slate-900 p-1"
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
               {isMobileMenuOpen ? (
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
               ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
               )}
             </svg>
           </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 animate-fade-in absolute w-full z-40 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col p-4 space-y-2 font-medium text-slate-800">
            {/* Dynamic Mobile Menu */}
            {rootMenus.map(root => {
               const subMenus = headerMenus.filter(m => m.parent_id === root.id);
               if (subMenus.length > 0) {
                 return (
                   <div key={root.id} className="flex flex-col group">
                     <div className="flex items-center justify-between px-4 py-2 font-bold text-slate-800">
                       {root.label}
                     </div>
                     <div className="pl-6 pr-2 py-2 flex flex-col gap-3 border-l-2 border-blue-100 ml-4 mb-2">
                       {subMenus.map(sub => {
                         const subSubs = headerMenus.filter(m => m.parent_id === sub.id);
                         return (
                           <div key={sub.id} className="flex flex-col gap-2">
                             <Link to={sub.url || '#'} className="text-slate-700 font-bold text-sm block" onClick={() => setIsMobileMenuOpen(false)}>
                               {sub.label}
                             </Link>
                             {subSubs.length > 0 && (
                               <div className="flex flex-col gap-1.5 pl-4 border-l border-gray-100">
                                 {subSubs.map(ssm => (
                                   <Link key={ssm.id} to={ssm.url || '#'} className="text-slate-500 text-xs font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                     {ssm.label}
                                   </Link>
                                 ))}
                               </div>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 );
               }
               return (
                 <Link key={root.id} to={root.url || '#'} className="hover:bg-gradient-to-r hover:from-blue-700 hover:via-purple-600 hover:to-red-500 hover:text-white px-4 py-2 rounded-lg font-bold transition-all text-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
                   {root.label}
                 </Link>
               );
            })}
            <div className="border-t pt-4 flex items-center gap-4">
               <Link to="/login" className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-700 hover:via-purple-600 hover:to-red-500 hover:text-white px-4 py-2 rounded-lg transition-all w-full" onClick={() => setIsMobileMenuOpen(false)}>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                 My Account
               </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
vbar;
