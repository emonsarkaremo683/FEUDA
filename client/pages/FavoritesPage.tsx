
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { products } from '../../data/products';
import ProductCard from '../components/ProductCard';

const FavoritesPage: React.FC = () => {
  const { wishlist } = useApp();
  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Your Favorites</h1>
        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold">
          {favoriteProducts.length} items
        </span>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto py-32 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No favorites saved</h2>
          <p className="text-gray-500 mb-8">Save items you love and they will appear here for later.</p>
          <Link to="/" className="text-blue-600 font-bold hover:underline">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
