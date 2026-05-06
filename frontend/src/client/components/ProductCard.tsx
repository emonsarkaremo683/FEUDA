
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import LazyImage from './LazyImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist, selectedDevice } = useApp();
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]);
  
  const isFavorite = wishlist.includes(product.id);
  const isOutOfStock = product.stock === 0;

  // Check if current global filter matches product
  const isDirectlyCompatible = selectedDevice === 'all' || product.modelCompatibility === selectedDevice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, selectedColor);
    navigate('/checkout');
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleColorSelect = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(color);
  };

  return (
    <div 
      className={`group relative bg-white rounded-3xl overflow-hidden border border-slate-100 transition-all duration-500 flex flex-col h-full hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 ${!isDirectlyCompatible ? 'opacity-70 grayscale-[0.2]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-[#161920]">
        {/* Primary Image */}
        <div className={`absolute inset-0 transition-opacity duration-700 p-6 ${isHovered && product.images && product.images[0] ? 'opacity-0' : 'opacity-100'}`}>
          <LazyImage src={product.image} alt={product.name} className={`w-full h-full object-contain ${isOutOfStock ? 'opacity-60 grayscale' : ''}`} />
        </div>
        {/* Hover Secondary Image (Check if exists) */}
        {product.images && product.images[0] && (
          <div className={`absolute inset-0 transition-all duration-1000 transform p-6 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}>
            <LazyImage src={product.images[0]} alt={product.name} className={`w-full h-full object-contain ${isOutOfStock ? 'opacity-60 grayscale' : ''}`} />
          </div>
        )}

        {/* Stock Out Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
            <span className="bg-white text-slate-900 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl">
              Stock Out
            </span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.isBestSeller && (
             <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">Premium</span>
          )}
          {!isDirectlyCompatible && selectedDevice !== 'all' && (
             <span className="bg-slate-900/80 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest backdrop-blur-md border border-white/10">Diff Model</span>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={handleToggleFav}
          className={`absolute top-4 right-4 p-2.5 rounded-2xl transition-all duration-300 z-10 shadow-lg ${
            isFavorite ? 'bg-red-500 text-white scale-110' : 'bg-white/10 backdrop-blur-xl text-white/60 hover:text-white border border-white/10'
          }`}
        >
          <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        {/* Quick look overlay - Now has Buy Now */}
        <div className={`absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[#161920]/80 to-transparent z-20`}>
           <button 
             onClick={handleBuyNow}
             disabled={isOutOfStock}
             className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all border border-white/20 ${
               isOutOfStock 
               ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
               : 'bg-white text-slate-900 hover:bg-slate-100'
             }`}
           >
             {isOutOfStock ? 'Out of Stock' : 'Shop Now'}
           </button>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="block group/title mb-1">
          <h3 className="font-black text-slate-900 text-lg leading-tight group-hover/title:text-indigo-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-400 text-xs font-medium">
            {product.modelCompatibility}
          </span>
        </div>
        
        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-2.5 mb-5">
            {product.colors.map((color: any) => (
              <button
                key={color.name}
                onClick={(e) => handleColorSelect(e, color.name)}
                className={`w-4 h-4 rounded-full border border-slate-100 shadow-sm transition-transform ${selectedColor === color.name ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'}`}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select color ${color.name}`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900 tracking-tight">৳{product.price.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`relative w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${
              isOutOfStock 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : isAdded 
                  ? 'bg-green-500 text-white scale-95 shadow-green-200' 
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white active:scale-95'
            }`}
            aria-label="Add to cart"
          >
            {isAdded ? (
              <svg className="w-5 h-5 animate-bounce-in" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
