
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import TrustSection from '../components/TrustSection';
import TabbedProductShowcase from '../components/TabbedProductShowcase';
import StorySection from '../components/StorySection';
import ShopByCategory from '../components/ShopByCategory';
import VideoSection from '../components/VideoSection';
import SEO from '../components/SEO';

// Define mapping for Homepage component loading
const SectionComponents: Record<string, React.FC<any>> = {
  Hero: Hero,
  TabbedProductShowcase: TabbedProductShowcase,
  StorySection: StorySection,
  TrustSection: TrustSection,
  Categories: ShopByCategory,
  VideoSection: VideoSection
};

const CategoryHighlight: React.FC<{ category: string }> = ({ category }) => {
  const { products } = useApp();
  const catProducts = products.filter(p => p.category === category).slice(0, 4);

  if (catProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{category}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Curated selection from our fleet</p>
        </div>
        <Link to={`/category/${category.toLowerCase().replace(/ /g, '-')}`} className="text-xs font-black text-slate-900 uppercase border-b-2 border-slate-900 pb-1">View All</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {catProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

interface HomePageProps {
  previewLayout?: any[];
}

const FlashSaleTimer: React.FC<{ endDate: string }> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', mins: '00', secs: '00' });

  useEffect(() => {
    const target = new Date(endDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ hours: '00', mins: '00', secs: '00' });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        mins: mins.toString().padStart(2, '0'),
        secs: secs.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="flex justify-center gap-6">
       <div className="flex flex-col">
          <span className="text-4xl font-black tracking-tighter">{timeLeft.hours}</span>
          <span className="text-[8px] font-bold uppercase opacity-50">Hours</span>
       </div>
       <div className="text-4xl font-black opacity-30">:</div>
       <div className="flex flex-col">
          <span className="text-4xl font-black tracking-tighter">{timeLeft.mins}</span>
          <span className="text-[8px] font-bold uppercase opacity-50">Mins</span>
       </div>
       <div className="text-4xl font-black opacity-30">:</div>
       <div className="flex flex-col">
          <span className="text-4xl font-black tracking-tighter">{timeLeft.secs}</span>
          <span className="text-[8px] font-bold uppercase opacity-50">Secs</span>
       </div>
    </div>
  );
};

const HomePage: React.FC<HomePageProps> = ({ previewLayout }) => {
  const [layout, setLayout] = useState<any[]>([]);

  useEffect(() => {
    if (previewLayout) {
      setLayout(previewLayout);
    } else {
      fetch(`${API_BASE_URL}/api/cms/homepage-layout`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.content) {
            try {
              setLayout(JSON.parse(data.content));
            } catch (e) {
              setLayout([]);
            }
          }
        });
    }
  }, [previewLayout]);

  const renderSection = (section: any) => {
    if (!section.visible) return null;

    switch (section.type) {
      case 'component':
        const Component = SectionComponents[section.id];
        // Pass all data as props to the component
        return Component ? <Component key={section.id} {...section.data} /> : null;
      
      case 'video':
        return <VideoSection key={section.id} {...section.data} />;

      case 'category':
        return <CategoryHighlight key={section.id} category={section.data?.category} />;
      
      case 'featured_products':
        return <CategoryHighlight key={section.id} category={section.data?.category || 'Best Sellers'} />;

      case 'flash_sale':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 py-10">
            <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-[3rem] p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
              <div className="text-center md:text-left">
                <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Limited Time Offer</span>
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-2">{section.data?.promoText || 'Flash Sale'}</h2>
                <p className="opacity-80 font-bold uppercase text-xs tracking-widest">Hurry up! Stock is depleting fast.</p>
              </div>
              <div className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center min-w-[300px]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">Ends In</p>
                <FlashSaleTimer endDate={section.data?.endDate} />
              </div>
            </div>
          </section>
        );

      case 'newsletter':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 py-20">
            <div className="bg-slate-900 rounded-[3rem] p-16 text-center relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
               
               <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-white text-4xl font-black uppercase tracking-tight mb-4">Join the Inner Circle</h2>
                <p className="text-slate-400 font-medium mb-8">Get early access to drops, exclusive discounts, and professional styling tips.</p>
                <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <button className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">
                    Subscribe
                  </button>
                </form>
               </div>
            </div>
          </section>
        );

      case 'banner':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 py-10">
            <Link to={section.data?.link || '#'}>
               <div className="w-full h-[300px] md:h-[500px] rounded-[3rem] overflow-hidden relative group shadow-2xl">
                  <img src={section.data?.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={section.label} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-12 left-12">
                     <h3 className="text-white text-4xl font-black uppercase tracking-tight mb-4">{section.label}</h3>
                     <span className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px]">Explore Collection</span>
                  </div>
               </div>
            </Link>
          </section>
        );

      case 'html':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 py-10" dangerouslySetInnerHTML={{ __html: section.data?.html || '' }} />
        );

      default:
        // Legacy fallback
        const LegacyComp = SectionComponents[section.id];
        return LegacyComp ? <LegacyComp key={section.id} /> : null;
    }
  };

  const finalLayout = layout.length > 0 ? layout : [
    { id: 'Hero', type: 'component', visible: true, order: 1 },
    { id: 'TabbedProductShowcase', type: 'component', visible: true, order: 2 },
    { id: 'StorySection', type: 'component', visible: true, order: 3 },
    { id: 'Categories', type: 'component', visible: true, order: 4 },
    { id: 'TrustSection', type: 'component', visible: true, order: 5 }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <SEO 
        title="FEUDA TECH | Premium Phone Cases & Digital Assets" 
        description="Discover the ultimate collection of premium phone cases, accessories, and digital assets. Engineered for style, built for protection."
      />
      {finalLayout.sort((a,b) => a.order - b.order).map(section => renderSection(section))}
    </div>
  );
};

export default HomePage;
