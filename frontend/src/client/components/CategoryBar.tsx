
import React from 'react';
import { CATEGORY_NAMES } from '../../data/products';

interface CategoryBarProps {
  activeCategory: string;
  onCategoryClick: (category: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ activeCategory, onCategoryClick }) => {
  return (
    <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto overflow-x-auto hide-scrollbar flex items-center gap-2 sm:gap-3 py-4 px-4">
        {CATEGORY_NAMES.map((cat) => (

          <button
            key={cat}
            onClick={() => onCategoryClick(cat)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[13px] font-black tracking-wide transition-all duration-300 transform active:scale-95 ${
              activeCategory === cat
                ? 'bg-blue-900 text-white shadow-xl shadow-blue-900/20'
                : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
