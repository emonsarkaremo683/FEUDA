
import React from 'react';
import { Link } from 'react-router-dom';

interface StickyCategoryNavProps {
  categories: string[];
  activeCategoryId?: string;
}

const StickyCategoryNav: React.FC<StickyCategoryNavProps> = ({ categories, activeCategoryId }) => {
  const allCategories = ['All', ...categories.filter(c => c !== 'All')];

  return (
    <div className="sticky top-[104px] z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100 -mx-4 px-4 overflow-hidden transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto py-4 hide-scrollbar scroll-smooth">
          {allCategories.map((cat) => {
            const slug = cat.toLowerCase().replace(/ /g, '-');
            const isActive = activeCategoryId === slug || (cat === 'All' && activeCategoryId === 'all');
            
            return (
              <Link
                key={cat}
                to={cat === 'All' ? '/category/all' : `/category/${slug}`}
                className={`
                  whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                  }
                `}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StickyCategoryNav;
