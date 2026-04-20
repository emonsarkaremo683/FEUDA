
import React, { useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useApp } from '../../context/AppContext';

const ProductListingPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  
  const { products, selectedDevice, setSelectedDevice, categories } = useApp();
  const [sortBy, setSortBy] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sync internal filter with global device context
  const filterModel = selectedDevice;

  const filteredProducts = useMemo(() => {
    let result = products;
    
    // 1. Primary Filter: Category OR Search
    if (categoryId) {
       // Category mode
       if (categoryId !== 'all') {
         result = result.filter(p => p.category.toLowerCase().replace(' ', '-') === categoryId);
       }
    } else if (searchQuery) {
       // Search mode
       const q = searchQuery.toLowerCase();
       result = result.filter(p => 
         p.name.toLowerCase().includes(q) || 
         p.description.toLowerCase().includes(q) ||
         p.category.toLowerCase().includes(q)
       );
    }

    // 2. Compatibility Filter
    if (filterModel !== 'all') {
      result = result.filter(p => p.modelCompatibility.includes(filterModel));
    }

    // 3. Stock Filter
    if (inStockOnly) {
      result = result.filter(p => (p.stock === undefined || p.stock > 0));
    }

    // 4. Sort
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, categoryId, searchQuery, sortBy, filterModel, inStockOnly]);

  const pageTitle = categoryId 
    ? (categoryId === 'all' ? 'All Products' : categories.find(c => c.toLowerCase().replace(' ', '-') === categoryId) || categoryId)
    : `Results for "${searchQuery}"`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumbs */}
      <nav className="flex text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6 sm:mb-10" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-slate-900 truncate max-w-[150px] sm:max-w-none">{pageTitle}</span>
      </nav>

      <div className="flex flex-col xl:flex-row gap-8 xl:gap-12">
        {/* Mobile Filter Toggle */}
        <button 
          className="xl:hidden w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-500 transition-all group"
          onClick={() => setShowFilters(!showFilters)}
        >
           <div className="flex items-center gap-3 font-bold text-slate-900 group-hover:text-indigo-600 text-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
             <span>Refine Selection</span>
           </div>
           <svg className={`w-5 h-5 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </button>

        {/* Sidebar Filters */}
        <aside className={`w-full xl:w-64 space-y-10 xl:space-y-12 select-none ${showFilters ? 'block' : 'hidden xl:block'}`}>
          {/* Categories */}
          <div>
            <h4 className="font-black text-slate-900 mb-6 sm:mb-8 uppercase tracking-widest text-[10px]">Collection</h4>
            <div className="space-y-4 sm:space-y-5">
              {categories.map(cat => {
                const isActive = categoryId && (cat.toLowerCase().replace(' ', '-') === categoryId || (cat === 'All' && categoryId === 'all'));
                return (
                  <Link 
                    key={cat}
                    to={cat === 'All' ? '/category/all' : `/category/${cat.toLowerCase().replace(' ', '-')}`}
                    className={`block text-sm transition-all duration-300 flex items-center justify-between group ${isActive ? 'text-indigo-600 font-black translate-x-1' : 'text-slate-500 hover:text-indigo-500'}`}
                  >
                    {cat}
                    <div className={`w-1.5 h-1.5 rounded-full bg-indigo-600 transition-all ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`}></div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Model Compatibility */}
          <div>
            <h4 className="font-black text-slate-900 mb-6 sm:mb-8 uppercase tracking-widest text-[10px]">Compatible With</h4>
            <div className="space-y-4 sm:space-y-5">
              {['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'Samsung S24 Ultra', 'All Models'].map(model => {
                const value = model === 'All Models' ? 'all' : model;
                const isChecked = filterModel === value;
                return (
                  <label key={model} className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="model" 
                        checked={isChecked}
                        onChange={() => setSelectedDevice(value)}
                        className="sr-only" 
                      />
                      <div className={`w-[16px] h-[16px] rounded-full transition-all duration-300 border-2 ${
                        isChecked 
                          ? 'border-indigo-600 bg-white ring-[4px] ring-inset ring-indigo-600' 
                          : 'border-transparent bg-slate-200 group-hover:bg-slate-300'
                      }`} />
                    </div>
                    <span className={`text-sm transition-colors ${isChecked ? 'text-slate-900 font-black' : 'text-slate-500 group-hover:text-slate-800'}`}>
                      {model}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-8 border-t border-slate-100">
            <h4 className="font-black text-slate-900 mb-6 sm:mb-8 uppercase tracking-widest text-[10px]">Preferences</h4>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="sr-only" 
                />
                <div className={`w-[18px] h-[18px] rounded-lg transition-all duration-300 flex items-center justify-center ${
                  inStockOnly 
                    ? 'bg-indigo-600 shadow-xl shadow-indigo-500/20' 
                    : 'bg-slate-200 group-hover:bg-slate-300'
                }`}>
                  {inStockOnly && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className={`text-sm transition-colors ${inStockOnly ? 'text-slate-900 font-black' : 'text-slate-500 group-hover:text-slate-800'}`}>
                Show In Stock Only
              </span>
            </label>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 sm:mb-16 gap-6">
            <div>
               <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter capitalize mb-2">{pageTitle}</h1>
               <div className="flex items-center gap-2">
                 <div className="h-1 w-6 sm:w-8 bg-indigo-600 rounded-full"></div>
                 <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{filteredProducts.length} Premium Results</span>
               </div>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full sm:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 hidden lg:block">Sort:</span>
              <div className="relative flex-grow sm:flex-grow-0">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-5 pr-10 py-2.5 text-[11px] font-black text-slate-900 uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low-High</option>
                  <option value="price-high">Price: High-Low</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 animate-fade-in">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] py-32 sm:py-40 text-center border border-slate-50 shadow-sm animate-fade-in">
              <div className="w-24 h-24 sm:w-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">No results found.</h3>
              <p className="text-slate-400 mt-4 max-w-xs mx-auto text-sm">We couldn't find matches. Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => {setSelectedDevice('all'); setInStockOnly(false);}}
                className="mt-10 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/10 active:scale-95"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListingPage;
