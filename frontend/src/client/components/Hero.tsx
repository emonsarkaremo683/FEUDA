
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadUrl } from '../../config';

interface HeroSlide {
  id: string | number;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  link?: string;
}

interface HeroProps {
  slides?: HeroSlide[];
}

const defaultSlides: HeroSlide[] = [
  {
    id: 1,
    badge: 'New Arrival',
    title: 'Next-Gen Protection',
    subtitle: 'For Your iPhone 17.',
    desc: 'Engineered for precision. Crafted for style. Discover the ultimate collection.',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    badge: 'Trending',
    title: 'MagSafe Revolution',
    subtitle: 'Snap & Charge.',
    desc: 'Experience the fastest wireless charging with our premium MagSafe collection.',
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 3,
    badge: 'Limited Edition',
    title: 'Ultra Slim Series',
    subtitle: 'Invisible Armor.',
    desc: 'Protection that feels like nothing is there. Zero bulk, maximum safety.',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b2191392?q=80&w=1200&auto=format&fit=crop',
  }
];

const Hero: React.FC<HeroProps> = ({ slides = defaultSlides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] h-[80vh] sm:h-screen w-full overflow-hidden group" style={{ background: 'var(--theme-background, #050A30)' }}>
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
             <img 
               src={uploadUrl(slide.image)} 
               alt={slide.title} 
               className="w-full h-full object-cover opacity-40 scale-105"
             />
             <div className="absolute inset-0" style={{ background: 'var(--theme-heroGradient, linear-gradient(to right, #050A30, rgba(5,10,48,0.8), transparent))' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 w-full h-full relative flex items-center">
            <div className={`space-y-6 max-w-xl transition-all duration-1000 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-white border border-white/10`} style={{ background: 'var(--theme-primaryGradient, linear-gradient(to right, #1e3a8a, #581c87))' }}>
                {slide.badge}
              </span>
              <h1 className="text-4xl sm:text-7xl font-extrabold text-white leading-[1.1]">
                {slide.title} <br/> 
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--theme-primaryGradient, linear-gradient(to right, #60a5fa, #a78bfa))' }}>{slide.subtitle}</span>
              </h1>
              <p className="text-gray-300 text-lg sm:text-xl max-w-md leading-relaxed">
                {slide.desc}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/category/all" className="text-white px-8 py-4 rounded-full font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all shadow-purple-500/20" style={{ background: 'var(--theme-primaryGradient, linear-gradient(to right, #1d4ed8, #7c3aed, #dc2626))' }}>
                  Shop Collection
                </Link>
                <Link to="/about" className="bg-white/5 text-white backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
