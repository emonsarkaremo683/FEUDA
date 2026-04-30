
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProductCard from './ProductCard';

type Tab = 'iPhone Case' | 'Samsung Case';

const TabbedProductShowcase: React.FC = () => {
  const { products } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('iPhone Case');

  // Logic to filter products based on the tabs requested
  // In a real app, this would filter by actual category or model compatibility
  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'iPhone Case':
        // Showing the specific items mentioned in prompt + others
        return products.filter(p => p.modelCompatibility.includes('iPhone') || p.id.includes('torras') || p.id.includes('ostand'));
      case 'Samsung Case':
        return products.filter(p => p.modelCompatibility.includes('Samsung') || p.name.includes('Samsung'));
      default:
        return products;
    }
  };

  const filtered = getFilteredProducts().slice(0, 4); // Show top 4 like screenshot

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 mb-10">
        <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar w-full sm:w-auto">
          {['iPhone Case', 'Samsung Case'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`pb-4 text-xl font-medium whitespace-nowrap transition-all relative ${
                activeTab === tab 
                  ? 'text-slate-900' 
                  : 'text-gray-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 to-purple-600 rounded-full"></span>
              )}
              {activeTab === tab && (
                 <span className="absolute top-0 -right-3 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default TabbedProductShowcase;
