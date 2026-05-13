
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import StickyCategoryNav from '../components/StickyCategoryNav';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { API_BASE_URL } from '../../config';

const SkeletonCard = () => (
  <div className="bg-[#161920]/5 rounded-[2rem] p-6 animate-pulse">
    <div className="aspect-square bg-slate-200 rounded-2xl mb-6"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
  </div>
);

const ProductListingPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  const { selectedDevice, setSelectedDevice, categories, products: allProducts } = useApp();
  const [sortBy, setSortBy] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    let filtered = [...allProducts];

    // Filter by Category
    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase().replace(/ /g, '-') === categoryId);
    }

    // Filter by Search Query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by Stock
    if (inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Filter by Device
    if (selectedDevice && selectedDevice !== 'all') {
      filtered = filtered.filter(p => p.modelCompatibility === selectedDevice || p.modelCompatibility === 'All Models');
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      // popular
      filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    const limit = 12;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (currentPage - 1) * limit;
    
    setProducts(filtered.slice(startIndex, startIndex + limit));
    setPagination({ total, totalPages });
    setLoading(false);
  }, [allProducts, categoryId, searchQuery, currentPage, sortBy, inStockOnly, selectedDevice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
    
  const pageTitle = categoryId 
    ? (categoryId === 'all' ? 'All Products' : categories.find(c => c.toLowerCase().replace(' ', '-') === categoryId) || categoryId)
    : (searchQuery ? `Results for "${searchQuery}"` : 'All Products');

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <SEO 
        title={pageTitle} 
        description={`Browse our premium selection of ${pageTitle}. High-quality assets engineered for performance and style.`}
      />
      
      <StickyCategoryNav categories={categories} activeCategoryId={categoryId} />

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

        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden xl:block w-64 space-y-12 select-none">
          {/* Categories */}
          <div>
            <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-[10px]">Collection</h4>
            <div className="space-y-5">
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
            <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-[10px]">Compatible With</h4>
            <div className="space-y-5">
              {['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'Samsung S24 Ultra', 'All Models'].map(model => {
                const value = model === 'All Models' ? 'all' : model;
                const isChecked = selectedDevice === value;
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
            <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-[10px]">Preferences</h4>
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

        {/* Mobile Filter Drawer */}
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 xl:hidden ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 pb-12 transition-transform duration-500 ease-out transform ${showFilters ? 'translate-y-0' : 'translate-y-full'}`}>
             <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-10" />
             <div className="space-y-10 max-h-[70vh] overflow-y-auto pr-2">
                {/* Mobile Categories */}
                <div>
                  <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Collection</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => {
                      const isActive = categoryId && (cat.toLowerCase().replace(' ', '-') === categoryId || (cat === 'All' && categoryId === 'all'));
                      return (
                        <Link 
                          key={cat}
                          to={cat === 'All' ? '/category/all' : `/category/${cat.toLowerCase().replace(' ', '-')}`}
                          onClick={() => setShowFilters(false)}
                          className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}`}
                        >
                          {cat}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Device Filter */}
                <div>
                  <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Compatible With</h4>
                  <div className="flex flex-wrap gap-3">
                    {['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'Samsung S24 Ultra', 'All Models'].map(model => {
                      const value = model === 'All Models' ? 'all' : model;
                      const isChecked = selectedDevice === value;
                      return (
                        <button 
                          key={model}
                          onClick={() => setSelectedDevice(value)}
                          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isChecked ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                        >
                          {model}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Stock */}
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">In Stock Only</span>
                  <button 
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`w-12 h-6 rounded-full transition-all relative ${inStockOnly ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${inStockOnly ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <button 
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-900/20"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </button>
             </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 sm:mb-16 gap-6">
            <div>
               <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter capitalize mb-2">{pageTitle}</h1>
               <div className="flex items-center gap-2">
                 <div className="h-1 w-6 sm:w-8 bg-indigo-600 rounded-full"></div>
                 <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{pagination.total} Premium Results</span>
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

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 animate-fade-in">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-16 sm:mt-24 flex items-center justify-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button 
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xs transition-all ${p === currentPage ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900'}`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button 
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </>
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
                onClick={() => {setSelectedDevice('all'); setInStockOnly(false); handlePageChange(1);}}
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
