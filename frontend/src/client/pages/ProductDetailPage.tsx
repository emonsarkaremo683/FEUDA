
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../components/ProductCard';
import LazyImage from '../components/LazyImage';
import { ColorVariant } from '../../types';
import { API_BASE_URL } from '../../config';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart, toggleWishlist, wishlist, products, user, token, showToast } = useApp();
  const navigate = useNavigate();
  
  const product = products.find(p => p.id === productId);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  
  // Swipe State
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Initialize selected color if available
  useEffect(() => {
    if (product?.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const fetchReviews = async () => {
    if (!productId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setRealReviews(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return showToast("Please login to post a review.");
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      if (res.ok) {
        showToast("Review posted successfully!");
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to post review");
      }
    } catch (err) {
      showToast("Connection error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!product) return <div className="p-20 text-center font-bold text-slate-400">Loading Product Matrix...</div>;

  // Determine images to show: If a color is selected and has images, show those. Otherwise show general images.
  const allImages = (selectedColor && selectedColor.images && selectedColor.images.length > 0)
    ? selectedColor.images
    : [product.image, ...(product.images || [])];

  const isFavorite = wishlist.includes(product.id);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor?.name);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <nav className="flex flex-wrap text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400 mb-8 sm:mb-12 gap-y-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-blue-900 transition-colors">Home</Link>
        <span className="mx-3 opacity-30">/</span>
        <Link to="/category/all" className="hover:text-blue-900 transition-colors">Products</Link>
        <span className="mx-3 opacity-30">/</span>
        <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-16 mb-20">
        {/* Left: Gallery Carousel */}
        <div className="space-y-6 select-none">
          <div 
            className="relative aspect-square bg-white rounded-[3rem] overflow-hidden border border-gray-100 group shadow-2xl shadow-gray-200/50"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex h-full transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {allImages.map((img, idx) => (
                <div key={idx} className="min-w-full h-full p-8 sm:p-12">
                  <LazyImage src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={(e) => { e.preventDefault(); prevImage(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); nextImage(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
              {allImages.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentImageIndex === idx ? 'bg-slate-900 w-8' : 'bg-slate-200 w-3 hover:bg-slate-400'}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-4">
            {allImages.map((img, i) => (
              <button 
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-2 bg-[#161920] ${currentImageIndex === i ? 'border-indigo-600 shadow-lg shadow-indigo-500/20' : 'border-transparent opacity-30 hover:opacity-100'}`}
              >
                <LazyImage src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col py-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
              {product.category}
            </span>
            {product.isBestSeller && (
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/20">
                Nexus Favorite
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2 leading-tight">{product.name}</h1>
          <p className="text-slate-400 font-bold text-sm mb-8 uppercase tracking-widest">{product.modelCompatibility}</p>
          
          <div className="flex items-center gap-6 mb-10">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">৳{product.price.toLocaleString()}</span>
            <div className="h-10 w-px bg-slate-100"></div>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <span className="text-slate-900 font-black text-sm">4.9</span>
            </div>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Select Finish: <span className="text-slate-900">{selectedColor?.name}</span></h4>
              <div className="flex flex-wrap gap-4">
                {product.colors.map((color, idx) => (
                  <div key={idx} className="relative group/swatch">
                    <button 
                      onClick={() => { setSelectedColor(color); setCurrentImageIndex(0); }}
                      className={`w-10 h-10 rounded-full p-0.5 border-2 transition-all hover:scale-110 active:scale-95 ${selectedColor?.name === color.name ? 'border-slate-900 ring-2 ring-slate-900/10 ring-offset-2' : 'border-transparent hover:border-slate-300'}`}
                    >
                      <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: color.hex }} />
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/swatch:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {color.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-8 mt-auto">
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all font-black text-slate-400 hover:text-slate-900"
                >-</button>
                <span className="w-12 text-center font-black text-slate-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all font-black text-slate-400 hover:text-slate-900"
                >+</button>
              </div>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`p-5 rounded-3xl border transition-all ${isFavorite ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                <svg className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => addToCart(product, quantity, selectedColor?.name)}
                className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-slate-900/40 transition-all active:scale-95"
              >
                Express Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-100 mb-12">
        <div className="flex gap-12 overflow-x-auto hide-scrollbar">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[200px] mb-32">
        {activeTab === 'description' && (
          <div className="max-w-4xl text-slate-500 leading-relaxed animate-fade-in">
            <p className="text-xl font-medium">{product.description}</p>
          </div>
        )}
        {activeTab === 'specifications' && (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {(product.specifications || []).map((spec, i) => (
              <li key={i} className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-2 h-2 bg-slate-900 rounded-full" />
                <span className="text-slate-900 font-bold text-sm uppercase tracking-tight">{spec}</span>
              </li>
            ))}
          </ul>
        )}
        {activeTab === 'reviews' && (
          <div className="space-y-12 animate-fade-in max-w-4xl">
            {/* Review Submission Form */}
            {user ? (
              <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-xl font-black text-slate-900 mb-6">Write a Review</h4>
                <form onSubmit={handlePostReview} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={`w-8 h-8 flex items-center justify-center transition-all ${newReview.rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-slate-300'}`}
                        >
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience with this product..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 min-h-[120px] transition-all"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmittingReview}
                    className="bg-slate-900 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">You must be logged in to post a review</p>
                <Link to="/auth/login" className="text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:underline">Sign In Now</Link>
              </div>
            )}

            <div className="space-y-6">
              {realReviews.map(review => (
                <div key={review.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-black shadow-sm border border-slate-100 uppercase">
                        {review.user_name[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{review.user_name}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
              {realReviews.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">No Reviews Recorded Yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommended */}
      <section>
        <div className="flex justify-between items-end mb-12">
           <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Nexus Recommendations</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Engineered For Your Ecosystem</p>
           </div>
           <Link to="/category/all" className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-300 transition-all">Explore Entire Fleet</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
