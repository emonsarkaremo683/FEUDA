
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    badge: 'New Arrival',
    title: 'Next-Gen Protection',
    subtitle: 'For Your iPhone 17.',
    desc: 'Engineered for precision. Crafted for style. Discover the ultimate collection.',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1200&auto=format&fit=crop',
    color: 'blue'
  },
  {
    id: 2,
    badge: 'Trending',
    title: 'MagSafe Revolution',
    subtitle: 'Snap & Charge.',
    desc: 'Experience the fastest wireless charging with our premium MagSafe collection.',
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200&auto=format&fit=crop',
    color: 'purple'
  },
  {
    id: 3,
    badge: 'Limited Edition',
    title: 'Ultra Slim Series',
    subtitle: 'Invisible Armor.',
    desc: 'Protection that feels like nothing is there. Zero bulk, maximum safety.',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b2191392?q=80&w=1200&auto=format&fit=crop',
    color: 'emerald'
  }
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] h-[80vh] sm:h-screen w-full bg-[#050A30] overflow-hidden group">
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
               src={slide.image} 
               alt={slide.title} 
               className="w-full h-full object-cover opacity-40 scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-[#050A30] via-[#050A30]/80 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 w-full h-full relative flex items-center">
            <div className={`space-y-6 max-w-xl transition-all duration-1000 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-blue-900 to-purple-900 text-white border border-white/10`}>
                {slide.badge}
              </span>
              <h1 className="text-4xl sm:text-7xl font-extrabold text-white leading-[1.1]">
                {slide.title} <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{slide.subtitle}</span>
              </h1>
              <p className="text-gray-300 text-lg sm:text-xl max-w-md leading-relaxed">
                {slide.desc}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/category/all" className="bg-gradient-to-r from-blue-700 via-purple-600 to-red-500 text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-1 transition-all">
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
