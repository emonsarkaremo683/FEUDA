
import React, { useRef, useState } from 'react';

interface VideoSectionProps {
  videoUrl: string;
  label?: string;
  showLabel?: boolean;
  title?: string;
  subtitle?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ 
  videoUrl = '', 
  label = 'Watch Reel',
  showLabel = true,
  title,
  subtitle
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  if (!videoUrl) return null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log("Autoplay blocked or failed", err));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      // Optional: reset to start
      // videoRef.current.currentTime = 0;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div 
        className="relative w-full aspect-[16/9] md:h-[600px] rounded-[3rem] overflow-hidden bg-black shadow-2xl group cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-opacity duration-700 opacity-80 group-hover:opacity-100"
        />

        {/* Static Overlay when not playing */}
        {!isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
             <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
             </div>
          </div>
        )}
        
        {/* Top Label */}
        {showLabel && (
          <div className="absolute top-8 left-8">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              {label}
            </span>
          </div>
        )}

        {/* Bottom Content */}
        {(title || subtitle) && (
          <div className="absolute bottom-12 left-12 right-12 transition-all duration-500 transform group-hover:-translate-y-2">
            <div className="max-w-2xl">
              {title && (
                <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4 drop-shadow-2xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-[0.3em] drop-shadow-lg">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hover Progress Bar (Visual Only) */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full overflow-hidden">
           <div className={`h-full bg-white transition-all duration-[10s] linear ${isHovered ? 'w-full' : 'w-0'}`} />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
