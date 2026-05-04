import React, { useState, useRef } from 'react';

export interface StoryItem {
  id: string | number;
  video: string;
  poster?: string;
  title: string;
}

export interface StorySectionProps {
  sectionTitle?: string;
  stories?: StoryItem[];
}

const defaultStories: StoryItem[] = [
  {
    id: 1,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-holding-a-smartphone-34320-large.mp4',
    poster: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=600&auto=format&fit=crop',
    title: 'Christmas magic'
  },
  {
    id: 2,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-smartphone-screen-40761-large.mp4',
    poster: 'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?q=80&w=600&auto=format&fit=crop',
    title: 'Precision Fit'
  },
  {
    id: 3,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-unboxing-a-new-smartphone-40755-large.mp4',
    poster: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop',
    title: 'Lifestyle'
  }
];

const StorySection: React.FC<StorySectionProps> = ({
  sectionTitle = 'We Are Committed To Creating <br /> A Better World',
  stories = defaultStories
}) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleMouseEnter = (index: number) => {
    setPlayingIndex(index);
    if (videoRefs.current[index]) {
      videoRefs.current[index]?.play().catch(() => {});
    }
  };

  const handleMouseLeave = (index: number) => {
    setPlayingIndex(null);
    if (videoRefs.current[index]) {
      videoRefs.current[index]?.pause();
    }
  };

  const effectiveStories = stories && stories.length > 0 ? stories : defaultStories;

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
        <h2 
          className="text-3xl sm:text-4xl font-bold text-slate-900 text-center sm:text-left"
          dangerouslySetInnerHTML={{ __html: sectionTitle }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {effectiveStories.map((story, index) => (
          <div 
            key={story.id} 
            className="relative aspect-[9/16] rounded-3xl overflow-hidden group cursor-pointer bg-slate-100"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            <video
              ref={el => videoRefs.current[index] = el}
              src={story.video}
              poster={story.poster}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              muted
              loop
              playsInline
            />

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>

            {playingIndex !== index && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              </div>
            </div>

            <div className="absolute top-4 left-4">
              <div className="text-white text-xs font-bold font-serif italic drop-shadow-md">
                <span className="text-xl not-italic">{story.title}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        <div className="w-8 h-1.5 bg-slate-800 rounded-full"></div>
        <div className="w-2 h-1.5 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-1.5 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-1.5 bg-gray-300 rounded-full"></div>
        <button className="w-8 h-8 flex items-center justify-center bg-slate-900 rounded-full text-white ml-4 hover:bg-slate-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  );
};

export default StorySection;
