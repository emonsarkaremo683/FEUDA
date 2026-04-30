
import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';

const categories = [
  {
    name: 'Phone Case',
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=600&auto=format&fit=crop', // Simulating the blue case with ring
    link: '/category/clear-cases'
  },
  {
    name: 'Screen Protector',
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600&auto=format&fit=crop', // Simulating screen protector package
    link: '/category/screen-protectors'
  },
  {
    name: 'Charging',
    image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?q=80&w=600&auto=format&fit=crop', // Simulating power bank/magsafe
    link: '/category/chargers'
  },
  {
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop', // Simulating strap/lanyard
    link: '/category/all'
  }
];

const ShopByCategory: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-slate-900 mb-10 text-left">Shop By Category</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link key={cat.name} to={cat.link} className="flex flex-col items-center group cursor-pointer">
            <div className="w-full bg-gray-50 rounded-3xl overflow-hidden aspect-[4/3] mb-4 relative">
              <div className="absolute inset-0 flex items-center justify-center p-6 transition-transform duration-500 group-hover:scale-105">
                <LazyImage src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopByCategory;
